// src/renderer/src/libraries/SkinProvider.tsx
// ============================================================================
// FLOWPINS: SKIN PROVIDER
//
// Makes the active skin available to every component and keeps the CSS custom
// properties in sync so stylesheets follow along.
//
// Usage in a component — replaces the direct theme imports:
//
//     const { surface, text, border, accent, radius } = useSkin();
//     <div style={{ background: surface.base, color: text.primary }}>
//
// pinColor() and profileColor() stay as plain imports from theme.ts; they are
// deliberately skin-independent.
// ============================================================================

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { SKINS, skinForTarget, type Skin, type SkinId } from './skins';

const SkinContext = createContext<Skin>(SKINS.flowpins);

export function useSkin(): Skin {
  return useContext(SkinContext);
}

interface SkinProviderProps {
  /** Current compile target. Skin is derived from it. */
  mode:      string;
  /** Force a skin regardless of target — for the settings toggle. */
  override?: SkinId | null;
  children:  React.ReactNode;
}

export function SkinProvider({ mode, override, children }: SkinProviderProps) {
  const skin = useMemo(
    () => SKINS[override ?? skinForTarget(mode)],
    [mode, override]
  );

  // Mirror the active skin into CSS custom properties. Stylesheets and any
  // remaining raw CSS can then use var(--fp-surface-base) and follow the
  // switch without a re-render.
  useEffect(() => {
    const root = document.documentElement;
    const set  = (k: string, v: string) => root.style.setProperty(k, v);

    Object.entries(skin.surface).forEach(([k, v]) => set(`--fp-surface-${k}`, v));
    Object.entries(skin.border).forEach(([k, v])  => set(`--fp-border-${k}`,  v));
    Object.entries(skin.text).forEach(([k, v])    => set(`--fp-text-${k}`,    v));
    Object.entries(skin.accent).forEach(([k, v])  => set(`--fp-accent-${k}`,  v));
    Object.entries(skin.state).forEach(([k, v])   => set(`--fp-state-${k}`,   v));
    Object.entries(skin.radius).forEach(([k, v])  => set(`--fp-radius-${k}`,  v));
    Object.entries(skin.wire).forEach(([k, v])    => set(`--fp-wire-${k}`,    v));

    root.setAttribute('data-fp-skin', skin.id);
  }, [skin]);

  return (
    <SkinContext.Provider value={skin}>
      {children}
    </SkinContext.Provider>
  );
}
