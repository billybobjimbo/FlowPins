// src/renderer/src/libraries/seed.ts
import { NODE_LIBRARY } from "./index";

export type LibraryProfile = "python" | "toonboom_js" | "maya_python";

export type LibraryItem = {
  id: string;
  title: string;
  category: string;
  profile: LibraryProfile;
  nodeKind: string; // <-- this is your NodeSpec.kind
};

function profileForKind(kind: string): LibraryProfile {
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
  maya_python: allItems.filter((x) => x.profile === "maya_python"),
};
