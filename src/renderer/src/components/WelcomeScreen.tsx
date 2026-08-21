// src/renderer/src/components/WelcomeScreen.tsx
// ============================================================================
// FLOWPINS: WELCOME SCREEN
// Shown on launch when canvas is empty (unless user suppressed it).
// Lets the user pick a guided journey or jump straight to freeform.
// ============================================================================

import React, { useState } from 'react';
import { JOURNEYS, type Journey } from '../libraries/journeys';

const CYAN   = 'var(--fp-accent-primary)';
const AMBER  = 'var(--fp-accent-amber)';
const BG     = 'var(--fp-surface-canvas)';
const BORDER = 'var(--fp-surface-raised)';
const TEXT   = 'var(--fp-text-primary)';
const MUTED  = 'var(--fp-text-faint)';

interface Props {
  onStartJourney:  (journeyId: string) => void;
  onDismiss:       () => void;
  onSuppressChange:(suppress: boolean) => void;
  suppressed:      boolean;
}

export const WelcomeScreen = ({ onStartJourney, onDismiss, onSuppressChange, suppressed }: Props) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    // ── Backdrop ──────────────────────────────────────────────────────────────
    <div
      onClick={onDismiss}
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          8000,
        background:      'rgba(0,0,0,0.75)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        backdropFilter:  'blur(2px)',
      }}
    >
      {/* ── Panel ─────────────────────────────────────────────────────────── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:        '680px',
          background:   BG,
          border:       `1px solid ${BORDER}`,
          borderRadius: '12px',
          overflow:     'hidden',
          boxShadow:    `0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(0, 216, 255, 0.09)`,
        }}
      >

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{
          background:    'linear-gradient(135deg, var(--fp-surface-sunken) 0%, var(--fp-surface-sunken) 100%)',
          borderBottom:  `1px solid ${BORDER}`,
          padding:       '28px 32px 24px',
        }}>
          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              fontSize:      '24px',
              fontWeight:    900,
              color:         CYAN,
              letterSpacing: '-0.5px',
            }}>
              FlowPins
            </div>
            <div style={{
              fontSize:      '9px',
              fontWeight:    'bold',
              letterSpacing: '2px',
              color:         'var(--fp-border-strong)',
              borderRadius:  '3px',
              padding:       '2px 6px',
            }}>
              VISUAL SCRIPTING IDE
            </div>
          </div>

          {/* Evelyn's greeting */}
          <div style={{ fontSize: '13px', color: TEXT, lineHeight: '1.6', maxWidth: '520px' }}>
            Welcome. I'm Evelyn — I keep the archives in order around here.
            If you're new, pick a journey below and I'll walk you through it.
            If you know what you're doing, close this and get on with it.
          </div>
        </div>

        {/* ── Journey grid ────────────────────────────────────────────────── */}
        <div style={{ padding: '24px 32px' }}>
          <div style={{
            fontSize:      '9px',
            fontWeight:    'bold',
            letterSpacing: '2px',
            color:         MUTED,
            marginBottom:  '14px',
          }}>
            GUIDED JOURNEYS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {JOURNEYS.map(journey => {
              const isHovered = hoveredId === journey.id;
              return (
                <div
                  key={journey.id}
                  onClick={() => onStartJourney(journey.id)}
                  onMouseEnter={() => setHoveredId(journey.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display:       'flex',
                    alignItems:    'center',
                    gap:           '14px',
                    padding:       '12px 16px',
                    borderRadius:  '6px',
                    background:    isHovered ? 'var(--fp-surface-raised)' : 'var(--fp-surface-sunken)',
                    border:        `1px solid ${isHovered ? CYAN + '44' : BORDER}`,
                    cursor:        'pointer',
                    transition:    'all 0.15s',
                  }}
                >
                  {/* Icon */}
                  <div style={{ fontSize: '20px', flexShrink: 0, width: '28px', textAlign: 'center' }}>
                    {journey.icon}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize:   '13px',
                      fontWeight: 'bold',
                      color:      isHovered ? CYAN : TEXT,
                      marginBottom: '2px',
                      transition: 'color 0.15s',
                    }}>
                      {journey.title}
                    </div>
                    <div style={{ fontSize: '11px', color: MUTED, lineHeight: '1.4' }}>
                      {journey.description}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    color:      isHovered ? CYAN : 'var(--fp-border-default)',
                    fontSize:   '16px',
                    flexShrink: 0,
                    transition: 'color 0.15s',
                  }}>
                    →
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div style={{
          borderTop:     `1px solid ${BORDER}`,
          padding:       '16px 32px',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'space-between',
        }}>
          {/* Suppress checkbox */}
          <label style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '8px',
            cursor:     'pointer',
            color:      MUTED,
            fontSize:   '11px',
          }}>
            <input
              type="checkbox"
              checked={suppressed}
              onChange={e => onSuppressChange(e.target.checked)}
              style={{ accentColor: CYAN, width: '14px', height: '14px', cursor: 'pointer' }}
            />
            Don't show this automatically
          </label>

          {/* Dismiss */}
          <div
            onClick={onDismiss}
            style={{
              color:      MUTED,
              fontSize:   '12px',
              cursor:     'pointer',
              padding:    '6px 16px',
              border:     `1px solid ${BORDER}`,
              borderRadius: '4px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color   = TEXT;
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--fp-border-default)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color   = MUTED;
              (e.currentTarget as HTMLElement).style.borderColor = BORDER;
            }}
          >
            Skip — start from scratch
          </div>
        </div>
      </div>
    </div>
  );
};
