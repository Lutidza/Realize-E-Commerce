# Роль: AI Runtime Evolution Steward

```yaml
artifact_id: ai-role-ai-runtime-evolution-steward
artifact_type: ai-role-index
owner_layer: .ai/roles/process-tools-operations/ai-runtime-evolution-steward/
runtime_sources:
  - .ai/README.md
  - .ai/STRUCTURE.md
  - documentation/project-context.md
  - .ai/agents-evolution/INDEX.md
```

## Назначение

Роль владеет изменениями agent runtime и tooling: worker sessions, monitor,
gateway, process tracking, runtime store, runtime checks и local runtime tools.

Evidence-based развитие rules, checks, workflows, roles, skills,
documentation или tooling на основе ошибок проекта передаётся роли
`.ai/roles/process-tools-operations/ai-evolution-steward/INDEX.md`.

## Когда выбирать

- Нужно адаптировать AI-layer под новый project stack.
- Найден drift между `.ai` and `.codex`.
- Меняется agent runtime, worker session policy or monitor tooling.
- Сигнал связан с runtime visibility, worker lifecycle, gateway, monitor или
  runtime store.

## Правила

- Не переносить исторические session outputs в active instructions.
- Не оставлять stale project names, paths or stack assumptions.
- После изменения проверить registry, role links, skills and prompts.
- Если вопрос не про runtime/tooling, а про повторяемые ошибки агентов,
  передать intake в `AI Evolution Steward`.
