// src/renderer/src/libraries/seed.ts
// ============================================================================
// FLOWPINS: LIBRARY SEED
// Maps NODE_LIBRARY entries to LibraryItem records for the panel accordion.
// ============================================================================
import { NODE_LIBRARY } from "./index";

export type LibraryProfile = "python" | "toonboom_js" | "toonboom_python" | "maya_python";

export type LibraryItem = {
  id: string;
  title: string;
  category: string;
  profile: LibraryProfile;
  nodeKind: string; // <-- this is your NodeSpec.kind
};

// Scene Pulse + any future Harmony-Python-target nodes. Exact-match list
// rather than a prefix rule, since tb_ is already used by the Qt Script
// (js_toonboom) node set and we don't want to recategorize those here.
const HARMONY_PYTHON_NODE_KINDS = new Set([
  "tb_get_scene_nodes",
  "tb_is_node_orphaned",
  "tb_classify_orphan_severity",
  "tb_scan_orphaned_nodes",
  "tb_get_process_memory_mb",
]);

function profileForKind(kind: string): LibraryProfile {
  if (HARMONY_PYTHON_NODE_KINDS.has(kind)) return "toonboom_python";
  if (kind.startsWith("maya_")) return "maya_python";
  return "python";
}

function categoryForKind(kind: string): string {
  if (kind.startsWith("const_")) return "Values";
  if (kind.endsWith("_exec") || kind === "start") return "Exec";
  if (kind.startsWith("foreach_") || kind === "break_exec" || kind === "continue_exec") return "Loops";
  if (kind.includes("list") || kind.includes("map")) return "Collections";
  if (kind.includes("var")) return "Variables";
  if (kind.includes("param")) return "Params";
  if (kind.startsWith("maya_")) return "Maya";
  if (HARMONY_PYTHON_NODE_KINDS.has(kind)) return "Scene Pulse";
  return "Misc";
}

function toLibraryItem(kind: string) {
  const spec = NODE_LIBRARY[kind];
  return {
    id: `${profileForKind(kind)}.${kind}`,
    title: spec.title,
    category: categoryForKind(kind),
    profile: profileForKind(kind),
    nodeKind: kind,
  } satisfies LibraryItem;
}

const allItems = Object.keys(NODE_LIBRARY).map(toLibraryItem);

export const LIBRARIES: Record<LibraryProfile, LibraryItem[]> = {
  python: allItems.filter((x) => x.profile === "python"),
  toonboom_js: [], // later
  toonboom_python: allItems.filter((x) => x.profile === "toonboom_python"),
  maya_python: allItems.filter((x) => x.profile === "maya_python"),
};
