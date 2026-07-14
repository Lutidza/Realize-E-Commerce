# Observation: worker runtime subagent drift cleanup

```yaml
artifact_id: OBS-20260524-worker-runtime-subagent-drift-cleanup
artifact_type: agents-evolution-observation
owner_layer: .ai/agents-evolution/observations/
status: recorded
observed_at: 2026-05-24
related_applied_change: APPLIED-20260524-codex-exec-worker-runtime-bridge
```

## Наблюдение

После перевода рабочих роёв на `codex exec` self-scan показал остаточный drift:
часть workflow/check/skill/runtime artifacts продолжала описывать старую
delegated-модель как рабочий вариант.

## Затронутые зоны

- `.ai/workflows/core/worker-session/WORKFLOW.md`
- `.ai/workflows/core/worker-assignment/WORKFLOW.md`
- `.ai/workflows/ai-operations/agent-monitor-service-lifecycle/WORKFLOW.md`
- `.ai/checks/self-review/CHECK-WORKER-SESSION-LIFECYCLE-BEFORE-HANDOFF.md`
- `.ai/checks/worker-runtime/CHECK-WORKER-DIALOG-SURFACE-BUDGET.md`
- `.codex/skills/codex-external-worker-session/SKILL.md`
- `.codex/skills/skill-documentation-sync/SKILL.md`
- `.codex/STRUCTURE.md`
- `.ai/README.md`
- `.ai/tools/agent-runtime/README.md`
- `.ai/tools/agent-runtime/src/runtime-commands.mjs`
- `.ai/tools/agent-runtime/src/runtime-store/job-policy.mjs`
- `.ai/tools/agent-runtime/src/subagent-bridge.mjs`

## Root Cause

Первая эволюция ввела hard-check и project rule, но не очистила все старые
adapter/workflow/runtime references. Из-за этого будущий агент мог увидеть
старую командную поверхность как допустимый путь запуска worker-а.

## Требуемое улучшение

Убрать legacy delegated backend из активных workflow/check/skill/runtime
поверхностей и оставить упоминания только там, где они явно фиксируют запрет
или historical rationale.
