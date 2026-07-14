# Маппер групп ролей (`ai-role-groups-mapper`)

```yaml
artifact_id: ai-role-groups-mapper
artifact_type: ai-role-mapper
owner_layer: .ai/roles/
runtime_sources:
  - documentation/project-context.md
```

## Активные роли

### Developer Frontend

Файл: `.ai/roles/developer/frontend/INDEX.md`.

Выбирается для:

- public Next.js routes and layouts;
- React Server/Client Components;
- `src/ui/**`;
- Tailwind/shadcn/Radix/lucide UI work;
- browser behavior, forms, responsive layout, rendered DOM or visual parity.

### Developer Backend

Файл: `.ai/roles/developer/backend/INDEX.md`.

Выбирается для:

- Payload config and collections;
- Next.js API routes;
- data resolvers, mutations and domain services;
- migrations and PostgreSQL/PostGIS contracts;
- search/indexing services and backend data shape for UI/API consumers.

### Process Tools Operations

Активные карточки:

- `.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md`;
- `.ai/roles/process-tools-operations/documentation-steward/INDEX.md`;
- `.ai/roles/process-tools-operations/ai-evolution-steward/INDEX.md`;
- `.ai/roles/process-tools-operations/mcp-tooling-steward/INDEX.md`;
- `.ai/roles/process-tools-operations/ai-runtime-evolution-steward/INDEX.md`.

Выбираются для изменений `.ai/**`, `.codex/**`, worker runtime, workflows,
rules, checks, registry, skills and tooling.

`AI Evolution Steward` выбирается для evidence-based развития правил,
проверок, workflow, ролей, skills, documentation и tooling на основе реальных
ошибок проекта, user corrections, failed verification и повторяющегося drift.

`MCP Tooling Steward` выбирается для MCP, plugin/connector tools,
project-specific `.codex/config.toml`, tool availability, fallback/blocker
decision и синхронизации `.ai` с `.codex` adapter layer.

`AI Runtime Evolution Steward` выбирается уже для runtime/monitor/worker
tooling: agent runtime, gateway, monitor, worker sessions и process tracking.

## Межслойные задачи

Открывай frontend и backend роли вместе, если меняется:

- route/API response consumed by UI;
- Payload collection field visible in admin or public UI;
- validation, auth or account behavior visible in UI;
- search/filter contract used by route pages;
- data contract between Payload/data layer and React components.
