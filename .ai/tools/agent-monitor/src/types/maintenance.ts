/**
 * @file .ai/tools/agent-monitor/src/types/maintenance.ts
 * @version 0.1.1 - 2026-05-05 21:05
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Typed read model for agent-runtime maintenance history reports.
 * The monitor consumes these objects as read-only observability data and never
 * writes maintenance artifacts from browser runtime.
 *
 * Changes in version 0.1.1:
 * - Added legacy terminal job evidence debt counter to maintenance reports.
 */

export type MaintenanceReportMode =
  | 'audit_only'
  | 'cleanup_allowed'
  | 'projection_refresh'
  | 'full_maintenance';

export type MaintenanceReportDecision =
  | 'passed'
  | 'failed'
  | 'blocked';

export interface MaintenanceHistorySnapshot {
  schema_version: string;
  generated_at: string;
  reports: MaintenanceHistoryRawReport[];
}

export interface MaintenanceHistoryRawReport {
  path: string;
  report: unknown;
}

export interface MaintenanceHistory {
  loadedAt: string;
  reports: MaintenanceReportSummary[];
}

export interface MaintenanceReportSummary {
  path: string;
  schema_version: string;
  artifact_type: 'agent-runtime-maintenance-report';
  report_id: string;
  created_at: string;
  runtime_store: string;
  policy_trigger: string;
  mode: MaintenanceReportMode;
  decision: MaintenanceReportDecision;
  summary: string;
  dry_run_summary: MaintenanceSummaryCounters;
  cleanup_summary: MaintenanceSummaryCounters;
  active_rows_report: MaintenanceActiveRowsReport;
}

export interface MaintenanceSummaryCounters {
  dry_run?: boolean;
  stale_presence_marked?: number;
  expired_messages_marked?: number;
  expired_messages_deleted?: number;
  resolved_notifications_deleted?: number;
  stale_presence_deleted?: number;
  closed_sessions_deleted?: number;
}

export interface MaintenanceActiveRowsReport {
  active_sessions?: number;
  unresolved_sessions?: number;
  working_presence?: number;
  stale_presence?: number;
  unread_or_blocking_notifications?: number;
  blocking_peer_messages?: number;
  closed_sessions_retained?: number;
  expired_messages_retained?: number;
  resolved_notifications_retained?: number;
  legacy_terminal_jobs_without_actor_evidence?: number;
}
