# Apply change (`apply_change`)

```yaml
artifact_id: agents-evolution-state-apply-change
artifact_type: ai-workflow-state
owner_layer: .ai/workflows/ai-operations/agents-evolution/states/
```

## Назначение (`purpose`)

Применить accepted change только в согласованном owner-layer и обновить
связанные runtime consumers.

## Выход (`output`)

- changed artifacts;
- stale paths removed or synced;
- prevented failure;
- registry/docs sync result;
- checks run;
- residual risk.
