// src/renderer/src/App.tsx
// ============================================================================
// FLOWPINS: MAIN APPLICATION COMPONENT
// ============================================================================

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { EvelynLibrarian } from './libraries/evelyn';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  SelectionMode,
  type Edge,
  type Node,
} from "reactflow";
// @ts-ignore
import "reactflow/dist/style.css";

import { FPNode }                    from "./nodes/FPNode";
import { ConfluenceNode }            from "./nodes/ConfluenceNode";
import { ConfluenceSubGraph }        from "./components/ConfluenceSubGraph";
import { ConfluenceSaveDialog }      from "./components/ConfluenceLibrary";
import PromptBar                     from './components/PromptBar';
import { LibraryPanel }              from "./components/LibraryPanel";
import { RightPanel }                from "./components/RightPanel";
import { type FPNodeData }           from "./components/NodeInspector";
import { ConfluenceStore, scanPinsFromNodes } from "./libraries/confluence_store";
import { CONFLUENCE_DRAG_KEY }       from "./components/ConfluenceLibrary";
import { NODE_LIBRARY }              from './libraries/index';
import { generateCodeBlocks, type CompileMode, ALL_MODES } from './libraries/compiler';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        on: (channel: string, func: (...args: any[]) => void) => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        removeAllListeners: (channel: string) => void;
      };
    };
  }
}

const nodeTypes = { fp: FPNode, confluence: ConfluenceNode };

function resolveEdgeColor(sourceNode: Node | undefined, sourceHandle: string): string {
  if (!sourceNode) return "#888888";
  const spec = NODE_LIBRARY[sourceNode.data.nodeKind];
  if (!spec) return "#888888";
  const outPin = spec.outputs?.find((o: any) => o.name === sourceHandle);
  if (!outPin) return "#888888";
  if (outPin.pin_type === 'exec')   return "#ffffff";
  if (outPin.pin_type === 'string') return "#ff007f";
  if (outPin.pin_type === 'int')    return "#00e5ff";
  if (outPin.pin_type === 'float')  return "#00e5ff";
  if (outPin.pin_type === 'bool')   return "#ff2a2a";
  if (outPin.pin_type === 'list')   return "#00d8ff";
  if (outPin.pin_type === 'any')    return "#826cf3";
  return "#888888";
}

function getActiveAppProfile(mode: string): string {
  if (mode === 'gml_standard') return 'game maker';
  if (mode === 'js_toonboom')  return 'toon boom';
  if (mode === 'py_maya')      return 'maya';
  if (mode === 'lua_fusion')   return 'fusion';
  if (mode === 'cs_csharp')    return 'unity';
  if (mode === 'py_houdini')   return 'houdini';
  if (mode === 'py_standard')  return 'python';
  return '';
}

type SubGraphFrame = { confluenceId: string; groupNodeId: string; x: number; y: number; };

// =============================================================================
export default function App() {

  const EXPIRY_DATE = new Date('2026-12-31T00:00:00');
  if (new Date() > EXPIRY_DATE) {
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'#050505', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'sans-serif' }}>
        <h1 style={{ color:'#ff4444', marginBottom:'10px' }}>Alpha Build Expired</h1>
        <p style={{ color:'#aaa' }}>Please contact Alistair for the latest build.</p>
      </div>
    );
  }

  const [sidebarWidth,       setSidebarWidth]       = useState(320);
  const [selectedNodeId,     setSelectedNodeId]     = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange]            = useNodesState<FPNodeData>([]);
  const [edges, setEdges, onEdgesChange]            = useEdgesState<Edge[]>([]);
  const [reactFlowInstance,  setReactFlowInstance]  = useState<any>(null);
  const [activeMode,         setActiveMode]         = useState<CompileMode>('gml_standard');
  const [isAILoading,        setIsAILoading]        = useState(false);
  const [evelynMessage,      setEvelynMessage]      = useState<string | null>(null);
  const [spawnMenu,          setSpawnMenu]          = useState<{ show: boolean, x: number, y: number, flowX: number, flowY: number } | null>(null);
  const [menuSearch,         setMenuSearch]         = useState("");
  const [menuSelectedIndex,  setMenuSelectedIndex]  = useState(0);
  const [subGraphFrame,      setSubGraphFrame]      = useState<SubGraphFrame | null>(null);

  // ── Inner canvas selection — surfaces to Properties panel ────────────────
  const [selectedInnerNode,  setSelectedInnerNode]  = useState<any>(null);

  // Clear inner selection when sub-graph closes
  const handleCloseSubGraph = useCallback(() => {
    setSubGraphFrame(null);
    setSelectedInnerNode(null);
  }, []);

  // ── Ctrl+G group dialog state ─────────────────────────────────────────────
  const [showGroupDialog, setShowGroupDialog] = useState(false);

  // --- Animated wires ---
  useEffect(() => {
    setEdges(eds => eds.map(edge => ({
      ...edge,
      animated: selectedNodeId !== null && (edge.source === selectedNodeId || edge.target === selectedNodeId),
    })));
  }, [selectedNodeId, setEdges]);

  // --- Evelyn ---
  const handleAIPrompt = async (prompt: string) => {
    setIsAILoading(true);
    setTimeout(() => {
      const parsedRequest = EvelynLibrarian.parsePrompt(prompt);
      const blueprint     = EvelynLibrarian.buildGraph(parsedRequest);
      if (blueprint) {
        if (blueprint.nodes.length === 0) {
          setEvelynMessage(blueprint.message);
          setTimeout(() => setEvelynMessage(null), 6000);
          setIsAILoading(false);
          return;
        }
        const stamp = Date.now();
        const generatedNodes: Node<FPNodeData>[] = blueprint.nodes.map((n: any) => {
          const spec = NODE_LIBRARY[n.nodeKind];
          return {
            id: `${n.id}_${stamp}`, type: 'fp', position: { x: n.x, y: n.y },
            data: {
              label: spec?.title || n.nodeKind, nodeKind: n.nodeKind,
              profile: spec?.profile || 'General',
              injectedInputs: spec?.inputs || [], injectedOutputs: spec?.outputs || [],
              props: { ...spec?.default_props, ...n.props }
            }
          };
        });
        const generatedEdges: Edge[] = blueprint.edges.map((e: any) => {
          const sn    = generatedNodes.find((n: any) => n.id === `${e.source}_${stamp}`);
          const color = resolveEdgeColor(sn, e.sourceHandle);
          return {
            id: `e_${e.source}_${e.target}_${stamp}`,
            source: `${e.source}_${stamp}`, target: `${e.target}_${stamp}`,
            sourceHandle: e.sourceHandle, targetHandle: e.targetHandle,
            type: 'default', animated: false, style: { stroke: color, strokeWidth: 2 }
          };
        });
        setNodes(nds => [...nds, ...generatedNodes]);
        setEdges(eds => [...eds, ...generatedEdges]);
        setEvelynMessage(blueprint.message);
        setTimeout(() => setEvelynMessage(null), 6000);
      } else {
        setEvelynMessage("I couldn't find anything for that. Try asking for a loop, a branch, or a function.");
        setTimeout(() => setEvelynMessage(null), 6000);
      }
      setIsAILoading(false);
    }, 800);
  };

  // --- Undo / Redo ---
  const [past,   setPast]   = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const takeSnapshot = useCallback(() => {
    setPast(p => [...p, { nodes, edges }]);
    setFuture([]);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (!past.length) return;
    const prev = past[past.length - 1];
    setFuture(f => [...f, { nodes, edges }]);
    setNodes(prev.nodes); setEdges(prev.edges);
    setPast(p => p.slice(0, -1));
  }, [past, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (!future.length) return;
    const next = future[future.length - 1];
    setPast(p => [...p, { nodes, edges }]);
    setNodes(next.nodes); setEdges(next.edges);
    setFuture(f => f.slice(0, -1));
  }, [future, nodes, edges, setNodes, setEdges]);

  // --- Drag & drop ---
  const onDragOver = useCallback((e: any) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  const handleDropSpawn = (nodeKind: string, position: { x: number; y: number }) => {
    takeSnapshot();
    const spec = NODE_LIBRARY[nodeKind];
    const newNode: Node<any> = {
      id: `node_${Date.now()}`, type: 'fp', position,
      data: {
        label: spec?.title || nodeKind, nodeKind,
        profile: spec?.profile || 'General',
        injectedInputs: spec?.inputs || [], injectedOutputs: spec?.outputs || [],
        props: { ...spec?.default_props }
      },
    };
    setNodes(nds => nds.concat(newNode));
  };

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const confluenceId = event.dataTransfer.getData(CONFLUENCE_DRAG_KEY);
    if (confluenceId && reactFlowInstance) {
      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const cn       = ConfluenceStore.getAll().find(n => n.id === confluenceId);
      if (cn) {
        takeSnapshot();
        const newNode: Node<any> = {
          id: `conf_${Date.now()}`, type: 'confluence', position,
          data: {
            label: cn.title, confluenceId: cn.id,
            description: cn.description, category: cn.category,
            innerNodeCount: cn.nodes.length,
            innerWireCount: (cn.wires || cn.edges || []).length,
            nodeKind: 'confluence',
            inputPins:  cn.inputPins  || [],
            outputPins: cn.outputPins || [],
          },
        };
        setNodes(nds => [...nds, newNode]);
      }
      return;
    }
    const nodeKind = event.dataTransfer.getData('application/reactflow') || event.dataTransfer.getData('text/plain');
    if (!nodeKind || !reactFlowInstance) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    handleDropSpawn(nodeKind, position);
  }, [reactFlowInstance, setNodes, takeSnapshot]);

  // --- Double-click: open sub-graph frame ---
  const onNodeDoubleClick = useCallback((_e: React.MouseEvent, node: Node) => {
    if (node.type !== 'confluence') return;
    setSubGraphFrame({ confluenceId: node.data.confluenceId, groupNodeId: node.id, x: 160, y: 80 });
  }, []);

  const closeSubGraph = handleCloseSubGraph;

  // ── Ctrl+G: group selected nodes ─────────────────────────────────────────
  // Shows the styled save dialog as a centred overlay. On save, creates a
  // Confluence node from the selection and removes the original nodes.
  const handleGroupSave = useCallback((title: string, category: string, description: string) => {
    const selected = nodes.filter(n => n.selected);
    if (selected.length === 0) return;

    takeSnapshot();

    const { inputPins, outputPins } = scanPinsFromNodes(selected, NODE_LIBRARY);
    ConfluenceStore.createFromSelection(title, category, description, selected, edges, inputPins, outputPins);

    // Find the centre of the selection to place the group node
    const xs     = selected.map(n => n.position.x);
    const ys     = selected.map(n => n.position.y);
    const cx     = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy     = (Math.min(...ys) + Math.max(...ys)) / 2;
    const cn     = ConfluenceStore.getAll().find(n => n.title === title);

    const selectedIds = new Set(selected.map(n => n.id));

    // Replace selected nodes with the group node
    const groupNode: Node<any> = {
      id:       `conf_${Date.now()}`,
      type:     'confluence',
      position: { x: cx, y: cy },
      data: {
        label:          title,
        confluenceId:   cn?.id || '',
        description,
        category,
        innerNodeCount: selected.length,
        innerWireCount: edges.filter(e => selectedIds.has(e.source) && selectedIds.has(e.target)).length,
        nodeKind:       'confluence',
        inputPins,
        outputPins,
      },
    };

    setNodes(nds => [...nds.filter(n => !selectedIds.has(n.id)), groupNode]);
    setEdges(eds => eds.filter(e => !selectedIds.has(e.source) && !selectedIds.has(e.target)));
    setShowGroupDialog(false);
  }, [nodes, edges, takeSnapshot, setNodes, setEdges]);

  // --- Code generation ---
  const codeBlocks = useMemo(() => generateCodeBlocks(nodes, edges, activeMode), [nodes, edges, activeMode]);

  // --- Context menu ---
  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    if (!reactFlowInstance) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setSpawnMenu({ show: true, x: event.clientX, y: event.clientY, flowX: position.x, flowY: position.y });
    setMenuSearch(""); setMenuSelectedIndex(0);
  }, [reactFlowInstance]);

  const closeMenu = () => setSpawnMenu(null);

  const filteredMenuNodes = Object.entries(NODE_LIBRARY).filter(([_, spec]: [string, any]) => {
    const c = (spec.profile || "").toLowerCase();
    return (c.startsWith('core') || (c.startsWith('app -') && c.includes(getActiveAppProfile(activeMode))) || c.startsWith('pipeline'))
      && spec.title.toLowerCase().includes(menuSearch.toLowerCase());
  });

  // --- File I/O ---
  useEffect(() => {
    const handler = (_e: any, content: string) => {
      try {
        const d = JSON.parse(content);
        if (d.nodes && d.edges) { setNodes(d.nodes); setEdges(d.edges); setPast([]); setFuture([]); }
      } catch { alert("Failed to parse FlowPins save file."); }
    };
    window.electron.ipcRenderer.on('load-graph-data', handler);
    return () => window.electron.ipcRenderer.removeAllListeners('load-graph-data');
  }, [setNodes, setEdges, setPast, setFuture]);

  useEffect(() => {
    const handler = async (_e: any, command: string) => {
      if (command === 'save-as') {
        await window.electron.ipcRenderer.invoke('save-as-dialog', {
          content: JSON.stringify({ nodes, edges }, null, 2), defaultName: 'my_graph.json',
          filters: [{ name: 'FlowPins Save File', extensions: ['json'] }]
        });
      } else if (command.startsWith('export-')) {
        const modeMap: Record<string, CompileMode> = {
          'export-js':'js_toonboom','export-py':'py_maya','export-houdini':'py_houdini',
          'export-py-std':'py_standard','export-cs':'cs_csharp','export-lua':'lua_fusion','export-gml':'gml_standard',
        };
        const extMap: Record<CompileMode, string> = {
          js_toonboom:'js', py_maya:'py', py_houdini:'py', py_standard:'py',
          cs_csharp:'cs', lua_fusion:'lua', gml_standard:'gml', py_nuke:'py',
        };
        const targetMode = modeMap[command] ?? activeMode;
        setActiveMode(targetMode);
        const script = generateCodeBlocks(nodes, edges, targetMode).map(b => b.text).join('\n');
        await window.electron.ipcRenderer.invoke('save-as-dialog', {
          content: script, defaultName: `FlowPinsScript.${extMap[targetMode]}`,
          filters: [{ name: 'Script', extensions: [extMap[targetMode]] }]
        });
      }
    };
    window.electron.ipcRenderer.on('menu-command', handler);
    return () => window.electron.ipcRenderer.removeAllListeners('menu-command');
  }, [nodes, edges, activeMode]);

  // --- Keyboard shortcuts ---
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (spawnMenu) return;

    if (event.altKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      setActiveMode(current => ALL_MODES[(ALL_MODES.indexOf(current) + 1) % ALL_MODES.length]);
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      // Ctrl+G — group selected nodes
      if (event.key.toLowerCase() === 'g') {
        event.preventDefault();
        const selected = nodes.filter(n => n.selected);
        if (selected.length > 0) setShowGroupDialog(true);
        return;
      }
      if (event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
      if (event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
      if (event.key.toLowerCase() === 'd') {
        event.preventDefault();
        takeSnapshot();
        const sel = nodes.filter(n => n.selected);
        if (sel.length > 0) {
          const idMap = new Map<string, string>();
          const newNodes = sel.map(node => {
            const newId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            idMap.set(node.id, newId);
            return { ...node, id: newId, position: { x: node.position.x + 40, y: node.position.y + 40 }, selected: true };
          });
          const newEdges = edges
            .filter(e => idMap.has(e.source) && idMap.has(e.target))
            .map(e => ({
              ...e,
              id: `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              source: idMap.get(e.source)!, target: idMap.get(e.target)!, selected: true
            }));
          setNodes(nds => [...nds.map(n => ({ ...n, selected: false })), ...newNodes]);
          setEdges(eds => [...eds.map(e => ({ ...e, selected: false })), ...newEdges]);
        }
      }
    }
  }, [nodes, edges, undo, redo, takeSnapshot, setNodes, setEdges, activeMode, spawnMenu]);

  // ── Inner node prop/label change — routed to the inner canvas ────────────
  const onInnerPropChange = useCallback((nodeId: string, key: string, value: any) => {
    const updater = (window as any).__fpInnerCanvas?.[subGraphFrame?.groupNodeId || ''];
    if (updater) updater.updateInnerNodeProp(nodeId, key, value);
    // Also update selectedInnerNode so Properties panel reflects immediately
    setSelectedInnerNode((n: any) => n && n.id === nodeId
      ? { ...n, data: { ...n.data, props: { ...n.data.props, [key]: value } } } : n);
  }, [subGraphFrame]);

  const onInnerLabelChange = useCallback((nodeId: string, label: string) => {
    const updater = (window as any).__fpInnerCanvas?.[subGraphFrame?.groupNodeId || ''];
    if (updater) updater.updateInnerNodeLabel(nodeId, label);
    setSelectedInnerNode((n: any) => n && n.id === nodeId ? { ...n, data: { ...n.data, label } } : n);
  }, [subGraphFrame]);

  const onLabelChange = (label: string) =>
    setNodes(nds => nds.map(n => n.id === selectedNodeId ? { ...n, data: { ...n.data, label } } : n));
  const onPropChange  = (key: string, value: any) =>
    setNodes(nds => nds.map(n => n.id === selectedNodeId ? { ...n, data: { ...n.data, props: { ...n.data.props, [key]: value } } } : n));
  const selectedNode  = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  const onConnect = useCallback((params: any) => {
    takeSnapshot();
    const sn = nodes.find(n => n.id === params.source);
    setEdges(eds => addEdge({ ...params, style: { stroke: resolveEdgeColor(sn, params.sourceHandle), strokeWidth: 2 } }, eds));
  }, [nodes, setEdges, takeSnapshot]);

  // =============================================================================
  return (
    <div
      tabIndex={0} onKeyDown={onKeyDown} onClick={closeMenu}
      style={{ height:"100vh", width:"100vw", display:"flex", background:"#050505", outline:'none', position:'relative' }}
    >
      {/* CONTEXT MENU */}
      {spawnMenu && (
        <div onClick={e => e.stopPropagation()} style={{
          position:'absolute', left:spawnMenu.x, top:spawnMenu.y,
          width:220, maxHeight:300, background:'#111', border:'1px solid #333',
          borderRadius:8, zIndex:9999, boxShadow:'0 15px 40px rgba(0,0,0,0.8)',
          display:'flex', flexDirection:'column', overflow:'hidden'
        }}>
          <input
            autoFocus placeholder="Search nodes..."
            value={menuSearch}
            onChange={e => { setMenuSearch(e.target.value); setMenuSelectedIndex(0); }}
            onKeyDown={e => {
              if (e.key==='ArrowDown') { e.preventDefault(); setMenuSelectedIndex(p => Math.min(p+1, filteredMenuNodes.length-1)); }
              else if (e.key==='ArrowUp') { e.preventDefault(); setMenuSelectedIndex(p => Math.max(p-1, 0)); }
              else if (e.key==='Enter') { e.preventDefault(); if (filteredMenuNodes.length>0) { handleDropSpawn(filteredMenuNodes[menuSelectedIndex][0], {x:spawnMenu.flowX, y:spawnMenu.flowY}); closeMenu(); } }
            }}
            style={{ background:'#1a1a1a', border:'none', borderBottom:'1px solid #333', color:'#00d8ff', padding:'10px 12px', fontSize:13, outline:'none' }}
          />
          <div style={{ flex:1, overflowY:'auto', padding:4 }}>
            {filteredMenuNodes.length===0 ? (
              <div style={{ padding:12, color:'#666', fontSize:12, textAlign:'center' }}>No nodes found.</div>
            ) : filteredMenuNodes.map(([kind, spec]: [string, any], index: number) => {
              const isSel = index === menuSelectedIndex;
              return (
                <div key={kind}
                  onClick={() => { handleDropSpawn(kind, {x:spawnMenu.flowX, y:spawnMenu.flowY}); closeMenu(); }}
                  onMouseEnter={() => setMenuSelectedIndex(index)}
                  style={{ padding:'8px 10px', color:isSel?'#fff':'#ccc', fontSize:12, cursor:'pointer', borderRadius:4, background:isSel?'#2a2a2a':'transparent', borderLeft:isSel?'3px solid #00d8ff':'3px solid transparent' }}
                >
                  <div style={{ fontWeight:'bold' }}>{spec.title}</div>
                  <div style={{ fontSize:9, color:isSel?'#888':'#666', marginTop:2 }}>{spec.profile}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CTRL+G GROUP DIALOG OVERLAY ─────────────────────────────────────── */}
      {showGroupDialog && (
        <div
          onClick={() => setShowGroupDialog(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 320, background: '#0a0a0a',
              border: `2px solid #536878`,
              borderRadius: '10px', overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
            }}
          >
            {/* Dialog header */}
            <div style={{
              background: 'linear-gradient(90deg, #0d0d0d 0%, #53687818 100%)',
              borderBottom: '1px solid #53687844',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ color: '#536878', fontSize: '13px' }}>◆</span>
              <span style={{ color: '#cccccc', fontSize: '12px', fontWeight: 'bold' }}>
                Group Selected Nodes
              </span>
              <span style={{ color: '#536878', fontSize: '8px', background: '#53687822', border: '1px solid #53687844', borderRadius: '3px', padding: '1px 5px', marginLeft: 'auto', letterSpacing: '1px' }}>
                CTRL+G
              </span>
            </div>
            <ConfluenceSaveDialog
              onSave={handleGroupSave}
              onCancel={() => setShowGroupDialog(false)}
            />
          </div>
        </div>
      )}

      <LibraryPanel
        width={sidebarWidth} onResize={setSidebarWidth}
        codeBlocks={codeBlocks} selectedNode={selectedNode}
        nodes={nodes} edges={edges}
        activeMode={activeMode} setActiveMode={setActiveMode}
      />

      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative" }} onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlowProvider>

          {evelynMessage && (
            <div style={{
              position:'absolute', bottom:'100px', left:'50%', transform:'translateX(-50%)',
              background:'rgba(0,216,255,0.1)', border:'1px solid #00d8ff', color:'#fff',
              padding:'12px 24px', borderRadius:'8px', zIndex:1000,
              boxShadow:'0 4px 20px rgba(0,216,255,0.2)', backdropFilter:'blur(4px)',
              display:'flex', alignItems:'center', gap:'10px', maxWidth:'600px'
            }}>
              <span style={{ color:'#00d8ff', fontWeight:'bold', whiteSpace:'nowrap' }}>Evelyn:</span>
              <span>{evelynMessage}</span>
            </div>
          )}

          <PromptBar onSubmit={handleAIPrompt} isLoading={isAILoading} />

          <ReactFlow
            nodes={nodes} edges={edges} nodeTypes={nodeTypes}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_e, n) => setSelectedNodeId(n.id)}
            onNodeDoubleClick={onNodeDoubleClick}
            onPaneClick={() => setSelectedNodeId(null)}
            onPaneContextMenu={onPaneContextMenu}
            onMoveStart={closeMenu}
            onInit={setReactFlowInstance}
            deleteKeyCode={["Backspace","Delete"]}
            onNodesDelete={() => takeSnapshot()}
            onEdgesDelete={() => takeSnapshot()}
            onNodeDragStart={() => takeSnapshot()}
            onSelectionDragStart={() => takeSnapshot()}
            snapToGrid fitView
            style={{ background:"#050505" }}
            panOnDrag={[1,2]}
            selectionOnDrag={true}
            selectionMode={SelectionMode.Partial}
            selectionKeyCode={null}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} color="#333" />
            <Controls />
            <MiniMap style={{ background:"#111", border:"1px solid #333" }} maskColor="rgba(0,0,0,0.6)" nodeColor="#444" />
          </ReactFlow>

          {subGraphFrame && (
            <ConfluenceSubGraph
              key={subGraphFrame.confluenceId}
              confluenceId={subGraphFrame.confluenceId}
              groupNodeId={subGraphFrame.groupNodeId}
              initialX={subGraphFrame.x}
              initialY={subGraphFrame.y}
              onClose={closeSubGraph}
              onInnerNodeSelect={setSelectedInnerNode}
              onInnerPropChange={onInnerPropChange}
              onInnerLabelChange={onInnerLabelChange}
            />
          )}

        </ReactFlowProvider>
      </div>

      <RightPanel
        selectedNode={subGraphFrame ? selectedInnerNode : selectedNode}
        nodes={nodes} edges={edges}
        onChangeLabel={subGraphFrame
          ? (label: string) => selectedInnerNode && onInnerLabelChange(selectedInnerNode.id, label)
          : onLabelChange}
        onChangeProp={subGraphFrame
          ? (key: string, value: any) => selectedInnerNode && onInnerPropChange(selectedInnerNode.id, key, value)
          : onPropChange}
        onDropConfluence={() => {}}
        reactFlowInstance={reactFlowInstance}
      />
    </div>
  );
}
