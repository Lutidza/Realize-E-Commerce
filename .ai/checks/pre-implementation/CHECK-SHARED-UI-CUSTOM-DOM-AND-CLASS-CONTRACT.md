# Check: shared UI custom DOM and class contract

```yaml
check_id: CHECK-SHARED-UI-CUSTOM-DOM-AND-CLASS-CONTRACT
owner_layer: .ai/checks/pre-implementation/
applies_to:
  - frontend shared UI or repeated visual behavior
related_rule:
  - .ai/rules/development/frontend/RULE-NO-LOCAL-VISUAL-CONTRACT.md
```

## Назначение

Проверка защищает текущий Next.js/React frontend от скрытого создания нового
design system через локальные DOM/class contracts.

## Required Output

- target UI surface;
- repeated behavior or one-off layout;
- existing owner search;
- selected owner-layer;
- local exception reason, if any;
- decision.
