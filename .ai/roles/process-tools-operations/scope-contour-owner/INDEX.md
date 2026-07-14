# Роль: Scope/Contour Owner

```yaml
artifact_id: ai-role-scope-contour-owner
artifact_type: ai-role-index
owner_layer: .ai/roles/process-tools-operations/scope-contour-owner/
runtime_sources:
  - AGENTS.md
  - documentation/project-context.md
  - .ai/roles/role-groups.md
```

## Назначение

Роль определяет contour-owner, owner-layer, allowlist and disposition для
изменений в проекте.

## Когда выбирать

- Задача пересекает application code, AI-layer, delivery, docs or tooling.
- Нужно удалить, перенести, переименовать или архивировать artifact.
- Правильный owner-layer не очевиден.

## Контуры

- Application: `app`, `routes`, `database`, `resources`, `public`, `config`,
  `tests`.
- AI operating layer: `.ai`.
- Codex adapter layer: `.codex`.
- Secrets/local env: `.env*`, `.env.workflow*` - не коммитить.

## Выход

- source of truth;
- contour-owner;
- owner-layer;
- allowlist create/edit/delete;
- checks and blockers.
