/**
 * @file .ai/tools/agent-monitor/src/components/ActivityPanel.tsx
 * @version 0.2.1 - 2026-05-05 11:05
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Read-only Live Activity timeline for normalized
 * worker-session events. It is fed from adapter-level summaries rather than
 * raw conversation content.
 *
 * Changes in version 0.2.1:
 * - Displayed cross-session activity counts from registry and message events.
 */
import { Activity } from 'lucide-react';
import type { MonitorEvent } from '../types/session';
import { formatDateTime } from '../utils/format';

interface ActivityPanelProps {
  events: MonitorEvent[];
}

export function ActivityPanel({ events }: ActivityPanelProps) {
  return (
    <section className="panel-block activity-panel">
      <div className="section-heading">
        <Activity size={16} aria-hidden="true" />
        <span>Live Activity</span>
        <span className="feed-count">{events.length} events</span>
      </div>
      <div className="activity-feed">
        {events.length === 0 ? (
          <div className="empty-state">No registry activity to display.</div>
        ) : events.map((event) => (
          <div className="activity-item" data-tone={event.tone} key={event.id}>
            <span>{formatDateTime(event.timestamp)}</span>
            <strong>{event.label}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
