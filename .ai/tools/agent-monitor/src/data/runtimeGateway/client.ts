/**
 * @file .ai/tools/agent-monitor/src/data/runtimeGateway/client.ts
 * @version 0.2.2 - 2026-05-10 16:05
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description HTTP snapshot, Socket.IO subscription, and constrained command
 * client for the local agent runtime gateway used by the Agent Monitor adapter.
 *
 * Changes in version 0.2.2:
 * - Added allowed_paths to request_worker command payloads.
 */
import { io, type Socket } from 'socket.io-client';
import type {
  MonitorDataset,
} from '@/types/session';
import type {
  RegistryDataSubscriptionHandlers,
} from '@/data/sessionAdapter';
import {
  createDatasetFromSnapshot,
} from '@/data/runtimeGateway/snapshotMapper';
import {
  asRecord,
  toFiniteNumber,
} from '@/data/runtimeGateway/normalizers';
import type {
  RuntimeGatewayCommandPayload,
  RuntimeGatewayCommandResult,
  RuntimeGatewayOperatorCommandRequest,
} from '@/data/runtimeGateway/types';

export async function loadRuntimeGatewayDataset(
  snapshotUrl: string,
): Promise<MonitorDataset> {
  const response = await fetch(snapshotUrl, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`agent-monitor runtime gateway snapshot failed: ${response.status}`);
  }

  return createDatasetFromSnapshot(await response.json());
}

export const runtimeGatewayCommandUrl = 'http://127.0.0.1:8765/command';

export async function postRuntimeGatewayCommand(
  payload: RuntimeGatewayCommandPayload,
  commandUrl: string = runtimeGatewayCommandUrl,
): Promise<RuntimeGatewayCommandResult> {
  const response = await fetch(commandUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  let responsePayload: unknown;
  try {
    responsePayload = await response.json();
  } catch (error) {
    throw new Error(`agent-monitor runtime command malformed response: ${response.status} ${response.statusText}`);
  }

  if (!response.ok) {
    throw new Error(readErrorMessage(responsePayload, response.status, response.statusText));
  }

  if (!isRecord(responsePayload)) {
    throw new Error('agent-monitor runtime command returned non-object payload');
  }

  return responsePayload as RuntimeGatewayCommandResult;
}

export async function sendOperatorRequestWorkerCommand(args: {
  actorSessionId: string;
  targetSessionId: string;
  role: string;
  mission: string;
  model: string;
  allowedPaths: string[];
  commandId: string;
  summary?: string;
}): Promise<RuntimeGatewayCommandResult> {
  const request = {
    role: args.role.trim(),
    mission: args.mission.trim(),
    model: args.model.trim(),
    allowed_paths: args.allowedPaths.map((path) => path.trim()).filter(Boolean),
  };

  const options: RuntimeGatewayOperatorCommandRequest = {
    'actor-session-id': args.actorSessionId,
    'target-session-id': args.targetSessionId,
    'command-type': 'request_worker',
    'idempotency-key': args.commandId,
    summary: args.summary,
    'request-json': request,
  };

  return postRuntimeGatewayCommand({
    command: 'operator-command-dispatch',
    command_id: args.commandId,
    options,
  });
}

export async function sendOperatorAcceptResultCommand(args: {
  actorSessionId: string;
  targetSessionId: string;
  commandId: string;
  summary?: string;
}): Promise<RuntimeGatewayCommandResult> {
  const options: RuntimeGatewayOperatorCommandRequest = {
    'actor-session-id': args.actorSessionId,
    'target-session-id': args.targetSessionId,
    'command-type': 'accept_result',
    'idempotency-key': args.commandId,
    summary: args.summary,
  };

  return postRuntimeGatewayCommand({
    command: 'operator-command-dispatch',
    command_id: args.commandId,
    options,
  });
}

const MONITOR_HEARTBEAT_INTERVAL_MS = 30000;
const MONITOR_HEARTBEAT_STALE_AFTER_SECONDS = 120;
const EXPECTED_GATEWAY_URL = 'http://127.0.0.1:8765/';
const EXPECTED_MONITOR_URL = 'http://127.0.0.1:5173/';

export function subscribeToRuntimeGateway(options: {
  handlers: RegistryDataSubscriptionHandlers;
  snapshotUrl: string;
  socketUrl: string;
}): () => void {
  const socket: Socket = io(options.socketUrl, {
    autoConnect: false,
    transports: ['websocket'],
  });
  let closed = false;
  let lastRevision = 0;
  let refreshInFlight = false;
  let refreshPending = false;
  let connectTimer: ReturnType<typeof window.setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof window.setInterval> | null = null;

  const publishFreshSnapshot = async () => {
    if (refreshInFlight) {
      refreshPending = true;
      return;
    }

    refreshInFlight = true;
    try {
      const dataset = await loadRuntimeGatewayDataset(options.snapshotUrl);
      if (!closed) {
        options.handlers.onDataset(dataset);
      }
    } catch (error) {
      if (!closed) {
        options.handlers.onError(normalizeError(error));
      }
    } finally {
      refreshInFlight = false;
      if (refreshPending && !closed) {
        refreshPending = false;
        void publishFreshSnapshot();
      }
    }
  };

  const emitHeartbeat = () => {
    if (!socket.connected || closed) {
      return;
    }

    socket.emit('monitor:heartbeat', {
      type: 'heartbeat',
      source: 'agent-monitor',
      interval_ms: MONITOR_HEARTBEAT_INTERVAL_MS,
      heartbeat_stale_after_seconds: MONITOR_HEARTBEAT_STALE_AFTER_SECONDS,
      gateway_url: EXPECTED_GATEWAY_URL,
      monitor_url: EXPECTED_MONITOR_URL,
      sent_at: new Date().toISOString(),
    });
  };

  const startHeartbeat = () => {
    if (heartbeatTimer !== null) {
      return;
    }

    emitHeartbeat();
    heartbeatTimer = window.setInterval(emitHeartbeat, MONITOR_HEARTBEAT_INTERVAL_MS);
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer === null) {
      return;
    }

    window.clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  };

  socket.on('connect', () => {
    if (lastRevision > 0) {
      socket.emit('runtime:resume', {
        last_revision: lastRevision,
      });
    }

    startHeartbeat();
  });
  socket.on('runtime:snapshot', (payload: unknown) => {
    const snapshot = parseGatewayPayload(payload);
    if (!snapshot) {
      return;
    }

    lastRevision = toFiniteNumber(snapshot.revision, lastRevision);
    options.handlers.onDataset(createDatasetFromSnapshot(snapshot));
  });
  socket.on('runtime:delta', (payload: unknown) => {
    const delta = parseGatewayPayload(payload);
    if (!delta) {
      return;
    }

    lastRevision = toFiniteNumber(delta.to_revision, lastRevision);
    void publishFreshSnapshot();
  });
  socket.on('connect_error', (error) => {
    if (!closed) {
      options.handlers.onError(error);
    }
  });
  socket.on('disconnect', () => {
    stopHeartbeat();
  });
  connectTimer = window.setTimeout(() => {
    connectTimer = null;
    socket.connect();
  }, 0);

  return () => {
    closed = true;
    if (connectTimer !== null) {
      window.clearTimeout(connectTimer);
    }
    stopHeartbeat();
    socket.disconnect();
  };
}

function parseGatewayPayload(value: unknown): Record<string, unknown> | null {
  return asRecord(value);
}

function normalizeError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new Error('agent-monitor runtime gateway subscription failed');
}

function readErrorMessage(
  responsePayload: unknown,
  status: number,
  fallbackStatusText: string,
): string {
  if (isRecord(responsePayload)) {
    const message = typeof responsePayload.message === 'string'
      ? responsePayload.message
      : typeof responsePayload.error === 'string'
        ? responsePayload.error
        : typeof responsePayload.detail === 'string'
          ? responsePayload.detail
          : undefined;

    if (message) {
      return `agent-monitor runtime command failed: ${message}`;
    }
  }

  return `agent-monitor runtime command failed: ${status} ${fallbackStatusText}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
