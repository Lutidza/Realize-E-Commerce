# Workflow: worker assignment (`worker-assignment-workflow`)

```yaml
artifact_id: worker-assignment-workflow
artifact_type: ai-workflow
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/workflows/core/worker-assignment/
runtime_sources:
  - .ai/workflows/core/worker-session/WORKFLOW.md
related_rules:
  - .ai/rules/worker-runtime/RULE-WORKER-DIALOG-COORDINATION.md
  - .ai/rules/worker-runtime/RULE-WORKER-MODEL-SELECTION.md
  - .ai/rules/worker-runtime/RULE-WORKER-CONTEXT-BUDGET-AND-REUSE.md
  - .ai/rules/worker-runtime/RULE-WORKER-ASSIGNMENT-MANIFEST.md
  - .ai/rules/worker-runtime/RULE-WORKER-NO-SCOPE-EXPANSION.md
  - .ai/rules/worker-runtime/RULE-WORKER-HANDOFF-CONTRACT.md
related_checks:
  - .ai/checks/worker-runtime/CHECK-WORKER-PROFILE-REFERENCES.md
  - .ai/checks/worker-runtime/CHECK-WORKER-ASSIGNMENT-SCOPE.md
  - .ai/checks/worker-runtime/CHECK-WORKER-MODEL-SELECTION.md
  - .ai/checks/worker-runtime/CHECK-WORKER-CONTEXT-BUDGET-REUSE.md
  - .ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md
  - .ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md
  - .ai/checks/worker-runtime/CHECK-WORKER-DIALOG-SURFACE-BUDGET.md
  - .ai/checks/worker-runtime/CHECK-WORKER-HANDOFF-READY.md
```

## Назначение (`purpose`)

Workflow описывает управляемую цепочку назначения worker-а через task-bound
`assignment manifest` с явной модельной, контекстной и handoff контрактной
проверкой для single-worker и multi-worker/staged group path.

## Состояния (`states`)

```text
task_intake
-> direct_execution_policy_gate
-> repository_search_worker_gate
-> profile_selection
-> complexity_model_selection
-> context_budget_reuse_or_spawn
-> scope_narrowing
-> assignment_manifest_build
-> assignment_topology_gate
-> group_assignment_manifest_gate
-> pre_launch_gate
-> monitor_visibility_gate
-> dialog_surface_budget_gate
-> launch_stage_orchestration
-> progress_reporting
-> group_closer_gate
-> result_handoff_check
-> returns_to_dialog_assistant_gate
-> coordinator_review
-> dialog_assistant_acceptance_gate
-> final_handoff_no_running_working_gate
-> dialog_assistant_handoff
```

## State: task_intake

Вход: пользовательская задача.

Шаги:

1. Зафиксировать `task_intent`, `allowlist`, `owner_layer`.
2. Определить предполагаемый owner-role и профиль-кандидатов.
3. Определить начальный risk tier для дальнейшего выбора модели.

Переход:

- В `direct_execution_policy_gate` при прямом режимe.
- В `profile_selection` по умолчанию (default координационный режим).

## State: direct_execution_policy_gate

Шлюз по умолчанию блокирует прямую реализацию задачи assistant-ом.

Шаги:

1. Проверить explicit flag пользователя `user_authorized_direct_execution`.
2. Если `true` и задача явно non-worker или read-only → proceed directly.
3. Иначе перейти в worker chain.
4. Если пользователь запросил worker group, direct implementation/search
   Dialog Assistant-ом запрещены независимо от read-only характера поиска.

## State: repository_search_worker_gate

Шаги:

1. Если задаче нужен repository search, создать отдельную
   `repository-search-worker` runtime session.
2. Запретить Dialog Assistant, implementer и reviewer выполнять repository
   search вместо search-worker-а.
3. Зафиксировать `search_required=true` и обязательный
   `repository_search_worker_session_id`.
4. Зафиксировать runtime evidence route:
   `search-worker -> implementer/coordinator`.
5. Если search-worker или `repository_search_worker_session_id` отсутствует
   при требуемом search, остановить chain как `hard_validation_fail`.

## State: profile_selection

Шаги:

1. Выбрать profile по `owner_layer` и задачи.
2. Проверить профиль через `CHECK-WORKER-PROFILE-REFERENCES`.
3. Зафиксировать `profile_id`, `profile_revision`, `role`.

## State: complexity_model_selection

Шаги:

1. Классифицировать задачу как simple/standard/complex.
2. Применить `RULE-WORKER-MODEL-SELECTION`.
3. Зафиксировать выбор в manifest draft:
   `model`, `selection_rationale`.
4. Запустить `CHECK-WORKER-MODEL-SELECTION`.

## State: context_budget_reuse_or_spawn

Шаги:

1. Проверить контекстную ёмкость активных worker session (если есть).
2. Применить критерии из `RULE-WORKER-CONTEXT-BUDGET-AND-REUSE`.
3. Зафиксировать `reuse_or_spawn`, `context_decision`.
4. Hard-fail, если reuse/spawn смешивает search, implementation, review или
   coordinator roles в одной session.
5. Запустить `CHECK-WORKER-CONTEXT-BUDGET-REUSE`.

## State: scope_narrowing

Шаги:

1. Нормализовать `allowed_paths`/`forbidden_paths` для bounded запуска.
2. Закрыть запись в unrelated paths из профиля.
3. Убедиться, что `documentation/project/specs/**` не попадает в runtime write scope.
4. Зафиксировать `scope_narrowed=true`.

Переход:

- Если scope конфликтует → `scope_delta_required=true` и return к `task_intake` с уточнением.
- Иначе в `assignment_manifest_build`.

## State: assignment_manifest_build

Шаги:

1. Сформировать manifest на основе шаблона.
2. Заполнить обязательные поля (source_of_truth, owner-layer, mission, scope,
   model, checks, rules, workflows, expected output, handoff path).
3. Зафиксировать coordinator chain и handoff target.
4. Для worker group зафиксировать `coordinator_session_id` как отдельную
   worker-session, отличную от `dialog-assistant`.
5. Зафиксировать peer evidence chain:
   `search-worker -> implementer/coordinator`,
   `implementer -> reviewer`,
   `reviewer -> coordinator`,
   `coordinator -> Dialog Assistant`.
6. Запустить `CHECK-WORKER-ASSIGNMENT-SCOPE` и
   `CHECK-WORKER-PROFILE-REFERENCES`.

## State: assignment_topology_gate

Шаги:

1. Явно выбрать `assignment_mode`:
   - `single_worker`;
   - `multi_worker_staged`.
2. Для `single_worker` зафиксировать нормализованные defaults:
   - `worker_groups=[default]`;
   - `launch_stages=[single_stage]`;
   - `group_closer_worker_id=<single_worker_id>`;
   - `peer_communication_edges=[]`.
3. Для `multi_worker_staged` зафиксировать `worker_groups`, `launch_stages`,
   `peer_communication_edges`, `group_closer_worker_id`,
   `coordinator_session_id`.
4. Если topology не определена однозначно — вернуть в `task_intake`.

## State: group_assignment_manifest_gate

Шаги:

1. Проверить обязательные group lifecycle поля manifest:
   - `worker_groups`;
   - `launch_stages`;
   - `peer_communication_edges`;
   - `group_closer_worker_id`;
   - `coordinator_session_id`, отличный от `dialog-assistant`;
   - `returns_to: owner_dialog_assistant_session_id`;
   - `dialog_assistant_review_acceptance_gate`.
2. Проверить, что `peer_communication_edges` не обходят coordinator closure и
   не создают route к user channel.
3. Проверить, что `group_closer_worker_id` принадлежит `worker_groups`.
4. При fail — `hard_validation_fail`, возврат в `assignment_manifest_build`.

## State: pre_launch_gate

Шаги:

1. Проверить:
   - assignment scope check = pass;
   - model check = pass;
   - context check = pass;
   - profile references check = pass.
2. Проверить запреты runtime: no-scope-expansion, no direct worker bypass.
3. Для `multi_worker_staged` проверить launch readiness по stage dependencies.
4. Проверить, что planned runtime rows можно создать до фактического запуска.
5. Только после pass продолжать.

Переход:

- `monitor_visibility_gate` при pass.
- `task_intake` при fail (только после уточнения/approve).

## State: monitor_visibility_gate

Шаги:

1. Применить `CHECK-WORKER-MONITOR-VISIBILITY`.
2. Запретить запуск/перезапуск/stop monitor/gateway как часть launch шага
   (`reuse_existing_only`).
3. Если operator отдельно запускал monitor/gateway и получил `EADDRINUSE`, это
   `candidate_reuse`; workflow должен использовать существующий сервис, без смены
   порта и без restart.
4. Создать runtime-visible `dialog-assistant` session для coordination step.
5. Создать planned sessions для всех worker-ов текущего launch stage.
6. Для group/staged execution создать group record, members и edges до запуска.
7. Записать presence state до запуска.
8. Выполнить deterministic preflight:
   `npm --prefix .ai/tools/agent-runtime run runtime -- worker-launch-preflight --session-id=<session-id> --group-id=<group-id> --json`.
9. Проверить pass/fail только по output `worker-launch-preflight`; HTTP
   `/health` и `/snapshot` внутри команды являются диагностикой, а не ручным
   shell/curl gate.
10. Заблокировать фактический `codex exec`, если runtime check не подтверждает
   видимость.
11. Если `worker-launch-preflight.pass=false`, перейти в `blocked` с первым
   blocker code из JSON результата.

Переход:

- `dialog_surface_budget_gate` при `worker_monitor_visibility_check=pass`.
- `blocked` с `monitor_visibility_unavailable` при fail.

## State: dialog_surface_budget_gate

Шаги:

1. Применить `CHECK-WORKER-DIALOG-SURFACE-BUDGET`.
2. Зафиксировать `dialog_surface_mode=compact` по умолчанию.
3. Разрешить в user-facing диалог только:
   - стартовый summary группы/stage;
   - blocker или approval request;
   - редкий major stage summary;
   - final handoff summary.
4. Указать runtime sink для подробностей: `agent-runtime` events, monitor,
   worker result artifact или repo artifact в allowlist.
5. Добавить в worker prompts запрет на длинный final dump в user-facing канал.

Переход:

- `launch_stage_orchestration` при `worker_dialog_surface_budget_check=pass`.
- `assignment_manifest_build` при fail.

## State: launch_stage_orchestration

Шаги:

1. Выполнить launch по `launch_stages`:
   - `single_worker`: один запуск;
   - `multi_worker_staged`: stage-by-stage с gate перед следующим stage.
2. Для каждого запуска применить manifest-defined backend `codex_exec`.
3. Указать expected notification target и result contract.
4. Перед запуском выполнить `CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE`.
5. Сразу после фактического запуска записать `process-upsert` с
   `backend=codex_exec` и process handle.
6. Перевести session/member в active/running и поставить
   `presence_state=working`.

## State: progress_reporting

Шаги:

1. Проверить промежуточные уведомления worker-а через runtime/monitor, не
   перенося полный trace в user-facing диалог.
2. При blocker/stop reason завершить как `needs-review`.
3. Для group path принимать peer updates только по `peer_communication_edges`.
4. Проверить обязательную evidence chain:
   `search-worker -> implementer/coordinator`,
   `implementer -> reviewer`,
   `reviewer -> coordinator`,
   `coordinator -> Dialog Assistant`.
5. В диалог писать только blocker/approval request или major stage summary.
6. Иначе ждать `result_ready`.

## State: group_closer_gate

Шаги:

1. Для `multi_worker_staged` дождаться group close от `group_closer_worker_id`.
2. Проверить, что closer агрегировал stage outputs без подмены acceptance.
3. Для `single_worker` использовать worker как implicit closer.
4. Зафиксировать `group_closure_ready=true|false`.

Переход:

- `result_handoff_check` при `group_closure_ready=true`.
- `coordinator_review` при blocker/ambiguous closure.

## State: result_handoff_check

Шаги:

1. Применить `CHECK-WORKER-HANDOFF-READY`.
2. Проверить соответствие `RULE-WORKER-HANDOFF-CONTRACT`.
3. Зафиксировать `handoff_ready=true|false`.

## State: returns_to_dialog_assistant_gate

Шаги:

1. Проверить `returns_to: owner_dialog_assistant_session_id`.
2. Проверить, что final route результата направлен только в Dialog Assistant.
3. При нарушении зафиксировать `handoff_ready=false` и вернуть в
   `assignment_manifest_build`/`coordinator_review`.

## State: coordinator_review

Шаги:

1. Dialog Assistant review artifact, risk summary, scope/safety deltas.
   Review не заменяет отдельный coordinator worker-session для worker group.
2. Решение:
   - `accepted` → `dialog_assistant_acceptance_gate`;
   - `needs-review`/`blocked` → возврат к `task_intake` или остановка.

## State: dialog_assistant_acceptance_gate

Шаги:

1. Dialog Assistant фиксирует `acceptance_evidence`.
2. Проверить, что `result_ready` не интерпретирован как final acceptance.
3. Только после acceptance evidence разрешить финальный handoff.

## State: final_handoff_no_running_working_gate

Шаги:

1. Применить `CHECK-WORKER-SESSION-LIFECYCLE-BEFORE-HANDOFF`.
2. Проверить все `dialog-assistant`, coordinator и worker sessions.
3. Если любая session имеет `status=running` или `presence_state=working`,
   зафиксировать hard-fail и не выполнять final handoff.

Переход:

- `dialog_assistant_handoff` только при count `running`/`working` sessions = `0`.
- `coordinator_review` или lifecycle resolution при fail.

## State: dialog_assistant_handoff

Шаги:

1. Промежуточный или финальный handoff только после `coordinator_review=accepted`.
2. Финальный handoff только после `dialog_assistant_acceptance_gate=pass`.
3. Финальный handoff только после
   `final_handoff_no_running_working_gate=pass`.
4. Создать runtime trace `final_result` notification или equivalent event с
   safe summary, если workflow использует runtime notification trail.
5. Отправить в текущий user-facing диалог обязательный compact
   `final_handoff_summary`. Runtime `group-close`, monitor status и
   `final_result` notification не заменяют это сообщение пользователю.
6. Только после отправки user-facing summary закрывать `dialog-assistant`
   session/presence и возвращаться к обычному диалогу.
7. Передать только compact vetted summary, blocker/reason, changed paths,
   checks и residual risks. Не копировать full worker outputs.

Ожидаемый output:

```text
handoff_result: accepted|needs-review|blocked
worker_session_id: <id>
handoff_chain: dialog_assistant
manifest_id: <id>
returns_to: owner_dialog_assistant_session_id
coordinator_session_id: <separate-worker-session-id>
repository_search_worker_session_id: <session-id|not_required>
peer_evidence_chain: complete|incomplete
running_or_working_sessions_before_handoff: <count>
dialog_surface_budget_check: pass|fail|not_required
dialog_final_report_emitted: yes|no
```
