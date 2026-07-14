# Intake agents evolution (`intake`)

```yaml
artifact_id: agents-evolution-state-intake
artifact_type: ai-workflow-state
owner_layer: .ai/workflows/ai-operations/agents-evolution/states/
```

## Назначение (`purpose`)

Определить, является ли входящий сигнал observation, incident, повторяющимся
паттерном, code defect, false positive или обычной задачей без
agents-evolution lifecycle.

## Выход (`output`)

- signal summary;
- entrypoint: user correction, self-review, failed verification, violation,
  drift scan, repeated friction или architecture gap;
- signal type;
- initial change target: code, rule, check, workflow, role, skill,
  documentation, tooling, mixed или none;
- affected workflow/rule/check/skill/agent;
- evidence path или reason, почему evidence отсутствует;
- decision: proceed, stop или defer.
