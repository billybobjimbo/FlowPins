// src/renderer/src/libraries/index.ts
// ============================================================================
// FLOWPINS: LIBRARY INDEX
// Combines all node spec libraries into a single NODE_LIBRARY export.
// To add a new DCC node set: import it here and spread it into NODE_LIBRARY.
// ============================================================================
import { CORE_NODES } from './core_logic';
import { TOONBOOM_NODES } from './toonboom';
// Still loaded on purpose: hidden in the UI via release.ts, but kept in
// NODE_LIBRARY so existing saved graphs containing these nodes still resolve.
import { MAYA_NODES } from './maya';
import type { PinSpec, NodeSpec, UIItem } from './types';

// Export the combined library
export const NODE_LIBRARY: Record<string, NodeSpec> = {
  ...CORE_NODES,
  ...TOONBOOM_NODES,
  ...MAYA_NODES
};

// Colour helpers forwarded for convenience — PIN_COLORS is gone.
export { pinColor, profileColor, PIN } from './theme';

export type { PinSpec, NodeSpec, UIItem };
