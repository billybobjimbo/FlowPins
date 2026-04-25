// src/renderer/src/libraries/translators/harmony.ts
// ============================================================================
// FLOWPINS: TOON BOOM HARMONY TRANSLATION DICTIONARY
// Target: Harmony 21+ JavaScript scripting API
//
// Notes:
//   - File I/O uses Qt classes (QFile, QDir, QTextStream)
//   - Colourspace validation requires Python target (stubs provided here)
//   - UI widgets use Harmony's Dialog/SpinBox classes, not raw Qt
// ============================================================================
export const HARMONY_TRANSLATIONS: Record<string, any> = {

  // --- CORE: EXECUTION ---
  "start":         "// Start Execution\n{exec_out}",
  "end_macro":     "return;",
  "merge_exec":    "{exec_out}",
  "sequence":      "{then_1}\n{then_2}\n{then_3}",
  "console_print": "MessageLog.trace({message});\n{exec_out}",
  "try_catch":     "try {\n    {try}\n} catch ({node_id}_ex) {\n    var error_msg = {node_id}_ex.message;\n    {catch}\n}",

  // --- CORE: MATH ---
  "add_int":      "({a} + {b})",
  "subtract_int": "({a} - {b})",
  "multiply_int": "({a} * {b})",
  "divide_int":   "({a} / {b})",
  "compare_int":  "({a} {op} {b})",
  "random_int":   "(Math.floor(Math.random() * ({max} - {min} + 1)) + {min})",
  "math_modulo":  "({a} % {b})",
  "math_power":   "Math.pow({base}, {exponent})",
  "math_abs":     "Math.abs({value})",

  // --- CORE: LOGIC ---
  "if_branch":            "if ({condition}) {\n    {true}\n} else {\n    {false}\n}",
  "for_loop":             "for (var {node_id}_i = {start}; {node_id}_i < {end}; {node_id}_i++) {\n    {loop_body}\n}\n{exec_out}",
  "while_loop":           "while ({condition}) {\n    {loop_body}\n}\n{exec_out}",
  "foreach_list":         "for (var {node_id}_i = 0; {node_id}_i < {list}.length; {node_id}_i++) {\n    var {node_id}_item = {list}[{node_id}_i];\n    {loop_body}\n}\n{exec_out}",
  "compare_strings":      "({a} === {b})",
  "check_list_not_empty": "({list}.length > 0)",
  "logic_and":            "({a} && {b})",
  "logic_or":             "({a} || {b})",

  // --- CORE: FUNCTIONS ---
  "func_def":    "function {func_name}(arg0) {\n    {exec_out}\n}",
  "func_return": "return {value};",
  "func_call":   "var res_{node_id} = {func_name}({arg0_in});\n{exec_out}",

  // --- CORE: VARIABLES ---
  "set_var": "var {var_name} = {value};\n{exec_out}",
  "get_var": "{var_name}",

  // --- CORE: DATA / PRIMITIVES ---
  "const_int":        "{value}",
  "const_string":     "\"{value}\"",
  "const_bool":       "{value}",
  "string_join_path": "({parent} + \"/\" + {child})",

  // --- CORE: TEXT ---
  "console_readline": "prompt(\"Input:\")",
  "parse_int":        "parseInt({text}, 10)",
  "format_string_2":  "{template}.replace('{0}', {arg0}).replace('{1}', {arg1})",

  // --- CORE: SYSTEM ---
  "sys_import": "var {module_name} = require('{module_name}');\n{exec_out}",

  // --- CORE: COLLECTIONS ---
  "list_create":    "[]",
  "make_empty_list":"[]",
  "make_list_1":    "[{item_1}]",
  "make_list_2":    "[{item_1}, {item_2}]",
  "make_list_3":    "[{item_1}, {item_2}, {item_3}]",
  "list_append":    "{list}.push({item});\n{exec_out}",
  "list_length":    "{list}.length",
  "list_get_index": "{list}[{index}]",
  "list_push_all":  "Array.prototype.push.apply({target_list}, {source_list});\n{exec_out}",
  "list_pop":       "var {node_id}_item = {list}.pop();\n{exec_out}",
  "dict_create":    "{}",
  "dict_set":       "{dict}[{key}] = {value};\n{exec_out}",
  "dict_get":       "{dict}[{key}]",
  "dict_has_key":   "({dict}.hasOwnProperty({key}))",

  // --- APP: GAME MAKER / GENERIC ---
  "spawn_instance": "var new_node = node.add({layer_name}, \"Spawned_\" + {obj_name}, {obj_name}, {x}, {y}, 0);\n{exec_out}",
  "auto_depth":     "node.setTextAttr(node.getName(), 1, \"z\", -node.getNumAttr(node.getName(), 1, \"offset.y\"));\n{exec_out}",
  "keyboard_check": "false /* Harmony lacks realtime key loops */",
  "is_free":        "true /* No collision engine in Harmony */",
  "change_coord":   "var cur = node.getNumAttr(node.getName(), 1, \"offset.{axis}\"); node.setTextAttr(node.getName(), 1, \"offset.{axis}\", cur + {amount});\n{exec_out}",

  // ============================================================
  // APP SPECIFIC: TOON BOOM HARMONY
  // ============================================================
  "tb_create_group":    "node.add({parent_path}, {group_name}, 'GROUP', 0, 0, 0);\n{exec_out}",
  "tb_create_node":     "node.add({parent_path}, {node_name}, {node_type}, 0, 0, 0);\n{exec_out}",
  "tb_create_drawing":  "var xPos = parseFloat(\"{offset_x}\") || 0;\nvar yPos = parseFloat(\"{offset_y}\") || 0;\nvar newDrawing = node.add(\"Top\", \"{node_name}\", \"READ\", xPos, yPos, 0);\n{exec_out}",
  "tb_create_composite":"var xPos = parseFloat(\"{offset_x}\") || 0;\nvar yPos = parseFloat(\"{offset_y}\") || 0;\nvar newComp = node.add(\"Top\", \"{node_name}\", \"COMPOSITE\", xPos, yPos, 0);\nnode.setTextAttr(\"Top/\" + \"{node_name}\", \"COMPOSITE_MODE\", 1, \"Pass Through\");\n{exec_out}",
  "tb_link_nodes":      "node.link(\"Top/\" + \"{source_node}\", {source_port}, \"Top/\" + \"{target_node}\", {target_port});\n{exec_out}",
  "tb_publish_slider":  "node.linkAttr({node_path}, {attr_name}, '../../' + {publish_name});\n{exec_out}",
  "tb_end_macro":       "return;",
  "tb_ui_dialog":       "var dialog = new QDialog();\ndialog.setWindowTitle('{title}');\ndialog.setMinimumSize({width}, {height});\n{exec_out}",
  "tb_ui_input":        "var {var_name} = new QLineEdit();\nlayout.addWidget({var_name}, 0, Qt.AlignTop);\n{exec_out}",
  "tb_ui_button":       "var {var_name} = new QPushButton('{label}');\nlayout.addWidget({var_name}, 0, Qt.AlignTop);\n{exec_out}",
  "tb_ui_list":         "var {var_name} = new QListWidget();\nlayout.addWidget({var_name}, 1, Qt.AlignTop);",
  "tb_msg_box":         "MessageBox.information({message});\n{exec_out}",
  "tb_navigate_to_node":"// Navigation Logic Block...\n{success}",
  "tb_simple_dialog":   "MessageBox.information('Test Successful!');\n{exec_out}",
  "tb_select_node":     "selection.clearSelection(); selection.addNodeToSelection({node_path});\n{exec_out}",
  "tb_action_perform":  "Action.perform({action_name}, {view_name});\n{exec_out}",
  "tb_get_root":        "node.root()",
  "tb_get_subnodes":    "node.subNodes({parent_node})",
  "tb_get_name":        "node.getName({node_path})",
  "tb_node_type":       "node.type({node_path})",
  "tb_set_camera_fov":  "var camPath = \"Top/\" + (\"{cam_name}\" || \"Camera\");\nnode.setTextAttr(camPath, \"FOV\", 1, {fov_degrees});\n{exec_out}",
  "tb_fbx_importer":    "var modelNodeName = \"{node_name}\" || \"Imported_FBX\";\nvar filePath = \"{file_path}\";\nvar new3DNode = node.add(\"Top\", modelNodeName, \"3D\", 0, 0, 0);\nnode.setTextAttr(\"Top/\" + modelNodeName, \"MODEL_FILE\", 1, filePath);\nif (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== \"\") {\n  node.link(\"Top/\" + lastCreatedNode, 0, \"Top/\" + modelNodeName, 0);\n}\nvar lastCreatedNode = modelNodeName;\n{exec_out}",

  "tb_refract":         "var node_refract = node.add(node.root(), \"FP_{node_id}\", \"REFRACT\", 0, 0, 0);\nnode.setTextAttr(node_refract, \"intensity\", 1, \"{intensity}\");\nnode.setTextAttr(node_refract, \"height\", 1, \"{height}\");\n{exec_out}",
  "tb_blur_radial":     "var node_blur = node.add(node.root(), \"FP_{node_id}\", \"BLUR_RADIAL\", 0, 0, 0);\nnode.setTextAttr(node_blur, \"radius\", 1, \"{radius}\");\nnode.setTextAttr(node_blur, \"quality\", 1, \"{quality}\");\n{exec_out}",

  "uni_limb_builder":   "var side = {side};\nvar base = {base_name};\nvar parts = [\"_Upper\", \"_Lower\", \"_End\"];\nvar parent = \"Top\";\nfor (var i = 0; i < parts.length; i++) {\n    var name = side + \"_\" + base + parts[i];\n    node.add(parent, name, \"PEG\", 0, 0, 0);\n    if (i > 0) {\n        var prev = side + \"_\" + base + parts[i-1];\n        node.link(\"Top/\" + prev, 0, \"Top/\" + name, 0);\n    }\n}\n{exec_out}",
  "uni_joint":          "var currentName = \"{name}\" || \"Joint\";\nvar xPos = parseFloat(\"{offset_x}\") || 0;\nvar yPos = parseFloat(\"{offset_y}\") || 0;\nvar newNode = node.add(\"Top\", currentName, \"PEG\", xPos, yPos, 0);\nif (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== \"\") {\n    node.link(\"Top/\" + lastCreatedNode, 0, \"Top/\" + currentName, 0);\n}\nvar lastCreatedNode = currentName;\n{exec_out}",
  "uni_drawing":        "var currentName = \"{name}\" || \"Drawing\";\nvar yPos = parseFloat(\"{offset_y}\") || 0;\nvar newNode = node.add(\"Top\", currentName, \"READ\", 0, yPos, 0);\nif (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== \"\") {\n    node.link(\"Top/\" + lastCreatedNode, 0, \"Top/\" + currentName, 0);\n}\nvar lastCreatedNode = currentName;\n{exec_out}",
  "tb_autopatch":       "var currentName = \"{name}\" || \"AutoPatch\";\nvar yPos = parseFloat(\"{offset_y}\") || 0;\nvar newNode = node.add(\"Top\", currentName, \"AutoPatch\", 0, yPos, 0);\nif (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== \"\") {\n    node.link(\"Top/\" + lastCreatedNode, 0, \"Top/\" + currentName, 0);\n}\nvar lastCreatedNode = currentName;\n{exec_out}",
  "uni_mirror_action":  "// Toon Boom Mirroring Logic for {prefix}*\n{exec_out}",
  "uni_search_node":    "var searchTarget = InputDialog.getText('FlowPins', 'Enter Node Name:');\nif (searchTarget) {\n    selection.clearSelection();\n    selection.addNodeToSelection(searchTarget);\n}\n{exec_out}",

  "tb_dynamic_refract": (nodeData: any) => {
    const type = nodeData.props?.blur_type || "Box";
    const grp  = nodeData.props?.group_name || "Refract_Group";
    const harmonyType = type === "Box" ? "Blur-Box" : type === "Gaussian" ? "Blur-Gaussian" : "Blur-Radial";
    return `// --- Dynamic ${type} Refract ---
var grpName = "${grp}";
var fullPath = "Top/" + grpName;
if (node.type(fullPath) != "") { node.deleteNode(fullPath, true, true); }
var path = node.add("Top", grpName, "GROUP", 0, 0, 0);
var n_ref = node.add(path, "Refract", "REFRACT", 0, 0, 0);
var n_blur = node.add(path, "Blur_Node", "${harmonyType}", 0, 0, 0);
node.link(n_ref, 0, n_blur, 0, false, false);
node.linkAttr(n_ref, "distortionIntensity", "../../Intensity");
node.linkAttr(n_blur, "RADIUS", "../../Radius");
{exec_out}`;
  },

  "tb_macro_refract_pro": `var grpName = {group_name};
var fullPath = "Top/" + grpName;
if (node.type(fullPath) != "") { node.deleteNode(fullPath, true, true); }
var path = node.add("Top", grpName, "GROUP", 0, 0, 0);
var n_ref = node.add(path, "Refract", "REFRACT", 0, 0, 0);
var n_swi = node.add(path, "Switch", "Switch", 0, 0, 0);
var n_bb  = node.add(path, "Blur_Box", "Blur-Box", 0, 0, 0);
var n_bg  = node.add(path, "Blur_Gauss", "Blur-Gaussian", 0, 0, 0);
var n_br  = node.add(path, "Blur_Radial", "Blur-Radial", 0, 0, 0);
node.link(n_ref, 0, n_bb, 0, false, false);
node.link(n_ref, 0, n_bg, 0, false, false);
node.link(n_ref, 0, n_br, 0, false, false);
node.link(n_bb, 0, n_swi, 0, false, true);
node.link(n_bg, 0, n_swi, 1, false, true);
node.link(n_br, 0, n_swi, 2, false, true);
node.linkAttr(n_swi, "portToUse", "../../01_Blur_Type_Select");
node.linkAttr(n_ref, "distortionIntensity", "../../02_Refract_Intensity");
node.linkAttr(n_bb, "RADIUS", "../../03_Box_Radius");
node.linkAttr(n_bg, "RADIUS", "../../04_Gauss_Radius");
node.linkAttr(n_br, "RADIUS", "../../05_Radial_Radius");
{exec_out}`,

  // ==========================================================================
  // PIPELINE - FILE SYSTEM (Harmony/Qt)
  // ==========================================================================

  "fs_input_path":  '"{path}"',
  "fs_file_path":   '"{path}"',
  "fs_join_path":   '({folder} + "/" + {filename})',
  "fs_file_exists": '(new QFileInfo({path})).exists()',

  "fs_walk_folder": `// Walk Folder — Harmony/Qt
var _dir_{node_id}   = new QDir({folder_path});
var _ext_{node_id}   = "{extension_filter}";
var _files_{node_id} = _dir_{node_id}.entryList(QDir.Files | QDir.NoDotAndDotDot);
for (var _fi_{node_id} = 0; _fi_{node_id} < _files_{node_id}.length; _fi_{node_id}++) {
    var file_name = _files_{node_id}[_fi_{node_id}];
    if (file_name.toLowerCase().indexOf(_ext_{node_id}.toLowerCase()) >= 0) {
        var file_path = {folder_path} + "/" + file_name;
        var file_ext  = file_name.substring(file_name.lastIndexOf("."));
        {loop_body}
    }
}
{exec_out}`,

  "fs_write_log": `// Write Log File — Harmony/Qt
var _lf_{node_id} = new QFile({file_path});
if (_lf_{node_id}.open(QIODevice.Append | QIODevice.Text)) {
    var _ts_{node_id} = new QTextStream(_lf_{node_id});
    _ts_{node_id}.writeString(String({message}) + "\n");
    _lf_{node_id}.close();
}
{exec_out}`,

  "fs_batch_rename": `// Batch Rename — Harmony/Qt
var _dir_{node_id}   = new QDir({folder_path});
var _files_{node_id} = _dir_{node_id}.entryList(QDir.Files);
for (var _fi_{node_id} = 0; _fi_{node_id} < _files_{node_id}.length; _fi_{node_id}++) {
    var _fname_{node_id} = _files_{node_id}[_fi_{node_id}];
    if (_fname_{node_id}.toLowerCase().indexOf("{extension}".toLowerCase()) >= 0 &&
        _fname_{node_id}.indexOf("{find}") >= 0) {
        var _new_{node_id} = _fname_{node_id}.split("{find}").join("{replace}");
        _dir_{node_id}.rename(_fname_{node_id}, _new_{node_id});
        MessageLog.trace("Renamed: " + _fname_{node_id} + " -> " + _new_{node_id});
    }
}
MessageLog.trace("Batch rename complete.");
{exec_out}`,

  "fs_get_filename": "(function(p) { var f = p.replace(/\\\\/g, '/').split('/'); var n = f[f.length-1]; var d = n.lastIndexOf('.'); return d >= 0 ? n.substring(0,d) : n; })({path})",

  // ==========================================================================
  // PIPELINE - COLOURSPACE (Harmony — stubs, requires Python target)
  // ==========================================================================

  "cs_read_png_profile": `MessageLog.trace("FlowPins: cs_read_png_profile requires Python target.");
var profile_name = "Unavailable in Harmony";
var colourspace  = "Unknown";
var is_tagged    = false;
{exec_out}`,

  "cs_check_colourspace": "var is_correct = false; var result_message = 'Colourspace check requires Python target.';",
  "cs_batch_validate":    `var pass_list = []; var fail_list = []; var pass_count = 0; var fail_count = 0;
MessageLog.trace("FlowPins: Colourspace validation requires Python target.");
{exec_out}`,
  "cs_print_report":      `MessageLog.trace("FlowPins: Colourspace report requires Python target.");
{exec_out}`,

};
