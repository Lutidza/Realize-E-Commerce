/**
 * @file .ai/tools/agent-runtime/src/runtime-store/operator-command-store.mjs
 * @version 0.1.0 - 2026-05-07 00:40
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Durable operator command queue/result writer for UI-initiated
 * runtime actions. It persists command intent before live gateway execution.
 *
 * Changes in version 0.1.0:
 * - Added operator command persistence and idempotency support for the live
 *   control-plane backend slice.
 */
import {
  enumValue,
  id,
  jsonText,
  optionalTimestamp,
  required,
  timestamp,
} from "../runtime-utils.mjs";
import { ensureAgentSessionFromWorkerSession } from "./agent-session-store.mjs";
import {
  insertRuntimeEvent as appendRuntimeEvent,
  withRuntimeEvent,
} from "./event-log.mjs";

const OPERATOR_COMMAND_STATUSES = new Set([
  "queued",
  "accepted",
  "running",
  "completed",
  "rejected",
  "failed",
  "cancelled",
]);

const terminalOperatorCommandStatuses = new Set([
  "completed",
  "rejected",
  "failed",
  "cancelled",
]);

export function createOperatorCommand(store, options) {
  const idempotencyKey = options["idempotency-key"] ?? null;
  const duplicate = commandByIdempotencyKey(store, idempotencyKey);
  if (duplicate) {
    return duplicate.operator_command_id;
  }

  const operatorCommandId = options["operator-command-id"] ?? id("opcmd");
  const actorSessionId = required(options, "actor-session-id");
  const targetSessionId = options["target-session-id"] ?? null;
  const commandType = required(options, "command-type");
  const status = enumValue(options.status ?? "queued", OPERATOR_COMMAND_STATUSES, "status");
  const requestJson = jsonText(options["request-json"] ?? "{}", "request-json", "object");
  const resultJson = jsonText(options["result-json"] ?? "{}", "result-json", "object");
  const errorJson = jsonText(options["error-json"] ?? "{}", "error-json", "object");
  const createdAt = timestamp(options["created-at"]);
  const processedAt = optionalTimestamp(options, "processed-at")
    ?? (terminalOperatorCommandStatuses.has(status) ? createdAt : null);

  store.database.exec("BEGIN IMMEDIATE");
  try {
    const duplicateInsideTransaction = commandByIdempotencyKey(store, idempotencyKey);
    if (duplicateInsideTransaction) {
      store.database.exec("COMMIT");
      return duplicateInsideTransaction.operator_command_id;
    }
    const revision = appendRuntimeEvent(store.database, {
      eventType: "operator_command.created",
      aggregateType: "operator_command",
      aggregateId: operatorCommandId,
      sessionId: targetSessionId,
      actorSessionId,
      visibility: "internal-summary",
      summary: options.summary ?? `Operator command ${operatorCommandId} queued.`,
      payload: {
        actor_session_id: actorSessionId,
        target_session_id: targetSessionId,
        command_type: commandType,
        status,
      },
      idempotencyKey,
      createdAt,
    });
    requireKnownAgentSession(store, actorSessionId, revision, createdAt, "actor-session-id");
    if (targetSessionId) {
      requireKnownAgentSession(store, targetSessionId, revision, createdAt, "target-session-id");
    }
    store.database.prepare(`
      INSERT INTO agent_operator_commands (
        operator_command_id, actor_session_id, target_session_id,
        command_type, status, request_json, result_json, error_json,
        idempotency_key, created_at, updated_at, processed_at, last_revision
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      operatorCommandId,
      actorSessionId,
      targetSessionId,
      commandType,
      status,
      requestJson,
      resultJson,
      errorJson,
      idempotencyKey,
      createdAt,
      createdAt,
      processedAt,
      revision,
    );

    store.database.exec("COMMIT");
    return operatorCommandId;
  } catch (error) {
    store.database.exec("ROLLBACK");
    throw error;
  }
}

export function updateOperatorCommand(store, options) {
  const operatorCommandId = required(options, "operator-command-id");
  const existing = operatorCommandById(store, operatorCommandId);
  if (!existing) {
    throw new Error(`Operator command not found: ${operatorCommandId}`);
  }

  const status = enumValue(required(options, "status"), OPERATOR_COMMAND_STATUSES, "status");
  const updatedAt = timestamp(options["updated-at"]);
  const resultJson = jsonText(options["result-json"] ?? existing.result_json ?? "{}", "result-json", "object");
  const errorJson = jsonText(options["error-json"] ?? existing.error_json ?? "{}", "error-json", "object");
  const processedAt = optionalTimestamp(options, "processed-at")
    ?? (terminalOperatorCommandStatuses.has(status) ? updatedAt : existing.processed_at);

  return withRuntimeEvent(store, {
    eventType: "operator_command.updated",
    aggregateType: "operator_command",
    aggregateId: operatorCommandId,
    sessionId: existing.target_session_id,
    actorSessionId: existing.actor_session_id,
    visibility: "internal-summary",
    summary: options.summary ?? `Operator command ${operatorCommandId} updated to ${status}.`,
    payload: {
      status,
      processed_at: processedAt,
    },
    createdAt: updatedAt,
  }, (revision) => {
    store.database.prepare(`
      UPDATE agent_operator_commands
      SET status = ?,
          result_json = ?,
          error_json = ?,
          updated_at = ?,
          processed_at = ?,
          last_revision = ?
      WHERE operator_command_id = ?
    `).run(
      status,
      resultJson,
      errorJson,
      updatedAt,
      processedAt,
      revision,
      operatorCommandId,
    );

    return operatorCommandId;
  });
}

export function operatorCommandById(store, operatorCommandId) {
  return store.database
    .prepare("SELECT * FROM agent_operator_commands WHERE operator_command_id = ?")
    .get(operatorCommandId);
}

export function operatorCommandByIdempotencyKey(store, idempotencyKey) {
  if (!idempotencyKey) {
    return null;
  }
  return store.database
    .prepare("SELECT operator_command_id FROM agent_operator_commands WHERE idempotency_key = ?")
    .get(idempotencyKey);
}

function commandByIdempotencyKey(store, idempotencyKey) {
  return operatorCommandByIdempotencyKey(store, idempotencyKey);
}

function requireKnownAgentSession(store, sessionId, revision, fallbackTimestamp, optionName) {
  if (!ensureAgentSessionFromWorkerSession(store, sessionId, revision, fallbackTimestamp)) {
    throw new Error(`operator-command-create references unknown --${optionName}: ${sessionId}`);
  }
}
