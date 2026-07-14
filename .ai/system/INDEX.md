# Система рабочего AI-слоя (`ai-system-index`)

```yaml
artifact_id: ai-system-index
artifact_type: ai-runtime-index
owner_layer: .ai/system/
runtime_sources:
  - AGENTS.md
  - .ai/README.md
  - .ai/STRUCTURE.md
  - documentation/project-context.md
```

## Назначение

Директория `.ai/system/` хранит системные entrypoints рабочего слоя агентов.
Контекст корневого проекта хранится вне `.ai`, в `documentation/project-context.md`.

## Карта файлов

- `INDEX.md` - входной файл директории.
- `state-machine.md` - базовая машина состояний AI delivery.

## Правило

Если агенту нужен контекст корневого проекта, он открывает
`documentation/project-context.md` и реальные файлы репозитория. `.ai/system/**`
не является владельцем проектного контекста.
