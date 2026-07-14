# CHECK-CODE-COMMENT-DISCIPLINE

```yaml
artifact_id: CHECK-CODE-COMMENT-DISCIPLINE
artifact_type: ai-development-check
owner_roles:
  - .ai/roles/developer/frontend/INDEX.md
  - .ai/roles/developer/backend/INDEX.md
owner_layer: .ai/checks/development/
rule: .ai/rules/development/RULE-CODE-COMMENT-DISCIPLINE.md
related_rule: .ai/rules/documentation/RULE-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE.md
related_check: .ai/checks/pre-implementation/CHECK-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE.md
templates:
  - .ai/templates/code-comments/TEMPLATE-TSDOC-FILE-HEADER.md
codex_skill: .codex/skills/code-comment-discipline/SKILL.md
check_stage: development_self_review
scope: changed_code_files
```

## Условие срабатывания

Запускать, если задача создаёт или меняет TypeScript, JavaScript, JSX, TSX,
MJS или другой source-файл, где применимы TSDoc comments.

Проверка не запускается для чисто markdown/report/task изменений, если они не
меняют кодовые comments или templates.

## Входы

- список изменяемых code files;
- allowlist текущей задачи;
- существующие file headers;
- наличие public/exported API, boundary files, DTO, mapper, service/action,
  shared UI primitive, widget, route boundary или tool adapter;
- применимые документы в `docs/**`;
- `canonical_documentation_gate` и `canonical_doc_decision`, если файл меняет
  contract-level поведение или `@docref`;
- причина отсутствия `@docref`, если документ не найден или не требуется;
- выбранный TSDoc template.

## Процедура

1. Классифицировать каждый изменяемый source-файл.
2. Определить, нужен ли file header.
3. Если header уже есть, проверить `@file`, `@version`, `@docref`, `@see` и
   `@description`.
4. Если header нужен и отсутствует, добавить его только в рамках allowlist.
5. Проверить, что `@file` совпадает с путём от корня проекта.
6. Проверить, что `@description` описывает ответственность файла.
7. Если указан `@docref`, проверить, что `@see` ведёт в существующий или
   согласованный документ `docs/**`.
8. Если `@docref` отсутствует, проверить, что есть `docref_absent_reason`.
9. Если файл меняет contract-level поведение или `@docref`, проверить, что
   canonical documentation gate выполнен или остановил реализацию.
10. Проверить public functions/components на обязательные локальные comments.
11. Если корректная правка требует documentation sync или расширения allowlist,
    вернуть `stop-for-approval`.

## Условия прохождения

- Все новые source-файлы в allowlist имеют корректный header либо documented
  exception.
- Изменяемые boundary/contract/source owner files имеют header.
- `@docref`/`@see` указывают на проектную документацию, а не на active AI rule.
- Отсутствие `@docref` объяснено и не скрывает contract-level debt.
- Public/exported API comments добавлены там, где они нужны.
- Comments объясняют локальную ответственность и не дублируют docs/specs.

## Вывод

```text
code_comment_discipline_check: passed|failed|not_required|stop-for-approval
changed_code_files:
header_required:
header_updated:
docref_decision:
docref_absent_reason:
public_api_comments_required:
public_api_comments_updated:
canonical_documentation_gate:
documentation_sync_required: yes|no
blocker:
```
