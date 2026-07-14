# Observation: Codex exec worker runtime bridge gap

```yaml
artifact_id: OBS-20260524-codex-exec-worker-runtime-bridge
artifact_type: agents-evolution-observation
owner_layer: .ai/agents-evolution/observations/
status: captured
source_event: worker swarm must be visible in monitor and run through codex exec
forbidden_content_policy: no_raw_logs_no_tasks_no_private_reasoning
related_artifacts:
  - .ai/checks/worker-runtime/CHECK-WORKER-MONITOR-VISIBILITY.md
  - .ai/rules/agent-runtime/RULE-WORKER-SESSION-LIFECYCLE-AND-AUTONOMOUS-MODE.md
  - .codex/skills/codex-external-worker-session/SKILL.md
```

## Факт

Встроенные subagents не дают пользователю требуемую операционную модель:
worker должен быть внешним `codex exec` процессом, зарегистрированным в runtime
и видимым в agent monitor.

## Impact

Если использовать `spawn_agent`, пользователь не получает ожидаемый monitor
surface для worker-процессов, а Dialog Assistant может обойти проектный
runtime lifecycle.

## Root Cause

Рабочий AI-layer различал monitor visibility, но не закреплял запрет
`spawn_agent` для рабочих роёв и не выделял отдельный hard-check для
`codex exec` worker bridge.

## Ограничения Evidence

Observation не содержит raw terminal output, runtime dump, `.ai/tasks/**`,
task-origin data, worker transcript или private reasoning.

## Proposed Next

Закрепить `codex exec` как единственный backend рабочих роёв, добавить
runtime bridge check и оставить group topology видимой через gateway snapshot.
