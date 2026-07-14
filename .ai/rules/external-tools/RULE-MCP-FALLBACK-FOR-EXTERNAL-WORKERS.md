# MCP/tool fallback for external workers

```yaml
rule_id: RULE-MCP-FALLBACK-FOR-EXTERNAL-WORKERS
owner_layer: .ai/rules/external-tools/
owner_role: .ai/roles/process-tools-operations/mcp-tooling-steward/INDEX.md
applies_to:
  - external worker sessions
  - tool-dependent checks
requirement:
  - определить, какой tool/MCP действительно нужен задаче
  - применить MCP/tooling contour до fallback decision
  - если tool недоступен, зафиксировать fallback reason
  - не ссылаться на MCP старого проекта как на обязательный source of truth
checks:
  - .ai/checks/pre-implementation/CHECK-MCP-FALLBACK-FOR-EXTERNAL-WORKERS.md
related_rule:
  - .ai/rules/external-tools/RULE-MCP-TOOLING-CONTOUR.md
```

## Контракт

Fallback применяется только после MCP/tooling contour:

1. tool need назван явно;
2. source type и availability проверены;
3. source of truth определён;
4. fallback покрывает evidence need или задача останавливается как blocker.

Project-specific MCP servers текущего проекта описаны в `.codex/config.toml`.
Агент может использовать доступные terminal/browser/session tools, но не
должен требовать MCP entries из перенесённых слоёв других проектов как
обязательный source of truth.
