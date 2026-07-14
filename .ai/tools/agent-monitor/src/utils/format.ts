/**
 * @file .ai/tools/agent-monitor/src/utils/format.ts
 * @version 0.1.0 - 2026-05-05 00:05
 * @docref DOC-SYSTEM-SPEC-032
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @description Formatting helpers for timestamps and compact labels in the
 * local monitor. They stay pure so adapters and panels can share the same
 * display policy without owning registry behavior.
 *
 * Changes in version 0.1.0:
 * - Added compact timestamp formatting.
 */
export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
