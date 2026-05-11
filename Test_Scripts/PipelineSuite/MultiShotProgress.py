# Start Execution


# Multi-Shot Progress Board
# Reads a CSV shot list and reports render progress across all shots
import os, re, csv
from datetime import datetime

_csv_n_226580    = r"D:\Pipeline_suite\shot_list.csv".replace(chr(92), "/")
_save_n_226580   = str("true").lower() == "true"

total_shots    = 0
complete_shots = 0
in_progress    = 0
not_started    = 0
all_complete   = False

if not os.path.isfile(_csv_n_226580):
    print("FlowPins ERROR: Shot list not found — " + _csv_n_226580)
else:
    _shots_n_226580 = []
    try:
        with open(_csv_n_226580, newline="", encoding="utf-8-sig") as _f_n_226580:
            _reader_n_226580 = csv.DictReader(_f_n_226580)
            for _row_n_226580 in _reader_n_226580:
                _shots_n_226580.append({k.strip(): v.strip() for k, v in _row_n_226580.items()})
    except Exception as _e_n_226580:
        print("FlowPins ERROR reading CSV: " + str(_e_n_226580))

    total_shots = len(_shots_n_226580)
    _ts_n_226580 = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _results_n_226580 = []

    print("=" * 65)
    print("  FLOWPINS MULTI-SHOT PROGRESS BOARD")
    print("  " + _ts_n_226580)
    print("  Shots: " + str(total_shots))
    print("=" * 65)
    print("")
    print("  {:<20} {:>8} {:>8} {:>8} {:>6}  {}".format(
        "SHOT", "EXPECTED", "FOUND", "MISSING", "%", "STATUS"))
    print("  " + "-" * 63)

    _digit_n_226580 = chr(92) + "d"

    for _shot_n_226580 in _shots_n_226580:
        _name_n_226580   = _shot_n_226580.get("shot_name",    "unknown")
        _folder_n_226580 = _shot_n_226580.get("folder_path",  "").replace(chr(92), "/")
        _start_n_226580  = int(_shot_n_226580.get("start_frame", "1") or 1)
        _end_n_226580    = int(_shot_n_226580.get("end_frame",   "1") or 1)
        _ext_n_226580    = _shot_n_226580.get("extension",    ".png")

        _expected_count_n_226580 = _end_n_226580 - _start_n_226580 + 1
        _found_n_226580 = set()

        if os.path.isdir(_folder_n_226580):
            _pat_n_226580 = re.compile(
                "(" + _digit_n_226580 + "+)" + re.escape(_ext_n_226580) + "$",
                re.IGNORECASE
            )
            for _fn_n_226580 in os.listdir(_folder_n_226580):
                _m_n_226580 = _pat_n_226580.search(_fn_n_226580)
                if _m_n_226580:
                    _fnum_n_226580 = int(_m_n_226580.group(1))
                    if _start_n_226580 <= _fnum_n_226580 <= _end_n_226580:
                        _found_n_226580.add(_fnum_n_226580)

        _found_count_n_226580   = len(_found_n_226580)
        _missing_count_n_226580 = _expected_count_n_226580 - _found_count_n_226580
        _pct_n_226580           = round((_found_count_n_226580 / _expected_count_n_226580) * 100) if _expected_count_n_226580 > 0 else 0

        if not os.path.isdir(_folder_n_226580):
            _status_n_226580 = "NOT FOUND"
            not_started += 1
        elif _found_count_n_226580 == 0:
            _status_n_226580 = "NOT STARTED"
            not_started += 1
        elif _missing_count_n_226580 == 0:
            _status_n_226580 = "COMPLETE"
            complete_shots += 1
        else:
            _bar_fill_n_226580 = int(_pct_n_226580 / 10)
            _bar_n_226580 = chr(9608) * _bar_fill_n_226580 + chr(9617) * (10 - _bar_fill_n_226580)
            _status_n_226580 = "[" + _bar_n_226580 + "] IN PROGRESS"
            in_progress += 1

        print("  {:<20} {:>8} {:>8} {:>8} {:>5}%  {}".format(
            _name_n_226580[:20],
            _expected_count_n_226580,
            _found_count_n_226580,
            _missing_count_n_226580,
            _pct_n_226580,
            _status_n_226580
        ))

        _results_n_226580.append({
            "shot": _name_n_226580, "folder": _folder_n_226580,
            "expected": _expected_count_n_226580, "found": _found_count_n_226580,
            "missing": _missing_count_n_226580, "percent": _pct_n_226580,
            "status": _status_n_226580
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

    if _save_n_226580:
        _rname_n_226580 = "progress_report_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".csv"
        _rpath_n_226580 = os.path.join(os.path.dirname(_csv_n_226580), _rname_n_226580)
        try:
            with open(_rpath_n_226580, "w", newline="", encoding="utf-8") as _rf_n_226580:
                _w_n_226580 = csv.writer(_rf_n_226580)
                _w_n_226580.writerow(["Shot","Expected","Found","Missing","Percent","Status","Folder"])
                for _r_n_226580 in _results_n_226580:
                    _w_n_226580.writerow([_r_n_226580["shot"],_r_n_226580["expected"],
                        _r_n_226580["found"],_r_n_226580["missing"],
                        str(_r_n_226580["percent"])+"%",_r_n_226580["status"],_r_n_226580["folder"]])
            print("  Report: " + _rpath_n_226580)
        except Exception as _re_n_226580:
            print("  Report save failed: " + str(_re_n_226580))


