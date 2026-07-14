# CHECK-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE

```yaml
artifact_id: CHECK-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE
artifact_type: ai-pre-implementation-check
owner_roles:
  - .ai/roles/developer/frontend/INDEX.md
  - .ai/roles/developer/backend/INDEX.md
  - .ai/roles/process-tools-operations/documentation-steward/INDEX.md
owner_layer: .ai/checks/pre-implementation/
rule: .ai/rules/documentation/RULE-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE.md
enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
registry: .ai/registry/rules/INDEX.md
check_stage: pre_implementation_canonical_documentation_gate
rule_scope: project-wide
scope: contract_level_changes
```

## Условие срабатывания

Запускать перед изменением файлов, если планируемый `work_task` может менять
contract-level поведение: product/API/DTO/schema, validation, auth, route,
integration, shared UI/backend contract, workflow, role, rule, check,
owner-layer, runtime state или code boundary с `@docref`.

Если задача не меняет contract-level поведение, check возвращает
`not_required` с причиной и не требует полного documentation audit.

## Входы

- последняя пользовательская команда;
- task classification;
- planned affected files/contours;
- affected contract;
- ближайшие найденные canonical docs или reason, почему поиск не требуется;
- `canonical_doc_decision`;
- planned documentation sync scope;
- known `docs_sync_debt`;
- role: developer frontend, developer backend или documentation steward.

## Процедура

1. Классифицировать задачу как `dialog_only` или `work_task`.
2. Если это `dialog_only`, вернуть `not_required`.
3. Определить, есть ли contract-level риск.
4. Если contract-level риска нет, вернуть `not_required` и указать reason.
5. Для contract-level изменения назвать affected contract.
6. Найти ближайший применимый canonical doc в `documentation/**` по контуру и
   типу contract, без полного audit всей документации.
7. Зафиксировать `canonical_doc_decision`.
8. Если doc найден и достаточен, разрешить реализацию при выполнении остальных
   gates.
9. Если doc отсутствует или недостаточен, остановить реализацию до spec
   alignment, approved docs sync scope или явного user-approved deferral.
10. Если реализация меняет contract, проверить, что docs sync входит в scope
    либо зафиксирован `docs_sync_debt`.

## Условия прохождения

- `canonical_doc_decision` зафиксирован.
- Для contract-level изменения назван affected contract.
- Ближайший canonical doc найден и достаточен либо отсутствие/недостаточность
  привели к stop-for-approval.
- Локальная неконтрактная правка не превращена в полный documentation audit.
- Documentation sync выполнен в scope или вынесен как approved debt.

## Условия ошибки

- Contract-level реализация начинается без `canonical_doc_decision`.
- Отсутствующий или недостаточный canonical doc скрыт.
- README, AGENTS, task, audit report, code comments или локальная заметка
  использованы как замена canonical doc.
- Агент требует полный spec audit для локальной неконтрактной правки.
- Contract-level change завершён без docs sync и без approved debt.

## Вывод

```text
canonical_documentation_gate: passed|not_required|stop-for-approval|failed
task_classification: dialog_only|work_task
contract_level_change: yes|no
affected_contract:
nearest_canonical_doc:
canonical_doc_decision:
documentation_sync_required: yes|no
documentation_sync_scope: in_scope|needs_scope|deferred_with_approval|not_required
docs_sync_debt:
blocker:
```
