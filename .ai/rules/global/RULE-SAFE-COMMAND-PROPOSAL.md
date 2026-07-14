# RULE-SAFE-COMMAND-PROPOSAL

```yaml
rule_id: RULE-SAFE-COMMAND-PROPOSAL
title: Безопасное предложение и запуск команд
artifact_type: global-project-rule
owner_layer: .ai/rules/global/
rule_scope: project-wide
scope: proposed_and_executed_commands
applies_to:
  - shell commands
  - package manager commands
  - git commands
  - delivery commands
  - local tooling commands
enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
check: .ai/checks/pre-implementation/CHECK-SAFE-COMMAND-PROPOSAL.md
registry: .ai/registry/rules/INDEX.md
related_rules:
  - .ai/rules/development/RULE-DEVELOPMENT-STRICT-PRINCIPLES.md
  - .ai/rules/git/RULE-COMMIT-PUSH-SSH-DELIVERY.md
related_codex_artifacts:
  - .codex/skills/git-commit-push/SKILL.md
```

## Назначение

Правило задаёт минимальный contract для команд, которые агент предлагает
пользователю или запускает сам в рамках `work_task`. Команда должна быть
воспроизводимой, понятной по цели и не должна маскировать destructive,
delivery, network или secret-adjacent риск.

Commit/push, destructive actions, secrets, network writes и scope expansion
проходят свои workflow gates and approval requirements.

## Условие срабатывания

Применять перед тем, как агент:

- предлагает пользователю pasteable shell/CLI command;
- запускает shell/CLI/tool command в текущей рабочей сессии;
- формирует delivery, git, package manager, migration, cleanup, runtime writer
  или network command;
- показывает команду в task/checklist/report как рекомендуемое действие.

Для тривиального read-only поиска или просмотра файлов достаточно кратко
понимать purpose и working directory внутри текущего шага. Для write, network,
delivery, destructive или secret-adjacent commands полный command contract
обязателен.

## Контракт команды (`command_contract`)

Перед запуском или предложением нетривиальной команды агент фиксирует:

- `purpose` - зачем нужна команда;
- `command` - сама команда без секретов и tokenized URLs;
- `working_directory` - директория запуска;
- `safety_class` - `read_only`, `local_write`, `network`, `delivery`,
  `destructive` или `secret_adjacent`;
- `expected_output` - что должно появиться в выводе или измениться в состоянии;
- `destructive_risk` - `none`, `possible` или `high`;
- `secrets_handling` - как исключается попадание secret/token в command,
  output, logs, task state, commit message или ответ пользователю;
- `approval_required` - нужен ли отдельный user approval, delivery gate или
  escalation.

## Запрещено

- Вставлять secrets, private keys, passwords, tokenized remotes или bearer/API
  tokens в pasteable shell-команды.
- Предлагать HTTP command с secret-bearing URL или token query string.
- Скрывать destructive, network, delivery или secret-adjacent риск под видом
  обычной read-only команды.
- Запускать destructive command, commit/push, production data mutation или
  secret-adjacent operation без профильного gate и approval.
- Давать команду без working directory, если результат зависит от cwd.

## Обязательный вывод

```text
safe_command_contract: passed|not_required|stop-for-approval|failed
command_purpose:
command_redacted:
working_directory:
safety_class:
expected_output:
destructive_risk:
secrets_handling:
approval_required: yes|no
blocker:
```
