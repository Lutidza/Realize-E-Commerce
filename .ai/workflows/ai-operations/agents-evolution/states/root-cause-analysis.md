# Root cause analysis (`root_cause_analysis`)

```yaml
artifact_id: agents-evolution-state-root-cause-analysis
artifact_type: ai-workflow-state
owner_layer: .ai/workflows/ai-operations/agents-evolution/states/
```

## Назначение (`purpose`)

Отделить симптом от причины: ошибка в коде, weak rule, missing check, unclear
workflow, role gap, outdated skill, stale documentation, missing tool evidence
или плохой context pack.

## Выход (`output`)

- root cause;
- code defect decision: yes/no/mixed;
- rejected causes;
- affected artifacts;
- proposed owner-layer;
- proposed change target;
- regression risk.
