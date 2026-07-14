# RAG context pack gate (`rag_context_pack`)

```yaml
artifact_id: agents-evolution-gate-rag-context-pack
artifact_type: ai-workflow-gate
owner_layer: .ai/workflows/ai-operations/agents-evolution/gates/
owner_role: .ai/roles/process-tools-operations/ai-evolution-steward/INDEX.md
related_tools:
  - rg
  - .ai/tools/agent-search/
```

## Назначение

Gate формирует минимальный retrieval pack для LLM-агента перед решением об
эволюции. Агент не должен читать весь AI-layer или писать новое правило без
поиска релевантных существующих artifacts.

## Retrieval sources

- role mapper и применимые role cards;
- active rules/checks/workflows из registry;
- related Codex skills/prompts/agents;
- `.ai/agents-evolution/observations/**`;
- `.ai/agents-evolution/improvement-proposals/**`;
- `.ai/agents-evolution/applied-changes/**`;
- canonical docs в `documentation/**`;
- релевантные code patterns через `rg` или `.ai/tools/agent-search/`.

## Выход

- opened artifacts;
- rejected artifacts with reason;
- matching historical fingerprints;
- missing retrieval blockers;
- context pack summary для proposal/root-cause step.
