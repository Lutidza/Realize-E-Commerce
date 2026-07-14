# Контракт наблюдения (`observation_output`)

```yaml
artifact_id: agents-evolution-output-observation
artifact_type: ai-workflow-output
owner_layer: .ai/workflows/ai-operations/agents-evolution/outputs/
```

## Назначение (`purpose`)

Файл задаёт минимальный формат sanitized observation внутри
`.ai/agents-evolution/observations/`.

## Минимальный формат

```yaml
artifact_id: OBS-YYYYMMDD-short-slug
artifact_type: agents-evolution-observation
owner_layer: .ai/agents-evolution/observations/
status: captured
source_event: <short summary>
entrypoint: user_correction|agent_self_review|failed_verification|rule_violation|drift_scan|repeated_friction|architecture_gap
change_target_candidate: code|rule|check|workflow|role|skill|documentation|tooling|mixed|none
related_change_targets: []
fingerprint: <stable short fingerprint>
recurrence_key: <stable recurrence key>
evidence_refs: []
forbidden_content_policy: no_raw_logs_no_tasks_no_private_reasoning
related_artifacts: []
```

Observation фиксирует факт, impact, root cause, affected artifacts и proposed
next step. Запрещено копировать raw terminal output, worker transcripts,
`.ai/tasks/**`, task-origin data, secrets или private reasoning.
