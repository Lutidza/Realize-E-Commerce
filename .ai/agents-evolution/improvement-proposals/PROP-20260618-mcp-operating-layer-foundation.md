# Proposal: MCP operating layer foundation

```yaml
artifact_id: PROP-20260618-mcp-operating-layer-foundation
artifact_type: agents-evolution-improvement-proposal
owner_layer: .ai/agents-evolution/improvement-proposals/
status: accepted
source_observation: OBS-20260618-mcp-operating-layer-gap
change_target: tooling
related_change_targets:
  - rule
  - check
  - workflow
  - role
  - skill
  - documentation
fingerprint: mcp-layer-has-fallback-but-no-operating-model
recurrence_key: ai-layer/mcp-tooling/operating-model-missing
target_owner_layers:
  - .ai/roles/process-tools-operations/
  - .ai/workflows/ai-operations/
  - .ai/rules/external-tools/
  - .ai/checks/pre-implementation/
  - .ai/registry/rules/external-tools/
  - .codex/
  - documentation/
allowlist_create:
  - .ai/roles/process-tools-operations/mcp-tooling-steward/INDEX.md
  - .ai/workflows/ai-operations/mcp-tooling/INDEX.md
  - .ai/workflows/ai-operations/mcp-tooling/WORKFLOW.md
  - .ai/rules/external-tools/RULE-MCP-TOOLING-CONTOUR.md
  - .ai/checks/pre-implementation/CHECK-MCP-TOOLING-CONTOUR.md
  - documentation/architecture/mcp-tooling.md
allowlist_edit:
  - .ai/roles/role-groups.md
  - .ai/workflows/INDEX.md
  - .ai/registry/rules/INDEX.md
  - .ai/registry/rules/external-tools/INDEX.md
  - .ai/rules/external-tools/RULE-MCP-FALLBACK-FOR-EXTERNAL-WORKERS.md
  - .ai/checks/pre-implementation/CHECK-MCP-FALLBACK-FOR-EXTERNAL-WORKERS.md
  - .codex/config.toml
  - .codex/README.md
  - .codex/STRUCTURE.md
allowlist_delete: []
verification_plan:
  - rg MCP/mcp self-scan across .ai .codex documentation
  - git diff --check
  - rg for stale external-project MCP names after implementation
  - verify registry, role mapper, workflow index and Codex adapter links
code_fix_handoff: []
```

## Решение

Создать явный MCP/tooling contour вместо текущей модели "MCP не настроен,
используй fallback". Новый contour должен описывать:

1. Какие MCP/tools относятся к проекту, какие приходят из runtime session, а
   какие из plugins/connectors.
2. Где хранится source of truth для project-specific MCP config.
3. Как агент выбирает MCP/tool под задачу.
4. Как проверяется availability.
5. Когда fallback допустим, а когда является blocker.
6. Как вводить новый MCP server без восстановления старого project drift.
7. Как синхронизируются `.ai` rules/checks/workflows с `.codex` adapter layer.

## Proposed Active Artifacts

- `MCP Tooling Steward`: роль-владелец MCP/tooling contour.
- `mcp-tooling` workflow: entrypoints, tool selection, availability check,
  fallback/blocker decision, install/config sync, handoff.
- `RULE-MCP-TOOLING-CONTOUR`: active rule для project/session/plugin MCP
  boundaries.
- `CHECK-MCP-TOOLING-CONTOUR`: pass/fail check для MCP selection и fallback.
- `documentation/architecture/mcp-tooling.md`: project-facing описание MCP
  contour без хранения secrets или runtime state.

## Acceptance Criteria

- Агент больше не видит только fallback-rule как весь MCP contract.
- Для MCP задачи есть owner-role, workflow, rule, check и registry routing.
- `.codex/config.toml` остаётся adapter config, а не единственным объяснением
  MCP policy.
- Новый MCP server можно добавить только через owner-layer, dependency/version
  evidence и Codex adapter sync.
- Missing MCP фиксируется как explicit blocker или fallback decision, а не как
  скрытая причина пропуска проверки.
- Self-scan не находит stale MCP assumptions из других проектов.

## Risks

- Нельзя преждевременно добавлять реальные MCP servers без понимания
  project contour, secret handling и runtime support.
- Нужно не смешать project-specific MCP config с session-provided tools текущей
  среды.
- Нужно сохранить возможность fallback, но убрать fallback как единственный
  contract.
