# RULE-CODE-COMMENT-DISCIPLINE

```yaml
artifact_id: RULE-CODE-COMMENT-DISCIPLINE
artifact_type: project-development-rule
owner_roles:
  - .ai/roles/developer/frontend/INDEX.md
  - .ai/roles/developer/backend/INDEX.md
owner_layer: .ai/rules/development/
enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
check: .ai/checks/development/CHECK-CODE-COMMENT-DISCIPLINE.md
related_rules:
  - .ai/rules/documentation/RULE-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE.md
templates:
  - .ai/templates/code-comments/TEMPLATE-TSDOC-FILE-HEADER.md
codex_skill: .codex/skills/code-comment-discipline/SKILL.md
registry: .ai/registry/rules/INDEX.md
rule_scope: project-wide
scope: changed_code_files
applies_to:
  - TypeScript source files
  - JavaScript source files
  - TSX/JSX source files
  - code comments
  - file headers
  - public API comments
```

## Назначение

Правило задаёт единый контракт оформления TSDoc и code comments в изменяемом
коде. Оно применяется к новым кодовым файлам и к изменяемым кодовым файлам в
согласованном allowlist.

`docs/**` остаётся независимой проектной документацией. Рабочий AI-layer не
подменяет её и не хранит проектные product/API contracts.

## Обязательный file header

Минимальный scope правила - новые source-файлы и изменяемые
boundary/contract/source owner files в согласованном allowlist.

Новый source-файл должен начинаться с file header, если файл не является
сгенерированным, vendor-файлом, framework stub-файлом, декларацией окружения
или файлом, где header запрещён конвенцией инструмента.

Минимальные поля header:

- `@file` - путь от корня проекта;
- `@version` - актуальная версия/дата изменения по принятой в контуре
  конвенции;
- `@docref` - идентификатор проектного документа, если файл относится к
  описанному product/API/architecture/runtime contract;
- `@see` - путь к документу в `docs/**`, если указан `@docref`;
- `@description` - краткое описание ответственности файла.

Если для файла нет применимого проектного документа, `@docref` и `@see` нельзя
заполнять выдуманными значениями. Для narrow internal file агент фиксирует
`docref_absent_reason`.

## Комментарии к функциям и публичным API

Комментарий обязателен для:

- exported functions and public component props;
- API route/service/action boundary;
- DTO, mapper, serializer, query, integration adapter и contract-facing layer;
- shared UI primitive, если он образует reusable contract;
- сложных запросов, алгоритмов, инвариантов, side effects or external
  integration behavior.

Допустимые tags для contract-facing comments: `@docref`, `@see`,
`@description`, `@param`, `@returns`, `@throws`, `@deprecated`, `@link`,
`@example`.

## Запрещено

- Вставлять примерные, пустые или декоративные comments ради прохождения
  checklist.
- Дублировать в code comments текст документации, rules, specs или README.
- Подменять отсутствующий project contract подробным комментарием в коде.
- Указывать несуществующий `@docref`, устаревший документ или неподходящий
  `@see`.
- Добавлять `@deprecated` без причины, replacement или migration path.
- Добавлять `@example`, если пример не является реальным, проверенным и
  поддерживаемым.
- Массово править headers вне allowlist текущей задачи.

## Обязательный вывод

```text
code_comment_discipline: passed|failed|not_required|stop-for-approval
changed_code_files:
header_required:
header_updated:
docref_decision:
docref_absent_reason:
public_api_comments_required:
public_api_comments_updated:
blocker:
```
