# Start Execution


# Load config or show dialog — the smart config node
# If config exists: load silently and use saved values
# If config missing or force_dialog=True: show UI, optionally save
import json, os, tkinter as tk
from tkinter import ttk, filedialog, messagebox

_cfg_path_n_001800   = "studio_config.json"
_title_n_001800      = "FlowPins — Tool Settings"
_force_n_001800      = str("false").lower() == "true"
_show_folder_n_001800   = str("true").lower() == "true"
_show_ext_n_001800      = str("true").lower() == "true"
_show_frames_n_001800   = str("true").lower() == "true"
_show_naming_n_001800   = str("true").lower() == "true"
_show_cs_n_001800       = str("true").lower() == "true"
_show_pad_n_001800      = str("true").lower() == "true"

# Default values
folder_path    = ""
extension      = ".png"
start_frame    = 1001
end_frame      = 1100
naming_pattern = "shot_###_v##"
colourspace    = "sRGB"
frame_padding  = 4
cancelled      = False

# Try loading existing config
_cfg_n_001800 = {}
_has_config_n_001800 = False
if os.path.isfile(_cfg_path_n_001800):
    try:
        with open(_cfg_path_n_001800, 'r') as _f_n_001800:
            _cfg_n_001800 = json.load(_f_n_001800)
        _has_config_n_001800 = True
    except:
        pass

# Use config values if loaded and not forcing dialog
if _has_config_n_001800 and not _force_n_001800:
    folder_path    = _cfg_n_001800.get('folder_path',    folder_path)
    extension      = _cfg_n_001800.get('extension',      extension)
    start_frame    = int(_cfg_n_001800.get('start_frame',    start_frame))
    end_frame      = int(_cfg_n_001800.get('end_frame',      end_frame))
    naming_pattern = _cfg_n_001800.get('naming_pattern', naming_pattern)
    colourspace    = _cfg_n_001800.get('colourspace',    colourspace)
    frame_padding  = int(_cfg_n_001800.get('frame_padding',  frame_padding))
    print("FlowPins: Config loaded from " + _cfg_path_n_001800)
else:
    # Show the configuration dialog
    _root_n_001800 = tk.Tk()
    _root_n_001800.withdraw()

    _dlg_n_001800 = tk.Toplevel(_root_n_001800)
    _dlg_n_001800.title(_title_n_001800)
    _dlg_n_001800.resizable(False, False)
    _dlg_n_001800.configure(bg="#1a1a2e")
    _dlg_n_001800.grab_set()

    _style_n_001800 = ttk.Style()
    _style_n_001800.theme_use('clam')
    _style_n_001800.configure('FP.TLabel',
        background="#1a1a2e", foreground="#00d8ff",
        font=('Arial', 10, 'bold'))
    _style_n_001800.configure('FPV.TLabel',
        background="#1a1a2e", foreground="#cccccc",
        font=('Arial', 10))
    _style_n_001800.configure('FP.TEntry',
        fieldbackground="#0d1117", foreground="#ffffff",
        insertcolor="#00d8ff", font=('Arial', 10))
    _style_n_001800.configure('FP.TButton',
        background="#1a3a5c", foreground="#ffffff",
        font=('Arial', 10, 'bold'), padding=8)
    _style_n_001800.configure('FPRun.TButton',
        background="#00d8ff", foreground="#000000",
        font=('Arial', 10, 'bold'), padding=8)

    # Header
    _hdr_n_001800 = tk.Frame(_dlg_n_001800, bg="#0d1f33", pady=12)
    _hdr_n_001800.pack(fill='x')
    tk.Label(_hdr_n_001800, text="⬡  " + _title_n_001800,
        bg="#0d1f33", fg="#00d8ff",
        font=('Arial', 13, 'bold')).pack(padx=20)

    # Form frame
    _form_n_001800 = tk.Frame(_dlg_n_001800, bg="#1a1a2e", padx=20, pady=12)
    _form_n_001800.pack(fill='both', expand=True)

    _row_n_001800 = 0
    _vars_n_001800 = {}

    def _add_field_n_001800(label, key, default, browse=False):
        global _row_n_001800
        tk.Label(_form_n_001800, text=label, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_001800, column=0, sticky='w', pady=(8,2))
        _v_n_001800 = tk.StringVar(value=str(default))
        _vars_n_001800[key] = _v_n_001800
        _e_n_001800 = tk.Entry(_form_n_001800, textvariable=_v_n_001800,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=42, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344")
        _e_n_001800.grid(row=_row_n_001800+1, column=0,
            columnspan=2 if not browse else 1, sticky='ew', pady=(0,4))
        if browse:
            def _browse_n_001800(v=_v_n_001800):
                _d_n_001800 = filedialog.askdirectory()
                if _d_n_001800: v.set(_d_n_001800)
            tk.Button(_form_n_001800, text="📁", command=_browse_n_001800,
                bg="#1a3a5c", fg="#00d8ff", font=('Arial',10),
                relief='flat', padx=6).grid(row=_row_n_001800+1, column=1,
                sticky='w', padx=(4,0))
        _row_n_001800 += 2

    def _add_row2_n_001800(l1, k1, d1, l2, k2, d2):
        global _row_n_001800
        tk.Label(_form_n_001800, text=l1, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_001800, column=0, sticky='w', pady=(8,2))
        tk.Label(_form_n_001800, text=l2, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_001800, column=1, sticky='w', pady=(8,2), padx=(8,0))
        _v1_n_001800 = tk.StringVar(value=str(d1))
        _v2_n_001800 = tk.StringVar(value=str(d2))
        _vars_n_001800[k1] = _v1_n_001800
        _vars_n_001800[k2] = _v2_n_001800
        tk.Entry(_form_n_001800, textvariable=_v1_n_001800,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_001800+1, column=0, sticky='ew', pady=(0,4))
        tk.Entry(_form_n_001800, textvariable=_v2_n_001800,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_001800+1, column=1, sticky='ew',
            pady=(0,4), padx=(8,0))
        _row_n_001800 += 2

    if _show_folder_n_001800:
        _add_field_n_001800("Render / Source Folder", "folder_path",
            _cfg_n_001800.get('folder_path', ''), browse=True)
    if _show_ext_n_001800:
        _add_field_n_001800("File Extension", "extension",
            _cfg_n_001800.get('extension', '.png'))
    if _show_frames_n_001800:
        _add_row2_n_001800("Start Frame", "start_frame",
            _cfg_n_001800.get('start_frame', 1001),
            "End Frame", "end_frame",
            _cfg_n_001800.get('end_frame', 1100))
    if _show_pad_n_001800:
        _add_field_n_001800("Frame Padding (digits)", "frame_padding",
            _cfg_n_001800.get('frame_padding', 4))
    if _show_naming_n_001800:
        _add_field_n_001800("Naming Pattern  (# = digit, @ = letter)",
            "naming_pattern",
            _cfg_n_001800.get('naming_pattern', 'shot_###_v##'))
    if _show_cs_n_001800:
        _add_field_n_001800("Expected Colourspace", "colourspace",
            _cfg_n_001800.get('colourspace', 'sRGB'))

    # Save config checkbox
    _save_var_n_001800 = tk.BooleanVar(value=True)
    tk.Checkbutton(_form_n_001800,
        text="  Save these settings for next time",
        variable=_save_var_n_001800,
        bg="#1a1a2e", fg="#888888",
        selectcolor="#0d1117", activebackground="#1a1a2e",
        font=('Arial', 9)).grid(
        row=_row_n_001800, column=0, columnspan=2,
        sticky='w', pady=(12,4))
    _row_n_001800 += 1

    # Buttons
    _btn_frame_n_001800 = tk.Frame(_dlg_n_001800, bg="#0d1f33", pady=12)
    _btn_frame_n_001800.pack(fill='x')

    _result_n_001800 = {'ok': False}

    def _on_run_n_001800():
        _result_n_001800['ok'] = True
        _dlg_n_001800.destroy()

    def _on_cancel_n_001800():
        _result_n_001800['ok'] = False
        _dlg_n_001800.destroy()

    tk.Button(_btn_frame_n_001800, text="Cancel",
        command=_on_cancel_n_001800,
        bg="#333344", fg="#888888",
        font=('Arial', 10), relief='flat',
        padx=20, pady=6).pack(side='left', padx=20)

    tk.Button(_btn_frame_n_001800, text="▶  Run Tool",
        command=_on_run_n_001800,
        bg="#00d8ff", fg="#000000",
        font=('Arial', 11, 'bold'), relief='flat',
        padx=20, pady=6).pack(side='right', padx=20)

    _dlg_n_001800.update_idletasks()
    _w_n_001800 = _dlg_n_001800.winfo_reqwidth()
    _h_n_001800 = _dlg_n_001800.winfo_reqheight()
    _x_n_001800 = (_dlg_n_001800.winfo_screenwidth() - _w_n_001800) // 2
    _y_n_001800 = (_dlg_n_001800.winfo_screenheight() - _h_n_001800) // 2
    _dlg_n_001800.geometry(f"{_w_n_001800}x{_h_n_001800}+{_x_n_001800}+{_y_n_001800}")

    _root_n_001800.wait_window(_dlg_n_001800)
    _root_n_001800.destroy()

    if not _result_n_001800['ok']:
        cancelled = True
        print("FlowPins: Config dialog cancelled.")
    else:
        # Read values from form
        if 'folder_path'    in _vars_n_001800: folder_path    = _vars_n_001800['folder_path'].get()
        if 'extension'      in _vars_n_001800: extension      = _vars_n_001800['extension'].get()
        if 'start_frame'    in _vars_n_001800: start_frame    = int(_vars_n_001800['start_frame'].get() or 1001)
        if 'end_frame'      in _vars_n_001800: end_frame      = int(_vars_n_001800['end_frame'].get() or 1100)
        if 'frame_padding'  in _vars_n_001800: frame_padding  = int(_vars_n_001800['frame_padding'].get() or 4)
        if 'naming_pattern' in _vars_n_001800: naming_pattern = _vars_n_001800['naming_pattern'].get()
        if 'colourspace'    in _vars_n_001800: colourspace    = _vars_n_001800['colourspace'].get()

        # Save config if requested
        if _save_var_n_001800.get():
            _save_data_n_001800 = {
                'folder_path':    folder_path,
                'extension':      extension,
                'start_frame':    start_frame,
                'end_frame':      end_frame,
                'frame_padding':  frame_padding,
                'naming_pattern': naming_pattern,
                'colourspace':    colourspace
            }
            try:
                with open(_cfg_path_n_001800, 'w') as _sf_n_001800:
                    json.dump(_save_data_n_001800, _sf_n_001800, indent=2)
                print("FlowPins: Settings saved to " + _cfg_path_n_001800)
            except Exception as _se_n_001800:
                print("FlowPins: Could not save config — " + str(_se_n_001800))



# Frame Sequence Check
# Scans a folder for an image sequence and reports missing frames
import os, re

_folder_n_212534    = folder_path
_start_n_212534     = int(start_frame)
_end_n_212534       = int(end_frame)
_ext_n_212534       = extension
_pad_n_212534       = int(frame_padding)
_prefix_n_212534    = "###_comp-"
_naming_n_212534    = naming_pattern
_cs_n_212534        = colourspace

print("FlowPins Frame Check — " + str(_folder_n_212534))
print("  Folder   : " + str(_folder_n_212534))
print("  Extension: " + _ext_n_212534)
print("  Expected : " + str(_end_n_212534 - _start_n_212534 + 1) +
      " frames (" + str(_start_n_212534) + "-" + str(_end_n_212534) + ")")
if _naming_n_212534: print("  Pattern  : " + _naming_n_212534)
if _cs_n_212534:     print("  Colourspace: " + _cs_n_212534)
print("-" * 55)

# Build set of expected filenames
_expected_n_212534 = set()
for _f_n_212534 in range(_start_n_212534, _end_n_212534 + 1):
    _fname_n_212534 = _prefix_n_212534 + str(_f_n_212534).zfill(_pad_n_212534) + _ext_n_212534
    _expected_n_212534.add(_fname_n_212534)

# Build set of found filenames matching extension
_found_files_n_212534 = set()
if os.path.isdir(_folder_n_212534):
    for _fn_n_212534 in os.listdir(_folder_n_212534):
        if _fn_n_212534.lower().endswith(_ext_n_212534.lower()):
            _found_files_n_212534.add(_fn_n_212534)

# Find missing frames
_missing_names_n_212534 = sorted(_expected_n_212534 - _found_files_n_212534)
missing_frames = []
for _mn_n_212534 in _missing_names_n_212534:
    _base_n_212534 = _mn_n_212534.replace(_prefix_n_212534, "").replace(_ext_n_212534, "")
    try:
        missing_frames.append(int(_base_n_212534))
    except:
        missing_frames.append(_mn_n_212534)

found_count   = len(_found_files_n_212534)
missing_count = len(missing_frames)
is_complete   = missing_count == 0

# Naming convention check
naming_fails = []
if _naming_n_212534:
    _regex_n_212534 = _naming_n_212534.replace(".", ".").replace("*", ".*")
    _digit_n_212534 = chr(92) + "d"
    _regex_n_212534 = re.sub("#+", lambda m: _digit_n_212534 + "{" + str(len(m.group())) + "}", _regex_n_212534)
    _regex_n_212534 = re.sub("@+", lambda m: "[a-zA-Z]{" + str(len(m.group())) + "}", _regex_n_212534)
    _regex_n_212534 = "^" + _regex_n_212534 + "$"
    for _fn_n_212534 in sorted(_found_files_n_212534):
        _stem_n_212534 = os.path.splitext(_fn_n_212534)[0]
        if not re.match(_regex_n_212534, _stem_n_212534):
            naming_fails.append(_fn_n_212534)

# Colourspace check (PNG only via PIL if available)
cs_fails = []
if _cs_n_212534 and _ext_n_212534.lower() == ".png":
    try:
        from PIL import Image
        for _fn_n_212534 in sorted(_found_files_n_212534):
            _fp_n_212534 = os.path.join(_folder_n_212534, _fn_n_212534)
            try:
                _img_n_212534 = Image.open(_fp_n_212534)
                _info_n_212534 = _img_n_212534.info
                _icc_n_212534  = _info_n_212534.get("icc_profile", None)
                _mode_n_212534 = _img_n_212534.mode
                # Simple check: sRGB images have ICC profile, linear dont
                if _cs_n_212534.lower() in ["srgb", "sRGB"]:
                    if not _icc_n_212534:
                        cs_fails.append(_fn_n_212534 + " (no ICC profile)")
            except:
                pass
    except ImportError:
        print("  Note: PIL not available — colourspace check skipped")

# Print results
print("SEQUENCE:")
if is_complete:
    print("  ✓ PASS — all " + str(found_count) + " frames present")
else:
    print("  ✗ FAIL — " + str(missing_count) + " frames missing")
    print("  Missing: " + ", ".join(str(m) for m in missing_frames))

if _naming_n_212534:
    print("NAMING:")
    if not naming_fails:
        print("  ✓ PASS — all files match pattern")
    else:
        print("  ✗ FAIL — " + str(len(naming_fails)) + " files failed")
        for _nf_n_212534 in naming_fails:
            print("    FAIL: " + _nf_n_212534)

if _cs_n_212534:
    print("COLOURSPACE:")
    if not cs_fails:
        print("  ✓ PASS — all files match " + _cs_n_212534)
    else:
        print("  ✗ FAIL — " + str(len(cs_fails)) + " files failed")
        for _cf_n_212534 in cs_fails:
            print("    FAIL: " + _cf_n_212534)

print("-" * 55)
_total_fails_n_212534 = missing_count + len(naming_fails) + len(cs_fails)
if _total_fails_n_212534 == 0:
    print("OVERALL: ✓ PASS")
else:
    print("OVERALL: ✗ FAIL — " + str(_total_fails_n_212534) + " issues found")


