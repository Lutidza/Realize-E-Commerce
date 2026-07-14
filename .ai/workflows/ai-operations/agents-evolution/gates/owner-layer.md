# Owner-layer gate (`owner_layer`)

```yaml
artifact_id: agents-evolution-gate-owner-layer
artifact_type: ai-workflow-gate
owner_layer: .ai/workflows/ai-operations/agents-evolution/gates/
```

## Назначение (`purpose`)

Определить, должен ли change идти в `.ai/rules`, `.ai/checks`, `.ai/workflows`,
`.ai/templates`, `.codex/*`, `documentation/` или registry.

Если target classification выбрал `code`, owner-layer находится в product code
и handoff идёт профильной developer-роли. `.ai/agents-evolution/**` не должен
становиться bug tracker для product code.

Если target classification выбрал `mixed`, workflow обязан разделить:

- product code owner-layer;
- AI-layer owner-layer;
- порядок применения и verification для каждого слоя.

## Выход (`output`)

- selected owner-layer;
- selected code owner role, если применимо;
- rejected owner-layers;
- allowlist impact;
- sync requirements.
