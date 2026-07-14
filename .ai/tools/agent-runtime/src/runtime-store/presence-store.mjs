/**
 * @file .ai/tools/agent-runtime/src/runtime-store/presence-store.mjs
 * @version 0.1.0 - 2026-05-06 04:05
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Presence writer for worker_presence and normalized
 * agent_presence runtime state.
 *
 * Changes in version 0.1.0:
 * - Extracted presence writes from the monolithic runtime store.
 */
import {
  PRESENCE_STATES,
  enumValue,
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
import { mapAgentPresenceState } from "./mappers.mjs";

export function setPresence(store, options) {
  const sessionId = required(options, "session-id");
  const updatedAt = timestamp(options["updated-at"]);
  const presenceState = enumValue(required(options, "presence-state"), PRESENCE_STATES, "presence-state");
  const currentActivity = options["current-activity"] ?? "";
  const heartbeatAt = timestamp(options["heartbeat-at"]);
  const leaseExpiresAt = optionalTimestamp(options, "lease-expires-at");
  const payloadJson = jsonText(options["payload-json"] ?? "{}", "payload-json", "object");

  return withRuntimeEvent(store, {
    eventType: "presence.updated",
    aggregateType: "presence",
    aggregateId: sessionId,
    sessionId,
    actorSessionId: actorSessionIdFromOptions(options),
    summary: `Presence updated for ${sessionId}.`,
    payload: {
      state: presenceState,
      activity: currentActivity,
    },
    createdAt: updatedAt,
  }, (revision) => {
    store.database.prepare(`
      INSERT INTO worker_presence (
        session_id, presence_state, current_activity, heartbeat_at,
        lease_expires_at, payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        presence_state = excluded.presence_state,
        current_activity = excluded.current_activity,
        heartbeat_at = excluded.heartbeat_at,
        lease_expires_at = excluded.lease_expires_at,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `).run(
      sessionId,
      presenceState,
      currentActivity,
      heartbeatAt,
      leaseExpiresAt,
      payloadJson,
      updatedAt,
    );

    ensureAgentSessionFromWorkerSession(store, sessionId, revision, updatedAt);
    store.database.prepare(`
      INSERT INTO agent_presence (
        session_id, state, activity, process_id, pid, heartbeat_at,
        lease_expires_at, updated_at, last_revision
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        state = excluded.state,
        activity = excluded.activity,
        process_id = excluded.process_id,
        pid = excluded.pid,
        heartbeat_at = excluded.heartbeat_at,
        lease_expires_at = excluded.lease_expires_at,
        updated_at = excluded.updated_at,
        last_revision = excluded.last_revision
    `).run(
      sessionId,
      mapAgentPresenceState(presenceState),
      currentActivity,
      options["process-id"] ?? null,
      parseOptionalInteger(options.pid),
      heartbeatAt,
      leaseExpiresAt,
      updatedAt,
      revision,
    );

    return sessionId;
  });
}
