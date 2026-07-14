# AGENTS.md - инструкция для ИИ

## 1. Назначение файла

`AGENTS.md` является корневым entrypoint для ИИ-агентов в текущем репозитории.
Он направляет агента в рабочий AI-layer и задаёт обязательный порядок
использования проектных инструкций.

Базовый стиль работы:

- сначала читаешь текущую реализацию и только потом предлагаешь или меняешь код;
- ищешь причину, owner-layer и контракт, а не только локальный симптом;
- сохраняешь архитектуру проекта и не внедряешь новый стек без отдельного scope;
- не имитируешь выполнение команд, тестов или проверок;
- отвечаешь по-русски, коротко и по делу.

## 2. Архитектура рабочего AI-слоя

Рабочий AI-layer разделён на active layer и adapter layer.

Active layer:

- `.ai/README.md` - обзор назначения, границ и приоритета исполнения;
- `.ai/STRUCTURE.md` - карта директорий и active entrypoints;
- `.ai/system/INDEX.md` и `.ai/system/state-machine.md` - системные
  entrypoints рабочего AI-layer;
- `documentation/project-context.md` - канонический контекст корневого проекта;
- `.ai/roles/role-groups.md` - маршрутизатор групп ролей;
- `.ai/roles/**/INDEX.md` - role cards с зоной ответственности конкретной
  роли;
- `.ai/workflows/INDEX.md` - индекс доступных workflow;
- `.ai/workflows/**/WORKFLOW.md` - порядок выполнения конкретного типа задач;
- `.ai/rules/**` - обязательные active rules;
- `.ai/checks/**` - pass/fail gates и required output для проверок;
- `.ai/registry/**` - карта связей rules/checks/workflows/roles;
- `.ai/templates/**` - шаблоны gate, report, role и runtime artifacts;
- `.ai/tools/**` - локальные инструменты AI-layer;
- `.ai/worker-profiles/**` - reusable profiles для worker assignment;
- `.ai/agents-evolution/**` - контролируемые изменения самого AI-layer.

Adapter layer:

- `.codex/README.md` и `.codex/STRUCTURE.md` - описание Codex-specific слоя;
- `.codex/config.toml` - настройки Codex-адаптера;
- `.codex/agents/**` - Codex agent profiles, привязанные к workflow;
- `.codex/prompts/**` - prompts, повторяющие структуру workflow;
- `.codex/skills/**` - исполняемые procedure skills для Codex.

Контракт качества AI-layer:

- `.ai/*` хранит active project-specific instructions;
- `.codex/*` хранит только адаптеры к active layer и не вводит отдельный
  источник правил;
- рабочий слой должен быть синхронизирован с текущим проектом до handoff;
- артефакты, assumptions, paths, stack notes или workflow из других проектов
  не допускаются;
- временные заглушки, параллельные инструкции и known-drift не оставляются как
  рабочее состояние;
- при изменении active artifact обновляются связанные registry, roles,
  workflows, checks, skills и prompts.

## 3. Последовательность использования AI-layer

Для каждой рабочей задачи выполняй порядок ниже. Не перескакивай сразу к
редактированию файлов, если не выбран owner-layer и применимые gates.

1. Открой `AGENTS.md` как корневой entrypoint.
2. Открой `.ai/README.md`, `.ai/STRUCTURE.md` и `.ai/system/INDEX.md`, чтобы
   понять active layout рабочего AI-layer.
3. Открой `documentation/project-context.md`, чтобы понять контекст корневого
   проекта.
4. Если задача зависит от структуры проекта, открой
   `documentation/architecture/project-structure.md`.
5. Через `.ai/roles/role-groups.md` выбери применимую role group.
6. Открой одну или несколько role cards из `.ai/roles/**/INDEX.md`.
7. Открой `.ai/workflows/INDEX.md` и затем конкретный
   `.ai/workflows/**/WORKFLOW.md`, если задача требует workflow.
8. Через `.ai/registry/rules/INDEX.md` найди применимые rules и checks.
9. Открой нужные `.ai/rules/**` и `.ai/checks/**` до реализации.
10. Если задача использует Codex-specific исполнение, открой связанные
   `.codex/agents/**`, `.codex/prompts/**` и `.codex/skills/**`.
11. Сформируй pre-edit gate: source of truth, contour-owner, owner-layer,
   allowlist, planned create/edit/delete, checks, blockers.
12. После реализации выполни проверки по фактическому scope и обнови
    связанные `.ai/.codex` artifacts, если менялся рабочий слой.

Для простого диалогового ответа без изменений файлов достаточно `AGENTS.md` и
явной проверки, что задача не является `work_task`.

## 4. Pre-edit Gate

Перед изменением файлов зафиксируй:

- source of truth;
- contour-owner;
- owner-layer;
- allowlist путей;
- какие файлы будут созданы;
- какие файлы будут изменены;
- какие файлы будут удалены;
- какие проверки будут выполнены;
- что требует подтверждения пользователя.

После этого выполняй работу маленькими шагами. Если правильный owner выходит за
allowlist, остановись и попроси расширить scope.

## 5. Project Documentation

- Структура корневого проекта хранится в
  `documentation/architecture/project-structure.md`.
- `AGENTS.md` не дублирует карту директорий проекта.
- Архитектура рабочего AI-layer хранится внутри `.ai/**` и `.codex/**`.
- Если структура проекта меняется, сначала обнови canonical documentation, а
  затем синхронизируй связанные AI-layer references.

## 6. Engineering Rules

- Сохраняй Payload CMS 3 и Next.js App Router patterns.
- Для Payload config/collections сначала ищи существующие field factories,
  hooks, access rules and admin components.
- DB changes выполняй через Payload migrations или явно согласованный
  schema-push/migration workflow.
- PostGIS используется для geo-сценариев, если они присутствуют.
- Search layer строится вокруг Search Profile + поискового provider и Elasticsearch,
  Payload остаётся source of truth.
- Не редактируй generated files вручную: `src/payload-types.ts`, import maps,
  `.next/**`, build artifacts.
- Secrets не добавляй в код, `.ai`, `.codex`, docs или git.
- Перед установкой или обновлением зависимостей проверяй актуальную версию и
  совместимость с Node/Next/React/Payload constraints.
- Не расширяй scope скрыто за счёт попутного рефакторинга.

## 7. Frontend Rules

- Для public UI сначала ищи существующий owner в `src/ui/**`.
- Для routes сначала проверь `src/app/**` и доменные helpers в
  `src/domain/routes/**`.
- Для shared UI переиспользуй shadcn/Radix/lucide patterns из проекта.
- Явно различай Server Components и Client Components.
- Browser/Playwright checks нужны, когда задача зависит от rendered DOM, CSS,
  responsive behavior, forms, focus/input, client interactions или screenshot
  parity.

## 8. Delivery

Перед commit/push используй соответствующие `.codex/skills/*`, если задача
требует delivery. Не коммить secrets, runtime state, dumps, `node_modules`,
`.next`, Playwright reports или generated session logs.

## 9. Definition of Done

Задача считается готовой, когда:

- изменение сделано в правильном owner-layer;
- рабочий AI-layer синхронизирован с текущим проектом и не содержит чужих или
  устаревших артефактов;
- выполнены или честно пропущены проверки с причиной;
- связанные `.ai/.codex` artifacts синхронизированы, если менялся рабочий
  слой;
- пользователь получил краткое описание результата, рисков и следующих шагов.
