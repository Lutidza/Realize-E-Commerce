# Правило: worker assignment manifest (`RULE-WORKER-ASSIGNMENT-MANIFEST`)

```yaml
artifact_id: RULE-WORKER-ASSIGNMENT-MANIFEST
artifact_type: ai-runtime-rule
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/rules/worker-runtime/
related_workflows:
  - .ai/workflows/core/worker-assignment/WORKFLOW.md
checks:
  - .ai/checks/worker-runtime/CHECK-WORKER-ASSIGNMENT-SCOPE.md
  - .ai/checks/worker-runtime/CHECK-WORKER-PROFILE-REFERENCES.md
  - .ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md
  - .ai/checks/worker-runtime/CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE.md
  - .ai/checks/worker-runtime/CHECK-WORKER-DIALOG-SURFACE-BUDGET.md
  - .ai/checks/worker-runtime/CHECK-WORKER-HANDOFF-READY.md
```

## Назначение (`purpose`)

Каждый запуск worker-а через `codex exec` должен иметь task-specific
`assignment manifest`, который становится source of truth для конкретного запуска:
mission, profile binding, allowlist, write scope, expected output и handoff chain.

`profile` не является source of truth конкретного запуска и не даёт разрешения на
переопределение scope.

## Обязательные требования (`requirements`)

До запуска Dialog Assistant обязан зафиксировать manifest с минимумом полей:

- `manifest_id`, `manifest_version`;
- `task_id`, `session_id`, `job_id`;
- `profile_id`, `profile_revision`, `role`;
- `contour_owner`, `owner_layer`;
- `source_of_truth`;
- `mission`, `stop_condition`, `expected_output`;
- `allowed_paths`, `forbidden_paths`, `create_paths`, `edit_paths`,
  `delete_paths`;
- `context_budget`, `context_estimate`, `context_decision`;
- `model`, `model_justification`;
- `rules`, `checks`, `workflows`, `skills`;
- `result_path`, `handoff_target`, `coordinator_chain`;
- `repository_search_worker_session_id`, если задача требует repository search
  или manifest содержит `search_required=true`;
- `peer_evidence_chain`: expected runtime message/edge chain
  `search-worker -> implementer/coordinator -> reviewer -> coordinator -> Dialog Assistant`;
- `coordinator_session_id`, если используется worker group; значение не может
  быть `dialog-assistant`;
- `monitor_visibility_plan`: gateway check, planned session ids, group ids,
  expected snapshot evidence, presence state и post-launch execution handle
  recording;
- `dialog_surface_budget_plan`: `dialog_surface_mode`, allowed user-facing
  events, runtime/detail sink и запрет full worker/tool/runtime dump в диалог;
- `result_visibility` и `safety_note`.

Для group/staged execution (когда `worker_groups` не пустой) обязательны
дополнительные поля:

- `worker_groups`, `launch_stages`;
- `peer_communication_edges`;
- `group_closer_worker_id`;
- `coordinator_session_id`;
- `returns_to: owner_dialog_assistant_session_id`;
- `acceptance_evidence_plan` (какой evidence фиксируется до `final_result`).

## Проверки на уровне запуска (`pre_launch_gates`)

1. Проверить обязательные поля manifest в `pre-launch` блоке.
2. Убедиться, что mission и owner-layer не противоречат правилам целевой
   роли и профиля.
3. Проверить `allowed/forbidden` пути и отсутствие расширения scope относительно
   профиля без отдельного `scope_narrowing` решения.
4. Для group/staged execution проверить валидность closure chain:
   `peer_communication_edges`, `group_closer_worker_id`, `returns_to`.
5. Проверить, что coordinator является отдельной worker-session, а не
   `dialog-assistant`.
6. Если `search_required=true`, проверить обязательный
   `repository_search_worker_session_id`, отдельный `repository-search-worker`
   и его evidence route в manifest.
7. Проверить peer evidence chain через runtime messages/edges.
8. Проверить `monitor_visibility_plan` через
   `CHECK-WORKER-MONITOR-VISIBILITY` до фактического запуска.
9. Если worker запускается как внешний процесс, проверить `codex exec` bridge
   через `CHECK-CODEX-EXEC-WORKER-RUNTIME-BRIDGE`.
10. Проверить `dialog_surface_budget_plan` через
   `CHECK-WORKER-DIALOG-SURFACE-BUDGET`.
11. Проверить наличие `handoff_ready_evidence` или причины блокировки.

## Ограничения (`forbidden`)

- Нельзя запускать worker без manifest.
- Нельзя запускать worker без monitor-visible planned session/group state.
- Нельзя использовать `spawn_agent` для рабочих роёв этого проекта.
- Нельзя запускать `codex exec` worker без runtime bridge и
  `worker-launch-preflight pass`.
- Нельзя запускать worker group без отдельной coordinator worker-session.
- Нельзя запускать worker group, если `coordinator_session_id` отсутствует или
  `coordinator_session_id=dialog-assistant`.
- Нельзя выполнять repository search в Dialog Assistant или implementer session.
- Нельзя продолжать chain при `search_required=true` без
  `repository_search_worker_session_id`.
- Нельзя передавать evidence вне обязательной peer evidence chain.
- Нельзя использовать user-facing диалог как full lifecycle/tool/worker trace.
- Нельзя использовать `documentation/project/specs/**` как runtime dependency.
- Нельзя передавать произвольный runtime-лог или raw private reasoning в
  `result_path` без сокращения.
- Нельзя делать scope expansion через путь worker-а.

## Выход (`output`)

```text
assignment_manifest_ready: yes|no
manifest_id: <id>
scope_validation: pass|fail
handoff_ready_evidence: <true|false>
group_manifest_validation: pass|fail|not_applicable
returns_to_validation: pass|fail|not_applicable
coordinator_session_validation: pass|fail|not_applicable
repository_search_worker_validation: pass|fail|not_required
peer_evidence_chain_validation: pass|fail
monitor_visibility_plan: pass|fail
codex_exec_worker_runtime_bridge: pass|fail|not_applicable
dialog_surface_budget_plan: pass|fail
```
