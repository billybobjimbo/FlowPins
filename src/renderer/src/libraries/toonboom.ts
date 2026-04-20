// src/libraries/toonboom.ts
import { NodeSpec } from './types';

export const TOONBOOM_NODES: Record<string, NodeSpec> = {
  "tb_create_group": {
    title: "Create Group", profile: "App - Toon Boom",
    inputs: [
      { name: "exec_in", pin_type: "exec" }, 
      { name: "parent_path", pin_type: "string" }, 
      { name: "group_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  "tb_refract": {
    title: "Refract",
    profile: "App - Toon Boom",
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
    profile: "App - Toon Boom",
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
    title: "Create Node", profile: "App - Toon Boom",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "parent_path", pin_type: "string" }, { name: "node_name", pin_type: "string" }, { name: "node_type", pin_type: "string" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  "tb_create_drawing": {
    title: 'Create Drawing',
    profile: 'App - Toon Boom',
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
    profile: "App - Toon Boom",
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
    profile: "App - Toon Boom",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "source_node", pin_type: "string" },
      { name: "source_port", pin_type: "int" },
      { name: "target_node", pin_type: "string" },
      { name: "target_port", pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    ui_schema: [
      { label: "Source Node", prop_key: "source_node", type: "input" },
      { label: "Source Port", prop_key: "source_port", type: "number" },
      { label: "Target Node", prop_key: "target_node", type: "input" },
      { label: "Target Port", prop_key: "target_port", type: "number" }
    ],
    
  },
  "tb_publish_slider": {
    title: "Publish Slider", profile: "App - Toon Boom",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "node_path", pin_type: "string" }, { name: "attr_name", pin_type: "string" }, { name: "publish_name", pin_type: "string" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  "tb_end_macro": {
    title: "End Macro", profile: "App - Toon Boom",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [],
    
  },
  "tb_ui_dialog": {
    title: "Dialog Window", profile: "App - Toon Boom",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }], 
    default_props: { title: "Node Navigator", width: 300, height: 400 },
    
  },
  "tb_ui_input": {
    title: "Line Input", profile: "App - Toon Boom",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }, { name: "value", pin_type: "string" }], 
    default_props: { var_name: "nameInput" },
    
  },
  "tb_ui_button": {
    title: "Button", profile: "App - Toon Boom",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }, { name: "clicked", pin_type: "exec" }], 
    default_props: { var_name: "addButton", label: "Button" },
    
  },
  "tb_ui_list": {
    title: "List Widget", profile: "App - Toon Boom",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [{ name: "item_clicked", pin_type: "exec" }], 
    default_props: { var_name: "nameList" },
    
  },
  "tb_msg_box": {
    title: "Message Box", profile: "App - Toon Boom",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "message", pin_type: "string" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  "tb_navigate_to_node": {
    title: "Navigate to Node", profile: "App - Toon Boom",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "node_name", pin_type: "string" }], 
    outputs: [{ name: "success", pin_type: "exec" }, { name: "not_found", pin_type: "exec" }],
    
  },
  "uni_limb_builder": {
    title: "3-Part Limb Builder",
    profile: "App - Toon Boom",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "base_name", pin_type: "string" },
      { name: "side", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  
  "uni_joint": {
    title: "Joint / Peg",
    profile: "App - Toon Boom",
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
    profile: "App - Toon Boom",
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

  "tb_autopatch": {
    title: "Auto-Patch",
    profile: "App - Toon Boom",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "name", pin_type: "string" },
      { name: "offset_y", pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { name: "AutoPatch", offset_y: 0 },
    ui_schema: [
      { label: "Patch Name", prop_key: "name", type: "input" },
      { label: "Offset Y", prop_key: "offset_y", type: "number" }
    ],
    
  },
"uni_mirror_action": {
  title: "Mirror Action",
  profile: "App - Toon Boom",
  inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "prefix", pin_type: "string" }],
  outputs: [{ name: "exec_out", pin_type: "exec" }],
  default_props: { prefix: "L_" },
  
},
"tb_set_camera_fov": {
  title: "Set Camera FOV",
  profile: "App - Toon Boom",
  inputs: [
    { name: "exec_in", pin_type: "exec" },
    { name: "cam_name", pin_type: "string" },
    { name: "fov_degrees", pin_type: "float" } 
  ],
  outputs: [{ name: "exec_out", pin_type: "exec" }],
  default_props: { cam_name: "Camera" },
  ui_schema: [
    { label: "Camera Node Name", prop_key: "cam_name", type: "input" }
  ],
  
},

"tb_fbx_importer": {
  title: "Import FBX (Harmony)",
  profile: "App - Toon Boom",
  inputs: [
    { name: "exec_in", pin_type: "exec" },
    { name: "file_path", pin_type: "string" },
    { name: "node_name", pin_type: "string" }
  ],
  outputs: [{ name: "exec_out", pin_type: "exec" }],
  ui_schema: [
    { label: "FBX File Path", prop_key: "file_path", type: "input" },
    { label: "Node Name", prop_key: "node_name", type: "input" }
  ],
  
},
  "tb_get_root": {
    title: "Get Root Node", profile: "App - Toon Boom",
    inputs: [], 
    outputs: [{ name: "root", pin_type: "string" }],
    
  },
  "tb_get_subnodes": {
    title: "Get Sub-Nodes", profile: "App - Toon Boom",
    inputs: [{ name: "parent_node", pin_type: "string" }], 
    outputs: [{ name: "list", pin_type: "list" }],
    
  },
  "tb_get_name": {
    title: "Get Node Name", profile: "App - Toon Boom",
    inputs: [{ name: "node_path", pin_type: "string" }], 
    outputs: [{ name: "name", pin_type: "string" }],
    
  },
  "tb_node_type": {
    title: "Get Node Type", profile: "App - Toon Boom",
    inputs: [{ name: "node_path", pin_type: "string" }], 
    outputs: [{ name: "type", pin_type: "string" }],
    
  },
  "tb_select_node": {
    title: "Select Node", profile: "App - Toon Boom",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "node_path", pin_type: "string" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  "tb_action_perform": {
    title: "Perform Action", profile: "App - Toon Boom",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "action_name", pin_type: "string" }, { name: "view_name", pin_type: "string" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }], 
    default_props: { view_name: "Node View" },
    
  },
  "tb_simple_dialog": {
    title: "Simple Window",
    profile: "App - Toon Boom",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  "uni_search_node": {
    title: "Search & Select",
    profile: "App - Toon Boom",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  },
  "tb_dynamic_refract": {
    title: "Refract Pro (Dynamic)",
    profile: "App - Toon Boom Pro",
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
    profile: "App - Toon Boom Pro",
    inputs: [
      { name: "exec_in", pin_type: "exec" }, 
      { name: "group_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    
  }
};