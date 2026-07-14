# Agent Search Tool

```yaml
artifact_id: agent-search-tool
artifact_type: ai-search-tool
owner_layer: .ai/tools/agent-search/
runtime_rule: .ai/rules/development/RULE-SEARCH-SCOPE-DISCIPLINE.md
runtime_check: .ai/checks/pre-implementation/CHECK-SEARCH-SCOPE-DISCIPLINE.md
status: active
```

## Commands

```bash
npm --prefix .ai/tools/agent-search run search -- --mode=code "catalog"
npm --prefix .ai/tools/agent-search run search -- --mode=payload Product
npm --prefix .ai/tools/agent-search run search -- --mode=next-routes searchParams
npm --prefix .ai/tools/agent-search run search -- --mode=ui SearchProfiles
npm --prefix .ai/tools/agent-search run search -- --mode=search-layer elastic
npm --prefix .ai/tools/agent-search run search -- --mode=migrations up
npm --prefix .ai/tools/agent-search run search -- --mode=docs project-contract
npm --prefix .ai/tools/agent-search run search -- --mode=code-docs "company details"
npm --prefix .ai/tools/agent-search run search -- --mode=ai RULE-SEARCH-SCOPE-DISCIPLINE
npm --prefix .ai/tools/agent-search run search -- --mode=codex frontend-runtime-evidence
npm --prefix .ai/tools/agent-search run search -- --mode=ai-active RULE-NO-HISTORICAL-NOISE
npm --prefix .ai/tools/agent-search run search -- --mode=reference --reason=visual-reference company-create-wizard
npm --prefix .ai/tools/agent-search run search -- --mode=special --path=.gitignore --reason=ignore-policy node_modules
```

Use `--dry-run=true` to print the resolved `rg` command without running it.
