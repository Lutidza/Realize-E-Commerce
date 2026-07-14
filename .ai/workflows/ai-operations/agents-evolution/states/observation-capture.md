# Observation capture (`observation_capture`)

```yaml
artifact_id: agents-evolution-state-observation-capture
artifact_type: ai-workflow-state
owner_layer: .ai/workflows/ai-operations/agents-evolution/states/
```

## Назначение (`purpose`)

Зафиксировать факт поведения агента без преждевременного превращения его в
новое правило или workflow change.

## Выход (`output`)

- observation title;
- sanitized task/run context;
- evidence refs;
- fingerprint;
- recurrence key;
- change target candidate;
- affected owner-layer;
- suspected failure mode;
- next state recommendation.
