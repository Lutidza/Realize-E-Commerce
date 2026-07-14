# Структура Codex-слоя (`codex_structure`)

```yaml
artifact_id: codex-adapter-layer-structure
artifact_type: codex-adapter-structure
owner_layer: .codex/
runtime_sources:
  - .codex/README.md
  - .codex/config.toml
```

## Active layout

```text
.codex/
├── README.md
├── STRUCTURE.md
├── config.toml
├── agents/
│   └── frontend/
│       └── next-react/
│           └── guardrail/
├── prompts/
│   └── workflows/
│       └── frontend/
│           └── next-react/
│               └── guardrail.md
└── skills/
```

## Policy

`.codex/` stores Codex-specific adapters only. Project rules and checks live in
`.ai/*`.

Project-specific MCP config belongs to `.codex/config.toml`. Active MCP policy
belongs to `.ai/rules/external-tools/RULE-MCP-TOOLING-CONTOUR.md` and
`.ai/workflows/ai-operations/mcp-tooling/WORKFLOW.md`.

Project-specific MCP servers are declared in `.codex/config.toml` and mirrored
into the active Codex runtime through `codex mcp add`. Stale MCP entries from
transferred layers must not be restored or used as project source of truth
without MCP tooling workflow approval.

Current project-specific MCP servers:

- `recommerce-playwright`;
- `recommerce-tailwind`;
- `recommerce-next-devtools`;
- `recommerce-payload`.
