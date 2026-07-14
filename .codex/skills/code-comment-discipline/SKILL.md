---
name: code-comment-discipline
description: >-
  Используй при создании или изменении TypeScript, JavaScript, TSX/JSX/MJS
  source-файлов, file headers, TSDoc, @docref/@see, public API comments
  или contract-facing code comments.
---

# Дисциплина code comments

Skill применяется после Dialog Assistant entry gate и development strict gate,
когда задача меняет кодовые файлы или comments в коде.

Активное правило живёт в
`.ai/rules/development/RULE-CODE-COMMENT-DISCIPLINE.md`. Этот skill не вводит
новые обязательные правила, а описывает процедуру применения rule/check и
шаблонов.

## Что открыть

1. `.ai/rules/development/RULE-CODE-COMMENT-DISCIPLINE.md`
2. `.ai/checks/development/CHECK-CODE-COMMENT-DISCIPLINE.md`
3. `.ai/rules/documentation/RULE-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE.md`
4. `.ai/checks/pre-implementation/CHECK-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE.md`,
   если меняется contract-level поведение или `@docref`
5. `.ai/templates/code-comments/TEMPLATE-TSDOC-FILE-HEADER.md`
6. Ближайший применимый документ в `docs/**`, если код относится к
   product/API/architecture/runtime contract.

## Когда использовать

- Создаётся новый source-файл.
- Меняется boundary, API route, service/action, DTO, mapper, serializer,
  integration adapter, shared UI primitive, widget, route boundary, runtime
  adapter или tool adapter.
- Меняется public/exported API.
- Нужно добавить или обновить `@docref`, `@see`, `@description`, `@param`,
  `@returns`, `@throws` или TSDoc.
- Existing header выглядит устаревшим или не соответствует ответственности
  изменяемого файла.

## Рабочий порядок

1. Составь список changed code files из allowlist.
2. Для каждого файла классифицируй owner и тип:
   - contract/boundary;
   - shared/reusable API;
   - route-private/component/helper;
   - internal helper;
   - generated/framework/env declaration.
3. Определи минимальный scope: новый source-файл или изменяемый
   boundary/contract/source owner file. Не расширяй правку на project-wide
   header migration.
4. Определи, нужен ли file header.
5. Если нужен TS/JS header, используй TSDoc template.
6. Если файл меняет contract-level поведение или `@docref`, выполни canonical
   documentation gate до изменения comments.
7. Найди ближайший project doc в `docs/**`, если файл реализует описанный
   project contract.
8. Если подходящего doc нет, не выдумывай `@docref`.
9. Обнови public/exported API comments только там, где они несут contract или
   снимают неоднозначность.
10. Если локальный алгоритм, flow или инвариант неочевиден из кода, добавь
    короткий comment, который объясняет именно локальное поведение.
11. Перед handoff выполни
    `.ai/checks/development/CHECK-CODE-COMMENT-DISCIPLINE.md`.

## Ограничения

- Не добавляй placeholder `@docref <PROJECT-DOC-ID>` в код.
- Не указывай устаревший или чужой document id ради прохождения проверки.
- Не превращай header в changelog.
- Не добавляй `@deprecated` без причины, replacement или migration path.
- Не меняй headers массово без отдельной migration-задачи.

## Ожидаемый результат

- Changed source files имеют корректные headers или documented exception.
- Новые и изменяемые boundary files проверены без project-wide migration.
- Public/exported API comments есть там, где они нужны для contract-facing
  поведения.
- `@docref`/`@see` ведут к проектной документации, если contract существует.
