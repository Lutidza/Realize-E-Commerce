# No related UI drift

```yaml
rule_id: RULE-NO-RELATED-UI-DRIFT
owner_role: .ai/roles/developer/frontend/INDEX.md
applies_to:
  - Next.js routes
  - React components
  - shared UI/layout/theme owners
  - route/search UI contracts
trigger:
  - правка может изменить несколько страниц, components or shared owners
requirement:
  - определить связанные routes/components/layouts
  - ограничить change set allowlist
  - проверить, что unrelated UI не меняется
forbidden:
  - менять shared owner без оценки affected surfaces
  - исправлять один экран через owner, который ломает другие
checks:
  - .ai/checks/development/frontend/CHECK-NO-RELATED-UI-DRIFT.md
```

## Контракт

Любая правка shared component, layout, theme, route helper or search UI contract
требует списка affected surfaces и проверки drift.
