# Workflow обслуживания agent runtime (`agent_runtime_maintenance_workflow`)

```yaml
artifact_id: agent-runtime-maintenance-workflow
artifact_type: ai-workflow
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/workflows/ai-operations/agent-runtime-maintenance/
related_specs:
  - documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
runtime_store: .ai/tools/agent-runtime/runtime/runtime.sqlite
runtime_writer: .ai/tools/agent-runtime/bin/agent-runtime.mjs
projection_exporter: .ai/tools/agent-runtime/bin/agent-runtime.mjs projection-export
maintenance_history: .ai/tools/agent-runtime/runtime/maintenance-history/
check: .ai/checks/self-review/CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT.md
```

## Назначение

Workflow описывает регулярное или явное обслуживание локального
`runtime.sqlite`: пометку stale/expired rows, безопасную retention cleanup,
обновление projection, запись machine-readable history report и отчёт по
runtime состоянию перед handoff.

## Когда запускать

Запускать workflow только если:

- пользователь просит обслужить, почистить или проверить runtime worker-сессий;
- agent monitor показывает stale, expired или закрытые runtime artifacts;
- перед handoff нужно доказать, что нет брошенных active runtime rows;
- менялись `.ai/tools/agent-runtime/*`, `.ai/tools/agent-monitor/*` или
  worker-session workflow.

Workflow выполняется на boundary points, а не при каждом poll/wait:

- перед финальным ответом;
- перед паузой шага;
- после закрытия группы worker-сессий;
- после cleanup apply;
- после изменения runtime/monitor tooling;
- перед commit/push затронутых runtime artifacts.

## Режимы

- `audit_only` - default: dry-run, active rows report, maintenance history
  report, self-review check, без физического удаления.
- `cleanup_allowed` - cleanup apply с явными cutoffs после dry-run.
- `projection_refresh` - exporter обновляет projection для monitor/legacy
  consumer и фиксирует результат в maintenance history report.
- `full_maintenance` - dry-run, cleanup apply при разрешённых cutoffs,
  projection refresh, maintenance history report и full handoff report.

## Роли

- `Dialog Assistant` владеет решением запускать cleanup, выбирать cutoffs и
  принимать остаточный риск.
- `AI runtime store operator` выполняет команды runtime writer/exporter и
  формирует отчёт.
- `Documentation steward` синхронизирует workflow/check/spec, если меняется
  contract.

## Входы

- `.ai/tools/agent-runtime/runtime/runtime.sqlite`;
- `.ai/tools/agent-runtime/bin/agent-runtime.mjs`;
- `npm --prefix .ai/tools/agent-runtime run runtime -- projection-export`;
- `.ai/tools/agent-runtime/runtime/maintenance-history/`;
- текущий runtime coordination context;
- retention cutoffs, если пользователь или Dialog Assistant явно их задал;
- projection output root, если нужно обновить совместимый snapshot.

## Жизненный цикл

```text
intake
-> runtime_store_check
-> dry_run
-> decision_gate
-> cleanup_apply
-> projection_refresh
-> active_rows_report
-> maintenance_history_write
-> self_review
-> handoff
```

## Состояния

### `intake`

Dialog Assistant фиксирует цель maintenance:

- только аудит;
- dry-run без записи;
- cleanup с cutoffs;
- refresh projection;
- full maintenance перед handoff.

Также фиксируются:

- maintenance trigger;
- выбранный mode;
- skip reason, если trigger найден, но maintenance запрещён исключением.

### `runtime_store_check`

Проверить, что `runtime.sqlite` существует, инициализирован и доступен:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- init
```

`init` идемпотентен и не создаёт application database artifacts.

### `dry_run`

Перед реальным удалением выполнить:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- retention-cleanup \
  --actor-role=dialog_assistant \
  --dry-run=true
```

Если планируется удаление, dry-run должен использовать те же cutoffs, что и
будущий apply.

### `decision_gate`

Cleanup apply разрешён только если:

- dry-run выполнен;
- cutoffs явно указаны для физического удаления;
- dry-run summary понятен;
- нет `running`, `result-ready`, `needs-review` или `blocked` rows, которые
  cleanup может скрыть вместо lifecycle resolution;
- пользовательский scope не запрещает запись в runtime store.

Если cutoffs не указаны, workflow может только пометить stale/expired rows и
не удаляет данные.

### `cleanup_apply`

Выполнить `retention-cleanup` без `dry-run=true` только после decision gate.

Допустимые cutoffs:

```text
closed-before
expired-message-before
resolved-notification-before
stale-presence-before
monitor-heartbeat-before
```

Cleanup не заменяет worker-session lifecycle review. Нельзя чистить active
runtime rows, чтобы скрыть нерешённую worker-сессию.

### `projection_refresh`

Если agent monitor или legacy consumer должен увидеть актуальное состояние,
обновить projection:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- projection-export \
  --database=.ai/tools/agent-runtime/runtime/runtime.sqlite \
  --output-root=<path>
```

Projection остаётся read-only export artifact.

### `active_rows_report`

Сформировать отчёт по runtime store:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- active-rows-report \
  --actor-role=dialog_assistant
```

Команда возвращает обязательные счётчики:

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
monitor_heartbeat_expected_url_mismatch
monitor_heartbeat_gateway_url_matches_expected
monitor_heartbeat_monitor_url_matches_expected
```

Отчёт должен отделять:

- rows, которые требуют lifecycle decision;
- rows, которые требуют cleanup;
- rows, которые оставлены намеренно из-за retention policy.

### `maintenance_history_write`

Записать machine-readable отчёт обслуживания:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- maintenance-report-write \
  --actor-role=dialog_assistant \
  --policy-trigger="<trigger>" \
  --mode="<mode>" \
  --decision="<passed|failed|blocked>" \
  --dry-run-summary-json='<retention-cleanup dry-run JSON>' \
  --cleanup-summary-json='<cleanup apply JSON or {}>' \
  --active-rows-report-json='<active-rows-report JSON>' \
  --cutoffs-json='<cutoffs JSON>' \
  --projection-json='<projection JSON>' \
  --related-artifacts-json='<related paths JSON list>'
```

Команда создаёт JSON-файл в:

```text
.ai/tools/agent-runtime/runtime/maintenance-history/
```

Отчёт должен содержать:

- maintenance trigger и mode;
- summary dry-run;
- cleanup summary или `{}`, если cleanup apply не выполнялся;
- active rows report;
- cutoffs;
- monitor heartbeat cleanup detail из `cleanup summary` (`monitor_heartbeat_events_deleted`);
- projection refresh status;
- связанные rule/workflow/check/spec/tool artifacts.

Если workflow остановлен с `decision=blocked` или `decision=failed`, history
report всё равно создаётся, чтобы blocker не остался только в handoff-тексте.

### `self_review`

Выполнить:

```text
.ai/checks/self-review/CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT.md
```

Если текущий шаг связан с worker-сессиями, дополнительно выполнить:

```text
.ai/checks/self-review/CHECK-WORKER-SESSION-LIFECYCLE-BEFORE-HANDOFF.md
```

### `handoff`

В финальном ответе Dialog Assistant сообщает:

- trigger и mode;
- режим: audit, dry-run, cleanup или full maintenance;
- путь к maintenance history report;
- какие cutoffs использовались;
- summary `retention-cleanup`;
- обновлялась ли projection;
- остались ли active rows и почему;
- какие follow-up нужны.

## Стоп-условия

Workflow останавливается без cleanup apply, если:

- `runtime.sqlite` недоступен;
- dry-run не выполнен;
- cutoffs неоднозначны;
- найденные active rows требуют lifecycle resolution, а не cleanup;
- cleanup затрагивает scope вне `development environment contour`;
- пользователь запретил запись в runtime store.

Workflow может быть пропущен только с явным `skip_reason`, если обслуживание
runtime было запрошено или запланировано, но применимо исключение: обычный
диалог без runtime touch, запрет пользователя, отсутствие runtime coordination mode
или выход за согласованный scope.
