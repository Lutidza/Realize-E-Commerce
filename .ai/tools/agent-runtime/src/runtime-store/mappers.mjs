/**
 * @file .ai/tools/agent-runtime/src/runtime-store/mappers.mjs
 * @version 0.1.0 - 2026-05-06 04:05
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Pure mapping helpers between legacy worker_* values and the
 * normalized agent_* runtime schema.
 *
 * Changes in version 0.1.0:
 * - Extracted worker-to-agent value mappings into a dedicated owner module.
 */

export function mapAgentSessionKind(workerKind) {
  switch (String(workerKind ?? "")) {
    case "controller":
    case "dialog_assistant":
      return "controller";
    case "reviewer":
      return "reviewer";
    case "tool":
      return "tool";
    default:
      return "worker";
  }
}

export function mapAgentLifecycleStatus(status) {
  switch (status) {
    case "planned":
      return "planned";
    case "launched":
      return "starting";
    case "running":
      return "running";
    case "result-ready":
      return "result_ready";
    case "needs-review":
      return "needs_review";
    case "blocked":
      return "blocked";
    case "closed":
      return "closed";
    default:
      return "planned";
  }
}

export function mapAgentResolution(resolution) {
  switch (resolution) {
    case "accepted":
      return "accepted";
    case "reassigned":
      return "reassigned";
    case "continued":
      return "continued";
    case "blocked-with-reason":
      return "blocked";
    case "closed":
      return "completed";
    case "user-approved-deferral":
      return "user_deferred";
    default:
      return null;
  }
}

export function mapAgentPresenceState(state) {
  return state === "offline" || state === "working" || state === "idle" || state === "waiting" || state === "stale"
    ? state
    : "offline";
}

export function mapAgentMessageChannel(messageType) {
  switch (String(messageType ?? "")) {
    case "handoff":
      return "handoff";
    case "result":
      return "result";
    case "system":
      return "system";
    case "operator":
      return "operator";
    default:
      return "peer";
  }
}

export function mapAgentMessageState(state) {
  switch (state) {
    case "queued":
    case "delivered":
    case "acknowledged":
    case "answered":
    case "expired":
    case "failed":
      return state;
    default:
      return "queued";
  }
}

export function mapAgentJobStatus(status) {
  if (["done", "succeeded", "closed"].includes(status)) {
    return "completed";
  }
  if (status === "failed") {
    return "failed";
  }
  if (status === "cancelled") {
    return "cancelled";
  }
  if (status === "blocked") {
    return "blocked";
  }
  if (status === "running") {
    return "running";
  }
  if (status === "waiting") {
    return "waiting";
  }
  return "queued";
}

export function mapAgentLeaseStatus(status) {
  switch (status) {
    case "unassigned":
    case "waiting":
    case "claimed":
    case "released":
    case "transferred":
    case "blocked":
    case "completed":
      return status;
    default:
      return "unassigned";
  }
}
