# DTO contracts без raw Payload leakage

```yaml
rule_id: RULE-DTO-CONTRACTS-NO-RAW-PAYLOAD
owner_role: .ai/roles/developer/backend/INDEX.md
applies_to:
  - src/app/api/**
  - src/domain/contracts/**
  - src/domain/mappers/**
  - src/domain/data/**
  - src/domain/services/**
  - src/domain/routes/**
  - src/domain/ui/**
trigger:
  - создаётся или меняется DTO
  - меняется public API response shape
  - меняется frontend/backend data contract
  - создаётся или меняется mapper/serializer
  - frontend начинает использовать данные Payload/API/search
requirement:
  - public API и UI consumers получают explicit DTO contracts, а не raw Payload documents
  - DTO types живут в src/domain/contracts/**
  - backend mappers живут в src/domain/mappers/**
  - mappers строят output через allowlist полей
  - Payload generated types используются как persistence/admin types, а не как frontend contract
forbidden:
  - возвращать raw Payload document из public API без explicit DTO mapper
  - импортировать src/payload-types.ts во frontend как public contract
  - держать mappers внутри src/domain/media/mappers/** или src/domain/customers/mappers/**
  - отдавать PaginatedDocs<T> напрямую во frontend
  - использовать object spread Payload document в public response
checks:
  - .ai/checks/development/backend/CHECK-DTO-CONTRACTS-NO-RAW-PAYLOAD.md
related_codex_artifacts:
  - .codex/skills/dto-contracts-first/SKILL.md
```

## Контракт

Payload/PostgreSQL остаётся source of truth для данных, но raw Payload document
не является безопасным public contract для frontend или внешнего API caller.

Правильная структура:

```text
src/domain/contracts/<domain>/
src/domain/mappers/<domain>/
```

Примеры:

- `src/domain/contracts/customers/CustomerProfilePublic.ts`
- `src/domain/contracts/media/PublicMedia.ts`
- `src/domain/contracts/catalog/CatalogListItem.ts`
- `src/domain/mappers/customers/mapCustomerProfile.ts`
- `src/domain/mappers/media/mapMediaToPublicMedia.ts`
- `src/domain/mappers/catalog/mapProductToProductPublic.ts`

DTO делится по контексту использования: self, public, list item, details,
admin, search hit, media variant. Один универсальный DTO для всех surface не
используется.
