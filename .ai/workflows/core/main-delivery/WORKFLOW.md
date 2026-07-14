# Workflow: основная AI-доставка (`main_delivery_workflow`)

```yaml
artifact_id: main-delivery-workflow
artifact_type: ai-workflow
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/workflows/core/main-delivery/
runtime_sources:
  - .ai/system/state-machine.md
  - .ai/roles/role-groups.md
  - .ai/workflows/core/worker-session/WORKFLOW.md
checks:
```

## Назначение (`purpose`)

Workflow задаёт короткий порядок рабочего AI-шага от intake до handoff.

## Границы (`boundaries`)

- Active rules в active rules layer.
- Checks в `.ai/checks/*`.
- Worker lifecycle в `.ai/workflows/core/worker-session/WORKFLOW.md`.
- Delivery-specific шаги в `.ai/workflows/delivery/*`.
- Этот workflow не хранит payload schemas и не дублирует role cards.

## Состояния (`states`)

```text
dialog_assistant_entry_gate
-> intake
-> context_pack
-> role_selection
-> task_analysis_and_worker_plan
-> scope_gate
-> implementation
-> self_review
-> tests
-> docs_sync
-> human_acceptance
-> delivery_if_requested
-> handoff
```

## Контрольные состояния (`control_states`)

```text
blocked
needs_more_context
scope_expanded
rollback_required
```

## Правила переходов (`transitions`)

- `dialog_only` завершает шаг на `handoff`.
- `simple_direct_step` проходит короткий pre-edit gate и идёт к
  `implementation`.
- `managed_work_task` проходит Dialog Assistant intake, context pack и role
  analysis.
- Если нужны worker-ы, подключается worker-session workflow.
- Если нужен commit/push, destructive action, secrets или scope
  expansion, подключается профильный workflow и требуется отдельный gate.

## Маршрутизация DoD (`dod_routing`)

Критерии готовности (`DoD`) в этом workflow являются маршрутизацией по
фактическому scope, а не одним универсальным финальным check.

Перед `handoff` агент выбирает только применимые `DoD`-направления:

- `code` - профильные role/rule checks, tests/typecheck/lint или runtime
  evidence по blast radius, code comment discipline для новых и изменяемых
  boundary/source owner files;
- `docs` - documentation sync, language gate для working artifacts, отсутствие
  historical noise и проверка ссылок/paths в пределах allowlist;
- `schema` - migration/data contract review, PostgreSQL/PostGIS/read-only
  evidence при необходимости, backend tests и documentation sync для changed
  contract;
- `runtime` - worker/session lifecycle checks, runtime maintenance checks,
  safe command contract и stale artifact cleanup, если менялись runtime/tooling
  artifacts;
- `delivery` - только delivery-specific gates:
  `.ai/checks/pre-commit/CHECK-DELIVERY-COMMIT-SCOPE.md`,
  `.ai/checks/pre-push/CHECK-DELIVERY-PUSH-READINESS.md`,
  `.ai/workflows/delivery/git/commit-push/WORKFLOW.md`.

Запрещено:

- запускать один большой финальный check вместо выбора lane по scope;
- считать commit/push заменой tests, docs sync,
  contract review, runtime evidence или user acceptance;
- требовать нерелевантные checks для типов изменений, которых нет в diff;
- скрывать пропущенную проверку: если check не применялся, нужна причина.

## Пользовательская приёмка (`human_acceptance`)

`human_acceptance` является внешним gate, если пользователь должен вручную
проверить результат, UI, интеграцию, данные или workflow.

Если ручная приёмка требуется, агент передаёт результат и останавливает
переход к delivery/closure до подтверждения пользователя. Delivery может
продолжиться без ручной приёмки только если задача явно является
`delivery snapshot` или пользователь отдельно запросил commit/push текущего
состояния.

## Вход (`input`)

- последняя задача пользователя;
- текущий context pack;
- runtime state, если шаг использует worker sessions или agent runtime.

## Выход (`output`)

- выполненный direct step;
- Dialog Assistant plan или blocker;
- итоговый handoff пользователю.

## Передача результата (`handoff`)

Перед handoff проверить:

- нет незакрытых worker-сессий, которые блокируют результат;
- выполнены проверки по фактическому scope;
- пользователь видит только итог, blocker или явный следующий шаг.
