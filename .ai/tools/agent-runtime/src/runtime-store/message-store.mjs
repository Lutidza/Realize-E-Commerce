/**
 * @file .ai/tools/agent-runtime/src/runtime-store/message-store.mjs
 * @version 0.1.0 - 2026-05-06 04:05
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Peer message and acknowledgement writer operations for the
 * local AI runtime store.
 *
 * Changes in version 0.1.0:
 * - Extracted message writes from the monolithic runtime store.
 */
import {
  MESSAGE_STATES,
  NOTIFICATION_PRIORITIES,
  VISIBILITIES,
  boolInt,
  enumValue,
  id,
  jsonText,
  optionalTimestamp,
  required,
  timestamp,
} from "../runtime-utils.mjs";
import { ensureAgentSessionFromWorkerSession } from "./agent-session-store.mjs";
import { actorSessionIdFromOptions } from "./common.mjs";
import { withRuntimeEvent } from "./event-log.mjs";
import {
  mapAgentMessageChannel,
  mapAgentMessageState,
} from "./mappers.mjs";

export function sendMessage(store, options) {
  const messageId = options["message-id"] ?? id("msg");
  const sourceSessionId = required(options, "source-session-id");
  const targetSessionId = required(options, "target-session-id");
  const messageType = options["message-type"] ?? "peer";
  const correlationId = options["correlation-id"] ?? null;
  const requiresAck = boolInt(options["requires-ack"] ?? "false");
  const state = enumValue(options.state ?? "queued", MESSAGE_STATES, "state");
  const createdAt = timestamp(options["created-at"]);
  const expiresAt = optionalTimestamp(options, "expires-at");
  const summary = required(options, "summary");
  const payloadJson = jsonText(options["payload-json"] ?? "{}", "payload-json", "object");
  const visibility = enumValue(options.visibility ?? "user-visible", VISIBILITIES, "visibility");
  const priority = enumValue(options.priority ?? "normal", NOTIFICATION_PRIORITIES, "priority");

  return withRuntimeEvent(store, {
    eventId: messageId,
    eventType: "message.created",
    aggregateType: "message",
    aggregateId: messageId,
    sessionId: sourceSessionId,
    actorSessionId: actorSessionIdFromOptions(options) ?? sourceSessionId,
    visibility,
    summary,
    payload: {
      source_session_id: sourceSessionId,
      target_session_id: targetSessionId,
      channel: mapAgentMessageChannel(messageType),
      state,
      correlation_id: correlationId,
      requires_ack: requiresAck === 1,
      payload: JSON.parse(payloadJson),
    },
    createdAt,
  }, (revision) => {
    store.database.prepare(`
      INSERT INTO worker_messages (
        message_id, source_session_id, target_session_id, message_type,
        correlation_id, requires_ack, state, created_at, expires_at,
        summary, payload_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      messageId,
      sourceSessionId,
      targetSessionId,
      messageType,
      correlationId,
      requiresAck,
      state,
      createdAt,
      expiresAt,
      summary,
      payloadJson,
    );

    ensureAgentSessionFromWorkerSession(store, sourceSessionId, revision, createdAt);
    ensureAgentSessionFromWorkerSession(store, targetSessionId, revision, createdAt);
    store.database.prepare(`
      INSERT INTO agent_messages (
        message_id, source_session_id, target_session_id, target_role, channel,
        state, priority, visibility, summary, payload_json, correlation_id,
        requires_ack, expires_at, created_at, delivered_at, acknowledged_at,
        last_revision
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      messageId,
      sourceSessionId,
      targetSessionId,
      options["target-role"] ?? null,
      mapAgentMessageChannel(messageType),
      mapAgentMessageState(state),
      priority,
      visibility,
      summary,
      payloadJson,
      correlationId,
      requiresAck,
      expiresAt,
      createdAt,
      state === "delivered" ? createdAt : null,
      ["acknowledged", "answered"].includes(state) ? createdAt : null,
      revision,
    );

    return messageId;
  });
}

export function ackMessage(store, options) {
  const ackId = options["ack-id"] ?? id("ack");
  const messageId = required(options, "message-id");
  const sessionId = required(options, "session-id");
  const state = enumValue(options.state ?? "acknowledged", MESSAGE_STATES, "state");
  assertMessageParticipant(store, messageId, sessionId);
  const createdAt = timestamp(options["created-at"]);
  const summary = options.summary ?? "";
  const payloadJson = jsonText(options["payload-json"] ?? "{}", "payload-json", "object");

  return withRuntimeEvent(store, {
    eventId: ackId,
    eventType: "message.acknowledged",
    aggregateType: "message",
    aggregateId: messageId,
    sessionId,
    actorSessionId: actorSessionIdFromOptions(options) ?? sessionId,
    visibility: "internal-summary",
    summary: summary || `Message ${messageId} acknowledged by ${sessionId}.`,
    payload: {
      ack_id: ackId,
      message_id: messageId,
      state,
    },
    createdAt,
  }, (revision) => {
    store.database.prepare(`
      INSERT INTO worker_message_acks (
        ack_id, message_id, session_id, ack_type, state, summary,
        payload_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      ackId,
      messageId,
      sessionId,
      options["ack-type"] ?? "ack",
      state,
      summary,
      payloadJson,
      createdAt,
    );
    store.database.prepare("UPDATE worker_messages SET state = ? WHERE message_id = ?").run(state, messageId);
    store.database.prepare(`
      UPDATE agent_messages
      SET state = ?,
          acknowledged_at = COALESCE(acknowledged_at, ?),
          last_revision = ?
      WHERE message_id = ?
    `).run(mapAgentMessageState(state), createdAt, revision, messageId);

    return ackId;
  });
}

export function assertMessageParticipant(store, messageId, sessionId) {
  const message = store.database
    .prepare("SELECT source_session_id, target_session_id FROM worker_messages WHERE message_id = ?")
    .get(messageId);
  if (!message) {
    throw new Error(`Message not found: ${messageId}`);
  }
  if (sessionId !== message.source_session_id && sessionId !== message.target_session_id) {
    throw new Error(`Session ${sessionId} is not a participant of message ${messageId}`);
  }
}
