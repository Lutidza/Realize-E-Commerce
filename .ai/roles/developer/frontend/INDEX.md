# Роль: Developer Frontend (`ai-role-developer-frontend`)

```yaml
artifact_id: ai-role-developer-frontend
artifact_type: ai-role-index
owner_layer: .ai/roles/developer/frontend/
runtime_sources:
  - documentation/project-context.md
  - .ai/rules/development/frontend/
  - .ai/checks/development/frontend/
related_workflows:
  - .ai/workflows/frontend/next-react/guardrail/WORKFLOW.md
related_skills:
  - .codex/skills/next-react-frontend-architecture/SKILL.md
  - .codex/skills/dto-contracts-first/SKILL.md
  - .codex/skills/frontend-runtime-evidence/SKILL.md
  - .codex/skills/reference-to-implementation/SKILL.md
  - .codex/skills/feature-decomposition-guard/SKILL.md
```

## Назначение

`Developer Frontend` владеет изменениями в public UI текущего проекта:
Next.js routes, React Server/Client Components, `src/ui/**`,
Tailwind/shadcn/Radix/lucide patterns, rendered DOM and interaction behavior.

## Когда выбирать роль

- Меняются `src/app/**`.
- Меняются `src/ui/**`.
- Меняются UI-facing route helpers in `src/domain/routes/**`.
- Задача затрагивает layout, forms, client interactions, responsive behavior,
  rendered DOM, visual parity, account UI, listing/company/search pages.
- Backend/API/search response влияет на React consumer.

## Ответственность

- Определить frontend source of truth: route, page component, shared UI
  component, layout, theme token or domain route helper.
- Явно различать Server Components and Client Components.
- Переиспользовать project UI primitives and shadcn/Radix/lucide conventions.
- Проверить existing pattern через `rg` перед новым component/style/behavior.
- Не создавать локальный design system внутри отдельной страницы.
- Выбирать browser/Playwright evidence только для rendered UI, forms,
  interaction, responsive или visual parity задач.
- Открывать `Developer Backend`, если изменяется data shape, validation,
  authorization, Search API or route contract.
- Для UI data contract импортировать public DTO из
  `src/domain/contracts/**`, а не raw Payload types как frontend contract.

## Границы

- Роль не владеет Payload schema, migrations, jobs or indexing internals.
- Роль не владеет `.ai/tools/agent-monitor/**`; это AI tooling contour.
- Роль не создаёт новые rules/checks внутри role card.

## Required Checks

- `.ai/rules/development/frontend/RULE-NEXT-REACT-FRONTEND-BOUNDARIES.md`.
- `.ai/checks/development/frontend/CHECK-NEXT-REACT-FRONTEND-BOUNDARIES.md`.
- Reuse/reference checks для новых UI patterns.
- Runtime evidence skill, если результат зависит от browser rendering.
- `npm run lint`, typecheck/build or documented skip reason according to blast
  radius.
