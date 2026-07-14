# Проверка: готовность handoff chain (`CHECK-WORKER-HANDOFF-READY`)

```yaml
check_id: CHECK-WORKER-HANDOFF-READY
artifact_type: ai-runtime-check
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/checks/worker-runtime/
related_rules:
  - .ai/rules/worker-runtime/RULE-WORKER-DIALOG-COORDINATION.md
  - .ai/rules/worker-runtime/RULE-WORKER-HANDOFF-CONTRACT.md
```

## Назначение (`purpose`)

Перед `result_handoff_check` и `dialog_assistant_handoff` проверяет,
готова ли цепочка repository-search-worker → implementer/coordinator →
reviewer → coordinator → Dialog Assistant.

## Процедура (`procedure`)

1. Проверить наличие `coordinator_chain` и `returns_to` = `dialog_assistant`.
2. Проверить, что coordinator является отдельной worker-session и не совпадает
   с `dialog-assistant`.
3. Проверить наличие `repository-search-worker` evidence, если задача требовала
   repository search.
4. Проверить peer evidence chain:
   `search-worker -> implementer/coordinator`,
   `implementer -> reviewer`,
   `reviewer -> coordinator`,
   `coordinator -> Dialog Assistant`.
5. Проверить `result_path`, `handoff_target`, `result_visibility`, `risk_summary`.
6. Проверить `result_ready` или `blocked`/`needs-review` notification payload.
7. Проверить, что все обязательные checks по этому manifest имеют pass/fail
   статусы.
8. Проверить, что worker не передал финальный result напрямую пользователю или
   Dialog Assistant-у в обход reviewer/coordinator.
9. Если `worker_groups` не пустой, проверить:
   - `group_closer_worker_id` задан и совпадает с closure-итерацией;
   - `returns_to` = `owner_dialog_assistant_session_id`;
   - `peer_communication_edges` не используются как замена closure chain.
10. Для group/staged chain проверить наличие `acceptance_evidence` до `final_result`.
11. Перед final handoff выполнить hard-fail, если любая `dialog-assistant`,
    coordinator или worker session имеет `status: running` или
    `presence_state: working`.
12. Проверить наличие user-facing final handoff contract: после принятия или
    закрытия группы Dialog Assistant обязан отправить compact
    `final_handoff_summary` в текущий диалог. Runtime `final_result`
    notification является trace/evidence, но не заменяет сообщение
    пользователю.

## Критерии pass (`pass`)

- Координатор цепочки указан и валиден.
- Координатор является отдельной worker-session.
- Repository search evidence получен от отдельного `repository-search-worker`.
- Peer evidence chain полная и доставлена через runtime messages/edges.
- Есть итоговый результат/блокер с короткой рисковой оценкой.
- Канал handoff безопасен (без raw private reasoning).
- `dialog_assistant_review` выполнена или явно отложена по reason.
- Для group/staged chain зафиксирован `acceptance_evidence`.
- Для group/staged chain запланирован и отправляется user-facing compact
  `final_handoff_summary`.

## Критерии fail (`fail`)

- Нет или некорректный coordinator chain.
- Coordinator совпадает с `dialog-assistant`.
- Repository search выполнен не отдельным `repository-search-worker`.
- Нарушена peer evidence chain.
- Нет `result_ready`/`blocked` evidence.
- Нет result summary для handoff.
- Итоговый result ушёл не через Dialog Assistant.
- Любая `dialog-assistant`, coordinator или worker session остаётся
  `running` или `working` перед final handoff.
- Для group chain отсутствует `group_closer_worker_id` или неверный `returns_to`.
- Для group chain отсутствует `acceptance_evidence` перед `final_result`.
- Group chain закрыта в runtime, но user-facing `final_handoff_summary` не
  отправлен в текущий диалог.

## Вывод (`output`)

```text
handoff_chain_ready: pass|fail
coordinator_chain_ok: true|false
coordinator_session_separate: true|false
repository_search_worker_evidence: true|false|not_required
peer_evidence_chain_ok: true|false
result_path_present: true|false
result_ready_evidence: true|false
final_result_route: dialog_assistant|other
running_or_working_sessions_before_handoff: <count>
group_closure_ready: true|false|not_applicable
acceptance_evidence_ready: true|false|not_applicable
dialog_final_report_required: true|false
dialog_final_report_emitted: true|false
```
