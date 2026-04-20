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
import PromptBar from './components/PromptBar';
import { LibraryPanel } from "./components/LibraryPanel";
import { NodeInspector, type FPNodeData } from "./components/NodeInspector";
import { NODE_LIBRARY } from './libraries/index'; // ✅ The full dictionary
import { HARMONY_TRANSLATIONS } from './libraries/translators/harmony';
import { FUSION_TRANSLATIONS } from './libraries/translators/fusion';
import { MAYA_TRANSLATIONS } from './libraries/translators/maya';
import { PYTHON_TRANSLATIONS } from './libraries/translators/python';
import { LOCAL_TEMPLATES } from './libraries/templates';
import { CSHARP_TRANSLATIONS } from "./libraries/translators/csharp";
import { HOUDINI_TRANSLATIONS } from "./libraries/translators/houdini";
import { GML_TRANSLATIONS } from './libraries/translators/gml';
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
//  CODE GENERATOR ENGINE (V2: Fully Recursive)
// =============================================================================

const generateCodeBlocks = (nodes: Node<FPNodeData>[], edges: Edge[], mode: 'js_toonboom' | 'py_maya' | 'py_houdini' | 'cs_csharp' | 'lua_fusion' | 'py_standard' | 'gml_standard'): CodeBlock[] => {
  const blocks: CodeBlock[] = [];
  const processedExecIds = new Set<string>(); // Tracks execution paths to prevent infinite loops

  let headerText = "";
  if (mode === 'js_toonboom') {
    headerText = "function FlowPinsTool() {\n    var d = new QDialog();\n    var layout = new QVBoxLayout();\n";
  } else if (mode === 'py_maya') {
    headerText = "import maya.cmds as cmds\n";
  } else if (mode === 'cs_csharp') {
    headerText = "using System;\n\npublic class FlowPinsTool {\n    public static void Execute() {\n";
  } else if (mode === 'lua_fusion') {
    headerText = "local comp = fusion:GetCurrentComp()\ncomp:StartUndo('FlowPins Build')\n";
  }
  
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

    if (template === undefined) {
        return `${commentPrefix} No ${mode} translation available for ${nodeSpec.title}\n{exec_out}`;
    }

    if (typeof template === 'function') {
        template = template(node.data);
    }

    // --- THE RECURSIVE REGEX ENGINE ---
    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match: string, key: string) => {
      if (key === 'node_id') return "n_" + node.id.replace(/[^a-zA-Z0-9]/g, ""); 

      // 1. CHECK EXECUTION WIRES (The Russian Doll Logic)
      // Look at the node dictionary to see if this tag is an execution port (e.g., 'loop_body', 'true', 'exec_out')
      const outPort = nodeSpec.outputs?.find(o => o.name === key);
      if (outPort && outPort.pin_type === 'exec') {
        // Find the wire connected to this specific port
        const outEdge = edges.find(e => e.source === node.id && e.sourceHandle === key);
        if (outEdge) {
          const nextNode = nodes.find(n => n.id === outEdge.target);
          if (nextNode && !processedExecIds.has(nextNode.id)) {
            processedExecIds.add(nextNode.id);
            // RECURSION: Generate the next node's code and inject it right here!
            return generateNodeCode(nextNode, mode); 
          }
        }
        return ""; // If nothing is plugged in, the tag just cleanly vanishes
      }

      // 2. CHECK DATA WIRES (Variables, Math, Strings)
      // FIX: Removed the loose .includes(key) so "x" doesn't falsely match "exec"!
      const dataEdge = edges.find(e => e.target === node.id && e.targetHandle === key);
      
      if (dataEdge) {
        // --- SPECIAL CASE FOR LOOP INDEX ---
        if (dataEdge.sourceHandle === 'index') {
          return "n_" + dataEdge.source.replace(/[^a-zA-Z0-9]/g, "") + "_i";
        }
        // -----------------------------------

        const sourceNode = nodes.find(n => n.id === dataEdge.source);
        if (sourceNode) {
          const generatedData = generateNodeCode(sourceNode, mode);
          if (generatedData !== undefined && generatedData !== "") return generatedData;
        }
      }

      // 3. CHECK NODE PROPERTIES (User Input in Inspector)
      if (node.data.props && node.data.props[key] !== undefined && node.data.props[key] !== "") {
        return String(node.data.props[key]);
      }

      // 4. FALLBACK TO DEFAULT PROPS
      if (nodeSpec.default_props && nodeSpec.default_props[key] !== undefined) {
        return String(nodeSpec.default_props[key]);
      }

      // 5. X-RAY DEBUGGER
      if (["exec_out", "true_body", "false_body", "loop_body"].includes(key)) {
        return "";
      }
      return "MISSING_" + key.toUpperCase();
    });
  };

  // Kick off the chain reaction from the Start node
  const startNode = nodes.find(n => n.data.nodeKind === 'start');
  if (startNode) {
    processedExecIds.add(startNode.id);
    const fullScript = generateNodeCode(startNode, mode);
    // Push the entire compiled script as a single massive block
    blocks.push({ id: startNode.id, text: fullScript });
  }

  // --- EDGE ROUTING (AUTO-WIRING FOR TOON BOOM) ---
  let routingText = "\n// --- Apply Node Connections ---\n";
  edges.forEach(edge => {
    if (edge.sourceHandle === 'exec_out' || edge.sourceHandle === 'exec') return;
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!sourceNode || !targetNode) return;

    const sourceSpec = NODE_LIBRARY[sourceNode.data.nodeKind];
    const targetSpec = NODE_LIBRARY[targetNode.data.nodeKind];

    if (sourceSpec && targetSpec) {
      const outIndex = Math.max(0, sourceSpec.outputs?.findIndex(o => o.name === edge.sourceHandle));
      const inIndex = Math.max(0, targetSpec.inputs?.findIndex(i => i.name === edge.targetHandle));

      if (mode === 'js_toonboom') {
        const sourceName = "FP_n_" + sourceNode.id.replace(/[^a-zA-Z0-9]/g, "");
        const targetName = "FP_n_" + targetNode.id.replace(/[^a-zA-Z0-9]/g, "");
        routingText += `node.link(node.root() + "/${sourceName}", ${outIndex}, node.root() + "/${targetName}", ${inIndex});\n`;
      }
    }
  });

  if (mode === 'js_toonboom' && edges.length > 0) {
    blocks.push({ id: 'router', text: routingText });
  }

  // FOOTER BLOCK
  if (mode === 'js_toonboom') {
    blocks.push({ id: null, text: "    d.setLayout(layout);\n    // d.exec();\n}" });
  } else if (mode === 'cs_csharp') {
    blocks.push({ id: null, text: "    }\n}" });
  } else if (mode === 'lua_fusion') {
    blocks.push({ id: null, text: "\ncomp:EndUndo(true)\nprint('FlowPins Generation Complete!')" });
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
  const [activeMode, setActiveMode] = useState<'js_toonboom' | 'py_maya' | 'py_houdini' | 'cs_csharp' | 'lua_fusion' | 'py_standard' | 'gml_standard'>('gml_standard');
  const [isAILoading, setIsAILoading] = useState(false);
  
  // --- AI PROMPT HANDLER (LOCAL CACHE LOGIC) ---
  const handleAIPrompt = async (prompt: string) => {
    setIsAILoading(true);
    console.log("User asked for:", prompt);

    // 1. Convert the prompt to lowercase so "Glass" and "glass" both match
    const lowerPrompt = prompt.toLowerCase();

    // 2. THE LOCAL SCANNER
    let matchedTemplate: any = null;

    for (const template of LOCAL_TEMPLATES) {
      // Check if any of our predefined keywords exist in the user's sentence
      const hasMatch = template.keywords.some(kw => lowerPrompt.includes(kw));
      if (hasMatch) {
        matchedTemplate = template;
        break; 
      }
    }

    // 3. Simulate processing time so it feels like AI
    setTimeout(() => {
      if (matchedTemplate) {
        console.log(`Matched local template: ${matchedTemplate.id}`);
        takeSnapshot(); // Save for Undo

        // 👇 1. WE CREATE ONE MASTER ID FOR THIS ENTIRE SPAWN EVENT 👇
        const spawnStamp = Date.now(); 

        // 2. Parse and Build Nodes using the spawnStamp
        const generatedNodes: Node<any>[] = matchedTemplate.nodes.map((n: any) => {
          const spec = NODE_LIBRARY[n.nodeKind];
          return {
            id: `${n.id}_${spawnStamp}`, // Attach the exact stamp here
            type: 'fp',
            position: { x: n.x, y: n.y },
            data: {
              label: spec?.title || n.nodeKind,
              nodeKind: n.nodeKind,
              profile: spec?.profile || "General",
              injectedInputs: spec?.inputs || [],
              injectedOutputs: spec?.outputs || [],
              props: { ...spec?.default_props }
            }
          };
        });

        // 3. Parse and Build Edges using the exact same spawnStamp
        const generatedEdges: Edge[] = matchedTemplate.edges.map((e: any) => ({
          id: `edge_${spawnStamp}_${Math.random().toString(36).substr(2, 5)}`,
          source: `${e.source}_${spawnStamp}`, // Matches the node perfectly!
          target: `${e.target}_${spawnStamp}`, // Matches the node perfectly!
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          style: { stroke: "#ffffff", strokeWidth: 2 }
        }));

        console.log("SPAWNED NODES:", generatedNodes);
        console.log("SPAWNED EDGES:", generatedEdges);

        // 4. Inject onto canvas
        setNodes((nds) => [...nds, ...generatedNodes]);
        
        setTimeout(() => {
          setEdges((eds) => [...eds, ...generatedEdges]);
        }, 50);

      } else {
        // 4. THE CLOUD FALLBACK
        console.warn("No local template found for this prompt.");
        
        setIsAILoading(false); // 1. Unlock the UI immediately
        
        // 2. Wait 50ms so React can actually unlock the text box before the alert freezes the app
        setTimeout(() => {
          alert(`Template not found locally for: "${prompt}"\n\n(In the future, clicking OK would send this prompt to the Cloud AI to generate a custom response!)`);
        }, 50);
        
        return; // Exit early so we don't hit the bottom setIsAILoading again
      }

      setIsAILoading(false);
    }, 800);
  };

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
      console.log("Dropping node:", nodeKind, "Data found:", NODE_LIBRARY[nodeKind]);

      
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
          props: { ...NODE_LIBRARY[nodeKind]?.default_props }
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
          
          // --- THE FIX: Re-inject the pins from the library! ---
          const rebuiltNodes = parsedData.nodes.map((n: any) => {
            const spec = NODE_LIBRARY[n.data.nodeKind];
            return {
              ...n,
              data: {
                ...n.data,
                injectedInputs: spec?.inputs || [],   // Re-attach inputs
                injectedOutputs: spec?.outputs || []  // Re-attach outputs
              }
            };
          });

          setNodes(rebuiltNodes);
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
      
      // --- 1. EXPORT SCRIPT COMMANDS ---
      // --- 1. EXPORT SCRIPT COMMANDS ---
      if (['export-js', 'export-py', 'export-houdini', 'export-cs', 'export-lua', 'export-py-std', 'export-gml'].includes(command)) {
        let mode: 'js_toonboom' | 'py_maya' | 'py_houdini' | 'cs_csharp' | 'lua_fusion' | 'py_standard' | 'gml_standard' = 'js_toonboom';
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
        } else if (command === 'export-gml') {
          mode = 'gml_standard'; defaultName = 'scr_flowpins_logic.gml'; ext = 'gml';
        }

        // Generate Code
        const compiledBlocks = generateCodeBlocks(nodes, edges, activeMode);
        const fullScript = compiledBlocks.map(b => b.text).join('\n'); 
        
        // Copy to clipboard
        navigator.clipboard.writeText(fullScript);
        console.log(`Successfully compiled and copied ${mode} script!`);

        // Trigger Save Dialog
        await window.electron.ipcRenderer.invoke('save-as-dialog', { 
          content: fullScript, 
          defaultName: defaultName, 
          filters: [{ name: 'Script', extensions: [ext] }] 
        });
      }
      
      // --- 2. SAVE GRAPH COMMANDS ---
      if (command === 'save-as' || command === 'save') {
        const graphData = JSON.stringify({ nodes, edges }, null, 2);
        await window.electron.ipcRenderer.invoke('save-as-dialog', {
          content: graphData, 
          defaultName: 'graph.json', 
          filters: [{ name: 'Flow Graph', extensions: ['json'] }]
        });
      }
    };
    
    // Attach and cleanup listener
    window.electron.ipcRenderer.on('menu-command', handleMenuCommand);
    return () => { window.electron.ipcRenderer.removeAllListeners('menu-command'); };
  }, [nodes, edges]);

  // KEYBOARD HANDLER (Undo, Redo, Multi-Duplicate, Language Cycle)
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    
    // --- NEW: Language Cycling (Alt + L) ---
    if (event.altKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      const modes: typeof activeMode[] = ['js_toonboom', 'py_standard', 'py_maya', 'lua_fusion', 'cs_csharp', 'py_houdini', 'gml_standard'];
      
      setActiveMode((current) => {
        const nextIndex = (modes.indexOf(current) + 1) % modes.length;
        return modes[nextIndex];
      });
      return; // Exit early so it doesn't trigger anything else
    }

    if (event.ctrlKey || event.metaKey) {
      // ... your existing Undo/Redo/Duplicate logic stays exactly the same
      
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
      
      {/* --- UPDATE THIS COMPONENT --- */}
      <LibraryPanel 
        width={sidebarWidth} 
        onResize={setSidebarWidth} 
        codeBlocks={codeBlocks} 
        selectedNodeId={selectedNodeId} 
        activeMode={activeMode}       
        setActiveMode={setActiveMode} 
      />
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position:"relative" }} onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlowProvider>
          
          <PromptBar onSubmit={handleAIPrompt} isLoading={isAILoading} />
          

          <ReactFlow
            // ... rest of your ReactFlow code
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