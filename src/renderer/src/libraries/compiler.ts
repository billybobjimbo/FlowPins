// src/renderer/src/libraries/compiler.ts
// ============================================================================
// FLOWPINS COMPILER ENGINE
//
// Confluence node support: when the compiler encounters a node with
// nodeKind === 'confluence', it fetches the inner graph from ConfluenceStore
// and recursively compiles it as a macro expansion — the inner nodes are
// treated as if they were written directly on the main canvas.
// ============================================================================

import { type Node, type Edge } from 'reactflow';
import { NODE_LIBRARY } from './index';
import { ConfluenceStore } from './confluence_store';
import { HARMONY_TRANSLATIONS }  from './translators/harmony';
import { FUSION_TRANSLATIONS }   from './translators/fusion';
import { MAYA_TRANSLATIONS }     from './translators/maya';
import { PYTHON_TRANSLATIONS }   from './translators/python';
import { CSHARP_TRANSLATIONS }   from './translators/csharp';
import { HOUDINI_TRANSLATIONS }  from './translators/houdini';
import { GML_TRANSLATIONS }      from './translators/gml';

// --- PUBLIC TYPES -----------------------------------------------------------

export type CompileMode =
  | 'js_toonboom'
  | 'py_maya'
  | 'py_houdini'
  | 'cs_csharp'
  | 'lua_fusion'
  | 'py_standard'
  | 'gml_standard'
  | 'py_nuke';

export type CodeBlock = { id: string | null; text: string };

// --- TRANSLATION REGISTRY ---------------------------------------------------

const TRANSLATION_REGISTRY: Record<CompileMode, Record<string, any>> = {
  js_toonboom:  HARMONY_TRANSLATIONS,
  py_maya:      MAYA_TRANSLATIONS,
  py_houdini:   HOUDINI_TRANSLATIONS,
  cs_csharp:    CSHARP_TRANSLATIONS,
  lua_fusion:   FUSION_TRANSLATIONS,
  py_standard:  PYTHON_TRANSLATIONS,
  gml_standard: GML_TRANSLATIONS,
  py_nuke:      PYTHON_TRANSLATIONS,
};

const COMMENT_PREFIX: Record<CompileMode, string> = {
  js_toonboom:  '//',
  py_maya:      '#',
  py_houdini:   '#',
  cs_csharp:    '//',
  lua_fusion:   '--',
  py_standard:  '#',
  gml_standard: '//',
  py_nuke:      '#',
};

const FILE_HEADERS: Partial<Record<CompileMode, string>> = {
  js_toonboom: `function FlowPinsTool() {\n    var d = new QDialog();\n    var layout = new QVBoxLayout();\n`,
  py_maya:     `import maya.cmds as cmds\n`,
  cs_csharp:   `using System;\n\npublic class FlowPinsTool {\n    public static void Execute() {\n`,
  lua_fusion:  `local comp = fusion:GetCurrentComp()\ncomp:StartUndo('FlowPins Build')\n`,
};

const FILE_FOOTERS: Partial<Record<CompileMode, string>> = {
  js_toonboom: `\n    d.setLayout(layout);\n    // d.exec();\n}`,
  cs_csharp:   `    }\n}`,
  lua_fusion:  `\ncomp:EndUndo(true)\nprint('FlowPins Generation Complete!')`,
};

// ============================================================================
// INTERNAL COMPILER STATE
// ============================================================================

interface CompilerState {
  nodes:           Node[];
  edges:           Edge[];
  mode:            CompileMode;
  translationDict: Record<string, any>;
  commentPrefix:   string;
  execVisited:     Set<string>;
  dataCallStack:   Set<string>;
}

// ============================================================================
// HELPERS
// ============================================================================

function safeId(nodeId: string): string {
  const clean = nodeId.replace(/[^a-zA-Z0-9]/g, '');
  return 'n_' + clean.slice(-6);
}

function indentBlock(code: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return code
    .split('\n')
    .map((line, i) => (i === 0 ? line : line.length > 0 ? pad + line : line))
    .join('\n');
}

// ============================================================================
// CONFLUENCE MACRO EXPANSION
//
// Two modes depending on context:
//
//   DATA mode (requestedOutputPin is set):
//     A downstream node is asking for a specific output pin value from this
//     group, e.g. the "b" pin on Compare (int) is wired to the group's
//     "result" output. We find the inner node that produces that output and
//     return its inline expression — no comments, no exec walk, no wrapping.
//     This keeps the compiled output syntactically clean: `(10 * 3)` not
//     `# Confluence…\n(10 * 3)\n10\n3\n# End…`
//
//   EXEC mode (requestedOutputPin is null):
//     The group node appears in the exec chain. Emit commented section
//     markers and compile the full inner exec walk inline.
// ============================================================================

function expandConfluenceNode(
  confluenceCanvasNode: Node,
  outerState:           CompilerState,
  requestedOutputPin:   string | null = null
): string {
  const { commentPrefix, mode, translationDict } = outerState;
  const confluenceId = confluenceCanvasNode.data?.confluenceId;

  if (!confluenceId) {
    return requestedOutputPin
      ? `MISSING_CONFLUENCE_ID`
      : `${commentPrefix} [FlowPins] Confluence node missing confluenceId\n`;
  }

  const cn = ConfluenceStore.getAll().find(n => n.id === confluenceId);
  if (!cn) {
    return requestedOutputPin
      ? `MISSING_CONFLUENCE_GROUP`
      : `${commentPrefix} [FlowPins] Confluence group not found: ${confluenceId}\n`;
  }

  const innerNodes: Node[] = cn.nodes || [];
  const innerWires: Edge[] = (cn.wires || cn.edges || []) as Edge[];

  if (innerNodes.length === 0) {
    return requestedOutputPin
      ? `MISSING_INNER_NODES`
      : `${commentPrefix} [FlowPins] Confluence group "${cn.title}" is empty\n`;
  }

  // ── Build synthetic boundary nodes ──────────────────────────────────────
  // For each outer edge wired INTO the group node's input pins, we create a
  // synthetic "passthrough" node inside the inner graph. When an inner node
  // asks for a data value on a pin that has no inner wire, the synthetic node
  // resolves it by compiling the outer source node's value.
  //
  // e.g. outer: Const Int (value=50) --> group.a
  //      synthetic inner node for "a" returns "50" when asked
  //
  // This is purely a compiler construct — nothing in ReactFlow or the store.

  const inputPins   = cn.inputPins  || [];
  const syntheticNodes: Node[] = [];
  const syntheticEdges: Edge[] = [];

  inputPins
    .filter((p: any) => p.pinType !== 'exec')
    .forEach((pin: any) => {
      // Find the outer edge that feeds this input pin
      const outerEdge = outerState.edges.find(
        e => e.target === confluenceCanvasNode.id &&
             (e.targetHandle === pin.handleId || e.targetHandle === pin.name)
      );
      if (!outerEdge) return;

      // Compile the outer source value now, in the outer state
      const outerSource = outerState.nodes.find(n => n.id === outerEdge.source);
      if (!outerSource) return;

      const outerValue = (() => {
        if (outerSource.data.nodeKind === 'confluence') {
          return expandConfluenceNode(outerSource, outerState, outerEdge.sourceHandle);
        }
        const cycleKey = `${outerSource.id}::${pin.name}`;
        if (outerState.dataCallStack.has(cycleKey)) return '';
        outerState.dataCallStack.add(cycleKey);
        const val = generateNodeCode(outerSource, outerState).trim();
        outerState.dataCallStack.delete(cycleKey);
        return val;
      })();

      if (!outerValue) return;

      // Create a synthetic const node inside the inner graph that returns
      // the pre-compiled outer value when any inner node requests pin.name
      const synthId = `__synth_${pin.name}`;
      syntheticNodes.push({
        id:       synthId,
        type:     'fp',
        position: { x: -999, y: 0 },
        data: {
          nodeKind:        '__synthetic_passthrough__',
          label:           `[outer: ${pin.name}]`,
          __compiledValue: outerValue,
          props:           {},
        },
      } as any);

      // Wire the synthetic node's output to every inner node that needs pin.name
      innerNodes.forEach(innerNode => {
        const spec = NODE_LIBRARY[innerNode.data?.nodeKind];
        if (!spec) return;
        const hasPin = spec.inputs?.some((p2: any) => p2.name === pin.name);
        if (!hasPin) return;
        // Only wire if there's no existing inner wire for this pin
        const alreadyWired = innerWires.some(
          w => w.target === innerNode.id && w.targetHandle === pin.name
        );
        if (!alreadyWired) {
          syntheticEdges.push({
            id:           `__synth_edge_${pin.name}_${innerNode.id}`,
            source:       synthId,
            sourceHandle: pin.name,
            target:       innerNode.id,
            targetHandle: pin.name,
          } as Edge);
        }
      });
    });

  // Inner compiler state — includes synthetic boundary nodes and edges
  const innerState: CompilerState = {
    nodes:           [...innerNodes, ...syntheticNodes],
    edges:           [...innerWires, ...syntheticEdges],
    mode,
    translationDict,
    commentPrefix,
    execVisited:     new Set<string>(),
    dataCallStack:   new Set<string>(),
  };

  // ── DATA MODE ─────────────────────────────────────────────────────────────
  // A downstream node wants the value of a specific output pin.
  // Find which inner node produces that pin and return its inline expression.
  if (requestedOutputPin !== null) {
    // The outputPins list tells us which inner node's output maps to each
    // group output pin. Find the matching entry.
    const outputPins = cn.outputPins || [];
    const matchingPin = outputPins.find((p: any) => p.handleId === requestedOutputPin || p.name === requestedOutputPin);

    if (matchingPin) {
      // Find the inner node that is the source of this output.
      // Strategy: sort inner nodes by X position (rightmost = exit node)
      // and find the one whose spec has an output matching the pin name.
      const sorted = [...innerNodes].sort((a, b) => (b.position?.x ?? 0) - (a.position?.x ?? 0));
      for (const innerNode of sorted) {
        const spec = NODE_LIBRARY[innerNode.data?.nodeKind];
        if (!spec) continue;
        const hasPin = spec.outputs?.some((o: any) => o.name === matchingPin.name);
        if (hasPin) {
          // Compile just this node as a pure inline data expression
          innerState.dataCallStack = new Set<string>();
          return generateNodeCode(innerNode, innerState).trim();
        }
      }
    }

    // Fallback: compile the rightmost non-exec inner node inline
    const sorted = [...innerNodes]
      .filter(n => n.type === 'fp')
      .sort((a, b) => (b.position?.x ?? 0) - (a.position?.x ?? 0));
    if (sorted.length > 0) {
      innerState.dataCallStack = new Set<string>();
      return generateNodeCode(sorted[0], innerState).trim();
    }

    return `MISSING_CONFLUENCE_OUTPUT`;
  }

  // ── EXEC MODE ─────────────────────────────────────────────────────────────
  // The group node is in the exec chain. Start node always lives on the
  // main canvas — the inner graph is entered via exec_in and exited via exec_out.
  //
  // Entry point strategy:
  //   1. Find the leftmost node that has exec pins (exec_in or exec_out)
  //      — this is the real entry node (e.g. If Branch, For Loop, Print)
  //   2. Fall back to leftmost fp node if no exec node found
  //
  // Pure data nodes (Const Int, Multiply, Compare) are never exec entry
  // points — they compile inline when referenced by an exec node's data pins.
  const cp = commentPrefix;

  const fpNodes = [...innerNodes].filter(n => n.type === 'fp');

  // Find leftmost exec-capable node
  const innerEntry = fpNodes
    .filter(n => {
      const spec = NODE_LIBRARY[n.data?.nodeKind];
      if (!spec) return false;
      return spec.inputs?.some((p: any)  => p.pin_type === 'exec') ||
             spec.outputs?.some((p: any) => p.pin_type === 'exec');
    })
    .sort((a, b) => (a.position?.x ?? 0) - (b.position?.x ?? 0))[0]
    // Fall back to leftmost fp node
    || fpNodes.sort((a, b) => (a.position?.x ?? 0) - (b.position?.x ?? 0))[0];

  let result = `${cp} ── Confluence: ${cn.title} ──────────────────\n`;

  if (innerEntry) {
    const execOrder = walkExecOrder(innerEntry, innerNodes, innerWires);
    execOrder.forEach(node => {
      innerState.dataCallStack = new Set<string>();
      const code = generateNodeCodeIsolated(node, innerState);
      if (code.trim()) result += code + '\n';
    });
  }

  result += `${cp} ── End: ${cn.title} ──────────────────────────\n`;
  return result;
}

// ============================================================================
// CORE: GENERATE CODE FOR A SINGLE NODE
// ============================================================================

function generateNodeCode(node: Node, state: CompilerState): string {
  const { nodes, edges, mode, translationDict, commentPrefix } = state;
  const nodeKind = node.data.nodeKind;

  // ── Confluence macro expansion ────────────────────────────────────────────
  if (nodeKind === 'confluence') {
    return expandConfluenceNode(node, state);
  }

  // ── Synthetic passthrough node (compiler-only boundary bridge) ────────────
  if (nodeKind === '__synthetic_passthrough__') {
    return (node.data as any).__compiledValue || '';
  }

  const nodeSpec = NODE_LIBRARY[nodeKind];
  if (!nodeSpec) return `${commentPrefix} [FlowPins] Unknown node kind: ${nodeKind}\n`;

  let template = translationDict[nodeKind];
  if (nodeKind === 'start') template = `${commentPrefix} Start Execution\n{exec_out}`;
  if (template === undefined) return `${commentPrefix} [FlowPins] No ${mode} translation for: ${nodeSpec.title}\n`;
  if (typeof template === 'function') template = template(node.data);

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match: string, key: string) => {
    if (key === 'node_id') return safeId(node.id);

    const outPin = nodeSpec.outputs?.find((o: any) => o.name === key && o.pin_type === 'exec');
    if (outPin) {
      const branchBodyPins = ['loop_body', 'true', 'false', 'then_1', 'then_2', 'then_3', 'try', 'catch'];
      const isBranchBody   = branchBodyPins.includes(key);
      const outEdge  = edges.find(e => e.source === node.id && e.sourceHandle === key);
      if (!outEdge) return '';
      const nextNode = nodes.find(n => n.id === outEdge.target);
      if (!nextNode) return '';
      if (isBranchBody) {
        const branchState = { ...state, execVisited: new Set<string>() };
        return generateNodeCode(nextNode, branchState) || `/* empty body: ${key} -> ${nextNode.data.nodeKind} */`;
      }
      if (state.execVisited.has(nextNode.id)) return '';
      state.execVisited.add(nextNode.id);
      return generateNodeCode(nextNode, state);
    }

    const dataEdge = edges.find(e => e.target === node.id && e.targetHandle === key);
    if (dataEdge) {
      if (dataEdge.sourceHandle === 'index') return safeId(dataEdge.source) + '_i';
      if (dataEdge.sourceHandle === 'item')  return safeId(dataEdge.source) + '_item';
      const sourceNode = nodes.find(n => n.id === dataEdge.source);

      // ── Confluence node as data source — DATA mode expansion ─────────────
      if (sourceNode?.data?.nodeKind === 'confluence') {
        return expandConfluenceNode(sourceNode, state, dataEdge.sourceHandle);
      }

      const namedOutputs = getNamedOutputs();
      if (sourceNode && namedOutputs[sourceNode.data.nodeKind]?.[dataEdge.sourceHandle]) {
        return namedOutputs[sourceNode.data.nodeKind][dataEdge.sourceHandle];
      }
      if (sourceNode) {
        const cycleKey = `${sourceNode.id}::${key}`;
        if (state.dataCallStack.has(cycleKey)) return `${commentPrefix}_CYCLE_DETECTED_`;
        state.dataCallStack.add(cycleKey);
        if (sourceNode.data.nodeKind === 'func_def')  { state.dataCallStack.delete(cycleKey); return 'arg0'; }
        if (sourceNode.data.nodeKind === 'func_call') { state.dataCallStack.delete(cycleKey); return `res_${safeId(sourceNode.id)}`; }
        const result = generateNodeCode(sourceNode, state);
        state.dataCallStack.delete(cycleKey);
        if (result) return result;
      }
    }

    if (node.data.props?.[key] !== undefined && node.data.props[key] !== '') return String(node.data.props[key]);
    if (nodeSpec.default_props?.[key] !== undefined) return String(nodeSpec.default_props[key]);

    const silentTokens = ['exec_out', 'exec_in', 'true', 'false', 'loop_body',
                          'completed', 'then_1', 'then_2', 'then_3', 'try', 'catch'];
    if (silentTokens.includes(key)) return '';
    return `MISSING_${key.toUpperCase()}`;
  });
}

// ============================================================================
// WALK EXECUTION ORDER
// ============================================================================

function getBranchBodyIds(nodes: Node[], edges: Edge[]): Set<string> {
  const bodyIds   = new Set<string>();
  const branchPins = ['loop_body', 'true', 'false', 'then_1', 'then_2', 'then_3', 'try', 'catch'];
  edges.forEach(edge => {
    if (branchPins.includes(edge.sourceHandle ?? '')) bodyIds.add(edge.target);
  });
  return bodyIds;
}

function walkExecOrder(startNode: Node, nodes: Node[], edges: Edge[]): Node[] {
  const ordered: Node[] = [];
  const visited  = new Set<string>();
  const bodyIds  = getBranchBodyIds(nodes, edges);

  function walk(node: Node) {
    if (visited.has(node.id)) return;
    visited.add(node.id);
    if (bodyIds.has(node.id)) return;
    ordered.push(node);

    const spec     = NODE_LIBRARY[node.data.nodeKind];
    const execOuts = spec?.outputs?.filter((o: any) =>
      o.pin_type === 'exec' &&
      !['loop_body','true','false','then_1','then_2','then_3','try','catch','completed'].includes(o.name)
    ) || [];

    execOuts.forEach((pin: any) => {
      const edge = edges.find(e => e.source === node.id && e.sourceHandle === pin.name);
      if (edge) {
        const nextNode = nodes.find(n => n.id === edge.target);
        if (nextNode) walk(nextNode);
      }
    });

    const execOutEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'exec_out');
    if (execOutEdge) {
      const nextNode = nodes.find(n => n.id === execOutEdge.target);
      if (nextNode && !bodyIds.has(nextNode.id)) walk(nextNode);
    }
    const completedEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'completed');
    if (completedEdge) {
      const nextNode = nodes.find(n => n.id === completedEdge.target);
      if (nextNode && !bodyIds.has(nextNode.id)) walk(nextNode);
    }

    // ── Confluence node in exec chain — walk past it ──────────────────────
    if (node.data.nodeKind === 'confluence') {
      // For walk purposes treat confluence as passthrough — the group's
      // exec_out on the main canvas connects to the next outer node.
      const confExecOut = edges.find(e => e.source === node.id);
      if (confExecOut) {
        const nextNode = nodes.find(n => n.id === confExecOut.target);
        if (nextNode && !bodyIds.has(nextNode.id)) walk(nextNode);
      }
    }
  }

  walk(startNode);
  return ordered;
}

// ============================================================================
// ISOLATED NODE CODE GENERATOR
// ============================================================================

function generateNodeCodeIsolated(node: Node, state: CompilerState): string {
  const { nodes, edges, mode, translationDict, commentPrefix } = state;
  const nodeKind = node.data.nodeKind;

  // ── Confluence macro expansion ────────────────────────────────────────────
  if (nodeKind === 'confluence') {
    return expandConfluenceNode(node, state);
  }

  // ── Synthetic passthrough node (compiler-only boundary bridge) ────────────
  if (nodeKind === '__synthetic_passthrough__') {
    return (node.data as any).__compiledValue || '';
  }

  const nodeSpec = NODE_LIBRARY[nodeKind];
  if (!nodeSpec) return `${commentPrefix} [FlowPins] Unknown node kind: ${nodeKind}\n`;

  let template = translationDict[nodeKind];
  if (nodeKind === 'start') template = `${commentPrefix} Start Execution\n`;
  if (template === undefined) return `${commentPrefix} [FlowPins] No ${mode} translation for: ${nodeSpec.title}\n`;
  if (typeof template === 'function') template = template(node.data);

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match: string, key: string) => {
    if (key === 'node_id') return safeId(node.id);

    const outPin = nodeSpec.outputs?.find((o: any) => o.name === key && o.pin_type === 'exec');
    if (outPin) {
      const branchBodyPins = ['loop_body', 'true', 'false', 'then_1', 'then_2', 'then_3', 'try', 'catch'];
      if (branchBodyPins.includes(key)) {
        const outEdge  = edges.find(e => e.source === node.id && e.sourceHandle === key);
        if (!outEdge) return '';
        const nextNode = nodes.find(n => n.id === outEdge.target);
        if (!nextNode) return '';
        const branchState = { ...state, execVisited: new Set<string>() };
        return generateNodeCode(nextNode, branchState);
      }
      return '';
    }

    const dataEdge = edges.find(e => e.target === node.id && e.targetHandle === key);
    if (dataEdge) {
      if (dataEdge.sourceHandle === 'index') return safeId(dataEdge.source) + '_i';
      if (dataEdge.sourceHandle === 'item')  return safeId(dataEdge.source) + '_item';
      const sourceNode = nodes.find(n => n.id === dataEdge.source);

      // ── Confluence node as data source — DATA mode expansion ─────────────
      if (sourceNode?.data?.nodeKind === 'confluence') {
        return expandConfluenceNode(sourceNode, state, dataEdge.sourceHandle);
      }

      const namedOutputs = getNamedOutputs();
      if (sourceNode && namedOutputs[sourceNode.data.nodeKind]?.[dataEdge.sourceHandle]) {
        return namedOutputs[sourceNode.data.nodeKind][dataEdge.sourceHandle];
      }
      if (sourceNode) {
        const cycleKey = `${sourceNode.id}::${key}`;
        if (state.dataCallStack.has(cycleKey)) return `${commentPrefix}_CYCLE_`;
        state.dataCallStack.add(cycleKey);
        if (sourceNode.data.nodeKind === 'func_def')  { state.dataCallStack.delete(cycleKey); return 'arg0'; }
        if (sourceNode.data.nodeKind === 'func_call') { state.dataCallStack.delete(cycleKey); return `res_${safeId(sourceNode.id)}`; }
        const result = generateNodeCode(sourceNode, state);
        state.dataCallStack.delete(cycleKey);
        if (result) return result;
      }
    }

    if (node.data.props?.[key] !== undefined && node.data.props[key] !== '') return String(node.data.props[key]);
    if (nodeSpec.default_props?.[key] !== undefined) return String(nodeSpec.default_props[key]);

    const silentTokens = ['exec_out', 'exec_in', 'loop_body', 'completed',
                          'then_1', 'then_2', 'then_3', 'try', 'catch'];
    if (silentTokens.includes(key)) return '';
    return `MISSING_${key.toUpperCase()}`;
  });
}

// ============================================================================
// NAMED OUTPUTS — extracted to avoid duplication between the two generators
// ============================================================================

function getNamedOutputs(): Record<string, Record<string, string>> {
  return {
    'rp_count_files':             { summary: 'summary', png_count: 'png_count', exr_count: 'exr_count', tiff_count: 'tiff_count', total_count: 'total_count' },
    'cs_batch_validate':          { pass_list: 'pass_list', fail_list: 'fail_list', pass_count: 'pass_count', fail_count: 'fail_count' },
    'img_batch_check_dimensions': { pass_list: 'pass_list', fail_list: 'fail_list', pass_count: 'pass_count', fail_count: 'fail_count' },
    'img_batch_validate':         { pass_list: 'pass_list', fail_list: 'fail_list', pass_count: 'pass_count', fail_count: 'fail_count', folder_path: 'folder' },
    'nm_batch_check_folder':      { pass_list: 'pass_list', fail_list: 'fail_list', pass_count: 'pass_count', fail_count: 'fail_count' },
    'rp_compare_folders':         { only_in_a: 'only_in_a', only_in_b: 'only_in_b', in_both: 'in_both', missing_count: 'missing_count' },
    'nm_extract_version':         { version_string: 'version_string', version_int: 'version_int', found: 'found' },
    'nm_extract_shot':            { shot: 'shot', scene: 'scene', layer: 'layer', version: 'version' },
    'nm_bump_version':            { new_filename: 'new_filename', new_version: 'new_version' },
    'nm_check_convention':        { is_valid: 'is_valid', result_message: 'result_message' },
    'cs_read_png_profile':        { profile_name: 'profile_name', colourspace: 'colourspace', is_tagged: 'is_tagged' },
    'cs_check_colourspace':       { is_correct: 'is_correct', result_message: 'result_message' },
    'img_get_dimensions':         { width: 'width', height: 'height', summary: 'summary' },
    'img_check_dimensions':       { is_correct: 'is_correct', result_message: 'result_message', actual_width: 'actual_width', actual_height: 'actual_height' },
    'img_get_bit_depth':          { bit_depth: 'bit_depth', mode: 'mode' },
    'img_check_bit_depth':        { is_correct: 'is_correct', result_message: 'result_message' },
    'fs_walk_folder':             { file_path: 'file_path', file_name: 'file_name', file_ext: 'file_ext' },
    'tb_get_top_level_groups':    { group_list: 'group_list', group_count: 'group_count' },
    'tb_find_multiport_out':      { node_path: 'node_path', found: 'found' },
    'tb_nav_anchor_exists':       { exists: 'exists', anchor_path: 'anchor_path' },
    'tb_plant_nav_composite':     { anchor_path: 'anchor_path', anchor_name: 'anchor_name' },
    'tb_get_node_coord':          { coord_x: 'coord_x', coord_y: 'coord_y', coord_z: 'coord_z' },
    'tb_get_group_short_name':    { short_name: 'short_name' },
    'tb_get_nodes_by_type':       { node_list: 'node_list', node_names: 'node_names', node_count: 'node_count' },
    'tb_get_selected_node':       { node_path: 'node_path', node_name: 'node_name', node_type: 'node_type' },
    'tb_filter_list_by_type':     { filtered_list: 'filtered_list', filtered_count: 'filtered_count' },
    'fs_frame_sequence_check':    { missing_frames: 'missing_frames', found_count: 'found_count', missing_count: 'missing_count', is_complete: 'is_complete', naming_fails: 'naming_fails', cs_fails: 'cs_fails' },
    'cfg_load_config':            { config_data: 'config_data', exists: 'exists' },
    'cfg_get_value':              { value: 'value' },
    'ps_launch_suite':            { launched: 'launched' },
    'rpt_error_log_summariser':   { total_errors: 'total_errors', error_types: 'error_types', report_path: 'report_path', has_errors: 'has_errors' },
    'rpt_daily_progress':         { report_path: 'report_path', total_shots: 'total_shots', complete_shots: 'complete_shots', percent_done: 'percent_done' },
    'rpt_shot_status_csv':        { total_shots: 'total_shots', complete_shots: 'complete_shots', output_path: 'output_path' },
    'rpt_signoff_sheet':          { report_path: 'report_path', all_passed: 'all_passed' },
    'rpt_delivery_checklist':     { all_passed: 'all_passed', checks_passed: 'checks_passed', checks_failed: 'checks_failed', report_path: 'report_path' },
    'cs_lut_validator':           { total_luts: 'total_luts', valid_count: 'valid_count', invalid_count: 'invalid_count', invalid_list: 'invalid_list', all_valid: 'all_valid' },
    'cs_project_report':          { total_files: 'total_files', unique_spaces: 'unique_spaces', untagged_count: 'untagged_count', summary: 'summary' },
    'ast_orphan_finder':          { orphan_count: 'orphan_count', orphan_files: 'orphan_files', orphan_mb: 'orphan_mb', has_orphans: 'has_orphans' },
    'ast_texture_audit':          { total_textures: 'total_textures', issues_count: 'issues_count', issues_list: 'issues_list', all_valid: 'all_valid' },
    'ast_cross_reference':        { found_count: 'found_count', missing_count: 'missing_count', missing_files: 'missing_files', all_present: 'all_present' },
    'ast_version_checker':        { total_assets: 'total_assets', outdated_count: 'outdated_count', outdated_files: 'outdated_files', all_current: 'all_current' },
    'ast_inventory':              { total_files: 'total_files', total_folders: 'total_folders', total_size_mb: 'total_size_mb', asset_list: 'asset_list' },
    'rnd_size_estimator':         { size_mb: 'size_mb', size_gb: 'size_gb', size_per_frame: 'size_per_frame', size_summary: 'size_summary' },
    'rnd_error_scanner':          { error_count: 'error_count', warning_count: 'warning_count', error_lines: 'error_lines', has_errors: 'has_errors' },
    'rnd_multi_shot_progress':    { total_shots: 'total_shots', complete_shots: 'complete_shots', in_progress: 'in_progress', not_started: 'not_started', all_complete: 'all_complete' },
    'rnd_frame_range_validator':  { is_valid: 'is_valid', frames_found: 'frames_found', frames_expected: 'frames_expected', missing_frames: 'missing_frames', extra_frames: 'extra_frames' },
    'rnd_progress_checker':       { frames_done: 'frames_done', frames_total: 'frames_total', percent_done: 'percent_done', frames_missing: 'frames_missing', is_complete: 'is_complete' },
    'fs_stale_file_report':       { stale_files: 'stale_files', stale_count: 'stale_count', stale_mb: 'stale_mb', has_stale: 'has_stale' },
    'fs_find_duplicates':         { duplicate_groups: 'duplicate_groups', duplicate_count: 'duplicate_count', wasted_mb: 'wasted_mb', has_duplicates: 'has_duplicates' },
    'fs_file_size_report':        { total_size_mb: 'total_size_mb', file_count: 'file_count', largest_file: 'largest_file', over_threshold: 'over_threshold' },
    'fs_batch_rename':            { renamed_count: 'renamed_count', skipped_count: 'skipped_count', success: 'success' },
    'fs_folder_diff':             { missing_files: 'missing_files', extra_files: 'extra_files', matched_count: 'matched_count', missing_count: 'missing_count', extra_count: 'extra_count', is_match: 'is_match' },
    'fs_find_missing_frames':     { missing_frames: 'missing_frames', found_count: 'found_count', missing_count: 'missing_count', first_frame: 'first_frame', last_frame: 'last_frame', is_complete: 'is_complete' },
    'fs_create_project_folders':  { project_root: 'project_root', folders_created: 'folders_created', success: 'success' },
    'rpt_delivery_package':       { all_passed: 'all_passed', report_path: 'report_path', total_issues: 'total_issues' },
    'csv_read_shot_list':         { shot_list: 'shot_list', shot_count: 'shot_count' },
    'csv_multi_shot_validate':    { total_shots: 'total_shots', passed_shots: 'passed_shots', failed_shots: 'failed_shots', report_path: 'report_path', all_passed: 'all_passed' },
    'cfg_load_or_show':           { folder_path: 'folder_path', extension: 'extension', start_frame: 'start_frame', end_frame: 'end_frame', naming_pattern: 'naming_pattern', colourspace: 'colourspace', frame_padding: 'frame_padding', prefix: 'prefix', source_folder: 'source_folder', target_folder: 'target_folder', cancelled: 'cancelled' },
    'cfg_show_dialog':            { folder_path: 'folder_path', extension: 'extension', start_frame: 'start_frame', end_frame: 'end_frame', naming_pattern: 'naming_pattern', colourspace: 'colourspace', frame_padding: 'frame_padding', save_config: 'save_config', cancelled: 'cancelled' },
    'tb_get_selection_count':     { count: 'count' },
    'tb_get_selected_nodes':      { node_list: 'node_list', count: 'count' },
    'tb_get_parent_group':        { parent_path: 'parent_path', parent_name: 'parent_name' },
    'tb_get_active_view_group':   { group_path: 'group_path', group_name: 'group_name' },
    'tb_string_append':           { result: 'result' },
    'tb_sort_nodes_by_x':         { sorted_list: 'sorted_list', first_node: 'first_node' },
    'rp_save_csv':                { pass_list: 'pass_list', fail_list: 'fail_list' },
  };
}

// ============================================================================
// PUBLIC: GENERATE ALL CODE BLOCKS
// ============================================================================

export function generateCodeBlocks(
  nodes: Node[],
  edges: Edge[],
  mode:  CompileMode
): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const translationDict = TRANSLATION_REGISTRY[mode];
  const commentPrefix   = COMMENT_PREFIX[mode];

  const header = FILE_HEADERS[mode] ?? '';
  if (header) blocks.push({ id: null, text: header });

  const state: CompilerState = {
    nodes, edges, mode, translationDict, commentPrefix,
    execVisited:   new Set<string>(),
    dataCallStack: new Set<string>(),
  };

  // Pass 1: Hoist function definitions
  const funcNodes = nodes.filter(n => n.data.nodeKind === 'func_def');
  funcNodes.forEach(funcNode => {
    if (state.execVisited.has(funcNode.id)) return;
    state.execVisited.add(funcNode.id);
    const code = generateNodeCodeIsolated(funcNode, state);
    if (code.trim()) blocks.push({ id: funcNode.id, text: code + '\n' });
  });

  // Pass 2: Walk execution order
  const startNode = nodes.find(n => n.data.nodeKind === 'start');
  if (startNode) {
    const execOrder = walkExecOrder(startNode, nodes, edges);
    execOrder.forEach(node => {
      state.dataCallStack = new Set<string>();
      // Confluence nodes in the exec chain expand as inline exec blocks
      const code = node.data.nodeKind === 'confluence'
        ? expandConfluenceNode(node, state, null)
        : generateNodeCodeIsolated(node, state);
      if (code.trim()) blocks.push({ id: node.id, text: code + '\n' });
    });
  }

  // Pass 3: Toon Boom node-link routing (JS only)
  if (mode === 'js_toonboom') {
    const imageNodeKinds = new Set([
      'tb_composite', 'tb_display', 'tb_write', 'tb_multi_layer_write',
      'tb_image_switch', 'tb_visibility', 'tb_blur_box', 'tb_blur_gaussian',
      'tb_blur_radial', 'tb_blur_directional', 'tb_blur_variable',
      'tb_matte_blur', 'tb_matte_resize', 'tb_glow', 'tb_highlight',
      'tb_tone', 'tb_colour_scale', 'tb_hue_saturation', 'tb_colour_card',
      'tb_cutter', 'tb_gradient', 'tb_colour_override', 'tb_refract',
      'tb_dynamic_refract', 'tb_macro_refract_pro', 'uni_drawing',
    ]);
    const routingLines: string[] = [];
    edges.forEach(edge => {
      if (['exec_out','exec_in','exec','loop_body','true','false',
           'then_1','then_2','then_3','try','catch','completed'].includes(edge.sourceHandle ?? '')) return;
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return;
      if (!imageNodeKinds.has(sourceNode.data.nodeKind) && !imageNodeKinds.has(targetNode.data.nodeKind)) return;
      const sourceSpec = NODE_LIBRARY[sourceNode.data.nodeKind];
      const targetSpec = NODE_LIBRARY[targetNode.data.nodeKind];
      if (!sourceSpec || !targetSpec) return;
      const outIndex = Math.max(0, sourceSpec.outputs?.findIndex((o: any) => o.name === edge.sourceHandle) ?? 0);
      const inIndex  = Math.max(0, targetSpec.inputs?.findIndex((i: any) => i.name === edge.targetHandle) ?? 0);
      const srcName  = 'FP_' + safeId(sourceNode.id);
      const tgtName  = 'FP_' + safeId(targetNode.id);
      routingLines.push(`node.link(node.root() + "/${srcName}", ${outIndex}, node.root() + "/${tgtName}", ${inIndex});`);
    });
    if (routingLines.length > 0) {
      blocks.push({ id: 'router', text: `\n${commentPrefix} --- Apply Node Connections ---\n` + routingLines.join('\n') + '\n' });
    }
  }

  const footer = FILE_FOOTERS[mode] ?? '';
  if (footer) blocks.push({ id: null, text: footer });

  return blocks;
}

// ============================================================================
// PUBLIC: METADATA
// ============================================================================

export const MODE_LABELS: Record<CompileMode, string> = {
  js_toonboom:  'Harmony (JS)',
  py_maya:      'Maya (Py)',
  py_houdini:   'Houdini (Py)',
  cs_csharp:    'Unity (C#)',
  lua_fusion:   'Fusion (Lua)',
  py_standard:  'Python (Std)',
  gml_standard: 'GameMaker (GML)',
  py_nuke:      'Nuke (Py)',
};

export const MODE_EXTENSIONS: Record<CompileMode, string> = {
  js_toonboom:  'js',
  py_maya:      'py',
  py_houdini:   'py',
  cs_csharp:    'cs',
  lua_fusion:   'lua',
  py_standard:  'py',
  gml_standard: 'gml',
  py_nuke:      'py',
};

export const ALL_MODES: CompileMode[] = [
  'js_toonboom', 'py_standard', 'py_maya', 'py_nuke',
  'py_houdini', 'lua_fusion', 'cs_csharp', 'gml_standard'
];
