# Реестр worker-сессий

```yaml
artifact_id: worker-sessions-registry
artifact_type: ai-run-registry
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/tools/agent-runtime/runtime/worker-sessions/
source_spec: documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
rule: .ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md
workflow: .ai/workflows/core/worker-session/WORKFLOW.md
runtime_store: .ai/tools/agent-runtime/runtime/runtime.sqlite
messages: .ai/tools/agent-runtime/runtime/worker-sessions/messages/
```

## Назначение

Папка хранит runtime registry внешних и встроенных worker-сессий, которыми
управляет Dialog Assistant.

Целевая модель рабочего AI-слоя использует
`.ai/tools/agent-runtime/runtime/runtime.sqlite` как локальный source of truth для
session lifecycle, presence, peer messages, notifications и jobs.
`current-sessions.json` после миграции является read-only projection для
совместимости и agent-monitor UI. Новые записи выполняются через
`.ai/tools/agent-runtime/runtime/runtime.sqlite`.

`current-sessions.json` хранит только текущие active sessions и autonomous
grants со статусом `active`. Resolved/closed sessions перед финальной передачей
результата переносятся в `history/` отдельным завершённым артефактом или удаляются из
`active_sessions`, если отдельная историческая запись не нужна.

Обычный диалог пользователя с ассистентом не записывается в registry. Если
ассистент принимает роль Dialog Assistant для запуска, ведения, проверки или
принятия worker-сессий, он создаёт отдельную active session `dialog-assistant`.
Эта session нужна для runtime-наблюдаемости и отображается в agent-monitor как
обычная runtime session из projection.

## Файлы

- `.ai/tools/agent-runtime/runtime/worker-sessions/current-sessions.json` - текущий registry.
- `.ai/tools/agent-runtime/runtime/INDEX.md` - целевой contract runtime DB.
- `.ai/tools/agent-runtime/runtime/worker-sessions/history/INDEX.md` - правила исторического архива.
- `.ai/tools/agent-runtime/runtime/worker-sessions/messages/INDEX.md` - runtime trace сообщений
  worker-сессий.
- `.ai/tools/agent-runtime/runtime/worker-sessions/messages/SCHEMA.md` - схема JSONL events.

## Контракт схемы

Корневой объект:

- `schema_version` - версия формата registry.
- `updated_at` - время последнего обновления.
- `updated_by` - роль или агент, обновивший registry.
- `active_sessions` - массив текущих worker-сессий.
- `autonomous_grants` - массив autonomous grants со статусом `active`.

Session object:

- `session_id`;
- `worker_kind`;
- `role`;
- `mission`;
- `cwd`;
- `worktree`;
- `allowed_paths`;
- `forbidden_paths`;
- `tools_allowed`;
- `network_allowed`;
- `write_allowed`;
- `expected_output`;
- `stop_condition`;
- `started_at`;
- `updated_at`;
- `status`;
- `resolution`;
- `resolution_reason`;
- `result_path`;
- `messages_path`;
- `diff_review`;
- `continuation_contract`;
- `reassignment_contract`;
- `deferral_contract`;
- `blocker_contract`;
- `history_path`;
- `assigned_by`;
- `handoff_required`;
- `assignee_session_id`;
- `current_actor_session_id`;
- `execution_backend`;
- `execution_handle`;
- `lease_status`;
- `allowed_actions`;
- `handoff_target`;
- `job_status`;
- `job_payload`.

Main Dialog Assistant session использует тот же session object с обязательными
значениями:

```text
session_id: dialog-assistant
worker_kind: dialog_assistant
role: dialog_assistant
assigned_by: user
status: running
handoff_required: false
```

`mission` описывает текущий managed step. Worker-сессии, запущенные этой
session, указывают `assigned_by: dialog-assistant`. `messages_path` для
`dialog-assistant` допустим только для user-visible operational summaries:
старт runtime coordination mode, запуск worker-а, результат, review decision, blocker
или handoff. Обычная переписка, raw tool output и private reasoning не
попадают в trace.

Перед возвратом к обычному диалогу `dialog-assistant` удаляется из
`active_sessions` или переносится в history с terminal decision.

Допустимые операционные `status`:

- `planned`;
- `launched`;
- `running`;
- `result-ready`;
- `needs-review`;
- `blocked`;
- `closed`.

Статусы `running`, `result-ready`, `needs-review` и `blocked` являются
незавершёнными до записи допустимого `resolution`.

Допустимые `resolution`:

- `accepted`;
- `reassigned`;
- `continued`;
- `blocked-with-reason`;
- `closed`;
- `user-approved-deferral`.

`accepted`, `reassigned`, `continued`, `blocked-with-reason` и
`user-approved-deferral` не являются `status` и не записываются в поле
`status`.

Terminal decisions:

- `accepted`;
- `closed`.

Перед финальной передачей результата завершающая session не должна оставаться в
`active_sessions`: Dialog Assistant переносит её в `history/` или удаляет из
активного реестра. Если session временно остаётся в registry до cleanup, она
должна иметь `status: closed` и `history_path` либо явную причину отсутствия
исторического артефакта.

Незавершающие решения, которые могут оставить сессию активной:

- `continued`;
- `reassigned`;
- `blocked-with-reason`;
- `user-approved-deferral`.

Для них обязательны контрактные объекты:

```text
continued -> continuation_contract
reassigned -> reassignment_contract
blocked-with-reason + status: blocked -> blocker_contract
user-approved-deferral -> deferral_contract
```

Минимальная схема `continuation_contract`:

- `next_assignment`;
- `next_operational_status`;
- `continuation_owner`;
- `allowed_paths_unchanged`;
- `stop_condition`;
- `next_review_at`;
- `expires_at`;
- `handoff_allowed`.

Минимальная схема `reassignment_contract`:

- `new_session_id`;
- `reason`;
- `old_session_terminal_decision`;
- `handoff_allowed`.

Минимальная схема `deferral_contract`:

- `approval_source`;
- `next_review_point`;
- `residual_risk`;
- `handoff_allowed`.

Минимальная схема `blocker_contract`:

- `blocker_reason`;
- `required_decision_owner`;
- `next_review_at`;
- `handoff_allowed`.

## Messages trace

Worker-сессия может иметь отдельный runtime trace:

```text
.ai/tools/agent-runtime/runtime/worker-sessions/messages/<session-id>.jsonl
```

`<session-id>` должен совпадать с `session_id` из active registry или
исторического артефакта. Session object может ссылаться на trace через
`messages_path`.

Messages trace:

- хранит user-visible worker updates/summaries для будущего `agent-monitor` UI;
- не заменяет `current-sessions.json`, `result_path`, `diff_review`,
  `resolution` или history artifact;
- остаётся runtime artifact и может переноситься/архивироваться вместе с
  session history при сохранении связи по `session_id`;
- может отсутствовать, если worker не присылал сообщений или policy boundary
  запрещает сохранение исходного сообщения.

JSONL contract:

- одна строка = один event object;
- минимальные поля: `schema_version`, `session_id`, `event_id`, `created_at`,
  `source`, `event_type`, `visibility`, `summary`, `payload`,
  `related_artifacts`;
- допустимые event types: `status-update`, `worker-message`,
  `review-comment`, `handoff`, `blocker`, `decision`, `tool-summary`,
  `artifact-reference`.

Подробная схема находится в
`.ai/tools/agent-runtime/runtime/worker-sessions/messages/SCHEMA.md`.

## Миграция на runtime DB

План миграции:

1. Создать `runtime.sqlite` schema initializer.
2. Перенести lifecycle writes в approved runtime writer.
3. Добавить presence heartbeat/lease.
4. Добавить peer messages и acknowledgements.
5. Добавить worker notifications для Dialog Assistant attention.
6. Генерировать `current-sessions.json` и `messages/*.jsonl` как projection.
7. Оставить agent monitor read-only consumer-ом projection.

Autonomous grant object:

- `approval_id`;
- `mode`;
- `scope`;
- `allowed_paths`;
- `forbidden_paths`;
- `allowed_worker_roles`;
- `max_parallel_sessions`;
- `write_allowed`;
- `allowed_actions`;
- `forbidden_actions`;
- `stop_condition`;
- `expires_at`;
- `granted_by_user`;
- `granted_at`;
- `status`.

Допустимые `mode`:

- `confirmation_required`;
- `autonomous_step`;
- `autonomous_group`.

## Ограничения

- Не хранить secrets, tokens, private dumps или полный console transcript с
  чувствительными данными.
- Не хранить raw private reasoning, hidden chain-of-thought, production dumps
  или tool transcripts с секретами в `messages/*.jsonl`.
- Не хранить PII beyond task need в `messages/*.jsonl`: любые персональные
  данные сверх необходимости конкретного worker-session event, включая
  частичные или одиночные PII fragments, если они не нужны для этого события.
- Не записывать fake running sessions.
- Не оставлять `running`, `result-ready`, `needs-review` или `blocked` без
  резолюции перед handoff.
- Не оставлять `continued`, `reassigned`, `user-approved-deferral` или активный
  `blocked-with-reason` без соответствующего контрактного объекта.
- Не считать active autonomous grant заменой резолюции или контрактного объекта.
- Не оставлять resolved/closed sessions в `active_sessions` перед финальным
  handoff.
- Не использовать registry как замену active rule, check или workflow.
