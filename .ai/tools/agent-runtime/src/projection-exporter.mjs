/**
 * @file .ai/tools/agent-runtime/src/projection-exporter.mjs
 * @version 0.2.1 - 2026-05-10 17:05
 * @docref DOC-SYSTEM-SPEC-032
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @description Read-only exporter that derives compatibility worker-session
 * projections from the local agent runtime SQLite store.
 *
 * Changes in version 0.2.1:
 * - Added explicit runtime topology projection for worker groups, peer edges,
 *   notification edges, and group membership identities.
 */
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { openRuntimeDatabase } from "./runtime-schema/index.mjs";
import { safeFilename } from "./runtime-utils.mjs";

const registrySchemaVersion = "1.2.0";
const messageSchemaVersion = "1.0";
const activeStatuses = ["planned", "launched", "running", "result-ready", "needs-review", "blocked"];
const sessionStatuses = [...activeStatuses, "closed"];
const sessionResolutions = ["accepted", "reassigned", "continued", "blocked-with-reason", "closed", "user-approved-deferral"];
const messageEventTypes = ["status-update", "worker-message", "review-comment", "handoff", "blocker", "decision", "tool-summary", "artifact-reference"];
const notificationTypes = ["result_ready", "final_result", "blocked", "needs_review", "request_link", "request_worker", "scope_conflict", "handoff", "heartbeat_missed"];
const messageVisibilities = ["user-visible", "internal-summary", "redacted"];

const requiredTables = [
  "worker_sessions",
  "worker_session_events",
  "worker_presence",
  "worker_messages",
  "worker_message_acks",
  "worker_notifications",
  "worker_jobs",
];

const requiredTableColumns = {
  worker_sessions: [
    "session_id",
    "worker_kind",
    "role",
    "mission",
    "assigned_by",
    "status",
    "resolution",
    "handoff_required",
    "allowed_paths_json",
    "forbidden_paths_json",
    "metadata_json",
    "messages_path",
    "result_path",
    "history_path",
    "started_at",
    "updated_at",
    "closed_at",
  ],
  worker_session_events: [
    "event_id",
    "session_id",
    "source",
    "event_type",
    "visibility",
    "summary",
    "payload_json",
    "related_artifacts_json",
    "created_at",
  ],
  worker_presence: ["session_id", "presence_state", "current_activity", "heartbeat_at", "lease_expires_at", "payload_json", "updated_at"],
  worker_messages: ["message_id", "source_session_id", "target_session_id", "message_type", "correlation_id", "requires_ack", "state", "created_at", "expires_at", "summary", "payload_json"],
  worker_message_acks: ["ack_id", "message_id", "session_id", "ack_type", "state", "summary", "payload_json", "created_at"],
  worker_notifications: ["notification_id", "source_session_id", "target_role", "notification_type", "priority", "status", "created_at", "acknowledged_at", "resolved_at", "summary", "payload_json", "correlation_id"],
  worker_jobs: [
    "job_id",
    "session_id",
    "owner_session_id",
    "assignee_session_id",
    "current_actor_session_id",
    "queue_name",
    "status",
    "lease_status",
    "execution_backend",
    "execution_handle",
    "allowed_actions_json",
    "handoff_target",
    "correlation_id",
    "depends_on_job_id",
    "created_at",
    "updated_at",
    "started_at",
    "finished_at",
    "summary",
    "payload_json",
    "result_json",
  ],
};

export class WorkerSessionProjectionExporter {
  constructor(databasePath) {
    this.database = openRuntimeDatabase(databasePath, { readOnly: true, initialize: false });
  }

  export(outputRoot) {
    this.assertRequiredTablesExist();
    mkdirSync(path.join(outputRoot, "messages"), { recursive: true });

    const sessionRows = this.selectAll("worker_sessions", `status IN (${quoteList(activeStatuses)})`, "updated_at ASC, started_at ASC, session_id ASC");
    const presenceRowsBySession = groupBySessionId(this.selectAll("worker_presence", null, "updated_at ASC, session_id ASC"));
    const eventRowsBySession = groupBySessionId(this.selectAll("worker_session_events", null, "created_at ASC, event_id ASC"));
    const messageRows = this.selectAll("worker_messages", null, "created_at ASC, message_id ASC");
    const notificationRows = this.selectAll("worker_notifications", null, "created_at ASC, notification_id ASC");
    const jobRows = this.selectAll("worker_jobs", null, "updated_at DESC, created_at DESC, job_id ASC");
    const messageRowsBySession = groupPeerMessagesBySessionId(messageRows);
    const notificationRowsBySession = groupBySessionId(notificationRows);
    const jobRowsBySession = groupJobsBySessionId(jobRows);
    const now = new Date().toISOString();
    const activeSessions = [];

    for (const row of sessionRows) {
      const sessionId = stringValue(row, "session_id");
      if (sessionId === "") {
        throw new Error("worker_sessions contains an active row without session_id.");
      }

      const events = this.buildTraceEvents(
        sessionId,
        eventRowsBySession.get(sessionId) ?? [],
        messageRowsBySession.get(sessionId) ?? [],
        notificationRowsBySession.get(sessionId) ?? [],
      );
      writeJsonl(path.join(outputRoot, "messages", `${safeFilename(sessionId)}.jsonl`), events);
      activeSessions.push(buildRegistrySession(row, (presenceRowsBySession.get(sessionId) ?? [])[0] ?? {}, now, (jobRowsBySession.get(sessionId) ?? [])[0] ?? {}));
    }

    writeJson(path.join(outputRoot, "current-sessions.json"), {
      schema_version: registrySchemaVersion,
      updated_at: now,
      updated_by: "agent-runtime-projection-exporter",
      active_sessions: activeSessions,
      autonomous_grants: [],
      runtime_topology: buildRuntimeTopology({
        sessions: activeSessions,
        messageRows,
        notificationRows,
        jobRows,
      }),
    });
  }

  assertRequiredTablesExist() {
    const tableRows = this.database.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'table'").all();
    const available = new Set(tableRows.map((row) => row.name));
    const tableSql = new Map(tableRows.map((row) => [row.name, row.sql ?? ""]));
    const missingTables = requiredTables.filter((table) => !available.has(table));
    if (missingTables.length > 0) {
      throw new Error(`Runtime database schema is incomplete. Missing tables: ${missingTables.join(", ")}`);
    }

    for (const [table, columns] of Object.entries(requiredTableColumns)) {
      const availableColumns = new Set(this.tableColumns(table));
      const missingColumns = columns.filter((column) => !availableColumns.has(column));
      if (missingColumns.length > 0) {
        throw new Error(`Runtime database schema is incomplete. Table ${table} is missing columns: ${missingColumns.join(", ")}`);
      }
    }

    const workerSessionEventsSql = tableSql.get("worker_session_events") ?? "";
    for (const fragment of ["DEFAULT 'internal-summary'", "visibility IN ('user-visible', 'internal-summary', 'redacted')"]) {
      if (!workerSessionEventsSql.includes(fragment)) {
        throw new Error(`Runtime database schema drift detected. Table worker_session_events does not contain: ${fragment}`);
      }
    }

    const workerNotificationsSql = tableSql.get("worker_notifications") ?? "";
    if (!workerNotificationsSql.includes("'final_result'")) {
      throw new Error("Runtime database schema drift detected. Table worker_notifications does not allow: final_result");
    }
  }

  tableColumns(table) {
    return this.database.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name);
  }

  selectAll(table, where, orderBy) {
    const columns = this.tableColumns(table);
    let sql = `SELECT * FROM ${table}`;
    if (where) {
      sql += ` WHERE ${where}`;
    }
    const orderClauses = orderBy
      .split(",")
      .map((part) => part.trim())
      .filter((part) => columns.includes(part.split(/\s+/)[0]));
    if (orderClauses.length > 0) {
      sql += ` ORDER BY ${orderClauses.join(", ")}`;
    }
    return this.database.prepare(sql).all();
  }

  buildTraceEvents(sessionId, lifecycleRows, messageRows, notificationRows) {
    const events = [
      ...lifecycleRows.map((row) => buildLifecycleTraceEvent(sessionId, row)),
      ...messageRows.map((row) => buildPeerMessageTraceEvent(sessionId, row)),
      ...notificationRows.map((row) => buildNotificationTraceEvent(sessionId, row)),
    ];
    events.sort((left, right) => String(left.created_at).localeCompare(String(right.created_at)));
    return events;
  }
}

function buildRegistrySession(row, presenceRow, fallbackUpdatedAt, jobRow = {}) {
  const sessionId = stringValue(row, "session_id");
  const metadata = jsonObjectValue(row, "metadata", "metadata_json");
  const jobPayload = jsonObjectValue(jobRow, "job_payload", "payload_json");
  const groupMetadata = projectionGroupMetadata(row, metadata, jobPayload);
  const groupEdgeIdentity = projectionGroupEdgeIdentity(sessionId, row, metadata, jobPayload, groupMetadata);
  return {
    session_id: sessionId,
    worker_kind: nullableStringValue(row, "worker_kind") ?? "external_codex",
    role: stringValue(row, "role") || "worker",
    mission: stringValue(row, "mission") || "No mission provided.",
    cwd: nullableStringValue(row, "cwd"),
    worktree: nullableStringValue(row, "worktree"),
    allowed_paths: jsonArrayValue(row, "allowed_paths", "allowed_paths_json"),
    forbidden_paths: jsonArrayValue(row, "forbidden_paths", "forbidden_paths_json"),
    tools_allowed: jsonArrayValue(row, "tools_allowed", "tools_allowed_json"),
    network_allowed: booleanValue(row, "network_allowed"),
    write_allowed: booleanValue(row, "write_allowed"),
    expected_output: nullableStringValue(row, "expected_output"),
    stop_condition: nullableStringValue(row, "stop_condition"),
    started_at: nullableStringValue(row, "started_at"),
    updated_at: nullableStringValue(row, "updated_at") ?? fallbackUpdatedAt,
    status: allowedValue(stringValue(row, "status"), sessionStatuses, "planned"),
    resolution: nullableAllowedValue(row, "resolution", sessionResolutions),
    resolution_reason: nullableStringValue(row, "resolution_reason"),
    result_path: nullableStringValue(row, "result_path"),
    messages_path: `.ai/tools/agent-runtime/runtime/worker-sessions/messages/${safeFilename(sessionId)}.jsonl`,
    diff_review: jsonObjectOrNullValue(row, "diff_review", "diff_review_json"),
    continuation_contract: jsonObjectOrNullValue(row, "continuation_contract", "continuation_contract_json"),
    reassignment_contract: jsonObjectOrNullValue(row, "reassignment_contract", "reassignment_contract_json"),
    deferral_contract: jsonObjectOrNullValue(row, "deferral_contract", "deferral_contract_json"),
    blocker_contract: jsonObjectOrNullValue(row, "blocker_contract", "blocker_contract_json"),
    history_path: nullableStringValue(row, "history_path"),
    assigned_by: nullableStringValue(row, "assigned_by"),
    handoff_required: booleanValue(row, "handoff_required"),
    metadata,
    group_id: groupMetadata?.group_id ?? null,
    worker_group: groupMetadata,
    group_metadata: groupMetadata,
    group_edge_identity: groupEdgeIdentity,
    group_closer_worker_id: pickFirstString([
      groupMetadata?.group_closer_worker_id,
      metadata.group_closer_worker_id,
      jobPayload.group_closer_worker_id,
    ]),
    returns_to: pickFirstString([
      groupMetadata?.returns_to,
      metadata.returns_to,
      jobPayload.returns_to,
    ]),
    owner_dialog_assistant_session_id: pickFirstString([
      groupMetadata?.owner_dialog_assistant_session_id,
      metadata.owner_dialog_assistant_session_id,
      jobPayload.owner_dialog_assistant_session_id,
    ]),
    assignee_session_id: nullableStringValue(jobRow, "assignee_session_id"),
    current_actor_session_id: nullableStringValue(jobRow, "current_actor_session_id"),
    execution_backend: nullableStringValue(jobRow, "execution_backend") ?? nullableStringValue(metadata, "execution_backend"),
    execution_handle: nullableStringValue(jobRow, "execution_handle") ?? nullableStringValue(metadata, "execution_handle"),
    lease_status: nullableStringValue(jobRow, "lease_status") ?? nullableStringValue(metadata, "lease_status"),
    allowed_actions: jsonArrayValue(jobRow, "allowed_actions", "allowed_actions_json"),
    handoff_target: nullableStringValue(jobRow, "handoff_target"),
    job_status: nullableStringValue(jobRow, "status"),
    job_payload: jobPayload,
    bridge_state: nullableStringValue(metadata, "bridge_state"),
    job_id: nullableStringValue(jobRow, "job_id") ?? nullableStringValue(metadata, "job_id"),
    presence_state: nullableStringValue(presenceRow, "presence_state"),
    current_activity: nullableStringValue(presenceRow, "current_activity"),
    heartbeat_at: nullableStringValue(presenceRow, "heartbeat_at"),
    lease_expires_at: nullableStringValue(presenceRow, "lease_expires_at"),
  };
}

function buildLifecycleTraceEvent(sessionId, row) {
  return traceEvent({
    session_id: sessionId,
    event_id: stringValue(row, "event_id") || derivedEventId("session-event", sessionId, row),
    created_at: timestampValue(row, "created_at"),
    source: stringValue(row, "source") || "dialog_assistant",
    event_type: allowedValue(stringValue(row, "event_type"), messageEventTypes, "status-update"),
    visibility: visibilityValue(row),
    summary: stringValue(row, "summary") || "Worker session lifecycle event projected from runtime store.",
    payload: {
      ...jsonObjectValue(row, "payload", "payload_json"),
      status: nullableStringValue(row, "status"),
      previous_status: nullableStringValue(row, "previous_status"),
      resolution: nullableStringValue(row, "resolution"),
    },
    related_artifacts: relatedArtifactsValue(row),
  });
}

function buildPeerMessageTraceEvent(sessionId, row) {
  const sourceSessionId = nullableStringValue(row, "source_session_id");
  const targetSessionId = nullableStringValue(row, "target_session_id");
  const payload = jsonObjectValue(row, "payload", "payload_json");
  const edgeIdentity = peerEdgeIdentity(row, payload);
  return traceEvent({
    session_id: sessionId,
    event_id: stringValue(row, "message_id") || derivedEventId("worker-message", sessionId, row),
    created_at: timestampValue(row, "created_at"),
    source: sourceSessionId ?? "worker",
    event_type: "worker-message",
    visibility: "user-visible",
    summary: stringValue(row, "summary") || "Worker peer message projected from runtime store.",
    payload: {
      ...payload,
      source_session_id: sourceSessionId,
      target_session_id: targetSessionId,
      message_kind: nullableStringValue(row, "message_type"),
      correlation_id: nullableStringValue(row, "correlation_id"),
      requires_ack: booleanValue(row, "requires_ack"),
      message_state: nullableStringValue(row, "state"),
      flow_visible_until: nullableStringValue(row, "expires_at"),
      edge_identity: edgeIdentity,
      peer_edge: edgeIdentity,
      group_id: topologyGroupId(payload),
    },
    related_artifacts: [],
  });
}

function buildNotificationTraceEvent(sessionId, row) {
  const notificationType = nullableAllowedValue(row, "notification_type", notificationTypes);
  const payload = jsonObjectValue(row, "payload", "payload_json");
  const edgeIdentity = notificationEdgeIdentity(row, payload);
  const eventType = {
    blocked: "blocker",
    scope_conflict: "blocker",
    heartbeat_missed: "blocker",
    handoff: "handoff",
    result_ready: "status-update",
    final_result: "decision",
    needs_review: "status-update",
  }[notificationType] ?? "worker-message";

  return traceEvent({
    session_id: sessionId,
    event_id: stringValue(row, "notification_id") || derivedEventId("notification", sessionId, row),
    created_at: timestampValue(row, "created_at"),
    source: nullableStringValue(row, "source_session_id") ?? "worker",
    event_type: eventType,
    visibility: "user-visible",
    summary: stringValue(row, "summary") || "Worker notification projected from runtime store.",
    payload: {
      ...payload,
      source_session_id: nullableStringValue(row, "source_session_id"),
      target_session_id: nullableStringValue(row, "target_session_id") ?? nullableStringValue(payload, "target_session_id"),
      target_role: nullableStringValue(row, "target_role"),
      notification_type: notificationType,
      priority: nullableStringValue(row, "priority"),
      message_state: nullableStringValue(row, "status"),
      correlation_id: nullableStringValue(row, "correlation_id"),
      edge_identity: edgeIdentity,
      notification_edge: edgeIdentity,
      group_id: topologyGroupId(payload),
    },
    related_artifacts: [],
  });
}

function buildRuntimeTopology({
  sessions,
  messageRows,
  notificationRows,
  jobRows,
}) {
  const groupsById = new Map();
  const groupEdges = [];
  const assignmentEdges = [];
  const peerEdges = new Map();
  const notificationEdges = new Map();

  for (const session of sessions) {
    const group = session.group_metadata;
    if (group?.group_id) {
      groupsById.set(group.group_id, removeNullValues({
        ...groupsById.get(group.group_id),
        ...group,
        closer_session_id: group.group_closer_worker_id ?? session.group_closer_worker_id ?? groupsById.get(group.group_id)?.closer_session_id,
        returns_to: group.returns_to ?? session.returns_to ?? groupsById.get(group.group_id)?.returns_to,
      }));
    }
    if (session.group_edge_identity) {
      groupEdges.push(session.group_edge_identity);
    }
    if (session.assigned_by) {
      assignmentEdges.push(removeNullValues({
        edge_id: stableEdgeId("assignment", session.assigned_by, session.session_id),
        edge_type: "assignment",
        source_session_id: session.assigned_by,
        target_session_id: session.session_id,
        group_id: session.group_id,
      }));
    }
  }

  for (const row of messageRows) {
    const payload = jsonObjectValue(row, "payload", "payload_json");
    const edge = peerEdgeIdentity(row, payload);
    if (!peerEdges.has(edge.edge_id)) {
      peerEdges.set(edge.edge_id, edge);
      continue;
    }
    const existing = peerEdges.get(edge.edge_id);
    peerEdges.set(edge.edge_id, removeNullValues({
      ...existing,
      latest_message_id: edge.latest_message_id,
      latest_state: edge.latest_state,
      flow_active: existing.flow_active || edge.flow_active,
      flow_visible_until: edge.flow_visible_until ?? existing.flow_visible_until,
    }));
  }

  for (const row of notificationRows) {
    const payload = jsonObjectValue(row, "payload", "payload_json");
    const edge = notificationEdgeIdentity(row, payload);
    if (!notificationEdges.has(edge.edge_id)) {
      notificationEdges.set(edge.edge_id, edge);
      continue;
    }
    const existing = notificationEdges.get(edge.edge_id);
    notificationEdges.set(edge.edge_id, removeNullValues({
      ...existing,
      latest_notification_id: edge.latest_notification_id,
      latest_status: edge.latest_status,
      flow_active: existing.flow_active || edge.flow_active,
      priority: highestPriority(existing.priority, edge.priority),
    }));
  }

  return {
    schema_version: "1.0.0",
    groups: [...groupsById.values()],
    group_edges: groupEdges,
    assignment_edges: assignmentEdges,
    peer_edges: [...peerEdges.values()],
    notification_edges: [...notificationEdges.values()],
    job_edges: buildJobEdges(jobRows),
  };
}

function projectionGroupMetadata(row, metadata, jobPayload) {
  const candidate = firstRecord([
    metadata.group_metadata,
    metadata.worker_group,
    jobPayload.group_metadata,
    jobPayload.worker_group,
  ]);
  const group = removeNullValues({
    group_id: pickFirstString([
      candidate.group_id,
      metadata.group_id,
      jobPayload.group_id,
    ]),
    group_name: pickFirstString([
      candidate.group_name,
      metadata.group_name,
      jobPayload.group_name,
    ]),
    group_role: pickFirstString([
      candidate.group_role,
      metadata.group_role,
      jobPayload.group_role,
    ]),
    launch_stage: pickFirstString([
      candidate.launch_stage,
      metadata.launch_stage,
      jobPayload.launch_stage,
    ]),
    group_closer_worker_id: pickFirstString([
      candidate.group_closer_worker_id,
      metadata.group_closer_worker_id,
      jobPayload.group_closer_worker_id,
    ]),
    returns_to: pickFirstString([
      candidate.returns_to,
      metadata.returns_to,
      jobPayload.returns_to,
    ]),
    owner_dialog_assistant_session_id: pickFirstString([
      candidate.owner_dialog_assistant_session_id,
      metadata.owner_dialog_assistant_session_id,
      jobPayload.owner_dialog_assistant_session_id,
      nullableStringValue(row, "assigned_by") === "dialog-assistant" ? "dialog-assistant" : null,
    ]),
  });

  return group.group_id ? group : null;
}

function projectionGroupEdgeIdentity(sessionId, row, metadata, jobPayload, groupMetadata) {
  if (!groupMetadata?.group_id) {
    return null;
  }

  return removeNullValues({
    edge_id: stableEdgeId("group-member", groupMetadata.group_id, sessionId),
    edge_type: "group-membership",
    group_id: groupMetadata.group_id,
    session_id: sessionId,
    target_session_id: sessionId,
    assigned_by: nullableStringValue(row, "assigned_by"),
    group_role: groupMetadata.group_role,
    launch_stage: groupMetadata.launch_stage,
    group_closer_worker_id: groupMetadata.group_closer_worker_id,
    returns_to: groupMetadata.returns_to,
    job_id: pickFirstString([jobPayload.job_id, metadata.job_id]),
  });
}

function peerEdgeIdentity(row, payload) {
  const sourceSessionId = nullableStringValue(row, "source_session_id");
  const targetSessionId = nullableStringValue(row, "target_session_id");
  const payloadEdge = firstRecord([payload.peer_edge, payload.edge_identity]);
  const messageType = nullableStringValue(row, "message_type") ?? "peer";
  const correlationId = nullableStringValue(row, "correlation_id");
  const edgeId = pickFirstString([
    payloadEdge.edge_id,
    payload.peer_edge_id,
    correlationId ? stableEdgeId("peer-correlation", correlationId) : null,
    stableEdgeId("peer", sourceSessionId, targetSessionId, messageType),
  ]);

  return removeNullValues({
    edge_id: edgeId,
    edge_type: "peer-message",
    edge_kind: payloadEdge.edge_kind ?? messageType,
    source_session_id: payloadEdge.source_session_id ?? sourceSessionId,
    target_session_id: payloadEdge.target_session_id ?? targetSessionId,
    group_id: topologyGroupId(payload),
    correlation_id: correlationId,
    latest_message_id: nullableStringValue(row, "message_id"),
    latest_state: nullableStringValue(row, "state"),
    flow_active: ["queued", "delivered"].includes(nullableStringValue(row, "state")),
    flow_visible_until: nullableStringValue(row, "expires_at"),
  });
}

function notificationEdgeIdentity(row, payload) {
  const sourceSessionId = nullableStringValue(row, "source_session_id");
  const targetSessionId = nullableStringValue(row, "target_session_id") ?? nullableStringValue(payload, "target_session_id");
  const targetRole = nullableStringValue(row, "target_role");
  const payloadEdge = firstRecord([payload.notification_edge, payload.edge_identity]);
  const notificationType = nullableStringValue(row, "notification_type");
  const correlationId = nullableStringValue(row, "correlation_id");
  const edgeId = pickFirstString([
    payloadEdge.edge_id,
    payload.notification_edge_id,
    correlationId ? stableEdgeId("notification-correlation", correlationId) : null,
    stableEdgeId("notification", sourceSessionId, targetSessionId ?? targetRole, notificationType),
  ]);

  return removeNullValues({
    edge_id: edgeId,
    edge_type: "notification",
    edge_kind: notificationType,
    source_session_id: payloadEdge.source_session_id ?? sourceSessionId,
    target_session_id: payloadEdge.target_session_id ?? targetSessionId,
    target_role: payloadEdge.target_role ?? targetRole,
    group_id: topologyGroupId(payload),
    correlation_id: correlationId,
    latest_notification_id: nullableStringValue(row, "notification_id"),
    latest_status: nullableStringValue(row, "status"),
    priority: nullableStringValue(row, "priority"),
    flow_active: ["unread", "acknowledged"].includes(nullableStringValue(row, "status")),
  });
}

function buildJobEdges(jobRows) {
  return jobRows.map((row) => removeNullValues({
    edge_id: stableEdgeId("job", nullableStringValue(row, "owner_session_id"), nullableStringValue(row, "assignee_session_id"), nullableStringValue(row, "job_id")),
    edge_type: "job-assignment",
    job_id: nullableStringValue(row, "job_id"),
    source_session_id: nullableStringValue(row, "owner_session_id"),
    target_session_id: nullableStringValue(row, "assignee_session_id") ?? nullableStringValue(row, "session_id"),
    current_actor_session_id: nullableStringValue(row, "current_actor_session_id"),
    status: nullableStringValue(row, "status"),
    lease_status: nullableStringValue(row, "lease_status"),
  })).filter((edge) => edge.source_session_id || edge.target_session_id);
}

function traceEvent(event) {
  return {
    schema_version: messageSchemaVersion,
    session_id: String(event.session_id),
    event_id: String(event.event_id),
    created_at: String(event.created_at),
    source: String(event.source),
    event_type: String(event.event_type),
    visibility: String(event.visibility),
    summary: String(event.summary),
    payload: removeNullValues(event.payload ?? {}),
    related_artifacts: Array.isArray(event.related_artifacts) ? event.related_artifacts : [],
  };
}

function groupBySessionId(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const sessionId = stringValue(row, "session_id") || stringValue(row, "source_session_id") || stringValue(row, "target_session_id");
    if (sessionId === "") {
      continue;
    }
    if (!grouped.has(sessionId)) {
      grouped.set(sessionId, []);
    }
    grouped.get(sessionId).push(row);
  }
  return grouped;
}

function groupPeerMessagesBySessionId(rows) {
  const grouped = new Map();
  for (const row of rows) {
    for (const sessionId of [...new Set([nullableStringValue(row, "source_session_id"), nullableStringValue(row, "target_session_id")].filter(Boolean))]) {
      if (!grouped.has(sessionId)) {
        grouped.set(sessionId, []);
      }
      grouped.get(sessionId).push(row);
    }
  }
  return grouped;
}

function groupJobsBySessionId(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const sessionId = nullableStringValue(row, "session_id") ?? nullableStringValue(row, "assignee_session_id");
    if (!sessionId) {
      continue;
    }
    if (!grouped.has(sessionId)) {
      grouped.set(sessionId, []);
    }
    grouped.get(sessionId).push(row);
  }
  return grouped;
}

function quoteList(values) {
  return values.map((value) => `'${value.replaceAll("'", "''")}'`).join(",");
}

function derivedEventId(prefix, sessionId, row) {
  return `${prefix}-${createHash("sha256").update(`${sessionId}${JSON.stringify(row)}`).digest("hex").slice(0, 16)}`;
}

function timestampValue(row, column) {
  return nullableStringValue(row, column) ?? new Date().toISOString();
}

function visibilityValue(row) {
  const visibility = stringValue(row, "visibility") || "internal-summary";
  if (!messageVisibilities.includes(visibility)) {
    throw new Error(`Invalid worker_session_events visibility: ${visibility}`);
  }
  return visibility;
}

function relatedArtifactsValue(row) {
  return jsonArrayValue(row, "related_artifacts", "related_artifacts_json").filter((item) => item && typeof item === "object" && !Array.isArray(item));
}

function stringValue(row, column) {
  const value = row?.[column];
  return value === null || value === undefined ? "" : String(value);
}

function nullableStringValue(row, column) {
  const value = row?.[column];
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return typeof value === "object" ? null : String(value);
}

function booleanValue(row, column) {
  const value = row?.[column];
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value === 1;
  }
  switch (String(value).toLowerCase()) {
    case "1":
    case "true":
    case "yes":
      return true;
    case "0":
    case "false":
    case "no":
      return false;
    default:
      return null;
  }
}

function jsonArrayValue(row, column, jsonColumn) {
  const value = jsonValue(row, jsonColumn);
  if (Array.isArray(value)) {
    return value;
  }
  const directValue = jsonValue(row, column);
  return Array.isArray(directValue) ? directValue : [];
}

function jsonObjectValue(row, column, jsonColumn) {
  return jsonObjectOrNullValue(row, column, jsonColumn) ?? {};
}

function jsonObjectOrNullValue(row, column, jsonColumn) {
  const value = jsonValue(row, jsonColumn);
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  const directValue = jsonValue(row, column);
  if (directValue && typeof directValue === "object" && !Array.isArray(directValue)) {
    return directValue;
  }
  return null;
}

function jsonValue(row, column) {
  const value = row?.[column];
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "object") {
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function allowedValue(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function nullableAllowedValue(row, column, allowed) {
  const value = nullableStringValue(row, column);
  return value !== null && allowed.includes(value) ? value : null;
}

function pickFirstString(values) {
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }
    const normalized = String(value).trim();
    if (normalized !== "") {
      return normalized;
    }
  }
  return null;
}

function firstRecord(values) {
  for (const value of values) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
  }
  return {};
}

function topologyGroupId(payload) {
  return pickFirstString([
    payload?.group_id,
    payload?.group_metadata?.group_id,
    payload?.worker_group?.group_id,
    payload?.peer_edge?.group_id,
    payload?.notification_edge?.group_id,
  ]);
}

function stableEdgeId(type, ...parts) {
  const material = parts
    .map((part) => (part === null || part === undefined || part === "" ? "_" : String(part)))
    .join(":");
  return `${type}:${createHash("sha256").update(material).digest("hex").slice(0, 20)}`;
}

function highestPriority(left, right) {
  const order = new Map([
    ["info", 0],
    ["normal", 1],
    ["high", 2],
    ["urgent", 3],
  ]);
  return (order.get(right) ?? -1) > (order.get(left) ?? -1) ? right : left;
}

function removeNullValues(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== null && value !== undefined));
}

function writeJson(filePath, payload) {
  writeFileAtomic(filePath, `${JSON.stringify(payload, null, 4)}\n`);
}

function writeJsonl(filePath, events) {
  writeFileAtomic(filePath, events.length === 0 ? "" : `${events.map((event) => JSON.stringify(event)).join("\n")}\n`);
}

function writeFileAtomic(filePath, contents) {
  const temporaryPath = `${filePath}.tmp.${process.pid}`;
  writeFileSync(temporaryPath, contents, "utf8");
  renameSync(temporaryPath, filePath);
}
