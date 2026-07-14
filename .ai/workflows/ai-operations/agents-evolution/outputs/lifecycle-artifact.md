# Контракт lifecycle-артефактов (`lifecycle_artifact_output`)

```yaml
artifact_id: agents-evolution-output-lifecycle-artifact
artifact_type: ai-workflow-output
owner_layer: .ai/workflows/ai-operations/agents-evolution/outputs/
```

## Назначение (`purpose`)

Файл задаёт общий контракт trace/proposal-артефактов agents-evolution.

## Текущий контракт (`current_contract`)

- Создавать новые lifecycle-файлы только после evidence gate,
  issue target classification, recurrence/dedup scan и owner-layer decision.
- Не восстанавливать старые шумные форматы без отдельного owner-layer decision.
- Если изменение AI-layer требует следа, фиксировать active behavior в
  owner-layer текущего шага, а sanitized trace - в `.ai/agents-evolution/**`.
