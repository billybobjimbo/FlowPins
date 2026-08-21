// src/renderer/src/libraries/skins.ts
// ============================================================================
// FLOWPINS: SKINS
//
// A skin is a complete set of theme tokens. Every skin has the same shape, so
// components never branch on which one is active — they read tokens and the
// values change underneath them.
//
// The Harmony skin exists so a Toon Boom artist opening FlowPins recognises
// the room. It matches Harmony's chrome greys and its teal selection accent,
// and drops border-radius to zero the way Harmony's panels do.
//
// WHAT A SKIN DOES NOT CHANGE:
//   - layout, spacing, or component structure
//   - pin colours (they encode pin *type*, which is FlowPins information
//     Harmony has no equivalent for — changing them per skin would mean
//     relearning the graph every time you switch target)
//   - profile colours (same reasoning)
//
// SURFACE ROLES — note that 'canvas' and 'node' are independent of the panel
// ramp. In the FlowPins skin the canvas is the darkest thing on screen. In the
// Harmony skin the chrome is *lighter* than the canvas, which is how Harmony
// actually looks: mid-grey panels around a darker Node View. Keeping canvas
// and node separate is what lets both skins share one set of pin colours and
// still clear AA contrast.
// ============================================================================

import { PIN, PROFILE, alpha } from './theme';

// ── Profile colours, lifted for light chrome ─────────────────────────────────
// The base palette was tuned against a near-black node body. On Harmony's grey
// rows every category lost roughly half its contrast — Composite fell to
// 2.31:1 — which is what reads as a grey film over the node groups.
//
// This is a LIGHTNESS lift, not a re-colour: hue drift is under 1 degree for
// every entry, so a category is still the same colour you learned.
// Lightened for Harmony's light-chrome panel rows, computed FROM the vibrant
// PROFILE table above rather than hand-authored separately as a second
// table. Two independently-maintained palettes is exactly what produced
// today's mismatch (a mockup and the real system quietly drifting apart) —
// deriving one from the other makes that class of bug structurally
// impossible instead of relying on remembering to keep them in sync.
//
// Canvas nodes never use this: node bodies stay dark (#222222) in every
// skin by design, so they read PROFILE directly via profileColorFor().
// This lightened variant exists only for surfaces with a light background —
// currently just the Harmony skin's library panel rows — via
// profileColorForPanel().
function lightenForPanel(hex: string, targetContrast = 5.5): string {
  const h = hex.replace('#', '');
  let [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);

  const toHsl = (r: number, g: number, b: number) => {
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    const d = max - min;
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    return [h, s, l];
  };
  const toRgb = (h: number, s: number, l: number) => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let [r1, g1, b1] = [0, 0, 0];
    if (h < 60)       [r1, g1, b1] = [c, x, 0];
    else if (h < 120) [r1, g1, b1] = [x, c, 0];
    else if (h < 180) [r1, g1, b1] = [0, c, x];
    else if (h < 240) [r1, g1, b1] = [0, x, c];
    else if (h < 300) [r1, g1, b1] = [x, 0, c];
    else              [r1, g1, b1] = [c, 0, x];
    return [r1 + m, g1 + m, b1 + m];
  };
  const luminance = (r: number, g: number, b: number) => {
    const f = (c: number) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const contrast = (l1: number, l2: number) => {
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  };

  const bgLum = luminance(0x45 / 255, 0x45 / 255, 0x45 / 255); // panel row bg #454545
  let [hue, sat, light] = toHsl(r, g, b);

  for (let step = 0; step < 80; step++) {
    const l = Math.min(0.94, light + step * 0.01);
    const s2 = Math.min(0.72, sat * 1.08);
    const [cr, cg, cb] = toRgb(hue, s2, l);
    if (contrast(luminance(cr, cg, cb), bgLum) >= targetContrast) {
      const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase();
      return `#${toHex(cr)}${toHex(cg)}${toHex(cb)}`;
    }
  }
  return hex;
}

const PROFILE_PANEL_HARMONY: Record<string, string> =
  Object.fromEntries(Object.entries(PROFILE).map(([k, v]) => [k, lightenForPanel(v)]));

export type SkinId = 'flowpins' | 'harmony';

export interface Skin {
  id:    SkinId;
  label: string;

  surface: {
    canvas:  string;   // graph backdrop
    node:    string;   // node body
    sunken:  string;   // inputs, code output
    base:    string;   // panel background
    raised:  string;   // cards, list rows
    overlay: string;   // menus, dialogs
  };
  border: { subtle: string; default: string; strong: string };
  text:   { faint: string; disabled: string; muted: string;
            secondary: string; primary: string; bright: string };
  accent: { primary: string; dim: string; amber: string; confluence: string };
  state:  { success: string; warning: string; danger: string; info: string };

  wire:   { exec: string; data: string };   // ReactFlow edge stroke
  radius: { sm: string; md: string; lg: string; xl: string };
  shadow: { node: string; panel: string; dialog: string };
  profile: Record<string, string>;
  profilePanel: Record<string, string>;  // light-background variant, panel rows only
}

// ── FlowPins — warm charcoal, the product's own identity ─────────────────────

export const FLOWPINS_SKIN: Skin = {
  id: 'flowpins',
  label: 'FlowPins',

  surface: {
    canvas:  '#0E0D0C',
    node:    '#221E1A',
    sunken:  '#141210',
    base:    '#1A1714',
    raised:  '#221E1A',
    overlay: '#2B2621',
  },
  border: { subtle: '#241F1B', default: '#332C26', strong: '#453C34' },
  text:   { faint: '#5A534B', disabled: '#6E665D', muted: '#8A8179',
            secondary: '#A9A099', primary: '#CFC7BF', bright: '#EFEAE4' },
  accent: { primary: '#4AB8CC', dim: '#2E7B8A', amber: '#D9A24E', confluence: '#6B8299' },
  state:  { success: '#6BAF6B', warning: '#D9A24E', danger: '#CC6B5E', info: '#5FA8D9' },

  wire:   { exec: '#EFEAE4', data: '#8A8179' },
  profile: PROFILE,
  profilePanel: PROFILE,  // FlowPins chrome is dark — no lightening needed
  radius: { sm: '3px', md: '6px', lg: '10px', xl: '14px' },
  shadow: {
    node:   '0 8px 24px rgba(0, 0, 0, 0.42)',
    panel:  '0 4px 16px rgba(0, 0, 0, 0.36)',
    dialog: '0 24px 64px rgba(0, 0, 0, 0.62)',
  },
};

// ── Harmony — Toon Boom's chrome greys and teal selection ────────────────────
// Greys taken from the NavToNode panel restyle, which was matched against a
// real Harmony 27 panel: #2e2e2e / #3c3c3c / #4a4a4a with #4ab8cc accent.
//
// Radius is zero throughout. Harmony's UI is flat, and roundness is one of the
// strongest tells that a panel wasn't built by Toon Boom.
//
// Node body sits at #222222 rather than following the chrome up. That is both
// truer to Harmony's darker Node View and the reason every pin colour still
// clears AA here without a second palette.

export const HARMONY_SKIN: Skin = {
  id: 'harmony',
  label: 'Harmony',
  surface: {
    canvas:  '#363636',   // 9.4 L* above the node body, so nodes read
    node:    '#222222',   // dark: every pin colour still clears AA here
    sunken:  '#2E2E2E',
    base:    '#3C3C3C',   // Harmony's own panel grey
    raised:  '#454545',   // pulled down from #4A4A4A — row text had no headroom
    overlay: '#4E4E4E',   // pulled down from #565656 for the same reason
  },
  // Borders lifted well clear of the surfaces — the old #282828 default was
  // darker than the panel and gave the rows no definition at all.
  border: { subtle: '#4F4F4F', default: '#606060', strong: '#7A7A7A' },
  // Solved against 'overlay', the lightest surface text lands on, so a label
  // holds up on panel, row and menu alike. The first pass was derived against
  // 'base' only, which left every row label about a step under AA — that is
  // what made the whole skin look washed out.
  text:   { faint: '#9C9C9C', disabled: '#B2B2B2', muted: '#D2D2D2',
            secondary: '#E4E4E4', primary: '#F0F0F0', bright: '#FFFFFF' },
  accent: { primary: '#4AB8CC', dim: '#2E7B8A', amber: '#E0A94F', confluence: '#8CA0B4' },
  state:  { success: '#7FC47F', warning: '#E0A94F', danger: '#E08076', info: '#7FBCE8' },
  wire:   { exec: '#F0F0F0', data: '#7FB4DC' },
  profile: PROFILE,   // canvas nodes stay vibrant — node body is dark in every skin
  profilePanel: PROFILE_PANEL_HARMONY,  // library panel rows sit on light chrome
  radius: { sm: '0px', md: '0px', lg: '0px', xl: '0px' },
  shadow: {
    node:   '0 2px 6px rgba(0, 0, 0, 0.45)',
    panel:  '0 1px 4px rgba(0, 0, 0, 0.35)',
    dialog: '0 12px 32px rgba(0, 0, 0, 0.55)',
  },
};

export const SKINS: Record<SkinId, Skin> = {
  flowpins: FLOWPINS_SKIN,
  harmony:  HARMONY_SKIN,
};

// ── Target → skin ────────────────────────────────────────────────────────────
// The one place that decides when the room changes. Adding a Fusion skin later
// is a new entry here plus a Skin object above.

export function skinForTarget(mode: string): SkinId {
  if (mode === 'js_toonboom' || mode === 'py_harmony') return 'harmony';
  return 'flowpins';
}

// Resolve a profile colour against a given skin. Pin colours stay shared —
// they encode pin *type*, and relearning those per target would cost more than
// the contrast gain. Profile colours only shift in lightness, so they can.
export function profileColorFor(profile: string | undefined, skin: Skin): string {
  return resolveProfile(profile, skin.profile, skin.text.secondary);
}

// For light-background contexts only (currently: the Harmony skin's
// library panel rows). Canvas nodes should always use profileColorFor().
export function profileColorForPanel(profile: string | undefined, skin: Skin): string {
  return resolveProfile(profile, skin.profilePanel, skin.text.secondary);
}

function resolveProfile(profile: string | undefined, table: Record<string, string>, fallback: string): string {
  const p = (profile || '').toLowerCase();
  const pick = (k: string) => table[k] ?? fallback;
  if (p.includes('toon boom - blur'))      return pick('toonboom.blur');
  if (p.includes('toon boom - effects'))   return pick('toonboom.effects');
  if (p.includes('toon boom - colour'))    return pick('toonboom.colour');
  if (p.includes('toon boom - output'))    return pick('toonboom.output');
  if (p.includes('toon boom - composite')) return pick('toonboom.composite');
  if (p.includes('toon boom - rigging'))   return pick('toonboom.rigging');
  if (p.includes('toon boom - drawing'))   return pick('toonboom.drawing');
  if (p.includes('toon boom - scene'))     return pick('toonboom.scene');
  if (p.includes('toon boom - ui'))        return pick('toonboom.ui');
  if (p.includes('toon boom - camera'))    return pick('toonboom.camera');
  if (p.includes('toon boom - query'))     return pick('toonboom.query');
  if (p.includes('toon boom') || p.includes('toonboom')) return pick('toonboom');
  if (p.includes('maya'))                  return pick('maya');
  if (p.includes('houdini'))               return pick('houdini');
  if (p.includes('nuke'))                  return pick('nuke');
  if (p.includes('lua') || p.includes('fusion')) return pick('fusion');
  if (p.includes('c#')  || p.includes('unity'))  return pick('unity');
  if (p.includes('game')|| p.includes('gml'))    return pick('gamemaker');
  if (p.includes('python'))                return pick('python');
  if (p.includes('pipeline - naming'))     return pick('pipeline.naming');
  if (p.includes('pipeline - reporting'))  return pick('pipeline.reporting');
  if (p.includes('pipeline - image'))      return pick('pipeline.image');
  if (p.includes('pipeline'))              return pick('pipeline');
  if (p.includes('core'))                  return pick('core');
  return fallback;
}

// Pins are shared across skins on purpose — see header.
export { PIN, PROFILE, alpha };
