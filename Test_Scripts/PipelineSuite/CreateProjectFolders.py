# Start Execution


# Project Folder Creator
# Creates a complete studio-standard folder structure for a new show
import os, json, tkinter as tk
from tkinter import ttk, filedialog
from datetime import datetime

# ── Configuration Dialog ─────────────────────────────────────
_root_ui = tk.Tk()
_root_ui.withdraw()

_dlg = tk.Toplevel(_root_ui)
_dlg.title("FlowPins — Project Folder Creator")
_dlg.resizable(False, False)
_dlg.configure(bg="#1a1a2e")
_dlg.grab_set()

# Header
_hdr = tk.Frame(_dlg, bg="#0d1f33", pady=12)
_hdr.pack(fill='x')
tk.Label(_hdr, text="⬡  FlowPins — Project Folder Creator",
    bg="#0d1f33", fg="#00d8ff",
    font=('Arial', 13, 'bold')).pack(padx=20)

# Form
_form = tk.Frame(_dlg, bg="#1a1a2e", padx=20, pady=12)
_form.pack(fill='both', expand=True)

_vars = {}
_row  = [0]

def _field(label, key, default, browse=False):
    tk.Label(_form, text=label, bg="#1a1a2e", fg="#00d8ff",
        font=('Arial', 9, 'bold'), anchor='w').grid(
        row=_row[0], column=0, sticky='w', pady=(8,2))
    _v = tk.StringVar(value=str(default))
    _vars[key] = _v
    _e = tk.Entry(_form, textvariable=_v,
        bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
        font=('Arial', 10), width=42, relief='flat',
        highlightthickness=1, highlightcolor="#00d8ff",
        highlightbackground="#333344")
    _e.grid(row=_row[0]+1, column=0,
        columnspan=1 if browse else 2, sticky='ew', pady=(0,4))
    if browse:
        def _br(v=_v):
            _d = filedialog.askdirectory()
            if _d: v.set(_d)
        tk.Button(_form, text="📁", command=_br,
            bg="#1a3a5c", fg="#00d8ff", font=('Arial',10),
            relief='flat', padx=6).grid(row=_row[0]+1, column=1,
            sticky='w', padx=(4,0))
    _row[0] += 2

_field("Root Drive / Path",            "root",     "D:/", browse=True)
_field("Show Name",                    "show",     "SHOW_NAME")
_field("Episodes  (comma separated)",  "episodes", "EP01")

# Preview label
_preview = tk.Label(_form, text="", bg="#0a1520", fg="#00d8ff",
    font=('Arial', 9, 'italic'), anchor='w', justify='left',
    wraplength=400)
_preview.grid(row=_row[0], column=0, columnspan=2,
    sticky='ew', pady=(8,4))
_row[0] += 1

def _update_preview(*_):
    r = _vars['root'].get().rstrip('/').rstrip(chr(92))
    s = _vars['show'].get()
    eps = [e.strip() for e in _vars['episodes'].get().split(',') if e.strip()]
    if r and s and eps:
        lines = [r + "/" + s + "/"]
        for ep in eps[:2]:
            lines.append("  " + ep + "/")
            lines.append("    Renders/")
            lines.append("    Scenes/")
            lines.append("    Assets/  ...")
        if len(eps) > 2:
            lines.append("  ... (" + str(len(eps)) + " episodes total)")
        _preview.config(text=chr(10).join(lines))

for _v in _vars.values():
    _v.trace_add('write', _update_preview)
_update_preview()

# Save checkbox
_save_var = tk.BooleanVar(value=True)
tk.Checkbutton(_form, text="  Create README.txt in each folder",
    variable=_save_var,
    bg="#1a1a2e", fg="#888888",
    selectcolor="#0d1117", activebackground="#1a1a2e",
    font=('Arial', 9)).grid(
    row=_row[0], column=0, columnspan=2,
    sticky='w', pady=(12,4))
_row[0] += 1

# Buttons
_btn_frame = tk.Frame(_dlg, bg="#0d1f33", pady=12)
_btn_frame.pack(fill='x')
_result = {'ok': False}

def _on_run():
    _result['ok'] = True
    _dlg.destroy()

def _on_cancel():
    _result['ok'] = False
    _dlg.destroy()

tk.Button(_btn_frame, text="Cancel", command=_on_cancel,
    bg="#333344", fg="#888888",
    font=('Arial', 10), relief='flat',
    padx=20, pady=6).pack(side='left', padx=20)

tk.Button(_btn_frame, text="▶  Create Project", command=_on_run,
    bg="#00d8ff", fg="#000000",
    font=('Arial', 11, 'bold'), relief='flat',
    padx=20, pady=6).pack(side='right', padx=20)

_dlg.update_idletasks()
_dlg_w = _dlg.winfo_reqwidth()
_dlg_h = _dlg.winfo_reqheight()
_dlg_x = (_dlg.winfo_screenwidth()  - _dlg_w) // 2
_dlg_y = (_dlg.winfo_screenheight() - _dlg_h) // 2
_dlg.geometry(str(_dlg_w) + "x" + str(_dlg_h) + "+" + str(_dlg_x) + "+" + str(_dlg_y))

_root_ui.wait_window(_dlg)
_root_ui.destroy()

if not _result['ok']:
    print("FlowPins: Project Folder Creator cancelled.")
    project_root   = ""
    folders_created = 0
    success        = False
else:
    # ── Build folder structure ───────────────────────────────
    _root_path = _vars['root'].get().rstrip('/').rstrip(chr(92))
    _show_name = _vars['show'].get().strip()
    _episodes  = [e.strip() for e in _vars['episodes'].get().split(',') if e.strip()]
    _readme    = _save_var.get()
    _ts        = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    project_root    = _root_path + "/" + _show_name
    folders_created = 0
    success         = True

    # Standard subfolder structure per episode
    _SUBFOLDERS = [
        "Renders",
        "Scenes",
        "Assets/Characters",
        "Assets/Backgrounds",
        "Assets/Props",
        "Assets/Effects",
        "Audio",
        "Reference",
        "Delivery",
        "Documents",
    ]

    # README content per folder
    _README = {
        "Renders":              "Render output folders. Organised by Take (TK_01, TK_02 etc). SetWriteNode will create scene subfolders automatically.",
        "Scenes":               "Scene files. Create a subfolder per scene (sc0220, sc0230 etc). Organise by your DCC file format.",
        "Assets/Characters":    "Character assets — rigs, designs, palettes.",
        "Assets/Backgrounds":   "Background layouts and painted backgrounds.",
        "Assets/Props":         "Prop assets.",
        "Assets/Effects":       "Effects elements and overlays.",
        "Audio":                "Audio files — dialogue, music, SFX.",
        "Reference":            "Reference material, storyboards, animatics.",
        "Delivery":             "Final delivery packages. Do not place renders here directly.",
        "Documents":            "Production documents, schedules, shot lists.",
    }

    print("=" * 65)
    print("  FLOWPINS PROJECT FOLDER CREATOR")
    print("  " + _ts)
    print("  Show   : " + _show_name)
    print("  Root   : " + project_root)
    print("  Episodes: " + ", ".join(_episodes))
    print("=" * 65)

    # Create root show folder
    try:
        os.makedirs(project_root, exist_ok=True)
        folders_created += 1
        print(chr(10) + '✓ ' + project_root)

        # Create README at show root
        if _readme:
            _rme = os.path.join(project_root, "README.txt")
            with open(_rme, 'w') as _f:
                _f.write(_show_name + " — Production Folder" + chr(10))
                _f.write("Created by FlowPins Pipeline Suite" + chr(10))
                _f.write("Date: " + _ts + chr(10))
                _f.write("Episodes: " + ", ".join(_episodes) + chr(10))

        # Create episode folders
        for _ep in _episodes:
            _ep_path = os.path.join(project_root, _ep)
            os.makedirs(_ep_path, exist_ok=True)
            folders_created += 1
            print(chr(10) + '  ✓ ' + _ep)

            # Create subfolders
            for _sub in _SUBFOLDERS:
                _sub_path = os.path.join(_ep_path, _sub)
                os.makedirs(_sub_path, exist_ok=True)
                folders_created += 1
                print("    ✓ " + _sub)

                # Create README in subfolder
                if _readme and _sub in _README:
                    _rme = os.path.join(_sub_path, "README.txt")
                    with open(_rme, 'w') as _f:
                        _f.write(_show_name + " / " + _ep + " / " + _sub + chr(10))
                        _f.write("=" * 50 + chr(10))
                        _f.write(_README[_sub] + chr(10))
                        _f.write("Created by FlowPins Pipeline Suite" + chr(10))
                        _f.write("Date: " + _ts + chr(10))

        print("")
        print("=" * 65)
        print("  ✓ DONE — " + str(folders_created) + " folders created")
        print("  Root: " + project_root)
        print("=" * 65)

    except Exception as _e:
        print("FlowPins ERROR: " + str(_e))
        success = False


