# Start Execution


# Batch File Renamer
# Renames files in bulk — add prefix/suffix, find/replace, or resequence
import os

_folder_n_980553   = str("C:/images").replace(chr(92), "/")
_ext_n_980553      = ".png"
_mode_n_980553     = "add_prefix"
_prefix_n_980553   = "delivery_"
_suffix_n_980553   = ""
_find_n_980553     = ""
_replace_n_980553  = ""
_dry_n_980553      = str("false").lower() == "true"

renamed_count = 0
skipped_count = 0
success       = False

if not _folder_n_980553 or not os.path.isdir(_folder_n_980553):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_980553))
else:
    _files_n_980553 = sorted([
        f for f in os.listdir(_folder_n_980553)
        if f.lower().endswith(_ext_n_980553.lower())
    ])

    if not _files_n_980553:
        print("FlowPins: No " + _ext_n_980553 + " files found in " + _folder_n_980553)
    else:
        print("FlowPins Batch File Renamer")
        print("  Folder : " + _folder_n_980553)
        print("  Mode   : " + _mode_n_980553)
        print("  Files  : " + str(len(_files_n_980553)))
        if _dry_n_980553:
            print("  DRY RUN — no files will be renamed")
        print("-" * 55)

        _rename_pairs_n_980553 = []

        for _fn_n_980553 in _files_n_980553:
            _stem_n_980553 = os.path.splitext(_fn_n_980553)[0]
            _new_stem_n_980553 = _stem_n_980553

            if _mode_n_980553 == "add_prefix" and _prefix_n_980553:
                _new_stem_n_980553 = _prefix_n_980553 + _stem_n_980553
            elif _mode_n_980553 == "add_suffix" and _suffix_n_980553:
                _new_stem_n_980553 = _stem_n_980553 + _suffix_n_980553
            elif _mode_n_980553 == "find_replace" and _find_n_980553:
                _new_stem_n_980553 = _stem_n_980553.replace(_find_n_980553, _replace_n_980553)

            _new_name_n_980553 = _new_stem_n_980553 + _ext_n_980553

            if _new_name_n_980553 != _fn_n_980553:
                _rename_pairs_n_980553.append((_fn_n_980553, _new_name_n_980553))
            else:
                skipped_count += 1

        # Resequence mode — renumber all files from 0001
        if _mode_n_980553 == "resequence":
            _rename_pairs_n_980553 = []
            skipped_count = 0
            for _i_n_980553, _fn_n_980553 in enumerate(_files_n_980553, start=1):
                _new_name_n_980553 = str(_i_n_980553).zfill(4) + _ext_n_980553
                if _new_name_n_980553 != _fn_n_980553:
                    _rename_pairs_n_980553.append((_fn_n_980553, _new_name_n_980553))
                else:
                    skipped_count += 1

        # Preview or execute
        for _old_n_980553, _new_n_980553 in _rename_pairs_n_980553:
            if _dry_n_980553:
                print("  PREVIEW: " + _old_n_980553 + " → " + _new_n_980553)
            else:
                _src_path_n_980553 = os.path.join(_folder_n_980553, _old_n_980553)
                _dst_path_n_980553 = os.path.join(_folder_n_980553, _new_n_980553)
                try:
                    os.rename(_src_path_n_980553, _dst_path_n_980553)
                    print("  RENAMED: " + _old_n_980553 + " → " + _new_n_980553)
                    renamed_count += 1
                except Exception as _e_n_980553:
                    print("  ERROR: " + _old_n_980553 + " — " + str(_e_n_980553))
                    skipped_count += 1

        if _dry_n_980553:
            renamed_count = len(_rename_pairs_n_980553)

        print("-" * 55)
        if _dry_n_980553:
            print("DRY RUN COMPLETE — " + str(renamed_count) + " files would be renamed")
            print("Set Dry Run to false to apply changes")
        else:
            print("DONE — " + str(renamed_count) + " files renamed, " + str(skipped_count) + " skipped")

        success = True


