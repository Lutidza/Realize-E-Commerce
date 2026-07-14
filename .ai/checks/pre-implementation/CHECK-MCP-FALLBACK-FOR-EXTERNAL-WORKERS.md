# Check: MCP/tool fallback for external workers

```yaml
check_id: CHECK-MCP-FALLBACK-FOR-EXTERNAL-WORKERS
owner_layer: .ai/checks/pre-implementation/
related_rule:
  - .ai/rules/external-tools/RULE-MCP-FALLBACK-FOR-EXTERNAL-WORKERS.md
  - .ai/rules/external-tools/RULE-MCP-TOOLING-CONTOUR.md
required_output:
  - required_tool
  - tool_source_type
  - availability_status
  - fallback_reason
  - replacement_evidence
  - decision
```

## Условия прохождения

- Tool requirement назван явно.
- MCP/tooling contour выполнен до fallback decision.
- Missing project MCP не трактуется как hidden blocker.
- Fallback evidence достаточен для задачи или blocker зафиксирован.
