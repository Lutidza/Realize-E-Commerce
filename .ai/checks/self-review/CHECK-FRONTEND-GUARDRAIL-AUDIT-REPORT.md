# Проверка отчёта frontend guardrail audit

```yaml
check_id: CHECK-FRONTEND-GUARDRAIL-AUDIT-REPORT
title: Проверка отчёта frontend guardrail audit
owner_role: Владелец frontend-архитектуры
applies_to:
  - self-review
  - frontend guardrail audit
  - .ai/reports/frontend
trigger:
  - создан или обновлён отчёт frontend guardrail audit
  - применялся .codex/skills/frontend-guardrail-audit/SKILL.md
required_output:
  - report_file
  - template_used
  - russian_language
  - read_only_scope
  - product_code_unchanged
  - applied_rules_checks_skills
  - findings_have_evidence
  - findings_have_owner_layer
  - deferred_decisions_separated
  - next_step_single_and_scoped
  - no_architecture_contract_from_temporary_decision
  - decision
pass_condition:
  - отчёт использует .ai/templates/agent-reports/TEMPLATE-FRONTEND-GUARDRAIL-AUDIT.md
  - структура отчёта на русском языке
  - режим аудита указан как только чтение
  - продуктовый код не изменён
  - применённые rules/checks/skills перечислены путями
  - каждая найденная проблема имеет evidence и owner-layer
  - отложенные решения отделены от архитектурных решений
  - следующий шаг один и не расширяет scope скрыто
fail_condition:
  - отчёт написан без template
  - отчёт содержит англоязычные служебные заголовки вместо русской структуры
  - audit findings превращены в product implementation plan без pre-edit gate
  - временное решение пользователя зафиксировано как архитектурный contract
  - найденные проблемы не имеют evidence или owner-layer
  - отчёт предлагает несколько несогласованных следующих шагов
related_template:
  - .ai/templates/agent-reports/TEMPLATE-FRONTEND-GUARDRAIL-AUDIT.md
related_codex_artifacts:
  - .codex/skills/frontend-guardrail-audit/SKILL.md
related_tools:
  - rg
  - git diff
```

## Когда выполнять

Проверка обязательна после создания или обновления отчёта frontend guardrail
audit в `.ai/reports/frontend/`.

## Обязательный вывод

После audit report агент выводит:

```text
Проверка отчёта frontend guardrail audit:
- report file:
- template used:
- russian language:
- read-only scope:
- product code unchanged:
- applied rules/checks/skills:
- findings have evidence:
- findings have owner-layer:
- deferred decisions separated:
- next step single and scoped:
- no architecture contract from temporary decision:
- decision:
```

## Минимальные проверки

- Проверить, что отчёт использует
  `.ai/templates/agent-reports/TEMPLATE-FRONTEND-GUARDRAIL-AUDIT.md`.
- Проверить отсутствие англоязычных служебных заголовков.
- Проверить, что в отчёте есть режим только чтение.
- Проверить `git diff --name-only`, чтобы audit не изменил product code.
- Проверить, что rules/checks/skills указаны путями.
- Проверить, что findings имеют evidence и owner-layer.
- Проверить, что временные решения и отложенные решения не названы
  архитектурным contract.
- Проверить, что следующий шаг один и не расширяет scope скрыто.

## Результат

- `passed` — отчёт соответствует template и не превращает audit в скрытую
  реализацию.
- `stop-for-approval` — отчёт требует решения пользователя по scope,
  отложенному решению или следующему шагу.
- `failed` — отчёт нарушает template, язык, read-only режим или traceability.
