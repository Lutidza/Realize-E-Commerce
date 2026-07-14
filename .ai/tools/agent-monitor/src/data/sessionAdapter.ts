/**
 * @file .ai/tools/agent-monitor/src/data/sessionAdapter.ts
 * @version 0.5.0 - 2026-05-07 03:10
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Shared adapter contract and dataset mapper for Agent Monitor
 * runtime gateway data. The active data-plane is owned by
 * data/runtimeGateway and does not provide legacy Vite or synthetic sample
 * adapters.
 *
 * Changes in version 0.5.0:
 * - Removed the static sample adapter as an active runtime path.
 */
import type {
  MonitorDataSourceMode,
  MonitorDataset,
  MonitorEvent,
  MonitorHandoff,
  MonitorMessage,
  MonitorSession,
  MonitorValidationIssue,
  RegistrySession,
  WorkerSessionRegistry,
} from '@/types/session';
import type { MaintenanceHistory } from '@/types/maintenance';

const statusTone: Record<MonitorSession['status'], MonitorEvent['tone']> = {
  planned: 'neutral',
  launched: 'info',
  running: 'info',
  'result-ready': 'warning',
  'needs-review': 'warning',
  blocked: 'danger',
  closed: 'success',
};

const recentActivityThresholdMs = 10 * 60 * 1000;

const emptyMaintenanceHistory: MaintenanceHistory = {
  loadedAt: '',
  reports: [],
};

export interface RegistryDataAdapter {
  sourceLabel: string;
  sourceMode: MonitorDataSourceMode;
  loadDataset: () => Promise<MonitorDataset>;
  subscribe?: (handlers: RegistryDataSubscriptionHandlers) => () => void;
}

export interface RegistryDataSubscriptionHandlers {
  onDataset: (dataset: MonitorDataset) => void;
  onError: (error: Error) => void;
}

export function createMonitorDataset(
  options: {
    registry: WorkerSessionRegistry;
    messages?: MonitorMessage[];
    maintenanceHistory?: MaintenanceHistory;
    validationIssues?: MonitorValidationIssue[];
    sourceLabel?: string;
    sourceMode?: MonitorDataSourceMode;
  },
): MonitorDataset {
  const registry = options.registry;
  const messages = options.messages ?? [];
  const sessions = registry.active_sessions
    .map(normalizeSession)
    .map((session) => applyRuntimeState(session, messages));

  return {
    sessions,
    handoffs: createHandoffs(sessions, messages),
    events: createEvents(sessions, messages),
    messages,
    maintenanceHistory: options.maintenanceHistory ?? emptyMaintenanceHistory,
    validationIssues: options.validationIssues ?? [],
    sourceLabel: options.sourceLabel ?? 'registry adapter',
    sourceMode: options.sourceMode ?? 'runtime-readonly',
  };
}

function normalizeSession(session: RegistrySession): MonitorSession {
  const scope = asRecord(session.scope);
  const metadata = asRecord(session.metadata);
  const jobPayload = asRecord(session.job_payload);
  const executionModel = pickString([
    jobPayload.model,
    asRecord(jobPayload.request_json).model,
    metadata.model,
    metadata.execution_model,
    asRecord(metadata.bridge).model,
    scope.model,
    scope.execution_model,
  ]);
  const executionTier = pickString([
    jobPayload.tier,
    jobPayload.reasoning_effort,
    asRecord(jobPayload.request_json).tier,
    asRecord(jobPayload.request_json).reasoning_effort,
    metadata.tier,
    metadata.reasoning_effort,
    asRecord(metadata.bridge).tier,
    asRecord(metadata.bridge).reasoning_effort,
    scope.tier,
    scope.reasoning_effort,
  ]);

  return {
    session_id: session.session_id,
    role: session.role,
    mission: session.mission,
    status: session.status,
    result_path: session.result_path ?? null,
    messages_path: session.messages_path ?? null,
    allowed_paths: session.allowed_paths ?? [],
    updated_at: session.updated_at,
    resolution: session.resolution ?? null,
    worker_kind: session.worker_kind ?? 'worker',
    assigned_by: session.assigned_by ?? null,
    scope: session.scope ?? null,
    handoff_required: Boolean(session.handoff_required),
    metadata: session.metadata ?? null,
    assignee_session_id: session.assignee_session_id ?? null,
    current_actor_session_id: session.current_actor_session_id ?? null,
    execution_backend: session.execution_backend ?? null,
    execution_handle: session.execution_handle ?? null,
    lease_status: session.lease_status ?? null,
    allowed_actions: session.allowed_actions ?? [],
    handoff_target: session.handoff_target ?? null,
    job_status: session.job_status ?? null,
    job_payload: session.job_payload ?? null,
    bridge_state: session.bridge_state ?? null,
    job_id: session.job_id ?? null,
    execution_model: executionModel,
    execution_tier: executionTier,
    context_budget: resolveContextBudget([jobPayload, metadata, scope]),
    access_mode: session.write_allowed ? 'write' : 'read-only',
    allowed_path_count: (session.allowed_paths ?? []).length,
    write_allowed: Boolean(session.write_allowed),
    runtime_active: false,
    quiet: true,
    message_count: 0,
    recent_message_at: null,
    presence_state: session.presence_state ?? null,
    current_activity: session.current_activity ?? null,
    heartbeat_at: session.heartbeat_at ?? null,
    lease_expires_at: session.lease_expires_at ?? null,
    group_id: session.group_id ?? null,
    group_role: session.group_role ?? null,
    group_name: session.group_name ?? null,
    group_metadata: session.group_metadata ?? null,
  };
}

function applyRuntimeState(
  session: MonitorSession,
  messages: MonitorMessage[],
  now: Date = new Date(),
): MonitorSession {
  const sessionMessages = messages.filter((message) => (
    message.session_id === session.session_id
    || message.target_session_id === session.session_id
  ));
  const recentMessageAt = getRecentMessageAt(sessionMessages);
  const hasRecentMessage = recentMessageAt !== null
    && isTimestampWithin(recentMessageAt, now, recentActivityThresholdMs);
  const runtimeActive = isWorkingPresenceActive(session, now);

  return {
    ...session,
    runtime_active: runtimeActive,
    quiet: !hasRecentMessage,
    message_count: sessionMessages.length,
    recent_message_at: recentMessageAt,
  };
}

function createHandoffs(
  sessions: MonitorSession[],
  messages: MonitorMessage[],
): MonitorHandoff[] {
  const knownIds = new Set(sessions.map((session) => session.session_id));

  return dedupeHandoffs([
    ...createAssignmentEdges(sessions, knownIds),
    ...createCommunicationEdges(messages, knownIds),
  ]);
}

function createAssignmentEdges(
  sessions: MonitorSession[],
  knownIds: Set<string>,
): MonitorHandoff[] {
  return sessions.flatMap((session) => {
    if (typeof session.assigned_by !== 'string' || !knownIds.has(session.assigned_by)) {
      return [];
    }

    return [{
      id: `${session.assigned_by}-${session.session_id}`,
      source: session.assigned_by,
      target: session.session_id,
      label: session.handoff_required ? 'handoff required' : 'assigned',
      edge_kind: 'assignment',
      flow_active: false,
      source_message_id: null,
      source_message_state: null,
      source_event_type: null,
      source_notification_type: null,
      source_interaction_type: null,
      correlation_id: null,
      source_timestamp: null,
      unresolved: false,
      flow_reason: null,
    }];
  });
}

function createCommunicationEdges(
  messages: MonitorMessage[],
  knownIds: Set<string>,
): MonitorHandoff[] {
  return messages.flatMap((message) => {
    if (!message.target_session_id) {
      return [];
    }

    const source = message.session_id;
    const target = message.target_session_id;
    const flowReason = resolveCommunicationFlowReason(message);

    if (
      source === target
      || !knownIds.has(source)
      || !knownIds.has(target)
    ) {
      return [];
    }

    return [{
      id: `message-${source}-${target}-${message.id}`,
      source,
      target,
      label: message.peer_link?.label ?? 'message',
      edge_kind: 'communication',
      flow_active: flowReason !== null,
      source_message_id: message.id,
      source_message_state: message.message_state,
      source_event_type: message.event_type,
      source_notification_type: message.notification_type,
      source_interaction_type: message.interaction_type ?? message.event_type,
      correlation_id: message.correlation_id,
      source_timestamp: message.timestamp,
      unresolved: flowReason === 'unresolved',
      flow_reason: flowReason,
    }];
  });
}

function dedupeHandoffs(handoffs: MonitorHandoff[]): MonitorHandoff[] {
  return Array.from(handoffs.reduce((uniqueHandoffs, handoff) => {
    const key = createHandoffDedupeKey(handoff);
    const existing = uniqueHandoffs.get(key);

    if (!existing || shouldReplaceHandoff(existing, handoff)) {
      uniqueHandoffs.set(key, handoff);
    }

    return uniqueHandoffs;
  }, new Map<string, MonitorHandoff>()).values());
}

function createHandoffDedupeKey(handoff: MonitorHandoff): string {
  if (handoff.edge_kind === 'assignment') {
    return `assignment:${handoff.source}:${handoff.target}:${handoff.label}`;
  }

  const interactionType = handoff.source_interaction_type
    ?? handoff.source_notification_type
    ?? handoff.source_event_type
    ?? handoff.label;
  const correlation = handoff.correlation_id ?? 'no-correlation';
  return `communication:${handoff.source}:${handoff.target}:${interactionType}:${correlation}`;
}

function createEvents(
  sessions: MonitorSession[],
  messages: MonitorMessage[],
): MonitorEvent[] {
  const sessionIdsWithMessages = new Set(messages.map((message) => message.session_id));
  const messageEvents = messages.map(createEventFromMessage);
  const registryFallbackEvents = sessions
    .filter((session) => !sessionIdsWithMessages.has(session.session_id))
    .map(createRegistryStatusEvent);

  return [
    ...messageEvents,
    ...registryFallbackEvents,
  ].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

function createEventFromMessage(message: MonitorMessage): MonitorEvent {
  return {
    id: `message-${message.id}`,
    session_id: message.session_id,
    timestamp: message.timestamp,
    label: `${message.session_id}: ${message.title} - ${message.body}`,
    tone: resolveMessageTone(message),
  };
}

function createRegistryStatusEvent(session: MonitorSession): MonitorEvent {
  return {
    id: `registry-status-${session.session_id}`,
    session_id: session.session_id,
    timestamp: session.updated_at,
    label: `${session.role} is ${session.status}`,
    tone: statusTone[session.status],
  };
}

function resolveMessageTone(message: MonitorMessage): MonitorEvent['tone'] {
  const eventText = `${message.kind} ${message.title}`.toLowerCase();

  if (eventText.includes('blocker')) {
    return 'danger';
  }

  if (eventText.includes('handoff') || eventText.includes('decision')) {
    return 'warning';
  }

  if (eventText.includes('artifact-reference') || eventText.includes('tool-summary')) {
    return 'success';
  }

  if (eventText.includes('status')) {
    return 'info';
  }

  return 'neutral';
}

function getRecentMessageAt(messages: MonitorMessage[]): string | null {
  return messages
    .map((message) => message.timestamp)
    .filter(isFiniteTimestamp)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
}

function isTimestampWithin(value: string, now: Date, thresholdMs: number): boolean {
  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) && now.getTime() - timestamp <= thresholdMs;
}

function isWorkingPresenceActive(session: MonitorSession, now: Date): boolean {
  if (session.presence_state !== 'working') {
    return false;
  }

  if (session.lease_expires_at !== null) {
    const leaseExpiresAt = Date.parse(session.lease_expires_at);

    return Number.isFinite(leaseExpiresAt)
      && leaseExpiresAt >= now.getTime()
      && hasActiveExecutionLease(session);
  }

  if (session.heartbeat_at !== null) {
    return isTimestampWithin(session.heartbeat_at, now, recentActivityThresholdMs)
      && hasActiveExecutionLease(session);
  }

  return false;
}

function hasActiveExecutionLease(session: MonitorSession): boolean {
  if (session.lease_status !== 'claimed') {
    return false;
  }

  const assigneeSessionId = session.assignee_session_id ?? session.session_id;

  return session.current_actor_session_id === assigneeSessionId;
}

function isFiniteTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function resolveCommunicationFlowReason(
  message: MonitorMessage,
  now: Date = new Date(),
): MonitorHandoff['flow_reason'] {
  if (message.message_state === 'queued') {
    return 'queued';
  }

  if (message.message_state === 'delivered') {
    return 'delivered';
  }

  if (isUnresolvedCommunication(message)) {
    return 'unresolved';
  }

  if (message.flow_visible_until !== null) {
    const flowVisibleUntil = Date.parse(message.flow_visible_until);
    if (Number.isFinite(flowVisibleUntil) && flowVisibleUntil >= now.getTime()) {
      return 'recent';
    }
  }

  return isTimestampWithin(message.timestamp, now, recentActivityThresholdMs) ? 'recent' : null;
}

function isUnresolvedCommunication(message: MonitorMessage): boolean {
  if (
    message.operator_command_status === 'queued'
    || message.operator_command_status === 'accepted'
    || message.operator_command_status === 'running'
  ) {
    return true;
  }

  return message.notification_type !== null
    && message.message_state !== 'acknowledged'
    && message.message_state !== 'answered'
    && message.message_state !== 'expired'
    && message.message_state !== 'failed';
}

function shouldReplaceHandoff(existing: MonitorHandoff, candidate: MonitorHandoff): boolean {
  const existingPriority = flowReasonPriority(existing.flow_reason);
  const candidatePriority = flowReasonPriority(candidate.flow_reason);
  if (candidatePriority !== existingPriority) {
    return candidatePriority > existingPriority;
  }

  const existingTimestamp = Date.parse(existing.source_timestamp ?? '');
  const candidateTimestamp = Date.parse(candidate.source_timestamp ?? '');
  if (Number.isFinite(existingTimestamp) && Number.isFinite(candidateTimestamp)) {
    return candidateTimestamp >= existingTimestamp;
  }

  if (Number.isFinite(candidateTimestamp)) {
    return true;
  }

  return false;
}

function flowReasonPriority(reason: MonitorHandoff['flow_reason']): number {
  if (reason === 'unresolved') {
    return 4;
  }
  if (reason === 'queued') {
    return 3;
  }
  if (reason === 'delivered') {
    return 2;
  }
  if (reason === 'recent') {
    return 1;
  }
  return 0;
}

function resolveContextBudget(records: Record<string, unknown>[]): string | null {
  return pickStringOrNumber([
    ...records.map((record) => record.context_budget),
    ...records.map((record) => record.context_budget_tokens),
    ...records.map((record) => record.context_window),
    ...records.map((record) => record.context_tokens),
    ...records.map((record) => asRecord(record.request_json).context_budget),
    ...records.map((record) => asRecord(record.request_json).context_budget_tokens),
    ...records.map((record) => asRecord(record.request_json).context_window),
  ]);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function pickString(values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }
  }

  return null;
}

function pickStringOrNumber(values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return `${value}`;
    }
  }

  return null;
}
