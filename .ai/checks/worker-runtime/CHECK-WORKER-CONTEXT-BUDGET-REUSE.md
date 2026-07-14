# Проверка: context budget и reuse/spawn решение (`CHECK-WORKER-CONTEXT-BUDGET-REUSE`)

```yaml
check_id: CHECK-WORKER-CONTEXT-BUDGET-REUSE
artifact_type: ai-runtime-check
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/checks/worker-runtime/
related_rule: .ai/rules/worker-runtime/RULE-WORKER-CONTEXT-BUDGET-AND-REUSE.md
```

## Назначение (`purpose`)

Проверяет, можно ли продолжать в текущей worker-сессии или требуется `spawn/split`.

## Процедура (`procedure`)

1. Получить `remaining_budget` текущего worker-а и его current scope.
2. Рассчитать `expected_task_delta` для нового задания.
3. Рассчитать `safety_margin` (минимум 10%).
4. Проверить criteria:
   - same_profile
   - same_owner_layer
   - scope_compatibility
   - same_contour_owner
   - remaining >= expected + margin
5. Убедиться, что решение записано в manifest (`reuse_or_spawn`).
6. Для group/staged chain проверить, что `reuse_or_spawn` зафиксирован
   по каждому `worker_group` или `launch_stage`.

## Критерии pass (`pass`)

- `reuse_or_spawn=reuse` только при выполненных criteria.
- `spawn/split` при нехватке headroom или scope mismatch.
- Контекстное решение согласовано до `worker_launch`.
- Для group/staged chain нет stage/group без context решения.

## Критерии fail (`fail`)

- reuse принят при дефиците контекста.
- отсутствует `expected_task_delta` или `remaining_budget`.
- смешение `spawn` и `reuse` в одном manifest.
- решение отсутствует после `context_budget_reuse_or_spawn` state.
- Для group/staged chain отсутствует `reuse_or_spawn` хотя бы для одной группы/стадии.

## Вывод (`output`)

```text
context_budget_check: pass|fail|not_available
context_fit: true|false
reuse_or_spawn: reuse|spawn|split
decision_evidence: <short reason>
margin_coverage: <percent>
group_context_strategy: complete|incomplete|not_applicable
```
