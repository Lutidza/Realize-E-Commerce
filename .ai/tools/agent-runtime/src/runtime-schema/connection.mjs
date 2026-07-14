/**
 * @file .ai/tools/agent-runtime/src/runtime-schema/connection.mjs
 * @version 0.1.0 - 2026-05-06 01:20
 * @docref DOC-SYSTEM-SPEC-032
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @description SQLite connection factory and runtime PRAGMA configuration for
 * the local AI runtime database.
 *
 * Changes in version 0.1.0:
 * - Extracted SQLite connection setup into a dedicated owner module.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const runtimeBusyTimeoutMs = 5000;

export function openRuntimeConnection(databasePath, { readOnly = false } = {}) {
  if (!readOnly) {
    mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  const database = new DatabaseSync(databasePath, readOnly ? { readOnly: true } : {});
  configureRuntimeDatabase(database, { readOnly });

  return database;
}

export function configureRuntimeDatabase(database, { readOnly }) {
  database.exec(
    // language=SQLite
    "PRAGMA foreign_keys = ON",
  );
  database.exec(
    // language=SQLite
    `PRAGMA busy_timeout = ${runtimeBusyTimeoutMs}`,
  );
  if (!readOnly) {
    database.exec(
      // language=SQLite
      "PRAGMA journal_mode = WAL",
    );
  }
}
