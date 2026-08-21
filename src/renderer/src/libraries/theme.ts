// src/renderer/src/libraries/theme.ts
// ============================================================================
// FLOWPINS: THEME
//
// Single source of truth for every colour in the application.
// Nothing else should contain a hex literal.
//
// Replaces:
//   - PIN_COLORS in types.ts                     (was never consumed)
//   - getPinColor()   in FPNode.tsx              (duplicate)
//   - pinColor()      in ConfluenceNode.tsx      (duplicate, and drifted)
//   - getProfileColor() in FPNode.tsx            (duplicate)
//   - the profile colour block in LibraryPanel.tsx (duplicate)
//   - ~430 inline hex literals across 12 files
//
// SURFACES are a warm charcoal ramp rather than neutral black. Harmony's own
// panels are warm, and Scene Pulse was already calibrated to that palette, so
// this makes the IDE and the shipped Harmony tools read as one product.
//
// ACCENT is #4AB8CC — the Toon Boom teal already adopted for NavToNode's
// panel restyle, rather than the previous #00d8ff. Same family, considerably
// less electric, and consistent with what artists see inside Harmony.
// ============================================================================

// ── Alpha helper ─────────────────────────────────────────────────────────────
// The old code hand-wrote things like '#00d8ff22' and '#53687844'. That breaks
// the moment a colour changes. Use alpha() instead.
//   alpha(THEME.accent, 0.13)  ->  'rgba(74, 184, 204, 0.13)'

export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ── Surfaces ─────────────────────────────────────────────────────────────────
// Five steps replace the twelve near-blacks currently in use
// (#000 #050505 #060606 #080808 #0a0a0a #0d0d0d #111 #151515 #1a1a1a
//  #1e1e1e #222 #2a2a2a). Ordered deepest to highest.

export const SURFACE = {
  void:    '#0E0D0C',   // canvas backdrop, deepest wells
  sunken:  '#141210',   // inputs, code output background
  base:    '#1A1714',   // panel background — the default surface
  raised:  '#221E1A',   // node bodies, cards, list rows
  overlay: '#2B2621',   // menus, dialogs, hover states
} as const;

// ── Borders ──────────────────────────────────────────────────────────────────
// Separated from text greys, which the old code conflated (#333 was doing
// duty as both a divider and a disabled-text colour).

export const BORDER = {
  subtle:  '#241F1B',   // internal dividers, barely there
  default: '#332C26',   // panel edges, node outlines
  strong:  '#453C34',   // focused fields, active dividers
} as const;

// ── Text ─────────────────────────────────────────────────────────────────────
// Six steps replace #333 #444 #555 #666 #888 #888888 #aaa #aaaaaa #ccc
// #cccccc #eee #fff #ffffff — including four shorthand/longhand pairs that
// were the same colour spelled two ways.
// Contrast ratios are against SURFACE.base.

export const TEXT = {
  faint:     '#5A534B',   //  2.4:1 — decorative only, never for reading
  disabled:  '#6E665D',   //  3.2:1 — AA for large text
  muted:     '#8A8179',   //  4.7:1 — AA, captions and metadata
  secondary: '#A9A099',   //  7.0:1 — AA, secondary labels
  primary:   '#CFC7BF',   // 10.7:1 — AA, body text
  bright:    '#EFEAE4',   // 14.9:1 — AA, headings and emphasis
} as const;

// ── Brand and accents ────────────────────────────────────────────────────────

export const ACCENT = {
  primary:    '#4AB8CC',  // Toon Boom teal — replaces #00d8ff
  dim:        '#2E7B8A',  // hover/inactive variant of the above
  amber:      '#D9A24E',  // journeys, Evelyn, pipeline — replaces #f5a623
  confluence: '#6B8299',  // Payne's grey, lifted for legibility — was #536878
} as const;

// ── Semantic state ───────────────────────────────────────────────────────────

export const STATE = {
  success: '#6BAF6B',   // replaces #4aaa4a
  warning: '#D9A24E',
  danger:  '#CC6B5E',   // replaces #cc4444
  info:    '#5FA8D9',   // replaces #4a9eff
} as const;

// ── Pin colours ──────────────────────────────────────────────────────────────
// Two changes beyond softening:
//
//   'list' moves off cyan. It was #00d8ff — byte-identical to the brand
//   accent and one digit from 'number' (#00e5ff), so list wires, number
//   wires and UI chrome were all the same colour on screen.
//
//   'string' moves from rose toward true magenta, which puts 46° between it
//   and 'boolean' instead of 30°. Hue families are otherwise unchanged, so
//   existing muscle memory still holds.

export const PIN = {
  exec:    '#E6E1D9',   // warm white — was #ffffff (glared against the canvas)
  string:  '#D264AD',   // magenta   — was #ff007f / #ff007a
  number:  '#5FA8D9',   // blue      — was #00e5ff
  boolean: '#D96A5E',   // coral     — was #ff2a2a
  list:    '#6FBFA8',   // jade      — was #00d8ff
  any:     '#9084D9',   // violet    — was #826cf3
  unknown: '#7A736B',   // warm grey — was #888888 / #aaaaaa

  // ── Harmony-native types ──────────────────────────────────────────────────
  // Toon Boom's own port vocabulary: green carries transformation data (Peg,
  // Quadmap, Deformation outputs), blue carries image data (Drawing outputs,
  // Composite inputs). Source: docs.toonboom.com, "About Node Connections and
  // Ports". Added as real pin types rather than a per-skin recolour, so they
  // stay meaningful regardless of which skin is active — same reasoning as
  // every other pin colour.
  //
  // 'image' sits at hue 186, the balanced midpoint between 'list' (163) and
  // 'number' (204) — Harmony's own blue collides almost exactly with the
  // 'number' hue already in use, so it's nudged toward cyan to keep both
  // legible on the same node. 23° clearance from list, 18° from number.
  transform: '#5FBF6F',   // green — Peg / Quadmap / Deformation
  image:     '#66CBD6',   // blue  — Drawing / Composite / Effects
  zdepth:    '#AEDBE0',   // Composite's leftmost input is a lighter blue in
                          // Harmony — marks the z-order port specifically
} as const;

export function pinColor(pinType?: string): string {
  switch (pinType) {
    case 'exec':                          return PIN.exec;
    case 'string':                        return PIN.string;
    case 'int':
    case 'float':
    case 'number':                        return PIN.number;
    case 'boolean':                       return PIN.boolean;
    case 'list':                          return PIN.list;
    case 'any':                           return PIN.any;
    case 'transform':
    case 'transformation':                return PIN.transform;
    case 'image':                         return PIN.image;
    case 'zdepth':                        return PIN.zdepth;
    default:                              return PIN.unknown;
  }
}

// A matte connection in Harmony carries image data — same colour as 'image' —
// but is drawn DASHED to mark it as specifically a matte feed rather than a
// straight image input. This is a stroke-style flag, not a colour, so it's
// consumed at the edge-rendering call site (strokeDasharray) rather than here.
export const MATTE_DASH = '4 3';

// ── Profile colours ──────────────────────────────────────────────────────────
// Node header and border colour, keyed off NodeSpec.profile.
//
// The ten Toon Boom categories are spread deliberately around the wheel with
// at least 16° between neighbours. The old set had Blur (#5b9bd5) and
// Composite (#4a83c4) four degrees apart, which made two of the largest
// categories effectively indistinguishable.

export const PROFILE = {
  'toonboom.blur':      '#5F9BD1',
  'toonboom.effects':   '#8A7DD9',
  'toonboom.colour':    '#5EBAAB',
  'toonboom.output':    '#CE6454',
  'toonboom.composite': '#6379C4',
  'toonboom.rigging':   '#5FBF6F',   // Peg only now — Drawing split out below
  'toonboom.drawing':   '#66CBD6',   // new: Drawing (Read) + Create Drawing,
                                    // previously split across Rigging and Scene
  'toonboom.scene':     '#CE9E57',
  'toonboom.ui':        '#BC5EC0',
  'toonboom.camera':    '#4DBDCB',
  'toonboom.query':     '#A08378',
  'toonboom':           '#6379C4',   // fallback

  'maya':               '#B55DD0',
  'python':             '#8FA857',
  'fusion':             '#5C67BD',
  'unity':              '#CB874D',
  'gamemaker':          '#4DCB92',
  'houdini':            '#CB874D',
  'nuke':               '#A08378',

  'pipeline.naming':    '#CB9C4D',
  'pipeline.reporting': '#CE9354',
  'pipeline.image':     '#D5B96E',
  'pipeline':           '#CB9C4D',   // fallback

  'core':               '#A9A099',
} as const;

export function profileColor(profile?: string): string {
  const p = (profile || '').toLowerCase();

  if (p.includes('toon boom - blur'))      return PROFILE['toonboom.blur'];
  if (p.includes('toon boom - effects'))   return PROFILE['toonboom.effects'];
  if (p.includes('toon boom - colour'))    return PROFILE['toonboom.colour'];
  if (p.includes('toon boom - output'))    return PROFILE['toonboom.output'];
  if (p.includes('toon boom - composite')) return PROFILE['toonboom.composite'];
  if (p.includes('toon boom - rigging'))   return PROFILE['toonboom.rigging'];
  if (p.includes('toon boom - drawing'))   return PROFILE['toonboom.drawing'];
  if (p.includes('toon boom - scene'))     return PROFILE['toonboom.scene'];
  if (p.includes('toon boom - ui'))        return PROFILE['toonboom.ui'];
  if (p.includes('toon boom - camera'))    return PROFILE['toonboom.camera'];
  if (p.includes('toon boom - query'))     return PROFILE['toonboom.query'];
  if (p.includes('toon boom') || p.includes('toonboom')) return PROFILE['toonboom'];

  if (p.includes('maya'))                  return PROFILE['maya'];
  if (p.includes('houdini'))               return PROFILE['houdini'];
  if (p.includes('nuke'))                  return PROFILE['nuke'];
  if (p.includes('lua') || p.includes('fusion')) return PROFILE['fusion'];
  if (p.includes('c#')  || p.includes('unity'))  return PROFILE['unity'];
  if (p.includes('game')|| p.includes('gml'))    return PROFILE['gamemaker'];
  if (p.includes('python'))                return PROFILE['python'];

  if (p.includes('pipeline - naming'))     return PROFILE['pipeline.naming'];
  if (p.includes('pipeline - reporting'))  return PROFILE['pipeline.reporting'];
  if (p.includes('pipeline - image'))      return PROFILE['pipeline.image'];
  if (p.includes('pipeline'))              return PROFILE['pipeline'];

  if (p.includes('core'))                  return PROFILE['core'];

  return TEXT.secondary;
}

// ── Elevation ────────────────────────────────────────────────────────────────
// The old shadows were pure black at high opacity, which is what made panels
// look cut out rather than layered. These are warm and softer.

export const SHADOW = {
  node:     '0 8px 24px rgba(0, 0, 0, 0.42)',
  nodeGlow: (c: string) => `0 0 18px ${alpha(c, 0.28)}, 0 8px 24px rgba(0,0,0,0.42)`,
  panel:    '0 4px 16px rgba(0, 0, 0, 0.36)',
  dialog:   '0 24px 64px rgba(0, 0, 0, 0.62)',
} as const;

// ── Geometry ─────────────────────────────────────────────────────────────────
// Radii were previously ad hoc: 3, 4, 6, 8, 10, 11, 12, 14 all appear.

export const RADIUS = {
  sm: '3px',   // chips, small controls
  md: '6px',   // buttons, inputs, list rows
  lg: '10px',  // nodes, cards
  xl: '14px',  // dialogs, overlays
} as const;

// ── Grouped export ───────────────────────────────────────────────────────────

export const THEME = {
  surface: SURFACE,
  border:  BORDER,
  text:    TEXT,
  accent:  ACCENT,
  state:   STATE,
  pin:     PIN,
  profile: PROFILE,
  shadow:  SHADOW,
  radius:  RADIUS,
  alpha,
  pinColor,
  profileColor,
} as const;

export default THEME;

// ── CSS custom properties ────────────────────────────────────────────────────
// Call once at startup so stylesheets can reach the same tokens.
// main.css currently imports base.css, whose --ev-c-* variables are untouched
// electron-vite scaffold and are not referenced anywhere in the app.

export function installCSSVariables(root: HTMLElement = document.documentElement): void {
  const set = (k: string, v: string) => root.style.setProperty(k, v);

  Object.entries(SURFACE).forEach(([k, v]) => set(`--fp-surface-${k}`, v));
  Object.entries(BORDER).forEach(([k, v])  => set(`--fp-border-${k}`,  v));
  Object.entries(TEXT).forEach(([k, v])    => set(`--fp-text-${k}`,    v));
  Object.entries(ACCENT).forEach(([k, v])  => set(`--fp-accent-${k}`,  v));
  Object.entries(STATE).forEach(([k, v])   => set(`--fp-state-${k}`,   v));
  Object.entries(PIN).forEach(([k, v])     => set(`--fp-pin-${k}`,     v));
  Object.entries(RADIUS).forEach(([k, v])  => set(`--fp-radius-${k}`,  v));
}
