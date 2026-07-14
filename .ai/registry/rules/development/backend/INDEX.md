# Registry shard: backend-разработка

```yaml
artifact_id: ai-registry-rules-development-backend
artifact_type: ai-rules-registry-shard
schema_version: 2
owner_layer: .ai/registry/rules/development/backend/
coverage:
  - .ai/rules/development/backend/
  - .ai/checks/development/backend/
entries:
  - entry_id: payload-next-backend-boundaries
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/development/backend/RULE-PAYLOAD-NEXT-BACKEND-BOUNDARIES.md
    owner_layer: .ai/rules/development/backend/
    owner_roles: [.ai/roles/developer/backend/INDEX.md]
    related_checks: [.ai/checks/development/backend/CHECK-PAYLOAD-NEXT-BACKEND-BOUNDARIES.md]
    related_workflows: []
    related_codex_artifacts: [.codex/skills/payload-next-contracts-first/SKILL.md, .codex/skills/dto-contracts-first/SKILL.md]
    related_tools: [rg]
    routing_tags: [backend, payload, next, api, boundaries]
    trigger: "Backend-правка затрагивает Payload config, collections, migrations, API routes, data services, search или cache."
  - entry_id: backend-reuse-before-local-implementation
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/development/backend/RULE-BACKEND-REUSE-BEFORE-LOCAL-IMPLEMENTATION.md
    owner_layer: .ai/rules/development/backend/
    owner_roles: [.ai/roles/developer/backend/INDEX.md]
    related_checks: [.ai/checks/development/backend/CHECK-BACKEND-REUSE-BEFORE-LOCAL-IMPLEMENTATION.md]
    related_workflows: []
    related_codex_artifacts: [.codex/skills/payload-next-contracts-first/SKILL.md, .codex/skills/dto-contracts-first/SKILL.md]
    related_tools: [rg]
    routing_tags: [backend, reuse, payload, service]
    trigger: "Backend-правка создаёт или меняет collection, route, service, resolver, mapper, hook, access rule, job или cache/search behavior."
  - entry_id: payload-data-contract-first
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/development/backend/RULE-PAYLOAD-DATA-CONTRACT-FIRST.md
    owner_layer: .ai/rules/development/backend/
    owner_roles: [.ai/roles/developer/backend/INDEX.md]
    related_checks: [.ai/checks/development/backend/CHECK-PAYLOAD-DATA-CONTRACT-FIRST.md]
    related_workflows: []
    related_codex_artifacts: [.codex/skills/payload-next-contracts-first/SKILL.md, .codex/skills/dto-contracts-first/SKILL.md]
    related_tools: [rg, payload]
    routing_tags: [backend, payload, data-contract, migration]
    trigger: "Backend-правка меняет Payload schema, DB contract, generated types decision, DTO или API response shape."
  - entry_id: dto-contracts-no-raw-payload
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/development/backend/RULE-DTO-CONTRACTS-NO-RAW-PAYLOAD.md
    owner_layer: .ai/rules/development/backend/
    owner_roles: [.ai/roles/developer/backend/INDEX.md]
    related_checks: [.ai/checks/development/backend/CHECK-DTO-CONTRACTS-NO-RAW-PAYLOAD.md]
    related_workflows: []
    related_codex_artifacts: [.codex/skills/dto-contracts-first/SKILL.md, .codex/skills/payload-next-contracts-first/SKILL.md]
    related_tools: [rg]
    routing_tags: [backend, dto, api-contract, mapper, payload, frontend-contract]
    trigger: "Backend/frontend contract, public API response, mapper, serializer or DTO work can expose raw Payload documents."
  - entry_id: backend-no-related-contract-drift
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/development/backend/RULE-NO-RELATED-BACKEND-CONTRACT-DRIFT.md
    owner_layer: .ai/rules/development/backend/
    owner_roles: [.ai/roles/developer/backend/INDEX.md]
    related_checks: [.ai/checks/development/backend/CHECK-NO-RELATED-BACKEND-CONTRACT-DRIFT.md]
    related_workflows: []
    related_codex_artifacts: [.codex/skills/payload-next-contracts-first/SKILL.md, .codex/skills/dto-contracts-first/SKILL.md]
    related_tools: [rg]
    routing_tags: [backend, contract-drift, consumers]
    trigger: "Shared backend owner может затронуть связанные API, UI, admin, jobs, search projections или cache."
  - entry_id: search-indexing-cache-boundaries
    entry_type: active_rule
    status: active
    primary_artifact: .ai/rules/development/backend/RULE-SEARCH-INDEXING-CACHE-BOUNDARIES.md
    owner_layer: .ai/rules/development/backend/
    owner_roles: [.ai/roles/developer/backend/INDEX.md]
    related_checks: [.ai/checks/development/backend/CHECK-SEARCH-INDEXING-CACHE-BOUNDARIES.md]
    related_workflows: []
    related_codex_artifacts: [.codex/skills/payload-next-contracts-first/SKILL.md]
    related_tools: [rg, elasticsearch, redis]
    routing_tags: [backend, search, indexing, cache]
    trigger: "Backend-правка меняет Search Profile, Elasticsearch provider/query/indexing, Redis/cache или search API response."
  - entry_id: backend-guardrail-self-review
    entry_type: supporting_check
    status: active
    primary_artifact: .ai/checks/development/backend/self-review/CHECK-BACKEND-GUARDRAIL-SELF-REVIEW.md
    owner_layer: .ai/checks/development/backend/self-review/
    owner_roles: [.ai/roles/developer/backend/INDEX.md]
    related_checks: []
    related_workflows: []
    related_codex_artifacts: []
    related_tools: []
    routing_tags: [backend, self-review]
    trigger: "Backend implementation diff готов к self-review."
```
