// src/renderer/src/libraries/translators/python.ts
// ============================================================================
// Standard Python translation dictionary.
// All exec input pins are "exec_in". All exec output pins are "exec_out".
// Tokens must match pin names defined in core_logic.ts exactly.
// ============================================================================

export const PYTHON_TRANSLATIONS: Record<string, any> = {

  // --- CORE: EXECUTION ---
  "start":         "# Start Execution\n{exec_out}",
  "end_macro":     "return",
  "merge_exec":    "{exec_out}",
  "sequence":      "{then_1}\n{then_2}\n{then_3}",
  "console_print": "print({message})\n{exec_out}",
  "try_catch":     "try:\n    {try}\nexcept Exception as {node_id}_ex:\n    error_msg = str({node_id}_ex)\n    {catch}",

  // --- CORE: MATH ---
  "add_int":      "({a} + {b})",
  "subtract_int": "({a} - {b})",
  "multiply_int": "({a} * {b})",
  "divide_int":   "({a} / {b})",
  "compare_int":  "({a} {op} {b})",
  "random_int":   "random.randint({min}, {max})",
  "math_modulo":  "({a} % {b})",
  "math_power":   "({base} ** {exponent})",
  "math_abs":     "abs({value})",

  // --- CORE: LOGIC ---
  "if_branch":          "if {condition}:\n    {true}\nelse:\n    {false}",
  "for_loop":           "for {node_id}_i in range({start}, {end}):\n    {loop_body}\n{exec_out}",
  "while_loop":         "while {condition}:\n    {loop_body}\n{exec_out}",
  "foreach_list":       "for {node_id}_item in {list}:\n    {loop_body}\n{exec_out}",
  "compare_strings":    "({a} == {b})",
  "check_list_not_empty": "(len({list}) > 0)",
  "logic_and":          "({a} and {b})",
  "logic_or":           "({a} or {b})",

  // --- CORE: FUNCTIONS ---
  "func_def":    "def {func_name}(arg0):\n    {exec_out}",
  "func_return": "return {value}",
  "func_call":   "res_{node_id} = {func_name}({arg0_in})\n{exec_out}",

  // --- CORE: VARIABLES ---
  "set_var": "{var_name} = {data_in}\n{exec_out}",
  "get_var": "{var_name}",

  // --- CORE: DATA / PRIMITIVES ---
  "const_int":       "{value}",
  "const_string":    "\"{value}\"",
  "const_bool":      (data: any) => data.props?.value === "true" ? "True" : "False",
  "string_join_path":"os.path.join({parent}, {child})",

  // --- CORE: TEXT ---
  "console_readline": "input()",
  "parse_int":        "int({text})",
  "format_string_2":  "{template}.format({arg0}, {arg1})",

  // --- CORE: SYSTEM ---
  "sys_import": "import {module_name}\n{exec_out}",

  // --- CORE: COLLECTIONS ---
  "list_create":    "[]",
  "make_empty_list":"[]",
  "make_list_1":    "[{item_1}]",
  "make_list_2":    "[{item_1}, {item_2}]",
  "make_list_3":    "[{item_1}, {item_2}, {item_3}]",
  "list_append":    "{list}.append({item})\n{exec_out}",
  "list_length":    "len({list})",
  "list_get_index": "{list}[{index}]",
  "list_push_all":  "{target_list}.extend({source_list})\n{exec_out}",
  "list_pop":       "{node_id}_item = {list}.pop()\n{exec_out}",
  "dict_create":    "{}",
  "dict_set":       "{dict}[{key}] = {value}\n{exec_out}",
  "dict_get":       "{dict}.get({key}, None)",
  "dict_has_key":   "({key} in {dict})",

  // --- APP: GAME MAKER / GENERIC ---
  "spawn_instance": "new_instance = {obj_name}({x}, {y}, layer={layer_name})\n{exec_out}",
  "auto_depth":     "self.z = -self.y\n{exec_out}",
  "keyboard_check": "input_sys.is_pressed({key})",
  "is_free":        "not physics_sys.check_overlap(self.x + ({x_offset}), self.y + ({y_offset}), {obj_name})",
  "change_coord":   "self.{axis} += {amount}\n{exec_out}",

  // ==========================================================================
  // PIPELINE TRANSLATIONS - File System
  // ==========================================================================

  "fs_input_path":  '"{path}"',
  "fs_file_path":   '"{path}"',
  "fs_join_path":   "os.path.join({folder}, {filename})",
  "fs_file_exists": "os.path.exists({path})",

  "fs_get_filename": `(lambda p: (os.path.basename(p), os.path.splitext(os.path.basename(p))[0], os.path.splitext(p)[1]))({path})`,

  "fs_walk_folder": `import os
_ext_filter_{node_id} = "{extension_filter}"
for _root_{node_id}, _dirs_{node_id}, _files_{node_id} in os.walk({folder_path}):
    for _file_{node_id} in sorted(_files_{node_id}):
        if _file_{node_id}.lower().endswith(_ext_filter_{node_id}.lower()):
            file_path = os.path.join(_root_{node_id}, _file_{node_id})
            file_name = _file_{node_id}
            file_ext  = os.path.splitext(_file_{node_id})[1]
            {loop_body}
{exec_out}`,

  "fs_write_log": `import os as _os_{node_id}
_log_path_{node_id} = {file_path}
_os_{node_id}.makedirs(_os_{node_id}.path.dirname(_log_path_{node_id}), exist_ok=True)
with open(_log_path_{node_id}, "a", encoding="utf-8") as _lf_{node_id}:
    _lf_{node_id}.write(str({message}) + "\\n")
{exec_out}`,

  "fs_batch_rename": `import os as _os_{node_id}
_folder_{node_id}  = {folder_path}
_find_{node_id}    = "{find}"
_replace_{node_id} = "{replace}"
_ext_{node_id}     = "{extension}"
_renamed_{node_id} = 0
for _fname_{node_id} in sorted(_os_{node_id}.listdir(_folder_{node_id})):
    if _fname_{node_id}.lower().endswith(_ext_{node_id}.lower()) and _find_{node_id} in _fname_{node_id}:
        _old_{node_id} = _os_{node_id}.path.join(_folder_{node_id}, _fname_{node_id})
        _new_{node_id} = _os_{node_id}.path.join(_folder_{node_id}, _fname_{node_id}.replace(_find_{node_id}, _replace_{node_id}))
        _os_{node_id}.rename(_old_{node_id}, _new_{node_id})
        print(f"  Renamed: {_fname_{node_id}} -> {_os_{node_id}.path.basename(_new_{node_id})}")
        _renamed_{node_id} += 1
print(f"Batch Rename complete: {_renamed_{node_id}} files renamed.")
{exec_out}`,

  // ==========================================================================
  // PIPELINE TRANSLATIONS - Colourspace
  // ==========================================================================

  "cs_read_png_profile": `from PIL import Image, ImageCms
import io as _io_{node_id}, os as _os_{node_id}
_cs_file_{node_id} = {file_path}
profile_name = "Untagged"
colourspace  = "Unknown"
is_tagged    = False
try:
    with Image.open(_cs_file_{node_id}) as _img_{node_id}:
        _info_{node_id} = _img_{node_id}.info
        if "icc_profile" in _info_{node_id}:
            try:
                _icc_{node_id}  = ImageCms.ImageCmsProfile(_io_{node_id}.BytesIO(_info_{node_id}["icc_profile"]))
                _desc_{node_id} = ImageCms.getProfileDescription(_icc_{node_id}).strip()
                _dl_{node_id}   = _desc_{node_id}.lower()
                colourspace  = "sRGB" if "srgb" in _dl_{node_id} else "Linear" if "linear" in _dl_{node_id} else "ACES" if "aces" in _dl_{node_id} else "P3" if "p3" in _dl_{node_id} else _desc_{node_id}
                profile_name = _desc_{node_id}
                is_tagged    = True
            except: profile_name = "ICC (unreadable)"; colourspace = "ICC Embedded"; is_tagged = True
        elif "srgb" in _info_{node_id}:
            profile_name = "sRGB (chunk)"; colourspace = "sRGB"; is_tagged = True
        elif "gamma" in _info_{node_id}:
            _g_{node_id} = _info_{node_id}["gamma"]
            colourspace  = "Linear" if abs(_g_{node_id} - 1.0) < 0.01 else f"Gamma {_g_{node_id}:.4f}"
            profile_name = colourspace; is_tagged = True
        else:
            profile_name = "Untagged"; colourspace = "Unknown"; is_tagged = False
except Exception as _e_{node_id}:
    print(f"FlowPins CS Error: {_e_{node_id}}")
    profile_name = f"ERROR: {_e_{node_id}}"; colourspace = "ERROR"; is_tagged = False
{exec_out}`,

  "cs_check_colourspace": `_expected_{node_id}  = "{expected}"
is_correct_{node_id} = ({colourspace}.lower() == _expected_{node_id}.lower())
is_correct       = is_correct_{node_id}
result_message   = f"PASS [{colourspace}]" if is_correct else f"FAIL: expected {_expected_{node_id}}, got [{colourspace}]"`,

  "cs_batch_validate": `from PIL import Image, ImageCms
import os as _os_{node_id}, io as _io_{node_id}
_folder_{node_id}   = {folder_path}
_expected_{node_id} = "{expected}"
pass_list = []
fail_list = []
def _get_cs_{node_id}(fp):
    try:
        with Image.open(fp) as img:
            info = img.info
            if "icc_profile" in info:
                try:
                    d = ImageCms.getProfileDescription(ImageCms.ImageCmsProfile(_io_{node_id}.BytesIO(info["icc_profile"]))).strip().lower()
                    return "sRGB" if "srgb" in d else "Linear" if "linear" in d else "ACES" if "aces" in d else d
                except: return "ICC Embedded"
            elif "srgb" in info: return "sRGB"
            elif "gamma" in info:
                g = info["gamma"]
                return "Linear" if abs(g-1.0)<0.01 else f"Gamma {g:.2f}"
            else: return "Untagged"
    except Exception as e: return f"ERROR: {e}"
print(f"\\nFlowPins Colourspace Validator — {_folder_{node_id}}")
print(f"Expected: {_expected_{node_id}}\\n" + "-"*50)
for _r_{node_id}, _d_{node_id}, _f_{node_id} in _os_{node_id}.walk(_folder_{node_id}):
    for _fn_{node_id} in sorted(_f_{node_id}):
        if _fn_{node_id}.lower().endswith(".png"):
            _fp_{node_id} = _os_{node_id}.path.join(_r_{node_id}, _fn_{node_id})
            _cs_{node_id} = _get_cs_{node_id}(_fp_{node_id})
            if _cs_{node_id}.lower() == _expected_{node_id}.lower():
                pass_list.append(_fp_{node_id})
                print(f"  PASS: {_fn_{node_id}} [{_cs_{node_id}}]")
            else:
                fail_list.append(f"{_fp_{node_id}} [{_cs_{node_id}}]")
                print(f"  FAIL: {_fn_{node_id}} — got [{_cs_{node_id}}]")
pass_count = len(pass_list)
fail_count = len(fail_list)
{exec_out}`,

  "cs_print_report": `import os as _os_{node_id}
from datetime import datetime as _dt_{node_id}
_pl_{node_id}   = {pass_list}
_fl_{node_id}   = {fail_list}
_fld_{node_id}  = {folder_path}
_save_{node_id} = "{save_report}" == "true"
_ts_{node_id}   = _dt_{node_id}.now().strftime("%Y-%m-%d %H:%M:%S")
_lines_{node_id} = [
    "=" * 60,
    "FLOWPINS COLOURSPACE VALIDATION REPORT",
    f"Generated : {_ts_{node_id}}",
    f"Folder    : {_fld_{node_id}}",
    f"PASSED    : {len(_pl_{node_id})}",
    f"FAILED    : {len(_fl_{node_id})}",
    "=" * 60
]
if _fl_{node_id}:
    _lines_{node_id}.append("\\nFAILED FILES:")
    for _f_{node_id} in _fl_{node_id}: _lines_{node_id}.append(f"  FAIL: {_f_{node_id}}")
if _pl_{node_id}:
    _lines_{node_id}.append("\\nPASSED FILES:")
    for _p_{node_id} in _pl_{node_id}: _lines_{node_id}.append(f"  PASS: {_os_{node_id}.path.basename(_p_{node_id})}")
_lines_{node_id}.append("=" * 60)
_report_{node_id} = "\\n".join(_lines_{node_id})
print(_report_{node_id})
if _save_{node_id} and _os_{node_id}.path.isdir(_fld_{node_id}):
    _rname_{node_id} = f"colourspace_report_{_dt_{node_id}.now().strftime('%Y%m%d_%H%M%S')}.txt"
    _rpath_{node_id} = _os_{node_id}.path.join(_fld_{node_id}, _rname_{node_id})
    with open(_rpath_{node_id}, "w", encoding="utf-8") as _rf_{node_id}: _rf_{node_id}.write(_report_{node_id})
    print(f"Report saved: {_rpath_{node_id}}")
{exec_out}`,

};
