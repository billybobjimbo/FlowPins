// src/renderer/src/libraries/compiler.ts
// ============================================================================
// FLOWPINS COMPILER ENGINE
// Extracted from App.tsx for testability and TD extensibility.
//
// To add a new DCC target:
//   1. Create a new translation dictionary (e.g. blender.ts)
//   2. Add it to TRANSLATION_REGISTRY below
//   3. Add its mode key to the CompileMode type
//   That's it. The compiler is fully language-agnostic.
// ============================================================================

import { type Node, type Edge } from 'reactflow';
import { NODE_LIBRARY } from './index';
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
// One place to register every language target. TDs add a new entry here.

const TRANSLATION_REGISTRY: Record<CompileMode, Record<string, any>> = {
  js_toonboom: HARMONY_TRANSLATIONS,
  py_maya:     MAYA_TRANSLATIONS,
  py_houdini:  HOUDINI_TRANSLATIONS,
  cs_csharp:   CSHARP_TRANSLATIONS,
  lua_fusion:  FUSION_TRANSLATIONS,
  py_standard: PYTHON_TRANSLATIONS,
  gml_standard:GML_TRANSLATIONS,
  py_nuke:     PYTHON_TRANSLATIONS, // Nuke stub — uses Python until nuke.ts is built
};

// --- COMMENT PREFIX PER LANGUAGE --------------------------------------------

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

// --- FILE HEADERS PER LANGUAGE ----------------------------------------------

const FILE_HEADERS: Partial<Record<CompileMode, string>> = {
  js_toonboom: `function FlowPinsTool() {\n    var d = new QDialog();\n    var layout = new QVBoxLayout();\n`,
  py_maya:     `import maya.cmds as cmds\n`,
  cs_csharp:   `using System;\n\npublic class FlowPinsTool {\n    public static void Execute() {\n`,
  lua_fusion:  `local comp = fusion:GetCurrentComp()\ncomp:StartUndo('FlowPins Build')\n`,
};

// --- FILE FOOTERS PER LANGUAGE ----------------------------------------------

const FILE_FOOTERS: Partial<Record<CompileMode, string>> = {
  js_toonboom: `\n    d.setLayout(layout);\n    // d.exec();\n}`,
  cs_csharp:   `    }\n}`,
  lua_fusion:  `\ncomp:EndUndo(true)\nprint('FlowPins Generation Complete!')`,
};

// ============================================================================
// INTERNAL COMPILER STATE
// Isolated per compile run — no shared mutable globals.
// ============================================================================

interface CompilerState {
  nodes: Node[];
  edges: Edge[];
  mode: CompileMode;
  translationDict: Record<string, any>;
  commentPrefix: string;
  // Per-branch visited set prevents duplicate exec emission on converging paths
  execVisited: Set<string>;
  // Global data-request visited set for cycle detection on data wires
  dataCallStack: Set<string>;
}

// ============================================================================
// SAFE NODE ID HELPER
// Strips non-alphanumeric chars so node IDs are safe as variable name fragments
// ============================================================================

function safeId(nodeId: string): string {
  const clean = nodeId.replace(/[^a-zA-Z0-9]/g, '');
  // Use last 6 chars — unique enough within a single graph, much more readable
  return 'n_' + clean.slice(-6);
}

// ============================================================================
// INDENT HELPER
// Wraps a multi-line block so it renders correctly inside loops/branches.
// ============================================================================

function indentBlock(code: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return code
    .split('\n')
    .map((line, i) => (i === 0 ? line : line.length > 0 ? pad + line : line))
    .join('\n');
}

// ============================================================================
// CORE: GENERATE CODE FOR A SINGLE NODE
// ============================================================================

function generateNodeCode(node: Node, state: CompilerState): string {
  const { nodes, edges, mode, translationDict, commentPrefix } = state;
  const nodeKind  = node.data.nodeKind;
  const nodeSpec  = NODE_LIBRARY[nodeKind];

  if (!nodeSpec) return `${commentPrefix} [FlowPins] Unknown node kind: ${nodeKind}\n`;

  // --- Resolve template ---
  let template = translationDict[nodeKind];

  // Special-case: 'start' always uses the language's comment prefix
  if (nodeKind === 'start') {
    template = `${commentPrefix} Start Execution\n{exec_out}`;
  }

  if (template === undefined) {
    return `${commentPrefix} [FlowPins] No ${mode} translation for: ${nodeSpec.title}\n`;
  }

  if (typeof template === 'function') {
    template = template(node.data);
  }

  // --- Substitute all {token} placeholders ---
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match: string, key: string) => {

    // 1. node_id — always the safe version of this node's ID
    if (key === 'node_id') return safeId(node.id);

    // 2. Exec output pins
    const outPin = nodeSpec.outputs?.find((o: any) => o.name === key && o.pin_type === 'exec');
    if (outPin) {
      // Branch/body pins (loop_body, true, false etc) need a fresh visited set
      // so body nodes aren't blocked by the outer exec chain visit
      const branchBodyPins = ['loop_body', 'true', 'false', 'then_1', 'then_2', 'then_3', 'try', 'catch'];
      const isBranchBody = branchBodyPins.includes(key);

      const outEdge = edges.find(e => e.source === node.id && e.sourceHandle === key);
      if (!outEdge) return '';
      const nextNode = nodes.find(n => n.id === outEdge.target);
      if (!nextNode) return '';

      if (isBranchBody) {
        // Use a fresh visited set for branch bodies so they aren't blocked
        const branchState = {
          ...state,
          execVisited: new Set<string>(),
        };
        const bodyCode = generateNodeCode(nextNode, branchState);
        return bodyCode || `/* empty body: ${key} -> ${nextNode.data.nodeKind} */`;
      }

      // Regular exec_out — respect visited to avoid infinite loops
      if (state.execVisited.has(nextNode.id)) return '';
      state.execVisited.add(nextNode.id);
      return generateNodeCode(nextNode, state);
    }

    // 3. Data pins — pull value from connected source with cycle detection
    const dataEdge = edges.find(e => e.target === node.id && e.targetHandle === key);
    if (dataEdge) {
      // Special loop variable shortcuts
      if (dataEdge.sourceHandle === 'index') return safeId(dataEdge.source) + '_i';
      if (dataEdge.sourceHandle === 'item')  return safeId(dataEdge.source) + '_item';

      const sourceNode = nodes.find(n => n.id === dataEdge.source);

      // Pipeline nodes set named variables. Return the variable name directly
      // rather than inlining the entire multi-line block into a data wire.
      const namedOutputs: Record<string, Record<string, string>> = {
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
        'csv_read_shot_list':         { shot_list: 'shot_list', shot_count: 'shot_count' },
        'csv_multi_shot_validate':    { total_shots: 'total_shots', passed_shots: 'passed_shots', failed_shots: 'failed_shots', report_path: 'report_path', all_passed: 'all_passed' },
        'cfg_load_or_show':           { folder_path: 'folder_path', extension: 'extension', start_frame: 'start_frame', end_frame: 'end_frame', naming_pattern: 'naming_pattern', colourspace: 'colourspace', frame_padding: 'frame_padding', prefix: 'prefix', cancelled: 'cancelled' },
        'cfg_show_dialog':            { folder_path: 'folder_path', extension: 'extension', start_frame: 'start_frame', end_frame: 'end_frame', naming_pattern: 'naming_pattern', colourspace: 'colourspace', frame_padding: 'frame_padding', save_config: 'save_config', cancelled: 'cancelled' },
        'tb_get_selection_count':     { count: 'count' },
        'tb_get_selected_nodes':      { node_list: 'node_list', count: 'count' },
        'tb_get_parent_group':        { parent_path: 'parent_path', parent_name: 'parent_name' },
        'tb_get_active_view_group':   { group_path: 'group_path', group_name: 'group_name' },
        'tb_string_append':           { result: 'result' },
        'tb_sort_nodes_by_x':         { sorted_list: 'sorted_list', first_node: 'first_node' },
        'rp_save_csv':                { pass_list: 'pass_list', fail_list: 'fail_list' },
      };
      if (sourceNode && namedOutputs[sourceNode.data.nodeKind]?.[dataEdge.sourceHandle]) {
        return namedOutputs[sourceNode.data.nodeKind][dataEdge.sourceHandle];
      }
      if (sourceNode) {
        // Cycle detection — if we're already evaluating this node, bail out
        const cycleKey = `${sourceNode.id}::${key}`;
        if (state.dataCallStack.has(cycleKey)) {
          return `${commentPrefix}_CYCLE_DETECTED_`;
        }
        state.dataCallStack.add(cycleKey);

        // Data request intercepts for function nodes
        if (sourceNode.data.nodeKind === 'func_def')  { state.dataCallStack.delete(cycleKey); return 'arg0'; }
        if (sourceNode.data.nodeKind === 'func_call') { state.dataCallStack.delete(cycleKey); return `res_${safeId(sourceNode.id)}`; }

        const result = generateNodeCode(sourceNode, state);
        state.dataCallStack.delete(cycleKey);
        if (result) return result;
      }
    }

    // 4. Node's own props (user-set values take priority over defaults)
    if (node.data.props?.[key] !== undefined && node.data.props[key] !== '') {
      return String(node.data.props[key]);
    }

    // 5. Node spec default props
    if (nodeSpec.default_props?.[key] !== undefined) {
      return String(nodeSpec.default_props[key]);
    }

    // 6. Known "intentionally empty" exec tokens — silent
    const silentTokens = ['exec_out', 'exec_in', 'true', 'false', 'loop_body',
                          'completed', 'then_1', 'then_2', 'then_3', 'try', 'catch'];
    if (silentTokens.includes(key)) return '';

    // 7. Genuinely missing — flag it clearly for the TD
    return `MISSING_${key.toUpperCase()}`;
  });
}

// ============================================================================
// HELPER: WALK EXECUTION ORDER
// Returns nodes in the order they execute, following exec wires.
// ============================================================================

// Collect all node IDs that are branch/loop body targets
// These should NOT appear as top-level blocks — they are emitted inline
function getBranchBodyIds(nodes: Node[], edges: Edge[]): Set<string> {
  const bodyIds = new Set<string>();
  const branchPins = ['loop_body', 'true', 'false', 'then_1', 'then_2', 'then_3', 'try', 'catch'];
  edges.forEach(edge => {
    if (branchPins.includes(edge.sourceHandle ?? '')) {
      bodyIds.add(edge.target);
    }
  });
  return bodyIds;
}

function walkExecOrder(
  startNode: Node,
  nodes: Node[],
  edges: Edge[]
): Node[] {
  const ordered: Node[] = [];
  const visited  = new Set<string>();
  const bodyIds  = getBranchBodyIds(nodes, edges);

  function walk(node: Node) {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    // Skip nodes that are branch/loop bodies — they are emitted inline
    // by their parent node, not as separate top-level blocks
    if (bodyIds.has(node.id)) return;

    ordered.push(node);

    // Follow only exec_out — not loop_body/true/false (those are inline)
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

    // Also follow exec_out and completed (loop end) if not a branch pin
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
  }

  walk(startNode);
  return ordered;
}

// ============================================================================
// HELPER: GENERATE CODE FOR A NODE WITHOUT FOLLOWING EXEC CHILDREN
// Used when we want one block per node, not one giant recursive script.
// Data pins still resolve normally. Exec output pins return empty string.
// ============================================================================

function generateNodeCodeIsolated(node: Node, state: CompilerState): string {
  const { nodes, edges, mode, translationDict, commentPrefix } = state;
  const nodeKind  = node.data.nodeKind;
  const nodeSpec  = NODE_LIBRARY[nodeKind];

  if (!nodeSpec) return `${commentPrefix} [FlowPins] Unknown node kind: ${nodeKind}\n`;

  let template = translationDict[nodeKind];
  if (nodeKind === 'start') template = `${commentPrefix} Start Execution\n`;
  if (template === undefined) return `${commentPrefix} [FlowPins] No ${mode} translation for: ${nodeSpec.title}\n`;
  if (typeof template === 'function') template = template(node.data);

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match: string, key: string) => {
    if (key === 'node_id') return safeId(node.id);

    // Exec pins — return empty (we handle these via walkExecOrder)
    const outPin = nodeSpec.outputs?.find((o: any) => o.name === key && o.pin_type === 'exec');
    if (outPin) {
      // Branch/body pins — recurse with fresh visited set so body is emitted inline
      const branchBodyPins = ['loop_body', 'true', 'false', 'then_1', 'then_2', 'then_3', 'try', 'catch'];
      if (branchBodyPins.includes(key)) {
        const outEdge  = edges.find(e => e.source === node.id && e.sourceHandle === key);
        if (!outEdge) return '';
        const nextNode = nodes.find(n => n.id === outEdge.target);
        if (!nextNode) return '';
        const branchState = { ...state, execVisited: new Set<string>() };
        return generateNodeCode(nextNode, branchState);
      }
      // exec_out and other exec pins — silent in isolated mode
      return '';
    }

    // Data pins — resolve normally
    const dataEdge = edges.find(e => e.target === node.id && e.targetHandle === key);
    if (dataEdge) {
      if (dataEdge.sourceHandle === 'index') return safeId(dataEdge.source) + '_i';
      if (dataEdge.sourceHandle === 'item')  return safeId(dataEdge.source) + '_item';

      const sourceNode = nodes.find(n => n.id === dataEdge.source);

      const namedOutputs: Record<string, Record<string, string>> = {
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
        'csv_read_shot_list':         { shot_list: 'shot_list', shot_count: 'shot_count' },
        'csv_multi_shot_validate':    { total_shots: 'total_shots', passed_shots: 'passed_shots', failed_shots: 'failed_shots', report_path: 'report_path', all_passed: 'all_passed' },
        'cfg_load_or_show':           { folder_path: 'folder_path', extension: 'extension', start_frame: 'start_frame', end_frame: 'end_frame', naming_pattern: 'naming_pattern', colourspace: 'colourspace', frame_padding: 'frame_padding', prefix: 'prefix', cancelled: 'cancelled' },
        'cfg_show_dialog':            { folder_path: 'folder_path', extension: 'extension', start_frame: 'start_frame', end_frame: 'end_frame', naming_pattern: 'naming_pattern', colourspace: 'colourspace', frame_padding: 'frame_padding', save_config: 'save_config', cancelled: 'cancelled' },
        'tb_get_selection_count':     { count: 'count' },
        'tb_get_selected_nodes':      { node_list: 'node_list', count: 'count' },
        'tb_get_parent_group':        { parent_path: 'parent_path', parent_name: 'parent_name' },
        'tb_get_active_view_group':   { group_path: 'group_path', group_name: 'group_name' },
        'tb_string_append':           { result: 'result' },
        'tb_sort_nodes_by_x':         { sorted_list: 'sorted_list', first_node: 'first_node' },
        'rp_save_csv':                { pass_list: 'pass_list', fail_list: 'fail_list' },
      };
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
// PUBLIC: GENERATE ALL CODE BLOCKS
// Each exec node gets its own block — enables per-node highlighting in the UI.
// ============================================================================

export function generateCodeBlocks(
  nodes: Node[],
  edges: Edge[],
  mode: CompileMode
): CodeBlock[] {
  const blocks: CodeBlock[] = [];

  const translationDict = TRANSLATION_REGISTRY[mode];
  const commentPrefix   = COMMENT_PREFIX[mode];

  // --- File header ---
  const header = FILE_HEADERS[mode] ?? '';
  if (header) blocks.push({ id: null, text: header });

  // --- Shared compiler state ---
  const state: CompilerState = {
    nodes, edges, mode, translationDict, commentPrefix,
    execVisited:   new Set<string>(),
    dataCallStack: new Set<string>(),
  };

  // --- PASS 1: Hoist function definitions ---
  const funcNodes = nodes.filter(n => n.data.nodeKind === 'func_def');
  funcNodes.forEach(funcNode => {
    if (state.execVisited.has(funcNode.id)) return;
    state.execVisited.add(funcNode.id);
    const funcScript = generateNodeCodeIsolated(funcNode, state);
    if (funcScript.trim()) blocks.push({ id: funcNode.id, text: funcScript + '\n' });
  });

  // --- PASS 2: Walk execution order, emit one block per node ---
  const startNode = nodes.find(n => n.data.nodeKind === 'start');
  if (startNode) {
    const execOrder = walkExecOrder(startNode, nodes, edges);
    execOrder.forEach(node => {
      state.dataCallStack = new Set<string>(); // reset data callstack per node
      const code = generateNodeCodeIsolated(node, state);
      if (code.trim()) {
        blocks.push({ id: node.id, text: code + '\n' });
      }
    });
  }

  // --- PASS 3: Toon Boom node-link routing (JS only) ---
  // Only emit node.link() calls for image-type connections between Harmony nodes.
  // Pipeline/utility nodes use data pins that resolve inline — no link needed.
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
    let routingLines: string[] = [];
    edges.forEach(edge => {
      // Skip exec wires
      if (['exec_out','exec_in','exec','loop_body','true','false',
           'then_1','then_2','then_3','try','catch','completed'].includes(edge.sourceHandle ?? '')) return;
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return;
      // Only emit link for actual Harmony image node connections
      if (!imageNodeKinds.has(sourceNode.data.nodeKind) &&
          !imageNodeKinds.has(targetNode.data.nodeKind)) return;
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

  // --- File footer ---
  const footer = FILE_FOOTERS[mode] ?? '';
  if (footer) blocks.push({ id: null, text: footer });

  return blocks;
}

// ============================================================================
// PUBLIC: GET DISPLAY NAME FOR A MODE
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
