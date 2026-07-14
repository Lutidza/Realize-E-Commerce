# Check: no related UI drift

```yaml
check_id: CHECK-NO-RELATED-UI-DRIFT
owner_layer: .ai/checks/development/frontend/
related_rule:
  - .ai/rules/development/frontend/RULE-NO-RELATED-UI-DRIFT.md
required_output:
  - changed_shared_owner
  - affected_surfaces
  - unrelated_surfaces_at_risk
  - verification_method
  - decision
```

## Pass Condition

- Affected frontend surfaces перечислены.
- Unrelated drift либо исключён, либо зафиксирован как risk/blocker.
