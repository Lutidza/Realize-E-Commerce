# Проверка: worker lifecycle перед handoff (`CHECK-WORKER-SESSION-LIFECYCLE-BEFORE-HANDOFF`)

```yaml
artifact_id: CHECK-WORKER-SESSION-LIFECYCLE-BEFORE-HANDOFF
artifact_type: ai-self-review-check
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/checks/self-review/
rule: .ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md
workflow: .ai/workflows/core/worker-session/WORKFLOW.md
related_checks:
  - .ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md
  - .ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md
  - .ai/checks/worker-runtime/CHECK-WORKER-DIALOG-SURFACE-BUDGET.md
  - .ai/checks/worker-runtime/CHECK-WORKER-HANDOFF-READY.md
runtime_store: .ai/tools/agent-runtime/runtime/runtime.sqlite
```

## Назначение (`purpose`)

Проверка применяется перед финальным ответом, паузой шага или handoff
пользователю, если в шаге были worker-сессии.

## Процедура (`procedure`)

1. Найти active worker sessions.
2. Найти active `dialog-assistant`, coordinator и worker sessions.
3. Проверить `running`, `result-ready`, `needs-review`, `blocked`.
4. По каждой незавершённой session проверить решение: accepted, continued,
   reassigned, blocked-with-reason, user-approved-deferral или closed.
5. Проверить, что `presence_state: working` стоит только у фактически
   работающих worker-ов.
6. Hard-fail перед final handoff, если любая `dialog-assistant`, coordinator
   или worker session остаётся `status: running` или `presence_state: working`.
7. Проверить, что каждая active worker/group session имеет monitor-visible
   lifecycle trail: planned record, launch event или blocker, presence,
   `process-upsert` и `backend=codex_exec` для запущенного worker-а.
8. Проверить high/urgent notifications и result/blocker notifications.
9. Если есть messages trace, проверить, что он не содержит secrets, tokens,
   raw private reasoning или лишние PII.
10. Проверить, что user-facing диалог не был использован как полный lifecycle
   trace: подробности должны быть в runtime/monitor или artifacts, а handoff
   должен быть compact vetted summary.
11. Если worker group/staged chain дошла до terminal decision
    (`accepted`, `blocked`, `needs-review`, `user-approved-deferral`), проверить,
    что Dialog Assistant отправляет в текущий диалог compact final report. Не
    закрывать `dialog-assistant` и не завершать turn только runtime closure.

## Условия прохождения (`pass`)

- Нет unresolved sessions без решения.
- Нет `dialog-assistant`, coordinator или worker sessions в `running` или
  `working` перед final handoff.
- UI presence не помечает ожидающие/закрытые sessions как working.
- Нет запущенных worker-ов без runtime-visible launch trail.
- Нет блокирующих notifications без реакции Dialog Assistant-а.
- Messages trace безопасен или не нужен текущему шагу.
- Dialog surface budget соблюдён или deviation явно зафиксирован.
- При завершённой worker group пользователь получил final compact report в
  текущем диалоге.

## Условия ошибки (`fail`)

- Есть active session без решения.
- Любая `dialog-assistant`, coordinator или worker session остаётся `running`
  или `working` перед final handoff.
- Worker показывает `working`, хотя задача завершена или ждёт решения.
- Worker был запущен без planned row, codex exec process record или
  monitor-visible presence.
- Есть high/urgent notification без реакции.
- Trace содержит secrets, raw private reasoning или лишние PII.
- Диалог содержит full runtime/tool/worker output вместо compact handoff.
- Worker group закрыта в runtime/monitor, но текущий диалог не получил compact
  final report.

## Выход (`output`)

```text
worker_session_lifecycle_check: pass|fail|not_required
unresolved_sessions: <count>
running_or_working_sessions_before_handoff: <count>
presence_check: pass|fail|not_available
monitor_visibility_check: pass|fail|not_required
codex_exec_worker_runtime_bridge_check: pass|fail|not_required
blocking_notifications: <count>
messages_policy_check: pass|fail|not_required
dialog_surface_budget_check: pass|fail|not_required
dialog_final_report_check: pass|fail|not_required
dialog_final_report_emitted: yes|no
blocker: <short reason or none>
```
