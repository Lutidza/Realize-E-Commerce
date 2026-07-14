# Проверка: model selection для worker assignment (`CHECK-WORKER-MODEL-SELECTION`)

```yaml
check_id: CHECK-WORKER-MODEL-SELECTION
artifact_type: ai-runtime-check
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/checks/worker-runtime/
related_rule: .ai/rules/worker-runtime/RULE-WORKER-MODEL-SELECTION.md
```

## Назначение (`purpose`)

Проверяет корректность выбора модели перед запуском worker-а и предотвращает
несогласованный fallback.

## Процедура (`procedure`)

1. Читаем `task_complexity` и явные призывы пользователя.
2. Применяем матрицу из `RULE-WORKER-MODEL-SELECTION.md`.
3. Сравниваем:
   - выбранную модель,
   - ожидаемую модель по матрице,
   - `model_availability`.
4. Проверяем отсутствие недопустимых model IDs.
5. Если нужен `advanced_current`, проверяем подтверждённый fallback.
6. Для group/staged chain проверяем, что для каждой `worker_group`/`launch_stage`
   есть model decision или явное `model_inherit_from_manifest=true`.

## Критерии pass (`pass`)

- `selected_model` соответствует сложности и доступности.
- `fallback_used` только при обосновании.
- Никаких несуществующих или неподдерживаемых модельных идентификаторов.
- Для group/staged chain model gate закрыт по всем группам/стадиям.

## Критерии fail (`fail`)

- Нет причины выбора модели.
- Выбранная модель не входит в policy matrix.
- advanced-current запрошен, но нет решения о доступности/альтернативе.
- Для group/staged chain отсутствует model decision в хотя бы одной группе/стадии.

## Вывод (`output`)

```text
model_decision: pass|fail|stop-for-approval
selected_model: <model-id>
expected_model: <model-id>
selection_match: yes|no
fallback_reason: <short reason or none>
group_model_coverage: complete|incomplete|not_applicable
```
