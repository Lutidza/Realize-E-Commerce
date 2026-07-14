# Workflow commit/push (`delivery_git_commit_push_workflow`)

```yaml
artifact_id: delivery-git-commit-push-workflow
artifact_type: ai-workflow
owner_role: .ai/roles/process-tools-operations/scope-contour-owner/INDEX.md
owner_layer: .ai/workflows/delivery/git/commit-push/
rules:
  - .ai/rules/git/RULE-COMMIT-PUSH-SSH-DELIVERY.md
checks:
  pre_commit:
    - .ai/checks/pre-commit/CHECK-DELIVERY-COMMIT-SCOPE.md
  pre_push:
    - .ai/checks/pre-push/CHECK-DELIVERY-PUSH-READINESS.md
codex_adapter:
  - .codex/skills/git-commit-push/SKILL.md
related_workflows:
  - .ai/workflows/core/main-delivery/WORKFLOW.md
```

## Назначение

Workflow задаёт активный порядок commit/push для delivery шага. Он не хранит
секреты и не заменяет Codex skill: workflow определяет состояния и gates, skill
выполняет Codex-specific процедуру внутри этих gates.

Delivery transition основан на durable runtime result и notification через
Node/npm runtime adapter `.ai/tools/agent-runtime/`, если runtime доступен.

## Условие запуска

Workflow запускается только если выполнены все условия:

- пользователь отдельно запросил commit/push;
- общий entry gate пройден;
- `DoD`-направления main delivery по фактическому scope выполнены, не
  требуются или явно отложены пользователем как `approved snapshot`;
- delivery assignment содержит bounded mission, allowlist, forbidden paths и
  expected output.

Commit/push workflow проверяет delivery scope, GitHub SSH remote, secret
handling и durable signal. Он не заменяет tests, documentation sync, contract
review, runtime evidence или ручную пользовательскую приёмку из
`main_delivery_workflow`.

## Состояния

```text
dialog_assistant_entry_gate
-> delivery_assignment
-> pre_commit_gate
-> staged_scope
-> commit
-> pre_push_gate
-> ssh_preflight
-> push
-> durable_push_result
-> result_signal
-> delivery_review
```

Контрольные states:

```text
blocked
scope_expanded
push_failed
ssh_auth_failed
delivery_result_rejected
```

## Контракты состояний

### `delivery_assignment`

Зафиксировать delivery operation contract после успешного entry gate.

Выход:

- commit class;
- target branch;
- GitHub remote target;
- delivery executor/session/job id, если используется worker runtime;
- allowed paths;
- forbidden paths;
- checks to run;
- expected output.

### `pre_commit_gate`

Выполнить `.ai/checks/pre-commit/CHECK-DELIVERY-COMMIT-SCOPE.md`.

Выход:

- `git status --short`;
- staged или planned staged files;
- allowlist match;
- secret handling result;
- runtime signal plan.

### `staged_scope`

Stage-ить только согласованные файлы.

Выход:

- `git diff --cached --name-only`;
- `git diff --cached --stat`;
- подтверждение отсутствия unrelated files;
- blocker при scope expansion.

### `commit`

Создать commit с согласованным conventional message.

Выход:

- commit hash;
- commit message;
- committed files;
- evidence проверок из применимых `DoD`-направлений и delivery gates.

### `ssh_preflight`

До push проверить GitHub SSH remote и выполнить fail-fast SSH проверку:

```bash
git remote get-url origin
```

Remote `origin` должен иметь вид `git@github.com:<owner>/<repo>.git`.

```bash
GIT_SSH_COMMAND='ssh -o BatchMode=yes -o PreferredAuthentications=publickey' \
  git ls-remote origin HEAD
```

Если ключ не принят remote host, workflow переходит в `ssh_auth_failed`: commit
retry, HTTPS/token fallback или другой обход запрещены.

### `push`

Выполнить явный SSH push текущей ветки в GitHub remote `origin`:

```bash
GIT_SSH_COMMAND='ssh -o BatchMode=yes -o PreferredAuthentications=publickey' \
  git push origin <branch>
```

### `durable_push_result`

Если push успешен, durable result обязан содержать:

```json
{
  "result": "push_succeeded"
}
```

Если push неуспешен, durable result обязан содержать `result: push_failed` и
diagnostic summary без секретов.

### `result_signal`

После durable result создать notification через Node/npm runtime adapter, если
runtime session доступна:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- notification-create \
  --source-session-id=<delivery-session-id> \
  --target-role=dialog_assistant \
  --notification-type=result_ready \
  --priority=high \
  --summary="Commit/push completed" \
  --payload-json='{"result":"push_succeeded"}'
```

## Запреты

- Запрещено использовать `git add -A` без явного approved snapshot или полного
  scoped allowlist.
- Запрещено push через HTTPS/token remote.
- Запрещено push в non-GitHub remote для этого репозитория.
- GitHub Pull Request операции не выполняются без отдельного явного запроса.
- Запрещено печатать secrets or tokenized remotes.
- Запрещено считать push заменой tests, docs sync or user acceptance.
