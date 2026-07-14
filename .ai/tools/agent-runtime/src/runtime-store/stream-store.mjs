/**
 * @file .ai/tools/agent-runtime/src/runtime-store/stream-store.mjs
 * @version 0.1.0 - 2026-05-07 00:40
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Append-only process stream event writer. Full stream content is
 * stored in agent_stream_events while runtime_events carries only routing and
 * preview metadata for fast UI deltas.
 *
 * Changes in version 0.1.0:
 * - Added persisted process stream events for read-only console/live-log UI.
 */
import {
  VISIBILITIES,
  enumValue,
  id,
  jsonText,
  required,
  timestamp,
} from "../runtime-utils.mjs";
import { withRuntimeEvent } from "./event-log.mjs";
import { processById } from "./process-store.mjs";

const STREAMS = new Set(["stdout", "stderr", "system", "structured"]);

export function appendStreamEvent(store, options) {
  const streamEventId = options["stream-event-id"] ?? id("strm");
  const processId = required(options, "process-id");
  const processRow = processById(store, processId);
  if (!processRow) {
    throw new Error(`Process not found: ${processId}`);
  }

  const stream = enumValue(options.stream ?? "stdout", STREAMS, "stream");
  const sequence = readSequence(store, processId, options.sequence);
  const eventType = options["event-type"] ?? `stream.${stream}`;
  const visibility = enumValue(options.visibility ?? "internal-summary", VISIBILITIES, "visibility");
  const contentText = options["content-text"] ?? options.content ?? "";
  const payloadJson = jsonText(options["payload-json"] ?? "{}", "payload-json", "object");
  const createdAt = timestamp(options["created-at"]);

  return withRuntimeEvent(store, {
    eventType: "stream.event",
    aggregateType: "stream_event",
    aggregateId: streamEventId,
    sessionId: processRow.session_id,
    actorSessionId: options["actor-session-id"] ?? processRow.session_id,
    visibility,
    summary: options.summary ?? `Stream ${stream} event ${sequence} for ${processId}.`,
    payload: {
      stream_event_id: streamEventId,
      process_id: processId,
      stream,
      sequence,
      event_type: eventType,
      content_length: contentText.length,
    },
    createdAt,
  }, (revision) => {
    store.database.prepare(`
      INSERT INTO agent_stream_events (
        stream_event_id, process_id, session_id, job_id, stream, sequence,
        event_type, visibility, content_text, payload_json, created_at,
        last_revision
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      streamEventId,
      processId,
      processRow.session_id,
      processRow.job_id,
      stream,
      sequence,
      eventType,
      visibility,
      contentText,
      payloadJson,
      createdAt,
      revision,
    );

    return streamEventId;
  });
}

function readSequence(store, processId, value) {
  if (value !== undefined && value !== null && value !== "") {
    const sequence = Number.parseInt(String(value), 10);
    if (!Number.isFinite(sequence) || sequence < 1) {
      throw new Error(`Invalid stream sequence: ${value}`);
    }
    return sequence;
  }
  const row = store.database
    .prepare("SELECT COALESCE(MAX(sequence), 0) + 1 AS next_sequence FROM agent_stream_events WHERE process_id = ?")
    .get(processId);
  return Number(row?.next_sequence ?? 1);
}
