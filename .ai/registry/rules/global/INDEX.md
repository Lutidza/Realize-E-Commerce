# Rules Registry Shard: Global

```yaml
artifact_id: ai-registry-rules-global
artifact_type: ai-rules-registry-shard
schema_version: 2
owner_layer: .ai/registry/rules/global/
coverage:
  - .ai/rules/global/
```

```yaml
entries:
  - entry_id: global-project-guardrails
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/global/RULE-GLOBAL-PROJECT-GUARDRAILS.md
    owner_layer: .ai/rules/global/
    owner_roles: [all-agents]
    enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
    related_rules: [.ai/rules/development/RULE-DEVELOPMENT-STRICT-PRINCIPLES.md, .ai/rules/scope-control/RULE-ARTIFACT-DISPOSITION.md, .ai/rules/scope-control/RULE-STALE-ARTIFACT-CLEANUP-AFTER-REFACTOR.md]
    related_checks: []
    related_workflows: []
    related_codex_artifacts: []
    related_tools: []
    routing_tags: [global, guardrail, artifact-introduction, objectivity]
    trigger: "New contour, owner-layer, runtime path, tooling path, bridge, temporary artifact, uncertain handoff or objectivity risk."
  - entry_id: safe-command-proposal
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/global/RULE-SAFE-COMMAND-PROPOSAL.md
    owner_layer: .ai/rules/global/
    owner_roles: [all-agents]
    enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
    related_rules: [.ai/rules/development/RULE-DEVELOPMENT-STRICT-PRINCIPLES.md, .ai/rules/git/RULE-COMMIT-PUSH-SSH-DELIVERY.md]
    related_checks: [.ai/checks/pre-implementation/CHECK-SAFE-COMMAND-PROPOSAL.md]
    related_workflows: []
    related_codex_artifacts: [.codex/skills/git-commit-push/SKILL.md]
    related_tools: [shell]
    routing_tags: [global, command, safety, delivery]
    trigger: "Agent proposes or runs shell/CLI/tool command in work_task, especially write/network/delivery/destructive/secret-adjacent commands."
  - entry_id: working-artifact-language
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/global/RULE-WORKING-ARTIFACT-LANGUAGE.md
    owner_layer: .ai/rules/global/
    owner_roles: [all-agents]
    enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
    related_rules: [.ai/rules/development/RULE-CODE-COMMENT-DISCIPLINE.md]
    related_checks: [.ai/checks/self-review/CHECK-WORKING-ARTIFACT-LANGUAGE.md]
    related_workflows: []
    related_codex_artifacts: []
    related_tools: []
    routing_tags: [global, language, working-artifact]
    trigger: "Agent creates or edits .ai task/report/role/rule/check/workflow/template, .codex skill, code comments or handoff artifact."
```
