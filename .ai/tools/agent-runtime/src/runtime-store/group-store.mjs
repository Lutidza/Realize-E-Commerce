/**
 * @file .ai/tools/agent-runtime/src/runtime-store/group-store.mjs
 * @version 0.1.0 - 2026-05-10 00:00
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Worker group writer operations for first-class runtime rows:
 * lifecycle, membership, communication edges, and Dialog Assistant acceptance
 * evidence before group closure.
 */
import {
  GROUP_ACCEPTANCE_EVIDENCE_STATUSES,
  GROUP_ACCEPTANCE_EVIDENCE_TYPES,
  GROUP_ACCEPTANCE_STATUSES,
  GROUP_EDGE_STATES,
  GROUP_EDGE_TYPES,
  GROUP_MEMBER_STATUSES,
  GROUP_STATUSES,
  RESOLUTIONS,
  VISIBILITIES,
  boolInt,
  enumValue,
  id,
  jsonText,
  optionalTimestamp,
  requireRuntimeOperatorActor,
  required,
  timestamp,
} from "../runtime-utils.mjs";
import { ensureAgentSessionFromWorkerSession } from "./agent-session-store.mjs";
import { actorSessionIdFromOptions } from "./common.mjs";
import { withRuntimeEvent } from "./event-log.mjs";

export function upsertGroup(store, options) {
  requireRuntimeOperatorActor(options, "group-upsert");
  const groupId = required(options, "group-id");
  const existing = groupById(store, groupId);
  const now = timestamp(options["updated-at"]);
  const status = enumValue(options.status ?? existing?.status ?? "planned", GROUP_STATUSES, "status");
  const acceptanceStatus = enumValue(options["acceptance-status"] ?? existing?.acceptance_status ?? "pending", GROUP_ACCEPTANCE_STATUSES, "acceptance-status");
  const returnsToSessionId = options["returns-to-session-id"] ?? existing?.returns_to_session_id ?? required(options, "returns-to-session-id");
  const groupCloserSessionId = options["group-closer-session-id"] ?? existing?.group_closer_session_id ?? null;
  const closedAt = status === "closed" ? optionalTimestamp(options, "closed-at") ?? now : null;
  assertKnownSession(store, returnsToSessionId, "returns-to-session-id");
  assertOptionalKnownSession(store, options["owner-session-id"] ?? existing?.owner_session_id ?? null, "owner-session-id");
  assertOptionalKnownSession(store, groupCloserSessionId, "group-closer-session-id");

  return withRuntimeEvent(store, groupRuntimeEvent(options, groupId, status === "closed" ? "group.closed" : "group.upserted", now, {
    status,
    acceptance_status: acceptanceStatus,
    returns_to_session_id: returnsToSessionId,
    group_closer_session_id: groupCloserSessionId,
  }), (revision) => {
    writeGroupRows(store, {
      groupId,
      taskId: options["task-id"] ?? existing?.task_id ?? null,
      jobId: options["job-id"] ?? existing?.job_id ?? null,
      ownerSessionId: options["owner-session-id"] ?? existing?.owner_session_id ?? null,
      returnsToSessionId,
      groupCloserSessionId,
      status,
      acceptanceStatus,
      acceptanceEvidenceJson: jsonText(options["acceptance-evidence-json"] ?? existing?.acceptance_evidence_json ?? "{}", "acceptance-evidence-json", "object"),
      metadataJson: jsonText(options["metadata-json"] ?? existing?.metadata_json ?? "{}", "metadata-json", "object"),
      createdAt: timestamp(options["created-at"] ?? existing?.created_at),
      updatedAt: now,
      closedAt,
      revision,
    });
    return groupId;
  });
}

export function upsertGroupMember(store, options) {
  requireRuntimeOperatorActor(options, "group-member-upsert");
  const groupId = required(options, "group-id");
  const sessionId = required(options, "session-id");
  const now = timestamp(options["updated-at"]);
  assertKnownGroup(store, groupId);
  assertKnownSession(store, sessionId, "session-id");
  const memberStatus = enumValue(options["member-status"] ?? "active", GROUP_MEMBER_STATUSES, "member-status");

  return withRuntimeEvent(store, groupRuntimeEvent(options, groupId, "group.member_upserted", now, {
    session_id: sessionId,
    member_status: memberStatus,
  }), (revision) => {
    ensureGroupAgentReferences(store, revision, now, [sessionId]);
    const role = required(options, "role");
    const writeAllowed = boolInt(options["write-allowed"] ?? "false");
    const allowedPathsJson = jsonText(options["allowed-paths-json"] ?? "[]", "allowed-paths-json", "list");
    const forbiddenPathsJson = jsonText(options["forbidden-paths-json"] ?? "[]", "forbidden-paths-json", "list");
    const metadataJson = jsonText(options["metadata-json"] ?? "{}", "metadata-json", "object");
    const joinedAt = timestamp(options["joined-at"]);
    store.database.prepare(`
      INSERT INTO worker_group_members (
        group_id, session_id, role, member_status, write_allowed,
        allowed_paths_json, forbidden_paths_json, metadata_json, joined_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(group_id, session_id) DO UPDATE SET
        role = excluded.role,
        member_status = excluded.member_status,
        write_allowed = excluded.write_allowed,
        allowed_paths_json = excluded.allowed_paths_json,
        forbidden_paths_json = excluded.forbidden_paths_json,
        metadata_json = excluded.metadata_json,
        updated_at = excluded.updated_at
    `).run(groupId, sessionId, role, memberStatus, writeAllowed, allowedPathsJson, forbiddenPathsJson, metadataJson, joinedAt, now);
    store.database.prepare(`
      INSERT INTO agent_worker_group_members (
        group_id, session_id, role, member_status, write_allowed,
        allowed_paths_json, forbidden_paths_json, metadata_json, joined_at, updated_at, last_revision
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(group_id, session_id) DO UPDATE SET
        role = excluded.role,
        member_status = excluded.member_status,
        write_allowed = excluded.write_allowed,
        allowed_paths_json = excluded.allowed_paths_json,
        forbidden_paths_json = excluded.forbidden_paths_json,
        metadata_json = excluded.metadata_json,
        updated_at = excluded.updated_at,
        last_revision = excluded.last_revision
    `).run(groupId, sessionId, role, mapAgentGroupMemberStatus(memberStatus), writeAllowed, allowedPathsJson, forbiddenPathsJson, metadataJson, joinedAt, now, revision);
    return `${groupId}:${sessionId}`;
  });
}

export function upsertGroupEdge(store, options) {
  requireRuntimeOperatorActor(options, "group-edge-upsert");
  const edgeId = options["edge-id"] ?? id("grp_edge");
  const groupId = required(options, "group-id");
  const sourceSessionId = required(options, "source-session-id");
  const targetSessionId = required(options, "target-session-id");
  const now = timestamp(options["updated-at"]);
  assertKnownGroup(store, groupId);
  assertKnownSession(store, sourceSessionId, "source-session-id");
  assertKnownSession(store, targetSessionId, "target-session-id");
  const edgeType = enumValue(options["edge-type"] ?? "peer", GROUP_EDGE_TYPES, "edge-type");
  const state = enumValue(options.state ?? "active", GROUP_EDGE_STATES, "state");
  const summary = options.summary ?? "";
  const metadataJson = jsonText(options["metadata-json"] ?? "{}", "metadata-json", "object");

  return withRuntimeEvent(store, groupRuntimeEvent(options, groupId, "group.edge_upserted", now, {
    edge_id: edgeId,
    source_session_id: sourceSessionId,
    target_session_id: targetSessionId,
    edge_type: edgeType,
    state,
  }), (revision) => {
    ensureGroupAgentReferences(store, revision, now, [sourceSessionId, targetSessionId]);
    store.database.prepare(`
      INSERT INTO worker_group_edges (
        edge_id, group_id, source_session_id, target_session_id, edge_type,
        state, summary, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(edge_id) DO UPDATE SET
        edge_type = excluded.edge_type,
        state = excluded.state,
        summary = excluded.summary,
        metadata_json = excluded.metadata_json,
        updated_at = excluded.updated_at
    `).run(edgeId, groupId, sourceSessionId, targetSessionId, edgeType, state, summary, metadataJson, timestamp(options["created-at"]), now);
    store.database.prepare(`
      INSERT INTO agent_worker_group_edges (
        edge_id, group_id, source_session_id, target_session_id, edge_type,
        state, summary, metadata_json, created_at, updated_at, last_revision
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(edge_id) DO UPDATE SET
        edge_type = excluded.edge_type,
        state = excluded.state,
        summary = excluded.summary,
        metadata_json = excluded.metadata_json,
        updated_at = excluded.updated_at,
        last_revision = excluded.last_revision
    `).run(edgeId, groupId, sourceSessionId, targetSessionId, edgeType, state, summary, metadataJson, timestamp(options["created-at"]), now, revision);
    return edgeId;
  });
}

export function recordGroupAcceptanceEvidence(store, options) {
  requireRuntimeOperatorActor(options, "group-acceptance-record");
  const groupId = required(options, "group-id");
  const evidence = buildAcceptanceEvidence(store, options, groupId);
  return withRuntimeEvent(store, groupRuntimeEvent(options, groupId, "group.acceptance_recorded", evidence.createdAt, {
    evidence_id: evidence.evidenceId,
    evidence_type: evidence.evidenceType,
    evidence_status: evidence.evidenceStatus,
  }), (revision) => {
    insertAcceptanceEvidence(store, evidence, revision);
    updateGroupAcceptanceStatus(store, groupId, acceptanceStatusFromEvidence(evidence.evidenceStatus), evidence.createdAt, revision);
    return evidence.evidenceId;
  });
}

export function closeGroup(store, options) {
  requireRuntimeOperatorActor(options, "group-close");
  const groupId = required(options, "group-id");
  const group = assertKnownGroup(store, groupId);
  const resolution = enumValue(options.resolution ?? "accepted", RESOLUTIONS, "resolution");
  const now = timestamp(options["closed-at"] ?? options["updated-at"]);
  assertClosureReady(group);
  const evidence = options["acceptance-evidence-json"]
    ? buildAcceptanceEvidence(store, { ...options, "evidence-type": options["evidence-type"] ?? "acceptance", "evidence-status": "accepted" }, groupId)
    : null;
  if (resolution === "accepted" && evidence === null && acceptedEvidenceCount(store, groupId) === 0) {
    throw new Error(`group-close ${groupId} with resolution=accepted requires accepted acceptance evidence`);
  }

  return withRuntimeEvent(store, groupRuntimeEvent(options, groupId, "group.closed", now, {
    resolution,
    returns_to_session_id: group.returns_to_session_id,
    group_closer_session_id: group.group_closer_session_id,
  }), (revision) => {
    if (evidence) {
      insertAcceptanceEvidence(store, evidence, revision);
    }
    writeGroupRows(store, {
      groupId,
      taskId: group.task_id,
      jobId: group.job_id,
      ownerSessionId: group.owner_session_id,
      returnsToSessionId: group.returns_to_session_id,
      groupCloserSessionId: group.group_closer_session_id,
      status: "closed",
      acceptanceStatus: resolution === "accepted" ? "accepted" : group.acceptance_status,
      acceptanceEvidenceJson: jsonText(options["acceptance-evidence-json"] ?? group.acceptance_evidence_json ?? "{}", "acceptance-evidence-json", "object"),
      metadataJson: group.metadata_json ?? "{}",
      createdAt: group.created_at,
      updatedAt: now,
      closedAt: now,
      revision,
    });
    return groupId;
  });
}

export function groupById(store, groupId) {
  return store.database.prepare("SELECT * FROM worker_groups WHERE group_id = ?").get(groupId);
}

function writeGroupRows(store, group) {
  store.database.prepare(`
    INSERT INTO worker_groups (
      group_id, task_id, job_id, owner_session_id, returns_to_session_id,
      group_closer_session_id, status, acceptance_status,
      acceptance_evidence_json, metadata_json, created_at, updated_at, closed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(group_id) DO UPDATE SET
      task_id = excluded.task_id,
      job_id = excluded.job_id,
      owner_session_id = excluded.owner_session_id,
      returns_to_session_id = excluded.returns_to_session_id,
      group_closer_session_id = excluded.group_closer_session_id,
      status = excluded.status,
      acceptance_status = excluded.acceptance_status,
      acceptance_evidence_json = excluded.acceptance_evidence_json,
      metadata_json = excluded.metadata_json,
      updated_at = excluded.updated_at,
      closed_at = excluded.closed_at
  `).run(group.groupId, group.taskId, group.jobId, group.ownerSessionId, group.returnsToSessionId, group.groupCloserSessionId, group.status, group.acceptanceStatus, group.acceptanceEvidenceJson, group.metadataJson, group.createdAt, group.updatedAt, group.closedAt);
  ensureGroupAgentReferences(store, group.revision, group.updatedAt, [
    group.ownerSessionId,
    group.returnsToSessionId,
    group.groupCloserSessionId,
  ]);
  store.database.prepare(`
    INSERT INTO agent_worker_groups (
      group_id, task_id, job_id, owner_session_id, returns_to_session_id,
      group_closer_session_id, lifecycle_status, acceptance_status,
      acceptance_evidence_json, metadata_json, created_at, updated_at, closed_at, last_revision
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(group_id) DO UPDATE SET
      task_id = excluded.task_id,
      job_id = excluded.job_id,
      owner_session_id = excluded.owner_session_id,
      returns_to_session_id = excluded.returns_to_session_id,
      group_closer_session_id = excluded.group_closer_session_id,
      lifecycle_status = excluded.lifecycle_status,
      acceptance_status = excluded.acceptance_status,
      acceptance_evidence_json = excluded.acceptance_evidence_json,
      metadata_json = excluded.metadata_json,
      updated_at = excluded.updated_at,
      closed_at = excluded.closed_at,
      last_revision = excluded.last_revision
  `).run(group.groupId, group.taskId, group.jobId, group.ownerSessionId, group.returnsToSessionId, group.groupCloserSessionId, mapAgentGroupStatus(group.status), mapAgentGroupAcceptanceStatus(group.acceptanceStatus), group.acceptanceEvidenceJson, group.metadataJson, group.createdAt, group.updatedAt, group.closedAt, group.revision);
}

function buildAcceptanceEvidence(store, options, groupId) {
  assertKnownGroup(store, groupId);
  const actorSessionId = actorSessionIdFromOptions(options);
  const sessionId = options["session-id"] ?? null;
  assertOptionalKnownSession(store, actorSessionId, "actor-session-id");
  assertOptionalKnownSession(store, sessionId, "session-id");
  return {
    evidenceId: options["evidence-id"] ?? id("grp_ev"),
    groupId,
    actorSessionId,
    sessionId,
    evidenceType: enumValue(options["evidence-type"] ?? "review", GROUP_ACCEPTANCE_EVIDENCE_TYPES, "evidence-type"),
    evidenceStatus: enumValue(options["evidence-status"] ?? "recorded", GROUP_ACCEPTANCE_EVIDENCE_STATUSES, "evidence-status"),
    visibility: enumValue(options.visibility ?? "internal-summary", VISIBILITIES, "visibility"),
    summary: required(options, "summary"),
    payloadJson: jsonText(options["payload-json"] ?? options["acceptance-evidence-json"] ?? "{}", "payload-json", "object"),
    relatedArtifactsJson: jsonText(options["related-artifacts-json"] ?? "[]", "related-artifacts-json", "list"),
    createdAt: timestamp(options["created-at"]),
  };
}

function insertAcceptanceEvidence(store, evidence, revision) {
  const values = [evidence.evidenceId, evidence.groupId, evidence.actorSessionId, evidence.sessionId, evidence.evidenceType, evidence.evidenceStatus, evidence.visibility, evidence.summary, evidence.payloadJson, evidence.relatedArtifactsJson, evidence.createdAt];
  store.database.prepare(`
    INSERT INTO worker_group_acceptance_evidence (
      evidence_id, group_id, actor_session_id, session_id, evidence_type,
      evidence_status, visibility, summary, payload_json,
      related_artifacts_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(...values);
  ensureGroupAgentReferences(store, revision, evidence.createdAt, [evidence.actorSessionId, evidence.sessionId]);
  store.database.prepare(`
    INSERT INTO agent_worker_group_acceptance_evidence (
      evidence_id, group_id, actor_session_id, session_id, evidence_type,
      evidence_status, visibility, summary, payload_json,
      related_artifacts_json, created_at, last_revision
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(...values, revision);
}

function groupRuntimeEvent(options, groupId, eventType, createdAt, payload) {
  return {
    eventType,
    aggregateType: "worker_group",
    aggregateId: groupId,
    actorSessionId: actorSessionIdFromOptions(options),
    visibility: "internal-summary",
    summary: options.summary ?? `Worker group ${groupId} ${eventType}.`,
    payload,
    createdAt,
  };
}

function updateGroupAcceptanceStatus(store, groupId, acceptanceStatus, updatedAt, revision) {
  if (acceptanceStatus === null) {
    return;
  }
  store.database.prepare("UPDATE worker_groups SET acceptance_status = ?, updated_at = ? WHERE group_id = ?").run(acceptanceStatus, updatedAt, groupId);
  store.database.prepare("UPDATE agent_worker_groups SET acceptance_status = ?, updated_at = ?, last_revision = ? WHERE group_id = ?").run(mapAgentGroupAcceptanceStatus(acceptanceStatus), updatedAt, revision, groupId);
}

function acceptedEvidenceCount(store, groupId) {
  return Number(store.database.prepare("SELECT COUNT(*) AS count FROM worker_group_acceptance_evidence WHERE group_id = ? AND evidence_status = 'accepted'").get(groupId)?.count ?? 0);
}

function assertKnownGroup(store, groupId) {
  const group = groupById(store, groupId);
  if (!group) {
    throw new Error(`Worker group not found: ${groupId}`);
  }
  return group;
}

function assertKnownSession(store, sessionId, optionName) {
  const row = store.database
    .prepare(`
      SELECT session_id FROM worker_sessions WHERE session_id = ?
      UNION
      SELECT session_id FROM agent_sessions WHERE session_id = ?
    `)
    .get(sessionId, sessionId);
  if (!row) {
    throw new Error(`Unknown ${optionName}: ${sessionId}`);
  }
}

function assertOptionalKnownSession(store, sessionId, optionName) {
  if (sessionId) {
    assertKnownSession(store, sessionId, optionName);
  }
}

function assertClosureReady(group) {
  if (!group.returns_to_session_id) {
    throw new Error(`group-close ${group.group_id} requires returns_to_session_id`);
  }
  if (!group.group_closer_session_id) {
    throw new Error(`group-close ${group.group_id} requires group_closer_session_id`);
  }
}

function acceptanceStatusFromEvidence(status) {
  return { accepted: "accepted", rejected: "rejected", blocked: "blocked" }[status] ?? null;
}

function mapAgentGroupStatus(status) {
  return status === "needs-review" ? "needs_review" : status;
}

function mapAgentGroupAcceptanceStatus(status) {
  return status === "review-ready" ? "review_ready" : status;
}

function mapAgentGroupMemberStatus(status) {
  return status === "result-ready" ? "result_ready" : status === "needs-review" ? "needs_review" : status;
}

function ensureGroupAgentReferences(store, revision, fallbackTimestamp, sessionIds) {
  for (const sessionId of sessionIds) {
    if (sessionId) {
      ensureAgentSessionFromWorkerSession(store, sessionId, revision, fallbackTimestamp);
    }
  }
}
