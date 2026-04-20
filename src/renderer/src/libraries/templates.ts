export const LOCAL_TEMPLATES = [
  {

    
    id: "glass_distortion",
    keywords: ["glass", "refract", "blur", "distort", "distortion", "water"],
    nodes: [
      // 1. We add the drawing node to the left, slightly lower so the wire looks clean
      { id: "ai_drawing", nodeKind: "tb_create_drawing", x: -200, y: 250 }, 
      { id: "ai_1", nodeKind: "tb_refract", x: 100, y: 150 },
      { id: "ai_2", nodeKind: "tb_blur_radial", x: 450, y: 150 }
    ],
    edges: [
      // 2. NEW WIRE: Connect the Drawing node to the new green 'refract_map' port
      { source: "ai_drawing", target: "ai_1", sourceHandle: "out_image", targetHandle: "refract_map" },
      // 3. EXISTING WIRE: Connect the Refract to the Blur
      { source: "ai_1", target: "ai_2", sourceHandle: "out_image", targetHandle: "in_image" }
    ]
  },
  {
    id: "math_addition",
    keywords: ["math", "add", "addition", "sum", "calculator", "plus"],
    nodes: [
      { id: "ai_math_1", nodeKind: "const_int", x: 100, y: 100 },
      { id: "ai_math_2", nodeKind: "const_int", x: 100, y: 250 },
      // I'm assuming you have a node called 'math_add'. If it's different, just change the nodeKind!
      { id: "ai_add_node", nodeKind: "add_int", x: 400, y: 175 } 
    ],
    edges: [
      // Wiring the two integers into the A and B ports of the Add node
      { source: "ai_math_1", target: "ai_add_node", sourceHandle: "value", targetHandle: "a" },
      { source: "ai_math_2", target: "ai_add_node", sourceHandle: "value", targetHandle: "b" }
    ]
  },
  {
    id: "logic_branch",
    keywords: ["branch", "if", "else", "condition", "logic", "check"],
    nodes: [
      { id: "ai_branch_start", nodeKind: "start", x: 100, y: 150 },
      // Assuming you have an If/Else node called 'exec_branch'
      { id: "ai_branch_node", nodeKind: "if_branch", x: 350, y: 150 }
    ],
    edges: [
      // Wiring the white execution line from Start to the Branch node
      { source: "ai_branch_start", target: "ai_branch_node", sourceHandle: "exec_out", targetHandle: "exec" }
    ]
  },
  {
    id: "exec_loop",
    keywords: ["loop", "iterate", "for loop", "repeat", "while"],
    nodes: [
      { id: "ai_loop_start", nodeKind: "start", x: 100, y: 150 },
      // Assuming a loop node called 'exec_for_loop'
      { id: "ai_loop_node", nodeKind: "for_loop", x: 350, y: 150 },
      // Dropping an int nearby to act as the loop max index
      { id: "ai_loop_max", nodeKind: "const_int", x: 100, y: 300 } 
    ],
    edges: [
      // Wire the execution line
      { source: "ai_loop_start", target: "ai_loop_node", sourceHandle: "exec_out", targetHandle: "exec" },
      // Wire the integer into the loop's max count port
      { source: "ai_loop_max", target: "ai_loop_node", sourceHandle: "value", targetHandle: "max_count" }
    ]
  },
  // ... your basic_variables template stays down here ...
    {
      id: "basic_variables",
      keywords: ["variable", "string", "int", "number", "text", "data"],
      nodes: [
        { id: "ai_v1", nodeKind: "const_string", x: 100, y: 100 },
        { id: "ai_v2", nodeKind: "const_int", x: 100, y: 250 }
      ],
      edges: [] // No edges for this one, just dropping the nodes
    },
    {
      id: "python_hello_friend",
      keywords: ["python", "hello", "friend", "greeting", "hello world"],
      nodes: [
        { id: "py_start", nodeKind: "start", x: 100, y: 250 },
        
        // The Template String
        { id: "py_template", nodeKind: "const_string", x: 100, y: 100, props: { value: "Hello, {0}!" } },
        
        // The Variable String
        { id: "py_name", nodeKind: "const_string", x: 100, y: 400, props: { value: "Friend" } },
        
        // The F-String Formatter (Using your specific node name)
        { id: "py_format", nodeKind: "format_string_2", x: 400, y: 250 },
        
        { id: "py_print", nodeKind: "console_print", x: 750, y: 250 }
      ],
      edges: [
        // Execution Flow
        { source: "py_start", target: "py_print", sourceHandle: "exec_out", targetHandle: "exec_in" },
        
        // Data Flow: Wire the template string into the 'template' port
        { source: "py_template", target: "py_format", sourceHandle: "value", targetHandle: "template" },
        
        // Data Flow: Wire "Friend" into 'arg0'
        { source: "py_name", target: "py_format", sourceHandle: "value", targetHandle: "arg0" },
        
        // Data Flow: Wire the 'result' out to the print message
        { source: "py_format", target: "py_print", sourceHandle: "result", targetHandle: "message" }
      ]
    },
    {
      id: "mummy_easter_egg",
      keywords: ["mummy", "mummies", "mummification", "pharaoh", "egypt"],
      nodes: [
        { id: "mum_start", nodeKind: "start", x: 100, y: 250 },
        
        // Generate a random number between 1 and 2
        { id: "mum_rand", nodeKind: "random_int", x: 100, y: 400, props: { min: 1, max: 2 } },
        
        // Check if the random number equals 1
        { id: "mum_const1", nodeKind: "const_int", x: 300, y: 450, props: { value: 1 } },
        { id: "mum_compare", nodeKind: "compare_int", x: 500, y: 400, props: { op: "==" } },
        
        // Branch the execution based on the result
        { id: "mum_branch", nodeKind: "if_branch", x: 700, y: 250 },
        
        // The Strings (The Facts)
        { id: "mum_str1", nodeKind: "const_string", x: 700, y: 100, props: { value: "Ancient Egyptians used natron salt to dry out mummies." } },
        { id: "mum_str2", nodeKind: "const_string", x: 700, y: 450, props: { value: "The unwrapping of mummies was a popular Victorian party theme." } },
        
        // The Outputs
        { id: "mum_print1", nodeKind: "console_print", x: 1000, y: 150 },
        { id: "mum_print2", nodeKind: "console_print", x: 1000, y: 350 }
      ],
      
      edges: [
        // --- EXECUTION FLOW (White Wires) ---
        { source: "mum_start", target: "mum_branch", sourceHandle: "exec_out", targetHandle: "exec_in" },
        { source: "mum_branch", target: "mum_print1", sourceHandle: "true", targetHandle: "exec_in" },
        { source: "mum_branch", target: "mum_print2", sourceHandle: "false", targetHandle: "exec_in" },
        
        // --- MATH & LOGIC DATA (Green/Cyan Wires) ---
        { source: "mum_rand", target: "mum_compare", sourceHandle: "result", targetHandle: "a" },
        { source: "mum_const1", target: "mum_compare", sourceHandle: "value", targetHandle: "b" },
        { source: "mum_compare", target: "mum_branch", sourceHandle: "is_equal", targetHandle: "condition" },
        
        // --- STRING DATA (Magenta Wires) ---
        { source: "mum_str1", target: "mum_print1", sourceHandle: "value", targetHandle: "message" },
        { source: "mum_str2", target: "mum_print2", sourceHandle: "value", targetHandle: "message" }
      ]
    }
  ];