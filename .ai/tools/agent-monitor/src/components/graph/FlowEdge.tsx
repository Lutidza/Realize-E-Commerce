/**
 * @file .ai/tools/agent-monitor/src/components/graph/FlowEdge.tsx
 * @version 0.1.6 - 2026-05-10 16:10
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Custom React Flow edge for read-only worker-session topology.
 * It keeps semantic edge labels out of the canvas and renders a directional
 * animated flow accent from source to target.
 *
 * Changes in version 0.1.6:
 * - Added group-aware edge identity hints derived from source/target session ids.
 */
import {
  BaseEdge,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react';

export interface FlowEdgeData extends Record<string, unknown> {
  edgeKind?: 'assignment' | 'communication';
  edgeLabel?: string;
  flowActive?: boolean;
  sourceMessageId?: string | null;
  sourceMessageState?: string | null;
  sourceEventType?: string | null;
  sourceNotificationType?: string | null;
  sourceTimestamp?: string | null;
  unresolved?: boolean;
  flowReason?: 'queued' | 'delivered' | 'unresolved' | 'recent' | null;
}

type FlowEdgeProps = EdgeProps<Edge<FlowEdgeData>>;

const edgePalette = {
  assignment: {
    start: '#7c8aa6',
    middle: '#9fb2d8',
    end: '#6d78a8',
  },
  communication: {
    start: '#7e6bd6',
    middle: '#8a8eea',
    end: '#78c7d9',
  },
};

const packetOffsets = [
  '0s',
  '-0.7s',
  '-1.4s',
  '-2.1s',
];

function resolveGroupToken(sessionId: string): string | null {
  const match = sessionId.match(/^([A-Za-z]\d+)-/);
  return match ? match[1].toUpperCase() : null;
}

export function FlowEdge({
  id,
  source,
  sourceX,
  sourceY,
  sourcePosition,
  target,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  data,
}: FlowEdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const edgeKind = data?.edgeKind === 'communication'
    ? 'communication'
    : 'assignment';
  const palette = edgePalette[edgeKind];
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '-');
  const gradientId = `flow-edge-gradient-${safeId}`;
  const packetGradientId = `flow-edge-packet-gradient-${safeId}`;
  const packetCoreGradientId = `flow-edge-packet-core-gradient-${safeId}`;
  const packetGlowId = `flow-edge-packet-glow-${safeId}`;
  const motionPathId = `flow-edge-motion-path-${safeId}`;
  const duration = edgeKind === 'communication' ? '3s' : '3.4s';
  const sourceGroup = resolveGroupToken(source);
  const targetGroup = resolveGroupToken(target);
  const groupRelation = sourceGroup && targetGroup
    ? (sourceGroup === targetGroup ? 'intra' : 'cross')
    : 'unknown';
  const groupIdentity = sourceGroup && targetGroup
    ? `${sourceGroup} -> ${targetGroup}`
    : sourceGroup
      ? `${sourceGroup} -> ?`
      : targetGroup
        ? `? -> ${targetGroup}`
        : null;
  const edgeLabel = typeof data?.edgeLabel === 'string'
    ? data.edgeLabel
    : edgeKind;
  const flowActive = data?.flowActive === true;
  const edgeDetails = [
    edgeLabel,
    data?.sourceMessageId ? `message ${data.sourceMessageId}` : null,
    data?.sourceMessageState ? `state ${data.sourceMessageState}` : null,
    data?.sourceEventType ? `event ${data.sourceEventType}` : null,
    data?.sourceNotificationType ? `notification ${data.sourceNotificationType}` : null,
    data?.flowReason ? `flow ${data.flowReason}` : null,
    data?.sourceTimestamp ? `at ${data.sourceTimestamp}` : null,
    groupIdentity ? `group ${groupIdentity}` : null,
  ]
    .filter((value): value is string => value !== null)
    .join(' | ');

  return (
    <g
      className="flow-edge"
      data-edge-kind={edgeKind}
      data-flow-reason={data?.flowReason ?? 'none'}
      data-group-relation={groupRelation}
    >
      <title>{`${source} -> ${target}${edgeDetails ? ` | ${edgeDetails}` : ''}`}</title>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          x1={sourceX}
          x2={targetX}
          y1={sourceY}
          y2={targetY}
        >
          <stop offset="0%" stopColor={palette.start} stopOpacity="0" />
          <stop offset="36%" stopColor={palette.start} stopOpacity="0.3" />
          <stop offset="55%" stopColor={palette.middle} stopOpacity="0.95" />
          <stop offset="74%" stopColor={palette.end} stopOpacity="0.36" />
          <stop offset="100%" stopColor={palette.end} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={packetGradientId}>
          <stop offset="0%" stopColor={palette.middle} stopOpacity="0.95" />
          <stop offset="48%" stopColor={palette.start} stopOpacity="0.58" />
          <stop offset="100%" stopColor={palette.end} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={packetCoreGradientId} x1="0%" x2="100%" y1="50%" y2="50%">
          <stop offset="0%" stopColor={palette.start} stopOpacity="0.82" />
          <stop offset="52%" stopColor={palette.middle} stopOpacity="0.9" />
          <stop offset="100%" stopColor={palette.end} stopOpacity="0.86" />
        </linearGradient>
        <filter
          colorInterpolationFilters="sRGB"
          height="260%"
          id={packetGlowId}
          width="260%"
          x="-80%"
          y="-80%"
        >
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <path
        className="flow-edge-motion-path"
        d={edgePath}
        id={motionPathId}
      />
      <BaseEdge
        className="flow-edge-base"
        id={id}
        interactionWidth={20}
        markerEnd={markerEnd}
        path={edgePath}
      />
      {flowActive ? (
        <>
          <path className="flow-edge-trace" d={edgePath} stroke={`url(#${gradientId})`} />
          {packetOffsets.map((begin, index) => (
            <g className="flow-edge-packet" key={`${id}-packet-${index}`}>
              <animateMotion
                begin={begin}
                dur={duration}
                repeatCount="indefinite"
                rotate="auto"
              >
                <mpath href={`#${motionPathId}`} />
              </animateMotion>
              <ellipse
                className="flow-edge-packet-glow"
                fill={`url(#${packetGradientId})`}
                filter={`url(#${packetGlowId})`}
                rx="6.6"
                ry="3.9"
              />
              <ellipse
                className="flow-edge-packet-core"
                fill={`url(#${packetCoreGradientId})`}
                rx="2.9"
                ry="1.8"
              />
            </g>
          ))}
        </>
      ) : null}
    </g>
  );
}
