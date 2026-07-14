# Check: reuse before local frontend implementation

```yaml
check_id: CHECK-REUSE-BEFORE-LOCAL-IMPLEMENTATION
owner_layer: .ai/checks/development/frontend/
related_rule:
  - .ai/rules/development/frontend/RULE-REUSE-BEFORE-LOCAL-IMPLEMENTATION.md
required_output:
  - target_surface
  - searched_paths
  - existing_patterns
  - selected_owner_layer
  - local_reason_if_any
  - decision
```

## Pass Condition

- Выполнен `rg` или эквивалентный scan по affected frontend contour.
- Existing pattern либо выбран как owner, либо явно объяснён local exception.
- Новый owner не дублирует существующий partial/script/style/component.
