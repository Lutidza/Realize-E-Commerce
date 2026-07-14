# Documentation sync gate (`documentation_sync`)

```yaml
artifact_id: agents-evolution-gate-documentation-sync
artifact_type: ai-workflow-gate
owner_layer: .ai/workflows/ai-operations/agents-evolution/gates/
```

## Назначение (`purpose`)

Определить, требует ли agents-evolution change синхронизации canonical docs,
skills, registry или adapter artifacts.

Documentation sync обязателен, если change меняет:

- роль, routing или role mapper;
- workflow entrypoint, state, gate, output или handoff;
- rule/check registry;
- Codex skill/prompt/agent behavior;
- project context в `documentation/**`;
- RAG/search discoverability для будущих агентов.

## Выход (`output`)

- documentation sync required;
- affected docs/artifacts;
- registry/role/skill sync decision;
- sync skipped reason, если не требуется.
