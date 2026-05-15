# Start Execution


# Load config or show dialog — the smart config node
# If config exists: load silently and use saved values
# If config missing or force_dialog=True: show UI, optionally save
import json, os, tkinter as tk
from tkinter import ttk, filedialog, messagebox

_cfg_path_n_481152   = "studio_config.json"
_title_n_481152      = "FlowPins — Tool Settings"
_force_n_481152      = str("false").lower() == "true"
_show_folder_n_481152   = str("true").lower() == "true"
_show_ext_n_481152      = str("true").lower() == "true"
_show_frames_n_481152   = str("true").lower() == "true"
_show_naming_n_481152   = str("true").lower() == "true"
_show_cs_n_481152       = str("true").lower() == "true"
_show_pad_n_481152      = str("true").lower() == "true"

# Default values
folder_path    = ""
extension      = ".png"
start_frame    = 1001
end_frame      = 1100
naming_pattern = "@@##_@@####-####"
colourspace    = "sRGB"
frame_padding  = 4
prefix         = ""
source_folder  = ""
target_folder  = ""
cancelled      = False

# Try loading existing config
_cfg_n_481152 = {}
_has_config_n_481152 = False
if os.path.isfile(_cfg_path_n_481152):
    try:
        with open(_cfg_path_n_481152, 'r') as _f_n_481152:
            _cfg_n_481152 = json.load(_f_n_481152)
        _has_config_n_481152 = True
    except:
        pass

# Use config values if loaded and not forcing dialog
# Also force dialog if folder_path is empty even with a valid config
_cfg_folder_n_481152 = _cfg_n_481152.get('folder_path', '') if _has_config_n_481152 else ''
if _has_config_n_481152 and not _force_n_481152 and _cfg_folder_n_481152:
    folder_path    = _cfg_n_481152.get('folder_path',    folder_path)
    extension      = _cfg_n_481152.get('extension',      extension)
    start_frame    = int(_cfg_n_481152.get('start_frame',    start_frame))
    end_frame      = int(_cfg_n_481152.get('end_frame',      end_frame))
    naming_pattern = _cfg_n_481152.get('naming_pattern', naming_pattern)
    colourspace    = _cfg_n_481152.get('colourspace',    colourspace)
    frame_padding  = int(_cfg_n_481152.get('frame_padding',  frame_padding))
    prefix         = _cfg_n_481152.get('prefix',         prefix)
    source_folder  = _cfg_n_481152.get('source_folder',  source_folder)
    target_folder  = _cfg_n_481152.get('target_folder',  target_folder)
    print("FlowPins: Config loaded from " + _cfg_path_n_481152)
else:
    # Show the configuration dialog
    _root_n_481152 = tk.Tk()
    _root_n_481152.withdraw()

    _dlg_n_481152 = tk.Toplevel(_root_n_481152)
    _dlg_n_481152.title(_title_n_481152)
    _dlg_n_481152.resizable(False, False)
    _dlg_n_481152.configure(bg="#1a1a2e")
    _dlg_n_481152.grab_set()

    _style_n_481152 = ttk.Style()
    _style_n_481152.theme_use('clam')
    _style_n_481152.configure('FP.TLabel',
        background="#1a1a2e", foreground="#00d8ff",
        font=('Arial', 10, 'bold'))
    _style_n_481152.configure('FPV.TLabel',
        background="#1a1a2e", foreground="#cccccc",
        font=('Arial', 10))
    _style_n_481152.configure('FP.TEntry',
        fieldbackground="#0d1117", foreground="#ffffff",
        insertcolor="#00d8ff", font=('Arial', 10))
    _style_n_481152.configure('FP.TButton',
        background="#1a3a5c", foreground="#ffffff",
        font=('Arial', 10, 'bold'), padding=8)
    _style_n_481152.configure('FPRun.TButton',
        background="#00d8ff", foreground="#000000",
        font=('Arial', 10, 'bold'), padding=8)

    # Header
    _hdr_n_481152 = tk.Frame(_dlg_n_481152, bg="#0d1f33", pady=12)
    _hdr_n_481152.pack(fill='x')
    tk.Label(_hdr_n_481152, text="⬡  " + _title_n_481152,
        bg="#0d1f33", fg="#00d8ff",
        font=('Arial', 13, 'bold')).pack(padx=20)

    # Form frame
    _form_n_481152 = tk.Frame(_dlg_n_481152, bg="#1a1a2e", padx=20, pady=12)
    _form_n_481152.pack(fill='both', expand=True)

    _row_n_481152 = 0
    _vars_n_481152 = {}

    def _add_field_n_481152(label, key, default, browse=False):
        global _row_n_481152
        tk.Label(_form_n_481152, text=label, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_481152, column=0, sticky='w', pady=(8,2))
        _v_n_481152 = tk.StringVar(value=str(default))
        _vars_n_481152[key] = _v_n_481152
        _e_n_481152 = tk.Entry(_form_n_481152, textvariable=_v_n_481152,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=42, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344")
        _e_n_481152.grid(row=_row_n_481152+1, column=0,
            columnspan=2 if not browse else 1, sticky='ew', pady=(0,4))
        if browse:
            def _browse_n_481152(v=_v_n_481152):
                _d_n_481152 = filedialog.askdirectory()
                if _d_n_481152: v.set(_d_n_481152)
            tk.Button(_form_n_481152, text="📁", command=_browse_n_481152,
                bg="#1a3a5c", fg="#00d8ff", font=('Arial',10),
                relief='flat', padx=6).grid(row=_row_n_481152+1, column=1,
                sticky='w', padx=(4,0))
        _row_n_481152 += 2

    def _add_row2_n_481152(l1, k1, d1, l2, k2, d2):
        global _row_n_481152
        tk.Label(_form_n_481152, text=l1, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_481152, column=0, sticky='w', pady=(8,2))
        tk.Label(_form_n_481152, text=l2, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_481152, column=1, sticky='w', pady=(8,2), padx=(8,0))
        _v1_n_481152 = tk.StringVar(value=str(d1))
        _v2_n_481152 = tk.StringVar(value=str(d2))
        _vars_n_481152[k1] = _v1_n_481152
        _vars_n_481152[k2] = _v2_n_481152
        tk.Entry(_form_n_481152, textvariable=_v1_n_481152,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_481152+1, column=0, sticky='ew', pady=(0,4))
        tk.Entry(_form_n_481152, textvariable=_v2_n_481152,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_481152+1, column=1, sticky='ew',
            pady=(0,4), padx=(8,0))
        _row_n_481152 += 2

    if _show_folder_n_481152:
        _add_field_n_481152("Render / Source Folder", "folder_path",
            _cfg_n_481152.get('folder_path', ''), browse=True)
    if _show_ext_n_481152:
        _add_field_n_481152("File Extension", "extension",
            _cfg_n_481152.get('extension', '.png'))
    if _show_frames_n_481152:
        _add_row2_n_481152("Start Frame", "start_frame",
            _cfg_n_481152.get('start_frame', 1001),
            "End Frame", "end_frame",
            _cfg_n_481152.get('end_frame', 1100))
    if _show_pad_n_481152:
        _add_field_n_481152("Frame Padding (digits)", "frame_padding",
            _cfg_n_481152.get('frame_padding', 4))
    _add_field_n_481152("Filename Prefix (e.g. shot_010_comp-)", "prefix",
        _cfg_n_481152.get('prefix', ''))
    _add_field_n_481152("Source Folder (for Folder Diff)", "source_folder",
        _cfg_n_481152.get('source_folder', ''), browse=True)
    _add_field_n_481152("Target Folder (for Folder Diff)", "target_folder",
        _cfg_n_481152.get('target_folder', ''), browse=True)
    if _show_naming_n_481152:
        _add_field_n_481152("Naming Pattern  (# = digit, @ = letter)",
            "naming_pattern",
            _cfg_n_481152.get('naming_pattern', 'shot_###_v##'))
    if _show_cs_n_481152:
        _add_field_n_481152("Expected Colourspace", "colourspace",
            _cfg_n_481152.get('colourspace', 'sRGB'))

    # Save config checkbox
    _save_var_n_481152 = tk.BooleanVar(value=True)
    tk.Checkbutton(_form_n_481152,
        text="  Save these settings for next time",
        variable=_save_var_n_481152,
        bg="#1a1a2e", fg="#888888",
        selectcolor="#0d1117", activebackground="#1a1a2e",
        font=('Arial', 9)).grid(
        row=_row_n_481152, column=0, columnspan=2,
        sticky='w', pady=(12,4))
    _row_n_481152 += 1

    # Buttons
    _btn_frame_n_481152 = tk.Frame(_dlg_n_481152, bg="#0d1f33", pady=12)
    _btn_frame_n_481152.pack(fill='x')

    _result_n_481152 = {'ok': False}

    def _on_run_n_481152():
        _result_n_481152['ok'] = True
        _dlg_n_481152.destroy()

    def _on_cancel_n_481152():
        _result_n_481152['ok'] = False
        _dlg_n_481152.destroy()

    tk.Button(_btn_frame_n_481152, text="Cancel",
        command=_on_cancel_n_481152,
        bg="#333344", fg="#888888",
        font=('Arial', 10), relief='flat',
        padx=20, pady=6).pack(side='left', padx=20)

    tk.Button(_btn_frame_n_481152, text="▶  Run Tool",
        command=_on_run_n_481152,
        bg="#00d8ff", fg="#000000",
        font=('Arial', 11, 'bold'), relief='flat',
        padx=20, pady=6).pack(side='right', padx=20)

    _dlg_n_481152.update_idletasks()
    _w_n_481152 = _dlg_n_481152.winfo_reqwidth()
    _h_n_481152 = _dlg_n_481152.winfo_reqheight()
    _x_n_481152 = (_dlg_n_481152.winfo_screenwidth() - _w_n_481152) // 2
    _y_n_481152 = (_dlg_n_481152.winfo_screenheight() - _h_n_481152) // 2
    _dlg_n_481152.geometry(f"{_w_n_481152}x{_h_n_481152}+{_x_n_481152}+{_y_n_481152}")

    _root_n_481152.wait_window(_dlg_n_481152)
    _root_n_481152.destroy()

    if not _result_n_481152['ok']:
        cancelled = True
        print("FlowPins: Config dialog cancelled.")
    else:
        # Read values from form
        if 'folder_path'    in _vars_n_481152: folder_path    = _vars_n_481152['folder_path'].get()
        if 'extension'      in _vars_n_481152: extension      = _vars_n_481152['extension'].get()
        if 'start_frame'    in _vars_n_481152: start_frame    = int(_vars_n_481152['start_frame'].get() or 1001)
        if 'end_frame'      in _vars_n_481152: end_frame      = int(_vars_n_481152['end_frame'].get() or 1100)
        if 'frame_padding'  in _vars_n_481152: frame_padding  = int(_vars_n_481152['frame_padding'].get() or 4)
        if 'naming_pattern' in _vars_n_481152: naming_pattern = _vars_n_481152['naming_pattern'].get()
        if 'colourspace'    in _vars_n_481152: colourspace    = _vars_n_481152['colourspace'].get()
        if 'prefix'         in _vars_n_481152: prefix         = _vars_n_481152['prefix'].get()
        if 'source_folder'  in _vars_n_481152: source_folder  = _vars_n_481152['source_folder'].get()
        if 'target_folder'  in _vars_n_481152: target_folder  = _vars_n_481152['target_folder'].get()

        # Save config if requested
        if _save_var_n_481152.get():
            _save_data_n_481152 = {
                'folder_path':    folder_path,
                'extension':      extension,
                'start_frame':    start_frame,
                'end_frame':      end_frame,
                'frame_padding':  frame_padding,
                'naming_pattern': naming_pattern,
                'colourspace':    colourspace,
                'prefix':         prefix,
                'source_folder':  source_folder,
                'target_folder':  target_folder
            }
            try:
                with open(_cfg_path_n_481152, 'w') as _sf_n_481152:
                    json.dump(_save_data_n_481152, _sf_n_481152, indent=2)
                print("FlowPins: Settings saved to " + _cfg_path_n_481152)
            except Exception as _se_n_481152:
                print("FlowPins: Could not save config — " + str(_se_n_481152))



# Client Delivery Checklist
# Runs all key checks and outputs a clean formatted checklist
import os, re, io
from PIL import Image, ImageCms
from datetime import datetime

_folder_n_486012   = folder_path
_ext_n_486012      = extension if isinstance(extension, str) and extension.startswith(".") else "extension"
_start_n_486012    = int(start_frame)
_end_n_486012      = int(end_frame)
_pattern_n_486012  = naming_pattern
_cs_n_486012       = colourspace
_width_n_486012    = int(1920)
_height_n_486012   = int(1080)
_studio_n_486012   = "OddlyMadeGames"
_show_n_486012     = "MMSM"
_shot_n_486012     = "sc0220"
_save_n_486012     = str("true").lower() == "true"

# Normalise path
if isinstance(_folder_n_486012, str):
    _folder_n_486012 = _folder_n_486012.replace(chr(92), "/").rstrip("/")

all_passed    = False
checks_passed = 0
checks_failed = 0
report_path   = ""

_ts_n_486012  = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
_checks_n_486012 = []

def _add_check_n_486012(name, passed, detail=""):
    _checks_n_486012.append((name, passed, detail))

if not _folder_n_486012 or not os.path.isdir(_folder_n_486012):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_486012))
else:
    # Collect files
    _files_n_486012 = sorted([
        f for f in os.listdir(_folder_n_486012)
        if f.lower().endswith(_ext_n_486012.lower())
    ])
    _found_count_n_486012 = len(_files_n_486012)

    # ── CHECK 1: FRAME COUNT ────────────────────────────────
    _expected_count_n_486012 = _end_n_486012 - _start_n_486012 + 1
    _expected_set_n_486012   = set(range(_start_n_486012, _end_n_486012 + 1))
    _digit_n_486012  = chr(92) + "d"
    _fpat_n_486012   = re.compile("(" + _digit_n_486012 + "+)" + re.escape(_ext_n_486012) + "$", re.IGNORECASE)
    _found_nums_n_486012 = set()
    for _fn_n_486012 in _files_n_486012:
        _m_n_486012 = _fpat_n_486012.search(_fn_n_486012)
        if _m_n_486012: _found_nums_n_486012.add(int(_m_n_486012.group(1)))
    _missing_n_486012 = sorted(_expected_set_n_486012 - _found_nums_n_486012)
    if not _missing_n_486012:
        _add_check_n_486012("Frame Count", True, str(_found_count_n_486012) + " frames present (" + str(_start_n_486012) + "-" + str(_end_n_486012) + ")")
    else:
        _add_check_n_486012("Frame Count", False, str(len(_missing_n_486012)) + " frames missing")

    # ── CHECK 2: NAMING CONVENTION ─────────────────────────
    if _pattern_n_486012:
        _dot_nm_n_486012 = chr(92) + "."
        _dig_nm_n_486012 = chr(92) + "d"
        _rx_n_486012 = _pattern_n_486012.replace(".", _dot_nm_n_486012)
        _rx_n_486012 = re.sub("#+", lambda m: _dig_nm_n_486012 + "{" + str(len(m.group())) + "}", _rx_n_486012)
        _rx_n_486012 = re.sub("@+", lambda m: "[a-zA-Z]{" + str(len(m.group())) + "}", _rx_n_486012)
        _rx_n_486012 = "^" + _rx_n_486012 + "$"
        _nam_fails_n_486012 = [f for f in _files_n_486012 if not re.match(_rx_n_486012, os.path.splitext(f)[0])]
        if not _nam_fails_n_486012:
            _add_check_n_486012("Naming Convention", True, "All files match pattern: " + _pattern_n_486012)
        else:
            _add_check_n_486012("Naming Convention", False, str(len(_nam_fails_n_486012)) + " files fail pattern")
    else:
        _add_check_n_486012("Naming Convention", True, "No pattern specified — skipped")

    # ── CHECK 3: RESOLUTION ────────────────────────────────
    _dim_fails_n_486012 = []
    for _fn_n_486012 in _files_n_486012[:20]:  # sample first 20
        _fp_n_486012 = os.path.join(_folder_n_486012, _fn_n_486012)
        try:
            with Image.open(_fp_n_486012) as _img_n_486012:
                if _img_n_486012.width != _width_n_486012 or _img_n_486012.height != _height_n_486012:
                    _dim_fails_n_486012.append(_fn_n_486012)
        except: pass
    if not _dim_fails_n_486012:
        _add_check_n_486012("Resolution", True, str(_width_n_486012) + "x" + str(_height_n_486012) + " confirmed")
    else:
        _add_check_n_486012("Resolution", False, str(len(_dim_fails_n_486012)) + " files wrong size")

    # ── CHECK 4: COLOURSPACE ───────────────────────────────
    _cs_fails_n_486012 = []
    for _fn_n_486012 in _files_n_486012[:20]:  # sample first 20
        _fp_n_486012 = os.path.join(_folder_n_486012, _fn_n_486012)
        try:
            with Image.open(_fp_n_486012) as _img_n_486012:
                _info_n_486012 = _img_n_486012.info
                if "icc_profile" in _info_n_486012:
                    try:
                        _desc_n_486012 = ImageCms.getProfileDescription(
                            ImageCms.ImageCmsProfile(io.BytesIO(_info_n_486012["icc_profile"]))
                        ).strip().lower()
                        _detected_n_486012 = "sRGB" if "srgb" in _desc_n_486012 else "Rec.709" if "709" in _desc_n_486012 else _desc_n_486012[:20]
                    except: _detected_n_486012 = "ICC Embedded"
                elif "srgb" in _info_n_486012: _detected_n_486012 = "sRGB"
                else: _detected_n_486012 = "Untagged"
                if _detected_n_486012.lower() != _cs_n_486012.lower():
                    _cs_fails_n_486012.append(_fn_n_486012)
        except: pass
    if not _cs_fails_n_486012:
        _add_check_n_486012("Colourspace", True, _cs_n_486012 + " confirmed")
    else:
        _add_check_n_486012("Colourspace", False, str(len(_cs_fails_n_486012)) + " files wrong colourspace")

    # ── CHECK 5: FILE INTEGRITY ───────────────────────────
    _corrupt_n_486012 = []
    _readable_n_486012 = 0
    for _fn_n_486012 in _files_n_486012:
        _fp_n_486012 = os.path.join(_folder_n_486012, _fn_n_486012)
        try:
            with Image.open(_fp_n_486012) as _img_n_486012:
                _ = _img_n_486012.size  # force load header
            _readable_n_486012 += 1
        except:
            _corrupt_n_486012.append(_fn_n_486012)
    if not _corrupt_n_486012:
        _add_check_n_486012("File Integrity", True, str(_readable_n_486012) + " files verified readable")
    else:
        _add_check_n_486012("File Integrity", False, str(len(_corrupt_n_486012)) + " files corrupt or unreadable")

    # ── TALLY ─────────────────────────────────────────────
    checks_passed = sum(1 for _, p, _ in _checks_n_486012 if p)
    checks_failed = sum(1 for _, p, _ in _checks_n_486012 if not p)
    all_passed    = checks_failed == 0

    # ── PRINT CHECKLIST ───────────────────────────────────
    _sep_n_486012 = "=" * 62
    print(_sep_n_486012)
    print("  FLOWPINS CLIENT DELIVERY CHECKLIST")
    print("  Generated : " + _ts_n_486012)
    print("  Studio    : " + _studio_n_486012)
    print("  Show      : " + _show_n_486012)
    print("  Shot      : " + _shot_n_486012)
    print("  Folder    : " + _folder_n_486012)
    print(_sep_n_486012)
    print("")
    print("  DELIVERY SPECIFICATION")
    print("  Format    : " + _ext_n_486012.upper().lstrip("."))
    print("  Range     : " + str(_start_n_486012) + " - " + str(_end_n_486012) + " (" + str(_expected_count_n_486012) + " frames)")
    print("  Resolution: " + str(_width_n_486012) + " x " + str(_height_n_486012))
    print("  CS        : " + _cs_n_486012)
    print("  Pattern   : " + str(_pattern_n_486012))
    print("")
    print("  VALIDATION CHECKS")
    print("  " + "-" * 58)
    for _name_n_486012, _passed_n_486012, _detail_n_486012 in _checks_n_486012:
        _tick_n_486012   = chr(10003) if _passed_n_486012 else chr(10007)
        _status_n_486012 = "PASS" if _passed_n_486012 else "FAIL"
        print("  [" + _tick_n_486012 + "] " + _status_n_486012 + "  " + _name_n_486012.ljust(22) + "  " + _detail_n_486012)
    print("  " + "-" * 58)
    print("")
    print("  RESULT: " + ("ALL CHECKS PASSED - APPROVED FOR DELIVERY" if all_passed else str(checks_failed) + " CHECK(S) FAILED - NOT APPROVED"))
    print("")
    print(_sep_n_486012)

    # ── SAVE REPORT ───────────────────────────────────────
    if _save_n_486012:
        _rname_n_486012 = "delivery_checklist_" + _shot_n_486012 + "_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".txt"
        report_path = os.path.join(_folder_n_486012, _rname_n_486012)
        try:
            _lines_n_486012 = [
                "=" * 62,
                "  FLOWPINS CLIENT DELIVERY CHECKLIST",
                "  Generated : " + _ts_n_486012,
                "  Studio    : " + _studio_n_486012,
                "  Show      : " + _show_n_486012,
                "  Shot      : " + _shot_n_486012,
                "  Folder    : " + _folder_n_486012,
                "=" * 62,
                "",
                "  DELIVERY SPECIFICATION",
                "  Format    : " + _ext_n_486012.upper().lstrip("."),
                "  Range     : " + str(_start_n_486012) + " - " + str(_end_n_486012) + " (" + str(_expected_count_n_486012) + " frames)",
                "  Resolution: " + str(_width_n_486012) + " x " + str(_height_n_486012),
                "  CS        : " + _cs_n_486012,
                "  Pattern   : " + str(_pattern_n_486012),
                "",
                "  VALIDATION CHECKS",
                "  " + "-" * 58,
            ]
            for _name_n_486012, _passed_n_486012, _detail_n_486012 in _checks_n_486012:
                _tick_n_486012   = "PASS" if _passed_n_486012 else "FAIL"
                _lines_n_486012.append("  [" + _tick_n_486012 + "]  " + _name_n_486012.ljust(22) + "  " + _detail_n_486012)
            _lines_n_486012 += [
                "  " + "-" * 58,
                "",
                "  RESULT: " + ("ALL CHECKS PASSED - APPROVED FOR DELIVERY" if all_passed else str(checks_failed) + " CHECK(S) FAILED - NOT APPROVED"),
                "",
                "  Verified by FlowPins Pipeline Suite",
                "=" * 62,
            ]
            with open(report_path, "w", encoding="utf-8") as _rf_n_486012:
                _rf_n_486012.write(chr(10).join(_lines_n_486012))
            print("  Report: " + report_path)
        except Exception as _re_n_486012:
            print("  Report save failed: " + str(_re_n_486012))


