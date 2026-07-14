# Реестр активных правил

```yaml
artifact_id: ai-registry-rules-index
artifact_type: ai-rules-registry-index
schema_version: 2
owner_layer: .ai/registry/rules/
runtime_sources:
  - .ai/rules/
  - .ai/checks/
```

`.ai/registry/rules/` хранит traceability для active runtime rules и supporting
checks. Текст правила живёт в `.ai/rules/*`, текст проверки - в
`.ai/checks/*`, Codex procedure - в `.codex/*`.

## Shards

| shard_id | path | coverage | open_when |
| --- | --- | --- | --- |
| `global` | `.ai/registry/rules/global/INDEX.md` | `.ai/rules/global/*` | Любой project guardrail |
| `development` | `.ai/registry/rules/development/INDEX.md` | `.ai/rules/development/*.md` | Project-wide development |
| `development-frontend` | `.ai/registry/rules/development/frontend/INDEX.md` | `.ai/rules/development/frontend/**` | Next/React/Tailwind frontend |
| `development-backend` | `.ai/registry/rules/development/backend/INDEX.md` | `.ai/rules/development/backend/**` | Payload/Next backend, data, search, cache |
| `documentation` | `.ai/registry/rules/documentation/INDEX.md` | `.ai/rules/documentation/*` | Documentation sync |
| `agent-runtime` | `.ai/registry/rules/agent-runtime/INDEX.md` | `.ai/rules/agent-runtime/*` | Agent runtime lifecycle |
| `worker-runtime` | `.ai/registry/rules/worker-runtime/INDEX.md` | `.ai/rules/worker-runtime/*` | Worker sessions |
| `scope-control` | `.ai/registry/rules/scope-control/INDEX.md` | `.ai/rules/scope-control/*` | Disposition/stale cleanup |
| `git` | `.ai/registry/rules/git/INDEX.md` | `.ai/rules/git/*` | Commit/push delivery |
| `delivery` | `.ai/registry/rules/delivery/INDEX.md` | `.ai/rules/delivery/*` | Project delivery extensions |
| `external-tools` | `.ai/registry/rules/external-tools/INDEX.md` | `.ai/rules/external-tools/*` | MCP/tooling and external tool fallback |

## Routing

1. Определи task contour and owner-layer.
2. Открой root `INDEX.md`, затем 1-2 подходящих shard files.
3. Из shard entry открой `primary_artifact`, затем related checks/workflows/skills.
4. Registry не хранит full rule body.
