/**
 * @file .ai/tools/agent-runtime/src/runtime-schema/legacy-migrations.mjs
 * @version 0.1.0 - 2026-05-06 01:20
 * @docref DOC-SYSTEM-SPEC-032
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @description Idempotent migrations for existing legacy worker_* runtime
 * tables retained during the transition to the normalized agent_* schema.
 *
 * Changes in version 0.1.0:
 * - Extracted legacy worker table migrations into a dedicated owner module.
 */
import { legacyWorkerSessionEventsStatement } from "./legacy-schema.mjs";

export function migrateLegacyRuntimeSchema(database) {
  migrateWorkerSessionEventsVisibility(database);
  migrateWorkerNotificationsFinalResult(database);
  migrateWorkerJobsOwnership(database);
}

function migrateWorkerNotificationsFinalResult(database) {
  const row = database
    .prepare(
      // language=SQLite
      "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'worker_notifications'",
    )
    .get();
  const schemaSql = row?.sql;

  if (typeof schemaSql !== "string" || schemaSql.includes("'final_result'")) {
    return;
  }

  const legacyTable = `worker_notifications_legacy_${compactTimestamp()}`;
  database.exec(
    // language=SQLite
    "PRAGMA foreign_keys = OFF",
  );
  database.exec(
    // language=SQLite
    "BEGIN",
  );
  try {
    database.exec(
      // language=SQLite
      `ALTER TABLE worker_notifications RENAME TO ${legacyTable}`,
    );
    database.exec(
      // language=SQLite
      `
      CREATE TABLE worker_notifications (
          notification_id TEXT PRIMARY KEY,
          source_session_id TEXT NOT NULL,
          target_role TEXT NOT NULL,
          notification_type TEXT NOT NULL CHECK (notification_type IN ('result_ready', 'final_result', 'blocked', 'needs_review', 'request_link', 'request_worker', 'scope_conflict', 'handoff', 'heartbeat_missed')),
          priority TEXT NOT NULL CHECK (priority IN ('info', 'normal', 'high', 'urgent')),
          status TEXT NOT NULL CHECK (status IN ('unread', 'acknowledged', 'resolved', 'dismissed')),
          created_at TEXT NOT NULL,
          acknowledged_at TEXT,
          resolved_at TEXT,
          summary TEXT NOT NULL,
          payload_json TEXT NOT NULL DEFAULT '{}',
          correlation_id TEXT,
          FOREIGN KEY (source_session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE
      )
    `,
    );
    database.exec(
      // language=SQLite
      `
      INSERT INTO worker_notifications (
        notification_id, source_session_id, target_role, notification_type,
        priority, status, created_at, acknowledged_at, resolved_at, summary,
        payload_json, correlation_id
      )
      SELECT
        notification_id, source_session_id, target_role, notification_type,
        priority, status, created_at, acknowledged_at, resolved_at, summary,
        payload_json, correlation_id
      FROM ${legacyTable}
    `,
    );
    database.exec(
      // language=SQLite
      `DROP TABLE ${legacyTable}`,
    );
    database.exec(
      // language=SQLite
      "COMMIT",
    );
  } catch (error) {
    database.exec(
      // language=SQLite
      "ROLLBACK",
    );
    throw error;
  } finally {
    database.exec(
      // language=SQLite
      "PRAGMA foreign_keys = ON",
    );
  }
}

function migrateWorkerSessionEventsVisibility(database) {
  const row = database
    .prepare(
      // language=SQLite
      "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'worker_session_events'",
    )
    .get();
  const schemaSql = row?.sql;

  if (
    typeof schemaSql !== "string" ||
    (schemaSql.includes("DEFAULT 'internal-summary'") &&
      schemaSql.includes("visibility IN ('user-visible', 'internal-summary', 'redacted')"))
  ) {
    return;
  }

  const legacyTable = `worker_session_events_legacy_${compactTimestamp()}`;
  database.exec(
    // language=SQLite
    "PRAGMA foreign_keys = OFF",
  );
  database.exec(
    // language=SQLite
    "BEGIN",
  );
  try {
    database.exec(
      // language=SQLite
      `ALTER TABLE worker_session_events RENAME TO ${legacyTable}`,
    );
    database.exec(legacyWorkerSessionEventsStatement);
    database.exec(
      // language=SQLite
      `
      INSERT INTO worker_session_events (
        event_id, session_id, source, event_type, visibility, summary,
        payload_json, related_artifacts_json, created_at
      )
      SELECT
        event_id,
        session_id,
        source,
        event_type,
        CASE
          WHEN visibility = 'internal' THEN 'internal-summary'
          WHEN visibility IN ('user-visible', 'internal-summary', 'redacted') THEN visibility
          ELSE 'redacted'
        END,
        summary,
        payload_json,
        related_artifacts_json,
        created_at
      FROM ${legacyTable}
    `,
    );
    database.exec(
      // language=SQLite
      `DROP TABLE ${legacyTable}`,
    );
    database.exec(
      // language=SQLite
      "COMMIT",
    );
  } catch (error) {
    database.exec(
      // language=SQLite
      "ROLLBACK",
    );
    throw error;
  } finally {
    database.exec(
      // language=SQLite
      "PRAGMA foreign_keys = ON",
    );
  }
}

function migrateWorkerJobsOwnership(database) {
  const columns = new Set(database.prepare(
    // language=SQLite
    "PRAGMA table_info(worker_jobs)",
  ).all().map((row) => row.name));
  const migrations = [
    ["assignee_session_id", "TEXT"],
    ["current_actor_session_id", "TEXT"],
    ["lease_status", "TEXT NOT NULL DEFAULT 'unassigned'"],
    ["execution_backend", "TEXT"],
    ["execution_handle", "TEXT"],
    ["allowed_actions_json", "TEXT NOT NULL DEFAULT '[]'"],
    ["handoff_target", "TEXT"],
  ];

  for (const [column, definition] of migrations) {
    if (!columns.has(column)) {
      database.exec(
        // language=SQLite
        `ALTER TABLE worker_jobs ADD COLUMN ${column} ${definition}`,
      );
    }
  }

  database.exec(
    // language=SQLite
    `
    UPDATE worker_jobs
    SET assignee_session_id = COALESCE(assignee_session_id, session_id),
        lease_status = CASE
          WHEN status IN ('done', 'succeeded', 'failed', 'blocked', 'closed', 'cancelled') THEN 'completed'
          WHEN status IN ('running') AND assignee_session_id IS NOT NULL THEN 'claimed'
          WHEN status IN ('planned', 'queued') AND assignee_session_id IS NOT NULL THEN 'waiting'
          WHEN lease_status IS NOT NULL AND lease_status <> '' THEN lease_status
          ELSE 'unassigned'
        END,
        allowed_actions_json = COALESCE(NULLIF(allowed_actions_json, ''), '[]')
  `,
  );
}

function compactTimestamp() {
  return new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}
