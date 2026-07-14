# Observation: MCP operating layer gap

```yaml
artifact_id: OBS-20260618-mcp-operating-layer-gap
artifact_type: agents-evolution-observation
owner_layer: .ai/agents-evolution/observations/
status: captured
source_event: user correction that MCP is not configured or is incorrectly represented in the working AI-layer
entrypoint: user_correction
change_target_candidate: tooling
related_change_targets:
  - rule
  - check
  - workflow
  - role
  - skill
  - documentation
fingerprint: mcp-layer-has-fallback-but-no-operating-model
recurrence_key: ai-layer/mcp-tooling/operating-model-missing
evidence_refs:
  - .codex/config.toml
  - .codex/STRUCTURE.md
  - .ai/rules/external-tools/RULE-MCP-FALLBACK-FOR-EXTERNAL-WORKERS.md
  - .ai/checks/pre-implementation/CHECK-MCP-FALLBACK-FOR-EXTERNAL-WORKERS.md
  - .ai/registry/rules/external-tools/INDEX.md
forbidden_content_policy: no_raw_logs_no_tasks_no_private_reasoning
related_artifacts:
  - .ai/workflows/ai-operations/agents-evolution/WORKFLOW.md
  - .ai/roles/process-tools-operations/ai-evolution-steward/INDEX.md
```

## Факт

В рабочем AI-слое есть только отрицательный/fallback contract по MCP:
project-specific MCP servers не настроены, stale MCP entries из перенесённых
слоёв не восстанавливать, при недоступности tool фиксировать fallback reason.

При этом нет положительного MCP operating model:

- нет inventory/source of truth для project-specific, session-provided и
  plugin-provided MCP/tools;
- нет роли, которая владеет MCP/tooling contour;
- нет workflow для выбора MCP, проверки availability, fallback, установки или
  синхронизации Codex adapter layer;
- нет check, который подтверждает правильный MCP routing до handoff;
- `.codex/config.toml` фиксирует отсутствие project MCP, но слой не объясняет,
  как вводить новый MCP contour профессионально.

## Impact

Агент может ошибочно трактовать MCP как полностью отсутствующий blocker,
использовать fallback без проверки доступных tools или восстановить MCP из
старого проекта без owner-layer decision. Внешние worker-аудиты также не имеют
ясного контракта, когда MCP обязателен, когда допустим fallback и где
фиксировать evidence.

## Root Cause Candidate

При переносе слоя был решён риск stale MCP entries, но не создан новый
project-specific MCP/tooling operating model. Fallback-rule предотвращает
старый drift, но не задаёт полноценный путь развития MCP в текущем проекте.

## Dedup

Поиск по `.ai/agents-evolution/**` не нашёл существующего MCP observation или
proposal. Ближайшие active artifacts относятся к fallback, а не к настройке и
эксплуатации MCP contour.

## Proposed Next

Создать proposal на MCP/tooling foundation: роль или владелец contour,
workflow, rules/checks, registry sync, Codex adapter sync и документационный
контракт для подключения MCP без восстановления старых проектных assumptions.
