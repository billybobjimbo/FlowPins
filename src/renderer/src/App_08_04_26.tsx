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
import { NODE_LIBRARY } from './libraries/index'; 
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
  const processedExecIds = new Set<string>(); 

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
        if (dataEdge.sourceHandle === 'index') {
          return "n_" + dataEdge.source.replace(/[^a-zA-Z0-9]/g, "") + "_i";
        }
        const sourceNode = nodes.find(n => n.id === dataEdge.source);
        if (sourceNode) {
          const generatedData = generateNodeCode(sourceNode, mode);
          if (generatedData !== undefined && generatedData !== "") return generatedData;
        }
      }

      if (node.data.props && node.data.props[key] !== undefined && node.data.props[key] !== "") {
        return String(node.data.props[key]);
      }

      if (nodeSpec.default_props && nodeSpec.default_props[key] !== undefined) {
        return String(nodeSpec.default_props[key]);
      }

      if (["exec_out", "true_body", "false_body", "loop_body"].includes(key)) {
        return "";
      }
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
  
  const handleAIPrompt = async (prompt: string) => {
    setIsAILoading(true);
    console.log("User asked for:", prompt);

    const lowerPrompt = prompt.toLowerCase();
    let matchedTemplate: any = null;

    for (const template of LOCAL_TEMPLATES) {
      const hasMatch = template.keywords.some(kw => lowerPrompt.includes(kw));
      if (hasMatch) {
        matchedTemplate = template;
        break; 
      }
    }

    setTimeout(() => {
      if (matchedTemplate) {
        console.log(`Matched local template: ${matchedTemplate.id}`);
        takeSnapshot(); 

        const spawnStamp = Date.now(); 

        const generatedNodes: Node<any>[] = matchedTemplate.nodes.map((n: any) => {
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
              props: { ...spec?.default_props }
            }
          };
        });

        const generatedEdges: Edge[] = matchedTemplate.edges.map((e: any) => ({
          id: `edge_${spawnStamp}_${Math.random().toString(36).substr(2, 5)}`,
          source: `${e.source}_${spawnStamp}`, 
          target: `${e.target}_${spawnStamp}`, 
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          style: { stroke: "#ffffff", strokeWidth: 2 }
        }));

        setNodes((nds) => [...nds, ...generatedNodes]);
        
        setTimeout(() => {
          setEdges((eds) => [...eds, ...generatedEdges]);
        }, 50);

      } else {
        console.warn("No local template found for this prompt.");
        setIsAILoading(false); 
        
        setTimeout(() => {
          alert(`Template not found locally for: "${prompt}"\n\n(In the future, clicking OK would send this prompt to the Cloud AI to generate a custom response!)`);
        }, 50);
        return; 
      }
      setIsAILoading(false);
    }, 800);
  };

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

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      const nodeKind = event.dataTransfer.getData('application/reactflow') || event.dataTransfer.getData('text/plain');
      if (!nodeKind || !reactFlowInstance) return;
      
      takeSnapshot(); 
      
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

  useEffect(() => {
    const handleLoadGraph = (_event: any, fileContent: string) => {
      try {
        const parsedData = JSON.parse(fileContent);
        if (parsedData.nodes && parsedData.edges) {
          const rebuiltNodes = parsedData.nodes.map((n: any) => {
            const spec = NODE_LIBRARY[n.data.nodeKind];
            return {
              ...n,
              data: {
                ...n.data,
                injectedInputs: spec?.inputs || [],
                injectedOutputs: spec?.outputs || []
              }
            };
          });

          setNodes(rebuiltNodes);
          setEdges(parsedData.edges);
          setPast([]); 
          setFuture([]);
        }
      } catch (e) { console.error("Load Error:", e); }
    };
    window.electron.ipcRenderer.on('load-graph-data', handleLoadGraph);
    return () => { window.electron.ipcRenderer.removeAllListeners('load-graph-data'); };
  }, [setNodes, setEdges]);

  useEffect(() => {
    const handleMenuCommand = async (_event: any, command: string) => {
      if (['export-js', 'export-py', 'export-houdini', 'export-cs', 'export-lua', 'export-py-std', 'export-gml'].includes(command)) {
        let mode: 'js_toonboom' | 'py_maya' | 'py_houdini' | 'cs_csharp' | 'lua_fusion' | 'py_standard' | 'gml_standard' = 'js_toonboom';
        let defaultName = 'tool.js';
        let ext = 'js';

        if (command === 'export-py') { mode = 'py_maya'; defaultName = 'maya_script.py'; ext = 'py'; }
        else if (command === 'export-houdini') { mode = 'py_houdini'; defaultName = 'houdini_script.py'; ext = 'py'; }
        else if (command === 'export-cs') { mode = 'cs_csharp'; defaultName = 'ToolScript.cs'; ext = 'cs'; }
        else if (command === 'export-lua') { mode = 'lua_fusion'; defaultName = 'fusion_comp.lua'; ext = 'lua'; }
        else if (command === 'export-py-std') { mode = 'py_standard'; defaultName = 'standard_script.py'; ext = 'py'; }
        else if (command === 'export-gml') { mode = 'gml_standard'; defaultName = 'scr_flowpins_logic.gml'; ext = 'gml'; }

        const compiledBlocks = generateCodeBlocks(nodes, edges, activeMode);
        const fullScript = compiledBlocks.map(b => b.text).join('\n'); 
        
        navigator.clipboard.writeText(fullScript);
        
        await window.electron.ipcRenderer.invoke('save-as-dialog', { 
          content: fullScript, 
          defaultName: defaultName, 
          filters: [{ name: 'Script', extensions: [ext] }] 
        });
      }
      
      if (command === 'save-as' || command === 'save') {
        const graphData = JSON.stringify({ nodes, edges }, null, 2);
        await window.electron.ipcRenderer.invoke('save-as-dialog', {
          content: graphData, 
          defaultName: 'graph.json', 
          filters: [{ name: 'Flow Graph', extensions: ['json'] }]
        });
      }
    };
    
    window.electron.ipcRenderer.on('menu-command', handleMenuCommand);
    return () => { window.electron.ipcRenderer.removeAllListeners('menu-command'); };
  }, [nodes, edges, activeMode]);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.altKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      const modes: typeof activeMode[] = ['js_toonboom', 'py_standard', 'py_maya', 'lua_fusion', 'cs_csharp', 'py_houdini', 'gml_standard'];
      
      setActiveMode((current) => {
        const nextIndex = (modes.indexOf(current) + 1) % modes.length;
        return modes[nextIndex];
      });
      return; 
    }

    if (event.ctrlKey || event.metaKey) {
      if (event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if (event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }
      if (event.key.toLowerCase() === 'd') {
        event.preventDefault();
        takeSnapshot(); 
        
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          const idMap = new Map<string, string>(); 
          
          const newNodes = selectedNodes.map(node => {
            const newId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            idMap.set(node.id, newId);
            return {
              ...node,
              id: newId,
              position: { x: node.position.x + 40, y: node.position.y + 40 }, 
              selected: true,
            };
          });

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
  }, [nodes, edges, undo, redo, takeSnapshot, setNodes, setEdges, activeMode]);

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
          <PromptBar onSubmit={handleAIPrompt} isLoading={isAILoading} />

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