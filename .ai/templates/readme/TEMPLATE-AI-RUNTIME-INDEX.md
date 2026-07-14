# Шаблон: directory INDEX рабочего AI-слоя (`TEMPLATE-AI-RUNTIME-INDEX`)

```yaml
template_id: TEMPLATE-AI-RUNTIME-INDEX
template_type: ai-runtime-index-template
owner_layer: .ai/templates/readme/
applies_to:
  - .ai/*/INDEX.md
  - .ai/*/*/INDEX.md
runtime_sources:
  - .ai/templates/markdown/TEMPLATE-AI-RUNTIME-MARKDOWN.md
excludes:
  - .ai/README.md
  - README application contour
  - package README
  - пользовательская документация
  - продуктовая документация
```

Этот шаблон используется для `INDEX.md` внутри рабочего AI-слоя проекта:
`.ai/*`. Верхний `.ai/README.md` является отдельным обзором всего operating
layer и не создаётся по этому шаблону.

Базовые правила Markdown-оформления для runtime-артефактов рабочего AI-слоя
задаёт общий template:
`.ai/templates/markdown/TEMPLATE-AI-RUNTIME-MARKDOWN.md`. Этот файл добавляет
только INDEX-specific структуру и границы ответственности.

Шаблон не является активным правилом, проверкой, workflow или Codex skill. Если
требование из этого шаблона должно стать обязательным runtime-правилом, его
нужно вынести в корректный rules owner-layer с собственным `rule_id`, `title`,
`owner_role`, `trigger`, `requirement`, `forbidden` и checks.

## Когда использовать (`usage_scope`)

Использовать для `INDEX.md`, которые описывают рабочие AI-артефакты внутри
директорий `.ai/*`.

`INDEX.md` является единым directory entrypoint: назначение папки,
owner-layer, карта содержимого, правила размещения и ссылки на связанные
runtime artifacts.

Не использовать для:

- верхнего `.ai/README.md`;
- README production-кода;
- README application code, frontend components или packages;
- пользовательской документации;
- canonical-документов в `documentation/`;
- changelog, incident report или code-level TSDoc.

Для кодовой части проекта нужен отдельный шаблон README/INDEX по конвенциям
соответствующего контура.

## Правила оформления (`formatting_rules`)

Сначала применяются базовые правила:
`.ai/templates/markdown/TEMPLATE-AI-RUNTIME-MARKDOWN.md`.

- Формат заголовка:

```markdown
### Выбор ролей (`role_selection`)
```

Видимый формат такого заголовка: `Выбор ролей (role_selection)`.

- Блок метаданных runtime-файла не ссылается на `documentation/project/specs/*` как
  на runtime source. Спецификации могут использоваться при проектировании
  рабочего слоя, но агент в runtime должен опираться на `.ai/*` и применимые
  `.codex/*`.
- Если `INDEX.md` фиксирует историческое наблюдение, incident или proposal, это
  должно быть видно в заголовке и owner-layer файла.
- В директориях `.ai/workflows/<domain>/<workflow>/` `INDEX.md` является
  entrypoint-картой директории. Исполнимый порядок states/gates/transitions
  должен жить в `WORKFLOW.md`, а отдельные зоны ответственности - в `states/`,
  `gates/`, `transitions/`, `outputs/`, `modes/` или `adapters/`.
- Workflow-файлы общих областей вроде frontend guardrails, runtime evidence,
  audit, reference, security или performance должны размещаться внутри
  правильного типа workflow-артефакта, например `gates/`, `modes/` или
  `outputs/`, а не лежать плоским списком рядом с `INDEX.md` и `WORKFLOW.md`.
- Runtime consumers, которым нужен workflow execution order, должны ссылаться
  на `.ai/workflows/<domain>/<workflow>/WORKFLOW.md`, а не на `INDEX.md`.

## Базовый каркас (`base_skeleton`)

````markdown
# <Русское название артефакта> (`<artifact_id>`)

```yaml
artifact_id: <stable-id>
artifact_type: <artifact-type>
owner_role: <path-or-role-name>
owner_layer: <path>
runtime_sources:
  - .ai/<runtime-source>
related_artifacts:
  - .ai/<related-artifact>
```

## Назначение (`purpose`)

<Коротко описать, для чего существует артефакт и какую ответственность он
закрывает в рабочем AI-слое.>

## Границы (`boundaries`)

- <Что этот артефакт делает.>
- <Что этот артефакт не делает.>
- <Где живут связанные rules/checks/workflows/skills.>

## Вход (`input`)

- <Какие runtime inputs использует артефакт.>

## Выход (`output`)

- <Что должен вернуть или зафиксировать артефакт.>

## Передача результата (`handoff`)

- <Когда работа по этому артефакту считается завершённой.>
````

## Граница специализации (`specialization_boundary`)

Этот файл содержит только общий шаблон `INDEX.md` рабочего AI-слоя. Если для
workflow, rule group, check group, registry или другого типа артефакта нужен
отдельный каркас, он создаётся отдельным template-файлом в соответствующей
папке `.ai/templates/` и не добавляется в этот шаблон.

Для active role cards используется отдельный шаблон:
`.ai/templates/roles/TEMPLATE-AI-RUNTIME-ROLE.md`.

Для workflow-директорий действует дополнительная специализация: `INDEX.md` не
должен хранить полный workflow contract. Если агенту нужно добавить или
изменить states, gates, transitions, stop conditions или handoff, owner-файлом
является `WORKFLOW.md` или специализированный файл внутри `states/`, `gates/`,
`transitions/`, `outputs/`, `modes/` или `adapters/`.

## Проверка перед передачей результата (`handoff_check`)

Перед завершением `INDEX.md` рабочего AI-слоя проверить:

- выполнен базовый handoff check из
  `.ai/templates/markdown/TEMPLATE-AI-RUNTIME-MARKDOWN.md`;
- runtime metadata-блок не содержит `documentation/project/specs/*`;
- активные rules не встроены в INDEX;
- связанные rules/checks/workflows/skills указаны ссылками, а не полным
  текстом;
- `INDEX.md` workflow-директории не стал source of truth для states/gates;
- workflow runtime entrypoint указан через `WORKFLOW.md`;
- workflow-директория не содержит плоский список файлов разных artifact types;
- `INDEX.md` не смешан с шаблоном для production-кода.
