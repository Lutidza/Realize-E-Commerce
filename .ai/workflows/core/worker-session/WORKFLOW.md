# Workflow: worker session (`worker_session_workflow`)

```yaml
artifact_id: worker-session-workflow
artifact_type: ai-workflow
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/workflows/core/worker-session/
runtime_store: .ai/tools/agent-runtime/runtime/runtime.sqlite
runtime_writer: .ai/tools/agent-runtime/bin/agent-runtime.mjs
related_artifacts:
  - .ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md
  - .ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md
  - .ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md
  - .ai/checks/worker-runtime/CHECK-WORKER-DIALOG-SURFACE-BUDGET.md
  - .ai/checks/worker-runtime/CHECK-WORKER-HANDOFF-READY.md
```

## Назначение (`purpose`)

Workflow описывает lifecycle worker-сессии для single-worker и group/staged
исполнения с обязательным возвратом результата в Dialog Assistant.

Каждый worker, reviewer, `repository-search-worker` и group coordinator всегда
создаётся как отдельная runtime session. Group coordinator не может быть
`dialog-assistant`; `coordinator_session_id != dialog-assistant`.

## Статусы (`statuses`)

```text
planned
launched
running
result-ready
needs-review
blocked
closed
```

## Presence (`presence`)

```text
offline
idle
working
waiting
stale
```

`status` показывает lifecycle, `presence` показывает фактическую активность в
интерфейсе.

## Group lifecycle contract (`group_contract`)

Для group/staged path runtime metadata обязана содержать:

```text
worker_groups
launch_stages
peer_communication_edges
repository_search_worker_session_id
coordinator_session_id
group_closer_worker_id
returns_to: owner_dialog_assistant_session_id
dialog_assistant_review_acceptance_gate
dialog_surface_mode: compact
```

Для `single_worker` path эти поля обязательны в нормализованном виде через
defaults (`worker_groups=[default]`, `launch_stages=[single_stage]`,
`peer_communication_edges=[]`, `group_closer_worker_id=<worker_id>`).

## Group gates (`group_gates`)

```text
group_manifest_gate
monitor_visibility_gate
launch_stage_gate
peer_edge_gate
repository_search_worker_gate
group_closer_gate
returns_to_gate
dialog_assistant_acceptance_gate
final_handoff_no_running_working_gate
```

`group_manifest_gate` является hard-fail gate для staged chain без `returns_to`
и acceptance gate.

## Последовательность (`sequence`)

1. Dialog Assistant создаёт bounded worker plan.
2. Runtime writer создаёт `planned` и проходит `group_manifest_gate`.
3. Если нужен repository search, запускается отдельный
   `repository-search-worker`; Dialog Assistant и implementer не выполняют
   repository search напрямую.
4. Для worker group создаётся отдельная coordinator worker-session.
5. Перед фактическим запуском worker-а или stage проходит
   `monitor_visibility_gate`: planned sessions, group records, members, edges и
   presence должны быть видны через agent-runtime gateway; monitor/gateway при
   этом только переиспользуются на фиксированных URL и не запускаются заново.
6. Перед каждым запуском stage проходит `launch_stage_gate`.
7. После фактического запуска фиксируется `launched` или `running`, execution
   handle и `presence_state=working`.
8. Peer communication идёт только по `peer_communication_edges` после
   `peer_edge_gate`.
9. Search evidence идёт через runtime message/edge от search-worker к
   implementer/coordinator.
10. Implementer evidence идёт reviewer-у, reviewer evidence идёт coordinator-у,
   coordinator handoff идёт Dialog Assistant-у.
11. Dialog Assistant держит user-facing диалог в compact mode; подробный trace
   уходит в runtime/monitor.
12. `group_closer_worker_id` собирает group result и переводит chain в
   `result-ready` (без final acceptance).
13. Dialog Assistant проходит `returns_to_gate` и review/acceptance gate.
14. Перед final handoff проходит
   `final_handoff_no_running_working_gate`: count `running`/`working` sessions
   по `dialog-assistant`, coordinator и workers должен быть `0`.
15. Сессия закрывается как `closed` или остаётся `needs-review`/`blocked` с
   причиной.

## Сообщения (`messages`)

- Worker публикует runtime-visible summary/blocker/result-ready events.
- Peer worker messages разрешены только по `peer_communication_edges`.
- Repository search evidence публикует только `repository-search-worker`.
- Обязательная peer evidence chain:
  `search-worker -> implementer/coordinator`,
  `implementer -> reviewer`,
  `reviewer -> coordinator`,
  `coordinator -> Dialog Assistant`.
- Raw private reasoning, secrets и full transcripts не пишутся в user-visible
  artifacts.
- Dialog Assistant не переносит full runtime trace в текущий чат. В диалог
  допускаются только group start summary, blocker/approval request, редкий
  major stage summary и final handoff summary.
- Full worker output должен быть сжат до vetted summary или сохранён в
  разрешённый artifact/runtime result.

## Видимость в monitor (`monitor_visibility`)

Запуск worker-а не считается допустимым, пока runtime contract и heartbeat freshness
не подтверждают видимость будущего runtime node.

Worker session workflow не управляет lifecycle monitor/gateway. Проверка
видимости работает в режиме `reuse_existing_only` через runtime tool
`worker-launch-preflight`. HTTP `/health` и `/snapshot` внутри tool output
являются диагностикой; gate принимает JSON pass/fail результата команды.

Минимальный порядок:

1. `session-upsert` для `dialog-assistant`, если он управляет worker-ами.
2. `session-upsert status=planned` для каждого worker-а, включая
   `repository-search-worker`, reviewer и coordinator.
3. `group-upsert`, `group-member-upsert`, `group-edge-upsert` для группы.
4. `presence-set` для planned/waiting state до запуска.
5. Выполнить:
   `npm --prefix .ai/tools/agent-runtime run runtime -- worker-launch-preflight --session-id=<session-id> --group-id=<group-id> --json`.
6. Если `pass=false`, остановить запуск с первым `blocker` из JSON результата.
7. Выполнить `CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE`.
8. Фактический запуск worker-а выполняется только через `codex exec`.
9. После запуска записать `process-upsert`, `session-upsert status=running` и
   `presence_state=working`.

`spawn_agent` и legacy delegated bridge запрещены для рабочих роёв и
документалистов этого проекта. Если preflight, bridge check или post-launch
process tracking невозможны, workflow переходит в `blocked` с причиной из
runtime tool output.

## Передача результата (`handoff`)

Перед финальным handoff не должно быть незакрытых `running`, `result-ready`,
`needs-review` или `blocked` sessions без решения: принять, вернуть в работу,
заблокировать с причиной или отложить по пользовательскому разрешению.
`result-ready` не заменяет Dialog Assistant acceptance evidence.

Final handoff hard-fail, если любая `dialog-assistant`, coordinator или worker
session имеет `status: running` или `presence_state=working`.

Runtime closure не является user-facing delivery. После terminal group decision
Dialog Assistant обязан отправить compact `final_handoff_summary` в текущий
диалог, затем уже закрывать собственную `dialog-assistant` session/presence.
`group-close`, `final_result` notification и monitor event являются evidence, но
не заменяют сообщение пользователю.
