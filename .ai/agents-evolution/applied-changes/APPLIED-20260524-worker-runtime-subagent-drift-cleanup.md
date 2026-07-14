# Applied change: worker runtime subagent drift cleanup

```yaml
artifact_id: APPLIED-20260524-worker-runtime-subagent-drift-cleanup
artifact_type: agents-evolution-applied-change
owner_layer: .ai/agents-evolution/applied-changes/
status: applied
source_proposal: PROP-20260524-worker-runtime-subagent-drift-cleanup
changed_paths:
  - .ai/workflows/core/worker-session/WORKFLOW.md
  - .ai/workflows/core/worker-assignment/WORKFLOW.md
  - .ai/workflows/ai-operations/agent-monitor-service-lifecycle/WORKFLOW.md
  - .ai/checks/self-review/CHECK-WORKER-SESSION-LIFECYCLE-BEFORE-HANDOFF.md
  - .ai/checks/worker-runtime/CHECK-WORKER-DIALOG-SURFACE-BUDGET.md
  - .codex/skills/codex-external-worker-session/SKILL.md
  - .codex/skills/skill-documentation-sync/SKILL.md
  - .codex/STRUCTURE.md
  - .ai/README.md
  - .ai/tools/agent-runtime/README.md
  - .ai/tools/agent-runtime/src/runtime-commands.mjs
  - .ai/tools/agent-runtime/bin/agent-runtime.mjs
  - .ai/tools/agent-runtime/src/runtime-store/session-store.mjs
  - .ai/tools/agent-runtime/src/runtime-store/job-store.mjs
  - .ai/tools/agent-runtime/src/runtime-store/job-policy.mjs
  - .ai/tools/agent-runtime/src/runtime-gateway/snapshot-reader.mjs
  - .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
  - .ai/roles/process-tools-operations/ai-runtime-evolution-steward/INDEX.md
deleted_paths:
  - .ai/tools/agent-runtime/src/subagent-bridge.mjs
checks:
  - "rg self-scan: no active `subagent*`/`managed_subagent` references outside evolution history."
  - "rg self-scan: `spawn_agent` remains only in explicit forbidden contexts outside evolution history."
  - node --check .ai/tools/agent-runtime/src/runtime-commands.mjs
  - node --check .ai/tools/agent-runtime/bin/agent-runtime.mjs
  - node --check .ai/tools/agent-runtime/src/runtime-store/session-store.mjs
  - node --check .ai/tools/agent-runtime/src/runtime-store/job-store.mjs
  - node --check .ai/tools/agent-runtime/src/runtime-store/job-policy.mjs
  - node --check .ai/tools/agent-runtime/src/runtime-gateway/snapshot-reader.mjs
  - git diff --check -- .ai .codex
  - npm --prefix .ai/tools/agent-runtime run runtime -- monitor-service-status --json
  - "npm --prefix .ai/tools/agent-runtime run runtime -- subagent-prepare ... returns error Unknown runtime store command"
  - "npm --prefix .ai/tools/agent-runtime run runtime -- session-upsert ... --worker-kind=managed_subagent returns unsupported worker kind"
  - "npm --prefix .ai/tools/agent-runtime run runtime -- job-upsert ... --execution-backend=spawn_agent returns unsupported execution backend"
  - codex exec --help
residual_risks:
  - Running gateway process may need controlled restart before monitor consumes updated source changes in runtime command/help code.
  - Historical evolution artifacts intentionally retain old terms as rationale/evidence, not as executable rules.
```

## Итог

Активные workflow/check/skill/runtime surfaces приведены к модели внешних
`codex exec` worker-процессов. Legacy delegated command bridge удалён из
runtime dispatcher.

## Ограничения Evidence

Applied trace не содержит raw terminal output, runtime dump, `.ai/tasks/**`,
task-origin data, worker transcript или private reasoning.
