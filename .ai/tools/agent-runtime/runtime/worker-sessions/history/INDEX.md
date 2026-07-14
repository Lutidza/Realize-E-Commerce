# История worker-сессий

```yaml
artifact_id: worker-sessions-history
artifact_type: ai-run-history-index
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/tools/agent-runtime/runtime/worker-sessions/history/
registry: .ai/tools/agent-runtime/runtime/worker-sessions/current-sessions.json
```

## Назначение

Папка хранит закрытые historical records worker-сессий после переноса из
`current-sessions.json`.

## Правила

- История создаётся только для фактических сессий.
- Не создавать fake examples с `running` или `result-ready`.
- Не хранить secrets, токены, приватные дампы и небезопасные console logs.
- Историческая запись должна содержать финальный операционный status,
  resolution и дату закрытия.
- Активное поведение остаётся в rule/check/workflow, а не в истории.
