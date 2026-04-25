// src/renderer/src/libraries/types.ts
// ============================================================================
// FLOWPINS: SHARED TYPE DEFINITIONS
// NodeSpec, PinSpec, UIItem — the master rulebook for every node.
// ============================================================================
// 1. Define the colors for your node pins
export const PIN_COLORS: Record<string, string> = {
  exec: "#ffffff",
  string: "#ff007a",
  float: "#44ff00",
  list: "#00d8ff"
};

// 2. Define what a Pin looks like
export type PinSpec = {
  name: string;
  pin_type: string;
};

// 3. Define the UI elements (Dropdowns, etc.)
export type UIItem = {
  label: string;
  prop_key: string;
  type: "dropdown" | "slider" | "input" | "number"; 
  options?: string[]; // Only used for dropdowns
};

// 4. The master Rulebook for every node in FlowPins
export interface NodeSpec {
  title: string;
  profile: string;
  inputs: PinSpec[];
  outputs: PinSpec[];
  default_props?: Record<string, any>;
  ui_schema?: UIItem[];
  // Clean, wildcard dictionary for ALL current and future languages
  translations?: Record<string, string | ((data: any) => string)>; 
}