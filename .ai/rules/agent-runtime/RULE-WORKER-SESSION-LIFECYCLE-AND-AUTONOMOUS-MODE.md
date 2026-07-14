# Правило: lifecycle worker-сессий (`RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE`)

```yaml
artifact_id: RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE
artifact_type: ai-runtime-rule
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/rules/agent-runtime/
workflow: .ai/workflows/core/worker-session/WORKFLOW.md
checks:
  - .ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md
  - .ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md
  - .ai/checks/worker-runtime/CHECK-WORKER-DIALOG-SURFACE-BUDGET.md
  - .ai/checks/self-review/CHECK-WORKER-SESSION-LIFECYCLE-BEFORE-HANDOFF.md
runtime_store: .ai/tools/agent-runtime/runtime/runtime.sqlite
```

## Назначение (`purpose`)

Правило не даёт закрыть шаг, если worker-сессии ещё требуют решения.

## Требование (`requirement`)

Любой запуск worker-а или группы worker-ов должен быть monitor-visible до
фактического `codex exec` запуска. Source of truth для интерфейса мониторинга -
`agent-runtime` store/gateway, а не внутренний stream worker-а.

Для рабочих роёв проекта встроенный `spawn_agent` не используется.

Каждый worker, reviewer, repository-search-worker и group coordinator всегда
имеет отдельную runtime session. Coordinator worker group не может быть
`dialog-assistant`.

До запуска Dialog Assistant обязан пройти
`.ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md`:

- создать runtime session для `dialog-assistant`, если он координирует worker-ов;
- создать planned session для каждого worker-а;
- создать отдельную planned session для `repository-search-worker`, если
  нужен repository search;
- создать отдельную coordinator worker-session для worker group;
- создать group record, members и edges для group launch;
- записать корректный presence state;
- выполнить:
  `npm --prefix .ai/tools/agent-runtime run runtime -- worker-launch-preflight --session-id=<session-id> --group-id=<group-id> --json`;
- убедиться, что `pass=true`;
- только после этого запускать worker-а.

Для рабочих роёв дополнительно действует
`.ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md`: worker
запускается через внешний `codex exec` process после `worker-launch-preflight
pass`; `spawn_agent` для таких задач запрещён.

Сразу после запуска Dialog Assistant обязан записать execution handle,
перевести session/member в active/running и поставить
`presence_state: working`.

Если monitor-visible state недоступен, запуск останавливается с blocker
`monitor_visibility_unavailable`. Запуск без мониторинга допускается только как
отдельно зафиксированное emergency deviation по явному approval пользователя.

Перед handoff Dialog Assistant проверяет active sessions со статусами:

```text
running
result-ready
needs-review
blocked
```

Перед final handoff действует hard-fail gate: любое наличие
`dialog-assistant`, coordinator или worker session со `status: running` или
`presence_state: working` блокирует финальный ответ до закрытия, accepted
resolution, продолжения с explicit contract или user-approved deferral.

По каждой такой session нужно одно решение:

```text
accepted
continued
reassigned
blocked-with-reason
user-approved-deferral
closed
```

## Presence (`presence`)

UI-активность определяется не только lifecycle status. Worker считается
активным в интерфейсе, если `presence_state: working`. Завершённый или
ожидающий worker не должен оставаться визуально active только потому, что
session ещё открыта.

## Autonomous mode (`autonomous_mode`)

Autonomous grant разрешает Dialog Assistant принимать решения внутри согласованного
scope без повторного подтверждения пользователя.

Grant не разрешает:

- commit/push;
- task close;
- destructive commands;
- secrets access;
- allowlist/contour expansion;
- out-of-scope writes.

## Messages (`messages`)

Messages trace хранит только user-visible summaries, blockers, decisions и
artifact references. Secrets, tokens, raw private reasoning, hidden
chain-of-thought, production dumps и лишние PII запрещены.

User-facing диалог не является messages trace. При worker/group execution
Dialog Assistant обязан держать compact dialog surface: старт группы,
blocker/approval request, редкий stage summary и финальный handoff. Подробные
lifecycle/tool/progress details пишутся в runtime store, monitor или artifact,
а не в текущий чат.

Если пользователь просит worker group, Dialog Assistant не выполняет repository
search или implementation напрямую. Repository search выполняет отдельный
`repository-search-worker`, который передаёт evidence через runtime messages/edges.
Обязательная chain: `search-worker -> implementer/coordinator`,
`implementer -> reviewer`, `reviewer -> coordinator`,
`coordinator -> Dialog Assistant`.

## Границы (`boundaries`)

- Правило не требует сложные контрактные объекты для каждого решения.
- Если решение оставляет существенный риск, Dialog Assistant фиксирует короткую
  причину и следующий шаг.
- Детальные поля runtime store задаются writer/schema, а не этим правилом.

## Выход (`output`)

```text
unresolved_sessions: <count>
running_or_working_sessions_before_handoff: <count>
decisions_required: yes|no
presence_check: pass|fail
messages_policy_check: pass|fail|not_required
codex_exec_worker_runtime_bridge_check: pass|fail|not_required
dialog_surface_budget_check: pass|fail|not_required
blocker: <short reason or none>
```
