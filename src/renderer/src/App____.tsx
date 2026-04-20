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
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

import { FPNode } from "./nodes/FPNode";
import { LibraryPanel } from "./components/LibraryPanel";
import { NodeInspector, type FPNodeData } from "./components/NodeInspector";

// IMPORT THE NEW MASTER LIBRARY
import { NODE_LIBRARY } from "./libraries/index";

const nodeTypes = { fp: FPNode };
type CodeBlock = { id: string | null; text: string };

// =============================================================================
//  CODE GENERATOR ENGINE (Updated for Smart Functions)
// =============================================================================

const generateCodeBlocks = (nodes: Node<FPNodeData>[], edges: Edge[], mode: 'js_toonboom' | 'py_maya' | 'py_houdini'): CodeBlock[] => {
  const blocks: CodeBlock[] = [];
  const processedIds = new Set<string>(); 

  // Set the correct header based on the software
  let headerText = "";
  if (mode === 'js_toonboom') {
    headerText = "function FlowPinsTool() {\n    var d = new QDialog();\n    var layout = new QVBoxLayout();\n";
  } else if (mode === 'py_maya') {
    headerText = "import maya.cmds as cmds\n";
  } else if (mode === 'py_houdini') {
    headerText = "import hou\n"; // Houdini's Python API
  }
  
  blocks.push({ id: null, text: headerText });
  
  const isHandleMatch = (handleId: string | null | undefined, key: string, index: number) => {
    if (!handleId && index === 0) return true;
    if (!handleId) return false;
    return handleId === key || handleId.includes(key);
  };

  const generateNodeCode = (nodeId: string): string => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return ""; 

    const spec = NODE_LIBRARY[node.data.nodeKind];
    if (!spec || !spec.translations || !spec.translations[mode]) return "";

    const isFlowControl = spec.inputs.some(p => p.pin_type === 'exec') || spec.outputs.some(p => p.pin_type === 'exec');
    if (isFlowControl && processedIds.has(nodeId)) return ""; 
    if (isFlowControl) processedIds.add(nodeId);

    const template = spec.translations[mode];

    // THE SMART FIX: Handle Function-based translations
    if (typeof template === 'function') {
      return template(node.data);
    }

    // Standard replacement for static strings
    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
      const inputIndex = spec.inputs.findIndex(p => p.name === key);
      const outputIndex = spec.outputs.findIndex(p => p.name === key);

      if (inputIndex !== -1) {
        const inputConn = edges.find(e => e.target === nodeId && isHandleMatch(e.targetHandle, key, inputIndex));
        if (inputConn) {
          const sourceNode = nodes.find(n => n.id === inputConn.source);
          if (sourceNode) {
             if (sourceNode.data.nodeKind === "const_string") return `"${sourceNode.data.props?.value || ""}"`;
             return generateNodeCode(sourceNode.id);
          }
        }
        return node.data.props?.[key] ?? ""; 
      }

      if (outputIndex !== -1) {
        const outputConn = edges.find(e => e.source === nodeId && isHandleMatch(e.sourceHandle, key, outputIndex));
        if (outputConn) {
          const targetNode = nodes.find(n => n.id === outputConn.target);
          if (targetNode) return generateNodeCode(targetNode.id);
        }
        return ""; 
      }
      return "";
    });
  };

  // Rest of the rootNodes logic remains the same...
  const rootNodes = nodes.filter(n => !edges.some(e => e.target === n.id));

  rootNodes.forEach(node => {
    if (!processedIds.has(node.id)) {
      const code = generateNodeCode(node.id);
      if (code && code.trim().length > 0) {
        const cleanCode = code.replace(/^["']|["']$/g, '');
        blocks.push({ id: node.id, text: `    ${cleanCode}\n` });
      }
    }
  });

  if (mode === 'js_toonboom') {
    blocks.push({ id: null, text: "    d.setLayout(layout);\n    // d.exec();\n}\n\nFlowPinsTool();" });
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
  
  // --- DRAG AND DROP SENSORS ---
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      
      // BULLETPROOF FIX: Listen for both ReactFlow format AND plain text
      const nodeKind = event.dataTransfer.getData('application/reactflow') || event.dataTransfer.getData('text/plain');
      
      if (!nodeKind) {
        console.warn("Drop failed: No node data found in drag event.");
        return;
      }
      if (!reactFlowInstance) {
        console.warn("Drop failed: ReactFlow is not initialized.");
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<any> = {
        id: `node_${Date.now()}`,
        type: 'fp', 
        position,
        data: { 
          label: NODE_LIBRARY[nodeKind]?.title || nodeKind, 
          nodeKind: nodeKind, 
          profile: NODE_LIBRARY[nodeKind]?.profile || "General", 
          
          // THE FIX: Point directly to the library instead of 'spec'
          injectedInputs: NODE_LIBRARY[nodeKind]?.inputs || [],
          injectedOutputs: NODE_LIBRARY[nodeKind]?.outputs || [],
          
          
          
          props: {} 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );
  // -----------------------------
  const codeBlocks = useMemo(() => generateCodeBlocks(nodes, edges, 'js_toonboom'), [nodes, edges]);

  // IPC Handlers
  useEffect(() => {
    const handleLoadGraph = (_event: any, fileContent: string) => {
      try {
        const parsedData = JSON.parse(fileContent);
        if (parsedData.nodes && parsedData.edges) {
          setNodes(parsedData.nodes);
          setEdges(parsedData.edges);
        }
      } catch (e) { console.error("Load Error:", e); }
    };
    window.electron.ipcRenderer.on('load-graph-data', handleLoadGraph);
    return () => { window.electron.ipcRenderer.removeAllListeners('load-graph-data'); };
  }, [setNodes, setEdges]);

  useEffect(() => {
    const handleMenuCommand = async (_event: any, command: string) => {
      if (command === 'export-js' || command === 'export-py') {
        const mode = command === 'export-js' ? 'js_toonboom' : 'py_maya';
        const fullCode = generateCodeBlocks(nodes, edges, mode).map(b => b.text).join("");
        await window.electron.ipcRenderer.invoke('save-as-dialog', { 
          content: fullCode, 
          defaultName: mode === 'js_toonboom' ? 'tool.js' : 'script.py', 
          filters: [{ name: 'Script', extensions: [mode === 'js_toonboom' ? 'js' : 'py'] }] 
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

  const onLabelChange = (label: string) => {
    setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, label } } : n));
  };

  const onPropChange = (key: string, value: any) => {
    setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, props: { ...n.data.props, [key]: value } } } : n));
  };

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", background: "#050505" }}>
      <LibraryPanel 
        width={sidebarWidth} 
        onResize={setSidebarWidth} 
        codeBlocks={codeBlocks} 
        selectedNodeId={selectedNodeId} 
      />
      {/* THE FIX: Moved onDrop and onDragOver to the wrapper DIV */}
      <div 
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
            onNodeClick={(_e, n) => setSelectedNodeId(n.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            onInit={setReactFlowInstance} 
            deleteKeyCode={["Backspace", "Delete"]}
            snapToGrid
            fitView
            style={{ background: "#050505" }}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} color="#333" />
            <Controls />
            <MiniMap style={{ background: "#111", border: "1px solid #333" }} maskColor="rgba(0,0,0,0.6)" nodeColor="#444"/>
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      <NodeInspector 
        node={selectedNode}
        onChangeLabel={onLabelChange}
        onChangeProp={onPropChange}
      />
    </div>
  );
}