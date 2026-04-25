// src/renderer/src/libraries/translators/maya.ts
// ============================================================================
// FLOWPINS: AUTODESK MAYA TRANSLATION DICTIONARY
// Target: Maya Python scripting (maya.cmds)
//
// Inherits all Core translations from python.ts.
// Only Maya-specific overrides are defined here.
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
};
