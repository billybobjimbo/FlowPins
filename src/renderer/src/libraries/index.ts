// src/renderer/src/libraries/index.ts
import { CORE_NODES } from './core_logic';
import { TOONBOOM_NODES } from './toonboom';
import { MAYA_NODES } from './maya';
import { PIN_COLORS } from './types';
// We import the types specifically here
import type { PinSpec, NodeSpec, UIItem } from './types';

// Export the combined library
export const NODE_LIBRARY: Record<string, NodeSpec> = {
  ...CORE_NODES,
  ...TOONBOOM_NODES,
  ...MAYA_NODES
};

// Re-exporting for use in App.tsx and NodeInspector.tsx
export { PIN_COLORS };
export type { PinSpec, NodeSpec, UIItem };