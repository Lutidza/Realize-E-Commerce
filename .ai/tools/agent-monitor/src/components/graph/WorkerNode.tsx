/**
 * @file .ai/tools/agent-monitor/src/components/graph/WorkerNode.tsx
 * @version 0.1.3 - 2026-05-05 22:10
 * @docref DOC-SYSTEM-SPEC-032
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @description React Flow node for worker sessions. It displays registry
 * fields relevant to coordination without embedding session mutation controls.
 *
 * Changes in version 0.1.3:
 * - Displayed lease state when presence is not actively executing work.
 */
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Bot, CheckCircle2, CircleDot, Clock3, GitBranch, OctagonAlert } from 'lucide-react';
import type { MonitorSession } from '../../types/session';
import { StatusBadge } from '../StatusBadge';

export type WorkerNodeData = MonitorSession & {
  selected: boolean;
} & Record<string, unknown>;

const iconByStatus = {
  planned: Clock3,
  launched: CircleDot,
  running: Bot,
  'result-ready': GitBranch,
  'needs-review': GitBranch,
  blocked: OctagonAlert,
  closed: CheckCircle2,
};

function WorkerNodeComponent({ data }: NodeProps) {
  const session = data as unknown as WorkerNodeData;
  const StatusIcon = iconByStatus[session.status];
  const runtimeStateLabel = session.runtime_active
    ? 'working'
    : session.presence_state ?? session.lease_status ?? 'not set';
  const backendLabel = [session.execution_backend, shortValue(session.execution_handle)]
    .filter((value): value is string => Boolean(value))
    .join(' / ');
  const modelLabel = [session.execution_model, session.execution_tier]
    .filter((value): value is string => Boolean(value))
    .join(' / ');

  return (
    <article
      className="monitor-node"
      data-active={session.runtime_active}
      data-quiet={session.quiet}
      data-selected={session.selected}
    >
      <Handle className="node-handle" position={Position.Top} type="target" />
      <div className="node-header">
        <span className="node-icon">
          <StatusIcon size={16} aria-hidden="true" />
        </span>
        <div>
          <span className="field-label">session_id</span>
          <strong
            className="node-session-id"
            title={session.session_id}
          >
            {session.session_id}
          </strong>
        </div>
      </div>
      <div className="node-body">
        <span>{session.role}</span>
        <StatusBadge status={session.status} />
      </div>
      <p className="node-mission" title={session.mission}>{session.mission}</p>
      <dl className="node-facts">
        <div className="node-fact-row">
          <dt>presence</dt>
          <dd>{runtimeStateLabel}</dd>
        </div>
        <div className="node-fact-row">
          <dt>activity</dt>
          <dd>{session.current_activity ?? 'not set'}</dd>
        </div>
        <div className="node-fact-row">
          <dt>lease/job</dt>
          <dd>{joinCompact([session.lease_status, session.job_status]) ?? 'not set'}</dd>
        </div>
        <div className="node-fact-row">
          <dt>backend</dt>
          <dd>{backendLabel || 'not set'}</dd>
        </div>
        <div className="node-fact-row">
          <dt>model</dt>
          <dd>{modelLabel || 'not set'}</dd>
        </div>
        <div className="node-fact-row">
          <dt>context</dt>
          <dd>{session.context_budget ?? 'not set'}</dd>
        </div>
        <div className="node-fact-row">
          <dt>access</dt>
          <dd>{`${session.access_mode} (${session.allowed_path_count} paths)`}</dd>
        </div>
        <div className="node-fact-row">
          <dt>assigned_by</dt>
          <dd>{session.assigned_by ?? 'not set'}</dd>
        </div>
        <div className="node-fact-row">
          <dt>handoff_target</dt>
          <dd>{session.handoff_target ?? 'not set'}</dd>
        </div>
      </dl>
      <div className="node-footer">
        <span
          className="node-runtime-marker"
          data-active={session.runtime_active}
        >
          {runtimeStateLabel}
        </span>
        <span>{session.message_count} messages</span>
        <span>{session.recent_message_at ? 'recent signal' : 'no recent signal'}</span>
      </div>
      <Handle className="node-handle" position={Position.Bottom} type="source" />
    </article>
  );
}

export const WorkerNode = memo(WorkerNodeComponent);

function joinCompact(values: Array<string | null>): string | null {
  const compact = values
    .filter((value): value is string => Boolean(value))
    .join(' / ');
  return compact === '' ? null : compact;
}

function shortValue(value: string | null, size = 20): string | null {
  if (!value) {
    return null;
  }
  if (value.length <= size) {
    return value;
  }
  return `${value.slice(0, size - 3)}...`;
}
