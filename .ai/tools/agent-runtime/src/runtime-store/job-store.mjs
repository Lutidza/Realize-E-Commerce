/**
 * @file .ai/tools/agent-runtime/src/runtime-store/job-store.mjs
 * @version 0.1.0 - 2026-05-06 04:05
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Job writer and execution ownership guard operations for the
 * local AI runtime store.
 *
 * Changes in version 0.1.0:
 * - Extracted job writes and lease validation from the monolithic runtime store.
 *
 * Changes in version 0.1.1:
 * - Added explicit execution backend validation for worker job writes.
 */
import {
  JOB_LEASE_STATUSES,
  enumValue,
  jsonText,
  optionalTimestamp,
  required,
  timestamp,
} from "../runtime-utils.mjs";
import { ensureAgentSessionFromWorkerSession } from "./agent-session-store.mjs";
import { actorSessionIdFromOptions } from "./common.mjs";
import { withRuntimeEvent } from "./event-log.mjs";
import {
  deriveLeaseStatus,
  isEmptyResultJson,
  isSupportedExecutionBackend,
  isTerminalJobStatus,
  requiresExecutionHandle,
} from "./job-policy.mjs";
import {
  mapAgentJobStatus,
  mapAgentLeaseStatus,
} from "./mappers.mjs";

export function upsertJob(store, options) {
  const jobId = required(options, "job-id");
  const existing = jobById(store, jobId);
  const now = timestamp(options["updated-at"]);
  const status = required(options, "status");
  const assigneeSessionId = options["assignee-session-id"] ?? options["session-id"] ?? existing?.assignee_session_id ?? null;
  const currentActorSessionId = options["current-actor-session-id"] ?? options["actor-session-id"] ?? existing?.current_actor_session_id ?? null;
  const executionBackend = options["execution-backend"] ?? existing?.execution_backend ?? null;
  const executionHandle = options["execution-handle"] ?? existing?.execution_handle ?? null;
  const leaseStatus = enumValue(
    options["lease-status"] ?? deriveLeaseStatus(status, existing?.lease_status, assigneeSessionId),
    JOB_LEASE_STATUSES,
    "lease-status",
  );
  const allowedActionsJson = jsonText(options["allowed-actions-json"] ?? existing?.allowed_actions_json ?? "[]", "allowed-actions-json", "list");
  const handoffTarget = options["handoff-target"] ?? existing?.handoff_target ?? null;
  const finishedAt = optionalTimestamp(options, "finished-at") ?? (isTerminalJobStatus(status) ? now : null);
  assertJobOwnership({
    jobId,
    status,
    assigneeSessionId,
    currentActorSessionId,
    executionBackend,
    executionHandle,
    leaseStatus,
    executionBackendProvided: Object.prototype.hasOwnProperty.call(options, "execution-backend"),
    actorRole: options["actor-role"],
    actorAction: options["actor-action"],
    resultJson: options["result-json"],
  });
  const sessionId = options["session-id"] ?? null;
  const ownerSessionId = options["owner-session-id"] ?? null;
  const correlationId = options["correlation-id"] ?? null;
  const dependsOnJobId = options["depends-on-job-id"] ?? null;
  const createdAt = timestamp(options["created-at"]);
  const startedAt = optionalTimestamp(options, "started-at");
  const summary = options.summary ?? "";
  const payloadJson = jsonText(options["payload-json"] ?? "{}", "payload-json", "object");
  const resultJson = jsonText(options["result-json"] ?? "{}", "result-json", "object");
  const errorJson = jsonText(options["error-json"] ?? "{}", "error-json", "object");

  return withRuntimeEvent(store, {
    eventType: isTerminalJobStatus(status) ? "job.completed" : "job.upserted",
    aggregateType: "job",
    aggregateId: jobId,
    sessionId,
    actorSessionId: currentActorSessionId ?? actorSessionIdFromOptions(options),
    visibility: "internal-summary",
    summary: summary || `Job ${jobId} upserted to ${status}.`,
    payload: {
      status,
      lease_status: leaseStatus,
      assignee_session_id: assigneeSessionId,
      current_actor_session_id: currentActorSessionId,
      execution_backend: executionBackend,
    },
    createdAt: now,
  }, (revision) => {
    store.database.prepare(`
      INSERT INTO worker_jobs (
        job_id, session_id, owner_session_id, assignee_session_id,
        current_actor_session_id, queue_name, status, lease_status,
        execution_backend, execution_handle, allowed_actions_json,
        handoff_target,
        correlation_id, depends_on_job_id, created_at, updated_at,
        started_at, finished_at, summary, payload_json, result_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(job_id) DO UPDATE SET
        session_id = excluded.session_id,
        owner_session_id = excluded.owner_session_id,
        assignee_session_id = excluded.assignee_session_id,
        current_actor_session_id = excluded.current_actor_session_id,
        queue_name = excluded.queue_name,
        status = excluded.status,
        lease_status = excluded.lease_status,
        execution_backend = excluded.execution_backend,
        execution_handle = excluded.execution_handle,
        allowed_actions_json = excluded.allowed_actions_json,
        handoff_target = excluded.handoff_target,
        correlation_id = excluded.correlation_id,
        depends_on_job_id = excluded.depends_on_job_id,
        updated_at = excluded.updated_at,
        started_at = COALESCE(excluded.started_at, worker_jobs.started_at),
        finished_at = CASE
          WHEN excluded.status IN ('planned', 'queued', 'running') THEN NULL
          ELSE COALESCE(excluded.finished_at, worker_jobs.finished_at)
        END,
        summary = excluded.summary,
        payload_json = excluded.payload_json,
        result_json = excluded.result_json
    `).run(
      jobId,
      sessionId,
      ownerSessionId,
      assigneeSessionId,
      currentActorSessionId,
      options["queue-name"] ?? "default",
      status,
      leaseStatus,
      executionBackend,
      executionHandle,
      allowedActionsJson,
      handoffTarget,
      correlationId,
      dependsOnJobId,
      createdAt,
      now,
      startedAt,
      finishedAt,
      summary,
      payloadJson,
      resultJson,
    );

    const normalizedSessionId = ensureAgentSessionFromWorkerSession(store, sessionId, revision, now)
      ? sessionId
      : null;
    const normalizedOwnerSessionId = ensureAgentSessionFromWorkerSession(store, ownerSessionId, revision, now)
      ? ownerSessionId
      : null;
    const normalizedAssigneeSessionId = ensureAgentSessionFromWorkerSession(store, assigneeSessionId, revision, now)
      ? assigneeSessionId
      : null;
    const normalizedActorSessionId = ensureAgentSessionFromWorkerSession(store, currentActorSessionId, revision, now)
      ? currentActorSessionId
      : null;

    store.database.prepare(`
      INSERT INTO agent_jobs (
        job_id, session_id, parent_job_id, owner_session_id,
        assignee_session_id, current_actor_session_id, backend,
        execution_handle, status, lease_status, lease_token,
        lease_expires_at, command_json, result_json, error_json,
        created_at, updated_at, started_at, finished_at, last_revision
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(job_id) DO UPDATE SET
        session_id = excluded.session_id,
        parent_job_id = excluded.parent_job_id,
        owner_session_id = excluded.owner_session_id,
        assignee_session_id = excluded.assignee_session_id,
        current_actor_session_id = excluded.current_actor_session_id,
        backend = excluded.backend,
        execution_handle = excluded.execution_handle,
        status = excluded.status,
        lease_status = excluded.lease_status,
        lease_token = excluded.lease_token,
        lease_expires_at = excluded.lease_expires_at,
        command_json = excluded.command_json,
        result_json = excluded.result_json,
        error_json = excluded.error_json,
        updated_at = excluded.updated_at,
        started_at = COALESCE(excluded.started_at, agent_jobs.started_at),
        finished_at = excluded.finished_at,
        last_revision = excluded.last_revision
    `).run(
      jobId,
      normalizedSessionId,
      dependsOnJobId,
      normalizedOwnerSessionId,
      normalizedAssigneeSessionId,
      normalizedActorSessionId,
      executionBackend,
      executionHandle,
      mapAgentJobStatus(status),
      mapAgentLeaseStatus(leaseStatus),
      options["lease-token"] ?? null,
      optionalTimestamp(options, "lease-expires-at"),
      payloadJson,
      resultJson,
      errorJson,
      createdAt,
      now,
      startedAt,
      finishedAt,
      revision,
    );

    if (normalizedSessionId) {
      store.database.prepare(`
        UPDATE agent_sessions
        SET current_job_id = ?,
            updated_at = ?,
            last_revision = ?
        WHERE session_id = ?
      `).run(jobId, now, revision, normalizedSessionId);
    }

    return jobId;
  });
}

export function jobById(store, jobId) {
  return store.database.prepare("SELECT * FROM worker_jobs WHERE job_id = ?").get(jobId);
}

export function assertJobOwnership({
  jobId,
  status,
  assigneeSessionId,
  currentActorSessionId,
  executionBackend,
  executionHandle,
  leaseStatus,
  executionBackendProvided,
  actorRole,
  actorAction,
  resultJson,
}) {
  if (executionBackendProvided && !isSupportedExecutionBackend(executionBackend)) {
    throw new Error(`job-upsert ${jobId} uses unsupported execution backend ${executionBackend}`);
  }

  if (leaseStatus === "claimed" && !assigneeSessionId) {
    throw new Error(`job-upsert ${jobId} with lease_status=claimed requires --assignee-session-id or --session-id`);
  }

  if (leaseStatus === "claimed" && !currentActorSessionId) {
    throw new Error(`job-upsert ${jobId} with lease_status=claimed requires --actor-session-id or --current-actor-session-id`);
  }

  if (leaseStatus === "claimed" && currentActorSessionId !== assigneeSessionId) {
    throw new Error(`job-upsert ${jobId} with lease_status=claimed requires current actor ${currentActorSessionId} to match assignee ${assigneeSessionId}`);
  }

  if (leaseStatus === "claimed" && !executionBackend) {
    throw new Error(`job-upsert ${jobId} with lease_status=claimed requires --execution-backend`);
  }

  if (leaseStatus === "claimed" && !isSupportedExecutionBackend(executionBackend)) {
    throw new Error(`job-upsert ${jobId} with lease_status=claimed uses unsupported execution backend ${executionBackend}`);
  }

  if (leaseStatus === "claimed" && requiresExecutionHandle(executionBackend) && !executionHandle) {
    throw new Error(`job-upsert ${jobId} with execution backend ${executionBackend} requires --execution-handle`);
  }

  if (!isTerminalJobStatus(status) && isEmptyResultJson(resultJson)) {
    return;
  }

  if (!assigneeSessionId) {
    throw new Error(`job-upsert ${jobId} terminal/result write requires --assignee-session-id or --session-id`);
  }

  if (!currentActorSessionId) {
    throw new Error(`job-upsert ${jobId} terminal/result write requires --actor-session-id or --current-actor-session-id`);
  }

  if (currentActorSessionId === assigneeSessionId) {
    return;
  }

  const runtimeOperatorBridgeResult =
    ["dialog_assistant", "runtime_operator"].includes(String(actorRole).toLowerCase()) &&
    actorAction === "bridge_result_record" &&
    executionBackend &&
    executionHandle;
  const runtimeOperatorReviewClose =
    ["dialog_assistant", "runtime_operator"].includes(String(actorRole).toLowerCase()) &&
    ["review_or_acceptance", "close_transition"].includes(actorAction) &&
    ["closed", "cancelled"].includes(status);

  if (runtimeOperatorBridgeResult || runtimeOperatorReviewClose) {
    return;
  }

  throw new Error(
    `job-upsert ${jobId} terminal/result write actor ${currentActorSessionId} does not own assignee lease ${assigneeSessionId}`,
  );
}
