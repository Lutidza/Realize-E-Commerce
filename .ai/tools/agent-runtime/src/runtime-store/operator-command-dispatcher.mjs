/**
 * @file .ai/tools/agent-runtime/src/runtime-store/operator-command-dispatcher.mjs
 * @version 0.1.1 - 2026-05-10 16:10
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description High-level operator command dispatcher for UI/runtime actions.
 * It validates supported commands, persists operator intent, writes worker
 * message traces, and applies only lifecycle transitions that are executable
 * by the runtime store without pretending to control an external process.
 *
 * Changes in version 0.1.1:
 * - Added P0 operator command dispatch for ping, request_status, send_message,
 *   stop, accept_result, and request_worker.
 */
import {
  jsonObject,
  required,
} from "../runtime-utils.mjs";
import {
  createOperatorCommand,
  operatorCommandById,
  operatorCommandByIdempotencyKey,
  updateOperatorCommand,
} from "./operator-command-store.mjs";
import {
  createNotification,
} from "./notification-store.mjs";

const operatorCommandTypes = new Set([
  "ping",
  "request_status",
  "send_message",
  "stop",
  "accept_result",
  "request_worker",
]);

const acceptResultStatuses = new Set([
  "result-ready",
  "needs-review",
  "blocked",
]);

export function dispatchOperatorCommand(store, options) {
  const commandType = readCommandType(options);
  const idempotencyKey = options["idempotency-key"] ?? null;
  const existingCommand = operatorCommandByIdempotencyKey(store, idempotencyKey);
  if (existingCommand) {
    return createDispatchResult(store, existingCommand.operator_command_id, {
      deduplicated: true,
    });
  }

  const actorSessionId = required(options, "actor-session-id");
  const targetSessionId = required(options, "target-session-id");
  const request = jsonObject(options["request-json"] ?? "{}", "request-json");
  const operatorCommandId = createOperatorCommand(store, {
    ...options,
    "actor-session-id": actorSessionId,
    "target-session-id": targetSessionId,
    "command-type": commandType,
    "request-json": JSON.stringify(request),
    status: "accepted",
    summary: options.summary ?? `Operator command ${commandType} accepted for ${targetSessionId}.`,
  });

  try {
    return dispatchAcceptedCommand(store, {
      actorSessionId,
      commandType,
      operatorCommandId,
      options,
      request,
      targetSessionId,
    });
  } catch (error) {
    updateOperatorCommand(store, {
      "operator-command-id": operatorCommandId,
      status: "failed",
      "error-json": JSON.stringify({
        message: error instanceof Error ? error.message : "Operator command dispatch failed",
      }),
    });
    throw error;
  }
}

function dispatchAcceptedCommand(store, args) {
  switch (args.commandType) {
    case "ping":
      return completeWithResult(store, args, {
        target_session: readTargetSession(store, args.targetSessionId),
        target_presence: readTargetPresence(store, args.targetSessionId),
      });
    case "request_status":
      return dispatchMessageCommand(store, args, {
        defaultSummary: "Operator requested worker status.",
        messageType: "operator",
        requiresAck: true,
      });
    case "send_message":
      return dispatchMessageCommand(store, args, {
        defaultSummary: readMessageText(args),
        messageType: "operator",
        requiresAck: true,
      });
    case "stop":
      return dispatchStopRequest(store, args);
    case "accept_result":
      return dispatchAcceptResult(store, args);
    case "request_worker":
      return dispatchRequestWorker(store, args);
    default:
      throw new Error(`Unsupported operator command: ${args.commandType}`);
  }
}

function dispatchMessageCommand(store, args, messageOptions) {
  const messageId = store.sendMessage({
    "actor-session-id": args.actorSessionId,
    "source-session-id": args.actorSessionId,
    "target-session-id": args.targetSessionId,
    "message-type": messageOptions.messageType,
    "correlation-id": args.operatorCommandId,
    "requires-ack": String(messageOptions.requiresAck),
    state: "delivered",
    summary: args.options.summary ?? messageOptions.defaultSummary,
    "payload-json": JSON.stringify({
      operator_command_id: args.operatorCommandId,
      command_type: args.commandType,
      request: args.request,
    }),
  });

  updateOperatorCommand(store, {
    "operator-command-id": args.operatorCommandId,
    status: "completed",
    "result-json": JSON.stringify({
      message_id: messageId,
      message_state: "delivered",
    }),
  });

  return createDispatchResult(store, args.operatorCommandId, {
    message_id: messageId,
  });
}

function dispatchStopRequest(store, args) {
  const messageId = store.sendMessage({
    "actor-session-id": args.actorSessionId,
    "source-session-id": args.actorSessionId,
    "target-session-id": args.targetSessionId,
    "message-type": "operator",
    "correlation-id": args.operatorCommandId,
    "requires-ack": "true",
    state: "delivered",
    priority: "high",
    summary: args.options.summary ?? "Operator requested worker stop.",
    "payload-json": JSON.stringify({
      operator_command_id: args.operatorCommandId,
      command_type: args.commandType,
      request: args.request,
      process_stop_executed: false,
      reason: "Process termination is owned by the future process manager.",
    }),
  });

  updateOperatorCommand(store, {
    "operator-command-id": args.operatorCommandId,
    status: "accepted",
    "result-json": JSON.stringify({
      message_id: messageId,
      process_stop_executed: false,
    }),
  });

  return createDispatchResult(store, args.operatorCommandId, {
    message_id: messageId,
    process_stop_executed: false,
  });
}

function dispatchAcceptResult(store, args) {
  const session = readTargetSession(store, args.targetSessionId);
  if (!acceptResultStatuses.has(session.status)) {
    throw new Error(`accept_result requires target session status result-ready, needs-review, or blocked: ${args.targetSessionId}`);
  }

  store.upsertSession({
    "actor-session-id": args.actorSessionId,
    "session-id": session.session_id,
    "worker-kind": session.worker_kind,
    role: session.role,
    status: "closed",
    resolution: "accepted",
    mission: session.mission ?? "",
    "assigned-by": session.assigned_by ?? args.actorSessionId,
    "allowed-paths-json": session.allowed_paths_json ?? "[]",
    "forbidden-paths-json": session.forbidden_paths_json ?? "[]",
    "metadata-json": session.metadata_json ?? "{}",
    "messages-path": session.messages_path ?? undefined,
    "result-path": session.result_path ?? undefined,
    "history-path": session.history_path ?? undefined,
  });
  store.setPresence({
    "actor-session-id": args.actorSessionId,
    "session-id": session.session_id,
    "presence-state": "offline",
    "current-activity": "Accepted by operator command",
  });
  store.resolveNotificationsForSession(session.session_id, {
    "actor-session-id": args.actorSessionId,
  });

  return completeWithResult(store, args, {
    session_id: session.session_id,
    resolution: "accepted",
  });
}

function dispatchRequestWorker(store, args) {
  const role = readRequestField(args.request, "role");
  const mission = readRequestField(args.request, "mission");
  const model = readRequestField(args.request, "model");
  const allowedPaths = readRequestAllowedPaths(args.request);
  const messageId = store.sendMessage({
    "actor-session-id": args.actorSessionId,
    "source-session-id": args.actorSessionId,
    "target-session-id": "dialog-assistant",
    "message-type": "operator",
    "correlation-id": args.operatorCommandId,
    "requires-ack": "false",
    state: "delivered",
    summary: `Worker request for role "${role}"`,
    "payload-json": JSON.stringify({
      operator_command_id: args.operatorCommandId,
      command_type: args.commandType,
      request: {
        role,
        mission,
        model,
        allowed_paths: allowedPaths,
      },
      target_session_id: args.targetSessionId,
    }),
  });

  const notificationId = createNotification(store, {
    "source-session-id": args.actorSessionId,
    "actor-session-id": args.actorSessionId,
    "target-role": "dialog_assistant",
    "target-session-id": args.targetSessionId,
    "notification-type": "request_worker",
    priority: "high",
    status: "unread",
    summary: `Worker request for ${role} session ${args.targetSessionId}`,
    "payload-json": JSON.stringify({
      operator_command_id: args.operatorCommandId,
      role,
      mission,
      model,
      allowed_paths: allowedPaths,
      target_session_id: args.targetSessionId,
    }),
    "correlation-id": args.operatorCommandId,
  });

  updateOperatorCommand(store, {
    "operator-command-id": args.operatorCommandId,
    status: "completed",
    "result-json": JSON.stringify({
      message_id: messageId,
      notification_id: notificationId,
      notification_type: "request_worker",
    }),
  });

  return createDispatchResult(store, args.operatorCommandId, {
    message_id: messageId,
    notification_id: notificationId,
  });
}

function completeWithResult(store, args, result) {
  updateOperatorCommand(store, {
    "operator-command-id": args.operatorCommandId,
    status: "completed",
    "result-json": JSON.stringify(result),
  });

  return createDispatchResult(store, args.operatorCommandId, result);
}

function createDispatchResult(store, operatorCommandId, extra = {}) {
  return {
    operator_command_id: operatorCommandId,
    command: operatorCommandById(store, operatorCommandId),
    ...extra,
  };
}

function readCommandType(options) {
  const commandType = required(options, "command-type");
  if (!operatorCommandTypes.has(commandType)) {
    throw new Error(`Unsupported operator command type: ${commandType}. Allowed: ${[...operatorCommandTypes].join(", ")}`);
  }
  return commandType;
}

function readTargetSession(store, sessionId) {
  const session = store.database
    .prepare("SELECT * FROM worker_sessions WHERE session_id = ?")
    .get(sessionId);
  if (!session) {
    throw new Error(`Target session not found: ${sessionId}`);
  }
  return session;
}

function readRequestAllowedPaths(request) {
  const requestValue = request.allowed_paths;
  if (!Array.isArray(requestValue) || requestValue.length === 0) {
    throw new Error("request_worker requires request_json.allowed_paths");
  }

  if (!requestValue.every((value) => typeof value === "string")) {
    throw new Error("request_worker requires request_json.allowed_paths to be an array of strings");
  }

  return requestValue;
}

function readTargetPresence(store, sessionId) {
  return store.database
    .prepare("SELECT * FROM worker_presence WHERE session_id = ?")
    .get(sessionId) ?? null;
}

function readMessageText(args) {
  const messageText = args.options["message-text"] ?? args.request.message_text ?? args.request.text;
  if (typeof messageText !== "string" || messageText.trim() === "") {
    throw new Error("send_message requires --message-text or request_json.message_text");
  }
  return messageText;
}

function readRequestField(request, key) {
  const value = request[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`request_worker requires request_json.${key}`);
  }

  return value;
}
