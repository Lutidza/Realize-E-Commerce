/**
 * @file .ai/tools/agent-monitor/src/App.tsx
 * @version 0.5.0 - 2026-05-07 03:10
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Top-level composition for the local worker-session monitor. It
 * owns selected-session UI state and wires the read-only dataset into board,
 * sidebar operator summary, session list, and the operator panel.
 *
 * Changes in version 0.5.0:
 * - Simplified status messaging after making the runtime gateway the only
 *   active data source.
 */
import { useEffect, useMemo, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { AdapterStatePanel, type AdapterLoadState } from '@/components/AdapterStatePanel';
import { Board } from '@/components/Board';
import { OperatorPanel } from '@/components/OperatorPanel';
import { SessionsList } from '@/components/SessionsList';
import { SidebarOperatorView } from '@/components/SidebarOperatorView';
import type { MonitorDataset } from '@/types/session';
import { createOperatorMetrics } from '@/data/sessionMetrics';
import type { RegistryDataAdapter } from '@/data/sessionAdapter';
import { runtimeGatewayAdapter } from '@/data/runtimeGateway/runtimeGatewayAdapter';

const emptyDataset: MonitorDataset = {
  sessions: [],
  handoffs: [],
  events: [],
  messages: [],
  maintenanceHistory: {
    loadedAt: '',
    reports: [],
  },
  validationIssues: [],
  sourceLabel: 'loading adapter',
  sourceMode: 'runtime-readonly',
};

export function App() {
  const [dataset, setDataset] = useState<MonitorDataset>(emptyDataset);
  const [adapterLoadState, setAdapterLoadState] = useState<AdapterLoadState>('loading');
  const [adapterStatusMessage, setAdapterStatusMessage] = useState('Waiting for read-only adapter snapshot.');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let refreshInFlight = false;
    let unsubscribe: (() => void) | undefined;
    const selectedAdapter = runtimeGatewayAdapter;

    const applyDataset = (nextDataset: MonitorDataset) => {
      if (cancelled) {
        return;
      }

      setDataset(nextDataset);
      setAdapterLoadState(resolveAdapterLoadState(nextDataset));
      setAdapterStatusMessage(createAdapterStatusMessage(selectedAdapter, nextDataset));
      setSelectedSessionId((currentSessionId) => resolveSelectedSessionId(
        currentSessionId,
        nextDataset,
      ));
    };

    const applyAdapterError = (error: unknown) => {
      if (cancelled) {
        return;
      }

      setDataset({
        ...emptyDataset,
        sourceLabel: selectedAdapter.sourceLabel,
        sourceMode: selectedAdapter.sourceMode,
        validationIssues: [{
          id: 'adapter-load-failed',
          source: 'adapter',
          severity: 'error',
          message: error instanceof Error
            ? error.message
            : 'Read-only adapter failed to load the monitor dataset.',
        }],
      });
      setAdapterLoadState('invalid');
      setAdapterStatusMessage(`${selectedAdapter.sourceLabel} [${selectedAdapter.sourceMode}] failed`);
    };

    const refreshDataset = async () => {
      if (refreshInFlight) {
        return;
      }

      refreshInFlight = true;
      try {
        applyDataset(await selectedAdapter.loadDataset());
      } catch (error: unknown) {
        applyAdapterError(error);
      } finally {
        refreshInFlight = false;
      }
    };

    void refreshDataset();
    unsubscribe = selectedAdapter.subscribe?.({
      onDataset: applyDataset,
      onError: applyAdapterError,
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const selectedSession = dataset.sessions.find(
    (session) => session.session_id === selectedSessionId,
  ) ?? dataset.sessions[0];

  const operatorMetrics = useMemo(() => createOperatorMetrics(dataset), [dataset]);
  const sidebarToggleLabel = isSidebarCollapsed
    ? 'Expand sessions sidebar'
    : 'Collapse sessions sidebar';

  return (
    <main
      className="agent-monitor-shell"
      data-sidebar-collapsed={isSidebarCollapsed}
    >
      <aside
        className="sidebar-panel"
        aria-label="Sessions"
        data-collapsed={isSidebarCollapsed}
      >
        <div className="sidebar-header">
          <button
            aria-expanded={!isSidebarCollapsed}
            aria-label={sidebarToggleLabel}
            className="sidebar-toggle"
            onClick={() => setIsSidebarCollapsed((isCollapsed) => !isCollapsed)}
            title={sidebarToggleLabel}
            type="button"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen size={17} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={17} aria-hidden="true" />
            )}
          </button>
        </div>
        <SidebarOperatorView metrics={operatorMetrics} />
        <AdapterStatePanel
          issueCount={dataset.validationIssues.length}
          message={adapterStatusMessage}
          sourceLabel={dataset.sourceLabel}
          sourceMode={dataset.sourceMode}
          state={adapterLoadState}
        />
        <SessionsList
          sessions={dataset.sessions}
          selectedSessionId={selectedSession?.session_id ?? ''}
          onSelectSession={setSelectedSessionId}
        />
      </aside>

      <section className="board-panel" aria-label="Worker graph">
        {adapterLoadState === 'loading' ? (
          <AdapterStatePanel
            issueCount={0}
            message={adapterStatusMessage}
            sourceLabel={dataset.sourceLabel}
            sourceMode={dataset.sourceMode}
            state={adapterLoadState}
          />
        ) : null}
        <Board
          sessions={dataset.sessions}
          handoffs={dataset.handoffs}
          selectedSessionId={selectedSession?.session_id ?? ''}
          onSelectSession={setSelectedSessionId}
        />
      </section>

      <OperatorPanel
        events={dataset.events}
        maintenanceHistory={dataset.maintenanceHistory}
        messages={dataset.messages}
        session={selectedSession}
        validationIssues={dataset.validationIssues}
      />
    </main>
  );
}

function resolveAdapterLoadState(dataset: MonitorDataset): AdapterLoadState {
  if (dataset.validationIssues.some((issue) => issue.severity === 'error')) {
    return 'invalid';
  }

  if (dataset.sessions.length === 0) {
    return 'empty';
  }

  return 'ready';
}

function resolveSelectedSessionId(
  currentSessionId: string,
  dataset: MonitorDataset,
): string {
  if (dataset.sessions.some((session) => session.session_id === currentSessionId)) {
    return currentSessionId;
  }

  return dataset.sessions[0]?.session_id ?? '';
}

function createAdapterStatusMessage(
  adapter: RegistryDataAdapter,
  dataset: MonitorDataset,
): string {
  if (dataset.sessions.length === 0) {
    return 'Registry loaded with no active sessions.';
  }

  return selectedAdapterHasPush(adapter)
    ? 'Dataset loaded from selected live runtime adapter.'
    : 'Dataset loaded from selected read-only adapter.';
}

function selectedAdapterHasPush(adapter: RegistryDataAdapter): boolean {
  return typeof adapter.subscribe === 'function';
}
