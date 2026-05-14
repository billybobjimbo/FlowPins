# Start Execution


# Colourspace Report
# Scans all images in a project and reports the colourspace of every file
import os, io
from PIL import Image, ImageCms
from datetime import datetime

_folder_n_140594    = "E:/videos/SHOW_NAME".replace(chr(92), "/").rstrip("/")
_exts_n_140594      = [e.strip().lower() for e in ".png,.tga,.tiff,.exr,.jpg".split(",") if e.strip()]
_recursive_n_140594 = str("true").lower() == "true"
_save_n_140594      = str("true").lower() == "true"

total_files    = 0
unique_spaces  = 0
untagged_count = 0
summary        = ""

def _detect_cs_n_140594(fp):
    _ext_n_140594 = os.path.splitext(fp)[1].lower()
    try:
        with Image.open(fp) as _img_n_140594:
            _info_n_140594 = _img_n_140594.info
            if "icc_profile" in _info_n_140594:
                try:
                    _desc_n_140594 = ImageCms.getProfileDescription(
                        ImageCms.ImageCmsProfile(
                            io.BytesIO(_info_n_140594["icc_profile"])
                        )
                    ).strip().lower()
                    if "srgb"   in _desc_n_140594: return "sRGB"
                    if "709"    in _desc_n_140594: return "Rec.709"
                    if "2020"   in _desc_n_140594: return "Rec.2020"
                    if "p3"     in _desc_n_140594: return "DCI-P3"
                    if "aces"   in _desc_n_140594: return "ACES"
                    if "linear" in _desc_n_140594: return "Linear"
                    return "ICC: " + _desc_n_140594[:25]
                except:
                    return "ICC Embedded"
            elif "srgb" in _info_n_140594:
                return "sRGB"
            elif "gamma" in _info_n_140594:
                _g_n_140594 = _info_n_140594["gamma"]
                if abs(_g_n_140594 - 1.0) < 0.01:    return "Linear"
                if abs(_g_n_140594 - 0.4545) < 0.01: return "sRGB (gamma)"
                return "Gamma " + str(round(_g_n_140594, 3))
            return "Untagged"
    except Exception as _e_n_140594:
        return "ERROR: " + str(_e_n_140594)[:40]

if not _folder_n_140594 or not os.path.isdir(_folder_n_140594):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_140594))
else:
    _ts_n_140594      = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _cs_map_n_140594  = {}   # colourspace -> list of files
    _all_results_n_140594 = []

    # Collect files
    _files_n_140594 = []
    if _recursive_n_140594:
        for _r_n_140594, _d_n_140594, _f_n_140594 in os.walk(_folder_n_140594):
            for _fn_n_140594 in _f_n_140594:
                if any(_fn_n_140594.lower().endswith(e) for e in _exts_n_140594):
                    _files_n_140594.append(os.path.join(_r_n_140594, _fn_n_140594))
    else:
        for _fn_n_140594 in os.listdir(_folder_n_140594):
            if any(_fn_n_140594.lower().endswith(e) for e in _exts_n_140594):
                _files_n_140594.append(os.path.join(_folder_n_140594, _fn_n_140594))

    total_files = len(_files_n_140594)

    print("FlowPins Colourspace Report")
    print("  Folder : " + _folder_n_140594)
    print("  Files  : " + str(total_files))
    print("-" * 60)

    for _fp_n_140594 in sorted(_files_n_140594):
        _fn_n_140594 = os.path.basename(_fp_n_140594)
        _cs_n_140594 = _detect_cs_n_140594(_fp_n_140594)
        _rel_n_140594 = os.path.relpath(_fp_n_140594, _folder_n_140594).replace(chr(92), "/")

        if _cs_n_140594 not in _cs_map_n_140594:
            _cs_map_n_140594[_cs_n_140594] = []
        _cs_map_n_140594[_cs_n_140594].append(_rel_n_140594)
        _all_results_n_140594.append((_rel_n_140594, _cs_n_140594))
        print("  " + _cs_n_140594.ljust(20) + "  " + _rel_n_140594)

    unique_spaces  = len(_cs_map_n_140594)
    untagged_count = len(_cs_map_n_140594.get("Untagged", []))

    print("")
    print("=" * 60)
    print("COLOURSPACE SUMMARY")
    print("-" * 60)
    for _cs_n_140594 in sorted(_cs_map_n_140594.keys()):
        _cnt_n_140594 = len(_cs_map_n_140594[_cs_n_140594])
        _bar_n_140594 = chr(9608) * min(_cnt_n_140594, 20)
        print("  {:<22} {:>4} files  {}".format(_cs_n_140594, _cnt_n_140594, _bar_n_140594))
    print("=" * 60)
    print("  Total    : " + str(total_files) + " files")
    print("  CS Types : " + str(unique_spaces))
    if untagged_count > 0:
        print("  Untagged : " + str(untagged_count) + " files have no colourspace metadata")

    summary = str(total_files) + " files, " + str(unique_spaces) + " colourspace(s)"

    # Save report
    if _save_n_140594:
        _rname_n_140594 = "colourspace_report_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".txt"
        _rpath_n_140594 = os.path.join(_folder_n_140594, _rname_n_140594)
        try:
            _lines_n_140594 = [
                "FLOWPINS COLOURSPACE REPORT",
                "Generated : " + _ts_n_140594,
                "Folder    : " + _folder_n_140594,
                "Files     : " + str(total_files),
                "=" * 60,
                "",
                "FILE LIST:",
            ]
            for _rel_n_140594, _cs_n_140594 in _all_results_n_140594:
                _lines_n_140594.append("  " + _cs_n_140594.ljust(22) + "  " + _rel_n_140594)
            _lines_n_140594.append("")
            _lines_n_140594.append("SUMMARY BY COLOURSPACE:")
            for _cs_n_140594 in sorted(_cs_map_n_140594.keys()):
                _lines_n_140594.append("  " + _cs_n_140594 + " — " + str(len(_cs_map_n_140594[_cs_n_140594])) + " files")
            _lines_n_140594.append("=" * 60)
            with open(_rpath_n_140594, "w", encoding="utf-8") as _rf_n_140594:
                _rf_n_140594.write(chr(10).join(_lines_n_140594))
            print("  Report: " + _rpath_n_140594)
        except Exception as _re_n_140594:
            print("  Report save failed: " + str(_re_n_140594))


