/**
 * @file .ai/tools/agent-runtime/src/runtime-schema/agent-schema.mjs
 * @version 0.3.0 - 2026-05-10 00:00
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description SQLite DDL for the normalized agent runtime tables and
 * monotonic runtime event log used by the push-first gateway architecture.
 *
 * Changes in version 0.3.0:
 * - Added first-class worker group, membership, edge, and acceptance evidence
 *   tables for Dialog Assistant-owned group closure.
 */
export const runtimeSchemaUserVersion = 4;

export const runtimeTableStatements = [
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS runtime_events (
    revision INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    aggregate_type TEXT NOT NULL,
    aggregate_id TEXT NOT NULL,
    session_id TEXT,
    actor_session_id TEXT,
    visibility TEXT NOT NULL DEFAULT 'internal-summary' CHECK (visibility IN ('user-visible', 'internal-summary', 'redacted')),
    summary TEXT NOT NULL DEFAULT '',
    payload_json TEXT NOT NULL DEFAULT '{}',
    idempotency_key TEXT UNIQUE,
    created_at TEXT NOT NULL
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_sessions (
    session_id TEXT PRIMARY KEY,
    parent_session_id TEXT,
    kind TEXT NOT NULL,
    role TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    mission TEXT NOT NULL DEFAULT '',
    lifecycle_status TEXT NOT NULL CHECK (lifecycle_status IN ('planned', 'starting', 'running', 'waiting', 'blocked', 'result_ready', 'needs_review', 'closing', 'closed', 'failed', 'cancelled')),
    resolution TEXT CHECK (resolution IS NULL OR resolution IN ('accepted', 'reassigned', 'continued', 'blocked', 'cancelled', 'failed', 'completed', 'user_deferred')),
    created_by_session_id TEXT,
    assigned_by_session_id TEXT,
    current_job_id TEXT,
    scope_json TEXT NOT NULL DEFAULT '{}',
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    started_at TEXT,
    updated_at TEXT NOT NULL,
    closed_at TEXT,
    last_revision INTEGER NOT NULL,
    FOREIGN KEY (parent_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (created_by_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (assigned_by_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_session_profiles (
    session_id TEXT PRIMARY KEY,
    role_ref TEXT,
    workflow_ref TEXT,
    skills_json TEXT NOT NULL DEFAULT '[]',
    tools_json TEXT NOT NULL DEFAULT '[]',
    rules_json TEXT NOT NULL DEFAULT '[]',
    prompt_ref TEXT,
    runtime_policy_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_revision INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_worker_groups (
    group_id TEXT PRIMARY KEY,
    task_id TEXT,
    job_id TEXT,
    owner_session_id TEXT,
    returns_to_session_id TEXT NOT NULL,
    group_closer_session_id TEXT,
    lifecycle_status TEXT NOT NULL CHECK (lifecycle_status IN ('planned', 'running', 'needs_review', 'blocked', 'closing', 'closed', 'failed', 'cancelled')),
    acceptance_status TEXT NOT NULL DEFAULT 'pending' CHECK (acceptance_status IN ('pending', 'review_ready', 'accepted', 'rejected', 'blocked')),
    acceptance_evidence_json TEXT NOT NULL DEFAULT '{}',
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    closed_at TEXT,
    last_revision INTEGER NOT NULL,
    FOREIGN KEY (job_id) REFERENCES agent_jobs(job_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (owner_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (returns_to_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (group_closer_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_worker_group_members (
    group_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    member_status TEXT NOT NULL CHECK (member_status IN ('planned', 'active', 'result_ready', 'needs_review', 'blocked', 'closed', 'removed')),
    write_allowed INTEGER NOT NULL DEFAULT 0 CHECK (write_allowed IN (0, 1)),
    allowed_paths_json TEXT NOT NULL DEFAULT '[]',
    forbidden_paths_json TEXT NOT NULL DEFAULT '[]',
    metadata_json TEXT NOT NULL DEFAULT '{}',
    joined_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_revision INTEGER NOT NULL,
    PRIMARY KEY (group_id, session_id),
    FOREIGN KEY (group_id) REFERENCES agent_worker_groups(group_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_worker_group_edges (
    edge_id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    source_session_id TEXT NOT NULL,
    target_session_id TEXT NOT NULL,
    edge_type TEXT NOT NULL CHECK (edge_type IN ('peer', 'depends_on', 'handoff', 'review', 'result_return', 'closure')),
    state TEXT NOT NULL CHECK (state IN ('active', 'satisfied', 'blocked', 'closed')),
    summary TEXT NOT NULL DEFAULT '',
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_revision INTEGER NOT NULL,
    FOREIGN KEY (group_id) REFERENCES agent_worker_groups(group_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (source_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (target_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_worker_group_acceptance_evidence (
    evidence_id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    actor_session_id TEXT,
    session_id TEXT,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('result_ready', 'review', 'audit', 'acceptance', 'revision_request', 'blocker')),
    evidence_status TEXT NOT NULL CHECK (evidence_status IN ('recorded', 'accepted', 'rejected', 'blocked')),
    visibility TEXT NOT NULL DEFAULT 'internal-summary' CHECK (visibility IN ('user-visible', 'internal-summary', 'redacted')),
    summary TEXT NOT NULL,
    payload_json TEXT NOT NULL DEFAULT '{}',
    related_artifacts_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    last_revision INTEGER NOT NULL,
    FOREIGN KEY (group_id) REFERENCES agent_worker_groups(group_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (actor_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_presence (
    session_id TEXT PRIMARY KEY,
    state TEXT NOT NULL CHECK (state IN ('online', 'working', 'idle', 'waiting', 'stale', 'offline')),
    activity TEXT NOT NULL DEFAULT '',
    process_id TEXT,
    pid INTEGER,
    heartbeat_at TEXT,
    lease_expires_at TEXT,
    updated_at TEXT NOT NULL,
    last_revision INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_jobs (
    job_id TEXT PRIMARY KEY,
    session_id TEXT,
    parent_job_id TEXT,
    owner_session_id TEXT,
    assignee_session_id TEXT,
    current_actor_session_id TEXT,
    backend TEXT,
    execution_handle TEXT,
    status TEXT NOT NULL CHECK (status IN ('queued', 'leased', 'running', 'waiting', 'completed', 'failed', 'cancelled', 'blocked')),
    lease_status TEXT NOT NULL CHECK (lease_status IN ('unassigned', 'waiting', 'claimed', 'released', 'transferred', 'blocked', 'completed', 'expired')),
    lease_token TEXT,
    lease_expires_at TEXT,
    command_json TEXT NOT NULL DEFAULT '{}',
    result_json TEXT NOT NULL DEFAULT '{}',
    error_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    started_at TEXT,
    finished_at TEXT,
    last_revision INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (parent_job_id) REFERENCES agent_jobs(job_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (owner_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (assignee_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (current_actor_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_messages (
    message_id TEXT PRIMARY KEY,
    source_session_id TEXT NOT NULL,
    target_session_id TEXT,
    target_role TEXT,
    channel TEXT NOT NULL CHECK (channel IN ('peer', 'operator', 'system', 'result', 'handoff')),
    state TEXT NOT NULL CHECK (state IN ('queued', 'delivered', 'read', 'acknowledged', 'answered', 'expired', 'failed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('info', 'normal', 'high', 'urgent')),
    visibility TEXT NOT NULL CHECK (visibility IN ('user-visible', 'internal-summary', 'redacted')),
    summary TEXT NOT NULL,
    payload_json TEXT NOT NULL DEFAULT '{}',
    correlation_id TEXT,
    requires_ack INTEGER NOT NULL DEFAULT 0 CHECK (requires_ack IN (0, 1)),
    expires_at TEXT,
    created_at TEXT NOT NULL,
    delivered_at TEXT,
    acknowledged_at TEXT,
    last_revision INTEGER NOT NULL,
    FOREIGN KEY (source_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (target_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_notifications (
    notification_id TEXT PRIMARY KEY,
    source_session_id TEXT,
    target_session_id TEXT,
    target_role TEXT,
    notification_type TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('info', 'normal', 'high', 'urgent')),
    status TEXT NOT NULL CHECK (status IN ('unread', 'acknowledged', 'resolved', 'dismissed')),
    summary TEXT NOT NULL,
    payload_json TEXT NOT NULL DEFAULT '{}',
    correlation_id TEXT,
    created_at TEXT NOT NULL,
    acknowledged_at TEXT,
    resolved_at TEXT,
    last_revision INTEGER NOT NULL,
    FOREIGN KEY (source_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (target_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_artifacts (
    artifact_id TEXT PRIMARY KEY,
    session_id TEXT,
    job_id TEXT,
    artifact_type TEXT NOT NULL,
    path TEXT NOT NULL,
    media_type TEXT,
    checksum TEXT,
    visibility TEXT NOT NULL CHECK (visibility IN ('user-visible', 'internal-summary', 'redacted')),
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    last_revision INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (job_id) REFERENCES agent_jobs(job_id) ON UPDATE CASCADE ON DELETE SET NULL
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_processes (
    process_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    job_id TEXT,
    pid INTEGER,
    backend TEXT NOT NULL,
    command_json TEXT NOT NULL DEFAULT '{}',
    cwd TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('planned', 'starting', 'running', 'stopping', 'exited', 'failed', 'cancelled')),
    started_at TEXT,
    exited_at TEXT,
    exit_code INTEGER,
    signal TEXT,
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_revision INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES agent_jobs(job_id) ON UPDATE CASCADE ON DELETE SET NULL
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_stream_events (
    stream_event_id TEXT PRIMARY KEY,
    process_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    job_id TEXT,
    stream TEXT NOT NULL CHECK (stream IN ('stdout', 'stderr', 'system', 'structured')),
    sequence INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'internal-summary' CHECK (visibility IN ('user-visible', 'internal-summary', 'redacted')),
    content_text TEXT NOT NULL DEFAULT '',
    payload_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    last_revision INTEGER NOT NULL,
    UNIQUE (process_id, sequence),
    FOREIGN KEY (process_id) REFERENCES agent_processes(process_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES agent_jobs(job_id) ON UPDATE CASCADE ON DELETE SET NULL
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS agent_operator_commands (
    operator_command_id TEXT PRIMARY KEY,
    actor_session_id TEXT NOT NULL,
    target_session_id TEXT,
    command_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'accepted', 'running', 'completed', 'rejected', 'failed', 'cancelled')),
    request_json TEXT NOT NULL DEFAULT '{}',
    result_json TEXT NOT NULL DEFAULT '{}',
    error_json TEXT NOT NULL DEFAULT '{}',
    idempotency_key TEXT UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    processed_at TEXT,
    last_revision INTEGER NOT NULL,
    FOREIGN KEY (actor_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (target_session_id) REFERENCES agent_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL
)`,
];

export const runtimeIndexStatements = [
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_runtime_events_revision ON runtime_events(revision)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_runtime_events_session_revision ON runtime_events(session_id, revision)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_runtime_events_aggregate_revision ON runtime_events(aggregate_type, aggregate_id, revision)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(lifecycle_status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_sessions_parent ON agent_sessions(parent_session_id)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_sessions_last_revision ON agent_sessions(last_revision)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_worker_groups_status ON agent_worker_groups(lifecycle_status, acceptance_status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_worker_groups_returns_to ON agent_worker_groups(returns_to_session_id, lifecycle_status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_worker_group_members_session ON agent_worker_group_members(session_id, member_status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_worker_group_edges_group_state ON agent_worker_group_edges(group_id, state)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_worker_group_acceptance_group_created ON agent_worker_group_acceptance_evidence(group_id, created_at)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_presence_state ON agent_presence(state)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_jobs_session_status ON agent_jobs(session_id, status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_jobs_assignee_lease ON agent_jobs(assignee_session_id, lease_status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_messages_target_state ON agent_messages(target_session_id, state)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_messages_source_created ON agent_messages(source_session_id, created_at)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_notifications_target_status ON agent_notifications(target_role, status, priority)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_artifacts_session_created ON agent_artifacts(session_id, created_at)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_processes_session_status ON agent_processes(session_id, status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_processes_job_status ON agent_processes(job_id, status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_processes_last_revision ON agent_processes(last_revision)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_stream_events_process_sequence ON agent_stream_events(process_id, sequence)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_stream_events_session_revision ON agent_stream_events(session_id, last_revision)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_stream_events_job_revision ON agent_stream_events(job_id, last_revision)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_operator_commands_actor_status ON agent_operator_commands(actor_session_id, status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_operator_commands_target_status ON agent_operator_commands(target_session_id, status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_agent_operator_commands_last_revision ON agent_operator_commands(last_revision)",
];
