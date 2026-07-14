# Applied change: MCP operating layer foundation

```yaml
artifact_id: APPLIED-20260618-mcp-operating-layer-foundation
artifact_type: agents-evolution-applied-change
owner_layer: .ai/agents-evolution/applied-changes/
status: applied
source_proposal: PROP-20260618-mcp-operating-layer-foundation
change_target: tooling
related_change_targets:
  - rule
  - check
  - workflow
  - role
  - documentation
prevented_failure: mcp-layer-has-fallback-but-no-operating-model
changed_paths:
  - .ai/roles/process-tools-operations/mcp-tooling-steward/INDEX.md
  - .ai/workflows/ai-operations/mcp-tooling/INDEX.md
  - .ai/workflows/ai-operations/mcp-tooling/WORKFLOW.md
  - .ai/rules/external-tools/RULE-MCP-TOOLING-CONTOUR.md
  - .ai/checks/pre-implementation/CHECK-MCP-TOOLING-CONTOUR.md
  - documentation/architecture/mcp-tooling.md
  - .ai/roles/role-groups.md
  - .ai/workflows/INDEX.md
  - .ai/registry/rules/INDEX.md
  - .ai/registry/rules/external-tools/INDEX.md
  - .ai/rules/external-tools/RULE-MCP-FALLBACK-FOR-EXTERNAL-WORKERS.md
  - .ai/checks/pre-implementation/CHECK-MCP-FALLBACK-FOR-EXTERNAL-WORKERS.md
  - .codex/config.toml
  - .codex/README.md
  - .codex/STRUCTURE.md
checks:
  - rg MCP/mcp self-scan across .ai .codex documentation
  - rg stale external-project MCP names self-scan
  - registry, role mapper, workflow index and Codex adapter link check
  - git diff --check
residual_risks:
  - Project-specific MCP servers are still intentionally unset.
  - Any future MCP server requires separate version evidence, secret handling and owner-layer approval.
  - Session-provided tools must not be treated as durable project contract.
```

## Итог

Рабочий AI-layer больше не описывает MCP только через fallback. Добавлен
активный MCP/tooling contour: роль-владелец, workflow, rule, check,
документация и registry/Codex adapter sync.

## Ограничения Evidence

Applied trace не содержит raw terminal output, runtime dump, `.ai/tasks/**`,
task-origin data, worker transcript или private reasoning.
