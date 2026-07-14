/**
 * @file .ai/tools/agent-runtime/src/runtime-store/group-store-writers.mjs
 * @version 0.1.0 - 2026-05-10 00:00
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description SQL writers that mirror worker group compatibility rows into
 * normalized agent group tables under one runtime event revision.
 */
import { ensureAgentSessionFromWorkerSession } from "./agent-session-store.mjs";

export function writeGroupRows(store, group) {
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

export function writeGroupMemberRows(store, member, revision) {
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
  `).run(member.groupId, member.sessionId, member.role, member.memberStatus, member.writeAllowed, member.allowedPathsJson, member.forbiddenPathsJson, member.metadataJson, member.joinedAt, member.updatedAt);
  ensureGroupAgentReferences(store, revision, member.updatedAt, [member.sessionId]);
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
  `).run(member.groupId, member.sessionId, member.role, mapAgentGroupMemberStatus(member.memberStatus), member.writeAllowed, member.allowedPathsJson, member.forbiddenPathsJson, member.metadataJson, member.joinedAt, member.updatedAt, revision);
}

export function writeGroupEdgeRows(store, edge, revision) {
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
  `).run(edge.edgeId, edge.groupId, edge.sourceSessionId, edge.targetSessionId, edge.edgeType, edge.state, edge.summary, edge.metadataJson, edge.createdAt, edge.updatedAt);
  ensureGroupAgentReferences(store, revision, edge.updatedAt, [edge.sourceSessionId, edge.targetSessionId]);
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
  `).run(edge.edgeId, edge.groupId, edge.sourceSessionId, edge.targetSessionId, edge.edgeType, edge.state, edge.summary, edge.metadataJson, edge.createdAt, edge.updatedAt, revision);
}

export function insertAcceptanceEvidence(store, evidence, revision) {
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

export function updateGroupAcceptanceStatus(store, groupId, acceptanceStatus, updatedAt, revision) {
  if (acceptanceStatus === null) {
    return;
  }
  store.database.prepare("UPDATE worker_groups SET acceptance_status = ?, updated_at = ? WHERE group_id = ?").run(acceptanceStatus, updatedAt, groupId);
  store.database.prepare("UPDATE agent_worker_groups SET acceptance_status = ?, updated_at = ?, last_revision = ? WHERE group_id = ?").run(mapAgentGroupAcceptanceStatus(acceptanceStatus), updatedAt, revision, groupId);
}

function ensureGroupAgentReferences(store, revision, fallbackTimestamp, sessionIds) {
  for (const sessionId of sessionIds) {
    if (sessionId) {
      ensureAgentSessionFromWorkerSession(store, sessionId, revision, fallbackTimestamp);
    }
  }
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
