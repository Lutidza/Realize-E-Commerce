# Индекс workflows (`ai-workflows-index`)

```yaml
artifact_id: ai-workflows-index
artifact_type: ai-workflow-index
owner_layer: .ai/workflows/
runtime_sources:
  - .ai/README.md
  - documentation/project-context.md
```

## Назначение

`.ai/workflows/` маршрутизирует агента к process model для конкретного типа
работ. Workflow связывает роли, rules, checks, gates и outputs, но не заменяет
сами rules/checks.

## Active routing

- Общий delivery step: `.ai/workflows/core/main-delivery/`.
- Worker assignment: `.ai/workflows/core/worker-assignment/`.
- Worker session lifecycle: `.ai/workflows/core/worker-session/`.
- Agent runtime maintenance: `.ai/workflows/ai-operations/agent-runtime-maintenance/`.
- Agent layer evolution and learning loop:
  `.ai/workflows/ai-operations/agents-evolution/`.
- MCP/tooling contour: `.ai/workflows/ai-operations/mcp-tooling/`.
- Next/React frontend guardrail:
  `.ai/workflows/frontend/next-react/guardrail/`.
- Git commit/push: `.ai/workflows/delivery/git/commit-push/`.

## Planned taxonomy

Target-only workflow domains are not active until they contain `INDEX.md` or
`WORKFLOW.md`:

- `backend/payload-next/*`;
- `data/postgres/*`;
- `search/elasticsearch/*`;
- `infrastructure/local-env/*`;
- `documentation/*`;
- `quality/*`;
- `architecture/*`;
- `frontend/shared/*`.

## Правила размещения

- Не создавать workflow в корне `.ai/workflows/`, если у него есть domain.
- Не использовать target-only папку как runtime entrypoint.
- При переносе workflow обновлять `.ai/roles/*`, `.ai/registry/*`,
  `.codex/agents/*`, `.codex/prompts/*`, `.codex/skills/*`.
- Не оставлять stale paths рядом с новым workflow.
