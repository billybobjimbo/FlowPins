# Start Execution


# Duplicate File Finder
# Finds identical files by content (MD5) or by name
import os, hashlib

_folder_n_822446    = "C:/images"
_ext_n_822446       = ".png"
_mode_n_822446      = "content"
_recursive_n_822446 = str("false").lower() == "true"

duplicate_groups = []
duplicate_count  = 0
wasted_mb        = 0
has_duplicates   = False

if not _folder_n_822446 or not os.path.isdir(_folder_n_822446):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_822446))
else:
    # Collect files
    _all_files_n_822446 = []
    if _recursive_n_822446:
        for _r_n_822446, _d_n_822446, _f_n_822446 in os.walk(_folder_n_822446):
            for _fn_n_822446 in _f_n_822446:
                if _fn_n_822446.lower().endswith(_ext_n_822446.lower()):
                    _all_files_n_822446.append(os.path.join(_r_n_822446, _fn_n_822446))
    else:
        for _fn_n_822446 in os.listdir(_folder_n_822446):
            if _fn_n_822446.lower().endswith(_ext_n_822446.lower()):
                _all_files_n_822446.append(os.path.join(_folder_n_822446, _fn_n_822446))

    print("FlowPins Duplicate File Finder")
    print("  Folder : " + _folder_n_822446)
    print("  Mode   : " + _mode_n_822446)
    print("  Files  : " + str(len(_all_files_n_822446)))
    print("-" * 55)

    if _mode_n_822446 == "content":
        # MD5 hash each file and group by hash
        _hash_map_n_822446 = {}
        for _fp_n_822446 in _all_files_n_822446:
            try:
                _md5_n_822446 = hashlib.md5()
                with open(_fp_n_822446, "rb") as _f_n_822446:
                    for _chunk_n_822446 in iter(lambda: _f_n_822446.read(8192), b""):
                        _md5_n_822446.update(_chunk_n_822446)
                _h_n_822446 = _md5_n_822446.hexdigest()
                if _h_n_822446 not in _hash_map_n_822446:
                    _hash_map_n_822446[_h_n_822446] = []
                _hash_map_n_822446[_h_n_822446].append(_fp_n_822446)
            except Exception as _e_n_822446:
                print("  ERROR: " + _fp_n_822446 + " — " + str(_e_n_822446))

        # Find groups with more than one file
        for _h_n_822446, _files_n_822446 in _hash_map_n_822446.items():
            if len(_files_n_822446) > 1:
                duplicate_groups.append(_files_n_822446)

    else:
        # Name-based deduplication
        _name_map_n_822446 = {}
        for _fp_n_822446 in _all_files_n_822446:
            _name_n_822446 = os.path.basename(_fp_n_822446)
            if _name_n_822446 not in _name_map_n_822446:
                _name_map_n_822446[_name_n_822446] = []
            _name_map_n_822446[_name_n_822446].append(_fp_n_822446)

        for _name_n_822446, _files_n_822446 in _name_map_n_822446.items():
            if len(_files_n_822446) > 1:
                duplicate_groups.append(_files_n_822446)

    # Calculate wasted space
    _wasted_bytes_n_822446 = 0
    for _group_n_822446 in duplicate_groups:
        # All but one are wasted
        _sizes_n_822446 = []
        for _fp_n_822446 in _group_n_822446:
            try:
                _sizes_n_822446.append(os.path.getsize(_fp_n_822446))
            except:
                _sizes_n_822446.append(0)
        if _sizes_n_822446:
            _wasted_bytes_n_822446 += sum(_sizes_n_822446) - max(_sizes_n_822446)

    duplicate_count = sum(len(g) - 1 for g in duplicate_groups)
    wasted_mb       = round(_wasted_bytes_n_822446 / (1024 * 1024), 2)
    has_duplicates  = len(duplicate_groups) > 0

    if not has_duplicates:
        print("  ✓ No duplicates found!")
    else:
        print("  ✗ Found " + str(len(duplicate_groups)) + " duplicate groups (" + str(duplicate_count) + " extra files)")
        print("  Wasted space: " + str(wasted_mb) + " MB")
        print("")
        for _i_n_822446, _group_n_822446 in enumerate(duplicate_groups, 1):
            print("  GROUP " + str(_i_n_822446) + ":")
            for _fp_n_822446 in _group_n_822446:
                print("    " + _fp_n_822446)

    print("-" * 55)
    print("SUMMARY: " + str(len(duplicate_groups)) + " groups, " + str(duplicate_count) + " duplicates, " + str(wasted_mb) + " MB wasted")


