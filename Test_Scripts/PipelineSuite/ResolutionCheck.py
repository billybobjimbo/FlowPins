# Start Execution


# Load config or show dialog — the smart config node
# If config exists: load silently and use saved values
# If config missing or force_dialog=True: show UI, optionally save
import json, os, tkinter as tk
from tkinter import ttk, filedialog, messagebox

_cfg_path_n_412683   = "studio_config.json"
_title_n_412683      = "FlowPins — Tool Settings"
_force_n_412683      = str("false").lower() == "true"
_show_folder_n_412683   = str("true").lower() == "true"
_show_ext_n_412683      = str("true").lower() == "true"
_show_frames_n_412683   = str("true").lower() == "true"
_show_naming_n_412683   = str("true").lower() == "true"
_show_cs_n_412683       = str("true").lower() == "true"
_show_pad_n_412683      = str("true").lower() == "true"

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
_cfg_n_412683 = {}
_has_config_n_412683 = False
if os.path.isfile(_cfg_path_n_412683):
    try:
        with open(_cfg_path_n_412683, 'r') as _f_n_412683:
            _cfg_n_412683 = json.load(_f_n_412683)
        _has_config_n_412683 = True
    except:
        pass

# Use config values if loaded and not forcing dialog
# Also force dialog if folder_path is empty even with a valid config
_cfg_folder_n_412683 = _cfg_n_412683.get('folder_path', '') if _has_config_n_412683 else ''
if _has_config_n_412683 and not _force_n_412683 and _cfg_folder_n_412683:
    folder_path    = _cfg_n_412683.get('folder_path',    folder_path)
    extension      = _cfg_n_412683.get('extension',      extension)
    start_frame    = int(_cfg_n_412683.get('start_frame',    start_frame))
    end_frame      = int(_cfg_n_412683.get('end_frame',      end_frame))
    naming_pattern = _cfg_n_412683.get('naming_pattern', naming_pattern)
    colourspace    = _cfg_n_412683.get('colourspace',    colourspace)
    frame_padding  = int(_cfg_n_412683.get('frame_padding',  frame_padding))
    prefix         = _cfg_n_412683.get('prefix',         prefix)
    print("FlowPins: Config loaded from " + _cfg_path_n_412683)
else:
    # Show the configuration dialog
    _root_n_412683 = tk.Tk()
    _root_n_412683.withdraw()

    _dlg_n_412683 = tk.Toplevel(_root_n_412683)
    _dlg_n_412683.title(_title_n_412683)
    _dlg_n_412683.resizable(False, False)
    _dlg_n_412683.configure(bg="#1a1a2e")
    _dlg_n_412683.grab_set()

    _style_n_412683 = ttk.Style()
    _style_n_412683.theme_use('clam')
    _style_n_412683.configure('FP.TLabel',
        background="#1a1a2e", foreground="#00d8ff",
        font=('Arial', 10, 'bold'))
    _style_n_412683.configure('FPV.TLabel',
        background="#1a1a2e", foreground="#cccccc",
        font=('Arial', 10))
    _style_n_412683.configure('FP.TEntry',
        fieldbackground="#0d1117", foreground="#ffffff",
        insertcolor="#00d8ff", font=('Arial', 10))
    _style_n_412683.configure('FP.TButton',
        background="#1a3a5c", foreground="#ffffff",
        font=('Arial', 10, 'bold'), padding=8)
    _style_n_412683.configure('FPRun.TButton',
        background="#00d8ff", foreground="#000000",
        font=('Arial', 10, 'bold'), padding=8)

    # Header
    _hdr_n_412683 = tk.Frame(_dlg_n_412683, bg="#0d1f33", pady=12)
    _hdr_n_412683.pack(fill='x')
    tk.Label(_hdr_n_412683, text="⬡  " + _title_n_412683,
        bg="#0d1f33", fg="#00d8ff",
        font=('Arial', 13, 'bold')).pack(padx=20)

    # Form frame
    _form_n_412683 = tk.Frame(_dlg_n_412683, bg="#1a1a2e", padx=20, pady=12)
    _form_n_412683.pack(fill='both', expand=True)

    _row_n_412683 = 0
    _vars_n_412683 = {}

    def _add_field_n_412683(label, key, default, browse=False):
        global _row_n_412683
        tk.Label(_form_n_412683, text=label, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_412683, column=0, sticky='w', pady=(8,2))
        _v_n_412683 = tk.StringVar(value=str(default))
        _vars_n_412683[key] = _v_n_412683
        _e_n_412683 = tk.Entry(_form_n_412683, textvariable=_v_n_412683,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=42, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344")
        _e_n_412683.grid(row=_row_n_412683+1, column=0,
            columnspan=2 if not browse else 1, sticky='ew', pady=(0,4))
        if browse:
            def _browse_n_412683(v=_v_n_412683):
                _d_n_412683 = filedialog.askdirectory()
                if _d_n_412683: v.set(_d_n_412683)
            tk.Button(_form_n_412683, text="📁", command=_browse_n_412683,
                bg="#1a3a5c", fg="#00d8ff", font=('Arial',10),
                relief='flat', padx=6).grid(row=_row_n_412683+1, column=1,
                sticky='w', padx=(4,0))
        _row_n_412683 += 2

    def _add_row2_n_412683(l1, k1, d1, l2, k2, d2):
        global _row_n_412683
        tk.Label(_form_n_412683, text=l1, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_412683, column=0, sticky='w', pady=(8,2))
        tk.Label(_form_n_412683, text=l2, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_412683, column=1, sticky='w', pady=(8,2), padx=(8,0))
        _v1_n_412683 = tk.StringVar(value=str(d1))
        _v2_n_412683 = tk.StringVar(value=str(d2))
        _vars_n_412683[k1] = _v1_n_412683
        _vars_n_412683[k2] = _v2_n_412683
        tk.Entry(_form_n_412683, textvariable=_v1_n_412683,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_412683+1, column=0, sticky='ew', pady=(0,4))
        tk.Entry(_form_n_412683, textvariable=_v2_n_412683,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_412683+1, column=1, sticky='ew',
            pady=(0,4), padx=(8,0))
        _row_n_412683 += 2

    if _show_folder_n_412683:
        _add_field_n_412683("Render / Source Folder", "folder_path",
            _cfg_n_412683.get('folder_path', ''), browse=True)
    if _show_ext_n_412683:
        _add_field_n_412683("File Extension", "extension",
            _cfg_n_412683.get('extension', '.png'))
    if _show_frames_n_412683:
        _add_row2_n_412683("Start Frame", "start_frame",
            _cfg_n_412683.get('start_frame', 1001),
            "End Frame", "end_frame",
            _cfg_n_412683.get('end_frame', 1100))
    if _show_pad_n_412683:
        _add_field_n_412683("Frame Padding (digits)", "frame_padding",
            _cfg_n_412683.get('frame_padding', 4))
    _add_field_n_412683("Filename Prefix (e.g. shot_010_comp-)", "prefix",
        _cfg_n_412683.get('prefix', ''))
    if _show_naming_n_412683:
        _add_field_n_412683("Naming Pattern  (# = digit, @ = letter)",
            "naming_pattern",
            _cfg_n_412683.get('naming_pattern', 'shot_###_v##'))
    if _show_cs_n_412683:
        _add_field_n_412683("Expected Colourspace", "colourspace",
            _cfg_n_412683.get('colourspace', 'sRGB'))

    # Save config checkbox
    _save_var_n_412683 = tk.BooleanVar(value=True)
    tk.Checkbutton(_form_n_412683,
        text="  Save these settings for next time",
        variable=_save_var_n_412683,
        bg="#1a1a2e", fg="#888888",
        selectcolor="#0d1117", activebackground="#1a1a2e",
        font=('Arial', 9)).grid(
        row=_row_n_412683, column=0, columnspan=2,
        sticky='w', pady=(12,4))
    _row_n_412683 += 1

    # Buttons
    _btn_frame_n_412683 = tk.Frame(_dlg_n_412683, bg="#0d1f33", pady=12)
    _btn_frame_n_412683.pack(fill='x')

    _result_n_412683 = {'ok': False}

    def _on_run_n_412683():
        _result_n_412683['ok'] = True
        _dlg_n_412683.destroy()

    def _on_cancel_n_412683():
        _result_n_412683['ok'] = False
        _dlg_n_412683.destroy()

    tk.Button(_btn_frame_n_412683, text="Cancel",
        command=_on_cancel_n_412683,
        bg="#333344", fg="#888888",
        font=('Arial', 10), relief='flat',
        padx=20, pady=6).pack(side='left', padx=20)

    tk.Button(_btn_frame_n_412683, text="▶  Run Tool",
        command=_on_run_n_412683,
        bg="#00d8ff", fg="#000000",
        font=('Arial', 11, 'bold'), relief='flat',
        padx=20, pady=6).pack(side='right', padx=20)

    _dlg_n_412683.update_idletasks()
    _w_n_412683 = _dlg_n_412683.winfo_reqwidth()
    _h_n_412683 = _dlg_n_412683.winfo_reqheight()
    _x_n_412683 = (_dlg_n_412683.winfo_screenwidth() - _w_n_412683) // 2
    _y_n_412683 = (_dlg_n_412683.winfo_screenheight() - _h_n_412683) // 2
    _dlg_n_412683.geometry(f"{_w_n_412683}x{_h_n_412683}+{_x_n_412683}+{_y_n_412683}")

    _root_n_412683.wait_window(_dlg_n_412683)
    _root_n_412683.destroy()

    if not _result_n_412683['ok']:
        cancelled = True
        print("FlowPins: Config dialog cancelled.")
    else:
        # Read values from form
        if 'folder_path'    in _vars_n_412683: folder_path    = _vars_n_412683['folder_path'].get()
        if 'extension'      in _vars_n_412683: extension      = _vars_n_412683['extension'].get()
        if 'start_frame'    in _vars_n_412683: start_frame    = int(_vars_n_412683['start_frame'].get() or 1001)
        if 'end_frame'      in _vars_n_412683: end_frame      = int(_vars_n_412683['end_frame'].get() or 1100)
        if 'frame_padding'  in _vars_n_412683: frame_padding  = int(_vars_n_412683['frame_padding'].get() or 4)
        if 'naming_pattern' in _vars_n_412683: naming_pattern = _vars_n_412683['naming_pattern'].get()
        if 'colourspace'    in _vars_n_412683: colourspace    = _vars_n_412683['colourspace'].get()
        if 'prefix'         in _vars_n_412683: prefix         = _vars_n_412683['prefix'].get()

        # Save config if requested
        if _save_var_n_412683.get():
            _save_data_n_412683 = {
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
                with open(_cfg_path_n_412683, 'w') as _sf_n_412683:
                    json.dump(_save_data_n_412683, _sf_n_412683, indent=2)
                print("FlowPins: Settings saved to " + _cfg_path_n_412683)
            except Exception as _se_n_412683:
                print("FlowPins: Could not save config — " + str(_se_n_412683))



from PIL import Image
import os
# Guard — stop if cancelled or no folder
if cancelled or not folder_path:
    import sys
    if cancelled: print("FlowPins: Cancelled — skipping dimension check.")
    else: print("FlowPins ERROR: No folder path provided.")
    sys.exit(0)
folder          = folder_path
expected_width  = int(1920)
expected_height = int(1080)
extension       = extension
pass_list       = []
fail_list       = []
print()
print("FlowPins Dimension Check — " + folder)
print("Expected: " + str(expected_width) + "x" + str(expected_height))
print("-" * 50)
for root, dirs, files in os.walk(folder):
    for filename in sorted(files):
        if filename.lower().endswith(extension.lower()):
            filepath = os.path.join(root, filename)
            try:
                with Image.open(filepath) as img:
                    w = img.width
                    h = img.height
                if w == expected_width and h == expected_height:
                    pass_list.append(filepath)
                    print("  PASS: " + filename + " [" + str(w) + "x" + str(h) + "]")
                else:
                    fail_list.append(filepath + " [" + str(w) + "x" + str(h) + "]")
                    print("  FAIL: " + filename + " — got " + str(w) + "x" + str(h))
            except Exception as e:
                fail_list.append(filepath + " [ERROR]")
                print("  ERROR: " + filename + " — " + str(e))
pass_count = len(pass_list)
fail_count = len(fail_list)


import os as _os_n_457973
from datetime import datetime as _dt_n_457973
_pl_n_457973   = pass_list if pass_list else []
_fl_n_457973   = fail_list if fail_list else []
_fld_n_457973  = folder_path
_save_n_457973 = "true" == "true"
_ts_n_457973   = _dt_n_457973.now().strftime("%Y-%m-%d %H:%M:%S")
_lines_n_457973 = [
    "=" * 60,
    "FLOWPINS " + "DIMENSION CHECK REPORT".upper(),
    f"Generated : {_ts_n_457973}",
    f"Folder    : {_fld_n_457973}",
    f"PASSED    : {len(_pl_n_457973)}",
    f"FAILED    : {len(_fl_n_457973)}",
    "=" * 60
]
if _fl_n_457973:
    _lines_n_457973.append("\nFAILED FILES:")
    for _f_n_457973 in _fl_n_457973: _lines_n_457973.append(f"  FAIL: {_f_n_457973}")
if _pl_n_457973:
    _lines_n_457973.append("\nPASSED FILES:")
    for _p_n_457973 in _pl_n_457973: _lines_n_457973.append(f"  PASS: {_os_n_457973.path.basename(_p_n_457973)}")
_lines_n_457973.append("=" * 60)
_report_n_457973 = "\n".join(_lines_n_457973)
print(_report_n_457973)
if _save_n_457973 and _os_n_457973.path.isdir(_fld_n_457973):
    _rname_n_457973 = f"validation_report_{_dt_n_457973.now().strftime('%Y%m%d_%H%M%S')}.txt"
    _rpath_n_457973 = _os_n_457973.path.join(_fld_n_457973, _rname_n_457973)
    with open(_rpath_n_457973, "w", encoding="utf-8") as _rf_n_457973: _rf_n_457973.write(_report_n_457973)
    print(f"Report saved: {_rpath_n_457973}")

