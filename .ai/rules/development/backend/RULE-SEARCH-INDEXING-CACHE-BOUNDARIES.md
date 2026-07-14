# Границы search, indexing и cache

```yaml
rule_id: RULE-SEARCH-INDEXING-CACHE-BOUNDARIES
owner_role: .ai/roles/developer/backend/INDEX.md
applies_to:
  - src/domain/services/search/**
  - src/domain/services/cache/**
  - src/domain/data/searchProfiles/**
  - src/app/api/search/**
  - src/app/api/filters/**
  - indexing jobs
  - Redis/cache integration
trigger:
  - меняется Search Profile, provider, Elasticsearch query/mapping, indexing job, cache key, cache invalidation или search API response
requirement:
  - сохранить Payload/PostgreSQL как source of truth
  - держать Elasticsearch как projection/search provider
  - определить reindex и cache invalidation decision
  - проверить frontend/API consumers search response
forbidden:
  - делать Elasticsearch source of truth для доменных данных
  - обходить Search Profile/provider flow локальным query
  - менять cache key/TTL без invalidation impact
  - менять search response shape без affected UI/API review
checks:
  - .ai/checks/development/backend/CHECK-SEARCH-INDEXING-CACHE-BOUNDARIES.md
```

## Контракт

Search flow:

1. Payload/PostgreSQL хранит canonical data.
2. Search Profile описывает query/filter contract.
3. Provider строит запрос к Elasticsearch или fallback.
4. Indexing job синхронизирует projection.
5. Redis/cache может ускорять чтение, но не становится source of truth.

Любое изменение search/index/cache требует решения: health check, reindex,
cache invalidation, consumer compatibility или documented skip reason.
