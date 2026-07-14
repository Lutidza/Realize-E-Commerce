/**
 * @file .ai/tools/agent-runtime/src/runtime-store/common.mjs
 * @version 0.1.0 - 2026-05-06 04:05
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Shared option and JSON parsing helpers for the local AI
 * runtime store writer modules.
 *
 * Changes in version 0.1.0:
 * - Extracted common runtime store helpers into a dedicated owner module.
 */

export function actorSessionIdFromOptions(options) {
  return options["actor-session-id"] ?? options["current-actor-session-id"] ?? null;
}

export function parseJsonList(value) {
  try {
    const parsed = JSON.parse(value ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseOptionalInteger(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid integer value: ${value}`);
  }
  return parsed;
}
