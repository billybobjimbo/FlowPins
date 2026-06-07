// src/renderer/src/components/ConfluenceSubGraph.tsx
// ============================================================================
// FLOWPINS: CONFLUENCE SUB-GRAPH FRAME
// A floating, draggable panel containing a nested ReactFlow canvas.
// Opens when the user double-clicks a Confluence group node on the main canvas.
//
// Architecture:
//   — The main canvas is untouched while this frame is open
//   — The inner graph is fully editable; changes save back to ConfluenceStore
//   — Input/Output port nodes at the frame edges show boundary connections
//   — Close button dismisses the frame; the group node remains on main canvas
//   — Frame is draggable via the title bar
// ============================================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from 'reactflow';
// @ts-ignore
import 'reactflow/dist/style.css';

import { FPNode } from '../nodes/FPNode';
import { ConfluenceStore, CONFLUENCE_COLOR } from '../libraries/confluence_store';

// ── Node types for the inner canvas ──────────────────────────────────────────
// The inner canvas uses FPNode for regular nodes, plus two special port nodes.
const PortInputNode  = ({ data }: any) => <PortNode data={data} side="input"  />;
const PortOutputNode = ({ data }: any) => <PortNode data={data} side="output" />;

const innerNodeTypes = {
  fp:          FPNode,
  port_input:  PortInputNode,
  port_output: PortOutputNode,
};

// ── Port node visual ──────────────────────────────────────────────────────────
import { Handle, Position } from 'reactflow';

function PortNode({ data, side }: { data: any; side: 'input' | 'output' }) {
  const isInput = side === 'input';
  return (
    <div style={{
      background:   `${CONFLUENCE_COLOR}22`,
      border:       `1px solid ${CONFLUENCE_COLOR}88`,
      borderRadius: '6px',
      padding:      '6px 12px',
      fontSize:     '10px',
      color:        CONFLUENCE_COLOR,
      fontWeight:   'bold',
      letterSpacing: '1px',
      minWidth:     '80px',
      textAlign:    'center',
      position:     'relative',
    }}>
      {isInput ? (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: CONFLUENCE_COLOR, width: 10, height: 10 }}
        />
      ) : (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: CONFLUENCE_COLOR, width: 10, height: 10 }}
        />
      )}
      <div style={{ fontSize: '8px', color: '#536878', marginBottom: '2px', letterSpacing: '1px' }}>
        {isInput ? 'INPUT' : 'OUTPUT'}
      </div>
      <div style={{ color: '#aaaaaa', fontSize: '10px' }}>{data.label}</div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  confluenceId:  string;        // Which Confluence node to display
  groupNodeId:   string;        // The canvas node ID (for title display)
  initialX?:     number;        // Initial frame position
  initialY?:     number;
  onClose:       () => void;    // Called when user closes the frame
}

// ── Frame dimensions ──────────────────────────────────────────────────────────
const FRAME_W = 700;
const FRAME_H = 480;
const MIN_W   = 400;
const MIN_H   = 300;

// ============================================================================
// COMPONENT
// ============================================================================

export const ConfluenceSubGraph = ({ confluenceId, groupNodeId, initialX = 120, initialY = 80, onClose }: Props) => {

  const cn = ConfluenceStore.getAll().find(n => n.id === confluenceId);

  // ── Frame drag state ──────────────────────────────────────────────────────
  const [pos,  setPos]  = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ w: FRAME_W, h: FRAME_H });
  const dragging      = useRef(false);
  const dragOffset    = useRef({ x: 0, y: 0 });
  const resizing      = useRef(false);
  const resizeStart   = useRef({ mouseX: 0, mouseY: 0, w: FRAME_W, h: FRAME_H });

  const onTitleMouseDown = (e: React.MouseEvent) => {
    dragging.current  = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) {
        setPos({
          x: Math.max(0, e.clientX - dragOffset.current.x),
          y: Math.max(0, e.clientY - dragOffset.current.y),
        });
      }
      if (resizing.current) {
        const newW = Math.max(MIN_W, resizeStart.current.w + (e.clientX - resizeStart.current.mouseX));
        const newH = Math.max(MIN_H, resizeStart.current.h + (e.clientY - resizeStart.current.mouseY));
        setSize({ w: newW, h: newH });
      }
    };
    const onUp = () => {
      dragging.current = false;
      resizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',  onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',  onUp);
    };
  }, []);

  // ── Inner graph state ─────────────────────────────────────────────────────
  // Build initial nodes: port nodes for boundaries + the stored inner nodes
  const buildInitialNodes = useCallback((): Node[] => {
    if (!cn) return [];

    const innerNodes: Node[] = cn.nodes.map((n: any) => ({
      ...n,
      type: n.type || 'fp',
    }));

    // Add INPUT port nodes (left side) for each input boundary
    const inputPorts: Node[] = (cn.inputBoundaries || []).map((b: any, i: number) => ({
      id:       `port_in_${i}`,
      type:     'port_input',
      position: { x: -160, y: 80 + i * 80 },
      data:     { label: b.pinName, boundaryIndex: i },
      draggable: true,
    }));

    // Add OUTPUT port nodes (right side) for each output boundary
    const outputPorts: Node[] = (cn.outputBoundaries || []).map((b: any, i: number) => ({
      id:       `port_out_${i}`,
      type:     'port_output',
      position: { x: 500, y: 80 + i * 80 },
      data:     { label: b.pinName, boundaryIndex: i },
      draggable: true,
    }));

    return [...inputPorts, ...innerNodes, ...outputPorts];
  }, [cn]);

  const [innerNodes, setInnerNodes, onInnerNodesChange] = useNodesState(buildInitialNodes());
  const [innerEdges, setInnerEdges, onInnerEdgesChange] = useEdgesState(cn?.wires || cn?.edges || []);

  // ── Save inner graph back to store on every change ────────────────────────
  useEffect(() => {
    if (!cn) return;
    // Strip port nodes before saving — only save the real inner nodes
    const realNodes = innerNodes.filter(n => n.type === 'fp');
    const realEdges = innerEdges.filter(e => {
      const srcIsPort = e.source.startsWith('port_');
      const tgtIsPort = e.target.startsWith('port_');
      return !srcIsPort && !tgtIsPort;
    });
    ConfluenceStore.save({ ...cn, nodes: realNodes, wires: realEdges });
  }, [innerNodes, innerEdges]);

  const onInnerConnect = useCallback((params: any) => {
    setInnerEdges(eds => addEdge({ ...params, type: 'default', style: { stroke: CONFLUENCE_COLOR, strokeWidth: 2 } }, eds));
  }, [setInnerEdges]);

  if (!cn) {
    return (
      <div style={{
        position: 'fixed', left: pos.x, top: pos.y,
        width: FRAME_W, height: 120,
        background: '#0d0d0d', border: `2px solid ${CONFLUENCE_COLOR}`,
        borderRadius: '10px', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#555', fontSize: '12px'
      }}>
        Confluence node not found.
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      style={{
        position:     'fixed',
        left:         pos.x,
        top:          pos.y,
        width:        size.w,
        height:       size.h,
        zIndex:       2000,
        display:      'flex',
        flexDirection:'column',
        borderRadius: '10px',
        overflow:     'hidden',
        // Double border effect matching ConfluenceNode
        outline:      `3px solid ${CONFLUENCE_COLOR}22`,
        outlineOffset:'2px',
        border:       `2px solid ${CONFLUENCE_COLOR}`,
        boxShadow:    `0 24px 60px rgba(0,0,0,0.8), 0 0 30px ${CONFLUENCE_COLOR}22`,
      }}
    >
      {/* ── TITLE BAR (drag handle) ─────────────────────────────────────── */}
      <div
        onMouseDown={onTitleMouseDown}
        style={{
          background:    `linear-gradient(90deg, #0d0d0d 0%, ${CONFLUENCE_COLOR}18 100%)`,
          borderBottom:  `1px solid ${CONFLUENCE_COLOR}44`,
          padding:       '8px 14px',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'space-between',
          cursor:        'grab',
          flexShrink:    0,
          userSelect:    'none',
        }}
      >
        {/* Left: identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: CONFLUENCE_COLOR, fontSize: '12px' }}>◆</span>
          <span style={{ color: '#cccccc', fontSize: '12px', fontWeight: 'bold' }}>
            {cn.title}
          </span>
          <span style={{
            color:         CONFLUENCE_COLOR,
            fontSize:      '8px',
            fontWeight:    'bold',
            letterSpacing: '1.5px',
            background:    `${CONFLUENCE_COLOR}22`,
            border:        `1px solid ${CONFLUENCE_COLOR}44`,
            borderRadius:  '3px',
            padding:       '1px 5px',
          }}>
            CONFLUENCE
          </span>
          {cn.category && (
            <span style={{ color: '#444', fontSize: '9px' }}>
              {cn.category}
            </span>
          )}
        </div>

        {/* Right: stats + close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#333', fontSize: '9px' }}>
            {cn.nodes.length} nodes · {(cn.wires || cn.edges || []).length} wires
          </span>
          <div
            onClick={onClose}
            style={{
              color:        '#555',
              fontSize:     '14px',
              cursor:       'pointer',
              lineHeight:   1,
              padding:      '2px 6px',
              borderRadius: '3px',
              transition:   'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#cc4444'; (e.currentTarget as HTMLElement).style.background = '#cc444422'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#555';    (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            ✕
          </div>
        </div>
      </div>

      {/* ── BOUNDARY LEGEND ─────────────────────────────────────────────── */}
      {((cn.inputBoundaries && cn.inputBoundaries.length > 0) ||
        (cn.outputBoundaries && cn.outputBoundaries.length > 0)) && (
        <div style={{
          background:   '#080808',
          borderBottom: `1px solid ${CONFLUENCE_COLOR}22`,
          padding:      '4px 14px',
          display:      'flex',
          gap:          '16px',
          flexShrink:   0,
        }}>
          {(cn.inputBoundaries || []).map((b: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: CONFLUENCE_COLOR, fontSize: '8px' }}>→</span>
              <span style={{ color: '#555', fontSize: '8px' }}>IN: {b.pinName}</span>
            </div>
          ))}
          {(cn.outputBoundaries || []).map((b: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: CONFLUENCE_COLOR, fontSize: '8px' }}>←</span>
              <span style={{ color: '#555', fontSize: '8px' }}>OUT: {b.pinName}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── INNER CANVAS ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, background: '#060606' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={innerNodes}
            edges={innerEdges}
            nodeTypes={innerNodeTypes}
            onNodesChange={onInnerNodesChange}
            onEdgesChange={onInnerEdgesChange}
            onConnect={onInnerConnect}
            fitView
            snapToGrid
            style={{ background: '#060606' }}
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} color="#1a1a1a" />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <div style={{
        background:   '#080808',
        borderTop:    `1px solid ${CONFLUENCE_COLOR}22`,
        padding:      '5px 14px',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
        flexShrink:   0,
        position:     'relative',
      }}>
        <span style={{ color: '#2a2a2a', fontSize: '8px', letterSpacing: '0.5px' }}>
          Changes save automatically  ·  Drag title to move  ·  Drag ◢ to resize
        </span>
        <div
          onClick={onClose}
          style={{
            color:        CONFLUENCE_COLOR,
            fontSize:     '9px',
            fontWeight:   'bold',
            letterSpacing:'1px',
            cursor:       'pointer',
            padding:      '2px 8px',
            border:       `1px solid ${CONFLUENCE_COLOR}44`,
            borderRadius: '3px',
            transition:   'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${CONFLUENCE_COLOR}22`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          CLOSE
        </div>

        {/* ── RESIZE HANDLE (bottom-right triangle) ───────────────────── */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            resizing.current    = true;
            resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, w: size.w, h: size.h };
            document.body.style.cursor     = 'nwse-resize';
            document.body.style.userSelect = 'none';
          }}
          title="Drag to resize"
          style={{
            position:  'absolute',
            bottom:    0,
            right:     0,
            width:     18,
            height:    18,
            cursor:    'nwse-resize',
            display:   'flex',
            alignItems:'flex-end',
            justifyContent: 'flex-end',
            padding:   '2px',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M12 0 L12 12 L0 12 Z" fill={CONFLUENCE_COLOR} opacity="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};
