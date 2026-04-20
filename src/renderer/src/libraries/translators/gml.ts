// src/renderer/src/libraries/translators/gml.ts

export const GML_TRANSLATIONS: Record<string, any> = {
  // --- CORE: EXECUTION ---
  "start": "// Start Execution\n{exec_out}",
  "end_macro": "exit;",
  "merge_exec": "{exec_out}",
  "sequence": "{then_1}\n{then_2}\n{then_3}",
  "console_print": "show_debug_message(string({message}));\n{exec_out}",
  "try_catch": "try {\n    {try}\n} catch ({node_id}_ex) {\n    var error_msg = {node_id}_ex.message;\n    {catch}\n}",
  "dict_create": "{}",
  "dict_set": "variable_struct_set({dict}, string({key}), {value});\n{exec_out}",
  "dict_get": "variable_struct_get({dict}, string({key}))",
  "dict_has_key": "variable_struct_exists({dict}, string({key}))",
  "spawn_instance": "instance_create_layer({x}, {y}, {layer_name}, {obj_name});\n{exec_out}",
  "auto_depth": "depth = -bbox_bottom;\n{exec_out}",
  // --- CORE: MATH ---
  "add_int": "({a} + {b})",
  "subtract_int": "({a} - {b})",
  "multiply_int": "({a} * {b})",
  "divide_int": "({a} / {b})",
  "compare_int": "({a} {op} {b})",
  "random_int": "irandom_range({min}, {max})",
  "math_modulo": "({a} % {b})",
  "math_power": "power({base}, {exponent})",
  "math_abs": "abs({value})",

  // --- CORE: LOGIC ---
  "if_branch": "if ({condition}) {\n    {true}\n} else {\n    {false}\n}",
  "for_loop": "for (var {node_id}_i = {start}; {node_id}_i < {end}; {node_id}_i++) {\n    {loop_body}\n}\n{exec_out}",
  "while_loop": "while ({condition}) {\n    {loop_body}\n}\n{completed}",
  "foreach_list": "var {node_id}_len = array_length({list});\nfor (var {node_id}_i = 0; {node_id}_i < {node_id}_len; {node_id}_i++) {\n    var {node_id}_item = {list}[{node_id}_i];\n    {loop_body}\n}\n{completed}",
  "compare_strings": "({a} == {b})",
  "check_list_not_empty": "(array_length({list}) > 0)",
  "logic_and": "({a} && {b})",
  "logic_or": "({a} || {b})",

  // --- CORE: VARIABLES ---
  "set_var": "{var_name} = {value};\n{exec_out}",
  "get_var": "{var_name}",

  // --- CORE: DATA / PRIMITIVES ---
  "const_int": "{value}",
  "const_string": "\"{value}\"",
  "const_bool": "{value}",
  "string_join_path": "({parent} + \"\\\\\" + {child})",

  // --- CORE: DATA / INPUT ---
  "console_readline": "get_string(\"\", \"\")",
  "parse_int": "real({text})",
  "format_string_2": "string({template}, {arg0}, {arg1})",

  // 2. Keyboard Inputs (Data Nodes returning booleans)
  "keyboard_check": "keyboard_check({key})",

  // 3. Collision Checks (Data Nodes returning booleans)
  "is_free": "!place_meeting(x + ({x_offset}), y + ({y_offset}), {obj_name})",

  // 4. Movement Execution (Exec Nodes)
  "change_coord": "{axis} += {amount};\n{exec_out}",

  // --- CORE: COLLECTIONS ---
  "list_create": "[]",
  "list_append": "array_push({list}, {item});\n{exec_out}",
  "list_length": "array_length({list})",
  "list_get_index": "{list}[{index}]",
  "make_empty_list": "[]",
  "make_list_1": "[{item_1}]",
  "make_list_2": "[{item_1}, {item_2}]",
  "make_list_3": "[{item_1}, {item_2}, {item_3}]",
  "list_push_all": "array_copy({target_list}, array_length({target_list}), {source_list}, 0, array_length({source_list}));\n{exec_out}",
  "list_pop": "var {node_id}_item = array_pop({list});\n{exec_out}"
};