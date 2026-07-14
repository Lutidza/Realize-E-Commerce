/**
 * @file .ai/tools/agent-monitor/src/components/MessagesPanel.tsx
 * @version 0.2.3 - 2026-05-05 02:30
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Read-only Operator Console feed for worker-visible summaries,
 * status events, and handoffs. It intentionally excludes private reasoning,
 * raw transcripts, outbound input, target selectors, and submit controls.
 *
 * Changes in version 0.2.3:
 * - Added defensive visibility filtering and timestamp sorting for adapter
 *   provided dataset.messages.
 */
import { useMemo } from 'react';
import { MessageSquareText } from 'lucide-react';
import type { MonitorMessage, MonitorSession } from '../types/session';
import { formatDateTime } from '../utils/format';

interface MessagesPanelProps {
  messages: MonitorMessage[];
  session?: MonitorSession;
}

export function MessagesPanel({ messages, session }: MessagesPanelProps) {
  const visibleMessages = useMemo(
    () => messages
      .filter(isVisibleMessage)
      .slice()
      .sort((left, right) => right.timestamp.localeCompare(left.timestamp)),
    [messages],
  );

  return (
    <section className="panel-block messages-panel">
      <div className="section-heading">
        <MessageSquareText size={16} aria-hidden="true" />
        <span>Operator Console</span>
        <span className="feed-count">{visibleMessages.length} messages</span>
      </div>
      <div className="message-feed">
        {visibleMessages.length === 0 ? (
          <div className="empty-state">
            No worker-visible messages for {session?.session_id ?? 'selection'}.
          </div>
        ) : (
          visibleMessages.map((message) => (
            <article className="message-item" key={message.id}>
              <span className="message-agent">{message.session_id}</span>
              <span className="message-meta">
                {message.kind} - {formatDateTime(message.timestamp)}
                {message.visibility === 'redacted' && (
                  <span className="redacted-badge">redacted</span>
                )}
              </span>
              <strong>{message.title}</strong>
              <p>{message.body}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function isVisibleMessage(message: MonitorMessage): boolean {
  return message.visibility === undefined
    || message.visibility === 'user-visible'
    || message.visibility === 'redacted';
}
