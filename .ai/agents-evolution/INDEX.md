# Индекс эволюции агентов (`agents-evolution-index`)

```yaml
artifact_id: agents-evolution-index
artifact_type: ai-evidence-directory-index
owner_layer: .ai/agents-evolution/
runtime_sources:
  - .ai/README.md
  - .ai/STRUCTURE.md
related_artifacts:
  - .ai/workflows/ai-operations/agents-evolution/
  - .ai/rules/
  - .ai/checks/
  - .codex/skills/
```

## Назначение (`purpose`)

`.ai/agents-evolution/` сохраняет sanitized trace решений, которые меняют
поведение AI-агентов и рабочий AI-layer проекта.

Эта директория не является runtime log storage. Она хранит только короткие
observation/proposal/applied/deferred/rejected artifacts без raw worker output,
без `.ai/tasks` content, без private reasoning и без runtime dumps.

## Границы (`boundaries`)

- Новые файлы внутри `.ai/agents-evolution/**` создаются только после direct
  pre-edit gate, explicit allowlist и owner-layer decision.
- Разрешены только sanitized lifecycle artifacts по карте папок ниже.
- Активные правила, проверки, workflows, templates и Codex skills живут в
  своих owner-layer, а не в `.ai/agents-evolution/`.
- Изменение поведения агента применяется в `.ai/rules/**`, `.ai/checks/**`,
  `.ai/workflows/**`, `.codex/**` или `documentation/**`; evolution artifact
  фиксирует почему и зачем изменение сделано.

## Точки входа (`entrypoints`)

Evolution artifact может появиться только из evidence-based signal:

- user correction;
- failed verification;
- agent self-review finding;
- rule/check violation;
- drift scan;
- repeated friction;
- architecture gap.

Сигнал сначала проходит workflow
`.ai/workflows/ai-operations/agents-evolution/WORKFLOW.md`. До этого нельзя
создавать observation/proposal/applied файлы как обычную заметку.

## Минимальная классификация (`intake_classification`)

Каждый signal обязан ответить:

- `change_target`: code, rule, check, workflow, role, skill, documentation,
  tooling, mixed или none;
- `related_change_targets`: дополнительные non-code targets, если сигнал
  затрагивает несколько owner-layers;
- `fingerprint`: краткий отпечаток failure mode;
- `recurrence_key`: ключ для поиска повторов;
- `evidence_refs`: sanitized ссылки на проверку, путь, правило, check,
  user correction или review finding;
- `owner_layer`: где должно измениться active behavior, если оно меняется.

## Карта папок (`folder_map`)

- `observations/` - зафиксированные инциденты, gaps и root-cause summaries.
- `improvement-proposals/` - bounded proposals с owner-layer, allowlist и
  acceptance criteria.
- `applied-changes/` - след применённых решений: changed paths, checks,
  residual risks.
- `rejected/` - отклонённые proposals с причиной.
- `deferred/` - отложенные proposals с условием возврата.
- `archive/` - закрытые или агрегированные historical artifacts.

## Правила размещения (`placement_rules`)

- Любой новый файл в этой ветке требует отдельного согласованного шага или
  прямой команды пользователя на evolution текущего AI-layer.
- Файлы должны быть короткими, sanitized и ссылаться на реальные changed paths,
  а не копировать terminal output, runtime snapshots или worker transcripts.
- Запрещено хранить `.ai/tasks/**`, task-origin data, secrets, raw private
  reasoning, production dumps и PII beyond task need.
- Если artifact требует изменения active rule/check/workflow/skill, такое
  изменение выполняется в owner-layer соответствующего active artifact.
