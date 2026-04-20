// src/libraries/core_nodes.ts
import { NodeSpec } from './types';

export const CORE_NODES: Record<string, NodeSpec> = {
    "start": {
        title: "Start", profile: "General",
        inputs: [], 
        outputs: [{ name: "exec_out", pin_type: "exec" }] // <--- FIXED THIS NAME!
      },
      "const_string": {
        title: "Const String", profile: "Values",
        inputs: [], outputs: [{ name: "value", pin_type: "string" }],
        default_props: { value: "" },
        ui_schema: [{ label: "String Value", prop_key: "value", type: "input" }]
      },
      "const_int": {
        title: "Const Int", profile: "Values",
        inputs: [], outputs: [{ name: "value", pin_type: "int" }],
        default_props: { value: 0 },
        ui_schema: [{ label: "Integer Value", prop_key: "value", type: "number" }]
      },
  "tb_create_group": {
    title: "Create Group", profile: "ToonBoom Rigging",
    inputs: [
      { name: "exec_in", pin_type: "exec" }, 
      { name: "parent_path", pin_type: "string" }, 
      { name: "group_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }]
  },
  "tb_create_node": {
    title: "Create Node", profile: "ToonBoom Rigging",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "parent_path", pin_type: "string" }, { name: "node_name", pin_type: "string" }, { name: "node_type", pin_type: "string" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }]
  },
  "tb_create_drawing": {
    title: "Create Drawing",
    profile: "ToonBoom Rigging",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x", pin_type: "int" },
      { name: "offset_y", pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { node_name: "My_BG", offset_x: 0, offset_y: 0 },
    ui_schema: [
      { label: "Drawing Name", prop_key: "node_name", type: "input" },
      { label: "Offset X", prop_key: "offset_x", type: "number" },
      { label: "Offset Y", prop_key: "offset_y", type: "number" }
    ]
  },
  "tb_create_composite": {
    title: "Create Composite",
    profile: "ToonBoom Rigging",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "node_name", pin_type: "string" },
      { name: "offset_x", pin_type: "int" },
      { name: "offset_y", pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { node_name: "My_Merge", offset_x: 0, offset_y: 0 },
    ui_schema: [
      { label: "Composite Name", prop_key: "node_name", type: "input" },
      { label: "Offset X", prop_key: "offset_x", type: "number" },
      { label: "Offset Y", prop_key: "offset_y", type: "number" }
    ]
  },
  "tb_link_nodes": {
    title: "Link Nodes",
    profile: "ToonBoom Rigging",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "source_node", pin_type: "string" },
      { name: "source_port", pin_type: "int" },
      { name: "target_node", pin_type: "string" },
      { name: "target_port", pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { source_node: "Node_A", source_port: 0, target_node: "Node_B", target_port: 0 }, // ADD THIS LINE!
    ui_schema: [
      { label: "Source Node", prop_key: "source_node", type: "input" },
      { label: "Source Port", prop_key: "source_port", type: "number" },
      { label: "Target Node", prop_key: "target_node", type: "input" },
      { label: "Target Port", prop_key: "target_port", type: "number" }
    ]
  },
  "tb_publish_slider": {
    title: "Publish Slider", profile: "ToonBoom Rigging",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "node_path", pin_type: "string" }, { name: "attr_name", pin_type: "string" }, { name: "publish_name", pin_type: "string" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }]
  },
  "tb_end_macro": {
    title: "End Macro", profile: "ToonBoom Rigging",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: []
  },
  "tb_ui_dialog": {
    title: "Dialog Window", profile: "ToonBoom UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }], 
    default_props: { title: "Node Navigator", width: 300, height: 400 }
  },
  "tb_ui_input": {
    title: "Line Input", profile: "ToonBoom UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }, { name: "value", pin_type: "string" }], 
    default_props: { var_name: "nameInput" }
  },
  "tb_ui_button": {
    title: "Button", profile: "ToonBoom UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }, { name: "clicked", pin_type: "exec" }], 
    default_props: { var_name: "addButton", label: "Button" }
  },
  "tb_ui_list": {
    title: "List Widget", profile: "ToonBoom UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }], 
    outputs: [{ name: "item_clicked", pin_type: "exec" }], 
    default_props: { var_name: "nameList" }
  },
  "tb_msg_box": {
    title: "Message Box", profile: "ToonBoom UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "message", pin_type: "string" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }]
  },
  "tb_navigate_to_node": {
    title: "Navigate to Node", profile: "ToonBoom Logic",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "node_name", pin_type: "string" }], 
    outputs: [{ name: "success", pin_type: "exec" }, { name: "not_found", pin_type: "exec" }]
  },
  "uni_limb_builder": {
    title: "3-Part Limb Builder",
    profile: "Universal Rigging",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "base_name", pin_type: "string" },
      { name: "side", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }]
  },
  "uni_joint": {
    title: "Joint / Peg",
    profile: "Universal Rigging",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "name", pin_type: "string" },
      { name: "offset_x", pin_type: "int" },
      { name: "offset_y", pin_type: "int" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { name: "My_Transform", offset_x: 0, offset_y: 0 } // ADD THIS LINE!
  },
  "uni_drawing": {
    title: "Drawing (Read)",
    profile: "Universal Rigging",
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
    ]
  },
  "tb_autopatch": {
    title: "Auto-Patch",
    profile: "ToonBoom Rigging",
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
    ]
  },
  "uni_mirror_action": {
    title: "Mirror Action",
    profile: "Universal Rigging",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "prefix", pin_type: "string" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { prefix: "L_" }
  },
  "tb_set_camera_fov": {
    title: "Set Camera FOV",
    profile: "ToonBoom Pipeline",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "cam_name", pin_type: "string" },
      { name: "fov_degrees", pin_type: "float" } 
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { cam_name: "Camera" },
    ui_schema: [
      { label: "Camera Node Name", prop_key: "cam_name", type: "input" }
    ]
  },
  "tb_fbx_importer": {
    title: "Import FBX (Harmony)",
    profile: "ToonBoom Pipeline",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "file_path", pin_type: "string" },
      { name: "node_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    ui_schema: [
      { label: "FBX File Path", prop_key: "file_path", type: "input" },
      { label: "Node Name", prop_key: "node_name", type: "input" }
    ]
  },
  "tb_get_root": {
    title: "Get Root Node", profile: "ToonBoom Data",
    inputs: [], 
    outputs: [{ name: "root", pin_type: "string" }]
  },
  "tb_get_subnodes": {
    title: "Get Sub-Nodes", profile: "ToonBoom Data",
    inputs: [{ name: "parent_node", pin_type: "string" }], 
    outputs: [{ name: "list", pin_type: "list" }]
  },
  "tb_get_name": {
    title: "Get Node Name", profile: "ToonBoom Data",
    inputs: [{ name: "node_path", pin_type: "string" }], 
    outputs: [{ name: "name", pin_type: "string" }]
  },
  "tb_node_type": {
    title: "Get Node Type", profile: "ToonBoom Data",
    inputs: [{ name: "node_path", pin_type: "string" }], 
    outputs: [{ name: "type", pin_type: "string" }]
  },
  "tb_select_node": {
    title: "Select Node", profile: "ToonBoom Actions",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "node_path", pin_type: "string" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }]
  },
  "tb_action_perform": {
    title: "Perform Action", profile: "ToonBoom Actions",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "action_name", pin_type: "string" }, { name: "view_name", pin_type: "string" }], 
    outputs: [{ name: "exec_out", pin_type: "exec" }], 
    default_props: { view_name: "Node View" }
  },
  "tb_simple_dialog": {
    title: "Simple Window",
    profile: "ToonBoom UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }]
  },
  "uni_search_node": {
    title: "Search & Select",
    profile: "Universal Logic",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }]
  },
  "tb_dynamic_refract": {
    title: "Refract Pro (Dynamic)",
    profile: "FlowPins Advanced",
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
    ]
  },
  "tb_macro_refract_pro": {
    title: "Refract Pro (Switch Rig)", 
    profile: "ToonBoom Macros",
    inputs: [
      { name: "exec_in", pin_type: "exec" }, 
      { name: "group_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }]
  }
};