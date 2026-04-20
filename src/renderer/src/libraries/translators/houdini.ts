// src/renderer/src/libraries/translators/houdini.ts
import { PYTHON_TRANSLATIONS } from './python';

export const HOUDINI_TRANSLATIONS: Record<string, any> = {
  // Inherit all Math, Logic, Variables, and Loops from Standard Python!
  ...PYTHON_TRANSLATIONS,

  
  "console_readline": "input()",
  "parse_int": "int({text})",
  "format_string_2": "{template}.format({arg0}, {arg1})",
  "spawn_instance": "new_node = hou.node({layer_name}).createNode({obj_name})\nnew_node.setPosition([{x}, {y}])\n{exec_out}",
  "auto_depth": "hou.pwd().parm('tz').set(-hou.pwd().parm('ty').eval())\n{exec_out}",
  "keyboard_check": "False # Handled via CHOPs in Houdini",
  "is_free": "True # Handled via DOPs collision in Houdini",
  "change_coord": "hou.pwd().parm('t{axis}').set(hou.pwd().parm('t{axis}').eval() + {amount})\n{exec_out}",
  // ==========================================
  // --- APP SPECIFIC: SIDEFX HOUDINI ---
  // ==========================================

  "hou_create_node": "new_node = hou.node('{parent_path}').createNode('{node_type}', '{node_name}')\n{exec_out}",

  "hou_set_param": "hou.node('{node_path}').parm('{param_name}').set({value})\n{exec_out}",

  "hou_connect_nodes": "target = hou.node('{target_path}')\nsource = hou.node('{source_path}')\nif target and source:\n    target.setInput({input_index}, source)\n{exec_out}",

  "hou_layout_children": "hou.node('{parent_path}').layoutChildren()\n{exec_out}",

  "hou_get_node": "hou.node('{node_path}')",

  "hou_display_message": "hou.ui.displayMessage('{message}')\n{exec_out}"
};