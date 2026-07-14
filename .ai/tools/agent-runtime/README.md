# Runtime tooling ИИ-агентов

```yaml
artifact_id: agent-runtime-tooling
artifact_type: ai-runtime-writer
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/tools/agent-runtime/
source_spec: documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
monitor_spec: documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
runtime_store: .ai/tools/agent-runtime/runtime/runtime.sqlite
maintenance_history: .ai/tools/agent-runtime/runtime/maintenance-history/
maintenance_workflow: .ai/workflows/ai-operations/agent-runtime-maintenance/WORKFLOW.md
maintenance_check: .ai/checks/self-review/CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT.md
```

## Назначение

Node/SQLite CLI для локального runtime-хранилища рабочего AI-слоя:

```text
.ai/tools/agent-runtime/runtime/runtime.sqlite
```

Инструмент относится к `development environment contour`. Он не использует
production database, application migrations или application runtime.

Runtime writer запускается через portable Node/npm command:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- notification-create \
  --source-session-id=<worker-session-id> \
  --actor-session-id=<worker-session-id> \
  --target-role=dialog_assistant \
  --notification-type=result_ready \
  --summary="Worker result ready" \
  --payload-json='{"result":"push_succeeded"}'
```

Node/SQLite CLI является основным runtime writer для monitor/runtime store.

## Команды

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- init
npm --prefix .ai/tools/agent-runtime run runtime -- session-upsert --actor-role=dialog_assistant --session-id=worker-a --role=implementation-worker --status=running --mission="Runtime store"
npm --prefix .ai/tools/agent-runtime run runtime -- presence-set --session-id=worker-a --presence-state=working --current-activity="Writing runtime store"
npm --prefix .ai/tools/agent-runtime run runtime -- event-append --session-id=worker-a --event-type=status-update --summary="Runtime store initialized"
npm --prefix .ai/tools/agent-runtime run runtime -- message-send --source-session-id=worker-a --target-session-id=worker-b --message-type=peer --correlation-id=runtime-store-smoke --requires-ack=true --summary="Runtime writer ready" --payload-json='{"job_id":"runtime-store-smoke","content_summary":"Runtime writer ready"}'
npm --prefix .ai/tools/agent-runtime run runtime -- message-ack --message-id=msg_... --session-id=worker-b --summary="Message received"
npm --prefix .ai/tools/agent-runtime run runtime -- notification-create --source-session-id=worker-a --actor-session-id=worker-a --target-role=dialog_assistant --notification-type=result_ready --summary="Runtime writer ready"
npm --prefix .ai/tools/agent-runtime run runtime -- notification-create --source-session-id=dialog-assistant --actor-session-id=dialog-assistant --target-role=dialog_assistant --notification-type=final_result --summary="Final result delivered"
npm --prefix .ai/tools/agent-runtime run runtime -- notification-update --actor-role=dialog_assistant --notification-id=ntf_... --status=resolved
npm --prefix .ai/tools/agent-runtime run runtime -- operator-command-dispatch --actor-session-id=dialog-assistant --target-session-id=worker-a --command-type=ping --idempotency-key=op-worker-a-ping
npm --prefix .ai/tools/agent-runtime run runtime -- operator-command-dispatch --actor-session-id=dialog-assistant --target-session-id=worker-a --command-type=request_status --idempotency-key=op-worker-a-status
npm --prefix .ai/tools/agent-runtime run runtime -- operator-command-dispatch --actor-session-id=dialog-assistant --target-session-id=worker-a --command-type=send_message --message-text="Уточни текущий blocker" --idempotency-key=op-worker-a-message
npm --prefix .ai/tools/agent-runtime run runtime -- operator-command-dispatch --actor-session-id=dialog-assistant --target-session-id=worker-a --command-type=stop --request-json='{"reason":"operator_requested_stop"}' --idempotency-key=op-worker-a-stop
npm --prefix .ai/tools/agent-runtime run runtime -- operator-command-dispatch --actor-session-id=dialog-assistant --target-session-id=worker-a --command-type=accept_result --idempotency-key=op-worker-a-accept
npm --prefix .ai/tools/agent-runtime run runtime -- job-upsert --job-id=runtime-store-smoke --session-id=worker-a --assignee-session-id=worker-a --current-actor-session-id=worker-a --status=succeeded --lease-status=completed --execution-backend=codex_exec --execution-handle=worker-handle --summary="Smoke write completed"
npm --prefix .ai/tools/agent-runtime run runtime -- active-rows-report --actor-role=dialog_assistant
npm --prefix .ai/tools/agent-runtime run runtime -- monitor-service-status --json
npm --prefix .ai/tools/agent-runtime run runtime -- monitor-service-start --mode=preview --json
npm --prefix .ai/tools/agent-runtime run runtime -- worker-launch-preflight --session-id=<worker-session-id> --group-id=<group-id> --json
npm --prefix .ai/tools/agent-runtime run runtime -- retention-cleanup --actor-role=dialog_assistant --dry-run=true --closed-before=2026-05-01T00:00:00Z
npm --prefix .ai/tools/agent-runtime run runtime -- maintenance-report-write --actor-role=dialog_assistant --policy-trigger=changed_runtime_artifacts --mode=audit_only --decision=passed --dry-run-summary-json='{}' --active-rows-report-json='{}'
npm --prefix .ai/tools/agent-runtime run runtime -- process-upsert --process-id=proc-worker-a --session-id=worker-a --backend=codex_exec --cwd=/home/tom/Server/Realize/Realize-E-Commerce --status=running
npm --prefix .ai/tools/agent-runtime run runtime -- stream-append --process-id=proc-worker-a --stream=stdout --content-text="Worker safe summary"
npm --prefix .ai/tools/agent-runtime run runtime -- projection-export --database=.ai/tools/agent-runtime/runtime/runtime.sqlite --output-root=/tmp/agent-runtime-export
```

Options use `--key=value`. JSON options must contain valid JSON text.

Peer/job/stage сообщения не должны полагаться на defaults `message-send`. Пока
нет writer-level enforcement для отдельного `job_id`, каждое job-related
сообщение должно передавать `--message-type`, `--correlation-id`, явный
`--requires-ack=true|false` и `--payload-json` с `job_id`.

## Operator commands

`operator-command-dispatch` является P0-контрактом команд из Agent Monitor или
другого operator UI. Команда:

- валидирует разрешённый `command-type`;
- пишет durable row в `agent_operator_commands`;
- для worker-facing действий создаёт `agent_messages` trace;
- транслируется в live UI через gateway snapshot и Socket.IO delta;
- выполняет только те lifecycle-переходы, которые runtime store реально может
  выполнить без симуляции внешнего процесса.

Поддерживаемые P0 команды:

- `ping` — возвращает текущие session/presence данные target worker-а и сразу
  завершается как `completed`.
- `request_status` — создаёт delivered operator message worker-у с просьбой
  вернуть структурированный статус; сама доставка команды завершается как
  `completed`.
- `send_message` — создаёт delivered operator message с текстом из
  `--message-text` или `request_json.message_text`; команда завершается как
  `completed`, а ответ worker-а отслеживается отдельным message/ack flow.
- `stop` — создаёт high-priority stop request message и оставляет command в
  `accepted` с `process_stop_executed:false`. Runtime store не имитирует
  убийство процесса; фактическая остановка принадлежит будущему process
  manager.
- `accept_result` — допустим только для target session в статусе
  `result-ready`, `needs-review` или `blocked`. Команда закрывает session с
  `resolution=accepted`, переводит presence в `offline` и resolve-ит
  notification-ы этой session.

Для UI/gateway вызовов write-команда должна иметь idempotency key:

```bash
curl -sS http://127.0.0.1:8765/command \
  -H 'content-type: application/json' \
  --data '{
    "command": "operator-command-dispatch",
    "command_id": "op-worker-a-status",
    "options": {
      "actor-session-id": "dialog-assistant",
      "target-session-id": "worker-a",
      "command-type": "request_status",
      "idempotency-key": "op-worker-a-status"
    }
  }'
```

Расширение P1 (`continue`, `request_review`, `reject_result`, `reassign`,
`open_console`) добавляется отдельным scoped step после process manager и
terminal stream contract.

## Последовательность запуска worker-а

Новый worker-запуск пишется в `runtime.sqlite`, а не вручную в
`current-sessions.json`.

Lifecycle gateway/monitor сервисов проверяется отдельными командами:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- monitor-service-status --json
npm --prefix .ai/tools/agent-runtime run runtime -- monitor-service-start --mode=preview --json
```

Worker launch сам не запускает, не останавливает и не переносит gateway/monitor
на другой порт.

1. Dialog Assistant входит в runtime coordination mode:

   ```bash
   npm --prefix .ai/tools/agent-runtime run runtime -- session-upsert --actor-role=dialog_assistant --session-id=dialog-assistant --worker-kind=dialog_assistant --role=dialog_assistant --status=running --mission="<current managed step>" --assigned-by=user
   npm --prefix .ai/tools/agent-runtime run runtime -- presence-set --session-id=dialog-assistant --presence-state=working --current-activity="<short runtime coordination activity>"
   ```

2. До запуска worker-а Dialog Assistant создаёт planned session:

   ```bash
   npm --prefix .ai/tools/agent-runtime run runtime -- session-upsert --actor-role=dialog_assistant --session-id=<worker-session-id> --worker-kind=external_process --role=<role> --status=planned --mission="<bounded task>" --assigned-by=dialog-assistant --allowed-paths-json='[...]' --forbidden-paths-json='[...]'
   npm --prefix .ai/tools/agent-runtime run runtime -- job-upsert --actor-role=dialog_assistant --job-id=<job-id> --session-id=<worker-session-id> --assignee-session-id=<worker-session-id> --status=queued --lease-status=waiting --execution-backend=codex_exec --allowed-actions-json='["delegated_execution","runtime_result_write"]' --handoff-target=dialog-assistant
   ```

3. Перед фактическим стартом Dialog Assistant выполняет monitor visibility
   preflight:

   ```bash
   npm --prefix .ai/tools/agent-runtime run runtime -- worker-launch-preflight --session-id=<worker-session-id> --group-id=<group-id> --json
   ```

   Для single-worker запуска `--group-id` не передаётся. Запуск разрешён только
   при `pass=true`.

4. После фактического старта Dialog Assistant пишет `launched`, затем `running`, а
   реальную активность отражает через presence и claimed execution lease:

   ```bash
   npm --prefix .ai/tools/agent-runtime run runtime -- session-upsert --actor-role=dialog_assistant --session-id=<worker-session-id> --role=<role> --status=running --mission="<bounded task>" --assigned-by=dialog-assistant
   npm --prefix .ai/tools/agent-runtime run runtime -- process-upsert --process-id=<process-id> --session-id=<worker-session-id> --backend=codex_exec --cwd=<repo> --status=running
   npm --prefix .ai/tools/agent-runtime run runtime -- job-upsert --actor-role=dialog_assistant --job-id=<job-id> --session-id=<worker-session-id> --assignee-session-id=<worker-session-id> --current-actor-session-id=<worker-session-id> --status=running --lease-status=claimed --execution-backend=codex_exec --execution-handle=<process-id> --allowed-actions-json='["delegated_execution","runtime_result_write"]' --handoff-target=dialog-assistant
   npm --prefix .ai/tools/agent-runtime run runtime -- presence-set --session-id=<worker-session-id> --presence-state=working --current-activity="<worker activity>"
   ```

5. Worker сообщает о готовности или проблеме через portable Node notification
   adapter:

   ```bash
   npm --prefix .ai/tools/agent-runtime run runtime -- notification-create --source-session-id=<worker-session-id> --actor-session-id=<worker-session-id> --target-role=dialog_assistant --notification-type=result_ready --summary="<short result summary>"
   ```

6. Dialog Assistant доставляет итог Dialog Assistant-у только после
   review/acceptance через `final_result` notification. Это runtime trace, а не
   user-facing delivery:

   ```bash
   npm --prefix .ai/tools/agent-runtime run runtime -- notification-create --source-session-id=dialog-assistant --actor-session-id=dialog-assistant --target-role=dialog_assistant --notification-type=final_result --summary="<short final result>" --payload-json='{"event_type":"final_result"}'
   ```

7. После `final_result` trace Dialog Assistant обязан отправить compact
   `final_handoff_summary` в текущий диалог пользователя. `group-close`,
   monitor status и `final_result` notification не заменяют это сообщение.

8. Только после user-facing final report Dialog Assistant принимает решение,
   закрывает session и переводит presence в
   `offline`:

   ```bash
   npm --prefix .ai/tools/agent-runtime run runtime -- session-upsert --actor-role=dialog_assistant --session-id=<worker-session-id> --role=<role> --status=closed --resolution=accepted --mission="<bounded task>" --assigned-by=dialog-assistant
   npm --prefix .ai/tools/agent-runtime run runtime -- presence-set --session-id=<worker-session-id> --presence-state=offline --current-activity="closed"
   ```

9. Для старых потребителей создаётся projection:

   ```bash
   npm --prefix .ai/tools/agent-runtime run runtime -- projection-export --database=.ai/tools/agent-runtime/runtime/runtime.sqlite --output-root=<path>
   ```

Ручная правка `.ai/tools/agent-runtime/runtime/worker-sessions/current-sessions.json` для новых
worker-запусков запрещена, кроме аварийного legacy-fallback с явной пометкой
причины.

## Codex exec process bridge

Рабочие рои проекта запускаются как внешние процессы `codex exec`.
Runtime tool не запускает worker сам; он фиксирует обязательный lifecycle до и
после внешнего процесса:

```text
session-upsert planned -> worker-launch-preflight -> codex exec
-> process-upsert -> event/stream safe summary -> result notification
-> review -> session close
```

Planned session и job создаются до запуска. После запуска Dialog Assistant
обязан записать process record:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- process-upsert \
  --process-id=<process-id> \
  --session-id=<worker-session-id> \
  --backend=codex_exec \
  --cwd=<repo> \
  --status=running
```

Запрещено писать в `summary`, `payload-json` и related-artifacts raw private
reasoning, full chain-of-thought, secrets, tokens, webhook URLs, production
dumps и PII beyond task need.

Когда worker вернул bounded result, Dialog Assistant пишет безопасное summary,
job result и notification:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- notification-create \
  --source-session-id=<worker-session-id> \
  --actor-session-id=<worker-session-id> \
  --target-role=dialog_assistant \
  --notification-type=result_ready \
  --summary="<safe result summary>"
```

Raw private reasoning, full tool transcript, secrets и production dumps в
`summary`, result artifact или event payload не записываются.

После review Dialog Assistant закрывает runtime session:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- session-upsert \
  --actor-role=dialog_assistant \
  --session-id=<worker-session-id> \
  --status=closed \
  --resolution=accepted
```

Projection добавляет в active session поля `assignee_session_id`,
`current_actor_session_id`, `execution_backend`, `execution_handle`,
`lease_status`, `allowed_actions`, `handoff_target`, `job_status`,
`job_payload`, `bridge_state` и `job_id`, чтобы `agent-monitor` видел внешний
worker как runtime node без прямой зависимости UI от console process stream.

## Cleanup и retention

`retention-cleanup` выполняет безопасную уборку runtime store. Команда требует
actor `dialog_assistant`.

Порядок запуска, dry-run gate, projection refresh и handoff report описаны в:

```text
.ai/workflows/ai-operations/agent-runtime-maintenance/WORKFLOW.md
.ai/checks/self-review/CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT.md
```

Без retention cutoffs команда только:

- переводит presence с истёкшим `lease_expires_at` в `stale`;
- переводит messages с истёкшим `expires_at` и состоянием `queued|delivered` в
  `expired`.

Удаление выполняется только по явно переданным cutoffs:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- retention-cleanup \
  --actor-role=dialog_assistant \
  --closed-before=2026-05-01T00:00:00Z \
  --expired-message-before=2026-05-01T00:00:00Z \
  --resolved-notification-before=2026-05-01T00:00:00Z \
  --stale-presence-before=2026-05-01T00:00:00Z \
  --monitor-heartbeat-before=2026-05-01T00:00:00Z
```

Для проверки без записи используется:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- retention-cleanup \
  --actor-role=dialog_assistant \
  --dry-run=true \
  --monitor-heartbeat-before=2026-05-01T00:00:00Z \
  --closed-before=2026-05-01T00:00:00Z
```

Active rows report для maintenance self-review:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- active-rows-report \
  --actor-role=dialog_assistant
```

Команда возвращает счётчики:

```text
active_sessions
unresolved_sessions
working_presence
stale_presence
unread_or_blocking_notifications
blocking_peer_messages
closed_sessions_retained
expired_messages_retained
resolved_notifications_retained
legacy_terminal_jobs_without_actor_evidence
monitor_heartbeat_expected_gateway_url
monitor_heartbeat_expected_monitor_url
monitor_heartbeat_gateway_url
monitor_heartbeat_monitor_url
monitor_heartbeat_monitor_url_matches_expected
monitor_heartbeat_gateway_url_matches_expected
monitor_heartbeat_expected_url_mismatch
```

`active-rows-report` также отдаёт `monitor_heartbeat_*` поля, поэтому при
очистке `monitor-heartbeat-before` для `monitor.heartbeat` видно политику
`mismatch` и фактические URL из последнего heartbeat.

Дополнительно `retention-cleanup` summary всегда содержит
`monitor_heartbeat_events_deleted` — число удалённых rows heartbeat-событий.

Machine-readable history report создаётся после maintenance workflow:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- maintenance-report-write \
  --actor-role=dialog_assistant \
  --policy-trigger=changed_runtime_maintenance_artifacts \
  --mode=audit_only \
  --decision=passed \
  --dry-run-summary-json='{"dry_run":true}' \
  --active-rows-report-json='{"active_sessions":0}' \
  --cutoffs-json='{}' \
  --projection-json='{"refreshed":false}'
```

По умолчанию команда пишет JSON в:

```text
.ai/tools/agent-runtime/runtime/maintenance-history/
```

Схема отчёта:

```text
.ai/tools/agent-runtime/runtime/maintenance-history/SCHEMA.md
```

Удаление closed session полагается на SQLite foreign keys: session events,
presence, messages, message acks и notifications удаляются каскадно или
отвязываются согласно schema contract.

## Граница ответственности

- `init` создаёт SQLite-файл и идемпотентно инициализирует схему.
- Writer-команды валидируют JSON payload перед записью.
- Lifecycle-команда `session-upsert` требует actor `dialog_assistant`.
- `job-upsert` запрещает claimed lease без `assignee_session_id`,
  `current_actor_session_id`, `execution_backend` и, для worker backend,
  `execution_handle`.
- Terminal/result job write требует `current_actor_session_id`, совпадающий с
  `assignee_session_id`, кроме явного Dialog Assistant bridge/review/close
  transition.
- `notification-create` для `result_ready`, `final_result`, `blocked`,
  `needs_review` и `handoff` требует `actor-session-id`, совпадающий с
  `source-session-id`, или явный Dialog Assistant bridge transition.
- `message-send` для peer/job/stage сообщений требует явные `message-type`,
  `correlation-id`, `requires-ack` и `payload_json.job_id`; пока отдельного
  writer-level `job_id` поля нет, отсутствие этих значений считается blocker
  на уровне skill/check.
- `message-ack` разрешён только участнику peer message.
- `notification-update` требует actor `dialog_assistant`.
- `active-rows-report` требует actor `dialog_assistant` и не удаляет runtime rows.
- `retention-cleanup` требует actor `dialog_assistant` и удаляет данные только по
  явно заданным retention cutoffs.
- `maintenance-report-write` требует actor `dialog_assistant`, валидирует JSON
  objects/lists и атомарно пишет report artifact в maintenance history.
- Worker process tracking выполняется через `process-upsert`, job/session rows,
  safe events, notifications и terminal close.
- `codex_exec` остаётся execution backend, а monitor читает только runtime
  rows/events/projections и не зависит от console process stream.
- `worker_session_events` остаётся append-only.
- Projection/export пишет только в явно указанный `--output-root`.
- Agent monitor остаётся read-only для filesystem/runtime artifacts; browser
  runtime может отправлять только controlled operator commands через loopback
  gateway API (`request_worker`, `accept_result`) и не получает прямого доступа
  к runtime store.
