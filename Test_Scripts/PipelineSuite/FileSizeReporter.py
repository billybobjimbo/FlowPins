# Start Execution


# File Size Reporter
# Scans a folder and reports file sizes, largest files, and threshold violations
import os

_folder_n_723805    = "C:\images"
_ext_n_723805       = ".png"
_threshold_n_723805 = int(50)
_show_all_n_723805  = str("false").lower() == "true"
_top_n_723805       = int(10)

total_size_mb  = 0
file_count     = 0
largest_file   = ""
over_threshold = []

if not _folder_n_723805 or not os.path.isdir(_folder_n_723805):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_723805))
else:
    # Collect all files with sizes
    _file_sizes_n_723805 = []
    for _fn_n_723805 in os.listdir(_folder_n_723805):
        if _fn_n_723805.lower().endswith(_ext_n_723805.lower()):
            _fp_n_723805 = os.path.join(_folder_n_723805, _fn_n_723805)
            try:
                _size_n_723805 = os.path.getsize(_fp_n_723805)
                _file_sizes_n_723805.append((_fn_n_723805, _size_n_723805))
            except:
                pass

    if not _file_sizes_n_723805:
        print("FlowPins: No " + _ext_n_723805 + " files found in " + _folder_n_723805)
    else:
        # Sort by size descending
        _file_sizes_n_723805.sort(key=lambda x: x[1], reverse=True)

        _total_bytes_n_723805 = sum(s for _, s in _file_sizes_n_723805)
        file_count    = len(_file_sizes_n_723805)
        total_size_mb = round(_total_bytes_n_723805 / (1024 * 1024), 2)
        largest_file  = _file_sizes_n_723805[0][0]
        _avg_mb_n_723805 = round(total_size_mb / file_count, 3)

        # Find files over threshold
        _thresh_bytes_n_723805 = _threshold_n_723805 * 1024 * 1024
        over_threshold = [
            _fn_n_723805 + " (" + str(round(_sz_n_723805 / (1024*1024), 2)) + " MB)"
            for _fn_n_723805, _sz_n_723805 in _file_sizes_n_723805
            if _sz_n_723805 > _thresh_bytes_n_723805
        ]

        print("FlowPins File Size Reporter")
        print("  Folder    : " + _folder_n_723805)
        print("  Extension : " + _ext_n_723805)
        print("  Files     : " + str(file_count))
        print("  Total     : " + str(total_size_mb) + " MB")
        print("  Average   : " + str(_avg_mb_n_723805) + " MB per file")
        print("  Largest   : " + largest_file + " (" + str(round(_file_sizes_n_723805[0][1] / (1024*1024), 2)) + " MB)")
        print("  Threshold : " + str(_threshold_n_723805) + " MB")
        print("-" * 55)

        # Top N largest files
        print("TOP " + str(_top_n_723805) + " LARGEST FILES:")
        for _fn_n_723805, _sz_n_723805 in _file_sizes_n_723805[:_top_n_723805]:
            _mb_n_723805 = round(_sz_n_723805 / (1024 * 1024), 2)
            _bar_n_723805 = "█" * min(int(_mb_n_723805 * 2), 20)
            print("  " + _bar_n_723805 + " " + str(_mb_n_723805) + " MB  " + _fn_n_723805)

        # Show all files if requested
        if _show_all_n_723805 and len(_file_sizes_n_723805) > _top_n_723805:
            print("")
            print("ALL FILES:")
            for _fn_n_723805, _sz_n_723805 in _file_sizes_n_723805:
                _mb_n_723805 = round(_sz_n_723805 / (1024 * 1024), 2)
                print("  " + str(_mb_n_723805) + " MB  " + _fn_n_723805)

        # Threshold violations
        print("")
        if over_threshold:
            print("OVER THRESHOLD (" + str(_threshold_n_723805) + " MB) — " + str(len(over_threshold)) + " files:")
            for _of_n_723805 in over_threshold:
                print("  ⚠ " + _of_n_723805)
        else:
            print("THRESHOLD: ✓ All files under " + str(_threshold_n_723805) + " MB")

        print("-" * 55)
        print("SUMMARY: " + str(file_count) + " files, " + str(total_size_mb) + " MB total, " + str(_avg_mb_n_723805) + " MB avg")


