# Шаблон Markdown runtime-артефакта рабочего AI-слоя (`TEMPLATE-AI-RUNTIME-MARKDOWN`)

```yaml
template_id: TEMPLATE-AI-RUNTIME-MARKDOWN
template_type: ai-runtime-markdown-template
owner_layer: .ai/templates/markdown/
applies_to:
  - .ai/**/*.md
applies_to_condition:
  - файл является runtime-артефактом рабочего AI-слоя
  - historical evidence допускается только как исключение или цитата, а не как активная конвенция
excludes:
  - application contour
  - комментарии кода
  - TSDoc
  - production README/packages вне .ai
  - canonical-документы в documentation/
  - пользовательская документация
related_artifacts:
  - .ai/rules/global/RULE-WORKING-ARTIFACT-LANGUAGE.md
  - .ai/checks/self-review/CHECK-WORKING-ARTIFACT-LANGUAGE.md
  - .ai/templates/readme/TEMPLATE-AI-RUNTIME-INDEX.md
  - .ai/templates/roles/TEMPLATE-AI-RUNTIME-ROLE.md
  - .ai/agents-evolution/INDEX.md
```

## Назначение (`purpose`)

Шаблон задаёт базовые правила человекочитаемого Markdown-формата для runtime
артефактов рабочего AI-слоя `.ai/**/*.md`, если конкретный файл является
runtime-артефактом.

Он не заменяет active rule/check. Обязательный language gate живёт в
`.ai/rules/global/RULE-WORKING-ARTIFACT-LANGUAGE.md` и
`.ai/checks/self-review/CHECK-WORKING-ARTIFACT-LANGUAGE.md`; этот template
задаёт формат Markdown для runtime artifacts.

## Границы (`boundaries`)

Шаблон применяется к Markdown-файлам `.ai`, если файл является runtime
артефактом рабочего AI-слоя:

- правило;
- проверка;
- workflow;
- шаблон;
- индекс реестра;
- структурный индекс agents-evolution;
- entrypoint рабочего слоя или directory `INDEX.md`.

Шаблон не применяется к:

- application contour;
- комментариям кода, TSDoc и TSDoc;
- production README/packages вне `.ai`;
- canonical-документы и продуктовая документация в `documentation/`;
- пользовательской документации;
- `.codex/*` без отдельного согласования scope.

## Базовые правила оформления (`formatting_rules`)

- Видимые заголовки постоянных секций пишутся на русском языке.
- Stable technical ids, enums, statuses, artifact ids, command names и paths не
  переводятся.
- Technical ids в заголовках пишутся в backticks:

```markdown
## Русское название (`technical_id`)
```

- Stable sequences, ids, commands и paths пишутся в backticks или fenced code
  blocks.
- Маркер результата state, section или step пишется как `Выход:`.
- `Output:` не используется в русскоязычном runtime Markdown, кроме явной
  historical evidence, цитаты старого drift или внешнего tool output.
- Английские служебные заголовки не используются как видимые заголовки, если они
  не являются stable enum/path/id.

Примеры служебных заголовков, которые должны получить русскую подпись:

```text
States
State Contracts
Control States
Handoff
Entrypoint
Schema Contract
Trigger
Inputs
Procedure
Pass
Fail
Required Rule
Autonomous Exception
Modes
Handoff Gate
```

## Блок метаданных (`metadata_block`)

Runtime Markdown-файл должен явно показывать роль артефакта через блок
метаданных, если формат файла это допускает:

```yaml
artifact_id: <stable-id>
artifact_type: <artifact-type>
owner_layer: <path>
runtime_sources:
  - .ai/<runtime-source>
related_artifacts:
  - .ai/<related-artifact>
```

Блок метаданных не должен маскировать обычный prose-файл под активное правило,
проверку или workflow. Если файл является observation, proposal или historical
trace, это должно быть видно в `artifact_type` и в заголовке.

## Исключения (`exceptions`)

Английский текст допустим, когда он является:

- technical id, enum, status, command, API name или path;
- цитатой внешнего tool output;
- historical evidence внутри observation/proposal/report;
- именем существующего artifact id, file name или package name.

Исключение должно быть локально понятно из контекста. Если английская строка
является просто видимым служебным заголовком, её нужно заменить русским
заголовком с technical id в backticks.

## Специализация (`specialization`)

Этот файл задаёт только общий контракт Markdown-формата.

Специализированные templates должны ссылаться на него и добавлять правила своего
artifact type без копирования полного базового текста. Например, directory
`INDEX.md` рабочего AI-слоя использует:

```text
.ai/templates/readme/TEMPLATE-AI-RUNTIME-INDEX.md
```

Active role cards используют:

```text
.ai/templates/roles/TEMPLATE-AI-RUNTIME-ROLE.md
```

## Проверка перед передачей результата (`handoff_check`)

Перед завершением Markdown runtime-артефакта `.ai/**/*.md` проверить:

- видимые постоянные заголовки написаны на русском;
- technical ids сохранены в backticks или fenced code blocks;
- заголовки используют формат `Русское название (technical_id)`;
- `Output:` не используется как служебный маркер в русскоязычном runtime prose;
- устаревшая привязка только к README/INDEX отсутствует, если требование
  относится не только к README/INDEX;
- historical evidence явно отделён от active instruction;
- файл не расширяет область применения на application contour, `documentation/`
  или `.codex/*` без отдельного согласования.
