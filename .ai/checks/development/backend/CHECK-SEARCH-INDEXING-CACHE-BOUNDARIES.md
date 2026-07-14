# Check: границы search, indexing и cache

```yaml
check_id: CHECK-SEARCH-INDEXING-CACHE-BOUNDARIES
owner_layer: .ai/checks/development/backend/
related_rule:
  - .ai/rules/development/backend/RULE-SEARCH-INDEXING-CACHE-BOUNDARIES.md
required_output:
  - changed_search_or_cache_surface
  - source_of_truth
  - search_profile_or_provider
  - indexing_impact
  - cache_invalidation_decision
  - consumer_compatibility
  - health_reindex_or_skip_reason
  - decision
```

## Условия прохождения

- Payload/PostgreSQL остаётся source of truth.
- Elasticsearch рассматривается как projection/search provider.
- Search Profile/provider flow не обходится локальным query.
- Reindex/cache invalidation decision зафиксирован.
- Search response consumers проверены или есть documented skip reason.
