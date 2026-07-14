# RULE-WORKING-ARTIFACT-LANGUAGE

```yaml
rule_id: RULE-WORKING-ARTIFACT-LANGUAGE
title: Русский язык рабочих artifacts
artifact_type: global-project-rule
owner_layer: .ai/rules/global/
rule_scope: project-wide
scope: working_artifacts_and_handoffs
applies_to:
  - .ai tasks
  - .ai reports
  - .ai audits
  - .ai roles
  - .ai rules
  - .ai checks
  - .ai workflows
  - .ai templates
  - .codex project skills
  - code comments
  - handoff artifacts
enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
check: .ai/checks/self-review/CHECK-WORKING-ARTIFACT-LANGUAGE.md
registry: .ai/registry/rules/INDEX.md
related_templates:
  - .ai/templates/markdown/TEMPLATE-AI-RUNTIME-MARKDOWN.md
related_rules:
  - .ai/rules/development/RULE-CODE-COMMENT-DISCIPLINE.md
```

## Назначение

Правило отделяет язык ответа ассистента от языка сохраняемых рабочих
artifacts. Формат ответа пользователю задаётся системными/диалоговыми
инструкциями и ролью текущей сессии. Рабочие artifacts проекта должны быть
единообразно читаемы командой и по умолчанию пишутся на русском языке.

## Требование

На русском языке пишутся:

- tasks, assignments, checklists и handoff summaries;
- audits, reports, reviews и implementation handoff;
- role cards, rules, checks, workflows, templates и registry prose;
- project Codex skill descriptions и procedure text;
- code comments, TSDoc descriptions и `@description`, если нет
  технической причины использовать другой язык.

На языке оригинала сохраняются:

- code identifiers, artifact ids, enum/status values, API names, package names;
- file paths, command names, CLI flags, branch names, commit hashes;
- external protocol names, tool output, errors, quotes и vendor text;
- технические термины, если перевод делает contract менее точным.

Если рабочий artifact вынужденно содержит английский prose, причина должна быть
локально понятна из контекста: quote, external output, technical identifier,
vendor/protocol wording или task-specific exception.

## Запрещено

- Смешивать русский и английский prose без технической причины.
- Оставлять видимые служебные заголовки на английском, если они не являются
  stable id, enum, path или внешней цитатой.
- Переводить code identifiers, API names, command names, flags, paths или
  protocol names.
- Использовать английский язык как shortcut для новых tasks, reports, rules,
  checks, workflows или handoff artifacts.
- Подменять проверку artifact language проверкой только user-facing response.

## Обязательный вывод

```text
working_artifact_language: passed|not_required|stop-for-approval|failed
artifact_paths:
artifact_language:
response_language_separate: yes|no
technical_original_terms_preserved: yes|no
english_prose_exception:
blocker:
```
