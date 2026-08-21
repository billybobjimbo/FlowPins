// src/libraries/types.ts

// PIN_COLORS used to live here. It was exported, re-exported through
// index.ts "for use in App.tsx and NodeInspector.tsx", and then never
// consumed by anything — while quietly disagreeing with the two live
// copies (it had string as #ff007a and float as #44ff00).
// Pin colours now come from theme.ts via pinColor().

// 1. Define what a Pin looks like
export type PinSpec = {
  name: string;
  pin_type: string;
};

// 2. Define the UI elements (Dropdowns, etc.)
export type UIItem = {
  label: string;
  prop_key: string;
  type: "dropdown" | "slider" | "input" | "number" | "checkbox" | "color";
  options?: string[]; // Only used for dropdowns
};

// 3. The master Rulebook for every node in FlowPins
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
