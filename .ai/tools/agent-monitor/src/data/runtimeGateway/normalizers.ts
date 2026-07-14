/**
 * @file .ai/tools/agent-monitor/src/data/runtimeGateway/normalizers.ts
 * @version 0.1.0 - 2026-05-07 01:30
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Normalization helpers that map agent runtime gateway enum and
 * primitive values into the Agent Monitor read model contract.
 *
 * Changes in version 0.1.0:
 * - Added runtime-to-monitor enum normalization helpers.
 */
import type {
  MonitorMessage,
  WorkerJobLeaseStatus,
  WorkerMessageEventType,
  WorkerMessageState,
  WorkerPresenceState,
  WorkerResolution,
  WorkerStatus,
} from '@/types/session';

export function normalizeStatus(value: unknown): WorkerStatus {
  const status = String(value ?? '');
  if (status === 'starting') {
    return 'launched';
  }
  if (status === 'result_ready') {
    return 'result-ready';
  }
  if (status === 'needs_review') {
    return 'needs-review';
  }
  if (status === 'blocked' || status === 'failed') {
    return 'blocked';
  }
  if (status === 'closed' || status === 'cancelled') {
    return 'closed';
  }
  if (status === 'planned' || status === 'running') {
    return status;
  }

  return 'running';
}

export function normalizeResolution(value: unknown): WorkerResolution {
  const resolution = String(value ?? '');
  if (resolution === 'accepted' || resolution === 'reassigned' || resolution === 'continued') {
    return resolution;
  }
  if (resolution === 'blocked') {
    return 'blocked-with-reason';
  }
  if (resolution === 'cancelled' || resolution === 'failed' || resolution === 'completed') {
    return 'closed';
  }
  if (resolution === 'user_deferred') {
    return 'user-approved-deferral';
  }

  return null;
}

export function normalizeLeaseStatus(value: unknown): WorkerJobLeaseStatus | null {
  const leaseStatus = String(value ?? '');
  if (
    leaseStatus === 'unassigned'
    || leaseStatus === 'claimed'
    || leaseStatus === 'waiting'
    || leaseStatus === 'released'
    || leaseStatus === 'transferred'
    || leaseStatus === 'blocked'
    || leaseStatus === 'completed'
  ) {
    return leaseStatus;
  }
  if (leaseStatus === 'expired') {
    return 'released';
  }

  return null;
}

export function normalizePresenceState(value: unknown): WorkerPresenceState | null {
  const state = String(value ?? '');
  if (state === 'working' || state === 'waiting' || state === 'idle' || state === 'stale' || state === 'offline') {
    return state;
  }
  if (state === 'online') {
    return 'idle';
  }

  return null;
}

export function normalizeMessageState(value: unknown): WorkerMessageState | null {
  const state = String(value ?? '');
  if (state === 'read') {
    return 'delivered';
  }
  if (
    state === 'queued'
    || state === 'delivered'
    || state === 'acknowledged'
    || state === 'answered'
    || state === 'expired'
    || state === 'failed'
  ) {
    return state;
  }

  return null;
}

export function normalizeVisibility(value: unknown): MonitorMessage['visibility'] {
  return value === 'redacted' ? 'redacted' : 'user-visible';
}

export function inferMessageKind(channel: string): MonitorMessage['kind'] {
  if (channel === 'handoff') {
    return 'handoff';
  }
  if (channel === 'system') {
    return 'status';
  }
  if (channel === 'result') {
    return 'event';
  }

  return 'summary';
}

export function inferEventType(channel: string, payload: unknown): WorkerMessageEventType {
  const eventType = asRecord(payload).event_type;
  if (isWorkerMessageEventType(eventType)) {
    return eventType;
  }
  if (channel === 'handoff') {
    return 'handoff';
  }
  if (channel === 'result') {
    return 'tool-summary';
  }

  return channel === 'system' ? 'status-update' : 'worker-message';
}

export function inferMessageTitle(channel: string, summary: string): string {
  if (summary.toLowerCase().includes('blocker')) {
    return 'blocker';
  }

  return `${channel} message`;
}

export function inferPeerLinkLabel(
  channel: string,
  summary: string,
): NonNullable<MonitorMessage['peer_link']>['label'] {
  const lowerSummary = summary.toLowerCase();
  if (channel === 'handoff') {
    return 'handoff';
  }
  if (lowerSummary.includes('verify')) {
    return 'verify';
  }
  if (lowerSummary.includes('review')) {
    return 'review';
  }

  return 'message';
}

export function humanizeRole(value: string): string {
  const pathTrimmedValue = value.replace(/\/INDEX\.md$/u, '');
  const lastSegment = pathTrimmedValue.split('/').filter(Boolean).pop() ?? value;
  return lastSegment
    .replace(/\.(md|json)$/u, '')
    .replace(/[-_]+/gu, ' ')
    .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase());
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

export function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

export function optionalRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

export function optionalBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

export function stringOrNow(value: unknown): string {
  return typeof value === 'string' && value.trim() !== ''
    ? value
    : new Date().toISOString();
}

export function toFiniteNumber(value: unknown, fallback: number): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export function extractExecutionModel(options: {
  scope: Record<string, unknown>;
  metadata: Record<string, unknown>;
  jobPayload: Record<string, unknown>;
}): string | null {
  const payloadRequest = asRecord(options.jobPayload.request_json);
  return pickString([
    options.jobPayload.model,
    payloadRequest.model,
    options.metadata.model,
    options.metadata.execution_model,
    asRecord(options.metadata.bridge).model,
    options.scope.model,
    options.scope.execution_model,
  ]);
}

export function extractExecutionTier(options: {
  scope: Record<string, unknown>;
  metadata: Record<string, unknown>;
  jobPayload: Record<string, unknown>;
}): string | null {
  const payloadRequest = asRecord(options.jobPayload.request_json);
  return pickString([
    options.jobPayload.tier,
    options.jobPayload.reasoning_effort,
    payloadRequest.tier,
    payloadRequest.reasoning_effort,
    options.metadata.tier,
    options.metadata.reasoning_effort,
    asRecord(options.metadata.bridge).tier,
    asRecord(options.metadata.bridge).reasoning_effort,
    options.scope.tier,
    options.scope.reasoning_effort,
  ]);
}

export function isUnresolvedOperatorCommandStatus(value: unknown): boolean {
  return typeof value === 'string'
    && ['queued', 'accepted', 'running'].includes(value);
}

function isWorkerMessageEventType(value: unknown): value is WorkerMessageEventType {
  return typeof value === 'string'
    && [
      'status-update',
      'worker-message',
      'review-comment',
      'handoff',
      'blocker',
      'decision',
      'tool-summary',
      'artifact-reference',
    ].includes(value);
}

function pickString(values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }
  }

  return null;
}
