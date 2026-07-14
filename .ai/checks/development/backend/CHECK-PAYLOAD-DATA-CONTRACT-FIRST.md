# Check: сначала Payload/data contract

```yaml
check_id: CHECK-PAYLOAD-DATA-CONTRACT-FIRST
owner_layer: .ai/checks/development/backend/
related_rule:
  - .ai/rules/development/backend/RULE-PAYLOAD-DATA-CONTRACT-FIRST.md
required_output:
  - changed_contract
  - source_of_truth
  - migration_or_schema_workflow
  - generated_types_decision
  - affected_consumers
  - documentation_sync
  - decision
```

## Условия прохождения

- Changed contract назван до реализации.
- Source of truth определён.
- Для DB/schema изменения есть migration/schema workflow decision.
- Для Payload schema изменения есть generated types decision.
- Affected consumers перечислены или обоснованно отсутствуют.
- `src/payload-types.ts` не редактируется вручную.
