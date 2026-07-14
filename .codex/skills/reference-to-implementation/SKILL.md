---
name: reference-to-implementation
description: >-
  Используй, когда задачу нужно привести к reference, screenshot, raw HTML,
  existing page или design example. Требует literal comparison before code.
---

# От референса к реализации

Skill применяется для сравнения reference с текущей реализацией, включая
Next.js routes, React components, Tailwind/shadcn UI, theme and browser
behavior.

## Что открыть

- reference artifact из задачи;
- `documentation/project-context.md`;
- `.ai/roles/developer/frontend/INDEX.md`, если task is frontend;
- `.ai/rules/development/frontend/RULE-REFERENCE-PATTERN-SCAN-BEFORE-IMPLEMENTATION.md`;
- `.codex/skills/frontend-runtime-evidence/SKILL.md`, если нужен browser or
  screenshot evidence.

## Порядок

1. Определи exact reference source.
2. Найди current analogs in `src/app/**`, `src/domain/ui/**`
   and `src/domain/routes/**`.
3. Составь mismatch map: composition, markup, spacing, typography, colors,
   state, behavior, responsive differences.
4. Выбери owner for each mismatch: route/page/layout, shared component, theme,
   client behavior, route helper or backend data shape.
5. Выполняй правки по одному coherent layer.
6. Перепроверь result against reference or document blocker.

## Жёсткие правила

- Не импровизируй UI при наличии reference.
- Не меняй unrelated surfaces outside allowlist.
- Не переносить в project чужой frontend stack ради reference parity.
- Не объявлять screenshot parity без browser/screenshot evidence or skip reason.
