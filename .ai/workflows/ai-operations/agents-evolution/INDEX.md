# Workflow agents evolution (`agents-evolution`)

```yaml
artifact_id: agents-evolution-workflow-directory-index
artifact_type: ai-workflow-directory-index
owner_layer: .ai/workflows/ai-operations/agents-evolution/
runtime_sources:
  - .ai/workflows/ai-operations/agents-evolution/WORKFLOW.md
  - .ai/agents-evolution/INDEX.md
related_artifacts:
  - .ai/agents-evolution/
  - .ai/rules/
  - .ai/checks/
  - .ai/workflows/
  - .ai/templates/
  - .codex/skills/
```

## Назначение (`purpose`)

Workflow фиксирует активный процесс evidence-based эволюции AI-агентов. Он
превращает реальные сигналы проекта в controlled changes рабочего AI-layer:
observation, proposal, applied change, deferred или rejected decision.

## Границы (`boundaries`)

- `INDEX.md` является entrypoint-картой workflow-директории.
- `WORKFLOW.md` хранит текущий runtime contract.
- `.ai/agents-evolution/` хранит sanitized trace, но не runtime logs.
- Active rules/checks/workflows/templates обновляются в своих owner-layer.
- Codex-specific artifacts обновляются в `.codex/*`.

## Карта папок (`folder_map`)

- `states/` - состояния процесса.
- `gates/` - проверки процесса.
- `transitions/` - переходы процесса.
- `outputs/` - форматы выходов процесса.
- `adapters/` - связи с Codex skills и runtime artifacts.

## Передача результата (`handoff`)

Новый evolution artifact создаётся только после evidence gate, target
classification, recurrence/dedup scan и owner-layer decision. Active behavior
меняется в owner-layer, а `.ai/agents-evolution/**` фиксирует sanitized trace.
