# Proposal: worker runtime subagent drift cleanup

```yaml
artifact_id: PROP-20260524-worker-runtime-subagent-drift-cleanup
artifact_type: agents-evolution-improvement-proposal
owner_layer: .ai/agents-evolution/improvement-proposals/
status: accepted
source_observation: OBS-20260524-worker-runtime-subagent-drift-cleanup
target_owner_layers:
  - .ai/workflows/
  - .ai/checks/
  - .ai/tools/agent-runtime/
  - .ai/roles/process-tools-operations/
  - .codex/
allowlist_create:
  - .ai/agents-evolution/observations/OBS-20260524-worker-runtime-subagent-drift-cleanup.md
  - .ai/agents-evolution/improvement-proposals/PROP-20260524-worker-runtime-subagent-drift-cleanup.md
  - .ai/agents-evolution/applied-changes/APPLIED-20260524-worker-runtime-subagent-drift-cleanup.md
allowlist_edit:
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
allowlist_delete:
  - .ai/tools/agent-runtime/src/subagent-bridge.mjs
verification_plan:
  - rg self-scan for legacy worker backend terms outside forbidden/historical contexts
  - node --check .ai/tools/agent-runtime/src/runtime-commands.mjs
  - node --check .ai/tools/agent-runtime/bin/agent-runtime.mjs
  - node --check .ai/tools/agent-runtime/src/runtime-store/session-store.mjs
  - node --check .ai/tools/agent-runtime/src/runtime-store/job-policy.mjs
  - npm --prefix .ai/tools/agent-runtime run runtime -- session-upsert --actor-role=dialog_assistant --session-id=self-check-managed-kind --worker-kind=managed_subagent --role=test --status=planned
  - npm --prefix .ai/tools/agent-runtime run runtime -- job-upsert --job-id=self-check-spawn-backend --status=queued --execution-backend=spawn_agent
  - node --check .ai/tools/agent-runtime/src/runtime-gateway/snapshot-reader.mjs
  - npm --prefix .ai/tools/agent-runtime run runtime -- monitor-service-status --json
  - npm --prefix .ai/tools/agent-runtime run runtime -- subagent-prepare --actor-role=dialog_assistant --session-id=self-check --role=test --mission=test
  - codex exec --help
```

## Решение

Сделать `codex_exec` единственным активным worker launch backend:

```text
planned session
-> worker-launch-preflight
-> codex exec
-> process-upsert
-> result notification/artifact
-> session close
```

## Acceptance Criteria

- Core workflows больше не ставят old delegated backend рядом с `codex exec`.
- Runtime CLI help не предлагает legacy delegated commands.
- Runtime dispatcher не импортирует и не исполняет legacy bridge.
- Job policy не требует execution handle для unsupported backend.
- Self-check показывает остаточные упоминания только в запретах или evolution
  history.
