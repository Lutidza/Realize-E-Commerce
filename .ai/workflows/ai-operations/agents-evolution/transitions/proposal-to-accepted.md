# Proposal to accepted (`proposal_to_accepted`)

```yaml
artifact_id: agents-evolution-transition-proposal-to-accepted
artifact_type: ai-workflow-transition
owner_layer: .ai/workflows/ai-operations/agents-evolution/transitions/
```

## Условие перехода (`condition`)

Переход разрешён только после review decision `accepted`, подтверждённого
change target, owner-layer, allowlist и явного approval, если proposal меняет
active rule/check/workflow/role/skill/adapter/tooling.
