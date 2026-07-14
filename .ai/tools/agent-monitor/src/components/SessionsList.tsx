/**
 * @file .ai/tools/agent-monitor/src/components/SessionsList.tsx
 * @version 0.2.0 - 2026-05-05 00:05
 * @docref DOC-SYSTEM-SPEC-032
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @description Dense session navigation list for active worker sessions. It
 * exposes registry identity, role, lifecycle status, and last update time.
 *
 * Changes in version 0.2.0:
 * - Added empty state for registries with no active sessions.
 */
import { Bot, GitPullRequestArrow, Lock, PencilLine } from 'lucide-react';
import type { MonitorSession } from '../types/session';
import { formatDateTime } from '../utils/format';
import { StatusBadge } from './StatusBadge';

interface SessionsListProps {
  sessions: MonitorSession[];
  selectedSessionId: string;
  onSelectSession: (sessionId: string) => void;
}

export function SessionsList({
  sessions,
  selectedSessionId,
  onSelectSession,
}: SessionsListProps) {
  return (
    <div className="sessions-list">
      <div className="section-heading">
        <Bot size={16} aria-hidden="true" />
        <span>Sessions</span>
      </div>
      {sessions.length === 0 ? (
        <div className="empty-state">
          No active worker sessions in the loaded registry.
        </div>
      ) : sessions.map((session) => (
        <button
          className="session-list-item"
          data-selected={session.session_id === selectedSessionId}
          key={session.session_id}
          onClick={() => onSelectSession(session.session_id)}
          type="button"
        >
          <span className="session-row">
            <strong>{session.role}</strong>
            <StatusBadge status={session.status} />
          </span>
          <span className="session-id">{session.session_id}</span>
          <span className="session-meta">
            {session.write_allowed ? (
              <PencilLine size={13} aria-label="Write allowed" />
            ) : (
              <Lock size={13} aria-label="Read-only" />
            )}
            <GitPullRequestArrow size={13} aria-hidden="true" />
            {formatDateTime(session.updated_at)}
          </span>
        </button>
      ))}
    </div>
  );
}
