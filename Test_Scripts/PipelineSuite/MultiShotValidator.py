# Start Execution


# Read Shot List CSV
# Expected columns: shot_name, folder_path, start_frame, end_frame,
#   frame_padding, prefix, naming_pattern, colourspace, width, height
import csv, os

_csv_path_n_003414 = r"D:\Pipeline_suite\shot_list.csv"
shot_list  = []
shot_count = 0

if not os.path.isfile(_csv_path_n_003414):
    print("FlowPins ERROR: Shot list not found: " + _csv_path_n_003414)
else:
    try:
        with open(_csv_path_n_003414, newline="", encoding="utf-8-sig") as _f_n_003414:
            _reader_n_003414 = csv.DictReader(_f_n_003414)
            for _row_n_003414 in _reader_n_003414:
                # Strip whitespace from all values
                _shot_n_003414 = {k.strip(): (v or "").strip() for k, v in _row_n_003414.items() if k}
                shot_list.append(_shot_n_003414)
        shot_count = len(shot_list)
        print("FlowPins: Read " + str(shot_count) + " shots from " + _csv_path_n_003414)
    except Exception as _e_n_003414:
        print("FlowPins ERROR reading CSV: " + str(_e_n_003414))


# Multi-Shot Validator
# Loops through every shot in the shot list and runs all checks
import csv, os, re
from datetime import datetime

_shots_n_009950      = shot_list
_report_n_009950     = "validation_report.csv"
_chk_seq_n_009950    = str("true").lower() == "true"
_chk_nam_n_009950    = str("true").lower() == "true"
_chk_dim_n_009950    = str("true").lower() == "true"
_chk_cs_n_009950     = str("true").lower() == "true"

print("=" * 65)
print("  FLOWPINS MULTI-SHOT VALIDATOR")
print("  " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
print("  Shots to validate: " + str(len(_shots_n_009950)))
print("=" * 65)

_all_results_n_009950 = []
_passed_shots_n_009950 = 0
_failed_shots_n_009950 = 0

for _shot_n_009950 in _shots_n_009950:
    _name_n_009950    = _shot_n_009950.get("shot_name",      "unknown")
    _folder_n_009950  = _shot_n_009950.get("folder_path",    "")
    def _safe_int_n_009950(val, default=0):
        try: return int(str(val).strip() or default)
        except: return default

    _start_n_009950   = _safe_int_n_009950(_shot_n_009950.get("start_frame",  "1"), 1)
    _end_n_009950     = _safe_int_n_009950(_shot_n_009950.get("end_frame",    "1"), 1)
    _pad_n_009950     = _safe_int_n_009950(_shot_n_009950.get("frame_padding","4"), 4)
    _pfx_n_009950     = _shot_n_009950.get("prefix",          "")
    _pat_n_009950     = _shot_n_009950.get("naming_pattern",  "")
    _cs_n_009950      = _shot_n_009950.get("colourspace",     "")
    _ext_n_009950     = _shot_n_009950.get("extension",       ".png") or ".png"
    _width_n_009950   = _safe_int_n_009950(_shot_n_009950.get("width",  "0"), 0)
    _height_n_009950  = _safe_int_n_009950(_shot_n_009950.get("height", "0"), 0)

    print("")
    print("SHOT: " + _name_n_009950 + "  [" + _folder_n_009950 + "]")
    print("-" * 65)

    _shot_issues_n_009950 = []

    # ── SEQUENCE CHECK ──────────────────────────────────────────
    if _chk_seq_n_009950:
        _expected_n_009950 = set()
        for _f_n_009950 in range(_start_n_009950, _end_n_009950 + 1):
            _expected_n_009950.add(_pfx_n_009950 + str(_f_n_009950).zfill(_pad_n_009950) + _ext_n_009950)
        _found_n_009950 = set()
        if os.path.isdir(_folder_n_009950):
            for _fn_n_009950 in os.listdir(_folder_n_009950):
                if _fn_n_009950.lower().endswith(_ext_n_009950.lower()):
                    _found_n_009950.add(_fn_n_009950)
        _missing_n_009950 = sorted(_expected_n_009950 - _found_n_009950)
        if _missing_n_009950:
            _shot_issues_n_009950.append("SEQUENCE: " + str(len(_missing_n_009950)) + " frames missing")
            print("  SEQUENCE: ✗ FAIL — " + str(len(_missing_n_009950)) + " frames missing")
        else:
            print("  SEQUENCE: ✓ PASS — " + str(len(_found_n_009950)) + " frames present")

    # ── NAMING CHECK ────────────────────────────────────────────
    if _chk_nam_n_009950 and _pat_n_009950:
        _digit_n_009950 = chr(92) + "d"
        _regex_n_009950 = _pat_n_009950.replace(".", ".").replace("*", ".*")
        _regex_n_009950 = re.sub("#+", lambda m: _digit_n_009950 + "{" + str(len(m.group())) + "}", _regex_n_009950)
        _regex_n_009950 = re.sub("@+", lambda m: "[a-zA-Z]{" + str(len(m.group())) + "}", _regex_n_009950)
        _regex_n_009950 = "^" + _regex_n_009950 + "$"
        _nam_fails_n_009950 = []
        if os.path.isdir(_folder_n_009950):
            for _fn_n_009950 in sorted(os.listdir(_folder_n_009950)):
                if _fn_n_009950.lower().endswith(_ext_n_009950.lower()):
                    _stem_n_009950 = os.path.splitext(_fn_n_009950)[0]
                    if not re.match(_regex_n_009950, _stem_n_009950):
                        _nam_fails_n_009950.append(_fn_n_009950)
        if _nam_fails_n_009950:
            _shot_issues_n_009950.append("NAMING: " + str(len(_nam_fails_n_009950)) + " files failed")
            print("  NAMING:   ✗ FAIL — " + str(len(_nam_fails_n_009950)) + " files failed")
        else:
            print("  NAMING:   ✓ PASS")

    # ── DIMENSION + COLOURSPACE CHECK ───────────────────────────
    if (_chk_dim_n_009950 or _chk_cs_n_009950) and _ext_n_009950.lower() == ".png":
        try:
            from PIL import Image, ImageCms
            import io as _io_n_009950
            _dim_fails_n_009950 = []
            _cs_fails_n_009950  = []
            if os.path.isdir(_folder_n_009950):
                for _fn_n_009950 in sorted(os.listdir(_folder_n_009950)):
                    if _fn_n_009950.lower().endswith(".png"):
                        _fp_n_009950 = os.path.join(_folder_n_009950, _fn_n_009950)
                        try:
                            with Image.open(_fp_n_009950) as _img_n_009950:
                                if _chk_dim_n_009950 and _width_n_009950 and _height_n_009950:
                                    if _img_n_009950.width != _width_n_009950 or _img_n_009950.height != _height_n_009950:
                                        _dim_fails_n_009950.append(_fn_n_009950 + " (" + str(_img_n_009950.width) + "x" + str(_img_n_009950.height) + ")")
                                if _chk_cs_n_009950 and _cs_n_009950:
                                    _info_n_009950 = _img_n_009950.info
                                    _icc_n_009950  = _info_n_009950.get("icc_profile", None)
                                    if _cs_n_009950.lower() in ["srgb"] and not _icc_n_009950:
                                        _cs_fails_n_009950.append(_fn_n_009950)
                        except:
                            pass
            if _dim_fails_n_009950:
                _shot_issues_n_009950.append("DIMS: " + str(len(_dim_fails_n_009950)) + " wrong size")
                print("  DIMS:     ✗ FAIL — " + str(len(_dim_fails_n_009950)) + " wrong size")
            elif _chk_dim_n_009950 and _width_n_009950:
                print("  DIMS:     ✓ PASS")
            if _cs_fails_n_009950:
                _shot_issues_n_009950.append("CS: " + str(len(_cs_fails_n_009950)) + " untagged")
                print("  CS:       ✗ FAIL — " + str(len(_cs_fails_n_009950)) + " untagged")
            elif _chk_cs_n_009950 and _cs_n_009950:
                print("  CS:       ✓ PASS")
        except ImportError:
            print("  Note: PIL not available — dimension/CS checks skipped")

    # ── SHOT RESULT ─────────────────────────────────────────────
    if _shot_issues_n_009950:
        _failed_shots_n_009950 += 1
        _all_results_n_009950.append({
            "shot": _name_n_009950, "status": "FAIL",
            "issues": " | ".join(_shot_issues_n_009950),
            "folder": _folder_n_009950
        })
        print("  RESULT:   ✗ FAIL")
    else:
        _passed_shots_n_009950 += 1
        _all_results_n_009950.append({
            "shot": _name_n_009950, "status": "PASS",
            "issues": "",
            "folder": _folder_n_009950
        })
        print("  RESULT:   ✓ PASS")

# ── CONSOLIDATED REPORT ─────────────────────────────────────────
total_shots  = len(_shots_n_009950)
passed_shots = _passed_shots_n_009950
failed_shots = _failed_shots_n_009950
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
report_path = _report_n_009950
try:
    _rdir_n_009950 = os.path.dirname(report_path)
    if _rdir_n_009950 and not os.path.exists(_rdir_n_009950):
        os.makedirs(_rdir_n_009950)
    with open(report_path, "w", newline="", encoding="utf-8") as _rf_n_009950:
        _writer_n_009950 = csv.writer(_rf_n_009950)
        _writer_n_009950.writerow(["Shot", "Status", "Issues", "Folder", "Timestamp"])
        _ts_n_009950 = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        for _r_n_009950 in _all_results_n_009950:
            _writer_n_009950.writerow([
                _r_n_009950["shot"],
                _r_n_009950["status"],
                _r_n_009950["issues"],
                _r_n_009950["folder"],
                _ts_n_009950
            ])
    print("  Report:  " + report_path)
except Exception as _re_n_009950:
    print("  Report save failed: " + str(_re_n_009950))

