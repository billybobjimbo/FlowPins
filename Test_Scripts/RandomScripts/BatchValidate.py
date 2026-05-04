# Start Execution


from PIL import Image, ImageCms
import os, io
folder          = r"C:\Users\Alistair Murphy\Desktop\Leisl_short\190_comp_frames"
expected_width  = 1920
expected_height = 1080
expected_depth  = 8
expected_cs     = "sRGB"
extension       = ".png"
DEPTH_MAP       = {"1":1,"L":8,"P":8,"RGB":8,"RGBA":8,"I":32,"F":32,"I;16":16,"I;16B":16}
pass_list       = []
fail_list       = []

print()
print("FlowPins Full Image Validator — " + folder)
print("Expected: " + str(expected_width) + "x" + str(expected_height) +
      " | " + str(expected_depth) + "-bit | " + expected_cs)
print("-" * 60)

for root, dirs, files in os.walk(folder):
    for filename in sorted(files):
        if filename.lower().endswith(extension.lower()):
            filepath = os.path.join(root, filename)
            errors   = []
            try:
                with Image.open(filepath) as img:
                    w    = img.width
                    h    = img.height
                    mode = img.mode
                    bd   = DEPTH_MAP.get(mode, 8)
                    info = img.info
                    if w != expected_width or h != expected_height:
                        errors.append("size " + str(w) + "x" + str(h))
                    if bd != expected_depth:
                        errors.append(str(bd) + "-bit")
                    cs = "Untagged"
                    if "icc_profile" in info:
                        try:
                            d  = ImageCms.getProfileDescription(
                                     ImageCms.ImageCmsProfile(io.BytesIO(info["icc_profile"]))
                                 ).strip().lower()
                            cs = "sRGB" if "srgb" in d else "Linear" if "linear" in d else d
                        except:
                            cs = "ICC Embedded"
                    elif "srgb" in info:
                        cs = "sRGB"
                    if cs.lower() != expected_cs.lower():
                        errors.append("cs:" + cs)
                if errors:
                    fail_list.append(filepath + " [" + ", ".join(errors) + "]")
                    print("  FAIL: " + filename + " — " + ", ".join(errors))
                else:
                    pass_list.append(filepath)
                    print("  PASS: " + filename)
            except Exception as e:
                fail_list.append(filepath + " [ERROR: " + str(e) + "]")
                print("  ERROR: " + filename + " — " + str(e))

pass_count = len(pass_list)
fail_count = len(fail_list)
print()
print("Result: " + str(pass_count) + " passed, " + str(fail_count) + " failed.")


import csv, os
from datetime import datetime
pass_list   = pass_list
fail_list   = fail_list
save_folder = r"C:\Users\Alistair Murphy\Desktop\Leisl_short\190_comp_frames"
csv_path    = os.path.join(save_folder, "Validate_report.csv")
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


from datetime import datetime
title     = "FlowPins Report"
separator = "=" * 60
timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print(separator)
print("  " + title.upper())
print("  Generated: " + timestamp)
print(separator)
print("  PASSED : " + str(pass_count))
print("  FAILED : " + str(fail_count))
print(separator)

