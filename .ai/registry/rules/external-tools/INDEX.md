# Rules Registry Shard: External Tools

```yaml
artifact_id: ai-registry-rules-external-tools
artifact_type: ai-rules-registry-shard
schema_version: 2
owner_layer: .ai/registry/rules/external-tools/
coverage:
  - .ai/rules/external-tools/
  - .ai/checks/pre-implementation/
```

```yaml
entries:
  - entry_id: mcp-tooling-contour
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/external-tools/RULE-MCP-TOOLING-CONTOUR.md
    owner_layer: .ai/rules/external-tools/
    owner_roles: [.ai/roles/process-tools-operations/mcp-tooling-steward/INDEX.md]
    enforcement_owner: .ai/roles/process-tools-operations/mcp-tooling-steward/INDEX.md
    related_rules: [.ai/rules/external-tools/RULE-MCP-FALLBACK-FOR-EXTERNAL-WORKERS.md]
    related_checks: [.ai/checks/pre-implementation/CHECK-MCP-TOOLING-CONTOUR.md]
    related_workflows: [.ai/workflows/ai-operations/mcp-tooling/WORKFLOW.md]
    related_codex_artifacts: [.codex/config.toml, .codex/README.md, .codex/STRUCTURE.md]
    related_tools: [MCP, rg]
    routing_tags: [external-tools, mcp, tooling, codex-adapter]
    trigger: "Task needs MCP/plugin/connector/local tool evidence, project-specific MCP config, availability decision or .ai/.codex tooling sync."
  - entry_id: mcp-fallback-for-external-workers
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/external-tools/RULE-MCP-FALLBACK-FOR-EXTERNAL-WORKERS.md
    owner_layer: .ai/rules/external-tools/
    owner_roles: [.ai/roles/process-tools-operations/mcp-tooling-steward/INDEX.md]
    enforcement_owner: .ai/roles/process-tools-operations/mcp-tooling-steward/INDEX.md
    related_rules: [.ai/rules/external-tools/RULE-MCP-TOOLING-CONTOUR.md]
    related_checks: [.ai/checks/pre-implementation/CHECK-MCP-FALLBACK-FOR-EXTERNAL-WORKERS.md]
    related_workflows: [.ai/workflows/ai-operations/mcp-tooling/WORKFLOW.md]
    related_codex_artifacts: [.codex/config.toml]
    related_tools: [MCP, rg]
    routing_tags: [external-tools, mcp, worker, fallback]
    trigger: "External worker, audit or review must use profile MCP/tool, but tool is unavailable and fallback evidence is required."
```
