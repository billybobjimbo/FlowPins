# Start Execution


# Load config or show dialog — the smart config node
# If config exists: load silently and use saved values
# If config missing or force_dialog=True: show UI, optionally save
import json, os, tkinter as tk
from tkinter import ttk, filedialog, messagebox

_cfg_path_n_964822   = "studio_config.json"
_title_n_964822      = "FlowPins — Tool Settings"
_force_n_964822      = str("false").lower() == "true"
_show_folder_n_964822   = str("true").lower() == "true"
_show_ext_n_964822      = str("true").lower() == "true"
_show_frames_n_964822   = str("true").lower() == "true"
_show_naming_n_964822   = str("true").lower() == "true"
_show_cs_n_964822       = str("true").lower() == "true"
_show_pad_n_964822      = str("true").lower() == "true"

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
_cfg_n_964822 = {}
_has_config_n_964822 = False
if os.path.isfile(_cfg_path_n_964822):
    try:
        with open(_cfg_path_n_964822, 'r') as _f_n_964822:
            _cfg_n_964822 = json.load(_f_n_964822)
        _has_config_n_964822 = True
    except:
        pass

# Use config values if loaded and not forcing dialog
# Also force dialog if folder_path is empty even with a valid config
_cfg_folder_n_964822 = _cfg_n_964822.get('folder_path', '') if _has_config_n_964822 else ''
if _has_config_n_964822 and not _force_n_964822 and _cfg_folder_n_964822:
    folder_path    = _cfg_n_964822.get('folder_path',    folder_path)
    extension      = _cfg_n_964822.get('extension',      extension)
    start_frame    = int(_cfg_n_964822.get('start_frame',    start_frame))
    end_frame      = int(_cfg_n_964822.get('end_frame',      end_frame))
    naming_pattern = _cfg_n_964822.get('naming_pattern', naming_pattern)
    colourspace    = _cfg_n_964822.get('colourspace',    colourspace)
    frame_padding  = int(_cfg_n_964822.get('frame_padding',  frame_padding))
    prefix         = _cfg_n_964822.get('prefix',         prefix)
    print("FlowPins: Config loaded from " + _cfg_path_n_964822)
else:
    # Show the configuration dialog
    _root_n_964822 = tk.Tk()
    _root_n_964822.withdraw()

    _dlg_n_964822 = tk.Toplevel(_root_n_964822)
    _dlg_n_964822.title(_title_n_964822)
    _dlg_n_964822.resizable(False, False)
    _dlg_n_964822.configure(bg="#1a1a2e")
    _dlg_n_964822.grab_set()

    _style_n_964822 = ttk.Style()
    _style_n_964822.theme_use('clam')
    _style_n_964822.configure('FP.TLabel',
        background="#1a1a2e", foreground="#00d8ff",
        font=('Arial', 10, 'bold'))
    _style_n_964822.configure('FPV.TLabel',
        background="#1a1a2e", foreground="#cccccc",
        font=('Arial', 10))
    _style_n_964822.configure('FP.TEntry',
        fieldbackground="#0d1117", foreground="#ffffff",
        insertcolor="#00d8ff", font=('Arial', 10))
    _style_n_964822.configure('FP.TButton',
        background="#1a3a5c", foreground="#ffffff",
        font=('Arial', 10, 'bold'), padding=8)
    _style_n_964822.configure('FPRun.TButton',
        background="#00d8ff", foreground="#000000",
        font=('Arial', 10, 'bold'), padding=8)

    # Header
    _hdr_n_964822 = tk.Frame(_dlg_n_964822, bg="#0d1f33", pady=12)
    _hdr_n_964822.pack(fill='x')
    tk.Label(_hdr_n_964822, text="⬡  " + _title_n_964822,
        bg="#0d1f33", fg="#00d8ff",
        font=('Arial', 13, 'bold')).pack(padx=20)

    # Form frame
    _form_n_964822 = tk.Frame(_dlg_n_964822, bg="#1a1a2e", padx=20, pady=12)
    _form_n_964822.pack(fill='both', expand=True)

    _row_n_964822 = 0
    _vars_n_964822 = {}

    def _add_field_n_964822(label, key, default, browse=False):
        global _row_n_964822
        tk.Label(_form_n_964822, text=label, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_964822, column=0, sticky='w', pady=(8,2))
        _v_n_964822 = tk.StringVar(value=str(default))
        _vars_n_964822[key] = _v_n_964822
        _e_n_964822 = tk.Entry(_form_n_964822, textvariable=_v_n_964822,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=42, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344")
        _e_n_964822.grid(row=_row_n_964822+1, column=0,
            columnspan=2 if not browse else 1, sticky='ew', pady=(0,4))
        if browse:
            def _browse_n_964822(v=_v_n_964822):
                _d_n_964822 = filedialog.askdirectory()
                if _d_n_964822: v.set(_d_n_964822)
            tk.Button(_form_n_964822, text="📁", command=_browse_n_964822,
                bg="#1a3a5c", fg="#00d8ff", font=('Arial',10),
                relief='flat', padx=6).grid(row=_row_n_964822+1, column=1,
                sticky='w', padx=(4,0))
        _row_n_964822 += 2

    def _add_row2_n_964822(l1, k1, d1, l2, k2, d2):
        global _row_n_964822
        tk.Label(_form_n_964822, text=l1, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_964822, column=0, sticky='w', pady=(8,2))
        tk.Label(_form_n_964822, text=l2, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_964822, column=1, sticky='w', pady=(8,2), padx=(8,0))
        _v1_n_964822 = tk.StringVar(value=str(d1))
        _v2_n_964822 = tk.StringVar(value=str(d2))
        _vars_n_964822[k1] = _v1_n_964822
        _vars_n_964822[k2] = _v2_n_964822
        tk.Entry(_form_n_964822, textvariable=_v1_n_964822,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_964822+1, column=0, sticky='ew', pady=(0,4))
        tk.Entry(_form_n_964822, textvariable=_v2_n_964822,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_964822+1, column=1, sticky='ew',
            pady=(0,4), padx=(8,0))
        _row_n_964822 += 2

    if _show_folder_n_964822:
        _add_field_n_964822("Render / Source Folder", "folder_path",
            _cfg_n_964822.get('folder_path', ''), browse=True)
    if _show_ext_n_964822:
        _add_field_n_964822("File Extension", "extension",
            _cfg_n_964822.get('extension', '.png'))
    if _show_frames_n_964822:
        _add_row2_n_964822("Start Frame", "start_frame",
            _cfg_n_964822.get('start_frame', 1001),
            "End Frame", "end_frame",
            _cfg_n_964822.get('end_frame', 1100))
    if _show_pad_n_964822:
        _add_field_n_964822("Frame Padding (digits)", "frame_padding",
            _cfg_n_964822.get('frame_padding', 4))
    _add_field_n_964822("Filename Prefix (e.g. shot_010_comp-)", "prefix",
        _cfg_n_964822.get('prefix', ''))
    if _show_naming_n_964822:
        _add_field_n_964822("Naming Pattern  (# = digit, @ = letter)",
            "naming_pattern",
            _cfg_n_964822.get('naming_pattern', 'shot_###_v##'))
    if _show_cs_n_964822:
        _add_field_n_964822("Expected Colourspace", "colourspace",
            _cfg_n_964822.get('colourspace', 'sRGB'))

    # Save config checkbox
    _save_var_n_964822 = tk.BooleanVar(value=True)
    tk.Checkbutton(_form_n_964822,
        text="  Save these settings for next time",
        variable=_save_var_n_964822,
        bg="#1a1a2e", fg="#888888",
        selectcolor="#0d1117", activebackground="#1a1a2e",
        font=('Arial', 9)).grid(
        row=_row_n_964822, column=0, columnspan=2,
        sticky='w', pady=(12,4))
    _row_n_964822 += 1

    # Buttons
    _btn_frame_n_964822 = tk.Frame(_dlg_n_964822, bg="#0d1f33", pady=12)
    _btn_frame_n_964822.pack(fill='x')

    _result_n_964822 = {'ok': False}

    def _on_run_n_964822():
        _result_n_964822['ok'] = True
        _dlg_n_964822.destroy()

    def _on_cancel_n_964822():
        _result_n_964822['ok'] = False
        _dlg_n_964822.destroy()

    tk.Button(_btn_frame_n_964822, text="Cancel",
        command=_on_cancel_n_964822,
        bg="#333344", fg="#888888",
        font=('Arial', 10), relief='flat',
        padx=20, pady=6).pack(side='left', padx=20)

    tk.Button(_btn_frame_n_964822, text="▶  Run Tool",
        command=_on_run_n_964822,
        bg="#00d8ff", fg="#000000",
        font=('Arial', 11, 'bold'), relief='flat',
        padx=20, pady=6).pack(side='right', padx=20)

    _dlg_n_964822.update_idletasks()
    _w_n_964822 = _dlg_n_964822.winfo_reqwidth()
    _h_n_964822 = _dlg_n_964822.winfo_reqheight()
    _x_n_964822 = (_dlg_n_964822.winfo_screenwidth() - _w_n_964822) // 2
    _y_n_964822 = (_dlg_n_964822.winfo_screenheight() - _h_n_964822) // 2
    _dlg_n_964822.geometry(f"{_w_n_964822}x{_h_n_964822}+{_x_n_964822}+{_y_n_964822}")

    _root_n_964822.wait_window(_dlg_n_964822)
    _root_n_964822.destroy()

    if not _result_n_964822['ok']:
        cancelled = True
        print("FlowPins: Config dialog cancelled.")
    else:
        # Read values from form
        if 'folder_path'    in _vars_n_964822: folder_path    = _vars_n_964822['folder_path'].get()
        if 'extension'      in _vars_n_964822: extension      = _vars_n_964822['extension'].get()
        if 'start_frame'    in _vars_n_964822: start_frame    = int(_vars_n_964822['start_frame'].get() or 1001)
        if 'end_frame'      in _vars_n_964822: end_frame      = int(_vars_n_964822['end_frame'].get() or 1100)
        if 'frame_padding'  in _vars_n_964822: frame_padding  = int(_vars_n_964822['frame_padding'].get() or 4)
        if 'naming_pattern' in _vars_n_964822: naming_pattern = _vars_n_964822['naming_pattern'].get()
        if 'colourspace'    in _vars_n_964822: colourspace    = _vars_n_964822['colourspace'].get()
        if 'prefix'         in _vars_n_964822: prefix         = _vars_n_964822['prefix'].get()

        # Save config if requested
        if _save_var_n_964822.get():
            _save_data_n_964822 = {
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
                with open(_cfg_path_n_964822, 'w') as _sf_n_964822:
                    json.dump(_save_data_n_964822, _sf_n_964822, indent=2)
                print("FlowPins: Settings saved to " + _cfg_path_n_964822)
            except Exception as _se_n_964822:
                print("FlowPins: Could not save config — " + str(_se_n_964822))



# Missing Frame Finder
# Scans a folder and auto-detects gaps in the frame sequence
# No expected range needed — figures it out from what's there
import os, re

_folder_n_967957  = folder_path
_ext_n_967957     = extension
_pad_n_967957     = int(4)

missing_frames = []
found_count    = 0
missing_count  = 0
first_frame    = 0
last_frame     = 0
is_complete    = True

if not _folder_n_967957 or not os.path.isdir(_folder_n_967957):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_967957))
else:
    # Scan folder and extract frame numbers from filenames
    _frames_n_967957 = []
    _digit_n_967957 = chr(92) + "d"
    _pattern_n_967957 = re.compile("(" + _digit_n_967957 + "+)" + re.escape(_ext_n_967957) + "$", re.IGNORECASE)

    for _fn_n_967957 in os.listdir(_folder_n_967957):
        _m_n_967957 = _pattern_n_967957.search(_fn_n_967957)
        if _m_n_967957:
            _frames_n_967957.append(int(_m_n_967957.group(1)))

    if not _frames_n_967957:
        print("FlowPins: No " + _ext_n_967957 + " files found in " + _folder_n_967957)
    else:
        _frames_n_967957.sort()
        first_frame  = _frames_n_967957[0]
        last_frame   = _frames_n_967957[-1]
        found_count  = len(_frames_n_967957)
        _frame_set_n_967957 = set(_frames_n_967957)

        # Find every gap between first and last
        for _f_n_967957 in range(first_frame, last_frame + 1):
            if _f_n_967957 not in _frame_set_n_967957:
                missing_frames.append(_f_n_967957)

        missing_count = len(missing_frames)
        is_complete   = missing_count == 0

        print("FlowPins Missing Frame Finder")
        print("  Folder : " + _folder_n_967957)
        print("  Range  : " + str(first_frame) + " — " + str(last_frame))
        print("  Found  : " + str(found_count) + " frames")
        print("  Expected: " + str(last_frame - first_frame + 1) + " frames")
        print("-" * 50)

        if is_complete:
            print("  ✓ PASS — sequence is complete, no gaps found")
        else:
            print("  ✗ FAIL — " + str(missing_count) + " frames missing:")
            # Group consecutive missing frames for cleaner output
            _groups_n_967957 = []
            _start_n_967957  = missing_frames[0]
            _prev_n_967957   = missing_frames[0]
            for _mf_n_967957 in missing_frames[1:]:
                if _mf_n_967957 != _prev_n_967957 + 1:
                    _groups_n_967957.append((_start_n_967957, _prev_n_967957))
                    _start_n_967957 = _mf_n_967957
                _prev_n_967957 = _mf_n_967957
            _groups_n_967957.append((_start_n_967957, _prev_n_967957))

            for _gs_n_967957, _ge_n_967957 in _groups_n_967957:
                if _gs_n_967957 == _ge_n_967957:
                    print("    Missing: " + str(_gs_n_967957).zfill(_pad_n_967957))
                else:
                    print("    Missing: " + str(_gs_n_967957).zfill(_pad_n_967957) +
                          " — " + str(_ge_n_967957).zfill(_pad_n_967957) +
                          " (" + str(_ge_n_967957 - _gs_n_967957 + 1) + " frames)")


