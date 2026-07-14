/**
 * @file .ai/tools/agent-monitor/src/components/MaintenanceHistoryPanel.tsx
 * @version 0.1.1 - 2026-05-05 21:05
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Compact read-only operator panel section for agent-runtime
 * maintenance history reports. It renders adapter-normalized summaries only
 * and does not expose mutation controls or raw runtime artifacts.
 *
 * Changes in version 0.1.1:
 * - Added legacy terminal job evidence debt counter to active row labels.
 */
import { Wrench } from 'lucide-react';
import type {
  MaintenanceActiveRowsReport,
  MaintenanceHistory,
  MaintenanceReportSummary,
  MaintenanceSummaryCounters,
} from '../types/maintenance';
import { formatDateTime } from '../utils/format';

interface MaintenanceHistoryPanelProps {
  history: MaintenanceHistory;
}

const activeRowLabels: Array<[keyof MaintenanceActiveRowsReport, string]> = [
  ['active_sessions', 'active'],
  ['unresolved_sessions', 'unresolved'],
  ['working_presence', 'working'],
  ['stale_presence', 'stale'],
  ['unread_or_blocking_notifications', 'attention'],
  ['blocking_peer_messages', 'blocking peer'],
  ['closed_sessions_retained', 'closed retained'],
  ['expired_messages_retained', 'expired retained'],
  ['resolved_notifications_retained', 'resolved retained'],
  ['legacy_terminal_jobs_without_actor_evidence', 'legacy evidence gap'],
];

const summaryLabels: Array<[keyof MaintenanceSummaryCounters, string]> = [
  ['stale_presence_marked', 'stale marked'],
  ['expired_messages_marked', 'messages marked'],
  ['expired_messages_deleted', 'messages deleted'],
  ['resolved_notifications_deleted', 'notifications deleted'],
  ['stale_presence_deleted', 'presence deleted'],
  ['closed_sessions_deleted', 'sessions deleted'],
];

export function MaintenanceHistoryPanel({ history }: MaintenanceHistoryPanelProps) {
  const latestReport = history.reports[0];

  return (
    <section className="panel-block maintenance-history-panel" aria-label="Maintenance history">
      <div className="section-heading">
        <Wrench size={16} aria-hidden="true" />
        <span>Maintenance History</span>
        <span className="feed-count">{history.reports.length} reports</span>
      </div>
      {!latestReport ? (
        <div className="empty-state">No maintenance reports found.</div>
      ) : (
        <>
          <LatestReport report={latestReport} />
          <CounterGrid
            counters={latestReport.active_rows_report}
            entries={activeRowLabels}
            title="active rows"
          />
          <SummaryStrip
            cleanup={latestReport.cleanup_summary}
            dryRun={latestReport.dry_run_summary}
          />
        </>
      )}
    </section>
  );
}

function LatestReport({ report }: { report: MaintenanceReportSummary }) {
  return (
    <article className="maintenance-report-card" data-decision={report.decision}>
      <div className="maintenance-report-title">
        <strong>{report.report_id}</strong>
        <span>{formatDateTime(report.created_at)}</span>
      </div>
      <dl className="maintenance-report-meta">
        <div>
          <dt>mode</dt>
          <dd>{report.mode}</dd>
        </div>
        <div>
          <dt>decision</dt>
          <dd>{report.decision}</dd>
        </div>
        <div>
          <dt>trigger</dt>
          <dd>{report.policy_trigger}</dd>
        </div>
        <div>
          <dt>path</dt>
          <dd>{report.path}</dd>
        </div>
      </dl>
      {report.summary !== '' && <p>{report.summary}</p>}
    </article>
  );
}

function CounterGrid({
  counters,
  entries,
  title,
}: {
  counters: MaintenanceActiveRowsReport;
  entries: Array<[keyof MaintenanceActiveRowsReport, string]>;
  title: string;
}) {
  const visibleEntries = entries.filter(([key]) => counters[key] !== undefined);

  if (visibleEntries.length === 0) {
    return null;
  }

  return (
    <div className="maintenance-counter-block">
      <span className="field-label">{title}</span>
      <dl className="maintenance-counter-grid">
        {visibleEntries.map(([key, label]) => (
          <div key={String(key)}>
            <dt>{label}</dt>
            <dd>{counters[key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SummaryStrip({
  cleanup,
  dryRun,
}: {
  cleanup: MaintenanceSummaryCounters;
  dryRun: MaintenanceSummaryCounters;
}) {
  const dryRunTotal = sumSummaryCounters(dryRun);
  const cleanupTotal = sumSummaryCounters(cleanup);
  const cleanupEntries = summaryLabels.filter(([key]) => cleanup[key] !== undefined);

  return (
    <div className="maintenance-summary-strip">
      <span>dry-run {dryRun.dry_run === false ? 'off' : 'on'}</span>
      <span>{dryRunTotal} dry-run actions</span>
      <span>{cleanupTotal} cleanup actions</span>
      {cleanupEntries.slice(0, 2).map(([key, label]) => (
        <span key={String(key)}>{label}: {cleanup[key]}</span>
      ))}
    </div>
  );
}

function sumSummaryCounters(counters: MaintenanceSummaryCounters): number {
  return summaryLabels.reduce((total, [key]) => {
    const value = counters[key];

    return typeof value === 'number' ? total + value : total;
  }, 0);
}
