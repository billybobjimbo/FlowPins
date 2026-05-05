# Start Execution


# Load config or show dialog — the smart config node
# If config exists: load silently and use saved values
# If config missing or force_dialog=True: show UI, optionally save
import json, os, tkinter as tk
from tkinter import ttk, filedialog, messagebox

_cfg_path_n_116100   = "studio_config.json"
_title_n_116100      = "FlowPins — Tool Settings"
_force_n_116100      = str("false").lower() == "true"
_show_folder_n_116100   = str("true").lower() == "true"
_show_ext_n_116100      = str("true").lower() == "true"
_show_frames_n_116100   = str("true").lower() == "true"
_show_naming_n_116100   = str("true").lower() == "true"
_show_cs_n_116100       = str("true").lower() == "true"
_show_pad_n_116100      = str("true").lower() == "true"

# Default values
folder_path    = ""
extension      = ".png"
start_frame    = 1001
end_frame      = 1100
naming_pattern = "shot_###_v##"
colourspace    = "sRGB"
frame_padding  = 4
prefix         = ""
cancelled      = False

# Try loading existing config
_cfg_n_116100 = {}
_has_config_n_116100 = False
if os.path.isfile(_cfg_path_n_116100):
    try:
        with open(_cfg_path_n_116100, 'r') as _f_n_116100:
            _cfg_n_116100 = json.load(_f_n_116100)
        _has_config_n_116100 = True
    except:
        pass

# Use config values if loaded and not forcing dialog
if _has_config_n_116100 and not _force_n_116100:
    folder_path    = _cfg_n_116100.get('folder_path',    folder_path)
    extension      = _cfg_n_116100.get('extension',      extension)
    start_frame    = int(_cfg_n_116100.get('start_frame',    start_frame))
    end_frame      = int(_cfg_n_116100.get('end_frame',      end_frame))
    naming_pattern = _cfg_n_116100.get('naming_pattern', naming_pattern)
    colourspace    = _cfg_n_116100.get('colourspace',    colourspace)
    frame_padding  = int(_cfg_n_116100.get('frame_padding',  frame_padding))
    prefix         = _cfg_n_116100.get('prefix',         prefix)
    print("FlowPins: Config loaded from " + _cfg_path_n_116100)
else:
    # Show the configuration dialog
    _root_n_116100 = tk.Tk()
    _root_n_116100.withdraw()

    _dlg_n_116100 = tk.Toplevel(_root_n_116100)
    _dlg_n_116100.title(_title_n_116100)
    _dlg_n_116100.resizable(False, False)
    _dlg_n_116100.configure(bg="#1a1a2e")
    _dlg_n_116100.grab_set()

    _style_n_116100 = ttk.Style()
    _style_n_116100.theme_use('clam')
    _style_n_116100.configure('FP.TLabel',
        background="#1a1a2e", foreground="#00d8ff",
        font=('Arial', 10, 'bold'))
    _style_n_116100.configure('FPV.TLabel',
        background="#1a1a2e", foreground="#cccccc",
        font=('Arial', 10))
    _style_n_116100.configure('FP.TEntry',
        fieldbackground="#0d1117", foreground="#ffffff",
        insertcolor="#00d8ff", font=('Arial', 10))
    _style_n_116100.configure('FP.TButton',
        background="#1a3a5c", foreground="#ffffff",
        font=('Arial', 10, 'bold'), padding=8)
    _style_n_116100.configure('FPRun.TButton',
        background="#00d8ff", foreground="#000000",
        font=('Arial', 10, 'bold'), padding=8)

    # Header
    _hdr_n_116100 = tk.Frame(_dlg_n_116100, bg="#0d1f33", pady=12)
    _hdr_n_116100.pack(fill='x')
    tk.Label(_hdr_n_116100, text="⬡  " + _title_n_116100,
        bg="#0d1f33", fg="#00d8ff",
        font=('Arial', 13, 'bold')).pack(padx=20)

    # Form frame
    _form_n_116100 = tk.Frame(_dlg_n_116100, bg="#1a1a2e", padx=20, pady=12)
    _form_n_116100.pack(fill='both', expand=True)

    _row_n_116100 = 0
    _vars_n_116100 = {}

    def _add_field_n_116100(label, key, default, browse=False):
        global _row_n_116100
        tk.Label(_form_n_116100, text=label, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_116100, column=0, sticky='w', pady=(8,2))
        _v_n_116100 = tk.StringVar(value=str(default))
        _vars_n_116100[key] = _v_n_116100
        _e_n_116100 = tk.Entry(_form_n_116100, textvariable=_v_n_116100,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=42, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344")
        _e_n_116100.grid(row=_row_n_116100+1, column=0,
            columnspan=2 if not browse else 1, sticky='ew', pady=(0,4))
        if browse:
            def _browse_n_116100(v=_v_n_116100):
                _d_n_116100 = filedialog.askdirectory()
                if _d_n_116100: v.set(_d_n_116100)
            tk.Button(_form_n_116100, text="📁", command=_browse_n_116100,
                bg="#1a3a5c", fg="#00d8ff", font=('Arial',10),
                relief='flat', padx=6).grid(row=_row_n_116100+1, column=1,
                sticky='w', padx=(4,0))
        _row_n_116100 += 2

    def _add_row2_n_116100(l1, k1, d1, l2, k2, d2):
        global _row_n_116100
        tk.Label(_form_n_116100, text=l1, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_116100, column=0, sticky='w', pady=(8,2))
        tk.Label(_form_n_116100, text=l2, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_116100, column=1, sticky='w', pady=(8,2), padx=(8,0))
        _v1_n_116100 = tk.StringVar(value=str(d1))
        _v2_n_116100 = tk.StringVar(value=str(d2))
        _vars_n_116100[k1] = _v1_n_116100
        _vars_n_116100[k2] = _v2_n_116100
        tk.Entry(_form_n_116100, textvariable=_v1_n_116100,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_116100+1, column=0, sticky='ew', pady=(0,4))
        tk.Entry(_form_n_116100, textvariable=_v2_n_116100,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_116100+1, column=1, sticky='ew',
            pady=(0,4), padx=(8,0))
        _row_n_116100 += 2

    if _show_folder_n_116100:
        _add_field_n_116100("Render / Source Folder", "folder_path",
            _cfg_n_116100.get('folder_path', ''), browse=True)
    if _show_ext_n_116100:
        _add_field_n_116100("File Extension", "extension",
            _cfg_n_116100.get('extension', '.png'))
    if _show_frames_n_116100:
        _add_row2_n_116100("Start Frame", "start_frame",
            _cfg_n_116100.get('start_frame', 1001),
            "End Frame", "end_frame",
            _cfg_n_116100.get('end_frame', 1100))
    if _show_pad_n_116100:
        _add_field_n_116100("Frame Padding (digits)", "frame_padding",
            _cfg_n_116100.get('frame_padding', 4))
    _add_field_n_116100("Filename Prefix (e.g. shot_010_comp-)", "prefix",
        _cfg_n_116100.get('prefix', ''))
    if _show_naming_n_116100:
        _add_field_n_116100("Naming Pattern  (# = digit, @ = letter)",
            "naming_pattern",
            _cfg_n_116100.get('naming_pattern', 'shot_###_v##'))
    if _show_cs_n_116100:
        _add_field_n_116100("Expected Colourspace", "colourspace",
            _cfg_n_116100.get('colourspace', 'sRGB'))

    # Save config checkbox
    _save_var_n_116100 = tk.BooleanVar(value=True)
    tk.Checkbutton(_form_n_116100,
        text="  Save these settings for next time",
        variable=_save_var_n_116100,
        bg="#1a1a2e", fg="#888888",
        selectcolor="#0d1117", activebackground="#1a1a2e",
        font=('Arial', 9)).grid(
        row=_row_n_116100, column=0, columnspan=2,
        sticky='w', pady=(12,4))
    _row_n_116100 += 1

    # Buttons
    _btn_frame_n_116100 = tk.Frame(_dlg_n_116100, bg="#0d1f33", pady=12)
    _btn_frame_n_116100.pack(fill='x')

    _result_n_116100 = {'ok': False}

    def _on_run_n_116100():
        _result_n_116100['ok'] = True
        _dlg_n_116100.destroy()

    def _on_cancel_n_116100():
        _result_n_116100['ok'] = False
        _dlg_n_116100.destroy()

    tk.Button(_btn_frame_n_116100, text="Cancel",
        command=_on_cancel_n_116100,
        bg="#333344", fg="#888888",
        font=('Arial', 10), relief='flat',
        padx=20, pady=6).pack(side='left', padx=20)

    tk.Button(_btn_frame_n_116100, text="▶  Run Tool",
        command=_on_run_n_116100,
        bg="#00d8ff", fg="#000000",
        font=('Arial', 11, 'bold'), relief='flat',
        padx=20, pady=6).pack(side='right', padx=20)

    _dlg_n_116100.update_idletasks()
    _w_n_116100 = _dlg_n_116100.winfo_reqwidth()
    _h_n_116100 = _dlg_n_116100.winfo_reqheight()
    _x_n_116100 = (_dlg_n_116100.winfo_screenwidth() - _w_n_116100) // 2
    _y_n_116100 = (_dlg_n_116100.winfo_screenheight() - _h_n_116100) // 2
    _dlg_n_116100.geometry(f"{_w_n_116100}x{_h_n_116100}+{_x_n_116100}+{_y_n_116100}")

    _root_n_116100.wait_window(_dlg_n_116100)
    _root_n_116100.destroy()

    if not _result_n_116100['ok']:
        cancelled = True
        print("FlowPins: Config dialog cancelled.")
    else:
        # Read values from form
        if 'folder_path'    in _vars_n_116100: folder_path    = _vars_n_116100['folder_path'].get()
        if 'extension'      in _vars_n_116100: extension      = _vars_n_116100['extension'].get()
        if 'start_frame'    in _vars_n_116100: start_frame    = int(_vars_n_116100['start_frame'].get() or 1001)
        if 'end_frame'      in _vars_n_116100: end_frame      = int(_vars_n_116100['end_frame'].get() or 1100)
        if 'frame_padding'  in _vars_n_116100: frame_padding  = int(_vars_n_116100['frame_padding'].get() or 4)
        if 'naming_pattern' in _vars_n_116100: naming_pattern = _vars_n_116100['naming_pattern'].get()
        if 'colourspace'    in _vars_n_116100: colourspace    = _vars_n_116100['colourspace'].get()
        if 'prefix'         in _vars_n_116100: prefix         = _vars_n_116100['prefix'].get()

        # Save config if requested
        if _save_var_n_116100.get():
            _save_data_n_116100 = {
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
                with open(_cfg_path_n_116100, 'w') as _sf_n_116100:
                    json.dump(_save_data_n_116100, _sf_n_116100, indent=2)
                print("FlowPins: Settings saved to " + _cfg_path_n_116100)
            except Exception as _se_n_116100:
                print("FlowPins: Could not save config — " + str(_se_n_116100))



import os, re
folder    = folder_path
extension = extension
pattern   = naming_pattern
pass_list = []
fail_list = []
_dot_nm = chr(92) + "."
regex = pattern.replace(".", _dot_nm).replace("*", ".*")
_digit_nm = chr(92) + "d"
regex = re.sub("#+", lambda m: _digit_nm + "{" + str(len(m.group())) + "}", regex)
regex = re.sub("@+", lambda m: "[a-zA-Z]{" + str(len(m.group())) + "}", regex)
regex = "^" + regex + "$"
print()
print("FlowPins Naming Convention Check")
print("Folder  : " + folder)
print("Pattern : " + pattern)
print("-" * 50)
for filename in sorted(os.listdir(folder)):
    if filename.lower().endswith(extension.lower()):
        stem = os.path.splitext(filename)[0]
        if re.match(regex, stem):
            pass_list.append(filename)
            print("  PASS: " + filename)
        else:
            fail_list.append(filename)
            print("  FAIL: " + filename)
pass_count = len(pass_list)
fail_count = len(fail_list)
print()
print("Result: " + str(pass_count) + " passed, " + str(fail_count) + " failed.")


import csv, os
from datetime import datetime
pass_list   = pass_list
fail_list   = fail_list
save_folder = folder_path
csv_path    = os.path.join(save_folder, "report.csv")
timestamp   = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
with open(csv_path, "w", newline="", encoding="utf-8") as csv_file:
    writer = csv.writer(csv_file)
    writer.writerow(["Status", "File", "Timestamp"])
    for f in pass_list:
        writer.writerow(["PASS", os.path.basename(str(f)), timestamp])
    for f in fail_list:
        writer.writerow(["FAIL", str(f), timestamp])
print("CSV report saved: " + csv_path)
print("  " + str(len(pass_list)) + " passed, " + str(len(fail_list)) + " failed.")

