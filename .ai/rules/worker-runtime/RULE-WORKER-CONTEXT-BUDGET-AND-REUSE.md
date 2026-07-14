# Правило: контекст и переиспользование worker-сессии (`RULE-WORKER-CONTEXT-BUDGET-AND-REUSE`)

```yaml
artifact_id: RULE-WORKER-CONTEXT-BUDGET-AND-REUSE
artifact_type: ai-runtime-rule
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/rules/worker-runtime/
related_workflows:
  - .ai/workflows/core/worker-assignment/WORKFLOW.md
checks:
  - .ai/checks/worker-runtime/CHECK-WORKER-CONTEXT-BUDGET-REUSE.md
  - .ai/checks/worker-runtime/CHECK-WORKER-ASSIGNMENT-SCOPE.md
```

## Назначение (`purpose`)

Диалоговый ассистент должен принимать решение о повторном использовании существующего
worker-а только если это снижает риск и не расширяет scope.

Каждый worker запускается как отдельная runtime session. Reuse не может
объединять роли `repository-search-worker`, implementer, reviewer и coordinator
в одну session и не может превращать Dialog Assistant в coordinator group.

## Критерии reuse (`reuse_criteria`)

Дифференцированное правило:

1. `same_profile`: профиль worker-а совпадает с новым.
2. `same_owner_layer`: целевой owner-layer совпадает.
3. `same_scope`: `allowed_paths`, `forbidden_paths`, `create/edit/delete`
   совместимы по инварианту (без расширения).
4. `contour_match`: contour-owner и source of truth совпадают.
5. `context_fit`: текущий estimate + резервы помещается в доступный budget.
6. `role_boundary_match`: session не смешивает search, implementation, review
   и coordinator roles.

Если любой критерий не соблюдён — только `spawn`.

Если `role_boundary_match=false` из-за смешивания search, implementation,
review или coordinator roles в одной session, `reuse` и `spawn` hard-fail до
создания отдельной runtime session с одной ролью.

## Контекстный порог (`budget_policy`)

Dialog Assistant обязан считать:

- `remaining_budget` в активной worker-сессии;
- `expected_delta` новой задачи;
- `safety_margin` (не менее 10–20% от `expected_delta`).

Правило reuse:

- reuse допустим при `remaining_budget >= expected_delta + safety_margin`;
- иначе новый worker (`spawn`) и, при необходимости, split на sub-задачи.

## Выход из блока решения (`decision_output`)

- `reuse`: если критерии соблюдены и budget fit.
- `spawn`: при budget-ограничении, контекстной деградации, scope mismatch
  или конфликте chain.

## Запреты (`forbidden`)

- Нельзя принудительно reuse при снижении качества из-за context overflow.
- Нельзя скрывать почему выбран `spawn` или `split`.
- Нельзя переносить write scope между сессиями как оправдание reuse.
- Нельзя reuse `dialog-assistant` как group coordinator.
- Нельзя reuse implementer/reviewer session для repository search.
- Нельзя выполнять reuse/spawn, если целевая session смешивает роли
  search/implementation/review/coordinator.

## Выход (`output`)

```text
reuse_or_spawn: reuse|spawn|split
context_budget_fit: true|false
role_boundary_fit: true|false
reuse_justification: <short reason>
spawn_justification: <short reason or none>
```
