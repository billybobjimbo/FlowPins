# Start Execution


# Load config or show dialog — the smart config node
# If config exists: load silently and use saved values
# If config missing or force_dialog=True: show UI, optionally save
import json, os, tkinter as tk
from tkinter import ttk, filedialog, messagebox

_cfg_path_n_791034   = "studio_config.json"
_title_n_791034      = "FlowPins — Tool Settings"
_force_n_791034      = str("false").lower() == "true"
_show_folder_n_791034   = str("true").lower() == "true"
_show_ext_n_791034      = str("true").lower() == "true"
_show_frames_n_791034   = str("true").lower() == "true"
_show_naming_n_791034   = str("true").lower() == "true"
_show_cs_n_791034       = str("true").lower() == "true"
_show_pad_n_791034      = str("true").lower() == "true"

# Default values
folder_path    = ""
extension      = ".png"
start_frame    = 1001
end_frame      = 1100
naming_pattern = "@@##_@@####-####"
colourspace    = "sRGB"
frame_padding  = 4
prefix         = ""
cancelled      = False

# Try loading existing config
_cfg_n_791034 = {}
_has_config_n_791034 = False
if os.path.isfile(_cfg_path_n_791034):
    try:
        with open(_cfg_path_n_791034, 'r') as _f_n_791034:
            _cfg_n_791034 = json.load(_f_n_791034)
        _has_config_n_791034 = True
    except:
        pass

# Use config values if loaded and not forcing dialog
# Also force dialog if folder_path is empty even with a valid config
_cfg_folder_n_791034 = _cfg_n_791034.get('folder_path', '') if _has_config_n_791034 else ''
if _has_config_n_791034 and not _force_n_791034 and _cfg_folder_n_791034:
    folder_path    = _cfg_n_791034.get('folder_path',    folder_path)
    extension      = _cfg_n_791034.get('extension',      extension)
    start_frame    = int(_cfg_n_791034.get('start_frame',    start_frame))
    end_frame      = int(_cfg_n_791034.get('end_frame',      end_frame))
    naming_pattern = _cfg_n_791034.get('naming_pattern', naming_pattern)
    colourspace    = _cfg_n_791034.get('colourspace',    colourspace)
    frame_padding  = int(_cfg_n_791034.get('frame_padding',  frame_padding))
    prefix         = _cfg_n_791034.get('prefix',         prefix)
    print("FlowPins: Config loaded from " + _cfg_path_n_791034)
else:
    # Show the configuration dialog
    _root_n_791034 = tk.Tk()
    _root_n_791034.withdraw()

    _dlg_n_791034 = tk.Toplevel(_root_n_791034)
    _dlg_n_791034.title(_title_n_791034)
    _dlg_n_791034.resizable(False, False)
    _dlg_n_791034.configure(bg="#1a1a2e")
    _dlg_n_791034.grab_set()

    _style_n_791034 = ttk.Style()
    _style_n_791034.theme_use('clam')
    _style_n_791034.configure('FP.TLabel',
        background="#1a1a2e", foreground="#00d8ff",
        font=('Arial', 10, 'bold'))
    _style_n_791034.configure('FPV.TLabel',
        background="#1a1a2e", foreground="#cccccc",
        font=('Arial', 10))
    _style_n_791034.configure('FP.TEntry',
        fieldbackground="#0d1117", foreground="#ffffff",
        insertcolor="#00d8ff", font=('Arial', 10))
    _style_n_791034.configure('FP.TButton',
        background="#1a3a5c", foreground="#ffffff",
        font=('Arial', 10, 'bold'), padding=8)
    _style_n_791034.configure('FPRun.TButton',
        background="#00d8ff", foreground="#000000",
        font=('Arial', 10, 'bold'), padding=8)

    # Header
    _hdr_n_791034 = tk.Frame(_dlg_n_791034, bg="#0d1f33", pady=12)
    _hdr_n_791034.pack(fill='x')
    tk.Label(_hdr_n_791034, text="⬡  " + _title_n_791034,
        bg="#0d1f33", fg="#00d8ff",
        font=('Arial', 13, 'bold')).pack(padx=20)

    # Form frame
    _form_n_791034 = tk.Frame(_dlg_n_791034, bg="#1a1a2e", padx=20, pady=12)
    _form_n_791034.pack(fill='both', expand=True)

    _row_n_791034 = 0
    _vars_n_791034 = {}

    def _add_field_n_791034(label, key, default, browse=False):
        global _row_n_791034
        tk.Label(_form_n_791034, text=label, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_791034, column=0, sticky='w', pady=(8,2))
        _v_n_791034 = tk.StringVar(value=str(default))
        _vars_n_791034[key] = _v_n_791034
        _e_n_791034 = tk.Entry(_form_n_791034, textvariable=_v_n_791034,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=42, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344")
        _e_n_791034.grid(row=_row_n_791034+1, column=0,
            columnspan=2 if not browse else 1, sticky='ew', pady=(0,4))
        if browse:
            def _browse_n_791034(v=_v_n_791034):
                _d_n_791034 = filedialog.askdirectory()
                if _d_n_791034: v.set(_d_n_791034)
            tk.Button(_form_n_791034, text="📁", command=_browse_n_791034,
                bg="#1a3a5c", fg="#00d8ff", font=('Arial',10),
                relief='flat', padx=6).grid(row=_row_n_791034+1, column=1,
                sticky='w', padx=(4,0))
        _row_n_791034 += 2

    def _add_row2_n_791034(l1, k1, d1, l2, k2, d2):
        global _row_n_791034
        tk.Label(_form_n_791034, text=l1, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_791034, column=0, sticky='w', pady=(8,2))
        tk.Label(_form_n_791034, text=l2, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_791034, column=1, sticky='w', pady=(8,2), padx=(8,0))
        _v1_n_791034 = tk.StringVar(value=str(d1))
        _v2_n_791034 = tk.StringVar(value=str(d2))
        _vars_n_791034[k1] = _v1_n_791034
        _vars_n_791034[k2] = _v2_n_791034
        tk.Entry(_form_n_791034, textvariable=_v1_n_791034,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_791034+1, column=0, sticky='ew', pady=(0,4))
        tk.Entry(_form_n_791034, textvariable=_v2_n_791034,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_791034+1, column=1, sticky='ew',
            pady=(0,4), padx=(8,0))
        _row_n_791034 += 2

    if _show_folder_n_791034:
        _add_field_n_791034("Render / Source Folder", "folder_path",
            _cfg_n_791034.get('folder_path', ''), browse=True)
    if _show_ext_n_791034:
        _add_field_n_791034("File Extension", "extension",
            _cfg_n_791034.get('extension', '.png'))
    if _show_frames_n_791034:
        _add_row2_n_791034("Start Frame", "start_frame",
            _cfg_n_791034.get('start_frame', 1001),
            "End Frame", "end_frame",
            _cfg_n_791034.get('end_frame', 1100))
    if _show_pad_n_791034:
        _add_field_n_791034("Frame Padding (digits)", "frame_padding",
            _cfg_n_791034.get('frame_padding', 4))
    _add_field_n_791034("Filename Prefix (e.g. shot_010_comp-)", "prefix",
        _cfg_n_791034.get('prefix', ''))
    if _show_naming_n_791034:
        _add_field_n_791034("Naming Pattern  (# = digit, @ = letter)",
            "naming_pattern",
            _cfg_n_791034.get('naming_pattern', 'shot_###_v##'))
    if _show_cs_n_791034:
        _add_field_n_791034("Expected Colourspace", "colourspace",
            _cfg_n_791034.get('colourspace', 'sRGB'))

    # Save config checkbox
    _save_var_n_791034 = tk.BooleanVar(value=True)
    tk.Checkbutton(_form_n_791034,
        text="  Save these settings for next time",
        variable=_save_var_n_791034,
        bg="#1a1a2e", fg="#888888",
        selectcolor="#0d1117", activebackground="#1a1a2e",
        font=('Arial', 9)).grid(
        row=_row_n_791034, column=0, columnspan=2,
        sticky='w', pady=(12,4))
    _row_n_791034 += 1

    # Buttons
    _btn_frame_n_791034 = tk.Frame(_dlg_n_791034, bg="#0d1f33", pady=12)
    _btn_frame_n_791034.pack(fill='x')

    _result_n_791034 = {'ok': False}

    def _on_run_n_791034():
        _result_n_791034['ok'] = True
        _dlg_n_791034.destroy()

    def _on_cancel_n_791034():
        _result_n_791034['ok'] = False
        _dlg_n_791034.destroy()

    tk.Button(_btn_frame_n_791034, text="Cancel",
        command=_on_cancel_n_791034,
        bg="#333344", fg="#888888",
        font=('Arial', 10), relief='flat',
        padx=20, pady=6).pack(side='left', padx=20)

    tk.Button(_btn_frame_n_791034, text="▶  Run Tool",
        command=_on_run_n_791034,
        bg="#00d8ff", fg="#000000",
        font=('Arial', 11, 'bold'), relief='flat',
        padx=20, pady=6).pack(side='right', padx=20)

    _dlg_n_791034.update_idletasks()
    _w_n_791034 = _dlg_n_791034.winfo_reqwidth()
    _h_n_791034 = _dlg_n_791034.winfo_reqheight()
    _x_n_791034 = (_dlg_n_791034.winfo_screenwidth() - _w_n_791034) // 2
    _y_n_791034 = (_dlg_n_791034.winfo_screenheight() - _h_n_791034) // 2
    _dlg_n_791034.geometry(f"{_w_n_791034}x{_h_n_791034}+{_x_n_791034}+{_y_n_791034}")

    _root_n_791034.wait_window(_dlg_n_791034)
    _root_n_791034.destroy()

    if not _result_n_791034['ok']:
        cancelled = True
        print("FlowPins: Config dialog cancelled.")
    else:
        # Read values from form
        if 'folder_path'    in _vars_n_791034: folder_path    = _vars_n_791034['folder_path'].get()
        if 'extension'      in _vars_n_791034: extension      = _vars_n_791034['extension'].get()
        if 'start_frame'    in _vars_n_791034: start_frame    = int(_vars_n_791034['start_frame'].get() or 1001)
        if 'end_frame'      in _vars_n_791034: end_frame      = int(_vars_n_791034['end_frame'].get() or 1100)
        if 'frame_padding'  in _vars_n_791034: frame_padding  = int(_vars_n_791034['frame_padding'].get() or 4)
        if 'naming_pattern' in _vars_n_791034: naming_pattern = _vars_n_791034['naming_pattern'].get()
        if 'colourspace'    in _vars_n_791034: colourspace    = _vars_n_791034['colourspace'].get()
        if 'prefix'         in _vars_n_791034: prefix         = _vars_n_791034['prefix'].get()

        # Save config if requested
        if _save_var_n_791034.get():
            _save_data_n_791034 = {
                'folder_path':    folder_path,
                'extension':      extension,
                'start_frame':    start_frame,
                'end_frame':      end_frame,
                'frame_padding':  frame_padding,
                'naming_pattern': naming_pattern,
                'colourspace':    colourspace,
                'prefix':         prefix
            }
            try:
                with open(_cfg_path_n_791034, 'w') as _sf_n_791034:
                    json.dump(_save_data_n_791034, _sf_n_791034, indent=2)
                print("FlowPins: Settings saved to " + _cfg_path_n_791034)
            except Exception as _se_n_791034:
                print("FlowPins: Could not save config — " + str(_se_n_791034))



from PIL import Image, ImageCms
import os as _os_n_707612, io as _io_n_707612
# Guard — stop if cancelled or no folder
if cancelled or not folder_path:
    import sys
    if cancelled: print("FlowPins: Cancelled — skipping colourspace check.")
    else: print("FlowPins ERROR: No folder path provided.")
    sys.exit(0)
_folder_n_707612   = folder_path
_expected_n_707612 = colourspace if colourspace else "sRGB"
_ext_n_707612      = extension if extension else "extension"

# Supported formats and their detection methods
_SUPPORTED_n_707612 = [".png", ".tif", ".tiff", ".tga", ".jpg", ".jpeg", ".exr", ".dpx"]

def _get_cs_n_707612(fp):
    _fext_n_707612 = _os_n_707612.path.splitext(fp)[1].lower()
    try:
        # EXR — use metadata attributes
        if _fext_n_707612 == ".exr":
            try:
                import OpenEXR, Imath
                _exr_n_707612 = OpenEXR.InputFile(fp)
                _hdr_n_707612 = _exr_n_707612.header()
                _chr_n_707612 = str(_hdr_n_707612.get("chromaticities", "")).lower()
                if "aces" in _chr_n_707612: return "ACES"
                if "709" in _chr_n_707612: return "Rec.709"
                if "2020" in _chr_n_707612: return "Rec.2020"
                return "Linear EXR"
            except ImportError:
                # OpenEXR not installed — use PIL fallback
                pass
        # PNG, TIFF, TGA, JPG — use ICC profile
        with Image.open(fp) as _img_n_707612:
            _info_n_707612 = _img_n_707612.info
            # Check ICC profile
            if "icc_profile" in _info_n_707612:
                try:
                    _desc_n_707612 = ImageCms.getProfileDescription(
                        ImageCms.ImageCmsProfile(
                            _io_n_707612.BytesIO(_info_n_707612["icc_profile"])
                        )
                    ).strip().lower()
                    if "srgb" in _desc_n_707612 or "sRGB" in _desc_n_707612:     return "sRGB"
                    if "rec. 709" in _desc_n_707612 or "709" in _desc_n_707612:  return "Rec.709"
                    if "rec. 2020" in _desc_n_707612 or "2020" in _desc_n_707612:return "Rec.2020"
                    if "p3" in _desc_n_707612:                                     return "DCI-P3"
                    if "aces" in _desc_n_707612:                                   return "ACES"
                    if "linear" in _desc_n_707612:                                 return "Linear"
                    return "ICC: " + _desc_n_707612[:30]
                except:
                    return "ICC Embedded (unreadable)"
            # PNG sRGB chunk
            if "srgb" in _info_n_707612:
                return "sRGB"
            # Gamma tag
            if "gamma" in _info_n_707612:
                _g_n_707612 = _info_n_707612["gamma"]
                if abs(_g_n_707612 - 1.0) < 0.01:  return "Linear"
                if abs(_g_n_707612 - 0.4545) < 0.01: return "sRGB (gamma)"
                return "Gamma " + str(round(_g_n_707612, 3))
            # No colourspace metadata found
            return "Untagged"
    except Exception as _e_n_707612:
        return "ERROR: " + str(_e_n_707612)

pass_list = []
fail_list = []
print("")
print("FlowPins Colourspace Validator — " + _folder_n_707612)
print("Expected : " + _expected_n_707612)
print("Extension: " + _ext_n_707612)
print("-" * 55)

if not _os_n_707612.path.isdir(_folder_n_707612):
    print("ERROR: Folder not found — " + _folder_n_707612)
else:
    for _r_n_707612, _d_n_707612, _f_n_707612 in _os_n_707612.walk(_folder_n_707612):
        for _fn_n_707612 in sorted(_f_n_707612):
            _fext2_n_707612 = _os_n_707612.path.splitext(_fn_n_707612)[1].lower()
            # Match requested extension OR scan all supported formats if extension is blank
            _match_n_707612 = (
                _fn_n_707612.lower().endswith(_ext_n_707612.lower()) if _ext_n_707612
                else _fext2_n_707612 in _SUPPORTED_n_707612
            )
            if _match_n_707612:
                _fp_n_707612 = _os_n_707612.path.join(_r_n_707612, _fn_n_707612)
                _cs_n_707612 = _get_cs_n_707612(_fp_n_707612)
                if _cs_n_707612.lower() == _expected_n_707612.lower():
                    pass_list.append(_fp_n_707612)
                    print("  PASS: " + _fn_n_707612 + " [" + _cs_n_707612 + "]")
                else:
                    fail_list.append(_fp_n_707612 + " [" + _cs_n_707612 + "]")
                    print("  FAIL: " + _fn_n_707612 + " — got [" + _cs_n_707612 + "]")

pass_count = len(pass_list)
fail_count = len(fail_list)
print("")
print("Result: " + str(pass_count) + " passed, " + str(fail_count) + " failed.")


import os as _os_n_838171
from datetime import datetime as _dt_n_838171
_pl_n_838171   = pass_list if pass_list else []
_fl_n_838171   = fail_list if fail_list else []
_fld_n_838171  = folder_path
_save_n_838171 = "true" == "true"
_ts_n_838171   = _dt_n_838171.now().strftime("%Y-%m-%d %H:%M:%S")
_lines_n_838171 = [
    "=" * 60,
    "FLOWPINS " + "COLOURSPACE VALIDATION REPORT".upper(),
    f"Generated : {_ts_n_838171}",
    f"Folder    : {_fld_n_838171}",
    f"PASSED    : {len(_pl_n_838171)}",
    f"FAILED    : {len(_fl_n_838171)}",
    "=" * 60
]
if _fl_n_838171:
    _lines_n_838171.append("\nFAILED FILES:")
    for _f_n_838171 in _fl_n_838171: _lines_n_838171.append(f"  FAIL: {_f_n_838171}")
if _pl_n_838171:
    _lines_n_838171.append("\nPASSED FILES:")
    for _p_n_838171 in _pl_n_838171: _lines_n_838171.append(f"  PASS: {_os_n_838171.path.basename(_p_n_838171)}")
_lines_n_838171.append("=" * 60)
_report_n_838171 = "\n".join(_lines_n_838171)
print(_report_n_838171)
if _save_n_838171 and _os_n_838171.path.isdir(_fld_n_838171):
    _rname_n_838171 = f"validation_report_{_dt_n_838171.now().strftime('%Y%m%d_%H%M%S')}.txt"
    _rpath_n_838171 = _os_n_838171.path.join(_fld_n_838171, _rname_n_838171)
    with open(_rpath_n_838171, "w", encoding="utf-8") as _rf_n_838171: _rf_n_838171.write(_report_n_838171)
    print(f"Report saved: {_rpath_n_838171}")

