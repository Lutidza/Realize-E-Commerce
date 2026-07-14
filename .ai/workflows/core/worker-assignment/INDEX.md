# Workflow: worker assignment (`worker-assignment`)

```yaml
artifact_id: worker-assignment-directory-index
artifact_type: ai-workflow-directory-index
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/workflows/core/worker-assignment/
runtime_sources:
  - .ai/templates/readme/TEMPLATE-AI-RUNTIME-INDEX.md
related_artifacts:
  - .ai/workflows/core/worker-assignment/WORKFLOW.md
```

## Назначение (`purpose`)

Директория содержит процесс worker assignment: от intake задачи до
handoff через Dialog Assistant.

## Границы (`boundaries`)

- `WORKFLOW.md` задаёт states/gates/transitions.
- `RULES`/`CHECKS` живут в `.ai/rules/worker-runtime/` и
  `.ai/checks/worker-runtime/`.
- `Терминальная ответственность` за execution context, runtime notifications и
  result persistence остаётся в `.ai/tools/agent-runtime/**` и текущем runtime runtime.

## Карта файлов (`file_map`)

- `WORKFLOW.md` — states и переходы assignment runtime.

## Передача результата (`handoff`)

Открыть `WORKFLOW.md` и обязательные checks перед `worker_launch`.
