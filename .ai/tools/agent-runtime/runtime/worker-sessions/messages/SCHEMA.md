# Схема JSONL сообщений worker-сессий

```yaml
artifact_id: worker-session-messages-schema
artifact_type: ai-run-trace-schema
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/tools/agent-runtime/runtime/worker-sessions/messages/
source_spec: documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
```

## Формат файла

Путь:

```text
.ai/tools/agent-runtime/runtime/worker-sessions/messages/<session-id>.jsonl
```

Одна строка JSONL равна одному event object.

## Минимальные поля event object

- `schema_version` - версия схемы события, например `1.0`.
- `session_id` - идентификатор worker-сессии из current/history registry.
- `event_id` - уникальный идентификатор события внутри session trace.
- `created_at` - ISO-8601 timestamp создания события.
- `source` - источник события: `dialog_assistant`, `worker`, `reviewer`,
  `tool-summary` или конкретный role/session alias.
- `event_type` - тип события из allowlist.
- `visibility` - область показа: `user-visible`, `internal-summary`,
  `redacted`.
- `summary` - короткое user-visible описание события без секретов и без raw
  private reasoning.
- `payload` - structured payload события.
- `related_artifacts` - массив ссылок на runtime/docs/diff artifacts без
  секретов.

## Event types

Допустимые значения `event_type`:

- `status-update` - изменение наблюдаемого состояния worker-а или poll summary.
- `worker-message` - сообщение worker-а, предназначенное для Dialog Assistant или
  будущего agent-monitor UI.
- `review-comment` - комментарий Dialog Assistant/reviewer по output или diff.
- `handoff` - событие передачи результата, резолюции или следующего владельца.
- `blocker` - зафиксированная блокировка и требуемое решение.
- `decision` - принятое runtime/architecture/process решение в рамках scope.
- `tool-summary` - краткое summary вызовов tools без raw transcript и секретов.
- `artifact-reference` - ссылка на diff, result, history, report или другой
  разрешённый артефакт.

## Visibility

- `user-visible` - можно показывать пользователю в agent-monitor UI.
- `internal-summary` - можно хранить как краткое operational summary, но нельзя
  трактовать как скрытое рассуждение модели.
- `redacted` - событие сохранено только как факт с sanitised summary, потому
  что исходные данные нельзя хранить.

`visibility` не разрешает хранить secrets, tokens, raw private reasoning,
chain-of-thought, production dumps или PII beyond task need.

## Payload

`payload` должен быть JSON object. Рекомендуемые поля зависят от
`event_type`:

- `status-update`: `status`, `previous_status`, `resolution`, `next_action`.
- `worker-message`: `message_kind`, `content_summary`.
- `review-comment`: `review_scope`, `finding_count`, `decision`.
- `handoff`: `handoff_to`, `handoff_required`, `handoff_allowed`,
  `messages_path`.
- `blocker`: `blocker_reason`, `required_decision_owner`, `next_review_at`.
- `decision`: `decision`, `reason_summary`, `owner_layer`, `scope`.
- `tool-summary`: `tool_name`, `action_summary`, `result_summary`,
  `redactions_applied`.
- `artifact-reference`: `artifact_path`, `artifact_kind`, `relationship`.

Для peer communication и Dialog Assistant notification export/projection
допустимы дополнительные поля payload:

- `source_session_id` - session, которая инициировала сообщение или сигнал;
- `target_session_id` - целевая worker/dialog_assistant session;
- `target_role` - целевая роль, если конкретная session ещё не назначена;
- `correlation_id` - связь question/answer/ack/notification;
- `requires_ack` - нужно ли подтверждение получения;
- `message_state` - `queued`, `delivered`, `acknowledged`, `answered`,
  `expired`, `failed`;
- `notification_type` - `result_ready`, `blocked`, `needs_review`,
  `request_link`, `request_worker`, `scope_conflict`, `handoff`,
  `heartbeat_missed`;
- `priority` - `info`, `normal`, `high`, `urgent`;
- `flow_visible_until` - timestamp, до которого monitor может показывать
  animated flow для recent transfer.

Для `group/staged` lifecycle contract дополнительно допустимы поля payload:

- `group_id` - идентификатор worker group в пределах task/session runtime;
- `group_stage_id` - идентификатор текущего launch stage;
- `group_stage_index` - индекс stage в execution chain;
- `peer_edge_id` - идентификатор разрешённого peer edge из
  `peer_communication_edges`;
- `group_closer_worker_id` - worker, назначенный на group closure;
- `returns_to_session_id` - должен указывать на owner Dialog Assistant session;
- `acceptance_gate` - состояние review/acceptance gate (`pending`,
  `in_review`, `accepted`, `rejected`);
- `acceptance_evidence_ref` - ссылка на evidence artifact перед `final_result`.

Эти поля не дают worker-у право менять lifecycle другой session. Lifecycle
решения остаются в registry/runtime store и принадлежат Dialog Assistant-у.

`payload` может быть `{}` только если `summary` полностью объясняет событие и
нет безопасных структурированных данных для записи.

## Related artifacts

`related_artifacts` должен быть массивом объектов:

- `path` - repo-relative path или runtime artifact path;
- `kind` - `registry`, `history`, `diff`, `result`, `check`, `doc`, `messages`;
- `description` - короткое описание связи.

Ссылки на external URLs допустимы только если они не содержат токены,
секреты или приватные query parameters.

## Примеры JSONL

```jsonl
{"schema_version":"1.0","session_id":"worker-a-2026-05-05-runtime-messages","event_id":"evt-0001","created_at":"2026-05-05T06:20:00+04:00","source":"worker","event_type":"status-update","visibility":"user-visible","summary":"Worker начал анализ source of truth для контракта messages JSONL.","payload":{"status":"running","previous_status":"launched","next_action":"read_source_of_truth"},"related_artifacts":[{"path":".ai/tools/agent-runtime/runtime/worker-sessions/current-sessions.json","kind":"registry","description":"active session registry"}]}
{"schema_version":"1.0","session_id":"worker-a-2026-05-05-runtime-messages","event_id":"evt-0002","created_at":"2026-05-05T06:35:00+04:00","source":"dialog_assistant","event_type":"handoff","visibility":"user-visible","summary":"Dialog Assistant получил результат worker-а и проверяет scoped diff.","payload":{"handoff_to":"dialog_assistant","handoff_required":true,"handoff_allowed":true,"messages_path":".ai/tools/agent-runtime/runtime/worker-sessions/messages/worker-a-2026-05-05-runtime-messages.jsonl"},"related_artifacts":[{"path":".ai/tools/agent-runtime/runtime/worker-sessions/messages/worker-a-2026-05-05-runtime-messages.jsonl","kind":"messages","description":"message trace for the session"}]}
{"schema_version":"1.0","session_id":"worker-group-2026-05-10","event_id":"evt-0042","created_at":"2026-05-10T17:10:00+04:00","source":"group-closer-worker","event_type":"decision","visibility":"user-visible","summary":"Group closer передал aggregated result в Dialog Assistant acceptance gate.","payload":{"decision":"result_ready","group_id":"group-a","group_stage_id":"stage-2","group_stage_index":2,"group_closer_worker_id":"worker-g2-closer","returns_to_session_id":"dialog-assistant","acceptance_gate":"pending"},"related_artifacts":[{"path":".ai/tools/agent-runtime/runtime/worker-sessions/current-sessions.json","kind":"registry","description":"group lifecycle projection"}]}
```

## Validation examples

Проверка валидности всех строк:

```bash
jq -c . .ai/tools/agent-runtime/runtime/worker-sessions/messages/<session-id>.jsonl >/dev/null
```

Проверка минимальных полей:

```bash
jq -e 'select(
  has("schema_version") and
  has("session_id") and
  has("event_id") and
  has("created_at") and
  has("source") and
  has("event_type") and
  has("visibility") and
  has("summary") and
  has("payload") and
  has("related_artifacts")
)' .ai/tools/agent-runtime/runtime/worker-sessions/messages/<session-id>.jsonl >/dev/null
```

## Запрещённое содержимое

Запрещено сохранять:

- secrets, tokens, credentials, webhook URLs и session cookies;
- raw private reasoning, hidden chain-of-thought и внутренние рассуждения
  модели;
- production dumps, database dumps и полные console transcripts с
  чувствительными данными;
- PII beyond task need: любые персональные данные сверх необходимости
  конкретного worker-session event, включая частичные или одиночные PII
  fragments, если они не нужны для этого события;
- raw tool output, если он содержит секреты, приватные данные или out-of-scope
  paths.

Все tool и reasoning события записываются только как краткие user-visible
updates/summaries с redaction при необходимости.
