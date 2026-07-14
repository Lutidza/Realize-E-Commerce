# MCP/tooling contour

```yaml
rule_id: RULE-MCP-TOOLING-CONTOUR
owner_layer: .ai/rules/external-tools/
owner_role: .ai/roles/process-tools-operations/mcp-tooling-steward/INDEX.md
applies_to:
  - MCP usage
  - plugin and connector tools
  - project-specific Codex MCP config
  - tool-dependent evidence
  - external worker tool requirements
requirement:
  - классифицировать MCP/tool source type до использования
  - определить source of truth и availability
  - использовать project-specific MCP только из согласованного `.codex/config.toml`
  - не hardcode-ить session-provided MCP/tools как project contract
  - фиксировать fallback/blocker decision при недоступности tool
forbidden:
  - восстанавливать MCP entries из другого проекта без owner-layer decision
  - хранить secrets или runtime state в `.ai`, `.codex` или documentation
  - выдавать tool-dependent evidence без фактической availability
  - подменять source-of-truth MCP догадкой или нерелевантным fallback
checks:
  - .ai/checks/pre-implementation/CHECK-MCP-TOOLING-CONTOUR.md
related_workflows:
  - .ai/workflows/ai-operations/mcp-tooling/WORKFLOW.md
```

## Контракт

MCP/tooling contour разделяет:

- project-specific MCP config: `.codex/config.toml`;
- active project policy: `.ai/rules/**`, `.ai/checks/**`,
  `.ai/workflows/**`, `.ai/registry/**`;
- project-facing architecture: `documentation/architecture/mcp-tooling.md`;
- session-provided tools: текущая runtime-среда, не project contract;
- plugin/connector tools: adapter capabilities, которые нужно проверять в
  текущей сессии.

Если MCP/tool отсутствует, агент не маскирует это. Он фиксирует fallback reason
или blocker.
