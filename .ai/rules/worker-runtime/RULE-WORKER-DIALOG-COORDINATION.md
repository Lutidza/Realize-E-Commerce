# Правило: Dialog Assistant как coordinator (`RULE-WORKER-DIALOG-COORDINATION`)

```yaml
artifact_id: RULE-WORKER-DIALOG-COORDINATION
artifact_type: ai-runtime-rule
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/rules/worker-runtime/
related_workflows:
  - .ai/workflows/core/worker-assignment/WORKFLOW.md
checks:
  - .ai/checks/worker-runtime/CHECK-WORKER-PROFILE-REFERENCES.md
  - .ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md
  - .ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md
  - .ai/checks/worker-runtime/CHECK-WORKER-DIALOG-SURFACE-BUDGET.md
  - .ai/checks/worker-runtime/CHECK-WORKER-HANDOFF-READY.md
```

## Назначение (`purpose`)

Dialog Assistant не выполняет write-задачи, repository search или worker-group
coordination напрямую по умолчанию. При worker group он действует только как
bootstrap/review/handoff owner, а group coordinator является отдельной
runtime-visible worker-session.

## Ключевые требования (`requirements`)

- Direct execution разрешён только после явной бизнес-подтверждённой
  инструкции пользователя.
- Если пользователь просит worker group, Dialog Assistant не выполняет
  direct implementation/search напрямую, включая read-only repository search;
  он создаёт отдельные runtime sessions для `repository-search-worker`,
  implementer/reviewer worker-ов и coordinator-а.
- Любая user-facing реализация задач должна проходить:
  `task_intake -> pre_launch_gate -> monitor_visibility_gate -> worker_launch`.
- Worker получает только task-specific manifest; роли и правила не расширяются
  ad-hoc.
- Worker должен отчитываться в peer evidence chain до coordinator-а, а
  coordinator передаёт vetted handoff Dialog Assistant-у.
- Обязательная evidence chain:
  `search-worker -> implementer/coordinator -> reviewer -> coordinator -> Dialog Assistant`.
- Dialog Assistant не запускает worker-а, пока session/group/presence не видны
  через agent-runtime gateway и agent monitor.
- Для рабочих роёв Dialog Assistant использует внешний `codex exec` worker
  bridge: planned session, visible group topology, `worker-launch-preflight
  pass`, затем `codex exec`, process tracking, result notification и closure.
- Dialog Assistant держит user-facing диалог в compact mode: в чат пишутся
  только старт группы, blocker/approval request, редкий stage summary и
  финальный handoff. Полный runtime trace, worker progress, peer messages и
  tool outputs остаются в agent-runtime/monitor или artifact.

## Ограничения (`forbidden`)

- Запрещено закрывать задачу пользователю worker-ом минуя Dialog Assistant.
- Запрещено назначать `dialog-assistant` coordinator-ом worker group.
- Dialog Assistant не является coordinator-worker; он выполняет только
  bootstrap/review/handoff.
- Запрещено выполнять repository search без отдельной
  `repository-search-worker` runtime session.
- Запрещено использовать `spawn_agent` для рабочих роёв и документалистов этого
  проекта; такие worker-ы запускаются через `codex exec`.
- Запрещено выполнять `commit/push`, `task close`, `scope expansion`, `destructive
  command` без coordinator-review.
- Запрещено смешивать `direct worker execution` и `dialog-only execution` без
  явного перехода в `direct_execution_policy_gate`.
- Запрещено засорять user-facing диалог потоком lifecycle команд, snapshot/log
  output, полными worker replies или повторяющимися progress messages, если
  нет blocker, approval request или важного stage decision.

## Выход (`output`)

```text
coordination_mode: worker-only|direct-execution-approved
coordinator_session_id: <separate-worker-session-id|not_applicable>
coordinator_is_separate_worker_session: true|false|not_applicable
repository_search_worker_required: true|false
peer_evidence_chain_required: true|false
direct_bypass_allowed: true|false
handoff_chain_active: true|false
monitor_visibility_gate: pass|fail
codex_exec_worker_runtime_bridge: pass|fail|not_applicable
dialog_surface_budget: pass|fail|not_required
```
