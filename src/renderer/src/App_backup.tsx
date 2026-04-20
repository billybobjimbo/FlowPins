import React, { useMemo, useState, useEffect, useCallback } from "react";
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
import "reactflow/dist/style.css";

import { FPNode } from "./nodes/FPNode";
import { LibraryPanel } from "./components/LibraryPanel";
import { NodeInspector, type FPNodeData } from "./components/NodeInspector";
import { NODE_LIBRARY } from './libraries/NODE_LIBRARY';
import { HARMONY_TRANSLATIONS } from './libraries/translators/harmony';
import { FUSION_TRANSLATIONS } from './libraries/translators/fusion';
import { MAYA_TRANSLATIONS } from './libraries/translators/maya';
import { PYTHON_TRANSLATIONS } from './libraries/translators/python';
// Tell TypeScript about the custom Electron preload object
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

const generateCodeBlocks = (nodes: Node<FPNodeData>[], edges: Edge[], mode: 'js_toonboom' | 'py_maya' | 'py_houdini' | 'cs_csharp' | 'lua_fusion' | 'py_standard'): CodeBlock[] => {
  const blocks: CodeBlock[] = [];
  const processedIds = new Set<string>(); 

  let headerText = "";
  if (mode === 'js_toonboom') {
    headerText = "function FlowPinsTool() {\n    var d = new QDialog();\n    var layout = new QVBoxLayout();\n";
  } else if (mode === 'py_maya') {
    headerText = "import maya.cmds as cmds\n";
  } else if (mode === 'py_houdini') {
    headerText = "import hou\n"; 
  } else if (mode === 'cs_csharp') {
    headerText = "using System;\n\npublic class FlowPinsTool {\n    public static void Execute() {\n";
  } else if (mode === 'lua_fusion') {
    headerText = "local comp = fusion:GetCurrentComp()\nif not comp then\n    print('Please open a composition first.')\n    return\nend\nlocal flow = comp.CurrentFrame.FlowView\ncomp:StartUndo('FlowPins Build')\n";
  } else if (mode === 'py_standard') {
    headerText = "# Auto-Generated Standard Python Script\n";
  }
  
  blocks.push({ id: null, text: headerText });
  
  const isHandleMatch = (handleId: string | null | undefined, key: string, index: number) => {
    if (!handleId && index === 0) return true;
    if (!handleId) return false;
    return handleId === key || handleId.includes(key);
  };

  const generateNodeCode = (node: Node, mode: string): string => {
    const nodeKind = node.data.nodeKind;
    const nodeSpec = NODE_LIBRARY[nodeKind];
    if (!nodeSpec) return "";

    let translationDict: Record<string, any> = {};
    if (mode === 'js_toonboom') translationDict = HARMONY_TRANSLATIONS;
    if (mode === 'py_maya') translationDict = MAYA_TRANSLATIONS;
    if (mode === 'lua_fusion') translationDict = FUSION_TRANSLATIONS;
    if (mode === 'py_standard') translationDict = PYTHON_TRANSLATIONS;

    let template = translationDict[nodeKind];

    // --- UNIVERSAL OVERRIDES (Bypasses missing translation files) ---
    let commentPrefix = "//"; // Default to JS/C#
    if (mode === 'lua_fusion') commentPrefix = "--";
    if (mode.startsWith('py_')) commentPrefix = "#";

    if (nodeKind === 'start') template = `${commentPrefix} Start Execution\n{exec_out}`;
    if (nodeKind === 'tb_end_macro') template = `${commentPrefix} End Macro\n{exec_out}`;

    if (template === undefined) {
        return `-- No ${mode} translation available for ${nodeSpec.title}\n{exec_out}`;
    }

    if (typeof template === 'function') {
        template = template(node.data);
    }

    // --- THE REGEX ENGINE ---
    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match: string, key: string) => {
      // 1. Traverse Execution Wires
      if (key === 'exec_out') {
        return ""; // Stop vacuuming! We handle traversal externally now.
      }

      // 2. Map Canvas Coordinates
      if (key === 'pos_x') return String(Math.round(node.position.x / 100));
      if (key === 'pos_y') return String(Math.round(node.position.y / 100));

      // 3. Check Data Wires (From Const String/Int Nodes)
      const dataEdge = edges.find(e => 
        e.target === node.id && 
        e.targetHandle && 
        (e.targetHandle === key || e.targetHandle.includes(key)) 
      );
      
      if (dataEdge) {
        const sourceNode = nodes.find(n => n.id === dataEdge.source);
        if (sourceNode) {
          const val = sourceNode.data.props?.value ?? NODE_LIBRARY[sourceNode.data.nodeKind]?.default_props?.value;
          if (val !== undefined && val !== "") return String(val);
        }
      }

      // 4. Check Typed Node Properties
      if (node.data.props && node.data.props[key] !== undefined && node.data.props[key] !== "") {
        return String(node.data.props[key]);
      }

      // 5. Fallback to Library Defaults
      if (nodeSpec.default_props && nodeSpec.default_props[key] !== undefined) {
        return String(nodeSpec.default_props[key]);
      }

      // 6. X-RAY DEBUGGER
      return "MISSING_" + key.toUpperCase();
    });
  };

  // --- NEW ISOLATED TRAVERSAL LOGIC ---
  const traverseExecution = (currentNodeId: string) => {
    if (processedIds.has(currentNodeId)) return;
    processedIds.add(currentNodeId);

    const node = nodes.find(n => n.id === currentNodeId);
    if (!node) return;

    // Push this specific node's code as an isolated block
    const nodeCode = generateNodeCode(node, mode);
    if (nodeCode && nodeCode.trim() !== "") {
      blocks.push({ id: currentNodeId, text: nodeCode });
    }

    // Find the next node using our bulletproof ghost-wire check
    const outEdge = edges.find(e => 
      e.source === node.id && 
      (!e.sourceHandle || e.sourceHandle.includes('exec') || (e.targetHandle && e.targetHandle.includes('exec')))
    );

    // Move to the next node
    if (outEdge) {
      traverseExecution(outEdge.target);
    }
  };

  // Kick off the chain reaction
  const startNode = nodes.find(n => n.data.nodeKind === 'start');
  if (startNode) {
    traverseExecution(startNode.id);
  }

  // 👇 FOOTER BLOCK 👇
  if (mode === 'js_toonboom') {
    blocks.push({ id: null, text: "    d.setLayout(layout);\n    // d.exec();\n}" });
  } else if (mode === 'cs_csharp') {
    blocks.push({ id: null, text: "    }\n}" });
  } else if (mode === 'lua_fusion') {
    blocks.push({ id: null, text: "\ncomp:EndUndo(true)\nprint('FlowPins Fusion Generation Complete!')" });
  }
  
  return blocks; 
};

// =============================================================================
//  MAIN APP COMPONENT
// =============================================================================

export default function App() {
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<FPNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [activeMode, setActiveMode] = useState<'js_toonboom' | 'py_maya' | 'py_houdini' | 'cs_csharp' | 'lua_fusion' | 'py_standard'>('js_toonboom');

  // --- UNDO / REDO STATE ---
  const [past, setPast] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
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

  // --- DRAG & DROP ---
  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      const nodeKind = event.dataTransfer.getData('application/reactflow') || event.dataTransfer.getData('text/plain');
      if (!nodeKind || !reactFlowInstance) return;
      
      takeSnapshot(); // Save history before dropping
      
      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newNode: Node<any> = {
        id: `node_${Date.now()}`,
        type: 'fp', 
        position,
        data: { 
          label: NODE_LIBRARY[nodeKind]?.title || nodeKind, 
          nodeKind: nodeKind, 
          profile: NODE_LIBRARY[nodeKind]?.profile || "General", 
          injectedInputs: NODE_LIBRARY[nodeKind]?.inputs || [],
          injectedOutputs: NODE_LIBRARY[nodeKind]?.outputs || [],
          props: {} 
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, takeSnapshot]
  );
  
  const codeBlocks = useMemo(() => generateCodeBlocks(nodes, edges, activeMode), [nodes, edges, activeMode]);

  // IPC: Load Graph
  useEffect(() => {
    const handleLoadGraph = (_event: any, fileContent: string) => {
      try {
        const parsedData = JSON.parse(fileContent);
        if (parsedData.nodes && parsedData.edges) {
          setNodes(parsedData.nodes);
          setEdges(parsedData.edges);
          setPast([]); // Clear history on load
          setFuture([]);
        }
      } catch (e) { console.error("Load Error:", e); }
    };
    window.electron.ipcRenderer.on('load-graph-data', handleLoadGraph);
    return () => { window.electron.ipcRenderer.removeAllListeners('load-graph-data'); };
  }, [setNodes, setEdges]);

  // IPC: Menu Commands
  useEffect(() => {
    const handleMenuCommand = async (_event: any, command: string) => {
      if (['export-js', 'export-py', 'export-houdini', 'export-cs', 'export-lua', 'export-py-std'].includes(command)) {
        let mode: 'js_toonboom' | 'py_maya' | 'py_houdini' | 'cs_csharp' | 'lua_fusion' | 'py_standard' = 'js_toonboom';
        let defaultName = 'tool.js';
        let ext = 'js';

        if (command === 'export-py') {
          mode = 'py_maya'; defaultName = 'maya_script.py'; ext = 'py';
        } else if (command === 'export-houdini') {
          mode = 'py_houdini'; defaultName = 'houdini_script.py'; ext = 'py';
        } else if (command === 'export-cs') {
          mode = 'cs_csharp'; defaultName = 'ToolScript.cs'; ext = 'cs';
        } else if (command === 'export-lua') {
          mode = 'lua_fusion'; defaultName = 'fusion_comp.lua'; ext = 'lua';
        } else if (command === 'export-py-std') {
          mode = 'py_standard'; defaultName = 'standard_script.py'; ext = 'py';
        }

        setActiveMode(mode);

        const fullCode = generateCodeBlocks(nodes, edges, mode).map(b => b.text).join("");
        await window.electron.ipcRenderer.invoke('save-as-dialog', { 
          content: fullCode, 
          defaultName: defaultName, 
          filters: [{ name: 'Script', extensions: [ext] }] 
        });
      }
      
      if (command === 'save-as' || command === 'save') {
        const graphData = JSON.stringify({ nodes, edges }, null, 2);
        await window.electron.ipcRenderer.invoke('save-as-dialog', {
          content: graphData, defaultName: 'graph.json', filters: [{ name: 'Flow Graph', extensions: ['json'] }]
        });
      }
    };
    
    window.electron.ipcRenderer.on('menu-command', handleMenuCommand);
    return () => { window.electron.ipcRenderer.removeAllListeners('menu-command'); };
  }, [nodes, edges]);

  // KEYBOARD HANDLER (Undo, Redo, Multi-Duplicate)
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      
      // Undo (Ctrl+Z) / Redo (Ctrl+Shift+Z)
      if (event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      
      // Redo Alternate (Ctrl+Y)
      if (event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }
      
      // Multi-Node Duplicate (Ctrl+D)
      if (event.key.toLowerCase() === 'd') {
        event.preventDefault();
        takeSnapshot(); // Save history before duplicating
        
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          const idMap = new Map<string, string>(); // Maps old IDs to new IDs
          
          // Duplicate Nodes
          const newNodes = selectedNodes.map(node => {
            const newId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            idMap.set(node.id, newId);
            return {
              ...node,
              id: newId,
              position: { x: node.position.x + 40, y: node.position.y + 40 }, // Offset placement
              selected: true,
            };
          });

          // Duplicate Edges connecting the selected nodes
          const newEdges = edges
            .filter(e => idMap.has(e.source) && idMap.has(e.target))
            .map(e => ({
              ...e,
              id: `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              source: idMap.get(e.source)!,
              target: idMap.get(e.target)!,
              selected: true
            }));

          setNodes((nds) => [...nds.map(n => ({ ...n, selected: false })), ...newNodes]);
          setEdges((eds) => [...eds.map(e => ({ ...e, selected: false })), ...newEdges]);
        }
      }
    }
  }, [nodes, edges, undo, redo, takeSnapshot, setNodes, setEdges]);

  const onLabelChange = (label: string) => setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, label } } : n));
  const onPropChange = (key: string, value: any) => setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, props: { ...n.data.props, [key]: value } } } : n));
  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  // --- SMART WIRE COLORS ---
  const onConnect = useCallback(
    (params: any) => {
      takeSnapshot(); // Save history before making a connection
      const sourceNode = nodes.find((n) => n.id === params.source);
      let strokeColor = "#888888"; // Default grey
      let strokeWidth = 2;

      if (sourceNode) {
        const nodeKind = sourceNode.data.nodeKind;
        const handleId = params.sourceHandle;

        if (nodeKind === 'const_string') strokeColor = "#ff007f";
        else if (nodeKind === 'const_int') strokeColor = "#00e5ff";
        else if (nodeKind === 'start') strokeColor = "#ffffff";
        else if (handleId === 'exec_out' || handleId === 'exec') strokeColor = "#ffffff";
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

      const newEdge = {
        ...params,
        style: { stroke: strokeColor, strokeWidth },
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, setEdges, takeSnapshot]
  );

  return (
    <div tabIndex={0} onKeyDown={onKeyDown} style={{ height: "100vh", width: "100vw", display: "flex", background: "#050505", outline: 'none' }}>
      <LibraryPanel width={sidebarWidth} onResize={setSidebarWidth} codeBlocks={codeBlocks} selectedNodeId={selectedNodeId} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }} onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes} edges={edges} nodeTypes={nodeTypes} 
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_e: React.MouseEvent, n: Node) => setSelectedNodeId(n.id)} 
            onPaneClick={() => setSelectedNodeId(null)}
            onInit={setReactFlowInstance} 
            deleteKeyCode={["Backspace", "Delete"]} 
            onNodesDelete={() => takeSnapshot()}
            onEdgesDelete={() => takeSnapshot()}
            onNodeDragStart={() => takeSnapshot()}
            onSelectionDragStart={() => takeSnapshot()}
            snapToGrid fitView 
            style={{ background: "#050505" }}
            
            // --- NEW MARQUEE & PANNING CONTROLS ---
            panOnDrag={[1, 2]} // 1 = Right Click Pan, 2 = Middle Click Pan
            selectionOnDrag={true} // Left Click Marquee from empty space
            selectionMode={SelectionMode.Partial} // Selects nodes on touch
            selectionKeyCode={null} // Don't require Shift key for marquee
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