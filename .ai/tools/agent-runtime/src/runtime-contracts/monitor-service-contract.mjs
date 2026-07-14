/**
 * @file .ai/tools/agent-runtime/src/runtime-contracts/monitor-service-contract.mjs
 * @version 0.1.0 - 2026-05-15 00:00
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Фиксированный локальный контракт сервиса для agent runtime
 * gateway и жизненного цикла agent monitor preview, используемый шлюзами
 * видимости запуска worker-а.
 */

export const monitorServiceContract = Object.freeze({
  gateway: Object.freeze({
    name: "agent-runtime-gateway",
    url: "http://127.0.0.1:8765/",
    healthUrl: "http://127.0.0.1:8765/health",
    snapshotUrl: "http://127.0.0.1:8765/snapshot",
    host: "127.0.0.1",
    port: 8765,
    command: Object.freeze(["npm", "--prefix", ".ai/tools/agent-runtime", "run", "gateway"]),
  }),
  monitor: Object.freeze({
    name: "agent-monitor-preview",
    url: "http://127.0.0.1:5173/",
    host: "127.0.0.1",
    port: 5173,
    command: Object.freeze(["npm", "--prefix", ".ai/tools/agent-monitor", "run", "preview"]),
  }),
  heartbeat: Object.freeze({
    expectedSource: "agent-monitor",
    expectedGatewayUrl: "http://127.0.0.1:8765/",
    expectedMonitorUrl: "http://127.0.0.1:5173/",
  }),
  serviceLifecycleModes: Object.freeze({
    preview: "preview",
    reuseExistingOnly: "reuse_existing_only",
  }),
});
