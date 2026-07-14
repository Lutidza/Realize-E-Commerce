/**
 * @file .ai/tools/agent-runtime/src/runtime-checks/worker-launch-preflight.mjs
 * @version 0.1.0 - 2026-05-15 00:00
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Preflight видимости запуска worker-а для planned runtime
 * sessions и необязательных worker groups. Проверка выполняется только на чтение,
 * использует runtime store как источник истины, а gateway health/snapshot -
 * как диагностику видимости monitor.
 */
import { monitorServiceContract } from "../runtime-contracts/monitor-service-contract.mjs";
import {
  activeRowsReportPayload,
  heartbeatContractOk,
  heartbeatFromActiveRowsReport,
} from "../runtime-services/monitor-service-lifecycle.mjs";
import { httpProbe } from "../runtime-services/service-probes.mjs";
import { timestamp } from "../runtime-utils.mjs";
import {
  coordinatorSessionIdFromRows,
  dialogAssistantSessionId,
  plannedSessionVisible,
  presenceVisible,
  readRuntimeRows,
  sessionById,
  snapshotGroup,
  snapshotGroupEdgesVisible,
  snapshotPresenceVisible,
  snapshotSessionVisible,
} from "./worker-launch-read-model.mjs";

/**
 * Выполняет reuse-only preflight запуска worker-а и возвращает схему pass/fail.
 *
 * @param {object} store Экземпляр RuntimeStore.
 * @param {object} options Распарсенные параметры CLI.
 * @returns {Promise<object>} Машиночитаемый результат preflight.
 */
export async function runWorkerLaunchPreflight(store, options) {
  const sessionId = requiredOption(options, "session-id");
  const groupId = optionalString(options["group-id"]);
  const blockers = [];
  const activeRowsReport = activeRowsReportPayload(store);
  const heartbeat = heartbeatFromActiveRowsReport(activeRowsReport);
  const [healthProbe, snapshotProbeWithJson] = await Promise.all([
    httpProbe(monitorServiceContract.gateway.healthUrl, { expectJson: true }),
    httpProbe(monitorServiceContract.gateway.snapshotUrl, { expectJson: true, includeJson: true }),
  ]);
  const snapshot = snapshotProbeWithJson.json ?? null;
  const snapshotProbe = omit(snapshotProbeWithJson, ["json"]);
  const snapshotAvailable = snapshotProbe.ok && snapshot !== null;
  const runtimeRows = readRuntimeRows(store.database, sessionId, groupId);

  if (!activeRowsReport.ok) {
    addBlocker(blockers, "monitor_visibility_unavailable", "Active rows report is unavailable.");
  }

  if (!heartbeatContractOk(heartbeat)) {
    addBlocker(blockers, "monitor_visibility_unavailable", "Monitor heartbeat contract is not fresh or does not match fixed URLs.");
  }

  validateDialogAssistant(blockers, runtimeRows.dialogAssistant);
  validatePlannedSession(blockers, runtimeRows.session, snapshot, sessionId, snapshotAvailable);
  validatePresence(blockers, runtimeRows.presence, snapshot, sessionId, snapshotAvailable);
  const groupChecks = groupId
    ? validateGroup(blockers, runtimeRows, snapshot, groupId, sessionId, snapshotAvailable)
    : notApplicableGroupChecks();

  return {
    schema_version: "1.0",
    generated_at: timestamp(),
    command: "worker-launch-preflight",
    service_lifecycle_mode: monitorServiceContract.serviceLifecycleModes.reuseExistingOnly,
    session_id: sessionId,
    group_id: groupId,
    status: blockers.length === 0 ? "pass" : "fail",
    pass: blockers.length === 0,
    blocker: blockers[0]?.code ?? null,
    blockers,
    checks: {
      gateway_reachable: healthProbe.ok,
      runtime_health_probe: healthProbe.ok ? "pass" : "diagnostic_unavailable",
      runtime_snapshot_probe: snapshotProbe.ok ? "pass" : "diagnostic_unavailable",
      active_rows_report_command: activeRowsReport.ok ? "pass" : "fail",
      heartbeat_contract: heartbeatContractOk(heartbeat) ? "pass" : "fail",
      dialog_assistant_visible: dialogAssistantVisible(runtimeRows.dialogAssistant),
      planned_session_visible_before_launch: plannedSessionVisible(runtimeRows.session, snapshot, sessionId, snapshotAvailable),
      planned_session_status: runtimeRows.session?.status ?? null,
      presence_written_before_launch: presenceVisible(runtimeRows.presence, snapshot, sessionId, snapshotAvailable),
      planned_job_visible: runtimeRows.jobs.length > 0,
      gateway_snapshot_validation: snapshotAvailable ? "checked" : "diagnostic_unavailable",
      ...groupChecks,
      spawn_allowed: blockers.length === 0,
    },
    heartbeat,
    runtime_store: {
      session: runtimeRows.session,
      presence: runtimeRows.presence,
      jobs: runtimeRows.jobs,
      dialog_assistant: runtimeRows.dialogAssistant,
      group: runtimeRows.group,
      group_members: runtimeRows.groupMembers,
      group_edges: runtimeRows.groupEdges,
    },
    diagnostics: {
      gateway_health_probe: healthProbe,
      gateway_snapshot_probe: snapshotProbe,
      active_rows_report: activeRowsReport,
    },
  };
}

function validateDialogAssistant(blockers, dialogAssistant) {
  if (!dialogAssistant || dialogAssistant.status === "closed") {
    addBlocker(blockers, "dialog_assistant_not_visible", "Dialog Assistant runtime session is not visible.");
  }
}

function validatePlannedSession(blockers, session, snapshot, sessionId, snapshotAvailable) {
  if (!session) {
    addBlocker(blockers, "planned_session_not_visible", "Planned worker session is not visible in runtime store.");
    return;
  }

  if (snapshotAvailable && !snapshotSessionVisible(snapshot, sessionId)) {
    addBlocker(blockers, "planned_session_not_visible_in_snapshot", "Planned worker session is not visible in gateway snapshot.");
  }

  if (session.status !== "planned") {
    addBlocker(blockers, "planned_session_not_planned", `Worker session status is ${session.status}, expected planned.`);
  }
}

function validatePresence(blockers, presence, snapshot, sessionId, snapshotAvailable) {
  if (!presence) {
    addBlocker(blockers, "presence_not_visible", "Worker presence row is not visible before launch.");
    return;
  }

  if (snapshotAvailable && !snapshotPresenceVisible(snapshot, sessionId)) {
    addBlocker(blockers, "presence_not_visible_in_snapshot", "Worker presence row is not visible in gateway snapshot.");
  }
}

function validateGroup(blockers, rows, snapshot, groupId, sessionId, snapshotAvailable) {
  const snapshotGroupVisible = snapshotAvailable ? snapshotGroup(snapshot, groupId) !== null : null;
  if (!rows.group) {
    addBlocker(blockers, "group_not_visible", "Worker group is not visible in runtime store.");
  }

  if (snapshotAvailable && !snapshotGroupVisible) {
    addBlocker(blockers, "group_not_visible_in_snapshot", "Worker group is not visible in gateway snapshot.");
  }

  if (rows.groupMembers.length === 0 || !rows.groupMembers.some((member) => member.session_id === sessionId)) {
    addBlocker(blockers, "group_members_not_visible", "Worker group members are missing or do not include planned session.");
  }

  if (rows.groupEdges.length === 0) {
    addBlocker(blockers, "group_edges_not_visible", "Worker group edges are not visible before launch.");
  }

  if (snapshotAvailable && !snapshotGroupEdgesVisible(snapshot, groupId)) {
    addBlocker(blockers, "group_edges_not_visible_in_snapshot", "Worker group edges are not visible in gateway snapshot.");
  }

  const returnsToSessionId = optionalString(rows.group?.returns_to_session_id);
  const groupCloserSessionId = optionalString(rows.group?.group_closer_session_id);
  const coordinatorSessionId = coordinatorSessionIdFromRows(rows);

  if (!returnsToSessionId || returnsToSessionId !== dialogAssistantSessionId) {
    addBlocker(blockers, "returns_to_invalid", "Worker group returns_to must point to dialog-assistant.");
  }

  if (!groupCloserSessionId || !sessionById(rows.groupSessions, groupCloserSessionId)) {
    addBlocker(blockers, "group_closer_not_visible", "Worker group closer session is not visible.");
  }

  if (!coordinatorSessionId || !sessionById(rows.groupSessions, coordinatorSessionId)) {
    addBlocker(blockers, "coordinator_not_visible", "Worker group coordinator session is not visible.");
  } else if (coordinatorSessionId === dialogAssistantSessionId) {
    addBlocker(blockers, "coordinator_not_separate", "Worker group coordinator must be a separate worker session.");
  }

  return {
    group_visible_before_launch: Boolean(rows.group) && (snapshotAvailable ? snapshotGroupVisible : true),
    group_members_visible_before_launch: rows.groupMembers.length > 0,
    group_edges_visible_before_launch: rows.groupEdges.length > 0 && (snapshotAvailable ? snapshotGroupEdgesVisible(snapshot, groupId) : true),
    returns_to_validation: returnsToSessionId === dialogAssistantSessionId ? "pass" : "fail",
    group_closer_validation: groupCloserSessionId && sessionById(rows.groupSessions, groupCloserSessionId) ? "pass" : "fail",
    coordinator_session_id: coordinatorSessionId,
    coordinator_session_validation: coordinatorSessionId && coordinatorSessionId !== dialogAssistantSessionId ? "pass" : "fail",
  };
}

function dialogAssistantVisible(dialogAssistant) {
  return Boolean(dialogAssistant) && dialogAssistant.status !== "closed";
}

function notApplicableGroupChecks() {
  return {
    group_visible_before_launch: "not_applicable",
    group_members_visible_before_launch: "not_applicable",
    group_edges_visible_before_launch: "not_applicable",
    returns_to_validation: "not_applicable",
    group_closer_validation: "not_applicable",
    coordinator_session_id: null,
    coordinator_session_validation: "not_applicable",
  };
}

function addBlocker(blockers, code, message) {
  if (blockers.some((blocker) => blocker.code === code)) {
    return;
  }
  blockers.push({ code, message });
}

function omit(value, keys) {
  const blocked = new Set(keys);
  return Object.fromEntries(Object.entries(value).filter(([key]) => !blocked.has(key)));
}

function requiredOption(options, key) {
  const value = optionalString(options[key]);
  if (!value) {
    throw new Error(`Missing required option --${key}`);
  }
  return value;
}

function optionalString(value) {
  if (value === null || value === undefined || typeof value === "object") {
    return null;
  }
  const normalized = String(value).trim();
  return normalized === "" ? null : normalized;
}
