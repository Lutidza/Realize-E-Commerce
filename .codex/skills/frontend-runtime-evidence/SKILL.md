---
name: frontend-runtime-evidence
description: >-
  Используй для frontend задач Realize-E-Commerce, где Next.js/React UI, Tailwind CSS,
  forms, responsive behavior, browser rendering или visual bug нужно
  подтвердить фактическим evidence. Skill выбирает static/build/browser tier.
---

# Runtime evidence для frontend

Skill применяется только к текущему Next/React frontend stack проекта.

## Что открыть

1. `documentation/project-context.md`
2. `.ai/roles/developer/frontend/INDEX.md`
3. `.ai/workflows/frontend/next-react/guardrail/WORKFLOW.md`
4. `.ai/rules/development/frontend/RULE-NEXT-REACT-FRONTEND-BOUNDARIES.md`

## Evidence tiers

- `static` - достаточно diff/rg/source review.
- `typecheck-lint` - нужен `npx tsc --noEmit --pretty false` or `npm run lint`.
- `build` - нужен `npm run build`, если меняется route/runtime boundary.
- `browser` - нужен rendered DOM, form behavior, focus/input, responsive,
  computed CSS or console evidence.
- `screenshot` - нужен visual/reference comparison.

## Порядок

1. Определи route/page/component/style owner.
2. Выбери минимальный tier.
3. Зафиксируй verification method до правки.
4. Если browser/screenshot tier невозможен из-за отсутствия `.env`, database,
   dev server or running app, зафиксируй fallback reason.
5. После правки повтори выбранную проверку or report blocker.

## Ограничения

- Не объявляй rendered behavior проверенным без browser evidence or clear skip
  reason.
- Не требуй browser evidence для чисто статического docs/AI-layer change.
- Не меняй API/search/Payload contract из frontend-only evidence step.
