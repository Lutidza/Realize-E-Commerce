---
name: frontend-guardrail-audit
description: >-
  Используй для отдельного read-only аудита frontend-долга Realize-E-Commerce:
  duplicated React UI, hidden local visual contracts, route/component drift,
  client boundary issues and missing browser evidence.
---

# Аудит frontend guardrail

Используй skill только для read-only аудита. Product code не меняется без
отдельного pre-edit gate.

## Что открыть

1. `documentation/project-context.md`
2. `.ai/roles/developer/frontend/INDEX.md`
3. `.ai/workflows/frontend/next-react/guardrail/WORKFLOW.md`
4. `.ai/registry/rules/development/frontend/INDEX.md`
5. `.ai/templates/agent-reports/TEMPLATE-FRONTEND-GUARDRAIL-AUDIT.md`
6. `.ai/checks/self-review/CHECK-FRONTEND-GUARDRAIL-AUDIT-REPORT.md`

## Рабочий порядок

1. Зафиксируй audit scope and read-only mode.
2. Найди affected route/page/component/style owners.
3. Проверь duplicates and drift через `rg`.
4. Для каждого finding укажи файл, evidence, violated rule/check, correct
   owner-layer and next step.
5. Не расширяй scope за пределы audit request.

## Ограничения

- Не редактируй product code in audit mode.
- Не создавай new rules/checks inside audit step.
- Не применяй assumptions from another stack к текущему frontend contour.
