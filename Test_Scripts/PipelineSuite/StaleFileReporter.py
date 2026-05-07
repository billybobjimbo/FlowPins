# Start Execution


# Stale File Reporter
# Finds files not modified in X days
import os, time

_folder_n_610749   = "C:/images"
_ext_n_610749      = ".png"
_days_n_610749     = int(30)
_recursive_n_610749= str("false").lower() == "true"
_now_n_610749      = time.time()
_cutoff_n_610749   = _now_n_610749 - (_days_n_610749 * 86400)

stale_files  = []
stale_count  = 0
stale_mb     = 0
has_stale    = False

if not _folder_n_610749 or not os.path.isdir(_folder_n_610749):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_610749))
else:
    # Collect files
    _all_files_n_610749 = []
    if _recursive_n_610749:
        for _r_n_610749, _d_n_610749, _f_n_610749 in os.walk(_folder_n_610749):
            for _fn_n_610749 in _f_n_610749:
                if _fn_n_610749.lower().endswith(_ext_n_610749.lower()):
                    _all_files_n_610749.append(os.path.join(_r_n_610749, _fn_n_610749))
    else:
        for _fn_n_610749 in os.listdir(_folder_n_610749):
            if _fn_n_610749.lower().endswith(_ext_n_610749.lower()):
                _all_files_n_610749.append(os.path.join(_folder_n_610749, _fn_n_610749))

    print("FlowPins Stale File Reporter")
    print("  Folder    : " + _folder_n_610749)
    print("  Extension : " + _ext_n_610749)
    print("  Stale if  : not modified in " + str(_days_n_610749) + " days")
    print("  Files     : " + str(len(_all_files_n_610749)))
    print("-" * 55)

    _stale_data_n_610749 = []
    _total_bytes_n_610749 = 0

    for _fp_n_610749 in sorted(_all_files_n_610749):
        try:
            _mtime_n_610749 = os.path.getmtime(_fp_n_610749)
            _size_n_610749  = os.path.getsize(_fp_n_610749)
            if _mtime_n_610749 < _cutoff_n_610749:
                _age_days_n_610749 = int((_now_n_610749 - _mtime_n_610749) / 86400)
                _stale_data_n_610749.append((_fp_n_610749, _age_days_n_610749, _size_n_610749))
                _total_bytes_n_610749 += _size_n_610749
                stale_files.append(os.path.basename(_fp_n_610749) + " (" + str(_age_days_n_610749) + " days old)")
        except Exception as _e_n_610749:
            print("  ERROR: " + _fp_n_610749 + " — " + str(_e_n_610749))

    stale_count = len(_stale_data_n_610749)
    stale_mb    = round(_total_bytes_n_610749 / (1024 * 1024), 2)
    has_stale   = stale_count > 0

    if not has_stale:
        print("  ✓ No stale files found — all files modified within " + str(_days_n_610749) + " days")
    else:
        print("  ✗ Found " + str(stale_count) + " stale files (" + str(stale_mb) + " MB)")
        print("")
        # Sort by age descending — oldest first
        _stale_data_n_610749.sort(key=lambda x: x[1], reverse=True)
        for _fp_n_610749, _age_n_610749, _sz_n_610749 in _stale_data_n_610749:
            _mb_n_610749 = round(_sz_n_610749 / (1024 * 1024), 2)
            print("  " + str(_age_n_610749).rjust(4) + " days  " + str(_mb_n_610749) + " MB  " + os.path.basename(_fp_n_610749))

    print("-" * 55)
    print("SUMMARY: " + str(stale_count) + " stale files, " + str(stale_mb) + " MB recoverable")


