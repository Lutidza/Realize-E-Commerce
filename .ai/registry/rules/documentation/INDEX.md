# Rules Registry Shard: Documentation

```yaml
artifact_id: ai-registry-rules-documentation
artifact_type: ai-rules-registry-shard
schema_version: 2
owner_layer: .ai/registry/rules/documentation/
coverage:
  - .ai/rules/documentation/
```

```yaml
entries:
  - entry_id: canonical-documentation-before-contract-change
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/documentation/RULE-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE.md
    owner_layer: .ai/rules/documentation/
    owner_roles: [.ai/roles/developer/frontend/INDEX.md, .ai/roles/developer/backend/INDEX.md, .ai/roles/process-tools-operations/documentation-steward/INDEX.md]
    enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
    related_rules: []
    related_checks: [.ai/checks/pre-implementation/CHECK-CANONICAL-DOCUMENTATION-BEFORE-CONTRACT-CHANGE.md]
    related_workflows: []
    related_codex_artifacts: [.codex/skills/skill-documentation-sync/SKILL.md]
    related_tools: []
    routing_tags: [documentation, canonical-docs, contract-change]
    trigger: "Planned work may change product/API/DTO/schema, validation, auth, route, integration, shared UI/backend contract, workflow, role, rule, check, owner-layer or code boundary with @docref."
```
