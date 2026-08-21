// src/renderer/src/components/ConfluenceLibrary.tsx
// ============================================================================
// FLOWPINS: CONFLUENCE LIBRARY PANEL
// The bottom section of the right panel.
// ============================================================================

import React, { useState, useRef } from 'react';
import { ConfluenceStore, CONFLUENCE_COLOR, type ConfluenceNode } from '../libraries/confluence_store';
import { alpha } from '../libraries/theme';

export const CONFLUENCE_DRAG_KEY = 'application/confluence';

// ── Shared save dialog — used by both the library panel and Ctrl+G shortcut ──
// Exported so App.tsx can render it as an overlay when triggered by Ctrl+G.

interface SaveDialogProps {
  onSave:   (title: string, category: string, description: string) => void;
  onCancel: () => void;
  autoFocusTitle?: boolean;
}

export const ConfluenceSaveDialog = ({ onSave, onCancel, autoFocusTitle = true }: SaveDialogProps) => {
  const [saveTitle,    setSaveTitle]    = useState('');
  const [saveCategory, setSaveCategory] = useState('Custom');
  const [saveDesc,     setSaveDesc]     = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--fp-surface-base)', border: '1px solid var(--fp-border-default)',
    color: 'var(--fp-text-primary)', padding: '6px 8px', borderRadius: '4px',
    fontSize: '11px', marginBottom: '6px', outline: 'none',
  };

  const handleSave = () => {
    if (!saveTitle.trim()) return;
    onSave(saveTitle.trim(), saveCategory.trim() || 'Custom', saveDesc.trim());
  };

  return (
    <div style={{
      padding: '10px', background: 'var(--fp-surface-canvas)',
      borderBottom: `1px solid ${alpha(CONFLUENCE_COLOR, 0.27)}`, flexShrink: 0,
    }}>
      <div style={{
        color: CONFLUENCE_COLOR, fontSize: '9px', fontWeight: 'bold',
        letterSpacing: '1px', marginBottom: '8px',
      }}>
        ◆ NAME THIS CONFLUENCE NODE
      </div>

      <input
        type="text" placeholder="Node title..." value={saveTitle}
        onChange={e => setSaveTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSave()}
        autoFocus={autoFocusTitle}
        style={{ ...inputStyle, border: `1px solid ${alpha(CONFLUENCE_COLOR, 0.40)}` }}
      />
      <input
        type="text" placeholder="Category (e.g. Pipeline - File System)"
        value={saveCategory} onChange={e => setSaveCategory(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text" placeholder="One-line description..."
        value={saveDesc} onChange={e => setSaveDesc(e.target.value)}
        style={inputStyle}
      />

      <div style={{ color: 'var(--fp-border-default)', fontSize: '8px', marginBottom: '8px', lineHeight: '1.4' }}>
        Pins are auto-scanned from the leftmost and rightmost selected nodes.
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={handleSave} disabled={!saveTitle.trim()}
          style={{
            flex: 1, padding: '6px', fontSize: '10px', fontWeight: 'bold',
            background: saveTitle.trim() ? CONFLUENCE_COLOR : 'var(--fp-border-default)',
            color: saveTitle.trim() ? 'var(--fp-text-bright)' : 'var(--fp-text-disabled)',
            border: 'none', borderRadius: '4px',
            cursor: saveTitle.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          SAVE
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: '6px', fontSize: '10px', fontWeight: 'bold',
            background: 'var(--fp-surface-raised)', color: 'var(--fp-text-disabled)',
            border: '1px solid var(--fp-border-default)', borderRadius: '4px', cursor: 'pointer',
          }}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  onSaveSelection: (title: string, category: string, description: string) => void;
  refreshToken:    number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ConfluenceLibrary = ({ onSaveSelection, refreshToken }: Props) => {

  const allNodes   = ConfluenceStore.getAll();
  const categories = ConfluenceStore.getCategories();

  const [expandedCats,    setExpandedCats]    = useState<Record<string, boolean>>({});
  const [showSaveDialog,  setShowSaveDialog]  = useState(false);
  const [hoveredId,       setHoveredId]       = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const prevToken = useRef(refreshToken);
  prevToken.current = refreshToken;

  const toggleCat = (cat: string) =>
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  const onDragStart = (e: React.DragEvent, node: ConfluenceNode) => {
    e.dataTransfer.setData(CONFLUENCE_DRAG_KEY, node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDelete = (id: string) => {
    ConfluenceStore.remove(id);
    setConfirmDeleteId(null);
    onSaveSelection('__noop__', '__noop__', '__noop__');
  };

  const handleExport = (id: string) => {
    const json = ConfluenceStore.exportToJSON(id);
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${id}.confluence`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.confluence,.json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const raw = JSON.parse(ev.target?.result as string);
          ConfluenceStore.importFromJSON(raw);
          onSaveSelection('__noop__', '__noop__', '__noop__');
        } catch { alert('Could not read .confluence file. Is it valid?'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '8px 12px', background: 'var(--fp-surface-sunken)',
        borderTop: `2px solid ${CONFLUENCE_COLOR}`, borderBottom: '1px solid var(--fp-surface-raised)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: CONFLUENCE_COLOR, fontSize: '13px' }}>◆</span>
            <span style={{ color: CONFLUENCE_COLOR, fontSize: '10px', fontWeight: 'bold', letterSpacing: '1.5px' }}>
              CONFLUENCE LIBRARY
            </span>
          </div>
          <button
            onClick={handleImport}
            style={{
              background: 'transparent', border: `1px solid ${alpha(CONFLUENCE_COLOR, 0.27)}`,
              color: CONFLUENCE_COLOR, borderRadius: '3px',
              padding: '2px 7px', fontSize: '10px', cursor: 'pointer',
            }}
          >IMPORT</button>
        </div>
        <div style={{ color: 'var(--fp-border-strong)', fontSize: '9px', letterSpacing: '0.5px' }}>
          Saved node groups — drag onto canvas to place
        </div>
      </div>

      {/* ── SAVE BUTTON ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '6px 10px', flexShrink: 0, borderBottom: '1px solid var(--fp-surface-raised)' }}>
        <button
          onClick={() => setShowSaveDialog(v => !v)}
          style={{
            width: '100%', padding: '6px', fontSize: '10px', fontWeight: 'bold',
            letterSpacing: '1px', background: `${alpha(CONFLUENCE_COLOR, 0.13)}`,
            border: `1px solid ${alpha(CONFLUENCE_COLOR, 0.40)}`, color: CONFLUENCE_COLOR,
            borderRadius: '4px', cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${alpha(CONFLUENCE_COLOR, 0.27)}`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${alpha(CONFLUENCE_COLOR, 0.13)}`; }}
        >
          ◆ SAVE SELECTION AS CONFLUENCE
        </button>
      </div>

      {/* ── SAVE DIALOG ─────────────────────────────────────────────────────── */}
      {showSaveDialog && (
        <ConfluenceSaveDialog
          onSave={(title, category, description) => {
            onSaveSelection(title, category, description);
            setShowSaveDialog(false);
          }}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}

      {/* ── NODE LIST ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {allNodes.length === 0 ? (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--fp-border-default)', fontSize: '11px', lineHeight: '1.6' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--fp-surface-overlay)' }}>◆</div>
            <div>No Confluence nodes yet.</div>
            <div style={{ marginTop: '4px', fontSize: '10px', color: 'var(--fp-surface-overlay)' }}>
              Select nodes on the canvas, then click<br />"Save Selection as Confluence" above.
            </div>
          </div>
        ) : (
          categories.map(cat => {
            const catNodes = allNodes.filter(n => n.category === cat);
            const isOpen   = expandedCats[cat] ?? true;
            return (
              <div key={cat} style={{ marginBottom: '6px' }}>
                <div
                  onClick={() => toggleCat(cat)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 8px', background: 'var(--fp-surface-base)', borderRadius: '4px',
                    cursor: 'pointer', marginBottom: '3px',
                    borderLeft: `3px solid ${CONFLUENCE_COLOR}`,
                  }}
                >
                  <span style={{ color: CONFLUENCE_COLOR, fontSize: '9px', fontWeight: 'bold', letterSpacing: '1px' }}>
                    {cat.toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: '7px', color: 'var(--fp-text-faint)',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s', display: 'inline-block',
                  }}>▶</span>
                </div>

                {isOpen && catNodes.map(cn => {
                  const isHovered    = hoveredId === cn.id;
                  const isConfirming = confirmDeleteId === cn.id;
                  const inputPins    = cn.inputPins  || [];
                  const outputPins   = cn.outputPins || [];

                  return (
                    <div
                      key={cn.id} draggable
                      onDragStart={e => onDragStart(e, cn)}
                      onMouseEnter={() => setHoveredId(cn.id)}
                      onMouseLeave={() => { setHoveredId(null); setConfirmDeleteId(null); }}
                      style={{
                        padding: '8px 10px', marginBottom: '3px', borderRadius: '4px',
                        background: isHovered ? 'var(--fp-surface-raised)' : 'var(--fp-surface-sunken)',
                        border: `1px solid ${isHovered ? CONFLUENCE_COLOR + '55' : 'var(--fp-surface-raised)'}`,
                        outline: isHovered ? `1px solid ${alpha(CONFLUENCE_COLOR, 0.13)}` : 'none',
                        outlineOffset: '2px', cursor: 'grab', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                        <span style={{ color: CONFLUENCE_COLOR, fontSize: '9px', flexShrink: 0 }}>◆</span>
                        <span style={{ color: 'var(--fp-text-primary)', fontSize: '11px', fontWeight: 'bold', flex: 1 }}>
                          {cn.title}
                        </span>
                        <span style={{
                          color: 'var(--fp-border-strong)', fontSize: '8px', background: 'var(--fp-surface-sunken)',
                          border: '1px solid var(--fp-surface-overlay)', borderRadius: '3px', padding: '1px 4px', flexShrink: 0,
                        }}>
                          {cn.nodes.length} nodes
                        </span>
                      </div>

                      {cn.description && (
                        <div style={{ color: 'var(--fp-text-faint)', fontSize: '9px', lineHeight: '1.4', marginBottom: '4px' }}>
                          {cn.description}
                        </div>
                      )}

                      {(inputPins.length > 0 || outputPins.length > 0) && (
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          {inputPins.map((p: any) => (
                            <span key={p.handleId} style={{
                              fontSize: '8px', color: CONFLUENCE_COLOR, background: CONFLUENCE_COLOR + '18',
                              border: `1px solid ${alpha(CONFLUENCE_COLOR, 0.27)}`, borderRadius: '3px', padding: '1px 5px',
                            }}>→ {p.name}</span>
                          ))}
                          {outputPins.map((p: any) => (
                            <span key={p.handleId} style={{
                              fontSize: '8px', color: 'var(--fp-text-muted)', background: 'rgba(136, 136, 136, 0.09)',
                              border: '1px solid rgba(136, 136, 136, 0.27)', borderRadius: '3px', padding: '1px 5px',
                            }}>{p.name} →</span>
                          ))}
                        </div>
                      )}

                      <div style={{ color: CONFLUENCE_COLOR + '66', fontSize: '8px', letterSpacing: '1px' }}>
                        CONFLUENCE
                      </div>

                      {isHovered && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                          <button
                            onClick={e => { e.stopPropagation(); handleExport(cn.id); }}
                            style={{
                              flex: 1, padding: '3px', fontSize: '8px', fontWeight: 'bold',
                              background: 'var(--fp-surface-raised)', border: `1px solid ${alpha(CONFLUENCE_COLOR, 0.27)}`,
                              color: CONFLUENCE_COLOR, borderRadius: '3px', cursor: 'pointer',
                            }}
                          >EXPORT</button>
                          {!isConfirming ? (
                            <button
                              onClick={e => { e.stopPropagation(); setConfirmDeleteId(cn.id); }}
                              style={{
                                flex: 1, padding: '3px', fontSize: '8px', fontWeight: 'bold',
                                background: 'var(--fp-surface-raised)', border: '1px solid rgba(204, 68, 68, 0.27)',
                                color: 'var(--fp-state-danger)', borderRadius: '3px', cursor: 'pointer',
                              }}
                            >DELETE</button>
                          ) : (
                            <button
                              onClick={e => { e.stopPropagation(); handleDelete(cn.id); }}
                              style={{
                                flex: 1, padding: '3px', fontSize: '8px', fontWeight: 'bold',
                                background: 'rgba(204, 68, 68, 0.13)', border: '1px solid var(--fp-state-danger)',
                                color: 'var(--fp-state-danger)', borderRadius: '3px', cursor: 'pointer',
                              }}
                            >CONFIRM</button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
