export const PIN_COLORS: Record<string, string> = {
  exec: "#ffffff",   // White square
  int: "#4caf50",    // Green circle
  string: "#ff9800", // Orange circle
  list: "#00d8ff",   // Cyan circle
  any: "#00d8ff"     // Cyan fallback
};

export interface PinSpec {
  name: string;
  pin_type: string;
}

export interface NodeSpec {
  title: string;
  profile: string;
  inputs: PinSpec[];
  outputs: PinSpec[];
  default_props?: Record<string, any>;
  translations?: Record<string, string>; 
}

export const NODE_LIBRARY: Record<string, NodeSpec> = {

  // --- EXECUTION ---
  "start": {
    title: "Start",
    profile: "Exec",
    inputs: [],
    outputs: [{ name: "exec", pin_type: "exec" }],
    translations: {
      py_maya: "# Start of script\n{exec}",
      js_toonboom: "// Start of script\n{exec}"
    }
  },

  "merge_exec": {
    title: "Merge",
    profile: "Exec",
    inputs: [
      { name: "in_1", pin_type: "exec" },
      { name: "in_2", pin_type: "exec" }
    ],
    outputs: [{ name: "out", pin_type: "exec" }],
    translations: { py_maya: "{out}", js_toonboom: "{out}" }
  },

  "sequence": {
    title: "Sequence",
    profile: "Exec",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [
      { name: "then_1", pin_type: "exec" },
      { name: "then_2", pin_type: "exec" },
      { name: "then_3", pin_type: "exec" }
    ],
    translations: { js_toonboom: "{then_1}\n{then_2}\n{then_3}" }
  },

  // --- LOGIC ---
  "if_branch": {
    title: "If (Branch)",
    profile: "Logic",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "condition", pin_type: "bool" }
    ],
    outputs: [
      { name: "true", pin_type: "exec" },
      { name: "false", pin_type: "exec" }
    ],
    translations: {
      js_toonboom: "if ({condition}) {\n{true}\n} else {\n{false}\n}"
    }
  },

  "while_loop": {
    title: "While Loop",
    profile: "Logic",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "condition", pin_type: "bool" }
    ],
    outputs: [
      { name: "loop_body", pin_type: "exec" },
      { name: "completed", pin_type: "exec" }
    ],
    translations: {
      js_toonboom: "while ({condition}) {\n{loop_body}\n}\n{completed}"
    }
  },

  "foreach_list": {
    title: "ForEach (List)",
    profile: "Logic",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "list", pin_type: "list" }
    ],
    outputs: [
      { name: "loop_body", pin_type: "exec" },
      { name: "completed", pin_type: "exec" },
      { name: "item", pin_type: "any" }
    ],
    translations: {
      js_toonboom: "{list}.forEach(function(item) {\n{loop_body}\n});\n{completed}"
    }
  },

  "compare_strings": {
    title: "Compare Strings",
    profile: "Logic",
    inputs: [
      { name: "a", pin_type: "string" },
      { name: "b", pin_type: "string" }
    ],
    outputs: [{ name: "is_equal", pin_type: "bool" }],
    translations: { js_toonboom: "({a} == {b})" }
  },

  "check_list_not_empty": {
    title: "List Not Empty?",
    profile: "Logic",
    inputs: [{ name: "list", pin_type: "list" }],
    outputs: [{ name: "is_not_empty", pin_type: "bool" }],
    translations: { js_toonboom: "({list}.length > 0)" }
  },

  // --- MATH ---
  "add_int": {
    title: "Add (int)",
    profile: "Math",
    inputs: [
      { name: "a", pin_type: "int" },
      { name: "b", pin_type: "int" }
    ],
    outputs: [{ name: "result", pin_type: "int" }],
    translations: { js_toonboom: "({a} + {b})" }
  },

  "multiply_int": {
    title: "Multiply",
    profile: "Math",
    inputs: [
      { name: "a", pin_type: "int" },
      { name: "b", pin_type: "int" }
    ],
    outputs: [{ name: "result", pin_type: "int" }],
    translations: { js_toonboom: "({a} * {b})" }
  },

  "compare_int": {
    title: "Compare (int)",
    profile: "Math",
    inputs: [
      { name: "a", pin_type: "int" },
      { name: "b", pin_type: "int" }
    ],
    outputs: [{ name: "result", pin_type: "bool" }],
    default_props: { op: "==" },
    translations: { js_toonboom: "({a} {op} {b})" }
  },
  "subtract_int": {
    title: "Subtract (int)",
    profile: "Math",
    inputs: [
      { name: "a", pin_type: "int" },
      { name: "b", pin_type: "int" }
    ],
    outputs: [{ name: "result", pin_type: "int" }],
    translations: { js_toonboom: "({a} - {b})" }
  },

  "divide_int": {
    title: "Divide (int)",
    profile: "Math",
    inputs: [
      { name: "a", pin_type: "int" },
      { name: "b", pin_type: "int" }
    ],
    outputs: [{ name: "result", pin_type: "int" }],
    translations: { js_toonboom: "({a} / {b})" }
  },

  // --- COLLECTIONS ---
  "make_empty_list": {
    title: "Make Empty List",
    profile: "Collections",
    inputs: [],
    outputs: [{ name: "list", pin_type: "list" }],
    translations: { js_toonboom: "[]" }
  },

  "make_list_1": {
    title: "Make List (1)",
    profile: "Collections",
    inputs: [{ name: "item_1", pin_type: "any" }],
    outputs: [{ name: "list", pin_type: "list" }],
    translations: { js_toonboom: "[{item_1}]" }
  },

  "make_list_2": {
    title: "Make List (2)",
    profile: "Collections",
    inputs: [{ name: "item_1", pin_type: "any" }, { name: "item_2", pin_type: "any" }],
    outputs: [{ name: "list", pin_type: "list" }],
    translations: { js_toonboom: "[{item_1}, {item_2}]" }
  },

  "make_list_3": {
    title: "Make List (3)",
    profile: "Collections",
    inputs: [{ name: "item_1", pin_type: "any" }, { name: "item_2", pin_type: "any" }, { name: "item_3", pin_type: "any" }],
    outputs: [{ name: "list", pin_type: "list" }],
    translations: { js_toonboom: "[{item_1}, {item_2}, {item_3}]" }
  },

  // --- TOONBOOM RIGGING ---
  "tb_create_group": {
    title: "Create Group",
    profile: "ToonBoom Rigging",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "parent_path", pin_type: "string" },
      { name: "group_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    translations: { js_toonboom: "node.createGroup({parent_path}, {group_name});\n{exec_out}" }
  },

  "tb_create_node": {
    title: "Create Node",
    profile: "ToonBoom Rigging",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "parent_path", pin_type: "string" },
      { name: "node_name", pin_type: "string" },
      { name: "node_type", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    translations: { js_toonboom: "node.addNode({parent_path}, {node_name}, {node_type}, 0, 0, 0);\n{exec_out}" }
  },

  "tb_link_nodes": {
    title: "Link Nodes",
    profile: "ToonBoom Rigging",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "source_node", pin_type: "string" },
      { name: "target_node", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    translations: { js_toonboom: "node.link({source_node}, 0, {target_node}, 0, false, false);\n{exec_out}" }
  },

  "tb_publish_slider": {
    title: "Publish Slider",
    profile: "ToonBoom Rigging",
    inputs: [
      { name: "exec_in", pin_type: "exec" },
      { name: "node_path", pin_type: "string" },
      { name: "attr_name", pin_type: "string" },
      { name: "publish_name", pin_type: "string" }
    ],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    translations: { js_toonboom: "node.linkAttr({node_path}, {attr_name}, '../../' + {publish_name});\n{exec_out}" }
  },

  "tb_end_macro": {
    title: "End Macro",
    profile: "ToonBoom Rigging",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [],
    translations: { js_toonboom: "// Macro complete" }
  },

  // --- TOONBOOM UI ---
  "tb_ui_dialog": {
    title: "Dialog Window",
    profile: "ToonBoom UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { title: "Node Navigator", width: 300, height: 400 },
    translations: { js_toonboom: "var dialog = new QDialog();\ndialog.setWindowTitle('{title}');\ndialog.setMinimumSize({width}, {height});\n{exec_out}" }
  },

  "tb_ui_input": {
    title: "Line Input",
    profile: "ToonBoom UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }, { name: "value", pin_type: "string" }],
    default_props: { var_name: "nameInput" },
    translations: { js_toonboom: "var {var_name} = new QLineEdit();\nlayout.addWidget({var_name}, 0, Qt.AlignTop);\n{exec_out}" }
  },

  "tb_ui_button": {
    title: "Button",
    profile: "ToonBoom UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }, { name: "clicked", pin_type: "exec" }],
    default_props: { var_name: "addButton", label: "Button" },
    translations: { js_toonboom: "var {var_name} = new QPushButton('{label}');\nlayout.addWidget({var_name}, 0, Qt.AlignTop);\n{exec_out}" }
  },

  "tb_ui_list": {
    title: "List Widget",
    profile: "ToonBoom UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }],
    outputs: [{ name: "item_clicked", pin_type: "exec" }],
    default_props: { var_name: "nameList" },
    translations: { js_toonboom: "var {var_name} = new QListWidget();\nlayout.addWidget({var_name}, 1, Qt.AlignTop);" }
  },

  "tb_msg_box": {
    title: "Message Box",
    profile: "ToonBoom UI",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "message", pin_type: "string" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    translations: { js_toonboom: "MessageBox.information({message});\n{exec_out}" }
  },

  // --- TOONBOOM LOGIC ---
  "tb_navigate_to_node": {
    title: "Navigate to Node",
    profile: "ToonBoom Logic",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "node_name", pin_type: "string" }],
    outputs: [{ name: "success", pin_type: "exec" }, { name: "not_found", pin_type: "exec" }],
    translations: { js_toonboom: "// Navigation Logic Block...\n{success}" }
  },

  // --- TOONBOOM DATA ---
  "tb_get_root": {
    title: "Get Root Node",
    profile: "ToonBoom Data",
    inputs: [],
    outputs: [{ name: "root", pin_type: "string" }],
    translations: { js_toonboom: "node.root()" }
  },

  "tb_get_subnodes": {
    title: "Get Sub-Nodes",
    profile: "ToonBoom Data",
    inputs: [{ name: "parent_node", pin_type: "string" }],
    outputs: [{ name: "list", pin_type: "list" }],
    translations: { js_toonboom: "node.subNodes({parent_node})" }
  },

  "tb_get_name": {
    title: "Get Node Name",
    profile: "ToonBoom Data",
    inputs: [{ name: "node_path", pin_type: "string" }],
    outputs: [{ name: "name", pin_type: "string" }],
    translations: { js_toonboom: "node.getName({node_path})" }
  },

  "tb_node_type": {
    title: "Get Node Type",
    profile: "ToonBoom Data",
    inputs: [{ name: "node_path", pin_type: "string" }],
    outputs: [{ name: "type", pin_type: "string" }],
    translations: { js_toonboom: "node.type({node_path})" }
  },

  // --- TOONBOOM ACTIONS ---
  "tb_select_node": {
    title: "Select Node",
    profile: "ToonBoom Actions",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "node_path", pin_type: "string" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    translations: { js_toonboom: "selection.clearSelection(); selection.addNodeToSelection({node_path});\n{exec_out}" }
  },

  "tb_action_perform": {
    title: "Perform Action",
    profile: "ToonBoom Actions",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "action_name", pin_type: "string" }, { name: "view_name", pin_type: "string" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    default_props: { view_name: "Node View" },
    translations: { js_toonboom: "Action.perform({action_name}, {view_name});\n{exec_out}" }
  },

  // --- DATA & PATHS ---
  "string_join_path": {
    title: "Join Path",
    profile: "Data",
    inputs: [{ name: "parent", pin_type: "string" }, { name: "child", pin_type: "string" }],
    outputs: [{ name: "path", pin_type: "string" }],
    translations: { js_toonboom: "({parent} + '/' + {child})" }
  },

  // --- VARIABLES ---
  "set_var": {
    title: "Set Variable",
    profile: "Variables",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "var_name", pin_type: "string" }, { name: "value", pin_type: "any" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    translations: { js_toonboom: "var {var_name} = {value};\n{exec_out}" }
  },

  "get_var": {
    title: "Get Variable",
    profile: "Variables",
    inputs: [],
    outputs: [{ name: "value", pin_type: "any" }],
    default_props: { var_name: "myVar" },
    translations: { js_toonboom: "{var_name}" }
  },

  "list_create": {
    title: "Create Empty List",
    profile: "Variables",
    inputs: [],
    outputs: [{ name: "list", pin_type: "list" }],
    translations: { js_toonboom: "[]" }
  },

  "list_push_all": {
    title: "Add List to List",
    profile: "Variables",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "target_list", pin_type: "list" }, { name: "source_list", pin_type: "list" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    translations: { js_toonboom: "{target_list} = {target_list}.concat({source_list});\n{exec_out}" }
  },

  "list_pop": {
    title: "Pop Item (Get Last)",
    profile: "Variables",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "list", pin_type: "list" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }, { name: "item", pin_type: "any" }],
    translations: { js_toonboom: "{list}.pop()" }
  },

  // --- MAYA ---
  "maya_create_locator": {
    title: "Create Locator",
    profile: "Maya",
    inputs: [{ name: "exec_in", pin_type: "exec" }, { name: "name", pin_type: "string" }],
    outputs: [{ name: "exec_out", pin_type: "exec" }],
    translations: { py_maya: "cmds.spaceLocator(n='{name}')" }
  },

  // --- VALUES ---
  "const_string": {
    title: "Const String",
    profile: "General",
    inputs: [],
    outputs: [{ name: "value", pin_type: "string" }],
    default_props: { value: "" },
    translations: { js_toonboom: '"{value}"' }
  },

  "const_int": {
    title: "Const Int",
    profile: "Values",
    inputs: [],
    outputs: [{ name: "value", pin_type: "int" }],
    default_props: { value: 0 },
    translations: { js_toonboom: "{value}" }
  }
};
