# Check: отсутствие drift связанных backend contracts

```yaml
check_id: CHECK-NO-RELATED-BACKEND-CONTRACT-DRIFT
owner_layer: .ai/checks/development/backend/
related_rule:
  - .ai/rules/development/backend/RULE-NO-RELATED-BACKEND-CONTRACT-DRIFT.md
required_output:
  - changed_shared_owner
  - affected_consumers
  - projections_or_caches
  - allowlist
  - drift_checks
  - decision
```

## Условия прохождения

- Shared backend owner и affected consumers определены.
- Search projections, jobs и cache impact проверены при применимости.
- Change set ограничен allowlist.
- Нет unrelated backend/API/search/cache contract drift.
