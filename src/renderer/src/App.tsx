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
import { HARMONY_TRANSLATIONS } from './libraries/translators/harmony';
import { FUSION_TRANSLATIONS } from './libraries/translators/fusion';
import { MAYA_TRANSLATIONS } from './libraries/translators/maya';
import { PYTHON_TRANSLATIONS } from './libraries/translators/python';
import { LOCAL_TEMPLATES } from './libraries/templates';
import { CSHARP_TRANSLATIONS } from "./libraries/translators/csharp";
import { HOUDINI_TRANSLATIONS } from "./libraries/translators/houdini";
import { GML_TRANSLATIONS } from './libraries/translators/gml';

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
type CodeBlock = { id: string | null; text: string };

// =============================================================================
//  CODE GENERATOR ENGINE
// =============================================================================

const generateCodeBlocks = (nodes: Node<FPNodeData>[], edges: Edge[], mode: 'js_toonboom' | 'py_maya' | 'py_houdini' | 'cs_csharp' | 'lua_fusion' | 'py_standard' | 'gml_standard'): CodeBlock[] => {
  const blocks: CodeBlock[] = [];
  const processedExecIds = new Set<string>(); 

  let headerText = "";
  if (mode === 'js_toonboom') headerText = "function FlowPinsTool() {\n    var d = new QDialog();\n    var layout = new QVBoxLayout();\n";
  else if (mode === 'py_maya') headerText = "import maya.cmds as cmds\n";
  else if (mode === 'cs_csharp') headerText = "using System;\n\npublic class FlowPinsTool {\n    public static void Execute() {\n";
  else if (mode === 'lua_fusion') headerText = "local comp = fusion:GetCurrentComp()\ncomp:StartUndo('FlowPins Build')\n";
  blocks.push({ id: null, text: headerText });

  const generateNodeCode = (node: Node, mode: string): string => {
    const nodeKind = node.data.nodeKind;
    const nodeSpec = NODE_LIBRARY[nodeKind];
    if (!nodeSpec) return "";

    let translationDict: Record<string, any> = {};
    if (mode === 'js_toonboom') translationDict = HARMONY_TRANSLATIONS;
    if (mode === 'py_maya') translationDict = MAYA_TRANSLATIONS;
    if (mode === 'lua_fusion') translationDict = FUSION_TRANSLATIONS;
    if (mode === 'py_standard') translationDict = PYTHON_TRANSLATIONS;
    if (mode === 'cs_csharp') translationDict = CSHARP_TRANSLATIONS;
    if (mode === 'py_houdini') translationDict = HOUDINI_TRANSLATIONS;
    if (mode === 'gml_standard') translationDict = GML_TRANSLATIONS;

    let template = translationDict[nodeKind];
    let commentPrefix = "//";
    if (mode === 'lua_fusion') commentPrefix = "--";
    if (mode.startsWith('py_')) commentPrefix = "#";

    if (nodeKind === 'start') template = `${commentPrefix} Start Execution\n{exec_out}`;
    if (template === undefined) return `${commentPrefix} No ${mode} translation available for ${nodeSpec.title}\n{exec_out}`;
    if (typeof template === 'function') template = template(node.data);

    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match: string, key: string) => {
      if (key === 'node_id') return "n_" + node.id.replace(/[^a-zA-Z0-9]/g, ""); 

      const outPort = nodeSpec.outputs?.find(o => o.name === key);
      if (outPort && outPort.pin_type === 'exec') {
        const outEdge = edges.find(e => e.source === node.id && e.sourceHandle === key);
        if (outEdge) {
          const nextNode = nodes.find(n => n.id === outEdge.target);
          if (nextNode && !processedExecIds.has(nextNode.id)) {
            processedExecIds.add(nextNode.id);
            return generateNodeCode(nextNode, mode); 
          }
        }
        return ""; 
      }

      const dataEdge = edges.find(e => e.target === node.id && e.targetHandle === key);
      if (dataEdge) {
        if (dataEdge.sourceHandle === 'index') return "n_" + dataEdge.source.replace(/[^a-zA-Z0-9]/g, "") + "_i";
        if (dataEdge.sourceHandle === 'item') return "n_" + dataEdge.source.replace(/[^a-zA-Z0-9]/g, "") + "_item"; 

        const sourceNode = nodes.find(n => n.id === dataEdge.source);
        if (sourceNode) {
          const generatedData = generateNodeCode(sourceNode, mode);
          if (generatedData !== undefined && generatedData !== "") return generatedData;
        }
      }

      if (node.data.props && node.data.props[key] !== undefined && node.data.props[key] !== "") return String(node.data.props[key]);
      if (nodeSpec.default_props && nodeSpec.default_props[key] !== undefined) return String(nodeSpec.default_props[key]);
      if (["exec_out", "true", "false", "loop_body"].includes(key)) return "";
      
      return "MISSING_" + key.toUpperCase();
    });
  };

  const startNode = nodes.find(n => n.data.nodeKind === 'start');
  if (startNode) {
    processedExecIds.add(startNode.id);
    const fullScript = generateNodeCode(startNode, mode);
    blocks.push({ id: startNode.id, text: fullScript });
  }

  let routingText = "\n// --- Apply Node Connections ---\n";
  edges.forEach(edge => {
    if (edge.sourceHandle === 'exec_out' || edge.sourceHandle === 'exec') return;
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!sourceNode || !targetNode) return;

    const sourceSpec = NODE_LIBRARY[sourceNode.data.nodeKind];
    const targetSpec = NODE_LIBRARY[targetNode.data.nodeKind];

    if (sourceSpec && targetSpec && mode === 'js_toonboom') {
      const outIndex = Math.max(0, sourceSpec.outputs?.findIndex(o => o.name === edge.sourceHandle));
      const inIndex = Math.max(0, targetSpec.inputs?.findIndex(i => i.name === edge.targetHandle));
      const sourceName = "FP_n_" + sourceNode.id.replace(/[^a-zA-Z0-9]/g, "");
      const targetName = "FP_n_" + targetNode.id.replace(/[^a-zA-Z0-9]/g, "");
      routingText += `node.link(node.root() + "/${sourceName}", ${outIndex}, node.root() + "/${targetName}", ${inIndex});\n`;
    }
  });

  if (mode === 'js_toonboom' && edges.length > 0) blocks.push({ id: 'router', text: routingText });
  if (mode === 'js_toonboom') blocks.push({ id: null, text: "    d.setLayout(layout);\n    // d.exec();\n}" });
  else if (mode === 'cs_csharp') blocks.push({ id: null, text: "    }\n}" });
  else if (mode === 'lua_fusion') blocks.push({ id: null, text: "\ncomp:EndUndo(true)\nprint('FlowPins Generation Complete!')" });
  
  return blocks; 
};

  
  


// =============================================================================
//  MAIN APP COMPONENT
// =============================================================================

export default function App() {

  // ---> NEW: SYNCHRONOUS TIME BOMB <---
  // Set to 2020 so it instantly triggers for testing!
  const isExpired = new Date() > new Date('2026-05-15T00:00:00'); 

  if (isExpired) {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#ff4444', marginBottom: '10px' }}>Alpha Build Expired</h1>
        <p style={{ color: '#aaa' }}>This experimental version of FlowPins has expired.</p>
        <p style={{ color: '#aaa' }}>Please contact Alistair for the latest build.</p>
      </div>
    );
  }
  // ------------------------------------

  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<FPNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [activeMode, setActiveMode] = useState<'js_toonboom' | 'py_maya' | 'py_houdini' | 'cs_csharp' | 'lua_fusion' | 'py_standard' | 'gml_standard'>('gml_standard');
  const [isAILoading, setIsAILoading] = useState(false);
  const [evelynMessage, setEvelynMessage] = useState<string | null>(null);
  
  
  
  const [spawnMenu, setSpawnMenu] = useState<{ show: boolean, x: number, y: number, flowX: number, flowY: number } | null>(null);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuSelectedIndex, setMenuSelectedIndex] = useState(0);

  // --- DYNAMIC WIRE ANIMATION ---
  // Watches for node selection and animates only the connected wires
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: selectedNodeId !== null && (edge.source === selectedNodeId || edge.target === selectedNodeId),
      }))
    );
  }, [selectedNodeId, setEdges]);

  const handleAIPrompt = async (prompt: string) => {
    setIsAILoading(true);
    
    // Simulate API delay so the UI feels like Evelyn is "thinking"
    setTimeout(() => {
      // 1. Evelyn reads the prompt
      const parsedRequest = EvelynLibrarian.parsePrompt(prompt);

      
      
      // 2. Evelyn checks her archives for a blueprint
      const blueprint = EvelynLibrarian.buildGraph(parsedRequest);

      if (blueprint) {
        const spawnStamp = Date.now();

        // 3. Build the exact Nodes Evelyn requested
        const generatedNodes: Node<FPNodeData>[] = blueprint.nodes.map((n: any) => {
          const spec = NODE_LIBRARY[n.nodeKind];
          return {
            id: `${n.id}_${spawnStamp}`, 
            type: 'fp', 
            position: { x: n.x, y: n.y },
            data: { 
              label: spec?.title || n.nodeKind, 
              nodeKind: n.nodeKind, 
              profile: spec?.profile || "General", 
              injectedInputs: spec?.inputs || [], 
              injectedOutputs: spec?.outputs || [], 
              // Merge default props with Evelyn's dynamic props!
              props: { ...spec?.default_props, ...n.props } 
            }
          };
        });

        // 4. Connect all the wires exactly as Evelyn requested (Respecting Pin Colors!)
        const generatedEdges: Edge[] = blueprint.edges.map((e: any) => {
          let strokeColor = "#888888"; 
          
          const sourceNode = blueprint.nodes.find((n: any) => n.id === e.source);
          if (sourceNode) {
            const spec = NODE_LIBRARY[sourceNode.nodeKind];
            if (spec) {
              const outPin = spec.outputs?.find((o: any) => o.name === e.sourceHandle);
              if (outPin) {
                if (outPin.pin_type === 'exec') strokeColor = "#ffffff";
                else if (outPin.pin_type === 'string') strokeColor = "#ff007f";
                else if (outPin.pin_type === 'int') strokeColor = "#00e5ff";
                else if (outPin.pin_type === 'bool') strokeColor = "#ff2a2a";
                else if (outPin.pin_type === 'list') strokeColor = "#00d8ff";
              }
            }
          }

          return {
            id: `e_${e.source}_${e.target}_${spawnStamp}`,
            source: `${e.source}_${spawnStamp}`,
            target: `${e.target}_${spawnStamp}`,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            type: 'default',
            animated: false, 
            style: { stroke: strokeColor, strokeWidth: 2 }
          };
        });

        // 5. Drop them onto the canvas!
        setNodes((nds) => [...nds, ...generatedNodes]);
        setEdges((eds) => [...eds, ...generatedEdges]);
        
        // Let Evelyn speak!
        setEvelynMessage(blueprint.message);
        setTimeout(() => setEvelynMessage(null), 6000); // Fades out after 6 seconds
        
      } else {
        setEvelynMessage("I couldn't find a blueprint for that in the archives. Try asking for something like 'Spawn 5 objects'.");
        setTimeout(() => setEvelynMessage(null), 6000);
      }

      setIsAILoading(false);
    }, 800); // 0.8 second fake delay
  };

  const [past, setPast] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const takeSnapshot = useCallback(() => { setPast((p) => [...p, { nodes, edges }]); setFuture([]); }, [nodes, edges]);
  const undo = useCallback(() => { if (past.length === 0) return; const previous = past[past.length - 1]; setFuture((f) => [...f, { nodes, edges }]); setNodes(previous.nodes); setEdges(previous.edges); setPast((p) => p.slice(0, -1)); }, [past, nodes, edges, setNodes, setEdges]);
  const redo = useCallback(() => { if (future.length === 0) return; const next = future[future.length - 1]; setPast((p) => [...p, { nodes, edges }]); setNodes(next.nodes); setEdges(next.edges); setFuture((f) => f.slice(0, -1)); }, [future, nodes, edges, setNodes, setEdges]);

  const onDragOver = useCallback((event: any) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);
  
  const handleDropSpawn = (nodeKind: string, position: {x: number, y: number}) => {
    takeSnapshot();
    const spec = NODE_LIBRARY[nodeKind];
    const newNode: Node<any> = {
      id: `node_${Date.now()}`,
      type: 'fp', 
      position,
      data: { 
        label: spec?.title || nodeKind, 
        nodeKind: nodeKind, 
        profile: spec?.profile || "General", 
        injectedInputs: spec?.inputs || [],
        injectedOutputs: spec?.outputs || [],
        props: { ...spec?.default_props }
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
  
  const codeBlocks = useMemo(() => generateCodeBlocks(nodes, edges, activeMode), [nodes, edges, activeMode]);

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault(); 
    if (!reactFlowInstance) return;
    
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setSpawnMenu({ show: true, x: event.clientX, y: event.clientY, flowX: position.x, flowY: position.y });
    setMenuSearch(""); 
    setMenuSelectedIndex(0);
  }, [reactFlowInstance]);

  const closeMenu = () => setSpawnMenu(null);

  const getActiveAppProfile = (mode: string) => {
    if (mode === 'gml_standard') return 'game maker';
    if (mode === 'js_toonboom') return 'toon boom';
    if (mode === 'py_maya') return 'maya';
    if (mode === 'lua_fusion') return 'fusion';
    if (mode === 'cs_csharp') return 'unity';
    if (mode === 'py_houdini') return 'houdini';
    if (mode === 'py_standard') return 'python';
    return '';
  };

  const filteredMenuNodes = Object.entries(NODE_LIBRARY).filter(([_, spec]: [string, any]) => {
    const c = (spec.profile || "").toLowerCase();
    const isCore = c.startsWith('core');
    const isAppMatch = c.startsWith('app -') && c.includes(getActiveAppProfile(activeMode));
    const matchesSearch = spec.title.toLowerCase().includes(menuSearch.toLowerCase());
    return (isCore || isAppMatch) && matchesSearch;
  });

  useEffect(() => {
    const handleLoadGraph = (_event: any, fileContent: string) => {
      try {
        const parsedData = JSON.parse(fileContent);
        if (parsedData.nodes && parsedData.edges) {
          setNodes(parsedData.nodes);
          setEdges(parsedData.edges);
          setPast([]);
          setFuture([]);
          console.log("FlowPins: Graph loaded successfully!");
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
          content: graphData,
          defaultName: 'my_graph.json',
          filters: [{ name: 'FlowPins Save File', extensions: ['json'] }]
        });

      }   
      else if (command.startsWith('export-')) {
        let targetMode: any = activeMode;
        let ext = 'txt';
        let filterName = 'Script';

        if (command === 'export-js') { targetMode = 'js_toonboom'; ext = 'js'; filterName = 'Toon Boom Script'; }
        else if (command === 'export-py') { targetMode = 'py_maya'; ext = 'py'; filterName = 'Maya Python'; }
        else if (command === 'export-houdini') { targetMode = 'py_houdini'; ext = 'py'; filterName = 'Houdini Python'; }
        else if (command === 'export-py-std') { targetMode = 'py_standard'; ext = 'py'; filterName = 'Python Script'; }
        else if (command === 'export-cs') { targetMode = 'cs_csharp'; ext = 'cs'; filterName = 'C# Script'; }
        else if (command === 'export-lua') { targetMode = 'lua_fusion'; ext = 'lua'; filterName = 'Fusion Lua'; }
        else if (command === 'export-gml') { targetMode = 'gml_standard'; ext = 'gml'; filterName = 'GameMaker Language'; }

        setActiveMode(targetMode);

        const generatedBlocks = generateCodeBlocks(nodes, edges, targetMode);
        const finalScript = generatedBlocks.map(block => block.text).join("\n");

        await window.electron.ipcRenderer.invoke('save-as-dialog', {
          content: finalScript,
          defaultName: `FlowPinsScript.${ext}`,
          filters: [{ name: filterName, extensions: [ext] }]
        });
      }
    };
    
    window.electron.ipcRenderer.on('menu-command', handleMenuCommand);
    return () => { window.electron.ipcRenderer.removeAllListeners('menu-command'); };
  }, [nodes, edges, activeMode]); 

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (spawnMenu) return; 
    if (event.altKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      const modes: typeof activeMode[] = ['js_toonboom', 'py_standard', 'py_maya', 'lua_fusion', 'cs_csharp', 'py_houdini', 'gml_standard'];
      setActiveMode((current) => modes[(modes.indexOf(current) + 1) % modes.length]);
      return; 
    }
    if (event.ctrlKey || event.metaKey) {
      if (event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); }
      if (event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
      if (event.key.toLowerCase() === 'd') {
        event.preventDefault(); takeSnapshot(); 
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          const idMap = new Map<string, string>(); 
          const newNodes = selectedNodes.map(node => {
            const newId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            idMap.set(node.id, newId);
            return { ...node, id: newId, position: { x: node.position.x + 40, y: node.position.y + 40 }, selected: true };
          });
          const newEdges = edges.filter(e => idMap.has(e.source) && idMap.has(e.target)).map(e => ({
            ...e, id: `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, source: idMap.get(e.source)!, target: idMap.get(e.target)!, selected: true
          }));
          setNodes((nds) => [...nds.map(n => ({ ...n, selected: false })), ...newNodes]);
          setEdges((eds) => [...eds.map(e => ({ ...e, selected: false })), ...newEdges]);
        }
      }
    }
  }, [nodes, edges, undo, redo, takeSnapshot, setNodes, setEdges, activeMode, spawnMenu]);

  const onLabelChange = (label: string) => setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, label } } : n));
  const onPropChange = (key: string, value: any) => setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, props: { ...n.data.props, [key]: value } } } : n));
  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  const onConnect = useCallback(
    (params: any) => {
      takeSnapshot(); 
      const sourceNode = nodes.find((n) => n.id === params.source);
      let strokeColor = "#888888"; 
      let strokeWidth = 2;

      if (sourceNode) {
        const nodeKind = sourceNode.data.nodeKind;
        const handleId = params.sourceHandle;
        if (nodeKind === 'const_string') strokeColor = "#ff007f";
        else if (nodeKind === 'const_int') strokeColor = "#00e5ff";
        else if (nodeKind === 'start' || handleId === 'exec_out' || handleId === 'exec') strokeColor = "#ffffff";
        else {
          const spec = NODE_LIBRARY[nodeKind];
          if (spec && spec.outputs) {
            const outputDef = spec.outputs.find((o) => o.name === handleId);
            if (outputDef) {
              if (outputDef.pin_type === 'exec') strokeColor = "#ffffff";
              else if (outputDef.pin_type === 'string') strokeColor = "#ff007f";
              else if (outputDef.pin_type === 'int') strokeColor = "#00e5ff";
            }
          }
        }
      }
      setEdges((eds) => addEdge({ ...params, style: { stroke: strokeColor, strokeWidth } }, eds));
    },
    [nodes, setEdges, takeSnapshot]
  );

  return (
    <div tabIndex={0} onKeyDown={onKeyDown} onClick={closeMenu} style={{ height: "100vh", width: "100vw", display: "flex", background: "#050505", outline: 'none', position: 'relative' }}>
      
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
            autoFocus 
            placeholder="Search nodes..." 
            value={menuSearch}
            onChange={(e) => {
              setMenuSearch(e.target.value);
              setMenuSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setMenuSelectedIndex((prev) => Math.min(prev + 1, filteredMenuNodes.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setMenuSelectedIndex((prev) => Math.max(prev - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredMenuNodes.length > 0) {
                  const selectedNodeKind = filteredMenuNodes[menuSelectedIndex][0];
                  handleDropSpawn(selectedNodeKind, { x: spawnMenu.flowX, y: spawnMenu.flowY });
                  closeMenu();
                }
              }
            }}
            style={{
              background: '#1a1a1a', border: 'none', borderBottom: '1px solid #333',
              color: '#00d8ff', padding: '10px 12px', fontSize: 13, outline: 'none'
            }}
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
                    onClick={() => {
                      handleDropSpawn(kind, { x: spawnMenu.flowX, y: spawnMenu.flowY });
                      closeMenu();
                    }}
                    onMouseEnter={() => setMenuSelectedIndex(index)} 
                    style={{
                      padding: '8px 10px', color: isSelected ? '#fff' : '#ccc', fontSize: 12, cursor: 'pointer',
                      borderRadius: 4, transition: 'background 0.1s',
                      background: isSelected ? '#2a2a2a' : 'transparent',
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
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position:"relative" }} onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlowProvider>
          {/* EVELYN'S NEW VOICE UI */}
          {evelynMessage && (
            <div style={{
              position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0, 216, 255, 0.1)', border: '1px solid #00d8ff', color: '#fff',
              padding: '12px 24px', borderRadius: '8px', zIndex: 1000,
              boxShadow: '0 4px 20px rgba(0, 216, 255, 0.2)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ color: '#00d8ff', fontWeight: 'bold' }}>Evelyn:</span> 
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
            <MiniMap style={{ background: "#111", border: "1px solid #333" }} maskColor="rgba(0,0,0,0.6)" nodeColor="#444"/>
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      
      <NodeInspector node={selectedNode} onChangeLabel={onLabelChange} onChangeProp={onPropChange} />
    </div>
  );
}