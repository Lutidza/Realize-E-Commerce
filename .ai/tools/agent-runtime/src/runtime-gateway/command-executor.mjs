/**
 * @file .ai/tools/agent-runtime/src/runtime-gateway/command-executor.mjs
 * @version 0.2.1 - 2026-05-10 16:10
 * @docref DOC-SYSTEM-SPEC-032
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @description Executes gateway command requests through the shared runtime
 * command dispatcher and broadcasts committed deltas for write commands.
 *
 * Changes in version 0.2.1:
 * - Routed write-command delta broadcasts through Socket.IO gateway clients.
 * - Added revision-tracker update to prevent duplicate deltas when gateway
 *   local polling watcher runs concurrently.
 */
import {
  executeRuntimeStoreCommand,
  isRuntimeWriteCommand,
} from "../runtime-commands.mjs";
import { gatewaySchemaVersion, requiredString, timestamp } from "./protocol.mjs";
import { currentRevision } from "./snapshot-reader.mjs";
import { broadcastDelta } from "./socket-io-server.mjs";

export function executeGatewayCommand({
  body,
  database,
  store,
  clients,
  commandResults,
  revisionTracker,
}) {
  const command = requiredString(body.command, "command");
  const options = readOptionsObject(body.options);
  const isWriteCommand = isRuntimeWriteCommand(command);
  const commandId = body.command_id ?? body.idempotency_key ?? null;

  if (isWriteCommand && !commandId) {
    throw new Error("Runtime gateway write command requires command_id");
  }

  if (commandId && commandResults.has(commandId)) {
    return {
      ...commandResults.get(commandId),
      deduplicated: true,
    };
  }

  const beforeRevision = currentRevision(database);
  const lines = executeRuntimeStoreCommand(store, command, options);
  const afterRevision = currentRevision(database);
  const result = {
    type: "command_result",
    schema_version: gatewaySchemaVersion,
    sent_at: timestamp(),
    command,
    command_id: commandId,
    before_revision: beforeRevision,
    after_revision: afterRevision,
    lines,
    write: isWriteCommand,
  };

  if (commandId) {
    commandResults.set(commandId, result);
  }

  if (isWriteCommand && afterRevision > beforeRevision) {
    if (revisionTracker) {
      revisionTracker.currentRevision = afterRevision;
    }

    broadcastDelta({
      clients,
      database,
      fromRevision: beforeRevision,
      toRevision: afterRevision,
    });
  }

  return result;
}

function readOptionsObject(value) {
  if (value === undefined || value === null) {
    return {};
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Runtime gateway command options must be an object");
  }
  return Object.fromEntries(Object.entries(value).map(([key, optionValue]) => [
    key,
    typeof optionValue === "string" ? optionValue : JSON.stringify(optionValue),
  ]));
}
