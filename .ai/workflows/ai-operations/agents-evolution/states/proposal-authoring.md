# Proposal authoring (`proposal_authoring`)

```yaml
artifact_id: agents-evolution-state-proposal-authoring
artifact_type: ai-workflow-state
owner_layer: .ai/workflows/ai-operations/agents-evolution/states/
```

## Назначение (`purpose`)

Сформировать improvement proposal с bounded change scope и verification plan.

## Выход (`output`)

- proposal path или inline proposal;
- change target: rule, check, workflow, role, skill, documentation, tooling,
  code или mixed;
- target owner-layer;
- expected changed artifacts;
- code fix handoff, если target включает `code`;
- risks;
- verification plan;
- user approval requirements.
