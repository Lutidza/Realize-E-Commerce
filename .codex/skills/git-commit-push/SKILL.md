---
name: git-commit-push
description: >-
  Используй, когда пользователь просит commit and push изменений текущего
  репозитория. Выполняет scoped staging, проверки and GitHub SSH-only push.
---

# Commit и push

## Что открыть

1. `.ai/workflows/delivery/git/commit-push/WORKFLOW.md`
2. `.ai/rules/global/RULE-SAFE-COMMAND-PROPOSAL.md`
3. `.ai/checks/pre-implementation/CHECK-SAFE-COMMAND-PROPOSAL.md`
4. `.ai/rules/git/RULE-COMMIT-PUSH-SSH-DELIVERY.md`
5. `.ai/checks/pre-commit/CHECK-DELIVERY-COMMIT-SCOPE.md`
6. `.ai/checks/pre-push/CHECK-DELIVERY-PUSH-READINESS.md`

## Preflight

1. `git status --short`.
2. Проверить GitHub remote:
   - `git remote get-url origin`;
   - URL должен иметь вид `git@github.com:<owner>/<repo>.git`.
3. Определить contour-owner: application, AI layer, Codex adapter, docs or
   delivery state.
4. Выбрать checks by blast radius:
   - TypeScript: `npx tsc --noEmit --pretty false`;
   - lint/build/test according to changed scope;
   - Payload/database: `npm run payload -- migrate:status`;
   - AI layer/docs: stale path scan and markdown/config sanity;
   - generated/runtime state: must not be staged unless explicitly intended.
5. Stage only scoped paths unless user requested full snapshot.

## Commit

Use conventional message:

- `feat(...)`
- `fix(...)`
- `refactor(...)`
- `docs(...)`
- `chore(dev-env)(...)`
- `chore(repo-process)(...)`

## Push

Push only through GitHub SSH `origin`:

```bash
git remote get-url origin
```

Expected remote format:

```text
git@github.com:<owner>/<repo>.git
```

Then:

```bash
GIT_SSH_COMMAND='ssh -o BatchMode=yes -o PreferredAuthentications=publickey' \
  git ls-remote origin HEAD
```

Then:

```bash
GIT_SSH_COMMAND='ssh -o BatchMode=yes -o PreferredAuthentications=publickey' \
  git push origin <branch>
```

No HTTPS token fallback.
No Pull Request create/update/merge unless the user explicitly requests it.

## Final output

Report commit hash, branch, GitHub remote, checks and push result.
