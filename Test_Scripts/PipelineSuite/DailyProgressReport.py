# Start Execution


# Daily Progress Report
# End-of-day summary — what's done, in progress, and blocked
import os, re, csv
from datetime import datetime

_csv_n_978946   = r"shot_list.csv".replace(chr(92), "/")
_show_n_978946  = "MMSM"
_ep_n_978946    = "EP01"
_prep_n_978946  = "Alistair Murphy"
_notes_n_978946 = "sc0190 almost done - 3 frames remaining"
_save_n_978946  = str("true").lower() == "true"

report_path    = ""
total_shots    = 0
complete_shots = 0
percent_done   = 0

if not os.path.isfile(_csv_n_978946):
    print("FlowPins ERROR: Shot list not found — " + _csv_n_978946)
else:
    _shots_n_978946 = []
    try:
        with open(_csv_n_978946, newline="", encoding="utf-8-sig") as _f_n_978946:
            _reader_n_978946 = csv.DictReader(_f_n_978946)
            for _row_n_978946 in _reader_n_978946:
                _shots_n_978946.append({k.strip(): v.strip() for k, v in _row_n_978946.items()})
    except Exception as _e_n_978946:
        print("FlowPins ERROR: " + str(_e_n_978946))

    total_shots = len(_shots_n_978946)
    _ts_n_978946   = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _date_n_978946 = datetime.now().strftime("%A, %B %d, %Y")
    _digit_n_978946 = chr(92) + "d"

    _complete_n_978946    = []
    _in_progress_n_978946 = []
    _not_started_n_978946 = []
    _not_found_n_978946   = []
    _total_frames_n_978946    = 0
    _rendered_frames_n_978946 = 0

    for _shot_n_978946 in _shots_n_978946:
        _name_n_978946   = _shot_n_978946.get("shot_name",   "unknown")
        _folder_n_978946 = _shot_n_978946.get("folder_path", "").replace(chr(92), "/")
        _start_n_978946  = int(_shot_n_978946.get("start_frame", "1") or 1)
        _end_n_978946    = int(_shot_n_978946.get("end_frame",   "1") or 1)
        _ext_n_978946    = _shot_n_978946.get("extension", ".png")
        _exp_n_978946    = _end_n_978946 - _start_n_978946 + 1
        _total_frames_n_978946 += _exp_n_978946

        _found_n_978946 = 0
        if os.path.isdir(_folder_n_978946):
            _pat_n_978946 = re.compile("(" + _digit_n_978946 + "+)" + re.escape(_ext_n_978946) + "$", re.IGNORECASE)
            _nums_n_978946 = set()
            for _fn_n_978946 in os.listdir(_folder_n_978946):
                _m_n_978946 = _pat_n_978946.search(_fn_n_978946)
                if _m_n_978946:
                    _fnum_n_978946 = int(_m_n_978946.group(1))
                    if _start_n_978946 <= _fnum_n_978946 <= _end_n_978946:
                        _nums_n_978946.add(_fnum_n_978946)
            _found_n_978946 = len(_nums_n_978946)
            _missing_n_978946 = _exp_n_978946 - _found_n_978946
            _pct_n_978946 = round((_found_n_978946 / _exp_n_978946) * 100) if _exp_n_978946 > 0 else 0
            _rendered_frames_n_978946 += _found_n_978946

            if _found_n_978946 == 0:
                _not_started_n_978946.append((_name_n_978946, _exp_n_978946, 0))
            elif _missing_n_978946 == 0:
                _complete_n_978946.append((_name_n_978946, _exp_n_978946, 100))
                complete_shots += 1
            else:
                _in_progress_n_978946.append((_name_n_978946, _exp_n_978946, _found_n_978946, _pct_n_978946))
        else:
            _not_found_n_978946.append(_name_n_978946)
            _rendered_frames_n_978946 += 0

    percent_done = round((_rendered_frames_n_978946 / _total_frames_n_978946) * 100) if _total_frames_n_978946 > 0 else 0
    _overall_bar_n_978946 = chr(9608) * int(percent_done/5) + chr(9617) * (20 - int(percent_done/5))

    _W_n_978946   = 62
    _sep_n_978946 = "=" * _W_n_978946
    _div_n_978946 = "-" * _W_n_978946

    _lines_n_978946 = [
        _sep_n_978946,
        "  DAILY PROGRESS REPORT",
        "  " + _date_n_978946,
        "  Show: " + _show_n_978946 + "  |  Episode: " + _ep_n_978946 + ("  |  " + _prep_n_978946 if _prep_n_978946 else ""),
        _sep_n_978946,
        "",
        "  OVERALL PROGRESS",
        _div_n_978946,
        "  [" + _overall_bar_n_978946 + "] " + str(percent_done) + "%",
        "  " + str(_rendered_frames_n_978946) + " / " + str(_total_frames_n_978946) + " frames rendered",
        "  " + str(complete_shots) + " complete  |  " + str(len(_in_progress_n_978946)) + " in progress  |  " + str(len(_not_started_n_978946)) + " not started",
        "",
    ]

    if _complete_n_978946:
        _lines_n_978946.append("  COMPLETE (" + str(len(_complete_n_978946)) + " shots)")
        _lines_n_978946.append(_div_n_978946)
        for _n_n_978946, _e_n_978946, _p_n_978946 in _complete_n_978946:
            _lines_n_978946.append("  " + chr(10003) + " " + _n_n_978946.ljust(16) + str(_e_n_978946) + " frames")
        _lines_n_978946.append("")

    if _in_progress_n_978946:
        _lines_n_978946.append("  IN PROGRESS (" + str(len(_in_progress_n_978946)) + " shots)")
        _lines_n_978946.append(_div_n_978946)
        for _n_n_978946, _e_n_978946, _f_n_978946, _p_n_978946 in _in_progress_n_978946:
            _bar_n_978946 = chr(9608) * int(_p_n_978946/10) + chr(9617) * (10 - int(_p_n_978946/10))
            _lines_n_978946.append("  [" + _bar_n_978946 + "] " + str(_p_n_978946).rjust(3) + "%  " + _n_n_978946.ljust(14) + str(_f_n_978946) + "/" + str(_e_n_978946) + " frames")
        _lines_n_978946.append("")

    if _not_started_n_978946:
        _lines_n_978946.append("  NOT STARTED (" + str(len(_not_started_n_978946)) + " shots)")
        _lines_n_978946.append(_div_n_978946)
        for _n_n_978946, _e_n_978946, _p_n_978946 in _not_started_n_978946:
            _lines_n_978946.append("  - " + _n_n_978946.ljust(16) + str(_e_n_978946) + " frames pending")
        _lines_n_978946.append("")

    if _not_found_n_978946:
        _lines_n_978946.append("  FOLDER NOT FOUND (" + str(len(_not_found_n_978946)) + " shots)")
        _lines_n_978946.append(_div_n_978946)
        for _n_n_978946 in _not_found_n_978946:
            _lines_n_978946.append("  ! " + _n_n_978946)
        _lines_n_978946.append("")

    if _notes_n_978946:
        _lines_n_978946 += [
            "  NOTES / BLOCKERS",
            _div_n_978946,
            "  " + _notes_n_978946,
            "",
        ]

    _lines_n_978946 += [
        _sep_n_978946,
        "  Generated by FlowPins Pipeline Suite  |  " + _ts_n_978946,
        _sep_n_978946,
    ]

    for _l_n_978946 in _lines_n_978946:
        print(_l_n_978946)

    if _save_n_978946:
        _out_dir_n_978946 = os.path.dirname(_csv_n_978946)
        _rname_n_978946   = "daily_report_" + _ep_n_978946 + "_" + datetime.now().strftime("%Y%m%d") + ".txt"
        report_path = os.path.join(_out_dir_n_978946, _rname_n_978946)
        try:
            with open(report_path, "w", encoding="utf-8") as _rf_n_978946:
                _rf_n_978946.write(chr(10).join(_lines_n_978946))
            print("  Saved: " + report_path)
        except Exception as _re_n_978946:
            print("  Save failed: " + str(_re_n_978946))


