# Check: MCP/tooling contour

```yaml
check_id: CHECK-MCP-TOOLING-CONTOUR
owner_layer: .ai/checks/pre-implementation/
related_rule:
  - .ai/rules/external-tools/RULE-MCP-TOOLING-CONTOUR.md
related_workflow:
  - .ai/workflows/ai-operations/mcp-tooling/WORKFLOW.md
required_output:
  - tool_need
  - tool_source_type
  - selected_tool_or_mcp
  - source_of_truth
  - availability_status
  - fallback_or_blocker_decision
  - mcp_reference_scan
  - stale_mcp_assumption_scan
  - evidence_or_skip_reason
  - sync_required
  - decision
```

## Условия прохождения

- Tool/MCP requirement назван явно.
- Source type выбран: project-specific, session-provided, plugin-provided,
  connector, local tool или fallback.
- Source of truth определён.
- Availability проверена фактически или указан blocker.
- Missing MCP не трактуется как скрытая причина пропуска проверки.
- Fallback покрывает evidence need или задача останавливается.
- При изменении MCP/tooling contour выполнен MCP self-scan:
  `.ai`, `.codex`, `documentation`, stale project assumptions, secrets/tokens.
- При изменении `.codex/config.toml` указан sync с `.ai` и documentation.
