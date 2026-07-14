# MCP tooling для Realize-E-Commerce

## Активные MCP серверы (`.codex/config.toml`)

На текущем контуре AI-монтаж использует:

- `recommerce-playwright` — browser/runtime evidence.
- `recommerce-tailwind` — помощь по Tailwind-утилитам и UI паттернам.
- `recommerce-next-devtools` — интеграция с Next.js diagnostics/runtime bridge.
- `recommerce-payload` — локальный Payload MCP bridge через admin API.

## Политика использования

- Все MCP server entries управляются только через workflow
  `.ai/workflows/ai-operations/mcp-tooling/WORKFLOW.md`.
- `.codex/config.toml` остаётся источником для Codex runtime,
  `.ai/rules/external-tools/RULE-MCP-TOOLING-CONTOUR.md` — источником policy.
- Секреты (`PAYLOAD_MCP_API_KEY`) не хранятся в репозитории.
