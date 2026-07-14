# Rules Registry Shard: Worker Runtime

```yaml
artifact_id: ai-registry-rules-worker-runtime
artifact_type: ai-rules-registry-shard
schema_version: 2
owner_layer: .ai/registry/rules/worker-runtime/
coverage:
  - .ai/rules/worker-runtime/
  - .ai/checks/worker-runtime/
```

```yaml
entries:
  - entry_id: worker-assignment-manifest
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/worker-runtime/RULE-WORKER-ASSIGNMENT-MANIFEST.md
    owner_layer: .ai/rules/worker-runtime/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: []
    related_checks: [.ai/checks/worker-runtime/CHECK-WORKER-ASSIGNMENT-SCOPE.md, .ai/checks/worker-runtime/CHECK-WORKER-PROFILE-REFERENCES.md, .ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md, .ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md, .ai/checks/worker-runtime/CHECK-WORKER-DIALOG-SURFACE-BUDGET.md, .ai/checks/worker-runtime/CHECK-WORKER-HANDOFF-READY.md]
    related_workflows: [.ai/workflows/core/worker-assignment/WORKFLOW.md]
    related_codex_artifacts: [.codex/skills/codex-external-worker-session/SKILL.md]
    related_tools: []
    routing_tags: [worker-runtime, assignment, manifest]
    trigger: "Dialog Assistant prepares a task-specific worker assignment manifest."
  - entry_id: worker-context-budget-and-reuse
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/worker-runtime/RULE-WORKER-CONTEXT-BUDGET-AND-REUSE.md
    owner_layer: .ai/rules/worker-runtime/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: []
    related_checks: [.ai/checks/worker-runtime/CHECK-WORKER-CONTEXT-BUDGET-REUSE.md, .ai/checks/worker-runtime/CHECK-WORKER-ASSIGNMENT-SCOPE.md]
    related_workflows: [.ai/workflows/core/worker-assignment/WORKFLOW.md]
    related_codex_artifacts: []
    related_tools: []
    routing_tags: [worker-runtime, context, reuse]
    trigger: "Before reusing or spawning a worker session."
  - entry_id: worker-dialog-coordination
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/worker-runtime/RULE-WORKER-DIALOG-COORDINATION.md
    owner_layer: .ai/rules/worker-runtime/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: []
    related_checks: [.ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md, .ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md, .ai/checks/worker-runtime/CHECK-WORKER-DIALOG-SURFACE-BUDGET.md, .ai/checks/worker-runtime/CHECK-WORKER-HANDOFF-READY.md]
    related_workflows: [.ai/workflows/core/worker-assignment/WORKFLOW.md]
    related_codex_artifacts: [.codex/skills/codex-external-worker-session/SKILL.md]
    related_tools: []
    routing_tags: [worker-runtime, dialog-assistant, coordination, compact-dialog]
    trigger: "Dialog Assistant launches, manages or closes single-worker, staged or group worker-chain."
  - entry_id: worker-handoff-contract
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/worker-runtime/RULE-WORKER-HANDOFF-CONTRACT.md
    owner_layer: .ai/rules/worker-runtime/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: []
    related_checks: [.ai/checks/worker-runtime/CHECK-WORKER-HANDOFF-READY.md]
    related_workflows: [.ai/workflows/core/worker-assignment/WORKFLOW.md, .ai/workflows/core/worker-session/WORKFLOW.md]
    related_codex_artifacts: []
    related_tools: []
    routing_tags: [worker-runtime, handoff, result]
    trigger: "Worker or group result is ready for Dialog Assistant review/handoff."
  - entry_id: worker-monitor-visibility
    entry_type: supporting_check
    status: active
    primary_artifact: .ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md
    owner_layer: .ai/checks/worker-runtime/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: [.ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md, .ai/rules/worker-runtime/RULE-WORKER-ASSIGNMENT-MANIFEST.md, .ai/rules/worker-runtime/RULE-WORKER-DIALOG-COORDINATION.md]
    related_checks: []
    related_workflows: [.ai/workflows/core/worker-assignment/WORKFLOW.md, .ai/workflows/core/worker-session/WORKFLOW.md]
    related_codex_artifacts: [.codex/skills/codex-external-worker-session/SKILL.md]
    related_tools: [.ai/tools/agent-runtime/runtime/runtime.sqlite, .ai/tools/agent-monitor/]
    routing_tags: [worker-runtime, monitor, visibility, launch-gate]
    trigger: "Before any worker, stage or worker group launch."
  - entry_id: codex-exec-worker-runtime-bridge
    entry_type: supporting_check
    status: active
    primary_artifact: .ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md
    owner_layer: .ai/checks/worker-runtime/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: [.ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md, .ai/rules/worker-runtime/RULE-WORKER-ASSIGNMENT-MANIFEST.md, .ai/rules/worker-runtime/RULE-WORKER-DIALOG-COORDINATION.md]
    related_checks: [.ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md, .ai/checks/worker-runtime/CHECK-WORKER-HANDOFF-READY.md]
    related_workflows: [.ai/workflows/core/worker-assignment/WORKFLOW.md, .ai/workflows/core/worker-session/WORKFLOW.md]
    related_codex_artifacts: [.codex/skills/codex-external-worker-session/SKILL.md]
    related_tools: [.ai/tools/agent-runtime/runtime/runtime.sqlite, .ai/tools/agent-runtime/bin/agent-runtime.mjs, .ai/tools/agent-monitor/]
    routing_tags: [worker-runtime, codex-exec, external-worker, launch-gate]
    trigger: "Before and after any external codex exec worker launch."
  - entry_id: worker-dialog-surface-budget
    entry_type: supporting_check
    status: active
    primary_artifact: .ai/checks/worker-runtime/CHECK-WORKER-DIALOG-SURFACE-BUDGET.md
    owner_layer: .ai/checks/worker-runtime/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: [.ai/rules/worker-runtime/RULE-WORKER-DIALOG-COORDINATION.md, .ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md]
    related_checks: []
    related_workflows: [.ai/workflows/core/worker-assignment/WORKFLOW.md, .ai/workflows/core/worker-session/WORKFLOW.md]
    related_codex_artifacts: [.codex/skills/codex-external-worker-session/SKILL.md]
    related_tools: [.ai/tools/agent-runtime/runtime/runtime.sqlite, .ai/tools/agent-monitor/]
    routing_tags: [worker-runtime, compact-dialog, dialog-budget, launch-gate]
    trigger: "Before worker launch orchestration and before user-facing worker handoff."
  - entry_id: worker-model-selection
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/worker-runtime/RULE-WORKER-MODEL-SELECTION.md
    owner_layer: .ai/rules/worker-runtime/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: []
    related_checks: [.ai/checks/worker-runtime/CHECK-WORKER-MODEL-SELECTION.md]
    related_workflows: [.ai/workflows/core/worker-assignment/WORKFLOW.md]
    related_codex_artifacts: []
    related_tools: []
    routing_tags: [worker-runtime, model-selection]
    trigger: "Worker assignment chooses model for simple, standard or complex work."
  - entry_id: worker-no-scope-expansion
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/worker-runtime/RULE-WORKER-NO-SCOPE-EXPANSION.md
    owner_layer: .ai/rules/worker-runtime/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: [.ai/rules/worker-runtime/RULE-WORKER-ASSIGNMENT-MANIFEST.md]
    related_checks: [.ai/checks/worker-runtime/CHECK-WORKER-ASSIGNMENT-SCOPE.md, .ai/checks/worker-runtime/CHECK-WORKER-CONTEXT-BUDGET-REUSE.md]
    related_workflows: [.ai/workflows/core/worker-assignment/WORKFLOW.md]
    related_codex_artifacts: []
    related_tools: []
    routing_tags: [worker-runtime, scope, no-expansion]
    trigger: "Worker scope, paths or chain ownership might expand after launch."
```
