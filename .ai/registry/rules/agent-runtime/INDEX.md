# Rules Registry Shard: Agent Runtime

```yaml
artifact_id: ai-registry-rules-agent-runtime
artifact_type: ai-rules-registry-shard
schema_version: 2
owner_layer: .ai/registry/rules/agent-runtime/
coverage:
  - .ai/rules/agent-runtime/
  - .ai/checks/self-review/CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT.md
```

```yaml
entries:
  - entry_id: worker-session-lifecycle-and-autonomous-mode
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md
    owner_layer: .ai/rules/agent-runtime/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: []
    related_checks: [.ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md, .ai/checks/worker-runtime/CHECK-WORKER-DIALOG-SURFACE-BUDGET.md, .ai/checks/self-review/CHECK-WORKER-SESSION-LIFECYCLE-BEFORE-HANDOFF.md]
    related_workflows: [.ai/workflows/core/worker-session/WORKFLOW.md]
    related_codex_artifacts: [.codex/skills/codex-external-worker-session/SKILL.md]
    related_tools: [.ai/tools/agent-runtime/runtime/runtime.sqlite, .ai/tools/agent-monitor/]
    routing_tags: [agent-runtime, worker-session, lifecycle, autonomous]
    trigger: "Handoff, final answer or pause when active worker sessions or active autonomous grant exist."
  - entry_id: agent-runtime-maintenance-report
    entry_type: supporting_check
    status: active
    primary_artifact: .ai/checks/self-review/CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT.md
    owner_layer: .ai/checks/self-review/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: [.ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md]
    related_checks: []
    related_workflows: [.ai/workflows/ai-operations/agent-runtime-maintenance/WORKFLOW.md]
    related_codex_artifacts: []
    related_tools: [.ai/tools/agent-runtime/runtime/runtime.sqlite]
    routing_tags: [agent-runtime, maintenance, runtime-store]
    trigger: "After agent-runtime-maintenance, retention-cleanup, projection refresh or a step that serviced runtime.sqlite."
```
