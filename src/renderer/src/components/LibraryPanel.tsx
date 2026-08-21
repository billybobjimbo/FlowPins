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

import { HARMONY_TRANSLATIONS }    from '../libraries/translators/harmony';
import { HARMONY_PY_TRANSLATIONS } from '../libraries/translators/harmony_py';
import { PYTHON_TRANSLATIONS }  from '../libraries/translators/python';
import { CSHARP_TRANSLATIONS }  from '../libraries/translators/csharp';
import { GROUP_ORDER, isHiddenProfile, tierLabel } from '../libraries/release';
import { ALL_MODES, MODE_LABELS, type CompileMode } from '../libraries/compiler';
import { SURFACE, BORDER, TEXT, ACCENT, RADIUS, profileColor } from '../libraries/theme';
import { alpha } from '../libraries/theme';
import { profileColorForPanel } from '../libraries/skins';
import { useSkin } from '../libraries/SkinProvider';

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
  activeMode: CompileMode;
  setActiveMode: (mode: any) => void;
}

// ---- HELPERS ----------------------------------------------------------------

const getActiveAppProfile = (mode: string): string => {
  if (mode === 'js_toonboom')  return 'toon boom';
  if (mode === 'py_harmony')   return 'toon boom';
  if (mode === 'py_standard')  return 'python';
  if (mode === 'cs_csharp')    return 'unity';
  return '';
};

// Determines the top-level group a profile belongs to
// e.g. "Core - Math" -> "Core", "Pipeline - Colourspace" -> "Pipeline"
// "App - Toon Boom - Blur" -> "App - Toon Boom"
const getTopGroup = (profile: string): string => {
  const p = profile.toLowerCase();
  if (p.startsWith('core'))     return 'Core';
  if (p.startsWith('pipeline')) return 'Pipeline';
  // App groups: "App - Toon Boom - Blur" -> "App - Toon Boom"
  // "App - Maya" stays as "App - Maya"
  if (p.startsWith('app')) {
    const parts = profile.split(' - ');
    if (parts.length >= 3) return parts.slice(0, 2).join(' - '); // "App - Toon Boom"
    return profile; // "App - Maya" etc stay as-is
  }
  return 'Other';
};

// GROUP_ORDER now lives in release.ts alongside the rest of the release scope.

const getTranslationDict = (mode: string): Record<string, any> => {
  if (mode === 'js_toonboom')  return HARMONY_TRANSLATIONS;
  if (mode === 'py_harmony')   return HARMONY_PY_TRANSLATIONS;
  if (mode === 'py_standard')  return PYTHON_TRANSLATIONS;
  if (mode === 'cs_csharp')    return CSHARP_TRANSLATIONS;
  return {};
};

// ---- PROFILE COLOR (matches FPNode.tsx) ------------------------------------

// resolved per-skin inside the component via profileColorFor()

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

  const skin = useSkin();
  // Panel rows sit on light chrome in the Harmony skin — this resolver
  // uses the lightened variant. FPNode/ConfluenceNode use profileColorFor()
  // directly instead, since canvas nodes are always on a dark body.
  const getProfileColor = (prof: string) => profileColorForPanel(prof, skin);

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
  // Profiles parked for this release (see release.ts) are filtered out here.
  // The nodes themselves stay in NODE_LIBRARY so saved graphs still resolve.
  const allProfiles = Array.from(
    new Set(Object.values(NODE_LIBRARY).map((n: any) => n.profile))
  ).filter((p: any) => !isHiddenProfile(p));

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
          <div style={{ color: 'var(--fp-text-faint)', fontSize: '11px', fontStyle: 'italic' }}>
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
            <span style={{ color: 'var(--fp-text-disabled)', fontSize: '11px', minWidth: '100px' }}>
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
          alignItems: 'baseline', borderBottom: '1px solid var(--fp-surface-raised)',
          paddingBottom: '6px'
        }}>
          <span style={{ 
            color: 'var(--fp-text-disabled)', fontSize: '11px', 
            minWidth: `${maxLen * 7}px`, fontFamily: 'monospace'
          }}>
            {paddedLabel}
          </span>
          <span style={{ 
            color: wireVal ? 'var(--fp-state-success)' : color, 
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
      width: `${width}px`, background: 'var(--fp-surface-base)', borderRight: '2px solid var(--fp-surface-overlay)',
      display: 'flex', flexDirection: 'column', position: 'relative',
      minWidth: '150px', height: '100%'
    }}>

      {/* TARGET SELECTOR */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 12px', background: SURFACE.base, borderBottom: `1px solid ${BORDER.default}`
      }}>
        <div style={{ color: TEXT.muted, fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>TARGET</div>
        <select
          value={activeMode}
          onChange={(e) => setActiveMode(e.target.value as any)}
          style={{
            padding: '4px 8px', background: SURFACE.overlay, color: ACCENT.primary,
            border: `1px solid ${BORDER.strong}`, borderRadius: RADIUS.md, cursor: 'pointer',
            fontSize: '11px', fontWeight: 'bold', outline: 'none'
          }}
        >
          {/* Was nine hardcoded options. Now driven by release.ts, so parked
              targets disappear here the moment their tier changes. */}
          {ALL_MODES.map((mode) => {
            const tag = tierLabel(mode);
            return (
              <option key={mode} value={mode}>
                {MODE_LABELS[mode]}{tag ? '  · experimental' : ''}
              </option>
            );
          })}
        </select>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', background: 'var(--fp-surface-canvas)', borderBottom: '1px solid var(--fp-surface-overlay)' }}>
        {(['nodes', 'code'] as const).map((tab) => (
          <button
            key={tab} onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '12px', fontSize: '11px', fontWeight: 'bold',
              letterSpacing: '1px', background: activeTab === tab ? 'var(--fp-surface-raised)' : 'transparent',
              border: 'none', color: activeTab === tab ? 'var(--fp-accent-primary)' : 'var(--fp-text-disabled)',
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
                  width: '100%', boxSizing: 'border-box', background: 'var(--fp-surface-canvas)',
                  color: 'white', padding: '8px 12px', border: '1px solid var(--fp-border-strong)',
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
                  // Multi-profile app groups (e.g. App - Toon Boom) get sub-accordions
                  // Single-profile app groups (e.g. App - Maya) get a flat list
                  const isMultiProfile = subProfiles.length > 1;

                  // For single-profile flat groups
                  if (!isMultiProfile) {
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
                            color: isTopOpen ? topColor : 'var(--fp-text-muted)',
                            fontSize: '10px', fontWeight: 'bold', padding: '8px 10px',
                            background: 'var(--fp-surface-base)', borderRadius: '4px', cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between',
                            border: `1px solid ${isTopOpen ? topColor + '44' : 'var(--fp-surface-overlay)'}`,
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
                                  padding: '9px 10px', background: 'var(--fp-surface-raised)', marginBottom: '3px',
                                  borderRadius: '4px', fontSize: '12px', color: 'var(--fp-text-primary)',
                                  cursor: 'grab', border: '1px solid var(--fp-surface-overlay)', transition: 'all 0.1s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'var(--fp-surface-overlay)';
                                  e.currentTarget.style.borderColor = topColor + '88';
                                  e.currentTarget.style.transform = 'translateX(2px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'var(--fp-surface-raised)';
                                  e.currentTarget.style.borderColor = 'var(--fp-surface-overlay)';
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

                  // Multi-profile: render as nested accordion (same as Core/Pipeline)
                  const allSubNodes = subProfiles.flatMap(p =>
                    Object.entries(NODE_LIBRARY).filter(([_, s]: [string, any]) => s.profile === p)
                  );
                  const topMatchCount = allSubNodes.filter(([_, s]: [string, any]) =>
                    s.title.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length;
                  if (searchQuery && topMatchCount === 0) return null;

                  return (
                    <div key={topGroup} style={{ marginBottom: '8px' }}>
                      {/* TOP-LEVEL HEADER e.g. APP - TOON BOOM */}
                      <div
                        onClick={() => toggleTop(topGroup)}
                        style={{
                          color: isTopOpen ? topColor : 'var(--fp-text-muted)',
                          fontSize: '10px', fontWeight: 'bold', padding: '8px 10px',
                          background: 'var(--fp-surface-base)', borderRadius: '4px', cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between',
                          border: `1px solid ${isTopOpen ? topColor + '44' : 'var(--fp-surface-overlay)'}`,
                          userSelect: 'none', transition: 'all 0.2s', marginBottom: '4px',
                          letterSpacing: '1px'
                        }}
                      >
                        <span>{topGroup.toUpperCase()}</span>
                        <span style={{ fontSize: '8px', transform: isTopOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                      </div>

                      {/* SUB-GROUP ACCORDIONS e.g. Blur, Colour, Effects */}
                      {isTopOpen && (
                        <div style={{ paddingLeft: '8px', borderLeft: `2px solid ${alpha(topColor, 0.13)}` }}>
                          {subProfiles.map(profile => {
                            const topPrefix = topGroup + ' - ';
                            const subLabel = profile.startsWith(topPrefix)
                              ? profile.slice(topPrefix.length)
                              : profile;
                            const subColor   = getProfileColor(profile);
                            const isSubOpen  = searchQuery ? true : (subExpanded[profile] ?? false);
                            const subNodes   = Object.entries(NODE_LIBRARY)
                              .filter(([_, s]: [string, any]) => s.profile === profile)
                              .filter(([_, s]: [string, any]) =>
                                s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                subLabel.toLowerCase().includes(searchQuery.toLowerCase())
                              );
                            if (searchQuery && subNodes.length === 0) return null;

                            return (
                              <div key={profile} style={{ marginBottom: '4px' }}>
                                <div
                                  onClick={() => toggleSub(profile)}
                                  style={{
                                    color: isSubOpen ? subColor : subColor + 'aa',
                                    fontSize: '10px', fontWeight: 'bold', padding: '6px 8px',
                                    background: 'var(--fp-surface-sunken)', borderRadius: '4px', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between',
                                    border: `1px solid ${isSubOpen ? subColor + '66' : subColor + '22'}`,
                                    userSelect: 'none', transition: 'all 0.2s', marginBottom: '3px',
                                    letterSpacing: '1px'
                                  }}
                                >
                                  <span>{subLabel.toUpperCase()}</span>
                                  <span style={{ fontSize: '7px', transform: isSubOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                                </div>
                                {isSubOpen && (
                                  <div style={{ paddingLeft: '8px' }}>
                                    {subNodes.map(([kind, spec]: [string, any]) => (
                                      <div
                                        key={kind} draggable onDragStart={(e) => onDragStart(e, kind)}
                                        style={{
                                          padding: '8px 10px', background: 'var(--fp-surface-raised)', marginBottom: '3px',
                                          borderRadius: '4px', fontSize: '12px', color: 'var(--fp-text-primary)',
                                          cursor: 'grab', border: `1px solid var(--fp-surface-overlay)`, transition: 'all 0.1s',
                                          borderLeft: `3px solid ${alpha(subColor, 0.40)}`
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = 'var(--fp-surface-overlay)';
                                          e.currentTarget.style.borderColor = subColor + '88';
                                          e.currentTarget.style.transform = 'translateX(2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = 'var(--fp-surface-raised)';
                                          e.currentTarget.style.borderColor = 'var(--fp-surface-overlay)';
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
                }

                // Core and Pipeline — two-level accordion
                return (
                  <div key={topGroup} style={{ marginBottom: '8px' }}>

                    {/* TOP LEVEL HEADER (e.g. CORE / PIPELINE) */}
                    <div
                      onClick={() => toggleTop(topGroup)}
                      style={{
                        color: isTopOpen ? topColor : 'var(--fp-text-disabled)',
                        fontSize: '11px', fontWeight: 'bold', padding: '10px 10px',
                        background: 'var(--fp-surface-sunken)', borderRadius: '4px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between',
                        border: `1px solid ${isTopOpen ? topColor + '66' : 'var(--fp-surface-raised)'}`,
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
                      <div style={{ paddingLeft: '8px', borderLeft: `2px solid ${alpha(topColor, 0.13)}` }}>
                        {subProfiles.map(profile => {
                          // Strip the top-group prefix for the sub-header label
                          // e.g. "Core - Math" → "Math"
                          // "Pipeline - Colourspace" → "Colourspace"
                          // "App - Toon Boom - Blur" → "Blur"
                          const subLabel = (() => {
                            if (!profile.includes(' - ')) return profile;
                            const topPrefix = topGroup + ' - ';
                            if (profile.startsWith(topPrefix)) {
                              return profile.slice(topPrefix.length); // "Blur", "Colour" etc
                            }
                            return profile.split(' - ').slice(1).join(' - ');
                          })();

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
                                  color: isSubOpen ? subColor : subColor + 'aa',
                                  fontSize: '10px', fontWeight: 'bold', padding: '6px 10px',
                                  background: 'var(--fp-surface-base)', borderRadius: '4px', cursor: 'pointer',
                                  display: 'flex', justifyContent: 'space-between',
                                  border: `1px solid ${isSubOpen ? subColor + '66' : subColor + '22'}`,
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
                                        padding: '9px 10px', background: 'var(--fp-surface-raised)', marginBottom: '3px',
                                        borderRadius: '4px', fontSize: '12px', color: 'var(--fp-text-primary)',
                                        cursor: 'grab', border: '1px solid var(--fp-surface-overlay)', transition: 'all 0.1s'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--fp-surface-overlay)';
                                        e.currentTarget.style.borderColor = subColor + '88';
                                        e.currentTarget.style.transform = 'translateX(2px)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'var(--fp-surface-raised)';
                                        e.currentTarget.style.borderColor = 'var(--fp-surface-overlay)';
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
              <div style={{ fontSize: '10px', color: 'var(--fp-text-muted)', marginBottom: '4px', fontWeight: 'bold', letterSpacing: '1px' }}>
                SCRIPT {selectedNode ? '— click a node to jump to its code' : ''}
              </div>
              <div
                ref={codeScrollRef}
                style={{ flex: 1, background: 'var(--fp-surface-canvas)', border: '1px solid var(--fp-surface-overlay)', borderRadius: '4px', overflow: 'auto' }}
              >
                {codeBlocks.map((block, index) => {
                  // Is this block owned by the selected node?
                  const isSelected = selectedNode && block.id === selectedNode.id;
                  // Is this block a file header/footer (id is null)?
                  const isBoilerplate = block.id === null;
                  // Get the node's theme colour for the highlight
                  const blockNode    = nodes.find((n: any) => n.id === block.id);
                  const blockProfile = blockNode?.data?.profile || '';
                  // was a second inline copy of the profile table
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
                        color: isSelected ? 'var(--fp-text-bright)' : isBoilerplate ? 'var(--fp-text-faint)' : 'var(--fp-text-secondary)',
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
                color: selectedNode ? getProfileColor(selectedNode.data.profile || '') : 'var(--fp-text-faint)'
              }}>
                {selectedNode 
                  ? '⚙ ' + selectedNode.data.label.toUpperCase() + ' — ' + selectedNode.data.profile
                  : '⚙ SELECT A NODE TO INSPECT'
                }
              </div>
              <div style={{ 
                flex: 1, background: 'var(--fp-surface-canvas)', borderRadius: '4px', 
                border: '1px solid var(--fp-surface-raised)', overflow: 'auto', padding: '12px'
              }}>
                {selectedNode ? (
                  <div>
                    {buildXRayProps(selectedNode)}
                  </div>
                ) : (
                  <div style={{ color: 'var(--fp-border-default)', fontSize: '11px', fontStyle: 'italic' }}>
                    Click any node on the canvas to see its properties here.
                  </div>
                )}
              </div>
            </div>

            {/* COPY BUTTON */}
            <button
              onClick={handleCopy}
              style={{
                padding: '10px', background: copyFeedback ? 'var(--fp-state-success)' : 'var(--fp-accent-primary)',
                color: 'var(--fp-surface-canvas)', fontWeight: 'bold', border: 'none', flexShrink: 0,
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
