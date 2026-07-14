# Proposal review (`proposal_review`)

```yaml
artifact_id: agents-evolution-state-proposal-review
artifact_type: ai-workflow-state
owner_layer: .ai/workflows/ai-operations/agents-evolution/states/
```

## Назначение (`purpose`)

Проверить proposal до применения: не дублирует ли он existing rule/check,
имеет ли evidence, recurrence signal, owner-layer и bounded scope.

## Выход (`output`)

- decision: accepted, rejected, deferred или needs-more-context;
- target decision confirmed;
- recurrence/dedup result;
- blockers;
- required revisions;
- approval status.
