# CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT

```yaml
artifact_id: CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT
artifact_type: ai-self-review-check
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/checks/self-review/
workflow: .ai/workflows/ai-operations/agent-runtime-maintenance/WORKFLOW.md
runtime_store: .ai/tools/agent-runtime/runtime/runtime.sqlite
runtime_writer: .ai/tools/agent-runtime/bin/agent-runtime.mjs
projection_exporter: .ai/tools/agent-runtime/bin/agent-runtime.mjs projection-export
maintenance_history: .ai/tools/agent-runtime/runtime/maintenance-history/
related_specs:
  - documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
```

## Условие срабатывания

Запускать после `agent-runtime-maintenance` workflow, после ручного запуска
`retention-cleanup`, перед handoff maintenance-шага и перед финальным ответом,
если текущий шаг обслуживал `.ai/tools/agent-runtime/runtime/runtime.sqlite`.

## Входы

- `runtime.sqlite`;
- maintenance trigger и выбранный maintenance mode;
- skip reason, если maintenance был запрошен или запланирован, но пропущен;
- команда `retention-cleanup --dry-run=true`;
- summary реального `retention-cleanup`, если apply выполнялся;
- вывод `active-rows-report --actor-role=dialog_assistant`;
- путь к maintenance history report, если workflow применён;
- retention cutoffs;
- projection path, если projection обновлялась;
- текущий список active/unresolved runtime rows.

## Процедура

1. Проверить, что runtime store существует и читается.
2. Проверить, что если maintenance был запрошен или запланирован, то workflow
   выполнен или указан допустимый `skip_reason`.
3. Проверить, что mode входит в allowlist: `audit_only`, `cleanup_allowed`,
   `projection_refresh`, `full_maintenance`.
4. Проверить, что перед cleanup apply был выполнен dry-run с теми же cutoffs.
5. Если физическое удаление выполнялось, проверить, что cutoffs были явно
   заданы.
6. Проверить, что cleanup не использовался вместо worker-session lifecycle
   resolution.
7. Проверить, что `retention-cleanup` summary содержит:
   - `dry_run`;
   - `stale_presence_marked`;
   - `expired_messages_marked`;
   - `expired_messages_deleted`;
   - `resolved_notifications_deleted`;
   - `stale_presence_deleted`;
   - `closed_sessions_deleted`;
   - `monitor_heartbeat_events_deleted`.
8. Проверить, что после cleanup сформирован active rows report через
   `active-rows-report --actor-role=dialog_assistant`:
   - `active_sessions`;
   - `unresolved_sessions`;
   - `working_presence`;
   - `stale_presence`;
   - `unread_or_blocking_notifications`;
   - `blocking_peer_messages`;
   - `closed_sessions_retained`;
   - `expired_messages_retained`;
   - `resolved_notifications_retained`;
   - `legacy_terminal_jobs_without_actor_evidence`, если есть historical
     terminal jobs без actor evidence.
   - `monitor_heartbeat_expected_gateway_url`;
   - `monitor_heartbeat_expected_monitor_url`;
   - `monitor_heartbeat_gateway_url`;
   - `monitor_heartbeat_monitor_url`;
   - `monitor_heartbeat_monitor_url_matches_expected`;
   - `monitor_heartbeat_gateway_url_matches_expected`;
   - `monitor_heartbeat_expected_url_mismatch`.
9. Проверить, что если workflow применён, создан machine-readable report через
   `maintenance-report-write`, а report path указывает на
   `.ai/tools/agent-runtime/runtime/maintenance-history/*.json`.
10. Проверить, что maintenance report является валидным JSON и содержит:
   - `schema_version`;
   - `artifact_type: agent-runtime-maintenance-report`;
   - `report_id`;
   - `created_at`;
   - `runtime_store`;
   - `policy_trigger`;
   - `mode`;
   - `decision`;
   - `dry_run_summary`;
   - `active_rows_report`.
11. Проверить, что `dry_run_summary`, `cleanup_summary`,
   `active_rows_report`, `cutoffs` и `projection` являются JSON object, а
   `related_artifacts` является JSON list.
12. Если есть `running`, `result-ready`, `needs-review` или `blocked` sessions,
   проверить, что по ним запущен или явно запланирован
   `CHECK-WORKER-SESSION-LIFECYCLE-BEFORE-HANDOFF`.
13. Если есть unread high/urgent notifications или blocking peer messages,
   проверить, что Dialog Assistant записал acknowledgement/resolution или указал
   blocker.
14. Если projection обновлялась, проверить, что она создана через
   `agent-runtime.mjs projection-export`, а не ручной правкой JSON.
15. Проверить, что handoff содержит residual risk и next step, если active rows
    намеренно остаются.

## Условия прохождения

- Runtime store доступен.
- Maintenance trigger обработан: workflow выполнен или указан допустимый skip reason.
- Dry-run выполнен перед cleanup apply.
- Физическое удаление выполнялось только с явными cutoffs.
- Cleanup не скрывает нерешённые worker-сессии.
- Active rows report сформирован и отделяет lifecycle issues от retention
  leftovers.
- Maintenance history report создан через writer-команду и валиден по схеме.
- Blocking notifications/messages acknowledged, resolved или явно вынесены как
  blocker.
- Projection, если нужна, обновлена exporter-ом.

## Условия ошибки

- Cleanup apply выполнен без dry-run.
- Maintenance был запрошен или запланирован, но workflow пропущен без skip reason.
- Maintenance mode не указан или не входит в allowlist.
- Удаление выполнено без cutoffs.
- Cleanup удаляет или скрывает active/unresolved worker-session вместо
  lifecycle resolution.
- Нет отчёта по active runtime rows.
- Active rows report собран ручным SQL вместо `active-rows-report` без
  явного fallback reason.
- Policy применён, но нет machine-readable maintenance history report.
- Maintenance history report создан ручной правкой JSON вместо
  `maintenance-report-write`.
- Maintenance history report невалиден или не содержит обязательных полей.
- Остались blocking notifications/messages без решения Dialog Assistant-а.
- Projection обновлялась вручную через правку `current-sessions.json`.
- Handoff не сообщает, какие rows остались и почему.

## Обязательный вывод

```text
agent_runtime_maintenance_check: pass|fail
runtime_store: .ai/tools/agent-runtime/runtime/runtime.sqlite
policy_trigger:
mode: audit_only|cleanup_allowed|projection_refresh|full_maintenance|n/a
skip_reason:
maintenance_history_path:
dry_run_executed: yes|no
cleanup_applied: yes|no
cutoffs:
  closed_before:
  expired_message_before:
  resolved_notification_before:
  stale_presence_before:
  monitor_heartbeat_before:
cleanup_summary:
  stale_presence_marked:
  expired_messages_marked:
  expired_messages_deleted:
  resolved_notifications_deleted:
  stale_presence_deleted:
  closed_sessions_deleted:
  monitor_heartbeat_events_deleted:
active_rows_report:
  command: active-rows-report
  active_sessions:
  unresolved_sessions:
  working_presence:
  stale_presence:
  unread_or_blocking_notifications:
  blocking_peer_messages:
  closed_sessions_retained:
  expired_messages_retained:
  resolved_notifications_retained:
  legacy_terminal_jobs_without_actor_evidence:
  monitor_heartbeat_expected_gateway_url:
  monitor_heartbeat_expected_monitor_url:
  monitor_heartbeat_gateway_url:
  monitor_heartbeat_monitor_url:
  monitor_heartbeat_monitor_url_matches_expected:
  monitor_heartbeat_gateway_url_matches_expected:
  monitor_heartbeat_expected_url_mismatch:
projection_refreshed: yes|no|not_needed
worker_lifecycle_check_required: yes|no
decision: passed|failed|blocked
```
