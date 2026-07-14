# Проверка cleanup active stale artifacts после refactor/migration

```yaml
check_id: CHECK-STALE-ARTIFACT-CLEANUP-AFTER-REFACTOR
title: Проверка cleanup active stale artifacts после refactor/migration
owner_role: Владелец области изменений и контура
applies_to:
  - self-review
  - code-review
  - docs-sync
  - .ai/rules/scope-control/RULE-STALE-ARTIFACT-CLEANUP-AFTER-REFACTOR.md
trigger:
  - срабатывает RULE-STALE-ARTIFACT-CLEANUP-AFTER-REFACTOR
required_output:
  - trigger
  - changed_owner
  - retired_names_paths_identifiers
  - scan_commands
  - application_contour_hits
  - documentation_contour_hits
  - development_environment_hits
  - compatibility_bridges_proxies_reexports_found
  - active_stale_artifacts_cleaned
  - historical_evidence_kept
  - false_positives
  - blocked_or_deferred_items
  - user_approved_deferral
pass_condition:
  - old names, paths and public identifiers were scanned
  - application contour was checked first when applicable
  - every hit was classified
  - active consumers were moved to the new owner directly instead of leaving compatibility bridges, proxy wrappers, re-export wrappers, alias entrypoints or fallback adapters
  - active stale artifacts were removed or synced inside the approved allowlist
  - out-of-scope cleanup was stopped for approval or explicitly deferred by the user
fail_condition:
  - scan evidence is missing
  - active stale code artifact remains without user-approved deferral
  - compatibility bridge, proxy wrapper, re-export wrapper, alias entrypoint or fallback adapter remains after refactor without a separate user-approved migration contract
  - old path/name hits are unclassified
  - historical evidence was deleted without artifact-disposition approval
  - cleanup requires allowlist expansion but no approval was requested
related_rule:
  - .ai/rules/scope-control/RULE-STALE-ARTIFACT-CLEANUP-AFTER-REFACTOR.md
related_tools:
  - rg
  - rg --files
  - git diff --name-status
```

## Когда выполнять

Проверка обязательна перед финальным handoff, если шаг:

- переносит, переименовывает, удаляет или заменяет файл, папку или owner-layer;
- меняет route, API, DTO, request/response contract, service, action,
  controller, component, hook, helper, config key, import path или test owner;
- переносит workflow, skill, agent, prompt, registry, template или MCP/tooling
  artifact;
- синхронизирует canonical documentation после contract-level изменения.

## Минимальный scan

Агент выбирает targeted scan по фактическому изменению и показывает команды в
handoff:

- `rg` по старым именам, путям, imports, routes, config keys и public
  identifiers;
- `rg` по old owner path плюс `bridge`, `proxy`, `re-export`, `alias`,
  `fallback`, `compatibility` и локальным русским эквивалентам, если refactor
  мог оставить прослойку совместимости;
- `rg --files` по старым file/folder patterns;
- `git diff --name-status` для проверки renamed/deleted/created paths;
- дополнительные профильные проверки, если stale artifact может жить в
  framework-specific registry, route list, build config, tests или generated
  references.

## Приоритет контуров

1. `application contour`: `app/`, `routes/`, `resources/`, `public/`,
   `config/`, `database/`, `tests/`.
2. `canonical documentation contour`: `documentation/`, root `README.md`,
   `AGENTS.md`, references.
3. `development environment contour`: `.ai/`, `.codex/`, MCP/tooling,
   workflow, skill, agent, prompt, registry, template.

## Результат

- `passed` — scan выполнен, все hits классифицированы, active stale artifacts
  очищены или имеют explicit user-approved deferral.
- `stop-for-cleanup` — active stale artifacts найдены в allowlist и должны быть
  очищены до handoff.
- `stop-for-scope-approval` — cleanup требует расширения allowlist.
- `failed` — нет evidence, есть unclassified hits или active stale code artifact
  оставлен без решения.
