# Worker profiles

```yaml
artifact_id: ai-worker-profiles-index
artifact_type: ai-worker-profile-index
owner_layer: .ai/worker-profiles/
```

## Назначение

`worker-profiles/` хранит reusable profiles для будущих worker assignments.
Профиль не запускает worker сам по себе и не расширяет scope задачи.

## Active Profiles

На текущий момент нет materialized application worker profiles. Новые профили
создаются отдельным pre-edit gate с role, rules, checks, workflow and result
contract.
