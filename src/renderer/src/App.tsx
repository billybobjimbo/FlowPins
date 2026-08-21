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
import { isHiddenProfile } from './libraries/release';
import { SkinProvider } from './libraries/SkinProvider';
import { SKINS, skinForTarget } from './libraries/skins';
import { pinColor } from './libraries/theme';
import { WelcomeScreen }     from './components/WelcomeScreen';
import { JOURNEYS, getJourney, type Journey } from './libraries/journeys';

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

function resolveEdgeColor(sourceNode: any, sourceHandle: string | null | undefined): string {
  // Was a fourth hand-written pin table (after FPNode, ConfluenceNode and the
  // dead PIN_COLORS). It had drifted: no 'number' case, and 'list' returned the
  // brand accent — which is why wire colours didn't match pin colours.
  if (!sourceNode) return pinColor(undefined);
  const spec = NODE_LIBRARY[sourceNode.data.nodeKind];
  if (!spec) return pinColor(undefined);
  const outPin = spec.outputs?.find((o: any) => o.name === sourceHandle);
  if (!outPin) return pinColor(undefined);
  return pinColor(outPin.pin_type === 'bool' ? 'boolean' : outPin.pin_type);
}

function getActiveAppProfile(mode: string): string {
  if (mode === 'js_toonboom')  return 'toon boom';
  if (mode === 'py_harmony')   return 'toon boom';
  if (mode === 'py_standard')  return 'python';
  if (mode === 'cs_csharp')    return 'unity';
  return '';
}

type SubGraphFrame = { confluenceId: string; groupNodeId: string; x: number; y: number; };

// =============================================================================
export default function App() {

  const EXPIRY_DATE = new Date('2026-12-31T00:00:00');
  if (new Date() > EXPIRY_DATE) {
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'var(--fp-surface-canvas)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--fp-text-bright)', fontFamily:'sans-serif' }}>
        <h1 style={{ color:'var(--fp-state-danger)', marginBottom:'10px' }}>Alpha Build Expired</h1>
        <p style={{ color:'var(--fp-text-secondary)' }}>Please contact Alistair for the latest build.</p>
      </div>
    );
  }

  const [sidebarWidth,       setSidebarWidth]       = useState(320);
  const [selectedNodeId,     setSelectedNodeId]     = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange]            = useNodesState<FPNodeData>([]);
  const [edges, setEdges, onEdgesChange]            = useEdgesState<Edge[]>([]);

  // Wire colour, derived fresh on every render rather than baked in once at
  // connection time. resolveEdgeColor() previously only ran in two places —
  // onConnect (a wire just dragged by hand) and blueprint placement — so any
  // edge loaded from a saved file, or drawn before a node's pins were typed
  // correctly (exactly what happened during today's Toon Boom pin rollout),
  // kept whatever stroke it got at creation and never picked up the real
  // colour. This recomputes every edge's stroke from its actual source pin
  // on every render, so wire colour always matches current pin types —
  // old saves included — with no need to re-draw anything.
  const styledEdges = useMemo(() => edges.map(e => {
    const sourceNode = nodes.find(n => n.id === e.source);
    const color = resolveEdgeColor(sourceNode, e.sourceHandle);
    return { ...e, style: { ...(e.style || {}), stroke: color, strokeWidth: 2 } };
  }), [edges, nodes]);
  const [reactFlowInstance,  setReactFlowInstance]  = useState<any>(null);
  const [activeMode,         setActiveMode]         = useState<CompileMode>('js_toonboom');
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
    // In guided mode, intercept place/skip/exit commands
    if (activeJourney) {
      const p = prompt.trim().toLowerCase();
      if (/^(place it|yes|do it|place them|place nodes?)$/.test(p)) {
        placeJourneyNodes();
        return;
      }
      if (/^(next|done|continue|advance|skip)$/.test(p)) {
        advanceJourneyStep();
        return;
      }
      if (/^(exit|quit|stop|leave|freeform)$/.test(p)) {
        setActiveJourney(null);
        setJourneyStep(0);
        return;
      }
      // Hint request
      if (/hint|help|stuck|what do i do|how/i.test(p)) {
        const step = activeJourney.steps[journeyStep];
        if (step?.hint) {
          setEvelynMessage(step.hint);
          setTimeout(() => setEvelynMessage(null), 7000);
          return;
        }
      }
    }
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

  // ── Welcome screen state ──────────────────────────────────────────────────
  const welcomeSuppressed = localStorage.getItem('fp_welcome_suppressed') === 'true';
  const [showWelcome, setShowWelcome] = useState(!welcomeSuppressed);

  // ── Guided journey state ──────────────────────────────────────────────────
  const [activeJourney,   setActiveJourney]   = useState<Journey | null>(null);
  const [journeyStep,     setJourneyStep]     = useState(0);
  const [evelynStepMsg,   setEvelynStepMsg]   = useState<string | null>(null);

  // Check step completion — useMemo so it re-evaluates whenever
  // nodes or edges change (IIFE wouldn't reliably trigger re-render)
  const stepComplete = useMemo(() => {
    if (!activeJourney) return false;
    const step = activeJourney.steps[journeyStep];
    if (!step) return false;
    const cond = step.completion;

    if (cond.type === 'node_exists') {
      return nodes.some(n => n.data?.nodeKind === cond.nodeKind);
    }

    if (cond.type === 'node_connected') {
      // Checks BOTH source and target — catches exec wires and data wires
      const nodeIds = new Set(
        nodes
          .filter(n => n.data?.nodeKind === cond.nodeKind)
          .map(n => n.id)
      );
      return edges.some(e => nodeIds.has(e.source) || nodeIds.has(e.target));
    }

    if (cond.type === 'manual') return false;
    return false;
  }, [activeJourney, journeyStep, nodes, edges]);

  // Advance journey step
  const advanceJourneyStep = useCallback(() => {
    if (!activeJourney) return;
    const nextStep = journeyStep + 1;
    if (nextStep >= activeJourney.steps.length) {
      // Journey complete
      setEvelynMessage(activeJourney.completeSays);
      setTimeout(() => setEvelynMessage(null), 8000);
      setActiveJourney(null);
      setJourneyStep(0);
    } else {
      setJourneyStep(nextStep);
      setEvelynStepMsg(activeJourney.steps[nextStep].evelynSays);
    }
  }, [activeJourney, journeyStep]);

  // Start a journey
  const startJourney = useCallback((journeyId: string) => {
    const journey = getJourney(journeyId);
    if (!journey) return;
    setShowWelcome(false);
    setActiveJourney(journey);
    setJourneyStep(0);
    setEvelynStepMsg(journey.steps[0].evelynSays);
  }, []);

  // Place nodes for current step
  const placeJourneyNodes = useCallback(() => {
    if (!activeJourney) return;
    const step = activeJourney.steps[journeyStep];
    if (!step?.autoPlace) return;
    takeSnapshot();
    const stamp = Date.now();
    const newNodes = step.autoPlace.nodes.map(n => {
      const spec = NODE_LIBRARY[n.nodeKind];
      return {
        id:       `${n.id}_${stamp}`,
        type:     'fp',
        position: { x: n.x, y: n.y },
        data: {
          label:           spec?.title || n.nodeKind,
          nodeKind:        n.nodeKind,
          profile:         spec?.profile || 'General',
          injectedInputs:  spec?.inputs  || [],
          injectedOutputs: spec?.outputs || [],
          props:           { ...spec?.default_props, ...n.props },
        },
      };
    });
    const newEdges = step.autoPlace.edges.map(e => ({
      id:           `e_${e.source}_${e.target}_${stamp}`,
      source:       `${e.source}_${stamp}`,
      target:       `${e.target}_${stamp}`,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      type:         'default',
      style:        { stroke: 'var(--fp-text-muted)', strokeWidth: 2 },
    }));
    setNodes(nds => [...nds, ...newNodes]);
    setEdges(eds => [...eds, ...newEdges]);
    setEvelynMessage(step.successSays);
    setTimeout(() => setEvelynMessage(null), 5000);
  }, [activeJourney, journeyStep, takeSnapshot, setNodes, setEdges]);

  // Handle suppress checkbox
  const handleSuppressChange = useCallback((suppress: boolean) => {
    localStorage.setItem('fp_welcome_suppressed', String(suppress));
  }, []);

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

  // --- Active skin ---
  // Harmony JS / Harmony Py -> Harmony skin, everything else -> FlowPins.
  // App reads it directly because it renders the provider and therefore sits
  // outside it; every child uses useSkin().
  const skin = useMemo(() => SKINS[skinForTarget(activeMode)], [activeMode]);

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
    if (isHiddenProfile(spec.profile)) return false;
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
          'export-js':      'js_toonboom',
          'export-py-harmony':'py_harmony',
          'export-py-std':  'py_standard',
          'export-cs':      'cs_csharp',
        };
        const extMap: Partial<Record<CompileMode, string>> = {
          js_toonboom: 'js', py_harmony: 'py', py_standard: 'py', cs_csharp: 'cs',
        };
        const targetMode = modeMap[command] ?? activeMode;
        setActiveMode(targetMode);
        const script = generateCodeBlocks(nodes, edges, targetMode).map(b => b.text).join('\n');
        await window.electron.ipcRenderer.invoke('save-as-dialog', {
          content: script, defaultName: `FlowPinsScript.${extMap[targetMode] ?? 'txt'}`,
          filters: [{ name: 'Script', extensions: [extMap[targetMode] ?? 'txt'] }]
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
    <SkinProvider mode={activeMode}>
    <div
      tabIndex={0} onKeyDown={onKeyDown} onClick={closeMenu}
      style={{ height:"100vh", width:"100vw", display:"flex",
               background: skin.surface.canvas, outline:'none', position:'relative',
               transition: 'background-color 0.25s ease' }}
    >
      {/* CONTEXT MENU */}
      {spawnMenu && (
        <div onClick={e => e.stopPropagation()} style={{
          position:'absolute', left:spawnMenu.x, top:spawnMenu.y,
          width:220, maxHeight:300, background:'var(--fp-surface-base)', border:'1px solid var(--fp-border-default)',
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
            style={{ background:'var(--fp-surface-raised)', border:'none', borderBottom:'1px solid var(--fp-border-default)', color:'var(--fp-accent-primary)', padding:'10px 12px', fontSize:13, outline:'none' }}
          />
          <div style={{ flex:1, overflowY:'auto', padding:4 }}>
            {filteredMenuNodes.length===0 ? (
              <div style={{ padding:12, color:'var(--fp-text-disabled)', fontSize:12, textAlign:'center' }}>No nodes found.</div>
            ) : filteredMenuNodes.map(([kind, spec]: [string, any], index: number) => {
              const isSel = index === menuSelectedIndex;
              return (
                <div key={kind}
                  onClick={() => { handleDropSpawn(kind, {x:spawnMenu.flowX, y:spawnMenu.flowY}); closeMenu(); }}
                  onMouseEnter={() => setMenuSelectedIndex(index)}
                  style={{ padding:'8px 10px', color:isSel?'var(--fp-text-bright)':'var(--fp-text-primary)', fontSize:12, cursor:'pointer', borderRadius:4, background:isSel?'var(--fp-surface-overlay)':'transparent', borderLeft:isSel?'3px solid var(--fp-accent-primary)':'3px solid transparent' }}
                >
                  <div style={{ fontWeight:'bold' }}>{spec.title}</div>
                  <div style={{ fontSize:9, color:isSel?'var(--fp-text-muted)':'var(--fp-text-disabled)', marginTop:2 }}>{spec.profile}</div>
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
              width: 320, background: 'var(--fp-surface-canvas)',
              border: `2px solid var(--fp-accent-confluence)`,
              borderRadius: '10px', overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
            }}
          >
            {/* Dialog header */}
            <div style={{
              background: 'linear-gradient(90deg, var(--fp-surface-sunken) 0%, rgba(83, 104, 120, 0.09) 100%)',
              borderBottom: '1px solid rgba(83, 104, 120, 0.27)',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ color: 'var(--fp-accent-confluence)', fontSize: '13px' }}>◆</span>
              <span style={{ color: 'var(--fp-text-primary)', fontSize: '12px', fontWeight: 'bold' }}>
                Group Selected Nodes
              </span>
              <span style={{ color: 'var(--fp-accent-confluence)', fontSize: '8px', background: 'rgba(83, 104, 120, 0.13)', border: '1px solid rgba(83, 104, 120, 0.27)', borderRadius: '3px', padding: '1px 5px', marginLeft: 'auto', letterSpacing: '1px' }}>
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
              background:'rgba(0,216,255,0.1)', border:'1px solid var(--fp-accent-primary)', color:'var(--fp-text-bright)',
              padding:'12px 24px', borderRadius:'8px', zIndex:1000,
              boxShadow:'0 4px 20px rgba(0,216,255,0.2)', backdropFilter:'blur(4px)',
              display:'flex', alignItems:'center', gap:'10px', maxWidth:'600px'
            }}>
              <span style={{ color:'var(--fp-accent-primary)', fontWeight:'bold', whiteSpace:'nowrap' }}>Evelyn:</span>
              <span>{evelynMessage}</span>
            </div>
          )}

          <PromptBar
            onSubmit={handleAIPrompt}
            isLoading={isAILoading}
            onShowWelcome={() => setShowWelcome(true)}
            journey={activeJourney}
            currentStep={journeyStep}
            onPlaceNodes={placeJourneyNodes}
            onSkipStep={advanceJourneyStep}
            onExitJourney={() => { setActiveJourney(null); setJourneyStep(0); }}
            stepComplete={stepComplete}
            onAdvanceStep={advanceJourneyStep}
          />

          <ReactFlow
            nodes={nodes} edges={styledEdges} nodeTypes={nodeTypes}
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
            style={{ background:"var(--fp-surface-canvas)" }}
            panOnDrag={[1,2]}
            selectionOnDrag={true}
            selectionMode={SelectionMode.Partial}
            selectionKeyCode={null}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} color={skin.border.subtle} />
            <Controls />
            <MiniMap style={{ background:"var(--fp-surface-base)", border:"1px solid var(--fp-border-default)" }} maskColor="rgba(0,0,0,0.6)" nodeColor="var(--fp-border-strong)" />
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

      {/* ── WELCOME SCREEN ────────────────────────────────────────────────── */}
      {showWelcome && (
        <WelcomeScreen
          onStartJourney={startJourney}
          onDismiss={() => setShowWelcome(false)}
          onSuppressChange={handleSuppressChange}
          suppressed={welcomeSuppressed}
        />
      )}

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
    </SkinProvider>
  );
}
