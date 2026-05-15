# Start Execution


# Error Log Summariser
# Parses log files and produces a clean grouped error summary
import os, re
from datetime import datetime

_folder_n_538783  = "D:/Pipeline_suite/".replace(chr(92), "/").rstrip("/")
_ext_n_538783     = ".log"
_recursive_n_538783 = str("false").lower() == "true"
_save_n_538783    = str("true").lower() == "true"
_top_n_538783     = int(10)

total_errors = 0
error_types  = 0
report_path  = ""
has_errors   = False

# Error patterns — extract the core message stripping timestamps/line numbers
_ERROR_PATS_n_538783 = [
    re.compile(r"error[:s]+(.+)", re.IGNORECASE),
    re.compile(r"fatal[:s]+(.+)", re.IGNORECASE),
    re.compile(r"failed[:s]+(.+)", re.IGNORECASE),
    re.compile(r"exception[:s]+(.+)", re.IGNORECASE),
    re.compile(r"traceback.+", re.IGNORECASE),
    re.compile(r"cannots+w+.+", re.IGNORECASE),
    re.compile(r"permission denied.+", re.IGNORECASE),
    re.compile(r"out of memory.+", re.IGNORECASE),
    re.compile(r"file not found.+", re.IGNORECASE),
    re.compile(r"access denied.+", re.IGNORECASE),
]

def _normalise_n_538783(msg):
    _dig_n_538783 = chr(92) + "d"
    _s_n_538783   = chr(92) + "s"
    _b_n_538783   = chr(92) + "b"
    msg = re.sub(_dig_n_538783 + "{1,4}" + "[-:/]" + _dig_n_538783 + "{1,2}" + "[-:/]" + _dig_n_538783 + "{1,4}" + _s_n_538783 + "*", "", msg)
    msg = re.sub(_b_n_538783 + "frame[: ]+" + _dig_n_538783 + "+" + _b_n_538783, "frame N", msg, flags=re.IGNORECASE)
    msg = re.sub("[A-Za-z]:[/]+" + ".+?" + _dig_n_538783 + "+[.][a-z]+", "<file>", msg, flags=re.IGNORECASE)
    return msg.strip()[:100]

if not _folder_n_538783 or not os.path.isdir(_folder_n_538783):
    print("FlowPins ERROR: Log folder not found — " + str(_folder_n_538783))
else:
    # Collect log files
    _logs_n_538783 = []
    if _recursive_n_538783:
        for _r_n_538783, _d_n_538783, _f_n_538783 in os.walk(_folder_n_538783):
            for _fn_n_538783 in _f_n_538783:
                if _fn_n_538783.lower().endswith(_ext_n_538783.lower()):
                    _logs_n_538783.append(os.path.join(_r_n_538783, _fn_n_538783))
    else:
        for _fn_n_538783 in os.listdir(_folder_n_538783):
            if _fn_n_538783.lower().endswith(_ext_n_538783.lower()):
                _logs_n_538783.append(os.path.join(_folder_n_538783, _fn_n_538783))

    _ts_n_538783 = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _error_counts_n_538783  = {}  # normalised message -> count
    _error_sources_n_538783 = {}  # normalised message -> set of log files
    _file_counts_n_538783   = {}  # log file -> error count
    _warn_counts_n_538783   = 0

    for _lf_n_538783 in _logs_n_538783:
        _fname_n_538783 = os.path.basename(_lf_n_538783)
        _file_counts_n_538783[_fname_n_538783] = 0
        try:
            with open(_lf_n_538783, "r", encoding="utf-8", errors="ignore") as _f_n_538783:
                for _line_n_538783 in _f_n_538783:
                    _l_n_538783 = _line_n_538783.strip()
                    if not _l_n_538783: continue
                    _ll_n_538783 = _l_n_538783.lower()

                    # Check warnings separately
                    if "warning" in _ll_n_538783 and "error" not in _ll_n_538783:
                        _warn_counts_n_538783 += 1
                        continue

                    # Check for errors
                    for _pat_n_538783 in _ERROR_PATS_n_538783:
                        _m_n_538783 = _pat_n_538783.search(_l_n_538783)
                        if _m_n_538783:
                            _msg_n_538783 = _normalise_n_538783(_m_n_538783.group(0))
                            if _msg_n_538783:
                                _error_counts_n_538783[_msg_n_538783] = _error_counts_n_538783.get(_msg_n_538783, 0) + 1
                                if _msg_n_538783 not in _error_sources_n_538783:
                                    _error_sources_n_538783[_msg_n_538783] = set()
                                _error_sources_n_538783[_msg_n_538783].add(_fname_n_538783)
                                _file_counts_n_538783[_fname_n_538783] = _file_counts_n_538783.get(_fname_n_538783, 0) + 1
                            break
        except Exception as _e_n_538783:
            print("  Could not read: " + _fname_n_538783 + " — " + str(_e_n_538783))

    total_errors = sum(_error_counts_n_538783.values())
    error_types  = len(_error_counts_n_538783)
    has_errors   = total_errors > 0

    # Sort by count descending
    _sorted_n_538783 = sorted(_error_counts_n_538783.items(), key=lambda x: x[1], reverse=True)

    _W_n_538783   = 62
    _sep_n_538783 = "=" * _W_n_538783
    _div_n_538783 = "-" * _W_n_538783

    _lines_n_538783 = [
        _sep_n_538783,
        "  ERROR LOG SUMMARY",
        "  Generated: " + _ts_n_538783,
        "  Folder   : " + _folder_n_538783,
        "  Log Files: " + str(len(_logs_n_538783)),
        _sep_n_538783,
        "",
        "  OVERVIEW",
        _div_n_538783,
        "  Total Errors  : " + str(total_errors),
        "  Unique Types  : " + str(error_types),
        "  Warnings      : " + str(_warn_counts_n_538783),
        "",
    ]

    if not has_errors:
        _lines_n_538783.append("  NO ERRORS FOUND — all logs clean")
    else:
        _lines_n_538783 += [
            "  TOP " + str(min(_top_n_538783, error_types)) + " ERROR TYPES (by frequency)",
            _div_n_538783,
        ]
        for _msg_n_538783, _cnt_n_538783 in _sorted_n_538783[:_top_n_538783]:
            _bar_n_538783  = chr(9608) * min(_cnt_n_538783, 15)
            _src_n_538783  = ", ".join(sorted(_error_sources_n_538783.get(_msg_n_538783, set())))
            _lines_n_538783.append("  " + str(_cnt_n_538783).rjust(4) + "x  " + _msg_n_538783[:50])
            _lines_n_538783.append("        " + _bar_n_538783 + "  [" + _src_n_538783 + "]")
        _lines_n_538783.append("")

        _lines_n_538783 += [
            "  ERRORS PER LOG FILE",
            _div_n_538783,
        ]
        for _fn_n_538783, _cnt_n_538783 in sorted(_file_counts_n_538783.items(), key=lambda x: x[1], reverse=True):
            _lines_n_538783.append("  " + str(_cnt_n_538783).rjust(4) + " errors  " + _fn_n_538783)

    _lines_n_538783 += [
        "",
        _sep_n_538783,
        "  Generated by FlowPins Pipeline Suite",
        _sep_n_538783,
    ]

    for _l_n_538783 in _lines_n_538783:
        print(_l_n_538783)

    if _save_n_538783:
        _rname_n_538783 = "error_summary_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".txt"
        report_path = os.path.join(_folder_n_538783, _rname_n_538783)
        try:
            with open(report_path, "w", encoding="utf-8") as _rf_n_538783:
                _rf_n_538783.write(chr(10).join(_lines_n_538783))
            print("  Saved: " + report_path)
        except Exception as _re_n_538783:
            print("  Save failed: " + str(_re_n_538783))


