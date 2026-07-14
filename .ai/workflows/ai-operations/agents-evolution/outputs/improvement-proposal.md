# Контракт предложения (`improvement_proposal_output`)

```yaml
artifact_id: agents-evolution-output-improvement-proposal
artifact_type: ai-workflow-output
owner_layer: .ai/workflows/ai-operations/agents-evolution/outputs/
```

## Назначение (`purpose`)

Файл задаёт минимальный формат sanitized proposal внутри
`.ai/agents-evolution/improvement-proposals/`.

## Минимальный формат

```yaml
artifact_id: PROP-YYYYMMDD-short-slug
artifact_type: agents-evolution-improvement-proposal
owner_layer: .ai/agents-evolution/improvement-proposals/
status: proposed|accepted|rejected|deferred
source_observation: OBS-YYYYMMDD-short-slug
change_target: code|rule|check|workflow|role|skill|documentation|tooling|mixed
related_change_targets: []
fingerprint: <stable short fingerprint>
recurrence_key: <stable recurrence key>
target_owner_layers: []
allowlist_create: []
allowlist_edit: []
allowlist_delete: []
verification_plan: []
code_fix_handoff: []
```

Proposal фиксирует bounded change, impacted owner-layers, acceptance criteria,
checks и risks. Он не заменяет active rule/check/workflow и не хранит raw logs.
