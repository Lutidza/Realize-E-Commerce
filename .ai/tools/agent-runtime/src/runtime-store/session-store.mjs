/**
 * @file .ai/tools/agent-runtime/src/runtime-store/session-store.mjs
 * @version 0.1.0 - 2026-05-06 04:05
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Session lifecycle and legacy session event writer operations
 * for the local AI runtime store.
 *
 * Changes in version 0.1.0:
 * - Extracted session lifecycle writes from the monolithic runtime store.
 *
 * Changes in version 0.1.1:
 * - Added worker kind validation for external process worker sessions.
 */
import {
  EVENT_TYPES,
  RESOLUTIONS,
  STATUSES,
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
import {
  knownAgentSessionId,
  upsertAgentSession,
} from "./agent-session-store.mjs";
import { actorSessionIdFromOptions } from "./common.mjs";
import { withRuntimeEvent } from "./event-log.mjs";
import {
  mapAgentLifecycleStatus,
  mapAgentResolution,
  mapAgentSessionKind,
} from "./mappers.mjs";

const supportedWorkerKinds = new Set(["dialog_assistant", "external_worker", "external_process", "delivery_worker"]);

export function upsertSession(store, options) {
  requireRuntimeOperatorActor(options, "session-upsert");
  const sessionId = required(options, "session-id");
  const now = timestamp(options["updated-at"]);
  const status = enumValue(options.status ?? "planned", STATUSES, "status");
  const resolution = options.resolution ? enumValue(options.resolution, RESOLUTIONS, "resolution") : null;
  const closedAt = status === "closed" ? optionalTimestamp(options, "closed-at") ?? now : null;
  const workerKind = options["worker-kind"] ?? "external_worker";
  assertWorkerKind(sessionId, workerKind);
  const role = required(options, "role");
  const mission = options.mission ?? "";
  const assignedBy = options["assigned-by"] ?? null;
  const handoffRequired = boolInt(options["handoff-required"] ?? "false");
  const allowedPathsJson = jsonText(options["allowed-paths-json"] ?? "[]", "allowed-paths-json", "list");
  const forbiddenPathsJson = jsonText(options["forbidden-paths-json"] ?? "[]", "forbidden-paths-json", "list");
  const metadataJson = jsonText(options["metadata-json"] ?? "{}", "metadata-json", "object");
  const messagesPath = options["messages-path"] ?? null;
  const resultPath = options["result-path"] ?? null;
  const historyPath = options["history-path"] ?? null;
  const startedAt = timestamp(options["started-at"]);
  const scopeJson = JSON.stringify({
    allowed_paths: JSON.parse(allowedPathsJson),
    forbidden_paths: JSON.parse(forbiddenPathsJson),
    messages_path: messagesPath,
    result_path: resultPath,
    history_path: historyPath,
    handoff_required: handoffRequired === 1,
  });

  return withRuntimeEvent(store, {
    eventType: status === "closed" ? "session.closed" : "session.upserted",
    aggregateType: "session",
    aggregateId: sessionId,
    sessionId,
    actorSessionId: actorSessionIdFromOptions(options),
    summary: `Session ${sessionId} upserted.`,
    payload: {
      worker_kind: workerKind,
      role,
      status,
      resolution,
    },
    createdAt: now,
  }, (revision) => {
    store.database.prepare(`
      INSERT INTO worker_sessions (
        session_id, worker_kind, role, mission, assigned_by, status, resolution,
        handoff_required, allowed_paths_json, forbidden_paths_json, metadata_json,
        messages_path, result_path, history_path, started_at, updated_at, closed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        worker_kind = excluded.worker_kind,
        role = excluded.role,
        mission = excluded.mission,
        assigned_by = excluded.assigned_by,
        status = excluded.status,
        resolution = excluded.resolution,
        handoff_required = excluded.handoff_required,
        allowed_paths_json = excluded.allowed_paths_json,
        forbidden_paths_json = excluded.forbidden_paths_json,
        metadata_json = excluded.metadata_json,
        messages_path = excluded.messages_path,
        result_path = excluded.result_path,
        history_path = excluded.history_path,
        updated_at = excluded.updated_at,
        closed_at = CASE
          WHEN excluded.status = 'closed' THEN COALESCE(excluded.closed_at, worker_sessions.closed_at, excluded.updated_at)
          ELSE NULL
        END
    `).run(
      sessionId,
      workerKind,
      role,
      mission,
      assignedBy,
      status,
      resolution,
      handoffRequired,
      allowedPathsJson,
      forbiddenPathsJson,
      metadataJson,
      messagesPath,
      resultPath,
      historyPath,
      startedAt,
      now,
      closedAt,
    );

    upsertAgentSession(store, {
      sessionId,
      parentSessionId: knownAgentSessionId(store, options["parent-session-id"]),
      kind: mapAgentSessionKind(workerKind),
      role,
      title: options.title ?? role,
      mission,
      lifecycleStatus: mapAgentLifecycleStatus(status),
      resolution: mapAgentResolution(resolution),
      createdBySessionId: knownAgentSessionId(store, options["created-by-session-id"]),
      assignedBySessionId: knownAgentSessionId(store, assignedBy),
      currentJobId: options["current-job-id"] ?? null,
      scopeJson,
      metadataJson,
      createdAt: startedAt,
      startedAt,
      updatedAt: now,
      closedAt,
      revision,
    });

    return sessionId;
  });
}

function assertWorkerKind(sessionId, workerKind) {
  if (!supportedWorkerKinds.has(workerKind)) {
    throw new Error(`session-upsert ${sessionId} uses unsupported worker kind ${workerKind}`);
  }
}

export function appendEvent(store, options) {
  const eventId = options["event-id"] ?? id("evt");
  const sessionId = required(options, "session-id");
  const legacyEventType = enumValue(required(options, "event-type"), EVENT_TYPES, "event-type");
  const visibility = enumValue(options.visibility ?? "internal-summary", VISIBILITIES, "visibility");
  const summary = required(options, "summary");
  const payloadJson = jsonText(options["payload-json"] ?? "{}", "payload-json", "object");
  const relatedArtifactsJson = jsonText(options["related-artifacts-json"] ?? "[]", "related-artifacts-json", "list");
  const createdAt = timestamp(options["created-at"]);

  return withRuntimeEvent(store, {
    eventId,
    eventType: `session.${legacyEventType}`,
    aggregateType: "session_event",
    aggregateId: eventId,
    sessionId,
    actorSessionId: actorSessionIdFromOptions(options),
    visibility,
    summary,
    payload: {
      legacy_event_type: legacyEventType,
      payload: JSON.parse(payloadJson),
      related_artifacts: JSON.parse(relatedArtifactsJson),
    },
    createdAt,
  }, () => {
    store.database.prepare(`
      INSERT INTO worker_session_events (
        event_id, session_id, source, event_type, visibility, summary,
        payload_json, related_artifacts_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      sessionId,
      options.source ?? "agent-runtime-cli",
      legacyEventType,
      visibility,
      summary,
      payloadJson,
      relatedArtifactsJson,
      createdAt,
    );

    return eventId;
  });
}
