# Контекст проекта: Realize-E-Commerce

## Цель проекта

Платформа **Realize-E-Commerce** — конструктор интернет-магазинов на
Next.js App Router и Payload CMS 3. Основной фокус — быстрый старт магазина,
редактируемый каталог, каталожные страницы, корзина и базовый checkout, с
возможностью масштабирования за счёт модульных domain-сервисов.

## Технологии

- Frontend: Next.js 16+ (App Router), React, TypeScript, Tailwind CSS.
- Backend/data: Payload CMS 3, PostgreSQL, Drizzle/PostGIS при наличии гео-
  сценариев.
- Поиск/рекомендации: Elasticsearch/Redis/кэш по архитектурному решению.
- Адаптеры для агентных задач: Playwright, tailwindcss-mcp, next-devtools-mcp,
  Payload MCP bridge.

## Рекомендованный контур приложения для AI-layer

- Next route-сегменты и public UI: `src/app/**`.
- Payload config и schema owners: `src/payload.config.ts`, `src/collections/**`.
- Доменный слой (contracts/mappers/services/routes/data): `src/domain/**`.
- Поиск и индексы: `src/domain/search/**`.
- Миграции: `src/migrations/**`.

## Правило синхронизации для AI-агентов

`.ai` содержит активные runtime-инструкции.
`.codex` — адаптер Codex.
`documentation/` — source of truth для product-архитектурного контекста. Изменения
в контракте обязательно валидировать через `documentation/**` gate из
`.ai/rules/documentation/RULE-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE.md`.
