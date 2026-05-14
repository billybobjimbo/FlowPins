# Start Execution


# Asset Inventory
# Scans a folder and generates a complete asset list with counts and sizes
import os
from datetime import datetime

_folder_n_049643     = "E:/videos/SHOW_NAME/".replace(chr(92), "/")
_exts_n_049643       = [e.strip().lower() for e in ".png,.jpg,.tga,.tiff,.exr,.psd,.ai,.svg,.mp3,.wav,.pdf,.docx".split(",") if e.strip()]
_recursive_n_049643  = str("true").lower() == "true"
_save_n_049643       = str("true").lower() == "true"

total_files   = 0
total_folders = 0
total_size_mb = 0
asset_list    = []

if not _folder_n_049643 or not os.path.isdir(_folder_n_049643):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_049643))
else:
    _ts_n_049643      = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _type_counts_n_049643 = {}
    _type_sizes_n_049643  = {}
    _folder_counts_n_049643 = {}
    _total_bytes_n_049643 = 0

    # Walk the folder
    for _root_n_049643, _dirs_n_049643, _files_n_049643 in (os.walk(_folder_n_049643) if _recursive_n_049643 else [(_folder_n_049643, [], os.listdir(_folder_n_049643))]):
        total_folders += len(_dirs_n_049643) if _recursive_n_049643 else 0
        _rel_n_049643 = os.path.relpath(_root_n_049643, _folder_n_049643)

        for _fn_n_049643 in sorted(_files_n_049643):
            _ext_n_049643 = os.path.splitext(_fn_n_049643)[1].lower()
            if not _exts_n_049643 or _ext_n_049643 in _exts_n_049643:
                _fp_n_049643 = os.path.join(_root_n_049643, _fn_n_049643)
                try:
                    _sz_n_049643 = os.path.getsize(_fp_n_049643)
                except:
                    _sz_n_049643 = 0

                total_files += 1
                _total_bytes_n_049643 += _sz_n_049643

                # Count by type
                _type_counts_n_049643[_ext_n_049643] = _type_counts_n_049643.get(_ext_n_049643, 0) + 1
                _type_sizes_n_049643[_ext_n_049643]   = _type_sizes_n_049643.get(_ext_n_049643, 0) + _sz_n_049643

                # Count by folder
                _folder_counts_n_049643[_rel_n_049643] = _folder_counts_n_049643.get(_rel_n_049643, 0) + 1

                asset_list.append(_rel_n_049643 + "/" + _fn_n_049643)

    total_size_mb = round(_total_bytes_n_049643 / (1024 * 1024), 2)

    print("FlowPins Asset Inventory")
    print("  Folder : " + _folder_n_049643)
    print("  Scanned: " + ("recursively" if _recursive_n_049643 else "top level only"))
    print("=" * 60)
    print("  Total Files   : " + str(total_files))
    print("  Total Folders : " + str(total_folders))
    print("  Total Size    : " + str(total_size_mb) + " MB")
    print("-" * 60)

    # By file type
    print("BY FILE TYPE:")
    for _ext_n_049643 in sorted(_type_counts_n_049643.keys()):
        _cnt_n_049643 = _type_counts_n_049643[_ext_n_049643]
        _mb_n_049643  = round(_type_sizes_n_049643[_ext_n_049643] / (1024*1024), 2)
        print("  {:<12} {:>6} files   {:>10} MB".format(
            _ext_n_049643 or "(no ext)", _cnt_n_049643, _mb_n_049643))

    # By folder
    if _recursive_n_049643 and len(_folder_counts_n_049643) > 1:
        print("-" * 60)
        print("BY FOLDER:")
        for _fld_n_049643 in sorted(_folder_counts_n_049643.keys()):
            print("  {:>6} files   {}".format(
                _folder_counts_n_049643[_fld_n_049643], _fld_n_049643))

    print("=" * 60)

    # Save report
    if _save_n_049643:
        _rname_n_049643 = "asset_inventory_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".txt"
        _rpath_n_049643 = os.path.join(_folder_n_049643, _rname_n_049643)
        try:
            _lines_n_049643 = [
                "FLOWPINS ASSET INVENTORY",
                "Generated : " + _ts_n_049643,
                "Folder    : " + _folder_n_049643,
                "Files     : " + str(total_files),
                "Size      : " + str(total_size_mb) + " MB",
                "=" * 60,
                "",
                "BY FILE TYPE:"
            ]
            for _ext_n_049643 in sorted(_type_counts_n_049643.keys()):
                _lines_n_049643.append("  " + (_ext_n_049643 or "(no ext)") + " — " +
                    str(_type_counts_n_049643[_ext_n_049643]) + " files, " +
                    str(round(_type_sizes_n_049643[_ext_n_049643] / (1024*1024), 2)) + " MB")
            _lines_n_049643.append("")
            _lines_n_049643.append("ALL FILES:")
            for _a_n_049643 in sorted(asset_list):
                _lines_n_049643.append("  " + _a_n_049643)
            with open(_rpath_n_049643, "w", encoding="utf-8") as _rf_n_049643:
                _rf_n_049643.write(chr(10).join(_lines_n_049643))
            print("  Report: " + _rpath_n_049643)
        except Exception as _re_n_049643:
            print("  Report save failed: " + str(_re_n_049643))


