// src/renderer/src/libraries/core_logic.ts
// ============================================================================
// FLOWPINS: CORE NODE LIBRARY
// Language-agnostic node specifications.
//
// Pin naming convention (enforced throughout all specs and translators):
//   Execution input  -> "exec_in"
//   Execution output -> "exec_out"
//   Loop body exec   -> "loop_body"
//
// Profile naming convention:
//   "Core - *"       -> language-agnostic building blocks
//   "Pipeline - *"   -> file system, validation, reporting tools
//   "App - *"        -> DCC-specific nodes
//
// To add a new node: define it here, then add translations to each
// language dictionary in /translators/
// ============================================================================
import { NodeSpec } from './types';

export const CORE_NODES: Record<string, NodeSpec> = {
  "end_macro": {
    title: "End Macro", 
    profile: "Core - Exec",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [] 
  },
  "merge_exec": {
    title: "Merge", profile: "Core - Exec",
    inputs: [{ name: "in_1", pin_type: "exec" }, { name: "in_2", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }]
  },
  "sequence": {
    title: "Sequence", profile: "Core - Exec",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [{ name: "then_1", pin_type: "exec" }, { name: "then_2", pin_type: "exec" }, { name: "then_3", pin_type: "exec" }]
  },
  "start": {
    title: "Start", profile: "Core - Exec",
    inputs: [], outputs: [{ name: "exec_out", pin_type: "exec" }]
  },
  "add_int": {
    title: "Add (int)", profile: "Core - Math",
    inputs: [{ name: "a", pin_type: "int" }, { name: "b", pin_type: "int" }],
    outputs: [{ name: "result", pin_type: "int" }]
  },
  "compare_int": {
    title: "Compare (int)", profile: "Core - Math",
    inputs: [{ name: "a", pin_type: "int" }, { name: "b", pin_type: "int" }],
    outputs: [{ name: "result", pin_type: "bool" }], 
    default_props: { op: "==" },
    ui_schema: [
      { label: "Operator (==, >, <, >=, <=)", prop_key: "op", type: "input" }
    ]
  },
  "divide_int": {
    title: "Divide (int)",
    profile: "Core - Math",
    inputs: [
      { name: "a", pin_type: "int" },
      { name: "b", pin_type: "int" }
    ],
    outputs: [{ name: "result", pin_type: "int" }],
  },
  "multiply_int": {
    title: "Multiply", profile: "Core - Math",
    inputs: [{ name: "a", pin_type: "int" }, { name: "b", pin_type: "int" }],
    outputs: [{ name: "result", pin_type: "int" }]
  },
  "random_int": {
    title: "Random Int",
    profile: "Core - Math",
    inputs: [
      { name: "min", pin_type: "int" },
      { name: "max", pin_type: "int" }
    ],
    outputs: [{ name: "val", pin_type: "int" }],
    default_props: { min: 0, max: 100 },
    
  },
  

  "subtract_int": {
    title: "Subtract (int)",
    profile: "Core - Math",
    inputs: [
      { name: "a", pin_type: "int" },
      { name: "b", pin_type: "int" }
    ],
    outputs: [{ name: "result", pin_type: "int" }],
  },
  // --- CORE: DEBUG & ERROR HANDLING ---
  "console_print": {
    title: "Print / Log", profile: "Core - Exec",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "message", pin_type: "any" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }]
  },
  "console_readline": {
    title: "Read Console Line", profile: "Core - Input",
    inputs: [],
    outputs: [{ name: "text", pin_type: "string" }]
  },

  "parse_int": {
    title: "Convert to Int", profile: "Core - Math",
    inputs: [{ name: "text", pin_type: "string" }],
    outputs: [{ name: "result", pin_type: "int" }]
  },

  "format_string_2": {
    title: "Format String (2 Args)", profile: "Core - Text",
    inputs: [
      { name: "template", pin_type: "string" }, 
      { name: "arg0", pin_type: "any" }, 
      { name: "arg1", pin_type: "any" }
    ],
    outputs: [{ name: "result", pin_type: "string" }]
  },
  "try_catch": {
    title: "Try / Catch", profile: "Core - Exec",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [{ name: "try", pin_type: "exec" }, { name: "catch", pin_type: "exec" }, { name: "error_msg", pin_type: "string" }]
  },

  // --- CORE: DICTIONARIES (MAPS) ---
  "dict_create": {
    title: "Create Dictionary", profile: "Core - Collections",
    inputs: [], outputs: [{ name: "dict", pin_type: "dict" }]
  },
  "dict_set": {
    title: "Dictionary Set", profile: "Core - Collections",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "dict", pin_type: "dict" }, { name: "key", pin_type: "string" }, { name: "value", pin_type: "any" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }]
  },
  "dict_get": {
    title: "Dictionary Get", profile: "Core - Collections",
    inputs: [{ name: "dict", pin_type: "dict" }, { name: "key", pin_type: "string" }],
    outputs: [{ name: "value", pin_type: "any" }]
  },
  "dict_has_key": {
    title: "Has Key?", profile: "Core - Collections",
    inputs: [{ name: "dict", pin_type: "dict" }, { name: "key", pin_type: "string" }],
    outputs: [{ name: "exists", pin_type: "bool" }]
  },
  "sys_import": {
    title: "Import Module",
    profile: "Core - System",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    ui_schema: [
      { label: "Module Name", prop_key: "module_name", type: "input" }
    ]
  },
  
  
  
  "if_branch": {
    title: "If (Branch)", profile: "Core - Logic",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "condition", pin_type: "bool" }],
    outputs: [{ name: "true", pin_type: "exec" }, { name: "false", pin_type: "exec" }]
  },
  "for_loop": {
    title: "For Loop",
    profile: "Core - Logic",
    inputs: [
      { name: "exec", pin_type: "exec" }, // <-- ADDED EXEC IN
      { name: "start", pin_type: "int" },
      { name: "end", pin_type: "int" }
    ],
    outputs: [
      { name: "loop_body", pin_type: "exec" },
      { name: "index", pin_type: "int" },
      { name: "exec_out", pin_type: "exec" }
    ],
    default_props: { start: 0, end: 10 },
    
  },
  
  "set_var": {
    title: "Set Variable", profile: "Core - Variables",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "var_name", pin_type: "string" }, { name: "data_in", pin_type: "any" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { var_name: "myVar" },
    ui_schema: [
      { label: "Variable Name", prop_key: "var_name", type: "input" }
    ]
  },
  "get_var": {
    title: "Get Variable", profile: "Core - Variables",
    inputs: [], 
    outputs: [{ name: "data_out", pin_type: "any" }], 
    default_props: { var_name: "myVar" },
    ui_schema: [
      { label: "Variable Name", prop_key: "var_name", type: "input" }
    ]
  },
  "list_create": {
    title: "Create List", profile: "Core - Collections",
    inputs: [],
    outputs: [{ name: "list", pin_type: "list" }] // Uses the cyan pin from your PIN_COLORS
  },
  "list_append": {
    title: "Append to List", profile: "Core - Collections",
    inputs: [
      { name: "exec_in", pin_type: "exec" }, 
      { name: "list", pin_type: "list" }, 
      { name: "item", pin_type: "any" } // "any" allows us to append strings, ints, or even other lists
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }]
  },

  // --- NEW FUNCTION NODES ---
  "func_def": {
    title: "Define Function", 
    profile: "Core - Functions",
    inputs: [], // Acts as a starting point
    outputs: [
      { name: "exec_out", pin_type: "exec" }, 
      { name: "arg0_out", pin_type: "any" } // Passes the incoming argument into the function body
    ],
    ui_schema: [{ label: "Function Name", prop_key: "func_name", type: "input" }]
  },
  "func_return": {
    title: "Return", 
    profile: "Core - Functions",
    inputs: [
      { name: "exec_in", pin_type: "exec" }, 
      { name: "value", pin_type: "any" }
    ],
    outputs: [] // End of the line
  },
  "func_call": {
    title: "Call Function", 
    profile: "Core - Functions",
    inputs: [
      { name: "exec_in", pin_type: "exec" }, 
      { name: "arg0_in", pin_type: "any" }
    ],
    outputs: [
      { name: "exec_out", pin_type: "exec" }, 
      { name: "result", pin_type: "any" }
    ],
    ui_schema: [{ label: "Function Name", prop_key: "func_name", type: "input" }]
  },
  "list_length": {
    title: "List Length", profile: "Core - Collections",
    inputs: [{ name: "list", pin_type: "list" }],
    outputs: [{ name: "length", pin_type: "int" }]
  },
  "list_get_index": {
    title: "Get Item at Index", profile: "Core - Collections",
    inputs: [{ name: "list", pin_type: "list" }, { name: "index", pin_type: "int" }],
    outputs: [{ name: "item", pin_type: "any" }]
  },
  "list_push_all": {
    title: "Add List to List", profile: "Core - Variables",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "target_list", pin_type: "list" }, { name: "source_list", pin_type: "list" }], outputs: [{ name: "exec_out", pin_type: "exec" }]
  },
  "list_pop": {
    title: "Pop Item (Get Last)", profile: "Core - Variables",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "list", pin_type: "list" }], outputs: [{ name: "exec_out", pin_type: "exec" }, { name: "item", pin_type: "any" }]
  },
  "const_string": {
    title: "Const String", profile: "Core - Data",
    inputs: [], outputs: [{ name: "text", pin_type: "string" }],
    default_props: { value: "" }
  },
  "const_int": {
    title: "Const Int",
    profile: "Core - Data",
    inputs: [],
    outputs: [{ name: "value", pin_type: "int" }],
    default_props: { value: 0 },
    ui_schema: [
      { label: "Integer Value", prop_key: "value", type: "number" }
    ]
  },
  "make_empty_list": {
    title: "Make Empty List", profile: "Core - Collections",
    inputs: [], outputs: [{ name: "list", pin_type: "list" }]
  },
  "make_list_1": {
    title: "Make List (1)", profile: "Core - Collections",
    inputs: [{ name: "item_1", pin_type: "any" }], outputs: [{ name: "list", pin_type: "list" }]
  },
  "make_list_2": {
    title: "Make List (2)", profile: "Core - Collections",
    inputs: [{ name: "item_1", pin_type: "any" }, { name: "item_2", pin_type: "any" }], outputs: [{ name: "list", pin_type: "list" }]
  },
  "make_list_3": {
    title: "Make List (3)", profile: "Core - Collections",
    inputs: [{ name: "item_1", pin_type: "any" }, { name: "item_2", pin_type: "any" }, { name: "item_3", pin_type: "any" }], outputs: [{ name: "list", pin_type: "list" }]
  },
  "keyboard_check": {
    title: "Key Held",
    profile: "App - Game Maker",
    inputs: [],
    outputs: [{ name: "is_down", pin_type: "bool" }],
    default_props: { key: "vk_right" },
    ui_schema: [
      {
        type: "dropdown",
        label: "Key to Check",
        prop_key: "key",
        options: ["vk_right", "vk_left", "vk_up", "vk_down"]
      }
    ],
    
  },

  "change_coord": {
    title: "Change Position",
    profile: "App - Game Maker",
    inputs: [{ name: "exec", pin_type: "exec" }], // <-- FIXED! The engine can now enter the node!
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { axis: "x", amount: 4 },
    ui_schema: [
      {
        type: "dropdown",
        label: "Axis (x/y)",
        prop_key: "axis",
        options: ["x", "y"]
      },
      {
        type: "number",
        label: "Speed",
        prop_key: "amount"
      }
    ],
    
  },
  "is_free": {
    title: "Is Path Free",
    profile: "App - Game Maker",
    inputs: [],
    outputs: [{ name: "free", pin_type: "bool" }],
    default_props: { x_offset: 4, y_offset: 0, obj_name: "obj_wall" },
    ui_schema: [
      {
        type: "number",
        label: "X Check (Pixels)",
        prop_key: "x_offset"
      },
      {
        type: "number",
        label: "Y Check (Pixels)",
        prop_key: "y_offset"
      },
      {
        type: "input",
        label: "Obstacle Object",
        prop_key: "obj_name"
      }
    ],
    
  },
  "drunkard_walk": {
    title: "Generate Organic Maze",
    profile: "App - Game Maker",
    inputs: [{ name: "exec", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { grid: 128, steps: 150 },
    ui_schema: [
      { type: "number", label: "Grid Size", prop_key: "grid" },
      { type: "number", label: "Walker Steps", prop_key: "steps" }
    ],
    
  },
  "auto_depth": {
    title: "Auto Depth Sort",
    profile: "App - Game Maker",
    inputs: [{ name: "exec", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {},
    ui_schema: [],
    
  },
  "camera_follow": {
    title: "Smooth Camera Follow",
    profile: "App - Game Maker",
    inputs: [{ name: "exec", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { speed: 0.1 },
    ui_schema: [
      {
        type: "number",
        label: "Follow Speed (0.01 - 1.0)",
        prop_key: "speed"
      }
    ],
    
  },
  "randomize_seed": {
    title: "Randomize Engine",
    profile: "App - Game Maker",
    inputs: [{ name: "exec", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {},
    ui_schema: [],
    
  },
  // --- NEW MATH NODES ---
  "math_modulo": {
    title: "Modulo (%)", profile: "Core - Math",
    inputs: [{ name: "a", pin_type: "int" }, { name: "b", pin_type: "int" }],
    outputs: [{ name: "result", pin_type: "int" }]
  },
  "math_power": {
    title: "Power (^)", profile: "Core - Math",
    inputs: [{ name: "base", pin_type: "int" }, { name: "exponent", pin_type: "int" }],
    outputs: [{ name: "result", pin_type: "int" }]
  },
  "math_abs": {
    title: "Absolute (Abs)", profile: "Core - Math",
    inputs: [{ name: "value", pin_type: "float" }], // Works well for distances
    outputs: [{ name: "result", pin_type: "float" }]
  },

  // --- NEW LOGIC NODES ---
  "logic_and": {
    title: "AND", profile: "Core - Logic",
    inputs: [{ name: "a", pin_type: "bool" }, { name: "b", pin_type: "bool" }],
    outputs: [{ name: "result", pin_type: "bool" }]
  },
  "logic_or": {
    title: "OR", profile: "Core - Logic",
    inputs: [{ name: "a", pin_type: "bool" }, { name: "b", pin_type: "bool" }],
    outputs: [{ name: "result", pin_type: "bool" }]
  },

  "spawn_instance": {
    title: "Spawn Instance",
    profile: "App - Game Maker",
    inputs: [
      { name: "exec", pin_type: "exec" },
      { name: "x", pin_type: "int" },
      { name: "y", pin_type: "int" }
    ],
    outputs: [
      { name: "exec_out", pin_type: "exec" },
      { name: "inst_id", pin_type: "int" } // Usually an INT or ANY in GML
    ],
    default_props: { 
      obj_name: "obj_wall", 
      layer_name: '"Instances"', // <-- Added default layer (keep the quotes so it outputs as a string in code!)
      x: 0, 
      y: 0 
    },
    ui_schema: [
      {
        type: "input",
        label: "Object Name",
        prop_key: "obj_name"
      },
      {
        type: "input",
        label: "Layer",
        prop_key: "layer_name" // <-- Added the text box for the layer
      }
    ],
},
  "while_loop": {
    title: "While Loop", profile: "Core - Logic",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "condition", pin_type: "bool" }],
    outputs: [{ name: "loop_body", pin_type: "exec" }, { name: "completed", pin_type: "exec" }]
  },
  

  
  "foreach_list": {
    title: "ForEach (List)", profile: "Core - Logic",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "list", pin_type: "list" }],
    outputs: [{ name: "loop_body", pin_type: "exec" }, { name: "completed", pin_type: "exec" }, { name: "item", pin_type: "any" }]
  },
  "compare_strings": {
    title: "Compare Strings", profile: "Core - Logic",
    inputs: [{ name: "a", pin_type: "string" }, { name: "b", pin_type: "string" }],
    outputs: [{ name: "is_equal", pin_type: "bool" }]
  },
  "check_list_not_empty": {
    title: "List Not Empty?", profile: "Core - Logic",
    inputs: [{ name: "list", pin_type: "list" }],
    outputs: [{ name: "is_not_empty", pin_type: "bool" }]
  },
  "const_bool": {
    title: "Boolean",
    profile: "Core - Data",
    inputs: [],
    outputs: [{ name: "val", pin_type: "bool" }],
    default_props: { value: "true" },
    ui_schema: [
      {
        type: "dropdown",
        label: "Boolean Value",
        prop_key: "value",
        options: ["true", "false"]
      }
    ],
  },
  "string_join_path": {
    title: "Join Path", profile: "Core - Data",
    inputs: [{ name: "parent", pin_type: "string" }, { name: "child", pin_type: "string" }], outputs: [{ name: "path", pin_type: "string" }]
  },
  
  
  
   

  // ==========================================================================
  // PIPELINE NODES - File System
  // ==========================================================================

  "fs_input_path": {
    title: "Folder Path",
    profile: "Pipeline - File System",
    inputs: [],
    outputs: [{ name: "path", pin_type: "string" }],
    default_props: { path: "C:/images" },
    ui_schema: [{ label: "Folder Path", prop_key: "path", type: "input" }]
  },

  "fs_file_path": {
    title: "File Path",
    profile: "Pipeline - File System",
    inputs: [],
    outputs: [{ name: "path", pin_type: "string" }],
    default_props: { path: "C:/images/image.png" },
    ui_schema: [{ label: "File Path", prop_key: "path", type: "input" }]
  },

  "fs_walk_folder": {
    title: "Walk Folder",
    profile: "Pipeline - File System",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "folder_path", pin_type: "string" }
    ],
    outputs: [
      { name: "loop_body",  pin_type: "exec" },
      { name: "exec_out",   pin_type: "exec" },
      { name: "file_path",  pin_type: "string" },
      { name: "file_name",  pin_type: "string" },
      { name: "file_ext",   pin_type: "string" }
    ],
    default_props: { extension_filter: ".png" },
    ui_schema: [{ label: "Extension Filter (e.g. .png)", prop_key: "extension_filter", type: "input" }]
  },

  "fs_file_exists": {
    title: "File Exists?",
    profile: "Pipeline - File System",
    inputs: [{ name: "path", pin_type: "string" }],
    outputs: [{ name: "exists", pin_type: "bool" }]
  },

  "fs_join_path": {
    title: "Join Path",
    profile: "Pipeline - File System",
    inputs: [
      { name: "folder",   pin_type: "string" },
      { name: "filename", pin_type: "string" }
    ],
    outputs: [{ name: "path", pin_type: "string" }]
  },

  "fs_get_filename": {
    title: "Get Filename",
    profile: "Pipeline - File System",
    inputs: [{ name: "path", pin_type: "string" }],
    outputs: [
      { name: "filename",  pin_type: "string" },
      { name: "stem",      pin_type: "string" },
      { name: "extension", pin_type: "string" }
    ]
  },

  "fs_write_log": {
    title: "Write Log File",
    profile: "Pipeline - File System",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "file_path", pin_type: "string" },
      { name: "message",   pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { file_path: "C:/output/report.txt" },
    ui_schema: [{ label: "Log File Path", prop_key: "file_path", type: "input" }]
  },

  "fs_batch_rename": {
    title: "Batch Rename",
    profile: "Pipeline - File System",
    inputs: [
      { name: "exec_in",     pin_type: "exec" },
      { name: "folder_path", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { find: "old_", replace: "new_", extension: ".png" },
    ui_schema: [
      { label: "Find Text",       prop_key: "find",      type: "input" },
      { label: "Replace With",    prop_key: "replace",   type: "input" },
      { label: "File Extension",  prop_key: "extension", type: "input" }
    ]
  },

  // ==========================================================================
  // PIPELINE NODES - Colourspace Validation
  // ==========================================================================

  "cs_read_png_profile": {
    title: "Read PNG Colourspace",
    profile: "Pipeline - Colourspace",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "file_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",     pin_type: "exec" },
      { name: "profile_name", pin_type: "string" },
      { name: "colourspace",  pin_type: "string" },
      { name: "is_tagged",    pin_type: "bool" }
    ]
  },

  "cs_check_colourspace": {
    title: "Check Colourspace",
    profile: "Pipeline - Colourspace",
    inputs: [
      { name: "colourspace", pin_type: "string" },
      { name: "expected",    pin_type: "string" }
    ],
    outputs: [
      { name: "is_correct",      pin_type: "bool" },
      { name: "result_message",  pin_type: "string" }
    ],
    default_props: { expected: "sRGB" },
    ui_schema: [{ label: "Expected Colourspace", prop_key: "expected", type: "input" }]
  },

  "cs_batch_validate": {
    title: "Batch Validate PNG Folder",
    profile: "Pipeline - Colourspace",
    inputs: [
      { name: "exec_in",     pin_type: "exec" },
      { name: "folder_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",    pin_type: "exec" },
      { name: "pass_list",   pin_type: "list" },
      { name: "fail_list",   pin_type: "list" },
      { name: "pass_count",  pin_type: "int" },
      { name: "fail_count",  pin_type: "int" }
    ],
    default_props: { expected: "sRGB" },
    ui_schema: [{ label: "Expected Colourspace", prop_key: "expected", type: "input" }]
  },

  "cs_print_report": {
    title: "Print Validation Report",
    profile: "Pipeline - Colourspace",
    inputs: [
      { name: "exec_in",     pin_type: "exec" },
      { name: "pass_list",   pin_type: "list" },
      { name: "fail_list",   pin_type: "list" },
      { name: "folder_path", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { save_report: "true" },
    ui_schema: [{
      label: "Save Report to Folder",
      prop_key: "save_report",
      type: "dropdown",
      options: ["true", "false"]
    }]
  },


// ==========================================================================
  // Pipeline - Naming
  // ==========================================================================

  "nm_check_convention": {
    title: "Check Naming Convention",
    profile: "Pipeline - Naming",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "filename",  pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",       pin_type: "exec" },
      { name: "is_valid",       pin_type: "bool" },
      { name: "result_message", pin_type: "string" }
    ],
    default_props: { pattern: "shot_###_layer_v##" },
    ui_schema: [
      { label: "Pattern (# = digit, * = any)", prop_key: "pattern", type: "input" }
    ]
  },

  "nm_extract_version": {
    title: "Extract Version Number",
    profile: "Pipeline - Naming",
    inputs: [{ name: "filename", pin_type: "string" }],
    outputs: [
      { name: "version_string", pin_type: "string" },
      { name: "version_int",    pin_type: "int" },
      { name: "found",          pin_type: "bool" }
    ]
  },

  "nm_extract_shot": {
    title: "Extract Shot Info",
    profile: "Pipeline - Naming",
    inputs: [{ name: "filename", pin_type: "string" }],
    outputs: [
      { name: "shot",    pin_type: "string" },
      { name: "scene",   pin_type: "string" },
      { name: "layer",   pin_type: "string" },
      { name: "version", pin_type: "string" }
    ],
    default_props: {
      shot_prefix:  "sh",
      scene_prefix: "sc",
      layer_prefix: "layer",
      version_prefix: "v"
    },
    ui_schema: [
      { label: "Shot Prefix (e.g. sh)",    prop_key: "shot_prefix",    type: "input" },
      { label: "Scene Prefix (e.g. sc)",   prop_key: "scene_prefix",   type: "input" },
      { label: "Layer Prefix (e.g. layer)",prop_key: "layer_prefix",   type: "input" },
      { label: "Version Prefix (e.g. v)",  prop_key: "version_prefix", type: "input" }
    ]
  },

  "nm_pad_frame_number": {
    title: "Pad Frame Numbers",
    profile: "Pipeline - Naming",
    inputs: [
      { name: "exec_in",     pin_type: "exec" },
      { name: "folder_path", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { padding: 4, extension: ".png" },
    ui_schema: [
      { label: "Frame Padding (digits)", prop_key: "padding",   type: "number" },
      { label: "File Extension",         prop_key: "extension", type: "input" }
    ]
  },

  "nm_batch_check_folder": {
    title: "Batch Check Naming",
    profile: "Pipeline - Naming",
    inputs: [
      { name: "exec_in",     pin_type: "exec" },
      { name: "folder_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",   pin_type: "exec" },
      { name: "pass_list",  pin_type: "list" },
      { name: "fail_list",  pin_type: "list" },
      { name: "pass_count", pin_type: "int" },
      { name: "fail_count", pin_type: "int" }
    ],
    default_props: { pattern: "shot_###_layer_v##", extension: ".png" },
    ui_schema: [
      { label: "Expected Pattern",  prop_key: "pattern",   type: "input" },
      { label: "File Extension",    prop_key: "extension", type: "input" }
    ]
  },

  "nm_bump_version": {
    title: "Bump Version Number",
    profile: "Pipeline - Naming",
    inputs: [{ name: "filename", pin_type: "string" }],
    outputs: [
      { name: "new_filename", pin_type: "string" },
      { name: "new_version",  pin_type: "int" }
    ],
    default_props: { version_prefix: "v", padding: 2 },
    ui_schema: [
      { label: "Version Prefix (e.g. v)", prop_key: "version_prefix", type: "input" },
      { label: "Version Padding",         prop_key: "padding",        type: "number" }
    ]
  },

  // ==========================================================================
  // Pipeline - Reporting
  // ==========================================================================

  "rp_save_csv": {
    title: "Save Results to CSV",
    profile: "Pipeline - Reporting",
    inputs: [
      { name: "exec_in",     pin_type: "exec" },
      { name: "pass_list",   pin_type: "list" },
      { name: "fail_list",   pin_type: "list" },
      { name: "folder_path", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { filename: "report.csv" },
    ui_schema: [{ label: "CSV Filename", prop_key: "filename", type: "input" }]
  },

  "rp_compare_folders": {
    title: "Compare Two Folders",
    profile: "Pipeline - Reporting",
    inputs: [
      { name: "exec_in",    pin_type: "exec" },
      { name: "folder_a",   pin_type: "string" },
      { name: "folder_b",   pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",       pin_type: "exec" },
      { name: "only_in_a",      pin_type: "list" },
      { name: "only_in_b",      pin_type: "list" },
      { name: "in_both",        pin_type: "list" },
      { name: "missing_count",  pin_type: "int" }
    ],
    default_props: { extension: ".png" },
    ui_schema: [{ label: "File Extension", prop_key: "extension", type: "input" }]
  },

  "rp_count_files": {
    title: "Count Files by Type",
    profile: "Pipeline - Reporting",
    inputs: [
      { name: "exec_in",     pin_type: "exec" },
      { name: "folder_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",   pin_type: "exec" },
      { name: "png_count",  pin_type: "int" },
      { name: "exr_count",  pin_type: "int" },
      { name: "tiff_count", pin_type: "int" },
      { name: "total_count",pin_type: "int" },
      { name: "summary",    pin_type: "string" }
    ]
  },

  "rp_print_summary": {
    title: "Print Summary",
    profile: "Pipeline - Reporting",
    inputs: [
      { name: "exec_in",  pin_type: "exec" },
      { name: "title",    pin_type: "string" },
      { name: "pass_count", pin_type: "int" },
      { name: "fail_count", pin_type: "int" },
      { name: "notes",    pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { title: "FlowPins Report" },
    ui_schema: [{ label: "Report Title", prop_key: "title", type: "input" }]
  },

  // ==========================================================================
  // Pipeline - Image
  // ==========================================================================

  "img_get_dimensions": {
    title: "Get Image Dimensions",
    profile: "Pipeline - Image",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "file_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out", pin_type: "exec" },
      { name: "width",    pin_type: "int" },
      { name: "height",   pin_type: "int" },
      { name: "summary",  pin_type: "string" }
    ]
  },

  "img_check_dimensions": {
    title: "Check Image Dimensions",
    profile: "Pipeline - Image",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "file_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",       pin_type: "exec" },
      { name: "is_correct",     pin_type: "bool" },
      { name: "result_message", pin_type: "string" },
      { name: "actual_width",   pin_type: "int" },
      { name: "actual_height",  pin_type: "int" }
    ],
    default_props: { expected_width: 1920, expected_height: 1080 },
    ui_schema: [
      { label: "Expected Width",  prop_key: "expected_width",  type: "number" },
      { label: "Expected Height", prop_key: "expected_height", type: "number" }
    ]
  },

  "img_batch_check_dimensions": {
    title: "Batch Check Dimensions",
    profile: "Pipeline - Image",
    inputs: [
      { name: "exec_in",     pin_type: "exec" },
      { name: "folder_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",   pin_type: "exec" },
      { name: "pass_list",  pin_type: "list" },
      { name: "fail_list",  pin_type: "list" },
      { name: "pass_count", pin_type: "int" },
      { name: "fail_count", pin_type: "int" }
    ],
    default_props: { expected_width: 1920, expected_height: 1080, extension: ".png" },
    ui_schema: [
      { label: "Expected Width",  prop_key: "expected_width",  type: "number" },
      { label: "Expected Height", prop_key: "expected_height", type: "number" },
      { label: "File Extension",  prop_key: "extension",       type: "input" }
    ]
  },

  "img_get_bit_depth": {
    title: "Get Bit Depth",
    profile: "Pipeline - Image",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "file_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",  pin_type: "exec" },
      { name: "bit_depth", pin_type: "int" },
      { name: "mode",      pin_type: "string" }
    ]
  },

  "img_check_bit_depth": {
    title: "Check Bit Depth",
    profile: "Pipeline - Image",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "file_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",       pin_type: "exec" },
      { name: "is_correct",     pin_type: "bool" },
      { name: "result_message", pin_type: "string" }
    ],
    default_props: { expected_bit_depth: 8 },
    ui_schema: [{
      label: "Expected Bit Depth",
      prop_key: "expected_bit_depth",
      type: "dropdown",
      options: ["8", "16", "32"]
    }]
  },

  "img_batch_validate": {
    title: "Full Image Batch Validate",
    profile: "Pipeline - Image",
    inputs: [
      { name: "exec_in",     pin_type: "exec" },
      { name: "folder_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",   pin_type: "exec" },
      { name: "pass_list",  pin_type: "list" },
      { name: "fail_list",  pin_type: "list" },
      { name: "pass_count", pin_type: "int" },
      { name: "fail_count", pin_type: "int" }
    ],
    default_props: {
      expected_width:     1920,
      expected_height:    1080,
      expected_bit_depth: 8,
      expected_cs:        "sRGB",
      extension:          ".png"
    },
    ui_schema: [
      { label: "Expected Width",      prop_key: "expected_width",     type: "number" },
      { label: "Expected Height",     prop_key: "expected_height",    type: "number" },
      { label: "Expected Bit Depth",  prop_key: "expected_bit_depth", type: "number" },
      { label: "Expected Colourspace",prop_key: "expected_cs",        type: "input" },
      { label: "File Extension",      prop_key: "extension",          type: "input" }
    ]
  },
};
