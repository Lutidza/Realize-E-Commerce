# Workflow MCP/tooling contour (`mcp_tooling_workflow`)

```yaml
artifact_id: mcp-tooling-workflow
artifact_type: ai-workflow
owner_layer: .ai/workflows/ai-operations/mcp-tooling/
runtime_sources:
  - .ai/roles/process-tools-operations/mcp-tooling-steward/INDEX.md
  - .ai/rules/external-tools/RULE-MCP-TOOLING-CONTOUR.md
  - .ai/checks/pre-implementation/CHECK-MCP-TOOLING-CONTOUR.md
  - documentation/architecture/mcp-tooling.md
related_codex_artifacts:
  - .codex/config.toml
  - .codex/README.md
  - .codex/STRUCTURE.md
```

## Назначение

Workflow задаёт рабочий порядок для MCP и внешних tools. Он не добавляет
конкретные MCP servers сам по себе и не делает session-provided tools
проектным контрактом.

## Точки входа

- Пользователь просит использовать конкретный MCP, plugin или connector.
- Rule/check/workflow требует tool-dependent evidence.
- Worker profile, audit или review ссылается на MCP/tool.
- Нужно добавить, удалить или изменить project-specific MCP config.
- Tool недоступен, и нужно выбрать fallback или blocker.
- Найден drift между `.ai` MCP policy и `.codex` adapter layer.

## Источники tools

- `project_specific`: явно настроено в `.codex/config.toml`.
- `session_provided`: доступно текущей средой выполнения, но не хранится как
  project contract.
- `plugin_provided`: поставляется установленным plugin.
- `connector`: подключается через connector/app runtime.
- `local_tool`: доступно как CLI, script, browser, database или test tool.
- `fallback`: замена, достаточная для задачи при documented skip/fallback
  reason.

## Порядок

```text
tool_need
-> classify_source_type
-> locate_source_of_truth
-> availability_check
-> select_tool_or_fallback
-> execute_or_block
-> record_evidence
-> sync_ai_codex_docs_if_changed
```

## Availability check

Перед использованием MCP/tool агент фиксирует:

- какой tool нужен и для чего;
- source type;
- где находится source of truth;
- доступен ли tool в текущей среде;
- какой fallback допустим;
- является ли отсутствие tool blocker-ом.

## Project-specific MCP config

Project-specific MCP config живёт в `.codex/config.toml`. Изменять его можно
только после:

- owner-layer decision;
- проверки dependency/version evidence, если добавляется новый server/package;
- secret handling decision;
- синхронизации `.ai/rules`, `.ai/checks`, registry, workflow и
  `documentation/architecture/mcp-tooling.md`.

## MCP self-scan

`MCP self-scan` - это обязательная discoverability/drift проверка при
добавлении или изменении MCP/tooling contour. Минимальный scan:

- найти MCP references в `.ai`, `.codex` и `documentation`;
- проверить, что MCP references маршрутизируются к role, workflow, rule,
  check, registry и `.codex/config.toml`;
- проверить отсутствие transferred project-specific MCP entries, старых
  project names, stale paths, secrets или tokenized config;
- подтвердить, что `.codex/config.toml` либо содержит согласованные
  project-specific MCP entries, либо явно фиксирует их отсутствие.

Результат scan фиксируется как `mcp_reference_scan` и
`stale_mcp_assumption_scan`.

## Fallback policy

Fallback допустим, если:

- задача не требует именно project-specific MCP;
- replacement evidence покрывает требуемую проверку;
- skip/fallback reason явно записан в результате.

Fallback запрещён, если:

- tool является source of truth для задачи;
- без него результат будет предположением;
- missing tool скрывает реальный blocker.

## Handoff

Результат workflow должен содержать:

- selected MCP/tool или blocker;
- source type;
- availability status;
- mcp reference/stale assumption scan, если меняется MCP contour;
- evidence или fallback reason;
- affected `.ai`/`.codex` sync decision;
- residual risks.
