---
name: dto-contracts-first
description: >-
  Используй, когда задача меняет или создаёт DTO, public API response shape,
  frontend/backend data contract, mapper, serializer, catalog/customer/media
  public shape или устраняет raw Payload document leakage во frontend/API.
---

# DTO contracts first

Skill применяется, когда нужно безопасно связать Payload/backend и frontend без
выдачи raw Payload documents наружу.

## Что открыть

1. `AGENTS.md`
2. `documentation/project-context.md`
3. `.ai/roles/developer/backend/INDEX.md`
4. `.ai/roles/developer/frontend/INDEX.md`, если меняется consumer UI.
5. `.ai/registry/rules/development/backend/INDEX.md`
6. `.ai/rules/development/backend/RULE-DTO-CONTRACTS-NO-RAW-PAYLOAD.md`
7. `.ai/checks/development/backend/CHECK-DTO-CONTRACTS-NO-RAW-PAYLOAD.md`
8. `.codex/skills/payload-next-contracts-first/SKILL.md`
9. Ближайшее доменное ТЗ в `documentation/**`, если оно есть.

## Owner layout

DTO types are contracts. Mappers are backend implementation.

```text
src/domain/contracts/
  api/
  catalog/
  customers/
  media/

src/domain/mappers/
  catalog/
  customers/
  media/
```

Правильные примеры:

- `src/domain/contracts/media/PublicMedia.ts`
- `src/domain/contracts/catalog/ProductPublic.ts`
- `src/domain/contracts/customers/CustomerProfilePublic.ts`
- `src/domain/contracts/catalog/CatalogListItem.ts`
- `src/domain/mappers/media/mapMediaToPublicMedia.ts`
- `src/domain/mappers/catalog/mapProductToProductPublic.ts`
- `src/domain/mappers/customers/mapCustomerProfile.ts`

Неправильные owners:

- `src/domain/catalog/mappers/**`
- `src/domain/media/mappers/**` (if `media` DTOs live in domain-level mappers)
- DTO files inside `src/app/api/**`
- frontend-local copies of backend response contracts.

## Contract rules

1. Payload generated types are persistence/admin types, not public API
   contracts.
2. Public API must not return raw Payload documents.
3. Frontend must import DTO contracts from `src/domain/contracts/**`, not
   from `src/payload-types.ts`.
4. API routes should return explicit DTOs through mappers, not local ad hoc
   object stripping.
5. Create separate DTOs per context: self, public, list item, detail, admin,
   search hit, media variant.
6. Mappers must allowlist output fields. Do not use object spread from Payload
   docs into public responses.
7. Sensitive fields, auth fields, internal state, ownership metadata and
   moderation data stay out of public DTOs unless explicitly required by the
   contract.
8. Paginated Payload results must be mapped to project pagination contracts; do
   not return `PaginatedDocs<T>` to frontend.

## API response shape

Use a consistent envelope for new or refactored public APIs:

```ts
export type ApiSuccess<T> = {
  ok: true
  data: T
  meta?: Record<string, unknown>
}

export type ApiFailure = {
  ok: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}
```

For lists:

```ts
export type PaginatedResponse<T> = {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}
```

If an existing endpoint still uses another shape, either keep compatibility with
a documented migration step or explicitly refactor its consumers in the same
scope.

## Workflow

1. Identify changed contract: API response, server resolver result, search hit,
   profile DTO, route DTO, media DTO или catalog/customer DTO.
2. Find current producers and consumers with `rg`.
3. Define DTO type in `src/domain/contracts/<domain>/`.
4. Define mapper in `src/domain/mappers/<domain>/`.
5. Update backend producer to call the mapper.
6. Update frontend/import consumers to use DTO contract, not Payload type.
7. Add or update tests for mapper behavior when the data is sensitive,
   security-facing, shared or reused.
8. Run checks appropriate to scope.

## Checks

- `npx tsc --noEmit --pretty false`
- `npm run lint` when source changes require lint.
- Targeted Vitest for shared mappers or security-sensitive DTOs.
- `npm run generate:types` only if Payload schema changed.
- Browser/runtime evidence only when rendered UI behavior changes.

## Handoff

Report:

- DTO contracts created or changed;
- mappers created or changed;
- raw Payload leakage removed or still remaining;
- affected API routes/services/UI consumers;
- checks run or skipped with reason.
