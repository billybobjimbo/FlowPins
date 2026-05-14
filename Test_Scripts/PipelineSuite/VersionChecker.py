# Start Execution


# Version Checker
# Finds the highest version of each asset and flags outdated files
import os, re

_folder_n_514195    = "E:/videos/SHOW_NAME/".replace(chr(92), "/").rstrip("/")
_ext_n_514195       = ".png"
_recursive_n_514195 = str("true").lower() == "true"

total_assets   = 0
outdated_count = 0
outdated_files = []
all_current    = False

if not _folder_n_514195 or not os.path.isdir(_folder_n_514195):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_514195))
else:
    # Version pattern — matches _v01, _v001, _V3, _v0001 etc
    _digit_n_514195 = chr(92) + "d"
    _vpat_n_514195  = re.compile(
        r"^(.*?)_[vV](" + _digit_n_514195 + r"+)(.*)" +
        re.escape(_ext_n_514195) + "$",
        re.IGNORECASE
    )

    # Collect all files
    _all_files_n_514195 = []
    if _recursive_n_514195:
        for _r_n_514195, _d_n_514195, _f_n_514195 in os.walk(_folder_n_514195):
            for _fn_n_514195 in _f_n_514195:
                if _fn_n_514195.lower().endswith(_ext_n_514195.lower()):
                    _all_files_n_514195.append((_r_n_514195, _fn_n_514195))
    else:
        for _fn_n_514195 in os.listdir(_folder_n_514195):
            if _fn_n_514195.lower().endswith(_ext_n_514195.lower()):
                _all_files_n_514195.append((_folder_n_514195, _fn_n_514195))

    # Group by base name (strip version number)
    _groups_n_514195 = {}
    _no_version_n_514195 = []

    for _dir_n_514195, _fn_n_514195 in _all_files_n_514195:
        _m_n_514195 = _vpat_n_514195.match(_fn_n_514195)
        if _m_n_514195:
            _base_n_514195    = _m_n_514195.group(1) + _m_n_514195.group(3)
            _ver_n_514195     = int(_m_n_514195.group(2))
            _key_n_514195     = _dir_n_514195.replace(chr(92), "/") + "|" + _base_n_514195
            if _key_n_514195 not in _groups_n_514195:
                _groups_n_514195[_key_n_514195] = []
            _groups_n_514195[_key_n_514195].append((_fn_n_514195, _ver_n_514195))
        else:
            _no_version_n_514195.append(_fn_n_514195)

    print("FlowPins Version Checker")
    print("  Folder    : " + _folder_n_514195)
    print("  Extension : " + _ext_n_514195)
    print("  Files     : " + str(len(_all_files_n_514195)))
    print("-" * 55)

    _versioned_count_n_514195 = 0
    _asset_groups_n_514195    = 0

    for _key_n_514195, _versions_n_514195 in sorted(_groups_n_514195.items()):
        if len(_versions_n_514195) > 1:
            _asset_groups_n_514195 += 1
            _max_ver_n_514195 = max(v for _, v in _versions_n_514195)
            _sorted_n_514195 = sorted(_versions_n_514195, key=lambda x: x[1])

            print("")
            print("  ASSET GROUP: " + _key_n_514195.split("|")[1])
            print("  Latest version: v" + str(_max_ver_n_514195).zfill(2))

            for _fn_n_514195, _ver_n_514195 in _sorted_n_514195:
                _versioned_count_n_514195 += 1
                if _ver_n_514195 < _max_ver_n_514195:
                    print("    ✗ OUTDATED: " + _fn_n_514195 + " (v" + str(_ver_n_514195).zfill(2) + ")")
                    outdated_files.append(_fn_n_514195)
                    outdated_count += 1
                else:
                    print("    ✓ CURRENT : " + _fn_n_514195 + " (v" + str(_ver_n_514195).zfill(2) + ")")
        else:
            _versioned_count_n_514195 += 1

    total_assets = len(_all_files_n_514195)
    all_current  = outdated_count == 0

    print("")
    print("-" * 55)
    if _asset_groups_n_514195 == 0:
        print("  No versioned assets found (no _v## pattern detected)")
        print("  Files scanned: " + str(len(_all_files_n_514195)))
    elif all_current:
        print("  ✓ ALL CURRENT — no outdated versions found")
        print("  " + str(_asset_groups_n_514195) + " asset groups checked")
    else:
        print("  ✗ " + str(outdated_count) + " outdated files found across " + str(_asset_groups_n_514195) + " asset groups")


