# Workflow развития агентов (`agents_evolution_workflow`)

```yaml
artifact_id: agents-evolution-workflow
artifact_type: ai-workflow
owner_layer: .ai/workflows/ai-operations/agents-evolution/
runtime_sources:
  - .ai/agents-evolution/INDEX.md
  - .ai/README.md
  - .ai/roles/process-tools-operations/ai-evolution-steward/INDEX.md
  - .ai/workflows/ai-operations/agents-evolution/gates/issue-target-classification.md
  - .ai/workflows/ai-operations/agents-evolution/gates/recurrence-deduplication.md
  - .ai/workflows/ai-operations/agents-evolution/gates/rag-context-pack.md
related_artifacts:
  - .ai/agents-evolution/
  - .ai/rules/
  - .ai/checks/
  - .ai/workflows/
  - .ai/templates/
  - .codex/skills/
```

## Назначение (`purpose`)

Файл фиксирует runtime contract процесса evidence-based развития AI-агентов.
Цель workflow - уменьшать повторяемые ошибки агентов на реальном проекте, а не
механически добавлять новые инструкции.

Workflow допускает только sanitized evolution artifacts внутри
`.ai/agents-evolution/**`. Active behavior меняется в своих owner-layer:
`.ai/rules/**`, `.ai/checks/**`, `.ai/workflows/**`, `.codex/**` или
`documentation/**`.

## Точки входа (`entrypoints`)

Evolution intake запускается при одном из сигналов:

- user correction: пользователь указал, что агент нарушил правило, стек,
  owner-layer, workflow или сделал неверный вывод;
- agent self-review: агент сам обнаружил нарушение рабочего слоя;
- failed verification: test, lint, build, typecheck, browser/runtime evidence
  или review показали проблему;
- rule/check violation: активное rule/check не выполнено;
- drift scan: найден stale stack, stale path, registry/skill/workflow drift;
- repeated friction: один и тот же вопрос, blocker или ручная правка
  повторяется в разных задачах;
- architecture gap: в проекте появился устойчивый контур без роли, rule,
  check, workflow, skill или tooling support.

## Target decision

На intake агент обязан ответить: что нужно менять?

- `code` - исправить ошибку в product code, schema, tests, config или runtime
  behavior;
- `rule` - добавить или уточнить обязательный guardrail;
- `check` - добавить pass/fail gate;
- `workflow` - изменить порядок действий, gates или handoff;
- `role` - создать или уточнить owner responsibility;
- `skill` - исправить Codex skill/prompt/agent adapter;
- `documentation` - синхронизировать canonical docs;
- `tooling` - добавить/исправить script, search mode, runtime или monitor tool;
- `mixed` - требуется и code fix, и AI-layer change;
- `none` - шум, false positive или единичный случай без системного вывода.

Если сигнал затрагивает несколько не-code targets, агент выбирает primary
`change_target` и перечисляет `related_change_targets`. `mixed` используется,
когда требуется одновременно code fix и AI-layer change.

Code defect не должен автоматически превращаться в новое правило. Evolution
фиксирует code defect только если есть evidence, что текущий AI-layer не смог
его предотвратить или направить к правильному owner.

## Текущий порядок (`current_order`)

```text
signal
-> intake
-> evidence_required
-> issue_target_classification
-> recurrence_deduplication
-> rag_context_pack
-> root_cause_analysis
-> owner_layer_selection
-> outcome_route
   -> code_fix_handoff
   -> observation_capture
   -> proposal_authoring
   -> deferred_or_rejected
-> scoped_change
-> verification
-> applied_change_record
-> documentation_sync
-> retrieval_update
```

## Outcome routes

- `code_fix_handoff`: передать профильной роли Developer Frontend,
  Developer Backend или другой owner role. Evolution artifact создаётся только
  при AI-layer gap.
- `observe`: сохранить sanitized observation без изменения active behavior.
- `propose`: создать bounded proposal с owner-layer, allowlist, acceptance
  criteria и verification plan.
- `apply`: применить accepted proposal в owner-layer.
- `defer`: отложить proposal с условием возврата, не создавая active role/rule.
- `reject`: закрыть noise, duplicate или unsupported proposal.
- `needs-more-context`: остановиться до evidence или user decision.

## RAG/context pack

Перед proposal или active change агент собирает минимальный context pack:

- role mapper и применимые role cards;
- active rules/checks/workflows из registry;
- related `.codex/skills/**`, prompts или agents;
- matching observations/proposals/applied changes;
- canonical docs из `documentation/**`;
- relevant code patterns через `rg` или `.ai/tools/agent-search/`.

Context pack должен быть маленьким и explainable: агент перечисляет, что открыл,
что отверг и почему. Полное чтение всего AI-layer не считается качественным RAG.

## Условия остановки (`stop_conditions`)

Workflow останавливается, если:

- owner-layer изменения не определён;
- target artifact находится вне согласованного allowlist;
- не выбран target decision: code, rule, check, workflow, role, skill,
  documentation, tooling, mixed или none;
- evidence отсутствует и нет явного missing-evidence blocker;
- recurrence/dedup scan не выполнен для proposal;
- evolution artifact пытается сохранить raw worker output, `.ai/tasks` content,
  task-origin data, private reasoning, runtime dump, production dump или secrets;
- изменение пытается восстановить старый шумный lifecycle-формат вместо
  sanitized observation/proposal/applied-change.

## Контракт закрытия (`closure_contract`)

Результат изменения AI-layer фиксируется в двух местах:

- active behavior в owner-layer текущего шага: `.ai/rules/*`,
  `.ai/checks/*`, `.ai/workflows/*`, `.ai/templates/*`, `.codex/skills/*`,
  `documentation/*` или другом явно согласованном месте;
- sanitized trace в `.ai/agents-evolution/**`, если изменение является
  evolution текущего AI-layer.

Closure artifact обязан перечислить changed paths, checks, residual risks и
follow-up blockers без raw logs и task-origin data.

## Retrieval update

После applied change нужно убедиться, что будущий агент сможет найти изменение:

- registry, role mapper, workflow index или skill links обновлены;
- observation/proposal/applied trace содержит fingerprint и prevented failure;
- устаревшие инструкции удалены или явно помечены historical-only;
- RAG/search путь к новому artifact проверен через `rg` или
  `.ai/tools/agent-search/`.
