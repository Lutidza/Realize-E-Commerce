# RULE-SEARCH-SCOPE-DISCIPLINE

```yaml
artifact_id: RULE-SEARCH-SCOPE-DISCIPLINE
artifact_type: project-development-rule
owner_layer: .ai/rules/development/
enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
check: .ai/checks/pre-implementation/CHECK-SEARCH-SCOPE-DISCIPLINE.md
registry: .ai/registry/rules/INDEX.md
rule_scope: project-wide
scope: repository_search
status: active

applies_to:
  - application_code_search
  - documentation_search
  - ai_runtime_layer_search
  - reference_search
  - local_tooling_search

tools:
  - rg

trigger:
  any:
    - before_repository_file_search
    - before_source_of_truth_lookup
    - before_owner_layer_lookup
    - before_reuse_scan
    - before_drift_scan
    - before_reference_scan

required:
  repository_search_worker_session:
    required_when:
      task_classification:
        - work_task
    description: repository search must run in a separate runtime session
  search_mode:
    enum:
      - code
      - docs
      - code-docs
      - ai-active
      - ai
      - codex
      - next-routes
      - payload
      - domain
      - search-layer
      - ui
      - migrations
      - reference
      - special
  query_or_pattern: required
  include_paths: non_empty
  excluded_paths: explicit
  expected_source_type: required
  output_limit_or_refinement_strategy: required
  runtime_evidence_route: required
  peer_communication_edges: required
  reason:
    required_when:
      search_mode:
        - reference
        - special

modes:
  code:
    include:
      - src
      - tests
      - scripts
      - types
    exclude:
      - node_modules
      - .next
      - dist
      - build
      - coverage
  docs:
    include:
      - docs
      - documentation
      - README.md
      - AGENTS.md
    include_globs:
      - "*.md"
    exclude:
      - docs/payloadDocs
  code-docs:
    extends:
      - code
      - docs
  ai-active:
    include:
      - .ai/rules
      - .ai/checks
      - .ai/workflows
      - .ai/roles
      - .ai/registry
      - .codex/skills
      - .codex/agents
      - .codex/prompts
    exclude:
      - .ai/reports
      - .ai/tasks/history
      - .ai/tools/agent-runtime/runtime
  ai:
    include:
      - .ai
    exclude:
      - .ai/reports
      - .ai/tasks/history
      - .ai/tools/agent-runtime/runtime
  codex:
    include:
      - .codex
    exclude: []
  next-routes:
    include:
      - src/app
    exclude:
      - .next
  payload:
    include:
      - src/payload.config.ts
      - src/collections
      - src/domain/collections
      - src/migrations
    exclude:
      - node_modules
      - .next
  domain:
    include:
      - src/domain
    exclude:
      - node_modules
      - .next
  search-layer:
    include:
      - src/domain/services/search
      - src/domain/data/searchProfiles
      - src/app/api/search
      - src/app/api/filters
      - docs/filter_elasticsearch_srp.md
      - docs/elasticsearch_local_setup.md
    exclude:
      - node_modules
      - .next
  ui:
    include:
      - src/domain/ui
      - src/app
    exclude:
      - node_modules
      - .next
  migrations:
    include:
      - src/migrations
    exclude:
      - node_modules
      - .next
  reference:
    include:
      - docs/ui-examples
      - .ai/reports
      - .ai/tasks/history
    reason_required: true
  special:
    include:
      - explicit_user_or_agent_selected_paths
    reason_required: true

global_exclude:
  dependency_dirs:
    - node_modules
  runtime_outputs:
    - .next
    - dist
    - build
    - coverage
    - .ai/tools/agent-runtime/runtime
  file_kinds:
    - binary
    - image
    - archive
    - sqlite
    - sqlite-wal
    - sqlite-shm
    - jsonl
  conditional_exclude:
    lock_files:
      unless_task_type:
        - dependency_audit
        - package_audit
        - install_or_update

forbidden:
  - dialog_assistant_repository_search_for_worker_group
  - implementation_worker_repository_search_without_search_worker
  - repository_search_without_separate_runtime_session
  - search_evidence_without_runtime_message_or_edge
  - root_rg_without_search_mode
  - root_rg_without_include_paths
  - historical_search_without_reference_or_special_mode
  - generated_runtime_file_scan_without_reason
  - dependency_dir_scan_without_reason
  - repeated_wide_search_without_query_refinement
  - scope_expansion_from_search_hit_without_new_gate
  - historical_artifact_as_active_source_of_truth

pass_if:
  - repository_search_runs_in_repository_search_worker_session
  - search_evidence_distributed_by_runtime_messages_or_edges
  - mode_selected_before_search
  - include_paths_match_mode
  - excluded_paths_declared
  - noisy_paths_excluded_for_normal_modes
  - reference_or_special_has_reason_when_used
  - output_limit_or_refinement_strategy_declared

stop_if:
  - work_task_repository_search_without_repository_search_worker
  - worker_group_requested_but_dialog_assistant_attempts_search_directly
  - special_mode_without_reason
  - secret_adjacent_or_dump_search_needed
  - generated_runtime_state_needed_without_scope
  - source_expected_only_in_historical_zone_without_reference_approval
```
