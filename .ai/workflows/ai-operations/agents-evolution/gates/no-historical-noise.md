# No historical noise gate (`no_historical_noise`)

```yaml
artifact_id: agents-evolution-gate-no-historical-noise
artifact_type: ai-workflow-gate
owner_layer: .ai/workflows/ai-operations/agents-evolution/gates/
related_rule: .ai/rules/development/RULE-NO-HISTORICAL-NOISE.md
```

## Назначение (`purpose`)

Отделить actionable improvement от исторического шума, который не должен
раздувать active rules, checks или workflows.

Historical evolution artifacts можно использовать как evidence для recurrence,
но нельзя копировать из них raw rationale или старые runtime assumptions в
active instructions.

## Выход (`output`)

- actionable decision;
- historical-only reason, если change не нужен;
- target owner-layer, если change нужен.
