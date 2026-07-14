/**
 * @file .ai/tools/agent-runtime/src/runtime-schema/legacy-schema.mjs
 * @version 0.2.0 - 2026-05-10 00:00
 * @docref DOC-SYSTEM-SPEC-032
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @description SQLite DDL for the transitional legacy worker_* compatibility
 * tables used until all live writers and monitor adapters consume agent_*.
 *
 * Changes in version 0.2.0:
 * - Added worker group compatibility tables for group lifecycle, membership,
 *   peer edges, and Dialog Assistant acceptance evidence.
 */
// language=SQLite
export const legacyWorkerSessionEventsStatement = `
CREATE TABLE IF NOT EXISTS worker_session_events (
    event_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    source TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('status-update', 'worker-message', 'review-comment', 'handoff', 'blocker', 'decision', 'tool-summary', 'artifact-reference')),
    visibility TEXT NOT NULL DEFAULT 'internal-summary' CHECK (visibility IN ('user-visible', 'internal-summary', 'redacted')),
    summary TEXT NOT NULL,
    payload_json TEXT NOT NULL DEFAULT '{}',
    related_artifacts_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE
)`;

export const legacyTableStatements = [
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS worker_sessions (
    session_id TEXT PRIMARY KEY,
    worker_kind TEXT NOT NULL DEFAULT 'external_worker',
    role TEXT NOT NULL,
    mission TEXT NOT NULL DEFAULT '',
    assigned_by TEXT,
    status TEXT NOT NULL CHECK (status IN ('planned', 'launched', 'running', 'result-ready', 'needs-review', 'blocked', 'closed')),
    resolution TEXT CHECK (resolution IS NULL OR resolution IN ('accepted', 'reassigned', 'continued', 'blocked-with-reason', 'closed', 'user-approved-deferral')),
    handoff_required INTEGER NOT NULL DEFAULT 0 CHECK (handoff_required IN (0, 1)),
    allowed_paths_json TEXT NOT NULL DEFAULT '[]',
    forbidden_paths_json TEXT NOT NULL DEFAULT '[]',
    metadata_json TEXT NOT NULL DEFAULT '{}',
    messages_path TEXT,
    result_path TEXT,
    history_path TEXT,
    started_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    closed_at TEXT
)`,
  legacyWorkerSessionEventsStatement,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS worker_groups (
    group_id TEXT PRIMARY KEY,
    task_id TEXT,
    job_id TEXT,
    owner_session_id TEXT,
    returns_to_session_id TEXT NOT NULL,
    group_closer_session_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('planned', 'running', 'needs-review', 'blocked', 'closing', 'closed', 'failed', 'cancelled')),
    acceptance_status TEXT NOT NULL DEFAULT 'pending' CHECK (acceptance_status IN ('pending', 'review-ready', 'accepted', 'rejected', 'blocked')),
    acceptance_evidence_json TEXT NOT NULL DEFAULT '{}',
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    closed_at TEXT,
    FOREIGN KEY (owner_session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (returns_to_session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (group_closer_session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS worker_group_members (
    group_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    member_status TEXT NOT NULL CHECK (member_status IN ('planned', 'active', 'result-ready', 'needs-review', 'blocked', 'closed', 'removed')),
    write_allowed INTEGER NOT NULL DEFAULT 0 CHECK (write_allowed IN (0, 1)),
    allowed_paths_json TEXT NOT NULL DEFAULT '[]',
    forbidden_paths_json TEXT NOT NULL DEFAULT '[]',
    metadata_json TEXT NOT NULL DEFAULT '{}',
    joined_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (group_id, session_id),
    FOREIGN KEY (group_id) REFERENCES worker_groups(group_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS worker_group_edges (
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
    FOREIGN KEY (group_id) REFERENCES worker_groups(group_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (source_session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (target_session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS worker_group_acceptance_evidence (
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
    FOREIGN KEY (group_id) REFERENCES worker_groups(group_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (actor_session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS worker_presence (
    session_id TEXT PRIMARY KEY,
    presence_state TEXT NOT NULL CHECK (presence_state IN ('working', 'waiting', 'idle', 'stale', 'offline')),
    current_activity TEXT NOT NULL DEFAULT '',
    heartbeat_at TEXT NOT NULL,
    lease_expires_at TEXT,
    payload_json TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS worker_messages (
    message_id TEXT PRIMARY KEY,
    source_session_id TEXT NOT NULL,
    target_session_id TEXT NOT NULL,
    message_type TEXT NOT NULL,
    correlation_id TEXT,
    requires_ack INTEGER NOT NULL DEFAULT 0 CHECK (requires_ack IN (0, 1)),
    state TEXT NOT NULL CHECK (state IN ('queued', 'delivered', 'acknowledged', 'answered', 'expired', 'failed')),
    created_at TEXT NOT NULL,
    expires_at TEXT,
    summary TEXT NOT NULL,
    payload_json TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (source_session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (target_session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS worker_message_acks (
    ack_id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    ack_type TEXT NOT NULL DEFAULT 'ack',
    state TEXT NOT NULL DEFAULT 'acknowledged',
    summary TEXT NOT NULL DEFAULT '',
    payload_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    FOREIGN KEY (message_id) REFERENCES worker_messages(message_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS worker_notifications (
    notification_id TEXT PRIMARY KEY,
    source_session_id TEXT NOT NULL,
    target_role TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('result_ready', 'final_result', 'blocked', 'needs_review', 'request_link', 'request_worker', 'scope_conflict', 'handoff', 'heartbeat_missed')),
    priority TEXT NOT NULL CHECK (priority IN ('info', 'normal', 'high', 'urgent')),
    status TEXT NOT NULL CHECK (status IN ('unread', 'acknowledged', 'resolved', 'dismissed')),
    created_at TEXT NOT NULL,
    acknowledged_at TEXT,
    resolved_at TEXT,
    summary TEXT NOT NULL,
    payload_json TEXT NOT NULL DEFAULT '{}',
    correlation_id TEXT,
    FOREIGN KEY (source_session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE
)`,
  // language=SQLite
  `
CREATE TABLE IF NOT EXISTS worker_jobs (
    job_id TEXT PRIMARY KEY,
    session_id TEXT,
    owner_session_id TEXT,
    assignee_session_id TEXT,
    current_actor_session_id TEXT,
    queue_name TEXT NOT NULL DEFAULT 'default',
    status TEXT NOT NULL,
    lease_status TEXT NOT NULL DEFAULT 'unassigned' CHECK (lease_status IN ('unassigned', 'claimed', 'waiting', 'released', 'transferred', 'blocked', 'completed')),
    execution_backend TEXT,
    execution_handle TEXT,
    allowed_actions_json TEXT NOT NULL DEFAULT '[]',
    handoff_target TEXT,
    correlation_id TEXT,
    depends_on_job_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    started_at TEXT,
    finished_at TEXT,
    summary TEXT NOT NULL DEFAULT '',
    payload_json TEXT NOT NULL DEFAULT '{}',
    result_json TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (owner_session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (assignee_session_id) REFERENCES worker_sessions(session_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (depends_on_job_id) REFERENCES worker_jobs(job_id) ON UPDATE CASCADE ON DELETE SET NULL
)`,
];

export const legacyIndexStatements = [
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_worker_sessions_status ON worker_sessions(status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_worker_session_events_session_created ON worker_session_events(session_id, created_at)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_worker_groups_status ON worker_groups(status, acceptance_status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_worker_groups_returns_to ON worker_groups(returns_to_session_id, status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_worker_group_members_session ON worker_group_members(session_id, member_status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_worker_group_edges_group_state ON worker_group_edges(group_id, state)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_worker_group_acceptance_group_created ON worker_group_acceptance_evidence(group_id, created_at)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_worker_messages_target_state ON worker_messages(target_session_id, state)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_worker_notifications_status_priority ON worker_notifications(status, priority)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_worker_jobs_status ON worker_jobs(status)",
  // language=SQLite
  "CREATE INDEX IF NOT EXISTS idx_worker_jobs_assignee_lease ON worker_jobs(assignee_session_id, lease_status)",
];
