# CHECK-DEVELOPMENT-STRICT-PRINCIPLES

```yaml
artifact_id: CHECK-DEVELOPMENT-STRICT-PRINCIPLES
artifact_type: ai-development-check
owner_roles:
  - .ai/roles/developer/frontend/INDEX.md
  - .ai/roles/developer/backend/INDEX.md
owner_layer: .ai/checks/development/
rule: .ai/rules/development/RULE-DEVELOPMENT-STRICT-PRINCIPLES.md
enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
workflow: .ai/workflows/core/main-delivery/WORKFLOW.md
check_stage: development_strict_gate
rule_scope: project-wide
scope: all_work_tasks
```

## Условие срабатывания

Запускать для любого `work_task` после Dialog Assistant entry gate и до выбора
профильного пути реализации. Если задача является обычным диалоговым ответом
без действий в рабочем слое, коде, документации, runtime, задачах или git,
проверка не требуется.

Если на раннем этапе недостаточно контекста, проверка получает статус
`stop-for-approval` или `needs_more_context`, а не заменяется предположением.

## Входы

- последняя пользовательская команда;
- классификация `dialog_only` или `work_task`;
- source of truth;
- owner-layer;
- планируемый allowlist;
- global work preparation evidence: current behavior, similar functionality,
  owner-layer, conflict и duplication scan;
- выбранный путь реализации;
- известный быстрый обход или обходной вариант;
- evidence фактического выполнения или явный blocker;
- риск example-only code, псевдокода, stubs или partial implementation;
- contract-first owner decision для изменений, которые затрагивают contract,
  schema, API, DTO, validation, mapping, runtime state, workflow или visual
  semantics;
- риски долга, stale artifacts, hidden scope expansion и симуляции;
- планируемые новые или изменяемые кодовые файлы;
- ожидаемый риск превышения 300 строк, тип файла и риск смешения зон
  ответственности;
- обоснование file-size exception, если один связный файл лучше нескольких;
- планируемые новые или изменяемые imports и доступность alias `@/`;
- применимые non-bypassable actions.

## Процедура

1. Определить, является ли команда `work_task`.
2. Если это `dialog_only`, вернуть `not_required`.
3. Для `work_task` назвать профессионально корректный путь.
4. Назвать быстрый обход, если он очевиден или уже предлагался.
5. Проверить, не выбран ли быстрый обход вместо корректного owner-layer,
   source of truth или runtime/tool evidence.
6. Проверить, выполнен ли анализ текущего поведения, похожего функционала,
   owner-layer, конфликтов и дублирования до реализации.
7. Проверить, не является ли выбранный путь переусложнением.
8. Проверить, не требуется ли scope expansion.
9. Проверить, не раздувает ли путь кодовые файлы сверх 300 строк без
   обоснованной необходимости. Для documentation/rule/check/workflow/task/
   template/report artifacts проверить, что превышение 300 строк не ведёт к
   смешению ответственности и не используется как исторический шум.
10. Проверить, не смешивает ли путь самостоятельные зоны ответственности в
   одном файле.
11. Проверить, не является ли результат примером, псевдокодом, заглушкой,
    TODO-only изменением или partial implementation без явного
    `blocked`/`follow-up` статуса.
12. Проверить, что contract-first owner выбран до consumer/local правки.
13. Проверить, что реализация не дублирует validation, mapping, state policy,
    visual contract, runtime state или business rule в consumer-е вместо
    изменения owner-а.
14. Проверить, не добавляет и не сохраняет ли путь parent-relative imports
    через `../`, `../../` или глубже вместо alias import от `@/`.
15. Проверить, нет ли симуляции выполнения вместо реального действия.
16. Проверить, не затрагивает ли путь secrets, destructive actions,
   commit/push, external delivery operations или scope expansion.
17. Если проверка не проходит, остановить реализацию.

## Условия прохождения

- Source of truth определён.
- Owner-layer определён.
- Анализ текущего поведения, похожего функционала, owner-layer, конфликтов и
  дублирования выполнен до реализации.
- Выбран самый простой профессионально корректный путь.
- Быстрый обход рассмотрен и отклонён либо доказано, что выбранный путь не
  является быстрым обходом.
- Выбранный путь не является переусложнением.
- Scope expansion не требуется или вынесен на подтверждение.
- Результат не является example-only code, псевдокодом, stub или partial
  implementation без явного статуса.
- Фактическое выполнение подтверждено evidence или действие явно остановлено
  как blocker.
- Contract-first owner определён до изменения consumer-а, если задача
  затрагивает contract-level поведение.
- Новые и изменяемые кодовые файлы не превышают 300 строк без явной
  обоснованной необходимости.
- Documentation/rule/check/workflow/task/template/report artifacts могут
  превышать 300 строк, если один связный файл сохраняет смысл лучше, чем
  дробление, а file-size exception зафиксирован.
- Самостоятельные зоны ответственности не смешиваются в одном файле.
- Новые и изменяемые imports используют `@/`, когда alias доступен или должен
  быть owner-level contract.
- Parent-relative imports `../`, `../../` или глубже не добавлены и не
  сохранены в изменяемом коде без явного approved technical exception.
- Симуляция не используется либо явно разрешена как simulation/debug scope.
- Non-bypassable actions не обходятся.

## Условия ошибки

- Агент выбирает быстрый обход из-за удобства.
- Агент оставляет временный слой без плана миграции или удаления.
- Агент начинает реализацию без анализа похожего функционала, owner-layer,
  конфликтов и дублирования.
- Агент начинает с consumer-слоя, когда owner-layer находится выше.
- Агент подгоняет base/shared contract задним числом под уже выбранную
  consumer-правку.
- Агент дублирует validation, mapping, state policy, visual contract, runtime
  state или business rule в consumer-е вместо изменения contract owner-а.
- Агент создаёт параллельный source of truth.
- Агент скрыто расширяет scope.
- Агент выдаёт пример, псевдокод, заглушку, TODO-only изменение или partial
  implementation как выполненную реализацию.
- Агент создаёт или раздувает кодовый файл больше 300 строк без обоснованной
  необходимости.
- Агент механически ужимает documentation/rule/check/workflow/task/template/
  report artifact до 300 строк с потерей смысла вместо фиксации обоснованного
  file-size exception или корректной декомпозиции.
- Агент смешивает transport, orchestration, state, domain logic, persistence,
  mapping, validation, rendering, styling, config, helpers или adapters в одном
  файле без единого owner.
- Агент добавляет или сохраняет parent-relative import через `../`, `../../`
  или глубже вместо `@/`.
- Агент обходит отсутствие alias настройкой хрупкого relative import вместо
  stop-for-approval или owner-level alias contract.
- Агент выдаёт действие текущего ассистента за действие Dialog Assistant-а,
  worker-а или tool.
- Агент игнорирует профильный runtime/tool evidence.
- Агент предлагает выполнить non-bypassable action напрямую.

## Вывод

```text
development_strict_principles_check: passed|failed|not_required|stop-for-approval
task_classification: dialog_only|work_task
professional_path:
shortcut_considered:
shortcut_rejected: yes|no|not_applicable
overengineering_risk: yes|no
source_of_truth:
owner_layer:
reuse_conflict_evidence:
execution_evidence:
stub_or_example_only_risk: yes|no
contract_first_owner:
contract_first_violation: yes|no
scope_expansion_required: yes|no
file_size_and_responsibility_risk: yes|no
file_size_exception: yes|no|not_required
file_size_exception_reason:
import_path_alias_risk: yes|no
non_bypassable_action: yes|no
simulation_scope: present|missing|not_applicable
blocker:
```
