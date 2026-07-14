# Regression risk gate (`regression_risk`)

```yaml
artifact_id: agents-evolution-gate-regression-risk
artifact_type: ai-workflow-gate
owner_layer: .ai/workflows/ai-operations/agents-evolution/gates/
```

## Назначение (`purpose`)

Проверить, не создаёт ли improvement новый workflow drift, избыточную
обязательность, дублирование rules или конфликт `.ai/*` и `.codex/*`.

Особенно проверять:

- не превращается ли единичный code defect в глобальное правило;
- не дублирует ли proposal уже существующий rule/check/workflow/skill;
- не создаёт ли новая роль слишком узкий task-specific owner;
- не раздувает ли RAG/context pack будущих агентов;
- не конфликтует ли proposed behavior с AGENTS.md, role mapper или registry.

## Выход (`output`)

- regression risks;
- required verification;
- rollback/defer decision.
