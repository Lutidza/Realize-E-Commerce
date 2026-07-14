/**
 * @file .ai/tools/agent-runtime/src/runtime-store/job-policy.mjs
 * @version 0.1.0 - 2026-05-06 04:05
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Pure job status, lease, and result evidence policy helpers for
 * runtime store job writes.
 *
 * Changes in version 0.1.0:
 * - Extracted job policy helpers into a dedicated owner module.
 *
 * Changes in version 0.1.1:
 * - Removed the unsupported delegated backend from active worker jobs.
 */

export function isTerminalJobStatus(status) {
  return ["done", "succeeded", "failed", "blocked", "closed", "cancelled"].includes(status);
}

export function deriveLeaseStatus(status, previousLeaseStatus, assigneeSessionId) {
  if (isTerminalJobStatus(status)) {
    return "completed";
  }
  if (status === "running") {
    return assigneeSessionId ? "claimed" : "unassigned";
  }
  if (status === "planned" || status === "queued") {
    return assigneeSessionId ? "waiting" : "unassigned";
  }
  return previousLeaseStatus ?? "unassigned";
}

export function requiresExecutionHandle(executionBackend) {
  return isSupportedExecutionBackend(executionBackend);
}

export function isSupportedExecutionBackend(executionBackend) {
  return ["codex_exec", "external_worker", "delivery_worker"].includes(String(executionBackend ?? ""));
}

export function isEmptyResultJson(value) {
  if (value === undefined || value === null || value === "") {
    return true;
  }
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length === 0;
  } catch {
    return false;
  }
}
