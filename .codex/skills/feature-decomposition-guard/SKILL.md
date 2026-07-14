---
name: feature-decomposition-guard
description: >-
  Используй, когда файл или feature folder смешивает несколько самостоятельных
  зон ответственности: transport, validation, business logic, mapping,
  rendering, state, helpers, config, styles or orchestration.
---

# Feature decomposition guard

## When to use

- Next API route mixes validation, persistence, search and response assembly.
- Payload collection mixes unrelated admin UI, hooks, access and data mapping.
- React component mixes data fetching, layout, business rules and client state.
- Service/helper grows unrelated responsibilities.
- AI-layer artifact mixes rule, check, workflow and history.

## Procedure

1. Определи responsibilities inside target file/folder.
2. Найди existing owners in current project.
3. Split only within approved allowlist.
4. Keep compatibility with current Next.js, React, Payload CMS, PostgreSQL and
   Elasticsearch constraints.
5. Do not introduce new framework/layer just to make split convenient.

## Output

- mixed responsibilities;
- selected owners;
- files to create/edit/delete;
- checks;
- residual risks.
