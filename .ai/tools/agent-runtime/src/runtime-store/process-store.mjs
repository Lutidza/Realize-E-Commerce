/**
 * @file .ai/tools/agent-runtime/src/runtime-store/process-store.mjs
 * @version 0.1.0 - 2026-05-07 00:40
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Process lifecycle writer for external worker launches. It
 * records process state separately from session/job state and mirrors every
 * write to runtime_events for realtime deltas.
 *
 * Changes in version 0.1.0:
 * - Added durable process lifecycle persistence for the live control-plane
 *   backend slice.
 */
import {
  enumValue,
  id,
  jsonText,
  optionalTimestamp,
  required,
  timestamp,
} from "../runtime-utils.mjs";
import { ensureAgentSessionFromWorkerSession } from "./agent-session-store.mjs";
import {
  actorSessionIdFromOptions,
  parseOptionalInteger,
} from "./common.mjs";
import { withRuntimeEvent } from "./event-log.mjs";

const PROCESS_STATUSES = new Set([
  "planned",
  "starting",
  "running",
  "stopping",
  "exited",
  "failed",
  "cancelled",
]);

const terminalProcessStatuses = new Set(["exited", "failed", "cancelled"]);

export function upsertProcess(store, options) {
  const processId = options["process-id"] ?? id("proc");
  const existing = processById(store, processId);
  const sessionId = required(options, "session-id");
  const jobId = options["job-id"] ?? existing?.job_id ?? null;
  const backend = required(options, "backend");
  const status = enumValue(required(options, "status"), PROCESS_STATUSES, "status");
  const now = timestamp(options["updated-at"]);
  const createdAt = existing?.created_at ?? timestamp(options["created-at"]);
  const startedAt = optionalTimestamp(options, "started-at")
    ?? existing?.started_at
    ?? (["starting", "running"].includes(status) ? now : null);
  const exitedAt = optionalTimestamp(options, "exited-at")
    ?? (terminalProcessStatuses.has(status) ? now : null);
  const commandJson = jsonText(options["command-json"] ?? existing?.command_json ?? "{}", "command-json", "object");
  const metadataJson = jsonText(options["metadata-json"] ?? existing?.metadata_json ?? "{}", "metadata-json", "object");
  const cwd = options.cwd ?? existing?.cwd;
  if (!cwd) {
    throw new Error("process-upsert requires --cwd");
  }

  return withRuntimeEvent(store, {
    eventType: terminalProcessStatuses.has(status) ? "process.exited" : "process.upserted",
    aggregateType: "process",
    aggregateId: processId,
    sessionId,
    actorSessionId: actorSessionIdFromOptions(options),
    visibility: "internal-summary",
    summary: options.summary ?? `Process ${processId} upserted to ${status}.`,
    payload: {
      session_id: sessionId,
      job_id: jobId,
      backend,
      status,
      pid: parseOptionalInteger(options.pid),
    },
    createdAt: now,
  }, (revision) => {
    if (!ensureAgentSessionFromWorkerSession(store, sessionId, revision, now)) {
      throw new Error(`process-upsert references unknown --session-id: ${sessionId}`);
    }
    store.database.prepare(`
      INSERT INTO agent_processes (
        process_id, session_id, job_id, pid, backend, command_json, cwd,
        status, started_at, exited_at, exit_code, signal, metadata_json,
        created_at, updated_at, last_revision
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(process_id) DO UPDATE SET
        session_id = excluded.session_id,
        job_id = excluded.job_id,
        pid = excluded.pid,
        backend = excluded.backend,
        command_json = excluded.command_json,
        cwd = excluded.cwd,
        status = excluded.status,
        started_at = COALESCE(excluded.started_at, agent_processes.started_at),
        exited_at = excluded.exited_at,
        exit_code = excluded.exit_code,
        signal = excluded.signal,
        metadata_json = excluded.metadata_json,
        updated_at = excluded.updated_at,
        last_revision = excluded.last_revision
    `).run(
      processId,
      sessionId,
      jobId,
      parseOptionalInteger(options.pid),
      backend,
      commandJson,
      cwd,
      status,
      startedAt,
      exitedAt,
      parseOptionalInteger(options["exit-code"]),
      options.signal ?? null,
      metadataJson,
      createdAt,
      now,
      revision,
    );

    return processId;
  });
}

export function processById(store, processId) {
  return store.database
    .prepare("SELECT * FROM agent_processes WHERE process_id = ?")
    .get(processId);
}
