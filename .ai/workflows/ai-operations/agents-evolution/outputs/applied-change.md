# Контракт применённого изменения (`applied_change_output`)

```yaml
artifact_id: agents-evolution-output-applied-change
artifact_type: ai-workflow-output
owner_layer: .ai/workflows/ai-operations/agents-evolution/outputs/
```

## Назначение (`purpose`)

Файл задаёт минимальный формат sanitized applied-change artifact внутри
`.ai/agents-evolution/applied-changes/`.

## Минимальный формат

```yaml
artifact_id: APPLIED-YYYYMMDD-short-slug
artifact_type: agents-evolution-applied-change
owner_layer: .ai/agents-evolution/applied-changes/
status: applied|partially-applied|blocked
source_proposal: PROP-YYYYMMDD-short-slug
change_target: code|rule|check|workflow|role|skill|documentation|tooling|mixed
related_change_targets: []
prevented_failure: <short failure mode now covered>
changed_paths: []
checks: []
residual_risks: []
```

Applied-change фиксирует только результат, changed paths, checks и остаточные
риски. Он не содержит raw worker output, runtime dumps, task-origin data или
private reasoning.
