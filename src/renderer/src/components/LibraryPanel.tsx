// src/renderer/src/components/LibraryPanel.tsx
import React, { useState } from 'react';
import { NODE_LIBRARY } from '../libraries/index';

import { HARMONY_TRANSLATIONS } from '../libraries/translators/harmony';
import { FUSION_TRANSLATIONS } from '../libraries/translators/fusion';
import { MAYA_TRANSLATIONS } from '../libraries/translators/maya';
import { PYTHON_TRANSLATIONS } from '../libraries/translators/python';
import { CSHARP_TRANSLATIONS } from '../libraries/translators/csharp';
import { HOUDINI_TRANSLATIONS } from '../libraries/translators/houdini';
import { GML_TRANSLATIONS } from '../libraries/translators/gml';

export type CodeBlock = {
  id: string | null;
  text: string;
};

export interface LibraryPanelProps {
  width: number;
  onResize: (newWidth: number) => void;
  codeBlocks: CodeBlock[];        
  selectedNode: any | null; 
  nodes: any[];  
  edges: any[];  
  activeMode: 'js_toonboom' | 'py_standard' | 'py_maya' | 'cs_csharp' | 'lua_fusion' | 'py_houdini' | 'gml_standard';
  setActiveMode: (mode: any) => void;
}

export const LibraryPanel = ({ 
  width, 
  onResize, 
  codeBlocks, 
  selectedNode,
  nodes, 
  edges, 
  activeMode,
  setActiveMode
}: LibraryPanelProps) => {

  const [activeTab, setActiveTab] = useState<'nodes' | 'code'>('nodes');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // --- NEW: SEARCH & ACCORDION STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // --- CONTEXT-AWARE FILTERING & SORTING ---
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

  const categories = Array.from(new Set(Object.values(NODE_LIBRARY).map((n: any) => n.profile)))
    .filter((cat: any) => {
      const c = (cat || "").toLowerCase();
      if (c.startsWith('core')) return true;
      if (c.startsWith('app -')) return c.includes(getActiveAppProfile(activeMode));
      return true; 
    })
    .sort((a: any, b: any) => {
      const isCoreA = a.toLowerCase().startsWith('core');
      const isCoreB = b.toLowerCase().startsWith('core');
      if (isCoreA && !isCoreB) return -1;
      if (!isCoreA && isCoreB) return 1;
      return a.localeCompare(b);
    });

  const handleCopy = () => {
    const fullText = codeBlocks.map(b => b.text).join("");
    navigator.clipboard.writeText(fullText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeKind: string) => {
    event.dataTransfer.setData('application/reactflow', nodeKind);
    event.dataTransfer.effectAllowed = 'move';
  };

  // --- LIVE X-RAY PARSER UTILS ---
  const evaluateData = (n: any, mode: string): string => {
    const nKind = n.data.nodeKind;
    const nSpec = NODE_LIBRARY[nKind];
    let tDict: Record<string, any> = {};
    if (mode === 'js_toonboom') tDict = HARMONY_TRANSLATIONS;
    if (mode === 'py_maya') tDict = MAYA_TRANSLATIONS;
    if (mode === 'lua_fusion') tDict = FUSION_TRANSLATIONS;
    if (mode === 'py_standard') tDict = PYTHON_TRANSLATIONS;
    if (mode === 'cs_csharp') tDict = CSHARP_TRANSLATIONS;
    if (mode === 'py_houdini') tDict = HOUDINI_TRANSLATIONS;
    if (mode === 'gml_standard') tDict = GML_TRANSLATIONS;

    let t = tDict[nKind];
    if(typeof t === 'function') t = t(n.data);
    if(!t) return "";

    return t.replace(/\{([a-zA-Z0-9_]+)\}/g, (match: string, key: string) => {
        const edge = edges.find((e:any) => e.target === n.id && e.targetHandle === key);
        if (edge) {
            const src = nodes.find((sn:any) => sn.id === edge.source);
            if (src) return evaluateData(src, mode);
        }
        if (n.data.props && n.data.props[key] !== undefined && n.data.props[key] !== "") return String(n.data.props[key]);
        if (nSpec?.default_props && nSpec.default_props[key] !== undefined) return String(nSpec.default_props[key]);
        return match;
    });
  };

  const renderXRayCode = (rawCode: string) => {
    const parts = rawCode.split(/(\{.*?\}|\[\[DATA:.*?\]\]|\[\[PROP:.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        return <span key={i} style={{ color: '#00e5ff', fontWeight: 'bold' }}>{part}</span>; 
      }
      if (part.startsWith('[[DATA:') && part.endsWith(']]')) {
        return <span key={i} style={{ color: '#a8ff00' }}>{part.slice(7, -2)}</span>; 
      }
      if (part.startsWith('[[PROP:') && part.endsWith(']]')) {
        return <span key={i} style={{ color: '#ff9800' }}>{part.slice(7, -2)}</span>; 
      }
      return <span key={i}>{part}</span>;
    });
  };

  let xrayDisplayString = "Select a node on the canvas to view its live template.";
  
  if (selectedNode) {
    const nodeKind = selectedNode.data.nodeKind;
    const spec = NODE_LIBRARY[nodeKind];
    
    let translationDict: Record<string, any> = {};
    if (activeMode === 'js_toonboom') translationDict = HARMONY_TRANSLATIONS;
    if (activeMode === 'py_maya') translationDict = MAYA_TRANSLATIONS;
    if (activeMode === 'lua_fusion') translationDict = FUSION_TRANSLATIONS;
    if (activeMode === 'py_standard') translationDict = PYTHON_TRANSLATIONS;
    if (activeMode === 'cs_csharp') translationDict = CSHARP_TRANSLATIONS;
    if (activeMode === 'py_houdini') translationDict = HOUDINI_TRANSLATIONS;
    if (activeMode === 'gml_standard') translationDict = GML_TRANSLATIONS;

    if (translationDict) {
      let rawTranslation = translationDict[nodeKind];
      if (typeof rawTranslation === "function") {
        rawTranslation = rawTranslation(selectedNode.data);
      }

      if (typeof rawTranslation === "string") {
        xrayDisplayString = rawTranslation.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
          const isExecOut = spec?.outputs?.find(o => o.name === key && o.pin_type === 'exec');
          const isExecIn = spec?.inputs?.find(i => i.name === key && i.pin_type === 'exec');
          if (isExecOut || isExecIn || ["exec_out", "true", "false", "loop_body", "completed", "then_1", "then_2", "then_3"].includes(key)) {
              return match; 
          }

          const dataEdge = edges.find(e => e.target === selectedNode.id && e.targetHandle === key);
          if (dataEdge) {
              const sourceNode = nodes.find(n => n.id === dataEdge.source);
              if (sourceNode) {
                  const evalString = evaluateData(sourceNode, activeMode);
                  return `[[DATA:${evalString}]]`;
              }
          }

          if (selectedNode.data.props && selectedNode.data.props[key] !== undefined && selectedNode.data.props[key] !== "") {
              return `[[PROP:${selectedNode.data.props[key]}]]`;
          }
          if (spec?.default_props && spec.default_props[key] !== undefined) {
              return `[[PROP:${spec.default_props[key]}]]`;
          }

          return match;
        });
      } else {
        xrayDisplayString = `// No native translation found for ${nodeKind} in this target language.`;
      }
    }
  }

  return (
    <div style={{ width: `${width}px`, background: '#111', borderRight: '2px solid #222', display: 'flex', flexDirection: 'column', position: 'relative', minWidth: '150px', height: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#151515', borderBottom: '1px solid #222' }}>
        <div style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>TARGET</div>
        <select value={activeMode} onChange={(e) => setActiveMode(e.target.value as any)} style={{ padding: '4px 8px', background: '#222', color: '#00d8ff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', outline: 'none' }}>
          <option value="gml_standard">GameMaker (GML)</option>
          <option value="js_toonboom">Harmony (JS)</option>
          <option value="py_standard">Python (Std)</option>
          <option value="py_maya">Maya (Py)</option>
          <option value="py_houdini">Houdini (Py)</option>
          <option value="lua_fusion">Fusion (Lua)</option>
          <option value="cs_csharp">Unity (C#)</option>
        </select>
      </div>

      <div style={{ display: 'flex', background: '#080808', borderBottom: '1px solid #222' }}>
        {['nodes', 'code'].map((tab) => (
          <button 
            key={tab} onClick={() => setActiveTab(tab as any)}
            style={{ flex: 1, padding: '12px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', background: activeTab === tab ? '#1a1a1a' : 'transparent', border: 'none', color: activeTab === tab ? '#00d8ff' : '#666', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'nodes' ? (
          <>
            {/* SEARCH BAR */}
            <div style={{ marginBottom: '12px' }}>
              <input 
                type="text" 
                placeholder="Search nodes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', boxSizing: 'border-box', background: '#050505', color: 'white', 
                  padding: '8px 12px', border: '1px solid #444', 
                  borderRadius: '6px', outline: 'none', fontSize: '12px' 
                }}
              />
            </div>

            {/* NODES LIST */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              {categories.map(cat => {
                // 1. Filter nodes in this category by the search query
                const matchingNodes = Object.entries(NODE_LIBRARY)
                  .filter(([_, spec]: [string, any]) => spec.profile === cat)
                  .filter(([_, spec]: [string, any]) => {
                    const searchLower = searchQuery.toLowerCase();
                    return spec.title.toLowerCase().includes(searchLower) || (cat as string).toLowerCase().includes(searchLower);
                  });

                // 2. Hide empty categories when searching
                if (searchQuery && matchingNodes.length === 0) return null;

                // 3. Smart Expand Logic
                const isCore = (cat as string).toLowerCase().startsWith('core');
                const isExpanded = searchQuery 
                  ? true // Always open if searching
                  : (expandedCats[cat as string] !== undefined ? expandedCats[cat as string] : isCore); // Core open by default, Apps closed

                return (
                  <div key={cat as string} style={{ marginBottom: '10px' }}>
                    {/* ACCORDION HEADER */}
                    <div 
                      onClick={() => toggleCategory(cat as string)}
                      style={{ 
                        color: isExpanded ? '#00d8ff' : '#888', 
                        fontSize: '10px', fontWeight: 'bold', marginBottom: '6px', 
                        padding: '8px', background: '#151515', borderRadius: '4px',
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                        border: '1px solid #222', userSelect: 'none', transition: 'all 0.2s'
                      }}
                    >
                      <span>{(cat as string).toUpperCase()}</span>
                      <span style={{ fontSize: '8px', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        ▶
                      </span>
                    </div>

                    {/* NODE LIST (COLLAPSIBLE) */}
                    {isExpanded && (
                      <div style={{ paddingLeft: '4px', paddingRight: '4px' }}>
                        {matchingNodes.map(([kind, spec]: [string, any]) => (
                          <div
                            key={kind} draggable onDragStart={(e) => onDragStart(e, kind)}
                            style={{ 
                              padding: '10px', background: '#1a1a1a', marginBottom: '4px', 
                              borderRadius: '4px', fontSize: '12px', color: '#ccc', 
                              cursor: 'grab', border: '1px solid #222', transition: 'all 0.1s ease-in-out'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#2a2a2a';
                              e.currentTarget.style.borderColor = '#444';
                              e.currentTarget.style.transform = 'translateX(2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#1a1a1a';
                              e.currentTarget.style.borderColor = '#222';
                              e.currentTarget.style.transform = 'translateX(0px)';
                            }}
                          >
                            {spec.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px', fontWeight: 'bold', letterSpacing: '1px' }}>FINAL OUTPUT</div>
              <div style={{ flex: 1, background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px', padding: '12px', overflow: 'auto' }}>
                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', color: '#ddd', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {codeBlocks.map(b => b.text).join("")}
                </pre>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#ff007a', marginBottom: '4px', fontWeight: 'bold', letterSpacing: '1px' }}>X-RAY TRANSPARENCY (LIVE)</div>
              <div style={{ flex: 1, background: '#050505', borderRadius: '4px', border: '1px solid #222', overflow: 'auto', padding: '12px' }}>
                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6', color: '#aaa', whiteSpace: 'pre-wrap' }}>
                  {renderXRayCode(xrayDisplayString)}
                </pre>
              </div>
            </div>

            <button onClick={handleCopy} style={{ padding: '10px', background: copyFeedback ? '#4caf50' : '#00d8ff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s' }}>
              {copyFeedback ? "COPIED!" : "COPY TO CLIPBOARD"}
            </button>
          </div>
        )}
      </div>

      <div 
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startWidth = width;
          const onMouseMove = (moveEvent: MouseEvent) => onResize(Math.max(200, Math.min(600, startWidth + (moveEvent.clientX - startX))));
          const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
          document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
        }}
        style={{ width: '6px', cursor: 'ew-resize', position: 'absolute', right: '-3px', top: 0, bottom: 0, zIndex: 10, background: 'transparent' }}
      />
    </div>
  );
};