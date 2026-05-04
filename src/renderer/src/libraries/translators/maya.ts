// src/renderer/src/libraries/translators/maya.ts
// ============================================================================
// Autodesk Maya (Python) translation dictionary.
// Inherits all core logic from python.ts — only Maya-specific overrides here.
// ============================================================================

import { PYTHON_TRANSLATIONS } from './python';

export const MAYA_TRANSLATIONS: Record<string, any> = {
  // Inherit all Core Math, Logic, Variables, Collections, and Loops
  ...PYTHON_TRANSLATIONS,

  // --- MAYA OVERRIDES: App-specific behaviour ---
  "spawn_instance":  "new_obj = cmds.duplicate({obj_name})[0]\ncmds.move({x}, {y}, 0, new_obj, absolute=True)\ncmds.editDisplayLayerMembers({layer_name}, new_obj)\n{exec_out}",
  "auto_depth":      "cmds.setAttr(cmds.ls(sl=True)[0] + '.tz', -cmds.getAttr(cmds.ls(sl=True)[0] + '.ty'))\n{exec_out}",
  "keyboard_check":  "False # Requires Maya API for realtime input",
  "is_free":         "True # Requires rigid body query in cmds",
  "change_coord":    "cmds.setAttr(cmds.ls(sl=True)[0] + '.t{axis}', cmds.getAttr(cmds.ls(sl=True)[0] + '.t{axis}') + {amount})\n{exec_out}",

  // --- APP SPECIFIC: AUTODESK MAYA ---
  "maya_get_selection": "cmds.ls(selection=True) or []",

  "maya_fbx_exporter": `import maya.cmds as cmds
import maya.mel as mel
import os

if not cmds.pluginInfo("fbxmaya", query=True, loaded=True):
    cmds.loadPlugin("fbxmaya")

cmds.select(clear=True)
if cmds.objExists("{camera_name}") and cmds.objExists("{mesh_name}"):
    cmds.select(["{camera_name}", "{mesh_name}"])
    safe_path = r"{export_path}".replace("\\\\", "/")
    export_dir = os.path.dirname(safe_path)
    if export_dir and not os.path.exists(export_dir):
        os.makedirs(export_dir)
    mel.eval('FBXExportBakeComplexAnimation -v true')
    mel.eval('FBXExport -f "{}" -s'.format(safe_path))
    print("FlowPins: FBX exported to " + safe_path)
else:
    cmds.warning("FlowPins: Camera or Mesh not found. Check your names.")
{exec_out}`,

  "uni_limb_builder": `side = "{side}"
base = "{base_name}"
parts = ["_Upper", "_Lower", "_End"]
prev_joint = None
for p in parts:
    name = f"{side}_{base}{p}"
    new_joint = cmds.joint(n=name)
    if prev_joint:
        cmds.parent(new_joint, prev_joint)
    prev_joint = new_joint
{exec_out}`,

  "uni_joint": `current_name = "{name}" or "Joint"
x_pos = float("{offset_x}" or 0) * 0.1
y_pos = float("{offset_y}" or 0) * -0.1
cmds.select(clear=True)
new_joint = cmds.joint(name=current_name, p=(x_pos, y_pos, 0))
if 'last_created_node' in locals() and last_created_node:
    try:
        cmds.parent(new_joint, last_created_node)
    except:
        pass
last_created_node = current_name
{exec_out}`,

  "uni_mirror_action": "cmds.mirrorJoint(cmds.ls(sl=True), mirrorXY=True, mirrorBehavior=True, searchReplace=({prefix}, 'R_'))\n{exec_out}",

  "uni_search_node": `search_target = cmds.promptDialog(title='FlowPins', message='Enter Node Name:', button=['OK', 'Cancel'], defaultButton='OK')
if search_target == 'OK':
    target_name = cmds.promptDialog(query=True, text=True)
    cmds.select(target_name, replace=True)
{exec_out}`,
  // ==========================================================================
  // UNIVERSAL NODES — MAYA TRANSLATIONS
  // ==========================================================================

  // ── Phase 1: Pure string ops ──────────────────────────
  "tb_string_append": `result = {base} + "{suffix}"
{exec_out}`,

  "tb_get_group_short_name": `# Extract short name from full path
# e.g. "Top/Riley/Riley_Body" -> "Riley_Body"
_parts_{node_id} = str({group_path}).split("/")
short_name = _parts_{node_id}[-1]
{exec_out}`,

  // ── Phase 2: Selection ────────────────────────────────
  "tb_get_selection_count": `# Get number of currently selected nodes
import maya.cmds as cmds
count = len(cmds.ls(selection=True))
print("FlowPins: " + str(count) + " nodes selected.")
{exec_out}`,

  "tb_get_selected_nodes": `# Get list of all currently selected nodes
import maya.cmds as cmds
node_list = cmds.ls(selection=True, long=True) or []
count = len(node_list)
print("FlowPins: Got " + str(count) + " selected nodes.")
{exec_out}`,

  "tb_get_selected_node": `# Get the currently selected node
import maya.cmds as cmds
_sel_{node_id} = cmds.ls(selection=True, long=True) or []
node_path = ""
node_name = ""
node_type = ""
if _sel_{node_id}:
    node_path = _sel_{node_id}[0]
    node_name = node_path.split("|")[-1].split(":")[-1]
    node_type = cmds.nodeType(node_path)
    print("Selected: " + node_name + " [" + node_type + "]")
else:
    print("No node selected.")
{exec_out}`,

  // ── Phase 2: Undo ─────────────────────────────────────
  "tb_begin_undo": `# Begin an undo chunk
import maya.cmds as cmds
cmds.undoInfo(openChunk=True, chunkName="{block_name}")
print("FlowPins: Undo chunk opened — {block_name}")
{exec_out}`,

  "tb_end_undo": `# End an undo chunk
import maya.cmds as cmds
cmds.undoInfo(closeChunk=True)
print("FlowPins: Undo chunk closed — {block_name}")
{exec_out}`,

  // ── Phase 3: Hierarchy ────────────────────────────────
  "tb_get_parent_group": `# Get the parent of a node
import maya.cmds as cmds
_np_{node_id} = {node_path}
_parents_{node_id} = cmds.listRelatives(_np_{node_id}, parent=True, fullPath=True)
parent_path = _parents_{node_id}[0] if _parents_{node_id} else ""
_parts_{node_id} = parent_path.split("|")
parent_name = _parts_{node_id}[-1] if parent_path else ""
print("FlowPins: Parent of " + str(_np_{node_id}) + " is " + str(parent_path))
{exec_out}`,

  "tb_get_top_level_groups": `# Get all top-level transform groups in the scene
import maya.cmds as cmds
_all_{node_id} = cmds.ls(assemblies=True, long=True) or []
group_list = [n for n in _all_{node_id} if cmds.nodeType(n) == "transform"]
group_count = len(group_list)
print("FlowPins: Found " + str(group_count) + " top-level groups.")
{exec_out}`,

  "tb_get_nodes_by_type": `# Recursively find all nodes of a given type
import maya.cmds as cmds
_target_type_{node_id} = "{node_type}"
_root_{node_id}        = {root_path}
node_list  = cmds.ls(_root_{node_id}, type=_target_type_{node_id}, 
                     long=True, dag=True) or []
node_names = [n.split("|")[-1].split(":")[-1] for n in node_list]
node_count = len(node_list)
print("FlowPins: Found " + str(node_count) + " nodes of type " + _target_type_{node_id})
{exec_out}`,

  "tb_get_active_view_group": `# Get the current group shown in the active panel
import maya.cmds as cmds
# In Maya the active panel context gives us the current namespace/group
_panel_{node_id} = cmds.getPanel(withFocus=True) or ""
_sel_{node_id}   = cmds.ls(selection=True, long=True)
if _sel_{node_id}:
    _parts_{node_id} = _sel_{node_id}[0].split("|")
    group_path = "|".join(_parts_{node_id}[:-1]) if len(_parts_{node_id}) > 1 else "|"
else:
    group_path = "|"
_gparts_{node_id} = group_path.split("|")
group_name = _gparts_{node_id}[-1] if group_path != "|" else "root"
print("FlowPins: Active group is " + group_path)
{exec_out}`,

  "tb_filter_list_by_type": `# Filter a node list to only include nodes of a specific type
import maya.cmds as cmds
_input_{node_id} = {node_list}
_ftype_{node_id} = "{node_type}"
filtered_list  = [n for n in _input_{node_id} if cmds.nodeType(n) == _ftype_{node_id}]
filtered_count = len(filtered_list)
{exec_out}`,

  // ── Phase 4: Coordinates ──────────────────────────────
  "tb_get_node_coord": `# Get the Node Editor position of a node
import maya.cmds as cmds
_np_{node_id} = {node_path}
# Maya Node Editor stores position in nodeGraphEditorInfo
_info_{node_id} = cmds.nodeGraphEditorInfo(_np_{node_id}, 
                     query=True, nodePosition=True) or [0, 0]
coord_x = _info_{node_id}[0] if len(_info_{node_id}) > 0 else 0
coord_y = _info_{node_id}[1] if len(_info_{node_id}) > 1 else 0
coord_z = 0
{exec_out}`,

  "tb_set_node_coord": `# Set the Node Editor position of a node
import maya.cmds as cmds
_np_{node_id} = {node_path}
_nx_{node_id} = {x}
_ny_{node_id} = {y}
cmds.nodeGraphEditorInfo(_np_{node_id}, 
    edit=True, nodePosition=[_nx_{node_id}, _ny_{node_id}])
{exec_out}`,

  "tb_sort_nodes_by_x": `# Sort a list of nodes by their X position in the Node Editor
import maya.cmds as cmds
_list_{node_id} = list({node_list})
_dir_{node_id}  = "{direction}"

def _get_x_{node_id}(n):
    _info_{node_id} = cmds.nodeGraphEditorInfo(n, query=True, nodePosition=True) or [0,0]
    return _info_{node_id}[0] if _info_{node_id} else 0

sorted_list = sorted(_list_{node_id}, 
    key=_get_x_{node_id}, 
    reverse=(_dir_{node_id} == "descending"))
first_node = sorted_list[0] if sorted_list else ""
print("FlowPins: Sorted " + str(len(sorted_list)) + " nodes by X")
{exec_out}`,

  "tb_arrange_nodes_near_target": `# Move nodes to positions relative to a target node
import maya.cmds as cmds
_nodes_{node_id}  = {node_list}
_target_{node_id} = {target_path}
_offX_{node_id}   = {offset_x}
_offY_{node_id}   = {offset_y}

if not _nodes_{node_id}:
    print("FlowPins: No nodes to arrange.")
else:
    _tinfo_{node_id} = cmds.nodeGraphEditorInfo(_target_{node_id}, 
                           query=True, nodePosition=True) or [0,0]
    _tgtX_{node_id} = _tinfo_{node_id}[0]
    _tgtY_{node_id} = _tinfo_{node_id}[1]
    _finfo_{node_id} = cmds.nodeGraphEditorInfo(_nodes_{node_id}[0],
                           query=True, nodePosition=True) or [0,0]
    _xMin_{node_id} = _finfo_{node_id}[0]
    _yMin_{node_id} = _finfo_{node_id}[1]
    for _n_{node_id} in _nodes_{node_id}:
        _ninfo_{node_id} = cmds.nodeGraphEditorInfo(_n_{node_id},
                               query=True, nodePosition=True) or [0,0]
        _relX_{node_id} = _ninfo_{node_id}[0] - _xMin_{node_id}
        _relY_{node_id} = _ninfo_{node_id}[1] - _yMin_{node_id}
        _newX_{node_id} = _tgtX_{node_id} + _relX_{node_id} + _offX_{node_id}
        _newY_{node_id} = _tgtY_{node_id} + _relY_{node_id} + _offY_{node_id}
        cmds.nodeGraphEditorInfo(_n_{node_id}, edit=True,
            nodePosition=[_newX_{node_id}, _newY_{node_id}])
        print("FlowPins: Moved " + str(_n_{node_id}))
{exec_out}`,


};
