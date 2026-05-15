# Start Execution


# Load config or show dialog — the smart config node
# If config exists: load silently and use saved values
# If config missing or force_dialog=True: show UI, optionally save
import json, os, tkinter as tk
from tkinter import ttk, filedialog, messagebox

_cfg_path_n_880947   = "studio_config.json"
_title_n_880947      = "FlowPins — Tool Settings"
_force_n_880947      = str("false").lower() == "true"
_show_folder_n_880947   = str("true").lower() == "true"
_show_ext_n_880947      = str("true").lower() == "true"
_show_frames_n_880947   = str("true").lower() == "true"
_show_naming_n_880947   = str("true").lower() == "true"
_show_cs_n_880947       = str("true").lower() == "true"
_show_pad_n_880947      = str("true").lower() == "true"

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
_cfg_n_880947 = {}
_has_config_n_880947 = False
if os.path.isfile(_cfg_path_n_880947):
    try:
        with open(_cfg_path_n_880947, 'r') as _f_n_880947:
            _cfg_n_880947 = json.load(_f_n_880947)
        _has_config_n_880947 = True
    except:
        pass

# Use config values if loaded and not forcing dialog
# Also force dialog if folder_path is empty even with a valid config
_cfg_folder_n_880947 = _cfg_n_880947.get('folder_path', '') if _has_config_n_880947 else ''
if _has_config_n_880947 and not _force_n_880947 and _cfg_folder_n_880947:
    folder_path    = _cfg_n_880947.get('folder_path',    folder_path)
    extension      = _cfg_n_880947.get('extension',      extension)
    start_frame    = int(_cfg_n_880947.get('start_frame',    start_frame))
    end_frame      = int(_cfg_n_880947.get('end_frame',      end_frame))
    naming_pattern = _cfg_n_880947.get('naming_pattern', naming_pattern)
    colourspace    = _cfg_n_880947.get('colourspace',    colourspace)
    frame_padding  = int(_cfg_n_880947.get('frame_padding',  frame_padding))
    prefix         = _cfg_n_880947.get('prefix',         prefix)
    source_folder  = _cfg_n_880947.get('source_folder',  source_folder)
    target_folder  = _cfg_n_880947.get('target_folder',  target_folder)
    print("FlowPins: Config loaded from " + _cfg_path_n_880947)
else:
    # Show the configuration dialog
    _root_n_880947 = tk.Tk()
    _root_n_880947.withdraw()

    _dlg_n_880947 = tk.Toplevel(_root_n_880947)
    _dlg_n_880947.title(_title_n_880947)
    _dlg_n_880947.resizable(False, False)
    _dlg_n_880947.configure(bg="#1a1a2e")
    _dlg_n_880947.grab_set()

    _style_n_880947 = ttk.Style()
    _style_n_880947.theme_use('clam')
    _style_n_880947.configure('FP.TLabel',
        background="#1a1a2e", foreground="#00d8ff",
        font=('Arial', 10, 'bold'))
    _style_n_880947.configure('FPV.TLabel',
        background="#1a1a2e", foreground="#cccccc",
        font=('Arial', 10))
    _style_n_880947.configure('FP.TEntry',
        fieldbackground="#0d1117", foreground="#ffffff",
        insertcolor="#00d8ff", font=('Arial', 10))
    _style_n_880947.configure('FP.TButton',
        background="#1a3a5c", foreground="#ffffff",
        font=('Arial', 10, 'bold'), padding=8)
    _style_n_880947.configure('FPRun.TButton',
        background="#00d8ff", foreground="#000000",
        font=('Arial', 10, 'bold'), padding=8)

    # Header
    _hdr_n_880947 = tk.Frame(_dlg_n_880947, bg="#0d1f33", pady=12)
    _hdr_n_880947.pack(fill='x')
    tk.Label(_hdr_n_880947, text="⬡  " + _title_n_880947,
        bg="#0d1f33", fg="#00d8ff",
        font=('Arial', 13, 'bold')).pack(padx=20)

    # Form frame
    _form_n_880947 = tk.Frame(_dlg_n_880947, bg="#1a1a2e", padx=20, pady=12)
    _form_n_880947.pack(fill='both', expand=True)

    _row_n_880947 = 0
    _vars_n_880947 = {}

    def _add_field_n_880947(label, key, default, browse=False):
        global _row_n_880947
        tk.Label(_form_n_880947, text=label, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_880947, column=0, sticky='w', pady=(8,2))
        _v_n_880947 = tk.StringVar(value=str(default))
        _vars_n_880947[key] = _v_n_880947
        _e_n_880947 = tk.Entry(_form_n_880947, textvariable=_v_n_880947,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=42, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344")
        _e_n_880947.grid(row=_row_n_880947+1, column=0,
            columnspan=2 if not browse else 1, sticky='ew', pady=(0,4))
        if browse:
            def _browse_n_880947(v=_v_n_880947):
                _d_n_880947 = filedialog.askdirectory()
                if _d_n_880947: v.set(_d_n_880947)
            tk.Button(_form_n_880947, text="📁", command=_browse_n_880947,
                bg="#1a3a5c", fg="#00d8ff", font=('Arial',10),
                relief='flat', padx=6).grid(row=_row_n_880947+1, column=1,
                sticky='w', padx=(4,0))
        _row_n_880947 += 2

    def _add_row2_n_880947(l1, k1, d1, l2, k2, d2):
        global _row_n_880947
        tk.Label(_form_n_880947, text=l1, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_880947, column=0, sticky='w', pady=(8,2))
        tk.Label(_form_n_880947, text=l2, bg="#1a1a2e", fg="#00d8ff",
            font=('Arial', 9, 'bold'), anchor='w').grid(
            row=_row_n_880947, column=1, sticky='w', pady=(8,2), padx=(8,0))
        _v1_n_880947 = tk.StringVar(value=str(d1))
        _v2_n_880947 = tk.StringVar(value=str(d2))
        _vars_n_880947[k1] = _v1_n_880947
        _vars_n_880947[k2] = _v2_n_880947
        tk.Entry(_form_n_880947, textvariable=_v1_n_880947,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_880947+1, column=0, sticky='ew', pady=(0,4))
        tk.Entry(_form_n_880947, textvariable=_v2_n_880947,
            bg="#0d1117", fg="#ffffff", insertbackground="#00d8ff",
            font=('Arial', 10), width=20, relief='flat',
            highlightthickness=1, highlightcolor="#00d8ff",
            highlightbackground="#333344").grid(
            row=_row_n_880947+1, column=1, sticky='ew',
            pady=(0,4), padx=(8,0))
        _row_n_880947 += 2

    if _show_folder_n_880947:
        _add_field_n_880947("Render / Source Folder", "folder_path",
            _cfg_n_880947.get('folder_path', ''), browse=True)
    if _show_ext_n_880947:
        _add_field_n_880947("File Extension", "extension",
            _cfg_n_880947.get('extension', '.png'))
    if _show_frames_n_880947:
        _add_row2_n_880947("Start Frame", "start_frame",
            _cfg_n_880947.get('start_frame', 1001),
            "End Frame", "end_frame",
            _cfg_n_880947.get('end_frame', 1100))
    if _show_pad_n_880947:
        _add_field_n_880947("Frame Padding (digits)", "frame_padding",
            _cfg_n_880947.get('frame_padding', 4))
    _add_field_n_880947("Filename Prefix (e.g. shot_010_comp-)", "prefix",
        _cfg_n_880947.get('prefix', ''))
    _add_field_n_880947("Source Folder (for Folder Diff)", "source_folder",
        _cfg_n_880947.get('source_folder', ''), browse=True)
    _add_field_n_880947("Target Folder (for Folder Diff)", "target_folder",
        _cfg_n_880947.get('target_folder', ''), browse=True)
    if _show_naming_n_880947:
        _add_field_n_880947("Naming Pattern  (# = digit, @ = letter)",
            "naming_pattern",
            _cfg_n_880947.get('naming_pattern', 'shot_###_v##'))
    if _show_cs_n_880947:
        _add_field_n_880947("Expected Colourspace", "colourspace",
            _cfg_n_880947.get('colourspace', 'sRGB'))

    # Save config checkbox
    _save_var_n_880947 = tk.BooleanVar(value=True)
    tk.Checkbutton(_form_n_880947,
        text="  Save these settings for next time",
        variable=_save_var_n_880947,
        bg="#1a1a2e", fg="#888888",
        selectcolor="#0d1117", activebackground="#1a1a2e",
        font=('Arial', 9)).grid(
        row=_row_n_880947, column=0, columnspan=2,
        sticky='w', pady=(12,4))
    _row_n_880947 += 1

    # Buttons
    _btn_frame_n_880947 = tk.Frame(_dlg_n_880947, bg="#0d1f33", pady=12)
    _btn_frame_n_880947.pack(fill='x')

    _result_n_880947 = {'ok': False}

    def _on_run_n_880947():
        _result_n_880947['ok'] = True
        _dlg_n_880947.destroy()

    def _on_cancel_n_880947():
        _result_n_880947['ok'] = False
        _dlg_n_880947.destroy()

    tk.Button(_btn_frame_n_880947, text="Cancel",
        command=_on_cancel_n_880947,
        bg="#333344", fg="#888888",
        font=('Arial', 10), relief='flat',
        padx=20, pady=6).pack(side='left', padx=20)

    tk.Button(_btn_frame_n_880947, text="▶  Run Tool",
        command=_on_run_n_880947,
        bg="#00d8ff", fg="#000000",
        font=('Arial', 11, 'bold'), relief='flat',
        padx=20, pady=6).pack(side='right', padx=20)

    _dlg_n_880947.update_idletasks()
    _w_n_880947 = _dlg_n_880947.winfo_reqwidth()
    _h_n_880947 = _dlg_n_880947.winfo_reqheight()
    _x_n_880947 = (_dlg_n_880947.winfo_screenwidth() - _w_n_880947) // 2
    _y_n_880947 = (_dlg_n_880947.winfo_screenheight() - _h_n_880947) // 2
    _dlg_n_880947.geometry(f"{_w_n_880947}x{_h_n_880947}+{_x_n_880947}+{_y_n_880947}")

    _root_n_880947.wait_window(_dlg_n_880947)
    _root_n_880947.destroy()

    if not _result_n_880947['ok']:
        cancelled = True
        print("FlowPins: Config dialog cancelled.")
    else:
        # Read values from form
        if 'folder_path'    in _vars_n_880947: folder_path    = _vars_n_880947['folder_path'].get()
        if 'extension'      in _vars_n_880947: extension      = _vars_n_880947['extension'].get()
        if 'start_frame'    in _vars_n_880947: start_frame    = int(_vars_n_880947['start_frame'].get() or 1001)
        if 'end_frame'      in _vars_n_880947: end_frame      = int(_vars_n_880947['end_frame'].get() or 1100)
        if 'frame_padding'  in _vars_n_880947: frame_padding  = int(_vars_n_880947['frame_padding'].get() or 4)
        if 'naming_pattern' in _vars_n_880947: naming_pattern = _vars_n_880947['naming_pattern'].get()
        if 'colourspace'    in _vars_n_880947: colourspace    = _vars_n_880947['colourspace'].get()
        if 'prefix'         in _vars_n_880947: prefix         = _vars_n_880947['prefix'].get()
        if 'source_folder'  in _vars_n_880947: source_folder  = _vars_n_880947['source_folder'].get()
        if 'target_folder'  in _vars_n_880947: target_folder  = _vars_n_880947['target_folder'].get()

        # Save config if requested
        if _save_var_n_880947.get():
            _save_data_n_880947 = {
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
                with open(_cfg_path_n_880947, 'w') as _sf_n_880947:
                    json.dump(_save_data_n_880947, _sf_n_880947, indent=2)
                print("FlowPins: Settings saved to " + _cfg_path_n_880947)
            except Exception as _se_n_880947:
                print("FlowPins: Could not save config — " + str(_se_n_880947))



# Delivery Sign-Off Sheet
# Formal delivery record with validation results and sign-off lines
import os, re, io
from PIL import Image, ImageCms
from datetime import datetime

_folder_n_892482   = folder_path
_ext_n_892482      = extension if isinstance(extension, str) and extension.startswith(".") else "extension"
_start_n_892482    = int(start_frame)
_end_n_892482      = int(end_frame)
_width_n_892482    = int(1920)
_height_n_892482   = int(1080)
_cs_n_892482       = "sRGB"
_studio_n_892482   = "Oddly Made Games"
_client_n_892482   = "MMSM Productions"
_show_n_892482     = "MMSM"
_ep_n_892482       = "EP01"
_shot_n_892482     = "sc0220"
_deliv_n_892482    = "Final Composite"
_fspec_n_892482    = "1920x1080 PNG sRGB"
_prep_n_892482     = ""
_save_n_892482     = str("true").lower() == "true"

if isinstance(_folder_n_892482, str):
    _folder_n_892482 = _folder_n_892482.replace(chr(92), "/").rstrip("/")

report_path = ""
all_passed  = False
_ts_n_892482 = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
_date_n_892482 = datetime.now().strftime("%B %d, %Y")

if not _folder_n_892482 or not os.path.isdir(_folder_n_892482):
    print("FlowPins ERROR: Folder not found — " + str(_folder_n_892482))
else:
    # Run validations
    _files_n_892482 = sorted([f for f in os.listdir(_folder_n_892482) if f.lower().endswith(_ext_n_892482.lower())])
    _found_n_892482 = len(_files_n_892482)
    _expected_n_892482 = _end_n_892482 - _start_n_892482 + 1

    # Frame check
    _digit_n_892482 = chr(92) + "d"
    _fpat_n_892482  = re.compile("(" + _digit_n_892482 + "+)" + re.escape(_ext_n_892482) + "$", re.IGNORECASE)
    _nums_n_892482  = set()
    for _fn_n_892482 in _files_n_892482:
        _m_n_892482 = _fpat_n_892482.search(_fn_n_892482)
        if _m_n_892482: _nums_n_892482.add(int(_m_n_892482.group(1)))
    _missing_n_892482 = sorted(set(range(_start_n_892482, _end_n_892482+1)) - _nums_n_892482)
    _frames_ok_n_892482 = len(_missing_n_892482) == 0

    # Resolution check (sample)
    _res_ok_n_892482 = True
    _res_detail_n_892482 = str(_width_n_892482) + "x" + str(_height_n_892482)
    for _fn_n_892482 in _files_n_892482[:5]:
        try:
            with Image.open(os.path.join(_folder_n_892482, _fn_n_892482)) as _img_n_892482:
                if _img_n_892482.width != _width_n_892482 or _img_n_892482.height != _height_n_892482:
                    _res_ok_n_892482 = False
                    _res_detail_n_892482 = "MISMATCH: found " + str(_img_n_892482.width) + "x" + str(_img_n_892482.height)
                    break
        except: pass

    # CS check (sample)
    _cs_ok_n_892482 = True
    _cs_detail_n_892482 = _cs_n_892482
    for _fn_n_892482 in _files_n_892482[:5]:
        try:
            with Image.open(os.path.join(_folder_n_892482, _fn_n_892482)) as _img_n_892482:
                _info_n_892482 = _img_n_892482.info
                if "icc_profile" in _info_n_892482:
                    try:
                        _desc_n_892482 = ImageCms.getProfileDescription(ImageCms.ImageCmsProfile(io.BytesIO(_info_n_892482["icc_profile"]))).strip().lower()
                        _det_n_892482 = "sRGB" if "srgb" in _desc_n_892482 else "Rec.709" if "709" in _desc_n_892482 else _desc_n_892482[:20]
                    except: _det_n_892482 = "ICC"
                elif "srgb" in _info_n_892482: _det_n_892482 = "sRGB"
                else: _det_n_892482 = "Untagged"
                if _det_n_892482.lower() != _cs_n_892482.lower():
                    _cs_ok_n_892482 = False
                    _cs_detail_n_892482 = "MISMATCH: found " + _det_n_892482
                    break
        except: pass

    all_passed = _frames_ok_n_892482 and _res_ok_n_892482 and _cs_ok_n_892482
    _status_n_892482 = "APPROVED FOR DELIVERY" if all_passed else "REQUIRES ATTENTION"

    # Build document
    _W_n_892482 = 62
    _sep_n_892482   = "=" * _W_n_892482
    _div_n_892482   = "-" * _W_n_892482
    _blank_n_892482 = ""

    _lines_n_892482 = [
        _sep_n_892482,
        "  DELIVERY SIGN-OFF SHEET",
        "  FlowPins Pipeline Suite  |  " + _date_n_892482,
        _sep_n_892482,
        _blank_n_892482,
        "  PRODUCTION DETAILS",
        _div_n_892482,
        "  Studio        : " + _studio_n_892482,
        "  Client        : " + _client_n_892482,
        "  Show          : " + _show_n_892482,
        "  Episode       : " + _ep_n_892482,
        "  Shot          : " + _shot_n_892482,
        "  Deliverable   : " + _deliv_n_892482,
        "  Prepared By   : " + (_prep_n_892482 or "_________________________"),
        "  Date          : " + _date_n_892482,
        _blank_n_892482,
        "  DELIVERY SPECIFICATION",
        _div_n_892482,
        "  Format        : " + _ext_n_892482.upper().lstrip("."),
        "  Frame Range   : " + str(_start_n_892482) + " - " + str(_end_n_892482) + "  (" + str(_expected_n_892482) + " frames)",
        "  Resolution    : " + str(_width_n_892482) + " x " + str(_height_n_892482),
        "  Colourspace   : " + _cs_n_892482,
        "  Spec          : " + _fspec_n_892482,
        "  Folder        : " + _folder_n_892482,
        _blank_n_892482,
        "  VALIDATION RESULTS",
        _div_n_892482,
        "  Frame Count   : " + ("PASS  — " + str(_found_n_892482) + " frames present" if _frames_ok_n_892482 else "FAIL  — " + str(len(_missing_n_892482)) + " frames missing"),
        "  Resolution    : " + ("PASS  — " + _res_detail_n_892482 if _res_ok_n_892482 else "FAIL  — " + _res_detail_n_892482),
        "  Colourspace   : " + ("PASS  — " + _cs_detail_n_892482 if _cs_ok_n_892482 else "FAIL  — " + _cs_detail_n_892482),
        _blank_n_892482,
        "  OVERALL STATUS: " + _status_n_892482,
        _blank_n_892482,
        _sep_n_892482,
        "  SIGN-OFF",
        _div_n_892482,
        _blank_n_892482,
        "  Prepared by   : _________________________  Date: ____________",
        _blank_n_892482,
        "  Approved by   : _________________________  Date: ____________",
        _blank_n_892482,
        "  Client sign-off: ________________________  Date: ____________",
        _blank_n_892482,
        _sep_n_892482,
        "  Generated by FlowPins Pipeline Suite  |  " + _ts_n_892482,
        _sep_n_892482,
    ]

    # Print to terminal
    for _l_n_892482 in _lines_n_892482:
        print(_l_n_892482)

    # Save
    if _save_n_892482:
        _rname_n_892482 = "signoff_" + _shot_n_892482 + "_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".txt"
        report_path = os.path.join(_folder_n_892482, _rname_n_892482)
        try:
            with open(report_path, "w", encoding="utf-8") as _rf_n_892482:
                _rf_n_892482.write(chr(10).join(_lines_n_892482))
            print("")
            print("  Report: " + report_path)
        except Exception as _re_n_892482:
            print("  Save failed: " + str(_re_n_892482))


