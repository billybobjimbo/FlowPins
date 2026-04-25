// src/renderer/src/components/LibraryPanel.tsx
// ============================================================================
// FLOWPINS: LIBRARY PANEL
// Renders the node library accordion, live code output, and X-Ray panel.
//
// CATEGORY HIERARCHY:
//   Core        — language-agnostic building blocks (exec, math, logic, etc.)
//   Pipeline    — file system, colourspace, reporting tools
//   App - *     — DCC-specific nodes, filtered by active compile target
//
// To add a new top-level group: add a profile string starting with the
// group name (e.g. "Pipeline - Naming") and update the sort order below.
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { NODE_LIBRARY } from '../libraries/index';

import { HARMONY_TRANSLATIONS } from '../libraries/translators/harmony';
import { FUSION_TRANSLATIONS }  from '../libraries/translators/fusion';
import { MAYA_TRANSLATIONS }    from '../libraries/translators/maya';
import { PYTHON_TRANSLATIONS }  from '../libraries/translators/python';
import { CSHARP_TRANSLATIONS }  from '../libraries/translators/csharp';
import { HOUDINI_TRANSLATIONS } from '../libraries/translators/houdini';
import { GML_TRANSLATIONS }     from '../libraries/translators/gml';

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

// ---- HELPERS ----------------------------------------------------------------

const getActiveAppProfile = (mode: string): string => {
  if (mode === 'gml_standard') return 'game maker';
  if (mode === 'js_toonboom')  return 'toon boom';
  if (mode === 'py_maya')      return 'maya';
  if (mode === 'lua_fusion')   return 'fusion';
  if (mode === 'cs_csharp')    return 'unity';
  if (mode === 'py_houdini')   return 'houdini';
  if (mode === 'py_standard')  return 'python';
  return '';
};

// Determines the top-level group a profile belongs to
// e.g. "Core - Math" -> "Core", "Pipeline - Colourspace" -> "Pipeline"
const getTopGroup = (profile: string): string => {
  const p = profile.toLowerCase();
  if (p.startsWith('core'))     return 'Core';
  if (p.startsWith('pipeline')) return 'Pipeline';
  if (p.startsWith('app'))      return profile; // App groups stay as-is
  return 'Other';
};

// Sort order for top-level groups
const GROUP_ORDER: Record<string, number> = {
  'Core':     0,
  'Pipeline': 1,
};

const getTranslationDict = (mode: string): Record<string, any> => {
  if (mode === 'js_toonboom')  return HARMONY_TRANSLATIONS;
  if (mode === 'py_maya')      return MAYA_TRANSLATIONS;
  if (mode === 'lua_fusion')   return FUSION_TRANSLATIONS;
  if (mode === 'py_standard')  return PYTHON_TRANSLATIONS;
  if (mode === 'cs_csharp')    return CSHARP_TRANSLATIONS;
  if (mode === 'py_houdini')   return HOUDINI_TRANSLATIONS;
  if (mode === 'gml_standard') return GML_TRANSLATIONS;
  return {};
};

// ---- PROFILE COLOR (matches FPNode.tsx) ------------------------------------

const getProfileColor = (profile: string): string => {
  const p = profile.toLowerCase();
  if (p.includes('toon boom') || p.includes('toonboom')) return '#4a83c4';
  if (p.includes('maya'))     return '#c343ea';
  if (p.includes('python'))   return '#2d572c';
  if (p.includes('lua') || p.includes('fusion')) return '#242a59';
  if (p.includes('c#') || p.includes('unity'))   return '#e66900';
  if (p.includes('game') || p.includes('gml'))   return '#00ff8c';
  if (p.includes('pipeline')) return '#f5a623';
  if (p.includes('core'))     return '#aaaaaa';
  return '#ffffff';
};

// ============================================================================
// COMPONENT
// ============================================================================

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

  const [activeTab, setActiveTab]       = useState<'nodes' | 'code'>('nodes');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const codeScrollRef                   = useRef<HTMLDivElement>(null);
  const highlightRef                    = useRef<HTMLDivElement>(null);

  // Auto-scroll to the highlighted node block when selection changes
  useEffect(() => {
    if (activeTab === 'code' && highlightRef.current && codeScrollRef.current) {
      const container = codeScrollRef.current;
      const target    = highlightRef.current;
      container.scrollTo({ top: Math.max(0, target.offsetTop - 60), behavior: 'smooth' });
    }
  }, [selectedNode, activeTab]);

  // Two-level accordion state:
  //   topExpanded  — which top-level groups (Core / Pipeline / App-*) are open
  //   subExpanded  — which sub-categories (Core - Math, etc.) are open
  const [topExpanded, setTopExpanded] = useState<Record<string, boolean>>({ 'Core': true });
  const [subExpanded, setSubExpanded] = useState<Record<string, boolean>>({});

  const toggleTop = (group: string) =>
    setTopExpanded(prev => ({ ...prev, [group]: !prev[group] }));

  const toggleSub = (cat: string) =>
    setSubExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));

  // ---- BUILD CATEGORY TREE -------------------------------------------------

  // All unique profiles — all App groups always visible in the library.
  // The active DCC mode only affects the context menu (right-click spawn),
  // not the library panel, so TDs can browse all nodes at any time.
  const allProfiles = Array.from(
    new Set(Object.values(NODE_LIBRARY).map((n: any) => n.profile))
  );

  // Group profiles into top-level groups
  // Core - Math, Core - Logic → under "Core"
  // Pipeline - Colourspace     → under "Pipeline"
  // App - Toon Boom            → its own top-level entry
  const topGroups: Record<string, string[]> = {};

  allProfiles.forEach((profile: any) => {
    const top = getTopGroup(profile);
    if (!topGroups[top]) topGroups[top] = [];
    if (!topGroups[top].includes(profile)) topGroups[top].push(profile);
  });

  // Sort sub-categories within Core and Pipeline alphabetically
  Object.keys(topGroups).forEach(top => {
    topGroups[top].sort((a, b) => a.localeCompare(b));
  });

  // Sort top-level groups: Core first, Pipeline second, App-* alphabetically
  const sortedTopGroups = Object.keys(topGroups).sort((a, b) => {
    const oa = GROUP_ORDER[a] ?? 99;
    const ob = GROUP_ORDER[b] ?? 99;
    if (oa !== ob) return oa - ob;
    return a.localeCompare(b);
  });

  // ---- DRAG & DROP ---------------------------------------------------------

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeKind: string) => {
    event.dataTransfer.setData('application/reactflow', nodeKind);
    event.dataTransfer.effectAllowed = 'move';
  };

  // ---- COPY ----------------------------------------------------------------

  const handleCopy = () => {
    const fullText = codeBlocks.map(b => b.text).join('');
    navigator.clipboard.writeText(fullText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // ---- X-RAY: PROPERTIES VIEW -------------------------------------------
  // Shows only the editable properties of the selected node.
  // Clean at-a-glance view of what the node is configured to do.

  const buildXRayProps = (node: any) => {
    const spec     = NODE_LIBRARY[node.data.nodeKind];
    const props    = node.data.props || {};
    const profile  = node.data.profile || '';
    const color    = getProfileColor(profile);

    // Get the label width for alignment
    const uiSchema = spec?.ui_schema || [];
    const maxLen   = uiSchema.reduce((max: number, item: any) => 
      Math.max(max, (item.label || '').length), 0);

    if (uiSchema.length === 0) {
      // No editable props — show connected input pins instead
      const connectedInputs = spec?.inputs?.filter((pin: any) => 
        pin.pin_type !== 'exec' && 
        edges.some((e: any) => e.target === node.id && e.targetHandle === pin.name)
      ) || [];

      if (connectedInputs.length === 0) {
        return (
          <div style={{ color: '#555', fontSize: '11px', fontStyle: 'italic' }}>
            No configurable properties.
          </div>
        );
      }

      return connectedInputs.map((pin: any) => {
        const edge       = edges.find((e: any) => e.target === node.id && e.targetHandle === pin.name);
        const sourceNode = edge ? nodes.find((n: any) => n.id === edge.source) : null;
        const value      = sourceNode?.data?.props?.value ?? sourceNode?.data?.label ?? '(wired)';
        return (
          <div key={pin.name} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'baseline' }}>
            <span style={{ color: '#666', fontSize: '11px', minWidth: '100px' }}>
              {pin.name}
            </span>
            <span style={{ color: color, fontSize: '12px', fontWeight: 'bold' }}>
              {String(value)}
            </span>
          </div>
        );
      });
    }

    return uiSchema.map((item: any) => {
      const key         = item.prop_key;
      const label       = item.label || key;
      const currentVal  = props[key] ?? spec?.default_props?.[key] ?? '';
      const paddedLabel = label.padEnd(maxLen, ' ');

      // Check if this prop is also being driven by a wire
      const wireEdge   = edges.find((e: any) => e.target === node.id && e.targetHandle === key);
      const wireSource = wireEdge ? nodes.find((n: any) => n.id === wireEdge.source) : null;
      const wireVal    = wireSource?.data?.props?.value ?? wireSource?.data?.label;

      return (
        <div key={key} style={{ 
          display: 'flex', gap: '8px', marginBottom: '8px', 
          alignItems: 'baseline', borderBottom: '1px solid #1a1a1a',
          paddingBottom: '6px'
        }}>
          <span style={{ 
            color: '#666', fontSize: '11px', 
            minWidth: `${maxLen * 7}px`, fontFamily: 'monospace'
          }}>
            {paddedLabel}
          </span>
          <span style={{ 
            color: wireVal ? '#a8ff00' : color, 
            fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace'
          }}>
            {wireVal ? String(wireVal) + ' ⟵ wired' : String(currentVal)}
          </span>
        </div>
      );
    });
  };

  // ---- RENDER --------------------------------------------------------------

  return (
    <div style={{
      width: `${width}px`, background: '#111', borderRight: '2px solid #222',
      display: 'flex', flexDirection: 'column', position: 'relative',
      minWidth: '150px', height: '100%'
    }}>

      {/* TARGET SELECTOR */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 12px', background: '#151515', borderBottom: '1px solid #222'
      }}>
        <div style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>TARGET</div>
        <select
          value={activeMode}
          onChange={(e) => setActiveMode(e.target.value as any)}
          style={{
            padding: '4px 8px', background: '#222', color: '#00d8ff',
            border: '1px solid #444', borderRadius: '4px', cursor: 'pointer',
            fontSize: '11px', fontWeight: 'bold', outline: 'none'
          }}
        >
          <option value="gml_standard">GameMaker (GML)</option>
          <option value="js_toonboom">Harmony (JS)</option>
          <option value="py_standard">Python (Std)</option>
          <option value="py_maya">Maya (Py)</option>
          <option value="py_houdini">Houdini (Py)</option>
          <option value="lua_fusion">Fusion (Lua)</option>
          <option value="cs_csharp">Unity (C#)</option>
        </select>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', background: '#080808', borderBottom: '1px solid #222' }}>
        {(['nodes', 'code'] as const).map((tab) => (
          <button
            key={tab} onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '12px', fontSize: '11px', fontWeight: 'bold',
              letterSpacing: '1px', background: activeTab === tab ? '#1a1a1a' : 'transparent',
              border: 'none', color: activeTab === tab ? '#00d8ff' : '#666',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* PANEL BODY */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '10px',
        position: 'relative', display: 'flex', flexDirection: 'column'
      }}>

        {activeTab === 'nodes' ? (
          <>
            {/* SEARCH */}
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box', background: '#050505',
                  color: 'white', padding: '8px 12px', border: '1px solid #444',
                  borderRadius: '6px', outline: 'none', fontSize: '12px'
                }}
              />
            </div>

            {/* TWO-LEVEL ACCORDION */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              {sortedTopGroups.map(topGroup => {
                const subProfiles = topGroups[topGroup];
                const topColor    = getProfileColor(subProfiles[0] || topGroup);
                const isTopOpen   = searchQuery ? true : (topExpanded[topGroup] ?? (topGroup === 'Core'));

                // For App-* groups (single profile, no sub-categories)
                const isAppGroup  = topGroup.toLowerCase().startsWith('app');

                if (isAppGroup) {
                  const profile = subProfiles[0];
                  const matchingNodes = Object.entries(NODE_LIBRARY)
                    .filter(([_, s]: [string, any]) => s.profile === profile)
                    .filter(([_, s]: [string, any]) =>
                      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      profile.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                  if (searchQuery && matchingNodes.length === 0) return null;

                  return (
                    <div key={topGroup} style={{ marginBottom: '8px' }}>
                      <div
                        onClick={() => toggleTop(topGroup)}
                        style={{
                          color: isTopOpen ? topColor : '#888',
                          fontSize: '10px', fontWeight: 'bold', padding: '8px 10px',
                          background: '#151515', borderRadius: '4px', cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between',
                          border: `1px solid ${isTopOpen ? topColor + '44' : '#222'}`,
                          userSelect: 'none', transition: 'all 0.2s', marginBottom: '4px'
                        }}
                      >
                        <span>{topGroup.toUpperCase()}</span>
                        <span style={{ fontSize: '8px', transform: isTopOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                      </div>
                      {isTopOpen && (
                        <div style={{ paddingLeft: '8px' }}>
                          {matchingNodes.map(([kind, spec]: [string, any]) => (
                            <div
                              key={kind} draggable onDragStart={(e) => onDragStart(e, kind)}
                              style={{
                                padding: '9px 10px', background: '#1a1a1a', marginBottom: '3px',
                                borderRadius: '4px', fontSize: '12px', color: '#ccc',
                                cursor: 'grab', border: '1px solid #222', transition: 'all 0.1s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#2a2a2a';
                                e.currentTarget.style.borderColor = topColor + '88';
                                e.currentTarget.style.transform = 'translateX(2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#1a1a1a';
                                e.currentTarget.style.borderColor = '#222';
                                e.currentTarget.style.transform = 'translateX(0)';
                              }}
                            >
                              {spec.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Core and Pipeline — two-level accordion
                return (
                  <div key={topGroup} style={{ marginBottom: '8px' }}>

                    {/* TOP LEVEL HEADER (e.g. CORE / PIPELINE) */}
                    <div
                      onClick={() => toggleTop(topGroup)}
                      style={{
                        color: isTopOpen ? topColor : '#666',
                        fontSize: '11px', fontWeight: 'bold', padding: '10px 10px',
                        background: '#0d0d0d', borderRadius: '4px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between',
                        border: `1px solid ${isTopOpen ? topColor + '66' : '#1a1a1a'}`,
                        userSelect: 'none', transition: 'all 0.2s',
                        marginBottom: isTopOpen ? '4px' : '0',
                        letterSpacing: '1px'
                      }}
                    >
                      <span>{topGroup.toUpperCase()}</span>
                      <span style={{ fontSize: '8px', transform: isTopOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                    </div>

                    {/* SUB-CATEGORIES */}
                    {isTopOpen && (
                      <div style={{ paddingLeft: '8px', borderLeft: `2px solid ${topColor}22` }}>
                        {subProfiles.map(profile => {
                          // Strip the top-group prefix for the sub-header label
                          // e.g. "Core - Math" → "Math", "Pipeline - Colourspace" → "Colourspace"
                          const subLabel = profile.includes(' - ')
                            ? profile.split(' - ').slice(1).join(' - ')
                            : profile;

                          const subColor = getProfileColor(profile);
                          const isSubOpen = searchQuery
                            ? true
                            : (subExpanded[profile] !== undefined ? subExpanded[profile] : false);

                          const matchingNodes = Object.entries(NODE_LIBRARY)
                            .filter(([_, s]: [string, any]) => s.profile === profile)
                            .filter(([_, s]: [string, any]) =>
                              s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              subLabel.toLowerCase().includes(searchQuery.toLowerCase())
                            );

                          if (searchQuery && matchingNodes.length === 0) return null;

                          return (
                            <div key={profile} style={{ marginBottom: '4px' }}>

                              {/* SUB HEADER */}
                              <div
                                onClick={() => toggleSub(profile)}
                                style={{
                                  color: isSubOpen ? subColor : '#666',
                                  fontSize: '10px', fontWeight: 'bold', padding: '6px 10px',
                                  background: '#151515', borderRadius: '4px', cursor: 'pointer',
                                  display: 'flex', justifyContent: 'space-between',
                                  border: `1px solid ${isSubOpen ? subColor + '33' : '#222'}`,
                                  userSelect: 'none', transition: 'all 0.2s',
                                  marginBottom: isSubOpen ? '3px' : '0'
                                }}
                              >
                                <span>{subLabel.toUpperCase()}</span>
                                <span style={{ fontSize: '7px', transform: isSubOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                              </div>

                              {/* NODE LIST */}
                              {isSubOpen && (
                                <div style={{ paddingLeft: '8px' }}>
                                  {matchingNodes.map(([kind, spec]: [string, any]) => (
                                    <div
                                      key={kind} draggable onDragStart={(e) => onDragStart(e, kind)}
                                      style={{
                                        padding: '9px 10px', background: '#1a1a1a', marginBottom: '3px',
                                        borderRadius: '4px', fontSize: '12px', color: '#ccc',
                                        cursor: 'grab', border: '1px solid #222', transition: 'all 0.1s'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#2a2a2a';
                                        e.currentTarget.style.borderColor = subColor + '88';
                                        e.currentTarget.style.transform = 'translateX(2px)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#1a1a1a';
                                        e.currentTarget.style.borderColor = '#222';
                                        e.currentTarget.style.transform = 'translateX(0)';
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
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (

          /* CODE TAB — Node-aware script view */
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>

            {/* SCRIPT VIEW with node highlighting */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 2, minHeight: 0 }}>
              <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px', fontWeight: 'bold', letterSpacing: '1px' }}>
                SCRIPT {selectedNode ? '— click a node to jump to its code' : ''}
              </div>
              <div
                ref={codeScrollRef}
                style={{ flex: 1, background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px', overflow: 'auto' }}
              >
                {codeBlocks.map((block, index) => {
                  // Is this block owned by the selected node?
                  const isSelected = selectedNode && block.id === selectedNode.id;
                  // Is this block a file header/footer (id is null)?
                  const isBoilerplate = block.id === null;
                  // Get the node's theme colour for the highlight
                  const blockNode    = nodes.find((n: any) => n.id === block.id);
                  const blockProfile = blockNode?.data?.profile || '';
                  const getProfileColor = (p: string) => {
                    const pl = p.toLowerCase();
                    if (pl.includes('toon boom'))  return '#4a83c4';
                    if (pl.includes('maya'))        return '#c343ea';
                    if (pl.includes('houdini'))     return '#c343ea';
                    if (pl.includes('fusion'))      return '#242a59';
                    if (pl.includes('unity'))       return '#e66900';
                    if (pl.includes('game maker'))  return '#00ff8c';
                    if (pl.includes('pipeline'))    return '#f5a623';
                    if (pl.includes('core'))        return '#4a9eff';
                    return '#4a9eff';
                  };
                  const blockColor = getProfileColor(blockProfile);

                  return (
                    <div
                      key={index}
                      ref={isSelected ? highlightRef : null}
                      style={{
                        position: 'relative',
                        background: isSelected ? blockColor + '18' : 'transparent',
                        borderLeft: isSelected ? '3px solid ' + blockColor : '3px solid transparent',
                        transition: 'all 0.2s ease',
                        padding: '6px 12px',
                        margin: 0,
                      }}
                    >
                      {/* Node label badge on highlighted block */}
                      {isSelected && blockNode && (
                        <div style={{
                          position: 'absolute', top: 4, right: 8,
                          fontSize: '9px', color: blockColor, fontWeight: 'bold',
                          letterSpacing: '1px', opacity: 0.8,
                          textTransform: 'uppercase'
                        }}>
                          {blockNode.data.label}
                        </div>
                      )}
                      <pre style={{
                        margin: 0,
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        color: isSelected ? '#fff' : isBoilerplate ? '#555' : '#bbb',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6'
                      }}>
                        {block.text}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-RAY PROPERTIES PANEL */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ 
                fontSize: '10px', marginBottom: '4px', fontWeight: 'bold', 
                letterSpacing: '1px',
                color: selectedNode ? getProfileColor(selectedNode.data.profile || '') : '#555'
              }}>
                {selectedNode 
                  ? '⚙ ' + selectedNode.data.label.toUpperCase() + ' — ' + selectedNode.data.profile
                  : '⚙ SELECT A NODE TO INSPECT'
                }
              </div>
              <div style={{ 
                flex: 1, background: '#050505', borderRadius: '4px', 
                border: '1px solid #1a1a1a', overflow: 'auto', padding: '12px'
              }}>
                {selectedNode ? (
                  <div>
                    {buildXRayProps(selectedNode)}
                  </div>
                ) : (
                  <div style={{ color: '#333', fontSize: '11px', fontStyle: 'italic' }}>
                    Click any node on the canvas to see its properties here.
                  </div>
                )}
              </div>
            </div>

            {/* COPY BUTTON */}
            <button
              onClick={handleCopy}
              style={{
                padding: '10px', background: copyFeedback ? '#4caf50' : '#00d8ff',
                color: '#000', fontWeight: 'bold', border: 'none', flexShrink: 0,
                borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s'
              }}
            >
              {copyFeedback ? 'COPIED!' : 'COPY TO CLIPBOARD'}
            </button>
          </div>
        )}
      </div>

      {/* RESIZE HANDLE */}
      <div
        onMouseDown={(e) => {
          const startX     = e.clientX;
          const startWidth = width;
          const onMouseMove = (ev: MouseEvent) => onResize(Math.max(200, Math.min(600, startWidth + (ev.clientX - startX))));
          const onMouseUp   = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        }}
        style={{ width: '6px', cursor: 'ew-resize', position: 'absolute', right: '-3px', top: 0, bottom: 0, zIndex: 10, background: 'transparent' }}
      />
    </div>
  );
};
