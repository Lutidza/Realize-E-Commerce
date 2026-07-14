# Reuse before local frontend implementation

```yaml
rule_id: RULE-REUSE-BEFORE-LOCAL-IMPLEMENTATION
title: Reuse before local frontend implementation
owner_role: .ai/roles/developer/frontend/INDEX.md
applies_to:
  - src/app/**
  - src/ui/**
  - src/domain/routes/**
trigger:
  - создаётся или меняется route, page, layout, component, style or client behavior
requirement:
  - найти существующий pattern через rg до новой реализации
  - выбрать существующий owner-layer, если он уже есть
  - создавать новый component/style/behavior только после owner decision
forbidden:
  - копировать похожую React/UI/route логику без поиска existing pattern
  - создавать второй локальный вариант repeated UI/behavior
checks:
  - .ai/checks/development/frontend/CHECK-REUSE-BEFORE-LOCAL-IMPLEMENTATION.md
related_tools:
  - rg
```

## Контракт

Перед локальной frontend-правкой агент проверяет:

- похожие routes/pages in `src/app/**`;
- shared UI/layout components in `src/ui/**`;
- route/SRP helpers in `src/domain/routes/**`;
- existing shadcn/Radix/lucide usage in project UI.

Если existing owner найден, правка идёт туда или требуется explicit reason,
почему локальный owner корректен.
