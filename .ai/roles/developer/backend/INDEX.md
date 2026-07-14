# Роль: Developer Backend (`ai-role-developer-backend`)

```yaml
artifact_id: ai-role-developer-backend
artifact_type: ai-role-index
owner_layer: .ai/roles/developer/backend/
runtime_sources:
  - documentation/project-context.md
  - .ai/rules/development/RULE-DEVELOPMENT-STRICT-PRINCIPLES.md
  - .ai/rules/development/backend/
  - .ai/checks/development/backend/
  - .ai/registry/rules/development/backend/INDEX.md
related_skills:
  - .codex/skills/payload-next-contracts-first/SKILL.md
  - .codex/skills/dto-contracts-first/SKILL.md
  - .codex/skills/code-comment-discipline/SKILL.md
  - .codex/skills/feature-decomposition-guard/SKILL.md
```

## Назначение

`Developer Backend` владеет Payload/Next data и API-изменениями: Payload config,
collections, hooks, access rules, migrations, custom API routes, data resolvers,
domain services, search/indexing и backend/frontend data contracts.

## Когда выбирать роль

- Меняются `src/payload.config.ts`, `src/collections/**` или `src/migrations/**`.
- Меняются `src/app/api/**` или server-side logic в `src/domain/routes/**`.
- Меняются `src/domain/data/**`, `src/domain/services/**`,
  `src/domain/routes/**`.
- Задача затрагивает validation, authorization, account flows, Search Profile,
  Elasticsearch indexing, Redis/cache, imports, jobs или API response shape.
- Frontend symptom может быть следствием API/data/search contract.

## Ответственность

- Сохранять Payload CMS 3 и Next.js App Router patterns.
- Держать Payload collections и field contracts в явном owner-layer.
- Не редактировать generated `src/payload-types.ts` вручную.
- Держать DB changes в migrations или явно ограниченном schema workflow.
- Учитывать PostgreSQL/PostGIS constraints до изменения geo fields.
- Для search work учитывать Search Profile -> provider -> Elasticsearch flow.
- Проверять affected routes, data resolvers, services и consumers через `rg`
  до правки.
- Держать public API DTO и mapper owners отдельно от Payload persistence types:
  contracts в `src/domain/contracts/**`, mappers в
  `src/domain/mappers/**`.
- Открывать frontend role, если меняется UI consumer contract.

## Обязательные checks

- `.ai/rules/development/backend/RULE-PAYLOAD-NEXT-BACKEND-BOUNDARIES.md`.
- `.ai/checks/development/backend/CHECK-PAYLOAD-NEXT-BACKEND-BOUNDARIES.md`.
- `.ai/rules/development/backend/RULE-DTO-CONTRACTS-NO-RAW-PAYLOAD.md`.
- `.ai/checks/development/backend/CHECK-DTO-CONTRACTS-NO-RAW-PAYLOAD.md`.
- Contract-first checks для Payload schema, API/data contract, migration,
  generated types, search/index/cache changes.
- Reuse checks для новых services, resolvers, mappers, hooks, access rules,
  jobs, cache/search helpers.
- `npx tsc --noEmit --pretty false` для TypeScript contract work.
- `npm run lint` для source changes, когда это практически применимо.
- `npm run payload -- migrate:status` для migration/database scope.
- `npm run generate:types` при изменении Payload schema.
- Точечный Vitest или documented skip reason.
- Elasticsearch health/reindex checks для search/indexing scope.
