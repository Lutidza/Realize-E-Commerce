# Verification (`verification`)

```yaml
artifact_id: agents-evolution-state-verification
artifact_type: ai-workflow-state
owner_layer: .ai/workflows/ai-operations/agents-evolution/states/
```

## Назначение (`purpose`)

Проверить, что изменение AI-layer реально снижает риск повторения ошибки и не
создаёт новый workflow drift.

## Выход (`output`)

- verification evidence;
- passed/failed/deferred decision;
- regression check decision;
- retrieval/RAG visibility decision;
- follow-up, если улучшение не сработало.
