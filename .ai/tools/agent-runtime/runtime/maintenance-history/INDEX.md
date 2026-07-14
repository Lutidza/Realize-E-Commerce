# История обслуживания agent runtime

```yaml
artifact_id: agent-runtime-maintenance-history
artifact_type: ai-runtime-maintenance-history
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/tools/agent-runtime/runtime/maintenance-history/
source_spec: documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
schema: .ai/tools/agent-runtime/runtime/maintenance-history/SCHEMA.md
runtime_writer: .ai/tools/agent-runtime/bin/agent-runtime.mjs
maintenance_workflow: .ai/workflows/ai-operations/agent-runtime-maintenance/WORKFLOW.md
maintenance_check: .ai/checks/self-review/CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT.md
```

## Назначение

Папка хранит machine-readable отчёты обслуживания локального
`agent-runtime/runtime.sqlite`.

Отчёт создаётся командой:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- maintenance-report-write \
  --actor-role=dialog_assistant \
  --policy-trigger="<trigger>" \
  --mode=audit_only \
  --decision=passed
```

Эти JSON-файлы не являются source of truth worker lifecycle. Они фиксируют
результат maintenance workflow: dry-run summary, cleanup summary, active rows
report, cutoffs, projection и связанные артефакты.

## Правила

- Отчёт создаётся через `maintenance-report-write`, а не ручной правкой JSON.
- Один maintenance boundary point создаёт один report artifact.
- `retention-cleanup --dry-run=true` и `active-rows-report` должны быть
  сохранены в отчёте, если workflow не пропущен по допустимому исключению.
- Cleanup apply не заменяет lifecycle resolution активных worker-сессий.
- Отчёт не должен содержать secrets, raw tool transcripts, production dumps,
  приватные рассуждения модели или PII beyond task need.

## Формат имени

```text
YYYYmmddTHHMMSSZ-<report-id>.json
```

`report-id` должен содержать только буквы, цифры, точку, подчёркивание или
дефис.
