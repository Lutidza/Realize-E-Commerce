/**
 * @file .ai/tools/agent-monitor/src/components/Inspector.tsx
 * @version 0.1.2 - 2026-05-05 22:10
 * @docref DOC-SYSTEM-SPEC-032
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @description Read-only inspector for the selected worker session. It focuses
 * on registry contract fields and does not expose hidden reasoning.
 *
 * Changes in version 0.1.2:
 * - Added read-only execution lease ownership fields.
 */
import { FileCode2, ShieldCheck } from 'lucide-react';
import type { MonitorSession } from '../types/session';
import { formatDateTime } from '../utils/format';
import { StatusBadge } from './StatusBadge';

interface InspectorProps {
  session?: MonitorSession;
}

export function Inspector({ session }: InspectorProps) {
  if (!session) {
    return <section className="panel-block">No session selected.</section>;
  }

  return (
    <section className="panel-block inspector-panel">
      <div className="section-heading">
        <ShieldCheck size={16} aria-hidden="true" />
        <span>Inspector</span>
      </div>
      <div className="inspector-title">
        <div>
          <span className="field-label">session_id</span>
          <h2>{session.session_id}</h2>
        </div>
        <StatusBadge status={session.status} />
      </div>
      <dl className="details-grid">
        <div>
          <dt>role</dt>
          <dd>{session.role}</dd>
        </div>
        <div>
          <dt>worker_kind</dt>
          <dd>{session.worker_kind}</dd>
        </div>
        <div>
          <dt>updated_at</dt>
          <dd>{formatDateTime(session.updated_at)}</dd>
        </div>
        <div>
          <dt>resolution</dt>
          <dd>{session.resolution ?? 'none'}</dd>
        </div>
        <div>
          <dt>handoff_required</dt>
          <dd>{session.handoff_required ? 'true' : 'false'}</dd>
        </div>
        <div>
          <dt>execution</dt>
          <dd>{session.execution_backend ?? 'not bridged'}</dd>
        </div>
        <div>
          <dt>lease_status</dt>
          <dd>{session.lease_status ?? 'not set'}</dd>
        </div>
        <div>
          <dt>assignee</dt>
          <dd>{session.assignee_session_id ?? 'not set'}</dd>
        </div>
        <div>
          <dt>current_actor</dt>
          <dd>{session.current_actor_session_id ?? 'not set'}</dd>
        </div>
        <div>
          <dt>execution_handle</dt>
          <dd>{session.execution_handle ?? 'not set'}</dd>
        </div>
        <div>
          <dt>job_id</dt>
          <dd>{session.job_id ?? 'not set'}</dd>
        </div>
        <div>
          <dt>result_path</dt>
          <dd>{session.result_path ?? 'not set'}</dd>
        </div>
      </dl>
      <div className="mission-box">
        <span className="field-label">mission</span>
        <p>{session.mission}</p>
      </div>
      <div className="path-list">
        <span className="field-label">
          <FileCode2 size={14} aria-hidden="true" />
          allowed_paths
        </span>
        {session.allowed_paths.map((path) => (
          <code key={path}>{path}</code>
        ))}
      </div>
    </section>
  );
}
