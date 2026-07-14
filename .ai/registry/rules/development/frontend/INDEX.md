# Rules Registry Shard: Development Frontend

```yaml
artifact_id: ai-registry-rules-development-frontend
artifact_type: ai-rules-registry-shard
schema_version: 2
owner_layer: .ai/registry/rules/development/frontend/
coverage:
  - .ai/rules/development/frontend/
  - .ai/checks/development/frontend/
entries:
  - entry_id: next-react-frontend-boundaries
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/development/frontend/RULE-NEXT-REACT-FRONTEND-BOUNDARIES.md
    owner_layer: .ai/rules/development/frontend/
    owner_roles: [.ai/roles/developer/frontend/INDEX.md]
    related_checks: [.ai/checks/development/frontend/CHECK-NEXT-REACT-FRONTEND-BOUNDARIES.md]
    related_workflows: [.ai/workflows/frontend/next-react/guardrail/WORKFLOW.md]
    related_codex_artifacts: [.codex/skills/next-react-frontend-architecture/SKILL.md, .codex/skills/dto-contracts-first/SKILL.md]
    related_tools: [rg]
    routing_tags: [frontend, next, react, boundaries]
    trigger: "Frontend change touches Next routes, React components, Tailwind/shadcn UI, route helpers or rendered behavior."
  - entry_id: frontend-reuse-before-local-implementation
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/development/frontend/RULE-REUSE-BEFORE-LOCAL-IMPLEMENTATION.md
    owner_layer: .ai/rules/development/frontend/
    owner_roles: [.ai/roles/developer/frontend/INDEX.md]
    related_checks: [.ai/checks/development/frontend/CHECK-REUSE-BEFORE-LOCAL-IMPLEMENTATION.md]
    related_workflows: [.ai/workflows/frontend/next-react/guardrail/WORKFLOW.md]
    related_codex_artifacts: [.codex/skills/next-react-frontend-architecture/SKILL.md]
    related_tools: [rg]
    routing_tags: [frontend, reuse, next, react]
    trigger: "Frontend change creates or edits route, page, layout, component, style or client behavior."
  - entry_id: frontend-reference-pattern-scan
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/development/frontend/RULE-REFERENCE-PATTERN-SCAN-BEFORE-IMPLEMENTATION.md
    owner_layer: .ai/rules/development/frontend/
    owner_roles: [.ai/roles/developer/frontend/INDEX.md]
    related_checks: [.ai/checks/development/frontend/CHECK-REFERENCE-PATTERN-SCAN-BEFORE-IMPLEMENTATION.md]
    related_workflows: []
    related_codex_artifacts: [.codex/skills/reference-to-implementation/SKILL.md]
    related_tools: [rg]
    routing_tags: [frontend, reference, visual-parity]
    trigger: "Frontend change uses screenshot, reference, raw HTML, existing page or visual parity."
  - entry_id: frontend-no-local-visual-contract
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/development/frontend/RULE-NO-LOCAL-VISUAL-CONTRACT.md
    owner_layer: .ai/rules/development/frontend/
    owner_roles: [.ai/roles/developer/frontend/INDEX.md]
    related_checks: [.ai/checks/development/frontend/CHECK-NO-LOCAL-VISUAL-CONTRACT.md]
    related_workflows: [.ai/workflows/frontend/next-react/guardrail/WORKFLOW.md]
    related_codex_artifacts: [.codex/skills/next-react-frontend-architecture/SKILL.md]
    related_tools: [rg]
    routing_tags: [frontend, visual-contract, css, component]
    trigger: "Frontend change adds class, style, selector, wrapper or repeated visual behavior."
  - entry_id: frontend-no-related-ui-drift
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/development/frontend/RULE-NO-RELATED-UI-DRIFT.md
    owner_layer: .ai/rules/development/frontend/
    owner_roles: [.ai/roles/developer/frontend/INDEX.md]
    related_checks: [.ai/checks/development/frontend/CHECK-NO-RELATED-UI-DRIFT.md]
    related_workflows: []
    related_codex_artifacts: [.codex/skills/frontend-runtime-evidence/SKILL.md]
    related_tools: [rg]
    routing_tags: [frontend, ui-drift, shared-ui]
    trigger: "Shared frontend owner can affect related routes, pages, components or layouts."
  - entry_id: frontend-guardrail-self-review
    entry_type: supporting_check
    status: active
    primary_artifact: .ai/checks/development/frontend/self-review/CHECK-FRONTEND-GUARDRAIL-SELF-REVIEW.md
    owner_layer: .ai/checks/development/frontend/self-review/
    owner_roles: [.ai/roles/developer/frontend/INDEX.md]
    related_checks: []
    related_workflows: [.ai/workflows/frontend/next-react/guardrail/WORKFLOW.md]
    related_codex_artifacts: []
    related_tools: []
    routing_tags: [frontend, self-review]
    trigger: "Frontend implementation diff is ready for self-review."
```
