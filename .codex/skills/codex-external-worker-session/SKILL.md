---
name: codex-external-worker-session
description: >-
  Используй после Dialog Assistant entry/bootstrap, когда Dialog Assistant запускает
  или ведёт внешних Codex worker-ов через codex exec, регистрирует сессию,
  ждёт результат, проверяет diff и закрывает worker без брошенных сессий.
---

# Скилл: внешняя Codex worker-сессия

## Когда использовать

Используй этот скилл, если Dialog Assistant управляет внешним консольным Codex
worker-ом или несколькими worker-сессиями через `codex exec` в рамках текущего
шага.

Этот skill не является entrypoint для `work_task`. До него должен пройти
direct pre-edit gate, а в плане текущего шага должно быть явно зафиксировано,
что нужен worker или reviewer.

Скилл применяет:

- `.ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md`;
- `.ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md`;
- `.ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md`;
- `.ai/checks/worker-runtime/CHECK-WORKER-DIALOG-SURFACE-BUDGET.md`;
- `.ai/checks/self-review/CHECK-WORKER-SESSION-LIFECYCLE-BEFORE-HANDOFF.md`;
- `.ai/checks/self-review/CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT.md`;
- `.ai/workflows/core/worker-session/WORKFLOW.md`;
- `.ai/workflows/ai-operations/agent-runtime-maintenance/WORKFLOW.md`;
- `.ai/tools/agent-runtime/runtime/INDEX.md`;
- `.ai/tools/agent-runtime/bin/agent-runtime.mjs`;
- `.ai/tools/agent-runtime/runtime/runtime.sqlite`;
- `.ai/tools/agent-runtime/runtime/maintenance-history/` как machine-readable отчёты
  maintenance workflow;
- `.ai/tools/agent-runtime/runtime/worker-sessions/current-sessions.json` как совместимую projection;
- `.ai/tools/agent-runtime/runtime/worker-sessions/messages/` как export/projection trace.

Скилл является процедурным адаптером к rule/check/workflow. Нормативные
требования живут в `.ai/rules/*`, `.ai/checks/*` и `.ai/workflows/*`; этот
файл не вводит самостоятельные project-level правила.

## Процедура Dialog Assistant

1. Прочитай актуальный workflow worker-session, контракт
   `.ai/tools/agent-runtime/runtime/`, README runtime writer и контракт
   `.ai/tools/agent-runtime/runtime/worker-sessions/messages/`, если worker должен отправлять
   user-visible updates/summaries.
2. Выполни Dialog Assistant entry gate для рабочего шага. Если active
   `dialog-assistant` уже существует, сначала реши `reuse`, `start_new` или
   `block` по текущей mission/scope. Если task-specific
   skill/workflow/adapter был применён до Dialog Assistant entry decision,
   останови шаг и зафиксируй нарушение порядка входа.
3. До worker launch выполни
   анализ задачи, матрицу ролей, группы worker-ов, граф зависимостей и
   черновики заданий worker-ов.
   Перед launch и до приемки результата обязателен worker assignment pre-launch gate:
   - Dialog Assistant по умолчанию coordinator-only и не выполняет `work_task`
     напрямую без явного разрешения пользователя.
   - Перед запуском worker-а фиксируй полный assignment: роль, модель, применимые
     rules/checks/workflows, bounded task, allowlist, forbidden paths,
     context budget, решение reuse-or-spawn и handoff contract.
   - Model gate: small/simple → `gpt-5.3-codex-spark`; standard coding/process →
     `gpt-5.3-codex`; complex/high-risk/architecture → текущая продвинутая
     модель, в первую очередь `gpt-5.5` при наличии.
   - Context gate: если контекст раздут или роль/задача не совпадает с текущим
     worker, создаётся новый worker; если роль совпадает и контекст адекватный,
     допускается reuse текущего worker.
   - Chain handoff: `worker -> coordinator -> Dialog Assistant -> user`.
   - Acceptance: coordinator принимает результат только после review diff,
     allowlist и checks, и runtime close worker сессии.
   - Scope lock: worker не расширяет allowlist и не создает docs/registry/rules без
     отдельного разрешающего gate.
   - Dialog surface budget: user-facing чат получает только стартовый summary,
     blocker/approval request, редкий major stage summary и финальный compact
     handoff. Подробный trace остаётся в runtime/monitor или artifact.
4. Определи mode: `confirmation_required`, `autonomous_step` или
   `autonomous_group`.
5. Если mode autonomous, проверь active grant: `approval_id`, `scope`,
   `allowed_paths`, `forbidden_paths`, `allowed_worker_roles`,
   `max_parallel_sessions`, `write_allowed`, `allowed_actions`,
   `forbidden_actions`, `stop_condition`, `expires_at`, `status`.
6. Если текущий ассистент входит в runtime coordination mode, создай или
   обнови `dialog-assistant` через runtime writer и укажи coordination
   metadata. Не выдавай inline dialog coordination за отдельный фоновый
   process:

   ```bash
   npm --prefix .ai/tools/agent-runtime run runtime -- session-upsert --actor-role=dialog_assistant --session-id=dialog-assistant --worker-kind=dialog_assistant --role=dialog_assistant --status=running --mission="<current managed step>" --assigned-by=user --metadata-json='{"bootstrap_actor":"dialog_assistant","dialog_assistant_entry":"reuse_existing","coordination_mode":"inline_dialog"}'
   npm --prefix .ai/tools/agent-runtime run runtime -- presence-set --session-id=dialog-assistant --presence-state=working --current-activity="<short runtime coordination activity>"
   ```

   Обязательные поля session:

   - `session_id: dialog-assistant`;
   - `worker_kind: dialog_assistant`;
   - `role: dialog_assistant`;
   - `assigned_by: user`;
   - `status: running`;
   - `handoff_required: false`;
   - `mission` равен текущему managed step.
   - `metadata_json.coordination_mode` фиксирует `inline_dialog` или
     `external_process`.
   Обычный диалог без управления worker-ами не регистрируется. Trace
   `dialog-assistant` допускает только user-visible operational summaries и
   не сохраняет raw private reasoning, переписку, secrets или raw tool output.
7. Перед запуском worker-а создай session со статусом `planned` через runtime
   writer, а не ручным редактированием JSON:

   ```bash
   npm --prefix .ai/tools/agent-runtime run runtime -- session-upsert --actor-role=dialog_assistant --session-id=<worker-session-id> --worker-kind=external_process --role=<role> --status=planned --mission="<bounded task>" --assigned-by=dialog-assistant --allowed-paths-json='[...]' --forbidden-paths-json='[...]'
   ```

   Если планируется message trace, он создаётся runtime writer/exporter-ом как
   `.ai/tools/agent-runtime/runtime/worker-sessions/messages/<session-id>.jsonl`.
   Если worker запущен main Dialog Assistant-ом, укажи
   `assigned_by: dialog-assistant`.
8. Для group/staged execution до фактического запуска создай group topology
   через runtime writer: `group-upsert`, `group-member-upsert` и
   `group-edge-upsert`. Group record, members и edges должны появиться в
   agent-runtime gateway snapshot до запуска первого worker-а.
9. Выполни `CHECK-WORKER-MONITOR-VISIBILITY`:
   - используй только `reuse_existing_only` режим для monitor/gateway;
   - не запускай, не перезапускай, не останавливай и не переноси на другой port
     `agent-runtime gateway` или `agent-monitor UI` как часть worker/group
     launch;
   - запиши presence до запуска;
   - выполни deterministic preflight:

     ```bash
     npm --prefix .ai/tools/agent-runtime run runtime -- worker-launch-preflight --session-id=<worker-session-id> --group-id=<group-id> --json
     ```

   - для single-worker запуска не передавай `--group-id`;
   - HTTP `/health` и `/snapshot` в JSON output являются диагностикой, а не
     ручным curl/shell gate;
   - останови запуск с blocker из JSON результата, если `pass=false`.
   Запуск worker-а без отображения в monitor запрещён, кроме отдельного
   emergency approval пользователя, зафиксированного как deviation.
10. Выполни `CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE`: до вызова `codex exec`
    должны быть planned session, visible group state,
    `worker-launch-preflight pass`, `codex_exec_allowed=true` и
    `spawn_agent_allowed=false`; после запуска обязательно записывается process
    state через `process-upsert`, result notification/artifact и terminal close.
11. Выполни `CHECK-WORKER-DIALOG-SURFACE-BUDGET`:
   - зафиксируй `dialog_surface_mode=compact`, если пользователь явно не
     запросил verbose incident mode;
   - определи, какие события можно писать в user-facing диалог:
     `group_start_summary`, `approval_or_blocker`, `major_stage_summary`,
     `final_handoff_summary`;
   - определи runtime/detail sink для подробностей: `agent-runtime` events,
     monitor, worker result artifact или repo artifact в allowlist;
   - если нужен длинный отчёт worker-а, требуй artifact/result summary, а не
     full dump в текущий чат.
12. Сформируй prompt worker-а:
   - роль;
   - миссия;
   - source of truth;
   - allowed paths;
   - forbidden paths;
   - tools allowed;
   - write allowed;
   - expected output;
   - stop condition;
   - запрет commit/push, task close, secrets access, destructive commands,
     allowlist expansion и out-of-scope writes.
   - обязательный канал final result: worker -> Dialog Assistant.
   - запрет писать результат напрямую Dialog Assistant-у или пользователю.
   - запрет длинного final dump в user-facing канал; worker должен возвращать
     compact structured summary или писать подробный отчёт в разрешённый
     artifact.
13. Запусти worker только в рамках разрешённого cwd/worktree и scope через
   `codex exec`. Встроенный `spawn_agent` для рабочих роёв этого проекта
   запрещён.
14. Обнови lifecycle через `session-upsert` и `process-upsert`: сначала
   runtime process, затем `running`. Фактическую работу внешнего worker-а
   фиксируй отдельной командой `presence-set`:

   ```bash
   npm --prefix .ai/tools/agent-runtime run runtime -- process-upsert --process-id=<process-id> --session-id=<worker-session-id> --backend=codex_exec --cwd=<repo> --status=running
   npm --prefix .ai/tools/agent-runtime run runtime -- session-upsert --actor-role=dialog_assistant --session-id=<worker-session-id> --worker-kind=external_process --role=<role> --status=running --mission="<bounded task>" --assigned-by=dialog-assistant
   npm --prefix .ai/tools/agent-runtime run runtime -- presence-set --session-id=<worker-session-id> --presence-state=working --current-activity="<worker activity>"
   ```
15. Poll/wait до результата, blocker или stop condition.
   User-visible worker updates, handoff summaries и tool summaries записывай
   только как JSONL events в `messages_path`; не сохраняй raw private
   reasoning, hidden chain-of-thought, secrets, tokens, production dumps или
   raw tool transcripts с чувствительными данными. Не сохраняй PII beyond task
   need, включая частичные или одиночные PII fragments, если они не нужны для
   конкретного worker-session event.
   Если worker фактически работает, фиксируй presence как `working`; если ждёт
   ответ peer/dialog_assistant-а - `waiting`; после bounded handoff/result-ready -
   `idle`; при закрытии - `offline`. `status: running` не является признаком
   active state.
   Если worker-у нужен другой worker, review, решение Dialog Assistant-а или он
   готов/заблокирован, он создаёт notification вместо ожидания ручного обхода.
   Для delivery notifications используется portable Node/npm adapter. Для
   `result_ready`, `blocked`, `needs_review` и `handoff`
   `--actor-session-id` обязателен и должен совпадать с
   `--source-session-id` worker-а:

   ```bash
   npm --prefix .ai/tools/agent-runtime run runtime -- notification-create --source-session-id=<worker-session-id> --actor-session-id=<worker-session-id> --target-role=dialog_assistant --notification-type=result_ready --summary="<short result summary>"
   npm --prefix .ai/tools/agent-runtime run runtime -- notification-create --source-session-id=<worker-session-id> --actor-session-id=<worker-session-id> --target-role=dialog_assistant --notification-type=blocked --summary="<short blocker summary>"
   npm --prefix .ai/tools/agent-runtime run runtime -- notification-create --source-session-id=<worker-session-id> --actor-session-id=<worker-session-id> --target-role=dialog_assistant --notification-type=needs_review --summary="<short review request summary>"
   npm --prefix .ai/tools/agent-runtime run runtime -- notification-create --source-session-id=<worker-session-id> --actor-session-id=<worker-session-id> --target-role=dialog_assistant --notification-type=handoff --summary="<short handoff summary>"
   ```

   Типы notification:
   `result_ready`, `blocked`, `needs_review`, `request_link`,
   `request_worker`, `scope_conflict` или `handoff`.
   Node/SQLite runtime writer является единственным writer для session
   lifecycle и delivery result notifications.
   Если worker пишет другому worker-у напрямую, peer message contract обязан
   содержать:
   `job_id`, `correlation_id`, `message_type`, `requires_ack`,
   `source_session_id`, `target_session_id` и `summary`. Пока writer-level
   поле `job_id` для `message-send` не выделено отдельным CLI option,
   `job_id` обязателен в `--payload-json`.
   Нельзя полагаться на defaults `message-send` для job/stage/peer messages:
   `--message-type`, `--correlation-id`, `--requires-ack` и
   `--payload-json` должны быть заданы явно. Сообщение не меняет lifecycle
   чужой session.
   Peer message записывается через `message-send`; получение фиксируется через
   `message-ack`:

   ```bash
   npm --prefix .ai/tools/agent-runtime run runtime -- message-send --source-session-id=<source-worker-session-id> --target-session-id=<target-worker-session-id> --message-type=<peer|stage|handoff|request_review> --correlation-id=<job-or-stage-correlation-id> --requires-ack=true --summary="<short peer message summary>" --payload-json='{"job_id":"<job-id>"}'
   npm --prefix .ai/tools/agent-runtime run runtime -- message-ack --message-id=<message-id> --session-id=<target-worker-session-id> --summary="<short ack summary>"
   ```
16. Во время ожидания не дублируй в user-facing диалог runtime writer command,
    full snapshot/log output, peer messages или полный worker result. В диалог
    выводятся только blocker/approval request или major stage summary.
17. После завершения внешнего worker-а зафиксируй операционный
    `status: result-ready` через `session-upsert`, создай `result_ready`
    notification или согласованный result artifact и переведи presence в `idle`.
18. Проверь output и diff:
    - соответствие allowed_paths;
    - отсутствие forbidden_paths;
    - отсутствие secrets;
    - отсутствие raw private reasoning/chain-of-thought и production dumps в
      messages trace;
    - отсутствие PII beyond task need в messages trace;
    - валидность `messages_path`, если он указан: JSONL, совпадающий
      `session_id`, допустимый `event_type`;
    - отсутствие commit/push/task close;
    - result source совпадает с assignee session, а не с Dialog Assistant;
    - качество результата и применимость к текущему шагу.
19. Переведи сессию в операционный `status: needs-review`.
20. Перед финальным ответом проверь runtime store/projection, прими решение по
    каждой session со статусом `running`, `result-ready`, `needs-review` или
    `blocked` и запиши допустимую резолюцию через runtime writer:
    `accepted`, `reassigned`, `continued`, `blocked-with-reason`, `closed` или
    `user-approved-deferral`.
    Также проверь notifications: unread high/urgent или `result_ready`,
    `blocked`, `needs_review`, `scope_conflict`, `handoff` должны быть
    acknowledged/resolved Dialog Assistant-ом до handoff.
21. Если резолюция оставляет сессию активной, запиши обязательный контрактный
    объект:
    - `continued` -> `continuation_contract`;
    - `reassigned` -> `reassignment_contract`;
    - `user-approved-deferral` -> `deferral_contract`;
    - `blocked-with-reason` при `status: blocked` -> `blocker_contract`.
22. Если результат слабый, выдай следующее задание тому же worker-у
    (`resolution: continued`) или другому worker-у
    (`resolution: reassigned`) только внутри scope и только с контрактным
    объектом.
23. Если `handoff_required` равно `true`, контракт незавершающей резолюции
    должен содержать `handoff_allowed: true`, иначе финальная передача
    результата запрещена.
24. Если сессия resolved/closed, перед финальной передачей результата запиши
    `status: closed`, terminal `resolution` и presence `offline` через
    `session-upsert` и `presence-set`. Совместимая projection не должна
    показывать такую сессию как active.
25. Перед возвратом к обычному диалогу обязательно отправь пользователю в
    текущий диалог compact `final_handoff_summary`: result, changed paths,
    checks, residual risks/blockers и next step. Runtime `group-close`,
    monitor status или `final_result` notification не заменяют это сообщение.
26. После отправки user-facing final report закрой `dialog-assistant`: запиши
    terminal decision через runtime writer и presence `offline`. Он не должен
    оставаться активным после финального ответа.
27. Только после этого запусти no-abandoned check по
    `CHECK-WORKER-SESSION-LIFECYCLE-BEFORE-HANDOFF.md`.
28. Если пользователь явно просил проверить runtime, текущий шаг менял
    runtime/monitor tooling или Dialog Assistant решил закрыть maintenance как
    отдельный согласованный шаг, выполни `agent-runtime-maintenance` workflow и
    `CHECK-AGENT-RUNTIME-MAINTENANCE-REPORT.md`. Если workflow применён,
    сформируй machine-readable report через `maintenance-report-write` и
    включи `maintenance_history_path` в handoff. Если workflow запрошен, но
    пропущен по допустимому исключению, зафиксируй `skip_reason`.
29. В handoff явно укажи только compact summary, changed paths, checks,
    residual risks и есть ли messages trace/artifact. Не копируй full worker
    output, full command logs или runtime lifecycle trace в user-facing ответ.
30. Если старому потребителю нужен JSON registry, создай projection через:

    ```bash
    npm --prefix .ai/tools/agent-runtime run runtime -- projection-export --database=.ai/tools/agent-runtime/runtime/runtime.sqlite --output-root=<path>
    ```

    Для новых запусков worker-ов запрещено вручную править
    `.ai/tools/agent-runtime/runtime/worker-sessions/current-sessions.json`, кроме аварийного
    legacy-fallback с явной пометкой причины.

## Автономный режим

В `autonomous_step` и `autonomous_group` Dialog Assistant может без дополнительного
подтверждения пользователя:

- launch workers;
- poll/wait;
- collect outputs;
- review diff;
- accept/reassign/continue/close sessions;
- issue next worker task inside scope.

Active autonomous grant не является резолюцией и не является условием
прохождения проверки. Он только разрешает Dialog Assistant принять и записать
резолюцию без нового подтверждения пользователя внутри grant `scope`.

Grant также не заменяет `continuation_contract`, `reassignment_contract`,
`deferral_contract` или `blocker_contract`.

Даже в autonomous mode запрещены:

- commit/push;
- task close;
- destructive commands;
- secrets access;
- allowlist/contour expansion;
- out-of-scope writes.
- выполнение delegated worker job вне выданного assignment.
- direct final result worker -> Dialog Assistant.

## Вывод

В финальном ответе Dialog Assistant указывает:

- какие worker-сессии были запущены;
- где лежат messages traces по сессиям или почему они отсутствуют;
- какие notifications были acknowledged/resolved;
- были ли peer messages, требующие ack, и остались ли blocking messages;
- применялся ли agent-runtime maintenance workflow, какой mode/skip reason и
  какой active rows report получен;
- где лежит maintenance history report, если policy применялась;
- какие результаты приняты;
- какие сессии reassigned, continued, blocked-with-reason, closed или
  user-approved-deferral;
- что проверено по diff;
- что осталось риском или blocker.

Этот финальный ответ обязателен после terminal group decision. Если worker group
закрыта в runtime, но user-facing final report не отправлен в текущий диалог,
handoff считается незавершённым.
