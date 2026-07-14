# Структура проекта (источник для AI-layer)

## Корень приложения

- `src/app/**` — Next.js App Router: public routes, API routes, сегмент админа.
- `src/payload.config.ts` — конфигурация Payload CMS.
- `src/collections/**` — доменные коллекции Payload.
- `src/domain/**` — предметные контуры:
  - `src/domain/contracts/**` — API/public contracts и DTO.
  - `src/domain/mappers/**` — явные преобразования payload doc → public DTO.
  - `src/domain/data/**` — доменные data services/repositories.
  - `src/domain/services/**` — бизнес-логика.
  - `src/domain/routes/**` — URL/helpers и трансляция параметров.
  - `src/domain/search/**` — search index profile/projections.
  - `src/domain/ui/**` — UI-domain helpers в случае отдельной серверной слойной UI.
- `src/migrations/**` — миграции.

## AI-layer

- `.ai/**` — активные правила, checks, workflows, roles.
- `.codex/**` — адаптеры и runtime-контуры.
- `.ai/tools/**` — локальные локальные адаптеры (runtime/search).
- `documentation/**` — canonical docs для AI-layer synchronization.

## Принципы владения

- Frontend-изменения — route/page/component/theme в App Router и shared UI.
- Data/API изменения — Payload schema/переопределения/сервисы и DTO-слой.
- Search/indexing — не source of truth, это derived layer, исходные данные в
  Payload/PostgreSQL.
