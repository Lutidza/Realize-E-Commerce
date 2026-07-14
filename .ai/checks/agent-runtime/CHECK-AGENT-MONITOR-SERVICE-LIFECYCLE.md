# Проверка: lifecycle agent monitor service (`CHECK-AGENT-MONITOR-SERVICE-LIFECYCLE`)

```yaml
check_id: CHECK-AGENT-MONITOR-SERVICE-LIFECYCLE
artifact_type: ai-runtime-check
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/checks/agent-runtime/
related_rule: .ai/rules/agent-runtime/RULE-AGENT-MONITOR-SERVICE-LIFECYCLE.md
related_workflow: .ai/workflows/ai-operations/agent-monitor-service-lifecycle/WORKFLOW.md
runtime_tool: .ai/tools/agent-runtime
```

## Command contract

Status:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- monitor-service-status --json
```

Start/reuse only on explicit operator need:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- monitor-service-start --mode=preview --json
```

Worker/group preflight before launch:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- worker-launch-preflight --session-id=<session-id> --group-id=<group-id> --json
```

## Pass contract

```text
monitor_service_lifecycle_check: pass
gateway_url: http://127.0.0.1:8765/
monitor_url: http://127.0.0.1:5173/
gateway_health_route: /health
gateway_snapshot_route: /snapshot
monitor_mode: preview
port_fallback_used: no
launch_service_action: none|explicit_operator_start
worker_launch_preflight: pass|not_applicable
```

## Fail contract

```text
monitor_service_lifecycle_check: fail
blocker: monitor_service_lifecycle_unavailable|worker_launch_preflight_failed|unexpected_url|unexpected_mode|port_fallback_attempted|forbidden_service_action
```
