/**
 * @file .ai/tools/agent-runtime/src/runtime-store/index.mjs
 * @version 0.1.0 - 2026-05-06 04:05
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Public RuntimeStore boundary. It keeps the CLI and gateway on
 * one store API while delegating each runtime responsibility to a dedicated
 * owner module.
 *
 * Changes in version 0.1.0:
 * - Replaced the monolithic runtime store file with decomposed owner modules.
 */
import {
  ensureAgentSessionFromWorkerSession,
  knownAgentSessionId,
  sessionById,
  upsertAgentSession,
} from "./agent-session-store.mjs";
import {
  insertRuntimeEvent,
  withRuntimeEvent,
} from "./event-log.mjs";
import {
  assertJobOwnership,
  jobById,
  upsertJob,
} from "./job-store.mjs";
import {
  closeGroup,
  groupById,
  recordGroupAcceptanceEvidence,
  upsertGroup,
  upsertGroupEdge,
  upsertGroupMember,
} from "./group-store.mjs";
import {
  activeRowsReport,
  cleanupRetention,
  executeCount,
  scalarCount,
} from "./maintenance-store.mjs";
import {
  ackMessage,
  assertMessageParticipant,
  sendMessage,
} from "./message-store.mjs";
import {
  assertNotificationActor,
  createNotification,
  notificationList,
  resolveNotificationsForSession,
  syncAgentNotificationFromWorker,
  updateNotification,
} from "./notification-store.mjs";
import {
  createOperatorCommand,
  operatorCommandById,
  updateOperatorCommand,
} from "./operator-command-store.mjs";
import { dispatchOperatorCommand } from "./operator-command-dispatcher.mjs";
import { setPresence } from "./presence-store.mjs";
import {
  processById,
  upsertProcess,
} from "./process-store.mjs";
import {
  appendEvent,
  upsertSession,
} from "./session-store.mjs";
import { appendStreamEvent } from "./stream-store.mjs";

export class RuntimeStore {
  constructor(database) {
    this.database = database;
  }

  withRuntimeEvent(event, action) {
    return withRuntimeEvent(this, event, action);
  }

  insertRuntimeEvent(event) {
    return insertRuntimeEvent(this.database, event);
  }

  upsertSession(options) {
    return upsertSession(this, options);
  }

  appendEvent(options) {
    return appendEvent(this, options);
  }

  setPresence(options) {
    return setPresence(this, options);
  }

  sendMessage(options) {
    return sendMessage(this, options);
  }

  ackMessage(options) {
    return ackMessage(this, options);
  }

  createNotification(options) {
    return createNotification(this, options);
  }

  updateNotification(options) {
    return updateNotification(this, options);
  }

  notificationList(options) {
    return notificationList(this, options);
  }

  resolveNotificationsForSession(sessionId, options = {}) {
    return resolveNotificationsForSession(this, sessionId, options);
  }

  upsertJob(options) {
    return upsertJob(this, options);
  }

  upsertGroup(options) {
    return upsertGroup(this, options);
  }

  upsertGroupMember(options) {
    return upsertGroupMember(this, options);
  }

  upsertGroupEdge(options) {
    return upsertGroupEdge(this, options);
  }

  recordGroupAcceptanceEvidence(options) {
    return recordGroupAcceptanceEvidence(this, options);
  }

  closeGroup(options) {
    return closeGroup(this, options);
  }

  upsertProcess(options) {
    return upsertProcess(this, options);
  }

  appendStreamEvent(options) {
    return appendStreamEvent(this, options);
  }

  createOperatorCommand(options) {
    return createOperatorCommand(this, options);
  }

  updateOperatorCommand(options) {
    return updateOperatorCommand(this, options);
  }

  dispatchOperatorCommand(options) {
    return dispatchOperatorCommand(this, options);
  }

  upsertAgentSession(args) {
    return upsertAgentSession(this, args);
  }

  ensureAgentSessionFromWorkerSession(sessionId, revision, fallbackTimestamp) {
    return ensureAgentSessionFromWorkerSession(this, sessionId, revision, fallbackTimestamp);
  }

  knownAgentSessionId(sessionId) {
    return knownAgentSessionId(this, sessionId);
  }

  syncAgentNotificationFromWorker(notificationId, revision) {
    return syncAgentNotificationFromWorker(this, notificationId, revision);
  }

  sessionById(sessionId) {
    return sessionById(this, sessionId);
  }

  jobById(jobId) {
    return jobById(this, jobId);
  }

  groupById(groupId) {
    return groupById(this, groupId);
  }

  processById(processId) {
    return processById(this, processId);
  }

  operatorCommandById(operatorCommandId) {
    return operatorCommandById(this, operatorCommandId);
  }

  activeRowsReport(options) {
    return activeRowsReport(this, options);
  }

  cleanupRetention(options) {
    return cleanupRetention(this, options);
  }

  assertMessageParticipant(messageId, sessionId) {
    return assertMessageParticipant(this, messageId, sessionId);
  }

  assertNotificationActor(options) {
    return assertNotificationActor(options);
  }

  assertJobOwnership(args) {
    return assertJobOwnership(args);
  }

  executeCount(sql, values = []) {
    return executeCount(this, sql, values);
  }

  scalarCount(sql) {
    return scalarCount(this, sql);
  }
}
