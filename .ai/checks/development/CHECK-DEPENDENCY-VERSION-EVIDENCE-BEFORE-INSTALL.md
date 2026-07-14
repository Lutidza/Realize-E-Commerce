# CHECK-DEPENDENCY-VERSION-EVIDENCE-BEFORE-INSTALL

```yaml
artifact_id: CHECK-DEPENDENCY-VERSION-EVIDENCE-BEFORE-INSTALL
artifact_type: ai-development-check
owner_layer: .ai/checks/development/
rule: .ai/rules/development/RULE-DEPENDENCY-VERSION-EVIDENCE-BEFORE-INSTALL.md
check_stage: pre_dependency_change
scope: dependency_install_update_or_recommendation
```

## Условие срабатывания

Запускать перед package install/update/recommendation, framework/tooling
upgrade, MCP/plugin/skill install or Docker/tooling image tag change.

## Входы

- package/tool/image name;
- requested action;
- current project constraints: Node.js, Next.js, React, Payload CMS, package
  manager, engines, peer dependencies, framework support matrix;
- official source URL;
- registry source;
- latest stable version;
- selected version;
- compatibility evidence;
- package manager query output.

## Procedure

1. Найти официальный source or registry.
2. Зафиксировать checked date/time.
3. Проверить latest stable version.
4. Проверить compatibility with current project constraints.
5. Выбрать selected version and decision reason.
6. Заблокировать install/update, если evidence отсутствует.

## Pass condition

- Latest stable version verified.
- Selected version justified.
- Compatibility with project constraints checked.
- Lockfile impact expected.
- No dependency action relies on model memory only.
