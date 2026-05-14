# Start Execution


# Load config or show dialog — the smart config node
# If config exists: load silently and use saved values
# If config missing or force_dialog=True: show UI, optionally save
import json, os, tkinter as tk
from tkinter import ttk, filedialog, messagebox

_cfg_path_n_767898   = "studio_config.json"
_title_n_767898      = "FlowPins — Tool Settings"
_force_n_767898      = str("false").lower() == "true"
_show_folder_n_767898   = str("true").lower() == "true"
_show_ext_n_767898      = str("true").lower() == "true"
_show_frames_n_767898   = str("true").lower() == "true"
_show_naming_n_767898   = str("true").lower() == "true"
_show_cs_n_767898       = str("true").lower() == "true"
_show_pad_n_767898      = str("true").lower() == "true"

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
_cfg_n_767898 = {}
_has_config_n_767898 = False
if os.path.isfile(_cfg_path_n_767898):
    try:
        with open(_cfg_path_n_767898, 'r') as _f_n_767898:
            _cfg_n_767898 = json.load(_f_n_767898)
        _has_config_n_767898 = True
    except:
        pass

# Use config values if loaded and not forcing dialog
# Also force dialog if folder_path is empty even with a valid config
_cfg_folder_n_767898 = _cfg_n_767898.get('folder_path', '') if _has_config_n_767898 else ''
if _has_config_n_767898 and not _force_n_767898 and _cfg_folder_n_767898:
    folder_path    = _cfg_n_767898.get('folder_path',    folder_path)
    extension      = _cfg_n_767898.get('extension',      extension)
    start_frame    = int(_cfg_n_767898.get('start_frame',    start_frame))
    end_frame      = int(_cfg_n_767898.get('end_frame',      end_frame))
    naming_pattern = _cfg_n_767898.get('naming_pattern', naming_pattern)
    colourspace    = _cfg_n_767898.get('colourspace',    colourspace)
    frame_padding  = int(_cfg_n_767898.get('frame_padding',  frame_padding))
    prefix         = _cfg_n_767898.get('prefix',         prefix)
    source_folder  = _cfg_n_767898.get('source_folder',  source_folder)
    target_folder  = _cfg_n_767898.get('target_folder',  target_folder)
    print("FlowPins: Config loaded from " + _cfg_path_n_767898)
else:
    # Show the configuration dialog
    _root_n_767898 = tk.Tk()
    _root_n_767898.withdraw()

    _dlg_n_767898 = tk.Toplevel(_root_n_767898)
    _dlg_n_767898.title(_title_n_767898)
    _dlg_n_767898.resizable(False, False)
    _dlg_n_767898.configure(bg="#1a1a2e")
    _dlg_n_767898.grab_set()

    _style_n_767898 = ttk.Style()
    _style_n_767898.theme_use('clam')
    _style_n_767898.configure('FP.TLabel',
        background="#1a1a2e", foreground="#00d8ff",
        font=('Arial', 10, 'bold'))
    _style_n_767898.configure('FPV.TLabel',
        background="#1a1a2e", foreground="#cccccc",
        font=('Arial', 10))
    _style_n_767898.configure('FP.TEntry',
        fieldbackground="#0d1117", foreground="#ffffff",
        insertcolor="#00d8ff", font=('Arial', 10))
    _style_n_767898.configure('FP.TButton',
        background="#1a3a5c", foreground="#ffffff",
        font=('Arial', 10, 'bold'), padding=8)
    _style_n_767898.configure('FPRun.TButton',
        background="#00d8ff", foreground="#000000",
        font=('Arial', 10, 'bold'), padding=8)

    # Header
    _hdr_n_767898 = tk.Frame(_dlg_n_767898, bg="#0d1f33", pady=12)
    _hdr_n_767898.pack(fill='x')
    tk.Label(_hdr_n_767898, text="⬡  " + _title_n_767898,
        bg="#0d1f33", fg="#00d8ff",
        font=('Arial', 13, 'bold')).pack(padx=20)

    # Form frame
    _form_n_767898 = tk.Frame(_dlg_n_767898, bg="#1a1a2e", padx=20, pady=12)
    _form_n_767898.pack(fill='both', expand=True)

    _row_n_767898 = 0
    _vars_n_767898 = {}

    def _add_field_n_767898(label, key, default, browse=False):
        global _row_n_767898
        tk.Label(_form_n_767898, text=label, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_767898, column=0, sticky='w', pady=(8,2))
        _v_n_767898 = tk.StringVar(value=str(default))
        _vars_n_767898[key] = _v_n_767898
        _e_n_767898 = tk.Entry(_form_n_767898, textvariable=_v_n_767898,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=42, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344")
        _e_n_767898.grid(row=_row_n_767898+1, column=0,
            columnspan=2 if not browse else 1, sticky='ew', pady=(0,4))
        if browse:
            def _browse_n_767898(v=_v_n_767898):
                _d_n_767898 = filedialog.askdirectory()
                if _d_n_767898: v.set(_d_n_767898)
            tk.Button(_form_n_767898, text="📁", command=_browse_n_767898,
                bg="#1a3a5c", fg="#00d8ff", font=('Arial',10),
                relief='flat', padx=6).grid(row=_row_n_767898+1, column=1,
                sticky='w', padx=(4,0))
        _row_n_767898 += 2

    def _add_row2_n_767898(l1, k1, d1, l2, k2, d2):
        global _row_n_767898
        tk.Label(_form_n_767898, text=l1, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_767898, column=0, sticky='w', pady=(8,2))
        tk.Label(_form_n_767898, text=l2, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_767898, column=1, sticky='w', pady=(8,2), padx=(8,0))
        _v1_n_767898 = tk.StringVar(value=str(d1))
        _v2_n_767898 = tk.StringVar(value=str(d2))
        _vars_n_767898[k1] = _v1_n_767898
        _vars_n_767898[k2] = _v2_n_767898
        tk.Entry(_form_n_767898, textvariable=_v1_n_767898,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_767898+1, column=0, sticky='ew', pady=(0,4))
        tk.Entry(_form_n_767898, textvariable=_v2_n_767898,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_767898+1, column=1, sticky='ew',
            pady=(0,4), padx=(8,0))
        _row_n_767898 += 2

    if _show_folder_n_767898:
        _add_field_n_767898("Render / Source Folder", "folder_path",
            _cfg_n_767898.get('folder_path', ''), browse=True)
    if _show_ext_n_767898:
        _add_field_n_767898("File Extension", "extension",
            _cfg_n_767898.get('extension', '.png'))
    if _show_frames_n_767898:
        _add_row2_n_767898("Start Frame", "start_frame",
            _cfg_n_767898.get('start_frame', 1001),
            "End Frame", "end_frame",
            _cfg_n_767898.get('end_frame', 1100))
    if _show_pad_n_767898:
        _add_field_n_767898("Frame Padding (digits)", "frame_padding",
            _cfg_n_767898.get('frame_padding', 4))
    _add_field_n_767898("Filename Prefix (e.g. shot_010_comp-)", "prefix",
        _cfg_n_767898.get('prefix', ''))
    _add_field_n_767898("Source Folder (for Folder Diff)", "source_folder",
        _cfg_n_767898.get('source_folder', ''), browse=True)
    _add_field_n_767898("Target Folder (for Folder Diff)", "target_folder",
        _cfg_n_767898.get('target_folder', ''), browse=True)
    if _show_naming_n_767898:
        _add_field_n_767898("Naming Pattern  (# = digit, @ = letter)",
            "naming_pattern",
            _cfg_n_767898.get('naming_pattern', 'shot_###_v##'))
    if _show_cs_n_767898:
        _add_field_n_767898("Expected Colourspace", "colourspace",
            _cfg_n_767898.get('colourspace', 'sRGB'))

    # Save config checkbox
    _save_var_n_767898 = tk.BooleanVar(value=True)
    tk.Checkbutton(_form_n_767898,
        text="  Save these settings for next time",
        variable=_save_var_n_767898,
        bg="#1a1a2e", fg="#888888",
        selectcolor="#0d1117", activebackground="#1a1a2e",
        font=('Arial', 9)).grid(
        row=_row_n_767898, column=0, columnspan=2,
        sticky='w', pady=(12,4))
    _row_n_767898 += 1

    # Buttons
    _btn_frame_n_767898 = tk.Frame(_dlg_n_767898, bg="#0d1f33", pady=12)
    _btn_frame_n_767898.pack(fill='x')

    _result_n_767898 = {'ok': False}

    def _on_run_n_767898():
        _result_n_767898['ok'] = True
        _dlg_n_767898.destroy()

    def _on_cancel_n_767898():
        _result_n_767898['ok'] = False
        _dlg_n_767898.destroy()

    tk.Button(_btn_frame_n_767898, text="Cancel",
        command=_on_cancel_n_767898,
        bg="#333344", fg="#888888",
        font=('Arial', 10), relief='flat',
        padx=20, pady=6).pack(side='left', padx=20)

    tk.Button(_btn_frame_n_767898, text="▶  Run Tool",
        command=_on_run_n_767898,
        bg="#00d8ff", fg="#000000",
        font=('Arial', 11, 'bold'), relief='flat',
        padx=20, pady=6).pack(side='right', padx=20)

    _dlg_n_767898.update_idletasks()
    _w_n_767898 = _dlg_n_767898.winfo_reqwidth()
    _h_n_767898 = _dlg_n_767898.winfo_reqheight()
    _x_n_767898 = (_dlg_n_767898.winfo_screenwidth() - _w_n_767898) // 2
    _y_n_767898 = (_dlg_n_767898.winfo_screenheight() - _h_n_767898) // 2
    _dlg_n_767898.geometry(f"{_w_n_767898}x{_h_n_767898}+{_x_n_767898}+{_y_n_767898}")

    _root_n_767898.wait_window(_dlg_n_767898)
    _root_n_767898.destroy()

    if not _result_n_767898['ok']:
        cancelled = True
        print("FlowPins: Config dialog cancelled.")
    else:
        # Read values from form
        if 'folder_path'    in _vars_n_767898: folder_path    = _vars_n_767898['folder_path'].get()
        if 'extension'      in _vars_n_767898: extension      = _vars_n_767898['extension'].get()
        if 'start_frame'    in _vars_n_767898: start_frame    = int(_vars_n_767898['start_frame'].get() or 1001)
        if 'end_frame'      in _vars_n_767898: end_frame      = int(_vars_n_767898['end_frame'].get() or 1100)
        if 'frame_padding'  in _vars_n_767898: frame_padding  = int(_vars_n_767898['frame_padding'].get() or 4)
        if 'naming_pattern' in _vars_n_767898: naming_pattern = _vars_n_767898['naming_pattern'].get()
        if 'colourspace'    in _vars_n_767898: colourspace    = _vars_n_767898['colourspace'].get()
        if 'prefix'         in _vars_n_767898: prefix         = _vars_n_767898['prefix'].get()
        if 'source_folder'  in _vars_n_767898: source_folder  = _vars_n_767898['source_folder'].get()
        if 'target_folder'  in _vars_n_767898: target_folder  = _vars_n_767898['target_folder'].get()

        # Save config if requested
        if _save_var_n_767898.get():
            _save_data_n_767898 = {
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
                with open(_cfg_path_n_767898, 'w') as _sf_n_767898:
                    json.dump(_save_data_n_767898, _sf_n_767898, indent=2)
                print("FlowPins: Settings saved to " + _cfg_path_n_767898)
            except Exception as _se_n_767898:
                print("FlowPins: Could not save config — " + str(_se_n_767898))



# Render Progress Checker
# Counts rendered frames vs expected and shows % complete
import os, re

_folder_n_739182  = folder_path
_ext_n_739182     = extension if isinstance(extension, str) and extension.startswith(".") else "extension"
_start_n_739182   = int(start_frame)
_end_n_739182     = int(end_frame)

frames_done    = 0
frames_total   = 0
percent_done   = 0
frames_missing = 0
is_complete    = False

if not _folder_n_739182 or not os.path.isdir(_folder_n_739182):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_739182))
else:
    frames_total = _end_n_739182 - _start_n_739182 + 1

    # Build expected set
    _expected_n_739182 = set(range(_start_n_739182, _end_n_739182 + 1))

    # Scan for rendered frames using regex to extract frame number
    _digit_n_739182   = chr(92) + "d"
    _pattern_n_739182 = re.compile("(" + _digit_n_739182 + "+)" + re.escape(_ext_n_739182) + "$", re.IGNORECASE)
    _found_n_739182   = set()

    for _fn_n_739182 in os.listdir(_folder_n_739182):
        _m_n_739182 = _pattern_n_739182.search(_fn_n_739182)
        if _m_n_739182:
            _fnum_n_739182 = int(_m_n_739182.group(1))
            if _start_n_739182 <= _fnum_n_739182 <= _end_n_739182:
                _found_n_739182.add(_fnum_n_739182)

    _missing_n_739182 = sorted(_expected_n_739182 - _found_n_739182)

    frames_done    = len(_found_n_739182)
    frames_missing = len(_missing_n_739182)
    percent_done   = round((frames_done / frames_total) * 100) if frames_total > 0 else 0
    is_complete    = frames_missing == 0

    # Progress bar
    _bar_fill_n_739182  = int(percent_done / 5)
    _bar_n_739182       = "█" * _bar_fill_n_739182 + "░" * (20 - _bar_fill_n_739182)

    print("FlowPins Render Progress Checker")
    print("  Folder  : " + _folder_n_739182)
    print("  Range   : " + str(_start_n_739182) + " — " + str(_end_n_739182))
    print("  Expected: " + str(frames_total) + " frames")
    print("-" * 55)
    print("  [" + _bar_n_739182 + "] " + str(percent_done) + "%")
    print("  Done    : " + str(frames_done) + " / " + str(frames_total) + " frames")
    print("  Missing : " + str(frames_missing) + " frames")
    print("-" * 55)

    if is_complete:
        print("  ✓ RENDER COMPLETE — all " + str(frames_total) + " frames present")
    else:
        print("  ⟳ IN PROGRESS — " + str(frames_missing) + " frames remaining")
        # Group consecutive missing frames
        if _missing_n_739182:
            _groups_n_739182 = []
            _gs_n_739182 = _missing_n_739182[0]
            _gp_n_739182 = _missing_n_739182[0]
            for _mf_n_739182 in _missing_n_739182[1:]:
                if _mf_n_739182 != _gp_n_739182 + 1:
                    _groups_n_739182.append((_gs_n_739182, _gp_n_739182))
                    _gs_n_739182 = _mf_n_739182
                _gp_n_739182 = _mf_n_739182
            _groups_n_739182.append((_gs_n_739182, _gp_n_739182))
            for _ga_n_739182, _gb_n_739182 in _groups_n_739182:
                if _ga_n_739182 == _gb_n_739182:
                    print("    Still needed: " + str(_ga_n_739182).zfill(4))
                else:
                    print("    Still needed: " + str(_ga_n_739182).zfill(4) + " — " + str(_gb_n_739182).zfill(4) + " (" + str(_gb_n_739182 - _ga_n_739182 + 1) + " frames)")


