# Проверка: видимость запуска worker-а в monitor (`CHECK-WORKER-MONITOR-VISIBILITY`)

```yaml
check_id: CHECK-WORKER-MONITOR-VISIBILITY
title: Проверка видимости запуска worker/group в agent monitor
artifact_type: ai-runtime-check
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/checks/worker-runtime/
related_rule: .ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md
related_workflows:
  - .ai/workflows/core/worker-assignment/WORKFLOW.md
  - .ai/workflows/core/worker-session/WORKFLOW.md
service_lifecycle_rule: .ai/rules/agent-runtime/RULE-AGENT-MONITOR-SERVICE-LIFECYCLE.md
runtime_store: .ai/tools/agent-runtime/runtime/runtime.sqlite
runtime_tool: .ai/tools/agent-runtime
runtime_gateway: http://127.0.0.1:8765/
monitor_url: http://127.0.0.1:5173/
```

## Назначение

Проверка запрещает запуск worker-а или группы worker-ов, если будущая
runtime node не видна в `agent-runtime` store/monitor contract до фактического
`codex exec`.

Для рабочих роёв этого проекта `spawn_agent` не является допустимым execution
backend. Его блокирует
`.ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md`.

Markdown artifact фиксирует pass/fail contract. Детерминированную проверку
выполняет runtime tool.

## Команда

Перед worker/group launch выполнить:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- worker-launch-preflight --session-id=<session-id> --group-id=<group-id> --json
```

Для single-worker запуска `--group-id` не передаётся.

## Pass contract

```text
worker_monitor_visibility_check: pass
service_lifecycle_mode: reuse_existing_only
worker_launch_preflight.pass: true
worker_launch_preflight.status: pass
monitor_heartbeat_freshness: fresh
monitor_heartbeat_expected_gateway_url: http://127.0.0.1:8765/
monitor_heartbeat_expected_monitor_url: http://127.0.0.1:5173/
planned_session_visible_before_launch: true
presence_written_before_launch: true
group_visible_before_launch: true|not_applicable
group_edges_visible_before_launch: true|not_applicable
coordinator_session_validation: pass|not_applicable
spawn_allowed: true
execution_backend_allowed: codex_exec
```

HTTP probe `/health` и `/snapshot` являются диагностикой из результата команды.
Они не заменяют runtime store и heartbeat contract.

## Fail contract

```text
worker_monitor_visibility_check: fail
worker_launch_preflight.pass: false
blocker: monitor_visibility_unavailable|planned_session_not_visible|presence_not_visible|group_not_visible|group_edges_not_visible|coordinator_not_visible|coordinator_not_separate|returns_to_invalid
spawn_allowed: false
```

Fail blocks launch unless the user explicitly approves an emergency deviation.

## Service lifecycle boundary

Worker launch is `reuse_existing_only`:

- do not start/stop/restart `agent-runtime gateway` or `agent-monitor UI`;
- do not switch host/port;
- use `preview`, not `dev`, for normal monitor UI operation;
- use `.ai/workflows/ai-operations/agent-monitor-service-lifecycle/WORKFLOW.md`
  only when the operator explicitly asks to start or inspect monitor services.
