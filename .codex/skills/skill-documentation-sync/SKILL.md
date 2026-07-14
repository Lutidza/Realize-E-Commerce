---
name: skill-documentation-sync
description: >-
  Используй, когда задача меняет documentation, .ai rules/checks/workflows,
  .ai registry, .codex adapter artifacts, AGENTS, README или contract-level
  договорённость, из-за которой могут устареть paths, owners, gates, runtime
  rules, workflow или project docs.
---

# Скилл: синхронизация документации и AI runtime

Используй этот skill, когда изменение может оставить рассинхрон между
`documentation/`, `.ai/`, `.codex/`, README, AGENTS или рабочими правилами
проекта.

Этот skill описывает Codex-процедуру синхронизации. Активные правила
применяются из active rules layer; если появляется новое обязательное правило,
вынеси его в корректный rules owner-layer отдельным согласованным шагом.

## Слои владельцев

- `.ai/rules/*` — canonical runtime layer project/system правил агента.
- `.ai/checks/*` — исполнимые проверки для gates.
- `.ai/workflows/*` — порядок states, gates и transitions.
- `.ai/registry/*` — traceability, связи, статусы и historical states.
- `documentation/` — long-form specs, governance, rationale и future tasks.
- `.codex/*` — Codex-native adapter layer: skills, agents, prompts, commands,
  MCP, hooks, scripts, plugins, worker adapter metadata и review/plan/diff
  wrappers.

## Что открыть перед правкой

Перед применением skill открой active `.ai/**` / `.codex/**` artifacts,
которые задают runtime contract текущей sync-задачи:

- применимые `.ai/rules/**`;
- применимые `.ai/checks/**`;
- применимые `.ai/workflows/**`;
- применимые `.codex/**` adapter artifacts;
- task/assignment artifact с allowlist и forbidden paths.

`documentation/**` открывай только как sync target, related spec или project
contract doc, если она явно входит в scope задачи или нужна для проверки drift.

Если задача является refactor/migration/rename/decomposition или меняет
owner-layer, дополнительно открыть:

- `.ai/rules/scope-control/RULE-STALE-ARTIFACT-CLEANUP-AFTER-REFACTOR.md`
- `.ai/checks/self-review/CHECK-STALE-ARTIFACT-CLEANUP-AFTER-REFACTOR.md`

## Рабочий порядок

1. Определи contour-owner и owner-layer текущего шага.
2. Зафиксируй allowlist до изменений.
3. Определи, что является runtime contract, а что long-form documentation.
4. Если меняется active rule, сначала обнови его owner-layer в active rules
   layer.
5. Если меняется gate/check, обнови `.ai/checks/*` и ссылки из rules/workflows.
6. Если меняется Codex-native procedure или wrapper, обнови `.codex/*`.
7. Если нужна traceability, обнови `.ai/registry/*`, а не раздувай rule,
   check, workflow или `.codex/*`.
8. Если меняется product или architecture contract, обнови соответствующий spec
   в `documentation/`.
9. Удали stale paths и старые workflow-инструкции вместо добавления нового
   текста поверх устаревшего.
10. Для refactor/migration/rename/decomposition выполни stale artifact scan по
    application, documentation и development environment contours перед handoff.
11. Если меняется Codex skill, проверь `SKILL.md` frontmatter и
    `agents/openai.yaml`, если этот metadata-файл существует.

## Ограничения выполнения

- Делать `documentation/` источником текста каждого active rule.
- Добавлять обязательное правило только в `.codex/*`.
- Менять workflow в docs, оставляя `.codex/*` на старой модели.
- Дублировать одно правило в README, AGENTS, active rules layer и `.codex/*`
  без различия ролей.
- Тащить incident, rationale или историю в active rule, check, workflow или
  `.codex/*`.
- Расширять allowlist скрыто.

## Ожидаемый результат

- Active rules, checks, workflows и Codex adapter artifacts не противоречат
  друг другу.
- Active stale artifacts в коде, документации и development environment
  очищены, синхронизированы или явно вынесены в user-approved follow-up.
- `documentation/` обновлена только там, где меняется long-form spec,
  governance или product/architecture contract.
- Registry используется для связей и traceability, а не для исполнения rules.
- Старые пути, названия и workflow-инструкции удалены.
