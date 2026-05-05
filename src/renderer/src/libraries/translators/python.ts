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
# Guard — stop if cancelled or no folder
if cancelled or not {folder_path}:
    import sys
    if cancelled: print("FlowPins: Cancelled — skipping colourspace check.")
    else: print("FlowPins ERROR: No folder path provided.")
    sys.exit(0)
_folder_{node_id}   = {folder_path}
_expected_{node_id} = {expected_cs} if {expected_cs} else "{expected}"
_ext_{node_id}      = {extension} if {extension} else "{extension}"

# Supported formats and their detection methods
_SUPPORTED_{node_id} = [".png", ".tif", ".tiff", ".tga", ".jpg", ".jpeg", ".exr", ".dpx"]

def _get_cs_{node_id}(fp):
    _fext_{node_id} = _os_{node_id}.path.splitext(fp)[1].lower()
    try:
        # EXR — use metadata attributes
        if _fext_{node_id} == ".exr":
            try:
                import OpenEXR, Imath
                _exr_{node_id} = OpenEXR.InputFile(fp)
                _hdr_{node_id} = _exr_{node_id}.header()
                _chr_{node_id} = str(_hdr_{node_id}.get("chromaticities", "")).lower()
                if "aces" in _chr_{node_id}: return "ACES"
                if "709" in _chr_{node_id}: return "Rec.709"
                if "2020" in _chr_{node_id}: return "Rec.2020"
                return "Linear EXR"
            except ImportError:
                # OpenEXR not installed — use PIL fallback
                pass
        # PNG, TIFF, TGA, JPG — use ICC profile
        with Image.open(fp) as _img_{node_id}:
            _info_{node_id} = _img_{node_id}.info
            # Check ICC profile
            if "icc_profile" in _info_{node_id}:
                try:
                    _desc_{node_id} = ImageCms.getProfileDescription(
                        ImageCms.ImageCmsProfile(
                            _io_{node_id}.BytesIO(_info_{node_id}["icc_profile"])
                        )
                    ).strip().lower()
                    if "srgb" in _desc_{node_id} or "sRGB" in _desc_{node_id}:     return "sRGB"
                    if "rec. 709" in _desc_{node_id} or "709" in _desc_{node_id}:  return "Rec.709"
                    if "rec. 2020" in _desc_{node_id} or "2020" in _desc_{node_id}:return "Rec.2020"
                    if "p3" in _desc_{node_id}:                                     return "DCI-P3"
                    if "aces" in _desc_{node_id}:                                   return "ACES"
                    if "linear" in _desc_{node_id}:                                 return "Linear"
                    return "ICC: " + _desc_{node_id}[:30]
                except:
                    return "ICC Embedded (unreadable)"
            # PNG sRGB chunk
            if "srgb" in _info_{node_id}:
                return "sRGB"
            # Gamma tag
            if "gamma" in _info_{node_id}:
                _g_{node_id} = _info_{node_id}["gamma"]
                if abs(_g_{node_id} - 1.0) < 0.01:  return "Linear"
                if abs(_g_{node_id} - 0.4545) < 0.01: return "sRGB (gamma)"
                return "Gamma " + str(round(_g_{node_id}, 3))
            # No colourspace metadata found
            return "Untagged"
    except Exception as _e_{node_id}:
        return "ERROR: " + str(_e_{node_id})

pass_list = []
fail_list = []
print("")
print("FlowPins Colourspace Validator — " + _folder_{node_id})
print("Expected : " + _expected_{node_id})
print("Extension: " + _ext_{node_id})
print("-" * 55)

if not _os_{node_id}.path.isdir(_folder_{node_id}):
    print("ERROR: Folder not found — " + _folder_{node_id})
else:
    for _r_{node_id}, _d_{node_id}, _f_{node_id} in _os_{node_id}.walk(_folder_{node_id}):
        for _fn_{node_id} in sorted(_f_{node_id}):
            _fext2_{node_id} = _os_{node_id}.path.splitext(_fn_{node_id})[1].lower()
            # Match requested extension OR scan all supported formats if extension is blank
            _match_{node_id} = (
                _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()) if _ext_{node_id}
                else _fext2_{node_id} in _SUPPORTED_{node_id}
            )
            if _match_{node_id}:
                _fp_{node_id} = _os_{node_id}.path.join(_r_{node_id}, _fn_{node_id})
                _cs_{node_id} = _get_cs_{node_id}(_fp_{node_id})
                if _cs_{node_id}.lower() == _expected_{node_id}.lower():
                    pass_list.append(_fp_{node_id})
                    print("  PASS: " + _fn_{node_id} + " [" + _cs_{node_id} + "]")
                else:
                    fail_list.append(_fp_{node_id} + " [" + _cs_{node_id} + "]")
                    print("  FAIL: " + _fn_{node_id} + " — got [" + _cs_{node_id} + "]")

pass_count = len(pass_list)
fail_count = len(fail_list)
print("")
print("Result: " + str(pass_count) + " passed, " + str(fail_count) + " failed.")
{exec_out}`,

  "cs_print_report": `import os as _os_{node_id}
from datetime import datetime as _dt_{node_id}
_pl_{node_id}   = {pass_list} if {pass_list} else []
_fl_{node_id}   = {fail_list} if {fail_list} else []
_fld_{node_id}  = {folder_path}
_save_{node_id} = "{save_report}" == "true"
_ts_{node_id}   = _dt_{node_id}.now().strftime("%Y-%m-%d %H:%M:%S")
_lines_{node_id} = [
    "=" * 60,
    "FLOWPINS " + "{report_title}".upper(),
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
    _rname_{node_id} = f"validation_report_{_dt_{node_id}.now().strftime('%Y%m%d_%H%M%S')}.txt"
    _rpath_{node_id} = _os_{node_id}.path.join(_fld_{node_id}, _rname_{node_id})
    with open(_rpath_{node_id}, "w", encoding="utf-8") as _rf_{node_id}: _rf_{node_id}.write(_report_{node_id})
    print(f"Report saved: {_rpath_{node_id}}")
{exec_out}`,

  // ==========================================================================
  // PIPELINE SUITE — TOOL 1: QUICK FRAME CHECK
  // ==========================================================================

  "fs_frame_sequence_check": `# Frame Sequence Check
# Scans a folder for an image sequence and reports missing frames
import os, re

_folder_{node_id}    = {folder_path}
_start_{node_id}     = int({start_frame})
_end_{node_id}       = int({end_frame})
_ext_{node_id}       = {extension}
_pad_{node_id}       = int({padding})
_prefix_{node_id}    = "{prefix}"
_naming_{node_id}    = {naming_pattern}
_cs_{node_id}        = {colourspace}

print("FlowPins Frame Check — " + str(_folder_{node_id}))
print("  Folder   : " + str(_folder_{node_id}))
print("  Extension: " + _ext_{node_id})
print("  Expected : " + str(_end_{node_id} - _start_{node_id} + 1) +
      " frames (" + str(_start_{node_id}) + "-" + str(_end_{node_id}) + ")")
if _naming_{node_id}: print("  Pattern  : " + _naming_{node_id})
if _cs_{node_id}:     print("  Colourspace: " + _cs_{node_id})
print("-" * 55)

# Build set of expected filenames
_expected_{node_id} = set()
for _f_{node_id} in range(_start_{node_id}, _end_{node_id} + 1):
    _fname_{node_id} = _prefix_{node_id} + str(_f_{node_id}).zfill(_pad_{node_id}) + _ext_{node_id}
    _expected_{node_id}.add(_fname_{node_id})

# Build set of found filenames matching extension
_found_files_{node_id} = set()
if os.path.isdir(_folder_{node_id}):
    for _fn_{node_id} in os.listdir(_folder_{node_id}):
        if _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()):
            _found_files_{node_id}.add(_fn_{node_id})

# Find missing frames
_missing_names_{node_id} = sorted(_expected_{node_id} - _found_files_{node_id})
missing_frames = []
for _mn_{node_id} in _missing_names_{node_id}:
    _base_{node_id} = _mn_{node_id}.replace(_prefix_{node_id}, "").replace(_ext_{node_id}, "")
    try:
        missing_frames.append(int(_base_{node_id}))
    except:
        missing_frames.append(_mn_{node_id})

found_count   = len(_found_files_{node_id})
missing_count = len(missing_frames)
is_complete   = missing_count == 0

# Naming convention check
naming_fails = []
if _naming_{node_id}:
    _regex_{node_id} = _naming_{node_id}.replace(".", "\.").replace("*", ".*")
    _digit_{node_id} = chr(92) + "d"
    _regex_{node_id} = re.sub("#+", lambda m: _digit_{node_id} + "{" + str(len(m.group())) + "}", _regex_{node_id})
    _regex_{node_id} = re.sub("@+", lambda m: "[a-zA-Z]{" + str(len(m.group())) + "}", _regex_{node_id})
    _regex_{node_id} = "^" + _regex_{node_id} + "$"
    for _fn_{node_id} in sorted(_found_files_{node_id}):
        _stem_{node_id} = os.path.splitext(_fn_{node_id})[0]
        if not re.match(_regex_{node_id}, _stem_{node_id}):
            naming_fails.append(_fn_{node_id})

# Colourspace check (PNG only via PIL if available)
cs_fails = []
if _cs_{node_id} and _ext_{node_id}.lower() == ".png":
    try:
        from PIL import Image
        for _fn_{node_id} in sorted(_found_files_{node_id}):
            _fp_{node_id} = os.path.join(_folder_{node_id}, _fn_{node_id})
            try:
                _img_{node_id} = Image.open(_fp_{node_id})
                _info_{node_id} = _img_{node_id}.info
                _icc_{node_id}  = _info_{node_id}.get("icc_profile", None)
                _mode_{node_id} = _img_{node_id}.mode
                # Simple check: sRGB images have ICC profile, linear dont
                if _cs_{node_id}.lower() in ["srgb", "sRGB"]:
                    if not _icc_{node_id}:
                        cs_fails.append(_fn_{node_id} + " (no ICC profile)")
            except:
                pass
    except ImportError:
        print("  Note: PIL not available — colourspace check skipped")

# Print results
print("SEQUENCE:")
if is_complete:
    print("  ✓ PASS — all " + str(found_count) + " frames present")
else:
    print("  ✗ FAIL — " + str(missing_count) + " frames missing")
    print("  Missing: " + ", ".join(str(m) for m in missing_frames))

if _naming_{node_id}:
    print("NAMING:")
    if not naming_fails:
        print("  ✓ PASS — all files match pattern")
    else:
        print("  ✗ FAIL — " + str(len(naming_fails)) + " files failed")
        for _nf_{node_id} in naming_fails:
            print("    FAIL: " + _nf_{node_id})

if _cs_{node_id}:
    print("COLOURSPACE:")
    if not cs_fails:
        print("  ✓ PASS — all files match " + _cs_{node_id})
    else:
        print("  ✗ FAIL — " + str(len(cs_fails)) + " files failed")
        for _cf_{node_id} in cs_fails:
            print("    FAIL: " + _cf_{node_id})

print("-" * 55)
_total_fails_{node_id} = missing_count + len(naming_fails) + len(cs_fails)
if _total_fails_{node_id} == 0:
    print("OVERALL: ✓ PASS")
else:
    print("OVERALL: ✗ FAIL — " + str(_total_fails_{node_id}) + " issues found")

{exec_out}`,


  // ==========================================================================
  // PIPELINE — NAMING, REPORTING, IMAGE (merged from wave2)
  // ==========================================================================

  "nm_check_convention": `import re, os
# Check filename against naming convention pattern
# Pattern: # = single digit, ## = two digits, * = any characters
_pattern = r"{pattern}"
_filename = {filename}
_stem = os.path.splitext(_filename)[0]
_regex = _pattern.replace(".", "\\.").replace("*", ".*")
_regex = re.sub("#+", lambda m: "\\d{" + str(len(m.group())) + "}", _regex)
_regex = "^" + _regex + "$"
is_valid = bool(re.match(_regex, _stem))
result_message = (
    "PASS: " + _filename + " matches pattern '{pattern}'"
    if is_valid else
    "FAIL: " + _filename + " does not match pattern '{pattern}'"
)
{exec_out}`,

  "nm_extract_version": `import re, os
_stem = os.path.splitext({filename})[0]
_match = re.search(r'[vV](\d+)', _stem)
found          = bool(_match)
version_string = _match.group(0) if found else ""
version_int    = int(_match.group(1)) if found else 0`,

  "nm_extract_shot": `import re, os
_stem = os.path.splitext({filename})[0]
def _find_part(prefix, text):
    m = re.search(rf'(?i){re.escape(prefix)}(\w+)', text)
    return m.group(1) if m else ""
shot    = _find_part("{shot_prefix}",    _stem)
scene   = _find_part("{scene_prefix}",   _stem)
layer   = _find_part("{layer_prefix}",   _stem)
version = _find_part("{version_prefix}", _stem)`,

  "nm_pad_frame_number": `import os, re
folder    = {folder_path}
padding   = {padding}
extension = "{extension}"
renamed   = 0
for filename in sorted(os.listdir(folder)):
    if filename.lower().endswith(extension.lower()):
        stem  = os.path.splitext(filename)[0]
        match = re.search(r'(\d+)$', stem)
        if match:
            num      = int(match.group(1))
            prefix   = stem[:match.start()]
            new_name = prefix + str(num).zfill(padding) + extension
            if new_name != filename:
                os.rename(
                    os.path.join(folder, filename),
                    os.path.join(folder, new_name)
                )
                print("  Padded: " + filename + " -> " + new_name)
                renamed += 1
print("Frame padding complete: " + str(renamed) + " files renamed.")
{exec_out}`,

  "nm_batch_check_folder": `import os, re
folder    = {folder_path}
extension = {extension}
pattern   = {pattern}
pass_list = []
fail_list = []
_dot_nm = chr(92) + "."
regex = pattern.replace(".", _dot_nm).replace("*", ".*")
_digit_nm = chr(92) + "d"
regex = re.sub("#+", lambda m: _digit_nm + "{" + str(len(m.group())) + "}", regex)
regex = re.sub("@+", lambda m: "[a-zA-Z]{" + str(len(m.group())) + "}", regex)
regex = "^" + regex + "$"
print()
print("FlowPins Naming Convention Check")
print("Folder  : " + folder)
print("Pattern : " + pattern)
print("-" * 50)
for filename in sorted(os.listdir(folder)):
    if filename.lower().endswith(extension.lower()):
        stem = os.path.splitext(filename)[0]
        if re.match(regex, stem):
            pass_list.append(filename)
            print("  PASS: " + filename)
        else:
            fail_list.append(filename)
            print("  FAIL: " + filename)
pass_count = len(pass_list)
fail_count = len(fail_list)
print()
print("Result: " + str(pass_count) + " passed, " + str(fail_count) + " failed.")
{exec_out}`,

  "nm_bump_version": `import re, os
filename       = {filename}
version_prefix = "{version_prefix}"
padding        = {padding}
stem           = os.path.splitext(filename)[0]
ext            = os.path.splitext(filename)[1]
match          = re.search(rf'(?i){re.escape(version_prefix)}(\d+)', stem)
if match:
    new_version  = int(match.group(1)) + 1
    new_filename = stem[:match.start()] + version_prefix + str(new_version).zfill(padding) + stem[match.end():] + ext
else:
    new_version  = 1
    new_filename = stem + "_" + version_prefix + str(new_version).zfill(padding) + ext`,

  // ==========================================================================
  // Pipeline - Reporting (Python)
  // ==========================================================================

  "rp_save_csv": `import csv, os
from datetime import datetime
pass_list   = {pass_list}
fail_list   = {fail_list}
save_folder = {folder_path}
csv_path    = os.path.join(save_folder, "{filename}")
timestamp   = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
with open(csv_path, "w", newline="", encoding="utf-8") as csv_file:
    writer = csv.writer(csv_file)
    writer.writerow(["Status", "File", "Timestamp"])
    for f in pass_list:
        writer.writerow(["PASS", os.path.basename(str(f)), timestamp])
    for f in fail_list:
        writer.writerow(["FAIL", str(f), timestamp])
print("CSV report saved: " + csv_path)
print("  " + str(len(pass_list)) + " passed, " + str(len(fail_list)) + " failed.")
{exec_out}`,

  "rp_compare_folders": `import os
folder_a  = {folder_a}
folder_b  = {folder_b}
extension = "{extension}"
files_a   = set(f for f in os.listdir(folder_a) if f.lower().endswith(extension.lower()))
files_b   = set(f for f in os.listdir(folder_b) if f.lower().endswith(extension.lower()))
only_in_a    = sorted(list(files_a - files_b))
only_in_b    = sorted(list(files_b - files_a))
in_both      = sorted(list(files_a & files_b))
missing_count = len(only_in_a) + len(only_in_b)
print()
print("FlowPins Folder Comparison")
print("Folder A: " + folder_a + " (" + str(len(files_a)) + " files)")
print("Folder B: " + folder_b + " (" + str(len(files_b)) + " files)")
print("In both : " + str(len(in_both)) + "  |  Only in A: " + str(len(only_in_a)) + "  |  Only in B: " + str(len(only_in_b)))
if only_in_a:
    print("\nMissing from B:")
    for f in only_in_a: print("  " + f)
if only_in_b:
    print("\nMissing from A:")
    for f in only_in_b: print("  " + f)
{exec_out}`,

  "rp_count_files": `import os
folder      = {folder_path}
png_count   = 0
exr_count   = 0
tiff_count  = 0
total_count = 0
for filename in os.listdir(folder):
    ext = os.path.splitext(filename)[1].lower()
    if   ext == ".png":                                    png_count   += 1
    elif ext == ".exr":                                    exr_count   += 1
    elif ext in (".tif", ".tiff"):                         tiff_count  += 1
    if   ext in (".png",".exr",".tif",".tiff",".jpg",".jpeg",".dpx"): total_count += 1
summary = "PNG:" + str(png_count) + " EXR:" + str(exr_count) + " TIFF:" + str(tiff_count) + " Total:" + str(total_count)
print("")
print("FlowPins File Count — " + folder)
print("  " + summary)
{exec_out}`,

  "rp_print_summary": `from datetime import datetime
title     = "{title}"
separator = "=" * 60
timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print(separator)
print("  " + title.upper())
print("  Generated: " + timestamp)
print(separator)
print("  PASSED : " + str(pass_count))
print("  FAILED : " + str(fail_count))
print(separator)
{exec_out}`,

  // ==========================================================================
  // Pipeline - Colourspace (Python)
  // ==========================================================================

  "img_get_dimensions": `from PIL import Image
import os
try:
    with Image.open({file_path}) as img:
        width   = img.width
        height  = img.height
        summary = str(width) + "x" + str(height)
    print("  Dimensions: " + summary + " — " + os.path.basename({file_path}))
except Exception as e:
    width = 0; height = 0
    summary = "ERROR: " + str(e)
{exec_out}`,

  "img_check_dimensions": `from PIL import Image
import os
expected_width  = {expected_width}
expected_height = {expected_height}
try:
    with Image.open({file_path}) as img:
        actual_width  = img.width
        actual_height = img.height
    is_correct     = (actual_width == expected_width and actual_height == expected_height)
    result_message = (
        "PASS: " + str(actual_width) + "x" + str(actual_height)
        if is_correct else
        "FAIL: expected " + str(expected_width) + "x" + str(expected_height) +
        ", got " + str(actual_width) + "x" + str(actual_height)
    )
except Exception as e:
    actual_width = 0; actual_height = 0
    is_correct   = False
    result_message = "ERROR: " + str(e)
{exec_out}`,

  "img_batch_check_dimensions": `from PIL import Image
import os
# Guard — stop if cancelled or no folder
if cancelled or not {folder_path}:
    import sys
    if cancelled: print("FlowPins: Cancelled — skipping dimension check.")
    else: print("FlowPins ERROR: No folder path provided.")
    sys.exit(0)
folder          = {folder_path}
expected_width  = int({expected_width})
expected_height = int({expected_height})
extension       = {extension}
pass_list       = []
fail_list       = []
print()
print("FlowPins Dimension Check — " + folder)
print("Expected: " + str(expected_width) + "x" + str(expected_height))
print("-" * 50)
for root, dirs, files in os.walk(folder):
    for filename in sorted(files):
        if filename.lower().endswith(extension.lower()):
            filepath = os.path.join(root, filename)
            try:
                with Image.open(filepath) as img:
                    w = img.width
                    h = img.height
                if w == expected_width and h == expected_height:
                    pass_list.append(filepath)
                    print("  PASS: " + filename + " [" + str(w) + "x" + str(h) + "]")
                else:
                    fail_list.append(filepath + " [" + str(w) + "x" + str(h) + "]")
                    print("  FAIL: " + filename + " — got " + str(w) + "x" + str(h))
            except Exception as e:
                fail_list.append(filepath + " [ERROR]")
                print("  ERROR: " + filename + " — " + str(e))
pass_count = len(pass_list)
fail_count = len(fail_list)
{exec_out}`,

  "img_get_bit_depth": `from PIL import Image
import os
DEPTH_MAP = {"1":1,"L":8,"P":8,"RGB":8,"RGBA":8,"CMYK":8,"I":32,"F":32,"I;16":16,"I;16B":16}
try:
    with Image.open({file_path}) as img:
        mode      = img.mode
        bit_depth = DEPTH_MAP.get(mode, 8)
    print("  Bit depth: " + str(bit_depth) + "-bit (" + mode + ") — " + os.path.basename({file_path}))
except Exception as e:
    bit_depth = 0
    mode      = "ERROR: " + str(e)
{exec_out}`,

  "img_check_bit_depth": `from PIL import Image
DEPTH_MAP         = {"1":1,"L":8,"P":8,"RGB":8,"RGBA":8,"I":32,"F":32,"I;16":16,"I;16B":16}
expected_bit_depth = {expected_bit_depth}
try:
    with Image.open({file_path}) as img:
        mode      = img.mode
        bit_depth = DEPTH_MAP.get(mode, 8)
    is_correct     = (bit_depth == expected_bit_depth)
    result_message = (
        "PASS: " + str(bit_depth) + "-bit (" + mode + ")"
        if is_correct else
        "FAIL: expected " + str(expected_bit_depth) + "-bit, got " + str(bit_depth) + "-bit (" + mode + ")"
    )
except Exception as e:
    is_correct     = False
    result_message = "ERROR: " + str(e)
{exec_out}`,

  "img_batch_validate": `from PIL import Image, ImageCms
import os, io
folder          = {folder_path}
expected_width  = {expected_width}
expected_height = {expected_height}
expected_depth  = {expected_bit_depth}
expected_cs     = {expected_cs} if str({expected_cs}) not in ["expected_cs",""] else "sRGB"
extension       = {extension} if str({extension}) not in ["extension",""] else ".png"
DEPTH_MAP       = {"1":1,"L":8,"P":8,"RGB":8,"RGBA":8,"I":32,"F":32,"I;16":16,"I;16B":16}
pass_list       = []
fail_list       = []

print()
print("FlowPins Full Image Validator — " + folder)
print("Expected: " + str(expected_width) + "x" + str(expected_height) +
      " | " + str(expected_depth) + "-bit | " + expected_cs)
print("-" * 60)

for root, dirs, files in os.walk(folder):
    for filename in sorted(files):
        if filename.lower().endswith(extension.lower()):
            filepath = os.path.join(root, filename)
            errors   = []
            try:
                with Image.open(filepath) as img:
                    w    = img.width
                    h    = img.height
                    mode = img.mode
                    bd   = DEPTH_MAP.get(mode, 8)
                    info = img.info
                    if w != expected_width or h != expected_height:
                        errors.append("size " + str(w) + "x" + str(h))
                    if bd != expected_depth:
                        errors.append(str(bd) + "-bit")
                    cs = "Untagged"
                    if "icc_profile" in info:
                        try:
                            d  = ImageCms.getProfileDescription(
                                     ImageCms.ImageCmsProfile(io.BytesIO(info["icc_profile"]))
                                 ).strip().lower()
                            cs = "sRGB" if "srgb" in d else "Linear" if "linear" in d else d
                        except:
                            cs = "ICC Embedded"
                    elif "srgb" in info:
                        cs = "sRGB"
                    if cs.lower() != expected_cs.lower():
                        errors.append("cs:" + cs)
                if errors:
                    fail_list.append(filepath + " [" + ", ".join(errors) + "]")
                    print("  FAIL: " + filename + " — " + ", ".join(errors))
                else:
                    pass_list.append(filepath)
                    print("  PASS: " + filename)
            except Exception as e:
                fail_list.append(filepath + " [ERROR: " + str(e) + "]")
                print("  ERROR: " + filename + " — " + str(e))

pass_count = len(pass_list)
fail_count = len(fail_list)
print()
print("Result: " + str(pass_count) + " passed, " + str(fail_count) + " failed.")
{exec_out}`,

  // ==========================================================================
  // File System (Python) - clean readable versions
  // ==========================================================================

  // ==========================================================================
  // PIPELINE SUITE — CONFIG SYSTEM TRANSLATIONS
  // ==========================================================================

  "cfg_load_config": `# Load a JSON config file
import json, os
_cfg_path_{node_id} = {config_path}
config_data = {}
exists = False
if os.path.isfile(_cfg_path_{node_id}):
    try:
        with open(_cfg_path_{node_id}, 'r') as _f_{node_id}:
            config_data = json.load(_f_{node_id})
        exists = True
        print("FlowPins: Config loaded from " + _cfg_path_{node_id})
    except Exception as _e_{node_id}:
        print("FlowPins: Config load failed — " + str(_e_{node_id}))
else:
    print("FlowPins: No config found at " + _cfg_path_{node_id})
{exec_out}`,

  "cfg_save_config": `# Save settings to a JSON config file
import json, os
_cfg_path_{node_id} = {config_path}
_data_{node_id}     = {config_data}
try:
    _dir_{node_id} = os.path.dirname(_cfg_path_{node_id})
    if _dir_{node_id} and not os.path.exists(_dir_{node_id}):
        os.makedirs(_dir_{node_id})
    with open(_cfg_path_{node_id}, 'w') as _f_{node_id}:
        json.dump(_data_{node_id}, _f_{node_id}, indent=2)
    print("FlowPins: Config saved to " + _cfg_path_{node_id})
except Exception as _e_{node_id}:
    print("FlowPins: Config save failed — " + str(_e_{node_id}))
{exec_out}`,

  "cfg_get_value": `# Get a value from a config dictionary
_cfg_{node_id}     = {config_data}
_key_{node_id}     = "{key}"
_default_{node_id} = "{default_value}"
value = str(_cfg_{node_id}.get(_key_{node_id}, _default_{node_id})) if isinstance(_cfg_{node_id}, dict) else _default_{node_id}
{exec_out}`,

  "cfg_load_or_show": `# Load config or show dialog — the smart config node
# If config exists: load silently and use saved values
# If config missing or force_dialog=True: show UI, optionally save
import json, os, tkinter as tk
from tkinter import ttk, filedialog, messagebox

_cfg_path_{node_id}   = "{config_path}"
_title_{node_id}      = "{title}"
_force_{node_id}      = str("{force_dialog}").lower() == "true"
_show_folder_{node_id}   = str("{show_folder}").lower() == "true"
_show_ext_{node_id}      = str("{show_extension}").lower() == "true"
_show_frames_{node_id}   = str("{show_frames}").lower() == "true"
_show_naming_{node_id}   = str("{show_naming}").lower() == "true"
_show_cs_{node_id}       = str("{show_colourspace}").lower() == "true"
_show_pad_{node_id}      = str("{show_padding}").lower() == "true"

# Default values
folder_path    = ""
extension      = ".png"
start_frame    = 1001
end_frame      = 1100
naming_pattern = "@@##_@@####-####"
colourspace    = "sRGB"
frame_padding  = 4
prefix         = ""
cancelled      = False

# Try loading existing config
_cfg_{node_id} = {}
_has_config_{node_id} = False
if os.path.isfile(_cfg_path_{node_id}):
    try:
        with open(_cfg_path_{node_id}, 'r') as _f_{node_id}:
            _cfg_{node_id} = json.load(_f_{node_id})
        _has_config_{node_id} = True
    except:
        pass

# Use config values if loaded and not forcing dialog
# Also force dialog if folder_path is empty even with a valid config
_cfg_folder_{node_id} = _cfg_{node_id}.get('folder_path', '') if _has_config_{node_id} else ''
if _has_config_{node_id} and not _force_{node_id} and _cfg_folder_{node_id}:
    folder_path    = _cfg_{node_id}.get('folder_path',    folder_path)
    extension      = _cfg_{node_id}.get('extension',      extension)
    start_frame    = int(_cfg_{node_id}.get('start_frame',    start_frame))
    end_frame      = int(_cfg_{node_id}.get('end_frame',      end_frame))
    naming_pattern = _cfg_{node_id}.get('naming_pattern', naming_pattern)
    colourspace    = _cfg_{node_id}.get('colourspace',    colourspace)
    frame_padding  = int(_cfg_{node_id}.get('frame_padding',  frame_padding))
    prefix         = _cfg_{node_id}.get('prefix',         prefix)
    print("FlowPins: Config loaded from " + _cfg_path_{node_id})
else:
    # Show the configuration dialog
    _root_{node_id} = tk.Tk()
    _root_{node_id}.withdraw()

    _dlg_{node_id} = tk.Toplevel(_root_{node_id})
    _dlg_{node_id}.title(_title_{node_id})
    _dlg_{node_id}.resizable(False, False)
    _dlg_{node_id}.configure(bg="#1a1a2e")
    _dlg_{node_id}.grab_set()

    _style_{node_id} = ttk.Style()
    _style_{node_id}.theme_use('clam')
    _style_{node_id}.configure('FP.TLabel',
        background="#1a1a2e", foreground="#00d8ff",
        font=('Arial', 10, 'bold'))
    _style_{node_id}.configure('FPV.TLabel',
        background="#1a1a2e", foreground="#cccccc",
        font=('Arial', 10))
    _style_{node_id}.configure('FP.TEntry',
        fieldbackground="#0d1117", foreground="#ffffff",
        insertcolor="#00d8ff", font=('Arial', 10))
    _style_{node_id}.configure('FP.TButton',
        background="#1a3a5c", foreground="#ffffff",
        font=('Arial', 10, 'bold'), padding=8)
    _style_{node_id}.configure('FPRun.TButton',
        background="#00d8ff", foreground="#000000",
        font=('Arial', 10, 'bold'), padding=8)

    # Header
    _hdr_{node_id} = tk.Frame(_dlg_{node_id}, bg="#0d1f33", pady=12)
    _hdr_{node_id}.pack(fill='x')
    tk.Label(_hdr_{node_id}, text="⬡  " + _title_{node_id},
        bg="#0d1f33", fg="#00d8ff",
        font=('Arial', 13, 'bold')).pack(padx=20)

    # Form frame
    _form_{node_id} = tk.Frame(_dlg_{node_id}, bg="#1a1a2e", padx=20, pady=12)
    _form_{node_id}.pack(fill='both', expand=True)

    _row_{node_id} = 0
    _vars_{node_id} = {}

    def _add_field_{node_id}(label, key, default, browse=False):
        global _row_{node_id}
        tk.Label(_form_{node_id}, text=label, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_{node_id}, column=0, sticky='w', pady=(8,2))
        _v_{node_id} = tk.StringVar(value=str(default))
        _vars_{node_id}[key] = _v_{node_id}
        _e_{node_id} = tk.Entry(_form_{node_id}, textvariable=_v_{node_id},
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=42, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344")
        _e_{node_id}.grid(row=_row_{node_id}+1, column=0,
            columnspan=2 if not browse else 1, sticky='ew', pady=(0,4))
        if browse:
            def _browse_{node_id}(v=_v_{node_id}):
                _d_{node_id} = filedialog.askdirectory()
                if _d_{node_id}: v.set(_d_{node_id})
            tk.Button(_form_{node_id}, text="📁", command=_browse_{node_id},
                bg="#1a3a5c", fg="#00d8ff", font=('Arial',10),
                relief='flat', padx=6).grid(row=_row_{node_id}+1, column=1,
                sticky='w', padx=(4,0))
        _row_{node_id} += 2

    def _add_row2_{node_id}(l1, k1, d1, l2, k2, d2):
        global _row_{node_id}
        tk.Label(_form_{node_id}, text=l1, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_{node_id}, column=0, sticky='w', pady=(8,2))
        tk.Label(_form_{node_id}, text=l2, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_{node_id}, column=1, sticky='w', pady=(8,2), padx=(8,0))
        _v1_{node_id} = tk.StringVar(value=str(d1))
        _v2_{node_id} = tk.StringVar(value=str(d2))
        _vars_{node_id}[k1] = _v1_{node_id}
        _vars_{node_id}[k2] = _v2_{node_id}
        tk.Entry(_form_{node_id}, textvariable=_v1_{node_id},
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_{node_id}+1, column=0, sticky='ew', pady=(0,4))
        tk.Entry(_form_{node_id}, textvariable=_v2_{node_id},
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_{node_id}+1, column=1, sticky='ew',
            pady=(0,4), padx=(8,0))
        _row_{node_id} += 2

    if _show_folder_{node_id}:
        _add_field_{node_id}("Render / Source Folder", "folder_path",
            _cfg_{node_id}.get('folder_path', ''), browse=True)
    if _show_ext_{node_id}:
        _add_field_{node_id}("File Extension", "extension",
            _cfg_{node_id}.get('extension', '.png'))
    if _show_frames_{node_id}:
        _add_row2_{node_id}("Start Frame", "start_frame",
            _cfg_{node_id}.get('start_frame', 1001),
            "End Frame", "end_frame",
            _cfg_{node_id}.get('end_frame', 1100))
    if _show_pad_{node_id}:
        _add_field_{node_id}("Frame Padding (digits)", "frame_padding",
            _cfg_{node_id}.get('frame_padding', 4))
    _add_field_{node_id}("Filename Prefix (e.g. shot_010_comp-)", "prefix",
        _cfg_{node_id}.get('prefix', ''))
    if _show_naming_{node_id}:
        _add_field_{node_id}("Naming Pattern  (# = digit, @ = letter)",
            "naming_pattern",
            _cfg_{node_id}.get('naming_pattern', 'shot_###_v##'))
    if _show_cs_{node_id}:
        _add_field_{node_id}("Expected Colourspace", "colourspace",
            _cfg_{node_id}.get('colourspace', 'sRGB'))

    # Save config checkbox
    _save_var_{node_id} = tk.BooleanVar(value=True)
    tk.Checkbutton(_form_{node_id},
        text="  Save these settings for next time",
        variable=_save_var_{node_id},
        bg="#1a1a2e", fg="#888888",
        selectcolor="#0d1117", activebackground="#1a1a2e",
        font=('Arial', 9)).grid(
        row=_row_{node_id}, column=0, columnspan=2,
        sticky='w', pady=(12,4))
    _row_{node_id} += 1

    # Buttons
    _btn_frame_{node_id} = tk.Frame(_dlg_{node_id}, bg="#0d1f33", pady=12)
    _btn_frame_{node_id}.pack(fill='x')

    _result_{node_id} = {'ok': False}

    def _on_run_{node_id}():
        _result_{node_id}['ok'] = True
        _dlg_{node_id}.destroy()

    def _on_cancel_{node_id}():
        _result_{node_id}['ok'] = False
        _dlg_{node_id}.destroy()

    tk.Button(_btn_frame_{node_id}, text="Cancel",
        command=_on_cancel_{node_id},
        bg="#333344", fg="#888888",
        font=('Arial', 10), relief='flat',
        padx=20, pady=6).pack(side='left', padx=20)

    tk.Button(_btn_frame_{node_id}, text="▶  Run Tool",
        command=_on_run_{node_id},
        bg="#00d8ff", fg="#000000",
        font=('Arial', 11, 'bold'), relief='flat',
        padx=20, pady=6).pack(side='right', padx=20)

    _dlg_{node_id}.update_idletasks()
    _w_{node_id} = _dlg_{node_id}.winfo_reqwidth()
    _h_{node_id} = _dlg_{node_id}.winfo_reqheight()
    _x_{node_id} = (_dlg_{node_id}.winfo_screenwidth() - _w_{node_id}) // 2
    _y_{node_id} = (_dlg_{node_id}.winfo_screenheight() - _h_{node_id}) // 2
    _dlg_{node_id}.geometry(f"{_w_{node_id}}x{_h_{node_id}}+{_x_{node_id}}+{_y_{node_id}}")

    _root_{node_id}.wait_window(_dlg_{node_id})
    _root_{node_id}.destroy()

    if not _result_{node_id}['ok']:
        cancelled = True
        print("FlowPins: Config dialog cancelled.")
    else:
        # Read values from form
        if 'folder_path'    in _vars_{node_id}: folder_path    = _vars_{node_id}['folder_path'].get()
        if 'extension'      in _vars_{node_id}: extension      = _vars_{node_id}['extension'].get()
        if 'start_frame'    in _vars_{node_id}: start_frame    = int(_vars_{node_id}['start_frame'].get() or 1001)
        if 'end_frame'      in _vars_{node_id}: end_frame      = int(_vars_{node_id}['end_frame'].get() or 1100)
        if 'frame_padding'  in _vars_{node_id}: frame_padding  = int(_vars_{node_id}['frame_padding'].get() or 4)
        if 'naming_pattern' in _vars_{node_id}: naming_pattern = _vars_{node_id}['naming_pattern'].get()
        if 'colourspace'    in _vars_{node_id}: colourspace    = _vars_{node_id}['colourspace'].get()
        if 'prefix'         in _vars_{node_id}: prefix         = _vars_{node_id}['prefix'].get()

        # Save config if requested
        if _save_var_{node_id}.get():
            _save_data_{node_id} = {
                'folder_path':    folder_path,
                'extension':      extension,
                'start_frame':    start_frame,
                'end_frame':      end_frame,
                'frame_padding':  frame_padding,
                'naming_pattern': naming_pattern,
                'colourspace':    colourspace,
                'prefix':         prefix
            }
            try:
                with open(_cfg_path_{node_id}, 'w') as _sf_{node_id}:
                    json.dump(_save_data_{node_id}, _sf_{node_id}, indent=2)
                print("FlowPins: Settings saved to " + _cfg_path_{node_id})
            except Exception as _se_{node_id}:
                print("FlowPins: Could not save config — " + str(_se_{node_id}))

{exec_out}`,


  // ==========================================================================
  // PIPELINE SUITE — MULTI-SHOT CSV VALIDATOR TRANSLATIONS
  // ==========================================================================

  "csv_read_shot_list": `# Read Shot List CSV
# Expected columns: shot_name, folder_path, start_frame, end_frame,
#   frame_padding, prefix, naming_pattern, colourspace, width, height
import csv, os

_csv_path_{node_id} = r"{csv_path}"
shot_list  = []
shot_count = 0

if not os.path.isfile(_csv_path_{node_id}):
    print("FlowPins ERROR: Shot list not found: " + _csv_path_{node_id})
else:
    try:
        with open(_csv_path_{node_id}, newline="", encoding="utf-8-sig") as _f_{node_id}:
            _reader_{node_id} = csv.DictReader(_f_{node_id})
            for _row_{node_id} in _reader_{node_id}:
                # Strip whitespace from all values
                _shot_{node_id} = {k.strip(): (v or "").strip() for k, v in _row_{node_id}.items() if k}
                shot_list.append(_shot_{node_id})
        shot_count = len(shot_list)
        print("FlowPins: Read " + str(shot_count) + " shots from " + _csv_path_{node_id})
    except Exception as _e_{node_id}:
        print("FlowPins ERROR reading CSV: " + str(_e_{node_id}))
{exec_out}`,

  "csv_multi_shot_validate": `# Multi-Shot Validator
# Loops through every shot in the shot list and runs all checks
import csv, os, re
from datetime import datetime

_shots_{node_id}      = {shot_list}
_report_{node_id}     = "{report_path}"
_chk_seq_{node_id}    = str("{check_sequence}").lower() == "true"
_chk_nam_{node_id}    = str("{check_naming}").lower() == "true"
_chk_dim_{node_id}    = str("{check_dims}").lower() == "true"
_chk_cs_{node_id}     = str("{check_cs}").lower() == "true"

print("=" * 65)
print("  FLOWPINS MULTI-SHOT VALIDATOR")
print("  " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
print("  Shots to validate: " + str(len(_shots_{node_id})))
print("=" * 65)

_all_results_{node_id} = []
_passed_shots_{node_id} = 0
_failed_shots_{node_id} = 0

for _shot_{node_id} in _shots_{node_id}:
    _name_{node_id}    = _shot_{node_id}.get("shot_name",      "unknown")
    _folder_{node_id}  = _shot_{node_id}.get("folder_path",    "")
    def _safe_int_{node_id}(val, default=0):
        try: return int(str(val).strip() or default)
        except: return default

    _start_{node_id}   = _safe_int_{node_id}(_shot_{node_id}.get("start_frame",  "1"), 1)
    _end_{node_id}     = _safe_int_{node_id}(_shot_{node_id}.get("end_frame",    "1"), 1)
    _pad_{node_id}     = _safe_int_{node_id}(_shot_{node_id}.get("frame_padding","4"), 4)
    _pfx_{node_id}     = _shot_{node_id}.get("prefix",          "")
    _pat_{node_id}     = _shot_{node_id}.get("naming_pattern",  "")
    _cs_{node_id}      = _shot_{node_id}.get("colourspace",     "")
    _ext_{node_id}     = _shot_{node_id}.get("extension",       ".png") or ".png"
    _width_{node_id}   = _safe_int_{node_id}(_shot_{node_id}.get("width",  "0"), 0)
    _height_{node_id}  = _safe_int_{node_id}(_shot_{node_id}.get("height", "0"), 0)

    print("")
    print("SHOT: " + _name_{node_id} + "  [" + _folder_{node_id} + "]")
    print("-" * 65)

    _shot_issues_{node_id} = []

    # ── SEQUENCE CHECK ──────────────────────────────────────────
    if _chk_seq_{node_id}:
        _expected_{node_id} = set()
        for _f_{node_id} in range(_start_{node_id}, _end_{node_id} + 1):
            _expected_{node_id}.add(_pfx_{node_id} + str(_f_{node_id}).zfill(_pad_{node_id}) + _ext_{node_id})
        _found_{node_id} = set()
        if os.path.isdir(_folder_{node_id}):
            for _fn_{node_id} in os.listdir(_folder_{node_id}):
                if _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()):
                    _found_{node_id}.add(_fn_{node_id})
        _missing_{node_id} = sorted(_expected_{node_id} - _found_{node_id})
        if _missing_{node_id}:
            _shot_issues_{node_id}.append("SEQUENCE: " + str(len(_missing_{node_id})) + " frames missing")
            print("  SEQUENCE: ✗ FAIL — " + str(len(_missing_{node_id})) + " frames missing")
        else:
            print("  SEQUENCE: ✓ PASS — " + str(len(_found_{node_id})) + " frames present")

    # ── NAMING CHECK ────────────────────────────────────────────
    if _chk_nam_{node_id} and _pat_{node_id}:
        _digit_{node_id} = chr(92) + "d"
        _regex_{node_id} = _pat_{node_id}.replace(".", "\.").replace("*", ".*")
        _regex_{node_id} = re.sub("#+", lambda m: _digit_{node_id} + "{" + str(len(m.group())) + "}", _regex_{node_id})
        _regex_{node_id} = re.sub("@+", lambda m: "[a-zA-Z]{" + str(len(m.group())) + "}", _regex_{node_id})
        _regex_{node_id} = "^" + _regex_{node_id} + "$"
        _nam_fails_{node_id} = []
        if os.path.isdir(_folder_{node_id}):
            for _fn_{node_id} in sorted(os.listdir(_folder_{node_id})):
                if _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()):
                    _stem_{node_id} = os.path.splitext(_fn_{node_id})[0]
                    if not re.match(_regex_{node_id}, _stem_{node_id}):
                        _nam_fails_{node_id}.append(_fn_{node_id})
        if _nam_fails_{node_id}:
            _shot_issues_{node_id}.append("NAMING: " + str(len(_nam_fails_{node_id})) + " files failed")
            print("  NAMING:   ✗ FAIL — " + str(len(_nam_fails_{node_id})) + " files failed")
        else:
            print("  NAMING:   ✓ PASS")

    # ── DIMENSION + COLOURSPACE CHECK ───────────────────────────
    if (_chk_dim_{node_id} or _chk_cs_{node_id}) and _ext_{node_id}.lower() == ".png":
        try:
            from PIL import Image, ImageCms
            import io as _io_{node_id}
            _dim_fails_{node_id} = []
            _cs_fails_{node_id}  = []
            if os.path.isdir(_folder_{node_id}):
                for _fn_{node_id} in sorted(os.listdir(_folder_{node_id})):
                    if _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()):
                        _fp_{node_id} = os.path.join(_folder_{node_id}, _fn_{node_id})
                        try:
                            with Image.open(_fp_{node_id}) as _img_{node_id}:
                                if _chk_dim_{node_id} and _width_{node_id} and _height_{node_id}:
                                    if _img_{node_id}.width != _width_{node_id} or _img_{node_id}.height != _height_{node_id}:
                                        _dim_fails_{node_id}.append(_fn_{node_id} + " (" + str(_img_{node_id}.width) + "x" + str(_img_{node_id}.height) + ")")
                                if _chk_cs_{node_id} and _cs_{node_id}:
                                    _info_{node_id} = _img_{node_id}.info
                                    _icc_{node_id}  = _info_{node_id}.get("icc_profile", None)
                                    if _cs_{node_id}.lower() in ["srgb"] and not _icc_{node_id}:
                                        _cs_fails_{node_id}.append(_fn_{node_id})
                        except:
                            pass
            if _dim_fails_{node_id}:
                _shot_issues_{node_id}.append("DIMS: " + str(len(_dim_fails_{node_id})) + " wrong size")
                print("  DIMS:     ✗ FAIL — " + str(len(_dim_fails_{node_id})) + " wrong size")
            elif _chk_dim_{node_id} and _width_{node_id}:
                print("  DIMS:     ✓ PASS")
            if _cs_fails_{node_id}:
                _shot_issues_{node_id}.append("CS: " + str(len(_cs_fails_{node_id})) + " untagged")
                print("  CS:       ✗ FAIL — " + str(len(_cs_fails_{node_id})) + " untagged")
            elif _chk_cs_{node_id} and _cs_{node_id}:
                print("  CS:       ✓ PASS")
        except ImportError:
            print("  Note: PIL not available — dimension/CS checks skipped")

    # ── SHOT RESULT ─────────────────────────────────────────────
    if _shot_issues_{node_id}:
        _failed_shots_{node_id} += 1
        _all_results_{node_id}.append({
            "shot": _name_{node_id}, "status": "FAIL",
            "issues": " | ".join(_shot_issues_{node_id}),
            "folder": _folder_{node_id}
        })
        print("  RESULT:   ✗ FAIL")
    else:
        _passed_shots_{node_id} += 1
        _all_results_{node_id}.append({
            "shot": _name_{node_id}, "status": "PASS",
            "issues": "",
            "folder": _folder_{node_id}
        })
        print("  RESULT:   ✓ PASS")

# ── CONSOLIDATED REPORT ─────────────────────────────────────────
total_shots  = len(_shots_{node_id})
passed_shots = _passed_shots_{node_id}
failed_shots = _failed_shots_{node_id}
all_passed   = failed_shots == 0

print("")
print("=" * 65)
print("  OVERALL: " + str(passed_shots) + "/" + str(total_shots) + " shots passed")
if all_passed:
    print("  STATUS:  ✓ ALL CLEAR — production ready for delivery")
else:
    print("  STATUS:  ✗ " + str(failed_shots) + " shots require attention")
print("=" * 65)

# Save CSV report
report_path = _report_{node_id}
try:
    _rdir_{node_id} = os.path.dirname(report_path)
    if _rdir_{node_id} and not os.path.exists(_rdir_{node_id}):
        os.makedirs(_rdir_{node_id})
    with open(report_path, "w", newline="", encoding="utf-8") as _rf_{node_id}:
        _writer_{node_id} = csv.writer(_rf_{node_id})
        _writer_{node_id}.writerow(["Shot", "Status", "Issues", "Folder", "Timestamp"])
        _ts_{node_id} = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        for _r_{node_id} in _all_results_{node_id}:
            _writer_{node_id}.writerow([
                _r_{node_id}["shot"],
                _r_{node_id}["status"],
                _r_{node_id}["issues"],
                _r_{node_id}["folder"],
                _ts_{node_id}
            ])
    print("  Report:  " + report_path)
except Exception as _re_{node_id}:
    print("  Report save failed: " + str(_re_{node_id}))
{exec_out}`,


};
