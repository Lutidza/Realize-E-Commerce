# Check: backend self-review

```yaml
check_id: CHECK-BACKEND-GUARDRAIL-SELF-REVIEW
owner_layer: .ai/checks/development/backend/self-review/
owner_role: .ai/roles/developer/backend/INDEX.md
required_output:
  - changed_backend_contracts
  - owner_layers
  - migrations_and_generated_types
  - affected_consumers
  - search_cache_indexing_impact
  - checks_run
  - checks_skipped_with_reason
  - documentation_sync
  - decision
```

## Условия прохождения

- Backend owner-layer decisions подтверждены.
- Contract-first checks выполнены для schema/API/data/search changes.
- Migration/generated types decisions не пропущены.
- Affected frontend/admin/API/search/cache consumers перечислены.
- Проверки выполнены по фактическому scope или пропущены с причиной.
