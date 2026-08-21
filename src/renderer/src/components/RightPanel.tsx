// src/renderer/src/components/RightPanel.tsx
// ============================================================================
// FLOWPINS: RIGHT PANEL
// Vertically split panel — Properties (top) / Confluence Library (bottom).
// ============================================================================

import React, { useState, useRef, useCallback } from 'react';
import { NodeInspector, type FPNodeData } from './NodeInspector';
import { ConfluenceLibrary } from './ConfluenceLibrary';
import { ConfluenceStore, CONFLUENCE_COLOR, scanPinsFromNodes } from '../libraries/confluence_store';
import { NODE_LIBRARY } from '../libraries/index';
import type { Node } from 'reactflow';
import { alpha } from '../libraries/theme';

interface Props {
  selectedNode:      Node<FPNodeData> | null;
  nodes:             Node<FPNodeData>[];
  edges:             any[];
  onChangeLabel:     (label: string) => void;
  onChangeProp:      (key: string, value: any) => void;
  onDropConfluence:  (confluenceId: string, position: { x: number; y: number }) => void;
  reactFlowInstance: any;
}

const PANEL_WIDTH     = 280;
const MIN_TOP_HEIGHT  = 120;
const MIN_BOT_HEIGHT  = 100;
const DEFAULT_TOP_PCT = 0.45;

export const RightPanel = ({
  selectedNode, nodes, edges,
  onChangeLabel, onChangeProp,
}: Props) => {

  const containerRef = useRef<HTMLDivElement>(null);
  const [topHeightPct, setTopHeightPct] = useState(DEFAULT_TOP_PCT);
  const [refreshToken, setRefreshToken] = useState(0);

  // ── Sash drag ─────────────────────────────────────────────────────────────
  const onSashMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY      = e.clientY;
    const totalHeight = containerRef.current?.clientHeight ?? 600;
    const startPct    = topHeightPct;
    const onMove = (mv: MouseEvent) => {
      const newPct = startPct + (mv.clientY - startY) / totalHeight;
      const minPct = MIN_TOP_HEIGHT / totalHeight;
      const maxPct = 1 - (MIN_BOT_HEIGHT / totalHeight);
      setTopHeightPct(Math.max(minPct, Math.min(maxPct, newPct)));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [topHeightPct]);

  // ── Save selection — auto-scans pins from leftmost/rightmost nodes ────────
  const handleSaveSelection = useCallback((
    title:       string,
    category:    string,
    description: string
  ) => {
    if (title === '__noop__') {
      setRefreshToken(t => t + 1);
      return;
    }

    const selected = nodes.filter(n => n.selected);
    if (selected.length === 0) {
      alert('Select one or more nodes on the canvas first, then save as Confluence.');
      return;
    }

    // Auto-scan pins from NODE_LIBRARY specs
    const { inputPins, outputPins } = scanPinsFromNodes(selected, NODE_LIBRARY);

    ConfluenceStore.createFromSelection(
      title, category, description,
      selected, edges,
      inputPins, outputPins
    );
    setRefreshToken(t => t + 1);
  }, [nodes, edges]);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${PANEL_WIDTH}px`, minWidth: `${PANEL_WIDTH}px`,
        background: 'var(--fp-surface-base)', borderLeft: '2px solid var(--fp-surface-overlay)',
        display: 'flex', flexDirection: 'column',
        height: '100%', overflow: 'hidden', position: 'relative',
      }}
    >
      {/* ── TOP: PROPERTIES ─────────────────────────────────────────────── */}
      <div style={{
        height: `${topHeightPct * 100}%`, minHeight: MIN_TOP_HEIGHT,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '10px 14px 8px', background: 'var(--fp-surface-sunken)',
          borderBottom: '1px solid var(--fp-surface-overlay)', flexShrink: 0,
        }}>
          <div style={{
            fontSize: '10px', fontWeight: 'bold', letterSpacing: '1.5px',
            color: selectedNode ? 'var(--fp-accent-primary)' : 'var(--fp-border-default)',
          }}>
            ⚙ PROPERTIES
          </div>
          {selectedNode && (
            <div style={{ fontSize: '9px', color: 'var(--fp-text-faint)', marginTop: '2px', letterSpacing: '0.5px' }}>
              {selectedNode.data.nodeKind}
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <NodeInspector
            node={selectedNode}
            onChangeLabel={onChangeLabel}
            onChangeProp={onChangeProp}
          />
        </div>
      </div>

      {/* ── SASH ─────────────────────────────────────────────────────────── */}
      <div
        onMouseDown={onSashMouseDown}
        style={{
          height: '6px', flexShrink: 0, cursor: 'ns-resize',
          background: 'var(--fp-surface-raised)', borderTop: `1px solid ${alpha(CONFLUENCE_COLOR, 0.20)}`,
          borderBottom: '1px solid var(--fp-surface-canvas)', position: 'relative', zIndex: 10,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${alpha(CONFLUENCE_COLOR, 0.20)}`; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--fp-surface-raised)'; }}
      >
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex', gap: '3px',
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '3px', height: '3px', borderRadius: '50%',
              background: CONFLUENCE_COLOR + '66',
            }} />
          ))}
        </div>
      </div>

      {/* ── BOTTOM: CONFLUENCE LIBRARY ───────────────────────────────────── */}
      <div style={{
        flex: 1, minHeight: MIN_BOT_HEIGHT,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        <ConfluenceLibrary
          onSaveSelection={handleSaveSelection}
          refreshToken={refreshToken}
        />
      </div>
    </div>
  );
};
