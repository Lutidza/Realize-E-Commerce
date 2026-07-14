# Workflow обслуживания agent runtime (`agent-runtime-maintenance`)

```yaml
artifact_id: agent-runtime-maintenance-workflow-directory-index
artifact_type: ai-workflow-directory-index
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/workflows/ai-operations/agent-runtime-maintenance/
runtime_entrypoint: .ai/workflows/ai-operations/agent-runtime-maintenance/WORKFLOW.md
related_specs:
  - documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
runtime_store: .ai/tools/agent-runtime/runtime/runtime.sqlite
runtime_writer: .ai/tools/agent-runtime/bin/agent-runtime.mjs
check: .ai/checks/self-review/CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT.md
related_artifacts:
  - .ai/tools/agent-runtime/runtime/INDEX.md
  - .ai/tools/agent-runtime/README.md
  - .ai/tools/agent-monitor/
```

## Назначение (`purpose`)

Workflow задаёт порядок обслуживания локального runtime-хранилища рабочего
AI-слоя: dry-run, retention cleanup, projection refresh и отчёт по оставшимся
active runtime rows.

Workflow запускается только по явной задаче обслуживания runtime или как
согласованный шаг внутри работы с `.ai/tools/agent-runtime` и
`.ai/tools/agent-monitor`.

## Границы (`boundaries`)

- Workflow обслуживает только `development environment contour`.
- Workflow не пишет в application database, application migrations, production
  queues или product code.
- `runtime.sqlite` остаётся source of truth.
- `current-sessions.json` и `messages/*.jsonl` остаются read-only projections.
- Agent monitor остаётся read-only observer.

## Входной файл (`entrypoint`)

Исполняемый порядок maintenance находится в `WORKFLOW.md`.

## Передача результата (`handoff`)

После выполнения workflow Dialog Assistant обязан пройти
`.ai/checks/self-review/CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT.md` и явно
сообщить:

- запускался ли `dry-run`;
- какой trigger сработал и какой режим выбран;
- какие cutoffs применялись;
- сколько rows было помечено или удалено;
- остались ли active sessions, unread notifications, blocking peer messages или
  stale presence leases;
- обновлялась ли projection для agent monitor.
