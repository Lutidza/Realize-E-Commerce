/**
 * @file .ai/tools/agent-runtime/src/runtime-store/group-store-helpers.mjs
 * @version 0.1.0 - 2026-05-10 00:00
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Validation and mapping helpers for worker group runtime store
 * operations. These helpers keep the group writer boundary compact while
 * preserving the Dialog Assistant closure invariants.
 */
import { timestamp } from "../runtime-utils.mjs";
import { actorSessionIdFromOptions } from "./common.mjs";

export function groupRuntimeEvent(options, groupId, eventType, createdAt, payload) {
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

export function assertKnownGroup(store, groupId) {
  const group = groupById(store, groupId);
  if (!group) {
    throw new Error(`Worker group not found: ${groupId}`);
  }
  return group;
}

export function groupById(store, groupId) {
  return store.database.prepare("SELECT * FROM worker_groups WHERE group_id = ?").get(groupId);
}

export function assertKnownSession(store, sessionId, optionName) {
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

export function assertOptionalKnownSession(store, sessionId, optionName) {
  if (sessionId) {
    assertKnownSession(store, sessionId, optionName);
  }
}

export function assertClosureReady(group) {
  if (!group.returns_to_session_id) {
    throw new Error(`group-close ${group.group_id} requires returns_to_session_id`);
  }
  if (!group.group_closer_session_id) {
    throw new Error(`group-close ${group.group_id} requires group_closer_session_id`);
  }
}

export function acceptanceStatusFromEvidence(status) {
  return { accepted: "accepted", rejected: "rejected", blocked: "blocked" }[status] ?? null;
}

export function acceptedEvidenceCount(store, groupId) {
  return Number(store.database.prepare("SELECT COUNT(*) AS count FROM worker_group_acceptance_evidence WHERE group_id = ? AND evidence_status = 'accepted'").get(groupId)?.count ?? 0);
}

export function assertRuntimeSessionReference(store, sessionId, optionName) {
  if (!sessionId) {
    throw new Error(`Missing required option --${optionName}`);
  }
  assertKnownSession(store, sessionId, optionName);
}

export function fallbackCreatedAt(options, existing) {
  return timestamp(options["created-at"] ?? existing?.created_at);
}
