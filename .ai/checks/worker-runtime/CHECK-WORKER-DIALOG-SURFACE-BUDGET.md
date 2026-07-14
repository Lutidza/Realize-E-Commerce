# Проверка: бюджет сообщений Dialog Assistant при worker-группах (`CHECK-WORKER-DIALOG-SURFACE-BUDGET`)

```yaml
check_id: CHECK-WORKER-DIALOG-SURFACE-BUDGET
artifact_type: ai-runtime-check
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/checks/worker-runtime/
related_rules:
  - .ai/rules/worker-runtime/RULE-WORKER-DIALOG-COORDINATION.md
  - .ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md
related_workflows:
  - .ai/workflows/core/worker-assignment/WORKFLOW.md
  - .ai/workflows/core/worker-session/WORKFLOW.md
runtime_store: .ai/tools/agent-runtime/runtime/runtime.sqlite
monitor_tool: .ai/tools/agent-monitor/
```

## Назначение (`purpose`)

Проверка ограничивает шум в user-facing диалоге при запуске single-worker,
staged или group worker-chain. Подробный lifecycle trace, tool summaries,
peer messages и worker raw outputs должны жить в `agent-runtime`/monitor, а
диалог с пользователем должен получать только короткие vetted сообщения.

## Разрешённые сообщения в диалог (`allowed_dialog_surface`)

Dialog Assistant может писать в текущий диалог только:

- `group_start_summary` — один короткий стартовый отчёт: цель, group id,
  worker ids/roles, monitor URL или статус видимости;
- `approval_or_blocker` — сообщение, если нужен user approval, scope decision,
  blocker, stop condition или риск, который нельзя принять автономно;
- `major_stage_summary` — редкий краткий итог stage, если stage меняет дальнейший
  план или требует ожидания;
- `final_handoff_summary` — финальный vetted summary: что сделано, какие файлы
  изменены, какие проверки выполнены, какие риски остались.

`final_handoff_summary` является обязательным, если worker group или staged
worker-chain завершились `accepted`, `blocked`, `needs-review` или
`user-approved-deferral`. Runtime `group-close`, `final_result` notification или
monitor event не заменяют сообщение в текущем user-facing диалоге.

## Запрещённые сообщения в диалог (`forbidden_dialog_surface`)

Запрещено выводить в user-facing диалог:

- repository search, implementation или worker-group coordination как
  собственную работу Dialog Assistant-а при запросе worker group;
- каждую runtime writer command (`session-upsert`, `presence-set`,
  `group-member-upsert`, `process-upsert`, `group-close` и аналогичные);
- большие `curl`, `snapshot`, `rg`, `git diff`, tool logs или full command output;
- полный worker output, если он длиннее краткого vetted summary;
- повторяющиеся подтверждения planned/running/result-ready, если они уже видны
  в monitor;
- peer-worker messages и raw coordination trace;
- raw private reasoning, hidden chain-of-thought, secrets, tokens,
  production dumps или лишние PII.

## Runtime routing (`runtime_routing`)

Подробные детали должны записываться в durable runtime/monitor surface:

- search evidence от отдельного `repository-search-worker` через runtime
  messages/edges;
- coordinator/reviewer evidence через peer evidence chain;
- lifecycle rows/events в `runtime.sqlite`;
- `event-append`/`stream-append` только с safe summary;
- worker result summary в result notification/artifact;
- peer communication через `message-send` по разрешённым edges;
- machine-readable report или repo artifact, если scope явно разрешает файл.

Dialog Assistant не должен компенсировать monitor/runtime тем, что переносит
подробный trace в чат.

## Проверка перед запуском (`pre_launch`)

1. Указать `dialog_surface_mode`:
   - `compact`;
   - `approval_required`;
   - `incident_verbose` только по явному user approval.
2. Зафиксировать `dialog_allowed_events`.
3. Указать runtime sink для подробностей: monitor/runtime event, result artifact
   или repo file.
4. В prompts worker-ов добавить запрет на длинный final dump в user-facing
   канал и требование возвращать compact structured summary.

## Проверка перед handoff (`pre_handoff`)

1. Проверить, что user-facing диалог не содержит full lifecycle/tool trace.
2. Проверить, что важные details доступны в runtime/monitor или artifacts.
3. Проверить, что финальный handoff агрегирует результаты worker-ов, а не
   копирует их целиком.
4. Проверить, что после принятого/закрытого group result Dialog Assistant
   подготовил и отправляет в текущий диалог `final_handoff_summary`.
5. Если было превышение бюджета, зафиксировать `dialog_surface_budget_exceeded`
   как deviation и в финале дать только compact correction.

## Условия прохождения (`pass`)

- В диалог попали только разрешённые summary/blocker/final handoff сообщения.
- После завершения worker group пользователь получил compact
  `final_handoff_summary` в текущем диалоге.
- Подробный lifecycle trace доступен в runtime/monitor.
- Worker output агрегирован, а не скопирован полностью.
- Нет raw private reasoning, secrets, production dumps или лишних PII.

## Условия ошибки (`fail`)

- Диалог содержит поток runtime writer команд или full command outputs.
- Диалог содержит полный worker result, который должен быть artifact/runtime
  summary.
- Dialog Assistant публикует повторяющиеся progress messages без blocker или
  user decision.
- Подробности не записаны в runtime/monitor, а сохранены только в чате.
- Worker group завершена или закрыта, но Dialog Assistant не отправил compact
  `final_handoff_summary` в текущий диалог.

## Выход (`output`)

```text
worker_dialog_surface_budget_check: pass|fail|not_required
dialog_surface_mode: compact|approval_required|incident_verbose|not_required
dialog_allowed_events: group_start_summary,approval_or_blocker,major_stage_summary,final_handoff_summary
runtime_detail_sink: monitor|runtime_events|artifact|not_required
final_handoff_summary_required: yes|no
final_handoff_summary_emitted: yes|no
dialog_messages_emitted: <count>
budget_exceeded: yes|no
blocker: <short reason or none>
```
