# Проверка отсутствия скрытого local visual contract

```yaml
check_id: CHECK-NO-LOCAL-VISUAL-CONTRACT
owner_layer: .ai/checks/development/frontend/
related_rule:
  - .ai/rules/development/frontend/RULE-NO-LOCAL-VISUAL-CONTRACT.md
required_output:
  - target_file_or_surface
  - proposed_component_style_or_wrapper
  - layout_only_or_contract
  - existing_owner_search
  - selected_owner_layer
  - shared_ui_risk
  - decision
```

## Pass Condition

- Правка классифицирована как local layout или reusable contract.
- Проверены existing owners in `src/ui`, route layouts and theme.
- Новый visual/behavior owner не дублирует существующий shared UI pattern.
