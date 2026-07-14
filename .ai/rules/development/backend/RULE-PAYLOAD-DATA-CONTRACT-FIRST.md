# Сначала Payload/data contract

```yaml
rule_id: RULE-PAYLOAD-DATA-CONTRACT-FIRST
owner_role: .ai/roles/developer/backend/INDEX.md
applies_to:
  - Payload schema
  - Payload fields
  - hooks
  - access rules
  - migrations
  - API response shape
  - data resolvers
  - generated types
trigger:
  - меняется collection, field, relation, enum, localized field, geo field, access, hook, migration, DTO или API response
requirement:
  - сначала определить changed contract и source of truth
  - определить migration/schema workflow до изменения DB-facing contract
  - определить generated types decision до handoff
  - определить affected consumers до реализации
forbidden:
  - менять schema без решения по migration и generated types
  - редактировать src/payload-types.ts вручную
  - менять relationship, enum, localized field или PostGIS/geo field без consumer impact review
  - менять API response shape без явного mapper/resolver owner
checks:
  - .ai/checks/development/backend/CHECK-PAYLOAD-DATA-CONTRACT-FIRST.md
related_codex_artifacts:
  - .codex/skills/payload-next-contracts-first/SKILL.md
  - .codex/skills/dto-contracts-first/SKILL.md
```

## Контракт

Contract-first порядок:

1. Назвать contract: Payload schema, API DTO, resolver result, search profile,
   cache key, route parsing result или migration.
2. Назвать source of truth: Payload/PostgreSQL, migration, Search Profile,
   Elasticsearch projection, Redis cache или route helper.
3. Назвать affected consumers: Payload admin, public UI, API route, indexing
   job, import script, cache, tests.
4. Выполнить реализацию в owner-layer, а не в consumer-е.
5. Синхронизировать migrations, generated types, documentation и tests по
   фактическому scope.
