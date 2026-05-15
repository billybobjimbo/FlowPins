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
source_folder  = ""
target_folder  = ""
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
    source_folder  = _cfg_{node_id}.get('source_folder',  source_folder)
    target_folder  = _cfg_{node_id}.get('target_folder',  target_folder)
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
    _add_field_{node_id}("Source Folder (for Folder Diff)", "source_folder",
        _cfg_{node_id}.get('source_folder', ''), browse=True)
    _add_field_{node_id}("Target Folder (for Folder Diff)", "target_folder",
        _cfg_{node_id}.get('target_folder', ''), browse=True)
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
        if 'source_folder'  in _vars_{node_id}: source_folder  = _vars_{node_id}['source_folder'].get()
        if 'target_folder'  in _vars_{node_id}: target_folder  = _vars_{node_id}['target_folder'].get()

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
                'prefix':         prefix,
                'source_folder':  source_folder,
                'target_folder':  target_folder
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


  // ==========================================================================
  // PIPELINE SUITE — DELIVERY PACKAGE REPORT TRANSLATION
  // ==========================================================================

  "rpt_delivery_package": `# Delivery Package Report
# Runs all four checks and produces one consolidated report
from PIL import Image, ImageCms
import os, re, io as _io_rpt
from datetime import datetime

_folder_rpt  = {folder_path}
_ext_rpt     = {extension}
_start_rpt   = int({start_frame})
_end_rpt     = int({end_frame})
_pad_rpt     = int({frame_padding})
_pfx_rpt     = prefix if isinstance(prefix, str) else ""
_pat_rpt     = {naming_pattern}
_cs_rpt      = {colourspace}
_width_rpt   = int({width})
_height_rpt  = int({height})
_save_rpt    = str("{save_report}").lower() == "true"

# Guard
if not _folder_rpt or not os.path.isdir(_folder_rpt):
    print("FlowPins ERROR: Folder not found — " + str(_folder_rpt))
    all_passed   = False
    report_path  = ""
    total_issues = 1
else:
    _ts_rpt = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _issues_rpt = []

    print("=" * 65)
    print("  FLOWPINS DELIVERY PACKAGE REPORT")
    print("  " + _ts_rpt)
    print("  Folder : " + _folder_rpt)
    print("=" * 65)

    # ── 1. SEQUENCE CHECK ───────────────────────────────────────
    print("")
    print("[ 1 ] SEQUENCE CHECK")
    print("-" * 65)
    _expected_seq = set()
    for _f in range(_start_rpt, _end_rpt + 1):
        _expected_seq.add(_pfx_rpt + str(_f).zfill(_pad_rpt) + _ext_rpt)
    _found_seq = set()
    for _fn in os.listdir(_folder_rpt):
        if _fn.lower().endswith(_ext_rpt.lower()):
            _found_seq.add(_fn)
    _missing_seq = sorted(_expected_seq - _found_seq)
    _seq_pass = len(_missing_seq) == 0
    if _seq_pass:
        print("  ✓ PASS — " + str(len(_found_seq)) + " frames present")
    else:
        print("  ✗ FAIL — " + str(len(_missing_seq)) + " frames missing")
        print("  Missing: " + ", ".join(str(m) for m in _missing_seq[:10]) +
              ("..." if len(_missing_seq) > 10 else ""))
        _issues_rpt.append("SEQUENCE: " + str(len(_missing_seq)) + " frames missing")

    # ── 2. NAMING CHECK ─────────────────────────────────────────
    print("")
    print("[ 2 ] NAMING CONVENTION CHECK")
    print("-" * 65)
    _nam_fails = []
    if _pat_rpt:
        _dot_nm  = chr(92) + "."
        _dig_nm  = chr(92) + "d"
        _rx = _pat_rpt.replace(".", _dot_nm).replace("*", ".*")
        _rx = re.sub("#+", lambda m: _dig_nm + "{" + str(len(m.group())) + "}", _rx)
        _rx = re.sub("@+", lambda m: "[a-zA-Z]{" + str(len(m.group())) + "}", _rx)
        _rx = "^" + _rx + "$"
        for _fn in sorted(_found_seq):
            _stem = os.path.splitext(_fn)[0]
            if not re.match(_rx, _stem):
                _nam_fails.append(_fn)
        if not _nam_fails:
            print("  ✓ PASS — all files match pattern: " + _pat_rpt)
        else:
            print("  ✗ FAIL — " + str(len(_nam_fails)) + " files failed")
            for _nf in _nam_fails[:5]:
                print("    FAIL: " + _nf)
            if len(_nam_fails) > 5:
                print("    ... and " + str(len(_nam_fails) - 5) + " more")
            _issues_rpt.append("NAMING: " + str(len(_nam_fails)) + " files failed")
    else:
        print("  ─ SKIPPED (no pattern set)")

    # ── 3. RESOLUTION CHECK ─────────────────────────────────────
    print("")
    print("[ 3 ] RESOLUTION CHECK")
    print("-" * 65)
    _dim_fails = []
    if _width_rpt and _height_rpt:
        for _fn in sorted(_found_seq):
            _fp = os.path.join(_folder_rpt, _fn)
            try:
                with Image.open(_fp) as _img:
                    if _img.width != _width_rpt or _img.height != _height_rpt:
                        _dim_fails.append(_fn + " (" + str(_img.width) + "x" + str(_img.height) + ")")
            except:
                pass
        if not _dim_fails:
            print("  ✓ PASS — all files are " + str(_width_rpt) + "x" + str(_height_rpt))
        else:
            print("  ✗ FAIL — " + str(len(_dim_fails)) + " wrong size")
            for _df in _dim_fails[:5]:
                print("    FAIL: " + _df)
            _issues_rpt.append("RESOLUTION: " + str(len(_dim_fails)) + " wrong size")
    else:
        print("  ─ SKIPPED (no dimensions set)")

    # ── 4. COLOURSPACE CHECK ────────────────────────────────────
    print("")
    print("[ 4 ] COLOURSPACE CHECK")
    print("-" * 65)
    _cs_fails = []
    if _cs_rpt and _ext_rpt.lower() == ".png":
        for _fn in sorted(_found_seq):
            _fp = os.path.join(_folder_rpt, _fn)
            try:
                with Image.open(_fp) as _img:
                    _info = _img.info
                    if "icc_profile" in _info:
                        try:
                            _desc = ImageCms.getProfileDescription(
                                ImageCms.ImageCmsProfile(
                                    _io_rpt.BytesIO(_info["icc_profile"])
                                )
                            ).strip().lower()
                            _detected = (
                                "sRGB"    if "srgb"   in _desc else
                                "Rec.709" if "709"    in _desc else
                                "Linear"  if "linear" in _desc else
                                "ACES"    if "aces"   in _desc else
                                "ICC: " + _desc[:20]
                            )
                        except:
                            _detected = "ICC Embedded"
                    elif "srgb" in _info:
                        _detected = "sRGB"
                    else:
                        _detected = "Untagged"
                    if _detected.lower() != _cs_rpt.lower():
                        _cs_fails.append(_fn + " [" + _detected + "]")
            except:
                pass
        if not _cs_fails:
            print("  ✓ PASS — all files match " + _cs_rpt)
        else:
            print("  ✗ FAIL — " + str(len(_cs_fails)) + " files wrong colourspace")
            for _cf in _cs_fails[:5]:
                print("    FAIL: " + _cf)
            _issues_rpt.append("COLOURSPACE: " + str(len(_cs_fails)) + " failed")
    else:
        print("  ─ SKIPPED")

    # ── SUMMARY ─────────────────────────────────────────────────
    total_issues = len(_issues_rpt)
    all_passed   = total_issues == 0

    print("")
    print("=" * 65)
    print("  DELIVERY SUMMARY")
    print("  Folder : " + _folder_rpt)
    print("  Frames : " + str(len(_found_seq)))
    print("  Issues : " + str(total_issues))
    if all_passed:
        print("  STATUS : ✓ ALL CLEAR — ready for delivery")
    else:
        print("  STATUS : ✗ ISSUES FOUND — fix before delivery")
        for _iss in _issues_rpt:
            print("    • " + _iss)
    print("=" * 65)

    # ── SAVE REPORT ─────────────────────────────────────────────
    report_path = ""
    if _save_rpt:
        _lines = [
            "=" * 65,
            "FLOWPINS DELIVERY PACKAGE REPORT",
            "Generated : " + _ts_rpt,
            "Folder    : " + _folder_rpt,
            "Extension : " + _ext_rpt,
            "Frames    : " + str(_start_rpt) + "-" + str(_end_rpt),
            "Resolution: " + str(_width_rpt) + "x" + str(_height_rpt),
            "CS        : " + _cs_rpt,
            "Pattern   : " + _pat_rpt,
            "=" * 65,
            "",
            "CHECKS:",
            "  Sequence   : " + ("✓ PASS" if _seq_pass      else "✗ FAIL"),
            "  Naming     : " + ("✓ PASS" if not _nam_fails  else "✗ FAIL — " + str(len(_nam_fails))  + " files"),
            "  Resolution : " + ("✓ PASS" if not _dim_fails  else "✗ FAIL — " + str(len(_dim_fails))  + " files"),
            "  Colourspace: " + ("✓ PASS" if not _cs_fails   else "✗ FAIL — " + str(len(_cs_fails))   + " files"),
            "",
            "OVERALL: " + ("✓ ALL CLEAR — ready for delivery" if all_passed else "✗ " + str(total_issues) + " issue(s) found"),
            "=" * 65,
        ]
        if _issues_rpt:
            _lines.append("")
            _lines.append("ISSUES:")
            for _iss in _issues_rpt:
                _lines.append("  • " + _iss)

        _rname = "delivery_report_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".txt"
        report_path = os.path.join(_folder_rpt, _rname)
        try:
            with open(report_path, "w", encoding="utf-8") as _rf:
                _rf.write("\n".join(_lines))
            print("  Report : " + report_path)
        except Exception as _re:
            print("  Report save failed: " + str(_re))

{exec_out}`,


  // ==========================================================================
  // PIPELINE SUITE — CATEGORY 2: PROJECT FOLDER CREATOR
  // ==========================================================================

  "fs_create_project_folders": `# Project Folder Creator
# Creates a complete studio-standard folder structure for a new show
import os, json, tkinter as tk
from tkinter import ttk, filedialog
from datetime import datetime

# ── Configuration Dialog ─────────────────────────────────────
_root_ui = tk.Tk()
_root_ui.withdraw()

_dlg = tk.Toplevel(_root_ui)
_dlg.title("FlowPins — Project Folder Creator")
_dlg.resizable(False, False)
_dlg.configure(bg="#1a1a2e")
_dlg.grab_set()

# Header
_hdr = tk.Frame(_dlg, bg="#0d1f33", pady=12)
_hdr.pack(fill='x')
tk.Label(_hdr, text="⬡  FlowPins — Project Folder Creator",
    bg="#0d1f33", fg="#00d8ff",
    font=('Arial', 13, 'bold')).pack(padx=20)

# Form
_form = tk.Frame(_dlg, bg="#1a1a2e", padx=20, pady=12)
_form.pack(fill='both', expand=True)

_vars = {}
_row  = [0]

def _field(label, key, default, browse=False):
    tk.Label(_form, text=label, bg="#1a1a2e", fg="#00d8ff",
        font=('Arial', 9, 'bold'), anchor='w').grid(
        row=_row[0], column=0, sticky='w', pady=(8,2))
    _v = tk.StringVar(value=str(default))
    _vars[key] = _v
    _e = tk.Entry(_form, textvariable=_v,
        bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
        font=('Arial', 10), width=42, relief='flat',
        highlightthickness=1, highlightcolor="#00d8ff",
        highlightbackground="#333344")
    _e.grid(row=_row[0]+1, column=0,
        columnspan=1 if browse else 2, sticky='ew', pady=(0,4))
    if browse:
        def _br(v=_v):
            _d = filedialog.askdirectory()
            if _d: v.set(_d)
        tk.Button(_form, text="📁", command=_br,
            bg="#1a3a5c", fg="#00d8ff", font=('Arial',10),
            relief='flat', padx=6).grid(row=_row[0]+1, column=1,
            sticky='w', padx=(4,0))
    _row[0] += 2

_field("Root Drive / Path",            "root",     "{root_path}", browse=True)
_field("Show Name",                    "show",     "{show_name}")
_field("Episodes  (comma separated)",  "episodes", "{episodes}")

# Preview label
_preview = tk.Label(_form, text="", bg="#0a1520", fg="#00d8ff",
    font=('Arial', 9, 'italic'), anchor='w', justify='left',
    wraplength=400)
_preview.grid(row=_row[0], column=0, columnspan=2,
    sticky='ew', pady=(8,4))
_row[0] += 1

def _update_preview(*_):
    r = _vars['root'].get().rstrip('/').rstrip(chr(92))
    s = _vars['show'].get()
    eps = [e.strip() for e in _vars['episodes'].get().split(',') if e.strip()]
    if r and s and eps:
        lines = [r + "/" + s + "/"]
        for ep in eps[:2]:
            lines.append("  " + ep + "/")
            lines.append("    Renders/")
            lines.append("    Scenes/")
            lines.append("    Assets/  ...")
        if len(eps) > 2:
            lines.append("  ... (" + str(len(eps)) + " episodes total)")
        _preview.config(text=chr(10).join(lines))

for _v in _vars.values():
    _v.trace_add('write', _update_preview)
_update_preview()

# Save checkbox
_save_var = tk.BooleanVar(value=True)
tk.Checkbutton(_form, text="  Create README.txt in each folder",
    variable=_save_var,
    bg="#1a1a2e", fg="#888888",
    selectcolor="#0d1117", activebackground="#1a1a2e",
    font=('Arial', 9)).grid(
    row=_row[0], column=0, columnspan=2,
    sticky='w', pady=(12,4))
_row[0] += 1

# Buttons
_btn_frame = tk.Frame(_dlg, bg="#0d1f33", pady=12)
_btn_frame.pack(fill='x')
_result = {'ok': False}

def _on_run():
    _result['ok'] = True
    _dlg.destroy()

def _on_cancel():
    _result['ok'] = False
    _dlg.destroy()

tk.Button(_btn_frame, text="Cancel", command=_on_cancel,
    bg="#333344", fg="#888888",
    font=('Arial', 10), relief='flat',
    padx=20, pady=6).pack(side='left', padx=20)

tk.Button(_btn_frame, text="▶  Create Project", command=_on_run,
    bg="#00d8ff", fg="#000000",
    font=('Arial', 11, 'bold'), relief='flat',
    padx=20, pady=6).pack(side='right', padx=20)

_dlg.update_idletasks()
_dlg_w = _dlg.winfo_reqwidth()
_dlg_h = _dlg.winfo_reqheight()
_dlg_x = (_dlg.winfo_screenwidth()  - _dlg_w) // 2
_dlg_y = (_dlg.winfo_screenheight() - _dlg_h) // 2
_dlg.geometry(str(_dlg_w) + "x" + str(_dlg_h) + "+" + str(_dlg_x) + "+" + str(_dlg_y))

_root_ui.wait_window(_dlg)
_root_ui.destroy()

if not _result['ok']:
    print("FlowPins: Project Folder Creator cancelled.")
    project_root   = ""
    folders_created = 0
    success        = False
else:
    # ── Build folder structure ───────────────────────────────
    _root_path = _vars['root'].get().rstrip('/').rstrip(chr(92))
    _show_name = _vars['show'].get().strip()
    _episodes  = [e.strip() for e in _vars['episodes'].get().split(',') if e.strip()]
    _readme    = _save_var.get()
    _ts        = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    project_root    = _root_path + "/" + _show_name
    folders_created = 0
    success         = True

    # Standard subfolder structure per episode
    _SUBFOLDERS = [
        "Renders",
        "Scenes",
        "Assets/Characters",
        "Assets/Backgrounds",
        "Assets/Props",
        "Assets/Effects",
        "Audio",
        "Reference",
        "Delivery",
        "Documents",
    ]

    # README content per folder
    _README = {
        "Renders":              "Render output folders. Organised by Take (TK_01, TK_02 etc). SetWriteNode will create scene subfolders automatically.",
        "Scenes":               "Scene files. Create a subfolder per scene (sc0220, sc0230 etc). Organise by your DCC file format.",
        "Assets/Characters":    "Character assets — rigs, designs, palettes.",
        "Assets/Backgrounds":   "Background layouts and painted backgrounds.",
        "Assets/Props":         "Prop assets.",
        "Assets/Effects":       "Effects elements and overlays.",
        "Audio":                "Audio files — dialogue, music, SFX.",
        "Reference":            "Reference material, storyboards, animatics.",
        "Delivery":             "Final delivery packages. Do not place renders here directly.",
        "Documents":            "Production documents, schedules, shot lists.",
    }

    print("=" * 65)
    print("  FLOWPINS PROJECT FOLDER CREATOR")
    print("  " + _ts)
    print("  Show   : " + _show_name)
    print("  Root   : " + project_root)
    print("  Episodes: " + ", ".join(_episodes))
    print("=" * 65)

    # Create root show folder
    try:
        os.makedirs(project_root, exist_ok=True)
        folders_created += 1
        print(chr(10) + '✓ ' + project_root)

        # Create README at show root
        if _readme:
            _rme = os.path.join(project_root, "README.txt")
            with open(_rme, 'w') as _f:
                _f.write(_show_name + " — Production Folder" + chr(10))
                _f.write("Created by FlowPins Pipeline Suite" + chr(10))
                _f.write("Date: " + _ts + chr(10))
                _f.write("Episodes: " + ", ".join(_episodes) + chr(10))

        # Create episode folders
        for _ep in _episodes:
            _ep_path = os.path.join(project_root, _ep)
            os.makedirs(_ep_path, exist_ok=True)
            folders_created += 1
            print(chr(10) + '  ✓ ' + _ep)

            # Create subfolders
            for _sub in _SUBFOLDERS:
                _sub_path = os.path.join(_ep_path, _sub)
                os.makedirs(_sub_path, exist_ok=True)
                folders_created += 1
                print("    ✓ " + _sub)

                # Create README in subfolder
                if _readme and _sub in _README:
                    _rme = os.path.join(_sub_path, "README.txt")
                    with open(_rme, 'w') as _f:
                        _f.write(_show_name + " / " + _ep + " / " + _sub + chr(10))
                        _f.write("=" * 50 + chr(10))
                        _f.write(_README[_sub] + chr(10))
                        _f.write("Created by FlowPins Pipeline Suite" + chr(10))
                        _f.write("Date: " + _ts + chr(10))

        print("")
        print("=" * 65)
        print("  ✓ DONE — " + str(folders_created) + " folders created")
        print("  Root: " + project_root)
        print("=" * 65)

    except Exception as _e:
        print("FlowPins ERROR: " + str(_e))
        success = False

{exec_out}`,


  "fs_find_missing_frames": `# Missing Frame Finder
# Scans a folder and auto-detects gaps in the frame sequence
# No expected range needed — figures it out from what's there
import os, re

_folder_{node_id}  = {folder_path}
_ext_{node_id}     = {extension}
_pad_{node_id}     = int({padding})

missing_frames = []
found_count    = 0
missing_count  = 0
first_frame    = 0
last_frame     = 0
is_complete    = True

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    # Scan folder and extract frame numbers from filenames
    _frames_{node_id} = []
    _digit_{node_id} = chr(92) + "d"
    _pattern_{node_id} = re.compile("(" + _digit_{node_id} + "+)" + re.escape(_ext_{node_id}) + "$", re.IGNORECASE)

    for _fn_{node_id} in os.listdir(_folder_{node_id}):
        _m_{node_id} = _pattern_{node_id}.search(_fn_{node_id})
        if _m_{node_id}:
            _frames_{node_id}.append(int(_m_{node_id}.group(1)))

    if not _frames_{node_id}:
        print("FlowPins: No " + _ext_{node_id} + " files found in " + _folder_{node_id})
    else:
        _frames_{node_id}.sort()
        first_frame  = _frames_{node_id}[0]
        last_frame   = _frames_{node_id}[-1]
        found_count  = len(_frames_{node_id})
        _frame_set_{node_id} = set(_frames_{node_id})

        # Find every gap between first and last
        for _f_{node_id} in range(first_frame, last_frame + 1):
            if _f_{node_id} not in _frame_set_{node_id}:
                missing_frames.append(_f_{node_id})

        missing_count = len(missing_frames)
        is_complete   = missing_count == 0

        print("FlowPins Missing Frame Finder")
        print("  Folder : " + _folder_{node_id})
        print("  Range  : " + str(first_frame) + " — " + str(last_frame))
        print("  Found  : " + str(found_count) + " frames")
        print("  Expected: " + str(last_frame - first_frame + 1) + " frames")
        print("-" * 50)

        if is_complete:
            print("  ✓ PASS — sequence is complete, no gaps found")
        else:
            print("  ✗ FAIL — " + str(missing_count) + " frames missing:")
            # Group consecutive missing frames for cleaner output
            _groups_{node_id} = []
            _start_{node_id}  = missing_frames[0]
            _prev_{node_id}   = missing_frames[0]
            for _mf_{node_id} in missing_frames[1:]:
                if _mf_{node_id} != _prev_{node_id} + 1:
                    _groups_{node_id}.append((_start_{node_id}, _prev_{node_id}))
                    _start_{node_id} = _mf_{node_id}
                _prev_{node_id} = _mf_{node_id}
            _groups_{node_id}.append((_start_{node_id}, _prev_{node_id}))

            for _gs_{node_id}, _ge_{node_id} in _groups_{node_id}:
                if _gs_{node_id} == _ge_{node_id}:
                    print("    Missing: " + str(_gs_{node_id}).zfill(_pad_{node_id}))
                else:
                    print("    Missing: " + str(_gs_{node_id}).zfill(_pad_{node_id}) +
                          " — " + str(_ge_{node_id}).zfill(_pad_{node_id}) +
                          " (" + str(_ge_{node_id} - _gs_{node_id} + 1) + " frames)")

{exec_out}`,


  "fs_folder_diff": `# Folder Diff
# Compares two folders — what's missing, extra, or matched
import os

_src_{node_id}     = {source_folder}
_tgt_{node_id}     = {target_folder}
_ext_{node_id}     = {extension}
_show_{node_id}    = str("{show_matched}").lower() == "true"

missing_files = []
extra_files   = []
matched_count = 0
missing_count = 0
extra_count   = 0
is_match      = False

if not os.path.isdir(_src_{node_id}):
    print("FlowPins ERROR: Source folder not found — " + str(_src_{node_id}))
elif not os.path.isdir(_tgt_{node_id}):
    print("FlowPins ERROR: Target folder not found — " + str(_tgt_{node_id}))
else:
    # Get file sets for both folders
    def _get_files_{node_id}(folder):
        return set(
            f for f in os.listdir(folder)
            if f.lower().endswith(_ext_{node_id}.lower())
        )

    _src_files_{node_id} = _get_files_{node_id}(_src_{node_id})
    _tgt_files_{node_id} = _get_files_{node_id}(_tgt_{node_id})

    _matched_{node_id}  = _src_files_{node_id} & _tgt_files_{node_id}
    _missing_{node_id}  = _src_files_{node_id} - _tgt_files_{node_id}
    _extra_{node_id}    = _tgt_files_{node_id} - _src_files_{node_id}

    missing_files = sorted(_missing_{node_id})
    extra_files   = sorted(_extra_{node_id})
    matched_count = len(_matched_{node_id})
    missing_count = len(missing_files)
    extra_count   = len(extra_files)
    is_match      = missing_count == 0 and extra_count == 0

    print("FlowPins Folder Diff")
    print("  Source : " + _src_{node_id})
    print("  Target : " + _tgt_{node_id})
    print("  Extension: " + _ext_{node_id})
    print("-" * 55)
    print("  Source files : " + str(len(_src_files_{node_id})))
    print("  Target files : " + str(len(_tgt_files_{node_id})))
    print("  Matched      : " + str(matched_count))
    print("-" * 55)

    if _show_{node_id} and _matched_{node_id}:
        print("MATCHED (" + str(matched_count) + "):")
        for _f_{node_id} in sorted(_matched_{node_id}):
            print("  ✓ " + _f_{node_id})

    if missing_files:
        print("MISSING FROM TARGET (" + str(missing_count) + "):")
        for _f_{node_id} in missing_files:
            print("  ✗ " + _f_{node_id})
    else:
        print("MISSING: none")

    if extra_files:
        print("EXTRA IN TARGET (" + str(extra_count) + "):")
        for _f_{node_id} in extra_files:
            print("  + " + _f_{node_id})
    else:
        print("EXTRA: none")

    print("-" * 55)
    if is_match:
        print("RESULT: ✓ FOLDERS MATCH — " + str(matched_count) + " files identical")
    else:
        _issues_{node_id} = []
        if missing_count: _issues_{node_id}.append(str(missing_count) + " missing")
        if extra_count:   _issues_{node_id}.append(str(extra_count) + " extra")
        print("RESULT: ✗ MISMATCH — " + ", ".join(_issues_{node_id}))

{exec_out}`,


  "fs_batch_rename": `# Batch File Renamer
# Renames files in bulk — add prefix/suffix, find/replace, or resequence
import os

_folder_{node_id}   = str({folder_path}).replace(chr(92), "/")
_ext_{node_id}      = "{extension}"
_mode_{node_id}     = "{mode}"
_prefix_{node_id}   = "{add_prefix}"
_suffix_{node_id}   = "{add_suffix}"
_find_{node_id}     = "{find_text}"
_replace_{node_id}  = "{replace_text}"
_dry_{node_id}      = str("{dry_run}").lower() == "true"

renamed_count = 0
skipped_count = 0
success       = False

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    _files_{node_id} = sorted([
        f for f in os.listdir(_folder_{node_id})
        if f.lower().endswith(_ext_{node_id}.lower())
    ])

    if not _files_{node_id}:
        print("FlowPins: No " + _ext_{node_id} + " files found in " + _folder_{node_id})
    else:
        print("FlowPins Batch File Renamer")
        print("  Folder : " + _folder_{node_id})
        print("  Mode   : " + _mode_{node_id})
        print("  Files  : " + str(len(_files_{node_id})))
        if _dry_{node_id}:
            print("  DRY RUN — no files will be renamed")
        print("-" * 55)

        _rename_pairs_{node_id} = []

        for _fn_{node_id} in _files_{node_id}:
            _stem_{node_id} = os.path.splitext(_fn_{node_id})[0]
            _new_stem_{node_id} = _stem_{node_id}

            if _mode_{node_id} == "add_prefix" and _prefix_{node_id}:
                _new_stem_{node_id} = _prefix_{node_id} + _stem_{node_id}
            elif _mode_{node_id} == "add_suffix" and _suffix_{node_id}:
                _new_stem_{node_id} = _stem_{node_id} + _suffix_{node_id}
            elif _mode_{node_id} == "find_replace" and _find_{node_id}:
                _new_stem_{node_id} = _stem_{node_id}.replace(_find_{node_id}, _replace_{node_id})

            _new_name_{node_id} = _new_stem_{node_id} + _ext_{node_id}

            if _new_name_{node_id} != _fn_{node_id}:
                _rename_pairs_{node_id}.append((_fn_{node_id}, _new_name_{node_id}))
            else:
                skipped_count += 1

        # Resequence mode — renumber all files from 0001
        if _mode_{node_id} == "resequence":
            _rename_pairs_{node_id} = []
            skipped_count = 0
            for _i_{node_id}, _fn_{node_id} in enumerate(_files_{node_id}, start=1):
                _new_name_{node_id} = str(_i_{node_id}).zfill(4) + _ext_{node_id}
                if _new_name_{node_id} != _fn_{node_id}:
                    _rename_pairs_{node_id}.append((_fn_{node_id}, _new_name_{node_id}))
                else:
                    skipped_count += 1

        # Preview or execute
        for _old_{node_id}, _new_{node_id} in _rename_pairs_{node_id}:
            if _dry_{node_id}:
                print("  PREVIEW: " + _old_{node_id} + " → " + _new_{node_id})
            else:
                _src_path_{node_id} = os.path.join(_folder_{node_id}, _old_{node_id})
                _dst_path_{node_id} = os.path.join(_folder_{node_id}, _new_{node_id})
                try:
                    os.rename(_src_path_{node_id}, _dst_path_{node_id})
                    print("  RENAMED: " + _old_{node_id} + " → " + _new_{node_id})
                    renamed_count += 1
                except Exception as _e_{node_id}:
                    print("  ERROR: " + _old_{node_id} + " — " + str(_e_{node_id}))
                    skipped_count += 1

        if _dry_{node_id}:
            renamed_count = len(_rename_pairs_{node_id})

        print("-" * 55)
        if _dry_{node_id}:
            print("DRY RUN COMPLETE — " + str(renamed_count) + " files would be renamed")
            print("Set Dry Run to false to apply changes")
        else:
            print("DONE — " + str(renamed_count) + " files renamed, " + str(skipped_count) + " skipped")

        success = True

{exec_out}`,


  "fs_file_size_report": `# File Size Reporter
# Scans a folder and reports file sizes, largest files, and threshold violations
import os

_folder_{node_id}    = {folder_path}
_ext_{node_id}       = "{extension}"
_threshold_{node_id} = int({threshold_mb})
_show_all_{node_id}  = str("{show_all}").lower() == "true"
_top_{node_id}       = int({top_count})

total_size_mb  = 0
file_count     = 0
largest_file   = ""
over_threshold = []

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    # Collect all files with sizes
    _file_sizes_{node_id} = []
    for _fn_{node_id} in os.listdir(_folder_{node_id}):
        if _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()):
            _fp_{node_id} = os.path.join(_folder_{node_id}, _fn_{node_id})
            try:
                _size_{node_id} = os.path.getsize(_fp_{node_id})
                _file_sizes_{node_id}.append((_fn_{node_id}, _size_{node_id}))
            except:
                pass

    if not _file_sizes_{node_id}:
        print("FlowPins: No " + _ext_{node_id} + " files found in " + _folder_{node_id})
    else:
        # Sort by size descending
        _file_sizes_{node_id}.sort(key=lambda x: x[1], reverse=True)

        _total_bytes_{node_id} = sum(s for _, s in _file_sizes_{node_id})
        file_count    = len(_file_sizes_{node_id})
        total_size_mb = round(_total_bytes_{node_id} / (1024 * 1024), 2)
        largest_file  = _file_sizes_{node_id}[0][0]
        _avg_mb_{node_id} = round(total_size_mb / file_count, 3)

        # Find files over threshold
        _thresh_bytes_{node_id} = _threshold_{node_id} * 1024 * 1024
        over_threshold = [
            _fn_{node_id} + " (" + str(round(_sz_{node_id} / (1024*1024), 2)) + " MB)"
            for _fn_{node_id}, _sz_{node_id} in _file_sizes_{node_id}
            if _sz_{node_id} > _thresh_bytes_{node_id}
        ]

        print("FlowPins File Size Reporter")
        print("  Folder    : " + _folder_{node_id})
        print("  Extension : " + _ext_{node_id})
        print("  Files     : " + str(file_count))
        print("  Total     : " + str(total_size_mb) + " MB")
        print("  Average   : " + str(_avg_mb_{node_id}) + " MB per file")
        print("  Largest   : " + largest_file + " (" + str(round(_file_sizes_{node_id}[0][1] / (1024*1024), 2)) + " MB)")
        print("  Threshold : " + str(_threshold_{node_id}) + " MB")
        print("-" * 55)

        # Top N largest files
        print("TOP " + str(_top_{node_id}) + " LARGEST FILES:")
        for _fn_{node_id}, _sz_{node_id} in _file_sizes_{node_id}[:_top_{node_id}]:
            _mb_{node_id} = round(_sz_{node_id} / (1024 * 1024), 2)
            _bar_{node_id} = "█" * min(int(_mb_{node_id} * 2), 20)
            print("  " + _bar_{node_id} + " " + str(_mb_{node_id}) + " MB  " + _fn_{node_id})

        # Show all files if requested
        if _show_all_{node_id} and len(_file_sizes_{node_id}) > _top_{node_id}:
            print("")
            print("ALL FILES:")
            for _fn_{node_id}, _sz_{node_id} in _file_sizes_{node_id}:
                _mb_{node_id} = round(_sz_{node_id} / (1024 * 1024), 2)
                print("  " + str(_mb_{node_id}) + " MB  " + _fn_{node_id})

        # Threshold violations
        print("")
        if over_threshold:
            print("OVER THRESHOLD (" + str(_threshold_{node_id}) + " MB) — " + str(len(over_threshold)) + " files:")
            for _of_{node_id} in over_threshold:
                print("  ⚠ " + _of_{node_id})
        else:
            print("THRESHOLD: ✓ All files under " + str(_threshold_{node_id}) + " MB")

        print("-" * 55)
        print("SUMMARY: " + str(file_count) + " files, " + str(total_size_mb) + " MB total, " + str(_avg_mb_{node_id}) + " MB avg")

{exec_out}`,


  "fs_find_duplicates": `# Duplicate File Finder
# Finds identical files by content (MD5) or by name
import os, hashlib

_folder_{node_id}    = {folder_path}
_ext_{node_id}       = "{extension}"
_mode_{node_id}      = "{mode}"
_recursive_{node_id} = str("{recursive}").lower() == "true"

duplicate_groups = []
duplicate_count  = 0
wasted_mb        = 0
has_duplicates   = False

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    # Collect files
    _all_files_{node_id} = []
    if _recursive_{node_id}:
        for _r_{node_id}, _d_{node_id}, _f_{node_id} in os.walk(_folder_{node_id}):
            for _fn_{node_id} in _f_{node_id}:
                if _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()):
                    _all_files_{node_id}.append(os.path.join(_r_{node_id}, _fn_{node_id}))
    else:
        for _fn_{node_id} in os.listdir(_folder_{node_id}):
            if _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()):
                _all_files_{node_id}.append(os.path.join(_folder_{node_id}, _fn_{node_id}))

    print("FlowPins Duplicate File Finder")
    print("  Folder : " + _folder_{node_id})
    print("  Mode   : " + _mode_{node_id})
    print("  Files  : " + str(len(_all_files_{node_id})))
    print("-" * 55)

    if _mode_{node_id} == "content":
        # MD5 hash each file and group by hash
        _hash_map_{node_id} = {}
        for _fp_{node_id} in _all_files_{node_id}:
            try:
                _md5_{node_id} = hashlib.md5()
                with open(_fp_{node_id}, "rb") as _f_{node_id}:
                    for _chunk_{node_id} in iter(lambda: _f_{node_id}.read(8192), b""):
                        _md5_{node_id}.update(_chunk_{node_id})
                _h_{node_id} = _md5_{node_id}.hexdigest()
                if _h_{node_id} not in _hash_map_{node_id}:
                    _hash_map_{node_id}[_h_{node_id}] = []
                _hash_map_{node_id}[_h_{node_id}].append(_fp_{node_id})
            except Exception as _e_{node_id}:
                print("  ERROR: " + _fp_{node_id} + " — " + str(_e_{node_id}))

        # Find groups with more than one file
        for _h_{node_id}, _files_{node_id} in _hash_map_{node_id}.items():
            if len(_files_{node_id}) > 1:
                duplicate_groups.append(_files_{node_id})

    else:
        # Name-based deduplication
        _name_map_{node_id} = {}
        for _fp_{node_id} in _all_files_{node_id}:
            _name_{node_id} = os.path.basename(_fp_{node_id})
            if _name_{node_id} not in _name_map_{node_id}:
                _name_map_{node_id}[_name_{node_id}] = []
            _name_map_{node_id}[_name_{node_id}].append(_fp_{node_id})

        for _name_{node_id}, _files_{node_id} in _name_map_{node_id}.items():
            if len(_files_{node_id}) > 1:
                duplicate_groups.append(_files_{node_id})

    # Calculate wasted space
    _wasted_bytes_{node_id} = 0
    for _group_{node_id} in duplicate_groups:
        # All but one are wasted
        _sizes_{node_id} = []
        for _fp_{node_id} in _group_{node_id}:
            try:
                _sizes_{node_id}.append(os.path.getsize(_fp_{node_id}))
            except:
                _sizes_{node_id}.append(0)
        if _sizes_{node_id}:
            _wasted_bytes_{node_id} += sum(_sizes_{node_id}) - max(_sizes_{node_id})

    duplicate_count = sum(len(g) - 1 for g in duplicate_groups)
    wasted_mb       = round(_wasted_bytes_{node_id} / (1024 * 1024), 2)
    has_duplicates  = len(duplicate_groups) > 0

    if not has_duplicates:
        print("  ✓ No duplicates found!")
    else:
        print("  ✗ Found " + str(len(duplicate_groups)) + " duplicate groups (" + str(duplicate_count) + " extra files)")
        print("  Wasted space: " + str(wasted_mb) + " MB")
        print("")
        for _i_{node_id}, _group_{node_id} in enumerate(duplicate_groups, 1):
            print("  GROUP " + str(_i_{node_id}) + ":")
            for _fp_{node_id} in _group_{node_id}:
                print("    " + _fp_{node_id})

    print("-" * 55)
    print("SUMMARY: " + str(len(duplicate_groups)) + " groups, " + str(duplicate_count) + " duplicates, " + str(wasted_mb) + " MB wasted")

{exec_out}`,


  "fs_stale_file_report": `# Stale File Reporter
# Finds files not modified in X days
import os, time

_folder_{node_id}   = {folder_path}
_ext_{node_id}      = "{extension}"
_days_{node_id}     = int({days_old})
_recursive_{node_id}= str("{recursive}").lower() == "true"
_now_{node_id}      = time.time()
_cutoff_{node_id}   = _now_{node_id} - (_days_{node_id} * 86400)

stale_files  = []
stale_count  = 0
stale_mb     = 0
has_stale    = False

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    # Collect files
    _all_files_{node_id} = []
    if _recursive_{node_id}:
        for _r_{node_id}, _d_{node_id}, _f_{node_id} in os.walk(_folder_{node_id}):
            for _fn_{node_id} in _f_{node_id}:
                if _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()):
                    _all_files_{node_id}.append(os.path.join(_r_{node_id}, _fn_{node_id}))
    else:
        for _fn_{node_id} in os.listdir(_folder_{node_id}):
            if _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()):
                _all_files_{node_id}.append(os.path.join(_folder_{node_id}, _fn_{node_id}))

    print("FlowPins Stale File Reporter")
    print("  Folder    : " + _folder_{node_id})
    print("  Extension : " + _ext_{node_id})
    print("  Stale if  : not modified in " + str(_days_{node_id}) + " days")
    print("  Files     : " + str(len(_all_files_{node_id})))
    print("-" * 55)

    _stale_data_{node_id} = []
    _total_bytes_{node_id} = 0

    for _fp_{node_id} in sorted(_all_files_{node_id}):
        try:
            _mtime_{node_id} = os.path.getmtime(_fp_{node_id})
            _size_{node_id}  = os.path.getsize(_fp_{node_id})
            if _mtime_{node_id} < _cutoff_{node_id}:
                _age_days_{node_id} = int((_now_{node_id} - _mtime_{node_id}) / 86400)
                _stale_data_{node_id}.append((_fp_{node_id}, _age_days_{node_id}, _size_{node_id}))
                _total_bytes_{node_id} += _size_{node_id}
                stale_files.append(os.path.basename(_fp_{node_id}) + " (" + str(_age_days_{node_id}) + " days old)")
        except Exception as _e_{node_id}:
            print("  ERROR: " + _fp_{node_id} + " — " + str(_e_{node_id}))

    stale_count = len(_stale_data_{node_id})
    stale_mb    = round(_total_bytes_{node_id} / (1024 * 1024), 2)
    has_stale   = stale_count > 0

    if not has_stale:
        print("  ✓ No stale files found — all files modified within " + str(_days_{node_id}) + " days")
    else:
        print("  ✗ Found " + str(stale_count) + " stale files (" + str(stale_mb) + " MB)")
        print("")
        # Sort by age descending — oldest first
        _stale_data_{node_id}.sort(key=lambda x: x[1], reverse=True)
        for _fp_{node_id}, _age_{node_id}, _sz_{node_id} in _stale_data_{node_id}:
            _mb_{node_id} = round(_sz_{node_id} / (1024 * 1024), 2)
            print("  " + str(_age_{node_id}).rjust(4) + " days  " + str(_mb_{node_id}) + " MB  " + os.path.basename(_fp_{node_id}))

    print("-" * 55)
    print("SUMMARY: " + str(stale_count) + " stale files, " + str(stale_mb) + " MB recoverable")

{exec_out}`,


  // ==========================================================================
  // PIPELINE SUITE — CATEGORY 3: RENDER MANAGEMENT
  // ==========================================================================

  "rnd_progress_checker": `# Render Progress Checker
# Counts rendered frames vs expected and shows % complete
import os, re

_folder_{node_id}  = {folder_path}
_ext_{node_id}     = extension if isinstance(extension, str) and extension.startswith(".") else "{extension}"
_start_{node_id}   = int({start_frame})
_end_{node_id}     = int({end_frame})

frames_done    = 0
frames_total   = 0
percent_done   = 0
frames_missing = 0
is_complete    = False

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    frames_total = _end_{node_id} - _start_{node_id} + 1

    # Build expected set
    _expected_{node_id} = set(range(_start_{node_id}, _end_{node_id} + 1))

    # Scan for rendered frames using regex to extract frame number
    _digit_{node_id}   = chr(92) + "d"
    _pattern_{node_id} = re.compile("(" + _digit_{node_id} + "+)" + re.escape(_ext_{node_id}) + "$", re.IGNORECASE)
    _found_{node_id}   = set()

    for _fn_{node_id} in os.listdir(_folder_{node_id}):
        _m_{node_id} = _pattern_{node_id}.search(_fn_{node_id})
        if _m_{node_id}:
            _fnum_{node_id} = int(_m_{node_id}.group(1))
            if _start_{node_id} <= _fnum_{node_id} <= _end_{node_id}:
                _found_{node_id}.add(_fnum_{node_id})

    _missing_{node_id} = sorted(_expected_{node_id} - _found_{node_id})

    frames_done    = len(_found_{node_id})
    frames_missing = len(_missing_{node_id})
    percent_done   = round((frames_done / frames_total) * 100) if frames_total > 0 else 0
    is_complete    = frames_missing == 0

    # Progress bar
    _bar_fill_{node_id}  = int(percent_done / 5)
    _bar_{node_id}       = "█" * _bar_fill_{node_id} + "░" * (20 - _bar_fill_{node_id})

    print("FlowPins Render Progress Checker")
    print("  Folder  : " + _folder_{node_id})
    print("  Range   : " + str(_start_{node_id}) + " — " + str(_end_{node_id}))
    print("  Expected: " + str(frames_total) + " frames")
    print("-" * 55)
    print("  [" + _bar_{node_id} + "] " + str(percent_done) + "%")
    print("  Done    : " + str(frames_done) + " / " + str(frames_total) + " frames")
    print("  Missing : " + str(frames_missing) + " frames")
    print("-" * 55)

    if is_complete:
        print("  ✓ RENDER COMPLETE — all " + str(frames_total) + " frames present")
    else:
        print("  ⟳ IN PROGRESS — " + str(frames_missing) + " frames remaining")
        # Group consecutive missing frames
        if _missing_{node_id}:
            _groups_{node_id} = []
            _gs_{node_id} = _missing_{node_id}[0]
            _gp_{node_id} = _missing_{node_id}[0]
            for _mf_{node_id} in _missing_{node_id}[1:]:
                if _mf_{node_id} != _gp_{node_id} + 1:
                    _groups_{node_id}.append((_gs_{node_id}, _gp_{node_id}))
                    _gs_{node_id} = _mf_{node_id}
                _gp_{node_id} = _mf_{node_id}
            _groups_{node_id}.append((_gs_{node_id}, _gp_{node_id}))
            for _ga_{node_id}, _gb_{node_id} in _groups_{node_id}:
                if _ga_{node_id} == _gb_{node_id}:
                    print("    Still needed: " + str(_ga_{node_id}).zfill(4))
                else:
                    print("    Still needed: " + str(_ga_{node_id}).zfill(4) + " — " + str(_gb_{node_id}).zfill(4) + " (" + str(_gb_{node_id} - _ga_{node_id} + 1) + " frames)")

{exec_out}`,


  "rnd_frame_range_validator": `# Frame Range Validator
# Strict pass/fail — confirms folder covers expected range exactly
# No gaps allowed, no extra frames outside the range
import os, re

_folder_{node_id}  = {folder_path}
_ext_{node_id}     = extension if isinstance(extension, str) and extension.startswith(".") else "{extension}"
_start_{node_id}   = int({start_frame})
_end_{node_id}     = int({end_frame})

is_valid        = False
frames_found    = 0
frames_expected = 0
missing_frames  = []
extra_frames    = []

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    frames_expected = _end_{node_id} - _start_{node_id} + 1
    _expected_{node_id} = set(range(_start_{node_id}, _end_{node_id} + 1))

    # Scan folder and extract frame numbers
    _digit_{node_id}   = chr(92) + "d"
    _pattern_{node_id} = re.compile("(" + _digit_{node_id} + "+)" + re.escape(_ext_{node_id}) + "$", re.IGNORECASE)
    _found_nums_{node_id} = set()

    for _fn_{node_id} in os.listdir(_folder_{node_id}):
        _m_{node_id} = _pattern_{node_id}.search(_fn_{node_id})
        if _m_{node_id}:
            _found_nums_{node_id}.add(int(_m_{node_id}.group(1)))

    frames_found   = len(_found_nums_{node_id})
    missing_frames = sorted(_expected_{node_id} - _found_nums_{node_id})
    extra_frames   = sorted(_found_nums_{node_id} - _expected_{node_id})
    is_valid       = len(missing_frames) == 0 and len(extra_frames) == 0

    print("FlowPins Frame Range Validator")
    print("  Folder   : " + _folder_{node_id})
    print("  Expected : frames " + str(_start_{node_id}) + " — " + str(_end_{node_id}) + " (" + str(frames_expected) + " frames)")
    print("  Found    : " + str(frames_found) + " frames")
    print("-" * 55)

    if missing_frames:
        print("  MISSING (" + str(len(missing_frames)) + "):")
        # Group consecutive
        _groups_{node_id} = []
        _gs_{node_id} = missing_frames[0]
        _gp_{node_id} = missing_frames[0]
        for _mf_{node_id} in missing_frames[1:]:
            if _mf_{node_id} != _gp_{node_id} + 1:
                _groups_{node_id}.append((_gs_{node_id}, _gp_{node_id}))
                _gs_{node_id} = _mf_{node_id}
            _gp_{node_id} = _mf_{node_id}
        _groups_{node_id}.append((_gs_{node_id}, _gp_{node_id}))
        for _ga_{node_id}, _gb_{node_id} in _groups_{node_id}:
            if _ga_{node_id} == _gb_{node_id}:
                print("    ✗ " + str(_ga_{node_id}).zfill(4))
            else:
                print("    ✗ " + str(_ga_{node_id}).zfill(4) + " — " + str(_gb_{node_id}).zfill(4) + " (" + str(_gb_{node_id} - _ga_{node_id} + 1) + " frames)")
    else:
        print("  MISSING  : none")

    if extra_frames:
        print("  EXTRA (" + str(len(extra_frames)) + ") — frames outside expected range:")
        for _ef_{node_id} in extra_frames[:10]:
            print("    + " + str(_ef_{node_id}).zfill(4))
        if len(extra_frames) > 10:
            print("    ... and " + str(len(extra_frames) - 10) + " more")
    else:
        print("  EXTRA    : none")

    print("-" * 55)
    if is_valid:
        print("  ✓ PASS — frame range is valid and complete")
    else:
        _issues_{node_id} = []
        if missing_frames: _issues_{node_id}.append(str(len(missing_frames)) + " missing")
        if extra_frames:   _issues_{node_id}.append(str(len(extra_frames)) + " extra")
        print("  ✗ FAIL — " + ", ".join(_issues_{node_id}))

{exec_out}`,


  "rnd_multi_shot_progress": `# Multi-Shot Progress Board
# Reads a CSV shot list and reports render progress across all shots
import os, re, csv
from datetime import datetime

_csv_{node_id}    = r"{csv_path}".replace(chr(92), "/")
_save_{node_id}   = str("{save_report}").lower() == "true"

total_shots    = 0
complete_shots = 0
in_progress    = 0
not_started    = 0
all_complete   = False

if not os.path.isfile(_csv_{node_id}):
    print("FlowPins ERROR: Shot list not found — " + _csv_{node_id})
else:
    _shots_{node_id} = []
    try:
        with open(_csv_{node_id}, newline="", encoding="utf-8-sig") as _f_{node_id}:
            _reader_{node_id} = csv.DictReader(_f_{node_id})
            for _row_{node_id} in _reader_{node_id}:
                _shots_{node_id}.append({k.strip(): v.strip() for k, v in _row_{node_id}.items()})
    except Exception as _e_{node_id}:
        print("FlowPins ERROR reading CSV: " + str(_e_{node_id}))

    total_shots = len(_shots_{node_id})
    _ts_{node_id} = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _results_{node_id} = []

    print("=" * 65)
    print("  FLOWPINS MULTI-SHOT PROGRESS BOARD")
    print("  " + _ts_{node_id})
    print("  Shots: " + str(total_shots))
    print("=" * 65)
    print("")
    print("  {:<20} {:>8} {:>8} {:>8} {:>6}  {}".format(
        "SHOT", "EXPECTED", "FOUND", "MISSING", "%", "STATUS"))
    print("  " + "-" * 63)

    _digit_{node_id} = chr(92) + "d"

    for _shot_{node_id} in _shots_{node_id}:
        _name_{node_id}   = _shot_{node_id}.get("shot_name",    "unknown")
        _folder_{node_id} = _shot_{node_id}.get("folder_path",  "").replace(chr(92), "/")
        _start_{node_id}  = int(_shot_{node_id}.get("start_frame", "1") or 1)
        _end_{node_id}    = int(_shot_{node_id}.get("end_frame",   "1") or 1)
        _ext_{node_id}    = _shot_{node_id}.get("extension",    ".png")

        _expected_count_{node_id} = _end_{node_id} - _start_{node_id} + 1
        _found_{node_id} = set()

        if os.path.isdir(_folder_{node_id}):
            _pat_{node_id} = re.compile(
                "(" + _digit_{node_id} + "+)" + re.escape(_ext_{node_id}) + "$",
                re.IGNORECASE
            )
            for _fn_{node_id} in os.listdir(_folder_{node_id}):
                _m_{node_id} = _pat_{node_id}.search(_fn_{node_id})
                if _m_{node_id}:
                    _fnum_{node_id} = int(_m_{node_id}.group(1))
                    if _start_{node_id} <= _fnum_{node_id} <= _end_{node_id}:
                        _found_{node_id}.add(_fnum_{node_id})

        _found_count_{node_id}   = len(_found_{node_id})
        _missing_count_{node_id} = _expected_count_{node_id} - _found_count_{node_id}
        _pct_{node_id}           = round((_found_count_{node_id} / _expected_count_{node_id}) * 100) if _expected_count_{node_id} > 0 else 0

        if not os.path.isdir(_folder_{node_id}):
            _status_{node_id} = "NOT FOUND"
            not_started += 1
        elif _found_count_{node_id} == 0:
            _status_{node_id} = "NOT STARTED"
            not_started += 1
        elif _missing_count_{node_id} == 0:
            _status_{node_id} = "COMPLETE"
            complete_shots += 1
        else:
            _bar_fill_{node_id} = int(_pct_{node_id} / 10)
            _bar_{node_id} = chr(9608) * _bar_fill_{node_id} + chr(9617) * (10 - _bar_fill_{node_id})
            _status_{node_id} = "[" + _bar_{node_id} + "] IN PROGRESS"
            in_progress += 1

        print("  {:<20} {:>8} {:>8} {:>8} {:>5}%  {}".format(
            _name_{node_id}[:20],
            _expected_count_{node_id},
            _found_count_{node_id},
            _missing_count_{node_id},
            _pct_{node_id},
            _status_{node_id}
        ))

        _results_{node_id}.append({
            "shot": _name_{node_id}, "folder": _folder_{node_id},
            "expected": _expected_count_{node_id}, "found": _found_count_{node_id},
            "missing": _missing_count_{node_id}, "percent": _pct_{node_id},
            "status": _status_{node_id}
        })

    all_complete = complete_shots == total_shots

    print("")
    print("=" * 65)
    print("  SUMMARY")
    print("  Complete    : " + str(complete_shots) + "/" + str(total_shots) + " shots")
    print("  In Progress : " + str(in_progress) + " shots")
    print("  Not Started : " + str(not_started) + " shots")
    if all_complete:
        print("  STATUS      : ALL SHOTS COMPLETE")
    else:
        print("  STATUS      : " + str(total_shots - complete_shots) + " shots still rendering")
    print("=" * 65)

    if _save_{node_id}:
        _rname_{node_id} = "progress_report_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".csv"
        _rpath_{node_id} = os.path.join(os.path.dirname(_csv_{node_id}), _rname_{node_id})
        try:
            with open(_rpath_{node_id}, "w", newline="", encoding="utf-8") as _rf_{node_id}:
                _w_{node_id} = csv.writer(_rf_{node_id})
                _w_{node_id}.writerow(["Shot","Expected","Found","Missing","Percent","Status","Folder"])
                for _r_{node_id} in _results_{node_id}:
                    _w_{node_id}.writerow([_r_{node_id}["shot"],_r_{node_id}["expected"],
                        _r_{node_id}["found"],_r_{node_id}["missing"],
                        str(_r_{node_id}["percent"])+"%",_r_{node_id}["status"],_r_{node_id}["folder"]])
            print("  Report: " + _rpath_{node_id})
        except Exception as _re_{node_id}:
            print("  Report save failed: " + str(_re_{node_id}))

{exec_out}`,


  "rnd_error_scanner": `# Render Error Scanner
# Scans render log files for common error strings
import os, re
from datetime import datetime

_log_folder_{node_id}  = "{log_folder}".replace(chr(92), "/")
_log_ext_{node_id}     = "{log_extension}" if "{log_extension}".startswith(".") else "." + "{log_extension}"
_custom_{node_id}      = "{custom_errors}"
_show_warn_{node_id}   = str("{show_warnings}").lower() == "true"
_max_{node_id}         = int({max_errors})

# Normalise path
if isinstance(_log_folder_{node_id}, str):
    _log_folder_{node_id} = _log_folder_{node_id}.replace(chr(92), "/")

error_count   = 0
warning_count = 0
error_lines   = []
has_errors    = False

# Common error patterns across DCCs
_ERROR_PATTERNS_{node_id} = [
    "error", "failed", "failure", "fatal", "exception",
    "traceback", "cannot open", "file not found",
    "out of memory", "crash", "aborted", "killed",
    "permission denied", "access denied", "disk full",
    "rendering aborted", "frame failed", "job failed"
]

# Common warning patterns
_WARN_PATTERNS_{node_id} = [
    "warning", "warn:", "deprecated", "missing texture",
    "missing file", "not found", "skipping"
]

# Add custom error strings
if _custom_{node_id}:
    for _ce_{node_id} in _custom_{node_id}.split(","):
        _ce_{node_id} = _ce_{node_id}.strip().lower()
        if _ce_{node_id}:
            _ERROR_PATTERNS_{node_id}.append(_ce_{node_id})

if not _log_folder_{node_id} or not os.path.isdir(_log_folder_{node_id}):
    print("FlowPins ERROR: Log folder not found — " + str(_log_folder_{node_id}))
else:
    # Find all log files
    _log_files_{node_id} = []
    for _fn_{node_id} in sorted(os.listdir(_log_folder_{node_id})):
        if _fn_{node_id}.lower().endswith(_log_ext_{node_id}.lower()):
            _log_files_{node_id}.append(os.path.join(_log_folder_{node_id}, _fn_{node_id}))

    print("FlowPins Render Error Scanner")
    print("  Log Folder : " + _log_folder_{node_id})
    print("  Log Files  : " + str(len(_log_files_{node_id})))
    print("  Extension  : " + _log_ext_{node_id})
    print("-" * 55)

    if not _log_files_{node_id}:
        print("  No " + _log_ext_{node_id} + " files found in folder")
    else:
        for _lf_{node_id} in _log_files_{node_id}:
            _fname_{node_id} = os.path.basename(_lf_{node_id})
            _file_errors_{node_id}   = []
            _file_warnings_{node_id} = []

            try:
                with open(_lf_{node_id}, "r", encoding="utf-8", errors="ignore") as _f_{node_id}:
                    for _lnum_{node_id}, _line_{node_id} in enumerate(_f_{node_id}, 1):
                        _lower_{node_id} = _line_{node_id}.lower().strip()
                        if not _lower_{node_id}:
                            continue

                        # Check for errors
                        _is_err_{node_id} = any(p in _lower_{node_id} for p in _ERROR_PATTERNS_{node_id})
                        _is_warn_{node_id} = any(p in _lower_{node_id} for p in _WARN_PATTERNS_{node_id})

                        if _is_err_{node_id}:
                            _file_errors_{node_id}.append("  Line " + str(_lnum_{node_id}) + ": " + _line_{node_id}.strip()[:120])
                        elif _is_warn_{node_id} and _show_warn_{node_id}:
                            _file_warnings_{node_id}.append("  Line " + str(_lnum_{node_id}) + ": " + _line_{node_id}.strip()[:120])

            except Exception as _e_{node_id}:
                _file_errors_{node_id}.append("  Could not read file: " + str(_e_{node_id}))

            # Report per file
            if _file_errors_{node_id} or _file_warnings_{node_id}:
                print("")
                print("FILE: " + _fname_{node_id})
                if _file_errors_{node_id}:
                    print("  ERRORS (" + str(len(_file_errors_{node_id})) + "):")
                    for _el_{node_id} in _file_errors_{node_id}[:_max_{node_id}]:
                        print("  ✗ " + _el_{node_id})
                        error_lines.append(_fname_{node_id} + " — " + _el_{node_id}.strip())
                    if len(_file_errors_{node_id}) > _max_{node_id}:
                        print("  ... and " + str(len(_file_errors_{node_id}) - _max_{node_id}) + " more errors")
                if _file_warnings_{node_id} and _show_warn_{node_id}:
                    print("  WARNINGS (" + str(len(_file_warnings_{node_id})) + "):")
                    for _wl_{node_id} in _file_warnings_{node_id}[:10]:
                        print("  ⚠ " + _wl_{node_id})
            else:
                print("  ✓ " + _fname_{node_id} + " — clean")

            error_count   += len(_file_errors_{node_id})
            warning_count += len(_file_warnings_{node_id})

        has_errors = error_count > 0

        print("")
        print("-" * 55)
        if has_errors:
            print("RESULT: ✗ " + str(error_count) + " errors found across " + str(len(_log_files_{node_id})) + " log files")
        else:
            print("RESULT: ✓ No errors found — all logs clean")
        if warning_count > 0:
            print("        ⚠ " + str(warning_count) + " warnings")

{exec_out}`,


  "rnd_size_estimator": `# Render Size Estimator
# Estimates disk space needed for a render sequence
_width_{node_id}       = int({width})
_height_{node_id}      = int({height})
_frames_{node_id}      = int({frame_count})
_bit_depth_{node_id}   = int({bit_depth})
_format_{node_id}      = "{format}"
_channels_{node_id}    = int({channels})

# Compression ratios per format (approximate)
_COMPRESSION_{node_id} = {
    "PNG":  0.5,
    "EXR":  0.6,
    "TIFF": 0.9,
    "TGA":  0.8,
    "JPG":  0.1,
    "DPX":  1.0
}

_bytes_per_pixel_{node_id} = (_bit_depth_{node_id} / 8) * _channels_{node_id}
_raw_frame_bytes_{node_id} = _width_{node_id} * _height_{node_id} * _bytes_per_pixel_{node_id}
_compression_{node_id}     = _COMPRESSION_{node_id}.get(_format_{node_id}.upper(), 0.7)
_frame_bytes_{node_id}     = _raw_frame_bytes_{node_id} * _compression_{node_id}
_total_bytes_{node_id}     = _frame_bytes_{node_id} * _frames_{node_id}

size_per_frame = round(_frame_bytes_{node_id} / (1024 * 1024), 2)
size_mb        = round(_total_bytes_{node_id} / (1024 * 1024), 1)
size_gb        = round(_total_bytes_{node_id} / (1024 * 1024 * 1024), 2)

# Human readable
if size_gb >= 1:
    _display_{node_id} = str(size_gb) + " GB"
else:
    _display_{node_id} = str(size_mb) + " MB"

size_summary = (str(_width_{node_id}) + "x" + str(_height_{node_id}) + " " +
    _format_{node_id} + " " + str(_bit_depth_{node_id}) + "-bit x " +
    str(_frames_{node_id}) + " frames = " + _display_{node_id})

print("FlowPins Render Size Estimator")
print("=" * 55)
print("  Format     : " + _format_{node_id} + " " + str(_bit_depth_{node_id}) + "-bit")
print("  Resolution : " + str(_width_{node_id}) + " x " + str(_height_{node_id}))
print("  Channels   : " + str(_channels_{node_id}) + " (" + ("RGBA" if _channels_{node_id}==4 else "RGB" if _channels_{node_id}==3 else str(_channels_{node_id}) + "ch") + ")")
print("  Frames     : " + str(_frames_{node_id}))
print("  Compression: ~" + str(int(_compression_{node_id} * 100)) + "% of raw")
print("-" * 55)
print("  Per frame  : ~" + str(size_per_frame) + " MB")
print("  Total      : ~" + _display_{node_id})
print("=" * 55)

# Common render lengths for context
print("")
print("REFERENCE ESTIMATES (same settings):")
for _label_{node_id}, _f_{node_id} in [("30 sec @ 24fps", 720), ("1 min @ 24fps", 1440), ("5 min @ 24fps", 7200), ("22 min @ 24fps", 31680)]:
    _est_{node_id} = round((_frame_bytes_{node_id} * _f_{node_id}) / (1024*1024*1024), 2)
    _est_mb_{node_id} = round((_frame_bytes_{node_id} * _f_{node_id}) / (1024*1024), 1)
    if _est_{node_id} >= 1:
        print("  " + _label_{node_id} + " : ~" + str(_est_{node_id}) + " GB")
    else:
        print("  " + _label_{node_id} + " : ~" + str(_est_mb_{node_id}) + " MB")

{exec_out}`,


  // ==========================================================================
  // PIPELINE SUITE — CATEGORY 4: ASSET MANAGEMENT
  // ==========================================================================

  "ast_inventory": `# Asset Inventory
# Scans a folder and generates a complete asset list with counts and sizes
import os
from datetime import datetime

_folder_{node_id}     = "{folder_path}".replace(chr(92), "/")
_exts_{node_id}       = [e.strip().lower() for e in "{extensions}".split(",") if e.strip()]
_recursive_{node_id}  = str("{recursive}").lower() == "true"
_save_{node_id}       = str("{save_report}").lower() == "true"

total_files   = 0
total_folders = 0
total_size_mb = 0
asset_list    = []

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    _ts_{node_id}      = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _type_counts_{node_id} = {}
    _type_sizes_{node_id}  = {}
    _folder_counts_{node_id} = {}
    _total_bytes_{node_id} = 0

    # Walk the folder
    for _root_{node_id}, _dirs_{node_id}, _files_{node_id} in (os.walk(_folder_{node_id}) if _recursive_{node_id} else [(_folder_{node_id}, [], os.listdir(_folder_{node_id}))]):
        total_folders += len(_dirs_{node_id}) if _recursive_{node_id} else 0
        _rel_{node_id} = os.path.relpath(_root_{node_id}, _folder_{node_id})

        for _fn_{node_id} in sorted(_files_{node_id}):
            _ext_{node_id} = os.path.splitext(_fn_{node_id})[1].lower()
            if not _exts_{node_id} or _ext_{node_id} in _exts_{node_id}:
                _fp_{node_id} = os.path.join(_root_{node_id}, _fn_{node_id})
                try:
                    _sz_{node_id} = os.path.getsize(_fp_{node_id})
                except:
                    _sz_{node_id} = 0

                total_files += 1
                _total_bytes_{node_id} += _sz_{node_id}

                # Count by type
                _type_counts_{node_id}[_ext_{node_id}] = _type_counts_{node_id}.get(_ext_{node_id}, 0) + 1
                _type_sizes_{node_id}[_ext_{node_id}]   = _type_sizes_{node_id}.get(_ext_{node_id}, 0) + _sz_{node_id}

                # Count by folder
                _folder_counts_{node_id}[_rel_{node_id}] = _folder_counts_{node_id}.get(_rel_{node_id}, 0) + 1

                asset_list.append(_rel_{node_id} + "/" + _fn_{node_id})

    total_size_mb = round(_total_bytes_{node_id} / (1024 * 1024), 2)

    print("FlowPins Asset Inventory")
    print("  Folder : " + _folder_{node_id})
    print("  Scanned: " + ("recursively" if _recursive_{node_id} else "top level only"))
    print("=" * 60)
    print("  Total Files   : " + str(total_files))
    print("  Total Folders : " + str(total_folders))
    print("  Total Size    : " + str(total_size_mb) + " MB")
    print("-" * 60)

    # By file type
    print("BY FILE TYPE:")
    for _ext_{node_id} in sorted(_type_counts_{node_id}.keys()):
        _cnt_{node_id} = _type_counts_{node_id}[_ext_{node_id}]
        _mb_{node_id}  = round(_type_sizes_{node_id}[_ext_{node_id}] / (1024*1024), 2)
        print("  {:<12} {:>6} files   {:>10} MB".format(
            _ext_{node_id} or "(no ext)", _cnt_{node_id}, _mb_{node_id}))

    # By folder
    if _recursive_{node_id} and len(_folder_counts_{node_id}) > 1:
        print("-" * 60)
        print("BY FOLDER:")
        for _fld_{node_id} in sorted(_folder_counts_{node_id}.keys()):
            print("  {:>6} files   {}".format(
                _folder_counts_{node_id}[_fld_{node_id}], _fld_{node_id}))

    print("=" * 60)

    # Save report
    if _save_{node_id}:
        _rname_{node_id} = "asset_inventory_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".txt"
        _rpath_{node_id} = os.path.join(_folder_{node_id}, _rname_{node_id})
        try:
            _lines_{node_id} = [
                "FLOWPINS ASSET INVENTORY",
                "Generated : " + _ts_{node_id},
                "Folder    : " + _folder_{node_id},
                "Files     : " + str(total_files),
                "Size      : " + str(total_size_mb) + " MB",
                "=" * 60,
                "",
                "BY FILE TYPE:"
            ]
            for _ext_{node_id} in sorted(_type_counts_{node_id}.keys()):
                _lines_{node_id}.append("  " + (_ext_{node_id} or "(no ext)") + " — " +
                    str(_type_counts_{node_id}[_ext_{node_id}]) + " files, " +
                    str(round(_type_sizes_{node_id}[_ext_{node_id}] / (1024*1024), 2)) + " MB")
            _lines_{node_id}.append("")
            _lines_{node_id}.append("ALL FILES:")
            for _a_{node_id} in sorted(asset_list):
                _lines_{node_id}.append("  " + _a_{node_id})
            with open(_rpath_{node_id}, "w", encoding="utf-8") as _rf_{node_id}:
                _rf_{node_id}.write(chr(10).join(_lines_{node_id}))
            print("  Report: " + _rpath_{node_id})
        except Exception as _re_{node_id}:
            print("  Report save failed: " + str(_re_{node_id}))

{exec_out}`,


  "ast_version_checker": `# Version Checker
# Finds the highest version of each asset and flags outdated files
import os, re

_folder_{node_id}    = "{folder_path}".replace(chr(92), "/").rstrip("/")
_ext_{node_id}       = "{extension}"
_recursive_{node_id} = str("{recursive}").lower() == "true"

total_assets   = 0
outdated_count = 0
outdated_files = []
all_current    = False

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    # Version pattern — matches _v01, _v001, _V3, _v0001 etc
    _digit_{node_id} = chr(92) + "d"
    _vpat_{node_id}  = re.compile(
        r"^(.*?)_[vV](" + _digit_{node_id} + r"+)(.*)" +
        re.escape(_ext_{node_id}) + "$",
        re.IGNORECASE
    )

    # Collect all files
    _all_files_{node_id} = []
    if _recursive_{node_id}:
        for _r_{node_id}, _d_{node_id}, _f_{node_id} in os.walk(_folder_{node_id}):
            for _fn_{node_id} in _f_{node_id}:
                if _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()):
                    _all_files_{node_id}.append((_r_{node_id}, _fn_{node_id}))
    else:
        for _fn_{node_id} in os.listdir(_folder_{node_id}):
            if _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()):
                _all_files_{node_id}.append((_folder_{node_id}, _fn_{node_id}))

    # Group by base name (strip version number)
    _groups_{node_id} = {}
    _no_version_{node_id} = []

    for _dir_{node_id}, _fn_{node_id} in _all_files_{node_id}:
        _m_{node_id} = _vpat_{node_id}.match(_fn_{node_id})
        if _m_{node_id}:
            _base_{node_id}    = _m_{node_id}.group(1) + _m_{node_id}.group(3)
            _ver_{node_id}     = int(_m_{node_id}.group(2))
            _key_{node_id}     = _dir_{node_id}.replace(chr(92), "/") + "|" + _base_{node_id}
            if _key_{node_id} not in _groups_{node_id}:
                _groups_{node_id}[_key_{node_id}] = []
            _groups_{node_id}[_key_{node_id}].append((_fn_{node_id}, _ver_{node_id}))
        else:
            _no_version_{node_id}.append(_fn_{node_id})

    print("FlowPins Version Checker")
    print("  Folder    : " + _folder_{node_id})
    print("  Extension : " + _ext_{node_id})
    print("  Files     : " + str(len(_all_files_{node_id})))
    print("-" * 55)

    _versioned_count_{node_id} = 0
    _asset_groups_{node_id}    = 0

    for _key_{node_id}, _versions_{node_id} in sorted(_groups_{node_id}.items()):
        if len(_versions_{node_id}) > 1:
            _asset_groups_{node_id} += 1
            _max_ver_{node_id} = max(v for _, v in _versions_{node_id})
            _sorted_{node_id} = sorted(_versions_{node_id}, key=lambda x: x[1])

            print("")
            print("  ASSET GROUP: " + _key_{node_id}.split("|")[1])
            print("  Latest version: v" + str(_max_ver_{node_id}).zfill(2))

            for _fn_{node_id}, _ver_{node_id} in _sorted_{node_id}:
                _versioned_count_{node_id} += 1
                if _ver_{node_id} < _max_ver_{node_id}:
                    print("    ✗ OUTDATED: " + _fn_{node_id} + " (v" + str(_ver_{node_id}).zfill(2) + ")")
                    outdated_files.append(_fn_{node_id})
                    outdated_count += 1
                else:
                    print("    ✓ CURRENT : " + _fn_{node_id} + " (v" + str(_ver_{node_id}).zfill(2) + ")")
        else:
            _versioned_count_{node_id} += 1

    total_assets = len(_all_files_{node_id})
    all_current  = outdated_count == 0

    print("")
    print("-" * 55)
    if _asset_groups_{node_id} == 0:
        print("  No versioned assets found (no _v## pattern detected)")
        print("  Files scanned: " + str(len(_all_files_{node_id})))
    elif all_current:
        print("  ✓ ALL CURRENT — no outdated versions found")
        print("  " + str(_asset_groups_{node_id}) + " asset groups checked")
    else:
        print("  ✗ " + str(outdated_count) + " outdated files found across " + str(_asset_groups_{node_id}) + " asset groups")

{exec_out}`,


  "ast_cross_reference": `# Asset Cross-Reference
# Checks which expected assets exist on disk and which are missing
import os

_folder_{node_id}    = "{folder_path}".replace(chr(92), "/").rstrip("/")
_asset_list_{node_id} = "{asset_list}"
_recursive_{node_id} = str("{recursive}").lower() == "true"

found_count   = 0
missing_count = 0
missing_files = []
all_present   = False

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
elif not _asset_list_{node_id}.strip():
    print("FlowPins ERROR: No asset list provided — add comma-separated filenames in Inspector")
else:
    # Parse expected assets
    _expected_{node_id} = [a.strip() for a in _asset_list_{node_id}.split(",") if a.strip()]

    # Collect all files on disk
    _on_disk_{node_id} = set()
    if _recursive_{node_id}:
        for _r_{node_id}, _d_{node_id}, _f_{node_id} in os.walk(_folder_{node_id}):
            for _fn_{node_id} in _f_{node_id}:
                _on_disk_{node_id}.add(_fn_{node_id}.lower())
    else:
        for _fn_{node_id} in os.listdir(_folder_{node_id}):
            if os.path.isfile(os.path.join(_folder_{node_id}, _fn_{node_id})):
                _on_disk_{node_id}.add(_fn_{node_id}.lower())

    print("FlowPins Asset Cross-Reference")
    print("  Folder   : " + _folder_{node_id})
    print("  Expected : " + str(len(_expected_{node_id})) + " assets")
    print("  On Disk  : " + str(len(_on_disk_{node_id})) + " files found")
    print("-" * 55)

    _found_{node_id}   = []
    _missing_{node_id} = []

    for _asset_{node_id} in _expected_{node_id}:
        if _asset_{node_id}.lower() in _on_disk_{node_id}:
            _found_{node_id}.append(_asset_{node_id})
            print("  ✓ FOUND  : " + _asset_{node_id})
        else:
            _missing_{node_id}.append(_asset_{node_id})
            print("  ✗ MISSING: " + _asset_{node_id})

    found_count   = len(_found_{node_id})
    missing_count = len(_missing_{node_id})
    missing_files = _missing_{node_id}
    all_present   = missing_count == 0

    print("-" * 55)
    if all_present:
        print("  ✓ ALL PRESENT — " + str(found_count) + "/" + str(len(_expected_{node_id})) + " assets found")
    else:
        print("  ✗ " + str(missing_count) + " assets missing, " + str(found_count) + " found")

{exec_out}`,


  "ast_texture_audit": `# Texture Audit
# Scans texture files and reports resolution, colourspace, flags non-standard
import os, io
from PIL import Image, ImageCms

_folder_{node_id}    = "{folder_path}".replace(chr(92), "/").rstrip("/")
_exts_{node_id}      = [e.strip().lower() for e in "{extensions}".split(",") if e.strip()]
_expected_cs_{node_id} = "{expected_cs}"
_max_w_{node_id}     = int({max_width})
_max_h_{node_id}     = int({max_height})
_recursive_{node_id} = str("{recursive}").lower() == "true"
_pow2_{node_id}      = str("{power_of_two}").lower() == "true"

total_textures = 0
issues_count   = 0
issues_list    = []
all_valid      = False

def _is_pow2_{node_id}(n):
    return n > 0 and (n & (n - 1)) == 0

def _get_cs_{node_id}(info):
    if "icc_profile" in info:
        try:
            _desc = ImageCms.getProfileDescription(
                ImageCms.ImageCmsProfile(io.BytesIO(info["icc_profile"]))
            ).strip().lower()
            if "srgb" in _desc:    return "sRGB"
            if "709" in _desc:     return "Rec.709"
            if "linear" in _desc:  return "Linear"
            if "aces" in _desc:    return "ACES"
            if "p3" in _desc:      return "DCI-P3"
            return "ICC: " + _desc[:20]
        except:
            return "ICC Embedded"
    elif "srgb" in info:
        return "sRGB"
    return "Untagged"

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    # Collect texture files
    _textures_{node_id} = []
    if _recursive_{node_id}:
        for _r_{node_id}, _d_{node_id}, _f_{node_id} in os.walk(_folder_{node_id}):
            for _fn_{node_id} in _f_{node_id}:
                if any(_fn_{node_id}.lower().endswith(e) for e in _exts_{node_id}):
                    _textures_{node_id}.append(os.path.join(_r_{node_id}, _fn_{node_id}))
    else:
        for _fn_{node_id} in os.listdir(_folder_{node_id}):
            if any(_fn_{node_id}.lower().endswith(e) for e in _exts_{node_id}):
                _textures_{node_id}.append(os.path.join(_folder_{node_id}, _fn_{node_id}))

    total_textures = len(_textures_{node_id})

    print("FlowPins Texture Audit")
    print("  Folder     : " + _folder_{node_id})
    print("  Textures   : " + str(total_textures))
    print("  Expected CS: " + _expected_cs_{node_id})
    print("  Max Size   : " + str(_max_w_{node_id}) + "x" + str(_max_h_{node_id}))
    print("-" * 60)

    for _fp_{node_id} in sorted(_textures_{node_id}):
        _fn_{node_id} = os.path.basename(_fp_{node_id})
        _file_issues_{node_id} = []
        try:
            with Image.open(_fp_{node_id}) as _img_{node_id}:
                _w_{node_id}    = _img_{node_id}.width
                _h_{node_id}    = _img_{node_id}.height
                _mode_{node_id} = _img_{node_id}.mode
                _info_{node_id} = _img_{node_id}.info
                _cs_{node_id}   = _get_cs_{node_id}(_info_{node_id})

                # Check colourspace
                if _expected_cs_{node_id} and _cs_{node_id}.lower() != _expected_cs_{node_id}.lower():
                    _file_issues_{node_id}.append("CS: " + _cs_{node_id} + " (expected " + _expected_cs_{node_id} + ")")

                # Check dimensions
                if _w_{node_id} > _max_w_{node_id} or _h_{node_id} > _max_h_{node_id}:
                    _file_issues_{node_id}.append("Size: " + str(_w_{node_id}) + "x" + str(_h_{node_id}) + " exceeds max")

                # Check power of two
                if _pow2_{node_id}:
                    if not _is_pow2_{node_id}(_w_{node_id}) or not _is_pow2_{node_id}(_h_{node_id}):
                        _file_issues_{node_id}.append("Not power of two: " + str(_w_{node_id}) + "x" + str(_h_{node_id}))

                _size_kb_{node_id} = round(os.path.getsize(_fp_{node_id}) / 1024, 1)

                if _file_issues_{node_id}:
                    print("  ✗ " + _fn_{node_id})
                    print("    " + str(_w_{node_id}) + "x" + str(_h_{node_id}) + " | " + _mode_{node_id} + " | " + _cs_{node_id} + " | " + str(_size_kb_{node_id}) + " KB")
                    for _iss_{node_id} in _file_issues_{node_id}:
                        print("    ⚠ " + _iss_{node_id})
                    issues_list.append(_fn_{node_id} + " — " + ", ".join(_file_issues_{node_id}))
                    issues_count += 1
                else:
                    print("  ✓ " + _fn_{node_id} + " [" + str(_w_{node_id}) + "x" + str(_h_{node_id}) + " | " + _cs_{node_id} + " | " + str(_size_kb_{node_id}) + " KB]")

        except Exception as _e_{node_id}:
            print("  ✗ " + _fn_{node_id} + " — ERROR: " + str(_e_{node_id}))
            issues_list.append(_fn_{node_id} + " — ERROR: " + str(_e_{node_id}))
            issues_count += 1

    all_valid = issues_count == 0

    print("-" * 60)
    if all_valid:
        print("  ✓ ALL VALID — " + str(total_textures) + " textures passed")
    else:
        print("  ✗ " + str(issues_count) + "/" + str(total_textures) + " textures have issues")

{exec_out}`,


  "ast_orphan_finder": `# Orphan File Finder
# Finds files that don't match any known naming pattern
import os, re

_folder_{node_id}    = "{folder_path}".replace(chr(92), "/").rstrip("/")
_patterns_{node_id}  = [p.strip() for p in "{known_patterns}".split(",") if p.strip()]
_exts_{node_id}      = [e.strip().lower() for e in "{extensions}".split(",") if e.strip()]
_recursive_{node_id} = str("{recursive}").lower() == "true"

orphan_count = 0
orphan_files = []
orphan_mb    = 0
has_orphans  = False

def _pattern_to_regex_{node_id}(pattern):
    _dot_{node_id}   = chr(92) + "."
    _dig_{node_id}   = chr(92) + "d"
    _rx_{node_id} = pattern.strip()
    _rx_{node_id} = _rx_{node_id}.replace(".", _dot_{node_id})
    _rx_{node_id} = re.sub("#+", lambda m: _dig_{node_id} + "{" + str(len(m.group())) + "}", _rx_{node_id})
    _rx_{node_id} = re.sub("@+", lambda m: "[a-zA-Z]{" + str(len(m.group())) + "}", _rx_{node_id})
    _rx_{node_id} = _rx_{node_id}.replace("*", ".*")
    return "^" + _rx_{node_id} + "$"

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    # Compile patterns
    _compiled_{node_id} = []
    for _pat_{node_id} in _patterns_{node_id}:
        try:
            _compiled_{node_id}.append(re.compile(_pattern_to_regex_{node_id}(_pat_{node_id}), re.IGNORECASE))
        except:
            print("  Warning: could not compile pattern — " + _pat_{node_id})

    # Collect files
    _all_files_{node_id} = []
    if _recursive_{node_id}:
        for _r_{node_id}, _d_{node_id}, _f_{node_id} in os.walk(_folder_{node_id}):
            for _fn_{node_id} in _f_{node_id}:
                if not _exts_{node_id} or any(_fn_{node_id}.lower().endswith(e) for e in _exts_{node_id}):
                    _all_files_{node_id}.append((_r_{node_id}, _fn_{node_id}))
    else:
        for _fn_{node_id} in os.listdir(_folder_{node_id}):
            if os.path.isfile(os.path.join(_folder_{node_id}, _fn_{node_id})):
                if not _exts_{node_id} or any(_fn_{node_id}.lower().endswith(e) for e in _exts_{node_id}):
                    _all_files_{node_id}.append((_folder_{node_id}, _fn_{node_id}))

    print("FlowPins Orphan File Finder")
    print("  Folder   : " + _folder_{node_id})
    print("  Files    : " + str(len(_all_files_{node_id})))
    print("  Patterns : " + str(len(_compiled_{node_id})))
    print("-" * 55)

    _orphan_bytes_{node_id} = 0

    for _dir_{node_id}, _fn_{node_id} in sorted(_all_files_{node_id}):
        _stem_{node_id} = os.path.splitext(_fn_{node_id})[0]
        _matched_{node_id} = any(p.match(_stem_{node_id}) for p in _compiled_{node_id})

        if not _matched_{node_id}:
            _fp_{node_id} = os.path.join(_dir_{node_id}, _fn_{node_id})
            try:
                _sz_{node_id} = os.path.getsize(_fp_{node_id})
            except:
                _sz_{node_id} = 0
            _orphan_bytes_{node_id} += _sz_{node_id}
            _mb_{node_id} = round(_sz_{node_id} / (1024*1024), 2)
            _rel_{node_id} = os.path.relpath(_fp_{node_id}, _folder_{node_id}).replace(chr(92), "/")
            orphan_files.append(_rel_{node_id})
            print("  ✗ ORPHAN: " + _rel_{node_id} + " (" + str(_mb_{node_id}) + " MB)")

    orphan_count = len(orphan_files)
    orphan_mb    = round(_orphan_bytes_{node_id} / (1024*1024), 2)
    has_orphans  = orphan_count > 0

    print("-" * 55)
    if not has_orphans:
        print("  ✓ No orphan files found — all files match known patterns")
    else:
        print("  ✗ " + str(orphan_count) + " orphan files found (" + str(orphan_mb) + " MB)")

{exec_out}`,


  // ==========================================================================
  // PIPELINE SUITE — CATEGORY 5: COLOURSPACE & LUT MANAGEMENT
  // ==========================================================================

  "cs_project_report": `# Colourspace Report
# Scans all images in a project and reports the colourspace of every file
import os, io
from PIL import Image, ImageCms
from datetime import datetime

_folder_{node_id}    = "{folder_path}".replace(chr(92), "/").rstrip("/")
_exts_{node_id}      = [e.strip().lower() for e in "{extensions}".split(",") if e.strip()]
_recursive_{node_id} = str("{recursive}").lower() == "true"
_save_{node_id}      = str("{save_report}").lower() == "true"

total_files    = 0
unique_spaces  = 0
untagged_count = 0
summary        = ""

def _detect_cs_{node_id}(fp):
    _ext_{node_id} = os.path.splitext(fp)[1].lower()
    try:
        with Image.open(fp) as _img_{node_id}:
            _info_{node_id} = _img_{node_id}.info
            if "icc_profile" in _info_{node_id}:
                try:
                    _desc_{node_id} = ImageCms.getProfileDescription(
                        ImageCms.ImageCmsProfile(
                            io.BytesIO(_info_{node_id}["icc_profile"])
                        )
                    ).strip().lower()
                    if "srgb"   in _desc_{node_id}: return "sRGB"
                    if "709"    in _desc_{node_id}: return "Rec.709"
                    if "2020"   in _desc_{node_id}: return "Rec.2020"
                    if "p3"     in _desc_{node_id}: return "DCI-P3"
                    if "aces"   in _desc_{node_id}: return "ACES"
                    if "linear" in _desc_{node_id}: return "Linear"
                    return "ICC: " + _desc_{node_id}[:25]
                except:
                    return "ICC Embedded"
            elif "srgb" in _info_{node_id}:
                return "sRGB"
            elif "gamma" in _info_{node_id}:
                _g_{node_id} = _info_{node_id}["gamma"]
                if abs(_g_{node_id} - 1.0) < 0.01:    return "Linear"
                if abs(_g_{node_id} - 0.4545) < 0.01: return "sRGB (gamma)"
                return "Gamma " + str(round(_g_{node_id}, 3))
            return "Untagged"
    except Exception as _e_{node_id}:
        return "ERROR: " + str(_e_{node_id})[:40]

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    _ts_{node_id}      = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _cs_map_{node_id}  = {}   # colourspace -> list of files
    _all_results_{node_id} = []

    # Collect files
    _files_{node_id} = []
    if _recursive_{node_id}:
        for _r_{node_id}, _d_{node_id}, _f_{node_id} in os.walk(_folder_{node_id}):
            for _fn_{node_id} in _f_{node_id}:
                if any(_fn_{node_id}.lower().endswith(e) for e in _exts_{node_id}):
                    _files_{node_id}.append(os.path.join(_r_{node_id}, _fn_{node_id}))
    else:
        for _fn_{node_id} in os.listdir(_folder_{node_id}):
            if any(_fn_{node_id}.lower().endswith(e) for e in _exts_{node_id}):
                _files_{node_id}.append(os.path.join(_folder_{node_id}, _fn_{node_id}))

    total_files = len(_files_{node_id})

    print("FlowPins Colourspace Report")
    print("  Folder : " + _folder_{node_id})
    print("  Files  : " + str(total_files))
    print("-" * 60)

    for _fp_{node_id} in sorted(_files_{node_id}):
        _fn_{node_id} = os.path.basename(_fp_{node_id})
        _cs_{node_id} = _detect_cs_{node_id}(_fp_{node_id})
        _rel_{node_id} = os.path.relpath(_fp_{node_id}, _folder_{node_id}).replace(chr(92), "/")

        if _cs_{node_id} not in _cs_map_{node_id}:
            _cs_map_{node_id}[_cs_{node_id}] = []
        _cs_map_{node_id}[_cs_{node_id}].append(_rel_{node_id})
        _all_results_{node_id}.append((_rel_{node_id}, _cs_{node_id}))
        print("  " + _cs_{node_id}.ljust(20) + "  " + _rel_{node_id})

    unique_spaces  = len(_cs_map_{node_id})
    untagged_count = len(_cs_map_{node_id}.get("Untagged", []))

    print("")
    print("=" * 60)
    print("COLOURSPACE SUMMARY")
    print("-" * 60)
    for _cs_{node_id} in sorted(_cs_map_{node_id}.keys()):
        _cnt_{node_id} = len(_cs_map_{node_id}[_cs_{node_id}])
        _bar_{node_id} = chr(9608) * min(_cnt_{node_id}, 20)
        print("  {:<22} {:>4} files  {}".format(_cs_{node_id}, _cnt_{node_id}, _bar_{node_id}))
    print("=" * 60)
    print("  Total    : " + str(total_files) + " files")
    print("  CS Types : " + str(unique_spaces))
    if untagged_count > 0:
        print("  Untagged : " + str(untagged_count) + " files have no colourspace metadata")

    summary = str(total_files) + " files, " + str(unique_spaces) + " colourspace(s)"

    # Save report
    if _save_{node_id}:
        _rname_{node_id} = "colourspace_report_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".txt"
        _rpath_{node_id} = os.path.join(_folder_{node_id}, _rname_{node_id})
        try:
            _lines_{node_id} = [
                "FLOWPINS COLOURSPACE REPORT",
                "Generated : " + _ts_{node_id},
                "Folder    : " + _folder_{node_id},
                "Files     : " + str(total_files),
                "=" * 60,
                "",
                "FILE LIST:",
            ]
            for _rel_{node_id}, _cs_{node_id} in _all_results_{node_id}:
                _lines_{node_id}.append("  " + _cs_{node_id}.ljust(22) + "  " + _rel_{node_id})
            _lines_{node_id}.append("")
            _lines_{node_id}.append("SUMMARY BY COLOURSPACE:")
            for _cs_{node_id} in sorted(_cs_map_{node_id}.keys()):
                _lines_{node_id}.append("  " + _cs_{node_id} + " — " + str(len(_cs_map_{node_id}[_cs_{node_id}])) + " files")
            _lines_{node_id}.append("=" * 60)
            with open(_rpath_{node_id}, "w", encoding="utf-8") as _rf_{node_id}:
                _rf_{node_id}.write(chr(10).join(_lines_{node_id}))
            print("  Report: " + _rpath_{node_id})
        except Exception as _re_{node_id}:
            print("  Report save failed: " + str(_re_{node_id}))

{exec_out}`,


  "cs_lut_validator": `# LUT Validator
# Checks LUT files are present, readable and correctly formatted
import os, re

_folder_{node_id}    = "{folder_path}".replace(chr(92), "/").rstrip("/")
_exts_{node_id}      = [e.strip().lower() for e in "{extensions}".split(",") if e.strip()]
_recursive_{node_id} = str("{recursive}").lower() == "true"

total_luts    = 0
valid_count   = 0
invalid_count = 0
invalid_list  = []
all_valid     = False

# LUT format validators
def _validate_cube_{node_id}(fp):
    # .cube — Adobe/Resolve format
    # Must have: LUT_3D_SIZE or LUT_1D_SIZE, data lines of 3 floats
    _has_size_{node_id}  = False
    _data_lines_{node_id} = 0
    _expected_{node_id}  = 0
    try:
        with open(fp, "r", encoding="utf-8", errors="ignore") as _f_{node_id}:
            for _line_{node_id} in _f_{node_id}:
                _l_{node_id} = _line_{node_id}.strip()
                if not _l_{node_id} or _l_{node_id}.startswith("#"): continue
                if _l_{node_id}.upper().startswith("LUT_3D_SIZE"):
                    _sz_{node_id} = int(_l_{node_id}.split()[-1])
                    _expected_{node_id} = _sz_{node_id} ** 3
                    _has_size_{node_id} = True
                elif _l_{node_id}.upper().startswith("LUT_1D_SIZE"):
                    _expected_{node_id} = int(_l_{node_id}.split()[-1])
                    _has_size_{node_id} = True
                elif _l_{node_id}.upper().startswith("LUT_"):
                    continue  # other metadata
                elif _l_{node_id}.upper().startswith("TITLE") or _l_{node_id}.upper().startswith("DOMAIN"):
                    continue
                else:
                    _parts_{node_id} = _l_{node_id}.split()
                    if len(_parts_{node_id}) == 3:
                        try:
                            float(_parts_{node_id}[0]); float(_parts_{node_id}[1]); float(_parts_{node_id}[2])
                            _data_lines_{node_id} += 1
                        except: pass
        if not _has_size_{node_id}:
            return False, "Missing LUT_3D_SIZE or LUT_1D_SIZE declaration"
        if _expected_{node_id} > 0 and _data_lines_{node_id} == 0:
            return False, "No data lines found"
        if _expected_{node_id} > 0 and abs(_data_lines_{node_id} - _expected_{node_id}) > 10:
            return False, "Expected " + str(_expected_{node_id}) + " data lines, found " + str(_data_lines_{node_id})
        return True, "OK — " + str(_data_lines_{node_id}) + " data lines"
    except Exception as _e_{node_id}:
        return False, "Read error: " + str(_e_{node_id})[:50]

def _validate_3dl_{node_id}(fp):
    # .3dl — Lustre/Flame format
    _data_lines_{node_id} = 0
    try:
        with open(fp, "r", encoding="utf-8", errors="ignore") as _f_{node_id}:
            for _line_{node_id} in _f_{node_id}:
                _l_{node_id} = _line_{node_id}.strip()
                if not _l_{node_id} or _l_{node_id}.startswith("#"): continue
                _parts_{node_id} = _l_{node_id}.split()
                if len(_parts_{node_id}) >= 3:
                    try:
                        int(_parts_{node_id}[0]); int(_parts_{node_id}[1]); int(_parts_{node_id}[2])
                        _data_lines_{node_id} += 1
                    except: pass
        if _data_lines_{node_id} == 0:
            return False, "No integer data lines found"
        return True, "OK — " + str(_data_lines_{node_id}) + " data lines"
    except Exception as _e_{node_id}:
        return False, "Read error: " + str(_e_{node_id})[:50]

def _validate_generic_{node_id}(fp):
    # .csp, .lut, .cc, .ccc — check it's readable and non-empty
    try:
        _sz_{node_id} = os.path.getsize(fp)
        if _sz_{node_id} == 0:
            return False, "File is empty"
        with open(fp, "r", encoding="utf-8", errors="ignore") as _f_{node_id}:
            _content_{node_id} = _f_{node_id}.read(1024)
        if not _content_{node_id}.strip():
            return False, "File appears empty or unreadable"
        return True, "OK — " + str(round(_sz_{node_id}/1024, 1)) + " KB"
    except Exception as _e_{node_id}:
        return False, "Read error: " + str(_e_{node_id})[:50]

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    # Collect LUT files
    _luts_{node_id} = []
    if _recursive_{node_id}:
        for _r_{node_id}, _d_{node_id}, _f_{node_id} in os.walk(_folder_{node_id}):
            for _fn_{node_id} in _f_{node_id}:
                if any(_fn_{node_id}.lower().endswith(e) for e in _exts_{node_id}):
                    _luts_{node_id}.append(os.path.join(_r_{node_id}, _fn_{node_id}))
    else:
        for _fn_{node_id} in os.listdir(_folder_{node_id}):
            if any(_fn_{node_id}.lower().endswith(e) for e in _exts_{node_id}):
                _luts_{node_id}.append(os.path.join(_folder_{node_id}, _fn_{node_id}))

    total_luts = len(_luts_{node_id})

    print("FlowPins LUT Validator")
    print("  Folder : " + _folder_{node_id})
    print("  LUTs   : " + str(total_luts))
    print("-" * 55)

    if total_luts == 0:
        print("  No LUT files found — check folder path and extensions")
    else:
        for _fp_{node_id} in sorted(_luts_{node_id}):
            _fn_{node_id}  = os.path.basename(_fp_{node_id})
            _ext_{node_id} = os.path.splitext(_fn_{node_id})[1].lower()
            _sz_{node_id}  = round(os.path.getsize(_fp_{node_id}) / 1024, 1)

            # Validate by format
            if _ext_{node_id} == ".cube":
                _ok_{node_id}, _msg_{node_id} = _validate_cube_{node_id}(_fp_{node_id})
            elif _ext_{node_id} == ".3dl":
                _ok_{node_id}, _msg_{node_id} = _validate_3dl_{node_id}(_fp_{node_id})
            else:
                _ok_{node_id}, _msg_{node_id} = _validate_generic_{node_id}(_fp_{node_id})

            if _ok_{node_id}:
                valid_count += 1
                print("  ✓ " + _fn_{node_id} + " [" + str(_sz_{node_id}) + " KB] — " + _msg_{node_id})
            else:
                invalid_count += 1
                invalid_list.append(_fn_{node_id} + " — " + _msg_{node_id})
                print("  ✗ " + _fn_{node_id} + " [" + str(_sz_{node_id}) + " KB] — " + _msg_{node_id})

    all_valid = invalid_count == 0 and total_luts > 0

    print("-" * 55)
    if total_luts == 0:
        print("RESULT: No LUT files to validate")
    elif all_valid:
        print("RESULT: ✓ ALL VALID — " + str(valid_count) + "/" + str(total_luts) + " LUTs passed")
    else:
        print("RESULT: ✗ " + str(invalid_count) + " invalid, " + str(valid_count) + " valid")

{exec_out}`,


  // ==========================================================================
  // PIPELINE SUITE — CATEGORY 6: REPORTING & COMMUNICATION
  // ==========================================================================

  "rpt_delivery_checklist": `# Client Delivery Checklist
# Runs all key checks and outputs a clean formatted checklist
import os, re, io
from PIL import Image, ImageCms
from datetime import datetime

_folder_{node_id}   = {folder_path}
_ext_{node_id}      = extension if isinstance(extension, str) and extension.startswith(".") else "{extension}"
_start_{node_id}    = int({start_frame})
_end_{node_id}      = int({end_frame})
_pattern_{node_id}  = {naming_pattern}
_cs_{node_id}       = {colourspace}
_width_{node_id}    = int({width})
_height_{node_id}   = int({height})
_studio_{node_id}   = "{studio_name}"
_show_{node_id}     = "{show_name}"
_shot_{node_id}     = "{shot_name}"
_save_{node_id}     = str("{save_report}").lower() == "true"

# Normalise path
if isinstance(_folder_{node_id}, str):
    _folder_{node_id} = _folder_{node_id}.replace(chr(92), "/").rstrip("/")

all_passed    = False
checks_passed = 0
checks_failed = 0
report_path   = ""

_ts_{node_id}  = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
_checks_{node_id} = []

def _add_check_{node_id}(name, passed, detail=""):
    _checks_{node_id}.append((name, passed, detail))

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    # Collect files
    _files_{node_id} = sorted([
        f for f in os.listdir(_folder_{node_id})
        if f.lower().endswith(_ext_{node_id}.lower())
    ])
    _found_count_{node_id} = len(_files_{node_id})

    # ── CHECK 1: FRAME COUNT ────────────────────────────────
    _expected_count_{node_id} = _end_{node_id} - _start_{node_id} + 1
    _expected_set_{node_id}   = set(range(_start_{node_id}, _end_{node_id} + 1))
    _digit_{node_id}  = chr(92) + "d"
    _fpat_{node_id}   = re.compile("(" + _digit_{node_id} + "+)" + re.escape(_ext_{node_id}) + "$", re.IGNORECASE)
    _found_nums_{node_id} = set()
    for _fn_{node_id} in _files_{node_id}:
        _m_{node_id} = _fpat_{node_id}.search(_fn_{node_id})
        if _m_{node_id}: _found_nums_{node_id}.add(int(_m_{node_id}.group(1)))
    _missing_{node_id} = sorted(_expected_set_{node_id} - _found_nums_{node_id})
    if not _missing_{node_id}:
        _add_check_{node_id}("Frame Count", True, str(_found_count_{node_id}) + " frames present (" + str(_start_{node_id}) + "-" + str(_end_{node_id}) + ")")
    else:
        _add_check_{node_id}("Frame Count", False, str(len(_missing_{node_id})) + " frames missing")

    # ── CHECK 2: NAMING CONVENTION ─────────────────────────
    if _pattern_{node_id}:
        _dot_nm_{node_id} = chr(92) + "."
        _dig_nm_{node_id} = chr(92) + "d"
        _rx_{node_id} = _pattern_{node_id}.replace(".", _dot_nm_{node_id})
        _rx_{node_id} = re.sub("#+", lambda m: _dig_nm_{node_id} + "{" + str(len(m.group())) + "}", _rx_{node_id})
        _rx_{node_id} = re.sub("@+", lambda m: "[a-zA-Z]{" + str(len(m.group())) + "}", _rx_{node_id})
        _rx_{node_id} = "^" + _rx_{node_id} + "$"
        _nam_fails_{node_id} = [f for f in _files_{node_id} if not re.match(_rx_{node_id}, os.path.splitext(f)[0])]
        if not _nam_fails_{node_id}:
            _add_check_{node_id}("Naming Convention", True, "All files match pattern: " + _pattern_{node_id})
        else:
            _add_check_{node_id}("Naming Convention", False, str(len(_nam_fails_{node_id})) + " files fail pattern")
    else:
        _add_check_{node_id}("Naming Convention", True, "No pattern specified — skipped")

    # ── CHECK 3: RESOLUTION ────────────────────────────────
    _dim_fails_{node_id} = []
    for _fn_{node_id} in _files_{node_id}[:20]:  # sample first 20
        _fp_{node_id} = os.path.join(_folder_{node_id}, _fn_{node_id})
        try:
            with Image.open(_fp_{node_id}) as _img_{node_id}:
                if _img_{node_id}.width != _width_{node_id} or _img_{node_id}.height != _height_{node_id}:
                    _dim_fails_{node_id}.append(_fn_{node_id})
        except: pass
    if not _dim_fails_{node_id}:
        _add_check_{node_id}("Resolution", True, str(_width_{node_id}) + "x" + str(_height_{node_id}) + " confirmed")
    else:
        _add_check_{node_id}("Resolution", False, str(len(_dim_fails_{node_id})) + " files wrong size")

    # ── CHECK 4: COLOURSPACE ───────────────────────────────
    _cs_fails_{node_id} = []
    for _fn_{node_id} in _files_{node_id}[:20]:  # sample first 20
        _fp_{node_id} = os.path.join(_folder_{node_id}, _fn_{node_id})
        try:
            with Image.open(_fp_{node_id}) as _img_{node_id}:
                _info_{node_id} = _img_{node_id}.info
                if "icc_profile" in _info_{node_id}:
                    try:
                        _desc_{node_id} = ImageCms.getProfileDescription(
                            ImageCms.ImageCmsProfile(io.BytesIO(_info_{node_id}["icc_profile"]))
                        ).strip().lower()
                        _detected_{node_id} = "sRGB" if "srgb" in _desc_{node_id} else "Rec.709" if "709" in _desc_{node_id} else _desc_{node_id}[:20]
                    except: _detected_{node_id} = "ICC Embedded"
                elif "srgb" in _info_{node_id}: _detected_{node_id} = "sRGB"
                else: _detected_{node_id} = "Untagged"
                if _detected_{node_id}.lower() != _cs_{node_id}.lower():
                    _cs_fails_{node_id}.append(_fn_{node_id})
        except: pass
    if not _cs_fails_{node_id}:
        _add_check_{node_id}("Colourspace", True, _cs_{node_id} + " confirmed")
    else:
        _add_check_{node_id}("Colourspace", False, str(len(_cs_fails_{node_id})) + " files wrong colourspace")

    # ── CHECK 5: FILE INTEGRITY ───────────────────────────
    _corrupt_{node_id} = []
    _readable_{node_id} = 0
    for _fn_{node_id} in _files_{node_id}:
        _fp_{node_id} = os.path.join(_folder_{node_id}, _fn_{node_id})
        try:
            with Image.open(_fp_{node_id}) as _img_{node_id}:
                _ = _img_{node_id}.size  # force load header
            _readable_{node_id} += 1
        except:
            _corrupt_{node_id}.append(_fn_{node_id})
    if not _corrupt_{node_id}:
        _add_check_{node_id}("File Integrity", True, str(_readable_{node_id}) + " files verified readable")
    else:
        _add_check_{node_id}("File Integrity", False, str(len(_corrupt_{node_id})) + " files corrupt or unreadable")

    # ── TALLY ─────────────────────────────────────────────
    checks_passed = sum(1 for _, p, _ in _checks_{node_id} if p)
    checks_failed = sum(1 for _, p, _ in _checks_{node_id} if not p)
    all_passed    = checks_failed == 0

    # ── PRINT CHECKLIST ───────────────────────────────────
    _sep_{node_id} = "=" * 62
    print(_sep_{node_id})
    print("  FLOWPINS CLIENT DELIVERY CHECKLIST")
    print("  Generated : " + _ts_{node_id})
    print("  Studio    : " + _studio_{node_id})
    print("  Show      : " + _show_{node_id})
    print("  Shot      : " + _shot_{node_id})
    print("  Folder    : " + _folder_{node_id})
    print(_sep_{node_id})
    print("")
    print("  DELIVERY SPECIFICATION")
    print("  Format    : " + _ext_{node_id}.upper().lstrip("."))
    print("  Range     : " + str(_start_{node_id}) + " - " + str(_end_{node_id}) + " (" + str(_expected_count_{node_id}) + " frames)")
    print("  Resolution: " + str(_width_{node_id}) + " x " + str(_height_{node_id}))
    print("  CS        : " + _cs_{node_id})
    print("  Pattern   : " + str(_pattern_{node_id}))
    print("")
    print("  VALIDATION CHECKS")
    print("  " + "-" * 58)
    for _name_{node_id}, _passed_{node_id}, _detail_{node_id} in _checks_{node_id}:
        _tick_{node_id}   = chr(10003) if _passed_{node_id} else chr(10007)
        _status_{node_id} = "PASS" if _passed_{node_id} else "FAIL"
        print("  [" + _tick_{node_id} + "] " + _status_{node_id} + "  " + _name_{node_id}.ljust(22) + "  " + _detail_{node_id})
    print("  " + "-" * 58)
    print("")
    print("  RESULT: " + ("ALL CHECKS PASSED - APPROVED FOR DELIVERY" if all_passed else str(checks_failed) + " CHECK(S) FAILED - NOT APPROVED"))
    print("")
    print(_sep_{node_id})

    # ── SAVE REPORT ───────────────────────────────────────
    if _save_{node_id}:
        _rname_{node_id} = "delivery_checklist_" + _shot_{node_id} + "_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".txt"
        report_path = os.path.join(_folder_{node_id}, _rname_{node_id})
        try:
            _lines_{node_id} = [
                "=" * 62,
                "  FLOWPINS CLIENT DELIVERY CHECKLIST",
                "  Generated : " + _ts_{node_id},
                "  Studio    : " + _studio_{node_id},
                "  Show      : " + _show_{node_id},
                "  Shot      : " + _shot_{node_id},
                "  Folder    : " + _folder_{node_id},
                "=" * 62,
                "",
                "  DELIVERY SPECIFICATION",
                "  Format    : " + _ext_{node_id}.upper().lstrip("."),
                "  Range     : " + str(_start_{node_id}) + " - " + str(_end_{node_id}) + " (" + str(_expected_count_{node_id}) + " frames)",
                "  Resolution: " + str(_width_{node_id}) + " x " + str(_height_{node_id}),
                "  CS        : " + _cs_{node_id},
                "  Pattern   : " + str(_pattern_{node_id}),
                "",
                "  VALIDATION CHECKS",
                "  " + "-" * 58,
            ]
            for _name_{node_id}, _passed_{node_id}, _detail_{node_id} in _checks_{node_id}:
                _tick_{node_id}   = "PASS" if _passed_{node_id} else "FAIL"
                _lines_{node_id}.append("  [" + _tick_{node_id} + "]  " + _name_{node_id}.ljust(22) + "  " + _detail_{node_id})
            _lines_{node_id} += [
                "  " + "-" * 58,
                "",
                "  RESULT: " + ("ALL CHECKS PASSED - APPROVED FOR DELIVERY" if all_passed else str(checks_failed) + " CHECK(S) FAILED - NOT APPROVED"),
                "",
                "  Verified by FlowPins Pipeline Suite",
                "=" * 62,
            ]
            with open(report_path, "w", encoding="utf-8") as _rf_{node_id}:
                _rf_{node_id}.write(chr(10).join(_lines_{node_id}))
            print("  Report: " + report_path)
        except Exception as _re_{node_id}:
            print("  Report save failed: " + str(_re_{node_id}))

{exec_out}`,


  "rpt_signoff_sheet": `# Delivery Sign-Off Sheet
# Formal delivery record with validation results and sign-off lines
import os, re, io
from PIL import Image, ImageCms
from datetime import datetime

_folder_{node_id}   = {folder_path}
_ext_{node_id}      = extension if isinstance(extension, str) and extension.startswith(".") else "{extension}"
_start_{node_id}    = int({start_frame})
_end_{node_id}      = int({end_frame})
_width_{node_id}    = int({width})
_height_{node_id}   = int({height})
_cs_{node_id}       = "{colourspace}"
_studio_{node_id}   = "{studio_name}"
_client_{node_id}   = "{client_name}"
_show_{node_id}     = "{show_name}"
_ep_{node_id}       = "{episode}"
_shot_{node_id}     = "{shot_name}"
_deliv_{node_id}    = "{deliverable}"
_fspec_{node_id}    = "{format_spec}"
_prep_{node_id}     = "{prepared_by}"
_save_{node_id}     = str("{save_report}").lower() == "true"

if isinstance(_folder_{node_id}, str):
    _folder_{node_id} = _folder_{node_id}.replace(chr(92), "/").rstrip("/")

report_path = ""
all_passed  = False
_ts_{node_id} = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
_date_{node_id} = datetime.now().strftime("%B %d, %Y")

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Folder not found — " + str(_folder_{node_id}))
else:
    # Run validations
    _files_{node_id} = sorted([f for f in os.listdir(_folder_{node_id}) if f.lower().endswith(_ext_{node_id}.lower())])
    _found_{node_id} = len(_files_{node_id})
    _expected_{node_id} = _end_{node_id} - _start_{node_id} + 1

    # Frame check
    _digit_{node_id} = chr(92) + "d"
    _fpat_{node_id}  = re.compile("(" + _digit_{node_id} + "+)" + re.escape(_ext_{node_id}) + "$", re.IGNORECASE)
    _nums_{node_id}  = set()
    for _fn_{node_id} in _files_{node_id}:
        _m_{node_id} = _fpat_{node_id}.search(_fn_{node_id})
        if _m_{node_id}: _nums_{node_id}.add(int(_m_{node_id}.group(1)))
    _missing_{node_id} = sorted(set(range(_start_{node_id}, _end_{node_id}+1)) - _nums_{node_id})
    _frames_ok_{node_id} = len(_missing_{node_id}) == 0

    # Resolution check (sample)
    _res_ok_{node_id} = True
    _res_detail_{node_id} = str(_width_{node_id}) + "x" + str(_height_{node_id})
    for _fn_{node_id} in _files_{node_id}[:5]:
        try:
            with Image.open(os.path.join(_folder_{node_id}, _fn_{node_id})) as _img_{node_id}:
                if _img_{node_id}.width != _width_{node_id} or _img_{node_id}.height != _height_{node_id}:
                    _res_ok_{node_id} = False
                    _res_detail_{node_id} = "MISMATCH: found " + str(_img_{node_id}.width) + "x" + str(_img_{node_id}.height)
                    break
        except: pass

    # CS check (sample)
    _cs_ok_{node_id} = True
    _cs_detail_{node_id} = _cs_{node_id}
    for _fn_{node_id} in _files_{node_id}[:5]:
        try:
            with Image.open(os.path.join(_folder_{node_id}, _fn_{node_id})) as _img_{node_id}:
                _info_{node_id} = _img_{node_id}.info
                if "icc_profile" in _info_{node_id}:
                    try:
                        _desc_{node_id} = ImageCms.getProfileDescription(ImageCms.ImageCmsProfile(io.BytesIO(_info_{node_id}["icc_profile"]))).strip().lower()
                        _det_{node_id} = "sRGB" if "srgb" in _desc_{node_id} else "Rec.709" if "709" in _desc_{node_id} else _desc_{node_id}[:20]
                    except: _det_{node_id} = "ICC"
                elif "srgb" in _info_{node_id}: _det_{node_id} = "sRGB"
                else: _det_{node_id} = "Untagged"
                if _det_{node_id}.lower() != _cs_{node_id}.lower():
                    _cs_ok_{node_id} = False
                    _cs_detail_{node_id} = "MISMATCH: found " + _det_{node_id}
                    break
        except: pass

    all_passed = _frames_ok_{node_id} and _res_ok_{node_id} and _cs_ok_{node_id}
    _status_{node_id} = "APPROVED FOR DELIVERY" if all_passed else "REQUIRES ATTENTION"

    # Build document
    _W_{node_id} = 62
    _sep_{node_id}   = "=" * _W_{node_id}
    _div_{node_id}   = "-" * _W_{node_id}
    _blank_{node_id} = ""

    _lines_{node_id} = [
        _sep_{node_id},
        "  DELIVERY SIGN-OFF SHEET",
        "  FlowPins Pipeline Suite  |  " + _date_{node_id},
        _sep_{node_id},
        _blank_{node_id},
        "  PRODUCTION DETAILS",
        _div_{node_id},
        "  Studio        : " + _studio_{node_id},
        "  Client        : " + _client_{node_id},
        "  Show          : " + _show_{node_id},
        "  Episode       : " + _ep_{node_id},
        "  Shot          : " + _shot_{node_id},
        "  Deliverable   : " + _deliv_{node_id},
        "  Prepared By   : " + (_prep_{node_id} or "_________________________"),
        "  Date          : " + _date_{node_id},
        _blank_{node_id},
        "  DELIVERY SPECIFICATION",
        _div_{node_id},
        "  Format        : " + _ext_{node_id}.upper().lstrip("."),
        "  Frame Range   : " + str(_start_{node_id}) + " - " + str(_end_{node_id}) + "  (" + str(_expected_{node_id}) + " frames)",
        "  Resolution    : " + str(_width_{node_id}) + " x " + str(_height_{node_id}),
        "  Colourspace   : " + _cs_{node_id},
        "  Spec          : " + _fspec_{node_id},
        "  Folder        : " + _folder_{node_id},
        _blank_{node_id},
        "  VALIDATION RESULTS",
        _div_{node_id},
        "  Frame Count   : " + ("PASS  — " + str(_found_{node_id}) + " frames present" if _frames_ok_{node_id} else "FAIL  — " + str(len(_missing_{node_id})) + " frames missing"),
        "  Resolution    : " + ("PASS  — " + _res_detail_{node_id} if _res_ok_{node_id} else "FAIL  — " + _res_detail_{node_id}),
        "  Colourspace   : " + ("PASS  — " + _cs_detail_{node_id} if _cs_ok_{node_id} else "FAIL  — " + _cs_detail_{node_id}),
        _blank_{node_id},
        "  OVERALL STATUS: " + _status_{node_id},
        _blank_{node_id},
        _sep_{node_id},
        "  SIGN-OFF",
        _div_{node_id},
        _blank_{node_id},
        "  Prepared by   : _________________________  Date: ____________",
        _blank_{node_id},
        "  Approved by   : _________________________  Date: ____________",
        _blank_{node_id},
        "  Client sign-off: ________________________  Date: ____________",
        _blank_{node_id},
        _sep_{node_id},
        "  Generated by FlowPins Pipeline Suite  |  " + _ts_{node_id},
        _sep_{node_id},
    ]

    # Print to terminal
    for _l_{node_id} in _lines_{node_id}:
        print(_l_{node_id})

    # Save
    if _save_{node_id}:
        _rname_{node_id} = "signoff_" + _shot_{node_id} + "_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".txt"
        report_path = os.path.join(_folder_{node_id}, _rname_{node_id})
        try:
            with open(report_path, "w", encoding="utf-8") as _rf_{node_id}:
                _rf_{node_id}.write(chr(10).join(_lines_{node_id}))
            print("")
            print("  Report: " + report_path)
        except Exception as _re_{node_id}:
            print("  Save failed: " + str(_re_{node_id}))

{exec_out}`,


  "rpt_shot_status_csv": `# Shot Status CSV Export
# Scans shot folders from a CSV shot list and exports a status report
import os, re, csv
from datetime import datetime

_csv_{node_id}    = r"{csv_path}".replace(chr(92), "/")
_out_{node_id}    = r"{output_path}".replace(chr(92), "/").rstrip("/")
_show_{node_id}   = "{show_name}"
_ep_{node_id}     = "{episode}"

total_shots    = 0
complete_shots = 0
output_path    = ""

if not os.path.isfile(_csv_{node_id}):
    print("FlowPins ERROR: Shot list not found — " + _csv_{node_id})
else:
    _shots_{node_id} = []
    try:
        with open(_csv_{node_id}, newline="", encoding="utf-8-sig") as _f_{node_id}:
            _reader_{node_id} = csv.DictReader(_f_{node_id})
            for _row_{node_id} in _reader_{node_id}:
                _shots_{node_id}.append({k.strip(): v.strip() for k, v in _row_{node_id}.items()})
    except Exception as _e_{node_id}:
        print("FlowPins ERROR reading CSV: " + str(_e_{node_id}))

    total_shots = len(_shots_{node_id})
    _ts_{node_id} = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _digit_{node_id} = chr(92) + "d"
    _rows_{node_id}  = []

    print("FlowPins Shot Status CSV Export")
    print("  Show    : " + _show_{node_id})
    print("  Episode : " + _ep_{node_id})
    print("  Shots   : " + str(total_shots))
    print("-" * 55)

    for _shot_{node_id} in _shots_{node_id}:
        _name_{node_id}    = _shot_{node_id}.get("shot_name",   "unknown")
        _folder_{node_id}  = _shot_{node_id}.get("folder_path", "").replace(chr(92), "/")
        _start_{node_id}   = int(_shot_{node_id}.get("start_frame", "1") or 1)
        _end_{node_id}     = int(_shot_{node_id}.get("end_frame",   "1") or 1)
        _ext_{node_id}     = _shot_{node_id}.get("extension", ".png")
        _expected_{node_id} = _end_{node_id} - _start_{node_id} + 1

        # Count frames
        _found_{node_id} = 0
        _missing_list_{node_id} = []
        if os.path.isdir(_folder_{node_id}):
            _pat_{node_id} = re.compile("(" + _digit_{node_id} + "+)" + re.escape(_ext_{node_id}) + "$", re.IGNORECASE)
            _nums_{node_id} = set()
            for _fn_{node_id} in os.listdir(_folder_{node_id}):
                _m_{node_id} = _pat_{node_id}.search(_fn_{node_id})
                if _m_{node_id}:
                    _fnum_{node_id} = int(_m_{node_id}.group(1))
                    if _start_{node_id} <= _fnum_{node_id} <= _end_{node_id}:
                        _nums_{node_id}.add(_fnum_{node_id})
            _found_{node_id} = len(_nums_{node_id})
            _missing_list_{node_id} = sorted(set(range(_start_{node_id}, _end_{node_id}+1)) - _nums_{node_id})

        _missing_{node_id} = len(_missing_list_{node_id})
        _pct_{node_id}     = round((_found_{node_id} / _expected_{node_id}) * 100) if _expected_{node_id} > 0 else 0

        # Status
        if not os.path.isdir(_folder_{node_id}):
            _status_{node_id} = "NOT FOUND"
        elif _found_{node_id} == 0:
            _status_{node_id} = "NOT STARTED"
        elif _missing_{node_id} == 0:
            _status_{node_id} = "COMPLETE"
            complete_shots += 1
        else:
            _status_{node_id} = "IN PROGRESS"

        # Missing frame summary (first 5)
        _miss_str_{node_id} = ""
        if _missing_list_{node_id}:
            _miss_str_{node_id} = " ".join(str(f).zfill(4) for f in _missing_list_{node_id}[:5])
            if len(_missing_list_{node_id}) > 5:
                _miss_str_{node_id} += " (+" + str(len(_missing_list_{node_id})-5) + " more)"

        _rows_{node_id}.append([
            _show_{node_id}, _ep_{node_id}, _name_{node_id},
            str(_expected_{node_id}), str(_found_{node_id}), str(_missing_{node_id}),
            str(_pct_{node_id}) + "%", _status_{node_id},
            _folder_{node_id}, _miss_str_{node_id}, _ts_{node_id}
        ])

        print("  " + _name_{node_id}.ljust(12) + " " + _status_{node_id}.ljust(14) +
              str(_found_{node_id}) + "/" + str(_expected_{node_id}) + " frames  " + str(_pct_{node_id}) + "%")

    print("-" * 55)
    print("  Complete: " + str(complete_shots) + "/" + str(total_shots) + " shots")

    # Save CSV
    _out_folder_{node_id} = _out_{node_id} if _out_{node_id} and os.path.isdir(_out_{node_id}) else os.path.dirname(_csv_{node_id})
    _rname_{node_id} = "shot_status_" + _ep_{node_id} + "_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".csv"
    output_path = os.path.join(_out_folder_{node_id}, _rname_{node_id})

    try:
        with open(output_path, "w", newline="", encoding="utf-8") as _rf_{node_id}:
            _w_{node_id} = csv.writer(_rf_{node_id})
            _w_{node_id}.writerow(["Show","Episode","Shot","Expected","Found","Missing","Percent","Status","Folder","Missing Frames","Generated"])
            for _r_{node_id} in _rows_{node_id}:
                _w_{node_id}.writerow(_r_{node_id})
        print("  Saved : " + output_path)
    except Exception as _re_{node_id}:
        print("  Save failed: " + str(_re_{node_id}))

{exec_out}`,


  "rpt_daily_progress": `# Daily Progress Report
# End-of-day summary — what's done, in progress, and blocked
import os, re, csv
from datetime import datetime

_csv_{node_id}   = r"{csv_path}".replace(chr(92), "/")
_show_{node_id}  = "{show_name}"
_ep_{node_id}    = "{episode}"
_prep_{node_id}  = "{prepared_by}"
_notes_{node_id} = "{notes}"
_save_{node_id}  = str("{save_report}").lower() == "true"

report_path    = ""
total_shots    = 0
complete_shots = 0
percent_done   = 0

if not os.path.isfile(_csv_{node_id}):
    print("FlowPins ERROR: Shot list not found — " + _csv_{node_id})
else:
    _shots_{node_id} = []
    try:
        with open(_csv_{node_id}, newline="", encoding="utf-8-sig") as _f_{node_id}:
            _reader_{node_id} = csv.DictReader(_f_{node_id})
            for _row_{node_id} in _reader_{node_id}:
                _shots_{node_id}.append({k.strip(): v.strip() for k, v in _row_{node_id}.items()})
    except Exception as _e_{node_id}:
        print("FlowPins ERROR: " + str(_e_{node_id}))

    total_shots = len(_shots_{node_id})
    _ts_{node_id}   = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _date_{node_id} = datetime.now().strftime("%A, %B %d, %Y")
    _digit_{node_id} = chr(92) + "d"

    _complete_{node_id}    = []
    _in_progress_{node_id} = []
    _not_started_{node_id} = []
    _not_found_{node_id}   = []
    _total_frames_{node_id}    = 0
    _rendered_frames_{node_id} = 0

    for _shot_{node_id} in _shots_{node_id}:
        _name_{node_id}   = _shot_{node_id}.get("shot_name",   "unknown")
        _folder_{node_id} = _shot_{node_id}.get("folder_path", "").replace(chr(92), "/")
        _start_{node_id}  = int(_shot_{node_id}.get("start_frame", "1") or 1)
        _end_{node_id}    = int(_shot_{node_id}.get("end_frame",   "1") or 1)
        _ext_{node_id}    = _shot_{node_id}.get("extension", ".png")
        _exp_{node_id}    = _end_{node_id} - _start_{node_id} + 1
        _total_frames_{node_id} += _exp_{node_id}

        _found_{node_id} = 0
        if os.path.isdir(_folder_{node_id}):
            _pat_{node_id} = re.compile("(" + _digit_{node_id} + "+)" + re.escape(_ext_{node_id}) + "$", re.IGNORECASE)
            _nums_{node_id} = set()
            for _fn_{node_id} in os.listdir(_folder_{node_id}):
                _m_{node_id} = _pat_{node_id}.search(_fn_{node_id})
                if _m_{node_id}:
                    _fnum_{node_id} = int(_m_{node_id}.group(1))
                    if _start_{node_id} <= _fnum_{node_id} <= _end_{node_id}:
                        _nums_{node_id}.add(_fnum_{node_id})
            _found_{node_id} = len(_nums_{node_id})
            _missing_{node_id} = _exp_{node_id} - _found_{node_id}
            _pct_{node_id} = round((_found_{node_id} / _exp_{node_id}) * 100) if _exp_{node_id} > 0 else 0
            _rendered_frames_{node_id} += _found_{node_id}

            if _found_{node_id} == 0:
                _not_started_{node_id}.append((_name_{node_id}, _exp_{node_id}, 0))
            elif _missing_{node_id} == 0:
                _complete_{node_id}.append((_name_{node_id}, _exp_{node_id}, 100))
                complete_shots += 1
            else:
                _in_progress_{node_id}.append((_name_{node_id}, _exp_{node_id}, _found_{node_id}, _pct_{node_id}))
        else:
            _not_found_{node_id}.append(_name_{node_id})
            _rendered_frames_{node_id} += 0

    percent_done = round((_rendered_frames_{node_id} / _total_frames_{node_id}) * 100) if _total_frames_{node_id} > 0 else 0
    _overall_bar_{node_id} = chr(9608) * int(percent_done/5) + chr(9617) * (20 - int(percent_done/5))

    _W_{node_id}   = 62
    _sep_{node_id} = "=" * _W_{node_id}
    _div_{node_id} = "-" * _W_{node_id}

    _lines_{node_id} = [
        _sep_{node_id},
        "  DAILY PROGRESS REPORT",
        "  " + _date_{node_id},
        "  Show: " + _show_{node_id} + "  |  Episode: " + _ep_{node_id} + ("  |  " + _prep_{node_id} if _prep_{node_id} else ""),
        _sep_{node_id},
        "",
        "  OVERALL PROGRESS",
        _div_{node_id},
        "  [" + _overall_bar_{node_id} + "] " + str(percent_done) + "%",
        "  " + str(_rendered_frames_{node_id}) + " / " + str(_total_frames_{node_id}) + " frames rendered",
        "  " + str(complete_shots) + " complete  |  " + str(len(_in_progress_{node_id})) + " in progress  |  " + str(len(_not_started_{node_id})) + " not started",
        "",
    ]

    if _complete_{node_id}:
        _lines_{node_id}.append("  COMPLETE (" + str(len(_complete_{node_id})) + " shots)")
        _lines_{node_id}.append(_div_{node_id})
        for _n_{node_id}, _e_{node_id}, _p_{node_id} in _complete_{node_id}:
            _lines_{node_id}.append("  " + chr(10003) + " " + _n_{node_id}.ljust(16) + str(_e_{node_id}) + " frames")
        _lines_{node_id}.append("")

    if _in_progress_{node_id}:
        _lines_{node_id}.append("  IN PROGRESS (" + str(len(_in_progress_{node_id})) + " shots)")
        _lines_{node_id}.append(_div_{node_id})
        for _n_{node_id}, _e_{node_id}, _f_{node_id}, _p_{node_id} in _in_progress_{node_id}:
            _bar_{node_id} = chr(9608) * int(_p_{node_id}/10) + chr(9617) * (10 - int(_p_{node_id}/10))
            _lines_{node_id}.append("  [" + _bar_{node_id} + "] " + str(_p_{node_id}).rjust(3) + "%  " + _n_{node_id}.ljust(14) + str(_f_{node_id}) + "/" + str(_e_{node_id}) + " frames")
        _lines_{node_id}.append("")

    if _not_started_{node_id}:
        _lines_{node_id}.append("  NOT STARTED (" + str(len(_not_started_{node_id})) + " shots)")
        _lines_{node_id}.append(_div_{node_id})
        for _n_{node_id}, _e_{node_id}, _p_{node_id} in _not_started_{node_id}:
            _lines_{node_id}.append("  - " + _n_{node_id}.ljust(16) + str(_e_{node_id}) + " frames pending")
        _lines_{node_id}.append("")

    if _not_found_{node_id}:
        _lines_{node_id}.append("  FOLDER NOT FOUND (" + str(len(_not_found_{node_id})) + " shots)")
        _lines_{node_id}.append(_div_{node_id})
        for _n_{node_id} in _not_found_{node_id}:
            _lines_{node_id}.append("  ! " + _n_{node_id})
        _lines_{node_id}.append("")

    if _notes_{node_id}:
        _lines_{node_id} += [
            "  NOTES / BLOCKERS",
            _div_{node_id},
            "  " + _notes_{node_id},
            "",
        ]

    _lines_{node_id} += [
        _sep_{node_id},
        "  Generated by FlowPins Pipeline Suite  |  " + _ts_{node_id},
        _sep_{node_id},
    ]

    for _l_{node_id} in _lines_{node_id}:
        print(_l_{node_id})

    if _save_{node_id}:
        _out_dir_{node_id} = os.path.dirname(_csv_{node_id})
        _rname_{node_id}   = "daily_report_" + _ep_{node_id} + "_" + datetime.now().strftime("%Y%m%d") + ".txt"
        report_path = os.path.join(_out_dir_{node_id}, _rname_{node_id})
        try:
            with open(report_path, "w", encoding="utf-8") as _rf_{node_id}:
                _rf_{node_id}.write(chr(10).join(_lines_{node_id}))
            print("  Saved: " + report_path)
        except Exception as _re_{node_id}:
            print("  Save failed: " + str(_re_{node_id}))

{exec_out}`,


  "rpt_error_log_summariser": `# Error Log Summariser
# Parses log files and produces a clean grouped error summary
import os, re
from datetime import datetime

_folder_{node_id}  = "{log_folder}".replace(chr(92), "/").rstrip("/")
_ext_{node_id}     = "{log_extension}"
_recursive_{node_id} = str("{recursive}").lower() == "true"
_save_{node_id}    = str("{save_report}").lower() == "true"
_top_{node_id}     = int({top_errors})

total_errors = 0
error_types  = 0
report_path  = ""
has_errors   = False

# Error patterns — extract the core message stripping timestamps/line numbers
_ERROR_PATS_{node_id} = [
    re.compile(r"error[:\s]+(.+)", re.IGNORECASE),
    re.compile(r"fatal[:\s]+(.+)", re.IGNORECASE),
    re.compile(r"failed[:\s]+(.+)", re.IGNORECASE),
    re.compile(r"exception[:\s]+(.+)", re.IGNORECASE),
    re.compile(r"traceback.+", re.IGNORECASE),
    re.compile(r"cannot\s+\w+.+", re.IGNORECASE),
    re.compile(r"permission denied.+", re.IGNORECASE),
    re.compile(r"out of memory.+", re.IGNORECASE),
    re.compile(r"file not found.+", re.IGNORECASE),
    re.compile(r"access denied.+", re.IGNORECASE),
]

def _normalise_{node_id}(msg):
    _dig_{node_id} = chr(92) + "d"
    _s_{node_id}   = chr(92) + "s"
    _b_{node_id}   = chr(92) + "b"
    msg = re.sub(_dig_{node_id} + "{1,4}" + "[-:/]" + _dig_{node_id} + "{1,2}" + "[-:/]" + _dig_{node_id} + "{1,4}" + _s_{node_id} + "*", "", msg)
    msg = re.sub(_b_{node_id} + "frame[: ]+" + _dig_{node_id} + "+" + _b_{node_id}, "frame N", msg, flags=re.IGNORECASE)
    msg = re.sub("[A-Za-z]:[/]+" + ".+?" + _dig_{node_id} + "+[.][a-z]+", "<file>", msg, flags=re.IGNORECASE)
    return msg.strip()[:100]

if not _folder_{node_id} or not os.path.isdir(_folder_{node_id}):
    print("FlowPins ERROR: Log folder not found — " + str(_folder_{node_id}))
else:
    # Collect log files
    _logs_{node_id} = []
    if _recursive_{node_id}:
        for _r_{node_id}, _d_{node_id}, _f_{node_id} in os.walk(_folder_{node_id}):
            for _fn_{node_id} in _f_{node_id}:
                if _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()):
                    _logs_{node_id}.append(os.path.join(_r_{node_id}, _fn_{node_id}))
    else:
        for _fn_{node_id} in os.listdir(_folder_{node_id}):
            if _fn_{node_id}.lower().endswith(_ext_{node_id}.lower()):
                _logs_{node_id}.append(os.path.join(_folder_{node_id}, _fn_{node_id}))

    _ts_{node_id} = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _error_counts_{node_id}  = {}  # normalised message -> count
    _error_sources_{node_id} = {}  # normalised message -> set of log files
    _file_counts_{node_id}   = {}  # log file -> error count
    _warn_counts_{node_id}   = 0

    for _lf_{node_id} in _logs_{node_id}:
        _fname_{node_id} = os.path.basename(_lf_{node_id})
        _file_counts_{node_id}[_fname_{node_id}] = 0
        try:
            with open(_lf_{node_id}, "r", encoding="utf-8", errors="ignore") as _f_{node_id}:
                for _line_{node_id} in _f_{node_id}:
                    _l_{node_id} = _line_{node_id}.strip()
                    if not _l_{node_id}: continue
                    _ll_{node_id} = _l_{node_id}.lower()

                    # Check warnings separately
                    if "warning" in _ll_{node_id} and "error" not in _ll_{node_id}:
                        _warn_counts_{node_id} += 1
                        continue

                    # Check for errors
                    for _pat_{node_id} in _ERROR_PATS_{node_id}:
                        _m_{node_id} = _pat_{node_id}.search(_l_{node_id})
                        if _m_{node_id}:
                            _msg_{node_id} = _normalise_{node_id}(_m_{node_id}.group(0))
                            if _msg_{node_id}:
                                _error_counts_{node_id}[_msg_{node_id}] = _error_counts_{node_id}.get(_msg_{node_id}, 0) + 1
                                if _msg_{node_id} not in _error_sources_{node_id}:
                                    _error_sources_{node_id}[_msg_{node_id}] = set()
                                _error_sources_{node_id}[_msg_{node_id}].add(_fname_{node_id})
                                _file_counts_{node_id}[_fname_{node_id}] = _file_counts_{node_id}.get(_fname_{node_id}, 0) + 1
                            break
        except Exception as _e_{node_id}:
            print("  Could not read: " + _fname_{node_id} + " — " + str(_e_{node_id}))

    total_errors = sum(_error_counts_{node_id}.values())
    error_types  = len(_error_counts_{node_id})
    has_errors   = total_errors > 0

    # Sort by count descending
    _sorted_{node_id} = sorted(_error_counts_{node_id}.items(), key=lambda x: x[1], reverse=True)

    _W_{node_id}   = 62
    _sep_{node_id} = "=" * _W_{node_id}
    _div_{node_id} = "-" * _W_{node_id}

    _lines_{node_id} = [
        _sep_{node_id},
        "  ERROR LOG SUMMARY",
        "  Generated: " + _ts_{node_id},
        "  Folder   : " + _folder_{node_id},
        "  Log Files: " + str(len(_logs_{node_id})),
        _sep_{node_id},
        "",
        "  OVERVIEW",
        _div_{node_id},
        "  Total Errors  : " + str(total_errors),
        "  Unique Types  : " + str(error_types),
        "  Warnings      : " + str(_warn_counts_{node_id}),
        "",
    ]

    if not has_errors:
        _lines_{node_id}.append("  NO ERRORS FOUND — all logs clean")
    else:
        _lines_{node_id} += [
            "  TOP " + str(min(_top_{node_id}, error_types)) + " ERROR TYPES (by frequency)",
            _div_{node_id},
        ]
        for _msg_{node_id}, _cnt_{node_id} in _sorted_{node_id}[:_top_{node_id}]:
            _bar_{node_id}  = chr(9608) * min(_cnt_{node_id}, 15)
            _src_{node_id}  = ", ".join(sorted(_error_sources_{node_id}.get(_msg_{node_id}, set())))
            _lines_{node_id}.append("  " + str(_cnt_{node_id}).rjust(4) + "x  " + _msg_{node_id}[:50])
            _lines_{node_id}.append("        " + _bar_{node_id} + "  [" + _src_{node_id} + "]")
        _lines_{node_id}.append("")

        _lines_{node_id} += [
            "  ERRORS PER LOG FILE",
            _div_{node_id},
        ]
        for _fn_{node_id}, _cnt_{node_id} in sorted(_file_counts_{node_id}.items(), key=lambda x: x[1], reverse=True):
            _lines_{node_id}.append("  " + str(_cnt_{node_id}).rjust(4) + " errors  " + _fn_{node_id})

    _lines_{node_id} += [
        "",
        _sep_{node_id},
        "  Generated by FlowPins Pipeline Suite",
        _sep_{node_id},
    ]

    for _l_{node_id} in _lines_{node_id}:
        print(_l_{node_id})

    if _save_{node_id}:
        _rname_{node_id} = "error_summary_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".txt"
        report_path = os.path.join(_folder_{node_id}, _rname_{node_id})
        try:
            with open(report_path, "w", encoding="utf-8") as _rf_{node_id}:
                _rf_{node_id}.write(chr(10).join(_lines_{node_id}))
            print("  Saved: " + report_path)
        except Exception as _re_{node_id}:
            print("  Save failed: " + str(_re_{node_id}))

{exec_out}`,


};
