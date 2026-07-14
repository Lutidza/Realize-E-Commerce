/**
 * @file .ai/tools/agent-runtime/src/runtime-services/monitor-service-lifecycle.mjs
 * @version 0.1.0 - 2026-05-15 00:00
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Вспомогательные функции жизненного цикла для runtime gateway и
 * monitor preview. Сервис владеет проверками фиксированных URL, определением
 * кандидата на переиспользование и недеструктивными попытками запуска по
 * контракту локального agent monitor.
 */
import { spawn } from "node:child_process";
import { monitorServiceContract } from "../runtime-contracts/monitor-service-contract.mjs";
import { timestamp } from "../runtime-utils.mjs";
import {
  diagnosticFromError,
  httpProbe,
  tcpProbe,
} from "./service-probes.mjs";

const startTimeoutMs = 12000;
const startPollIntervalMs = 500;

/**
 * Формирует машиночитаемый статус сервиса без проверки корня gateway.
 *
 * @param {object|null} store Экземпляр RuntimeStore для active rows report.
 * @returns {Promise<object>} Диагностическая полезная нагрузка статуса.
 */
export async function collectMonitorServiceStatus(store) {
  const [healthProbe, snapshotProbe, monitorProbe, gatewayPortProbe, monitorPortProbe] = await Promise.all([
    httpProbe(monitorServiceContract.gateway.healthUrl, { expectJson: true }),
    httpProbe(monitorServiceContract.gateway.snapshotUrl, { expectJson: true }),
    httpProbe(monitorServiceContract.monitor.url),
    tcpProbe(monitorServiceContract.gateway.host, monitorServiceContract.gateway.port),
    tcpProbe(monitorServiceContract.monitor.host, monitorServiceContract.monitor.port),
  ]);
  const activeRowsReport = activeRowsReportPayload(store);
  const heartbeat = heartbeatFromActiveRowsReport(activeRowsReport);
  const checks = monitorStatusChecks({
    healthProbe,
    snapshotProbe,
    monitorProbe,
    gatewayPortProbe,
    monitorPortProbe,
    activeRowsReport,
    heartbeat,
  });

  return {
    schema_version: "1.0",
    generated_at: timestamp(),
    command: "monitor-service-status",
    status: checks.pass ? "pass" : "fail",
    pass: checks.pass,
    blocker: checks.pass ? null : "monitor_service_lifecycle_unavailable",
    service_lifecycle_mode: monitorServiceContract.serviceLifecycleModes.reuseExistingOnly,
    gateway_url: monitorServiceContract.gateway.url,
    monitor_url: monitorServiceContract.monitor.url,
    gateway_health_route: "/health",
    gateway_snapshot_route: "/snapshot",
    monitor_mode: monitorServiceContract.serviceLifecycleModes.preview,
    checks,
    gateway: {
      url: monitorServiceContract.gateway.url,
      health_probe: healthProbe,
      snapshot_probe: snapshotProbe,
      port_probe: gatewayPortProbe,
    },
    monitor: {
      url: monitorServiceContract.monitor.url,
      root_probe: monitorProbe,
      port_probe: monitorPortProbe,
    },
    active_rows_report: activeRowsReport,
    heartbeat,
  };
}

/**
 * Запускает отсутствующие фиксированные сервисы в режиме preview или
 * переиспользует доступные/занятые порты.
 *
 * @param {object} args
 * @param {string} args.mode Разрешён только "preview".
 * @param {string} args.repoRoot Корень репозитория для cwd команды.
 * @param {object|null} args.store Экземпляр RuntimeStore для финального статуса.
 * @returns {Promise<object>} Полезная нагрузка результата запуска.
 */
export async function startMonitorServices({ mode, repoRoot, store }) {
  if (mode !== monitorServiceContract.serviceLifecycleModes.preview) {
    throw new Error("monitor-service-start supports only --mode=preview");
  }

  const gateway = await ensureFixedService({
    service: monitorServiceContract.gateway,
    primaryProbeUrl: monitorServiceContract.gateway.healthUrl,
    repoRoot,
  });
  const monitor = await ensureFixedService({
    service: monitorServiceContract.monitor,
    primaryProbeUrl: monitorServiceContract.monitor.url,
    repoRoot,
  });
  const status = await collectMonitorServiceStatus(store);

  return {
    schema_version: "1.0",
    generated_at: timestamp(),
    command: "monitor-service-start",
    service_lifecycle_mode: mode,
    gateway_url: monitorServiceContract.gateway.url,
    monitor_url: monitorServiceContract.monitor.url,
    services: {
      gateway,
      monitor,
    },
    status,
  };
}

export function activeRowsReportPayload(store) {
  if (!store) {
    return {
      ok: false,
      error: {
        code: "runtime_store_unavailable",
        message: "Runtime store is not available.",
      },
      data: null,
    };
  }

  try {
    return {
      ok: true,
      data: JSON.parse(store.activeRowsReport({ "actor-role": "dialog_assistant" })),
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: diagnosticFromError(error),
    };
  }
}

export function heartbeatFromActiveRowsReport(activeRowsReport) {
  const report = activeRowsReport?.data ?? {};
  return {
    freshness: report.monitor_heartbeat_freshness ?? null,
    fresh: typeof report.monitor_heartbeat_fresh === "boolean" ? report.monitor_heartbeat_fresh : null,
    last_at: report.monitor_heartbeat_last_at ?? null,
    age_seconds: report.monitor_heartbeat_age_seconds ?? null,
    source: report.monitor_heartbeat_source ?? null,
    interval_ms: report.monitor_heartbeat_interval_ms ?? null,
    stale_after_seconds: report.monitor_heartbeat_stale_after_seconds ?? null,
    expected_gateway_url: report.monitor_heartbeat_expected_gateway_url ?? monitorServiceContract.heartbeat.expectedGatewayUrl,
    expected_monitor_url: report.monitor_heartbeat_expected_monitor_url ?? monitorServiceContract.heartbeat.expectedMonitorUrl,
    gateway_url: report.monitor_heartbeat_gateway_url ?? null,
    monitor_url: report.monitor_heartbeat_monitor_url ?? null,
    gateway_url_matches_expected: report.monitor_heartbeat_gateway_url_matches_expected ?? null,
    monitor_url_matches_expected: report.monitor_heartbeat_monitor_url_matches_expected ?? null,
    expected_url_mismatch: report.monitor_heartbeat_expected_url_mismatch ?? null,
  };
}

export function heartbeatContractOk(heartbeat) {
  return heartbeat.freshness === "fresh"
    && heartbeat.expected_gateway_url === monitorServiceContract.heartbeat.expectedGatewayUrl
    && heartbeat.expected_monitor_url === monitorServiceContract.heartbeat.expectedMonitorUrl
    && heartbeat.gateway_url_matches_expected === true
    && heartbeat.monitor_url_matches_expected === true
    && heartbeat.expected_url_mismatch === false
    && (heartbeat.source === monitorServiceContract.heartbeat.expectedSource || heartbeat.source === null);
}

function monitorStatusChecks({
  healthProbe,
  snapshotProbe,
  monitorProbe,
  gatewayPortProbe,
  monitorPortProbe,
  activeRowsReport,
  heartbeat,
}) {
  const heartbeatOk = heartbeatContractOk(heartbeat);
  return {
    pass: activeRowsReport.ok && heartbeatOk,
    active_rows_report: activeRowsReport.ok ? "pass" : "fail",
    heartbeat_contract: heartbeatOk ? "pass" : "fail",
    gateway_health_probe: probeState(healthProbe),
    gateway_snapshot_probe: probeState(snapshotProbe),
    monitor_root_probe: probeState(monitorProbe),
    gateway_port_probe: gatewayPortProbe.open ? "open" : "closed_or_inconclusive",
    monitor_port_probe: monitorPortProbe.open ? "open" : "closed_or_inconclusive",
    fixed_gateway_url: monitorServiceContract.gateway.url,
    fixed_monitor_url: monitorServiceContract.monitor.url,
    gateway_health_route: "/health",
    gateway_snapshot_route: "/snapshot",
  };
}

function probeState(probe) {
  if (probe.ok) {
    return "reachable";
  }
  return probe.reachable === false ? "unreachable_or_blocked" : "failed";
}

function probeBlocked(probe) {
  return probe?.error?.code === "EPERM" || probe?.error?.code === "EACCES";
}

async function ensureFixedService({ service, primaryProbeUrl, repoRoot }) {
  const initialProbe = await httpProbe(primaryProbeUrl, { expectJson: service.name === monitorServiceContract.gateway.name });
  const portProbe = await tcpProbe(service.host, service.port);

  if (initialProbe.ok) {
    return serviceResult(service, "candidate_reuse", "reachable", {
      initial_probe: initialProbe,
      port_probe: portProbe,
    });
  }

  if (portProbe.open) {
    return serviceResult(service, "candidate_reuse", "port_busy", {
      initial_probe: initialProbe,
      port_probe: portProbe,
    });
  }

  if (probeBlocked(initialProbe) || probeBlocked(portProbe)) {
    return serviceResult(service, "candidate_reuse", "probe_blocked", {
      initial_probe: initialProbe,
      port_probe: portProbe,
    });
  }

  const spawnResult = spawnFixedService(service, repoRoot);
  const reachableAfterStart = await waitForProbe(primaryProbeUrl, {
    expectJson: service.name === monitorServiceContract.gateway.name,
  });

  return serviceResult(service, "start_attempted", reachableAfterStart.ok ? "started" : "start_unconfirmed", {
    initial_probe: initialProbe,
    port_probe: portProbe,
    spawn: spawnResult,
    after_start_probe: reachableAfterStart,
  });
}

function spawnFixedService(service, repoRoot) {
  try {
    const [command, ...args] = service.command;
    const child = spawn(command, args, {
      cwd: repoRoot,
      detached: true,
      stdio: "ignore",
    });
    child.unref();
    return {
      ok: true,
      pid: child.pid,
      command: commandLine(service.command),
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      pid: null,
      command: commandLine(service.command),
      error: diagnosticFromError(error),
    };
  }
}

async function waitForProbe(url, { expectJson }) {
  const deadline = Date.now() + startTimeoutMs;
  let lastProbe = await httpProbe(url, { expectJson });
  while (!lastProbe.ok && Date.now() < deadline) {
    await delay(startPollIntervalMs);
    lastProbe = await httpProbe(url, { expectJson });
  }
  return lastProbe;
}

function serviceResult(service, lifecycleAction, reason, diagnostics) {
  return {
    name: service.name,
    url: service.url,
    command: commandLine(service.command),
    lifecycle_action: lifecycleAction,
    reason,
    diagnostics,
  };
}

function commandLine(command) {
  return command.join(" ");
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
