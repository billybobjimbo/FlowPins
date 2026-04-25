// src/renderer/src/App.tsx
// ============================================================================
// FLOWPINS: MAIN APPLICATION COMPONENT
// Orchestrates the node canvas, library panel, node inspector, Evelyn prompt,
// undo/redo, keyboard shortcuts, file I/O, and code compilation.
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

import { FPNode } from "./nodes/FPNode";
import PromptBar from './components/PromptBar';
import { LibraryPanel } from "./components/LibraryPanel";
import { NodeInspector, type FPNodeData } from "./components/NodeInspector";
import { NODE_LIBRARY } from './libraries/index';
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

const nodeTypes = { fp: FPNode };

// ---- Pin colour helper (used when wiring edges) ----------------------------
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

// ---- App profile label for context menu filtering -------------------------
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

// =============================================================================
//  MAIN APP COMPONENT
// =============================================================================

export default function App() {

  // --- Expiry check ---
  // Update this date when issuing new alpha builds.
  const EXPIRY_DATE = new Date('2026-12-31T00:00:00');
  const isExpired = new Date() > EXPIRY_DATE;

  if (isExpired) {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#ff4444', marginBottom: '10px' }}>Alpha Build Expired</h1>
        <p style={{ color: '#aaa' }}>This experimental version of FlowPins has expired.</p>
        <p style={{ color: '#aaa' }}>Please contact Alistair for the latest build.</p>
      </div>
    );
  }

  const [sidebarWidth, setSidebarWidth]     = useState(320);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange]    = useNodesState<FPNodeData>([]);
  const [edges, setEdges, onEdgesChange]    = useEdgesState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [activeMode, setActiveMode]         = useState<CompileMode>('gml_standard');
  const [isAILoading, setIsAILoading]       = useState(false);
  const [evelynMessage, setEvelynMessage]   = useState<string | null>(null);
  const [spawnMenu, setSpawnMenu]           = useState<{ show: boolean, x: number, y: number, flowX: number, flowY: number } | null>(null);
  const [menuSearch, setMenuSearch]         = useState("");
  const [menuSelectedIndex, setMenuSelectedIndex] = useState(0);

  // --- Animated wires on selection ---
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: selectedNodeId !== null && (edge.source === selectedNodeId || edge.target === selectedNodeId),
      }))
    );
  }, [selectedNodeId, setEdges]);

  // --- Evelyn AI prompt handler ---
  const handleAIPrompt = async (prompt: string) => {
    setIsAILoading(true);

    setTimeout(() => {
      const parsedRequest = EvelynLibrarian.parsePrompt(prompt);
      const blueprint     = EvelynLibrarian.buildGraph(parsedRequest);

      if (blueprint) {
        // Don't add anything to canvas if the blueprint has no nodes
        if (blueprint.nodes.length === 0) {
          setEvelynMessage(blueprint.message);
          setTimeout(() => setEvelynMessage(null), 6000);
          setIsAILoading(false);
          return;
        }

        const spawnStamp = Date.now();

        const generatedNodes: Node<FPNodeData>[] = blueprint.nodes.map((n: any) => {
          const spec = NODE_LIBRARY[n.nodeKind];
          return {
            id:       `${n.id}_${spawnStamp}`,
            type:     'fp',
            position: { x: n.x, y: n.y },
            data: {
              label:           spec?.title || n.nodeKind,
              nodeKind:        n.nodeKind,
              profile:         spec?.profile || 'General',
              injectedInputs:  spec?.inputs  || [],
              injectedOutputs: spec?.outputs || [],
              props:           { ...spec?.default_props, ...n.props }
            }
          };
        });

        const generatedEdges: Edge[] = blueprint.edges.map((e: any) => {
          const sourceNode = generatedNodes.find((n: any) => n.id === `${e.source}_${spawnStamp}`);
          const color = resolveEdgeColor(sourceNode, e.sourceHandle);
          return {
            id:           `e_${e.source}_${e.target}_${spawnStamp}`,
            source:       `${e.source}_${spawnStamp}`,
            target:       `${e.target}_${spawnStamp}`,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            type:         'default',
            animated:     false,
            style:        { stroke: color, strokeWidth: 2 }
          };
        });

        setNodes((nds) => [...nds, ...generatedNodes]);
        setEdges((eds) => [...eds, ...generatedEdges]);
        setEvelynMessage(blueprint.message);
        setTimeout(() => setEvelynMessage(null), 6000);
      } else {
        setEvelynMessage("I couldn't find anything for that. Try asking for a loop, a branch, a function, or 'spawn 10 objects'.");
        setTimeout(() => setEvelynMessage(null), 6000);
      }

      setIsAILoading(false);
    }, 800);
  };

  // --- Undo / Redo ---
  const [past,   setPast]   = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const takeSnapshot = useCallback(() => {
    setPast((p) => [...p, { nodes, edges }]);
    setFuture([]);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setFuture((f) => [...f, { nodes, edges }]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setPast((p) => p.slice(0, -1));
  }, [past, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[future.length - 1];
    setPast((p) => [...p, { nodes, edges }]);
    setNodes(next.nodes);
    setEdges(next.edges);
    setFuture((f) => f.slice(0, -1));
  }, [future, nodes, edges, setNodes, setEdges]);

  // --- Drag & drop / spawn ---
  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDropSpawn = (nodeKind: string, position: { x: number; y: number }) => {
    takeSnapshot();
    const spec = NODE_LIBRARY[nodeKind];
    const newNode: Node<any> = {
      id:       `node_${Date.now()}`,
      type:     'fp',
      position,
      data: {
        label:           spec?.title || nodeKind,
        nodeKind:        nodeKind,
        profile:         spec?.profile || 'General',
        injectedInputs:  spec?.inputs  || [],
        injectedOutputs: spec?.outputs || [],
        props:           { ...spec?.default_props }
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const nodeKind = event.dataTransfer.getData('application/reactflow') || event.dataTransfer.getData('text/plain');
    if (!nodeKind || !reactFlowInstance) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    handleDropSpawn(nodeKind, position);
  }, [reactFlowInstance, setNodes, takeSnapshot]);

  // --- Code generation (memoised) ---
  const codeBlocks = useMemo(
    () => generateCodeBlocks(nodes, edges, activeMode),
    [nodes, edges, activeMode]
  );

  // --- Context menu ---
  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    if (!reactFlowInstance) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setSpawnMenu({ show: true, x: event.clientX, y: event.clientY, flowX: position.x, flowY: position.y });
    setMenuSearch("");
    setMenuSelectedIndex(0);
  }, [reactFlowInstance]);

  const closeMenu = () => setSpawnMenu(null);

  const filteredMenuNodes = Object.entries(NODE_LIBRARY).filter(([_, spec]: [string, any]) => {
    const c = (spec.profile || "").toLowerCase();
    const isCore     = c.startsWith('core');
    const isAppMatch = c.startsWith('app -') && c.includes(getActiveAppProfile(activeMode));
    const isPipeline  = c.startsWith('pipeline');
    const matchesSearch = spec.title.toLowerCase().includes(menuSearch.toLowerCase());
    return (isCore || isAppMatch || isPipeline) && matchesSearch;
  });

  // --- File I/O via Electron IPC ---
  useEffect(() => {
    const handleLoadGraph = (_event: any, fileContent: string) => {
      try {
        const parsedData = JSON.parse(fileContent);
        if (parsedData.nodes && parsedData.edges) {
          setNodes(parsedData.nodes);
          setEdges(parsedData.edges);
          setPast([]);
          setFuture([]);
        }
      } catch (error) {
        alert("Failed to parse FlowPins save file. Is it corrupted?");
        console.error(error);
      }
    };
    window.electron.ipcRenderer.on('load-graph-data', handleLoadGraph);
    return () => { window.electron.ipcRenderer.removeAllListeners('load-graph-data'); };
  }, [setNodes, setEdges, setPast, setFuture]);

  useEffect(() => {
    const handleMenuCommand = async (_event: any, command: string) => {
      if (command === 'save-as') {
        const graphData = JSON.stringify({ nodes, edges }, null, 2);
        await window.electron.ipcRenderer.invoke('save-as-dialog', {
          content:     graphData,
          defaultName: 'my_graph.json',
          filters:     [{ name: 'FlowPins Save File', extensions: ['json'] }]
        });
      } else if (command.startsWith('export-')) {
        const modeMap: Record<string, CompileMode> = {
          'export-js':       'js_toonboom',
          'export-py':       'py_maya',
          'export-houdini':  'py_houdini',
          'export-py-std':   'py_standard',
          'export-cs':       'cs_csharp',
          'export-lua':      'lua_fusion',
          'export-gml':      'gml_standard',
        };
        const extMap: Record<CompileMode, string> = {
          js_toonboom: 'js', py_maya: 'py', py_houdini: 'py',
          py_standard: 'py', cs_csharp: 'cs', lua_fusion: 'lua', gml_standard: 'gml'
        };
        const targetMode = modeMap[command] ?? activeMode;
        setActiveMode(targetMode);
        const generatedBlocks = generateCodeBlocks(nodes, edges, targetMode);
        const finalScript = generatedBlocks.map(b => b.text).join('\n');
        await window.electron.ipcRenderer.invoke('save-as-dialog', {
          content:     finalScript,
          defaultName: `FlowPinsScript.${extMap[targetMode]}`,
          filters:     [{ name: 'Script', extensions: [extMap[targetMode]] }]
        });
      }
    };
    window.electron.ipcRenderer.on('menu-command', handleMenuCommand);
    return () => { window.electron.ipcRenderer.removeAllListeners('menu-command'); };
  }, [nodes, edges, activeMode]);

  // --- Keyboard shortcuts ---
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (spawnMenu) return;
    if (event.altKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      setActiveMode((current) => ALL_MODES[(ALL_MODES.indexOf(current) + 1) % ALL_MODES.length]);
      return;
    }
    if (event.ctrlKey || event.metaKey) {
      if (event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
      }
      if (event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
      if (event.key.toLowerCase() === 'd') {
        event.preventDefault();
        takeSnapshot();
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          const idMap = new Map<string, string>();
          const newNodes = selectedNodes.map(node => {
            const newId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            idMap.set(node.id, newId);
            return { ...node, id: newId, position: { x: node.position.x + 40, y: node.position.y + 40 }, selected: true };
          });
          const newEdges = edges
            .filter(e => idMap.has(e.source) && idMap.has(e.target))
            .map(e => ({
              ...e,
              id:     `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              source: idMap.get(e.source)!,
              target: idMap.get(e.target)!,
              selected: true
            }));
          setNodes((nds) => [...nds.map(n => ({ ...n, selected: false })), ...newNodes]);
          setEdges((eds) => [...eds.map(e => ({ ...e, selected: false })), ...newEdges]);
        }
      }
    }
  }, [nodes, edges, undo, redo, takeSnapshot, setNodes, setEdges, activeMode, spawnMenu]);

  const onLabelChange = (label: string) =>
    setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, label } } : n));
  const onPropChange  = (key: string, value: any) =>
    setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, props: { ...n.data.props, [key]: value } } } : n));
  const selectedNode  = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  const onConnect = useCallback((params: any) => {
    takeSnapshot();
    const sourceNode  = nodes.find((n) => n.id === params.source);
    const strokeColor = resolveEdgeColor(sourceNode, params.sourceHandle);
    setEdges((eds) => addEdge({ ...params, style: { stroke: strokeColor, strokeWidth: 2 } }, eds));
  }, [nodes, setEdges, takeSnapshot]);

  // =============================================================================
  //  RENDER
  // =============================================================================

  return (
    <div
      tabIndex={0} onKeyDown={onKeyDown} onClick={closeMenu}
      style={{ height: "100vh", width: "100vw", display: "flex", background: "#050505", outline: 'none', position: 'relative' }}
    >
      {/* FLOATING CONTEXT MENU */}
      {spawnMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', left: spawnMenu.x, top: spawnMenu.y,
            width: 220, maxHeight: 300, background: '#111', border: '1px solid #333',
            borderRadius: 8, zIndex: 9999, boxShadow: '0 15px 40px rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}
        >
          <input
            autoFocus placeholder="Search nodes..."
            value={menuSearch}
            onChange={(e) => { setMenuSearch(e.target.value); setMenuSelectedIndex(0); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setMenuSelectedIndex((prev) => Math.min(prev + 1, filteredMenuNodes.length - 1)); }
              else if (e.key === 'ArrowUp')  { e.preventDefault(); setMenuSelectedIndex((prev) => Math.max(prev - 1, 0)); }
              else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredMenuNodes.length > 0) {
                  handleDropSpawn(filteredMenuNodes[menuSelectedIndex][0], { x: spawnMenu.flowX, y: spawnMenu.flowY });
                  closeMenu();
                }
              }
            }}
            style={{ background: '#1a1a1a', border: 'none', borderBottom: '1px solid #333', color: '#00d8ff', padding: '10px 12px', fontSize: 13, outline: 'none' }}
          />
          <div style={{ flex: 1, overflowY: 'auto', padding: 4 }}>
            {filteredMenuNodes.length === 0 ? (
              <div style={{ padding: 12, color: '#666', fontSize: 12, textAlign: 'center' }}>No nodes found.</div>
            ) : (
              filteredMenuNodes.map(([kind, spec]: [string, any], index: number) => {
                const isSelected = index === menuSelectedIndex;
                return (
                  <div
                    key={kind}
                    onClick={() => { handleDropSpawn(kind, { x: spawnMenu.flowX, y: spawnMenu.flowY }); closeMenu(); }}
                    onMouseEnter={() => setMenuSelectedIndex(index)}
                    style={{
                      padding: '8px 10px', color: isSelected ? '#fff' : '#ccc', fontSize: 12, cursor: 'pointer',
                      borderRadius: 4, background: isSelected ? '#2a2a2a' : 'transparent',
                      borderLeft: isSelected ? '3px solid #00d8ff' : '3px solid transparent'
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{spec.title}</div>
                    <div style={{ fontSize: 9, color: isSelected ? '#888' : '#666', marginTop: 2 }}>{spec.profile}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <LibraryPanel
        width={sidebarWidth}
        onResize={setSidebarWidth}
        codeBlocks={codeBlocks}
        selectedNode={selectedNode}
        nodes={nodes}
        edges={edges}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }} onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlowProvider>

          {/* EVELYN'S VOICE BUBBLE */}
          {evelynMessage && (
            <div style={{
              position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0, 216, 255, 0.1)', border: '1px solid #00d8ff', color: '#fff',
              padding: '12px 24px', borderRadius: '8px', zIndex: 1000,
              boxShadow: '0 4px 20px rgba(0, 216, 255, 0.2)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '600px'
            }}>
              <span style={{ color: '#00d8ff', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Evelyn:</span>
              <span>{evelynMessage}</span>
            </div>
          )}

          <PromptBar onSubmit={handleAIPrompt} isLoading={isAILoading} />

          <ReactFlow
            nodes={nodes} edges={edges} nodeTypes={nodeTypes}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_e: React.MouseEvent, n: Node) => setSelectedNodeId(n.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            onPaneContextMenu={onPaneContextMenu}
            onMoveStart={closeMenu}
            onInit={setReactFlowInstance}
            deleteKeyCode={["Backspace", "Delete"]}
            onNodesDelete={() => takeSnapshot()}
            onEdgesDelete={() => takeSnapshot()}
            onNodeDragStart={() => takeSnapshot()}
            onSelectionDragStart={() => takeSnapshot()}
            snapToGrid fitView
            style={{ background: "#050505" }}
            panOnDrag={[1, 2]}
            selectionOnDrag={true}
            selectionMode={SelectionMode.Partial}
            selectionKeyCode={null}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} color="#333" />
            <Controls />
            <MiniMap style={{ background: "#111", border: "1px solid #333" }} maskColor="rgba(0,0,0,0.6)" nodeColor="#444" />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <NodeInspector node={selectedNode} onChangeLabel={onLabelChange} onChangeProp={onPropChange} />
    </div>
  );
}
