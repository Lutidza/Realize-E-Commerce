# CHECK-SAFE-COMMAND-PROPOSAL

```yaml
artifact_id: CHECK-SAFE-COMMAND-PROPOSAL
artifact_type: ai-pre-implementation-check
owner_layer: .ai/checks/pre-implementation/
rule: .ai/rules/global/RULE-SAFE-COMMAND-PROPOSAL.md
enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
registry: .ai/registry/rules/INDEX.md
check_stage: pre_implementation_command_safety_gate
rule_scope: project-wide
scope: proposed_and_executed_commands
```

## Условие срабатывания

Запускать перед предложением или запуском нетривиальной команды в `work_task`.

Для read-only команд проверки дерева, статуса, поиска или просмотра файлов
допустим короткий проход, если command не содержит секретов, не пишет в
filesystem/runtime/database/network и не меняет delivery state.

Полный check обязателен для команд с `local_write`, `network`, `delivery`,
`destructive` или `secret_adjacent` классом риска.

## Входы

- command text или redacted command;
- purpose;
- working directory;
- expected output;
- safety class;
- destructive risk;
- secrets handling;
- required approval/gate;
- related workflow or skill, если команда относится к delivery, commit/push,
  package install, migration или cleanup.

## Процедура

1. Определить, является ли задача `work_task`.
2. Если команда не требуется, вернуть `not_required`.
3. Классифицировать command safety class.
4. Проверить, что purpose и expected output понятны.
5. Проверить, что working directory задан, если результат зависит от cwd.
6. Проверить, что command не содержит secrets, tokenized URLs, passwords,
   private keys или raw secret values.
7. Для secret-adjacent commands потребовать env var name, ignored local config
   или безопасный wrapper без печати значения.
8. Для destructive, delivery, network write, commit/push or production data
   mutation проверить профильный gate и approval.
9. Если риск скрыт или approval отсутствует, остановить command.

## Условия прохождения

- Purpose указан.
- Working directory указан или явно не требуется.
- Expected output указан.
- Safety class и destructive risk названы.
- Secrets не попадают в command, output, logs, task state, commit message или
  ответ пользователю.
- Required approval/gate выполнен или command остановлен.

## Вывод

```text
safe_command_contract_check: passed|not_required|stop-for-approval|failed
task_classification: dialog_only|work_task
command_required: yes|no
command_purpose:
command_redacted:
working_directory:
safety_class:
expected_output:
destructive_risk:
secrets_handling:
approval_required: yes|no
related_workflow_or_skill:
blocker:
```
