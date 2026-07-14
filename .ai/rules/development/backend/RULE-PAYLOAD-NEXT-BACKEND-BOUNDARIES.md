# Границы Payload/Next backend

```yaml
rule_id: RULE-PAYLOAD-NEXT-BACKEND-BOUNDARIES
owner_role: .ai/roles/developer/backend/INDEX.md
applies_to:
  - src/payload.config.ts
  - src/collections/**
  - src/domain/collections/**
  - src/app/api/**
  - src/domain/data/**
  - src/domain/services/**
  - src/domain/routes/**
  - src/migrations/**
trigger:
  - любая backend/data/API/search правка в текущем приложении
requirement:
  - определить source owner до изменения schema/API/service/data contract
  - отделить transport, validation, business logic, persistence, mapping и cache
  - сохранять Payload CMS 3, Next.js App Router и проектные data patterns
  - определить affected consumers до изменения response shape или route contract
forbidden:
  - редактировать generated src/payload-types.ts вручную
  - помещать business/data logic в API route handler, если есть service owner
  - менять frontend data contract без Developer Frontend role
  - делать Elasticsearch или Redis source of truth вместо Payload/PostgreSQL
checks:
  - .ai/checks/development/backend/CHECK-PAYLOAD-NEXT-BACKEND-BOUNDARIES.md
```

## Контракт

Backend source-first порядок:

1. Payload config/collection owner: `src/payload.config.ts`,
   `src/collections/**`, `src/domain/collections/**`.
2. Migration owner: `src/migrations/**`.
3. API transport owner: `src/app/api/**`.
4. Data/domain owner: `src/domain/data/**`,
   `src/domain/services/**`, `src/domain/routes/**`.
5. Consumer owner: public UI, admin UI, jobs, imports, search indexing, cache
   или внешний API caller.

Если owner-layer неясен, реализация останавливается до owner decision.
