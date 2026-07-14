/**
 * @file .ai/tools/agent-monitor/src/components/AdapterStatePanel.tsx
 * @version 0.1.0 - 2026-05-05 02:25
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Compact read-only adapter state indicator for loading, empty,
 * ready and invalid runtime snapshots. It renders adapter source health only
 * and does not expose outbound controls or raw source content.
 *
 * Changes in version 0.1.0:
 * - Added explicit UI state indicator for adapter-backed monitor snapshots.
 */
import { CircleAlert, CircleCheck, CircleDashed, LoaderCircle } from 'lucide-react';

export type AdapterLoadState = 'loading' | 'ready' | 'empty' | 'invalid';

interface AdapterStatePanelProps {
  state: AdapterLoadState;
  sourceLabel: string;
  sourceMode?: string;
  message: string;
  issueCount: number;
}

const stateLabels: Record<AdapterLoadState, string> = {
  loading: 'Loading snapshot',
  ready: 'Snapshot ready',
  empty: 'Empty registry',
  invalid: 'Invalid snapshot',
};

const stateIcons = {
  loading: LoaderCircle,
  ready: CircleCheck,
  empty: CircleDashed,
  invalid: CircleAlert,
};

export function AdapterStatePanel({
  state,
  sourceLabel,
  sourceMode,
  message,
  issueCount,
}: AdapterStatePanelProps) {
  const StateIcon = stateIcons[state];

  return (
    <section
      aria-label="Adapter state"
      className="panel-block validation-panel"
      data-adapter-state={state}
    >
      <div className="section-heading">
        <StateIcon size={16} aria-hidden="true" />
        <span>{stateLabels[state]}</span>
      </div>
      <div className="validation-feed">
        <article
          className="validation-item"
          data-severity={state === 'invalid' ? 'error' : 'warning'}
        >
          <span>{sourceMode ? `${sourceLabel} [${sourceMode}]` : sourceLabel}</span>
          <strong>
            {message}
            {issueCount > 0 ? `; ${issueCount} validation issue(s)` : ''}
          </strong>
        </article>
      </div>
    </section>
  );
}
