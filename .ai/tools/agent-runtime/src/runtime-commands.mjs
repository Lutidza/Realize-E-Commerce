/**
 * @file .ai/tools/agent-runtime/src/runtime-commands.mjs
 * @version 0.1.1 - 2026-05-10 16:20
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Shared command dispatcher for local AI runtime store commands.
 * It keeps the CLI and the local runtime gateway on the same command contract
 * while the gateway becomes the future single writer for live operations.
 *
 * Changes in version 0.1.2:
 * - Removed the legacy delegated command surface from the runtime dispatcher.
 */
const runtimeWriteCommands = new Set([
  "session-upsert",
  "event-append",
  "presence-set",
  "message-send",
  "message-ack",
  "notification-create",
  "notification-update",
  "job-upsert",
  "group-upsert",
  "group-member-upsert",
  "group-edge-upsert",
  "group-acceptance-record",
  "group-close",
  "process-upsert",
  "stream-append",
  "operator-command-create",
  "operator-command-update",
  "operator-command-dispatch",
  "retention-cleanup",
]);

export function isRuntimeWriteCommand(command) {
  return runtimeWriteCommands.has(command);
}

export function executeRuntimeStoreCommand(store, command, options) {
  switch (command) {
    case "session-upsert":
      return [`ok session-upsert ${store.upsertSession(options)}`];
    case "event-append":
      return [`ok event-append ${store.appendEvent(options)}`];
    case "presence-set":
      return [`ok presence-set ${store.setPresence(options)}`];
    case "message-send":
      return [`ok message-send ${store.sendMessage(options)}`];
    case "message-ack":
      return [`ok message-ack ${store.ackMessage(options)}`];
    case "notification-create":
      return [`ok notification-create ${store.createNotification(options)}`];
    case "notification-update":
      return [`ok notification-update ${store.updateNotification(options)}`];
    case "notification-list":
      return store.notificationList(options).map((row) => JSON.stringify(row));
    case "job-upsert":
      return [`ok job-upsert ${store.upsertJob(options)}`];
    case "group-upsert":
      return [`ok group-upsert ${store.upsertGroup(options)}`];
    case "group-member-upsert":
      return [`ok group-member-upsert ${store.upsertGroupMember(options)}`];
    case "group-edge-upsert":
      return [`ok group-edge-upsert ${store.upsertGroupEdge(options)}`];
    case "group-acceptance-record":
      return [`ok group-acceptance-record ${store.recordGroupAcceptanceEvidence(options)}`];
    case "group-close":
      return [`ok group-close ${store.closeGroup(options)}`];
    case "process-upsert":
      return [`ok process-upsert ${store.upsertProcess(options)}`];
    case "stream-append":
      return [`ok stream-append ${store.appendStreamEvent(options)}`];
    case "operator-command-create":
      return [`ok operator-command-create ${store.createOperatorCommand(options)}`];
    case "operator-command-update":
      return [`ok operator-command-update ${store.updateOperatorCommand(options)}`];
    case "operator-command-dispatch":
      return [`ok operator-command-dispatch ${JSON.stringify(store.dispatchOperatorCommand(options))}`];
    case "active-rows-report":
      return [`ok active-rows-report ${store.activeRowsReport(options)}`];
    case "retention-cleanup":
      return [`ok retention-cleanup ${store.cleanupRetention(options)}`];
    default:
      throw new Error(`Unknown runtime store command: ${command}`);
  }
}
