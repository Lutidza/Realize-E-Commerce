/**
 * @file .ai/tools/agent-monitor/src/components/Board.tsx
 * @version 0.2.8 - 2026-05-05 12:55
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Swarm board for visualizing active worker sessions and handoffs.
 * The graph is read-only and maps adapter output into React Flow nodes/edges.
 *
 * Changes in version 0.2.8:
 * - Limited animated edge flow to active runtime transfer events.
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Background,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
  Position,
} from '@xyflow/react';
import { Network } from 'lucide-react';
import type { MonitorHandoff, MonitorSession } from '../types/session';
import { FlowEdge, type FlowEdgeData } from './graph/FlowEdge';
import { WorkerNode, type WorkerNodeData } from './graph/WorkerNode';

interface BoardProps {
  sessions: MonitorSession[];
  handoffs: MonitorHandoff[];
  selectedSessionId: string;
  onSelectSession: (sessionId: string) => void;
}

type NodeLayoutConfig = {
  columns: number;
  gapX: number;
  gapY: number;
  nodeHeight: number;
  nodeWidth: number;
};

const NODE_LAYOUT: Pick<NodeLayoutConfig, 'gapX' | 'gapY' | 'nodeHeight' | 'nodeWidth'> = {
  nodeWidth: 328,
  nodeHeight: 356,
  gapX: 36,
  gapY: 44,
};

const DEFAULT_BOARD_WIDTH = 1180;
const MIN_NODE_COLUMNS = 1;
const MAX_NODE_COLUMNS = 6;

const nodeTypes = {
  worker: WorkerNode,
};

const edgeTypes = {
  flow: FlowEdge,
};

export function Board({
  sessions,
  handoffs,
  selectedSessionId,
  onSelectSession,
}: BoardProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(DEFAULT_BOARD_WIDTH);

  useEffect(() => {
    const root = boardRef.current;
    if (!root) {
      return;
    }

    const updateBoardWidth = (width: number) => {
      const nextWidth = Math.max(width, NODE_LAYOUT.nodeWidth + NODE_LAYOUT.gapX);
      setBoardWidth(nextWidth);
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry?.contentRect?.width) {
        updateBoardWidth(entry.contentRect.width);
      }
    });

    updateBoardWidth(root.clientWidth);
    observer.observe(root);

    return () => {
      observer.disconnect();
    };
  }, []);

  const columns = useMemo<NodeLayoutConfig['columns']>(() => {
    const slotWidth = NODE_LAYOUT.nodeWidth + NODE_LAYOUT.gapX;
    const possibleColumns = Math.floor(
      (boardWidth + NODE_LAYOUT.gapX) / slotWidth,
    );

    const naturalColumns = Math.max(
      MIN_NODE_COLUMNS,
      Math.min(possibleColumns, sessions.length || 1),
    );

    return Math.min(naturalColumns, MAX_NODE_COLUMNS);
  }, [boardWidth, sessions.length]);

  const layout = useMemo<NodeLayoutConfig>(
    () => ({
      columns,
      gapX: NODE_LAYOUT.gapX,
      gapY: NODE_LAYOUT.gapY,
      nodeHeight: NODE_LAYOUT.nodeHeight,
      nodeWidth: NODE_LAYOUT.nodeWidth,
    }),
    [columns],
  );

  const nodes = useMemo(
    () => createNodes(sessions, selectedSessionId, layout),
    [sessions, selectedSessionId, layout],
  );
  const edges = useMemo(() => createEdges(handoffs), [handoffs]);

  return (
    <div className="board-wrap">
      <div className="board-toolbar">
        <div className="section-heading">
          <Network size={16} aria-hidden="true" />
          <span>Swarm Board</span>
        </div>
        <div className="board-summary">
          <span>{sessions.length} sessions</span>
          <span>{sessions.filter((session) => session.runtime_active).length} active</span>
          <span>{handoffs.length} edges</span>
        </div>
      </div>
      <div className="flow-surface" ref={boardRef}>
        {sessions.length === 0 ? (
          <div className="empty-state board-empty-state">
            The loaded registry has no active sessions.
          </div>
        ) : (
          <ReactFlow
            edges={edges}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodes={nodes}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            onNodeClick={(_, node) => onSelectSession(node.id)}
            panOnDrag
            zoomOnDoubleClick
            zoomOnPinch
            zoomOnScroll
          >
            <Background color="#2d2945" gap={22} size={1} />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}

function createNodes(
  sessions: MonitorSession[],
  selectedSessionId: string,
  layout: NodeLayoutConfig,
): Node<WorkerNodeData>[] {
  const orderedSessions = sessions;

  return orderedSessions.map((session, index) => {
    return {
      id: session.session_id,
      type: 'worker',
      position: {
        x: (index % layout.columns) * (layout.nodeWidth + layout.gapX),
        y: Math.floor(index / layout.columns) * (layout.nodeHeight + layout.gapY),
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      style: {
        width: layout.nodeWidth,
        height: layout.nodeHeight,
      },
      data: {
        ...session,
        selected: session.session_id === selectedSessionId,
      },
    };
  });
}

function createEdges(handoffs: MonitorHandoff[]): Edge<FlowEdgeData>[] {
  return handoffs.map((handoff) => ({
    id: handoff.id,
    type: 'flow',
    source: handoff.source,
    target: handoff.target,
    ariaLabel: `${handoff.label}: ${handoff.source} to ${handoff.target}`,
    data: {
      edgeKind: handoff.edge_kind,
      edgeLabel: handoff.label,
      flowActive: handoff.flow_active,
      sourceMessageId: handoff.source_message_id,
      sourceMessageState: handoff.source_message_state,
      sourceEventType: handoff.source_event_type,
      sourceNotificationType: handoff.source_notification_type,
      sourceTimestamp: handoff.source_timestamp,
      unresolved: handoff.unresolved,
      flowReason: handoff.flow_reason,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: handoff.edge_kind === 'communication' ? '#6e5ec0' : '#68738d',
    },
  }));
}
