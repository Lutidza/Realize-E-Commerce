/**
 * @file .ai/tools/agent-monitor/src/data/sessionMetrics.ts
 * @version 0.4.0 - 2026-05-07 03:10
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Pure read-only operator metrics builder for the local agent
 * monitor. It derives counters from the sanitized MonitorDataset view model and
 * never reads or writes worker-session runtime artifacts directly.
 *
 * Changes in version 0.4.0:
 * - Aligned runtime presence wording with the direct runtime gateway data
 *   source.
 */
import type {
  MonitorDataset,
  MonitorMessage,
  MonitorSession,
  OperatorMetric,
} from '@/types/session';

const QUIET_SESSION_THRESHOLD_MS = 30 * 60 * 1000;

type MetricInput = Omit<OperatorMetric, 'description'> & {
  description?: string;
};

export function createOperatorMetrics(dataset: MonitorDataset): OperatorMetric[] {
  const visibleMessagesBySession = createVisibleMessageCounts(dataset.messages);
  const redactedEventsCount = dataset.messages.filter(isRedactedMessage).length;
  const userVisibleMessagesCount = dataset.messages.filter(isUserVisibleMessage).length;
  const sessionsWithoutVisibleTrace = dataset.sessions.filter((session) => (
    session.messages_path === null
    || (visibleMessagesBySession.get(session.session_id) ?? 0) === 0
  )).length;
  const writeAllowedSessions = dataset.sessions.filter((session) => session.write_allowed).length;
  const readOnlySessions = dataset.sessions.length - writeAllowedSessions;

  return [
    createMetric({
      id: 'active-sessions',
      label: 'Registry sessions',
      value: dataset.sessions.length,
      tone: 'info',
      description: 'Sessions present in the active registry snapshot.',
    }),
    createMetric({
      id: 'working-presence-sessions',
      label: 'Working',
      value: dataset.sessions.filter((session) => session.runtime_active).length,
      tone: 'success',
      description: 'Sessions with presence_state working and a fresh heartbeat/lease.',
    }),
    createMetric({
      id: 'waiting-presence-sessions',
      label: 'Waiting',
      value: dataset.sessions.filter((session) => session.presence_state === 'waiting').length,
      tone: 'warning',
    }),
    createMetric({
      id: 'stale-presence-sessions',
      label: 'Stale',
      value: dataset.sessions.filter((session) => session.presence_state === 'stale').length,
      tone: 'danger',
    }),
    createMetric({
      id: 'running-sessions',
      label: 'Running',
      value: countSessions(dataset.sessions, 'running'),
      tone: 'info',
    }),
    createMetric({
      id: 'quiet-sessions',
      label: 'Quiet',
      value: dataset.sessions.filter((session) => (
        isQuietSession(session, dataset.messages)
      )).length,
      tone: 'warning',
      description: 'Sessions with no visible messages or stale updated_at.',
    }),
    createMetric({
      id: 'blocked-sessions',
      label: 'Blocked',
      value: countSessions(dataset.sessions, 'blocked'),
      tone: 'danger',
    }),
    createMetric({
      id: 'needs-review-sessions',
      label: 'Needs review',
      value: countSessions(dataset.sessions, 'needs-review'),
      tone: 'warning',
    }),
    createMetric({
      id: 'result-ready-sessions',
      label: 'Result ready',
      value: countSessions(dataset.sessions, 'result-ready'),
      tone: 'success',
    }),
    createMetric({
      id: 'handoff-required-sessions',
      label: 'Handoff required',
      value: dataset.sessions.filter((session) => session.handoff_required).length,
      tone: 'warning',
    }),
    createMetric({
      id: 'sessions-without-visible-trace',
      label: 'Missing visible trace',
      value: sessionsWithoutVisibleTrace,
      tone: sessionsWithoutVisibleTrace > 0 ? 'warning' : 'neutral',
      description: 'Sessions without messages_path or without user-visible messages.',
    }),
    createMetric({
      id: 'user-visible-messages',
      label: 'Visible messages',
      value: userVisibleMessagesCount,
      tone: 'neutral',
    }),
    createMetric({
      id: 'redacted-events',
      label: 'Redacted events',
      value: redactedEventsCount,
      tone: redactedEventsCount > 0 ? 'warning' : 'neutral',
    }),
    createMetric({
      id: 'write-allowed-sessions',
      label: 'Write allowed',
      value: writeAllowedSessions,
      tone: writeAllowedSessions > 0 ? 'warning' : 'neutral',
    }),
    createMetric({
      id: 'read-only-sessions',
      label: 'Read only',
      value: readOnlySessions,
      tone: 'neutral',
    }),
  ];
}

export function isQuietSession(
  session: MonitorSession,
  messages: MonitorMessage[],
  now: Date = new Date(),
): boolean {
  const hasVisibleMessage = messages.some((message) => (
    message.session_id === session.session_id && isUserVisibleMessage(message)
  ));

  return !hasVisibleMessage || isSessionStale(session, now);
}

function createVisibleMessageCounts(messages: MonitorMessage[]): Map<string, number> {
  return messages.reduce((counts, message) => {
    if (!isUserVisibleMessage(message)) {
      return counts;
    }

    counts.set(message.session_id, (counts.get(message.session_id) ?? 0) + 1);

    return counts;
  }, new Map<string, number>());
}

function countSessions(
  sessions: MonitorSession[],
  status: MonitorSession['status'],
): number {
  return sessions.filter((session) => session.status === status).length;
}

function isSessionStale(session: MonitorSession, now: Date): boolean {
  const updatedAt = Date.parse(session.updated_at);

  if (!Number.isFinite(updatedAt)) {
    return false;
  }

  return now.getTime() - updatedAt > QUIET_SESSION_THRESHOLD_MS;
}

function isUserVisibleMessage(message: MonitorMessage): boolean {
  return message.visibility === undefined
    ? !isRedactedMessage(message)
    : message.visibility === 'user-visible';
}

function isRedactedMessage(message: MonitorMessage): boolean {
  return message.visibility === 'redacted'
    || /\bredacted\b/i.test(`${message.title} ${message.body}`);
}

function createMetric(metric: MetricInput): OperatorMetric {
  return {
    description: metric.description ?? metric.label,
    ...metric,
  };
}
