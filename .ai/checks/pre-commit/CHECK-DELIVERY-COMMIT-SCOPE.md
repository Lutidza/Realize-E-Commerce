# CHECK-DELIVERY-COMMIT-SCOPE

```yaml
check_id: CHECK-DELIVERY-COMMIT-SCOPE
title: Проверка delivery scope перед commit
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/checks/pre-commit/
workflows:
  - .ai/workflows/delivery/git/commit-push/WORKFLOW.md
rules:
  - .ai/rules/git/RULE-COMMIT-PUSH-SSH-DELIVERY.md
```

## Когда выполнять

Перед staging и commit в delivery workflow.

## Обязательные проверки

- Общий entry gate пройден.
- Delivery assignment содержит bounded mission, allowlist, forbidden paths и
  expected output.
- `git status --short` просмотрен.
- Planned staged files входят в allowlist или явно approved snapshot.
- Forbidden paths не затронуты.
- Secret scan по staged/planned files не находит secrets, tokenized remotes or
  webhook-bearing URLs.
- Delivery signal plan определён: durable result и notification через
  Node/npm adapter `.ai/tools/agent-runtime/` или явная причина пропуска.

## Required output

- delivery session/job id, если используется runtime;
- branch;
- allowlist;
- planned staged files;
- forbidden path result;
- secret scan command/result;
- runtime signal plan;
- decision: `passed`, `blocked` или `scope-expanded`.

## Fail condition

- Entry gate не пройден.
- Delivery assignment отсутствует или неполный.
- Есть staged/planned file вне allowlist.
- Найден secret или tokenized URL.
- Runtime signal обязателен, но writer недоступен без согласованной замены.
