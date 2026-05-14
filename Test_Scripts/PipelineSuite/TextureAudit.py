# Start Execution


# Texture Audit
# Scans texture files and reports resolution, colourspace, flags non-standard
import os, io
from PIL import Image, ImageCms

_folder_n_938495    = "E:/videos/SHOW_NAME/EP01/Assets".replace(chr(92), "/").rstrip("/")
_exts_n_938495      = [e.strip().lower() for e in ".png,.tga,.tiff,.exr,.jpg".split(",") if e.strip()]
_expected_cs_n_938495 = "sRGB"
_max_w_n_938495     = int(4096)
_max_h_n_938495     = int(4096)
_recursive_n_938495 = str("true").lower() == "true"
_pow2_n_938495      = str("false").lower() == "true"

total_textures = 0
issues_count   = 0
issues_list    = []
all_valid      = False

def _is_pow2_n_938495(n):
    return n > 0 and (n & (n - 1)) == 0

def _get_cs_n_938495(info):
    if "icc_profile" in info:
        try:
            _desc = ImageCms.getProfileDescription(
                ImageCms.ImageCmsProfile(io.BytesIO(info["icc_profile"]))
            ).strip().lower()
            if "srgb" in _desc:    return "sRGB"
            if "709" in _desc:     return "Rec.709"
            if "linear" in _desc:  return "Linear"
            if "aces" in _desc:    return "ACES"
            if "p3" in _desc:      return "DCI-P3"
            return "ICC: " + _desc[:20]
        except:
            return "ICC Embedded"
    elif "srgb" in info:
        return "sRGB"
    return "Untagged"

if not _folder_n_938495 or not os.path.isdir(_folder_n_938495):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_938495))
else:
    # Collect texture files
    _textures_n_938495 = []
    if _recursive_n_938495:
        for _r_n_938495, _d_n_938495, _f_n_938495 in os.walk(_folder_n_938495):
            for _fn_n_938495 in _f_n_938495:
                if any(_fn_n_938495.lower().endswith(e) for e in _exts_n_938495):
                    _textures_n_938495.append(os.path.join(_r_n_938495, _fn_n_938495))
    else:
        for _fn_n_938495 in os.listdir(_folder_n_938495):
            if any(_fn_n_938495.lower().endswith(e) for e in _exts_n_938495):
                _textures_n_938495.append(os.path.join(_folder_n_938495, _fn_n_938495))

    total_textures = len(_textures_n_938495)

    print("FlowPins Texture Audit")
    print("  Folder     : " + _folder_n_938495)
    print("  Textures   : " + str(total_textures))
    print("  Expected CS: " + _expected_cs_n_938495)
    print("  Max Size   : " + str(_max_w_n_938495) + "x" + str(_max_h_n_938495))
    print("-" * 60)

    for _fp_n_938495 in sorted(_textures_n_938495):
        _fn_n_938495 = os.path.basename(_fp_n_938495)
        _file_issues_n_938495 = []
        try:
            with Image.open(_fp_n_938495) as _img_n_938495:
                _w_n_938495    = _img_n_938495.width
                _h_n_938495    = _img_n_938495.height
                _mode_n_938495 = _img_n_938495.mode
                _info_n_938495 = _img_n_938495.info
                _cs_n_938495   = _get_cs_n_938495(_info_n_938495)

                # Check colourspace
                if _expected_cs_n_938495 and _cs_n_938495.lower() != _expected_cs_n_938495.lower():
                    _file_issues_n_938495.append("CS: " + _cs_n_938495 + " (expected " + _expected_cs_n_938495 + ")")

                # Check dimensions
                if _w_n_938495 > _max_w_n_938495 or _h_n_938495 > _max_h_n_938495:
                    _file_issues_n_938495.append("Size: " + str(_w_n_938495) + "x" + str(_h_n_938495) + " exceeds max")

                # Check power of two
                if _pow2_n_938495:
                    if not _is_pow2_n_938495(_w_n_938495) or not _is_pow2_n_938495(_h_n_938495):
                        _file_issues_n_938495.append("Not power of two: " + str(_w_n_938495) + "x" + str(_h_n_938495))

                _size_kb_n_938495 = round(os.path.getsize(_fp_n_938495) / 1024, 1)

                if _file_issues_n_938495:
                    print("  ✗ " + _fn_n_938495)
                    print("    " + str(_w_n_938495) + "x" + str(_h_n_938495) + " | " + _mode_n_938495 + " | " + _cs_n_938495 + " | " + str(_size_kb_n_938495) + " KB")
                    for _iss_n_938495 in _file_issues_n_938495:
                        print("    ⚠ " + _iss_n_938495)
                    issues_list.append(_fn_n_938495 + " — " + ", ".join(_file_issues_n_938495))
                    issues_count += 1
                else:
                    print("  ✓ " + _fn_n_938495 + " [" + str(_w_n_938495) + "x" + str(_h_n_938495) + " | " + _cs_n_938495 + " | " + str(_size_kb_n_938495) + " KB]")

        except Exception as _e_n_938495:
            print("  ✗ " + _fn_n_938495 + " — ERROR: " + str(_e_n_938495))
            issues_list.append(_fn_n_938495 + " — ERROR: " + str(_e_n_938495))
            issues_count += 1

    all_valid = issues_count == 0

    print("-" * 60)
    if all_valid:
        print("  ✓ ALL VALID — " + str(total_textures) + " textures passed")
    else:
        print("  ✗ " + str(issues_count) + "/" + str(total_textures) + " textures have issues")


