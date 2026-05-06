# Start Execution


# Load config or show dialog — the smart config node
# If config exists: load silently and use saved values
# If config missing or force_dialog=True: show UI, optionally save
import json, os, tkinter as tk
from tkinter import ttk, filedialog, messagebox

_cfg_path_n_218956   = "studio_config.json"
_title_n_218956      = "FlowPins — Tool Settings"
_force_n_218956      = str("false").lower() == "true"
_show_folder_n_218956   = str("true").lower() == "true"
_show_ext_n_218956      = str("true").lower() == "true"
_show_frames_n_218956   = str("true").lower() == "true"
_show_naming_n_218956   = str("true").lower() == "true"
_show_cs_n_218956       = str("true").lower() == "true"
_show_pad_n_218956      = str("true").lower() == "true"

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
_cfg_n_218956 = {}
_has_config_n_218956 = False
if os.path.isfile(_cfg_path_n_218956):
    try:
        with open(_cfg_path_n_218956, 'r') as _f_n_218956:
            _cfg_n_218956 = json.load(_f_n_218956)
        _has_config_n_218956 = True
    except:
        pass

# Use config values if loaded and not forcing dialog
# Also force dialog if folder_path is empty even with a valid config
_cfg_folder_n_218956 = _cfg_n_218956.get('folder_path', '') if _has_config_n_218956 else ''
if _has_config_n_218956 and not _force_n_218956 and _cfg_folder_n_218956:
    folder_path    = _cfg_n_218956.get('folder_path',    folder_path)
    extension      = _cfg_n_218956.get('extension',      extension)
    start_frame    = int(_cfg_n_218956.get('start_frame',    start_frame))
    end_frame      = int(_cfg_n_218956.get('end_frame',      end_frame))
    naming_pattern = _cfg_n_218956.get('naming_pattern', naming_pattern)
    colourspace    = _cfg_n_218956.get('colourspace',    colourspace)
    frame_padding  = int(_cfg_n_218956.get('frame_padding',  frame_padding))
    prefix         = _cfg_n_218956.get('prefix',         prefix)
    source_folder  = _cfg_n_218956.get('source_folder',  source_folder)
    target_folder  = _cfg_n_218956.get('target_folder',  target_folder)
    print("FlowPins: Config loaded from " + _cfg_path_n_218956)
else:
    # Show the configuration dialog
    _root_n_218956 = tk.Tk()
    _root_n_218956.withdraw()

    _dlg_n_218956 = tk.Toplevel(_root_n_218956)
    _dlg_n_218956.title(_title_n_218956)
    _dlg_n_218956.resizable(False, False)
    _dlg_n_218956.configure(bg="#1a1a2e")
    _dlg_n_218956.grab_set()

    _style_n_218956 = ttk.Style()
    _style_n_218956.theme_use('clam')
    _style_n_218956.configure('FP.TLabel',
        background="#1a1a2e", foreground="#00d8ff",
        font=('Arial', 10, 'bold'))
    _style_n_218956.configure('FPV.TLabel',
        background="#1a1a2e", foreground="#cccccc",
        font=('Arial', 10))
    _style_n_218956.configure('FP.TEntry',
        fieldbackground="#0d1117", foreground="#ffffff",
        insertcolor="#00d8ff", font=('Arial', 10))
    _style_n_218956.configure('FP.TButton',
        background="#1a3a5c", foreground="#ffffff",
        font=('Arial', 10, 'bold'), padding=8)
    _style_n_218956.configure('FPRun.TButton',
        background="#00d8ff", foreground="#000000",
        font=('Arial', 10, 'bold'), padding=8)

    # Header
    _hdr_n_218956 = tk.Frame(_dlg_n_218956, bg="#0d1f33", pady=12)
    _hdr_n_218956.pack(fill='x')
    tk.Label(_hdr_n_218956, text="⬡  " + _title_n_218956,
        bg="#0d1f33", fg="#00d8ff",
        font=('Arial', 13, 'bold')).pack(padx=20)

    # Form frame
    _form_n_218956 = tk.Frame(_dlg_n_218956, bg="#1a1a2e", padx=20, pady=12)
    _form_n_218956.pack(fill='both', expand=True)

    _row_n_218956 = 0
    _vars_n_218956 = {}

    def _add_field_n_218956(label, key, default, browse=False):
        global _row_n_218956
        tk.Label(_form_n_218956, text=label, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_218956, column=0, sticky='w', pady=(8,2))
        _v_n_218956 = tk.StringVar(value=str(default))
        _vars_n_218956[key] = _v_n_218956
        _e_n_218956 = tk.Entry(_form_n_218956, textvariable=_v_n_218956,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=42, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344")
        _e_n_218956.grid(row=_row_n_218956+1, column=0,
            columnspan=2 if not browse else 1, sticky='ew', pady=(0,4))
        if browse:
            def _browse_n_218956(v=_v_n_218956):
                _d_n_218956 = filedialog.askdirectory()
                if _d_n_218956: v.set(_d_n_218956)
            tk.Button(_form_n_218956, text="📁", command=_browse_n_218956,
                bg="#1a3a5c", fg="#00d8ff", font=('Arial',10),
                relief='flat', padx=6).grid(row=_row_n_218956+1, column=1,
                sticky='w', padx=(4,0))
        _row_n_218956 += 2

    def _add_row2_n_218956(l1, k1, d1, l2, k2, d2):
        global _row_n_218956
        tk.Label(_form_n_218956, text=l1, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_218956, column=0, sticky='w', pady=(8,2))
        tk.Label(_form_n_218956, text=l2, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_218956, column=1, sticky='w', pady=(8,2), padx=(8,0))
        _v1_n_218956 = tk.StringVar(value=str(d1))
        _v2_n_218956 = tk.StringVar(value=str(d2))
        _vars_n_218956[k1] = _v1_n_218956
        _vars_n_218956[k2] = _v2_n_218956
        tk.Entry(_form_n_218956, textvariable=_v1_n_218956,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_218956+1, column=0, sticky='ew', pady=(0,4))
        tk.Entry(_form_n_218956, textvariable=_v2_n_218956,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_218956+1, column=1, sticky='ew',
            pady=(0,4), padx=(8,0))
        _row_n_218956 += 2

    if _show_folder_n_218956:
        _add_field_n_218956("Render / Source Folder", "folder_path",
            _cfg_n_218956.get('folder_path', ''), browse=True)
    if _show_ext_n_218956:
        _add_field_n_218956("File Extension", "extension",
            _cfg_n_218956.get('extension', '.png'))
    if _show_frames_n_218956:
        _add_row2_n_218956("Start Frame", "start_frame",
            _cfg_n_218956.get('start_frame', 1001),
            "End Frame", "end_frame",
            _cfg_n_218956.get('end_frame', 1100))
    if _show_pad_n_218956:
        _add_field_n_218956("Frame Padding (digits)", "frame_padding",
            _cfg_n_218956.get('frame_padding', 4))
    _add_field_n_218956("Filename Prefix (e.g. shot_010_comp-)", "prefix",
        _cfg_n_218956.get('prefix', ''))
    _add_field_n_218956("Source Folder (for Folder Diff)", "source_folder",
        _cfg_n_218956.get('source_folder', ''), browse=True)
    _add_field_n_218956("Target Folder (for Folder Diff)", "target_folder",
        _cfg_n_218956.get('target_folder', ''), browse=True)
    if _show_naming_n_218956:
        _add_field_n_218956("Naming Pattern  (# = digit, @ = letter)",
            "naming_pattern",
            _cfg_n_218956.get('naming_pattern', 'shot_###_v##'))
    if _show_cs_n_218956:
        _add_field_n_218956("Expected Colourspace", "colourspace",
            _cfg_n_218956.get('colourspace', 'sRGB'))

    # Save config checkbox
    _save_var_n_218956 = tk.BooleanVar(value=True)
    tk.Checkbutton(_form_n_218956,
        text="  Save these settings for next time",
        variable=_save_var_n_218956,
        bg="#1a1a2e", fg="#888888",
        selectcolor="#0d1117", activebackground="#1a1a2e",
        font=('Arial', 9)).grid(
        row=_row_n_218956, column=0, columnspan=2,
        sticky='w', pady=(12,4))
    _row_n_218956 += 1

    # Buttons
    _btn_frame_n_218956 = tk.Frame(_dlg_n_218956, bg="#0d1f33", pady=12)
    _btn_frame_n_218956.pack(fill='x')

    _result_n_218956 = {'ok': False}

    def _on_run_n_218956():
        _result_n_218956['ok'] = True
        _dlg_n_218956.destroy()

    def _on_cancel_n_218956():
        _result_n_218956['ok'] = False
        _dlg_n_218956.destroy()

    tk.Button(_btn_frame_n_218956, text="Cancel",
        command=_on_cancel_n_218956,
        bg="#333344", fg="#888888",
        font=('Arial', 10), relief='flat',
        padx=20, pady=6).pack(side='left', padx=20)

    tk.Button(_btn_frame_n_218956, text="▶  Run Tool",
        command=_on_run_n_218956,
        bg="#00d8ff", fg="#000000",
        font=('Arial', 11, 'bold'), relief='flat',
        padx=20, pady=6).pack(side='right', padx=20)

    _dlg_n_218956.update_idletasks()
    _w_n_218956 = _dlg_n_218956.winfo_reqwidth()
    _h_n_218956 = _dlg_n_218956.winfo_reqheight()
    _x_n_218956 = (_dlg_n_218956.winfo_screenwidth() - _w_n_218956) // 2
    _y_n_218956 = (_dlg_n_218956.winfo_screenheight() - _h_n_218956) // 2
    _dlg_n_218956.geometry(f"{_w_n_218956}x{_h_n_218956}+{_x_n_218956}+{_y_n_218956}")

    _root_n_218956.wait_window(_dlg_n_218956)
    _root_n_218956.destroy()

    if not _result_n_218956['ok']:
        cancelled = True
        print("FlowPins: Config dialog cancelled.")
    else:
        # Read values from form
        if 'folder_path'    in _vars_n_218956: folder_path    = _vars_n_218956['folder_path'].get()
        if 'extension'      in _vars_n_218956: extension      = _vars_n_218956['extension'].get()
        if 'start_frame'    in _vars_n_218956: start_frame    = int(_vars_n_218956['start_frame'].get() or 1001)
        if 'end_frame'      in _vars_n_218956: end_frame      = int(_vars_n_218956['end_frame'].get() or 1100)
        if 'frame_padding'  in _vars_n_218956: frame_padding  = int(_vars_n_218956['frame_padding'].get() or 4)
        if 'naming_pattern' in _vars_n_218956: naming_pattern = _vars_n_218956['naming_pattern'].get()
        if 'colourspace'    in _vars_n_218956: colourspace    = _vars_n_218956['colourspace'].get()
        if 'prefix'         in _vars_n_218956: prefix         = _vars_n_218956['prefix'].get()
        if 'source_folder'  in _vars_n_218956: source_folder  = _vars_n_218956['source_folder'].get()
        if 'target_folder'  in _vars_n_218956: target_folder  = _vars_n_218956['target_folder'].get()

        # Save config if requested
        if _save_var_n_218956.get():
            _save_data_n_218956 = {
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
                with open(_cfg_path_n_218956, 'w') as _sf_n_218956:
                    json.dump(_save_data_n_218956, _sf_n_218956, indent=2)
                print("FlowPins: Settings saved to " + _cfg_path_n_218956)
            except Exception as _se_n_218956:
                print("FlowPins: Could not save config — " + str(_se_n_218956))



# Folder Diff
# Compares two folders — what's missing, extra, or matched
import os

_src_n_240842     = source_folder
_tgt_n_240842     = target_folder
_ext_n_240842     = extension
_show_n_240842    = str("false").lower() == "true"

missing_files = []
extra_files   = []
matched_count = 0
missing_count = 0
extra_count   = 0
is_match      = False

if not os.path.isdir(_src_n_240842):
    print("FlowPins ERROR: Source folder not found — " + str(_src_n_240842))
elif not os.path.isdir(_tgt_n_240842):
    print("FlowPins ERROR: Target folder not found — " + str(_tgt_n_240842))
else:
    # Get file sets for both folders
    def _get_files_n_240842(folder):
        return set(
            f for f in os.listdir(folder)
            if f.lower().endswith(_ext_n_240842.lower())
        )

    _src_files_n_240842 = _get_files_n_240842(_src_n_240842)
    _tgt_files_n_240842 = _get_files_n_240842(_tgt_n_240842)

    _matched_n_240842  = _src_files_n_240842 & _tgt_files_n_240842
    _missing_n_240842  = _src_files_n_240842 - _tgt_files_n_240842
    _extra_n_240842    = _tgt_files_n_240842 - _src_files_n_240842

    missing_files = sorted(_missing_n_240842)
    extra_files   = sorted(_extra_n_240842)
    matched_count = len(_matched_n_240842)
    missing_count = len(missing_files)
    extra_count   = len(extra_files)
    is_match      = missing_count == 0 and extra_count == 0

    print("FlowPins Folder Diff")
    print("  Source : " + _src_n_240842)
    print("  Target : " + _tgt_n_240842)
    print("  Extension: " + _ext_n_240842)
    print("-" * 55)
    print("  Source files : " + str(len(_src_files_n_240842)))
    print("  Target files : " + str(len(_tgt_files_n_240842)))
    print("  Matched      : " + str(matched_count))
    print("-" * 55)

    if _show_n_240842 and _matched_n_240842:
        print("MATCHED (" + str(matched_count) + "):")
        for _f_n_240842 in sorted(_matched_n_240842):
            print("  ✓ " + _f_n_240842)

    if missing_files:
        print("MISSING FROM TARGET (" + str(missing_count) + "):")
        for _f_n_240842 in missing_files:
            print("  ✗ " + _f_n_240842)
    else:
        print("MISSING: none")

    if extra_files:
        print("EXTRA IN TARGET (" + str(extra_count) + "):")
        for _f_n_240842 in extra_files:
            print("  + " + _f_n_240842)
    else:
        print("EXTRA: none")

    print("-" * 55)
    if is_match:
        print("RESULT: ✓ FOLDERS MATCH — " + str(matched_count) + " files identical")
    else:
        _issues_n_240842 = []
        if missing_count: _issues_n_240842.append(str(missing_count) + " missing")
        if extra_count:   _issues_n_240842.append(str(extra_count) + " extra")
        print("RESULT: ✗ MISMATCH — " + ", ".join(_issues_n_240842))


