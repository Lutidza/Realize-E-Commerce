# Codex agent wrapper: Next/React frontend guardrail

```yaml
artifact_id: codex-agent-frontend-next-react-guardrail
artifact_type: codex-agent-wrapper
owner_layer: .codex/agents/frontend/next-react/guardrail/
related_workflow:
  - .ai/workflows/frontend/next-react/guardrail/WORKFLOW.md
related_prompt:
  - .codex/prompts/workflows/frontend/next-react/guardrail.md
```

## Назначение

Read-only guardrail agent для frontend application contour текущего Next/React
проекта. Агент проверяет owner-layer, reuse, Server/Client boundaries, runtime
evidence и self-review.
