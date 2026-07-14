/**
 * @file .ai/tools/agent-runtime/src/runtime-checks/worker-launch-read-model.mjs
 * @version 0.1.0 - 2026-05-15 00:00
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Вспомогательные функции только для чтения runtime rows и
 * gateway snapshot, используемые проверками preflight запуска worker-а.
 */

export const dialogAssistantSessionId = "dialog-assistant";

export function readRuntimeRows(database, sessionId, groupId) {
  const group = groupId ? selectOne(database, "SELECT * FROM worker_groups WHERE group_id = ?", [groupId]) : null;
  const groupMembers = groupId ? selectAll(database, "SELECT * FROM worker_group_members WHERE group_id = ? ORDER BY session_id ASC", [groupId]) : [];
  const groupEdges = groupId ? selectAll(database, "SELECT * FROM worker_group_edges WHERE group_id = ? ORDER BY edge_id ASC", [groupId]) : [];
  const groupSessionIds = [...new Set([
    dialogAssistantSessionId,
    sessionId,
    group?.returns_to_session_id,
    group?.group_closer_session_id,
    ...groupMembers.map((member) => member.session_id),
    ...groupEdges.flatMap((edge) => [edge.source_session_id, edge.target_session_id]),
  ].filter(Boolean))];

  return {
    session: selectOne(database, "SELECT * FROM worker_sessions WHERE session_id = ?", [sessionId]),
    presence: selectOne(database, "SELECT * FROM worker_presence WHERE session_id = ?", [sessionId]),
    jobs: selectAll(database, "SELECT * FROM worker_jobs WHERE session_id = ? OR assignee_session_id = ? ORDER BY updated_at ASC", [sessionId, sessionId]),
    dialogAssistant: selectOne(database, "SELECT * FROM worker_sessions WHERE session_id = ?", [dialogAssistantSessionId]),
    group,
    groupMembers,
    groupEdges,
    groupSessions: selectSessions(database, groupSessionIds),
  };
}

export function plannedSessionVisible(session, snapshot, sessionId, snapshotAvailable = true) {
  return Boolean(session)
    && session.status === "planned"
    && (!snapshotAvailable || snapshotSessionVisible(snapshot, sessionId));
}

export function presenceVisible(presence, snapshot, sessionId, snapshotAvailable = true) {
  return Boolean(presence)
    && (!snapshotAvailable || snapshotPresenceVisible(snapshot, sessionId));
}

export function snapshotSessionVisible(snapshot, sessionId) {
  return Array.isArray(snapshot?.sessions)
    && snapshot.sessions.some((session) => session.session_id === sessionId);
}

export function snapshotPresenceVisible(snapshot, sessionId) {
  return Array.isArray(snapshot?.presence)
    && snapshot.presence.some((presence) => presence.session_id === sessionId);
}

export function snapshotGroup(snapshot, groupId) {
  const groups = snapshot?.topology?.groups;
  if (!Array.isArray(groups)) {
    return null;
  }
  return groups.find((group) => group.group_id === groupId) ?? null;
}

export function snapshotGroupEdgesVisible(snapshot, groupId) {
  const edges = snapshot?.topology?.group_edges;
  return Array.isArray(edges) && edges.some((edge) => edge.group_id === groupId);
}

export function coordinatorSessionIdFromRows(rows) {
  const metadata = parseJsonObject(rows.group?.metadata_json ?? rows.group?.metadata);
  return optionalString(metadata.coordinator_session_id)
    ?? optionalString(metadata.coordinator?.session_id)
    ?? rows.groupMembers.find((member) => String(member.role).toLowerCase().includes("coordinator"))?.session_id
    ?? null;
}

export function sessionById(sessions, sessionId) {
  return sessions.find((session) => session.session_id === sessionId) ?? null;
}

function selectSessions(database, sessionIds) {
  if (sessionIds.length === 0) {
    return [];
  }
  return sessionIds.map((sessionId) => selectOne(database, "SELECT * FROM worker_sessions WHERE session_id = ?", [sessionId])).filter(Boolean);
}

function selectOne(database, sql, values = []) {
  try {
    return parseJsonColumns(database.prepare(sql).get(...values) ?? null);
  } catch {
    return null;
  }
}

function selectAll(database, sql, values = []) {
  try {
    return database.prepare(sql).all(...values).map(parseJsonColumns);
  } catch {
    return [];
  }
}

function parseJsonColumns(row) {
  if (!row) {
    return null;
  }
  return Object.fromEntries(Object.entries(row).map(([key, value]) => {
    if (!key.endsWith("_json") || typeof value !== "string") {
      return [key, value];
    }
    return [key.replace(/_json$/, ""), parseJsonObject(value)];
  }));
}

function parseJsonObject(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  try {
    const parsed = JSON.parse(value ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function optionalString(value) {
  if (value === null || value === undefined || typeof value === "object") {
    return null;
  }
  const normalized = String(value).trim();
  return normalized === "" ? null : normalized;
}
