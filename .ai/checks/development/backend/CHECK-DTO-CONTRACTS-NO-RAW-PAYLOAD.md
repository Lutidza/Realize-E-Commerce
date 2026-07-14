# Check: DTO contracts без raw Payload leakage

```yaml
check_id: CHECK-DTO-CONTRACTS-NO-RAW-PAYLOAD
owner_layer: .ai/checks/development/backend/
related_rule:
  - .ai/rules/development/backend/RULE-DTO-CONTRACTS-NO-RAW-PAYLOAD.md
required_output:
  - changed_contract
  - dto_owner
  - mapper_owner
  - raw_payload_leakage_scan
  - affected_consumers
  - response_shape
  - decision
```

## Условия прохождения

- Changed DTO/API/frontend data contract назван.
- DTO owner выбран в `src/domain/contracts/<domain>/`.
- Mapper owner выбран в `src/domain/mappers/<domain>/`.
- Выполнен scan на raw Payload leakage по affected API/services/UI consumers.
- Public response строится через mapper с allowlist полей.
- `src/payload-types.ts` не используется как frontend-facing contract.
- `PaginatedDocs<T>` не отдаётся напрямую во frontend; используется explicit
  pagination DTO.
- Остаточные raw Payload responses перечислены как existing debt или исправлены
  в scope задачи.
