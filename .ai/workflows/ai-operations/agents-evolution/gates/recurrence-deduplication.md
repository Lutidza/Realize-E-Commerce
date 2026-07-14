# Recurrence and deduplication gate (`recurrence_deduplication`)

```yaml
artifact_id: agents-evolution-gate-recurrence-deduplication
artifact_type: ai-workflow-gate
owner_layer: .ai/workflows/ai-operations/agents-evolution/gates/
owner_role: .ai/roles/process-tools-operations/ai-evolution-steward/INDEX.md
related_tools:
  - rg
  - .ai/tools/agent-search/
```

## Назначение

Gate не даёт превращать каждый единичный сбой в новое правило. Перед proposal
агент обязан проверить, является ли сигнал новым, повторяющимся или уже
покрытым existing artifact.

## Fingerprint

Минимальный fingerprint включает:

- signal type;
- affected paths или owner-layer;
- violated или missing rule/check/workflow;
- role involved;
- failure mode;
- root cause candidate;
- recurrence key.

## Recurrence score

- `0` - false positive или не AI-layer проблема.
- `1` - единичный сигнал, достаточно observation или handoff.
- `2` - повторяемый pattern или high-risk miss.
- `3` - системная проблема, которая уже вызвала regression, user correction
  или неверное изменение owner-layer.

## Выход

- fingerprint;
- recurrence key;
- matching observations/proposals/applied changes;
- recurrence score;
- decision: observe, propose, defer, reject или needs-more-context.
