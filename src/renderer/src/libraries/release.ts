// src/renderer/src/libraries/release.ts
// ============================================================================
// FLOWPINS: RELEASE SCOPE
//
// What this build exposes. Nothing is deleted — every translator, node spec
// and saved graph still works. This file only decides what the UI offers.
//
// Adding a target back is a one-line change here plus re-enabling its import
// in compiler.ts. That's the whole update mechanism.
//
// Why config instead of deletion:
//   - Saved .json graphs containing parked nodes still load and compile.
//     Removing MAYA_NODES from NODE_LIBRARY would turn every existing graph
//     with maya_fbx_exporter into "Unknown node kind".
//   - The parked translators keep working for anyone who wants to poke at
//     them, which was the point of keeping them.
// ============================================================================

import type { CompileMode } from './compiler';

// ── Target tiers ─────────────────────────────────────────────────────────────
// 'supported'    — complete enough to put in front of a studio
// 'experimental' — real, incomplete, labelled as such in the UI
// 'parked'       — code retained, not offered

export type TargetTier = 'supported' | 'experimental' | 'parked';

export const TARGET_TIER: Record<CompileMode, TargetTier> = {
  js_toonboom:  'supported',      // 131/192 visible nodes — the Harmony story
  py_harmony:   'supported',      // 122/192 — Scene Pulse and the Python API
  py_standard:  'supported',      // 117/192 — the Pipeline Suite target

  cs_csharp:    'experimental',   //  62/192 — core logic + partial pipeline

  py_maya:      'parked',
  py_houdini:   'parked',
  lua_fusion:   'parked',
  gml_standard: 'parked',
  py_nuke:      'parked',         // was only ever an alias to PYTHON_TRANSLATIONS
};

export const ACTIVE_TARGETS: CompileMode[] =
  (Object.keys(TARGET_TIER) as CompileMode[])
    .filter(m => TARGET_TIER[m] !== 'parked');

export const SUPPORTED_TARGETS: CompileMode[] =
  (Object.keys(TARGET_TIER) as CompileMode[])
    .filter(m => TARGET_TIER[m] === 'supported');

export function isActiveTarget(mode: string): boolean {
  return ACTIVE_TARGETS.includes(mode as CompileMode);
}

export function tierLabel(mode: CompileMode): string | null {
  return TARGET_TIER[mode] === 'experimental' ? 'EXPERIMENTAL' : null;
}

// ── Hidden node profiles ─────────────────────────────────────────────────────
// Matched case-insensitively against the start of NodeSpec.profile.
// These nodes stay in NODE_LIBRARY and still compile — they just don't appear
// in the library panel or the right-click spawn menu.

export const HIDDEN_PROFILES: string[] = [
  'app - maya',        //  2 nodes — maya_get_selection, maya_fbx_exporter
  'app - game maker',  //  8 nodes — spawn_instance, keyboard_check, is_free,
                       //            auto_depth, change_coord, camera_follow,
                       //            drunkard_walk, randomize_seed
];

export function isHiddenProfile(profile?: string): boolean {
  const p = (profile || '').toLowerCase();
  return HIDDEN_PROFILES.some(h => p.startsWith(h));
}

// ── Library panel group order ────────────────────────────────────────────────

export const GROUP_ORDER: Record<string, number> = {
  'Core':            0,
  'Pipeline':        1,
  'App - Toon Boom': 2,
};
