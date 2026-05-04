// src/renderer/src/libraries/translators/houdini.ts
// ============================================================================
// SideFX Houdini (Python) translation dictionary.
// Inherits all core logic from python.ts — only Houdini-specific overrides here.
// ============================================================================

import { PYTHON_TRANSLATIONS } from './python';

export const HOUDINI_TRANSLATIONS: Record<string, any> = {
  // Inherit all Core Math, Logic, Variables, Collections, and Loops
  ...PYTHON_TRANSLATIONS,

  // --- HOUDINI OVERRIDES ---
  "spawn_instance":  "new_node = hou.node({layer_name}).createNode({obj_name})\nnew_node.setPosition([{x}, {y}])\n{exec_out}",
  "auto_depth":      "hou.pwd().parm('tz').set(-hou.pwd().parm('ty').eval())\n{exec_out}",
  "keyboard_check":  "False # Handled via CHOPs in Houdini",
  "is_free":         "True # Handled via DOPs collision in Houdini",
  "change_coord":    "hou.pwd().parm('t{axis}').set(hou.pwd().parm('t{axis}').eval() + {amount})\n{exec_out}",

  // --- APP SPECIFIC: SIDEFX HOUDINI ---
  "hou_create_node":      "new_node = hou.node('{parent_path}').createNode('{node_type}', '{node_name}')\n{exec_out}",
  "hou_set_param":        "hou.node('{node_path}').parm('{param_name}').set({value})\n{exec_out}",
  "hou_connect_nodes":    "target = hou.node('{target_path}')\nsource = hou.node('{source_path}')\nif target and source:\n    target.setInput({input_index}, source)\n{exec_out}",
  "hou_layout_children":  "hou.node('{parent_path}').layoutChildren()\n{exec_out}",
  "hou_get_node":         "hou.node('{node_path}')",
  "hou_display_message":  "hou.ui.displayMessage('{message}')\n{exec_out}",
  // ==========================================================================
  // UNIVERSAL NODES — HOUDINI TRANSLATIONS (Houdini 20+)
  // ==========================================================================

  // ── Phase 1: Pure string ops ──────────────────────────
  "tb_string_append": `result = {base} + "{suffix}"
{exec_out}`,

  "tb_get_group_short_name": `# Extract short name from full path
_parts_{node_id} = str({group_path}).split("/")
short_name = _parts_{node_id}[-1]
{exec_out}`,

  // ── Phase 2: Selection ────────────────────────────────
  "tb_get_selection_count": `# Get number of selected nodes
import hou
_sel_{node_id} = hou.selectedNodes()
count = len(_sel_{node_id})
print("FlowPins: " + str(count) + " nodes selected.")
{exec_out}`,

  "tb_get_selected_nodes": `# Get list of all selected nodes
import hou
_sel_{node_id} = hou.selectedNodes()
node_list = [n.path() for n in _sel_{node_id}]
count = len(node_list)
print("FlowPins: Got " + str(count) + " selected nodes.")
{exec_out}`,

  "tb_get_selected_node": `# Get the currently selected node
import hou
_sel_{node_id} = hou.selectedNodes()
node_path = ""
node_name = ""
node_type = ""
if _sel_{node_id}:
    _n_{node_id} = _sel_{node_id}[0]
    node_path = _n_{node_id}.path()
    node_name = _n_{node_id}.name()
    node_type = _n_{node_id}.type().name()
    print("Selected: " + node_name + " [" + node_type + "]")
else:
    print("No node selected.")
{exec_out}`,

  // ── Phase 2: Undo ─────────────────────────────────────
  "tb_begin_undo": `# Begin an undo block
import hou
hou.undos.performOperation("{block_name}")
print("FlowPins: Undo block started — {block_name}")
{exec_out}`,

  "tb_end_undo": `# End an undo block
import hou
# Houdini auto-closes undo blocks per operation
print("FlowPins: Undo block ended — {block_name}")
{exec_out}`,

  // ── Phase 3: Hierarchy ────────────────────────────────
  "tb_get_parent_group": `# Get the parent of a node
import hou
_np_{node_id} = {node_path}
_node_{node_id} = hou.node(_np_{node_id})
_parent_{node_id} = _node_{node_id}.parent() if _node_{node_id} else None
parent_path = _parent_{node_id}.path() if _parent_{node_id} else ""
parent_name = _parent_{node_id}.name() if _parent_{node_id} else ""
print("FlowPins: Parent of " + str(_np_{node_id}) + " is " + parent_path)
{exec_out}`,

  "tb_get_top_level_groups": `# Get all top-level nodes in /obj
import hou
_obj_{node_id} = hou.node("/obj")
_children_{node_id} = _obj_{node_id}.children() if _obj_{node_id} else []
group_list  = [n.path() for n in _children_{node_id} 
               if n.childTypeCategory() == hou.objNodeTypeCategory()]
group_count = len(group_list)
print("FlowPins: Found " + str(group_count) + " top-level groups.")
{exec_out}`,

  "tb_get_nodes_by_type": `# Recursively find all nodes of a given type
import hou
_target_type_{node_id} = "{node_type}"
_root_{node_id}        = {root_path}
_root_node_{node_id}   = hou.node(_root_{node_id})
node_list  = []
node_names = []

def _scan_{node_id}(parent):
    if not parent: return
    for child in parent.children():
        if child.type().name() == _target_type_{node_id}:
            node_list.append(child.path())
            node_names.append(child.name())
        _scan_{node_id}(child)

_scan_{node_id}(_root_node_{node_id})
node_count = len(node_list)
print("FlowPins: Found " + str(node_count) + " nodes of type " + _target_type_{node_id})
{exec_out}`,

  "tb_get_active_view_group": `# Get the current network context shown in the active pane
import hou
_pane_{node_id} = None
for _p_{node_id} in hou.ui.paneTabs():
    if isinstance(_p_{node_id}, hou.NetworkEditor) and _p_{node_id}.isCurrentTab():
        _pane_{node_id} = _p_{node_id}
        break
if _pane_{node_id}:
    _cwd_{node_id} = _pane_{node_id}.pwd()
    group_path = _cwd_{node_id}.path()
    group_name = _cwd_{node_id}.name()
else:
    group_path = "/obj"
    group_name = "obj"
print("FlowPins: Active view group is " + group_path)
{exec_out}`,

  "tb_filter_list_by_type": `# Filter a node list to only include nodes of a specific type
import hou
_input_{node_id} = {node_list}
_ftype_{node_id} = "{node_type}"
filtered_list  = [p for p in _input_{node_id} 
                  if hou.node(p) and hou.node(p).type().name() == _ftype_{node_id}]
filtered_count = len(filtered_list)
{exec_out}`,

  // ── Phase 4: Coordinates ──────────────────────────────
  "tb_get_node_coord": `# Get the Network Editor position of a node
import hou
_np_{node_id} = {node_path}
_node_{node_id} = hou.node(_np_{node_id})
if _node_{node_id}:
    _pos_{node_id} = _node_{node_id}.position()
    coord_x = _pos_{node_id}[0]
    coord_y = _pos_{node_id}[1]
else:
    coord_x = 0
    coord_y = 0
coord_z = 0
{exec_out}`,

  "tb_set_node_coord": `# Set the Network Editor position of a node
import hou
_np_{node_id} = {node_path}
_node_{node_id} = hou.node(_np_{node_id})
if _node_{node_id}:
    _node_{node_id}.setPosition(hou.Vector2({x}, {y}))
{exec_out}`,

  "tb_sort_nodes_by_x": `# Sort a list of nodes by their X position in the Network Editor
import hou
_list_{node_id} = list({node_list})
_dir_{node_id}  = "{direction}"

def _get_x_{node_id}(path):
    _n_{node_id} = hou.node(path)
    return _n_{node_id}.position()[0] if _n_{node_id} else 0

sorted_list = sorted(_list_{node_id},
    key=_get_x_{node_id},
    reverse=(_dir_{node_id} == "descending"))
first_node = sorted_list[0] if sorted_list else ""
print("FlowPins: Sorted " + str(len(sorted_list)) + " nodes by X")
{exec_out}`,

  "tb_arrange_nodes_near_target": `# Move nodes to positions relative to a target node
import hou
_nodes_{node_id}  = {node_list}
_target_{node_id} = {target_path}
_offX_{node_id}   = {offset_x}
_offY_{node_id}   = {offset_y}

if not _nodes_{node_id}:
    print("FlowPins: No nodes to arrange.")
else:
    _tnode_{node_id} = hou.node(_target_{node_id})
    _tpos_{node_id}  = _tnode_{node_id}.position() if _tnode_{node_id} else hou.Vector2(0,0)
    _fnode_{node_id} = hou.node(_nodes_{node_id}[0])
    _fpos_{node_id}  = _fnode_{node_id}.position() if _fnode_{node_id} else hou.Vector2(0,0)
    _xMin_{node_id}  = _fpos_{node_id}[0]
    _yMin_{node_id}  = _fpos_{node_id}[1]
    for _path_{node_id} in _nodes_{node_id}:
        _n_{node_id} = hou.node(_path_{node_id})
        if not _n_{node_id}: continue
        _npos_{node_id} = _n_{node_id}.position()
        _relX_{node_id} = _npos_{node_id}[0] - _xMin_{node_id}
        _relY_{node_id} = _npos_{node_id}[1] - _yMin_{node_id}
        _newX_{node_id} = _tpos_{node_id}[0] + _relX_{node_id} + _offX_{node_id}
        _newY_{node_id} = _tpos_{node_id}[1] + _relY_{node_id} + _offY_{node_id}
        _n_{node_id}.setPosition(hou.Vector2(_newX_{node_id}, _newY_{node_id}))
        print("FlowPins: Moved " + str(_path_{node_id}))
{exec_out}`,


};
