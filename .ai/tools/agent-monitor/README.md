# Agent Monitor

Локальный инструмент наблюдения и operator-операций для AI worker-сессий.

Canonical contract: `DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability`.

## Запуск

```bash
npm --prefix .ai/tools/agent-runtime run gateway
```

В отдельном терминале:

```bash
npm --prefix .ai/tools/agent-monitor run preview
```

Monitor UI должен открываться только по единому URL:

```text
http://127.0.0.1:5173/
```

Vite preview зафиксирован на `127.0.0.1:5173` со `strictPort=true`.
Если порт занят, запуск должен падать. Автоматический переход на другой порт
или альтернативный URL запрещён без явного approval пользователя.

Для проверки/запуска сервисов через единый operator contract используются:

```bash
npm --prefix .ai/tools/agent-runtime run runtime -- monitor-service-status --json
npm --prefix .ai/tools/agent-runtime run runtime -- monitor-service-start --mode=preview --json
```

`npm run dev` не является normal work режимом monitor UI.

## Текущий runtime path

- Единственный активный источник данных — `.ai/tools/agent-runtime` gateway.
- Browser runtime читает snapshot через `http://127.0.0.1:8765/snapshot`.
- Live updates приходят через Socket.IO endpoint `http://127.0.0.1:8765/`.
- Единственный gateway URL — `http://127.0.0.1:8765/`; альтернативный port,
  host или fallback запрещён без явного approval пользователя.
- Socket.IO transport зафиксирован как `websocket`.
- `sourceMode` активного dataset — только `runtime-readonly`.
- Vite используется только как dev/build tool для React UI и не владеет
  data-plane.
- Runtime браузер пишет только через runtime gateway command API
  (`POST http://127.0.0.1:8765/command`) и не имеет write-capable filesystem API.
- Runtime браузера не получает write-capable filesystem API.

## Data-plane contract

Adapter owner path:

```text
.ai/tools/agent-monitor/src/data/runtimeGateway/
```

Активные файлы data-plane:

- `runtimeGatewayAdapter.ts` — entrypoint adapter-а для App.
- `client.ts` — HTTP snapshot load, Socket.IO subscription и command gateway API.
- `snapshotMapper.ts` — mapping gateway snapshot в Monitor dataset.
- `normalizers.ts` — runtime gateway normalization helpers.
- `types.ts` — narrow gateway snapshot row contracts.

Compatibility bridges, Vite-served runtime data, timer-based degraded refresh,
synthetic sample degradation и generated-file adapters не являются допустимыми
active runtime paths.

## Live refresh

При старте UI выполняет initial HTTP snapshot load. После подключения Socket.IO
gateway отправляет snapshot event; delta event заставляет browser runtime
перечитать полный snapshot через loopback HTTP endpoint. Регулярный timer-based
browser refresh отсутствует.

Gateway должен оставаться loopback-only:

- snapshot URL: `http://127.0.0.1:8765/snapshot`;
- Socket.IO URL: `http://127.0.0.1:8765`;
- CORS разрешён только для loopback browser origins;
- gateway принимает только loopback network requests.

## Registry graph

Board строится только из runtime gateway snapshot data. UI не создаёт отдельный
root node из факта открытого диалога или активности страницы.

Граф layout ориентирован на стабильность и предсказуемость для плотных графов:

- `src/components/Board.tsx` строит координаты node через фиксированную, стабильную решётку (`horizontalGap`/`verticalGap`) и порядок рендера из входящих `sessions`; layout не случайный.
- Ширина node задается в `src/styles/global.css` (`.monitor-node { width: 300px; }`), а `ReactFlow` используется с `fitView`, поэтому плотный набор сессий укладывается в устойчивый spacing без пересечения без ввода дополнительного layout engine.
- Приоритет в отрисовке — читаемость связей: `node` и `edge` остаются read-only представлением текущего состояния runtime snapshot, без локальных "synthetic" координатных переосмыслений.
- `runtime_active`/`presence_state` и все жизненные признаки берутся из gateway-данных (runtime path не изменён); layout корректируется только по изменениям в snapshot/handoff stream.

`selected` используется только для Inspector и может быть ровно у одной node.
`active` является presence/execution-lease состоянием, а не lifecycle
`status: running`: для worker-а active glow включается только при
`presence_state: working`, свежем heartbeat/lease и `lease_status: claimed`.

Peer communication links берутся из runtime gateway messages tail, если message
содержит `target_session_id`. Такие links отображаются как read-only
communication edges между known sessions и не изменяют lifecycle.

Board не выводит постоянные текстовые labels на соединительных стрелках:
relation label остаётся в accessibility/title metadata, а на canvas связь
показывается статичной линией. Анимированный flow включается только для
recent/in-flight peer message, unresolved notification или handoff event.

Group-aware edge hints остаются read-only visual layer: если `source/target`
session ids содержат group token формата `G<number>-...`, edge получает
intra/cross group hint (в title metadata и штриховке cross-group связи).
Data mapping и runtime gateway contract при этом не меняются.

## Operator Console и Live Activity

Operator Console показывает только worker-visible summaries, status events и
handoffs из runtime gateway messages tail. Дополнительно добавлены controls для
операторского flow: `request_worker` и `accept_result` через gateway command.
Raw private reasoning, hidden chain-of-thought, secrets, full tool transcripts и
PII beyond task need не отображаются.

Live Activity собирается из user-visible message trace events всех sessions
(`status-update`, `decision`, `handoff`, `blocker`, `tool-summary`,
`artifact-reference`) и использует session status как резервное отображение для
sessions без visible message trace внутри gateway snapshot.

Maintenance History panel остаётся read-only UI surface. После удаления
dev-server generated-file endpoint она получает данные только если они появятся
в canonical runtime gateway snapshot contract.

## Validation

- Неизвестный source mode отклоняется на уровне TypeScript contract.
- Runtime gateway snapshot должен иметь `type: "snapshot"`.
- Empty sessions snapshot отображается как degraded diagnostic state, а не как
  synthetic sample dataset.
- Неизвестные `event_type`, `visibility` и message state нормализуются только
  через runtime gateway normalizers.
- Live runtime records и synthetic/sample records нельзя смешивать в одном
  dataset.
- UI разрешает только контролируемые operator write-команды `request_worker` и
  `accept_result`; `send_message`, `ping`, `stop`, `close`, `reassign`,
  `continue` и outbound messaging находятся вне данного scope.

## Acceptance checks

- `npm --prefix .ai/tools/agent-monitor run build`
- `git diff --check`
- `rg` scan по старым runtime identifiers из worker assignment.

## Future outbound

Outbound messaging не входит в текущий scope. Target selector, input и submit
action допустимы только после отдельного controlled Dialog Assistant adapter
contract, audit schema и security review.
