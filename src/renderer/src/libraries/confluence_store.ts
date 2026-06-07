// src/renderer/src/libraries/confluence_store.ts
// ============================================================================
// FLOWPINS: CONFLUENCE STORE
// Data layer for saved Confluence nodes.
//
// Pin interface is auto-scanned from the leftmost and rightmost selected
// nodes using NODE_LIBRARY specs — no manual entry, correct types always.
//
// Colour: Payne's Grey  #536878
// ============================================================================

export const CONFLUENCE_COLOR = '#536878';

// ── Pin type ──────────────────────────────────────────────────────────────────

export type ConfluencePin = {
  name:     string;   // e.g. "exec_in", "folder_path"
  pinType:  string;   // "exec" | "string" | "int" | "float" | "list" | "any"
  handleId: string;   // unique ReactFlow handle id
};

// ── Data shape ────────────────────────────────────────────────────────────────

export type ConfluenceNode = {
  id:           string;
  title:        string;
  category:     string;
  description:  string;
  nodes:        any[];
  wires:        any[];
  createdAt:    string;
  version:      string;
  inputPins?:   ConfluencePin[];
  outputPins?:  ConfluencePin[];
};

// ── Persistence ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'flowpins_confluence_library';
let _registry: ConfluenceNode[] = [];

function _load(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate legacy fields
      _registry = parsed.map((n: any) => ({
        ...n,
        wires:      n.wires      ?? n.edges ?? [],
        inputPins:  n.inputPins  ?? [],
        outputPins: n.outputPins ?? [],
      }));
    }
  } catch { _registry = []; }
}

function _persist(): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_registry)); }
  catch { console.warn('FlowPins: Could not persist Confluence library.'); }
}

_load();

// ── Pin scanner ───────────────────────────────────────────────────────────────
// Reads pin specs directly from NODE_LIBRARY so types and names are always
// correct and consistent with the rest of FlowPins.

export function scanPinsFromNodes(
  selectedNodes: any[],
  nodeLibrary:   Record<string, any>
): { inputPins: ConfluencePin[]; outputPins: ConfluencePin[] } {

  if (selectedNodes.length === 0) {
    return { inputPins: [], outputPins: [] };
  }

  // Sort by X position — leftmost is the entry, rightmost is the exit
  const sorted = [...selectedNodes].sort(
    (a, b) => (a.position?.x ?? 0) - (b.position?.x ?? 0)
  );

  const leftmostNode  = sorted[0];
  const rightmostNode = sorted[sorted.length - 1];

  const leftSpec  = nodeLibrary[leftmostNode.data?.nodeKind]  || null;
  const rightSpec = nodeLibrary[rightmostNode.data?.nodeKind] || null;

  // Input pins — from the leftmost node's INPUTS (what feeds into the group)
  const inputPins: ConfluencePin[] = (leftSpec?.inputs || []).map(
    (pin: any, i: number) => ({
      name:     pin.name,
      pinType:  pin.pin_type || 'any',
      handleId: `input_${i}_${pin.name}`,
    })
  );

  // Output pins — from the rightmost node's OUTPUTS (what comes out of the group)
  // If leftmost === rightmost (single node), use outputs of that same node
  const outputPins: ConfluencePin[] = (rightSpec?.outputs || []).map(
    (pin: any, i: number) => ({
      name:     pin.name,
      pinType:  pin.pin_type || 'any',
      handleId: `output_${i}_${pin.name}`,
    })
  );

  return { inputPins, outputPins };
}

// ── Public API ────────────────────────────────────────────────────────────────

export const ConfluenceStore = {

  getAll(): ConfluenceNode[] {
    return [..._registry];
  },

  getCategories(): string[] {
    return Array.from(new Set(_registry.map(n => n.category))).sort();
  },

  save(node: ConfluenceNode): void {
    const idx = _registry.findIndex(n => n.id === node.id);
    if (idx >= 0) _registry[idx] = node;
    else _registry.push(node);
    _persist();
  },

  remove(id: string): void {
    _registry = _registry.filter(n => n.id !== id);
    _persist();
  },

  /**
   * Create a Confluence node from a canvas selection.
   * inputPins and outputPins are auto-scanned from leftmost/rightmost nodes
   * using NODE_LIBRARY — pass the library in from RightPanel.
   */
  createFromSelection(
    title:        string,
    category:     string,
    description:  string,
    nodes:        any[],
    allEdges:     any[],
    inputPins:    ConfluencePin[],
    outputPins:   ConfluencePin[]
  ): ConfluenceNode {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

    const selectedIds = new Set(nodes.map((n: any) => n.id));

    const internalWires = allEdges.filter(
      (e: any) => selectedIds.has(e.source) && selectedIds.has(e.target)
    );

    const node: ConfluenceNode = {
      id:          `confluence_${slug}_${Date.now()}`,
      title,
      category,
      description,
      nodes,
      wires:       internalWires,
      createdAt:   new Date().toISOString(),
      version:     '1.0',
      inputPins,
      outputPins,
    };

    ConfluenceStore.save(node);
    return node;
  },

  exportToJSON(id: string): string | null {
    const node = _registry.find(n => n.id === id);
    if (!node) return null;
    return JSON.stringify(node, null, 2);
  },

  importFromJSON(raw: any): ConfluenceNode | null {
    try {
      if (!raw.id || !raw.title || !raw.nodes) return null;
      const node: ConfluenceNode = {
        ...raw,
        wires:      raw.wires ?? raw.edges ?? [],
        inputPins:  raw.inputPins  ?? [],
        outputPins: raw.outputPins ?? [],
      };
      ConfluenceStore.save(node);
      return node;
    } catch { return null; }
  },

  clearAll(): void {
    _registry = [];
    _persist();
  },
};
