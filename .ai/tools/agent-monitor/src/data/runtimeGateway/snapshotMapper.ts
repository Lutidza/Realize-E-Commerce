/**
 * @file .ai/tools/agent-monitor/src/data/runtimeGateway/snapshotMapper.ts
 * @version 0.1.0 - 2026-05-07 01:30
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Maps local agent runtime gateway snapshots into the Agent
 * Monitor registry, message, and validation dataset contracts.
 *
 * Changes in version 0.1.0:
 * - Added runtime gateway snapshot to monitor dataset mapping.
 */
import {
  createMonitorDataset,
} from '@/data/sessionAdapter';
import type {
  MonitorDataset,
  MonitorMessage,
  MonitorValidationIssue,
  RegistrySession,
  WorkerSessionRegistry,
} from '@/types/session';
import type {
  NormalizedRuntimeGatewaySnapshot,
  RuntimeGatewaySnapshot,
  RuntimeJobRow,
  RuntimeMessageRow,
  RuntimeNotificationRow,
  RuntimeOperatorCommandRow,
  RuntimePresenceRow,
  RuntimeSessionRow,
} from '@/data/runtimeGateway/types';
import {
  asRecord,
  humanizeRole,
  inferEventType,
  inferMessageKind,
  inferMessageTitle,
  inferPeerLinkLabel,
  normalizeLeaseStatus,
  normalizeMessageState,
  normalizePresenceState,
  normalizeResolution,
  normalizeStatus,
  normalizeVisibility,
  optionalBoolean,
  optionalRecord,
  optionalString,
  stringArray,
  stringOrNow,
  stringValue,
  toFiniteNumber,
} from '@/data/runtimeGateway/normalizers';

export const runtimeGatewaySourceLabel = 'agent runtime gateway';
export const runtimeGatewaySourceMode = 'runtime-readonly';

export function createDatasetFromSnapshot(payload: unknown): MonitorDataset {
  const snapshot = normalizeSnapshot(payload);
  const presenceBySession = new Map(
    snapshot.presence.map((presence) => [presence.session_id, presence]),
  );
  const jobsBySession = groupJobsBySession(snapshot.jobs);
  const operatorCommandsById = indexOperatorCommandsById(snapshot.operator_commands);
  const latestOperatorCommandByTarget = indexLatestOperatorCommandByTarget(snapshot.operator_commands);
  const registry = createRegistry(
    snapshot,
    presenceBySession,
    jobsBySession,
    latestOperatorCommandByTarget,
  );
  const transportMessages = snapshot.messages_tail
    .filter((message) => message.visibility !== 'internal-summary')
    .map((message) => createMonitorMessage(message, operatorCommandsById));
  const notificationMessages = snapshot.notifications
    .map((notification) => createMonitorNotificationMessage(notification));
  const messages = [
    ...transportMessages,
    ...notificationMessages,
  ].sort((left, right) => right.timestamp.localeCompare(left.timestamp));

  return createMonitorDataset({
    registry,
    messages,
    validationIssues: createSnapshotIssues(snapshot),
    sourceLabel: runtimeGatewaySourceLabel,
    sourceMode: runtimeGatewaySourceMode,
  });
}

function normalizeSnapshot(payload: unknown): NormalizedRuntimeGatewaySnapshot {
  const snapshot = asRecord(payload) as unknown as RuntimeGatewaySnapshot;
  if (snapshot.type !== 'snapshot') {
    throw new Error('agent-monitor runtime gateway returned non-snapshot payload');
  }

  return {
    type: 'snapshot',
    schema_version: String(snapshot.schema_version ?? 'unknown'),
    sent_at: stringOrNow(snapshot.sent_at),
    revision: toFiniteNumber(snapshot.revision, 0),
    sessions: Array.isArray(snapshot.sessions) ? snapshot.sessions : [],
    presence: Array.isArray(snapshot.presence) ? snapshot.presence : [],
    jobs: Array.isArray(snapshot.jobs) ? snapshot.jobs : [],
    messages_tail: Array.isArray(snapshot.messages_tail) ? snapshot.messages_tail : [],
    notifications: Array.isArray(snapshot.notifications) ? snapshot.notifications : [],
    operator_commands: Array.isArray(snapshot.operator_commands) ? snapshot.operator_commands : [],
    artifacts: Array.isArray(snapshot.artifacts) ? snapshot.artifacts : [],
    metrics: asRecord(snapshot.metrics),
  };
}

function createRegistry(
  snapshot: NormalizedRuntimeGatewaySnapshot,
  presenceBySession: Map<string | undefined, RuntimePresenceRow>,
  jobsBySession: Map<string, RuntimeJobRow[]>,
  latestOperatorCommandByTarget: Map<string, RuntimeOperatorCommandRow>,
): WorkerSessionRegistry {
  return {
    schema_version: snapshot.schema_version,
    updated_at: snapshot.sent_at,
    updated_by: 'agent-runtime-gateway',
    active_sessions: snapshot.sessions
      .map((session) => createRegistrySession({
        job: selectCurrentJob(session, jobsBySession.get(session.session_id ?? '') ?? []),
        latestOperatorCommand: latestOperatorCommandByTarget.get(session.session_id ?? ''),
        presence: presenceBySession.get(session.session_id),
        session,
        updatedAt: snapshot.sent_at,
      }))
      .filter((session) => session.status !== 'closed'),
    autonomous_grants: [],
  };
}

function createRegistrySession(options: {
  session: RuntimeSessionRow;
  presence?: RuntimePresenceRow;
  job?: RuntimeJobRow;
  latestOperatorCommand?: RuntimeOperatorCommandRow;
  updatedAt: string;
}): RegistrySession {
  const scope = asRecord(options.session.scope);
  const metadata = asRecord(options.session.metadata);
  const jobCommand = asRecord(options.job?.command);
  const jobResult = asRecord(options.job?.result);
  const jobError = asRecord(options.job?.error);
  const rawRole = stringValue(options.session.role, options.session.kind ?? 'worker');
  const assignedBy = optionalString(options.session.assigned_by_session_id);
  const executionBackend = optionalString(options.job?.backend)
    ?? optionalString(metadata.execution_backend)
    ?? optionalString(asRecord(metadata.bridge).execution_backend)
    ?? optionalString(scope.execution_backend);
  const executionHandle = optionalString(options.job?.execution_handle)
    ?? optionalString(metadata.execution_handle)
    ?? optionalString(asRecord(metadata.bridge).execution_handle)
    ?? optionalString(scope.execution_handle);
  const jobPayload = withOptionalObjectFields({
    ...jobCommand,
    result: optionalRecord(jobResult),
    error: optionalRecord(jobError),
    model: optionalString(options.job?.model),
    tier: optionalString(options.job?.tier),
    reasoning_effort: optionalString(options.job?.reasoning_effort),
    context_budget: optionalNumberOrString(options.job?.context_budget),
    context_budget_tokens: optionalNumberOrString(options.job?.context_budget_tokens),
    context_window: optionalNumberOrString(options.job?.context_window),
    context_tokens: optionalNumberOrString(options.job?.context_tokens),
    backend: executionBackend,
    execution_handle: executionHandle,
    status: optionalString(options.job?.status),
    lease_status: optionalString(options.job?.lease_status),
    assignee_session_id: optionalString(options.job?.assignee_session_id),
    current_actor_session_id: optionalString(options.job?.current_actor_session_id),
  });
  const latestOperatorCommand = withOptionalObjectFields({
    operator_command_id: optionalString(options.latestOperatorCommand?.operator_command_id),
    command_type: optionalString(options.latestOperatorCommand?.command_type),
    status: optionalString(options.latestOperatorCommand?.status),
    actor_session_id: optionalString(options.latestOperatorCommand?.actor_session_id),
    target_session_id: optionalString(options.latestOperatorCommand?.target_session_id),
    request: optionalRecord(options.latestOperatorCommand?.request),
    result: optionalRecord(options.latestOperatorCommand?.result),
    error: optionalRecord(options.latestOperatorCommand?.error),
    updated_at: optionalString(options.latestOperatorCommand?.updated_at),
  });
  const writeAllowed = optionalBoolean(scope.write_allowed)
    ?? optionalBoolean(jobCommand.write_allowed)
    ?? false;
  const groupId = optionalString(options.session.group_id)
    ?? optionalString(metadata.group_id)
    ?? optionalString(scope.group_id)
    ?? optionalString(jobCommand.group_id);
  const groupRole = optionalString(options.session.group_role)
    ?? optionalString(metadata.group_role)
    ?? optionalString(scope.group_role)
    ?? optionalString(jobCommand.group_role);
  const groupName = optionalString(options.session.group_name)
    ?? optionalString(metadata.group_name)
    ?? optionalString(scope.group_name)
    ?? optionalString(jobCommand.group_name);
  const groupMetadata = withOptionalObjectFields({
    ...asRecord(options.session.group_metadata),
    ...asRecord(metadata.group_metadata),
    ...asRecord(scope.group_metadata),
    ...asRecord(jobCommand.group_metadata),
    group_id: groupId,
    group_role: groupRole,
    group_name: groupName,
    cross_group: typeof scope.cross_group === 'boolean'
      ? scope.cross_group
      : typeof metadata.cross_group === 'boolean'
        ? metadata.cross_group
        : undefined,
  });

  return {
    session_id: stringValue(options.session.session_id, 'unknown-session'),
    worker_kind: stringValue(options.session.kind, 'worker'),
    role: humanizeRole(rawRole),
    mission: stringValue(options.session.mission, options.session.title ?? 'Runtime worker session'),
    cwd: optionalString(scope.cwd) ?? undefined,
    worktree: optionalString(scope.worktree),
    allowed_paths: stringArray(scope.allowed_paths),
    forbidden_paths: stringArray(scope.forbidden_paths),
    tools_allowed: stringArray(scope.tools_allowed),
    network_allowed: optionalBoolean(scope.network_allowed),
    write_allowed: writeAllowed,
    expected_output: optionalString(scope.expected_output) ?? undefined,
    stop_condition: optionalString(scope.stop_condition) ?? undefined,
    started_at: optionalString(options.session.started_at ?? options.session.created_at) ?? undefined,
    updated_at: stringValue(options.session.updated_at, options.updatedAt),
    status: normalizeStatus(options.session.lifecycle_status),
    resolution: normalizeResolution(options.session.resolution),
    result_path: optionalString(scope.result_path),
    messages_path: optionalString(scope.messages_path),
    assigned_by: assignedBy ?? undefined,
    scope,
    handoff_required: optionalBoolean(scope.handoff_required) ?? false,
    metadata: {
      ...metadata,
      raw_role_ref: rawRole,
      current_job_id: options.session.current_job_id ?? null,
      latest_operator_command: latestOperatorCommand,
      runtime_scope: scope,
      group: Object.keys(groupMetadata).length > 0 ? groupMetadata : null,
    },
    assignee_session_id: options.job?.assignee_session_id ?? null,
    current_actor_session_id: options.job?.current_actor_session_id ?? null,
    execution_backend: executionBackend,
    execution_handle: executionHandle,
    lease_status: normalizeLeaseStatus(options.job?.lease_status ?? metadata.lease_status ?? scope.lease_status),
    allowed_actions: [
      ...stringArray(scope.allowed_actions),
      ...stringArray(jobCommand.allowed_actions),
    ],
    handoff_target: optionalString(scope.handoff_target) ?? optionalString(jobCommand.handoff_target),
    job_status: optionalString(options.job?.status) ?? null,
    job_payload: Object.keys(jobPayload).length > 0 ? jobPayload : null,
    bridge_state: optionalString(scope.bridge_state),
    job_id: options.job?.job_id ?? null,
    presence_state: normalizePresenceState(options.presence?.state),
    current_activity: optionalString(options.presence?.activity),
    heartbeat_at: options.presence?.heartbeat_at ?? null,
    lease_expires_at: options.presence?.lease_expires_at ?? options.job?.lease_expires_at ?? null,
    group_id: groupId,
    group_role: groupRole,
    group_name: groupName,
    group_metadata: Object.keys(groupMetadata).length > 0 ? groupMetadata : null,
  };
}

function createMonitorMessage(
  message: RuntimeMessageRow,
  operatorCommandsById: Map<string, RuntimeOperatorCommandRow>,
): MonitorMessage {
  const channel = stringValue(message.channel, 'system');
  const summary = stringValue(message.summary, '');
  const payload = asRecord(message.payload);
  const sourceSessionId = resolveSourceSessionId({
    payload,
    sourceSessionId: optionalString(message.source_session_id),
  }) ?? 'unknown-session';
  const targetSessionId = resolveTargetSessionId({
    payload,
    targetSessionId: optionalString(message.target_session_id),
  });
  const messageGroupId = optionalString(message.group_id)
    ?? optionalString(payload.group_id);
  const payloadMessageKind = optionalString(payload.message_kind);
  const interactionType = optionalString(message.message_kind)
    ?? payloadMessageKind
    ?? optionalString(payload.notification_type)
    ?? optionalString(message.channel);
  const payloadOperatorCommandId = optionalString(payload.operator_command_id);
  const operatorCommand = payloadOperatorCommandId
    ? operatorCommandsById.get(payloadOperatorCommandId)
    : undefined;
  const operatorCommandMetadata = withOptionalObjectFields({
    operator_command_id: optionalString(operatorCommand?.operator_command_id) ?? payloadOperatorCommandId,
    command_type: optionalString(operatorCommand?.command_type) ?? optionalString(payload.operator_command_type),
    status: optionalString(operatorCommand?.status) ?? optionalString(payload.operator_command_status),
    actor_session_id: optionalString(operatorCommand?.actor_session_id),
    target_session_id: optionalString(operatorCommand?.target_session_id) ?? targetSessionId,
    request: optionalRecord(operatorCommand?.request),
    result: optionalRecord(operatorCommand?.result),
    error: optionalRecord(operatorCommand?.error),
  });
  const mergedPayload = withOptionalObjectFields({
    ...payload,
    operator_command: Object.keys(operatorCommandMetadata).length > 0 ? operatorCommandMetadata : null,
    target_role: optionalString(message.target_role),
    priority: optionalString(message.priority),
    requires_ack: typeof message.requires_ack === 'boolean'
      ? message.requires_ack
      : Number(message.requires_ack) === 1,
    correlation_id: optionalString(message.correlation_id),
    group_id: messageGroupId,
    message_kind: interactionType,
  });
  const operatorCommandId = optionalString(operatorCommandMetadata.operator_command_id);
  const operatorCommandType = optionalString(operatorCommandMetadata.command_type);
  const operatorCommandStatus = optionalString(operatorCommandMetadata.status);

  return {
    id: stringValue(message.message_id, `${sourceSessionId}-${message.created_at ?? Date.now()}`),
    session_id: sourceSessionId,
    target_session_id: targetSessionId,
    timestamp: stringOrNow(message.created_at),
    kind: inferMessageKind(channel),
    source: sourceSessionId,
    event_type: inferEventType(channel, payload),
    visibility: normalizeVisibility(message.visibility),
    title: inferMessageTitle(channel, summary),
    body: summary,
    peer_link: targetSessionId
      ? {
          source_session_id: sourceSessionId,
          target_session_id: targetSessionId,
          label: inferPeerLinkLabel(channel, summary),
        }
      : null,
    message_state: normalizeMessageState(message.state),
    notification_type: optionalString(payload.notification_type),
    correlation_id: optionalString(message.correlation_id) ?? optionalString(payload.correlation_id),
    interaction_type: interactionType,
    group_id: messageGroupId,
    notification_status: null,
    notification_resolved_at: null,
    operator_command_id: operatorCommandId,
    operator_command_type: operatorCommandType,
    operator_command_status: operatorCommandStatus,
    payload: Object.keys(mergedPayload).length > 0 ? mergedPayload : null,
    flow_visible_until: message.expires_at ?? null,
  };
}

function createMonitorNotificationMessage(
  notification: RuntimeNotificationRow,
): MonitorMessage {
  const payload = asRecord(notification.payload);
  const sourceSessionId = resolveSourceSessionId({
    payload,
    sourceSessionId: optionalString(notification.source_session_id),
  }) ?? 'dialog-assistant';
  const targetSessionId = resolveTargetSessionId({
    payload,
    targetSessionId: optionalString(notification.target_session_id),
  });
  const notificationType = optionalString(notification.notification_type)
    ?? optionalString(payload.notification_type);
  const summary = stringValue(
    notification.summary,
    notificationType ? `${notificationType} notification` : 'runtime notification',
  );
  const groupId = optionalString(notification.group_id)
    ?? optionalString(payload.group_id);
  const notificationStatus = optionalString(notification.status);
  const notificationResolvedAt = optionalString(notification.resolved_at);
  const targetRole = optionalString(notification.target_role)
    ?? optionalString(payload.target_role);
  const correlationId = optionalString(notification.correlation_id)
    ?? optionalString(payload.correlation_id);
  const interactionType = optionalString(notification.message_kind)
    ?? optionalString(payload.message_kind)
    ?? notificationType
    ?? 'notification';
  const normalizedMessageState = normalizeNotificationState({
    acknowledgedAt: optionalString(notification.acknowledged_at),
    resolvedAt: notificationResolvedAt,
    status: notificationStatus,
  });
  const mergedPayload = withOptionalObjectFields({
    ...payload,
    notification_type: notificationType,
    target_role: targetRole,
    target_session_id: targetSessionId,
    source_session_id: sourceSessionId,
    correlation_id: correlationId,
    group_id: groupId,
    message_kind: interactionType,
    notification_status: notificationStatus,
  });

  return {
    id: stringValue(
      notification.notification_id,
      `notification-${sourceSessionId}-${targetSessionId ?? 'unresolved'}-${notification.created_at ?? Date.now()}`,
    ),
    session_id: sourceSessionId,
    target_session_id: targetSessionId,
    timestamp: stringOrNow(notification.created_at),
    kind: 'event',
    source: sourceSessionId,
    event_type: 'status-update',
    visibility: 'user-visible',
    title: notificationType ? `${notificationType} notification` : 'runtime notification',
    body: summary,
    peer_link: targetSessionId
      ? {
          source_session_id: sourceSessionId,
          target_session_id: targetSessionId,
          label: inferPeerLinkLabel('notification', summary),
        }
      : null,
    message_state: normalizedMessageState,
    notification_type: notificationType,
    correlation_id: correlationId,
    interaction_type: interactionType,
    group_id: groupId,
    notification_status: notificationStatus,
    notification_resolved_at: notificationResolvedAt,
    operator_command_id: null,
    operator_command_type: null,
    operator_command_status: null,
    payload: Object.keys(mergedPayload).length > 0 ? mergedPayload : null,
    flow_visible_until: notificationResolvedAt,
  };
}

function groupJobsBySession(jobs: RuntimeJobRow[]): Map<string, RuntimeJobRow[]> {
  return jobs.reduce((groupedJobs, job) => {
    const sessionId = job.session_id;
    if (typeof sessionId !== 'string' || sessionId.trim() === '') {
      return groupedJobs;
    }

    groupedJobs.set(sessionId, [
      ...(groupedJobs.get(sessionId) ?? []),
      job,
    ].sort((left, right) => stringValue(right.updated_at).localeCompare(stringValue(left.updated_at))));

    return groupedJobs;
  }, new Map<string, RuntimeJobRow[]>());
}

function selectCurrentJob(session: RuntimeSessionRow, jobs: RuntimeJobRow[]): RuntimeJobRow | undefined {
  return jobs.find((job) => job.job_id === session.current_job_id) ?? jobs[0];
}

function indexOperatorCommandsById(
  commands: RuntimeOperatorCommandRow[],
): Map<string, RuntimeOperatorCommandRow> {
  return commands.reduce((index, command) => {
    const commandId = optionalString(command.operator_command_id);
    if (!commandId) {
      return index;
    }
    index.set(commandId, command);
    return index;
  }, new Map<string, RuntimeOperatorCommandRow>());
}

function indexLatestOperatorCommandByTarget(
  commands: RuntimeOperatorCommandRow[],
): Map<string, RuntimeOperatorCommandRow> {
  return commands.reduce((index, command) => {
    const targetSessionId = optionalString(command.target_session_id);
    if (!targetSessionId) {
      return index;
    }

    const existing = index.get(targetSessionId);
    if (!existing) {
      index.set(targetSessionId, command);
      return index;
    }

    const currentUpdatedAt = stringValue(command.updated_at);
    const existingUpdatedAt = stringValue(existing.updated_at);
    if (currentUpdatedAt.localeCompare(existingUpdatedAt) >= 0) {
      index.set(targetSessionId, command);
    }

    return index;
  }, new Map<string, RuntimeOperatorCommandRow>());
}

function createSnapshotIssues(
  snapshot: NormalizedRuntimeGatewaySnapshot,
): MonitorValidationIssue[] {
  if (snapshot.sessions.length > 0) {
    return [];
  }

  return [{
    id: 'runtime-gateway-empty-sessions',
    source: 'registry',
    severity: 'warning',
    message: 'Runtime gateway snapshot contains no active sessions.',
  }];
}

function withOptionalObjectFields(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined),
  );
}

function resolveSourceSessionId(options: {
  sourceSessionId: string | null;
  payload: Record<string, unknown>;
}): string | null {
  if (options.sourceSessionId) {
    return options.sourceSessionId;
  }

  return optionalString(options.payload.source_session_id);
}

function resolveTargetSessionId(options: {
  targetSessionId: string | null;
  payload: Record<string, unknown>;
}): string | null {
  if (options.targetSessionId) {
    return options.targetSessionId;
  }

  return optionalString(options.payload.target_session_id);
}

function normalizeNotificationState(options: {
  status: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
}): MonitorMessage['message_state'] {
  if (options.resolvedAt) {
    return 'answered';
  }

  if (options.acknowledgedAt) {
    return 'acknowledged';
  }

  const status = options.status?.toLowerCase();
  if (!status) {
    return 'queued';
  }
  if (status === 'queued' || status === 'new' || status === 'unread' || status === 'pending') {
    return 'queued';
  }
  if (status === 'delivered' || status === 'sent' || status === 'read') {
    return 'delivered';
  }
  if (status === 'acknowledged') {
    return 'acknowledged';
  }
  if (status === 'resolved' || status === 'dismissed' || status === 'closed') {
    return 'answered';
  }
  if (status === 'expired') {
    return 'expired';
  }
  if (status === 'failed') {
    return 'failed';
  }

  return null;
}

function optionalNumberOrString(value: unknown): number | string | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return optionalString(value);
}
