# Контракт отчёта проверки (`verification_report_output`)

```yaml
artifact_id: agents-evolution-output-verification-report
artifact_type: ai-workflow-output
owner_layer: .ai/workflows/ai-operations/agents-evolution/outputs/
```

## Обязательные поля (`required_fields`)

- verified change;
- prevented failure;
- evidence;
- pass/fail/deferred decision;
- regression check decision;
- retrieval/RAG visibility decision;
- follow-up;
- scoped status, если проверка выполнялась в dirty worktree.
