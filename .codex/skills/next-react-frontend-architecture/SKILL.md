---
name: next-react-frontend-architecture
description: >-
  Используй для frontend задач проекта Realize-E-Commerce: Next.js App Router,
  React Server/Client Components, Tailwind/shadcn/Radix UI, route helpers,
  browser evidence and shared UI boundaries.
---

# Next/React frontend architecture

Используй skill для application frontend задач в `Realize-E-Commerce`.

## Что открыть

1. `AGENTS.md`
2. `documentation/project-context.md`
3. `.ai/roles/developer/frontend/INDEX.md`
4. `.ai/workflows/frontend/next-react/guardrail/WORKFLOW.md`
5. `.ai/rules/development/frontend/RULE-NEXT-REACT-FRONTEND-BOUNDARIES.md`
6. `.ai/checks/development/frontend/CHECK-NEXT-REACT-FRONTEND-BOUNDARIES.md`

## Порядок

1. Определи affected surface: route, page, layout, shared component, theme,
   route helper, client behavior or data consumer.
2. Найди existing pattern через `rg`.
3. Выбери source owner before editing.
4. Определи Server Component vs Client Component boundary.
5. Если нужно менять API/search/Payload contract, подключи backend role.
6. Выбери verification: static review, typecheck/lint/build,
   browser/Playwright or skip reason.

## Result

Верни owner-layer, changed files allowlist, checks, skip reasons and residual
risks.
