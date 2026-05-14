# Start Execution


# Render Error Scanner
# Scans render log files for common error strings
import os, re
from datetime import datetime

_log_folder_n_837748  = "D:/Pipeline_suite/".replace(chr(92), "/")
_log_ext_n_837748     = ".log" if ".log".startswith(".") else "." + ".log"
_custom_n_837748      = ""
_show_warn_n_837748   = str("true").lower() == "true"
_max_n_837748         = int(50)

# Normalise path
if isinstance(_log_folder_n_837748, str):
    _log_folder_n_837748 = _log_folder_n_837748.replace(chr(92), "/")

error_count   = 0
warning_count = 0
error_lines   = []
has_errors    = False

# Common error patterns across DCCs
_ERROR_PATTERNS_n_837748 = [
    "error", "failed", "failure", "fatal", "exception",
    "traceback", "cannot open", "file not found",
    "out of memory", "crash", "aborted", "killed",
    "permission denied", "access denied", "disk full",
    "rendering aborted", "frame failed", "job failed"
]

# Common warning patterns
_WARN_PATTERNS_n_837748 = [
    "warning", "warn:", "deprecated", "missing texture",
    "missing file", "not found", "skipping"
]

# Add custom error strings
if _custom_n_837748:
    for _ce_n_837748 in _custom_n_837748.split(","):
        _ce_n_837748 = _ce_n_837748.strip().lower()
        if _ce_n_837748:
            _ERROR_PATTERNS_n_837748.append(_ce_n_837748)

if not _log_folder_n_837748 or not os.path.isdir(_log_folder_n_837748):
    print("FlowPins ERROR: Log folder not found — " + str(_log_folder_n_837748))
else:
    # Find all log files
    _log_files_n_837748 = []
    for _fn_n_837748 in sorted(os.listdir(_log_folder_n_837748)):
        if _fn_n_837748.lower().endswith(_log_ext_n_837748.lower()):
            _log_files_n_837748.append(os.path.join(_log_folder_n_837748, _fn_n_837748))

    print("FlowPins Render Error Scanner")
    print("  Log Folder : " + _log_folder_n_837748)
    print("  Log Files  : " + str(len(_log_files_n_837748)))
    print("  Extension  : " + _log_ext_n_837748)
    print("-" * 55)

    if not _log_files_n_837748:
        print("  No " + _log_ext_n_837748 + " files found in folder")
    else:
        for _lf_n_837748 in _log_files_n_837748:
            _fname_n_837748 = os.path.basename(_lf_n_837748)
            _file_errors_n_837748   = []
            _file_warnings_n_837748 = []

            try:
                with open(_lf_n_837748, "r", encoding="utf-8", errors="ignore") as _f_n_837748:
                    for _lnum_n_837748, _line_n_837748 in enumerate(_f_n_837748, 1):
                        _lower_n_837748 = _line_n_837748.lower().strip()
                        if not _lower_n_837748:
                            continue

                        # Check for errors
                        _is_err_n_837748 = any(p in _lower_n_837748 for p in _ERROR_PATTERNS_n_837748)
                        _is_warn_n_837748 = any(p in _lower_n_837748 for p in _WARN_PATTERNS_n_837748)

                        if _is_err_n_837748:
                            _file_errors_n_837748.append("  Line " + str(_lnum_n_837748) + ": " + _line_n_837748.strip()[:120])
                        elif _is_warn_n_837748 and _show_warn_n_837748:
                            _file_warnings_n_837748.append("  Line " + str(_lnum_n_837748) + ": " + _line_n_837748.strip()[:120])

            except Exception as _e_n_837748:
                _file_errors_n_837748.append("  Could not read file: " + str(_e_n_837748))

            # Report per file
            if _file_errors_n_837748 or _file_warnings_n_837748:
                print("")
                print("FILE: " + _fname_n_837748)
                if _file_errors_n_837748:
                    print("  ERRORS (" + str(len(_file_errors_n_837748)) + "):")
                    for _el_n_837748 in _file_errors_n_837748[:_max_n_837748]:
                        print("  ✗ " + _el_n_837748)
                        error_lines.append(_fname_n_837748 + " — " + _el_n_837748.strip())
                    if len(_file_errors_n_837748) > _max_n_837748:
                        print("  ... and " + str(len(_file_errors_n_837748) - _max_n_837748) + " more errors")
                if _file_warnings_n_837748 and _show_warn_n_837748:
                    print("  WARNINGS (" + str(len(_file_warnings_n_837748)) + "):")
                    for _wl_n_837748 in _file_warnings_n_837748[:10]:
                        print("  ⚠ " + _wl_n_837748)
            else:
                print("  ✓ " + _fname_n_837748 + " — clean")

            error_count   += len(_file_errors_n_837748)
            warning_count += len(_file_warnings_n_837748)

        has_errors = error_count > 0

        print("")
        print("-" * 55)
        if has_errors:
            print("RESULT: ✗ " + str(error_count) + " errors found across " + str(len(_log_files_n_837748)) + " log files")
        else:
            print("RESULT: ✓ No errors found — all logs clean")
        if warning_count > 0:
            print("        ⚠ " + str(warning_count) + " warnings")


