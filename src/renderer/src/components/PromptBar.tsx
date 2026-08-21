// src/renderer/src/components/PromptBar.tsx
// ============================================================================
// FLOWPINS: EVELYN'S PROMPT BAR
// Two modes:
//   FREEFORM — the existing compact bar
//   GUIDED   — expanded panel showing journey progress + step guidance
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { type Journey, type JourneyStep } from '../libraries/journeys';
import { alpha } from '../libraries/theme';

const CYAN  = 'var(--fp-accent-primary)';
const AMBER = 'var(--fp-accent-amber)';

// ── Props ─────────────────────────────────────────────────────────────────────

interface PromptBarProps {
  // Freeform mode
  onSubmit:      (prompt: string) => void;
  isLoading:     boolean;
  onShowWelcome?: () => void;   // Reopens the welcome/journey screen

  // Guided mode (all optional — absent = freeform mode)
  journey?:        Journey | null;
  currentStep?:    number;
  onPlaceNodes?:   () => void;   // Called when user asks Evelyn to place nodes
  onSkipStep?:     () => void;   // Called when user skips a step
  onExitJourney?:  () => void;   // Called when user exits guided mode
  stepComplete?:   boolean;      // True when current step's completion condition is met
  onAdvanceStep?:  () => void;   // Called to advance to next step
}

export default function PromptBar({
  onSubmit, isLoading, onShowWelcome,
  journey, currentStep = 0,
  onPlaceNodes, onSkipStep, onExitJourney,
  stepComplete, onAdvanceStep,
}: PromptBarProps) {

  const [prompt, setPrompt] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isGuided = !!(journey);

  // Auto-focus after loading
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !prompt.trim() || isLoading) return;

    const p = prompt.trim().toLowerCase();

    if (isGuided) {
      // Guided mode command interception
      if (/^(place it|yes|do it|place them|place nodes?)$/.test(p)) {
        onPlaceNodes?.();
        setPrompt('');
        return;
      }
      if (/^(next|done|continue|advance|skip)$/.test(p)) {
        onSkipStep?.();
        setPrompt('');
        return;
      }
      if (/^(exit|quit|stop|leave|freeform)$/.test(p)) {
        onExitJourney?.();
        setPrompt('');
        return;
      }
    }

    onSubmit(prompt);
    setPrompt('');
  };

  // ── GUIDED MODE ───────────────────────────────────────────────────────────
  if (isGuided && journey) {
    const step = journey.steps[currentStep];
    const totalSteps = journey.steps.length;
    const progress = ((currentStep) / totalSteps) * 100;

    return (
      <div style={{
        position:        'absolute',
        bottom:          '20px',
        left:            '50%',
        transform:       'translateX(-50%)',
        zIndex:          1000,
        width:           '860px',
        backgroundColor: 'var(--fp-surface-base)',
        borderRadius:    '10px',
        boxShadow:       `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${alpha(CYAN, 0.13)}`,
        border:          `1px solid var(--fp-surface-overlay)`,
        overflow:        'hidden',
      }}>

        {/* ── Journey header ─────────────────────────────────────────────── */}
        <div style={{
          background:    'var(--fp-surface-sunken)',
          borderBottom:  '1px solid var(--fp-surface-raised)',
          padding:       '8px 16px',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'space-between',
        }}>
          {/* Journey title + step count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: CYAN, fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>
              ⬡ EVELYN
            </span>
            <span style={{ color: 'var(--fp-border-strong)', fontSize: '10px' }}>|</span>
            <span style={{ color: 'var(--fp-text-muted)', fontSize: '10px', fontWeight: 'bold' }}>
              {journey.title}
            </span>
            <span style={{ color: 'var(--fp-border-strong)', fontSize: '9px' }}>
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>

          {/* Exit guided mode */}
          <div
            onClick={onExitJourney}
            style={{ color: 'var(--fp-border-strong)', fontSize: '10px', cursor: 'pointer', padding: '2px 8px', borderRadius: '3px' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fp-text-muted)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fp-border-strong)'; }}
          >
            Exit guided mode ✕
          </div>
        </div>

        {/* ── Progress bar ───────────────────────────────────────────────── */}
        <div style={{ height: '2px', background: 'var(--fp-surface-raised)' }}>
          <div style={{
            height:     '100%',
            width:      `${progress}%`,
            background: CYAN,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* ── Evelyn's current message ────────────────────────────────────── */}
        {step && (
          <div style={{ padding: '14px 16px 10px' }}>
            <div style={{
              fontSize:   '13px',
              color:      'var(--fp-text-primary)',
              lineHeight: '1.6',
              marginBottom: '8px',
            }}>
              <span style={{ color: CYAN, fontWeight: 'bold', marginRight: '8px' }}>Evelyn:</span>
              {step.evelynSays}
            </div>

            {/* Action hint */}
            <div style={{
              fontSize:   '10px',
              color:      'var(--fp-border-strong)',
              fontStyle:  'italic',
            }}>
              Type <span style={{ color: CYAN }}>"place it"</span> to have me place the nodes,{' '}
              <span style={{ color: 'var(--fp-text-disabled)' }}>"skip"</span> to move on, or{' '}
              <span style={{ color: 'var(--fp-text-disabled)' }}>"exit"</span> to leave guided mode.
            </div>
          </div>
        )}

        {/* ── Step complete banner ────────────────────────────────────────── */}
        {stepComplete && currentStep < totalSteps - 1 && (
          <div
            onClick={onAdvanceStep}
            style={{
              background:  'var(--fp-surface-sunken)',
              border:      '1px solid var(--fp-border-default)',
              margin:      '0 16px 10px',
              borderRadius:'6px',
              padding:     '8px 14px',
              display:     'flex',
              alignItems:  'center',
              justifyContent: 'space-between',
              cursor:      'pointer',
            }}
          >
            <span style={{ color: 'var(--fp-state-success)', fontSize: '12px', fontWeight: 'bold' }}>
              ✓ Step complete
            </span>
            <span style={{ color: 'var(--fp-state-success)', fontSize: '11px' }}>
              Click here or type "next" to continue →
            </span>
          </div>
        )}

        {/* ── Input bar ──────────────────────────────────────────────────── */}
        <div style={{
          display:       'flex',
          padding:       '8px 12px 12px',
          gap:           '8px',
          borderTop:     '1px solid var(--fp-surface-raised)',
          alignItems:    'center',
        }}>
          {/* Skip step button */}
          <button
            onClick={onSkipStep}
            style={{
              background:   'transparent',
              border:       '1px solid var(--fp-surface-overlay)',
              color:        'var(--fp-border-strong)',
              borderRadius: '4px',
              padding:      '7px 12px',
              fontSize:     '10px',
              cursor:       'pointer',
              flexShrink:   0,
              whiteSpace:   'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fp-text-muted)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fp-border-strong)'; }}
          >
            Skip step
          </button>

          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Ask Evelyn anything, or type "place it" / "next"...'
            disabled={isLoading}
            style={{
              flex:            1,
              backgroundColor: 'var(--fp-surface-sunken)',
              border:          `1px solid var(--fp-surface-overlay)`,
              color:           'white',
              padding:         '8px 12px',
              outline:         'none',
              fontSize:        '13px',
              borderRadius:    '4px',
            }}
          />

          <button
            onClick={() => { if (prompt.trim() && !isLoading) { onSubmit(prompt); setPrompt(''); } }}
            disabled={isLoading || !prompt.trim()}
            style={{
              backgroundColor: isLoading ? 'var(--fp-surface-overlay)' : CYAN,
              color:           isLoading ? 'var(--fp-text-disabled)' : 'var(--fp-surface-canvas)',
              border:          'none',
              borderRadius:    '4px',
              padding:         '8px 16px',
              cursor:          isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
              fontWeight:      'bold',
              fontSize:        '12px',
              transition:      'background-color 0.2s',
              flexShrink:      0,
            }}
          >
            {isLoading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
      </div>
    );
  }

  // ── FREEFORM MODE (existing behaviour, unchanged) ─────────────────────────
  return (
    <div style={{
      position:        'absolute',
      bottom:          '40px',
      left:            '50%',
      transform:       'translateX(-50%)',
      zIndex:          1000,
      width:           '800px',
      backgroundColor: 'var(--fp-surface-raised)',
      borderRadius:    '8px',
      boxShadow:       '0 4px 12px rgba(0,0,0,0.5)',
      display:         'flex',
      padding:         '8px',
      border:          '1px solid var(--fp-border-default)',
    }}>
      {/* Evelyn journey button */}
      {onShowWelcome && (
        <button
          onClick={onShowWelcome}
          title="Open guided journeys"
          style={{
            background:    'transparent',
            border:        '1px solid rgba(0, 216, 255, 0.13)',
            color:         'rgba(0, 216, 255, 0.33)',
            fontSize:      '9px',
            fontWeight:    'bold',
            letterSpacing: '1px',
            cursor:        'pointer',
            padding:       '4px 8px',
            borderRadius:  '4px',
            transition:    'all 0.15s',
            flexShrink:    0,
            whiteSpace:    'nowrap',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = 'var(--fp-accent-primary)';
            el.style.borderColor = 'rgba(0, 216, 255, 0.27)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = 'rgba(0, 216, 255, 0.33)';
            el.style.borderColor = 'rgba(0, 216, 255, 0.13)';
          }}
        >
          JOURNEYS
        </button>
      )}

      <input
        ref={inputRef}
        autoFocus
        type="text"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Evelyn here, how can I help you?..Don't ask about Mummies though...."
        disabled={isLoading}
        style={{
          flex:            1,
          backgroundColor: 'transparent',
          border:          'none',
          color:           'white',
          padding:         '8px 12px',
          outline:         'none',
          fontSize:        '14px',
        }}
      />
      <button
        onClick={() => { if (prompt.trim() && !isLoading) { onSubmit(prompt); setPrompt(''); } }}
        disabled={isLoading || !prompt.trim()}
        style={{
          backgroundColor: isLoading ? 'var(--fp-border-strong)' : 'var(--fp-accent-dim)',
          color:           isLoading ? 'var(--fp-text-muted)' : 'white',
          border:          'none',
          borderRadius:    '4px',
          padding:         '8px 16px',
          cursor:          isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
          fontWeight:      'bold',
          transition:      'background-color 0.2s',
        }}
      >
        {isLoading ? 'Thinking...' : 'Send'}
      </button>
    </div>
  );
}
