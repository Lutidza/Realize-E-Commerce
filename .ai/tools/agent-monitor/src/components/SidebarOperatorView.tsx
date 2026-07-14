/**
 * @file .ai/tools/agent-monitor/src/components/SidebarOperatorView.tsx
 * @version 0.1.0 - 2026-05-05 00:55
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Left-sidebar composition for read-only Operator View counters.
 * The component owns the sidebar placement boundary and the divider that
 * separates runtime aggregates from the worker session list.
 *
 * Changes in version 0.1.0:
 * - Introduced a dedicated sidebar Operator View component.
 */
import type { OperatorMetric } from '../types/session';
import { OperatorCounters } from './OperatorCounters';

interface SidebarOperatorViewProps {
  metrics: OperatorMetric[];
}

export function SidebarOperatorView({ metrics }: SidebarOperatorViewProps) {
  return (
    <>
      <OperatorCounters metrics={metrics} />
      <div className="sidebar-divider" aria-hidden="true" />
    </>
  );
}
