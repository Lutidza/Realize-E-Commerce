/**
 * @file .ai/tools/agent-monitor/src/components/OperatorCounters.tsx
 * @version 0.2.2 - 2026-05-05 00:35
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Read-only Operator View counters block for adapter-provided
 * runtime metrics. The component does not calculate business metrics and only
 * renders the typed metrics supplied by the data boundary.
 *
 * Changes in version 0.2.2:
 * - Made Operator View render as a compact top status strip.
 */
import { Gauge } from 'lucide-react';
import type { OperatorMetric } from '../types/session';

interface OperatorCountersProps {
  metrics: OperatorMetric[];
}

export function OperatorCounters({ metrics }: OperatorCountersProps) {
  return (
    <section className="operator-counters" aria-label="Operator View">
      <div className="operator-counters-heading">
        <Gauge size={16} aria-hidden="true" />
        <span>Operator View</span>
      </div>
      {metrics.length === 0 ? (
        <div className="empty-state">
          Operator metrics are waiting for the read-only adapter snapshot.
        </div>
      ) : (
        <dl className="operator-metric-list">
          {metrics.map((metric) => (
            <div
              className="operator-metric"
              data-tone={metric.tone ?? 'neutral'}
              key={metric.id}
              title={metric.description}
            >
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
