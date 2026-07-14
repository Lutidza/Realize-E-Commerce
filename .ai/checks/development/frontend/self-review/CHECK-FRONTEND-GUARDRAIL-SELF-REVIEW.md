# Check: frontend guardrail self-review

```yaml
check_id: CHECK-FRONTEND-GUARDRAIL-SELF-REVIEW
owner_layer: .ai/checks/development/frontend/self-review/
applies_to:
  - frontend implementation diff
related_rules:
  - .ai/rules/development/frontend/RULE-NEXT-REACT-FRONTEND-BOUNDARIES.md
  - .ai/rules/development/frontend/RULE-REUSE-BEFORE-LOCAL-IMPLEMENTATION.md
  - .ai/rules/development/frontend/RULE-NO-LOCAL-VISUAL-CONTRACT.md
  - .ai/rules/development/frontend/RULE-NO-RELATED-UI-DRIFT.md
required_output:
  - changed_files
  - owner_layer_confirmed
  - stale_stack_terms_absent
  - checks_run_or_skipped
  - residual_risks
```

## Pass Condition

- Diff не содержит stale assumptions from another project stack.
- Next/React boundary соблюдён.
- Проверки выполнены или пропущены с причиной.
