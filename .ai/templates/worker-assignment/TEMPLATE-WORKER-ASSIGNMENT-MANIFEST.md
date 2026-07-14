# Шаблон: Worker Assignment Manifest (`TEMPLATE-WORKER-ASSIGNMENT-MANIFEST`)

```yaml
template_id: TEMPLATE-WORKER-ASSIGNMENT-MANIFEST
template_type: ai-runtime-manifest-template
owner_layer: .ai/templates/worker-assignment/
runtime_owner: .ai/workflows/core/worker-assignment/WORKFLOW.md
runtime_sources:
  - .ai/checks/worker-runtime/CHECK-WORKER-ASSIGNMENT-SCOPE.md
  - .ai/rules/worker-runtime/RULE-WORKER-ASSIGNMENT-MANIFEST.md
  - .ai/workflows/core/worker-assignment/WORKFLOW.md
```

## Назначение (`purpose`)

Манифест фиксирует один task-bound запуск worker-а: кто, какую модель, какой
scope и куда возвращается результат.

## Обязательные поля (`required_fields`)

```text
manifest_id
manifest_version
created_at
created_by
task_id
user_intent
session_id
job_id
group_id
profile_id
profile_revision
role
mission
source_of_truth
contour_owner
owner_layer
complexity_tier
model
model_justification
model_availability
context_budget:
  remaining_tokens
  expected_delta
  margin_tokens
  safety_margin_percent
reuse_or_spawn
scope_narrowing_reason
allowed_paths
forbidden_paths
create_paths
edit_paths
delete_paths
delete_authorized
rules
checks
workflows
skills
expected_output
stop_condition
result_path
result_visibility
risk_summary
handoff_ready_evidence
coordinator_chain:
  - returns_to
  - owner_layer
  - previous_session_id
  - next_session_id
  - reason
decision_log:
  - model_decision
  - context_decision
  - scope_decision
  - dialog_assistant_approval_required
```

## Базовый каркас (`base_skeleton`)

```text
manifest_id: WRK-AWG-0001
manifest_version: 1
created_at: 2026-05-10T00:00:00+04:00
created_by: dialog_assistant
task_id: TASK-XXXX
user_intent: <короткая формулировка задачи>
session_id: <worker-session-id>
job_id: <job-id>
group_id: <worker-group-id>
profile_id: <profile-id>
profile_revision: <sha1-or-tag>
role: <role-card-path-or-id>
mission: <bounded mission>
source_of_truth: assignment_manifest
contour_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/rules/...
complexity_tier: small|standard|complex/high-risk
model: gpt-5.3-codex-spark|gpt-5.3-codex|advanced_current
model_justification: <why>
model_availability: available|fallback_used
context_budget:
  remaining_tokens: <int>
  expected_delta: <int>
  margin_tokens: <int>
  safety_margin_percent: <int>
reuse_or_spawn: reuse|spawn|split
scope_narrowing_reason: <short reason>
allowed_paths:
  - .ai/...
forbidden_paths:
  - .git/**
  - node_modules/**
create_paths:
  - .ai/...
edit_paths:
  - .ai/...
delete_paths: []
delete_authorized: false
rules:
  - .ai/rules/...
checks:
  - .ai/checks/...
workflows:
  - .ai/workflows/core/worker-assignment/WORKFLOW.md
skills:
  - .codex/skills/...
expected_output: <short artifact/path>
stop_condition: <порог по рискам или blocker>
result_path: .ai/reports/...
result_visibility: user-visible|internal|private
risk_summary: <short risks or none>
handoff_ready_evidence: blocker|result_ready|needs-review
coordinator_chain:
  - returns_to: dialog_assistant
    owner_layer: .ai/workflows/core/worker-assignment/
    previous_session_id: dialog-assistant
    next_session_id: <worker-session-id>
    reason: "bounded assignment handoff"
decision_log:
  - model_decision: <short>
  - context_decision: <short>
  - scope_decision: <short>
  - dialog_assistant_approval_required: true|false
```

## Заполнение (`fill_rules`)

- Если `reuse_or_spawn=spawn|split`, указать `group_id` и `previous_session_id`.
- Если `delete_paths` непустой, `delete_authorized` обязан быть `true` и иметь
  отдельную reason.
- `model` обязан соответствовать `RULE-WORKER-MODEL-SELECTION`.
- `scope_narrowing_reason` обязателен для всех случаев с не-default scope.
