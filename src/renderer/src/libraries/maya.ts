// src/libraries/maya.ts
import { NodeSpec } from './types';

export const MAYA_NODES: Record<string, NodeSpec> = {
  "maya_get_selection": {
    title: "Get Selected Objects",
    profile: "App - Maya",
    inputs: [],
    outputs: [{ name: "selection_list", pin_type: "list" }] // Outputs a Cyan List pin!
  },
  "maya_fbx_exporter": {
    title: "Export FBX (Maya)",
    profile: "App - Maya",
    
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "export_path", pin_type: "string" }, 
      { name: "camera_name", pin_type: "string" }, 
      { name: "mesh_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    ui_schema: [
      { label: "Export Path", prop_key: "export_path", type: "input" },
      { label: "Camera Name", prop_key: "camera_name", type: "input" },
      { label: "Mesh Name", prop_key: "mesh_name", type: "input" }
    ],
    
    
  }
};