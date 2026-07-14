# Запрет скрытого локального visual contract

```yaml
rule_id: RULE-NO-LOCAL-VISUAL-CONTRACT
owner_role: .ai/roles/developer/frontend/INDEX.md
applies_to:
  - src/app/**
  - src/ui/**
  - src/ui/theme/**
trigger:
  - добавляется class, style, wrapper, component variant or repeated behavior
  - локальная правка задаёт повторяемый visual/behavior contract
requirement:
  - отличить layout-only правку от reusable visual contract
  - проверить существующий owner в shared UI, layout, theme or shadcn wrapper
  - выбрать owner-layer до изменения
forbidden:
  - создавать hidden design system внутри одной страницы
  - дублировать repeated visual behavior в нескольких местах
  - обходить существующие shadcn/Radix/lucide conventions локальным DOM
checks:
  - .ai/checks/development/frontend/CHECK-NO-LOCAL-VISUAL-CONTRACT.md
related_tools:
  - rg
```

## Контракт

Локальный `class`, wrapper, component variant or client behavior допустим только
если он не становится повторяемым проектным visual/behavior contract.
Повторяемый contract должен жить в корректном owner-layer: shared component,
layout, theme token, shadcn wrapper, route helper or explicit domain UI owner.
