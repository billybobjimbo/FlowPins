# Start Execution


# Render Size Estimator
# Estimates disk space needed for a render sequence
_width_n_163443       = int(1920)
_height_n_163443      = int(1080)
_frames_n_163443      = int(100)
_bit_depth_n_163443   = int(8)
_format_n_163443      = "PNG"
_channels_n_163443    = int(4)

# Compression ratios per format (approximate)
_COMPRESSION_n_163443 = {
    "PNG":  0.5,
    "EXR":  0.6,
    "TIFF": 0.9,
    "TGA":  0.8,
    "JPG":  0.1,
    "DPX":  1.0
}

_bytes_per_pixel_n_163443 = (_bit_depth_n_163443 / 8) * _channels_n_163443
_raw_frame_bytes_n_163443 = _width_n_163443 * _height_n_163443 * _bytes_per_pixel_n_163443
_compression_n_163443     = _COMPRESSION_n_163443.get(_format_n_163443.upper(), 0.7)
_frame_bytes_n_163443     = _raw_frame_bytes_n_163443 * _compression_n_163443
_total_bytes_n_163443     = _frame_bytes_n_163443 * _frames_n_163443

size_per_frame = round(_frame_bytes_n_163443 / (1024 * 1024), 2)
size_mb        = round(_total_bytes_n_163443 / (1024 * 1024), 1)
size_gb        = round(_total_bytes_n_163443 / (1024 * 1024 * 1024), 2)

# Human readable
if size_gb >= 1:
    _display_n_163443 = str(size_gb) + " GB"
else:
    _display_n_163443 = str(size_mb) + " MB"

size_summary = (str(_width_n_163443) + "x" + str(_height_n_163443) + " " +
    _format_n_163443 + " " + str(_bit_depth_n_163443) + "-bit x " +
    str(_frames_n_163443) + " frames = " + _display_n_163443)

print("FlowPins Render Size Estimator")
print("=" * 55)
print("  Format     : " + _format_n_163443 + " " + str(_bit_depth_n_163443) + "-bit")
print("  Resolution : " + str(_width_n_163443) + " x " + str(_height_n_163443))
print("  Channels   : " + str(_channels_n_163443) + " (" + ("RGBA" if _channels_n_163443==4 else "RGB" if _channels_n_163443==3 else str(_channels_n_163443) + "ch") + ")")
print("  Frames     : " + str(_frames_n_163443))
print("  Compression: ~" + str(int(_compression_n_163443 * 100)) + "% of raw")
print("-" * 55)
print("  Per frame  : ~" + str(size_per_frame) + " MB")
print("  Total      : ~" + _display_n_163443)
print("=" * 55)

# Common render lengths for context
print("")
print("REFERENCE ESTIMATES (same settings):")
for _label_n_163443, _f_n_163443 in [("30 sec @ 24fps", 720), ("1 min @ 24fps", 1440), ("5 min @ 24fps", 7200), ("22 min @ 24fps", 31680)]:
    _est_n_163443 = round((_frame_bytes_n_163443 * _f_n_163443) / (1024*1024*1024), 2)
    _est_mb_n_163443 = round((_frame_bytes_n_163443 * _f_n_163443) / (1024*1024), 1)
    if _est_n_163443 >= 1:
        print("  " + _label_n_163443 + " : ~" + str(_est_n_163443) + " GB")
    else:
        print("  " + _label_n_163443 + " : ~" + str(_est_mb_n_163443) + " MB")


