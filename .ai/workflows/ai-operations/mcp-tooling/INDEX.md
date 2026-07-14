# Workflow MCP/tooling (`mcp-tooling`)

```yaml
artifact_id: mcp-tooling-workflow-directory-index
artifact_type: ai-workflow-directory-index
owner_layer: .ai/workflows/ai-operations/mcp-tooling/
runtime_sources:
  - .ai/workflows/ai-operations/mcp-tooling/WORKFLOW.md
  - .ai/roles/process-tools-operations/mcp-tooling-steward/INDEX.md
  - .ai/rules/external-tools/RULE-MCP-TOOLING-CONTOUR.md
```

## Назначение

Workflow определяет, как агент выбирает MCP/tool, проверяет availability,
принимает fallback/blocker decision и синхронизирует `.ai` с `.codex`.

## Entrypoint

Открывать `WORKFLOW.md` для задач, где фигурирует MCP, plugin, connector,
external tool, Codex adapter, tool evidence или fallback из-за недоступного
tool.
