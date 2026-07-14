# RULE-COMMIT-PUSH-SSH-DELIVERY

```yaml
rule_id: RULE-COMMIT-PUSH-SSH-DELIVERY
title: GitHub SSH-only commit/push delivery safety
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/rules/git/
workflow: .ai/workflows/delivery/git/commit-push/WORKFLOW.md
checks:
  - .ai/checks/pre-commit/CHECK-DELIVERY-COMMIT-SCOPE.md
  - .ai/checks/pre-push/CHECK-DELIVERY-PUSH-READINESS.md
codex_adapter:
  - .codex/skills/git-commit-push/SKILL.md
```

## Условие срабатывания

Применять при любой операции staging, commit или push в рамках delivery шага.

## Обязательное правило

Commit/push delivery выполняется только после прохождения общего entry gate и
delivery assignment. Delivery platform для репозитория - GitHub.

Это правило владеет только предметными safety conditions:

- staged files должны совпадать с allowlist или явно approved snapshot;
- staging, commit и push выполняются только в пределах delivery assignment;
- перед commit выполняется `.ai/checks/pre-commit/CHECK-DELIVERY-COMMIT-SCOPE.md`;
- перед push выполняется `.ai/checks/pre-push/CHECK-DELIVERY-PUSH-READINESS.md`;
- remote `origin` должен быть GitHub SSH URL вида
  `git@github.com:<owner>/<repo>.git`;
- push выполняется только через GitHub SSH remote `origin`;
- перед push выполняется SSH preflight в `BatchMode`;
- если SSH key не принят remote host, workflow останавливается с
  `ssh_auth_failed`; HTTPS/token fallback запрещён;
- successful push фиксируется durable result с `result: push_succeeded`;
- durable `push_succeeded` создаётся только в рамках delivery workflow.
- GitHub Pull Request создаётся, обновляется или merge-ится только по
  отдельному явному запросу пользователя.

## Условия остановки

- Entry gate не пройден.
- Delivery assignment отсутствует или не покрывает staging/commit/push.
- Staged files выходят за allowlist.
- Secret scan нашёл token или tokenized URL в tracked-файлах.
- `origin` не является GitHub SSH remote.
- `origin` указывает не на `github.com`.
- SSH preflight failed или SSH key не имеет write-доступа.
- Runtime signal обязателен по mission, но writer недоступен.
