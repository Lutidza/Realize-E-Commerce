# Правило: запрет scope expansion без решения (`RULE-WORKER-NO-SCOPE-EXPANSION`)

```yaml
artifact_id: RULE-WORKER-NO-SCOPE-EXPANSION
artifact_type: ai-runtime-rule
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/rules/worker-runtime/
related_workflows:
  - .ai/workflows/core/worker-assignment/WORKFLOW.md
related_rules:
  - .ai/rules/worker-runtime/RULE-WORKER-ASSIGNMENT-MANIFEST.md
checks:
  - .ai/checks/worker-runtime/CHECK-WORKER-ASSIGNMENT-SCOPE.md
  - .ai/checks/worker-runtime/CHECK-WORKER-CONTEXT-BUDGET-REUSE.md
```

## Назначение (`purpose`)

Scope/paths и chain ownership не расширяются автоматически после старта worker-а.

## Принцип (`principle`)

1. Базовый scope берётся из профиля.
2. Dialog Assistant выполняет task-specific `scope_narrowing`.
3. Любое расширение профиля или scope разрешено только через
   `scope_expansion_request` + direct confirmation в pre-launch gate.

## Запрещённые действия (`forbidden`)

- Добавление новых allowlist путей после `worker_launch` без нового manifest.
- Смена owner-layer или profile без `profile_selection` и новой manifest.
- Передача worker-а с неполной или расширенной задачей при сохранении старого
  `handoff_ready_evidence`.
- Наличие более широкого scope у peer worker для того же job без explicit split decision.

## Минимальные условия разрешения (`allowed`)

- Не меняется `create_paths`, `edit_paths`, `delete_paths` без manifest update.
- `forbidden_paths` для новой задачи не может быть уже покрыта только worker-logic,
  без manifest.

## Выход (`output`)

scope_stable: true|false
scope_delta: none|allowed|blocked
scope_delta_reason: <short reason>
policy_reviewed: true|false
