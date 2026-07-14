/**
 * @file .ai/tools/agent-runtime/src/runtime-gateway/snapshot-reader.mjs
 * @version 0.2.4 - 2026-05-24 09:30
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Собирает snapshot только для чтения, health, metrics и delta
 * payload из нормализованных SQLite-таблиц agent runtime.
 *
 * Изменения в версии 0.2.3:
 * - Исправлена сериализация snapshot metrics для monitor heartbeat payload.
 *
 * Изменения в версии 0.2.4:
 * - Подключены нормализованные agent worker group tables к gateway topology
 *   snapshot для worker-launch-preflight внешних worker-процессов.
 */
import { createHash } from "node:crypto";
import { gatewaySchemaVersion, timestamp } from "./protocol.mjs";

const MONITOR_HEARTBEAT_STALE_AFTER_SECONDS = 120;
const DEFAULT_MONITOR_HEARTBEAT_SOURCE = "agent-monitor";
const DEFAULT_EXPECTED_GATEWAY_URL = "http://127.0.0.1:8765/";
const DEFAULT_EXPECTED_MONITOR_URL = "http://127.0.0.1:5173/";

export function createHealthPayload(database, clients = new Map()) {
  const monitorHeartbeat = createMonitorHeartbeatSnapshot(database);
  return {
    type: "health",
    schema_version: gatewaySchemaVersion,
    sent_at: timestamp(),
    status: "ok",
    revision: currentRevision(database),
    websocket_clients: clients.size,
    monitor_heartbeat: monitorHeartbeat,
  };
}

export function createSnapshotPayload(database, connectionId = null) {
  const revision = currentRevision(database);
  const sessions = selectRows(database, "agent_sessions", "updated_at ASC, session_id ASC");
  const presence = selectRows(database, "agent_presence", "updated_at ASC, session_id ASC");
  const jobs = selectRows(database, "agent_jobs", "updated_at ASC, job_id ASC");
  const messages = selectRows(database, "agent_messages", "created_at DESC, message_id DESC", 200).reverse();
  const notifications = selectRows(database, "agent_notifications", "created_at ASC, notification_id ASC");
  const operatorCommands = selectRows(database, "agent_operator_commands", "updated_at ASC, operator_command_id ASC", 200);
  const artifacts = selectRows(database, "agent_artifacts", "created_at ASC, artifact_id ASC");
  const monitorHeartbeat = createMonitorHeartbeatSnapshot(database);
  return {
    type: "snapshot",
    schema_version: gatewaySchemaVersion,
    sent_at: timestamp(),
    connection_id: connectionId,
    revision,
    sessions,
    presence,
    jobs,
    messages_tail: messages,
    notifications,
    operator_commands: operatorCommands,
    artifacts,
    monitor_heartbeat: monitorHeartbeat,
    topology: createGatewayTopology({
      sessions,
      jobs,
      messages,
      notifications,
      groups: [
        ...optionalSelectRows(database, "agent_worker_groups", "updated_at ASC, group_id ASC")
          .map(normalizeWorkerGroupSnapshotRow),
        ...optionalSelectRows(database, "agent_groups", "updated_at ASC, group_id ASC"),
      ],
      groupMembers: [
        ...optionalSelectRows(database, "agent_worker_group_members", "updated_at ASC, group_id ASC, session_id ASC"),
        ...optionalSelectRows(database, "agent_group_members", "updated_at ASC, group_id ASC, session_id ASC"),
      ],
      workerGroupEdges: optionalSelectRows(database, "agent_worker_group_edges", "updated_at ASC, group_id ASC, edge_id ASC")
        .map(normalizeWorkerGroupEdgeSnapshotRow),
      peerEdges: optionalSelectRows(database, "agent_peer_edges", "updated_at ASC, edge_id ASC"),
    }),
    metrics: createSnapshotMetrics(database),
  };
}

export function createDeltaPayload({
  database,
  fromRevision,
  toRevision,
  connectionId = null,
}) {
  return {
    type: "delta",
    schema_version: gatewaySchemaVersion,
    sent_at: timestamp(),
    connection_id: connectionId,
    from_revision: fromRevision,
    to_revision: toRevision,
    events: runtimeEventsBetween(database, fromRevision, toRevision),
  };
}

export function currentRevision(database) {
  return scalarCount(database, "SELECT COALESCE(MAX(revision), 0) FROM runtime_events");
}

function runtimeEventsBetween(database, fromRevision, toRevision) {
  return database.prepare(`
    SELECT
      revision, event_id, event_type, aggregate_type, aggregate_id,
      session_id, actor_session_id, visibility, summary, payload_json,
      idempotency_key, created_at
    FROM runtime_events
    WHERE revision > ? AND revision <= ?
    ORDER BY revision ASC
  `).all(fromRevision, toRevision).map((row) => ({
    ...row,
    payload: parseJsonObject(row.payload_json),
  }));
}

function selectRows(database, table, orderBy, limit = null) {
  return selectRowsFromExistingTable(database, table, orderBy, limit);
}

function optionalSelectRows(database, table, orderBy, limit = null) {
  if (!tableExists(database, table)) {
    return [];
  }
  return selectRowsFromExistingTable(database, table, orderBy, limit);
}

function selectRowsFromExistingTable(database, table, orderBy, limit = null) {
  const limitClause = limit === null ? "" : ` LIMIT ${Number(limit)}`;
  const columns = tableColumns(database, table);
  const orderClauses = orderBy
    .split(",")
    .map((part) => part.trim())
    .filter((part) => columns.includes(part.split(/\s+/)[0]));
  const orderClause = orderClauses.length > 0 ? ` ORDER BY ${orderClauses.join(", ")}` : "";
  return database.prepare(`SELECT * FROM ${table}${orderClause}${limitClause}`)
    .all()
    .map(parseJsonColumns);
}

function tableExists(database, table) {
  return Boolean(database.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(table));
}

function tableColumns(database, table) {
  return database.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name);
}

function createGatewayTopology({
  sessions,
  jobs,
  messages,
  notifications,
  groups,
  groupMembers,
  workerGroupEdges,
  peerEdges,
}) {
  const groupsById = new Map();
  const groupEdges = [];
  const peerEdgesById = new Map();
  const notificationEdges = new Map();

  for (const group of groups) {
    const groupId = optionalString(group.group_id);
    if (groupId) {
      groupsById.set(groupId, removeNullValues({
        ...group,
        group_id: groupId,
      }));
    }
  }

  for (const session of sessions) {
    const group = groupMetadataFromSession(session);
    if (group?.group_id) {
      groupsById.set(group.group_id, removeNullValues({
        ...groupsById.get(group.group_id),
        ...group,
      }));
    }
    const groupEdge = groupEdgeFromSession(session, group);
    if (groupEdge) {
      groupEdges.push(groupEdge);
    }
  }

  for (const member of groupMembers) {
    const groupId = optionalString(member.group_id);
    const sessionId = optionalString(member.session_id);
    if (groupId && sessionId) {
      groupEdges.push(removeNullValues({
        ...member,
        edge_id: optionalString(member.edge_id) ?? stableEdgeId("group-member", groupId, sessionId),
        edge_type: "group-membership",
        group_id: groupId,
        session_id: sessionId,
        target_session_id: sessionId,
      }));
    }
  }

  for (const edge of workerGroupEdges) {
    const groupId = optionalString(edge.group_id);
    const sourceSessionId = optionalString(edge.source_session_id);
    const targetSessionId = optionalString(edge.target_session_id);
    if (groupId && sourceSessionId && targetSessionId) {
      groupEdges.push(removeNullValues({
        ...edge,
        edge_id: optionalString(edge.edge_id) ?? stableEdgeId("group-edge", groupId, sourceSessionId, targetSessionId),
        edge_type: optionalString(edge.edge_type) ?? "group-edge",
        group_id: groupId,
        source_session_id: sourceSessionId,
        target_session_id: targetSessionId,
      }));
    }
  }

  for (const edge of peerEdges) {
    const edgeId = optionalString(edge.edge_id);
    if (edgeId) {
      peerEdgesById.set(edgeId, removeNullValues(edge));
    }
  }

  for (const message of messages) {
    const edge = peerEdgeFromMessage(message);
    peerEdgesById.set(edge.edge_id, mergeFlowEdge(peerEdgesById.get(edge.edge_id), edge));
  }

  for (const notification of notifications) {
    const edge = notificationEdgeFromNotification(notification);
    notificationEdges.set(edge.edge_id, mergeFlowEdge(notificationEdges.get(edge.edge_id), edge));
  }

  return {
    schema_version: "1.0.0",
    groups: [...groupsById.values()],
    group_edges: groupEdges,
    assignment_edges: assignmentEdgesFromSessions(sessions),
    peer_edges: [...peerEdgesById.values()],
    notification_edges: [...notificationEdges.values()],
    job_edges: jobs.map(jobEdge).filter(Boolean),
  };
}

function normalizeWorkerGroupSnapshotRow(group) {
  return removeNullValues({
    ...group,
    status: optionalString(group.status) ?? optionalString(group.lifecycle_status),
  });
}

function normalizeWorkerGroupEdgeSnapshotRow(edge) {
  return removeNullValues({
    ...edge,
    edge_type: optionalString(edge.edge_type) ?? "group-edge",
  });
}

function createSnapshotMetrics(database) {
  const monitorHeartbeat = createMonitorHeartbeatSnapshot(database);
  return {
    sessions: scalarCount(database, "SELECT COUNT(*) FROM agent_sessions"),
    working_presence: scalarCount(database, "SELECT COUNT(*) FROM agent_presence WHERE state = 'working'"),
    running_jobs: scalarCount(database, "SELECT COUNT(*) FROM agent_jobs WHERE status = 'running'"),
    unread_notifications: scalarCount(database, "SELECT COUNT(*) FROM agent_notifications WHERE status = 'unread'"),
    queued_operator_commands: scalarCount(database, "SELECT COUNT(*) FROM agent_operator_commands WHERE status IN ('queued', 'accepted', 'running')"),
    runtime_events: scalarCount(database, "SELECT COUNT(*) FROM runtime_events"),
    monitor_heartbeat: monitorHeartbeat,
  };
}

function createMonitorHeartbeatSnapshot(database) {
  const row = latestMonitorHeartbeat(database);
  if (!row) {
    return {
      freshness: "absent",
      last_heartbeat_at: null,
      age_seconds: null,
      stale_after_seconds: MONITOR_HEARTBEAT_STALE_AFTER_SECONDS,
      source: DEFAULT_MONITOR_HEARTBEAT_SOURCE,
      interval_ms: null,
      monitor_url: null,
      gateway_url: null,
      monitor_url_matches_expected: false,
      gateway_url_matches_expected: false,
      expected_url_mismatch: false,
      expected_gateway_url: DEFAULT_EXPECTED_GATEWAY_URL,
      expected_monitor_url: DEFAULT_EXPECTED_MONITOR_URL,
      event_id: null,
      aggregate_id: null,
    };
  }

  const payload = parseJsonObject(row.payload_json);
  const createdAt = normalizeIsoDate(typeof row.created_at === "string" ? row.created_at : null);
  const rawHeartbeatAt = typeof payload.client_sent_at === "string" ? payload.client_sent_at : null;
  const lastHeartbeatAt = normalizeIsoDate(rawHeartbeatAt) ?? createdAt;
  const lastHeartbeatMs = Date.parse(lastHeartbeatAt ?? "");
  const staleAfterSeconds = normalizePositiveInteger(payload?.heartbeat_stale_after_seconds, MONITOR_HEARTBEAT_STALE_AFTER_SECONDS);
  const ageSeconds = Number.isFinite(lastHeartbeatMs)
    ? Math.floor((Date.now() - lastHeartbeatMs) / 1000)
    : null;
  const monitorUrl = normalizeString(payload.monitor_url);
  const gatewayUrl = normalizeString(payload.gateway_url);
  const monitorUrlMatchesExpected = coerceBoolean(
    payload.monitor_url_matches_expected,
    monitorUrl !== null && monitorUrl === DEFAULT_EXPECTED_MONITOR_URL,
  );
  const gatewayUrlMatchesExpected = coerceBoolean(
    payload.gateway_url_matches_expected,
    gatewayUrl !== null && gatewayUrl === DEFAULT_EXPECTED_GATEWAY_URL,
  );
  const expectedUrlMismatch = coerceBoolean(
    payload.expected_url_mismatch,
    !monitorUrlMatchesExpected || !gatewayUrlMatchesExpected,
  );

  return {
    last_heartbeat_at: lastHeartbeatAt,
    age_seconds: ageSeconds,
    freshness: monitorHeartbeatFreshness(ageSeconds, staleAfterSeconds),
    stale_after_seconds: staleAfterSeconds,
    source: normalizeString(payload.source) ?? DEFAULT_MONITOR_HEARTBEAT_SOURCE,
    interval_ms: Number.isFinite(payload?.heartbeat_interval_ms)
      ? Number(payload.heartbeat_interval_ms)
      : null,
    monitor_url: monitorUrl,
    gateway_url: gatewayUrl,
    monitor_url_matches_expected: !!monitorUrlMatchesExpected,
    gateway_url_matches_expected: !!gatewayUrlMatchesExpected,
    expected_url_mismatch: !!expectedUrlMismatch,
    expected_gateway_url: normalizeString(payload.expected_gateway_url)
      ?? DEFAULT_EXPECTED_GATEWAY_URL,
    expected_monitor_url: normalizeString(payload.expected_monitor_url)
      ?? DEFAULT_EXPECTED_MONITOR_URL,
    event_id: optionalString(row.event_id),
    aggregate_id: optionalString(row.aggregate_id),
  };
}

function monitorHeartbeatFreshness(ageSeconds, staleAfterSeconds = MONITOR_HEARTBEAT_STALE_AFTER_SECONDS) {
  if (!Number.isFinite(ageSeconds) || ageSeconds < 0) {
    return "unknown";
  }
  return ageSeconds <= staleAfterSeconds ? "fresh" : "stale";
}

function latestMonitorHeartbeat(database) {
  try {
    return database.prepare(`
      SELECT event_id, aggregate_id, created_at, payload_json
      FROM runtime_events
      WHERE event_type = 'monitor.heartbeat'
      ORDER BY revision DESC
      LIMIT 1
    `).get();
  } catch {
    return null;
  }
}

function scalarCount(database, sql) {
  const row = database.prepare(sql).get();
  const value = Object.values(row ?? {})[0];
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function parseJsonColumns(row) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => {
    if (!key.endsWith("_json") || typeof value !== "string") {
      return [key, value];
    }
    return [key.replace(/_json$/, ""), parseJsonObject(value)];
  }));
}

function parseJsonObject(value) {
  try {
    const parsed = JSON.parse(value ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function coerceBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === 0 || value === 1) {
    return value === 1;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
  }
  return fallback;
}

function groupMetadataFromSession(session) {
  const metadata = asRecord(session.metadata);
  const scope = asRecord(session.scope);
  const group = firstRecord([
    metadata.group_metadata,
    metadata.worker_group,
    scope.group_metadata,
    scope.worker_group,
  ]);
  const groupId = pickFirstString([
    group.group_id,
    metadata.group_id,
    scope.group_id,
  ]);
  if (!groupId) {
    return null;
  }

  return removeNullValues({
    group_id: groupId,
    group_name: pickFirstString([group.group_name, metadata.group_name, scope.group_name]),
    group_role: pickFirstString([group.group_role, metadata.group_role, scope.group_role]),
    launch_stage: pickFirstString([group.launch_stage, metadata.launch_stage, scope.launch_stage]),
    group_closer_worker_id: pickFirstString([group.group_closer_worker_id, metadata.group_closer_worker_id]),
    returns_to: pickFirstString([group.returns_to, metadata.returns_to]),
    owner_dialog_assistant_session_id: pickFirstString([
      group.owner_dialog_assistant_session_id,
      metadata.owner_dialog_assistant_session_id,
      session.assigned_by_session_id,
    ]),
  });
}

function groupEdgeFromSession(session, group) {
  const sessionId = optionalString(session.session_id);
  if (!sessionId || !group?.group_id) {
    return null;
  }

  return removeNullValues({
    edge_id: stableEdgeId("group-member", group.group_id, sessionId),
    edge_type: "group-membership",
    group_id: group.group_id,
    session_id: sessionId,
    target_session_id: sessionId,
    source_session_id: group.group_closer_worker_id ?? group.owner_dialog_assistant_session_id,
    group_role: group.group_role,
    launch_stage: group.launch_stage,
    returns_to: group.returns_to,
  });
}

function assignmentEdgesFromSessions(sessions) {
  return sessions
    .map((session) => {
      const sourceSessionId = optionalString(session.assigned_by_session_id) ?? optionalString(session.created_by_session_id);
      const targetSessionId = optionalString(session.session_id);
      if (!sourceSessionId || !targetSessionId) {
        return null;
      }
      const group = groupMetadataFromSession(session);
      return removeNullValues({
        edge_id: stableEdgeId("assignment", sourceSessionId, targetSessionId),
        edge_type: "assignment",
        source_session_id: sourceSessionId,
        target_session_id: targetSessionId,
        group_id: group?.group_id,
      });
    })
    .filter(Boolean);
}

function peerEdgeFromMessage(message) {
  const payload = asRecord(message.payload);
  const payloadEdge = firstRecord([payload.peer_edge, payload.edge_identity]);
  const sourceSessionId = pickFirstString([payloadEdge.source_session_id, message.source_session_id]);
  const targetSessionId = pickFirstString([payloadEdge.target_session_id, message.target_session_id]);
  const channel = optionalString(message.channel) ?? "peer";
  const correlationId = optionalString(message.correlation_id);
  const edgeId = pickFirstString([
    payloadEdge.edge_id,
    payload.peer_edge_id,
    correlationId ? stableEdgeId("peer-correlation", correlationId) : null,
    stableEdgeId("peer", sourceSessionId, targetSessionId, channel),
  ]);

  return removeNullValues({
    edge_id: edgeId,
    edge_type: "peer-message",
    edge_kind: payloadEdge.edge_kind ?? channel,
    source_session_id: sourceSessionId,
    target_session_id: targetSessionId,
    target_role: optionalString(message.target_role),
    group_id: topologyGroupId(payload),
    correlation_id: correlationId,
    latest_message_id: optionalString(message.message_id),
    latest_state: optionalString(message.state),
    priority: optionalString(message.priority),
    flow_active: ["queued", "delivered", "read"].includes(optionalString(message.state)),
    flow_visible_until: optionalString(message.expires_at),
  });
}

function notificationEdgeFromNotification(notification) {
  const payload = asRecord(notification.payload);
  const payloadEdge = firstRecord([payload.notification_edge, payload.edge_identity]);
  const sourceSessionId = pickFirstString([payloadEdge.source_session_id, notification.source_session_id]);
  const targetSessionId = pickFirstString([payloadEdge.target_session_id, notification.target_session_id]);
  const targetRole = pickFirstString([payloadEdge.target_role, notification.target_role]);
  const notificationType = optionalString(notification.notification_type);
  const correlationId = optionalString(notification.correlation_id);
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
    source_session_id: sourceSessionId,
    target_session_id: targetSessionId,
    target_role: targetRole,
    group_id: topologyGroupId(payload),
    correlation_id: correlationId,
    latest_notification_id: optionalString(notification.notification_id),
    latest_status: optionalString(notification.status),
    priority: optionalString(notification.priority),
    flow_active: ["unread", "acknowledged"].includes(optionalString(notification.status)),
  });
}

function jobEdge(job) {
  const sourceSessionId = optionalString(job.owner_session_id);
  const targetSessionId = optionalString(job.assignee_session_id) ?? optionalString(job.session_id);
  if (!sourceSessionId && !targetSessionId) {
    return null;
  }

  return removeNullValues({
    edge_id: stableEdgeId("job", sourceSessionId, targetSessionId, optionalString(job.job_id)),
    edge_type: "job-assignment",
    job_id: optionalString(job.job_id),
    source_session_id: sourceSessionId,
    target_session_id: targetSessionId,
    current_actor_session_id: optionalString(job.current_actor_session_id),
    status: optionalString(job.status),
    lease_status: optionalString(job.lease_status),
  });
}

function mergeFlowEdge(existing, incoming) {
  if (!existing) {
    return incoming;
  }

  return removeNullValues({
    ...existing,
    ...incoming,
    flow_active: Boolean(existing.flow_active || incoming.flow_active),
    priority: highestPriority(existing.priority, incoming.priority),
  });
}

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function firstRecord(values) {
  for (const value of values) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
  }
  return {};
}

function pickFirstString(values) {
  for (const value of values) {
    const normalized = optionalString(value);
    if (normalized) {
      return normalized;
    }
  }
  return null;
}

function normalizeIsoDate(value) {
  if (typeof value !== "string") {
    return null;
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return new Date(parsed).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function normalizeString(value) {
  return optionalString(value);
}

function optionalString(value) {
  if (value === null || value === undefined || typeof value === "object") {
    return null;
  }
  const normalized = String(value).trim();
  return normalized === "" ? null : normalized;
}

function normalizePositiveInteger(value, fallback = 0) {
  if (!Number.isFinite(Number(value))) {
    return fallback;
  }
  const integerValue = Math.floor(Number(value));
  return integerValue > 0 ? integerValue : fallback;
}

function topologyGroupId(payload) {
  return pickFirstString([
    payload.group_id,
    payload.group_metadata?.group_id,
    payload.worker_group?.group_id,
    payload.peer_edge?.group_id,
    payload.notification_edge?.group_id,
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
