# Proposal: Codex exec worker runtime bridge

```yaml
artifact_id: PROP-20260524-codex-exec-worker-runtime-bridge
artifact_type: agents-evolution-improvement-proposal
owner_layer: .ai/agents-evolution/improvement-proposals/
status: accepted
source_observation: OBS-20260524-codex-exec-worker-runtime-bridge
target_owner_layers:
  - .ai/tools/agent-runtime/src/runtime-gateway/
  - .ai/checks/worker-runtime/
  - .ai/rules/worker-runtime/
  - .ai/rules/agent-runtime/
  - .ai/registry/rules/worker-runtime/
  - .codex/skills/codex-external-worker-session/
allowlist_create:
  - .ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md
allowlist_edit:
  - .ai/tools/agent-runtime/src/runtime-gateway/snapshot-reader.mjs
  - .ai/rules/worker-runtime/RULE-WORKER-ASSIGNMENT-MANIFEST.md
  - .ai/rules/worker-runtime/RULE-WORKER-DIALOG-COORDINATION.md
  - .ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md
  - .ai/registry/rules/worker-runtime/INDEX.md
  - .codex/skills/codex-external-worker-session/SKILL.md
allowlist_delete:
  []
verification_plan:
  - node --check .ai/tools/agent-runtime/src/runtime-gateway/snapshot-reader.mjs
  - npm --prefix .ai/tools/agent-runtime run runtime -- monitor-service-status --json
  - npm --prefix .ai/tools/agent-runtime run runtime -- worker-launch-preflight --session-id=<session-id> --group-id=<group-id> --json
```

## Решение

Сделать внешний `codex exec` единственным допустимым backend для рабочих роёв:

```text
planned session
-> visible group topology
-> worker-launch-preflight pass
-> codex exec
-> process tracking
-> result notification/artifact
-> session close
```

## Acceptance Criteria

- Gateway snapshot читает first-class worker group tables.
- `worker-launch-preflight` видит group topology до запуска.
- Новый check явно блокирует `spawn_agent`.
- Codex skill описывает только внешний `codex exec` lifecycle.
- Evolution trace не содержит raw logs, `.ai/tasks/**` или private reasoning.
