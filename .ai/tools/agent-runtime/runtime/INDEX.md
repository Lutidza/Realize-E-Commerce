# Runtime-хранилище ИИ-агентов

```yaml
artifact_id: agent-runtime-store
artifact_type: ai-runtime-store-contract
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/tools/agent-runtime/runtime/
source_spec: documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
monitor_spec: documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
runtime_writer: .ai/tools/agent-runtime/bin/agent-runtime.mjs
projection_exporter: .ai/tools/agent-runtime/bin/agent-runtime.mjs projection-export
maintenance_history: .ai/tools/agent-runtime/runtime/maintenance-history/
maintenance_workflow: .ai/workflows/ai-operations/agent-runtime-maintenance/WORKFLOW.md
maintenance_check: .ai/checks/self-review/CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT.md
```

## Назначение

Папка предназначена для будущего локального source of truth рабочего слоя
ИИ-агентов:

```text
.ai/tools/agent-runtime/runtime/runtime.sqlite
```

Это не application database и не часть production contour. Runtime-хранилище
обслуживает только локальную разработку, orchestration, worker-сессии,
presence, peer messages, notifications и jobs.

## Целевая модель

```text
runtime.sqlite = source of truth
current-sessions.json = read-only projection для совместимости и monitor UI
messages/*.jsonl = read-only/export trace для совместимости и debug
maintenance-history/*.json = machine-readable отчёты обслуживания runtime
agent-monitor = read-only observer
```

## Минимальные таблицы

- `worker_sessions` - lifecycle worker-сессий.
- `worker_session_events` - append-only журнал lifecycle transitions.
- `worker_presence` - фактическая активность: `working`, `waiting`, `idle`,
  `stale`, `offline`.
- `worker_messages` - peer-to-peer сообщения worker-ов.
- `worker_message_acks` - доставка, прочтение и ответы.
- `worker_notifications` - сигналы worker-а Dialog Assistant-у.
- `worker_jobs` - исполняемые задания, execution lease, execution ownership и
  результат.

## Правила

- Worker может писать peer message или notification через approved runtime
  writer, но не меняет lifecycle чужой session.
- Dialog Assistant остаётся владельцем lifecycle decision, resolution, scope и
  worker assignment.
- `active` в UI считается по `worker_presence`, а не по `status: running`.
- Поток на graph edge отображается только для recent/in-flight message или
  notification, а не для постоянной связи.
- Browser runtime agent monitor не пишет в `runtime.sqlite` напрямую.

## Локальный tooling

```text
.ai/tools/agent-runtime/bin/agent-runtime.mjs
.ai/tools/agent-runtime/src/runtime-schema/
.ai/tools/agent-runtime/src/runtime-store/
.ai/tools/agent-runtime/src/projection-exporter.mjs
.ai/tools/agent-runtime/src/maintenance-report-writer.mjs
```

Tooling реализует idempotent schema initializer и минимальный runtime writer
для lifecycle sessions, events, presence, peer messages, acknowledgements,
notifications, jobs, active rows report, retention cleanup и записи
maintenance history report. Projection/export выполняется read-only режимом
того же Node CLI.

`worker_jobs` хранит проверяемые ownership поля:

```text
assignee_session_id
current_actor_session_id
lease_status
execution_backend
execution_handle
allowed_actions_json
handoff_target
```

`job-upsert` не принимает claimed execution lease без assignee/current
actor/backend/handle, а terminal/result write требует actor-а, который владеет
lease, или явного Dialog Assistant bridge/review/close transition.

Legacy terminal jobs, созданные до runtime execution ownership enforcement, не
backfill-ятся ложными actor/backend/handle значениями. Такие rows остаются
terminal historical data и считаются в `active-rows-report` полем:

```text
legacy_terminal_jobs_without_actor_evidence
```

Этот счётчик является historical/process debt. Он не является active blocker
сам по себе, если `active_sessions`, `unresolved_sessions`,
`working_presence`, `unread_or_blocking_notifications` и
`blocking_peer_messages` равны нулю.

Maintenance workflow:

```text
.ai/workflows/ai-operations/agent-runtime-maintenance/WORKFLOW.md
```

Self-review check:

```text
.ai/checks/self-review/CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT.md
```

Maintenance history:

```text
.ai/tools/agent-runtime/runtime/maintenance-history/
.ai/tools/agent-runtime/runtime/maintenance-history/SCHEMA.md
```

## План миграции

1. Зафиксировать schema contract в specs и active workflow/rules.
2. Создать `runtime.sqlite` и idempotent schema initializer. Выполнено:
   `npm --prefix .ai/tools/agent-runtime run runtime -- init`.
3. Добавить CLI/runtime writer для session, presence, message, ack,
   notification и job events. Выполнено.
4. Добавить projection generator:
   `runtime.sqlite -> current-sessions.json + messages/*.jsonl`.
   Выполнено.
5. Перевести agent monitor на чтение projection без write path. Выполнено.
6. Перевести Dialog Assistant/worker workflow на writer вместо ручного JSON.
   Выполнено.
7. Очистить legacy JSON как source of truth и оставить его только projection.
   Выполнено в контракте.
8. Добавить retention cleanup и maintenance workflow. Выполнено.
9. Регулярный maintenance schedule временно не закреплён active rule.
   Обслуживание runtime запускается явной задачей или согласованным шагом.
10. Добавить удобную wrapper-команду, которая печатает active rows report без
    ручного SQL. Выполнено: `active-rows-report`.
11. Добавить machine-readable maintenance history artifact для периодических
    отчётов. Выполнено:
    `.ai/tools/agent-runtime/runtime/maintenance-history/`.
12. Следующий шаг: подключить просмотр maintenance history в agent monitor,
    если это потребуется для operator workflow.
13. Выполнено: добавить runtime execution ownership columns в `worker_jobs`,
    writer-level validation для execution lease и projection fields для
    monitor read model.
