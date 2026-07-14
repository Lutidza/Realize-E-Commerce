/**
 * @file .ai/tools/agent-monitor/src/data/runtimeGateway/runtimeGatewayAdapter.ts
 * @version 0.3.0 - 2026-05-07 02:15
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Entry point for the Agent Monitor direct runtime gateway
 * adapter. The adapter uses loopback HTTP for snapshots and Socket.IO events
 * for reactive updates, without periodic timer refresh.
 *
 * Changes in version 0.3.0:
 * - Moved the adapter entrypoint into its runtimeGateway owner folder and
 *   switched live events to Socket.IO.
 */
import type {
  RegistryDataAdapter,
} from '@/data/sessionAdapter';
import {
  loadRuntimeGatewayDataset,
  subscribeToRuntimeGateway,
} from '@/data/runtimeGateway/client';
import type {
  RuntimeGatewayAdapterOptions,
} from '@/data/runtimeGateway/types';
import {
  runtimeGatewaySourceLabel,
  runtimeGatewaySourceMode,
} from '@/data/runtimeGateway/snapshotMapper';

const defaultGatewayBaseUrl = 'http://127.0.0.1:8765';
const defaultGatewaySocketUrl = 'http://127.0.0.1:8765';

export const runtimeGatewayAdapter = createRuntimeGatewayAdapter();

export function createRuntimeGatewayAdapter(
  options: RuntimeGatewayAdapterOptions = {},
): RegistryDataAdapter {
  const snapshotUrl = `${options.baseUrl ?? defaultGatewayBaseUrl}/snapshot`;
  const socketUrl = options.socketUrl ?? defaultGatewaySocketUrl;

  return {
    sourceLabel: runtimeGatewaySourceLabel,
    sourceMode: runtimeGatewaySourceMode,
    loadDataset: () => loadRuntimeGatewayDataset(snapshotUrl),
    subscribe: (handlers) => subscribeToRuntimeGateway({
      handlers,
      snapshotUrl,
      socketUrl,
    }),
  };
}
