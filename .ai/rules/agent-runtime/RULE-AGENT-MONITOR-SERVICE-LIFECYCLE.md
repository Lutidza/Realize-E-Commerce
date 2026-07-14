# Правило: lifecycle agent monitor service (`RULE-AGENT-MONITOR-SERVICE-LIFECYCLE`)

```yaml
artifact_id: RULE-AGENT-MONITOR-SERVICE-LIFECYCLE
artifact_type: ai-runtime-rule
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/rules/agent-runtime/
workflow: .ai/workflows/ai-operations/agent-monitor-service-lifecycle/WORKFLOW.md
check: .ai/checks/agent-runtime/CHECK-AGENT-MONITOR-SERVICE-LIFECYCLE.md
related_specs:
  - documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
  - documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
runtime_tool: .ai/tools/agent-runtime
monitor_tool: .ai/tools/agent-monitor
```

## Назначение

Lifecycle gateway/monitor сервисов проверяется через deterministic
`agent-runtime` команды. Markdown artifact фиксирует policy, а не повторяет
shell, curl или port-probe процедуру.

## Требования

- Статус проверять командой:
  `npm --prefix .ai/tools/agent-runtime run runtime -- monitor-service-status --json`.
- Старт/переиспользование сервисов выполнять только по явной operator
  необходимости:
  `npm --prefix .ai/tools/agent-runtime run runtime -- monitor-service-start --mode=preview --json`.
- Обычный режим monitor для проектной работы: `preview`, не `dev`.
- Worker/group launch перед `codex exec` обязан пройти:
  `npm --prefix .ai/tools/agent-runtime run runtime -- worker-launch-preflight --session-id=<session-id> --group-id=<group-id> --json`.
- Для рабочих роёв проекта `spawn_agent` не используется; допустимый backend -
  внешний `codex exec`.
- Worker launch не стартует, не останавливает, не перезапускает gateway/monitor
  и не подбирает fallback port.
- Фиксированные URLs сервиса: `http://127.0.0.1:8765/` и
  `http://127.0.0.1:5173/`.

## Fail conditions

- status/preflight вернул `pass=false`;
- monitor запущен в normal work через dev mode;
- launch path пытается stop/restart/start services или сменить port;
- heartbeat URLs отличаются от фиксированных значений.
