# Start Execution


# Orphan File Finder
# Finds files that don't match any known naming pattern
import os, re

_folder_n_766535    = "E:/videos/SHOW_NAME/EP01/Assets".replace(chr(92), "/").rstrip("/")
_patterns_n_766535  = [p.strip() for p in "@@##_@@####-####, @@##_@@####_####, ep##_*_v##".split(",") if p.strip()]
_exts_n_766535      = [e.strip().lower() for e in ".png,.exr,.tga,.tiff,.jpg".split(",") if e.strip()]
_recursive_n_766535 = str("true").lower() == "true"

orphan_count = 0
orphan_files = []
orphan_mb    = 0
has_orphans  = False

def _pattern_to_regex_n_766535(pattern):
    _dot_n_766535   = chr(92) + "."
    _dig_n_766535   = chr(92) + "d"
    _rx_n_766535 = pattern.strip()
    _rx_n_766535 = _rx_n_766535.replace(".", _dot_n_766535)
    _rx_n_766535 = re.sub("#+", lambda m: _dig_n_766535 + "{" + str(len(m.group())) + "}", _rx_n_766535)
    _rx_n_766535 = re.sub("@+", lambda m: "[a-zA-Z]{" + str(len(m.group())) + "}", _rx_n_766535)
    _rx_n_766535 = _rx_n_766535.replace("*", ".*")
    return "^" + _rx_n_766535 + "$"

if not _folder_n_766535 or not os.path.isdir(_folder_n_766535):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_766535))
else:
    # Compile patterns
    _compiled_n_766535 = []
    for _pat_n_766535 in _patterns_n_766535:
        try:
            _compiled_n_766535.append(re.compile(_pattern_to_regex_n_766535(_pat_n_766535), re.IGNORECASE))
        except:
            print("  Warning: could not compile pattern — " + _pat_n_766535)

    # Collect files
    _all_files_n_766535 = []
    if _recursive_n_766535:
        for _r_n_766535, _d_n_766535, _f_n_766535 in os.walk(_folder_n_766535):
            for _fn_n_766535 in _f_n_766535:
                if not _exts_n_766535 or any(_fn_n_766535.lower().endswith(e) for e in _exts_n_766535):
                    _all_files_n_766535.append((_r_n_766535, _fn_n_766535))
    else:
        for _fn_n_766535 in os.listdir(_folder_n_766535):
            if os.path.isfile(os.path.join(_folder_n_766535, _fn_n_766535)):
                if not _exts_n_766535 or any(_fn_n_766535.lower().endswith(e) for e in _exts_n_766535):
                    _all_files_n_766535.append((_folder_n_766535, _fn_n_766535))

    print("FlowPins Orphan File Finder")
    print("  Folder   : " + _folder_n_766535)
    print("  Files    : " + str(len(_all_files_n_766535)))
    print("  Patterns : " + str(len(_compiled_n_766535)))
    print("-" * 55)

    _orphan_bytes_n_766535 = 0

    for _dir_n_766535, _fn_n_766535 in sorted(_all_files_n_766535):
        _stem_n_766535 = os.path.splitext(_fn_n_766535)[0]
        _matched_n_766535 = any(p.match(_stem_n_766535) for p in _compiled_n_766535)

        if not _matched_n_766535:
            _fp_n_766535 = os.path.join(_dir_n_766535, _fn_n_766535)
            try:
                _sz_n_766535 = os.path.getsize(_fp_n_766535)
            except:
                _sz_n_766535 = 0
            _orphan_bytes_n_766535 += _sz_n_766535
            _mb_n_766535 = round(_sz_n_766535 / (1024*1024), 2)
            _rel_n_766535 = os.path.relpath(_fp_n_766535, _folder_n_766535).replace(chr(92), "/")
            orphan_files.append(_rel_n_766535)
            print("  ✗ ORPHAN: " + _rel_n_766535 + " (" + str(_mb_n_766535) + " MB)")

    orphan_count = len(orphan_files)
    orphan_mb    = round(_orphan_bytes_n_766535 / (1024*1024), 2)
    has_orphans  = orphan_count > 0

    print("-" * 55)
    if not has_orphans:
        print("  ✓ No orphan files found — all files match known patterns")
    else:
        print("  ✗ " + str(orphan_count) + " orphan files found (" + str(orphan_mb) + " MB)")


