// src/renderer/src/components/ConfluenceSubGraph.tsx
// ============================================================================
// FLOWPINS: CONFLUENCE SUB-GRAPH FRAME
//
// Behaves like the main canvas:
//   — Drag & drop from library panel (with stopPropagation to fix duplicate bug)
//   — Ctrl+D duplicate selected inner nodes
//   — Ctrl+Z / Ctrl+Y undo/redo (scoped to inner canvas)
//   — Click to select inner nodes (surfaces to Properties panel via callback)
//   — Node value editing via Properties panel
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
  useReactFlow,
  type Edge,
  type Node,
} from 'reactflow';
// @ts-ignore
import 'reactflow/dist/style.css';

import { FPNode }                          from '../nodes/FPNode';
import { ConfluenceStore, CONFLUENCE_COLOR } from '../libraries/confluence_store';
import { NODE_LIBRARY }                    from '../libraries/index';
import { Handle, Position }                from 'reactflow';
import { pinColor }                        from '../nodes/ConfluenceNode';
import { alpha } from '../libraries/theme';

// ── Port node components ──────────────────────────────────────────────────────

function PortInputNode({ data }: any) {
  return (
    <div style={{
      background: `${alpha(CONFLUENCE_COLOR, 0.13)}`, border: `1px solid ${alpha(CONFLUENCE_COLOR, 0.53)}`,
      borderRadius: '6px', padding: '6px 12px', minWidth: '90px',
      textAlign: 'center', position: 'relative',
    }}>
      <Handle type="source" position={Position.Right} id={data.handleId}
        style={{ background: pinColor(data.pinType), width: data.pinType==='exec'?12:10, height: data.pinType==='exec'?12:10, borderRadius: data.pinType==='exec'?2:999, border: '1px solid var(--fp-surface-canvas)' }}
      />
      <div style={{ fontSize:'8px', color:CONFLUENCE_COLOR, marginBottom:'2px', letterSpacing:'1px', fontWeight:'bold' }}>INPUT</div>
      <div style={{ color:pinColor(data.pinType), fontSize:'10px' }}>{data.label}</div>
    </div>
  );
}

function PortOutputNode({ data }: any) {
  return (
    <div style={{
      background: `${alpha(CONFLUENCE_COLOR, 0.13)}`, border: `1px solid ${alpha(CONFLUENCE_COLOR, 0.53)}`,
      borderRadius: '6px', padding: '6px 12px', minWidth: '90px',
      textAlign: 'center', position: 'relative',
    }}>
      <Handle type="target" position={Position.Left} id={data.handleId}
        style={{ background: pinColor(data.pinType), width: data.pinType==='exec'?12:10, height: data.pinType==='exec'?12:10, borderRadius: data.pinType==='exec'?2:999, border: '1px solid var(--fp-surface-canvas)' }}
      />
      <div style={{ fontSize:'8px', color:CONFLUENCE_COLOR, marginBottom:'2px', letterSpacing:'1px', fontWeight:'bold' }}>OUTPUT</div>
      <div style={{ color:pinColor(data.pinType), fontSize:'10px' }}>{data.label}</div>
    </div>
  );
}

const innerNodeTypes = { fp: FPNode, port_input: PortInputNode, port_output: PortOutputNode };

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  confluenceId:       string;
  groupNodeId:        string;
  initialX?:          number;
  initialY?:          number;
  onClose:            () => void;
  /** Called when user clicks a node inside the sub-graph.
   *  App.tsx uses this to show that node in the Properties panel. */
  onInnerNodeSelect:  (node: Node | null) => void;
  /** Called when user edits a prop on a selected inner node. */
  onInnerPropChange:  (nodeId: string, key: string, value: any) => void;
  /** Called when user renames a selected inner node. */
  onInnerLabelChange: (nodeId: string, label: string) => void;
}

const FRAME_W = 700;
const FRAME_H = 480;
const MIN_W   = 400;
const MIN_H   = 300;

// ── Inner canvas — needs useReactFlow ─────────────────────────────────────────

function InnerCanvas({
  innerNodes, innerEdges, setInnerNodes, setInnerEdges,
  onInnerNodesChange, onInnerEdgesChange,
  onInnerConnect, onInnerNodeClick,
  innerPast, setInnerPast, innerFuture, setInnerFuture,
}: any) {
  const rfInstance = useReactFlow();

  // Snapshot for inner undo
  const takeInnerSnapshot = useCallback(() => {
    setInnerPast((p: any[]) => [...p, { nodes: innerNodes, edges: innerEdges }]);
    setInnerFuture([]);
  }, [innerNodes, innerEdges, setInnerPast, setInnerFuture]);

  // Drag over — must prevent default
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Drop — stopPropagation prevents the main canvas from also receiving it
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();   // ← THIS is the fix for the duplicate node bug

    const nodeKind = e.dataTransfer.getData('application/reactflow') || e.dataTransfer.getData('text/plain');
    if (!nodeKind || !rfInstance) return;

    const position = rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const spec     = NODE_LIBRARY[nodeKind];
    if (!spec) return;

    takeInnerSnapshot();
    const newNode: Node = {
      id:       `inner_${Date.now()}`,
      type:     'fp',
      position,
      data: {
        label:           spec.title || nodeKind,
        nodeKind,
        profile:         spec.profile || 'General',
        injectedInputs:  spec.inputs  || [],
        injectedOutputs: spec.outputs || [],
        props:           { ...spec.default_props },
      },
    };
    setInnerNodes((nds: Node[]) => [...nds, newNode]);
  }, [rfInstance, takeInnerSnapshot, setInnerNodes]);

  // Keyboard shortcuts scoped to inner canvas
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Stop ALL key events from reaching the main canvas — this is what
    // prevents Delete/Backspace from deleting the outer Confluence group node.
    e.stopPropagation();

    // Delete / Backspace — remove selected inner nodes and their wires
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      takeInnerSnapshot();
      const selectedNodeIds = new Set(
        innerNodes.filter((n: Node) => n.selected).map((n: Node) => n.id)
      );
      if (selectedNodeIds.size > 0) {
        setInnerNodes((nds: Node[]) => nds.filter((n: Node) => !selectedNodeIds.has(n.id)));
        setInnerEdges((eds: Edge[]) =>
          eds.filter((e: Edge) => !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target))
        );
      }
      // Also remove any selected edges even if nodes aren't selected
      setInnerEdges((eds: Edge[]) => eds.filter((e: Edge) => !e.selected));
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      // Ctrl+Z undo
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (!e.shiftKey) {
          setInnerPast((p: any[]) => {
            if (!p.length) return p;
            const prev = p[p.length - 1];
            setInnerFuture((f: any[]) => [...f, { nodes: innerNodes, edges: innerEdges }]);
            setInnerNodes(prev.nodes);
            setInnerEdges(prev.edges);
            return p.slice(0, -1);
          });
        } else {
          setInnerFuture((f: any[]) => {
            if (!f.length) return f;
            const next = f[f.length - 1];
            setInnerPast((p: any[]) => [...p, { nodes: innerNodes, edges: innerEdges }]);
            setInnerNodes(next.nodes);
            setInnerEdges(next.edges);
            return f.slice(0, -1);
          });
        }
        return;
      }
      // Ctrl+Y redo
      if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        setInnerFuture((f: any[]) => {
          if (!f.length) return f;
          const next = f[f.length - 1];
          setInnerPast((p: any[]) => [...p, { nodes: innerNodes, edges: innerEdges }]);
          setInnerNodes(next.nodes);
          setInnerEdges(next.edges);
          return f.slice(0, -1);
        });
        return;
      }
      // Ctrl+D duplicate
      if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        takeInnerSnapshot();
        const selected = innerNodes.filter((n: Node) => n.selected);
        if (selected.length > 0) {
          const idMap = new Map<string, string>();
          const newNodes = selected.map((node: Node) => {
            const newId = `inner_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            idMap.set(node.id, newId);
            return { ...node, id: newId, position: { x: node.position.x + 40, y: node.position.y + 40 }, selected: true };
          });
          const newEdges = innerEdges
            .filter((e: Edge) => idMap.has(e.source) && idMap.has(e.target))
            .map((e: Edge) => ({
              ...e,
              id: `inner_edge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              source: idMap.get(e.source)!,
              target: idMap.get(e.target)!,
            }));
          setInnerNodes((nds: Node[]) => [...nds.map((n: Node) => ({ ...n, selected: false })), ...newNodes]);
          setInnerEdges((eds: Edge[]) => [...eds.map((e: Edge) => ({ ...e, selected: false })), ...newEdges]);
        }
        return;
      }
    }
  }, [innerNodes, innerEdges, takeInnerSnapshot, setInnerNodes, setInnerEdges, setInnerPast, setInnerFuture]);

  return (
    <div style={{ width: '100%', height: '100%' }} onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={innerNodes}
        edges={innerEdges}
        nodeTypes={innerNodeTypes}
        onNodesChange={onInnerNodesChange}
        onEdgesChange={onInnerEdgesChange}
        onConnect={onInnerConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_e, node) => onInnerNodeClick(node)}
        onPaneClick={() => onInnerNodeClick(null)}
        onNodesDelete={() => takeInnerSnapshot()}
        onEdgesDelete={() => takeInnerSnapshot()}
        onNodeDragStart={() => takeInnerSnapshot()}
        fitView
        snapToGrid
        style={{ background: 'var(--fp-surface-canvas)' }}
        deleteKeyCode={null}   // handled manually in onKeyDown to prevent outer canvas deletion
      >
        <Background variant={BackgroundVariant.Dots} gap={16} color="var(--fp-surface-raised)" />
        <Controls />
      </ReactFlow>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ConfluenceSubGraph = ({
  confluenceId, groupNodeId,
  initialX = 120, initialY = 80,
  onClose, onInnerNodeSelect,
  onInnerPropChange, onInnerLabelChange,
}: Props) => {

  const cn = ConfluenceStore.getAll().find(n => n.id === confluenceId);

  // ── Frame drag / resize ───────────────────────────────────────────────────
  const [pos,  setPos]  = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ w: FRAME_W, h: FRAME_H });
  const dragging    = useRef(false);
  const dragOffset  = useRef({ x: 0, y: 0 });
  const resizing    = useRef(false);
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, w: FRAME_W, h: FRAME_H });

  const onTitleMouseDown = (e: React.MouseEvent) => {
    dragging.current   = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) setPos({ x: Math.max(0, e.clientX - dragOffset.current.x), y: Math.max(0, e.clientY - dragOffset.current.y) });
      if (resizing.current) setSize({ w: Math.max(MIN_W, resizeStart.current.w + e.clientX - resizeStart.current.mouseX), h: Math.max(MIN_H, resizeStart.current.h + e.clientY - resizeStart.current.mouseY) });
    };
    const onUp = () => { dragging.current = false; resizing.current = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, []);

  // ── Inner graph state ─────────────────────────────────────────────────────
  const buildInitialNodes = useCallback((): Node[] => {
    if (!cn) return [];
    const innerNodes: Node[] = cn.nodes.map((n: any) => ({ ...n, type: n.type || 'fp' }));
    const inputPorts: Node[] = (cn.inputPins || []).map((pin: any, i: number) => ({
      id: `port_in_${i}`, type: 'port_input', position: { x: -180, y: 60 + i * 80 },
      data: { label: pin.name, pinType: pin.pinType, handleId: pin.handleId }, draggable: true,
    }));
    const outputPorts: Node[] = (cn.outputPins || []).map((pin: any, i: number) => ({
      id: `port_out_${i}`, type: 'port_output', position: { x: 520, y: 60 + i * 80 },
      data: { label: pin.name, pinType: pin.pinType, handleId: pin.handleId }, draggable: true,
    }));
    return [...inputPorts, ...innerNodes, ...outputPorts];
  }, [cn]);

  const [innerNodes, setInnerNodes, onInnerNodesChange] = useNodesState(buildInitialNodes());
  const [innerEdges, setInnerEdges, onInnerEdgesChange] = useEdgesState(cn?.wires || cn?.edges || []);

  // ── Inner undo/redo stacks ────────────────────────────────────────────────
  const [innerPast,   setInnerPast]   = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [innerFuture, setInnerFuture] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  // ── Auto-save ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cn) return;
    const realNodes = innerNodes.filter(n => n.type === 'fp');
    const realEdges = innerEdges.filter(e => !e.source.startsWith('port_') && !e.target.startsWith('port_'));
    ConfluenceStore.save({ ...cn, nodes: realNodes, wires: realEdges });
  }, [innerNodes, innerEdges]);

  const onInnerConnect = useCallback((params: any) => {
    setInnerEdges(eds => addEdge({ ...params, type: 'default', style: { stroke: CONFLUENCE_COLOR, strokeWidth: 2 } }, eds));
  }, [setInnerEdges]);

  // ── Inner node selection — prop editing ───────────────────────────────────
  const handleInnerNodeClick = useCallback((node: Node | null) => {
    onInnerNodeSelect(node);
  }, [onInnerNodeSelect]);

  // ── Sync prop changes from Properties panel back to inner nodes ───────────
  // App.tsx calls onInnerPropChange which triggers this via the callback.
  // We expose a ref so App.tsx can call updateInnerNode directly.
  const updateInnerNodeProp = useCallback((nodeId: string, key: string, value: any) => {
    setInnerNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, props: { ...n.data.props, [key]: value } } } : n
    ));
  }, [setInnerNodes]);

  const updateInnerNodeLabel = useCallback((nodeId: string, label: string) => {
    setInnerNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
    ));
  }, [setInnerNodes]);

  // Expose update functions via a ref so App.tsx can call them
  const updateRef = useRef({ updateInnerNodeProp, updateInnerNodeLabel });
  updateRef.current = { updateInnerNodeProp, updateInnerNodeLabel };

  // Store the ref on the window so App.tsx can access it by groupNodeId
  useEffect(() => {
    (window as any).__fpInnerCanvas = (window as any).__fpInnerCanvas || {};
    (window as any).__fpInnerCanvas[groupNodeId] = updateRef.current;
    return () => { delete (window as any).__fpInnerCanvas?.[groupNodeId]; };
  }, [groupNodeId]);

  if (!cn) {
    return (
      <div style={{ position:'fixed', left:pos.x, top:pos.y, width:FRAME_W, height:120, background:'var(--fp-surface-sunken)', border:`2px solid ${CONFLUENCE_COLOR}`, borderRadius:'10px', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--fp-text-faint)', fontSize:'12px' }}>
        Confluence node not found.
      </div>
    );
  }

  const inputPins  = cn.inputPins  || [];
  const outputPins = cn.outputPins || [];

  return (
    <div style={{
      position:'fixed', left:pos.x, top:pos.y, width:size.w, height:size.h, zIndex:2000,
      display:'flex', flexDirection:'column', borderRadius:'10px', overflow:'hidden',
      outline:`3px solid ${alpha(CONFLUENCE_COLOR, 0.13)}`, outlineOffset:'2px',
      border:`2px solid ${CONFLUENCE_COLOR}`,
      boxShadow:`0 24px 60px rgba(0,0,0,0.8), 0 0 30px ${alpha(CONFLUENCE_COLOR, 0.13)}`,
    }}>

      {/* ── TITLE BAR ─────────────────────────────────────────────────────── */}
      <div onMouseDown={onTitleMouseDown} style={{ background:`linear-gradient(90deg, var(--fp-surface-sunken) 0%, ${alpha(CONFLUENCE_COLOR, 0.09)} 100%)`, borderBottom:`1px solid ${alpha(CONFLUENCE_COLOR, 0.27)}`, padding:'8px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'grab', flexShrink:0, userSelect:'none' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ color:CONFLUENCE_COLOR, fontSize:'12px' }}>◆</span>
          <span style={{ color:'var(--fp-text-primary)', fontSize:'12px', fontWeight:'bold' }}>{cn.title}</span>
          <span style={{ color:CONFLUENCE_COLOR, fontSize:'8px', fontWeight:'bold', letterSpacing:'1.5px', background:`${alpha(CONFLUENCE_COLOR, 0.13)}`, border:`1px solid ${alpha(CONFLUENCE_COLOR, 0.27)}`, borderRadius:'3px', padding:'1px 5px' }}>CONFLUENCE</span>
          {cn.category && <span style={{ color:'var(--fp-border-strong)', fontSize:'9px' }}>{cn.category}</span>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ color:'var(--fp-border-default)', fontSize:'9px' }}>{cn.nodes.length} nodes · {(cn.wires || cn.edges || []).length} wires</span>
          <div onClick={onClose} style={{ color:'var(--fp-text-faint)', fontSize:'14px', cursor:'pointer', padding:'2px 6px', borderRadius:'3px', transition:'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='var(--fp-state-danger)'; (e.currentTarget as HTMLElement).style.background='rgba(204, 68, 68, 0.13)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='var(--fp-text-faint)'; (e.currentTarget as HTMLElement).style.background='transparent'; }}
          >✕</div>
        </div>
      </div>

      {/* ── PIN LEGEND ────────────────────────────────────────────────────── */}
      {(inputPins.length > 0 || outputPins.length > 0) && (
        <div style={{ background:'var(--fp-surface-canvas)', borderBottom:`1px solid ${alpha(CONFLUENCE_COLOR, 0.13)}`, padding:'4px 14px', display:'flex', gap:'16px', flexShrink:0, flexWrap:'wrap' }}>
          {inputPins.map((p: any, i: number) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
              <span style={{ color:CONFLUENCE_COLOR, fontSize:'8px' }}>→</span>
              <span style={{ color:'var(--fp-text-faint)', fontSize:'8px' }}>IN: {p.name}</span>
            </div>
          ))}
          {outputPins.map((p: any, i: number) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
              <span style={{ color:CONFLUENCE_COLOR, fontSize:'8px' }}>←</span>
              <span style={{ color:'var(--fp-text-faint)', fontSize:'8px' }}>OUT: {p.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── INNER CANVAS ──────────────────────────────────────────────────── */}
      <div style={{ flex:1, background:'var(--fp-surface-canvas)' }}>
        <ReactFlowProvider>
          <InnerCanvas
            innerNodes={innerNodes}
            innerEdges={innerEdges}
            setInnerNodes={setInnerNodes}
            setInnerEdges={setInnerEdges}
            onInnerNodesChange={onInnerNodesChange}
            onInnerEdgesChange={onInnerEdgesChange}
            onInnerConnect={onInnerConnect}
            onInnerNodeClick={handleInnerNodeClick}
            innerPast={innerPast}
            setInnerPast={setInnerPast}
            innerFuture={innerFuture}
            setInnerFuture={setInnerFuture}
          />
        </ReactFlowProvider>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <div style={{ background:'var(--fp-surface-canvas)', borderTop:`1px solid ${alpha(CONFLUENCE_COLOR, 0.13)}`, padding:'5px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, position:'relative' }}>
        <span style={{ color:'var(--fp-surface-overlay)', fontSize:'8px', letterSpacing:'0.5px' }}>
          Ctrl+D duplicate  ·  Ctrl+Z undo  ·  Drag title to move  ·  Drag ◢ to resize
        </span>
        <div onClick={onClose} style={{ color:CONFLUENCE_COLOR, fontSize:'9px', fontWeight:'bold', letterSpacing:'1px', cursor:'pointer', padding:'2px 8px', border:`1px solid ${alpha(CONFLUENCE_COLOR, 0.27)}`, borderRadius:'3px', transition:'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background=`${alpha(CONFLUENCE_COLOR, 0.13)}`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; }}
        >CLOSE</div>
        <div onMouseDown={e => { e.preventDefault(); resizing.current=true; resizeStart.current={ mouseX:e.clientX, mouseY:e.clientY, w:size.w, h:size.h }; document.body.style.cursor='nwse-resize'; document.body.style.userSelect='none'; }}
          style={{ position:'absolute', bottom:0, right:0, width:18, height:18, cursor:'nwse-resize', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', padding:'2px' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M12 0 L12 12 L0 12 Z" fill={CONFLUENCE_COLOR} opacity="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};
