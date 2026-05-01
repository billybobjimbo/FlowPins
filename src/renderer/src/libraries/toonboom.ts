// src/libraries/toonboom.ts
import { NodeSpec } from './types';

export const TOONBOOM_NODES: Record<string, NodeSpec> = {
  "tb_create_group": {
    title: "Create Group", profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in", pin_type: "exec" }, 
      { name: "parent_path", pin_type: "string" }, 
      { name: "group_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  "tb_refract": {
    title: "Refract",
    profile: "App - Toon Boom - Effects",
    inputs: [
      { name: "in_image", pin_type: "exec" },
      { name: "intensity", pin_type: "float" }, 
      { name: "height", pin_type: "float" }, 
      { name: "refract_map", pin_type: 'image'}    
    ],
    outputs: [
      { name: "out_image", pin_type: "exec" }
    ],
    default_props: { intensity: 10, height: 0 },
    ui_schema: [
      { label: "Intensity", prop_key: "intensity", type: "number" },
      { label: "Height", prop_key: "height", type: "number" }
    ],
    
  },
  "tb_blur_radial": {
    title: "Radial Blur",
    profile: "App - Toon Boom - Blur",
    inputs: [
      { name: "in_image", pin_type: "exec" },
      { name: "radius", pin_type: "float" },   
      { name: "quality", pin_type: "string" }  
    ],
    outputs: [
      { name: "out_image", pin_type: "exec" }
    ],
    default_props: { radius: 5, quality: "HIGH" },
    ui_schema: [
      { label: "Radius", prop_key: "radius", type: "number" },
      { label: "Quality", prop_key: "quality", type: "input" } 
    ],
    
  },

  
  "tb_create_node": {
    title: "Create Node", profile: "App - Toon Boom - Scene",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "parent_path", pin_type: "string" }, { name: "node_name", pin_type: "string" }, { name: "node_type", pin_type: "string" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  "tb_create_drawing": {
    title: 'Create Drawing',
    profile: 'App - Toon Boom - Scene',
    inputs: [
      { name: 'exec_in', pin_type: 'exec' },
      { name: 'node_name', pin_type: 'string' },
      { name: 'offset_x', pin_type: 'int' },
      { name: 'offset_y', pin_type: 'int' }
    ],
    outputs: [
      { name: 'exec_out', pin_type: 'exec' },
      { name: 'out_image', pin_type: 'image' } 
    ],
    // ... default_props, etc ...
  
    
    default_props: { offset_x: 0, offset_y: 0 },
    ui_schema: [
      { label: "Drawing Name", prop_key: "node_name", type: "input" },
      { label: "Offset X", prop_key: "offset_x", type: "number" },
      { label: "Offset Y", prop_key: "offset_y", type: "number" }
    ],
    
  },
  "tb_create_composite": {
    title: "Create Composite",
    profile: "App - Toon Boom - Composite",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x", pin_type: "int" },
      { name: "offset_y", pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { offset_x: 0, offset_y: 0 },
    ui_schema: [
      { label: "Composite Name", prop_key: "node_name", type: "input" },
      { label: "Offset X", prop_key: "offset_x", type: "number" },
      { label: "Offset Y", prop_key: "offset_y", type: "number" }
    ],
    
  },
  "tb_link_nodes": {
    title: "Link Nodes",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in",     pin_type: "exec"   },
      { name: "source_node", pin_type: "string" },
      { name: "source_port", pin_type: "int"    },
      { name: "target_node", pin_type: "string" },
      { name: "target_port", pin_type: "int"    }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { source_port: 0, target_port: 0 },
    ui_schema: [
      { label: "Source Node", prop_key: "source_node", type: "input"  },
      { label: "Source Port", prop_key: "source_port", type: "number" },
      { label: "Target Node", prop_key: "target_node", type: "input"  },
      { label: "Target Port", prop_key: "target_port", type: "number" }
    ]
  },
  "tb_publish_slider": {
    title: "Publish Slider", profile: "App - Toon Boom - Scene",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "node_path", pin_type: "string" }, { name: "attr_name", pin_type: "string" }, { name: "publish_name", pin_type: "string" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  "tb_end_macro": {
    title: "End Macro", profile: "App - Toon Boom - Scene",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [],
    
  },
  "tb_ui_dialog": {
    title: "Dialog Window", profile: "App - Toon Boom - UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }], 
    default_props: { title: "Node Navigator", width: 300, height: 400 },
    
  },
  "tb_ui_input": {
    title: "Line Input", profile: "App - Toon Boom - UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }, { name: "value", pin_type: "string" }], 
    default_props: { var_name: "nameInput" },
    
  },
  "tb_ui_button": {
    title: "Button", profile: "App - Toon Boom - UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }, { name: "clicked", pin_type: "exec" }], 
    default_props: { var_name: "addButton", label: "Button" },
    
  },
  "tb_ui_list": {
    title: "List Widget", profile: "App - Toon Boom - UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [{ name: "item_clicked", pin_type: "exec" }], 
    default_props: { var_name: "nameList" },
    
  },
  "tb_msg_box": {
    title: "Message Box",
    profile: "App - Toon Boom - UI",
    inputs:  [{ name: "exec_in", pin_type: "exec" }, { name: "message", pin_type: "string" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { message: "FlowPins message" },
    ui_schema: [
      { label: "Message", prop_key: "message", type: "input" }
    ]
  },
  "tb_navigate_to_node": {
    title: "Navigate to Node", profile: "App - Toon Boom - UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "node_name", pin_type: "string" }], 
    outputs: [{ name: "success", pin_type: "exec" }, { name: "not_found", pin_type: "exec" }],
    
  },
  "uni_joint": {
    title: "Peg",
    profile: "App - Toon Boom - Rigging",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "name", pin_type: "string" },
      { name: "offset_x", pin_type: "int" }, // <-- Added X Offset
      { name: "offset_y", pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { offset_x: 0, offset_y: 0 },
    ui_schema: [
      { label: "Node Name", prop_key: "name", type: "input" },
      { label: "Offset X", prop_key: "offset_x", type: "number" },
      { label: "Offset Y", prop_key: "offset_y", type: "number" }
    ],
    
  },
  "uni_drawing": {
    title: "Drawing (Read)",
    profile: "App - Toon Boom - Rigging",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "name", pin_type: "string" },
      { name: "offset_y", pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { name: "Drawing", offset_y: 0 },
    ui_schema: [
      { label: "Drawing Name", prop_key: "name", type: "input" },
      { label: "Offset Y", prop_key: "offset_y", type: "number" }
    ],
    
  },

  "tb_get_root": {
    title: "Get Root Node", profile: "App - Toon Boom - Query",
    inputs: [], 
    outputs: [{ name: "root", pin_type: "string" }],
    
  },
  "tb_get_subnodes": {
    title: "Get Sub-Nodes", profile: "App - Toon Boom - Query",
    inputs: [{ name: "parent_node", pin_type: "string" }], 
    outputs: [{ name: "list", pin_type: "list" }],
    
  },
  "tb_get_name": {
    title: "Get Node Name", profile: "App - Toon Boom - Query",
    inputs: [{ name: "node_path", pin_type: "string" }], 
    outputs: [{ name: "name", pin_type: "string" }],
    
  },
  "tb_node_type": {
    title: "Get Node Type", profile: "App - Toon Boom - Query",
    inputs: [{ name: "node_path", pin_type: "string" }], 
    outputs: [{ name: "type", pin_type: "string" }],
    
  },
  "tb_select_node": {
    title: "Select Node", profile: "App - Toon Boom - Query",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "node_path", pin_type: "string" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  "tb_action_perform": {
    title: "Perform Action",
    profile: "App - Toon Boom - Query",
    inputs: [
      { name: "exec_in",     pin_type: "exec"   },
      { name: "action_name", pin_type: "string" },
      { name: "view_name",   pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      action_name: "onActionFocusOnSelectionNV()",
      view_name:   "Node View"
    },
    ui_schema: [
      { label: "Action Name", prop_key: "action_name", type: "input" },
      { label: "View Name",   prop_key: "view_name",   type: "input" }
    ]
  },
  "tb_simple_dialog": {
    title: "Simple Window",
    profile: "App - Toon Boom - UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  "uni_search_node": {
    title: "Search & Select",
    profile: "App - Toon Boom - Rigging",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  "tb_dynamic_refract": {
    title: "Refract Pro (Dynamic)",
    profile: "App - Toon Boom - Effects",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "group_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { blur_type: "Box" },
    ui_schema: [
      { 
        label: "Blur Type", 
        prop_key: "blur_type", 
        type: "dropdown", 
        options: ["Box", "Gaussian", "Radial"] 
      }
    ],
    
  }, // This comma and brace close tb_dynamic_refract correctly
  "tb_macro_refract_pro": {
    title: "Refract Pro (Switch Rig)", 
    profile: "App - Toon Boom - Effects",
    inputs: [
      { name: "exec_in", pin_type: "exec" }, 
      { name: "group_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },


  // ==========================================================================
  // WAVE 2 NODES — All type strings confirmed from .xstage
  // ==========================================================================

// ==========================================================================
  // COMPOSITING
  // ==========================================================================

  "tb_composite": {
    title: "Composite",
    profile: "App - Toon Boom - Composite",
    inputs: [
      { name: "exec_in",    pin_type: "exec" },
      { name: "node_name",  pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name: "Composite",
      offset_x: 0,
      offset_y: 0,
      composite_mode: "compositeBitmap",
      flatten: "true"
    },
    ui_schema: [
      { label: "Node Name",       prop_key: "node_name",       type: "input" },
      { label: "Offset X",        prop_key: "offset_x",        type: "number" },
      { label: "Offset Y",        prop_key: "offset_y",        type: "number" },
      { label: "Composite Mode",  prop_key: "composite_mode",  type: "dropdown",
        options: ["compositeBitmap", "Add", "Screen", "Multiply", "None"] },
      { label: "Flatten Output",  prop_key: "flatten",         type: "dropdown",
        options: ["true", "false"] }
    ]
  },

  "tb_display": {
    title: "Display",
    profile: "App - Toon Boom - Output",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { node_name: "Display", offset_x: 0, offset_y: 0 },
    ui_schema: [
      { label: "Node Name", prop_key: "node_name", type: "input" },
      { label: "Offset X",  prop_key: "offset_x",  type: "number" },
      { label: "Offset Y",  prop_key: "offset_y",  type: "number" }
    ]
  },

  "tb_write": {
    title: "Write (Render)",
    profile: "App - Toon Boom - Output",
    inputs: [
      { name: "exec_in",    pin_type: "exec" },
      { name: "node_name",  pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name:     "Write",
      drawing_name:  "frames/final-",
      drawing_type:  "PNG4",
      leading_zeros: 4,
      color_space:   "sRGB"
    },
    ui_schema: [
      { label: "Node Name",     prop_key: "node_name",     type: "input" },
      { label: "Output Path",   prop_key: "drawing_name",  type: "input" },
      { label: "Format",        prop_key: "drawing_type",  type: "dropdown",
        options: ["PNG4", "TGA", "EXR", "PSD", "TIFF"] },
      { label: "Leading Zeros", prop_key: "leading_zeros", type: "number" },
      { label: "Colour Space",  prop_key: "color_space",   type: "dropdown",
        options: ["sRGB", "Linear", "ACES"] }
    ]
  },

  "tb_visibility": {
    title: "Visibility",
    profile: "App - Toon Boom - Composite",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { node_name: "Visibility", visible: "true" },
    ui_schema: [
      { label: "Node Name", prop_key: "node_name", type: "input" },
      { label: "Visible",   prop_key: "visible",   type: "dropdown",
        options: ["true", "false"] }
    ]
  },

  "tb_image_switch": {
    title: "Image Switch",
    profile: "App - Toon Boom - Composite",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { node_name: "Image-Switch", port_index: 0 },
    ui_schema: [
      { label: "Node Name",  prop_key: "node_name",  type: "input" },
      { label: "Port Index", prop_key: "port_index", type: "number" }
    ]
  },

  // ==========================================================================
  // BLUR NODES — all type strings confirmed from xstage
  // ==========================================================================

  "tb_blur_box": {
    title: "Blur Box",
    profile: "App - Toon Boom - Blur",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name:     "Blur-Box",
      offset_x:      0,
      offset_y:      0,
      radius:        5,
      bidirectional: "true",
      precision:     "Medium8",
      iterations:    1
    },
    ui_schema: [
      { label: "Node Name",     prop_key: "node_name",     type: "input" },
      { label: "Offset X",      prop_key: "offset_x",      type: "number" },
      { label: "Offset Y",      prop_key: "offset_y",      type: "number" },
      { label: "Radius",        prop_key: "radius",        type: "number" },
      { label: "Bidirectional", prop_key: "bidirectional", type: "dropdown",
        options: ["true", "false"] },
      { label: "Quality",       prop_key: "precision",     type: "dropdown",
        options: ["Low8", "Medium8", "High8"] },
      { label: "Iterations",    prop_key: "iterations",    type: "number" }
    ]
  },

  "tb_blur_gaussian": {
    title: "Blur Gaussian",
    profile: "App - Toon Boom - Blur",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name:   "Blur-Gaussian",
      offset_x:    0,
      offset_y:    0,
      blurriness:  5,
      precision:   "Medium8"
    },
    ui_schema: [
      { label: "Node Name",  prop_key: "node_name",  type: "input" },
      { label: "Offset X",   prop_key: "offset_x",   type: "number" },
      { label: "Offset Y",   prop_key: "offset_y",   type: "number" },
      { label: "Blurriness", prop_key: "blurriness", type: "number" },
      { label: "Quality",    prop_key: "precision",  type: "dropdown",
        options: ["Low8", "Medium8", "High8"] }
    ]
  },

  "tb_blur_variable": {
    title: "Blur Variable",
    profile: "App - Toon Boom - Blur",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name:    "Blur-Variable",
      offset_x:     0,
      offset_y:     0,
      black_radius: 0,
      white_radius: 5,
      quality:      "HIGH"
    },
    ui_schema: [
      { label: "Node Name",    prop_key: "node_name",    type: "input" },
      { label: "Offset X",     prop_key: "offset_x",     type: "number" },
      { label: "Offset Y",     prop_key: "offset_y",     type: "number" },
      { label: "Black Radius", prop_key: "black_radius", type: "number" },
      { label: "White Radius", prop_key: "white_radius", type: "number" },
      { label: "Quality",      prop_key: "quality",      type: "dropdown",
        options: ["LOW", "MEDIUM", "HIGH"] }
    ]
  },

  "tb_blur_directional": {
    title: "Blur Directional",
    profile: "App - Toon Boom - Blur",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name: "Blur-Directional",
      offset_x:  0,
      offset_y:  0,
      radius:    5,
      angle:     0
    },
    ui_schema: [
      { label: "Node Name", prop_key: "node_name", type: "input" },
      { label: "Offset X",  prop_key: "offset_x",  type: "number" },
      { label: "Offset Y",  prop_key: "offset_y",  type: "number" },
      { label: "Radius",    prop_key: "radius",    type: "number" },
      { label: "Angle",     prop_key: "angle",     type: "number" }
    ]
  },

  "tb_matte_blur": {
    title: "Matte Blur",
    profile: "App - Toon Boom - Blur",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name:    "Matte-Blur",
      offset_x:     0,
      offset_y:     0,
      radius:       5,
      blur_type:    "RADIAL",
      invert_matte: "false"
    },
    ui_schema: [
      { label: "Node Name",    prop_key: "node_name",    type: "input" },
      { label: "Offset X",     prop_key: "offset_x",     type: "number" },
      { label: "Offset Y",     prop_key: "offset_y",     type: "number" },
      { label: "Radius",       prop_key: "radius",       type: "number" },
      { label: "Blur Type",    prop_key: "blur_type",    type: "dropdown",
        options: ["RADIAL", "DIRECTIONAL"] },
      { label: "Invert Matte", prop_key: "invert_matte", type: "dropdown",
        options: ["false", "true"] }
    ]
  },

  "tb_matte_resize": {
    title: "Matte Resize",
    profile: "App - Toon Boom - Blur",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { node_name: "Matte-Resize", offset_x: 0, offset_y: 0, radius: 0 },
    ui_schema: [
      { label: "Node Name", prop_key: "node_name", type: "input" },
      { label: "Offset X",  prop_key: "offset_x",  type: "number" },
      { label: "Offset Y",  prop_key: "offset_y",  type: "number" },
      { label: "Radius",    prop_key: "radius",    type: "number" }
    ]
  },

  // ==========================================================================
  // COLOUR / EFFECTS NODES
  // ==========================================================================

  "tb_glow": {
    title: "Glow",
    profile: "App - Toon Boom - Effects",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name:    "Glow",
      offset_x:     0,
      offset_y:     0,
      radius:       5,
      blur_type:    "RADIAL",
      colour_gain:  1,
      invert_matte: "false",
      multiplicative: "false"
    },
    ui_schema: [
      { label: "Node Name",     prop_key: "node_name",     type: "input" },
      { label: "Offset X",      prop_key: "offset_x",      type: "number" },
      { label: "Offset Y",      prop_key: "offset_y",      type: "number" },
      { label: "Radius",        prop_key: "radius",        type: "number" },
      { label: "Blur Type",     prop_key: "blur_type",     type: "dropdown",
        options: ["RADIAL", "DIRECTIONAL"] },
      { label: "Colour Gain",   prop_key: "colour_gain",   type: "number" },
      { label: "Multiplicative",prop_key: "multiplicative",type: "dropdown",
        options: ["false", "true"] }
    ]
  },

  "tb_highlight": {
    title: "Highlight",
    profile: "App - Toon Boom - Effects",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name:   "Highlight",
      offset_x:    0,
      offset_y:    0,
      radius:      2,
      blur_type:   "RADIAL",
      colour_gain: 1
    },
    ui_schema: [
      { label: "Node Name",   prop_key: "node_name",   type: "input" },
      { label: "Offset X",    prop_key: "offset_x",    type: "number" },
      { label: "Offset Y",    prop_key: "offset_y",    type: "number" },
      { label: "Radius",      prop_key: "radius",      type: "number" },
      { label: "Blur Type",   prop_key: "blur_type",   type: "dropdown",
        options: ["RADIAL", "DIRECTIONAL"] },
      { label: "Colour Gain", prop_key: "colour_gain", type: "number" }
    ]
  },

  "tb_tone": {
    title: "Tone",
    profile: "App - Toon Boom - Effects",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name:   "Tone",
      offset_x:    0,
      offset_y:    0,
      radius:      2,
      blur_type:   "RADIAL",
      colour_gain: 1
    },
    ui_schema: [
      { label: "Node Name",   prop_key: "node_name",   type: "input" },
      { label: "Offset X",    prop_key: "offset_x",    type: "number" },
      { label: "Offset Y",    prop_key: "offset_y",    type: "number" },
      { label: "Radius",      prop_key: "radius",      type: "number" },
      { label: "Blur Type",   prop_key: "blur_type",   type: "dropdown",
        options: ["RADIAL", "DIRECTIONAL"] },
      { label: "Colour Gain", prop_key: "colour_gain", type: "number" }
    ]
  },

  "tb_colour_scale": {
    title: "Colour Scale",
    profile: "App - Toon Boom - Colour",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name:  "Colour-Scale",
      offset_x:   0,
      offset_y:   0,
      red:        1,
      green:      1,
      blue:       1,
      alpha:      1,
      saturation: 1,
      value:      1
    },
    ui_schema: [
      { label: "Node Name",  prop_key: "node_name",  type: "input" },
      { label: "Offset X",   prop_key: "offset_x",   type: "number" },
      { label: "Offset Y",   prop_key: "offset_y",   type: "number" },
      { label: "Red",        prop_key: "red",        type: "number" },
      { label: "Green",      prop_key: "green",      type: "number" },
      { label: "Blue",       prop_key: "blue",       type: "number" },
      { label: "Alpha",      prop_key: "alpha",      type: "number" },
      { label: "Saturation", prop_key: "saturation", type: "number" },
      { label: "Value",      prop_key: "value",      type: "number" }
    ]
  },

  "tb_hue_saturation": {
    title: "Hue Saturation",
    profile: "App - Toon Boom - Colour",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name:  "Hue-Saturation",
      offset_x:   0,
      offset_y:   0,
      hue_shift:  0,
      saturation: 0,
      lightness:  0
    },
    ui_schema: [
      { label: "Node Name",  prop_key: "node_name",  type: "input" },
      { label: "Offset X",   prop_key: "offset_x",   type: "number" },
      { label: "Offset Y",   prop_key: "offset_y",   type: "number" },
      { label: "Hue Shift",  prop_key: "hue_shift",  type: "number" },
      { label: "Saturation", prop_key: "saturation", type: "number" },
      { label: "Lightness",  prop_key: "lightness",  type: "number" }
    ]
  },

  "tb_colour_card": {
    title: "Colour Card",
    profile: "App - Toon Boom - Colour",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name: "Colour-Card",
      offset_x:  0,
      offset_y:  0,
      offset_z:  -12
    },
    ui_schema: [
      { label: "Node Name", prop_key: "node_name", type: "input" },
      { label: "Offset X",  prop_key: "offset_x",  type: "number" },
      { label: "Offset Y",  prop_key: "offset_y",  type: "number" },
      { label: "Z Depth",   prop_key: "offset_z",  type: "number" }
    ]
  },

  "tb_cutter": {
    title: "Cutter",
    profile: "App - Toon Boom - Colour",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name: "Cutter",
      offset_x:  0,
      offset_y:  0,
      inverted:  "false"
    },
    ui_schema: [
      { label: "Node Name", prop_key: "node_name", type: "input" },
      { label: "Offset X",  prop_key: "offset_x",  type: "number" },
      { label: "Offset Y",  prop_key: "offset_y",  type: "number" },
      { label: "Inverted",  prop_key: "inverted",  type: "dropdown",
        options: ["false", "true"] }
    ]
  },

  "tb_gradient": {
    title: "Gradient",
    profile: "App - Toon Boom - Effects",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name:    "Gradient",
      offset_x:     0,
      offset_y:     0,
      gradient_type: "LINEAR"
    },
    ui_schema: [
      { label: "Node Name",      prop_key: "node_name",     type: "input" },
      { label: "Offset X",       prop_key: "offset_x",      type: "number" },
      { label: "Offset Y",       prop_key: "offset_y",      type: "number" },
      { label: "Gradient Type",  prop_key: "gradient_type", type: "dropdown",
        options: ["LINEAR", "RADIAL"] }
    ]
  },

  "tb_colour_override": {
    title: "Colour Override",
    profile: "App - Toon Boom - Colour",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { node_name: "Colour-Override", offset_x: 0, offset_y: 0 },
    ui_schema: [
      { label: "Node Name", prop_key: "node_name", type: "input" },
      { label: "Offset X",  prop_key: "offset_x",  type: "number" },
      { label: "Offset Y",  prop_key: "offset_y",  type: "number" }
    ]
  },

  "tb_multi_layer_write": {
    title: "Multi-Layer Write",
    profile: "App - Toon Boom - Output",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x",  pin_type: "int" },
      { name: "offset_y",  pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: {
      node_name:    "Multi-Layer-Write",
      offset_x:     0,
      offset_y:     0,
      drawing_name: "frames/final-",
      drawing_type: "PSD",
      color_space:  "sRGB"
    },
    ui_schema: [
      { label: "Node Name",   prop_key: "node_name",    type: "input" },
      { label: "Offset X",    prop_key: "offset_x",     type: "number" },
      { label: "Offset Y",    prop_key: "offset_y",     type: "number" },
      { label: "Output Path", prop_key: "drawing_name", type: "input" },
      { label: "Format",      prop_key: "drawing_type", type: "dropdown",
        options: ["PSD", "EXR", "PNG4", "TGA"] },
      { label: "Colour Space",prop_key: "color_space",  type: "dropdown",
        options: ["sRGB", "Linear", "ACES"] }
    ]
  },

  "tb_set_camera_fov": {
    title: "Set Camera FOV",
    profile: "App - Toon Boom - Camera",
    inputs: [
      { name: "exec_in",     pin_type: "exec" },
      { name: "cam_name",    pin_type: "string" },
      { name: "fov_degrees", pin_type: "float" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { cam_name: "Camera", fov_degrees: 41 },
    ui_schema: [
      { label: "Camera Node Name", prop_key: "cam_name",    type: "input" },
      { label: "FOV Degrees",      prop_key: "fov_degrees", type: "number" }
    ]
  },


  // ==========================================================================
  // NAV TO NODE UTILITY NODES
  // ==========================================================================

  "tb_get_top_level_groups": {
    title: "Get Top Level Groups",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in", pin_type: "exec" }
    ],
    outputs: [
      { name: "exec_out",    pin_type: "exec" },
      { name: "group_list",  pin_type: "list" },
      { name: "group_count", pin_type: "int"  }
    ],
    default_props: {},
    ui_schema: []
  },

  "tb_find_multiport_out": {
    title: "Find MultiPort Out",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in",    pin_type: "exec"   },
      { name: "group_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",  pin_type: "exec"    },
      { name: "node_path", pin_type: "string"  },
      { name: "found",     pin_type: "boolean" }
    ],
    default_props: {},
    ui_schema: []
  },

  "tb_nav_anchor_exists": {
    title: "NAV Anchor Exists",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in",    pin_type: "exec"   },
      { name: "group_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",    pin_type: "exec"    },
      { name: "exists",      pin_type: "boolean" },
      { name: "anchor_path", pin_type: "string"  }
    ],
    default_props: { nav_prefix: "NAV_" },
    ui_schema: [
      { label: "NAV Prefix", prop_key: "nav_prefix", type: "input" }
    ]
  },

  "tb_plant_nav_composite": {
    title: "Plant NAV Composite",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in",     pin_type: "exec"   },
      { name: "group_path",  pin_type: "string" },
      { name: "mp_out_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",    pin_type: "exec"   },
      { name: "anchor_path", pin_type: "string" },
      { name: "anchor_name", pin_type: "string" }
    ],
    default_props: { nav_prefix: "NAV_", x_offset: 200 },
    ui_schema: [
      { label: "NAV Prefix", prop_key: "nav_prefix", type: "input"  },
      { label: "X Offset",   prop_key: "x_offset",   type: "number" }
    ]
  },

  "tb_get_node_coord": {
    title: "Get Node Coordinate",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in",   pin_type: "exec"   },
      { name: "node_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out", pin_type: "exec"  },
      { name: "coord_x",  pin_type: "float" },
      { name: "coord_y",  pin_type: "float" },
      { name: "coord_z",  pin_type: "float" }
    ],
    default_props: {},
    ui_schema: []
  },

  "tb_get_group_short_name": {
    title: "Get Group Short Name",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in",    pin_type: "exec"   },
      { name: "group_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",   pin_type: "exec"   },
      { name: "short_name", pin_type: "string" }
    ],
    default_props: {},
    ui_schema: []
  },

  "tb_launch_nav_window": {
    title: "Launch Nav Window",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in",    pin_type: "exec"   },
      { name: "nav_prefix", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out", pin_type: "exec" }
    ],
    default_props: { nav_prefix: "NAV_", title: "NAV TO NODE" },
    ui_schema: [
      { label: "NAV Prefix", prop_key: "nav_prefix", type: "input" },
      { label: "Window Title",prop_key: "title",      type: "input" }
    ]
  },

  // ==========================================================================
  // SCENE QUERY UTILITY NODES
  // ==========================================================================

  "tb_get_nodes_by_type": {
    title: "Get All Nodes By Type",
    profile: "App - Toon Boom - Query",
    inputs: [
      { name: "exec_in",    pin_type: "exec"   },
      { name: "root_path",  pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",   pin_type: "exec"   },
      { name: "node_list",  pin_type: "list"   },
      { name: "node_names", pin_type: "list"   },
      { name: "node_count", pin_type: "int"    }
    ],
    default_props: {
      node_type: "DISPLAY",
      root_path: "Top"
    },
    ui_schema: [
      { label: "Node Type",  prop_key: "node_type", type: "input" },
      { label: "Root Path",  prop_key: "root_path", type: "input" }
    ]
  },

  "tb_set_active_display": {
    title: "Set Active Display",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in",      pin_type: "exec"   },
      { name: "display_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out", pin_type: "exec" }
    ],
    default_props: {},
    ui_schema: []
  },

  "tb_get_selected_node": {
    title: "Get Selected Node",
    profile: "App - Toon Boom - Query",
    inputs: [
      { name: "exec_in", pin_type: "exec" }
    ],
    outputs: [
      { name: "exec_out",   pin_type: "exec"   },
      { name: "node_path",  pin_type: "string" },
      { name: "node_name",  pin_type: "string" },
      { name: "node_type",  pin_type: "string" }
    ],
    default_props: {},
    ui_schema: []
  },

  "tb_filter_list_by_type": {
    title: "Filter List By Type",
    profile: "App - Toon Boom - Query",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_list", pin_type: "list" }
    ],
    outputs: [
      { name: "exec_out",      pin_type: "exec" },
      { name: "filtered_list", pin_type: "list" },
      { name: "filtered_count",pin_type: "int"  }
    ],
    default_props: { node_type: "DISPLAY" },
    ui_schema: [
      { label: "Node Type", prop_key: "node_type", type: "input" }
    ]
  },

  // ==========================================================================
  // PHASE 1 — SHARED UTILITY NODES
  // Used across linkThisOut, getOverHere, nodeToGroupLinker, COMPO
  // ==========================================================================

  "tb_get_selection_count": {
    title: "Get Selection Count",
    profile: "App - Toon Boom - Query",
    inputs: [
      { name: "exec_in", pin_type: "exec" }
    ],
    outputs: [
      { name: "exec_out", pin_type: "exec" },
      { name: "count",    pin_type: "int"  }
    ],
    default_props: {},
    ui_schema: []
  },

  "tb_get_selected_nodes": {
    title: "Get Selected Nodes",
    profile: "App - Toon Boom - Query",
    inputs: [
      { name: "exec_in", pin_type: "exec" }
    ],
    outputs: [
      { name: "exec_out",   pin_type: "exec"   },
      { name: "node_list",  pin_type: "list"   },
      { name: "count",      pin_type: "int"    }
    ],
    default_props: {},
    ui_schema: []
  },

  "tb_get_parent_group": {
    title: "Get Parent Group",
    profile: "App - Toon Boom - Query",
    inputs: [
      { name: "exec_in",   pin_type: "exec"   },
      { name: "node_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out",    pin_type: "exec"   },
      { name: "parent_path", pin_type: "string" },
      { name: "parent_name", pin_type: "string" }
    ],
    default_props: {},
    ui_schema: []
  },

  "tb_set_node_coord": {
    title: "Set Node Coordinate",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in",   pin_type: "exec"   },
      { name: "node_path", pin_type: "string" },
      { name: "x",         pin_type: "float"  },
      { name: "y",         pin_type: "float"  }
    ],
    outputs: [
      { name: "exec_out", pin_type: "exec" }
    ],
    default_props: { x: 0, y: 0 },
    ui_schema: [
      { label: "X", prop_key: "x", type: "number" },
      { label: "Y", prop_key: "y", type: "number" }
    ]
  },

  "tb_begin_undo": {
    title: "Begin Undo Block",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in",    pin_type: "exec"   },
      { name: "block_name", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out", pin_type: "exec" }
    ],
    default_props: { block_name: "FlowPins_Action" },
    ui_schema: [
      { label: "Block Name", prop_key: "block_name", type: "input" }
    ]
  },

  "tb_end_undo": {
    title: "End Undo Block",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in",    pin_type: "exec"   },
      { name: "block_name", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out", pin_type: "exec" }
    ],
    default_props: { block_name: "FlowPins_Action" },
    ui_schema: [
      { label: "Block Name", prop_key: "block_name", type: "input" }
    ]
  },

  "tb_get_active_view_group": {
    title: "Get Active View Group",
    profile: "App - Toon Boom - Query",
    inputs: [
      { name: "exec_in", pin_type: "exec" }
    ],
    outputs: [
      { name: "exec_out",    pin_type: "exec"   },
      { name: "group_path",  pin_type: "string" },
      { name: "group_name",  pin_type: "string" }
    ],
    default_props: {},
    ui_schema: []
  },

  "tb_string_append": {
    title: "Append String",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in", pin_type: "exec"   },
      { name: "base",    pin_type: "string" },
      { name: "suffix",  pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out", pin_type: "exec"   },
      { name: "result",   pin_type: "string" }
    ],
    default_props: { suffix: "/Multi-Port-Out" },
    ui_schema: [
      { label: "Suffix", prop_key: "suffix", type: "input" }
    ]
  },

  "tb_sort_nodes_by_x": {
    title: "Sort Nodes By X",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in",   pin_type: "exec" },
      { name: "node_list", pin_type: "list" }
    ],
    outputs: [
      { name: "exec_out",    pin_type: "exec"   },
      { name: "sorted_list", pin_type: "list"   },
      { name: "first_node",  pin_type: "string" }
    ],
    default_props: { direction: "descending" },
    ui_schema: [
      { label: "Direction", prop_key: "direction", type: "dropdown",
        options: ["descending", "ascending"] }
    ]
  },

  "tb_arrange_nodes_near_target": {
    title: "Arrange Nodes Near Target",
    profile: "App - Toon Boom - Scene",
    inputs: [
      { name: "exec_in",     pin_type: "exec"   },
      { name: "node_list",   pin_type: "list"   },
      { name: "target_path", pin_type: "string" }
    ],
    outputs: [
      { name: "exec_out", pin_type: "exec" }
    ],
    default_props: { offset_x: 500, offset_y: 100 },
    ui_schema: [
      { label: "Offset X", prop_key: "offset_x", type: "number" },
      { label: "Offset Y", prop_key: "offset_y", type: "number" }
    ]
  },

};