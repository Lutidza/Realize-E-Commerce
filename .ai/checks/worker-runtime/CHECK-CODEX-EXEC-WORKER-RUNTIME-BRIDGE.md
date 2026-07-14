# Проверка: Codex exec worker runtime bridge (`CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE`)

```yaml
check_id: CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE
title: Проверка runtime bridge для внешних codex exec worker-ов
artifact_type: ai-runtime-check
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/checks/worker-runtime/
related_rules:
  - .ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md
  - .ai/rules/worker-runtime/RULE-WORKER-ASSIGNMENT-MANIFEST.md
  - .ai/rules/worker-runtime/RULE-WORKER-DIALOG-COORDINATION.md
related_checks:
  - .ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md
  - .ai/checks/worker-runtime/CHECK-WORKER-HANDOFF-READY.md
related_workflows:
  - .ai/workflows/core/worker-assignment/WORKFLOW.md
  - .ai/workflows/core/worker-session/WORKFLOW.md
codex_adapter:
  - .codex/skills/codex-external-worker-session/SKILL.md
runtime_store: .ai/tools/agent-runtime/runtime/runtime.sqlite
runtime_tool: .ai/tools/agent-runtime
execution_backend: codex_exec
status: active
```

## Назначение

Проверка запрещает запуск рабочих роёв через встроенный `spawn_agent`.
Для этой рабочей среды допустимый backend worker-а - внешний `codex exec`,
зарегистрированный в runtime store и видимый в agent monitor.

Единственный допустимый путь:

```text
session-upsert planned
-> group-upsert / group-member-upsert / group-edge-upsert, если есть group
-> presence-set waiting
-> worker-launch-preflight pass
-> codex exec process start
-> process-upsert / session-upsert running
-> result notification / result artifact
-> session-upsert closed + presence offline
```

## Входы

- `session_id`;
- `group_id`, если запускается group/staged execution;
- `assignment_manifest`;
- `allowed_paths` и `forbidden_paths`;
- `prompt_summary`;
- `worker_launch_preflight` JSON;
- `process_id`, `pid` и `execution_backend=codex_exec`, если worker уже
  запущен;
- `result_state` и `resolution` перед handoff.

## Pass contract до `codex exec`

```text
codex_exec_worker_runtime_bridge_check: pass
planned_session_written: true
planned_session_visible: true
presence_written: true
group_topology_visible: true|not_applicable
worker_launch_preflight.pass: true
worker_launch_preflight.checks.spawn_allowed: true
execution_backend: codex_exec
codex_exec_allowed: true
spawn_agent_allowed: false
```

## Pass contract после запуска

```text
codex_exec_worker_runtime_bridge_check: pass
process_recorded: true
runtime_status_recorded: running|result-ready|closed
presence_state_recorded: working|waiting|idle|offline
result_recorded_before_close: true
close_resolution_recorded_before_handoff: true
```

## Fail contract

```text
codex_exec_worker_runtime_bridge_check: fail
codex_exec_allowed: false
spawn_agent_allowed: false
blocker: missing_planned_session|missing_presence|preflight_failed|group_topology_not_visible|process_missing|result_missing|close_missing|spawn_agent_requested
```

## Запрещено

- Вызывать `spawn_agent` для рабочих роёв и документалистов этого проекта.
- Запускать `codex exec` до planned session и `worker-launch-preflight pass`.
- Запускать worker group без visible group record, members и edges.
- Терять `process_id`/`pid`/execution backend после фактического запуска.
- Считать worker output delivery result без runtime result notification или
  согласованного result artifact.
- Передавать результат пользователю, если worker не закрыт или не имеет явного
  user-approved deferral/blocker contract.
- Использовать user-facing диалог как замену runtime lifecycle trace.

## Команды проверки

Перед запуском:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- worker-launch-preflight --session-id=<session-id> --group-id=<group-id> --json
```

После запуска:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- process-upsert --process-id=<process-id> --session-id=<session-id> --backend=codex_exec --cwd=<repo> --status=running
npm --prefix .ai/tools/agent-runtime run runtime -- session-upsert --actor-role=dialog_assistant --session-id=<session-id> --worker-kind=external_process --role=<role> --status=running --mission="<bounded task>" --assigned-by=dialog-assistant
npm --prefix .ai/tools/agent-runtime run runtime -- presence-set --session-id=<session-id> --presence-state=working --current-activity="<worker activity>"
```

## Выход

```text
codex_exec_worker_runtime_bridge_check: passed|failed|not_required
session_id: <id>
group_id: <id|not_applicable>
preflight_pass: true|false|not_run
codex_exec_allowed: true|false
spawn_agent_allowed: false
process_recorded: true|false|not_applicable
result_recorded: true|false|not_applicable
closed_or_deferred: true|false|not_applicable
blocker: <reason|none>
```
