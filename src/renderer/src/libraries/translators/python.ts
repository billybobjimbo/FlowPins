// src/renderer/src/libraries/translators/python.ts
// ============================================================================
// FLOWPINS: STANDARD PYTHON TRANSLATION DICTIONARY
// Target: Python 3.8+ (standalone scripts)
//
// Inherited by: maya.ts, houdini.ts (via ...PYTHON_TRANSLATIONS spread)
// Pin naming: exec_in / exec_out throughout.
// Windows paths: use r"..." raw strings for all path values.
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
  "set_var": "{var_name} = {value}\n{exec_out}",
  "get_var": "{var_name}",

  // --- CORE: DATA / PRIMITIVES ---
  "const_int":       "{value}",
  "const_string":    'r"{value}"',
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
  // Pipeline - Naming (Python)
  // Clean readable output — internal vars prefixed with _ only where needed
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
extension = "{extension}"
pattern   = "{pattern}"
pass_list = []
fail_list = []
regex = pattern.replace(".", "\\.").replace("*", ".*")
regex = re.sub("#+", lambda m: "\\d{" + str(len(m.group())) + "}", regex)
regex = "^" + regex + "$"
print("\nFlowPins Naming Convention Check")
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
print("\nResult: " + str(pass_count) + " passed, " + str(fail_count) + " failed.")
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
folder      = {folder_path}
csv_path    = os.path.join(folder, "{filename}")
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
print("\nFlowPins Folder Comparison")
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
print("\nFlowPins File Count — " + folder)
print("  " + summary)
{exec_out}`,

  "rp_print_summary": `from datetime import datetime
import os
title     = "{title}"
separator = "=" * 60
timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print(separator)
print("  " + title.upper())
print("  Generated: " + timestamp)
print(separator)
print("  PASSED : " + str({pass_count}))
print("  FAILED : " + str({fail_count}))
if {notes}: print("  Notes  : " + str({notes}))
print(separator)
{exec_out}`,

  // ==========================================================================
  // Pipeline - Colourspace (Python)
  // ==========================================================================

  "cs_read_png_profile": `from PIL import Image, ImageCms
import io, os
file_path    = {file_path}
profile_name = "Untagged"
colourspace  = "Unknown"
is_tagged    = False
try:
    with Image.open(file_path) as img:
        info = img.info
        if "icc_profile" in info:
            try:
                icc         = ImageCms.ImageCmsProfile(io.BytesIO(info["icc_profile"]))
                desc        = ImageCms.getProfileDescription(icc).strip()
                desc_lower  = desc.lower()
                colourspace = "sRGB"   if "srgb"   in desc_lower else \
                              "Linear" if "linear"  in desc_lower else \
                              "ACES"   if "aces"    in desc_lower else \
                              "P3"     if "p3"      in desc_lower else desc
                profile_name = desc
                is_tagged    = True
            except:
                profile_name = "ICC (unreadable)"
                colourspace  = "ICC Embedded"
                is_tagged    = True
        elif "srgb" in info:
            profile_name = "sRGB (chunk)"
            colourspace  = "sRGB"
            is_tagged    = True
        elif "gamma" in info:
            g            = info["gamma"]
            colourspace  = "Linear" if abs(g - 1.0) < 0.01 else "Gamma " + str(round(g, 4))
            profile_name = colourspace
            is_tagged    = True
except Exception as e:
    print("FlowPins CS Error: " + str(e))
    profile_name = "ERROR: " + str(e)
    colourspace  = "ERROR"
{exec_out}`,

  "cs_check_colourspace": `expected       = "{expected}"
is_correct     = (colourspace.lower() == expected.lower())
result_message = ("PASS [" + colourspace + "]" if is_correct
                  else "FAIL: expected " + expected + ", got [" + colourspace + "]")`,

  "cs_batch_validate": `from PIL import Image, ImageCms
import os, io
folder    = {folder_path}
expected  = "{expected}"
pass_list = []
fail_list = []

def get_colourspace(filepath):
    try:
        with Image.open(filepath) as img:
            info = img.info
            if "icc_profile" in info:
                try:
                    d = ImageCms.getProfileDescription(
                        ImageCms.ImageCmsProfile(io.BytesIO(info["icc_profile"]))
                    ).strip().lower()
                    return "sRGB" if "srgb" in d else "Linear" if "linear" in d else "ACES" if "aces" in d else d
                except:
                    return "ICC Embedded"
            elif "srgb" in info: return "sRGB"
            elif "gamma" in info:
                g = info["gamma"]
                return "Linear" if abs(g - 1.0) < 0.01 else "Gamma " + str(round(g, 2))
            else: return "Untagged"
    except Exception as e:
        return "ERROR: " + str(e)

print("\nFlowPins Colourspace Validator — " + folder)
print("Expected: " + expected + "\n" + "-" * 50)
for root, dirs, files in os.walk(folder):
    for filename in sorted(files):
        if filename.lower().endswith(".png"):
            filepath = os.path.join(root, filename)
            cs       = get_colourspace(filepath)
            if cs.lower() == expected.lower():
                pass_list.append(filepath)
                print("  PASS: " + filename + " [" + cs + "]")
            else:
                fail_list.append(filepath + " [" + cs + "]")
                print("  FAIL: " + filename + " — got [" + cs + "]")
pass_count = len(pass_list)
fail_count = len(fail_list)
{exec_out}`,

  "cs_print_report": `import os
from datetime import datetime
pass_list   = {pass_list}
fail_list   = {fail_list}
folder      = {folder_path}
save_report = "{save_report}" == "true"
timestamp   = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
separator   = "=" * 60
lines = [
    separator,
    "FLOWPINS VALIDATION REPORT",
    "Generated : " + timestamp,
    "Folder    : " + str(folder),
    "PASSED    : " + str(len(pass_list)),
    "FAILED    : " + str(len(fail_list)),
    separator
]
if fail_list:
    lines.append("\nFAILED FILES:")
    for f in fail_list: lines.append("  FAIL: " + str(f))
if pass_list:
    lines.append("\nPASSED FILES:")
    for f in pass_list: lines.append("  PASS: " + os.path.basename(str(f)))
lines.append(separator)
report = "\n".join(lines)
print(report)
if save_report and os.path.isdir(str(folder)):
    report_name = "validation_report_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".txt"
    report_path = os.path.join(str(folder), report_name)
    with open(report_path, "w", encoding="utf-8") as report_file:
        report_file.write(report)
    print("Report saved: " + report_path)
{exec_out}`,

  // ==========================================================================
  // Pipeline - Image (Python)
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
folder          = {folder_path}
expected_width  = {expected_width}
expected_height = {expected_height}
extension       = "{extension}"
pass_list       = []
fail_list       = []
print("\nFlowPins Dimension Check — " + folder)
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
expected_cs     = "{expected_cs}"
extension       = "{extension}"
DEPTH_MAP       = {"1":1,"L":8,"P":8,"RGB":8,"RGBA":8,"I":32,"F":32,"I;16":16,"I;16B":16}
pass_list       = []
fail_list       = []

print("\nFlowPins Full Image Validator — " + folder)
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
print("\nResult: " + str(pass_count) + " passed, " + str(fail_count) + " failed.")
{exec_out}`,

  // ==========================================================================
  // File System (Python) - clean readable versions
  // ==========================================================================

  "fs_input_path":  'r"{path}"',
  "fs_file_path":   'r"{path}"',
  "fs_join_path":   "os.path.join({folder}, {filename})",
  "fs_file_exists": "os.path.exists({path})",
  "fs_get_filename":`os.path.basename({path})`,

  "fs_walk_folder": `import os
extension = "{extension_filter}"
for root, dirs, files in os.walk({folder_path}):
    for file_name in sorted(files):
        if file_name.lower().endswith(extension.lower()):
            file_path = os.path.join(root, file_name)
            file_ext  = os.path.splitext(file_name)[1]
            {loop_body}
{exec_out}`,

  "fs_write_log": `import os
log_path = {file_path}
os.makedirs(os.path.dirname(log_path), exist_ok=True) if os.path.dirname(log_path) else None
with open(log_path, "a", encoding="utf-8") as log_file:
    log_file.write(str({message}) + "\n")
{exec_out}`,

  "fs_batch_rename": `import os
folder    = {folder_path}
find      = "{find}"
replace   = "{replace}"
extension = "{extension}"
renamed   = 0
for filename in sorted(os.listdir(folder)):
    if filename.lower().endswith(extension.lower()) and find in filename:
        old_path = os.path.join(folder, filename)
        new_name = filename.replace(find, replace)
        new_path = os.path.join(folder, new_name)
        os.rename(old_path, new_path)
        print("  Renamed: " + filename + " -> " + new_name)
        renamed += 1
print("Batch rename complete: " + str(renamed) + " files renamed.")
{exec_out}`,



};
