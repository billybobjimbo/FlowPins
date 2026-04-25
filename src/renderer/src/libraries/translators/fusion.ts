// src/renderer/src/libraries/translators/fusion.ts
// ============================================================================
// FLOWPINS: BLACKMAGIC FUSION TRANSLATION DICTIONARY
// Target: Fusion Lua scripting API
//
// Notes:
//   - File I/O uses LuaFileSystem (lfs) with bmd.readdir() fallback
//   - Colourspace: raw PNG byte inspection via io.read()
//   - List indexing is 1-based (Lua convention)
// ============================================================================
export const FUSION_TRANSLATIONS: Record<string, any> = {

  // --- CORE: EXECUTION ---
  "start":         "-- Start Execution\n{exec_out}",
  "end_macro":     "return",
  "merge_exec":    "{exec_out}",
  "sequence":      "{then_1}\n{then_2}\n{then_3}",
  "console_print": "print({message})\n{exec_out}",
  "try_catch":     "local {node_id}_status, {node_id}_err = pcall(function()\n    {try}\nend)\nif not {node_id}_status then\n    local error_msg = tostring({node_id}_err)\n    {catch}\nend",

  // --- CORE: MATH ---
  "add_int":      "({a} + {b})",
  "subtract_int": "({a} - {b})",
  "multiply_int": "({a} * {b})",
  "divide_int":   "({a} / {b})",
  "compare_int":  "({a} {op} {b})",
  "random_int":   "math.random({min}, {max})",
  "math_modulo":  "({a} % {b})",
  "math_power":   "({base} ^ {exponent})",
  "math_abs":     "math.abs({value})",

  // --- CORE: LOGIC ---
  "if_branch":            "if {condition} then\n    {true}\nelse\n    {false}\nend",
  "for_loop":             "for {node_id}_i = {start}, {end} - 1 do\n    {loop_body}\nend\n{exec_out}",
  "while_loop":           "while {condition} do\n    {loop_body}\nend\n{exec_out}",
  "foreach_list":         "for _, {node_id}_item in ipairs({list}) do\n    {loop_body}\nend\n{exec_out}",
  "compare_strings":      "({a} == {b})",
  "check_list_not_empty": "(#({list}) > 0)",
  "logic_and":            "({a} and {b})",
  "logic_or":             "({a} or {b})",

  // --- CORE: FUNCTIONS ---
  "func_def":    "local function {func_name}(arg0)\n    {exec_out}\nend",
  "func_return": "return {value}",
  "func_call":   "local res_{node_id} = {func_name}({arg0_in})\n{exec_out}",

  // --- CORE: VARIABLES ---
  "set_var": "{var_name} = {value}\n{exec_out}",
  "get_var": "{var_name}",

  // --- CORE: DATA / PRIMITIVES ---
  "const_int":        "{value}",
  "const_string":     "\"{value}\"",
  "const_bool":       "{value}",
  "string_join_path": "({parent} .. \"/\" .. {child})",

  // --- CORE: TEXT ---
  "console_readline": "io.read()",
  "parse_int":        "tonumber({text})",
  "format_string_2":  "string.format({template}, {arg0}, {arg1})",

  // --- CORE: COLLECTIONS ---
  "list_create":    "{}",
  "make_empty_list":"{}",
  "make_list_1":    "{{item_1}}",
  "make_list_2":    "{{item_1}, {item_2}}",
  "make_list_3":    "{{item_1}, {item_2}, {item_3}}",
  "list_append":    "table.insert({list}, {item})\n{exec_out}",
  "list_length":    "#({list})",
  "list_get_index": "{list}[{index} + 1]",  // Lua is 1-indexed
  "list_push_all":  "for i=1, #({source_list}) do table.insert({target_list}, {source_list}[i]) end\n{exec_out}",
  "list_pop":       "local {node_id}_item = table.remove({list})\n{exec_out}",
  "dict_create":    "{}",
  "dict_set":       "{dict}[{key}] = {value}\n{exec_out}",
  "dict_get":       "{dict}[{key}]",
  "dict_has_key":   "({dict}[{key}] ~= nil)",

  // --- APP: GAME MAKER / GENERIC ---
  "spawn_instance": "local new_node = comp:AddTool({obj_name})\ncomp:SetPos(new_node, {x}, {y})\n{exec_out}",
  "auto_depth":     "tool.ZOffset[comp.CurrentTime] = -tool.Center[comp.CurrentTime].Y\n{exec_out}",
  "keyboard_check": "false -- No realtime input in Fusion",
  "is_free":        "true -- No collision in Fusion",
  "change_coord":   "local p = tool.Center[comp.CurrentTime]; if '{axis}' == 'x' then p.X = p.X + {amount} else p.Y = p.Y + {amount} end; tool.Center[comp.CurrentTime] = p\n{exec_out}",

  // ==========================================================================
  // PIPELINE - FILE SYSTEM (Fusion/Lua)
  // ==========================================================================

  "fs_input_path":  '"{path}"',
  "fs_file_path":   '"{path}"',
  "fs_join_path":   '({folder} .. "/" .. {filename})',
  "fs_file_exists": `(function(p) local f=io.open(p,"r"); if f then f:close() return true end return false end)({path})`,
  "fs_get_filename":`(function(p) return p:match("([^/\\]+)$") or p end)({path})`,

  "fs_walk_folder": `-- Walk Folder — Fusion/Lua
local _ok_{node_id}, _lfs_{node_id} = pcall(require, "lfs")
if _ok_{node_id} then
    for file_name in _lfs_{node_id}.dir({folder_path}) do
        if file_name ~= "." and file_name ~= ".." then
            local file_ext = file_name:match("(%.[^%.]+)$") or ""
            if file_ext:lower() == string.lower("{extension_filter}") then
                local file_path = {folder_path} .. "/" .. file_name
                {loop_body}
            end
        end
    end
else
    local _files_{node_id} = bmd.readdir({folder_path} .. "/*{extension_filter}")
    if _files_{node_id} then
        for _, _f_{node_id} in ipairs(_files_{node_id}) do
            local file_name = _f_{node_id}.Name
            local file_path = {folder_path} .. "/" .. file_name
            local file_ext  = "{extension_filter}"
            {loop_body}
        end
    end
end
{exec_out}`,

  "fs_write_log": `-- Write Log File — Fusion/Lua
local _lf_{node_id} = io.open({file_path}, "a")
if _lf_{node_id} then _lf_{node_id}:write(tostring({message}) .. "\n"); _lf_{node_id}:close() end
{exec_out}`,

  "fs_batch_rename": `-- Batch Rename — Fusion/Lua
local _ok_{node_id}, _lfs_{node_id} = pcall(require, "lfs")
if _ok_{node_id} then
    for _fn_{node_id} in _lfs_{node_id}.dir({folder_path}) do
        if _fn_{node_id}:lower():find("{extension}$") and _fn_{node_id}:find("{find}") then
            local _new_{node_id} = _fn_{node_id}:gsub("{find}", "{replace}", 1)
            os.rename({folder_path}.."/".._fn_{node_id}, {folder_path}.."/".._new_{node_id})
            print("Renamed: ".._fn_{node_id}.." -> ".._new_{node_id})
        end
    end
end
print("Batch rename complete.")
{exec_out}`,

  // ==========================================================================
  // PIPELINE - COLOURSPACE (Fusion/Lua — raw byte inspection)
  // ==========================================================================

  "cs_read_png_profile": `-- Read PNG Colourspace — Fusion/Lua
local profile_name = "Untagged"; local colourspace = "Unknown"; local is_tagged = false
local _f_{node_id} = io.open({file_path}, "rb")
if _f_{node_id} then
    local _d_{node_id} = _f_{node_id}:read(2048); _f_{node_id}:close()
    if _d_{node_id}:find("sRGB") then profile_name="sRGB"; colourspace="sRGB"; is_tagged=true
    elseif _d_{node_id}:find("iCCP") then profile_name="ICC Embedded"; colourspace="ICC Embedded"; is_tagged=true
    elseif _d_{node_id}:find("gAMA") then profile_name="Gamma"; colourspace="Gamma"; is_tagged=true end
end
{exec_out}`,

  "cs_check_colourspace": `local is_correct = (colourspace:lower() == "{expected}":lower())
local result_message = is_correct and ("PASS ["..colourspace.."]") or ("FAIL: expected {expected}, got ["..colourspace.."]")`,

  "cs_batch_validate": `-- Batch Validate — Fusion/Lua
local pass_list = {}; local fail_list = {}
local _ok_{node_id}, _lfs_{node_id} = pcall(require, "lfs")
if _ok_{node_id} then
    for _fn_{node_id} in _lfs_{node_id}.dir({folder_path}) do
        if _fn_{node_id}:lower():find("%.png$") then
            local _fp_{node_id} = {folder_path}.."/" .._fn_{node_id}
            local _f_{node_id}  = io.open(_fp_{node_id},"rb")
            local _cs_{node_id} = "Untagged"
            if _f_{node_id} then
                local _d_{node_id} = _f_{node_id}:read(2048); _f_{node_id}:close()
                if _d_{node_id}:find("sRGB") then _cs_{node_id}="sRGB"
                elseif _d_{node_id}:find("iCCP") then _cs_{node_id}="ICC Embedded" end
            end
            if _cs_{node_id}:lower() == "{expected}":lower() then
                table.insert(pass_list, _fp_{node_id}); print("  PASS: ".._fn_{node_id})
            else
                table.insert(fail_list, _fp_{node_id}); print("  FAIL: ".._fn_{node_id})
            end
        end
    end
end
local pass_count = #pass_list; local fail_count = #fail_list
{exec_out}`,

  "cs_print_report": `print("FLOWPINS COLOURSPACE REPORT\nPASSED: "..tostring(#{{{pass_list}}}).."\nFAILED: "..tostring(#{{{fail_list}}}))
{exec_out}`,

};
