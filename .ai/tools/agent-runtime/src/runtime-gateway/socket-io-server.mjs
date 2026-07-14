/**
 * @file .ai/tools/agent-runtime/src/runtime-gateway/socket-io-server.mjs
 * @version 0.1.0 - 2026-05-07 02:15
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Socket.IO gateway for runtime snapshot, resume, heartbeat, and
 * delta push events. It accepts only loopback clients and uses WebSocket
 * transport only, so the monitor does not rely on browser polling.
 *
 * Changes in version 0.1.0:
 * - Added Socket.IO runtime gateway transport and delta broadcaster.
 */
import { Server as SocketIoServer } from "socket.io";
import { gatewaySchemaVersion, timestamp } from "./protocol.mjs";
import {
  createDeltaPayload,
  createSnapshotPayload,
  currentRevision,
} from "./snapshot-reader.mjs";
import { withRuntimeEvent } from "../runtime-store/event-log.mjs";

const MONITOR_HEARTBEAT_PERSIST_INTERVAL_MS = 60000;
const MONITOR_HEARTBEAT_STALE_AFTER_SECONDS = 120;
const EXPECTED_GATEWAY_URL = "http://127.0.0.1:8765/";
const EXPECTED_MONITOR_URL = "http://127.0.0.1:5173/";

export function attachRuntimeSocketIoServer({
  server,
  database,
  clients,
  isLoopbackRequest,
}) {
  const monitorHeartbeatState = {
    lastPersistedAtMs: 0,
  };
  const io = new SocketIoServer(server, {
    cors: {
      origin: allowLoopbackOrigin,
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
  });

  io.use((socket, next) => {
    if (!isLoopbackRequest(socket.request)) {
      next(new Error("Runtime gateway accepts loopback Socket.IO clients only"));
      return;
    }

    next();
  });

  io.on("connection", (socket) => {
    const client = {
      connectionId: socket.id,
      socket,
    };
    clients.set(client.connectionId, client);

    socket.emit("runtime:hello", {
      type: "hello",
      schema_version: gatewaySchemaVersion,
      sent_at: timestamp(),
      connection_id: client.connectionId,
      revision: currentRevision(database),
    });
    socket.emit("runtime:snapshot", createSnapshotPayload(database, client.connectionId));

    socket.on("runtime:resume", (message = {}) => {
      handleResume({
        client,
        database,
        lastRevision: Number(message.last_revision ?? 0),
      });
    });
    socket.on("monitor:heartbeat", (payload = {}) => {
      handleMonitorHeartbeat({
        database,
        payload,
        monitorHeartbeatState,
      });
    });
    socket.on("disconnect", () => {
      clients.delete(client.connectionId);
    });
  });

  return io;
}

export function broadcastDelta({
  clients,
  database,
  fromRevision,
  toRevision,
}) {
  for (const client of clients.values()) {
    client.socket.emit("runtime:delta", createDeltaPayload({
      database,
      fromRevision,
      toRevision,
      connectionId: client.connectionId,
    }));
  }
}

function handleResume({
  client,
  database,
  lastRevision,
}) {
  const toRevision = currentRevision(database);
  if (lastRevision < toRevision) {
    client.socket.emit("runtime:delta", createDeltaPayload({
      database,
      fromRevision: lastRevision,
      toRevision,
      connectionId: client.connectionId,
    }));
    return;
  }

  client.socket.emit("runtime:heartbeat", {
    type: "heartbeat",
    schema_version: gatewaySchemaVersion,
    sent_at: timestamp(),
    connection_id: client.connectionId,
    revision: toRevision,
  });
}

function allowLoopbackOrigin(origin, callback) {
  if (origin === undefined || isLoopbackOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error("Runtime gateway Socket.IO origin is not loopback"), false);
}

function isLoopbackOrigin(origin) {
  if (typeof origin !== "string" || origin.trim() === "") {
    return false;
  }

  try {
    const originUrl = new URL(origin);
  return (originUrl.protocol === "http:" || originUrl.protocol === "https:")
      && [
        "127.0.0.1",
        "localhost",
        "::1",
        "[::1]",
      ].includes(originUrl.hostname);
  } catch {
    return false;
  }
}

function handleMonitorHeartbeat({
  database,
  payload,
  monitorHeartbeatState,
}) {
  const nowMs = Date.now();
  if (nowMs - monitorHeartbeatState.lastPersistedAtMs < MONITOR_HEARTBEAT_PERSIST_INTERVAL_MS) {
    return;
  }

  const heartbeatSentAt = normalizeIsoDate(payload?.sent_at);
  const source = normalizeString(payload?.source) ?? "agent-monitor";
  const heartbeatIntervalMs = Number.isFinite(payload?.interval_ms) ? Number(payload.interval_ms) : null;
  const heartbeatStaleAfterSeconds = normalizePositiveInteger(payload?.heartbeat_stale_after_seconds, MONITOR_HEARTBEAT_STALE_AFTER_SECONDS);
  const monitorUrl = normalizeKnownMonitorUrl(payload?.monitor_url);
  const gatewayUrl = normalizeKnownGatewayUrl(payload?.gateway_url);
  const monitorUrlMatchesExpected = monitorUrl === EXPECTED_MONITOR_URL;
  const gatewayUrlMatchesExpected = gatewayUrl === EXPECTED_GATEWAY_URL;
  const expectedUrlMismatch = !monitorUrlMatchesExpected || !gatewayUrlMatchesExpected;

  withRuntimeEvent(
    { database },
    {
      eventType: "monitor.heartbeat",
      aggregateType: "monitor",
      aggregateId: "agent-monitor",
      visibility: "internal-summary",
      summary: "Monitor heartbeat received.",
      payload: {
        source,
        heartbeat_interval_ms: heartbeatIntervalMs,
        heartbeat_stale_after_seconds: heartbeatStaleAfterSeconds,
        monitor_url: monitorUrl,
        gateway_url: gatewayUrl,
        expected_monitor_url: EXPECTED_MONITOR_URL,
        expected_gateway_url: EXPECTED_GATEWAY_URL,
        monitor_url_matches_expected: monitorUrlMatchesExpected,
        gateway_url_matches_expected: gatewayUrlMatchesExpected,
        expected_url_mismatch: expectedUrlMismatch,
        client_sent_at: heartbeatSentAt,
      },
      createdAt: heartbeatSentAt ?? timestamp(),
    },
    () => {
      monitorHeartbeatState.lastPersistedAtMs = nowMs;
      return true;
    },
  );
}

function normalizeIsoDate(value) {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return new Date(parsed).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeKnownMonitorUrl(value) {
  return normalizeString(value);
}

function normalizeKnownGatewayUrl(value) {
  return normalizeString(value);
}

function normalizePositiveInteger(value, fallback = 0) {
  if (!Number.isFinite(Number(value))) {
    return fallback;
  }
  const integerValue = Math.floor(Number(value));
  return integerValue > 0 ? integerValue : fallback;
}
