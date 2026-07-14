/**
 * @file .ai/tools/agent-monitor/src/components/OperatorPanel.tsx
 * @version 0.2.5 - 2026-05-05 09:45
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Right-side OperatorPanel composition for read-only selected
 * session inspector, operator console, and live activity. The panel
 * deliberately excludes outbound message editor and mutation controls.
 *
 * Changes in version 0.2.5:
 * - Added compact read-only maintenance history section.
 */
import type {
  MonitorEvent,
  MonitorMessage,
  MonitorSession,
  MonitorValidationIssue,
} from '../types/session';
import type { MaintenanceHistory } from '../types/maintenance';
import { ActivityPanel } from './ActivityPanel';
import { Inspector } from './Inspector';
import { MaintenanceHistoryPanel } from './MaintenanceHistoryPanel';
import { MessagesPanel } from './MessagesPanel';
import { OperatorCommandPanel } from './OperatorCommandPanel';

interface OperatorPanelProps {
  session?: MonitorSession;
  messages: MonitorMessage[];
  events: MonitorEvent[];
  maintenanceHistory: MaintenanceHistory;
  validationIssues: MonitorValidationIssue[];
}

export function OperatorPanel({
  session,
  messages,
  events,
  maintenanceHistory,
  validationIssues,
}: OperatorPanelProps) {
  return (
    <aside className="operator-panel" aria-label="Operator panel">
      <MessagesPanel messages={messages} session={session} />
      <MaintenanceHistoryPanel history={maintenanceHistory} />
      <OperatorCommandPanel session={session} />
      {validationIssues.length > 0 && (
        <section className="panel-block adapter-diagnostics-panel" aria-label="Adapter diagnostics">
          <div className="section-heading">
            <span>Adapter Diagnostics</span>
          </div>
          <div className="diagnostic-list">
            {validationIssues.map((issue) => (
              <article
                className="diagnostic-item"
                data-severity={issue.severity}
                key={issue.id}
              >
                <span>{issue.source}</span>
                <strong>{issue.message}</strong>
              </article>
            ))}
          </div>
        </section>
      )}
      <ActivityPanel events={events} />
      <Inspector session={session} />
    </aside>
  );
}
