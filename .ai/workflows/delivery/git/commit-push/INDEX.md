# Workflow commit/push (`delivery_git_commit_push`)

```yaml
artifact_id: delivery-git-commit-push
artifact_type: ai-workflow-index
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/workflows/delivery/git/commit-push/
runtime_sources:
  - .ai/workflows/delivery/git/commit-push/WORKFLOW.md
  - .ai/rules/git/RULE-COMMIT-PUSH-SSH-DELIVERY.md
  - .ai/checks/pre-commit/CHECK-DELIVERY-COMMIT-SCOPE.md
  - .ai/checks/pre-push/CHECK-DELIVERY-PUSH-READINESS.md
codex_adapter:
  - .codex/skills/git-commit-push/SKILL.md
```

## Назначение

Входной файл workflow commit/push. Общий вход через Dialog Assistant задаётся
описывает SSH-only delivery gates после отдельной команды пользователя на
commit/push.

## Entrypoint

- Runtime contract: `.ai/workflows/delivery/git/commit-push/WORKFLOW.md`
- Delivery rule: `.ai/rules/git/RULE-COMMIT-PUSH-SSH-DELIVERY.md`
- Pre-commit check: `.ai/checks/pre-commit/CHECK-DELIVERY-COMMIT-SCOPE.md`
- Pre-push check: `.ai/checks/pre-push/CHECK-DELIVERY-PUSH-READINESS.md`
