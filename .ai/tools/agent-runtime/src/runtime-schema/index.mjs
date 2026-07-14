/**
 * @file .ai/tools/agent-runtime/src/runtime-schema/index.mjs
 * @version 0.1.0 - 2026-05-06 01:20
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Public runtime schema API. It initializes normalized agent
 * tables, legacy compatibility tables, migrations, indexes, and user_version.
 *
 * Changes in version 0.1.0:
 * - Replaced the monolithic schema initializer with decomposed owner modules.
 */
import {
  runtimeIndexStatements,
  runtimeSchemaUserVersion,
  runtimeTableStatements,
} from "./agent-schema.mjs";
import {
  configureRuntimeDatabase,
  openRuntimeConnection,
} from "./connection.mjs";
import {
  legacyIndexStatements,
  legacyTableStatements,
} from "./legacy-schema.mjs";
import {
  migrateLegacyRuntimeSchema,
} from "./legacy-migrations.mjs";

export function openRuntimeDatabase(databasePath, { readOnly = false, initialize = true } = {}) {
  const database = openRuntimeConnection(databasePath, { readOnly });

  if (!readOnly && initialize) {
    initializeRuntimeSchema(database);
  }

  return database;
}

export function initializeRuntimeSchema(database) {
  configureRuntimeDatabase(database, { readOnly: false });
  for (const statement of runtimeTableStatements) {
    database.exec(statement);
  }
  for (const statement of legacyTableStatements) {
    database.exec(statement);
  }
  migrateLegacyRuntimeSchema(database);
  for (const statement of runtimeIndexStatements) {
    database.exec(statement);
  }
  for (const statement of legacyIndexStatements) {
    database.exec(statement);
  }
  database.exec(
    // language=SQLite
    `PRAGMA user_version = ${runtimeSchemaUserVersion}`,
  );
}
