# RULE-DEPENDENCY-VERSION-EVIDENCE-BEFORE-INSTALL

```yaml
artifact_id: RULE-DEPENDENCY-VERSION-EVIDENCE-BEFORE-INSTALL
artifact_type: project-development-rule
owner_roles:
  - .ai/roles/developer/frontend/INDEX.md
  - .ai/roles/developer/backend/INDEX.md
owner_layer: .ai/rules/development/
enforcement_owner: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
check: .ai/checks/development/CHECK-DEPENDENCY-VERSION-EVIDENCE-BEFORE-INSTALL.md
registry: .ai/registry/rules/INDEX.md
rule_scope: project-wide
scope: dependency_install_update_or_recommendation
applies_to:
  - npm/pnpm/yarn/bun packages
  - JavaScript/TypeScript libraries
  - frameworks
  - SDKs
  - MCP servers
  - Codex skills/plugins/tools
  - CLI tools
  - build/test/dev dependencies
  - Docker/tooling image tags
```

## Назначение

Правило запрещает устанавливать, обновлять, заменять или рекомендовать
зависимости по памяти модели. Перед изменением dependency graph агент обязан
получить актуальное evidence о последней версии и совместимости из внешнего
источника.

Цель правила - не принудительно ставить абсолютную `latest` версию любой ценой,
а исключить устаревшие установки из-за внутренней памяти агента. Агент сначала
проверяет актуальную последнюю версию, затем выбирает корректную версию для
проекта: `latest compatible`, явно заданную пользователем версию или
обоснованный pinned constraint.

## Условие срабатывания

Правило применяется до любого действия или рекомендации, которые:

- добавляют dependency в `package.json` или аналогичный manifest;
- меняют version constraint существующей dependency;
- запускают `npm install`, `npm update`, `pnpm add`, `yarn add`, `bun add` или
  аналогичные команды;
- устанавливают framework, SDK, MCP server, plugin, skill, CLI tool, dev tool,
  test runner, build tool, linter, formatter или adapter;
- обновляют lock-файл как следствие dependency change;
- предлагают пользователю поставить конкретный package/version;
- меняют Docker/tooling image tag, если tag является versioned dependency.

## Обязательное evidence

Перед установкой или рекомендацией агент обязан проверить version evidence
через внешний источник, а не по памяти.

Минимальный порядок:

1. Открыть официальный сайт, release page, changelog, install guide или
   официальный registry/package page через реальный browser/web lookup.
2. Зафиксировать `official_source_url`, `checked_at`, последнюю опубликованную
   stable version и требования совместимости.
3. Проверить официальный package registry или package-manager metadata:
   npm registry, GitHub Releases, PyPI, Docker Hub или другой официальный
   registry для экосистемы.
4. Если используется package manager query, зафиксировать команду и краткий
   результат, например `npm view package version` or `pnpm view package version`.
5. Сопоставить последнюю версию с текущими constraints проекта:
   Node.js, Next.js, React, Payload CMS, peer dependencies, engine
   requirements, framework support matrix и lockfile state.

Если browser/web lookup недоступен, агент не имеет права устанавливать версию
по памяти. Нужно остановиться со статусом `blocked` или использовать явно
зафиксированный fallback только после указания, почему основной официальный
источник недоступен.

## Выбор версии

Допустимые решения:

- `latest_compatible` - последняя версия, совместимая с текущими constraints
  проекта;
- `user_requested_exact` - точная версия явно запрошена пользователем и
  подтверждена как существующая;
- `pinned_for_compatibility` - выбрана не последняя версия из-за доказанного
  compatibility blocker;
- `blocked` - актуальная версия или совместимость не подтверждены.

## Запрещено

- Ставить или рекомендовать package version по памяти модели.
- Использовать фразу `latest` без фактической проверки текущей latest version.
- Опираться на training cutoff, старый опыт, пример из README или прошлый
  проект как на evidence.
- Подбирать версию только для прохождения solver-а без проверки official
  compatibility contract.
- Обновлять lock-файл без объяснения, почему выбрана именно эта версия.
- Делать major upgrade без проверки официального upgrade guide/changelog.
- Игнорировать peer dependencies, engine requirements, framework support
  matrix или security/advisory note.

## Обязательный вывод

```text
dependency_version_evidence: passed|failed|not_required|blocked
dependency_name:
dependency_ecosystem:
requested_action: install|update|replace|recommend|pin
official_source_url:
registry_source:
checked_at:
latest_stable_version:
selected_version:
version_decision: latest_compatible|user_requested_exact|pinned_for_compatibility|blocked
version_constraint:
compatibility_evidence:
package_manager_query:
fallback_reason:
blocker:
```
