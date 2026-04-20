// src/renderer/src/libraries/translators/python.ts

export const PYTHON_TRANSLATIONS: Record<string, any> = {
  // --- CORE: EXECUTION ---
  "end_macro": "return",
  "start": "# Start Execution\n{exec_out}",
  "merge_exec": "{exec_out}",
  "sequence": "{then_1}\n{then_2}\n{then_3}",
  "console_print": "print({message})\n{exec_out}",
  "try_catch": "try:\n    {try}\nexcept Exception as {node_id}_ex:\n    error_msg = str({node_id}_ex)\n    {catch}",
  "dict_create": "{}",
  "dict_set": "{dict}[{key}] = {value}\n{exec_out}",
  "dict_get": "{dict}.get({key}, None)",
  "dict_has_key": "({key} in {dict})",
  "spawn_instance": "new_instance = {obj_name}({x}, {y}, layer={layer_name})\n{exec_out}",
  "auto_depth": "self.z = -self.y\n{exec_out}",
  "keyboard_check": "input_sys.is_pressed({key})",
  "is_free": "not physics_sys.check_overlap(self.x + ({x_offset}), self.y + ({y_offset}), {obj_name})",
  "change_coord": "self.{axis} += {amount}\n{exec_out}",
  // --- CORE: MATH ---
  "add_int": "({a} + {b})",
  "subtract_int": "({a} - {b})",
  "multiply_int": "({a} * {b})",
  "divide_int": "({a} / {b})",
  "compare_int": "({a} {op} {b})",
  "random_int": "random.randint({min}, {max})",
  "math_modulo": "({a} % {b})",
  "math_power": "({base} ** {exponent})",
  "math_abs": "abs({value})",

  // --- CORE: FUNCTIONS ---
  "func_def": "def {func_name}(arg0):\n    {exec_out}",
  "func_return": "return {value}",
  "func_call": "res_{node_id} = {func_name}({arg0_in})\n{exec_out}",

  // --- CORE: LOGIC ---
  "if_branch": "if {condition}:\n    {true}\nelse:\n    {false}",
  "for_loop": "for {node_id}_i in range({start}, {end}):\n    {loop_body}\n{exec_out}",
  "while_loop": "while {condition}:\n    {loop_body}\n{completed}",
  "foreach_list": "for {node_id}_item in {list}:\n    {loop_body}\n{completed}",
  "compare_strings": "({a} == {b})",
  "check_list_not_empty": "(len({list}) > 0)",
  "logic_and": "({a} and {b})",
  "logic_or": "({a} or {b})",

  // --- CORE: VARIABLES ---
  "set_var": "{var_name} = {value}\n{exec_out}",
  "get_var": "{var_name}",

  // --- CORE: DATA / PRIMITIVES ---
  "const_int": "{value}",
  "const_string": "\"{value}\"",
  "const_bool": (data: any) => data.props?.value === "true" ? "True" : "False",
  "string_join_path": "os.path.join({parent}, {child})",

   
  "console_readline": "input()",
  "parse_int": "int({text})",
  "format_string_2": "{template}.format({arg0}, {arg1})",

  // --- CORE: SYSTEM ---
  "sys_import": "import {module_name}\n{exec_out}",

  

  // --- CORE: COLLECTIONS ---
  "list_create": "[]",
  "list_append": "{list}.append({item})\n{exec_out}",
  "list_length": "len({list})",
  "list_get_index": "{list}[{index}]",
  "make_empty_list": "[]",
  "make_list_1": "[{item_1}]",
  "make_list_2": "[{item_1}, {item_2}]",
  "make_list_3": "[{item_1}, {item_2}, {item_3}]",
  "list_push_all": "{target_list}.extend({source_list})\n{exec_out}",
  "list_pop": "{node_id}_item = {list}.pop()\n{exec_out}"
};