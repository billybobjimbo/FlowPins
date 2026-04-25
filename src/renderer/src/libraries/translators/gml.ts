// src/renderer/src/libraries/translators/gml.ts
// ============================================================================
// FLOWPINS: GAMEMAKER STUDIO 2 TRANSLATION DICTIONARY
// Target: GML (GameMaker Language)
//
// Notes:
//   - File I/O uses file_find_first / file_text_* built-ins
//   - GML has no native file rename — batch rename logs intentions only
//   - Colourspace validation not applicable in game engine context (stubs provided)
// ============================================================================
export const GML_TRANSLATIONS: Record<string, any> = {

  // --- CORE: EXECUTION ---
  "start":         "// Start Execution\n{exec_out}",
  "end_macro":     "exit;",
  "merge_exec":    "{exec_out}",
  "sequence":      "{then_1}\n{then_2}\n{then_3}",
  "console_print": "show_debug_message(string({message}));\n{exec_out}",
  "try_catch":     "try {\n    {try}\n} catch ({node_id}_ex) {\n    var error_msg = {node_id}_ex.message;\n    {catch}\n}",

  // --- CORE: MATH ---
  "add_int":      "({a} + {b})",
  "subtract_int": "({a} - {b})",
  "multiply_int": "({a} * {b})",
  "divide_int":   "({a} / {b})",
  "compare_int":  "({a} {op} {b})",
  "random_int":   "irandom_range({min}, {max})",
  "math_modulo":  "({a} % {b})",
  "math_power":   "power({base}, {exponent})",
  "math_abs":     "abs({value})",

  // --- CORE: LOGIC ---
  "if_branch":            "if ({condition}) {\n    {true}\n} else {\n    {false}\n}",
  "for_loop":             "for (var {node_id}_i = {start}; {node_id}_i < {end}; {node_id}_i++) {\n    {loop_body}\n}\n{exec_out}",
  "while_loop":           "while ({condition}) {\n    {loop_body}\n}\n{exec_out}",
  "foreach_list":         "var {node_id}_len = array_length({list});\nfor (var {node_id}_i = 0; {node_id}_i < {node_id}_len; {node_id}_i++) {\n    var {node_id}_item = {list}[{node_id}_i];\n    {loop_body}\n}\n{exec_out}",
  "compare_strings":      "({a} == {b})",
  "check_list_not_empty": "(array_length({list}) > 0)",
  "logic_and":            "({a} && {b})",
  "logic_or":             "({a} || {b})",

  // --- CORE: FUNCTIONS ---
  "func_def":    "function {func_name}(arg0) {\n    {exec_out}\n}",
  "func_return": "return {value};",
  "func_call":   "var res_{node_id} = {func_name}({arg0_in});\n{exec_out}",

  // --- CORE: VARIABLES ---
  "set_var": "{var_name} = {value};\n{exec_out}",
  "get_var": "{var_name}",

  // --- CORE: DATA / PRIMITIVES ---
  "const_int":        "{value}",
  "const_string":     "\"{value}\"",
  "const_bool":       "{value}",
  "string_join_path": "({parent} + \"\\\\\" + {child})",

  // --- CORE: TEXT ---
  "console_readline": "get_string(\"\", \"\")",
  "parse_int":        "real({text})",
  "format_string_2":  "string_format({template}, {arg0}, {arg1})",

  // --- CORE: COLLECTIONS ---
  "list_create":    "[]",
  "make_empty_list":"[]",
  "make_list_1":    "[{item_1}]",
  "make_list_2":    "[{item_1}, {item_2}]",
  "make_list_3":    "[{item_1}, {item_2}, {item_3}]",
  "list_append":    "array_push({list}, {item});\n{exec_out}",
  "list_length":    "array_length({list})",
  "list_get_index": "{list}[{index}]",
  "list_push_all":  "array_copy({target_list}, array_length({target_list}), {source_list}, 0, array_length({source_list}));\n{exec_out}",
  "list_pop":       "var {node_id}_item = array_pop({list});\n{exec_out}",
  "dict_create":    "{}",
  "dict_set":       "variable_struct_set({dict}, string({key}), {value});\n{exec_out}",
  "dict_get":       "variable_struct_get({dict}, string({key}))",
  "dict_has_key":   "variable_struct_exists({dict}, string({key}))",

  // --- APP: GAME MAKER SPECIFIC ---
  "spawn_instance": "instance_create_layer({x}, {y}, {layer_name}, {obj_name});\n{exec_out}",
  "auto_depth":     "depth = -bbox_bottom;\n{exec_out}",
  "keyboard_check": "keyboard_check({key})",
  "is_free":        "!place_meeting(x + ({x_offset}), y + ({y_offset}), {obj_name})",
  "change_coord":   "{axis} += {amount};\n{exec_out}",

  // ==========================================================================
  // PIPELINE - FILE SYSTEM (GML / GameMaker Studio 2)
  // ==========================================================================

  "fs_input_path":  '"{path}"',
  "fs_file_path":   '"{path}"',
  "fs_join_path":   '({folder} + "\\" + {filename})',
  "fs_file_exists": "file_exists({path})",
  "fs_get_filename":"filename_name({path})",

  "fs_walk_folder": `// Walk Folder — GML
var _fa_{node_id} = file_find_first({folder_path} + "\\*{extension_filter}", fa_none);
while (_fa_{node_id} != "") {
    var file_name = _fa_{node_id};
    var file_path = {folder_path} + "\\" + file_name;
    var file_ext  = filename_ext(file_name);
    {loop_body}
    _fa_{node_id} = file_find_next();
}
file_find_close();
{exec_out}`,

  "fs_write_log": `// Write Log File — GML
var _f_{node_id} = file_text_open_append({file_path});
file_text_write_string(_f_{node_id}, string({message}) + "\n");
file_text_close(_f_{node_id});
{exec_out}`,

  "fs_batch_rename": `// Batch Rename — GML (log only, no native rename support)
var _fa_{node_id} = file_find_first({folder_path} + "\\*{extension}", fa_none);
while (_fa_{node_id} != "") {
    if (string_pos("{find}", _fa_{node_id}) > 0) {
        show_debug_message("Would rename: " + _fa_{node_id} + " -> " + string_replace(_fa_{node_id}, "{find}", "{replace}"));
    }
    _fa_{node_id} = file_find_next();
}
file_find_close();
{exec_out}`,

  // ==========================================================================
  // PIPELINE - COLOURSPACE (GML — stubs, not applicable in game engine)
  // ==========================================================================

  "cs_read_png_profile":  `var profile_name = "N/A"; var colourspace = "N/A"; var is_tagged = false;
show_debug_message("FlowPins: Colourspace validation not available in GML target.");
{exec_out}`,
  "cs_check_colourspace": "var is_correct = false; var result_message = 'Colourspace check N/A in GML.';",
  "cs_batch_validate":    `var pass_list = []; var fail_list = []; var pass_count = 0; var fail_count = 0;
show_debug_message("FlowPins: Colourspace validation not available in GML target.");
{exec_out}`,
  "cs_print_report":      `show_debug_message("FlowPins: Colourspace report not available in GML target.");
{exec_out}`,

};