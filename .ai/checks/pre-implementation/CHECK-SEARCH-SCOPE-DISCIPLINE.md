# CHECK-SEARCH-SCOPE-DISCIPLINE

```yaml
artifact_id: CHECK-SEARCH-SCOPE-DISCIPLINE
artifact_type: ai-pre-implementation-check
owner_layer: .ai/checks/pre-implementation/
rule: .ai/rules/development/RULE-SEARCH-SCOPE-DISCIPLINE.md
enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
registry: .ai/registry/rules/INDEX.md
check_stage: pre_implementation_search_scope_gate
rule_scope: project-wide
scope: repository_search
status: active

trigger:
  any:
    - before_repository_file_search
    - before_source_of_truth_lookup
    - before_owner_layer_lookup
    - before_reuse_scan
    - before_drift_scan
    - before_reference_scan

inputs:
  task_classification:
    enum:
      - dialog_only
      - work_task
  search_required:
    enum:
      - "yes"
      - "no"
  search_goal: required_when_search_required
  repository_search_worker_session_id: required_when_search_required_for_work_task
  runtime_evidence_route: required_when_search_required_for_work_task
  peer_communication_edges: required_when_search_required_for_work_task
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
      - not_applicable
  query_or_pattern: required_when_search_required
  include_paths: required_when_search_required
  excluded_paths: required_when_search_required
  expected_source_type: required_when_search_required
  reference_or_special_reason:
    required_when:
      search_mode:
        - reference
        - special
  output_limit_or_refinement_strategy: required_when_search_required

procedure:
  - classify_task
  - determine_search_required
  - return_not_required_when_no_search
  - require_repository_search_worker_for_work_task_search
  - require_runtime_message_or_edge_for_search_evidence_distribution
  - choose_search_mode_before_command
  - resolve_mode_include_paths
  - declare_excluded_paths
  - require_reason_for_reference_or_special
  - declare_output_limit_or_refinement_strategy
  - stop_when_mode_or_paths_are_undefined

pass_if:
  - search_not_required_or_mode_selected
  - repository_search_worker_session_present_for_work_task_search
  - search_evidence_route_present_for_worker_chain
  - include_paths_match_selected_mode
  - excluded_paths_declared
  - normal_modes_exclude_noise_paths
  - reference_or_special_reason_present_when_required
  - output_limit_or_refinement_strategy_present
  - search_result_treated_as_evidence_not_scope_expansion

fail_if:
  - dialog_assistant_performs_repository_search_for_worker_group
  - implementation_worker_performs_repository_search_without_search_worker
  - repository_search_has_no_separate_runtime_session
  - search_evidence_not_distributed_by_runtime_message_or_edge
  - root_search_without_mode
  - root_search_without_allowlist
  - historical_or_report_paths_in_normal_mode
  - generated_dump_lock_runtime_or_dependency_scan_without_reason
  - repeated_wide_search_without_refinement
  - search_hit_used_as_active_source_without_primary_source_check
  - search_hit_expands_scope_without_new_pre_edit_gate

stop_if:
  - work_task_repository_search_without_repository_search_worker
  - worker_group_requested_but_dialog_assistant_attempts_search_directly
  - special_mode_without_reason
  - reference_mode_without_reason
  - secret_adjacent_or_dump_search_needed
  - generated_runtime_state_needed_without_scope
  - expected_source_only_in_historical_zone_without_reference_approval

output_contract:
  search_scope_discipline_check:
    enum:
      - passed
      - failed
      - not_required
      - stop-for-approval
  task_classification:
    enum:
      - dialog_only
      - work_task
  search_required:
    enum:
      - "yes"
      - "no"
  search_goal: string
  repository_search_worker_session_id: string
  runtime_evidence_route: string
  peer_communication_edges: list
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
      - not_applicable
  query_or_pattern: string
  include_paths: list
  excluded_paths: list
  expected_source_type: string
  reference_or_special_reason: string
  output_limit_or_refinement_strategy: string
  scope_expansion_risk:
    enum:
      - "yes"
      - "no"
  blocker: string
```
