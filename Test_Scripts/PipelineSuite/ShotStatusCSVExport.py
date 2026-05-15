# Start Execution


# Shot Status CSV Export
# Scans shot folders from a CSV shot list and exports a status report
import os, re, csv
from datetime import datetime

_csv_n_599793    = r"shot_list.csv".replace(chr(92), "/")
_out_n_599793    = r"".replace(chr(92), "/").rstrip("/")
_show_n_599793   = "Show Name"
_ep_n_599793     = "EP01"

total_shots    = 0
complete_shots = 0
output_path    = ""

if not os.path.isfile(_csv_n_599793):
    print("FlowPins ERROR: Shot list not found — " + _csv_n_599793)
else:
    _shots_n_599793 = []
    try:
        with open(_csv_n_599793, newline="", encoding="utf-8-sig") as _f_n_599793:
            _reader_n_599793 = csv.DictReader(_f_n_599793)
            for _row_n_599793 in _reader_n_599793:
                _shots_n_599793.append({k.strip(): v.strip() for k, v in _row_n_599793.items()})
    except Exception as _e_n_599793:
        print("FlowPins ERROR reading CSV: " + str(_e_n_599793))

    total_shots = len(_shots_n_599793)
    _ts_n_599793 = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _digit_n_599793 = chr(92) + "d"
    _rows_n_599793  = []

    print("FlowPins Shot Status CSV Export")
    print("  Show    : " + _show_n_599793)
    print("  Episode : " + _ep_n_599793)
    print("  Shots   : " + str(total_shots))
    print("-" * 55)

    for _shot_n_599793 in _shots_n_599793:
        _name_n_599793    = _shot_n_599793.get("shot_name",   "unknown")
        _folder_n_599793  = _shot_n_599793.get("folder_path", "").replace(chr(92), "/")
        _start_n_599793   = int(_shot_n_599793.get("start_frame", "1") or 1)
        _end_n_599793     = int(_shot_n_599793.get("end_frame",   "1") or 1)
        _ext_n_599793     = _shot_n_599793.get("extension", ".png")
        _expected_n_599793 = _end_n_599793 - _start_n_599793 + 1

        # Count frames
        _found_n_599793 = 0
        _missing_list_n_599793 = []
        if os.path.isdir(_folder_n_599793):
            _pat_n_599793 = re.compile("(" + _digit_n_599793 + "+)" + re.escape(_ext_n_599793) + "$", re.IGNORECASE)
            _nums_n_599793 = set()
            for _fn_n_599793 in os.listdir(_folder_n_599793):
                _m_n_599793 = _pat_n_599793.search(_fn_n_599793)
                if _m_n_599793:
                    _fnum_n_599793 = int(_m_n_599793.group(1))
                    if _start_n_599793 <= _fnum_n_599793 <= _end_n_599793:
                        _nums_n_599793.add(_fnum_n_599793)
            _found_n_599793 = len(_nums_n_599793)
            _missing_list_n_599793 = sorted(set(range(_start_n_599793, _end_n_599793+1)) - _nums_n_599793)

        _missing_n_599793 = len(_missing_list_n_599793)
        _pct_n_599793     = round((_found_n_599793 / _expected_n_599793) * 100) if _expected_n_599793 > 0 else 0

        # Status
        if not os.path.isdir(_folder_n_599793):
            _status_n_599793 = "NOT FOUND"
        elif _found_n_599793 == 0:
            _status_n_599793 = "NOT STARTED"
        elif _missing_n_599793 == 0:
            _status_n_599793 = "COMPLETE"
            complete_shots += 1
        else:
            _status_n_599793 = "IN PROGRESS"

        # Missing frame summary (first 5)
        _miss_str_n_599793 = ""
        if _missing_list_n_599793:
            _miss_str_n_599793 = " ".join(str(f).zfill(4) for f in _missing_list_n_599793[:5])
            if len(_missing_list_n_599793) > 5:
                _miss_str_n_599793 += " (+" + str(len(_missing_list_n_599793)-5) + " more)"

        _rows_n_599793.append([
            _show_n_599793, _ep_n_599793, _name_n_599793,
            str(_expected_n_599793), str(_found_n_599793), str(_missing_n_599793),
            str(_pct_n_599793) + "%", _status_n_599793,
            _folder_n_599793, _miss_str_n_599793, _ts_n_599793
        ])

        print("  " + _name_n_599793.ljust(12) + " " + _status_n_599793.ljust(14) +
              str(_found_n_599793) + "/" + str(_expected_n_599793) + " frames  " + str(_pct_n_599793) + "%")

    print("-" * 55)
    print("  Complete: " + str(complete_shots) + "/" + str(total_shots) + " shots")

    # Save CSV
    _out_folder_n_599793 = _out_n_599793 if _out_n_599793 and os.path.isdir(_out_n_599793) else os.path.dirname(_csv_n_599793)
    _rname_n_599793 = "shot_status_" + _ep_n_599793 + "_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".csv"
    output_path = os.path.join(_out_folder_n_599793, _rname_n_599793)

    try:
        with open(output_path, "w", newline="", encoding="utf-8") as _rf_n_599793:
            _w_n_599793 = csv.writer(_rf_n_599793)
            _w_n_599793.writerow(["Show","Episode","Shot","Expected","Found","Missing","Percent","Status","Folder","Missing Frames","Generated"])
            for _r_n_599793 in _rows_n_599793:
                _w_n_599793.writerow(_r_n_599793)
        print("  Saved : " + output_path)
    except Exception as _re_n_599793:
        print("  Save failed: " + str(_re_n_599793))


