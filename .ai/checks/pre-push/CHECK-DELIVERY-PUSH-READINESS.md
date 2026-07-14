# CHECK-DELIVERY-PUSH-READINESS

```yaml
check_id: CHECK-DELIVERY-PUSH-READINESS
title: Проверка delivery readiness перед push
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/checks/pre-push/
workflow: .ai/workflows/delivery/git/commit-push/WORKFLOW.md
rules:
  - .ai/rules/git/RULE-COMMIT-PUSH-SSH-DELIVERY.md
```

## Когда выполнять

После commit и перед SSH push текущей ветки.

## Обязательные проверки

- Commit hash и message зафиксированы.
- Branch, tracking target и GitHub SSH remote host проверены.
- `origin` указывает на SSH URL вида `git@github.com:<owner>/<repo>.git`.
- `git remote get-url origin` не содержит HTTPS URL, token или non-GitHub host.
- SSH preflight выполнен:

  ```bash
  GIT_SSH_COMMAND='ssh -o BatchMode=yes -o PreferredAuthentications=publickey' \
    git ls-remote origin HEAD
  ```

- Push текущей ветки выполняется только через SSH:

  ```bash
  GIT_SSH_COMMAND='ssh -o BatchMode=yes -o PreferredAuthentications=publickey' \
    git push origin <branch>
  ```

- HTTPS/token fallback запрещён.
- Durable runtime result plan подготовлен: `worker_jobs.result_json` или session
  result.
- Для успешного push planned payload содержит `result: push_succeeded`.
- Session должна перейти в `result-ready` при успешном push или `blocked` при
  failed push.
- Notification `result_ready` Dialog Assistant-у подготовлена с тем же payload.

## Required output

- delivery session/job id, если используется runtime;
- commit hash;
- branch;
- tracking/branch target;
- GitHub repository owner/name;
- remote host без token, ожидаемо `github.com`;
- SSH preflight result;
- durable result target;
- runtime signal result;
- decision: `passed` или `blocked`.

## Fail condition

- Entry gate не пройден.
- `origin` не является GitHub SSH remote.
- `origin` указывает не на `github.com`.
- SSH preflight вернул `Permission denied`, rejected key или другой auth error.
- Delivery runtime пытается использовать HTTPS/token fallback.
- Push target не соответствует текущей ветке.
