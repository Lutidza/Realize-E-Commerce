/**
 * @file .ai/tools/agent-runtime/src/runtime-store/maintenance-store.mjs
 * @version 0.1.0 - 2026-05-06 04:05
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Active rows report and retention cleanup operations for the
 * local AI runtime store.
 *
 * Changes in version 0.1.0:
 * - Extracted maintenance operations from the monolithic runtime store.
 */
import {
  boolInt,
  optionalTimestamp,
  requireRuntimeOperatorActor,
  timestamp,
} from "../runtime-utils.mjs";

const MONITOR_HEARTBEAT_STALE_AFTER_SECONDS = 120;
const DEFAULT_EXPECTED_GATEWAY_URL = "http://127.0.0.1:8765/";
const DEFAULT_EXPECTED_MONITOR_URL = "http://127.0.0.1:5173/";

export function activeRowsReport(store, options) {
  requireRuntimeOperatorActor(options, "active-rows-report");
  const heartbeat = latestMonitorHeartbeat(store, options.now);
  const report = {
    generated_at: timestamp(options.now),
    active_sessions: scalarCount(store, "SELECT COUNT(*) FROM worker_sessions WHERE status IN ('planned', 'launched', 'running', 'result-ready', 'needs-review', 'blocked')"),
    unresolved_sessions: scalarCount(store, "SELECT COUNT(*) FROM worker_sessions WHERE status IN ('running', 'result-ready', 'needs-review', 'blocked')"),
    working_presence: scalarCount(store, "SELECT COUNT(*) FROM worker_presence WHERE presence_state = 'working'"),
    stale_presence: scalarCount(store, "SELECT COUNT(*) FROM worker_presence WHERE presence_state = 'stale'"),
    unread_or_blocking_notifications: scalarCount(store, `
      SELECT COUNT(*) FROM worker_notifications
      WHERE status IN ('unread', 'acknowledged')
        AND (
          priority IN ('high', 'urgent')
          OR notification_type IN ('result_ready', 'final_result', 'blocked', 'needs_review', 'scope_conflict', 'handoff')
        )
    `),
    blocking_peer_messages: scalarCount(store, "SELECT COUNT(*) FROM worker_messages WHERE requires_ack = 1 AND state IN ('queued', 'delivered')"),
    closed_sessions_retained: scalarCount(store, "SELECT COUNT(*) FROM worker_sessions WHERE status = 'closed'"),
    active_worker_groups: scalarCount(store, "SELECT COUNT(*) FROM worker_groups WHERE status IN ('planned', 'running', 'needs-review', 'blocked', 'closing')"),
    unresolved_worker_groups: scalarCount(store, "SELECT COUNT(*) FROM worker_groups WHERE status IN ('running', 'needs-review', 'blocked', 'closing')"),
    worker_groups_without_closure_chain: scalarCount(store, `
      SELECT COUNT(*) FROM worker_groups
      WHERE status <> 'closed'
        AND (
          returns_to_session_id IS NULL
          OR group_closer_session_id IS NULL
        )
    `),
    accepted_worker_groups_without_evidence: scalarCount(store, `
      SELECT COUNT(*) FROM worker_groups
      WHERE status = 'closed'
        AND acceptance_status = 'accepted'
        AND NOT EXISTS (
          SELECT 1
          FROM worker_group_acceptance_evidence evidence
          WHERE evidence.group_id = worker_groups.group_id
            AND evidence.evidence_status = 'accepted'
        )
    `),
    expired_messages_retained: scalarCount(store, "SELECT COUNT(*) FROM worker_messages WHERE state = 'expired'"),
    resolved_notifications_retained: scalarCount(store, "SELECT COUNT(*) FROM worker_notifications WHERE status IN ('resolved', 'dismissed')"),
    legacy_terminal_jobs_without_actor_evidence: scalarCount(store, `
        SELECT COUNT(*) FROM worker_jobs
        WHERE status IN ('done', 'succeeded', 'failed', 'blocked', 'closed', 'cancelled')
          AND lease_status = 'completed'
          AND COALESCE(result_json, '{}') <> '{}'
          AND (
            current_actor_session_id IS NULL
            OR execution_backend IS NULL
            OR execution_handle IS NULL
        )
    `),
    monitor_heartbeat_last_at: heartbeat.last_heartbeat_at,
    monitor_heartbeat_age_seconds: heartbeat.age_seconds,
    monitor_heartbeat_fresh: heartbeat.freshness === "fresh",
    monitor_heartbeat_freshness: heartbeat.freshness,
    monitor_heartbeat_source: heartbeat.source,
    monitor_heartbeat_interval_ms: heartbeat.interval_ms,
    monitor_heartbeat_stale_after_seconds: heartbeat.stale_after_seconds,
    monitor_heartbeat_expected_gateway_url: heartbeat.expected_gateway_url,
    monitor_heartbeat_expected_monitor_url: heartbeat.expected_monitor_url,
    monitor_heartbeat_gateway_url: heartbeat.gateway_url,
    monitor_heartbeat_monitor_url: heartbeat.monitor_url,
    monitor_heartbeat_monitor_url_matches_expected: heartbeat.monitor_url_matches_expected,
    monitor_heartbeat_gateway_url_matches_expected: heartbeat.gateway_url_matches_expected,
    monitor_heartbeat_expected_url_mismatch: heartbeat.expected_url_mismatch,
  };
  return JSON.stringify(report);
}

export function cleanupRetention(store, options) {
  requireRuntimeOperatorActor(options, "retention-cleanup");
  const now = timestamp(options.now);
  const dryRun = boolInt(options["dry-run"] ?? "false") === 1;
  const summary = {
    dry_run: dryRun,
    now,
    stale_presence_marked: 0,
    expired_messages_marked: 0,
    expired_messages_deleted: 0,
    resolved_notifications_deleted: 0,
    stale_presence_deleted: 0,
    closed_sessions_deleted: 0,
    monitor_heartbeat_events_deleted: 0,
  };

  store.database.exec("BEGIN");
  try {
    summary.stale_presence_marked = executeCount(
      store,
      `UPDATE worker_presence
       SET presence_state = 'stale', updated_at = ?
       WHERE lease_expires_at IS NOT NULL
         AND lease_expires_at <= ?
         AND presence_state NOT IN ('stale', 'offline')`,
      [now, now],
    );
    summary.expired_messages_marked = executeCount(
      store,
      `UPDATE worker_messages
       SET state = 'expired'
       WHERE expires_at IS NOT NULL
         AND expires_at <= ?
         AND state IN ('queued', 'delivered')`,
      [now],
    );

    const expiredMessageBefore = optionalTimestamp(options, "expired-message-before");
    if (expiredMessageBefore !== null) {
      summary.expired_messages_deleted = executeCount(
        store,
        `DELETE FROM worker_messages
         WHERE state = 'expired'
           AND ((expires_at IS NOT NULL AND expires_at <= ?) OR created_at <= ?)`,
        [expiredMessageBefore, expiredMessageBefore],
      );
    }

    const resolvedNotificationBefore = optionalTimestamp(options, "resolved-notification-before");
    if (resolvedNotificationBefore !== null) {
      summary.resolved_notifications_deleted = executeCount(
        store,
        `DELETE FROM worker_notifications
         WHERE status IN ('resolved', 'dismissed')
           AND COALESCE(resolved_at, acknowledged_at, created_at) <= ?`,
        [resolvedNotificationBefore],
      );
    }

    const stalePresenceBefore = optionalTimestamp(options, "stale-presence-before");
    if (stalePresenceBefore !== null) {
      summary.stale_presence_deleted = executeCount(
        store,
        `DELETE FROM worker_presence
         WHERE presence_state IN ('stale', 'offline') AND updated_at <= ?`,
        [stalePresenceBefore],
      );
    }

    const closedBefore = optionalTimestamp(options, "closed-before");
    if (closedBefore !== null) {
      summary.closed_sessions_deleted = executeCount(
        store,
        "DELETE FROM worker_sessions WHERE status = 'closed' AND closed_at IS NOT NULL AND closed_at <= ?",
        [closedBefore],
      );
    }

    const monitorHeartbeatBefore = optionalTimestamp(options, "monitor-heartbeat-before");
    if (monitorHeartbeatBefore !== null) {
      summary.monitor_heartbeat_events_deleted = executeCount(
        store,
        "DELETE FROM runtime_events WHERE event_type = 'monitor.heartbeat' AND created_at <= ?",
        [monitorHeartbeatBefore],
      );
    }

    store.database.exec(dryRun ? "ROLLBACK" : "COMMIT");
  } catch (error) {
    store.database.exec("ROLLBACK");
    throw error;
  }

  return JSON.stringify(summary);
}

export function executeCount(store, sql, values = []) {
  return store.database.prepare(sql).run(...values).changes;
}

export function scalarCount(store, sql) {
  const row = store.database.prepare(sql).get();
  const value = Object.values(row ?? {})[0];
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function latestMonitorHeartbeat(store, now = null) {
  try {
    const heartbeatRow = store.database.prepare(`
      SELECT event_id, created_at, payload_json
      FROM runtime_events
      WHERE event_type = 'monitor.heartbeat'
      ORDER BY revision DESC
      LIMIT 1
    `).get();

    if (!heartbeatRow) {
      return {
        last_heartbeat_at: null,
        age_seconds: null,
        freshness: "absent",
        source: "agent-monitor",
        interval_ms: null,
        stale_after_seconds: MONITOR_HEARTBEAT_STALE_AFTER_SECONDS,
        expected_gateway_url: DEFAULT_EXPECTED_GATEWAY_URL,
        expected_monitor_url: DEFAULT_EXPECTED_MONITOR_URL,
        gateway_url: null,
        monitor_url: null,
        gateway_url_matches_expected: false,
        monitor_url_matches_expected: false,
        expected_url_mismatch: false,
      };
    }

    const payload = parseJsonObject(heartbeatRow.payload_json);
    const createdAt = normalizeIsoDate(typeof heartbeatRow.created_at === "string" ? heartbeatRow.created_at : null);
    const rawPayloadAt = typeof payload.client_sent_at === "string"
      ? payload.client_sent_at
      : null;
    const lastHeartbeatAt = normalizeIsoDate(rawPayloadAt) ?? createdAt;
    const nowMs = Date.parse(timestamp(now));
    const lastMs = Date.parse(lastHeartbeatAt ?? "");
    const age = Number.isFinite(lastMs) && Number.isFinite(nowMs)
      ? Math.max(0, Math.floor((nowMs - lastMs) / 1000))
      : null;
    const staleAfterSeconds = normalizePositiveInteger(
      payload?.heartbeat_stale_after_seconds,
      MONITOR_HEARTBEAT_STALE_AFTER_SECONDS,
    );
    const gatewayUrl = normalizeString(payload.gateway_url);
    const monitorUrl = normalizeString(payload.monitor_url);
    const gatewayUrlMatchesExpected = coerceBoolean(
      payload.gateway_url_matches_expected,
      gatewayUrl !== null && gatewayUrl === DEFAULT_EXPECTED_GATEWAY_URL,
    );
    const monitorUrlMatchesExpected = coerceBoolean(
      payload.monitor_url_matches_expected,
      monitorUrl !== null && monitorUrl === DEFAULT_EXPECTED_MONITOR_URL,
    );
    const expectedUrlMismatch = coerceBoolean(
      payload.expected_url_mismatch,
      !gatewayUrlMatchesExpected || !monitorUrlMatchesExpected,
    );

    return {
      last_heartbeat_at: lastHeartbeatAt,
      age_seconds: age,
      freshness: heartbeatFreshness(age, staleAfterSeconds),
      stale_after_seconds: staleAfterSeconds,
      source: normalizeString(payload.source) ?? "agent-monitor",
      interval_ms: Number.isFinite(payload?.heartbeat_interval_ms)
        ? Number(payload.heartbeat_interval_ms)
        : null,
      gateway_url: gatewayUrl,
      monitor_url: monitorUrl,
      gateway_url_matches_expected: gatewayUrlMatchesExpected,
      monitor_url_matches_expected: monitorUrlMatchesExpected,
      expected_url_mismatch: expectedUrlMismatch,
      expected_gateway_url: normalizeString(payload.expected_gateway_url)
        ?? DEFAULT_EXPECTED_GATEWAY_URL,
      expected_monitor_url: normalizeString(payload.expected_monitor_url)
        ?? DEFAULT_EXPECTED_MONITOR_URL,
    };
  } catch {
    return {
      last_heartbeat_at: null,
      age_seconds: null,
      freshness: "unknown",
      source: "agent-monitor",
      interval_ms: null,
      stale_after_seconds: MONITOR_HEARTBEAT_STALE_AFTER_SECONDS,
      expected_gateway_url: DEFAULT_EXPECTED_GATEWAY_URL,
      expected_monitor_url: DEFAULT_EXPECTED_MONITOR_URL,
      gateway_url: null,
      monitor_url: null,
      gateway_url_matches_expected: false,
      monitor_url_matches_expected: false,
      expected_url_mismatch: false,
    };
  }
}

function heartbeatFreshness(ageSeconds, staleAfterSeconds = MONITOR_HEARTBEAT_STALE_AFTER_SECONDS) {
  if (!Number.isInteger(ageSeconds) || ageSeconds < 0) {
    return "unknown";
  }
  const staleThreshold = Number.isFinite(staleAfterSeconds) ? staleAfterSeconds : MONITOR_HEARTBEAT_STALE_AFTER_SECONDS;
  return ageSeconds <= staleThreshold ? "fresh" : "stale";
}

function normalizePositiveInteger(value, fallback = 0) {
  if (!Number.isFinite(Number(value))) {
    return fallback;
  }
  const integerValue = Math.floor(Number(value));
  return integerValue > 0 ? integerValue : fallback;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function coerceBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === 0 || value === 1) {
    return value === 1;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
  }
  return fallback;
}

function normalizeIsoDate(value) {
  if (typeof value !== "string") {
    return null;
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return new Date(parsed).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function parseJsonObject(value) {
  try {
    const parsed = JSON.parse(value ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}
