# Frontend workflows (`frontend_workflows_index`)

```yaml
artifact_id: ai-workflows-frontend-index
artifact_type: ai-workflow-index
owner_layer: .ai/workflows/frontend/
runtime_sources:
  - documentation/project-context.md
  - .ai/roles/developer/frontend/INDEX.md
```

## Назначение

Frontend workflows описывают порядок гейтов для изменений в Next.js routes,
React components, Tailwind/shadcn UI, rendered DOM and browser behavior.

## Active workflows

- `next-react/guardrail/` - pre-implementation и self-review guardrail для
  `src/app/**`, `src/ui/**` and UI-facing route helpers.
