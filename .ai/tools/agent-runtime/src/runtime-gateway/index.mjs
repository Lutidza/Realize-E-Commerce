/**
 * @file .ai/tools/agent-runtime/src/runtime-gateway/index.mjs
 * @version 0.2.1 - 2026-05-10 16:10
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Gateway lifecycle entrypoint. It wires the loopback HTTP
 * server, SQLite runtime store, command cache, and Socket.IO client registry.
 *
 * Changes in version 0.2.1:
 * - Replaced native WebSocket upgrade handling with Socket.IO transport.
 * - Added server-side revision watcher with timer cleanup and safe broadcast
 *   propagation for external runtime writes.
 */
import { createServer } from "node:http";
import { openRuntimeDatabase } from "../runtime-schema/index.mjs";
import { RuntimeStore } from "../runtime-store/index.mjs";
import { handleHttpRequest, respondJson } from "./http-routes.mjs";
import { createErrorPayload, gatewayDefaultTickMs, gatewayMaxTickMs } from "./protocol.mjs";
import { attachRuntimeSocketIoServer } from "./socket-io-server.mjs";
import { currentRevision } from "./snapshot-reader.mjs";
import { broadcastDelta } from "./socket-io-server.mjs";

export async function startRuntimeGateway({
  databasePath,
  host = "127.0.0.1",
  port = 8765,
  logger = console,
} = {}) {
  if (!databasePath) {
    throw new Error("Runtime gateway requires databasePath");
  }

  const database = openRuntimeDatabase(databasePath);
  const store = new RuntimeStore(database);
  const clients = new Map();
  const commandResults = new Map();
  const isLoopbackRequest = createLoopbackGuard();
  const revisionState = {
    currentRevision: 0,
  };
  const pollingIntervalMs = resolvePollingInterval();
  let revisionWatcher = null;
  let isClosing = false;

  const server = createServer(async (request, response) => {
    try {
      await handleHttpRequest({
        request,
        response,
        database,
        store,
        clients,
        commandResults,
        isLoopbackRequest,
        revisionTracker: revisionState,
      });
    } catch (error) {
      respondJson(response, 500, createErrorPayload(
        error instanceof Error ? error.message : "Runtime gateway request failed",
      ));
    }
  });

  const io = attachRuntimeSocketIoServer({
    server,
    database,
    clients,
    isLoopbackRequest,
  });

  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(Number(port), host, () => {
      server.off("error", rejectListen);
      resolveListen();
    });
  });

  revisionWatcher = startRuntimeRevisionWatcher({
    database,
    clients,
    revisionState,
    pollingIntervalMs,
    logger,
  });

  const close = async () => {
    if (isClosing) {
      return;
    }

    isClosing = true;

    if (revisionWatcher) {
      clearInterval(revisionWatcher);
      revisionWatcher = null;
    }

    await closeSocketServer(io);
    await new Promise((resolveClose) => {
      server.close(resolveClose);
    });
    database.close();
  };

  process.once("SIGINT", () => {
    void close().then(() => process.exit(0));
  });
  process.once("SIGTERM", () => {
    void close().then(() => process.exit(0));
  });

  const address = server.address();
  const resolvedPort = typeof address === "object" && address !== null
    ? address.port
    : port;
  logger.log(`ok gateway http://${host}:${resolvedPort}`);

  return {
    close,
    host,
    port: resolvedPort,
    server,
  };
}

function closeSocketServer(io) {
  return new Promise((resolveClose) => {
    io.close(() => {
      resolveClose();
    });
  });
}

function startRuntimeRevisionWatcher({
  database,
  clients,
  revisionState,
  pollingIntervalMs,
  logger,
}) {
  revisionState.currentRevision = currentRevision(database);
  return setInterval(() => {
    try {
      const latestRevision = currentRevision(database);
      if (latestRevision < revisionState.currentRevision) {
        revisionState.currentRevision = latestRevision;
        return;
      }

      if (latestRevision === revisionState.currentRevision) {
        return;
      }

      const fromRevision = revisionState.currentRevision;
      revisionState.currentRevision = latestRevision;
      broadcastDelta({
        clients,
        database,
        fromRevision,
        toRevision: latestRevision,
      });
    } catch (error) {
      logger.warn?.(`runtime gateway revision watcher failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, pollingIntervalMs).unref();
}

function resolvePollingInterval() {
  const configuredInterval = Number(process.env.AGENT_RUNTIME_GATEWAY_POLL_MS ?? `${gatewayMaxTickMs}`);
  if (Number.isNaN(configuredInterval) || configuredInterval <= 0) {
    return gatewayDefaultTickMs;
  }
  return Math.min(gatewayMaxTickMs, Math.max(500, configuredInterval));
}

function createLoopbackGuard() {
  return (request) => {
    const address = request.socket.remoteAddress;
    return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
  };
}
