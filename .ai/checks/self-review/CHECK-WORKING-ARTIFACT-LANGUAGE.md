# CHECK-WORKING-ARTIFACT-LANGUAGE

```yaml
artifact_id: CHECK-WORKING-ARTIFACT-LANGUAGE
artifact_type: ai-self-review-check
owner_layer: .ai/checks/self-review/
rule: .ai/rules/global/RULE-WORKING-ARTIFACT-LANGUAGE.md
enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
registry: .ai/registry/rules/INDEX.md
check_stage: self_review_artifact_language_gate
rule_scope: project-wide
scope: working_artifacts_and_handoffs
```

## Условие срабатывания

Запускать при создании или изменении рабочих artifacts проекта:

- `.ai/tasks/**`;
- `.ai/reports/**`;
- `.ai/roles/**`;
- `.ai/rules/**`;
- `.ai/checks/**`;
- `.ai/workflows/**`;
- `.ai/templates/**`;
- `.codex/skills/**` project skill files;
- code comments или file headers в изменяемом коде;
- handoff artifacts, которые сохраняются в репозитории.

Проверка не требуется для vendor output, external quotes, generated tool
output, code identifiers, paths, commands, API names, package names и protocol
names на языке оригинала.

## Входы

- список созданных или изменённых working artifacts;
- типы artifacts;
- язык основного prose;
- список английских prose fragments, если они есть;
- reason для каждого исключения;
- наличие technical identifiers, paths, commands и внешних quotes.

## Процедура

1. Определить, созданы или изменены working artifacts.
2. Если working artifacts нет, вернуть `not_required`.
3. Отделить user-facing response language от artifact language.
4. Проверить, что основной prose рабочих artifacts написан на русском языке.
5. Проверить, что technical identifiers, API names, commands, paths, flags,
   statuses и external quotes сохранены на языке оригинала.
6. Для английского prose проверить reason: quote, external output, stable
   vendor/protocol wording или approved exception.
7. Если английский prose является обычным служебным заголовком или narrative
   text без причины, вернуть `failed` или `stop-for-approval`.

## Условия прохождения

- Основной prose рабочих artifacts написан на русском языке.
- Формат ответа пользователю не смешан с language contract для artifacts.
- Technical identifiers и внешние имена не переведены.
- Все английские prose fragments имеют техническую причину или являются
  внешней цитатой/output.

## Условия ошибки

- Рабочий task/report/rule/check/workflow/template/handoff написан на
  английском без технической причины.
- Видимый служебный заголовок оставлен на английском без статуса stable id.
- Code comments на английском без причины в изменяемом project-owned code.
- Идентификаторы, команды, paths, API names или protocol names переведены и
  потеряли точность.
- Проверен только язык ответа ассистента, а не язык сохранённого artifact.

## Вывод

```text
working_artifact_language_check: passed|not_required|stop-for-approval|failed
artifact_paths:
artifact_language:
response_language_separate: yes|no
technical_original_terms_preserved: yes|no
english_prose_exception:
blocker:
```
