# Evidence required gate (`evidence_required`)

```yaml
artifact_id: agents-evolution-gate-evidence-required
artifact_type: ai-workflow-gate
owner_layer: .ai/workflows/ai-operations/agents-evolution/gates/
```

## Назначение (`purpose`)

Не позволять менять AI-layer на основе общего ощущения без конкретного
evidence.

Evidence может быть:

- user correction с кратким sanitized summary;
- failed command/check/test/build/browser/runtime evidence;
- diff/review finding;
- найденное нарушение active rule/check;
- drift scan result;
- повторяющийся fingerprint из `.ai/agents-evolution/**`;
- конкретный code path или documentation path, где виден defect/drift.

Отсутствие evidence не запрещает остановку работы, но запрещает proposal или
active change.

## Выход (`output`)

- evidence present;
- evidence paths;
- evidence type;
- sanitized summary;
- missing evidence blockers.
