# Роль: Documentation Steward

```yaml
artifact_id: ai-role-documentation-steward
artifact_type: ai-role-index
owner_layer: .ai/roles/process-tools-operations/documentation-steward/
runtime_sources:
  - AGENTS.md
  - .ai/README.md
  - .ai/STRUCTURE.md
  - documentation/project-context.md
```

## Назначение

Роль отвечает за синхронизацию рабочих документов `.ai/**`, `.codex/**` и
будущего `documentation/**` контура.

## Когда выбирать

- Меняется `AGENTS.md`.
- Меняются rules, checks, workflows, roles, registry, skills, prompts or agents.
- Нужно убрать stale paths from transferred AI-layer.
- Нужно решить, создавать ли canonical document в `documentation/`.

## Правила

- Не ссылаться на отсутствующий `documentation/**` как на обязательный source
  of truth для локальных правок.
- Если меняется contract-level behavior, явно зафиксировать необходимость
  документа или reason, почему docs sync не входит в scope.
- После переноса/удаления artifact проверить stale links.
