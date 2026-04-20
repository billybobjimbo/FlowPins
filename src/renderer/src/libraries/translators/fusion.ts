// src/renderer/src/libraries/translators/fusion.ts

export const FUSION_TRANSLATIONS: Record<string, any> = {
  // --- CORE: EXECUTION ---

  "start": "-- Start Execution\n{exec_out}",
  "end_macro": "return",
  "merge_exec": "{exec_out}",
  "sequence": "{then_1}\n{then_2}\n{then_3}",
  "console_print": "print({message})\n{exec_out}",
  "try_catch": "local {node_id}_status, {node_id}_err = pcall(function()\n    {try}\nend)\nif not {node_id}_status then\n    local error_msg = tostring({node_id}_err)\n    {catch}\nend",
  "dict_create": "{}",
  "dict_set": "{dict}[{key}] = {value}\n{exec_out}",
  "dict_get": "{dict}[{key}]",
  "dict_has_key": "({dict}[{key}] ~= nil)",
  "spawn_instance": "local new_node = comp:AddTool({obj_name})\ncomp:SetPos(new_node, {x}, {y})\n{exec_out}",
  "auto_depth": "tool.ZOffset[comp.CurrentTime] = -tool.Center[comp.CurrentTime].Y\n{exec_out}",
  "keyboard_check": "false -- No realtime input in Fusion",
  "is_free": "true -- No collision in Fusion",
  "change_coord": "local p = tool.Center[comp.CurrentTime]; if '{axis}' == 'x' then p.X = p.X + {amount} else p.Y = p.Y + {amount} end; tool.Center[comp.CurrentTime] = p\n{exec_out}",

  // --- CORE: MATH ---
  "add_int": "({a} + {b})",
  "subtract_int": "({a} - {b})",
  "multiply_int": "({a} * {b})",
  "divide_int": "({a} / {b})",
  "compare_int": "({a} {op} {b})",
  "random_int": "math.random({min}, {max})",
  "math_modulo": "({a} % {b})",
  "math_power": "({base} ^ {exponent})",
  "math_abs": "math.abs({value})",

  // --- CORE: LOGIC ---
  "if_branch": "if {condition} then\n    {true}\nelse\n    {false}\nend",
  "for_loop": "for {node_id}_i = {start}, {end} - 1 do\n    {loop_body}\nend\n{exec_out}",
  "while_loop": "while {condition} do\n    {loop_body}\nend\n{completed}",
  "foreach_list": "for _, {node_id}_item in ipairs({list}) do\n    {loop_body}\nend\n{completed}",
  "compare_strings": "({a} == {b})",
  "check_list_not_empty": "(#({list}) > 0)",
  "logic_and": "({a} and {b})",
  "logic_or": "({a} or {b})",

  // --- CORE: VARIABLES ---
  "set_var": "{var_name} = {value}\n{exec_out}",
  "get_var": "{var_name}",

  // --- CORE: DATA / PRIMITIVES ---
  "const_int": "{value}",
  "const_string": "\"{value}\"",
  "const_bool": "{value}",
  "string_join_path": "({parent} .. \"/\" .. {child})",

  
  "console_readline": "io.read()",
  "parse_int": "tonumber({text})",
  "format_string_2": "string.format({template}, {arg0}, {arg1})",

  // --- CORE: COLLECTIONS ---
  "list_create": "{}",
  "make_empty_list": "{}",
  "make_list_1": "{{item_1}}",
  "make_list_2": "{{item_1}, {item_2}}",
  "make_list_3": "{{item_1}, {item_2}, {item_3}}",
  "list_push_all": "for i=1, #({source_list}) do table.insert({target_list}, {source_list}[i]) end\n{exec_out}",
  "list_pop": "local {node_id}_item = table.remove({list})\n{exec_out}"
};