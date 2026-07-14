import { randomBytes } from "node:crypto";

export const STATUSES = new Set(["planned", "launched", "running", "result-ready", "needs-review", "blocked", "closed"]);
export const RESOLUTIONS = new Set(["accepted", "reassigned", "continued", "blocked-with-reason", "closed", "user-approved-deferral"]);
export const EVENT_TYPES = new Set(["status-update", "worker-message", "review-comment", "handoff", "blocker", "decision", "tool-summary", "artifact-reference"]);
export const VISIBILITIES = new Set(["user-visible", "internal-summary", "redacted"]);
export const PRESENCE_STATES = new Set(["working", "waiting", "idle", "stale", "offline"]);
export const MESSAGE_STATES = new Set(["queued", "delivered", "acknowledged", "answered", "expired", "failed"]);
export const NOTIFICATION_TYPES = new Set(["result_ready", "final_result", "blocked", "needs_review", "request_link", "request_worker", "scope_conflict", "handoff", "heartbeat_missed"]);
export const NOTIFICATION_PRIORITIES = new Set(["info", "normal", "high", "urgent"]);
export const NOTIFICATION_STATUSES = new Set(["unread", "acknowledged", "resolved", "dismissed"]);
export const JOB_LEASE_STATUSES = new Set(["unassigned", "claimed", "waiting", "released", "transferred", "blocked", "completed"]);
export const GROUP_STATUSES = new Set(["planned", "running", "needs-review", "blocked", "closing", "closed", "failed", "cancelled"]);
export const GROUP_ACCEPTANCE_STATUSES = new Set(["pending", "review-ready", "accepted", "rejected", "blocked"]);
export const GROUP_MEMBER_STATUSES = new Set(["planned", "active", "result-ready", "needs-review", "blocked", "closed", "removed"]);
export const GROUP_EDGE_TYPES = new Set(["peer", "depends_on", "handoff", "review", "result_return", "closure"]);
export const GROUP_EDGE_STATES = new Set(["active", "satisfied", "blocked", "closed"]);
export const GROUP_ACCEPTANCE_EVIDENCE_TYPES = new Set(["result_ready", "review", "audit", "acceptance", "revision_request", "blocker"]);
export const GROUP_ACCEPTANCE_EVIDENCE_STATUSES = new Set(["recorded", "accepted", "rejected", "blocked"]);

export function required(options, key) {
  const value = options[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required option --${key}`);
  }
  return value;
}

export function enumValue(value, allowed, key) {
  if (!allowed.has(value)) {
    throw new Error(`Invalid ${key}: ${value}. Allowed: ${[...allowed].join(", ")}`);
  }
  return value;
}

export function jsonText(value, key, expected = "any") {
  try {
    const parsed = JSON.parse(value);
    if (expected === "object" && (parsed === null || Array.isArray(parsed) || typeof parsed !== "object")) {
      throw new Error("must be a JSON object");
    }
    if (expected === "list" && !Array.isArray(parsed)) {
      throw new Error("must be a JSON list");
    }
    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error(`Invalid JSON in --${key}: ${error.message}`);
  }
}

export function jsonObject(value, key) {
  const text = jsonText(value, key, "object");
  return JSON.parse(text);
}

export function jsonList(value, key) {
  const text = jsonText(value, key, "list");
  return JSON.parse(text);
}

export function boolInt(value) {
  switch (String(value).toLowerCase()) {
    case "1":
    case "true":
    case "yes":
    case "on":
      return 1;
    case "0":
    case "false":
    case "no":
    case "off":
      return 0;
    default:
      throw new Error(`Invalid boolean value: ${value}`);
  }
}

export function timestamp(value = null) {
  if (value === null || value === undefined || value === "") {
    return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  }
  const time = Date.parse(value);
  if (Number.isNaN(time)) {
    throw new Error(`Invalid ISO-8601 timestamp: ${value}`);
  }
  return new Date(time).toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function optionalTimestamp(options, key) {
  if (!Object.hasOwn(options, key) || String(options[key]).trim() === "") {
    return null;
  }
  return timestamp(options[key]);
}

export function requireRuntimeOperatorActor(options, command) {
  const actorRole = String(options["actor-role"] ?? "").toLowerCase();
  const actorSessionId = options["actor-session-id"] ?? "";
  if (actorRole !== "dialog_assistant" && actorRole !== "runtime_operator" && actorSessionId !== "dialog-assistant") {
    throw new Error(`${command} requires --actor-role=dialog_assistant|runtime_operator or --actor-session-id=dialog-assistant`);
  }
}

export function id(prefix) {
  const compact = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return `${prefix}_${compact}_${randomBytes(6).toString("hex")}`;
}

export function safeFilename(value) {
  const filename = value.replace(/[^A-Za-z0-9._-]/g, "-");
  if (filename === "" || filename === "." || filename === "..") {
    throw new Error(`Value cannot be used as a projection filename: ${value}`);
  }
  return filename;
}

export function parseOptions(tokens) {
  const options = {};
  for (const token of tokens) {
    if (!token.startsWith("--")) {
      throw new Error(`Invalid argument: ${token}. Use --key=value.`);
    }
    const pair = token.slice(2);
    const index = pair.indexOf("=");
    if (index === -1) {
      throw new Error(`Invalid option: ${token}. Use --key=value.`);
    }
    options[pair.slice(0, index)] = pair.slice(index + 1);
  }
  return options;
}
