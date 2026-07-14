# Rejected or deferred (`rejected_or_deferred`)

```yaml
artifact_id: agents-evolution-transition-rejected-or-deferred
artifact_type: ai-workflow-transition
owner_layer: .ai/workflows/ai-operations/agents-evolution/transitions/
```

## Условие перехода (`condition`)

Proposal или observation переводится в rejected/deferred, если evidence
недостаточно, target classification неверен, owner-layer неверен, recurrence
score недостаточен, риск выше пользы или change не нужен сейчас.
