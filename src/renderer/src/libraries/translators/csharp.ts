// src/renderer/src/libraries/translators/csharp.ts
// ============================================================================
// FLOWPINS: UNITY / C# TRANSLATION DICTIONARY
// Target: Unity C# scripting (MonoBehaviour context)
//
// Notes:
//   - File I/O uses System.IO namespace
//   - Colourspace: raw PNG byte inspection (no Pillow equivalent in C#)
// ============================================================================
export const CSHARP_TRANSLATIONS: Record<string, any> = {

  // --- CORE: EXECUTION ---
  "start":         "// Start Execution\n{exec_out}",
  "end_macro":     "return;",
  "merge_exec":    "{exec_out}",
  "sequence":      "{then_1}\n{then_2}\n{then_3}",
  "console_print": "Console.WriteLine({message});\n{exec_out}",
  "try_catch":     "try {\n    {try}\n} catch (Exception {node_id}_ex) {\n    string error_msg = {node_id}_ex.Message;\n    {catch}\n}",

  // --- CORE: MATH ---
  "add_int":      "({a} + {b})",
  "subtract_int": "({a} - {b})",
  "multiply_int": "({a} * {b})",
  "divide_int":   "({a} / {b})",
  "compare_int":  "({a} {op} {b})",
  "random_int":   "UnityEngine.Random.Range({min}, {max})",
  "math_modulo":  "({a} % {b})",
  "math_power":   "Math.Pow({base}, {exponent})",
  "math_abs":     "Math.Abs({value})",

  // --- CORE: LOGIC ---
  "if_branch":            "if ({condition}) {\n    {true}\n} else {\n    {false}\n}",
  "for_loop":             "for (int {node_id}_i = {start}; {node_id}_i < {end}; {node_id}_i++) {\n    {loop_body}\n}\n{exec_out}",
  "while_loop":           "while ({condition}) {\n    {loop_body}\n}\n{exec_out}",
  "foreach_list":         "foreach (var {node_id}_item in {list}) {\n    {loop_body}\n}\n{exec_out}",
  "compare_strings":      "({a} == {b})",
  "check_list_not_empty": "({list}.Count > 0)",
  "logic_and":            "({a} && {b})",
  "logic_or":             "({a} || {b})",

  // --- CORE: FUNCTIONS ---
  "func_def":    "private static dynamic {func_name}(dynamic arg0) {\n    {exec_out}\n}",
  "func_return": "return {value};",
  "func_call":   "var res_{node_id} = {func_name}({arg0_in});\n{exec_out}",

  // --- CORE: VARIABLES ---
  "set_var": "var {var_name} = {value};\n{exec_out}",
  "get_var": "{var_name}",

  // --- CORE: DATA / PRIMITIVES ---
  "const_int":        "{value}",
  "const_string":     "\"{value}\"",
  "const_bool":       "{value}",
  "string_join_path": "System.IO.Path.Combine({parent}, {child})",

  // --- CORE: TEXT ---
  "console_readline": "Console.ReadLine()",
  "parse_int":        "Convert.ToInt32({text})",
  "format_string_2":  "string.Format({template}, {arg0}, {arg1})",

  // --- CORE: SYSTEM ---
  "sys_import": "using {module_name};\n{exec_out}",

  // --- CORE: COLLECTIONS ---
  "list_create":    "new System.Collections.Generic.List<dynamic>()",
  "make_empty_list":"new System.Collections.Generic.List<dynamic>()",
  "make_list_1":    "new System.Collections.Generic.List<dynamic> { {item_1} }",
  "make_list_2":    "new System.Collections.Generic.List<dynamic> { {item_1}, {item_2} }",
  "make_list_3":    "new System.Collections.Generic.List<dynamic> { {item_1}, {item_2}, {item_3} }",
  "list_append":    "{list}.Add({item});\n{exec_out}",
  "list_length":    "{list}.Count",
  "list_get_index": "{list}[{index}]",
  "list_push_all":  "{target_list}.AddRange({source_list});\n{exec_out}",
  "list_pop":       "var {node_id}_item = {list}[{list}.Count - 1];\n{list}.RemoveAt({list}.Count - 1);\n{exec_out}",
  "dict_create":    "new System.Collections.Generic.Dictionary<dynamic, dynamic>()",
  "dict_set":       "{dict}[{key}] = {value};\n{exec_out}",
  "dict_get":       "{dict}[{key}]",
  "dict_has_key":   "{dict}.ContainsKey({key})",

  // --- APP: GAME MAKER / GENERIC ---
  "spawn_instance": "GameObject new_inst = Instantiate({obj_name}, new Vector3({x}, {y}, 0f), Quaternion.identity);\nnew_inst.layer = LayerMask.NameToLayer({layer_name});\n{exec_out}",
  "auto_depth":     "Vector3 p = transform.position; transform.position = new Vector3(p.x, p.y, p.y);\n{exec_out}",
  "keyboard_check": "Input.GetKey({key})",
  "is_free":        "!Physics2D.OverlapPoint(new Vector2(transform.position.x + ({x_offset}), transform.position.y + ({y_offset})))",
  "change_coord":   "Vector3 pos = transform.position; if(\"{axis}\" == \"x\") pos.x += {amount}; else if(\"{axis}\" == \"y\") pos.y += {amount}; transform.position = pos;\n{exec_out}",

  // ==========================================================================
  // PIPELINE - FILE SYSTEM (C# / Unity)
  // ==========================================================================

  "fs_input_path":  '"{path}"',
  "fs_file_path":   '"{path}"',
  "fs_join_path":   "System.IO.Path.Combine({folder}, {filename})",
  "fs_file_exists": "System.IO.File.Exists({path})",
  "fs_get_filename":"System.IO.Path.GetFileName({path})",

  "fs_walk_folder": `// Walk Folder — C#
foreach (var file_path in System.IO.Directory.GetFiles({folder_path}, "*{extension_filter}", System.IO.SearchOption.AllDirectories)) {
    var file_name = System.IO.Path.GetFileName(file_path);
    var file_ext  = System.IO.Path.GetExtension(file_path);
    {loop_body}
}
{exec_out}`,

  "fs_write_log": `// Write Log File — C#
var _dir_{node_id} = System.IO.Path.GetDirectoryName({file_path});
if (!string.IsNullOrEmpty(_dir_{node_id})) System.IO.Directory.CreateDirectory(_dir_{node_id});
System.IO.File.AppendAllText({file_path}, {message}.ToString() + "\n");
{exec_out}`,

  "fs_batch_rename": `// Batch Rename — C#
foreach (var _fp_{node_id} in System.IO.Directory.GetFiles({folder_path}, "*{extension}")) {
    var _fn_{node_id} = System.IO.Path.GetFileName(_fp_{node_id});
    if (_fn_{node_id}.Contains("{find}")) {
        var _new_{node_id} = System.IO.Path.Combine({folder_path}, _fn_{node_id}.Replace("{find}", "{replace}"));
        System.IO.File.Move(_fp_{node_id}, _new_{node_id});
        Console.WriteLine("Renamed: " + _fn_{node_id});
    }
}
Console.WriteLine("Batch rename complete.");
{exec_out}`,

  // ==========================================================================
  // PIPELINE - COLOURSPACE (C# — raw PNG byte inspection)
  // ==========================================================================

  "cs_read_png_profile": `// Read PNG Colourspace — C# (raw byte inspection)
var profile_name = "Untagged"; var colourspace = "Unknown"; var is_tagged = false;
try {
    var _raw_{node_id} = System.IO.File.ReadAllText({file_path}, System.Text.Encoding.Latin1);
    if (_raw_{node_id}.Contains("sRGB")) { profile_name = "sRGB"; colourspace = "sRGB"; is_tagged = true; }
    else if (_raw_{node_id}.Contains("iCCP")) { profile_name = "ICC Embedded"; colourspace = "ICC Embedded"; is_tagged = true; }
    else if (_raw_{node_id}.Contains("gAMA")) { profile_name = "Gamma"; colourspace = "Gamma"; is_tagged = true; }
} catch (Exception {node_id}_ex) { colourspace = "ERROR"; profile_name = {node_id}_ex.Message; }
{exec_out}`,

  "cs_check_colourspace": `var is_correct = string.Equals({colourspace}, "{expected}", StringComparison.OrdinalIgnoreCase);
var result_message = is_correct ? $"PASS [{colourspace}]" : $"FAIL: expected {expected}, got [{colourspace}]";`,

  "cs_batch_validate": `// Batch Validate — C#
var pass_list = new System.Collections.Generic.List<string>();
var fail_list = new System.Collections.Generic.List<string>();
foreach (var _fp_{node_id} in System.IO.Directory.GetFiles({folder_path}, "*.png", System.IO.SearchOption.AllDirectories)) {
    var _raw_{node_id} = System.IO.File.ReadAllText(_fp_{node_id}, System.Text.Encoding.Latin1);
    var _cs_{node_id}  = _raw_{node_id}.Contains("sRGB") ? "sRGB" : _raw_{node_id}.Contains("iCCP") ? "ICC Embedded" : "Untagged";
    var _fn_{node_id}  = System.IO.Path.GetFileName(_fp_{node_id});
    if (string.Equals(_cs_{node_id}, "{expected}", StringComparison.OrdinalIgnoreCase)) { pass_list.Add(_fp_{node_id}); Console.WriteLine("  PASS: " + _fn_{node_id}); }
    else { fail_list.Add(_fp_{node_id} + " [" + _cs_{node_id} + "]"); Console.WriteLine("  FAIL: " + _fn_{node_id}); }
}
var pass_count = pass_list.Count; var fail_count = fail_list.Count;
{exec_out}`,

  "cs_print_report": `Console.WriteLine("FLOWPINS COLOURSPACE REPORT\nPASSED: " + {pass_list}.Count + "\nFAILED: " + {fail_list}.Count);
{exec_out}`,

};
