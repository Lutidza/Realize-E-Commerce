/**
 * @file .ai/tools/agent-runtime/src/runtime-store/agent-session-store.mjs
 * @version 0.1.0 - 2026-05-06 04:05
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Normalized agent_sessions writer and worker-session backfill
 * helpers used by runtime store operations.
 *
 * Changes in version 0.1.0:
 * - Extracted agent session normalization into a dedicated owner module.
 */
import { jsonText } from "../runtime-utils.mjs";
import { parseJsonList } from "./common.mjs";
import {
  mapAgentLifecycleStatus,
  mapAgentResolution,
  mapAgentSessionKind,
} from "./mappers.mjs";

export function upsertAgentSession(store, {
  sessionId,
  parentSessionId,
  kind,
  role,
  title,
  mission,
  lifecycleStatus,
  resolution,
  createdBySessionId,
  assignedBySessionId,
  currentJobId,
  scopeJson,
  metadataJson,
  createdAt,
  startedAt,
  updatedAt,
  closedAt,
  revision,
}) {
  store.database.prepare(`
    INSERT INTO agent_sessions (
      session_id, parent_session_id, kind, role, title, mission,
      lifecycle_status, resolution, created_by_session_id,
      assigned_by_session_id, current_job_id, scope_json, metadata_json,
      created_at, started_at, updated_at, closed_at, last_revision
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_id) DO UPDATE SET
      parent_session_id = excluded.parent_session_id,
      kind = excluded.kind,
      role = excluded.role,
      title = excluded.title,
      mission = excluded.mission,
      lifecycle_status = excluded.lifecycle_status,
      resolution = excluded.resolution,
      created_by_session_id = excluded.created_by_session_id,
      assigned_by_session_id = excluded.assigned_by_session_id,
      current_job_id = excluded.current_job_id,
      scope_json = excluded.scope_json,
      metadata_json = excluded.metadata_json,
      started_at = COALESCE(excluded.started_at, agent_sessions.started_at),
      updated_at = excluded.updated_at,
      closed_at = excluded.closed_at,
      last_revision = excluded.last_revision
  `).run(
    sessionId,
    parentSessionId,
    kind,
    role,
    title,
    mission,
    lifecycleStatus,
    resolution,
    createdBySessionId,
    assignedBySessionId,
    currentJobId,
    scopeJson,
    metadataJson,
    createdAt,
    startedAt,
    updatedAt,
    closedAt,
    revision,
  );
}

export function ensureAgentSessionFromWorkerSession(store, sessionId, revision, fallbackTimestamp) {
  if (!sessionId) {
    return false;
  }
  if (knownAgentSessionId(store, sessionId)) {
    return true;
  }

  const workerSession = sessionById(store, sessionId);
  if (!workerSession) {
    return false;
  }

  const startedAt = workerSession.started_at ?? fallbackTimestamp;
  const updatedAt = workerSession.updated_at ?? fallbackTimestamp;
  const metadataJson = jsonText(workerSession.metadata_json ?? "{}", "metadata-json", "object");
  const scopeJson = JSON.stringify({
    allowed_paths: parseJsonList(workerSession.allowed_paths_json),
    forbidden_paths: parseJsonList(workerSession.forbidden_paths_json),
    messages_path: workerSession.messages_path ?? null,
    result_path: workerSession.result_path ?? null,
    history_path: workerSession.history_path ?? null,
    handoff_required: Number(workerSession.handoff_required ?? 0) === 1,
  });

  upsertAgentSession(store, {
    sessionId,
    parentSessionId: null,
    kind: mapAgentSessionKind(workerSession.worker_kind ?? "external_worker"),
    role: workerSession.role ?? "worker",
    title: workerSession.role ?? "worker",
    mission: workerSession.mission ?? "",
    lifecycleStatus: mapAgentLifecycleStatus(workerSession.status ?? "planned"),
    resolution: mapAgentResolution(workerSession.resolution ?? null),
    createdBySessionId: null,
    assignedBySessionId: knownAgentSessionId(store, workerSession.assigned_by),
    currentJobId: null,
    scopeJson,
    metadataJson,
    createdAt: startedAt,
    startedAt,
    updatedAt,
    closedAt: workerSession.closed_at ?? null,
    revision,
  });

  return true;
}

export function knownAgentSessionId(store, sessionId) {
  if (!sessionId) {
    return null;
  }
  const row = store.database
    .prepare("SELECT session_id FROM agent_sessions WHERE session_id = ?")
    .get(sessionId);
  return row ? sessionId : null;
}

export function sessionById(store, sessionId) {
  return store.database.prepare("SELECT * FROM worker_sessions WHERE session_id = ?").get(sessionId);
}
