# Сообщения worker-сессий

```yaml
artifact_id: worker-session-messages
artifact_type: ai-run-trace
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/tools/agent-runtime/runtime/worker-sessions/messages/
source_spec: documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
registry: .ai/tools/agent-runtime/runtime/worker-sessions/current-sessions.json
history: .ai/tools/agent-runtime/runtime/worker-sessions/history/
schema: .ai/tools/agent-runtime/runtime/worker-sessions/messages/SCHEMA.md
```

## Назначение

Папка хранит runtime trace сообщений worker-сессий для будущего
`agent-monitor` UI.

Каждая worker-сессия может иметь отдельный JSONL-файл:

```text
.ai/tools/agent-runtime/runtime/worker-sessions/messages/<session-id>.jsonl
```

`<session-id>` должен совпадать с `session_id` из
`.ai/tools/agent-runtime/runtime/worker-sessions/current-sessions.json` или исторического артефакта в
`.ai/tools/agent-runtime/runtime/worker-sessions/history/`.

## Правило формата

JSONL-файл состоит из событий:

- одна строка = один валидный JSON object;
- одна строка описывает одно событие worker-сессии;
- порядок строк соответствует порядку записи событий;
- пустые строки запрещены;
- многострочные payload-значения хранятся как JSON-строки с escaping, а не как
  raw transcript.

Минимальный контракт события описан в
`.ai/tools/agent-runtime/runtime/worker-sessions/messages/SCHEMA.md`.

## Связь с registry и history

`messages/<session-id>.jsonl` не заменяет `current-sessions.json` и не хранит
операционный lifecycle. Registry остаётся владельцем active session state,
resolution и контрактных объектов.

Для managed subagent bridge observability `messages` является runtime-visible
artifact trace managed bridge events:

- `subagent-prepare` и `subagent-launched` создают базовый lifecycle trace;
- `subagent-progress` пишет промежуточные user-visible updates (`status-update`,
  `tool-summary`, `handoff`, `blocker`, `artifact-reference`,
  `review-comment`, `decision`, `worker-message`);
- `subagent-result` и `subagent-close` добавляют итоговый handoff/decision trace.

Session object в registry или history может ссылаться на trace через поле
`messages_path`:

```text
messages_path: .ai/tools/agent-runtime/runtime/worker-sessions/messages/<session-id>.jsonl
```

Если сообщений нет, поле может отсутствовать или иметь `null`. Это не считается
ошибкой само по себе, но handoff/self-review должен явно фиксировать:

- messages trace есть и путь валиден;
- messages trace отсутствует, потому что worker не присылал user-visible
  updates;
- messages trace не создан из-за policy boundary, например чтобы не сохранять
  чувствительные данные.

## Retention и архивирование

Messages trace является runtime artifact, а не production log.

Правило хранения:

- пока session активна, trace остаётся в `messages/`;
- при переносе session в `history/` trace может остаться в `messages/`, если
  history artifact содержит `messages_path`;
- если policy или cleanup требует единый архив, trace может переноситься или
  архивироваться вместе с session history при сохранении связи по
  `session_id`;
- удаление trace допустимо только если оно не нарушает текущий handoff,
  audit/debug потребность или явно согласованную retention policy.

## Ограничения

В `messages/*.jsonl` запрещено хранить:

- secrets, tokens, credentials, webhook URLs и session cookies;
- raw private reasoning, hidden chain-of-thought или внутренние рассуждения
  модели;
- production dumps, database dumps и полные console transcripts с
  чувствительными данными;
- PII beyond task need: любые персональные данные сверх необходимости
  конкретного worker-session event, включая частичные или одиночные PII
  fragments, если они не нужны для этого события;
- содержимое файлов, не входящих в allowed paths worker-а, если это расширяет
  scope;
- данные, которые нельзя показывать пользователю в будущем `agent-monitor` UI;
- raw private reasoning или secrets в `summary`, `payload`, `related_artifacts`.

Reasoning в этом контракте означает только user-visible worker
updates/summaries: краткие сообщения о ходе работы, решениях, blockers,
handoff и summary использованных tools без приватного chain-of-thought
и без production dump.
