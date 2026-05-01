// src/renderer/src/libraries/translators/harmony.ts
// ============================================================================
// Toon Boom Harmony (JavaScript) translation dictionary.
// Target: Harmony 21+ scripting API
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
  "tb_link_nodes": `// Link two nodes together
var _src_{node_id} = {source_node};
var _tgt_{node_id} = {target_node};
var _sp_{node_id}  = {source_port};
var _tp_{node_id}  = {target_port};
node.link(_src_{node_id}, _sp_{node_id}, _tgt_{node_id}, _tp_{node_id});
MessageLog.trace("FlowPins: Linked " + _src_{node_id} + " -> " + _tgt_{node_id});
{exec_out}`,
  "tb_publish_slider":  "node.linkAttr({node_path}, {attr_name}, '../../' + {publish_name});\n{exec_out}",
  "tb_end_macro":       "return;",
  "tb_ui_dialog":       "var dialog = new QDialog();\ndialog.setWindowTitle('{title}');\ndialog.setMinimumSize({width}, {height});\n{exec_out}",
  "tb_ui_input":        "var {var_name} = new QLineEdit();\nlayout.addWidget({var_name}, 0, Qt.AlignTop);\n{exec_out}",
  "tb_ui_button":       "var {var_name} = new QPushButton('{label}');\nlayout.addWidget({var_name}, 0, Qt.AlignTop);\n{exec_out}",
  "tb_ui_list":         "var {var_name} = new QListWidget();\nlayout.addWidget({var_name}, 1, Qt.AlignTop);",
  "tb_msg_box":         "MessageBox.information(\"{message}\");\n{exec_out}",
  "tb_navigate_to_node":"// Navigation Logic Block...\n{success}",
  "tb_simple_dialog":   "MessageBox.information('Test Successful!');\n{exec_out}",
  "tb_select_node":     "selection.clearSelection(); selection.addNodeToSelection({node_path});\n{exec_out}",
  "tb_action_perform":  "Action.perform(\"{action_name}\", \"{view_name}\");\n{exec_out}",
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



  // ==========================================================================
  // NEW NODES — Wave 2 (all type strings confirmed from .xstage)
  // ==========================================================================

// ==========================================================================
  // COMPOSITING
  // ==========================================================================

  "tb_composite": `// Create Composite node
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var newComp_{node_id} = node.add("Top", "{node_name}", "COMPOSITE", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr("Top/" + "{node_name}", "compositeMode", 1, "{composite_mode}");
node.setTextAttr("Top/" + "{node_name}", "flattenOutput", 1, "{flatten}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, "Top/" + "{node_name}", 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_display": `// Create Display node
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
node.add("Top", "{node_name}", "DISPLAY", xPos_{node_id}, yPos_{node_id}, 0);
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, "Top/" + "{node_name}", 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_write": `// Create Write node
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var writePath_{node_id} = "Top/" + "{node_name}";
node.add("Top", "{node_name}", "WRITE", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(writePath_{node_id}, "drawingName",  1, "{drawing_name}");
node.setTextAttr(writePath_{node_id}, "drawingType",  1, "{drawing_type}");
node.setTextAttr(writePath_{node_id}, "leadingZeros", 1, "{leading_zeros}");
node.setTextAttr(writePath_{node_id}, "colorSpace",   1, "{color_space}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, writePath_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_visibility": `// Create Visibility node
var vis_{node_id} = node.add("Top", "{node_name}", "VISIBILITY", 0, 0, 0);
node.setTextAttr(vis_{node_id}, "oglrender",  1, "{visible}");
node.setTextAttr(vis_{node_id}, "softrender", 1, "{visible}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, vis_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_image_switch": `// Create Image Switch node
var sw_{node_id} = node.add("Top", "{node_name}", "ImageSwitch", 0, 0, 0);
node.setTextAttr(sw_{node_id}, "portIndex", 1, "{port_index}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, sw_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  // ==========================================================================
  // BLUR NODES — type strings confirmed from xstage
  // ==========================================================================

  "tb_blur_box": `// Create Blur-Box node (type: BOXBLUR-PLUGIN confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var blur_{node_id} = node.add("Top", "{node_name}", "BOXBLUR-PLUGIN", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(blur_{node_id}, "radius",        1, "{radius}");
node.setTextAttr(blur_{node_id}, "bidirectional", 1, "{bidirectional}");
node.setTextAttr(blur_{node_id}, "precision",     1, "{precision}");
node.setTextAttr(blur_{node_id}, "iterations",    1, "{iterations}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, blur_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_blur_gaussian": `// Create Blur-Gaussian node (type: GAUSSIANBLUR-PLUGIN confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var blur_{node_id} = node.add("Top", "{node_name}", "GAUSSIANBLUR-PLUGIN", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(blur_{node_id}, "blurriness", 1, "{blurriness}");
node.setTextAttr(blur_{node_id}, "precision",  1, "{precision}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, blur_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_blur_variable": `// Create Blur-Variable node (type: BLUR_VARIABLE confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var blur_{node_id} = node.add("Top", "{node_name}", "BLUR_VARIABLE", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(blur_{node_id}, "blackRadius", 1, "{black_radius}");
node.setTextAttr(blur_{node_id}, "whiteRadius", 1, "{white_radius}");
node.setTextAttr(blur_{node_id}, "quality",     1, "{quality}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, blur_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_blur_directional": `// Create Blur-Directional node (type: BLUR_DIRECTIONAL confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var blur_{node_id} = node.add("Top", "{node_name}", "BLUR_DIRECTIONAL", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(blur_{node_id}, "radius", 1, "{radius}");
node.setTextAttr(blur_{node_id}, "angle",  1, "{angle}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, blur_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_matte_blur": `// Create Matte-Blur node (type: MATTE_BLUR confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var mb_{node_id} = node.add("Top", "{node_name}", "MATTE_BLUR", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(mb_{node_id}, "radius",      1, "{radius}");
node.setTextAttr(mb_{node_id}, "blurType",    1, "{blur_type}");
node.setTextAttr(mb_{node_id}, "invertMatte", 1, "{invert_matte}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, mb_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_matte_resize": `// Create Matte-Resize node (type: MATTE_RESIZE confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var mr_{node_id} = node.add("Top", "{node_name}", "MATTE_RESIZE", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(mr_{node_id}, "radius", 1, "{radius}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, mr_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  // ==========================================================================
  // COLOUR / EFFECTS NODES
  // ==========================================================================

  "tb_glow": `// Create Glow node (type: GLOW confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var glow_{node_id} = node.add("Top", "{node_name}", "GLOW", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(glow_{node_id}, "radius",         1, "{radius}");
node.setTextAttr(glow_{node_id}, "blurType",       1, "{blur_type}");
node.setTextAttr(glow_{node_id}, "colourGain",     1, "{colour_gain}");
node.setTextAttr(glow_{node_id}, "multiplicative",  1, "{multiplicative}");
node.setTextAttr(glow_{node_id}, "invertMatte",    1, "{invert_matte}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, glow_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_highlight": `// Create Highlight node (type: HIGHLIGHT confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var hl_{node_id} = node.add("Top", "{node_name}", "HIGHLIGHT", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(hl_{node_id}, "radius",     1, "{radius}");
node.setTextAttr(hl_{node_id}, "blurType",   1, "{blur_type}");
node.setTextAttr(hl_{node_id}, "colourGain", 1, "{colour_gain}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, hl_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_tone": `// Create Tone node (type: TONE confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var tone_{node_id} = node.add("Top", "{node_name}", "TONE", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(tone_{node_id}, "radius",     1, "{radius}");
node.setTextAttr(tone_{node_id}, "blurType",   1, "{blur_type}");
node.setTextAttr(tone_{node_id}, "colourGain", 1, "{colour_gain}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, tone_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_colour_scale": `// Create Colour-Scale node (type: COLOR_SCALE confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var cs_{node_id} = node.add("Top", "{node_name}", "COLOR_SCALE", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(cs_{node_id}, "red",        1, "{red}");
node.setTextAttr(cs_{node_id}, "green",      1, "{green}");
node.setTextAttr(cs_{node_id}, "blue",       1, "{blue}");
node.setTextAttr(cs_{node_id}, "alpha",      1, "{alpha}");
node.setTextAttr(cs_{node_id}, "saturation", 1, "{saturation}");
node.setTextAttr(cs_{node_id}, "value",      1, "{value}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, cs_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_hue_saturation": `// Create Hue-Saturation node (type: HUE_SATURATION confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var hs_{node_id} = node.add("Top", "{node_name}", "HUE_SATURATION", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(hs_{node_id}, "masterrangecolor.hueShift",  1, "{hue_shift}");
node.setTextAttr(hs_{node_id}, "masterrangecolor.saturation",1, "{saturation}");
node.setTextAttr(hs_{node_id}, "masterrangecolor.lightness", 1, "{lightness}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, hs_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_colour_card": `// Create Colour-Card node (type: COLOR_CARD confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var cc_{node_id} = node.add("Top", "{node_name}", "COLOR_CARD", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(cc_{node_id}, "offsetZ", 1, "{offset_z}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, cc_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_cutter": `// Create Cutter node (type: CUTTER confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var cut_{node_id} = node.add("Top", "{node_name}", "CUTTER", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(cut_{node_id}, "inverted", 1, "{inverted}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, cut_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_gradient": `// Create Gradient node (type: GRADIENT-PLUGIN confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var grad_{node_id} = node.add("Top", "{node_name}", "GRADIENT-PLUGIN", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(grad_{node_id}, "type", 1, "{gradient_type}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, grad_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_colour_override": `// Create Colour-Override node (type: COLOR_OVERRIDE_TVG confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var co_{node_id} = node.add("Top", "{node_name}", "COLOR_OVERRIDE_TVG", xPos_{node_id}, yPos_{node_id}, 0);
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, co_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  "tb_multi_layer_write": `// Create Multi-Layer-Write node (type: MultiLayerWrite confirmed from xstage)
var xPos_{node_id} = parseFloat("{offset_x}") || 0;
var yPos_{node_id} = parseFloat("{offset_y}") || 0;
var mlw_{node_id} = node.add("Top", "{node_name}", "MultiLayerWrite", xPos_{node_id}, yPos_{node_id}, 0);
node.setTextAttr(mlw_{node_id}, "drawingName", 1, "{drawing_name}");
node.setTextAttr(mlw_{node_id}, "drawingType", 1, "{drawing_type}");
node.setTextAttr(mlw_{node_id}, "colorSpace",  1, "{color_space}");
if (typeof lastCreatedNode !== 'undefined' && lastCreatedNode !== "") {
    node.link("Top/" + lastCreatedNode, 0, mlw_{node_id}, 0);
}
var lastCreatedNode = "{node_name}";
{exec_out}`,

  // ==========================================================================
  // NAV TO NODE UTILITY TRANSLATIONS
  // ==========================================================================

  "tb_get_top_level_groups": `// Get all top-level GROUP nodes directly under Top
var group_list  = [];
var group_count = 0;
var _children_{node_id} = node.subNodes("Top");
for (var _i_{node_id} = 0; _i_{node_id} < _children_{node_id}.length; _i_{node_id}++) {
  var _child_{node_id} = _children_{node_id}[_i_{node_id}];
  if (node.type(_child_{node_id}) === "GROUP") {
    group_list.push(_child_{node_id});
  }
}
group_count = group_list.length;
MessageLog.trace("NAV: Found " + group_count + " top-level groups.");
{exec_out}`,

  "tb_get_group_short_name": `// Extract short name from full group path
// e.g. "Top/Riley/Riley_Body" -> "Riley_Body"
var _parts_{node_id} = ({group_path}).split("/");
var short_name = _parts_{node_id}[_parts_{node_id}.length - 1];
{exec_out}`,

  "tb_find_multiport_out": `// Find MULTIPORT_OUT inside a group
var _grp_{node_id}      = {group_path};
var _kids_{node_id}     = node.subNodes(_grp_{node_id});
var node_path           = "";
var found               = false;
for (var _i_{node_id} = 0; _i_{node_id} < _kids_{node_id}.length; _i_{node_id}++) {
  if (node.type(_kids_{node_id}[_i_{node_id}]) === "MULTIPORT_OUT") {
    node_path = _kids_{node_id}[_i_{node_id}];
    found     = true;
    break;
  }
}
MessageLog.trace("NAV: MULTIPORT_OUT in " + _grp_{node_id} + " -> " + (found ? node_path : "not found"));
{exec_out}`,

  "tb_nav_anchor_exists": `// Check if a NAV_ anchor composite already exists in this group
var _grp_{node_id}     = {group_path};
var _prefix_{node_id}  = "{nav_prefix}";
var _parts_{node_id}   = _grp_{node_id}.split("/");
var _short_{node_id}   = _parts_{node_id}[_parts_{node_id}.length - 1];
var anchor_path        = _grp_{node_id} + "/" + _prefix_{node_id} + _short_{node_id};
var exists             = (node.type(anchor_path) === "COMPOSITE");
MessageLog.trace("NAV: Anchor check " + anchor_path + " -> " + exists);
{exec_out}`,

  "tb_get_node_coord": `// Get X, Y, Z coordinates of a node in the Node View
var _np_{node_id} = {node_path};
var coord_x       = node.coordX(_np_{node_id});
var coord_y       = node.coordY(_np_{node_id});
var coord_z       = node.coordZ(_np_{node_id});
{exec_out}`,

  "tb_plant_nav_composite": `// Plant a NAV_ anchor composite next to a MULTIPORT_OUT
var _grp_{node_id}    = {group_path};
var _mp_{node_id}     = {mp_out_path};
var _prefix_{node_id} = "{nav_prefix}";
var _offset_{node_id} = {x_offset};
var _parts_{node_id}  = _grp_{node_id}.split("/");
var _short_{node_id}  = _parts_{node_id}[_parts_{node_id}.length - 1];
var anchor_name       = _prefix_{node_id} + _short_{node_id};
var plant_path_{node_id} = _grp_{node_id} + "/" + anchor_name;
var _ax_{node_id}     = node.coordX(_mp_{node_id}) + _offset_{node_id};
var _ay_{node_id}     = node.coordY(_mp_{node_id});
var _az_{node_id}     = node.coordZ(_mp_{node_id});
node.add(_grp_{node_id}, anchor_name, "COMPOSITE", _ax_{node_id}, _ay_{node_id}, _az_{node_id});
MessageLog.trace("NAV: Planted " + plant_path_{node_id});
{exec_out}`,


  "tb_launch_nav_window": `// ================================================================
// LAUNCH NAV WINDOW — collects all NAV_ anchors and opens navigator
// ================================================================
var _prefix_{node_id} = "{nav_prefix}";
var _title_{node_id}  = "{title}";

// Scan Top for NAV_ anchor composites
var _anchors_{node_id} = [];
var _topGroups_{node_id} = node.subNodes("Top");
for (var _gi_{node_id} = 0; _gi_{node_id} < _topGroups_{node_id}.length; _gi_{node_id}++) {
  var _gp_{node_id}    = _topGroups_{node_id}[_gi_{node_id}];
  if (node.type(_gp_{node_id}) !== "GROUP") continue;
  var _parts_{node_id} = _gp_{node_id}.split("/");
  var _short_{node_id} = _parts_{node_id}[_parts_{node_id}.length - 1];
  var _apath_{node_id} = _gp_{node_id} + "/" + _prefix_{node_id} + _short_{node_id};
  if (node.type(_apath_{node_id}) === "COMPOSITE") {
    _anchors_{node_id}.push({
      name:       _short_{node_id},
      anchorPath: _apath_{node_id},
      groupPath:  _gp_{node_id}
    });
  }
}

// Sort alphabetically
_anchors_{node_id}.sort(function(a, b) { return a.name.localeCompare(b.name); });

if (_anchors_{node_id}.length === 0) {
  MessageBox.information("NAV TO NODE — No NAV_ anchors found. Run the scan first.");
} else {
  // Build navigator window
  var _dlg_{node_id} = new QDialog();
  _dlg_{node_id}.setWindowTitle(_title_{node_id} + " — " + _anchors_{node_id}.length + " groups");
  _dlg_{node_id}.resize(300, Math.min(500, 80 + _anchors_{node_id}.length * 42));
  _dlg_{node_id}.setWindowFlags(Qt.WindowStaysOnTopHint);

  var _lay_{node_id} = new QVBoxLayout();
  _dlg_{node_id}.setLayout(_lay_{node_id});

  var _hdr_{node_id} = new QLabel("  " + _anchors_{node_id}.length + " navigable groups");
  _hdr_{node_id}.setStyleSheet("color: #00d8ff; font-size: 11px; font-weight: bold; padding: 8px; background: #0a0a0a;");
  _lay_{node_id}.addWidget(_hdr_{node_id}, 0, Qt.AlignTop);

  var _list_{node_id} = new QListWidget();
  _list_{node_id}.setStyleSheet(
    "QListWidget { background: #111; border: none; color: #ccc; font-size: 13px; outline: none; }" +
    "QListWidget::item { padding: 10px 14px; border-bottom: 1px solid #1e1e1e; }" +
    "QListWidget::item:hover { background: #1e2a2e; color: #fff; }" +
    "QListWidget::item:selected { background: #0a2030; color: #00d8ff; }"
  );

  for (var _ai_{node_id} = 0; _ai_{node_id} < _anchors_{node_id}.length; _ai_{node_id}++) {
    var _item_{node_id} = new QListWidgetItem(_anchors_{node_id}[_ai_{node_id}].name);
    _list_{node_id}.addItem(_item_{node_id});
  }
  _lay_{node_id}.addWidget(_list_{node_id}, 1, Qt.AlignTop);

  var _data_{node_id} = _anchors_{node_id};
  _list_{node_id}.itemClicked.connect(function(item) {
    var _clicked_{node_id} = item.text();
    for (var _ni_{node_id} = 0; _ni_{node_id} < _data_{node_id}.length; _ni_{node_id}++) {
      if (_data_{node_id}[_ni_{node_id}].name === _clicked_{node_id}) {
        var _t_{node_id} = _data_{node_id}[_ni_{node_id}];
        selection.clearSelection();
        selection.addNodeToSelection(_t_{node_id}.groupPath);
        Action.perform("onActionEnterGroup()", "Node View");
        selection.clearSelection();
        selection.addNodeToSelection(_t_{node_id}.anchorPath);
        Action.perform("onActionReframeSelection()", "Node View");
        MessageLog.trace("NAV: Jumped to " + _t_{node_id}.groupPath);
        break;
      }
    }
  });

  var _close_{node_id} = new QPushButton("Close Navigator");
  _close_{node_id}.setStyleSheet(
    "QPushButton { background: #1a1a1a; color: #555; border: 1px solid #2a2a2a; border-radius: 3px; padding: 7px; font-size: 11px; }" +
    "QPushButton:hover { color: #999; background: #252525; }"
  );
  _close_{node_id}.clicked.connect(function() { _dlg_{node_id}.close(); });
  _lay_{node_id}.addWidget(_close_{node_id}, 0, Qt.AlignBottom);

  _dlg_{node_id}.show();
}
{exec_out}`,


  // ==========================================================================
  // SCENE QUERY UTILITY TRANSLATIONS
  // ==========================================================================

  "tb_get_nodes_by_type": `// Recursively find all nodes of a given type in the scene
var _target_type_{node_id} = "{node_type}";
var _root_{node_id}        = {root_path};
var node_list              = [];
var node_names             = [];
var node_count             = 0;

function _scanNodes_{node_id}(parentPath) {
  var _children_{node_id} = node.subNodes(parentPath);
  for (var _i_{node_id} = 0; _i_{node_id} < _children_{node_id}.length; _i_{node_id}++) {
    var _child_{node_id} = _children_{node_id}[_i_{node_id}];
    var _type_{node_id}  = node.type(_child_{node_id});
    if (_type_{node_id} === _target_type_{node_id}) {
      var _parts_{node_id} = _child_{node_id}.split("/");
      var _short_{node_id} = _parts_{node_id}[_parts_{node_id}.length - 1];
      node_list.push(_child_{node_id});
      node_names.push(_short_{node_id});
    }
    if (_type_{node_id} === "GROUP") {
      _scanNodes_{node_id}(_child_{node_id});
    }
  }
}

_scanNodes_{node_id}(_root_{node_id});
node_count = node_list.length;
MessageLog.trace("NAV: Found " + node_count + " nodes of type " + _target_type_{node_id});
{exec_out}`,

  "tb_set_active_display": `// Set the active display in Harmony's camera view
// Extract just the node name from the full path
var _dp_{node_id}    = {display_path};
var _parts_{node_id} = _dp_{node_id}.split("/");
var _dn_{node_id}    = _parts_{node_id}[_parts_{node_id}.length - 1];

// Select the display node first
selection.clearSelection();
selection.addNodeToSelection(_dp_{node_id});

// Try action against every known view until one works
var _views_{node_id} = view.viewList();
var _prev_{node_id}  = scene.getDefaultDisplay();
var _switched_{node_id} = false;

for (var _vi_{node_id} = 0; _vi_{node_id} < _views_{node_id}.length; _vi_{node_id}++) {
  var _vtype_{node_id} = view.type(_views_{node_id}[_vi_{node_id}]);
  if (_vtype_{node_id} === "cameraView" || _vtype_{node_id} === "cameraview") {
    Action.perform("onActionSetAsDefaultDisplay()", _views_{node_id}[_vi_{node_id}]);
    _switched_{node_id} = true;
    MessageLog.trace("NAV: Tried camera view: " + _views_{node_id}[_vi_{node_id}]);
    break;
  }
}

// Fallback - try all views
if (!_switched_{node_id}) {
  for (var _vi2_{node_id} = 0; _vi2_{node_id} < _views_{node_id}.length; _vi2_{node_id}++) {
    Action.perform("onActionSetAsDefaultDisplay()", _views_{node_id}[_vi2_{node_id}]);
  }
  MessageLog.trace("NAV: Tried all " + _views_{node_id}.length + " views");
}

MessageLog.trace("NAV: Was: " + _prev_{node_id} + " | Now: " + scene.getDefaultDisplay());
{exec_out}`,

  "tb_get_selected_node": `// Get the currently selected node in the Node View
var _sel_{node_id} = selection.selectedNodes();
var node_path = "";
var node_name = "";
var node_type = "";
if (_sel_{node_id}.length > 0) {
  node_path = _sel_{node_id}[0];
  var _parts_{node_id} = node_path.split("/");
  node_name = _parts_{node_id}[_parts_{node_id}.length - 1];
  node_type = node.type(node_path);
  MessageLog.trace("Selected: " + node_name + " [" + node_type + "]");
} else {
  MessageLog.trace("No node selected.");
}
{exec_out}`,

  "tb_filter_list_by_type": `// Filter a node list to only include nodes of a specific type
var _input_{node_id}    = {node_list};
var _ftype_{node_id}    = "{node_type}";
var filtered_list       = [];
var filtered_count      = 0;
for (var _i_{node_id} = 0; _i_{node_id} < _input_{node_id}.length; _i_{node_id}++) {
  if (node.type(_input_{node_id}[_i_{node_id}]) === _ftype_{node_id}) {
    filtered_list.push(_input_{node_id}[_i_{node_id}]);
  }
}
filtered_count = filtered_list.length;
{exec_out}`,


  // ==========================================================================
  // PHASE 1 — SHARED UTILITY TRANSLATIONS
  // ==========================================================================

  "tb_get_selection_count": `// Get number of currently selected nodes
var count = selection.numberOfNodesSelected();
MessageLog.trace("FlowPins: " + count + " nodes selected.");
{exec_out}`,

  "tb_get_selected_nodes": `// Get list of all currently selected nodes
var node_list = selection.selectedNodes();
var count     = node_list.length;
MessageLog.trace("FlowPins: Got " + count + " selected nodes.");
{exec_out}`,

  "tb_get_parent_group": `// Get the parent group of a node
var _np_{node_id}    = {node_path};
var parent_path      = node.parentNode(_np_{node_id});
var _parts_{node_id} = parent_path.split("/");
var parent_name      = _parts_{node_id}[_parts_{node_id}.length - 1];
MessageLog.trace("FlowPins: Parent of " + _np_{node_id} + " is " + parent_path);
{exec_out}`,

  "tb_set_node_coord": `// Set the position of a node in the Node View
var _np_{node_id} = {node_path};
var _nx_{node_id} = {x};
var _ny_{node_id} = {y};
node.setCoord(_np_{node_id}, _nx_{node_id}, _ny_{node_id});
{exec_out}`,

  "tb_begin_undo": `// Begin an undo/redo accumulator block
var _bn_{node_id} = "{block_name}";
scene.beginUndoRedoAccum(_bn_{node_id});
MessageLog.trace("FlowPins: Undo block started — " + _bn_{node_id});
{exec_out}`,

  "tb_end_undo": `// End an undo/redo accumulator block
var _bn_{node_id} = "{block_name}";
scene.endUndoRedoAccum(_bn_{node_id});
MessageLog.trace("FlowPins: Undo block ended — " + _bn_{node_id});
{exec_out}`,

  "tb_get_active_view_group": `// Get the current group shown in the active Node View
var _views_{node_id}  = view.viewList("Node View");
var _active_{node_id} = _views_{node_id}.length > 1
  ? view.currentView()
  : _views_{node_id}[0];
var group_path        = view.group(_active_{node_id});
var _parts_{node_id}  = group_path.split("/");
var group_name        = _parts_{node_id}[_parts_{node_id}.length - 1];
MessageLog.trace("FlowPins: Active view group is " + group_path);
{exec_out}`,


  "tb_string_append": `var result = {base} + "{suffix}";
{exec_out}`,


  "tb_sort_nodes_by_x": `// Sort a list of nodes by their X coordinate in the Node View
var _list_{node_id} = {node_list};
var _dir_{node_id}  = "{direction}";

var sorted_list = _list_{node_id}.slice(); // copy array
sorted_list.sort(function(a, b) {
  return _dir_{node_id} === "descending"
    ? node.coordX(b) - node.coordX(a)
    : node.coordX(a) - node.coordX(b);
});

var first_node = sorted_list.length > 0 ? sorted_list[0] : "";
MessageLog.trace("FlowPins: Sorted " + sorted_list.length + " nodes by X (" + _dir_{node_id} + ")");
{exec_out}`,

  "tb_arrange_nodes_near_target": `// Move selected nodes to a position relative to a target node
var _nodes_{node_id}   = {node_list};
var _target_{node_id}  = {target_path};
var _offX_{node_id}    = {offset_x};
var _offY_{node_id}    = {offset_y};

if (_nodes_{node_id}.length === 0) {
  MessageLog.trace("FlowPins: No nodes to arrange.");
} else {
  // Use first node as the reference point
  var _xMin_{node_id} = node.coordX(_nodes_{node_id}[0]);
  var _yMin_{node_id} = node.coordY(_nodes_{node_id}[0]);
  var _tgtX_{node_id} = node.coordX(_target_{node_id});
  var _tgtY_{node_id} = node.coordY(_target_{node_id});

  for (var _i_{node_id} = 0; _i_{node_id} < _nodes_{node_id}.length; _i_{node_id}++) {
    var _n_{node_id}   = _nodes_{node_id}[_i_{node_id}];
    var _relX_{node_id} = node.coordX(_n_{node_id}) - _xMin_{node_id};
    var _relY_{node_id} = node.coordY(_n_{node_id}) - _yMin_{node_id};
    var _newX_{node_id} = _tgtX_{node_id} + _relX_{node_id} + _offX_{node_id};
    var _newY_{node_id} = _tgtY_{node_id} + _relY_{node_id} + _offY_{node_id};
    node.setCoord(_n_{node_id}, _newX_{node_id}, _newY_{node_id});
    MessageLog.trace("FlowPins: Moved " + _n_{node_id} + " to (" + _newX_{node_id} + ", " + _newY_{node_id} + ")");
  }
}
{exec_out}`,


};
