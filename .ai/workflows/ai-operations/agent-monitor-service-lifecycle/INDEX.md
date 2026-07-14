# Agent monitor service lifecycle workflow

```yaml
artifact_id: agent-monitor-service-lifecycle-workflow-index
artifact_type: ai-workflow-index
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/workflows/ai-operations/agent-monitor-service-lifecycle/
workflow: .ai/workflows/ai-operations/agent-monitor-service-lifecycle/WORKFLOW.md
related_rule: .ai/rules/agent-runtime/RULE-AGENT-MONITOR-SERVICE-LIFECYCLE.md
related_check: .ai/checks/agent-runtime/CHECK-AGENT-MONITOR-SERVICE-LIFECYCLE.md
runtime_tool: .ai/tools/agent-runtime
```

Entrypoint для operator workflow, который проверяет и при явном запросе
запускает/переиспользует fixed `agent-runtime gateway` и `agent-monitor`
preview services через deterministic runtime commands.
