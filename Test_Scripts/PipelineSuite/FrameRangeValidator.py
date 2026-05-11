# Start Execution


# Load config or show dialog — the smart config node
# If config exists: load silently and use saved values
# If config missing or force_dialog=True: show UI, optionally save
import json, os, tkinter as tk
from tkinter import ttk, filedialog, messagebox

_cfg_path_n_034332   = "studio_config.json"
_title_n_034332      = "FlowPins — Tool Settings"
_force_n_034332      = str("false").lower() == "true"
_show_folder_n_034332   = str("true").lower() == "true"
_show_ext_n_034332      = str("true").lower() == "true"
_show_frames_n_034332   = str("true").lower() == "true"
_show_naming_n_034332   = str("true").lower() == "true"
_show_cs_n_034332       = str("true").lower() == "true"
_show_pad_n_034332      = str("true").lower() == "true"

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
_cfg_n_034332 = {}
_has_config_n_034332 = False
if os.path.isfile(_cfg_path_n_034332):
    try:
        with open(_cfg_path_n_034332, 'r') as _f_n_034332:
            _cfg_n_034332 = json.load(_f_n_034332)
        _has_config_n_034332 = True
    except:
        pass

# Use config values if loaded and not forcing dialog
# Also force dialog if folder_path is empty even with a valid config
_cfg_folder_n_034332 = _cfg_n_034332.get('folder_path', '') if _has_config_n_034332 else ''
if _has_config_n_034332 and not _force_n_034332 and _cfg_folder_n_034332:
    folder_path    = _cfg_n_034332.get('folder_path',    folder_path)
    extension      = _cfg_n_034332.get('extension',      extension)
    start_frame    = int(_cfg_n_034332.get('start_frame',    start_frame))
    end_frame      = int(_cfg_n_034332.get('end_frame',      end_frame))
    naming_pattern = _cfg_n_034332.get('naming_pattern', naming_pattern)
    colourspace    = _cfg_n_034332.get('colourspace',    colourspace)
    frame_padding  = int(_cfg_n_034332.get('frame_padding',  frame_padding))
    prefix         = _cfg_n_034332.get('prefix',         prefix)
    source_folder  = _cfg_n_034332.get('source_folder',  source_folder)
    target_folder  = _cfg_n_034332.get('target_folder',  target_folder)
    print("FlowPins: Config loaded from " + _cfg_path_n_034332)
else:
    # Show the configuration dialog
    _root_n_034332 = tk.Tk()
    _root_n_034332.withdraw()

    _dlg_n_034332 = tk.Toplevel(_root_n_034332)
    _dlg_n_034332.title(_title_n_034332)
    _dlg_n_034332.resizable(False, False)
    _dlg_n_034332.configure(bg="#1a1a2e")
    _dlg_n_034332.grab_set()

    _style_n_034332 = ttk.Style()
    _style_n_034332.theme_use('clam')
    _style_n_034332.configure('FP.TLabel',
        background="#1a1a2e", foreground="#00d8ff",
        font=('Arial', 10, 'bold'))
    _style_n_034332.configure('FPV.TLabel',
        background="#1a1a2e", foreground="#cccccc",
        font=('Arial', 10))
    _style_n_034332.configure('FP.TEntry',
        fieldbackground="#0d1117", foreground="#ffffff",
        insertcolor="#00d8ff", font=('Arial', 10))
    _style_n_034332.configure('FP.TButton',
        background="#1a3a5c", foreground="#ffffff",
        font=('Arial', 10, 'bold'), padding=8)
    _style_n_034332.configure('FPRun.TButton',
        background="#00d8ff", foreground="#000000",
        font=('Arial', 10, 'bold'), padding=8)

    # Header
    _hdr_n_034332 = tk.Frame(_dlg_n_034332, bg="#0d1f33", pady=12)
    _hdr_n_034332.pack(fill='x')
    tk.Label(_hdr_n_034332, text="⬡  " + _title_n_034332,
        bg="#0d1f33", fg="#00d8ff",
        font=('Arial', 13, 'bold')).pack(padx=20)

    # Form frame
    _form_n_034332 = tk.Frame(_dlg_n_034332, bg="#1a1a2e", padx=20, pady=12)
    _form_n_034332.pack(fill='both', expand=True)

    _row_n_034332 = 0
    _vars_n_034332 = {}

    def _add_field_n_034332(label, key, default, browse=False):
        global _row_n_034332
        tk.Label(_form_n_034332, text=label, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_034332, column=0, sticky='w', pady=(8,2))
        _v_n_034332 = tk.StringVar(value=str(default))
        _vars_n_034332[key] = _v_n_034332
        _e_n_034332 = tk.Entry(_form_n_034332, textvariable=_v_n_034332,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=42, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344")
        _e_n_034332.grid(row=_row_n_034332+1, column=0,
            columnspan=2 if not browse else 1, sticky='ew', pady=(0,4))
        if browse:
            def _browse_n_034332(v=_v_n_034332):
                _d_n_034332 = filedialog.askdirectory()
                if _d_n_034332: v.set(_d_n_034332)
            tk.Button(_form_n_034332, text="📁", command=_browse_n_034332,
                bg="#1a3a5c", fg="#00d8ff", font=('Arial',10),
                relief='flat', padx=6).grid(row=_row_n_034332+1, column=1,
                sticky='w', padx=(4,0))
        _row_n_034332 += 2

    def _add_row2_n_034332(l1, k1, d1, l2, k2, d2):
        global _row_n_034332
        tk.Label(_form_n_034332, text=l1, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_034332, column=0, sticky='w', pady=(8,2))
        tk.Label(_form_n_034332, text=l2, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_034332, column=1, sticky='w', pady=(8,2), padx=(8,0))
        _v1_n_034332 = tk.StringVar(value=str(d1))
        _v2_n_034332 = tk.StringVar(value=str(d2))
        _vars_n_034332[k1] = _v1_n_034332
        _vars_n_034332[k2] = _v2_n_034332
        tk.Entry(_form_n_034332, textvariable=_v1_n_034332,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_034332+1, column=0, sticky='ew', pady=(0,4))
        tk.Entry(_form_n_034332, textvariable=_v2_n_034332,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_034332+1, column=1, sticky='ew',
            pady=(0,4), padx=(8,0))
        _row_n_034332 += 2

    if _show_folder_n_034332:
        _add_field_n_034332("Render / Source Folder", "folder_path",
            _cfg_n_034332.get('folder_path', ''), browse=True)
    if _show_ext_n_034332:
        _add_field_n_034332("File Extension", "extension",
            _cfg_n_034332.get('extension', '.png'))
    if _show_frames_n_034332:
        _add_row2_n_034332("Start Frame", "start_frame",
            _cfg_n_034332.get('start_frame', 1001),
            "End Frame", "end_frame",
            _cfg_n_034332.get('end_frame', 1100))
    if _show_pad_n_034332:
        _add_field_n_034332("Frame Padding (digits)", "frame_padding",
            _cfg_n_034332.get('frame_padding', 4))
    _add_field_n_034332("Filename Prefix (e.g. shot_010_comp-)", "prefix",
        _cfg_n_034332.get('prefix', ''))
    _add_field_n_034332("Source Folder (for Folder Diff)", "source_folder",
        _cfg_n_034332.get('source_folder', ''), browse=True)
    _add_field_n_034332("Target Folder (for Folder Diff)", "target_folder",
        _cfg_n_034332.get('target_folder', ''), browse=True)
    if _show_naming_n_034332:
        _add_field_n_034332("Naming Pattern  (# = digit, @ = letter)",
            "naming_pattern",
            _cfg_n_034332.get('naming_pattern', 'shot_###_v##'))
    if _show_cs_n_034332:
        _add_field_n_034332("Expected Colourspace", "colourspace",
            _cfg_n_034332.get('colourspace', 'sRGB'))

    # Save config checkbox
    _save_var_n_034332 = tk.BooleanVar(value=True)
    tk.Checkbutton(_form_n_034332,
        text="  Save these settings for next time",
        variable=_save_var_n_034332,
        bg="#1a1a2e", fg="#888888",
        selectcolor="#0d1117", activebackground="#1a1a2e",
        font=('Arial', 9)).grid(
        row=_row_n_034332, column=0, columnspan=2,
        sticky='w', pady=(12,4))
    _row_n_034332 += 1

    # Buttons
    _btn_frame_n_034332 = tk.Frame(_dlg_n_034332, bg="#0d1f33", pady=12)
    _btn_frame_n_034332.pack(fill='x')

    _result_n_034332 = {'ok': False}

    def _on_run_n_034332():
        _result_n_034332['ok'] = True
        _dlg_n_034332.destroy()

    def _on_cancel_n_034332():
        _result_n_034332['ok'] = False
        _dlg_n_034332.destroy()

    tk.Button(_btn_frame_n_034332, text="Cancel",
        command=_on_cancel_n_034332,
        bg="#333344", fg="#888888",
        font=('Arial', 10), relief='flat',
        padx=20, pady=6).pack(side='left', padx=20)

    tk.Button(_btn_frame_n_034332, text="▶  Run Tool",
        command=_on_run_n_034332,
        bg="#00d8ff", fg="#000000",
        font=('Arial', 11, 'bold'), relief='flat',
        padx=20, pady=6).pack(side='right', padx=20)

    _dlg_n_034332.update_idletasks()
    _w_n_034332 = _dlg_n_034332.winfo_reqwidth()
    _h_n_034332 = _dlg_n_034332.winfo_reqheight()
    _x_n_034332 = (_dlg_n_034332.winfo_screenwidth() - _w_n_034332) // 2
    _y_n_034332 = (_dlg_n_034332.winfo_screenheight() - _h_n_034332) // 2
    _dlg_n_034332.geometry(f"{_w_n_034332}x{_h_n_034332}+{_x_n_034332}+{_y_n_034332}")

    _root_n_034332.wait_window(_dlg_n_034332)
    _root_n_034332.destroy()

    if not _result_n_034332['ok']:
        cancelled = True
        print("FlowPins: Config dialog cancelled.")
    else:
        # Read values from form
        if 'folder_path'    in _vars_n_034332: folder_path    = _vars_n_034332['folder_path'].get()
        if 'extension'      in _vars_n_034332: extension      = _vars_n_034332['extension'].get()
        if 'start_frame'    in _vars_n_034332: start_frame    = int(_vars_n_034332['start_frame'].get() or 1001)
        if 'end_frame'      in _vars_n_034332: end_frame      = int(_vars_n_034332['end_frame'].get() or 1100)
        if 'frame_padding'  in _vars_n_034332: frame_padding  = int(_vars_n_034332['frame_padding'].get() or 4)
        if 'naming_pattern' in _vars_n_034332: naming_pattern = _vars_n_034332['naming_pattern'].get()
        if 'colourspace'    in _vars_n_034332: colourspace    = _vars_n_034332['colourspace'].get()
        if 'prefix'         in _vars_n_034332: prefix         = _vars_n_034332['prefix'].get()
        if 'source_folder'  in _vars_n_034332: source_folder  = _vars_n_034332['source_folder'].get()
        if 'target_folder'  in _vars_n_034332: target_folder  = _vars_n_034332['target_folder'].get()

        # Save config if requested
        if _save_var_n_034332.get():
            _save_data_n_034332 = {
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
                with open(_cfg_path_n_034332, 'w') as _sf_n_034332:
                    json.dump(_save_data_n_034332, _sf_n_034332, indent=2)
                print("FlowPins: Settings saved to " + _cfg_path_n_034332)
            except Exception as _se_n_034332:
                print("FlowPins: Could not save config — " + str(_se_n_034332))



# Frame Range Validator
# Strict pass/fail — confirms folder covers expected range exactly
# No gaps allowed, no extra frames outside the range
import os, re

_folder_n_049933  = folder_path
_ext_n_049933     = extension if isinstance(extension, str) and extension.startswith(".") else "extension"
_start_n_049933   = int(start_frame)
_end_n_049933     = int(end_frame)

is_valid        = False
frames_found    = 0
frames_expected = 0
missing_frames  = []
extra_frames    = []

if not _folder_n_049933 or not os.path.isdir(_folder_n_049933):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_049933))
else:
    frames_expected = _end_n_049933 - _start_n_049933 + 1
    _expected_n_049933 = set(range(_start_n_049933, _end_n_049933 + 1))

    # Scan folder and extract frame numbers
    _digit_n_049933   = chr(92) + "d"
    _pattern_n_049933 = re.compile("(" + _digit_n_049933 + "+)" + re.escape(_ext_n_049933) + "$", re.IGNORECASE)
    _found_nums_n_049933 = set()

    for _fn_n_049933 in os.listdir(_folder_n_049933):
        _m_n_049933 = _pattern_n_049933.search(_fn_n_049933)
        if _m_n_049933:
            _found_nums_n_049933.add(int(_m_n_049933.group(1)))

    frames_found   = len(_found_nums_n_049933)
    missing_frames = sorted(_expected_n_049933 - _found_nums_n_049933)
    extra_frames   = sorted(_found_nums_n_049933 - _expected_n_049933)
    is_valid       = len(missing_frames) == 0 and len(extra_frames) == 0

    print("FlowPins Frame Range Validator")
    print("  Folder   : " + _folder_n_049933)
    print("  Expected : frames " + str(_start_n_049933) + " — " + str(_end_n_049933) + " (" + str(frames_expected) + " frames)")
    print("  Found    : " + str(frames_found) + " frames")
    print("-" * 55)

    if missing_frames:
        print("  MISSING (" + str(len(missing_frames)) + "):")
        # Group consecutive
        _groups_n_049933 = []
        _gs_n_049933 = missing_frames[0]
        _gp_n_049933 = missing_frames[0]
        for _mf_n_049933 in missing_frames[1:]:
            if _mf_n_049933 != _gp_n_049933 + 1:
                _groups_n_049933.append((_gs_n_049933, _gp_n_049933))
                _gs_n_049933 = _mf_n_049933
            _gp_n_049933 = _mf_n_049933
        _groups_n_049933.append((_gs_n_049933, _gp_n_049933))
        for _ga_n_049933, _gb_n_049933 in _groups_n_049933:
            if _ga_n_049933 == _gb_n_049933:
                print("    ✗ " + str(_ga_n_049933).zfill(4))
            else:
                print("    ✗ " + str(_ga_n_049933).zfill(4) + " — " + str(_gb_n_049933).zfill(4) + " (" + str(_gb_n_049933 - _ga_n_049933 + 1) + " frames)")
    else:
        print("  MISSING  : none")

    if extra_frames:
        print("  EXTRA (" + str(len(extra_frames)) + ") — frames outside expected range:")
        for _ef_n_049933 in extra_frames[:10]:
            print("    + " + str(_ef_n_049933).zfill(4))
        if len(extra_frames) > 10:
            print("    ... and " + str(len(extra_frames) - 10) + " more")
    else:
        print("  EXTRA    : none")

    print("-" * 55)
    if is_valid:
        print("  ✓ PASS — frame range is valid and complete")
    else:
        _issues_n_049933 = []
        if missing_frames: _issues_n_049933.append(str(len(missing_frames)) + " missing")
        if extra_frames:   _issues_n_049933.append(str(len(extra_frames)) + " extra")
        print("  ✗ FAIL — " + ", ".join(_issues_n_049933))


