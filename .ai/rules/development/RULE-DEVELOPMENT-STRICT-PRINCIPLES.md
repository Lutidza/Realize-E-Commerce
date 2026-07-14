# RULE-DEVELOPMENT-STRICT-PRINCIPLES

```yaml
artifact_id: RULE-DEVELOPMENT-STRICT-PRINCIPLES
artifact_type: project-development-rule
owner_roles:
  - .ai/roles/developer/frontend/INDEX.md
  - .ai/roles/developer/backend/INDEX.md
owner_layer: .ai/rules/development/
enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
check: .ai/checks/development/CHECK-DEVELOPMENT-STRICT-PRINCIPLES.md
workflow: .ai/workflows/core/main-delivery/WORKFLOW.md
registry: .ai/registry/rules/INDEX.md
rule_scope: project-wide
scope: all_work_tasks
applies_to:
  - application code
  - backend
  - frontend
  - database
  - documentation
  - development environment contour
  - ai runtime layer
  - local tooling
```

## Назначение

`owner_roles` и `owner_layer` фиксируют смысловых владельцев правила и место
хранения active rule. Они не ограничивают область действия правила. Область
действия задаётся `rule_scope`, `scope` и `applies_to`.

Правило фиксирует базовые строгие инженерные принципы всего проекта, а не
только рабочего слоя ИИ-агентов. Оно применяется ко всем рабочим задачам:
application code, backend, frontend, database, документация, `.ai`, `.codex`,
runtime, delivery, интеграции и локальные инструменты.

Особый приоритет у кодовой части проекта: TypeScript, Next.js, React, Payload
CMS, frontend runtime, scripts, AI tooling и другие исполняемые файлы не
должны раздуваться, смешивать ответственности или обходить корректный
owner-layer.

Это правило не заменяет профильные правила. Оно стоит выше них как базовый
слой и запрещает выбирать быстрый обход, если он нарушает профессиональную
архитектуру, source of truth, owner-layer, сопровождаемость или проверяемость.

## Приоритет

Если профильный workflow, skill или локальная инструкция предлагает действие,
которое конфликтует с этим правилом, выполнение останавливается до решения
enforcement owner-а и, если нужно, пользователя.

Правильная формула:

```text
Выбираем самый простой профессионально корректный путь.
Не выбираем лёгкий быстрый обход, если он создаёт долг, обходит контракт или
маскирует проблему.
```

Правило не требует выбирать самый сложный вариант и не оправдывает
переусложнение. Переусложнение так же запрещено, если более простой вариант
сохраняет source of truth, owner-layer, проверяемость и сопровождаемость.

## Строгие принципы

### 1. Профессиональная корректность важнее быстрого обхода

Запрещено выбирать быстрый или лёгкий путь, если он:

- создаёт предсказуемый технический долг;
- оставляет временный слой как будущий owner;
- обходит source of truth;
- дублирует уже существующий контракт или механизм;
- делает систему труднее проверять, сопровождать или переносить;
- решает симптом вместо причины.

Если профессиональный путь требует большего scope, агент обязан остановиться и
запросить scope approval, а не реализовывать быстрый обход.

### 2. Source of truth сначала

Перед изменением нужно определить фактический source of truth. Запрещено
создавать параллельный источник состояния, правил, документации, runtime events
или delivery status без явного решения о миграции и владельце.

### 3. Owner-layer сначала

Новая логика добавляется только в слой, который является её корректным
владельцем. Если владельца нет, сначала создаётся или согласуется правильный
owner-layer.

### 4. Scope явно или остановка

Скрытое расширение scope запрещено. Если правильное решение выходит за
исходный allowlist, агент фиксирует причину и останавливается на
`scope_expanded` или `needs_more_context`.

### 5. Реальное выполнение, без примерного результата и заглушек

Запрещено выдавать действие за выполненное другим агентом, worker-ом,
Dialog Assistant-ом, tool или runtime, если фактически его выполнил текущий
диалоговый ассистент.

Запрещено выдавать за выполненную реализацию:

- примерный код;
- псевдокод;
- набросок без интеграции в owner-layer;
- TODO-only изменение;
- временную заглушку;
- partial implementation без явного статуса `blocked` или `follow-up`;
- непроверенный результат tool-dependent действия;
- описание будущей команды как уже выполненную команду.

Симуляция допускается только при явном `simulation/debug scope` и должна быть
помечена как симуляция в результате и runtime/evolution долге, если она
обнаружила дефект процесса.

Если действие нельзя выполнить полностью в текущем scope, агент обязан
зафиксировать точный blocker, недостающие входные данные, affected owner-layer
и следующий минимальный шаг. Нельзя маскировать blocker примером, заглушкой или
общей рекомендацией.

### 6. Runtime и tool evidence важнее предположений

Если в проекте есть профильный runtime, MCP, database, browser, test или
tooling source, агент обязан использовать его как доказательство вместо
догадки по памяти.

### 7. Stale artifacts не оставляются

После refactor, migration, rename, decomposition или owner-layer change агент
обязан удалить, архивировать, синхронизировать или явно зафиксировать
устаревшие артефакты как follow-up. Нельзя оставлять старые файлы, ссылки,
workflow, adapters или docs, которые будут вводить следующего агента в
заблуждение.

### 8. Secrets и destructive actions не обходятся

Секреты, tokenized URLs, private keys, destructive commands, commit/push,
external delivery operations и scope expansion не выполняются через локальные
исключения. Для них применяются профильные non-bypassable правила и Dialog
Assistant decision.

### 9. Contract-first order важнее локального удобства

Если локально удобное решение ломает переносимость рабочего слоя, будущий
WebSocket/UI runtime, audit trail, tests, schema или workflow lifecycle, оно
отклоняется до архитектурного решения.

Если поведение принадлежит base/shared contract, schema, migration flow,
DTO/API boundary, validation contract, theme/runtime layer, official component
API, workflow, rule, check, skill или tool adapter, изменение должно начинаться
с этого owner-layer.

Запрещено:

- начинать с consumer-слоя и затем задним числом подгонять base/shared
  contract;
- дублировать validation, mapping, state policy, visual contract, runtime state
  или business rule в consumer-е вместо изменения owner-а;
- создавать local override, если нужная семантика уже выражается стандартным
  prop, schema field, DTO, API contract, workflow state или rule;
- оставлять два конкурирующих contract owner-а после правки.

Если contract owner отсутствует или неясен, реализация останавливается до
owner-layer decision. Если корректный contract-first путь расширяет scope,
агент запрашивает scope approval вместо локального обхода.

### 10. Файлы не раздуваются и не смешивают ответственности

Порог 300 строк является warning threshold для проверки раздувания файла, а не
механическим запретом и не основанием сжимать содержание с потерей смысла.
В первую очередь порог применяется к исполняемым/source-файлам: TS/JS,
TSX/JSX, CSS, scripts, runtime adapters, services, route handlers,
components, tests и другим кодовым owner-файлам.

Запрещено раздувать кодовые файлы и создавать новые кодовые файлы больше 300
строк без явной, проверяемой и предварительно зафиксированной необходимости.

Если реализация приближает файл к 300 строкам или делает его трудным для
чтения, тестирования, review или повторного использования, агент обязан
сначала рассмотреть decomposition по owner responsibilities.

Запрещено смешивать в одном файле самостоятельные зоны ответственности:

- transport/boundary;
- orchestration;
- state policy;
- business/domain logic;
- persistence/query/schema logic;
- mapping/normalization;
- validation;
- rendering/UI composition;
- styling/visual contract;
- config;
- helpers/utils;
- runtime/tool adapters;
- tests/fixtures/report generation.

Исключение для файла больше 300 строк допускается, если:

- файл имеет один ясный owner и одну ответственность;
- разбиение ухудшит связность или проверяемость;
- причина зафиксирована в pre-edit gate или review output;
- есть понятный follow-up, если размер является временным долгом.

Для связных documentation, rule, check, workflow, task, template, registry или
report artifacts превышение 300 строк допустимо, если дробление на несколько
файлов ухудшает читаемость, модерацию, traceability или исполнение. В таком
случае агент обязан сохранить полноту смысла, не ужимать содержание ради
лимита и явно зафиксировать:

- почему один файл лучше нескольких;
- какая у файла единая ответственность;
- какие разделы можно вынести позже, если файл станет долгом.

### 11. Импорты идут от alias, а не через parent traversal

В кодовых контурах, где используется или должен использоваться project/root
alias, import paths должны идти от `@/`.

Запрещено добавлять или сохранять в изменяемом коде parent-relative imports:

```text
../
../../
../../../
```

Особенно запрещён `../../` как признак обхода owner-layer и хрупкой привязки к
текущему расположению файла.

Если в контуре ещё не настроен alias `@/`, агент не должен вводить новые
`../`/`../../` imports как быстрый обход. Нужно остановиться и выбрать один из
профессиональных вариантов:

- настроить owner-level alias contract;
- перенести файл в корректный owner-layer, где import становится прямым;
- запросить scope approval на отдельный migration step.

Исключение допускается только для технических runtime-контуров, где alias
невозможен без отдельной сборки/loader contract. Такое исключение должно быть
явно зафиксировано в pre-edit gate и не может использоваться для application
code, frontend code или TypeScript/JavaScript code с доступным `@/`.

## Условия остановки

Остановиться до реализации, если:

- выбран быстрый обход, а профессионально корректный вариант не рассмотрен;
- правильное решение требует расширения allowlist или owner-layer;
- нет source of truth или он конфликтует между `.ai`, `.codex`,
  `documentation/`, application code и runtime;
- действие имитирует работу другого агента без явного simulation scope;
- выбранный результат является примером, заглушкой, псевдокодом или partial
  implementation без явного blocker/follow-up статуса;
- предлагается добавить новый временный слой без плана удаления;
- consumer-правка выбрана до проверки base/shared contract owner;
- contract owner отсутствует, неясен или конфликтует с consumer-слоем;
- выбранный путь раздувает кодовый файл сверх 300 строк без обоснованной
  необходимости;
- выбранный путь смешивает самостоятельные зоны ответственности в одном файле;
- выбранный путь добавляет или сохраняет parent-relative import через `../`,
  `../../` или глубже вместо alias import от `@/`;
- выбранный путь зависит от секретов, destructive action или delivery action;
- нельзя доказать, что решение проверяемо.

## Обязательный вывод перед реализацией

Перед изменением файлов агент должен кратко зафиксировать:

```text
professional_solution_check: passed|failed|stop-for-approval
рассмотренный быстрый обход:
профессионально корректный путь:
почему выбранный путь не является быстрым обходом:
почему выбранный путь не является переусложнением:
source_of_truth:
owner_layer:
execution_evidence:
stub_or_example_only_risk: yes|no
contract_first_decision:
scope_expansion_required: yes|no
file_size_and_responsibility_risk: yes|no
import_path_alias_risk: yes|no
blocker:
```
