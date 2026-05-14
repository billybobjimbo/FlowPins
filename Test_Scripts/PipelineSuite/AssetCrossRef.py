# Start Execution


# Asset Cross-Reference
# Checks which expected assets exist on disk and which are missing
import os

_folder_n_614047    = "E:/videos/SHOW_NAME".replace(chr(92), "/").rstrip("/")
_asset_list_n_614047 = "ep01_BG_0220_v02.png, ep01_Gary_Body_v03.png, ep01_Gary_Sword_v02.png, ep01_missing_asset.png"
_recursive_n_614047 = str("true").lower() == "true"

found_count   = 0
missing_count = 0
missing_files = []
all_present   = False

if not _folder_n_614047 or not os.path.isdir(_folder_n_614047):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_614047))
elif not _asset_list_n_614047.strip():
    print("FlowPins ERROR: No asset list provided — add comma-separated filenames in Inspector")
else:
    # Parse expected assets
    _expected_n_614047 = [a.strip() for a in _asset_list_n_614047.split(",") if a.strip()]

    # Collect all files on disk
    _on_disk_n_614047 = set()
    if _recursive_n_614047:
        for _r_n_614047, _d_n_614047, _f_n_614047 in os.walk(_folder_n_614047):
            for _fn_n_614047 in _f_n_614047:
                _on_disk_n_614047.add(_fn_n_614047.lower())
    else:
        for _fn_n_614047 in os.listdir(_folder_n_614047):
            if os.path.isfile(os.path.join(_folder_n_614047, _fn_n_614047)):
                _on_disk_n_614047.add(_fn_n_614047.lower())

    print("FlowPins Asset Cross-Reference")
    print("  Folder   : " + _folder_n_614047)
    print("  Expected : " + str(len(_expected_n_614047)) + " assets")
    print("  On Disk  : " + str(len(_on_disk_n_614047)) + " files found")
    print("-" * 55)

    _found_n_614047   = []
    _missing_n_614047 = []

    for _asset_n_614047 in _expected_n_614047:
        if _asset_n_614047.lower() in _on_disk_n_614047:
            _found_n_614047.append(_asset_n_614047)
            print("  ✓ FOUND  : " + _asset_n_614047)
        else:
            _missing_n_614047.append(_asset_n_614047)
            print("  ✗ MISSING: " + _asset_n_614047)

    found_count   = len(_found_n_614047)
    missing_count = len(_missing_n_614047)
    missing_files = _missing_n_614047
    all_present   = missing_count == 0

    print("-" * 55)
    if all_present:
        print("  ✓ ALL PRESENT — " + str(found_count) + "/" + str(len(_expected_n_614047)) + " assets found")
    else:
        print("  ✗ " + str(missing_count) + " assets missing, " + str(found_count) + " found")


