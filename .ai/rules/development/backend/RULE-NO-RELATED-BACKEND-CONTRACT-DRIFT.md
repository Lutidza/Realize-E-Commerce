# Без drift связанных backend contracts

```yaml
rule_id: RULE-NO-RELATED-BACKEND-CONTRACT-DRIFT
owner_role: .ai/roles/developer/backend/INDEX.md
applies_to:
  - shared backend services
  - Payload collections
  - API routes
  - data resolvers
  - route/search contracts
  - jobs
  - cache owners
trigger:
  - правка shared backend owner может изменить несколько consumers или projections
requirement:
  - определить affected consumers и projections
  - ограничить change set allowlist
  - проверить, что unrelated contracts не меняются
forbidden:
  - менять shared data/service owner без списка affected surfaces
  - исправлять один consumer через shared owner, ломая другой
  - менять cache/search projection без invalidation или reindex decision
checks:
  - .ai/checks/development/backend/CHECK-NO-RELATED-BACKEND-CONTRACT-DRIFT.md
```

## Контракт

Любая правка shared collection, resolver, service, route helper, search profile,
indexing job или cache helper требует списка affected consumers:

- Payload admin;
- public UI;
- API routes;
- imports/scripts;
- search index;
- Redis/cache;
- tests и fixtures.

Если affected surfaces не определены, реализация останавливается до анализа.
