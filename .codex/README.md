# Адаптерный слой Codex

`.codex/` — технический слой интеграции проекта с Codex.

В этом слое живут настройки Codex, агенты, скилы, профили, промпты, команды,
MCP-конфигурация, хуки, скрипты и обёртки Codex.

Если артефакт должен загружаться, исполняться или управляться средой Codex, он
размещается в `.codex/`. Это относится к скилам, агентам, промптам, командам,
MCP, хукам, скриптам, плагинам, подагентам и обёрткам для возможностей Codex
вроде `/review`, `/plan`, `/agent`, `/diff`.

`.ai/` может ссылаться на `.codex/*` в правилах, рабочих процессах, проверках
или реестрах, но не хранит исполняемую реализацию Codex.

`.codex/` не хранит активные правила `.ai/rules/*`, проверки `.ai/checks/*`,
операционную память, состояние задач или историю запусков `.ai/`.

## Directory entrypoints

- Верхний обзор `.codex/` остаётся в `.codex/README.md`.
- Внутри вложенных директорий `.codex/*` новые directory entrypoints должны
  называться `INDEX.md`.
- В `.codex/agents/**` файлы `.toml` должны содержать только поля,
  поддерживаемые Codex agent role schema. Project metadata, карты связей и
  rationale хранятся в `INDEX.md`, prompts или `.ai/*`.
- `.codex/prompts/*` должен повторять доменную структуру связанного workflow,
  если prompt обслуживает конкретный workflow.

## Приоритет исполнения

Codex-native artifacts из `.codex/` являются обязательным adapter-layer для
Codex runtime. Если для текущей задачи применим skill, agent, prompt, command,
MCP policy, hook или wrapper из `.codex/`, Codex обязан использовать его вместе
с активными артефактами из `.ai/`.

При конфликте Codex-native procedure с развёрнутой спецификацией в
`documentation/` исполняется применимый `.codex/*` artifact, если он не
противоречит активным правилам, проверкам и workflow из `.ai/`. Конфликт
фиксируется как необходимость синхронизации документации.

## MCP

Project-specific MCP config хранится в `.codex/config.toml`. Активная policy
по выбору MCP/tool, availability, fallback и blocker decision живёт в
`.ai/rules/external-tools/RULE-MCP-TOOLING-CONTOUR.md` и
`.ai/workflows/ai-operations/mcp-tooling/WORKFLOW.md`.

Project-specific MCP servers текущего проекта описаны в `.codex/config.toml`.
Сейчас project contract включает:

- `recommerce-playwright` - browser/runtime evidence через `@playwright/mcp`;
- `recommerce-tailwind` - Tailwind/UI assistance через
  `tailwindcss-mcp-server`.
- `recommerce-next-devtools` - Next.js docs/automation/runtime diagnostics bridge;
- `recommerce-payload` - Payload CMS 3 MCP bridge через локальный dev server и
  `mcp-remote`.

Payload MCP требует runtime env `PAYLOAD_MCP_API_KEY`. Ключ создаётся в Payload
Admin MCP collection и не хранится в `.codex`, `.ai` или documentation.
На текущем Next.js `16.2.10` `recommerce-next-devtools` может использовать
Next.js MCP runtime diagnostics через `/_next/mcp`, когда dev server запущен.

Codex CLI читает активный runtime config из `CODEX_HOME`, поэтому эти записи
должны быть зеркалированы через `codex mcp add`. Session-provided tools,
plugins и connectors можно использовать, если они доступны текущей среде, но
их нельзя записывать как постоянный project contract без MCP tooling workflow.

## Структура (`structure`)

Полная карта целевой структуры `.codex/` вынесена в отдельный файл рядом с
этим README: [.codex/STRUCTURE.md](STRUCTURE.md).

README хранит верхний обзор адаптерного слоя Codex и не дублирует полный
tree-блок.
