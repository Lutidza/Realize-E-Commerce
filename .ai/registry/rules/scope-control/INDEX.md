# Rules Registry Shard: Scope Control

```yaml
artifact_id: ai-registry-rules-scope-control
artifact_type: ai-rules-registry-shard
schema_version: 2
owner_layer: .ai/registry/rules/scope-control/
coverage:
  - .ai/rules/scope-control/
```

```yaml
entries:
  - entry_id: artifact-disposition
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/scope-control/RULE-ARTIFACT-DISPOSITION.md
    owner_layer: .ai/rules/scope-control/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: []
    related_checks: [.ai/checks/pre-implementation/CHECK-ARTIFACT-DISPOSITION.md]
    related_workflows: []
    related_codex_artifacts: []
    related_tools: []
    routing_tags: [scope-control, artifact, disposition]
    trigger: "Before deleting, moving, replacing, archiving, renaming or changing owner-layer artifact."
  - entry_id: stale-artifact-cleanup-after-refactor
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/scope-control/RULE-STALE-ARTIFACT-CLEANUP-AFTER-REFACTOR.md
    owner_layer: .ai/rules/scope-control/
    owner_roles: [.ai/roles/process-tools-operations/scope-contour-owner/INDEX.md]
    related_rules: []
    related_checks: [.ai/checks/self-review/CHECK-STALE-ARTIFACT-CLEANUP-AFTER-REFACTOR.md]
    related_workflows: []
    related_codex_artifacts: [.codex/skills/skill-documentation-sync/SKILL.md]
    related_tools: []
    routing_tags: [scope-control, stale-cleanup, refactor]
    trigger: "Final handoff after refactor, migration, rename, decomposition or owner-layer change."
```
