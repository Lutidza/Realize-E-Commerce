/**
 * @file .ai/tools/agent-runtime/src/runtime-gateway/protocol.mjs
 * @version 0.1.1 - 2026-05-10 16:10
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Shared constants and small protocol helpers for the local AI
 * runtime gateway.
 *
 * Changes in version 0.1.1:
 * - Extracted gateway protocol constants from the monolithic gateway module.
 * - Added configurable polling ticks for runtime revision watcher.
 */
export const gatewaySchemaVersion = "1.0.0";
export const maxJsonBodyBytes = 1024 * 1024;
export const websocketGuid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
export const gatewayDefaultTickMs = 750;
export const gatewayMaxTickMs = 1000;

export function timestamp() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function createErrorPayload(message) {
  return {
    type: "error",
    schema_version: gatewaySchemaVersion,
    sent_at: timestamp(),
    message,
  };
}

export function requiredString(value, key) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Runtime gateway requires ${key}`);
  }
  return value;
}
