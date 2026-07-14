# Проверка: assignment scope и manifest целостность (`CHECK-WORKER-ASSIGNMENT-SCOPE`)

```yaml
check_id: CHECK-WORKER-ASSIGNMENT-SCOPE
artifact_type: ai-runtime-check
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/checks/worker-runtime/
related_rule: .ai/rules/worker-runtime/RULE-WORKER-ASSIGNMENT-MANIFEST.md
```

## Назначение (`purpose`)

Проверка закрывает инварианты manifest scope и предотвращает hidden scope expansion.

## Процедура (`procedure`)

1. Проверить обязательные секции manifest:
   `allowed_paths`, `forbidden_paths`, `create_paths`, `edit_paths`, `delete_paths`.
2. Проверить отсутствие перекрытий:
   `allowed_paths ∩ forbidden_paths == ∅`.
3. Проверить `delete_paths` только при явной метке `delete_authorized=true`.
4. Проверить что `documentation/project/specs/**` не находится в create/edit/delete.
5. Проверить, что scope находится в пределах target owner-layer и не выходит за
   профильную верхнюю границу без pre-launch override.
6. Проверить наличие `scope_override_reason` только если есть explicit approval.
7. Если `worker_groups` не пустой, проверить обязательные group-поля:
   `launch_stages`, `peer_communication_edges`, `group_closer_worker_id`,
   `returns_to`.
8. Для group/staged chain проверить `returns_to` =
   `owner_dialog_assistant_session_id`.

## Критерии pass (`pass_criteria`)

- Все обязательные поля заполнены.
- Есть явный scope decision (`direct`/`narrowed`/`split`).
- Нету path-пересечений и запрещённых wildcard.
- `context_budget` привязан к scope.
- Для group/staged chain заполнены group closure-поля и peer edges.

## Критерии fail (`fail_criteria`)

- Отсутствуют required paths.
- В manifest есть расширение scope без согласованного override.
- `delete_paths` указаны без `delete_authorized`.
- Есть `documentation/**` в create/edit/delete или forbidden path mismatch.
- Есть `worker_groups`, но отсутствуют `peer_communication_edges`,
  `group_closer_worker_id` или `returns_to`.
- `returns_to` не равен `owner_dialog_assistant_session_id` при group chain.

## Вывод (`output`)

```text
scope_integrity: pass|fail
scope_narrowed: true|false
scope_matches_profile: true|false
forbidden_path_conflicts: <count>
delete_permission_ok: true|false
group_manifest_fields_ok: true|false|not_applicable
group_returns_to_ok: true|false|not_applicable
```
