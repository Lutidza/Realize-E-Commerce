# RULE-GLOBAL-PROJECT-GUARDRAILS

```yaml
rule_id: RULE-GLOBAL-PROJECT-GUARDRAILS
title: Глобальные guardrails проекта для всех агентов
artifact_type: global-project-rule
owner_layer: .ai/rules/global/
rule_scope: project-wide
scope: all_agents_all_work_tasks
applies_to:
  - application code
  - backend
  - frontend
  - database
  - documentation
  - development environment contour
  - ai runtime layer
  - .ai
  - .codex
  - local tooling
enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
registry: .ai/registry/rules/INDEX.md
related_rules:
  - .ai/rules/development/RULE-DEVELOPMENT-STRICT-PRINCIPLES.md
  - .ai/rules/scope-control/RULE-ARTIFACT-DISPOSITION.md
  - .ai/rules/scope-control/RULE-STALE-ARTIFACT-CLEANUP-AFTER-REFACTOR.md
```

## Назначение

Файл хранит глобальные guardrails, которые распространяются на всех агентов
проекта независимо от роли, workflow, skill, контура или типа задачи.

Правила из этого файла применяются раньше профильных правил, если агент
предлагает, проектирует или создаёт новый контур, owner-layer, папку, файл,
структуру, runtime state, tooling layer, compatibility bridge или временный
артефакт.

Этот файл не заменяет профильные rules/checks. Он фиксирует базовые запреты,
возникшие из повторяющихся нарушений, которые должны блокироваться на уровне
всего проекта.

## 1. Анализ существующего решения до реализации

Агенту запрещено начинать реализацию, локальную consumer-правку, override,
декомпозицию, перенос, удаление или создание нового artifact без
предварительного анализа текущего состояния.

Перед реализацией агент обязан проверить и зафиксировать:

1. `current_behavior_scan` - как сейчас работает затронутый участок.
2. `similar_functionality_scan` - есть ли уже похожий функционал, helper,
   service, component, rule, workflow, check, skill, template или tool.
3. `owner_layer_scan` - какой слой уже владеет логикой, контрактом или
   состоянием.
4. `conflict_scan` - нет ли конфликта с active rules, role cards, workflows,
   canonical docs, runtime contracts или application boundaries.
5. `duplication_scan` - не создаёт ли план дублирование кода, логики,
   source of truth, runtime state, visual contract, schema, API contract или
   delivery procedure.
6. `contract_owner_decision` - должен ли меняться base/shared contract,
   theme/runtime layer, schema, DTO/API boundary, workflow или другой owner до
   изменения consumer.

Если похожий owner или contract найден, агент обязан работать через него или
остановиться для scope/architecture decision. Локальная правка consumer-а не
может использоваться как способ обойти существующий owner.

## 2. Порядок подготовки работы до изменения файлов

Для любого `work_task` применяется общий порядок:

```text
analysis -> plan -> pre_edit_gate -> task_fixation -> implementation
```

Минимальный смысл этапов:

- `analysis` - изучить текущую реализацию, существующие owners, похожую
  логику, ограничения и конфликты;
- `plan` - выбрать самый простой профессионально корректный путь;
- `pre_edit_gate` - зафиксировать source of truth, contour-owner,
  owner-layer, allowlist, create/edit/delete paths и проверки;
- `task_fixation` - зафиксировать задачу в согласованном task/profile/worker
  artifact, если текущий workflow требует такой записи;
- `implementation` - менять только согласованный allowlist.

Запрещено:

- начинать реализацию до плана и pre-edit gate;
- расширять allowlist во время реализации без нового gate;
- фиксировать задачу так, будто архитектурное решение уже принято, если owner
  или source of truth не доказаны;
- использовать Dialog Assistant-only переходы как обязательный workflow для
  всех worker-ов.

Если корректный план требует нового owner-layer, нового top-level path,
нового runtime/tooling/data контура, изменения contract-level документации или
расширения allowlist, агент останавливается до подтверждения scope.

### 2.1. Приоритет active AI-layer при исполнении

Для любого `work_task` агент обязан применять применимые active artifacts
рабочего AI-слоя до развёрнутых спецификаций и справочных документов.

К active runtime artifacts относятся:

- `.ai/rules/*`;
- `.ai/checks/*`;
- `.ai/workflows/*`;
- `.ai/roles/*` и role-gates;
- `.codex/skills/*`, `.codex/agents/*`, `.codex/prompts/*` и другие
  Codex-native artifacts, если они применимы к текущему runtime.

`documentation/` остаётся владельцем long-form specs, governance, rationale,
product, architecture и contract-level описаний. Она не становится owner-ом
runtime-поведения агента, если применимый active artifact уже существует.

Если active artifact конфликтует с развёрнутой спецификацией, агент обязан
исполнить active artifact, зафиксировать `docs_sync_debt` и применить
documentation sync в текущем approved scope либо остановиться для отдельного
docs-sync scope.

Запрещено использовать `documentation/**`, README, task, audit report или spec
как скрытую замену active rule, check, workflow, role gate или Codex adapter
artifact.

## 3. Запрет несогласованного введения контуров и артефактов

Агенту запрещено предлагать, вписывать в план, добавлять в task, создавать или
незаметно проталкивать в архитектуру новые контуры, папки, файлы, owner-layer,
runtime paths, tooling paths, compatibility bridges или временные структуры,
если до этого не доказано, что они:

- не дублируют существующий owner-layer;
- не подменяют существующий runtime/tooling/data слой;
- не создают параллельный source of truth;
- не являются временным обходом без lifecycle и условия удаления;
- не конфликтуют с текущей структурой проекта;
- не расширяют allowlist скрыто;
- согласованы с пользователем, если вводят новый owner-layer, новый top-level
  path, новый контур или новую структуру.

### Обязательная проверка перед предложением или созданием

Перед тем как предложить или создать новый путь, папку, файл, контур или
структуру, агент обязан выполнить и зафиксировать:

1. `current_state_scan` - проверить существующие пути и владельцев через
   `rg`, `find` или другой точный source по текущему дереву проекта.
2. `existing_owner_check` - определить, есть ли уже подходящий owner-layer.
3. `duplication_check` - доказать, что новый artifact не дублирует
   существующий слой по смыслу, lifecycle или ответственности.
4. `layer_classification` - классифицировать artifact как rule, check,
   workflow, role, skill, tool, runtime state, report, task, documentation,
   template, registry или application code.
5. `lifecycle_check` - определить, постоянный это artifact или временный, и
   указать условие удаления для временного artifact.
6. `source_of_truth_check` - определить, какой active artifact или canonical
   документ разрешает новый owner-layer.
7. `approval_check` - получить подтверждение пользователя, если создаётся
   новый owner-layer, top-level path, контур, структура или временный мост.

### Запрещённые форматы поведения

Запрещено:

- сначала вписать новый путь в task/profile/spec/workflow, а потом искать ему
  обоснование;
- называть state/output папку owner-layer tooling-а;
- создавать новый слой только потому, что он удобен для текущего текста;
- предлагать временный compatibility bridge без явного срока жизни и удаления;
- использовать `planned task`, audit report или spec как скрытое approval на
  новый runtime owner-layer;
- добавлять новые папки в `.ai`, `.codex`, `documentation`, `app`,
  `database`, `resources`, `public` или другие контуры без проверки
  существующей структуры;
- маскировать новый source of truth как traceability, registry, report,
  projection или fallback.

### Пример запрещённого класса нарушения

Если runtime tooling уже принадлежит `.ai/tools/**`, агент не может предлагать
или фиксировать отдельный sibling runtime-контур как owner-layer runtime
writer-а. Mutable state/output допускается только внутри подтверждённого
tooling owner-layer или по отдельному явному контракту.

## 4. Объективность, честность и доказательность агента

Агент обязан быть прагматичным technical actor, а не подтверждающим
собеседником. Его выводы, рекомендации и handoff должны опираться на анализ,
проверяемые evidence и явно названные ограничения.

Запрещено:

- льстить, подбадривать или эмоционально усиливать ответ вместо технической
  оценки;
- автоматически соглашаться с пользователем, worker-ом, отчётом, spec или
  предыдущим выводом без проверки фактов, owner-layer и конфликтов;
- выдавать гипотезу, догадку, пример или желаемое состояние за проверенный
  факт;
- скрывать неопределённость, blockers, слабые evidence, конфликт правил,
  невалидный scope или отсутствие source of truth;
- подменять анализ формулировками вида `согласен`, `всё верно`,
  `очевидно`, `лучше так` без аргументов и evidence;
- использовать уверенный тон для файлов, API, runtime state, поведения кода,
  документации или внешних фактов, которые не были проверены;
- угадывать недостающие данные, пути, назначения файлов, правила, структуру
  базы, API contract или пользовательский intent, если это влияет на решение;
- пассивно следовать предложенному пользователем, worker-ом, spec, audit или
  предыдущим агентом пути, если анализ показывает более профессиональное,
  поддерживаемое или менее рискованное решение;
- продолжать реализацию, если профессионально корректный ответ требует
  сначала уточнить вводные, проверить source of truth или зафиксировать
  архитектурный конфликт.

Обязательный порядок для спорного или неполного контекста:

1. Отделить `verified_evidence` от `inference`, `assumption` и
   `open_question`.
2. Если пользовательская гипотеза выглядит ошибочной или рискованной,
   корректно оспорить её и объяснить причину.
3. Если evidence недостаточно, остановиться для уточнения или явно ограничить
   рекомендацию рамками доступных данных.
4. Если найден более профессиональный путь, критически разобрать текущий путь,
   аргументировать проблему evidence-ом, owner-layer или contract conflict и
   предложить лучший вариант вместе с tradeoff, blast radius и требуемым scope.
5. Если задача уже выполняется, не скрывать обнаруженное нарушение; оформить
   его как blocker, debt или отдельный follow-up с owner-layer.

Минимальный handoff для решений, где есть риск угадывания:

```text
objectivity_gate: passed|blocked|needs-user-input
verified_evidence:
inference:
assumptions:
open_questions:
challenged_claims:
risk_or_debt:
decision:
```

## 5. Условия остановки

Агент обязан остановиться до изменения файлов или фиксации архитектурного
решения, если:

- не проведён current-state scan;
- не проведён анализ похожего функционала, логики, owner-layer и конфликтов;
- план, pre-edit gate или allowlist не зафиксированы;
- не найден или не подтверждён owner-layer;
- новый artifact похож на существующий по смыслу или lifecycle;
- новый artifact временный, но нет условия удаления;
- новый path вводит новый контур или top-level структуру без user approval;
- новый path конфликтует с `.ai/rules/*`, `.ai/checks/*`, `.ai/workflows/*`,
  `.ai/tools/*`, `.codex/*`, `documentation/*` или application owner-layer;
- consumer/local fix выбран до проверки base/shared contract;
- агент не может объяснить, почему существующий owner-layer не подходит.
- вывод основан на согласии, догадке или непроверенной уверенности вместо
  evidence;
- агент не может отделить факт от inference или assumption.

## 6. Обязательный вывод перед созданием нового artifact

Перед созданием нового пути, папки, файла, контура или структуры агент должен
зафиксировать:

```text
global_artifact_introduction_gate: passed|stop-for-approval|blocked
proposed_artifact:
artifact_type:
current_state_scan:
existing_owner_candidates:
selected_owner_layer:
duplication_check:
source_of_truth:
lifecycle:
temporary_artifact: yes|no
removal_condition:
create_allowlist:
edit_allowlist:
delete_allowlist:
requires_user_approval:
approval_reference:
```

## 7. Обязательный вывод перед реализацией

Перед изменением файлов агент должен зафиксировать:

```text
global_work_preparation_gate: passed|stop-for-approval|blocked
current_behavior_scan:
similar_functionality_scan:
owner_layer_scan:
conflict_scan:
duplication_scan:
contract_owner_decision:
implementation_plan:
source_of_truth:
contour_owner:
owner_layer:
create_allowlist:
edit_allowlist:
delete_allowlist:
verification_plan:
requires_user_approval:
approval_reference:
```

## 7. Результаты

- `passed` - существующий owner-layer проверен, дублирования нет, lifecycle
  понятен, approval не требуется или уже получен.
- `stop-for-approval` - нужен новый owner-layer, top-level path, контур,
  временный bridge или расширение allowlist.
- `blocked` - owner-layer, source of truth, lifecycle или отсутствие
  дублирования не доказаны.
