/**
 * @file .ai/tools/agent-runtime/src/runtime-store/event-log.mjs
 * @version 0.1.0 - 2026-05-06 04:05
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Transaction and durable runtime_events writer for the local AI
 * runtime store.
 *
 * Changes in version 0.1.0:
 * - Extracted runtime event transaction handling into a dedicated owner module.
 */
import {
  VISIBILITIES,
  enumValue,
  id,
  jsonText,
  timestamp,
} from "../runtime-utils.mjs";

export function withRuntimeEvent(store, event, action) {
  store.database.exec("BEGIN IMMEDIATE");
  try {
    const revision = insertRuntimeEvent(store.database, event);
    const result = action(revision);
    store.database.exec("COMMIT");
    return result;
  } catch (error) {
    store.database.exec("ROLLBACK");
    throw error;
  }
}

export function insertRuntimeEvent(database, event) {
  const createdAt = event.createdAt ?? timestamp();
  const result = database.prepare(`
    INSERT INTO runtime_events (
      event_id, event_type, aggregate_type, aggregate_id, session_id,
      actor_session_id, visibility, summary, payload_json, idempotency_key,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    event.eventId ?? id("evt"),
    requiredRuntimeEventValue(event.eventType, "eventType"),
    requiredRuntimeEventValue(event.aggregateType, "aggregateType"),
    requiredRuntimeEventValue(event.aggregateId, "aggregateId"),
    event.sessionId ?? null,
    event.actorSessionId ?? null,
    enumValue(event.visibility ?? "internal-summary", VISIBILITIES, "visibility"),
    event.summary ?? "",
    runtimePayloadJson(event.payload),
    event.idempotencyKey ?? null,
    createdAt,
  );

  return Number(result.lastInsertRowid);
}

function requiredRuntimeEventValue(value, key) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing runtime event ${key}`);
  }
  return value;
}

function runtimePayloadJson(payload) {
  if (payload === undefined || payload === null) {
    return "{}";
  }
  if (typeof payload === "string") {
    return jsonText(payload, "runtime-event-payload", "object");
  }
  if (typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Runtime event payload must be a JSON object");
  }
  return JSON.stringify(payload);
}
