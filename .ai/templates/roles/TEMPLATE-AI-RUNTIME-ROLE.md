# Шаблон role card рабочего AI-слоя (`TEMPLATE-AI-RUNTIME-ROLE`)

```yaml
template_id: TEMPLATE-AI-RUNTIME-ROLE
template_type: ai-runtime-role-template
owner_layer: .ai/templates/roles/
applies_to:
  - .ai/roles/**/INDEX.md
runtime_sources:
  - .ai/templates/markdown/TEMPLATE-AI-RUNTIME-MARKDOWN.md
  - .ai/roles/role-groups.md
related_specs:
  - documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-031-agent-roles-and-responsibility-gates.md
excludes:
  - .ai/roles/role-groups.md
  - .ai/rules/**
  - .ai/checks/**
  - .ai/workflows/**
  - documentation/**
```

## Назначение (`purpose`)

Шаблон задаёт единый формат active role card внутри `.ai/roles/**/INDEX.md`.
Role card описывает runtime-ответственность роли: когда её выбирать, чем она
владеет, какие источники и проверки открыть, какой результат она должна вернуть
и где проходят её границы.

Базовые правила Markdown-оформления задаёт
`.ai/templates/markdown/TEMPLATE-AI-RUNTIME-MARKDOWN.md`. Этот шаблон добавляет
только role-specific структуру.

## Границы (`boundaries`)

- Role card не является active rule: обязательные нормы живут в active rules
  layer.
- Role card не является workflow: порядок states/gates живёт в
  `.ai/workflows/*`.
- Role card не заменяет supporting spec в `documentation/`.
- Role card не должна хранить историю появления роли, отчёты или rationale.
- `.ai/roles/role-groups.md` маршрутизирует к role cards, но не создаёт роли
  текстовым списком.

## Обязательные секции (`required_sections`)

Role card должна содержать:

- `Назначение`;
- `Когда выбирать роль`;
- `Ответственность`;
- `Границы`;
- `Источники и связи`;
- `Входы`;
- `Выходы`;
- `Обязательные проверки`;
- `Передача результата`.

Секции могут быть расширены, если роль имеет специфичный gate, но нельзя
смешивать роль с rule, workflow, task report или canonical spec.

## Базовый каркас (`base_skeleton`)

````markdown
# Роль: <Название роли> (`<artifact_id>`)

```yaml
artifact_id: <stable-role-id>
artifact_type: ai-role-index
owner_role: .ai/roles/<group>/<role>/INDEX.md
owner_layer: .ai/roles/<group>/<role>/
runtime_sources:
  - .ai/templates/roles/TEMPLATE-AI-RUNTIME-ROLE.md
  - .ai/rules/<group>/RULE-*.md
related_rules:
  - .ai/rules/<group>/RULE-*.md
related_checks:
  - .ai/checks/<phase>/CHECK-*.md
related_workflows:
  - .ai/workflows/<domain>/<workflow>/WORKFLOW.md
related_specs:
  - documentation/project/specs/<DOC-ID>.md
related_skills:
  - .codex/skills/<skill-name>/SKILL.md
related_tools:
  - <tool-or-mcp-name>
```

## Назначение (`purpose`)

<Одна-две короткие фразы: какую runtime-ответственность закрывает роль и какую
ошибку выбора owner-layer она предотвращает.>

## Когда выбирать роль (`selection_triggers`)

- <Признак задачи, который активирует роль.>
- <Контур, owner-layer, artifact type или symptom, где роль применима.>
- <Когда нужно открыть эту роль вместе с другой role card.>

## Ответственность (`responsibilities`)

- <Что роль обязана проверить или решить.>
- <Какие contracts, owners или runtime sources она держит.>
- <Какой decision или handoff она должна подготовить.>

## Границы (`boundaries`)

- <Что роль не делает.>
- <Какие действия требуют другой роли, rule, workflow или user approval.>
- <Какие artifacts нельзя создавать или менять только на основании этой роли.>

## Источники и связи (`runtime_links`)

- Rules: `<paths>`.
- Checks: `<paths>`.
- Workflows: `<paths>`.
- Specs: `<paths>`.
- Skills/tools: `<paths-or-tool-names>`.

## Входы (`inputs`)

- <Какие task/context/runtime inputs роль получает.>

## Выходы (`outputs`)

- <Решение роли: proceed, stop-for-approval, needs-more-context, blocked.>
- <Owner-layer или contract decision.>
- <Проверки, которые нужно выполнить до handoff.>

## Обязательные проверки (`required_checks`)

- <Check или команда для подтверждения.>
- <Что считается достаточным evidence.>

## Передача результата (`handoff`)

- <Когда роль считается пройденной.>
- <Что передаётся Dialog Assistant, ассистенту или следующей role card.>
- <Какие residual risks должны быть явно названы.>
````

## Правила качества role card (`quality_rules`)

- Название роли должно быть конкретным: `Developer Backend`, `Documentation
  Steward`, `Scope/Contour Owner`.
- `artifact_id` должен быть стабильным и не зависеть от текущей задачи.
- `owner_role` указывает на саму role card.
- `runtime_sources` должны ссылаться на active `.ai/*` artifacts, а не
  подменять их длинным текстом.
- `related_specs` допустимы как supporting context, но не как runtime source.
- `Когда выбирать роль` содержит routing-сигналы, а не внутренние guardrails
  роли.
- `Ответственность` содержит то, что роль действительно проверяет или решает.
- `Границы` обязательны: роль должна явно сказать, чего она не делает.
- Если роль применяется вместе с другой ролью, это фиксируется в
  `Когда выбирать роль` и `Передача результата`.
- Если требуется новое правило, check или workflow, role card фиксирует это как
  stop/follow-up, а не создаёт скрытую норму внутри себя.

## Антипаттерны (`anti_patterns`)

Запрещено:

- описывать роль только через краткое назначение без входов, выходов и границ;
- дублировать полный текст rules/checks/workflows;
- превращать role card в исторический отчёт или rationale;
- объявлять runtime-роль в `.ai/roles/role-groups.md` без отдельной role card;
- добавлять в role card task-specific инструкции, которые должны жить в task,
  workflow или skill;
- оставлять ссылки на удалённые роли, старые owners или compatibility labels.

## Проверка перед передачей результата (`handoff_check`)

Перед завершением новой или изменённой role card проверить:

- выполнен базовый Markdown handoff check из
  `.ai/templates/markdown/TEMPLATE-AI-RUNTIME-MARKDOWN.md`;
- role card перечислена в `.ai/roles/role-groups.md`, если она active;
- нет второй role card с тем же смыслом;
- `owner_role` и `owner_layer` указывают на фактический файл и папку;
- связанные rules/checks/workflows/specs/skills существуют или явно помечены
  как planned follow-up;
- routing-сигналы не смешаны с внутренними guardrails;
- old role names и stale paths не остались в active artifacts.
