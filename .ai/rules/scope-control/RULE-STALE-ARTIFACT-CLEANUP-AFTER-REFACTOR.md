# Запрет active stale artifacts после refactor/migration

```yaml
rule_id: RULE-STALE-ARTIFACT-CLEANUP-AFTER-REFACTOR
title: Запрет active stale artifacts после refactor/migration
owner_role: Владелец области изменений и контура
applies_to:
  - application contour
  - canonical documentation contour
  - development environment contour
  - refactor
  - migration
  - rename
  - decomposition
  - owner-layer change
trigger:
  - перенос, переименование или удаление owner-файла
  - замена старого contract новым contract
  - миграция route, API, DTO, component, service, workflow, skill или document path
  - декомпозиция файла, папки, feature, workflow или documentation section
  - изменение public identifier, import path, route name, config key или adapter metadata
requirement:
  - до финального handoff выполнить targeted stale artifact scan по старым именам, путям и public identifiers
  - проверить application contour в первую очередь
  - классифицировать каждый найденный hit как active artifact, historical evidence или unrelated false positive
  - считать временные compatibility-предохранители, bridge/proxy/re-export wrappers, alias entrypoints и fallback adapters active stale artifacts, если они оставлены только для поддержки старого owner path или старого contract
  - после refactor/decomposition/rename обновить всех active consumers на новый owner напрямую вместо сохранения старой прослойки совместимости
  - удалить или синхронизировать active stale artifacts в рамках согласованного allowlist
  - остановиться и запросить новый scoped step, если cleanup требует расширения allowlist
  - явно зафиксировать residual risk, если пользователь подтверждает deferral
forbidden:
  - завершать refactor/migration/rename step с неклассифицированными hits по старым именам или путям
  - оставлять active stale code artifact в application contour без cleanup или explicit user-approved deferral
  - оставлять compatibility-предохранитель, bridge/proxy wrapper, re-export wrapper, alias entrypoint или fallback adapter после refactor/decomposition/rename как скрытую поддержку старого пути или старого contract
  - прятать active stale artifact в historical report, README, AGENTS, documentation или registry
  - удалять historical evidence без отдельного artifact-disposition решения
  - считать задачу завершённой только на основании нового owner-файла без проверки старого owner
checks:
  - .ai/checks/self-review/CHECK-STALE-ARTIFACT-CLEANUP-AFTER-REFACTOR.md
related_rules:
  - .ai/rules/scope-control/RULE-ARTIFACT-DISPOSITION.md
related_workflows:
  - .ai/workflows/core/main-delivery/WORKFLOW.md
  - .ai/workflows/ai-operations/agents-evolution/WORKFLOW.md
related_codex_artifacts:
  - .codex/skills/skill-documentation-sync/SKILL.md
related_tools:
  - rg
  - rg --files
  - git diff --name-status
escalation:
  - blocked: active stale code artifact найден вне allowlist
  - stop-for-approval: требуется delete, archive, replace или deferral
```

## Контракт выполнения

После любого refactor/migration/rename/decomposition шага агент обязан
доказать, что старые active artifacts не остались в рабочем пути выполнения,
документации или agent runtime.

Проверка начинается с `application contour`, потому что stale код, tests,
routes, DTO, config, imports, components, services, actions, controllers,
helpers или migrations могут продолжить исполняться либо скрывать regression.

Затем проверяются:

- `canonical documentation contour`: `documentation/`, root `README.md`,
  `AGENTS.md`, references и canonical links;
- `development environment contour`: `.ai/*`, `.codex/*`, MCP/tooling,
  prompts, skills, agents, workflows, registry и templates.

## Классификация hits

- `active artifact` — файл, ссылка, import, route, config, test, workflow,
  registry entry или prompt всё ещё участвует в текущем рабочем contract.
- `historical evidence` — report, observation, applied-change, changelog или
  incident явно описывает прошлое состояние и не является active instruction.
- `false positive` — совпадение не относится к старому artifact или contract.

Active artifact должен быть удалён, перенесён, синхронизирован или вынесен в
отдельный user-approved follow-up. Historical evidence не удаляется этим
правилом и дополнительно защищается `RULE-ARTIFACT-DISPOSITION`.

## Compatibility-предохранители после refactor

После refactor/decomposition/rename нельзя оставлять active compatibility
прослойку, которая существует только для сохранения старого пути, старого
public identifier или старого contract.

К таким active stale artifacts относятся:

- re-export wrapper старого module path;
- proxy/bridge module между старым consumer path и новым owner;
- alias entrypoint старого CLI/API/config/import key;
- fallback adapter, который скрывает неочищенный consumer;
- temporary compatibility guard, который не является самостоятельным
  canonical contract.

Корректное завершение refactor шага: все active consumers переведены на новый
owner напрямую, старый entrypoint удалён, а scan по старому имени/пути не
показывает active hits.

Исключение допускается только как отдельный user-approved migration contract:
с владельцем, сроком удаления, явной причиной совместимости и отдельным
cleanup task. Такое исключение нельзя оформлять как незаметный
compatibility-предохранитель внутри refactor handoff.

## Обязательный вывод

Перед финальным ответом после refactor/migration/rename/decomposition агент
выводит:

```text
Stale artifact cleanup:
- trigger:
- changed owner:
- retired names/paths/identifiers:
- scan commands:
- application contour hits:
- documentation contour hits:
- development environment hits:
- compatibility bridges/proxies/re-exports found:
- active stale artifacts cleaned:
- historical evidence kept:
- false positives:
- blocked or deferred items:
- user-approved deferral:
```

## Условия остановки

Агент останавливается, если:

- old name/path scan не выполнен;
- найден active stale code artifact в `application contour`;
- найден active stale artifact вне текущего allowlist;
- hit не классифицирован;
- cleanup требует delete/archive/replace без `RULE-ARTIFACT-DISPOSITION`;
- пользователь не подтвердил deferral, а cleanup не может быть выполнен в
  текущем scope.

## Результаты

- `proceed-with-handoff` — scan выполнен, active stale artifacts очищены или
  явно подтверждены пользователем как deferred debt.
- `stop-for-cleanup` — найдены active stale artifacts в allowlist.
- `stop-for-scope-approval` — cleanup требует расширить allowlist.
- `blocked` — stale hits не классифицированы или есть риск потерять историю.
