// src/renderer/src/libraries/templates.ts
// ============================================================================
// FLOWPINS: EVELYN'S TEMPLATE ARCHIVE
// Pre-built node graph blueprints that Evelyn can deploy from a prompt.
// Each template has: id, keywords[], nodes[], edges[]
//
// To add a new template: add an entry to LOCAL_TEMPLATES with keywords
// that Evelyn's parser will recognise.
// ============================================================================
export const LOCAL_TEMPLATES = [
  {
    id: "glass_distortion",
    keywords: ["glass", "refract", "blur", "distort", "distortion", "water"],
    nodes: [
      { id: "ai_drawing", nodeKind: "tb_create_drawing", x: -200, y: 250 },
      { id: "ai_1", nodeKind: "tb_refract", x: 100, y: 150 },
      { id: "ai_2", nodeKind: "tb_blur_radial", x: 450, y: 150 }
    ],
    edges: [
      { source: "ai_drawing", target: "ai_1", sourceHandle: "out_image", targetHandle: "refract_map" },
      { source: "ai_1", target: "ai_2", sourceHandle: "out_image", targetHandle: "in_image" }
    ]
  },
  {
    id: "math_addition",
    keywords: ["math", "add", "addition", "sum", "calculator", "plus"],
    nodes: [
      { id: "ai_math_1", nodeKind: "const_int", x: 100, y: 100 },
      { id: "ai_math_2", nodeKind: "const_int", x: 100, y: 250 },
      { id: "ai_add_node", nodeKind: "add_int", x: 400, y: 175 }
    ],
    edges: [
      { source: "ai_math_1", target: "ai_add_node", sourceHandle: "value", targetHandle: "a" },
      { source: "ai_math_2", target: "ai_add_node", sourceHandle: "value", targetHandle: "b" }
    ]
  },
  {
    id: "logic_branch",
    keywords: ["branch", "if", "else", "condition", "logic", "check"],
    nodes: [
      { id: "ai_branch_start", nodeKind: "start", x: 100, y: 150 },
      { id: "ai_branch_node", nodeKind: "if_branch", x: 350, y: 150 }
    ],
    edges: [
      { source: "ai_branch_start", target: "ai_branch_node", sourceHandle: "exec_out", targetHandle: "exec_in" }
    ]
  },
  {
    id: "exec_loop",
    keywords: ["loop", "iterate", "for loop", "repeat", "while"],
    nodes: [
      { id: "ai_loop_start", nodeKind: "start", x: 100, y: 150 },
      { id: "ai_loop_node", nodeKind: "for_loop", x: 350, y: 150 },
      { id: "ai_loop_max", nodeKind: "const_int", x: 100, y: 300 }
    ],
    edges: [
      { source: "ai_loop_start", target: "ai_loop_node", sourceHandle: "exec_out", targetHandle: "exec_in" },
      { source: "ai_loop_max", target: "ai_loop_node", sourceHandle: "value", targetHandle: "end" }
    ]
  },
  {
    id: "basic_variables",
    keywords: ["variable", "string", "int", "number", "text", "data"],
    nodes: [
      { id: "ai_v1", nodeKind: "const_string", x: 100, y: 100 },
      { id: "ai_v2", nodeKind: "const_int", x: 100, y: 250 }
    ],
    edges: []
  },
  {
    id: "python_hello_friend",
    keywords: ["python", "hello", "friend", "greeting", "hello world"],
    nodes: [
      { id: "py_start",    nodeKind: "start",          x: 100, y: 250 },
      { id: "py_template", nodeKind: "const_string",   x: 100, y: 100, props: { value: "Hello, {0}!" } },
      { id: "py_name",     nodeKind: "const_string",   x: 100, y: 400, props: { value: "Friend" } },
      { id: "py_format",   nodeKind: "format_string_2",x: 400, y: 250 },
      { id: "py_print",    nodeKind: "console_print",  x: 750, y: 250 }
    ],
    edges: [
      { source: "py_start",    target: "py_print",  sourceHandle: "exec_out", targetHandle: "exec_in" },
      { source: "py_template", target: "py_format", sourceHandle: "value",    targetHandle: "template" },
      { source: "py_name",     target: "py_format", sourceHandle: "value",    targetHandle: "arg0" },
      { source: "py_format",   target: "py_print",  sourceHandle: "result",   targetHandle: "message" }
    ]
  },
  {
    id: "mummy_easter_egg",
    keywords: ["mummy", "mummies", "mummification", "pharaoh", "egypt"],
    nodes: [
      { id: "mum_start",   nodeKind: "start",         x: 100,  y: 250 },
      { id: "mum_rand",    nodeKind: "random_int",    x: 100,  y: 400, props: { min: 1, max: 2 } },
      { id: "mum_const1",  nodeKind: "const_int",     x: 300,  y: 450, props: { value: 1 } },
      { id: "mum_compare", nodeKind: "compare_int",   x: 500,  y: 400, props: { op: "==" } },
      { id: "mum_branch",  nodeKind: "if_branch",     x: 700,  y: 250 },
      { id: "mum_str1",    nodeKind: "const_string",  x: 700,  y: 100, props: { value: "Ancient Egyptians used natron salt to dry out mummies." } },
      { id: "mum_str2",    nodeKind: "const_string",  x: 700,  y: 450, props: { value: "The unwrapping of mummies was a popular Victorian party theme." } },
      { id: "mum_print1",  nodeKind: "console_print", x: 1000, y: 150 },
      { id: "mum_print2",  nodeKind: "console_print", x: 1000, y: 350 }
    ],
    edges: [
      { source: "mum_start",   target: "mum_branch",  sourceHandle: "exec_out",  targetHandle: "exec_in" },
      { source: "mum_branch",  target: "mum_print1",  sourceHandle: "true",      targetHandle: "exec_in" },
      { source: "mum_branch",  target: "mum_print2",  sourceHandle: "false",     targetHandle: "exec_in" },
      { source: "mum_rand",    target: "mum_compare", sourceHandle: "result",    targetHandle: "a" },
      { source: "mum_const1",  target: "mum_compare", sourceHandle: "value",     targetHandle: "b" },
      { source: "mum_compare", target: "mum_branch",  sourceHandle: "is_equal",  targetHandle: "condition" },
      { source: "mum_str1",    target: "mum_print1",  sourceHandle: "value",     targetHandle: "message" },
      { source: "mum_str2",    target: "mum_print2",  sourceHandle: "value",     targetHandle: "message" }
    ]
  },

  // ==========================================================================
  // PIPELINE TEMPLATES
  // ==========================================================================

  {
    id: "colourspace_validator",
    keywords: ["colourspace", "colorspace", "colour space", "color space", "icc", "srgb", "validate", "check images", "check frames", "check png", "image check"],
    nodes: [
      { id: "cs_start",    nodeKind: "start",             x: 0,   y: 200 },
      { id: "cs_folder",   nodeKind: "fs_input_path",     x: 0,   y: 50,  props: { path: "C:/your/image/folder" } },
      { id: "cs_validate", nodeKind: "cs_batch_validate", x: 300, y: 200, props: { expected: "sRGB" } },
      { id: "cs_report",   nodeKind: "cs_print_report",   x: 600, y: 200, props: { save_report: "true" } }
    ],
    edges: [
      { source: "cs_start",    target: "cs_validate", sourceHandle: "exec_out",  targetHandle: "exec_in" },
      { source: "cs_folder",   target: "cs_validate", sourceHandle: "path",      targetHandle: "folder_path" },
      { source: "cs_validate", target: "cs_report",   sourceHandle: "exec_out",  targetHandle: "exec_in" },
      { source: "cs_validate", target: "cs_report",   sourceHandle: "pass_list", targetHandle: "pass_list" },
      { source: "cs_validate", target: "cs_report",   sourceHandle: "fail_list", targetHandle: "fail_list" },
      { source: "cs_folder",   target: "cs_report",   sourceHandle: "path",      targetHandle: "folder_path" }
    ]
  },

  {
    id: "batch_rename",
    keywords: ["rename", "batch rename", "find replace", "mass rename", "bulk rename"],
    nodes: [
      { id: "br_start",  nodeKind: "start",           x: 0,   y: 200 },
      { id: "br_folder", nodeKind: "fs_input_path",   x: 0,   y: 50,  props: { path: "C:/your/folder" } },
      { id: "br_rename", nodeKind: "fs_batch_rename", x: 300, y: 200, props: { find: "old_", replace: "new_", extension: ".png" } }
    ],
    edges: [
      { source: "br_start",  target: "br_rename", sourceHandle: "exec_out", targetHandle: "exec_in" },
      { source: "br_folder", target: "br_rename", sourceHandle: "path",     targetHandle: "folder_path" }
    ]
  }
,

  // ==========================================================================
  // PIPELINE TEMPLATES — Wave 2
  // ==========================================================================

  {
    id: "naming_check",
    keywords: ["naming", "convention", "filename check", "name check", "naming convention"],
    nodes: [
      { id: "nc_start",   nodeKind: "start",               x: 0,   y: 200 },
      { id: "nc_folder",  nodeKind: "fs_input_path",        x: 0,   y: 50,  props: { path: "C:/your/folder" } },
      { id: "nc_check",   nodeKind: "nm_batch_check_folder",x: 300, y: 200, props: { pattern: "shot_###_layer_v##", extension: ".png" } },
      { id: "nc_report",  nodeKind: "rp_print_summary",     x: 600, y: 200, props: { title: "Naming Convention Report" } }
    ],
    edges: [
      { source: "nc_start",  target: "nc_check",  sourceHandle: "exec_out",   targetHandle: "exec_in" },
      { source: "nc_folder", target: "nc_check",  sourceHandle: "path",       targetHandle: "folder_path" },
      { source: "nc_check",  target: "nc_report", sourceHandle: "exec_out",   targetHandle: "exec_in" },
      { source: "nc_check",  target: "nc_report", sourceHandle: "pass_count", targetHandle: "pass_count" },
      { source: "nc_check",  target: "nc_report", sourceHandle: "fail_count", targetHandle: "fail_count" }
    ]
  },

  {
    id: "dimension_check",
    keywords: ["dimensions", "resolution", "image size", "check resolution", "1920", "1080", "width height"],
    nodes: [
      { id: "dim_start",  nodeKind: "start",                    x: 0,   y: 200 },
      { id: "dim_folder", nodeKind: "fs_input_path",             x: 0,   y: 50,  props: { path: "C:/your/folder" } },
      { id: "dim_check",  nodeKind: "img_batch_check_dimensions",x: 300, y: 200, props: { expected_width: 1920, expected_height: 1080, extension: ".png" } },
      { id: "dim_report", nodeKind: "cs_print_report",           x: 600, y: 200, props: { save_report: "true" } }
    ],
    edges: [
      { source: "dim_start",  target: "dim_check",  sourceHandle: "exec_out",  targetHandle: "exec_in" },
      { source: "dim_folder", target: "dim_check",  sourceHandle: "path",      targetHandle: "folder_path" },
      { source: "dim_check",  target: "dim_report", sourceHandle: "exec_out",  targetHandle: "exec_in" },
      { source: "dim_check",  target: "dim_report", sourceHandle: "pass_list", targetHandle: "pass_list" },
      { source: "dim_check",  target: "dim_report", sourceHandle: "fail_list", targetHandle: "fail_list" },
      { source: "dim_folder", target: "dim_report", sourceHandle: "path",      targetHandle: "folder_path" }
    ]
  },

  {
    id: "full_image_validate",
    keywords: ["full validate", "validate all", "full check", "image validate", "check everything", "complete check"],
    nodes: [
      { id: "fv_start",   nodeKind: "start",              x: 0,   y: 200 },
      { id: "fv_folder",  nodeKind: "fs_input_path",       x: 0,   y: 50,  props: { path: "C:/your/folder" } },
      { id: "fv_check",   nodeKind: "img_batch_validate",  x: 300, y: 200, props: { expected_width: 1920, expected_height: 1080, expected_bit_depth: 8, expected_cs: "sRGB", extension: ".png" } },
      { id: "fv_csv",     nodeKind: "rp_save_csv",         x: 600, y: 100, props: { filename: "validation_report.csv" } },
      { id: "fv_summary", nodeKind: "rp_print_summary",    x: 600, y: 300, props: { title: "Full Image Validation" } }
    ],
    edges: [
      { source: "fv_start",  target: "fv_check",   sourceHandle: "exec_out",   targetHandle: "exec_in" },
      { source: "fv_folder", target: "fv_check",   sourceHandle: "path",       targetHandle: "folder_path" },
      { source: "fv_check",  target: "fv_csv",     sourceHandle: "exec_out",   targetHandle: "exec_in" },
      { source: "fv_check",  target: "fv_csv",     sourceHandle: "pass_list",  targetHandle: "pass_list" },
      { source: "fv_check",  target: "fv_csv",     sourceHandle: "fail_list",  targetHandle: "fail_list" },
      { source: "fv_folder", target: "fv_csv",     sourceHandle: "path",       targetHandle: "folder_path" },
      { source: "fv_csv",    target: "fv_summary", sourceHandle: "exec_out",   targetHandle: "exec_in" },
      { source: "fv_check",  target: "fv_summary", sourceHandle: "pass_count", targetHandle: "pass_count" },
      { source: "fv_check",  target: "fv_summary", sourceHandle: "fail_count", targetHandle: "fail_count" }
    ]
  },

  {
    id: "compare_folders",
    keywords: ["compare folders", "missing files", "folder diff", "compare", "missing frames"],
    nodes: [
      { id: "cf_start",   nodeKind: "start",               x: 0,   y: 200 },
      { id: "cf_folder_a",nodeKind: "fs_input_path",        x: 0,   y: 50,  props: { path: "C:/folder_a" } },
      { id: "cf_folder_b",nodeKind: "fs_input_path",        x: 0,   y: 350, props: { path: "C:/folder_b" } },
      { id: "cf_compare", nodeKind: "rp_compare_folders",   x: 350, y: 200, props: { extension: ".png" } }
    ],
    edges: [
      { source: "cf_start",    target: "cf_compare", sourceHandle: "exec_out", targetHandle: "exec_in" },
      { source: "cf_folder_a", target: "cf_compare", sourceHandle: "path",     targetHandle: "folder_a" },
      { source: "cf_folder_b", target: "cf_compare", sourceHandle: "path",     targetHandle: "folder_b" }
    ]
  },

  {
    id: "pad_frames",
    keywords: ["pad frames", "frame padding", "pad numbers", "rename frames", "zero pad"],
    nodes: [
      { id: "pf_start",  nodeKind: "start",              x: 0,   y: 200 },
      { id: "pf_folder", nodeKind: "fs_input_path",       x: 0,   y: 50,  props: { path: "C:/your/frames" } },
      { id: "pf_pad",    nodeKind: "nm_pad_frame_number", x: 300, y: 200, props: { padding: 4, extension: ".png" } }
    ],
    edges: [
      { source: "pf_start",  target: "pf_pad", sourceHandle: "exec_out", targetHandle: "exec_in" },
      { source: "pf_folder", target: "pf_pad", sourceHandle: "path",     targetHandle: "folder_path" }
    ]
  }

];
