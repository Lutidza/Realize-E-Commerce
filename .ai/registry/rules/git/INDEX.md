# Rules Registry Shard: Git Delivery

```yaml
artifact_id: ai-registry-rules-git
artifact_type: ai-rules-registry-shard
schema_version: 2
owner_layer: .ai/registry/rules/git/
coverage:
  - .ai/rules/git/
```

```yaml
entries:
  - entry_id: commit-push-ssh-delivery
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/git/RULE-COMMIT-PUSH-SSH-DELIVERY.md
    owner_layer: .ai/rules/git/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: []
    related_checks: [.ai/checks/pre-commit/CHECK-DELIVERY-COMMIT-SCOPE.md, .ai/checks/pre-push/CHECK-DELIVERY-PUSH-READINESS.md]
    related_workflows: [.ai/workflows/delivery/git/commit-push/WORKFLOW.md]
    related_codex_artifacts: [.codex/skills/git-commit-push/SKILL.md]
    related_tools: [git, ssh, github]
    routing_tags: [git, github, delivery, commit, push]
    trigger: "Staging, commit or push to GitHub."
```
