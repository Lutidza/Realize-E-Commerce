# Структура AI-слоя (`ai_structure`)

```yaml
artifact_id: ai-operating-layer-structure
artifact_type: ai-runtime-structure
owner_layer: .ai/
runtime_sources:
  - .ai/README.md
  - .ai/system/INDEX.md
  - documentation/project-context.md
```

## Фактические active entrypoints

```text
.ai/
├── README.md
├── STRUCTURE.md
├── system/
│   ├── INDEX.md
│   └── state-machine.md
├── roles/
│   ├── role-groups.md
│   ├── developer/
│   │   ├── frontend/INDEX.md
│   │   └── backend/INDEX.md
│   └── process-tools-operations/
├── rules/
├── checks/
├── registry/
├── workflows/
│   ├── INDEX.md
│   ├── core/
│   ├── ai-operations/
│   ├── delivery/
│   └── frontend/
│       └── next-react/
│           └── guardrail/
├── templates/
├── tools/
│   ├── agent-runtime/
│   ├── agent-monitor/
│   └── agent-search/
├── worker-profiles/
└── agents-evolution/
```

## Target-only policy

Папка или workflow считается active owner-layer только если у неё есть
`INDEX.md`, `WORKFLOW.md`, `RULE-*.md`, `CHECK-*.md`, `PROFILE.md` или другой
согласованный entrypoint.

Не создавай пустые target-only ветки заранее.

## Runtime state policy

`.ai/tools/agent-runtime/runtime/**` хранит generated state. В git допустимы
только index/schema files. Session logs, sqlite stores, current sessions,
external worker dumps, prompts/results and maintenance snapshots должны быть
ignored/cleaned.

## Проектная Адаптация

Проектный контекст хранится вне `.ai`:

- `documentation/project-context.md`;
- `documentation/architecture/project-structure.md`;
- `README.md`.

`.ai/STRUCTURE.md` описывает только структуру рабочего AI-layer.
