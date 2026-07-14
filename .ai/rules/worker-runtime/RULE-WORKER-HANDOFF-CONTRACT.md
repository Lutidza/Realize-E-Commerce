# Правило: contract handoff chain (`RULE-WORKER-HANDOFF-CONTRACT`)

```yaml
artifact_id: RULE-WORKER-HANDOFF-CONTRACT
artifact_type: ai-runtime-rule
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/rules/worker-runtime/
related_workflows:
  - .ai/workflows/core/worker-assignment/WORKFLOW.md
checks:
  - .ai/checks/worker-runtime/CHECK-WORKER-HANDOFF-READY.md
```

## Назначение (`purpose`)

Зафиксировать единую evidence/handoff chain:
repository-search-worker → implementer/coordinator → reviewer → coordinator →
dialog_assistant → user.

## Обязательная схема handoff chain (`handoff_chain`)

- Repository-search-worker публикует search evidence через runtime messages/edges.
- Implementer публикует bounded result reviewer-у и/или coordinator-у.
- Reviewer публикует review evidence coordinator-у.
- Coordinator как отдельная worker-session агрегирует evidence и передаёт
  vetted result Dialog Assistant-у.
- Dialog Assistant выполняет final review/handoff, но не заменяет coordinator-а.

## Требования (`requirements`)

1. В manifest должен быть `coordinator_chain` с целевым `returns_to`
   и `dialog_assistant`.
2. Coordinator group/session должен быть отдельной runtime session и не может
   совпадать с `dialog-assistant`.
3. Repository search выполняется только отдельным `repository-search-worker`.
4. Любые промежуточные worker-worker exchange допустимы только как внутренний
   operational context и не заменяют chain.
5. Финальный результат для пользователя идёт из Dialog Assistant.
6. Для multi-worker/staged chain обязательно:
   - `returns_to: owner_dialog_assistant_session_id`;
   - `group_closer_worker_id`, который собирает локальный group result;
   - `coordinator_session_id`, который указывает на отдельную worker-session;
   - `peer_communication_edges` как internal bus, без подмены closure chain.
7. До quiet event `final_result` Dialog Assistant фиксирует
   `acceptance_evidence` по групповому результату.
8. Final handoff hard-fail, если любая `dialog-assistant`, coordinator или
   worker session остаётся `running` или `presence_state: working`.

## Условия завершения (`completion_conditions`)

- `scope_finalized`: true
- `manifest_summary`: заполнен
- `result_ready_notification`: создана
- `coordinator_review`: выполнена (`passed`/`needs-review`/`blocked`)
- `acceptance_evidence`: зафиксирован (для group/staged chain)
- `repository_search_worker_evidence`: зафиксирован или `not_required`
- `peer_evidence_chain`: complete
- `running_or_working_sessions`: 0

## Запреты (`forbidden`)

- Не допускается передача `final_result` пользователю прямо от worker-а.
- Не допускается передача результата Dialog Assistant-у в обход reviewer или
  coordinator, если chain содержит reviewer/coordinator.
- Не допускается `result` без проверки `result_path` и `risk_summary`.
- Не допускается group closure без `group_closer_worker_id` и `returns_to`.
- Не допускается `final_result` без `acceptance_evidence` для group chain.
- Не допускается final handoff при любой `running` или `working` session.

## Выход (`output`)

handoff_chain_ok: true|false
coordinator_chain_count: <int>
coordinator_is_separate_worker_session: true|false|not_applicable
repository_search_worker_evidence: true|false|not_required
peer_evidence_chain: complete|incomplete
final_review_state: accepted|needs-review|blocked
acceptance_evidence_present: true|false|not_applicable
returns_to_valid: true|false|not_applicable
running_or_working_sessions_before_handoff: <count>
