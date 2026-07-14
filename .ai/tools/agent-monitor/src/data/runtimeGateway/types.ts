/**
 * @file .ai/tools/agent-monitor/src/data/runtimeGateway/types.ts
 * @version 0.1.0 - 2026-05-07 01:30
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Narrow TypeScript row shapes for the local agent runtime
 * gateway snapshot consumed by the Agent Monitor read-only adapter.
 *
 * Changes in version 0.1.0:
 * - Added runtime gateway snapshot row contracts for UI mapping.
 */

export interface RuntimeGatewayAdapterOptions {
  baseUrl?: string;
  socketUrl?: string;
}

export interface RuntimeGatewayCommandResult {
  type?: string;
  schema_version?: string;
  sent_at?: string;
  command?: string;
  command_id?: string;
  before_revision?: number;
  after_revision?: number;
  lines?: string[];
  write?: boolean;
  operator_command_id?: string;
  deduplicated?: boolean;
  [key: string]: unknown;
}

export type RuntimeOperatorCommandType =
  | 'request_worker'
  | 'accept_result'
  | 'ping'
  | 'request_status'
  | 'send_message'
  | 'stop';

export interface RuntimeGatewayOperatorCommandRequest {
  'actor-session-id': string;
  'target-session-id': string;
  'command-type': RuntimeOperatorCommandType;
  'idempotency-key': string;
  summary?: string;
  'request-json'?: unknown;
}

export interface RuntimeGatewayCommandPayload {
  command: 'operator-command-dispatch';
  command_id?: string;
  options: RuntimeGatewayOperatorCommandRequest;
}

export interface RuntimeGatewaySnapshot {
  type: string;
  schema_version?: string;
  sent_at?: string;
  revision?: number;
  sessions?: RuntimeSessionRow[];
  presence?: RuntimePresenceRow[];
  jobs?: RuntimeJobRow[];
  messages_tail?: RuntimeMessageRow[];
  notifications?: RuntimeNotificationRow[];
  operator_commands?: RuntimeOperatorCommandRow[];
  artifacts?: RuntimeArtifactRow[];
  metrics?: Record<string, unknown>;
}

export interface RuntimeSessionRow {
  session_id?: string;
  parent_session_id?: string | null;
  group_id?: string | null;
  group_role?: string | null;
  group_name?: string | null;
  group_metadata?: Record<string, unknown> | null;
  kind?: string;
  role?: string;
  title?: string;
  mission?: string;
  lifecycle_status?: string;
  resolution?: string | null;
  created_by_session_id?: string | null;
  assigned_by_session_id?: string | null;
  current_job_id?: string | null;
  scope?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at?: string;
  started_at?: string | null;
  updated_at?: string;
  closed_at?: string | null;
}

export interface RuntimePresenceRow {
  session_id?: string;
  state?: string;
  activity?: string;
  heartbeat_at?: string | null;
  lease_expires_at?: string | null;
  updated_at?: string;
}

export interface RuntimeJobRow {
  job_id?: string;
  session_id?: string | null;
  owner_session_id?: string | null;
  assignee_session_id?: string | null;
  current_actor_session_id?: string | null;
  backend?: string | null;
  execution_handle?: string | null;
  model?: string | null;
  tier?: string | null;
  reasoning_effort?: string | null;
  context_budget?: number | string | null;
  context_budget_tokens?: number | string | null;
  context_window?: number | string | null;
  context_tokens?: number | string | null;
  status?: string;
  lease_status?: string;
  lease_expires_at?: string | null;
  command?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: Record<string, unknown>;
  started_at?: string | null;
  finished_at?: string | null;
  updated_at?: string;
}

export interface RuntimeMessageRow {
  message_id?: string;
  source_session_id?: string;
  target_session_id?: string | null;
  group_id?: string | null;
  message_kind?: string | null;
  target_role?: string | null;
  channel?: string;
  state?: string;
  priority?: string;
  visibility?: string;
  summary?: string;
  payload?: Record<string, unknown>;
  correlation_id?: string | null;
  requires_ack?: number | boolean;
  expires_at?: string | null;
  created_at?: string;
  delivered_at?: string | null;
  acknowledged_at?: string | null;
}

export interface RuntimeNotificationRow {
  notification_id?: string;
  source_session_id?: string | null;
  target_session_id?: string | null;
  group_id?: string | null;
  message_kind?: string | null;
  target_role?: string | null;
  notification_type?: string;
  priority?: string;
  status?: string;
  summary?: string;
  payload?: Record<string, unknown>;
  correlation_id?: string | null;
  created_at?: string;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
}

export interface RuntimeOperatorCommandRow {
  operator_command_id?: string;
  actor_session_id?: string;
  target_session_id?: string | null;
  command_type?: string;
  status?: string;
  request?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: Record<string, unknown>;
  idempotency_key?: string | null;
  created_at?: string;
  updated_at?: string;
  processed_at?: string | null;
}

export interface RuntimeArtifactRow {
  artifact_id?: string;
  session_id?: string | null;
  job_id?: string | null;
  artifact_type?: string;
  path?: string;
  media_type?: string | null;
  checksum?: string | null;
  visibility?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export type NormalizedRuntimeGatewaySnapshot = Required<RuntimeGatewaySnapshot>;
