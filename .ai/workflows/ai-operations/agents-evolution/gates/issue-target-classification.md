# Issue target classification gate (`issue_target_classification`)

```yaml
artifact_id: agents-evolution-gate-issue-target-classification
artifact_type: ai-workflow-gate
owner_layer: .ai/workflows/ai-operations/agents-evolution/gates/
owner_role: .ai/roles/process-tools-operations/ai-evolution-steward/INDEX.md
```

## Назначение

Gate отвечает на главный вопрос intake: что реально нужно менять.

## Классы target

- `code` - ошибка в product code, schema, tests, config или runtime behavior.
- `rule` - не хватает обязательного guardrail.
- `check` - правило есть, но нет pass/fail проверки.
- `workflow` - порядок действий, gates или handoff не определены.
- `role` - неясен owner или зона ответственности.
- `skill` - Codex skill ведёт агента неверно или неполно.
- `documentation` - canonical docs устарели или противоречат коду.
- `tooling` - нужна автоматизация, script, search mode, runtime/monitor support.
- `mixed` - требуется исправить code и AI-layer.
- `none` - шум, единичная ошибка без системного вывода или false positive.

## Выход

- selected target;
- rejected targets with reason;
- code owner role, если target включает `code`;
- AI-layer owner-layer, если target включает rule, check, workflow, role,
  skill, documentation или tooling;
- stop/defer reason, если evidence недостаточно.
