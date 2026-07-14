# Правило: selection модели worker-а (`RULE-WORKER-MODEL-SELECTION`)

```yaml
artifact_id: RULE-WORKER-MODEL-SELECTION
artifact_type: ai-runtime-rule
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/rules/worker-runtime/
related_workflows:
  - .ai/workflows/core/worker-assignment/WORKFLOW.md
checks:
  - .ai/checks/worker-runtime/CHECK-WORKER-MODEL-SELECTION.md
```

## Назначение (`purpose`)

Диалоговый ассистент определяет модель для каждого worker-а перед `worker_launch`,
а `codex exec` получает уже валидный выбор в `assignment manifest`.

## Модельная матрица (`model_matrix`)

`small/simple tasks`:

- `gpt-5.3-codex-spark`

`standard coding tasks`:

- `gpt-5.3-codex`

`complex/high-risk tasks`:

- `advanced_current` (если доступен)
- fallback только при явном отсутствии доступной `advanced_current`: `gpt-5.3-codex`

## Требования (`requirements`)

Перед выбором модели Dialog Assistant обязан зафиксировать:

- причина категории сложности (`task_complexity`),
- критерий решения (`selection_rationale`),
- подтверждение о доступности выбранной модели (`model_availability`),
- проверочное условие для fallback-а.

Для group/staged execution модельный gate обязателен на каждом
`worker_group`/`launch_stage`: либо явный `selected_model`, либо
`model_inherit_from_manifest=true` с указанием базовой модели manifest.

## Запреты (`forbidden`)

- Нельзя использовать несуществующие идентификаторы моделей.
- Нельзя оставлять модель неуказанной при запуске worker-а.
- Нельзя менять модель на более слабую без сохранения rationale.
- Нельзя запускать group/staged chain, где хотя бы одна группа/стадия
  не имеет model decision.

## Выход (`output`)

```text
selected_model: gpt-5.3-codex-spark|gpt-5.3-codex|advanced_current
selection_rationale: <short reason>
model_available: true|false
fallback_used: true|false
group_model_gate: pass|fail|not_applicable
decision: pass|stop-for-approval|failed
```
