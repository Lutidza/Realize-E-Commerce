/**
 * @file .ai/tools/agent-runtime/src/runtime-store/notification-store.mjs
 * @version 0.1.0 - 2026-05-06 04:05
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Notification writer, resolver, and actor guard operations for
 * the local AI runtime store.
 *
 * Changes in version 0.1.0:
 * - Extracted notification writes from the monolithic runtime store.
 */
import {
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TYPES,
  enumValue,
  id,
  jsonText,
  optionalTimestamp,
  requireRuntimeOperatorActor,
  required,
  timestamp,
} from "../runtime-utils.mjs";
import { ensureAgentSessionFromWorkerSession } from "./agent-session-store.mjs";
import { actorSessionIdFromOptions } from "./common.mjs";
import { withRuntimeEvent } from "./event-log.mjs";

export function createNotification(store, options) {
  const notificationId = options["notification-id"] ?? id("ntf");
  assertNotificationActor(options);
  const sourceSessionId = required(options, "source-session-id");
  const targetRole = required(options, "target-role");
  const notificationType = enumValue(required(options, "notification-type"), NOTIFICATION_TYPES, "notification-type");
  const priority = enumValue(options.priority ?? "normal", NOTIFICATION_PRIORITIES, "priority");
  const status = enumValue(options.status ?? "unread", NOTIFICATION_STATUSES, "status");
  const createdAt = timestamp(options["created-at"]);
  const acknowledgedAt = optionalTimestamp(options, "acknowledged-at");
  const resolvedAt = optionalTimestamp(options, "resolved-at");
  const summary = required(options, "summary");
  const payloadJson = jsonText(options["payload-json"] ?? "{}", "payload-json", "object");
  const correlationId = options["correlation-id"] ?? null;
  const targetSessionId = options["target-session-id"] ?? null;

  return withRuntimeEvent(store, {
    eventId: notificationId,
    eventType: "notification.created",
    aggregateType: "notification",
    aggregateId: notificationId,
    sessionId: sourceSessionId,
    actorSessionId: actorSessionIdFromOptions(options) ?? sourceSessionId,
    visibility: "user-visible",
    summary,
    payload: {
      notification_type: notificationType,
      priority,
      status,
      target_role: targetRole,
      target_session_id: targetSessionId,
      payload: JSON.parse(payloadJson),
    },
    createdAt,
  }, (revision) => {
    store.database.prepare(`
      INSERT INTO worker_notifications (
        notification_id, source_session_id, target_role, notification_type,
        priority, status, created_at, acknowledged_at, resolved_at,
        summary, payload_json, correlation_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      notificationId,
      sourceSessionId,
      targetRole,
      notificationType,
      priority,
      status,
      createdAt,
      acknowledgedAt,
      resolvedAt,
      summary,
      payloadJson,
      correlationId,
    );

    ensureAgentSessionFromWorkerSession(store, sourceSessionId, revision, createdAt);
    const normalizedTargetSessionId = ensureAgentSessionFromWorkerSession(store, targetSessionId, revision, createdAt)
      ? targetSessionId
      : null;
    store.database.prepare(`
      INSERT INTO agent_notifications (
        notification_id, source_session_id, target_session_id, target_role,
        notification_type, priority, status, summary, payload_json,
        correlation_id, created_at, acknowledged_at, resolved_at,
        last_revision
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      notificationId,
      sourceSessionId,
      normalizedTargetSessionId,
      targetRole,
      notificationType,
      priority,
      status,
      summary,
      payloadJson,
      correlationId,
      createdAt,
      acknowledgedAt,
      resolvedAt,
      revision,
    );

    return notificationId;
  });
}

export function updateNotification(store, options) {
  requireRuntimeOperatorActor(options, "notification-update");
  const notificationId = required(options, "notification-id");
  const status = enumValue(required(options, "status"), NOTIFICATION_STATUSES, "status");
  const now = timestamp(options["updated-at"]);

  return withRuntimeEvent(store, {
    eventType: "notification.updated",
    aggregateType: "notification",
    aggregateId: notificationId,
    actorSessionId: actorSessionIdFromOptions(options),
    visibility: "internal-summary",
    summary: `Notification ${notificationId} updated to ${status}.`,
    payload: { status },
    createdAt: now,
  }, (revision) => {
    const result = store.database.prepare(`
      UPDATE worker_notifications
      SET status = ?,
          acknowledged_at = CASE
            WHEN ? IN ('acknowledged', 'resolved') AND acknowledged_at IS NULL
            THEN ?
            ELSE acknowledged_at
          END,
          resolved_at = CASE
            WHEN ? = 'resolved'
            THEN ?
            ELSE resolved_at
          END
      WHERE notification_id = ?
    `).run(status, status, now, status, now, notificationId);

    if (result.changes === 0) {
      throw new Error(`Notification not found: ${notificationId}`);
    }

    syncAgentNotificationFromWorker(store, notificationId, revision);

    return notificationId;
  });
}

export function notificationList(store, options) {
  const conditions = [];
  const values = [];
  if (options.status) {
    conditions.push("status = ?");
    values.push(options.status);
  }
  if (options["target-role"]) {
    conditions.push("target_role = ?");
    values.push(options["target-role"]);
  }
  const where = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
  return store.database.prepare(`SELECT * FROM worker_notifications${where} ORDER BY created_at ASC, notification_id ASC`).all(...values);
}

export function resolveNotificationsForSession(store, sessionId, options = {}) {
  const now = timestamp(options["updated-at"]);
  return withRuntimeEvent(store, {
    eventType: "notification.resolved_for_session",
    aggregateType: "session",
    aggregateId: sessionId,
    sessionId,
    actorSessionId: actorSessionIdFromOptions(options),
    visibility: "internal-summary",
    summary: `Notifications resolved for ${sessionId}.`,
    payload: {},
    createdAt: now,
  }, (revision) => {
    const changes = store.database.prepare(`
      UPDATE worker_notifications
      SET status = 'resolved',
          acknowledged_at = COALESCE(acknowledged_at, ?),
          resolved_at = ?
      WHERE source_session_id = ?
        AND status IN ('unread', 'acknowledged')
    `).run(now, now, sessionId).changes;

    store.database.prepare(`
      UPDATE agent_notifications
      SET status = 'resolved',
          acknowledged_at = COALESCE(acknowledged_at, ?),
          resolved_at = ?,
          last_revision = ?
      WHERE source_session_id = ?
        AND status IN ('unread', 'acknowledged')
    `).run(now, now, revision, sessionId);

    return changes;
  });
}

export function syncAgentNotificationFromWorker(store, notificationId, revision) {
  const row = store.database
    .prepare("SELECT * FROM worker_notifications WHERE notification_id = ?")
    .get(notificationId);
  if (!row) {
    return;
  }

  ensureAgentSessionFromWorkerSession(store, row.source_session_id, revision, row.created_at);
  store.database.prepare(`
    INSERT INTO agent_notifications (
      notification_id, source_session_id, target_session_id, target_role,
      notification_type, priority, status, summary, payload_json,
      correlation_id, created_at, acknowledged_at, resolved_at,
      last_revision
    ) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(notification_id) DO UPDATE SET
      target_role = excluded.target_role,
      notification_type = excluded.notification_type,
      priority = excluded.priority,
      status = excluded.status,
      summary = excluded.summary,
      payload_json = excluded.payload_json,
      correlation_id = excluded.correlation_id,
      acknowledged_at = excluded.acknowledged_at,
      resolved_at = excluded.resolved_at,
      last_revision = excluded.last_revision
  `).run(
    row.notification_id,
    row.source_session_id,
    row.target_role,
    row.notification_type,
    row.priority,
    row.status,
    row.summary,
    row.payload_json ?? "{}",
    row.correlation_id ?? null,
    row.created_at,
    row.acknowledged_at ?? null,
    row.resolved_at ?? null,
    revision,
  );
}

export function assertNotificationActor(options) {
  const notificationType = options["notification-type"];
  if (!["result_ready", "final_result", "blocked", "needs_review", "handoff"].includes(notificationType)) {
    return;
  }

  const sourceSessionId = required(options, "source-session-id");
  const actorSessionId = options["current-actor-session-id"] ?? options["actor-session-id"];
  const actorRole = String(options["actor-role"] ?? "").toLowerCase();
  const actorAction = options["actor-action"] ?? "";

  if (actorSessionId === sourceSessionId) {
    return;
  }

  if (["dialog_assistant", "runtime_operator"].includes(actorRole) && actorAction === "bridge_result_record" && sourceSessionId !== "dialog-assistant") {
    return;
  }

  throw new Error(
    `notification-create ${notificationType} requires --actor-session-id=${sourceSessionId} or a runtime operator bridge_result_record transition`,
  );
}
