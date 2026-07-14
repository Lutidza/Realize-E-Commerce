# Reference pattern scan before implementation

```yaml
rule_id: RULE-REFERENCE-PATTERN-SCAN-BEFORE-IMPLEMENTATION
owner_role: .ai/roles/developer/frontend/INDEX.md
applies_to:
  - frontend reference work
  - screenshot parity
  - existing page parity
trigger:
  - задача просит сделать как в референсе, скриншоте, существующей странице или макете
requirement:
  - определить точный reference source
  - найти текущие аналоги в Next routes, React UI components, theme and docs
  - сравнить literal differences до правки
forbidden:
  - импровизировать UI при наличии reference
  - менять unrelated UI surfaces без allowlist
checks:
  - .ai/checks/development/frontend/CHECK-REFERENCE-PATTERN-SCAN-BEFORE-IMPLEMENTATION.md
related_codex_artifacts:
  - .codex/skills/reference-to-implementation/SKILL.md
```

## Контракт

Если есть reference, сначала формируется mismatch map: source, current analog,
layer mismatch, owner-layer, verification method.
