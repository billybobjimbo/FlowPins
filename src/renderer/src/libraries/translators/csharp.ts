// src/renderer/src/libraries/translators/csharp.ts

export const CSHARP_TRANSLATIONS: Record<string, any> = {
  // --- CORE: EXECUTION ---
  "start": "// Start Execution\n{exec_out}",
  "end_macro": "return;",
  "merge_exec": "{exec_out}",
  "sequence": "{then_1}\n{then_2}\n{then_3}",
  "console_print": "Console.WriteLine({message});\n{exec_out}",
  "try_catch": "try {\n    {try}\n} catch (Exception {node_id}_ex) {\n    string error_msg = {node_id}_ex.Message;\n    {catch}\n}",
  "dict_create": "new System.Collections.Generic.Dictionary<dynamic, dynamic>()",
  "dict_set": "{dict}[{key}] = {value};\n{exec_out}",
  "dict_get": "{dict}[{key}]",
  "dict_has_key": "{dict}.ContainsKey({key})",
  "spawn_instance": "GameObject new_inst = Instantiate({obj_name}, new Vector3({x}, {y}, 0f), Quaternion.identity);\nnew_inst.layer = LayerMask.NameToLayer({layer_name});\n{exec_out}",
  "auto_depth": "Vector3 p = transform.position; transform.position = new Vector3(p.x, p.y, p.y);\n{exec_out}",
  "keyboard_check": "Input.GetKey({key})", 
  "is_free": "!Physics2D.OverlapPoint(new Vector2(transform.position.x + ({x_offset}), transform.position.y + ({y_offset})))",
  "change_coord": "Vector3 pos = transform.position; if(\"{axis}\" == \"x\") pos.x += {amount}; else if(\"{axis}\" == \"y\") pos.y += {amount}; transform.position = pos;\n{exec_out}",
  // --- CORE: MATH ---
  "add_int": "({a} + {b})",
  "subtract_int": "({a} - {b})",
  "multiply_int": "({a} * {b})",
  "divide_int": "({a} / {b})",
  "compare_int": "({a} {op} {b})",
  "random_int": "UnityEngine.Random.Range({min}, {max})",
  "math_modulo": "({a} % {b})",
  "math_power": "Math.Pow({base}, {exponent})",
  "math_abs": "Math.Abs({value})",
  

  // --- CORE: LOGIC ---
  "if_branch": "if ({condition}) {\n    {true}\n} else {\n    {false}\n}",
  "for_loop": "for (int {node_id}_i = {start}; {node_id}_i < {end}; {node_id}_i++) {\n    {loop_body}\n}\n{exec_out}",
  "while_loop": "while ({condition}) {\n    {loop_body}\n}\n{completed}",
  "foreach_list": "foreach (var {node_id}_item in {list}) {\n    {loop_body}\n}\n{completed}",
  "compare_strings": "({a} == {b})",
  "check_list_not_empty": "({list}.Count > 0)",
  "console_readline": "Console.ReadLine()",
  "parse_int": "Convert.ToInt32({text})",
  "format_string_2": "string.Format({template}, {arg0}, {arg1})",
  "logic_and": "({a} && {b})",
  "logic_or": "({a} || {b})",

  // --- CORE: VARIABLES ---
  "set_var": "var {var_name} = {value};\n{exec_out}",
  "get_var": "{var_name}",

  // --- CORE: DATA / PRIMITIVES ---
  "const_int": "{value}",
  "const_string": "\"{value}\"",
  "const_bool": "{value}",
  "string_join_path": "System.IO.Path.Combine({parent}, {child})",

  // --- CORE: SYSTEM ---
  "sys_import": "using {module_name};\n{exec_out}",

  // --- CORE: COLLECTIONS ---
  "list_create": "new System.Collections.Generic.List<dynamic>()",
  "make_empty_list": "new System.Collections.Generic.List<dynamic>()",
  "make_list_1": "new System.Collections.Generic.List<dynamic> { {item_1} }",
  "make_list_2": "new System.Collections.Generic.List<dynamic> { {item_1}, {item_2} }",
  "make_list_3": "new System.Collections.Generic.List<dynamic> { {item_1}, {item_2}, {item_3} }",
  "list_push_all": "{target_list}.AddRange({source_list});\n{exec_out}",
  "list_pop": "var {node_id}_item = {list}[{list}.Count - 1];\n{list}.RemoveAt({list}.Count - 1);\n{exec_out}",
  "list_append": "{list}.Add({item});\n{exec_out}",
  "list_length": "{list}.Count",
  "list_get_index": "{list}[{index}]",
};