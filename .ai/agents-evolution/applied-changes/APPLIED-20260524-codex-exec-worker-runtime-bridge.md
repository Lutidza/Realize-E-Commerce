# Applied change: Codex exec worker runtime bridge

```yaml
artifact_id: APPLIED-20260524-codex-exec-worker-runtime-bridge
artifact_type: agents-evolution-applied-change
owner_layer: .ai/agents-evolution/applied-changes/
status: applied
source_proposal: PROP-20260524-codex-exec-worker-runtime-bridge
changed_paths:
  - .ai/tools/agent-runtime/src/runtime-gateway/snapshot-reader.mjs
  - .ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md
  - .ai/rules/worker-runtime/RULE-WORKER-ASSIGNMENT-MANIFEST.md
  - .ai/rules/worker-runtime/RULE-WORKER-DIALOG-COORDINATION.md
  - .ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md
  - .ai/registry/rules/worker-runtime/INDEX.md
  - .codex/skills/codex-external-worker-session/SKILL.md
  - .ai/agents-evolution/INDEX.md
  - .ai/workflows/ai-operations/agents-evolution/WORKFLOW.md
checks:
  - node --check .ai/tools/agent-runtime/src/runtime-gateway/snapshot-reader.mjs
  - codex exec --help
  - npm --prefix .ai/tools/agent-runtime run runtime -- active-rows-report --actor-role=dialog_assistant
residual_risks:
  - Running gateway process may need controlled restart before monitor consumes updated snapshot-reader code.
  - Follow-up cleanup is tracked by APPLIED-20260524-worker-runtime-subagent-drift-cleanup.
```

## Итог

Рабочая модель для роёв переведена на внешний `codex exec` backend. Встроенный
`spawn_agent` зафиксирован как недопустимый для рабочих роёв и документалистов
этого проекта.

## Ограничения Evidence

Applied trace не содержит raw terminal output, runtime dump, `.ai/tasks/**`,
task-origin data, worker transcript или private reasoning.
