# Workflow: worker session (`worker-session`)

```yaml
artifact_id: worker-session-directory-index
artifact_type: ai-workflow-directory-index
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/workflows/core/worker-session/
runtime_sources:
  - .ai/templates/readme/TEMPLATE-AI-RUNTIME-INDEX.md
related_artifacts:
  - .ai/workflows/core/worker-session/WORKFLOW.md
  - .ai/tools/agent-runtime/README.md
```

## Назначение (`purpose`)

Директория хранит workflow lifecycle worker-сессий.

## Границы (`boundaries`)

- `INDEX.md` описывает директорию.
- `WORKFLOW.md` задаёт статусы, presence и handoff.
- Runtime writer находится в `.ai/tools/agent-runtime/`.

## Карта файлов (`file_map`)

- `WORKFLOW.md` - lifecycle worker-сессий.

## Передача результата (`handoff`)

Для запуска или проверки worker-сессии открыть `WORKFLOW.md` и runtime writer
documentation.
