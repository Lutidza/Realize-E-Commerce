/**
 * @file .ai/tools/agent-monitor/src/components/StatusBadge.tsx
 * @version 0.1.0 - 2026-05-05 00:05
 * @docref DOC-SYSTEM-SPEC-032
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @description Small status indicator for worker-session lifecycle states.
 * It renders registry statuses without converting resolutions into statuses.
 *
 * Changes in version 0.1.0:
 * - Added shared status badge for list, graph, and inspector surfaces.
 */
import type { WorkerStatus } from '../types/session';

interface StatusBadgeProps {
  status: WorkerStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-${status}`}>{status}</span>;
}
