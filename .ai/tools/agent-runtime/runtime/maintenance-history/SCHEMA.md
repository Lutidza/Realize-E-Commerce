# Схема maintenance report

```yaml
artifact_id: agent-runtime-maintenance-history-schema
artifact_type: ai-runtime-artifact-schema
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/tools/agent-runtime/runtime/maintenance-history/
source_spec: documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
writer: .ai/tools/agent-runtime/bin/agent-runtime.mjs
```

## JSON schema contract

```json
{
  "schema_version": "1.0.0",
  "artifact_type": "agent-runtime-maintenance-report",
  "report_id": "amr_YYYYmmddHHMMSS_xxxxxx",
  "created_at": "YYYY-MM-DDTHH:MM:SSZ",
  "created_by": {
    "actor_role": "dialog_assistant",
    "actor_session_id": "dialog-assistant"
  },
  "runtime_store": ".ai/tools/agent-runtime/runtime/runtime.sqlite",
  "policy_trigger": "changed_runtime_maintenance_artifacts",
  "mode": "audit_only",
  "decision": "passed",
  "summary": "short operator summary",
  "dry_run_summary": {},
  "cleanup_summary": {},
  "active_rows_report": {
    "legacy_terminal_jobs_without_actor_evidence": 0
  },
  "cutoffs": {},
  "projection": {},
  "related_artifacts": []
}
```

## Обязательные поля

- `schema_version` - версия схемы отчёта.
- `artifact_type` - всегда `agent-runtime-maintenance-report`.
- `report_id` - безопасный идентификатор отчёта.
- `created_at` - ISO-8601 UTC timestamp.
- `created_by.actor_role` или `created_by.actor_session_id` - actor
  Dialog Assistant-а.
- `runtime_store` - проверяемый runtime store.
- `policy_trigger` - причина запуска maintenance workflow.
- `mode` - `audit_only`, `cleanup_allowed`, `projection_refresh` или
  `full_maintenance`.
- `decision` - `passed`, `failed` или `blocked`.
- `dry_run_summary` - объект из `retention-cleanup --dry-run=true`.
- `active_rows_report` - объект из `active-rows-report`.
  Поле `legacy_terminal_jobs_without_actor_evidence`, если присутствует,
  означает historical/process debt по terminal jobs без actor evidence. Оно не
  является active blocker без активных lifecycle/notification/message rows.

## Опциональные поля-объекты

- `cleanup_summary` - результат cleanup apply, если он выполнялся.
- `cutoffs` - явно заданные retention cutoffs.
- `projection` - информация о projection refresh.
- `related_artifacts` - список путей к связанным workflow/rule/check/spec/tool
  artifacts.

## Ограничения

- JSON создаётся только `maintenance-report-write`.
- Объектные поля должны быть JSON object, `related_artifacts` - JSON list.
- Отчёт не содержит secrets, raw private reasoning, скрытые рассуждения,
  production dumps или чувствительные raw transcripts.
