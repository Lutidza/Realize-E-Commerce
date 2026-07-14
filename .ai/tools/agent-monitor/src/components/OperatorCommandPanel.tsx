/**
 * @file .ai/tools/agent-monitor/src/components/OperatorCommandPanel.tsx
 * @version 1.0.1 - 2026-05-10 16:05
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Operator command controls for request_worker and accept_result through
 * the runtime gateway command API.
 *
 * Changes in version 1.0.1:
 * - Fixed operator actor and request_worker target ownership and added
 *   allowed_paths to the submitted worker request contract.
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import type { MonitorSession } from '../types/session';
import {
  sendOperatorAcceptResultCommand,
  sendOperatorRequestWorkerCommand,
} from '../data/runtimeGateway/client';

interface OperatorCommandPanelProps {
  session?: MonitorSession;
}

interface CommandState {
  state: 'idle' | 'pending' | 'success' | 'error';
  message: string;
}

const DEFAULT_ACTOR_SESSION_ID = 'dialog-assistant';
const DEFAULT_MODEL = 'gpt-5.3-codex-spark';
const DEFAULT_ALLOWED_PATHS = [
  '.ai/tools/agent-monitor',
  '.ai/tools/agent-runtime',
  'documentation/project/specs/ai-engineering-workflow',
].join('\n');
const canAcceptByStatus = new Set(['result-ready', 'needs-review', 'blocked']);

export function OperatorCommandPanel({ session }: OperatorCommandPanelProps) {
  const actorSessionId = DEFAULT_ACTOR_SESSION_ID;
  const requestTargetSessionId = DEFAULT_ACTOR_SESSION_ID;
  const acceptTargetSessionId = session?.session_id;
  const canAcceptResult = session ? canAcceptByStatus.has(session.status) : false;
  const [formRole, setFormRole] = useState('');
  const [formMission, setFormMission] = useState('');
  const [formModel, setFormModel] = useState(DEFAULT_MODEL);
  const [formAllowedPaths, setFormAllowedPaths] = useState(DEFAULT_ALLOWED_PATHS);
  const [requestWorkerState, setRequestWorkerState] = useState<CommandState>({
    state: 'idle',
    message: 'No request submitted yet.',
  });
  const [acceptResultState, setAcceptResultState] = useState<CommandState>({
    state: 'idle',
    message: 'No accept action submitted yet.',
  });

  const isRequestPending = requestWorkerState.state === 'pending';
  const isAcceptPending = acceptResultState.state === 'pending';
  const allowedPaths = parseAllowedPaths(formAllowedPaths);
  const isSubmitDisabled = isRequestPending
    || formRole.trim() === ''
    || formMission.trim() === ''
    || allowedPaths.length === 0;

  const createCommandId = (prefix: string) => {
    const safeSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `${prefix}-${actorSessionId}-${safeSuffix}`;
  };

  const handleRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) {
      return;
    }

    setRequestWorkerState({
      state: 'pending',
      message: `Sending request_worker for ${requestTargetSessionId}.`,
    });

    try {
      const response = await sendOperatorRequestWorkerCommand({
        actorSessionId,
        targetSessionId: requestTargetSessionId,
        role: formRole,
        mission: formMission,
        model: formModel || DEFAULT_MODEL,
        allowedPaths,
        commandId: createCommandId('operator-request-worker'),
        summary: `Request worker from operator panel for ${requestTargetSessionId}`,
      });

      const resultText = response.deduplicated
        ? 'Deduplicated: command already processed'
        : 'request_worker accepted';

      setRequestWorkerState({
        state: 'success',
        message: `${resultText}. command_id=${response.command_id ?? response.operator_command_id ?? 'n/a'}.`,
      });
    } catch (error: unknown) {
      setRequestWorkerState({
        state: 'error',
        message: error instanceof Error
          ? error.message
          : 'Request command failed.',
      });
    }
  };

  const handleAcceptResult = async () => {
    if (!session || !acceptTargetSessionId || !canAcceptResult) {
      return;
    }

    setAcceptResultState({
      state: 'pending',
      message: `Accepting result for ${session.session_id}.`,
    });

    try {
      const response = await sendOperatorAcceptResultCommand({
        actorSessionId,
        targetSessionId: acceptTargetSessionId,
        commandId: createCommandId('operator-accept-result'),
        summary: `Accept result for ${acceptTargetSessionId}`,
      });

      const resultText = response.deduplicated
        ? 'Deduplicated: command already processed'
        : 'accept_result accepted';

      setAcceptResultState({
        state: 'success',
        message: `${resultText}. session=${session.session_id} (${response.command_id ?? response.operator_command_id ?? 'n/a'}).`,
      });
    } catch (error: unknown) {
      setAcceptResultState({
        state: 'error',
        message: error instanceof Error
          ? error.message
          : 'Accept command failed.',
      });
    }
  };

  return (
    <section className="panel-block operator-command-panel">
      <div className="section-heading">
        <Send size={16} aria-hidden="true" />
        <span>Operator Commands</span>
      </div>

      <form className="operator-command-form" onSubmit={handleRequestSubmit}>
        <label className="field-label" htmlFor="operator-request-role">
          role
        </label>
        <input
          className="operator-command-input"
          id="operator-request-role"
          maxLength={120}
          onChange={(event) => setFormRole(event.target.value)}
          placeholder="e.g. implementation-worker"
          required
          type="text"
          value={formRole}
        />

        <label className="field-label" htmlFor="operator-request-mission">
          mission
        </label>
        <textarea
          className="operator-command-input operator-command-textarea"
          id="operator-request-mission"
          maxLength={900}
          onChange={(event) => setFormMission(event.target.value)}
          placeholder="Task boundary for new worker request."
          required
          rows={3}
          value={formMission}
        />

        <label className="field-label" htmlFor="operator-request-model">
          model
        </label>
        <input
          className="operator-command-input"
          id="operator-request-model"
          onChange={(event) => setFormModel(event.target.value)}
          placeholder={DEFAULT_MODEL}
          type="text"
          value={formModel}
        />

        <label className="field-label" htmlFor="operator-request-allowed-paths">
          allowed paths
        </label>
        <textarea
          className="operator-command-input operator-command-textarea"
          id="operator-request-allowed-paths"
          maxLength={900}
          onChange={(event) => setFormAllowedPaths(event.target.value)}
          required
          rows={3}
          value={formAllowedPaths}
        />

        <button
          className="operator-command-button"
          disabled={isSubmitDisabled}
          type="submit"
        >
          Request Worker
        </button>
      </form>

      <div
        aria-live="polite"
        className={`operator-command-state operator-command-state-${requestWorkerState.state}`}
      >
        <span className="operator-command-state-title">request_worker</span>
        <span>{requestWorkerState.message}</span>
      </div>

      <div className="operator-command-divider" />

      <button
        className="operator-command-button"
        disabled={!canAcceptResult || isAcceptPending}
        onClick={handleAcceptResult}
        type="button"
      >
        <CheckCircle2 size={14} aria-hidden="true" />
        Accept Result
      </button>
      <div
        aria-live="polite"
        className={`operator-command-state operator-command-state-${acceptResultState.state}`}
      >
        <span className="operator-command-state-title">accept_result</span>
        <span>{acceptResultState.message}</span>
      </div>
      {!canAcceptResult && session ? (
        <div className="operator-command-note">
          Accept Result available when session status is result-ready, needs-review, or blocked.
        </div>
      ) : null}
      {!session ? (
        <div className="operator-command-note">
          Select a session to target accept_result.
        </div>
      ) : null}
    </section>
  );
}

function parseAllowedPaths(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((path) => path.trim())
    .filter(Boolean);
}
