# Workflow: Next/React frontend guardrail

```yaml
workflow_id: frontend-next-react-guardrail
owner_layer: .ai/workflows/frontend/next-react/guardrail/
applies_to:
  - src/app/**
  - src/ui/**
  - src/domain/routes/**
related_role:
  - .ai/roles/developer/frontend/INDEX.md
related_rules:
  - .ai/rules/development/frontend/RULE-NEXT-REACT-FRONTEND-BOUNDARIES.md
  - .ai/rules/development/frontend/RULE-REUSE-BEFORE-LOCAL-IMPLEMENTATION.md
  - .ai/rules/development/frontend/RULE-REFERENCE-PATTERN-SCAN-BEFORE-IMPLEMENTATION.md
  - .ai/rules/development/frontend/RULE-NO-LOCAL-VISUAL-CONTRACT.md
  - .ai/rules/development/frontend/RULE-NO-RELATED-UI-DRIFT.md
```

## States

1. Intake: определить affected route/page/component/style and expected behavior.
2. Owner decision: выбрать route, shared UI component, layout, theme, route
   helper or backend data owner.
3. Reuse/reference scan: найти существующий pattern in `src/app/**`,
   `src/ui/**` and `src/domain/routes/**`.
4. Boundary gate: проверить Server/Client Component boundary and data/API
   ownership.
5. Runtime evidence decision: выбрать static, build, browser or screenshot
   evidence.
6. Implementation handoff: зафиксировать allowlist and checks.
7. Self-review: проверить diff на drift, stale paths and scope creep.

## Stop Conditions

- Правильный owner находится вне allowlist.
- Изменение требует нового UI dependency or shared design contract without
  approval.
- UI role needs to change API/search/Payload contract without backend role.
- Нужен browser/rendered evidence, но route нельзя запустить и fallback reason
  не зафиксирован.
