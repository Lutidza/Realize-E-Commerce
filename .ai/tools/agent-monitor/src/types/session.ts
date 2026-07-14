/**
 * @file .ai/tools/agent-monitor/src/types/session.ts
 * @version 0.4.0 - 2026-05-07 03:10
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Typed read model for worker-session registry data used by the
 * local monitor. The shapes mirror the runtime gateway fields needed for
 * read-only UI and keep adapter mapping independent from React components.
 *
 * Changes in version 0.4.0:
 * - Removed legacy source modes from the active data source contract.
 */
import type { MaintenanceHistory } from '@/types/maintenance';
export type WorkerStatus =
  | 'planned'
  | 'launched'
  | 'running'
  | 'result-ready'
  | 'needs-review'
  | 'blocked'
  | 'closed';

export type WorkerResolution =
  | 'accepted'
  | 'reassigned'
  | 'continued'
  | 'blocked-with-reason'
  | 'closed'
  | 'user-approved-deferral'
  | null;

export type WorkerPresenceState =
  | 'working'
  | 'waiting'
  | 'idle'
  | 'stale'
  | 'offline';

export type WorkerJobLeaseStatus =
  | 'unassigned'
  | 'claimed'
  | 'waiting'
  | 'released'
  | 'transferred'
  | 'blocked'
  | 'completed';

export type WorkerMessageState =
  | 'queued'
  | 'delivered'
  | 'acknowledged'
  | 'answered'
  | 'expired'
  | 'failed';

export interface WorkerSessionRegistry {
  schema_version: string;
  updated_at: string;
  updated_by: string;
  active_sessions: RegistrySession[];
  autonomous_grants: unknown[];
}

export interface RegistrySession {
  session_id: string;
  worker_kind?: string;
  role: string;
  mission: string;
  cwd?: string;
  worktree?: string | null;
  allowed_paths: string[];
  forbidden_paths?: string[];
  tools_allowed?: string[];
  network_allowed?: boolean;
  write_allowed?: boolean;
  expected_output?: string;
  stop_condition?: string;
  started_at?: string;
  updated_at: string;
  status: WorkerStatus;
  resolution?: WorkerResolution;
  resolution_reason?: string | null;
  result_path?: string | null;
  messages_path?: string | null;
  assigned_by?: string;
  scope?: Record<string, unknown> | null;
  handoff_required?: boolean;
  metadata?: Record<string, unknown> | null;
  assignee_session_id?: string | null;
  current_actor_session_id?: string | null;
  execution_backend?: string | null;
  execution_handle?: string | null;
  lease_status?: WorkerJobLeaseStatus | null;
  allowed_actions?: string[];
  handoff_target?: string | null;
  job_status?: string | null;
  job_payload?: Record<string, unknown> | null;
  bridge_state?: string | null;
  job_id?: string | null;
  continuation_contract?: Record<string, unknown> | null;
  reassignment_contract?: Record<string, unknown> | null;
  deferral_contract?: Record<string, unknown> | null;
  blocker_contract?: Record<string, unknown> | null;
  presence_state?: WorkerPresenceState | null;
  current_activity?: string | null;
  heartbeat_at?: string | null;
  lease_expires_at?: string | null;
  group_id?: string | null;
  group_role?: string | null;
  group_name?: string | null;
  group_metadata?: Record<string, unknown> | null;
}

export interface MonitorSession {
  session_id: string;
  role: string;
  mission: string;
  status: WorkerStatus;
  result_path: string | null;
  messages_path: string | null;
  allowed_paths: string[];
  updated_at: string;
  resolution: WorkerResolution;
  worker_kind: string;
  assigned_by: string | null;
  scope: Record<string, unknown> | null;
  handoff_required: boolean;
  metadata: Record<string, unknown> | null;
  assignee_session_id: string | null;
  current_actor_session_id: string | null;
  execution_backend: string | null;
  execution_handle: string | null;
  lease_status: WorkerJobLeaseStatus | null;
  allowed_actions: string[];
  handoff_target: string | null;
  job_status: string | null;
  job_payload: Record<string, unknown> | null;
  bridge_state: string | null;
  job_id: string | null;
  execution_model: string | null;
  execution_tier: string | null;
  context_budget: string | null;
  access_mode: 'write' | 'read-only';
  allowed_path_count: number;
  write_allowed: boolean;
  runtime_active: boolean;
  quiet: boolean;
  message_count: number;
  recent_message_at: string | null;
  presence_state: WorkerPresenceState | null;
  current_activity: string | null;
  heartbeat_at: string | null;
  lease_expires_at: string | null;
  group_id: string | null;
  group_role: string | null;
  group_name: string | null;
  group_metadata: Record<string, unknown> | null;
}

export interface MonitorHandoff {
  id: string;
  source: string;
  target: string;
  label: MonitorEdgeLabel;
  edge_kind: 'assignment' | 'communication';
  flow_active: boolean;
  source_message_id: string | null;
  source_message_state: WorkerMessageState | null;
  source_event_type: WorkerMessageEventType | null;
  source_notification_type: string | null;
  source_interaction_type: string | null;
  correlation_id: string | null;
  source_timestamp: string | null;
  unresolved: boolean;
  flow_reason: 'queued' | 'delivered' | 'unresolved' | 'recent' | null;
}

export type MonitorEdgeLabel =
  | 'assigned'
  | 'handoff required'
  | 'review'
  | 'verify'
  | 'handoff'
  | 'message';

export interface MonitorEvent {
  id: string;
  session_id: string;
  timestamp: string;
  label: string;
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

export interface MonitorMessage {
  id: string;
  session_id: string;
  target_session_id: string | null;
  timestamp: string;
  kind: 'summary' | 'event' | 'handoff' | 'status';
  source: string;
  event_type: WorkerMessageEventType;
  visibility?: WorkerMessageVisibility;
  title: string;
  body: string;
  peer_link: MonitorMessagePeerLink | null;
  message_state: WorkerMessageState | null;
  notification_type: string | null;
  correlation_id: string | null;
  interaction_type: string | null;
  group_id: string | null;
  notification_status: string | null;
  notification_resolved_at: string | null;
  operator_command_id: string | null;
  operator_command_type: string | null;
  operator_command_status: string | null;
  payload: Record<string, unknown> | null;
  flow_visible_until: string | null;
}

export interface MonitorMessagePeerLink {
  source_session_id: string | null;
  target_session_id: string | null;
  label: Extract<MonitorEdgeLabel, 'review' | 'verify' | 'handoff' | 'message'>;
}

export interface MonitorDataset {
  sessions: MonitorSession[];
  handoffs: MonitorHandoff[];
  events: MonitorEvent[];
  messages: MonitorMessage[];
  maintenanceHistory: MaintenanceHistory;
  validationIssues: MonitorValidationIssue[];
  sourceLabel: string;
  sourceMode: MonitorDataSourceMode;
}

export type MonitorDataSourceMode =
  | 'runtime-readonly';

export interface MonitorValidationIssue {
  id: string;
  source: 'registry' | 'messages' | 'adapter';
  severity: 'warning' | 'error';
  message: string;
}

export type OperatorMetricTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export interface OperatorMetric {
  id: string;
  label: string;
  value: number;
  tone: OperatorMetricTone;
  description: string;
}

export type WorkerMessageEventType =
  | 'status-update'
  | 'worker-message'
  | 'review-comment'
  | 'handoff'
  | 'blocker'
  | 'decision'
  | 'tool-summary'
  | 'artifact-reference';

export type WorkerMessageVisibility =
  | 'user-visible'
  | 'internal-summary'
  | 'redacted';
