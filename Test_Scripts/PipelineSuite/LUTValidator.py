# Start Execution


# LUT Validator
# Checks LUT files are present, readable and correctly formatted
import os, re

_folder_n_652722    = "D:/Pipeline_suite".replace(chr(92), "/").rstrip("/")
_exts_n_652722      = [e.strip().lower() for e in ".cube,.lut,.3dl,.csp,.cc,.ccc".split(",") if e.strip()]
_recursive_n_652722 = str("true").lower() == "true"

total_luts    = 0
valid_count   = 0
invalid_count = 0
invalid_list  = []
all_valid     = False

# LUT format validators
def _validate_cube_n_652722(fp):
    # .cube — Adobe/Resolve format
    # Must have: LUT_3D_SIZE or LUT_1D_SIZE, data lines of 3 floats
    _has_size_n_652722  = False
    _data_lines_n_652722 = 0
    _expected_n_652722  = 0
    try:
        with open(fp, "r", encoding="utf-8", errors="ignore") as _f_n_652722:
            for _line_n_652722 in _f_n_652722:
                _l_n_652722 = _line_n_652722.strip()
                if not _l_n_652722 or _l_n_652722.startswith("#"): continue
                if _l_n_652722.upper().startswith("LUT_3D_SIZE"):
                    _sz_n_652722 = int(_l_n_652722.split()[-1])
                    _expected_n_652722 = _sz_n_652722 ** 3
                    _has_size_n_652722 = True
                elif _l_n_652722.upper().startswith("LUT_1D_SIZE"):
                    _expected_n_652722 = int(_l_n_652722.split()[-1])
                    _has_size_n_652722 = True
                elif _l_n_652722.upper().startswith("LUT_"):
                    continue  # other metadata
                elif _l_n_652722.upper().startswith("TITLE") or _l_n_652722.upper().startswith("DOMAIN"):
                    continue
                else:
                    _parts_n_652722 = _l_n_652722.split()
                    if len(_parts_n_652722) == 3:
                        try:
                            float(_parts_n_652722[0]); float(_parts_n_652722[1]); float(_parts_n_652722[2])
                            _data_lines_n_652722 += 1
                        except: pass
        if not _has_size_n_652722:
            return False, "Missing LUT_3D_SIZE or LUT_1D_SIZE declaration"
        if _expected_n_652722 > 0 and _data_lines_n_652722 == 0:
            return False, "No data lines found"
        if _expected_n_652722 > 0 and abs(_data_lines_n_652722 - _expected_n_652722) > 10:
            return False, "Expected " + str(_expected_n_652722) + " data lines, found " + str(_data_lines_n_652722)
        return True, "OK — " + str(_data_lines_n_652722) + " data lines"
    except Exception as _e_n_652722:
        return False, "Read error: " + str(_e_n_652722)[:50]

def _validate_3dl_n_652722(fp):
    # .3dl — Lustre/Flame format
    _data_lines_n_652722 = 0
    try:
        with open(fp, "r", encoding="utf-8", errors="ignore") as _f_n_652722:
            for _line_n_652722 in _f_n_652722:
                _l_n_652722 = _line_n_652722.strip()
                if not _l_n_652722 or _l_n_652722.startswith("#"): continue
                _parts_n_652722 = _l_n_652722.split()
                if len(_parts_n_652722) >= 3:
                    try:
                        int(_parts_n_652722[0]); int(_parts_n_652722[1]); int(_parts_n_652722[2])
                        _data_lines_n_652722 += 1
                    except: pass
        if _data_lines_n_652722 == 0:
            return False, "No integer data lines found"
        return True, "OK — " + str(_data_lines_n_652722) + " data lines"
    except Exception as _e_n_652722:
        return False, "Read error: " + str(_e_n_652722)[:50]

def _validate_generic_n_652722(fp):
    # .csp, .lut, .cc, .ccc — check it's readable and non-empty
    try:
        _sz_n_652722 = os.path.getsize(fp)
        if _sz_n_652722 == 0:
            return False, "File is empty"
        with open(fp, "r", encoding="utf-8", errors="ignore") as _f_n_652722:
            _content_n_652722 = _f_n_652722.read(1024)
        if not _content_n_652722.strip():
            return False, "File appears empty or unreadable"
        return True, "OK — " + str(round(_sz_n_652722/1024, 1)) + " KB"
    except Exception as _e_n_652722:
        return False, "Read error: " + str(_e_n_652722)[:50]

if not _folder_n_652722 or not os.path.isdir(_folder_n_652722):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_652722))
else:
    # Collect LUT files
    _luts_n_652722 = []
    if _recursive_n_652722:
        for _r_n_652722, _d_n_652722, _f_n_652722 in os.walk(_folder_n_652722):
            for _fn_n_652722 in _f_n_652722:
                if any(_fn_n_652722.lower().endswith(e) for e in _exts_n_652722):
                    _luts_n_652722.append(os.path.join(_r_n_652722, _fn_n_652722))
    else:
        for _fn_n_652722 in os.listdir(_folder_n_652722):
            if any(_fn_n_652722.lower().endswith(e) for e in _exts_n_652722):
                _luts_n_652722.append(os.path.join(_folder_n_652722, _fn_n_652722))

    total_luts = len(_luts_n_652722)

    print("FlowPins LUT Validator")
    print("  Folder : " + _folder_n_652722)
    print("  LUTs   : " + str(total_luts))
    print("-" * 55)

    if total_luts == 0:
        print("  No LUT files found — check folder path and extensions")
    else:
        for _fp_n_652722 in sorted(_luts_n_652722):
            _fn_n_652722  = os.path.basename(_fp_n_652722)
            _ext_n_652722 = os.path.splitext(_fn_n_652722)[1].lower()
            _sz_n_652722  = round(os.path.getsize(_fp_n_652722) / 1024, 1)

            # Validate by format
            if _ext_n_652722 == ".cube":
                _ok_n_652722, _msg_n_652722 = _validate_cube_n_652722(_fp_n_652722)
            elif _ext_n_652722 == ".3dl":
                _ok_n_652722, _msg_n_652722 = _validate_3dl_n_652722(_fp_n_652722)
            else:
                _ok_n_652722, _msg_n_652722 = _validate_generic_n_652722(_fp_n_652722)

            if _ok_n_652722:
                valid_count += 1
                print("  ✓ " + _fn_n_652722 + " [" + str(_sz_n_652722) + " KB] — " + _msg_n_652722)
            else:
                invalid_count += 1
                invalid_list.append(_fn_n_652722 + " — " + _msg_n_652722)
                print("  ✗ " + _fn_n_652722 + " [" + str(_sz_n_652722) + " KB] — " + _msg_n_652722)

    all_valid = invalid_count == 0 and total_luts > 0

    print("-" * 55)
    if total_luts == 0:
        print("RESULT: No LUT files to validate")
    elif all_valid:
        print("RESULT: ✓ ALL VALID — " + str(valid_count) + "/" + str(total_luts) + " LUTs passed")
    else:
        print("RESULT: ✗ " + str(invalid_count) + " invalid, " + str(valid_count) + " valid")


