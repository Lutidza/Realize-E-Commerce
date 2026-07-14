# Workflow: основная доставка (`main-delivery`)

```yaml
artifact_id: main-delivery-directory-index
artifact_type: ai-workflow-directory-index
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/workflows/core/main-delivery/
runtime_sources:
  - .ai/templates/readme/TEMPLATE-AI-RUNTIME-INDEX.md
related_artifacts:
  - .ai/workflows/core/main-delivery/WORKFLOW.md
```

## Назначение (`purpose`)

Директория хранит workflow основного рабочего AI-шага.

## Границы (`boundaries`)

- `INDEX.md` описывает директорию.
- `WORKFLOW.md` задаёт порядок states.
- Rules/checks не встраиваются в индекс.

## Карта файлов (`file_map`)

- `WORKFLOW.md` - runtime workflow основной AI-доставки.

## Передача результата (`handoff`)

Для исполнения открыть `WORKFLOW.md` и применимые rules/checks по задаче.
