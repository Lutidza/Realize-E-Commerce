# RULE-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE

```yaml
rule_id: RULE-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE
title: Решение по canonical documentation перед contract-level изменениями
artifact_type: project-documentation-rule
owner_roles:
  - .ai/roles/developer/frontend/INDEX.md
  - .ai/roles/developer/backend/INDEX.md
  - .ai/roles/process-tools-operations/documentation-steward/INDEX.md
owner_layer: .ai/rules/documentation/
enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
check: .ai/checks/pre-implementation/CHECK-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE.md
codex_skill: .codex/skills/skill-documentation-sync/SKILL.md
registry: .ai/registry/rules/INDEX.md
rule_scope: project-wide
scope: contract_level_changes
applies_to:
  - application contracts
  - ai runtime contracts
  - documentation sync
  - code boundary documentation
```

## Назначение

Правило останавливает contract-level изменения до решения по ближайшей
canonical documentation. Оно не делает `documentation/**` active runtime
source для агента: active behavior остаётся в `.ai/rules/**`,
`.ai/checks/**`, `.ai/workflows/**`, role-gates и `.codex/**`.

## Условие срабатывания

Правило применяется, если планируемое изменение создаёт, меняет или удаляет:

- product, architecture, API, DTO, validation, schema, route, auth,
  integration, runtime state, workflow, role, rule, check или owner-layer
  contract;
- reusable frontend/backend contract, shared Next/React behavior, mapper,
  adapter, migration-flow или data boundary;
- `@docref`/`@see` для contract-facing code boundary.

Правило не требует полного spec audit для локальной неконтрактной правки:
typo, narrow visual adjustment, formatting, dependency-free helper cleanup или
internal refactor без изменения observable contract могут пройти с
`canonical_doc_decision: not_contract_level`.

## Требование

Перед реализацией агент обязан зафиксировать `canonical_doc_decision`:

- `existing_doc_found` - ближайший canonical doc найден и достаточен для
  планируемого contract-level изменения;
- `existing_doc_insufficient` - doc найден, но не покрывает новый contract;
- `missing_doc` - применимый canonical doc не найден;
- `not_contract_level` - изменение не затрагивает contract-level поведение.

Developer frontend/backend обязан искать ближайший применимый canonical doc в
рамках затронутого контура и не превращать локальную правку в полный audit
всей документации.

Documentation steward проверяет sync и alignment, если изменение затрагивает
`documentation/`, `.ai`, `.codex`, README, AGENTS или contract-level
договорённость.

Если decision равен `existing_doc_insufficient` или `missing_doc`, реализация
contract-level изменения останавливается до spec alignment, расширения
allowlist на docs sync или явного user-approved deferral.

После approved contract-level изменения соответствующий canonical doc должен
быть синхронизирован в текущем scope либо должен быть явно зафиксирован
`docs_sync_debt` с владельцем и следующим шагом.

## Запрещено

- Начинать contract-level реализацию без `canonical_doc_decision`.
- Использовать README, AGENTS, task, audit report, code comments или локальный
  helper как замену canonical doc.
- Требовать полный documentation/spec audit для локальной неконтрактной правки.
- Создавать пустой или декоративный spec/docref только для прохождения gate.
- Скрывать `existing_doc_insufficient`, `missing_doc` или `docs_sync_debt`.

## Обязательный вывод

```text
canonical_documentation_gate: passed|not_required|stop-for-approval|failed
contract_level_change: yes|no
affected_contract:
nearest_canonical_doc:
canonical_doc_decision:
documentation_sync_required: yes|no
documentation_sync_scope: in_scope|needs_scope|deferred_with_approval|not_required
docs_sync_debt:
blocker:
```
