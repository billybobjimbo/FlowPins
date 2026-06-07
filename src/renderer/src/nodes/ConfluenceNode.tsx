// src/renderer/src/nodes/ConfluenceNode.tsx
// ============================================================================
// FLOWPINS: CONFLUENCE NODE — CANVAS COMPONENT
//
// Handle alignment strategy: handles are rendered INSIDE each pin label row
// using position:absolute on the row container. This guarantees the handle
// dot is always exactly beside its label regardless of node height or
// pin count — no pixel offset guessing required.
// ============================================================================

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

export const CONFLUENCE_COLOR = '#536878';

export type ConfluencePin = {
  name:     string;
  pinType:  string;
  handleId: string;
};

export type ConfluenceNodeData = {
  label:          string;
  confluenceId:   string;
  description:    string;
  category:       string;
  innerNodeCount: number;
  innerWireCount: number;
  nodeKind:       'confluence';
  inputPins?:     ConfluencePin[];
  outputPins?:    ConfluencePin[];
};

// ── Colour lookup — matches FPNode.tsx exactly ────────────────────────────────
export function pinColor(pinType: string): string {
  if (pinType === 'exec')                          return '#ffffff';
  if (pinType === 'string')                        return '#ff007f';
  if (pinType === 'int' || pinType === 'float'
      || pinType === 'number')                     return '#00e5ff';
  if (pinType === 'boolean')                       return '#ff2a2a';
  if (pinType === 'list')                          return '#00d8ff';
  if (pinType === 'any')                           return '#826cf3';
  return '#888888';
}

const PIN_ROW_H = 28;   // px per pin row — matches gap in label column
const HEADER_H  = 54;   // px — outer padding (3) + inner top padding (10)
                        //      + title line (~22) + sub-label (~10) + border (1) + bottom pad (8)

// ============================================================================
// COMPONENT
// ============================================================================

export const ConfluenceNode = memo(function ConfluenceNode(
  props: NodeProps<ConfluenceNodeData>
) {
  const { data, selected } = props;

  // exec_in / exec_out are always first — guarantee them even on legacy
  // saved groups that predate this requirement.
  const EXEC_IN  = { name: 'exec_in',  pinType: 'exec', handleId: 'input_0_exec_in'  };
  const EXEC_OUT = { name: 'exec_out', pinType: 'exec', handleId: 'output_0_exec_out' };

  const rawInputs  = data.inputPins  || [];
  const rawOutputs = data.outputPins || [];

  const hasExecIn  = rawInputs.some((p: any)  => p.pinType === 'exec' || p.name === 'exec_in');
  const hasExecOut = rawOutputs.some((p: any) => p.pinType === 'exec' || p.name === 'exec_out');

  const inputs  = hasExecIn  ? rawInputs  : [EXEC_IN,  ...rawInputs];
  const outputs = hasExecOut ? rawOutputs : [EXEC_OUT, ...rawOutputs];
  const pinRows = Math.max(inputs.length, outputs.length, 1);

  const outerBorder = selected
    ? `2px solid ${CONFLUENCE_COLOR}`
    : `2px solid ${CONFLUENCE_COLOR}55`;

  const outerGlow = selected
    ? `0 0 18px ${CONFLUENCE_COLOR}44, 0 6px 24px rgba(0,0,0,0.6)`
    : `0 6px 24px rgba(0,0,0,0.5)`;

  return (
    <div style={{
      border:       outerBorder,
      borderRadius: '14px',
      padding:      '3px',
      background:   'transparent',
      boxShadow:    outerGlow,
      transition:   'all 0.2s ease',
      minWidth:     '240px',
      position:     'relative',
    }}>

      {/* ── Inner ring ────────────────────────────────────────────────────── */}
      <div style={{
        border:       `1px solid ${CONFLUENCE_COLOR}33`,
        borderRadius: '11px',
        background:   'rgba(16, 20, 24, 0.97)',
        overflow:     'hidden',
        position:     'relative',
      }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{
          background:   `linear-gradient(135deg, ${CONFLUENCE_COLOR}33 0%, ${CONFLUENCE_COLOR}18 100%)`,
          borderBottom: `1px solid ${CONFLUENCE_COLOR}44`,
          padding:      '10px 14px 8px',
          position:     'relative',
        }}>
          <div style={{
            position: 'absolute', top: '8px', right: '10px',
            color: CONFLUENCE_COLOR, fontSize: '11px',
            opacity: selected ? 1 : 0.7,
          }}>◆</div>

          <div style={{
            fontSize: '14px', fontWeight: 800,
            color: selected ? '#ffffff' : '#cccccc',
            paddingRight: '20px', letterSpacing: '0.2px',
          }}>
            {data.label}
          </div>

          <div style={{
            fontSize: '9px', fontWeight: 'bold',
            color: CONFLUENCE_COLOR, letterSpacing: '1.5px',
            marginTop: '2px', textTransform: 'uppercase',
          }}>
            CONFLUENCE
          </div>
        </div>

        {/* ── Pin rows ─────────────────────────────────────────────────────── */}
        {/* Each row is a fixed-height flex row. The Handle sits inside the   */}
        {/* row using position:absolute so it's always vertically centred     */}
        {/* with its label — no pixel offset from top of node required.       */}
        <div style={{ padding: '8px 0' }}>
          {Array.from({ length: pinRows }).map((_, i) => {
            const inp = inputs[i]  || null;
            const out = outputs[i] || null;

            return (
              <div
                key={i}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  height:         `${PIN_ROW_H}px`,
                  position:       'relative',
                  paddingLeft:    '14px',
                  paddingRight:   '14px',
                }}
              >
                {/* ── Input handle + label ─────────────────────────────── */}
                {inp ? (
                  <>
                    {/* Handle rendered relative to this row */}
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={inp.handleId}
                      style={{
                        position:     'absolute',
                        left:         '-5px',
                        top:          '50%',
                        transform:    'translateY(-50%)',
                        width:        inp.pinType === 'exec' ? 12 : 10,
                        height:       inp.pinType === 'exec' ? 12 : 10,
                        borderRadius: inp.pinType === 'exec' ? 2 : 999,
                        background:   pinColor(inp.pinType),
                        border:       '1px solid #000',
                      }}
                    />
                    <span style={{
                      fontSize:  '10px',
                      color:     pinColor(inp.pinType),
                      flex:      1,
                      textAlign: 'left',
                    }}>
                      {inp.name}
                    </span>
                  </>
                ) : (
                  <span style={{ flex: 1 }} />
                )}

                {/* ── Centre spacer / stats (first row only) ───────────── */}
                {i === 0 && (
                  <div style={{
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'center',
                    gap:            '2px',
                    flex:           '0 0 auto',
                    padding:        '0 6px',
                  }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      <span style={{
                        background:   '#0d0d0d',
                        border:       `1px solid ${CONFLUENCE_COLOR}44`,
                        borderRadius: '3px',
                        padding:      '1px 5px',
                        fontSize:     '8px',
                        color:        CONFLUENCE_COLOR,
                        fontWeight:   'bold',
                      }}>
                        {data.innerNodeCount}n
                      </span>
                      <span style={{
                        background:   '#0d0d0d',
                        border:       '1px solid #1e1e1e',
                        borderRadius: '3px',
                        padding:      '1px 5px',
                        fontSize:     '8px',
                        color:        '#333',
                      }}>
                        {data.innerWireCount}w
                      </span>
                    </div>
                    <span style={{ fontSize: '7px', color: '#2a2a2a', fontStyle: 'italic' }}>
                      dbl-click
                    </span>
                  </div>
                )}

                {/* ── Output label + handle ────────────────────────────── */}
                {out ? (
                  <>
                    <span style={{
                      fontSize:  '10px',
                      color:     pinColor(out.pinType),
                      flex:      1,
                      textAlign: 'right',
                    }}>
                      {out.name}
                    </span>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={out.handleId}
                      style={{
                        position:     'absolute',
                        right:        '-5px',
                        top:          '50%',
                        transform:    'translateY(-50%)',
                        width:        out.pinType === 'exec' ? 12 : 10,
                        height:       out.pinType === 'exec' ? 12 : 10,
                        borderRadius: out.pinType === 'exec' ? 2 : 999,
                        background:   pinColor(out.pinType),
                        border:       '1px solid #000',
                      }}
                    />
                  </>
                ) : (
                  <span style={{ flex: 1 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Description + Category ───────────────────────────────────────── */}
        {(data.description || data.category) && (
          <div style={{
            padding:      '4px 14px 8px',
            borderTop:    '1px solid #111',
          }}>
            {data.description && (
              <div style={{ fontSize: '9px', color: '#555', lineHeight: '1.4', marginBottom: '3px' }}>
                {data.description}
              </div>
            )}
            {data.category && (
              <div style={{
                fontSize:      '8px',
                color:         '#2a2a2a',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                {data.category}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
