// src/renderer/src/libraries/journeys.ts
// ============================================================================
// FLOWPINS: GUIDED JOURNEY DEFINITIONS
// Each journey is a sequence of steps that Evelyn walks the user through.
//
// Step completion conditions:
//   node_exists    — a node of the given kind exists on the canvas
//   node_connected — a node kind has at least one wire connected
//   value_set      — a node has a non-empty prop value
//   manual         — user types 'next' or 'done' to advance
// ============================================================================

export type CompletionCondition =
  | { type: 'node_exists';    nodeKind: string }
  | { type: 'node_connected'; nodeKind: string }
  | { type: 'value_set';      nodeKind: string; propKey: string }
  | { type: 'manual' };

export interface JourneyStep {
  id:          string;
  evelynSays:  string;              // What Evelyn says when this step begins
  hint?:       string;              // What Evelyn says if user asks for help
  autoPlace?:  {                    // Nodes Evelyn can place on request
    nodes: { id: string; nodeKind: string; x: number; y: number; props?: Record<string,any> }[];
    edges: { source: string; target: string; sourceHandle: string; targetHandle: string }[];
  };
  completion:  CompletionCondition; // How we know the step is done
  successSays: string;              // What Evelyn says when step completes
}

export interface Journey {
  id:          string;
  title:       string;
  description: string;
  icon:        string;   // emoji or short symbol
  steps:       JourneyStep[];
  completeSays: string;  // Evelyn's message when the whole journey is done
}

// ============================================================================
// JOURNEY 1 — HELLO FLOWPINS
// The simplest possible graph. Teaches exec chain and data flow.
// ============================================================================

const HELLO_FLOWPINS: Journey = {
  id:          'hello_flowpins',
  title:       'Hello FlowPins',
  description: 'Build your first script — a simple message printer. Covers the exec chain and data pins.',
  icon:        '👋',
  completeSays: "There. Your first FlowPins script. It won't win any awards, but it runs — and that's how everything starts. Check the CODE panel to see what it compiled to.",

  steps: [
    {
      id:         'place_start',
      evelynSays: "Every FlowPins script begins with a Start node — without it nothing runs. Find it in the left panel under CORE → EXEC. Drag it anywhere onto the dark canvas. You will see it appear as a dark node with an exec_out pin (white square) on the right side. Or type 'place it' and I will drop it for you.",
      hint:       "Look in the left panel, expand CORE then EXEC. You will see the Start node listed there. Click and drag it onto the canvas. The white square pin on its right side is where execution flows out.",
      autoPlace:  {
        nodes: [{ id: 'n_start', nodeKind: 'start', x: 200, y: 250 }],
        edges: []
      },
      completion:  { type: 'node_exists', nodeKind: 'start' },
      successSays: "Good. That's your entry point — execution flows out of Start and through every node wired after it.",
    },
    {
      id:         'place_string',
      evelynSays: "Now we need some text to print. Add a CONST STRING node — it holds a piece of text. Find it in the left panel under CORE → DATA. Drag it onto the canvas below the Start node. Then click it to select it and look at the Properties panel on the right — you will see a String Value field. Type anything you like in there, for example: Hello from FlowPins! Or say 'place it' and I will add it for you.",
      hint:       "CONST STRING is under CORE → DATA in the left panel. After placing it, click the node and edit the String Value field in the Properties panel on the right side of the screen.",
      autoPlace:  {
        nodes: [{ id: 'n_str', nodeKind: 'const_string', x: 200, y: 400, props: { value: 'Hello from FlowPins!' } }],
        edges: []
      },
      completion:  { type: 'node_exists', nodeKind: 'const_string' },
      successSays: "There's your text. Click the node and edit the value in the Properties panel on the right — put whatever you like in there.",
    },
    {
      id:         'place_print',
      evelynSays: "Now add a Print / Log node. This is what actually outputs the message when the script runs. It's under EXEC on the left.",
      hint:       "Print / Log is under EXEC. Or say 'place it' and I'll drop it on the canvas.",
      autoPlace:  {
        nodes: [{ id: 'n_print', nodeKind: 'console_print', x: 500, y: 250 }],
        edges: []
      },
      completion:  { type: 'node_exists', nodeKind: 'console_print' },
      successSays: "Three nodes. Now we need to wire them together — connections are what make FlowPins work.",
    },
    {
      id:         'wire_exec',
      evelynSays: "Connect the Start node's exec_out pin to the Print node's exec_in pin. Drag from the white square on the right of Start to the white square on the left of Print. White squares are execution flow.",
      hint:       "Hover over the right edge of the Start node — you'll see the white exec_out handle appear. Drag from it to the white exec_in handle on the Print node.",
      completion:  { type: 'node_connected', nodeKind: 'console_print' },
      successSays: "That's the execution wire. When the script runs, control flows from Start directly into Print.",
    },
    {
      id:         'wire_data',
      evelynSays: "Now connect the Const String's text pin to the Print node's message pin. The coloured pins carry data — drag from the pink dot on Const String to the purple dot on Print.",
      hint:       "Data pins are the coloured dots. Drag from the pink 'text' pin on Const String to the 'message' pin on Print / Log.",
      completion:  { type: 'node_connected', nodeKind: 'const_string' },
      successSays: "Wired. Now look at the CODE panel on the left — switch to it and you'll see your script compiled into real Python.",
    },
  ]
};

// ============================================================================
// JOURNEY 2 — MAKE A DECISION
// Introduces If Branch and Compare. Teaches conditions and true/false paths.
// ============================================================================

const MAKE_A_DECISION: Journey = {
  id:          'make_a_decision',
  title:       'Make a Decision',
  description: 'Use an If Branch to run different code depending on a condition. Covers compare nodes and true/false paths.',
  icon:        '🔀',
  completeSays: "Now your script can make decisions. This is the foundation of every pipeline validation tool — check something, branch on the result, act differently on pass or fail.",

  steps: [
    {
      id:         'setup_start',
      evelynSays: "This time we're building a script that checks whether one number is greater than another and prints different messages for true and false. Start by placing a Start node.",
      hint:       "Start node is under EXEC. Or say 'place it'.",
      autoPlace:  {
        nodes: [{ id: 'n_start', nodeKind: 'start', x: 100, y: 250 }],
        edges: []
      },
      completion:  { type: 'node_exists', nodeKind: 'start' },
      successSays: "Good. Now we need two numbers to compare.",
    },
    {
      id:         'place_numbers',
      evelynSays: "Add two Const Int nodes — these will be the numbers we compare. Find them under DATA, or say 'place them'.",
      hint:       "Const Int is under DATA. Drop two of them on the canvas — one for each number.",
      autoPlace:  {
        nodes: [
          { id: 'n_a', nodeKind: 'const_int', x: 100, y: 150, props: { value: 10 } },
          { id: 'n_b', nodeKind: 'const_int', x: 100, y: 380, props: { value: 5  } },
        ],
        edges: []
      },
      completion:  { type: 'node_exists', nodeKind: 'const_int' },
      successSays: "Set different values in each one using the Properties panel — click a node to select it, then edit the value on the right.",
    },
    {
      id:         'place_compare',
      evelynSays: "Now add a Compare (int) node. This checks the relationship between two numbers and outputs true or false. It's under MATH.",
      hint:       "Compare (int) is under MATH in the left panel.",
      autoPlace:  {
        nodes: [{ id: 'n_cmp', nodeKind: 'compare_int', x: 380, y: 250 }],
        edges: []
      },
      completion:  { type: 'node_exists', nodeKind: 'compare_int' },
      successSays: "Wire your two Const Int nodes into the 'a' and 'b' pins on Compare. The result pin will output true or false.",
    },
    {
      id:         'place_branch',
      evelynSays: "Now add an If (Branch) node. This is the decision maker — it takes the true/false result from Compare and routes execution down two different paths. It's under LOGIC.",
      hint:       "If (Branch) is under LOGIC.",
      autoPlace:  {
        nodes: [{ id: 'n_branch', nodeKind: 'if_branch', x: 620, y: 250 }],
        edges: []
      },
      completion:  { type: 'node_exists', nodeKind: 'if_branch' },
      successSays: "Wire the Start exec_out to the Branch exec_in. Wire the Compare 'result' output to the Branch 'condition' pin. Then add two Print nodes — one for the true path, one for false.",
    },
    {
      id:         'complete_graph',
      evelynSays: "Add two Print / Log nodes and wire them to the 'true' and 'false' exec outputs of the Branch node. Give each Const String a different message so you can see which path ran.",
      hint:       "Wire Branch's 'true' output to one Print node's exec_in, and 'false' to the other. Add Const String nodes with different messages for each path.",
      completion:  { type: 'node_connected', nodeKind: 'if_branch' },
      successSays: "Your script now makes a decision. Check the CODE panel — you'll see a proper if/else structure.",
    },
  ]
};

// ============================================================================
// JOURNEY 3 — DO IT REPEATEDLY
// Introduces For Loop. Teaches iteration.
// ============================================================================

const DO_IT_REPEATEDLY: Journey = {
  id:          'do_it_repeatedly',
  title:       'Do It Repeatedly',
  description: 'Use a For Loop to repeat an action a set number of times. The foundation of batch processing.',
  icon:        '🔁',
  completeSays: "That's a loop. In pipeline work, loops are everything — processing every frame, every file, every shot. Now you know how to build one.",

  steps: [
    {
      id:         'setup',
      evelynSays: "Loops let you repeat a block of code a set number of times. We'll build a script that counts from zero. Start with a Start node and a For Loop node — For Loop is under LOOPS.",
      hint:       "Start is under EXEC, For Loop is under LOOPS.",
      autoPlace:  {
        nodes: [
          { id: 'n_start', nodeKind: 'start',    x: 100, y: 250 },
          { id: 'n_loop',  nodeKind: 'for_loop',  x: 380, y: 250 },
        ],
        edges: [
          { source: 'n_start', target: 'n_loop', sourceHandle: 'exec_out', targetHandle: 'exec_in' }
        ]
      },
      completion:  { type: 'node_exists', nodeKind: 'for_loop' },
      successSays: "Wire Start's exec_out to the Loop's exec_in. The loop needs a start value, end value, and a body to execute.",
    },
    {
      id:         'set_range',
      evelynSays: "Add two Const Int nodes — one for the start (0) and one for the end (10). Wire them to the 'start' and 'end' pins on the For Loop.",
      hint:       "Const Int is under DATA. Set one to 0 and one to 10.",
      autoPlace:  {
        nodes: [
          { id: 'n_s', nodeKind: 'const_int', x: 100, y: 150, props: { value: 0  } },
          { id: 'n_e', nodeKind: 'const_int', x: 100, y: 380, props: { value: 10 } },
        ],
        edges: [
          { source: 'n_s', target: 'n_loop', sourceHandle: 'value', targetHandle: 'start' },
          { source: 'n_e', target: 'n_loop', sourceHandle: 'value', targetHandle: 'end'   },
        ]
      },
      completion:  { type: 'node_connected', nodeKind: 'for_loop' },
      successSays: "Good. Now wire a Print node to the loop_body exec output — that's the code that runs on each iteration.",
    },
    {
      id:         'add_body',
      evelynSays: "Add a Print / Log node and wire it to the 'loop_body' exec output of the For Loop. The loop will run that print once for each iteration.",
      hint:       "The loop_body pin is on the right side of the For Loop node. Wire it to Print's exec_in.",
      autoPlace:  {
        nodes: [{ id: 'n_print', nodeKind: 'console_print', x: 650, y: 150 }],
        edges: [
          { source: 'n_loop', target: 'n_print', sourceHandle: 'loop_body', targetHandle: 'exec_in' }
        ]
      },
      completion:  { type: 'node_connected', nodeKind: 'console_print' },
      successSays: "Loop complete. Check the CODE panel — you'll see a for loop that runs 10 times. This is the backbone of every batch processing script.",
    },
  ]
};

// ============================================================================
// JOURNEY 4 — YOUR FIRST PIPELINE SCRIPT
// Introduces Pipeline nodes. Walks a folder and lists files.
// ============================================================================

const FIRST_PIPELINE: Journey = {
  id:          'first_pipeline',
  title:       'Your First Pipeline Script',
  description: 'Walk a folder and list its contents — your first real production tool using FlowPins Pipeline nodes.',
  icon:        '🗂️',
  completeSays: "That's a real pipeline script. Point it at any folder and it'll walk every file inside. From here you can add validation, renaming, reporting — anything.",

  steps: [
    {
      id:         'intro',
      evelynSays: "Pipeline scripts start the same way — a Start node, then a path to work with. Add a Start node and a Folder Path node. Folder Path is under PIPELINE → FILE SYSTEM.",
      hint:       "File System nodes are under PIPELINE in the left panel. Look for 'Folder Path' or 'Input Path'.",
      autoPlace:  {
        nodes: [
          { id: 'n_start',  nodeKind: 'start',          x: 100, y: 250 },
          { id: 'n_folder', nodeKind: 'fs_input_path',  x: 100, y: 100, props: { path: 'C:/your/folder' } },
        ],
        edges: []
      },
      completion:  { type: 'node_exists', nodeKind: 'fs_input_path' },
      successSays: "Set the path value to a real folder on your machine — click the node and edit it in Properties on the right.",
    },
    {
      id:         'add_walk',
      evelynSays: "Now add a Walk Folder node. This iterates over every file in the folder — it's like a For Loop but for files. It's under PIPELINE → FILE SYSTEM.",
      hint:       "Walk Folder is in the Pipeline section of the left panel under File System.",
      autoPlace:  {
        nodes: [{ id: 'n_walk', nodeKind: 'fs_walk_folder', x: 400, y: 250 }],
        edges: [
          { source: 'n_start',  target: 'n_walk', sourceHandle: 'exec_out',  targetHandle: 'exec_in'     },
          { source: 'n_folder', target: 'n_walk', sourceHandle: 'path',      targetHandle: 'folder_path' },
        ]
      },
      completion:  { type: 'node_exists', nodeKind: 'fs_walk_folder' },
      successSays: "Wire Start's exec_out to Walk Folder's exec_in, and the Folder Path's path pin to Walk Folder's folder_path pin.",
    },
    {
      id:         'print_files',
      evelynSays: "Finally, add a Print / Log node and wire it to Walk Folder's loop_body. Wire the file_name output pin to Print's message. This will print every filename as the loop runs.",
      hint:       "Wire loop_body to Print's exec_in. Wire file_name to Print's message pin.",
      autoPlace:  {
        nodes: [{ id: 'n_print', nodeKind: 'console_print', x: 680, y: 250 }],
        edges: [
          { source: 'n_walk',  target: 'n_print', sourceHandle: 'loop_body',  targetHandle: 'exec_in' },
          { source: 'n_walk',  target: 'n_print', sourceHandle: 'file_name',  targetHandle: 'message' },
        ]
      },
      completion:  { type: 'node_connected', nodeKind: 'console_print' },
      successSays: "Your first pipeline script is complete. Check the CODE panel to see the compiled Python.",
    },
  ]
};

// ============================================================================
// JOURNEY 5 — VALIDATE A DELIVERY
// Combines folder walk, batch validate, and report. The "wow moment".
// ============================================================================

const VALIDATE_DELIVERY: Journey = {
  id:          'validate_delivery',
  title:       'Validate a Delivery',
  description: 'Build a full delivery validation script — check dimensions, colourspace, naming, and generate a report.',
  icon:        '✅',
  completeSays: "That is a production-grade delivery validator. It checks dimensions, colourspace, and naming — then prints a pass/fail summary. This is what FlowPins was built for.",

  steps: [
    {
      id:         'setup',
      evelynSays: "This is the most useful script in animation production — a delivery validator. We'll check that all images in a folder meet spec. Start with a Start node and a Folder Path node, same as before.",
      hint:       "Start under EXEC, Folder Path under PIPELINE → FILE SYSTEM.",
      autoPlace:  {
        nodes: [
          { id: 'n_start',  nodeKind: 'start',         x: 0,   y: 250 },
          { id: 'n_folder', nodeKind: 'fs_input_path', x: 0,   y: 50,  props: { path: 'C:/your/delivery/folder' } },
        ],
        edges: []
      },
      completion:  { type: 'node_exists', nodeKind: 'fs_input_path' },
      successSays: "Good. Set the path to a real folder with PNG files in it.",
    },
    {
      id:         'add_validator',
      evelynSays: "Add an Image Batch Validate node from PIPELINE → IMAGE. This checks dimensions, bit depth, and colourspace in one pass.",
      hint:       "Image Batch Validate is under PIPELINE → IMAGE in the left panel.",
      autoPlace:  {
        nodes: [{ id: 'n_val', nodeKind: 'img_batch_validate', x: 350, y: 250, props: { expected_width: 1920, expected_height: 1080, expected_bit_depth: 8, expected_cs: 'sRGB', extension: '.png' } }],
        edges: [
          { source: 'n_start',  target: 'n_val', sourceHandle: 'exec_out', targetHandle: 'exec_in'     },
          { source: 'n_folder', target: 'n_val', sourceHandle: 'path',     targetHandle: 'folder_path' },
        ]
      },
      completion:  { type: 'node_exists', nodeKind: 'img_batch_validate' },
      successSays: "Wire it up and set your expected values in Properties — width, height, bit depth, colourspace.",
    },
    {
      id:         'add_report',
      evelynSays: "Finally add a Print Summary node from PIPELINE → REPORTING. Wire it to get the pass/fail counts from the validator. This gives you the final report.",
      hint:       "Print Summary is under PIPELINE → REPORTING.",
      autoPlace:  {
        nodes: [{ id: 'n_rpt', nodeKind: 'rp_print_summary', x: 680, y: 250, props: { title: 'Delivery Validation' } }],
        edges: [
          { source: 'n_val', target: 'n_rpt', sourceHandle: 'exec_out',   targetHandle: 'exec_in'    },
          { source: 'n_val', target: 'n_rpt', sourceHandle: 'pass_count', targetHandle: 'pass_count' },
          { source: 'n_val', target: 'n_rpt', sourceHandle: 'fail_count', targetHandle: 'fail_count' },
        ]
      },
      completion:  { type: 'node_connected', nodeKind: 'rp_print_summary' },
      successSays: "Wire the pass_count and fail_count outputs from the validator into the report node. Your delivery validator is complete.",
    },
  ]
};


// ============================================================================
// JOURNEY 6 — YOUR FIRST GAME LOOP
// ============================================================================

const FIRST_GAME_LOOP: Journey = {
  id:          'first_game_loop',
  title:       'Your First Game Loop',
  description: 'Build a score and lives system — the heart of almost every game. No coding background needed.',
  icon:        '🎮',
  completeSays: "That's a real game loop. Score increments on pickup, lives drop on hit, game over when lives reach zero. Every game you've ever played has this exact structure underneath. Check the CODE panel — it compiled to clean Python you could drop into a pygame project.",

  steps: [
    {
      id:         'intro',
      evelynSays: "Games are just logic loops. Something happens — a coin is collected, an enemy hits you — and the game state changes. We're going to build that. Start with a Start node and three Set Var nodes: score, lives, and game_over. Say 'place them'.",
      hint:       "Start is under EXEC. Set Var is under VARIABLES. You need three of them.",
      autoPlace:  {
        nodes: [
          { id: 'n_start',     nodeKind: 'start',     x: 100, y: 300 },
          { id: 'n_score_val', nodeKind: 'const_int', x: 100, y: 100, props: { value: 0 } },
          { id: 'n_lives_val', nodeKind: 'const_int', x: 100, y: 175, props: { value: 3 } },
          { id: 'n_set_score', nodeKind: 'set_var',   x: 380, y: 100, props: { var_name: 'score' } },
          { id: 'n_set_lives', nodeKind: 'set_var',   x: 380, y: 200, props: { var_name: 'lives' } },
          { id: 'n_set_over',  nodeKind: 'set_var',   x: 380, y: 300, props: { var_name: 'game_over' } },
        ],
        edges: [
          { source: 'n_start',     target: 'n_set_score', sourceHandle: 'exec_out', targetHandle: 'exec_in' },
          { source: 'n_set_score', target: 'n_set_lives', sourceHandle: 'exec_out', targetHandle: 'exec_in' },
          { source: 'n_set_lives', target: 'n_set_over',  sourceHandle: 'exec_out', targetHandle: 'exec_in' },
          { source: 'n_score_val', target: 'n_set_score', sourceHandle: 'value',    targetHandle: 'value'   },
          { source: 'n_lives_val', target: 'n_set_lives', sourceHandle: 'value',    targetHandle: 'value'   },
        ]
      },
      completion:  { type: 'node_exists', nodeKind: 'set_var' },
      successSays: "Three game state variables. Score 0, lives 3, game_over false. Now the main game loop.",
    },
    {
      id:         'game_loop',
      evelynSays: "Every game runs inside a loop that keeps going until something stops it. Add a While Loop and wire it after the variable setup. Say 'place it'.",
      hint:       "While Loop is under LOOPS. Wire the last Set Var exec_out to While Loop exec_in.",
      autoPlace:  {
        nodes: [
          { id: 'n_loop',     nodeKind: 'while_loop', x: 650, y: 300 },
          { id: 'n_get_over', nodeKind: 'get_var',    x: 450, y: 420, props: { var_name: 'game_over' } },
        ],
        edges: [
          { source: 'n_set_over', target: 'n_loop',    sourceHandle: 'exec_out', targetHandle: 'exec_in'   },
          { source: 'n_get_over', target: 'n_loop',    sourceHandle: 'var_name', targetHandle: 'condition' },
        ]
      },
      completion:  { type: 'node_exists', nodeKind: 'while_loop' },
      successSays: "The loop runs as long as game_over is false. Inside loop_body is where the game happens.",
    },
    {
      id:         'score_pickup',
      evelynSays: "Inside the loop, simulate collecting a coin — Add Int increments score by 10, then Set Var saves it back. Say 'place them'.",
      hint:       "Add Int is under MATH. Get Var feeds current score into Add Int alongside a Const Int of 10. Result feeds into Set Var.",
      autoPlace:  {
        nodes: [
          { id: 'n_get_score',   nodeKind: 'get_var',       x: 900,  y: 150, props: { var_name: 'score' } },
          { id: 'n_points',      nodeKind: 'const_int',     x: 900,  y: 230, props: { value: 10 } },
          { id: 'n_add',         nodeKind: 'add_int',       x: 1100, y: 190 },
          { id: 'n_save_score',  nodeKind: 'set_var',       x: 1300, y: 190, props: { var_name: 'score' } },
          { id: 'n_print_score', nodeKind: 'console_print', x: 1500, y: 190 },
          { id: 'n_score_msg',   nodeKind: 'const_string',  x: 1300, y: 300, props: { value: 'Score updated!' } },
        ],
        edges: [
          { source: 'n_loop',       target: 'n_save_score',  sourceHandle: 'loop_body', targetHandle: 'exec_in' },
          { source: 'n_save_score', target: 'n_print_score', sourceHandle: 'exec_out',  targetHandle: 'exec_in' },
          { source: 'n_get_score',  target: 'n_add',         sourceHandle: 'var_name',  targetHandle: 'a'       },
          { source: 'n_points',     target: 'n_add',         sourceHandle: 'value',     targetHandle: 'b'       },
          { source: 'n_add',        target: 'n_save_score',  sourceHandle: 'result',    targetHandle: 'value'   },
          { source: 'n_score_msg',  target: 'n_print_score', sourceHandle: 'value',     targetHandle: 'message' },
        ]
      },
      completion:  { type: 'node_exists', nodeKind: 'add_int' },
      successSays: "Every iteration adds 10 to the score. Now lives going down on a hit.",
    },
    {
      id:         'game_over',
      evelynSays: "Add the hit system — Subtract Int drops lives by 1, Compare Int checks if lives hit zero, If Branch routes true to game over and false to continue. Say 'place them'.",
      hint:       "Subtract Int and Compare Int are under MATH. If Branch is under LOGIC. True path sets game_over to true and prints GAME OVER.",
      autoPlace:  {
        nodes: [
          { id: 'n_get_lives',   nodeKind: 'get_var',      x: 900,  y: 380, props: { var_name: 'lives' } },
          { id: 'n_one',         nodeKind: 'const_int',    x: 900,  y: 460, props: { value: 1 } },
          { id: 'n_sub',         nodeKind: 'subtract_int', x: 1100, y: 420 },
          { id: 'n_save_lives',  nodeKind: 'set_var',      x: 1300, y: 420, props: { var_name: 'lives' } },
          { id: 'n_zero',        nodeKind: 'const_int',    x: 1100, y: 530, props: { value: 0 } },
          { id: 'n_cmp',         nodeKind: 'compare_int',  x: 1300, y: 520, props: { op: '<=' } },
          { id: 'n_branch',      nodeKind: 'if_branch',    x: 1550, y: 480 },
          { id: 'n_over_msg',    nodeKind: 'const_string', x: 1550, y: 360, props: { value: 'GAME OVER' } },
          { id: 'n_print_over',  nodeKind: 'console_print',x: 1750, y: 420 },
          { id: 'n_alive_msg',   nodeKind: 'const_string', x: 1550, y: 630, props: { value: 'Still alive!' } },
          { id: 'n_print_alive', nodeKind: 'console_print',x: 1750, y: 580 },
        ],
        edges: [
          { source: 'n_print_score', target: 'n_save_lives',  sourceHandle: 'exec_out', targetHandle: 'exec_in'   },
          { source: 'n_get_lives',   target: 'n_sub',         sourceHandle: 'var_name', targetHandle: 'a'         },
          { source: 'n_one',         target: 'n_sub',         sourceHandle: 'value',    targetHandle: 'b'         },
          { source: 'n_sub',         target: 'n_save_lives',  sourceHandle: 'result',   targetHandle: 'value'     },
          { source: 'n_save_lives',  target: 'n_branch',      sourceHandle: 'exec_out', targetHandle: 'exec_in'   },
          { source: 'n_sub',         target: 'n_cmp',         sourceHandle: 'result',   targetHandle: 'a'         },
          { source: 'n_zero',        target: 'n_cmp',         sourceHandle: 'value',    targetHandle: 'b'         },
          { source: 'n_cmp',         target: 'n_branch',      sourceHandle: 'result',   targetHandle: 'condition' },
          { source: 'n_branch',      target: 'n_print_over',  sourceHandle: 'true',     targetHandle: 'exec_in'   },
          { source: 'n_branch',      target: 'n_print_alive', sourceHandle: 'false',    targetHandle: 'exec_in'   },
          { source: 'n_over_msg',    target: 'n_print_over',  sourceHandle: 'value',    targetHandle: 'message'   },
          { source: 'n_alive_msg',   target: 'n_print_alive', sourceHandle: 'value',    targetHandle: 'message'   },
        ]
      },
      completion:  { type: 'node_exists', nodeKind: 'if_branch' },
      successSays: "Complete. The while loop runs until game_over flips to true — exactly how every game engine works. Check the CODE panel.",
    },
  ]
};

// ============================================================================
// JOURNEY 7 — BEYOND THE PIPELINE: MATRIX RAIN
// Built entirely with proper FlowPins nodes — no raw_code.
// Uses the new terminal_codes, string_get_char, list_set_index,
// and list_fill nodes added specifically for this journey.
// ============================================================================

const MATRIX_RAIN: Journey = {
  id:          'matrix_rain',
  title:       'Beyond the Pipeline: Matrix Rain',
  description: 'Build a terminal animation entirely in FlowPins — no raw code. Every node earns its place.',
  icon:        '\u{1F327}\uFE0F',
  completeSays: "A complete terminal animation — zero raw code. Every piece is a proper FlowPins node. The Terminal Codes node outputs ANSI sequences. String Get Character picks a character from the pool. List Set At Index updates stream positions. This is FlowPins being used for something completely outside animation pipelines. Check the CODE panel and run it.",

  steps: [
    {
      id:         'setup',
      evelynSays: "We are building matrix rain — columns of falling characters in a terminal. Entirely in FlowPins, no raw code needed. Here is what to place first:\n\n1. A START node — find it in the left panel under CORE → EXEC. Drag it onto the canvas.\n2. Two CONST INT nodes — under CORE → DATA. Set one to 80 (columns) and one to 24 (rows) in the Properties panel on the right.\n3. One CONST STRING node — also under CORE → DATA. Set its value to: 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%\n4. Three SET VARIABLE nodes — under CORE → VARIABLES. Name them: columns, rows, and char_pool.\n\nWire each Const into its matching Set Var value pin. Wire Start exec_out into the first Set Var exec_in, then chain the three Set Vars together. Say 'place them' and I will do all of this for you.",
      hint:       "In the left panel: START is under CORE → EXEC. CONST INT and CONST STRING are under CORE → DATA. SET VARIABLE is under CORE → VARIABLES. Wire each constant into its Set Var, and chain the exec pins Start → SetVar(columns) → SetVar(rows) → SetVar(char_pool).",
      autoPlace:  {
        nodes: [
          { id: 'n_start',     nodeKind: 'start',        x: 100, y: 300 },
          { id: 'n_cols',      nodeKind: 'const_int',    x: 100, y: 100,  props: { value: 80 } },
          { id: 'n_rows',      nodeKind: 'const_int',    x: 100, y: 175,  props: { value: 24 } },
          { id: 'n_chars',     nodeKind: 'const_string', x: 100, y: 430,  props: { value: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%' } },
          { id: 'n_set_cols',  nodeKind: 'set_var',      x: 380, y: 100,  props: { var_name: 'columns'   } },
          { id: 'n_set_rows',  nodeKind: 'set_var',      x: 380, y: 200,  props: { var_name: 'rows'      } },
          { id: 'n_set_chars', nodeKind: 'set_var',      x: 380, y: 300,  props: { var_name: 'char_pool' } },
        ],
        edges: [
          { source: 'n_start',    target: 'n_set_cols',  sourceHandle: 'exec_out', targetHandle: 'exec_in' },
          { source: 'n_set_cols', target: 'n_set_rows',  sourceHandle: 'exec_out', targetHandle: 'exec_in' },
          { source: 'n_set_rows', target: 'n_set_chars', sourceHandle: 'exec_out', targetHandle: 'exec_in' },
          { source: 'n_cols',     target: 'n_set_cols',  sourceHandle: 'value',    targetHandle: 'value'   },
          { source: 'n_rows',     target: 'n_set_rows',  sourceHandle: 'value',    targetHandle: 'value'   },
          { source: 'n_chars',    target: 'n_set_chars', sourceHandle: 'value',    targetHandle: 'value'   },
        ]
      },
      completion:  { type: 'node_exists', nodeKind: 'set_var' },
      successSays: "Constants set. Now the Terminal Codes node — the key to this whole thing working without raw code.",
    },
    {
      id:         'terminal_codes',
      evelynSays: "Now add a TERMINAL CODES node — find it in the left panel under CORE → TERMINAL. This node outputs ANSI escape sequences as named pins. No escape characters to type — it is all handled for you.\n\nWire it up like this:\n1. Wire Set Var (char_pool) exec_out → Terminal Codes exec_in.\n2. Add four SET VARIABLE nodes (CORE → VARIABLES) named: green, white, reset, clear.\n3. Wire Terminal Codes green_text pin → Set Var (green) value pin.\n4. Wire Terminal Codes bright_white_text pin → Set Var (white) value pin.\n5. Wire Terminal Codes reset_color pin → Set Var (reset) value pin.\n6. Wire Terminal Codes clear_screen pin → Set Var (clear) value pin.\n7. Chain the four Set Vars together with exec wires.\n\nSay 'place them' and I will set all of this up.",
      hint:       "TERMINAL CODES is under CORE → TERMINAL in the left panel. It has six output pins — green_text, bright_white_text, reset_color, clear_screen, hide_cursor, show_cursor. Wire each into its own Set Variable node, then chain those Set Vars together with exec wires.",
      autoPlace:  {
        nodes: [
          { id: 'n_tcodes',     nodeKind: 'terminal_codes', x: 380, y: 450 },
          { id: 'n_set_green',  nodeKind: 'set_var',        x: 620, y: 400, props: { var_name: 'green'  } },
          { id: 'n_set_white',  nodeKind: 'set_var',        x: 620, y: 490, props: { var_name: 'white'  } },
          { id: 'n_set_reset',  nodeKind: 'set_var',        x: 620, y: 580, props: { var_name: 'reset'  } },
          { id: 'n_set_clear',  nodeKind: 'set_var',        x: 620, y: 670, props: { var_name: 'clear'  } },
        ],
        edges: [
          { source: 'n_set_chars',  target: 'n_tcodes',    sourceHandle: 'exec_out',          targetHandle: 'exec_in'  },
          { source: 'n_tcodes',     target: 'n_set_green', sourceHandle: 'exec_out',          targetHandle: 'exec_in'  },
          { source: 'n_set_green',  target: 'n_set_white', sourceHandle: 'exec_out',          targetHandle: 'exec_in'  },
          { source: 'n_set_white',  target: 'n_set_reset', sourceHandle: 'exec_out',          targetHandle: 'exec_in'  },
          { source: 'n_set_reset',  target: 'n_set_clear', sourceHandle: 'exec_out',          targetHandle: 'exec_in'  },
          { source: 'n_tcodes',     target: 'n_set_green', sourceHandle: 'green_text',        targetHandle: 'value'    },
          { source: 'n_tcodes',     target: 'n_set_white', sourceHandle: 'bright_white_text', targetHandle: 'value'    },
          { source: 'n_tcodes',     target: 'n_set_reset', sourceHandle: 'reset_color',       targetHandle: 'value'    },
          { source: 'n_tcodes',     target: 'n_set_clear', sourceHandle: 'clear_screen',      targetHandle: 'value'    },
        ]
      },
      completion:  { type: 'node_exists', nodeKind: 'terminal_codes' },
      successSays: "Terminal codes stored as variables. No escape characters typed by hand — that is what the node is for. Now initialise the stream positions.",
    },
    {
      id:         'init_positions',
      evelynSays: "Each column needs a starting height — a random position so the streams don't all start at the same time. Here is how to build the positions list:\n\n1. Add a LIST FILL node (CORE → COLLECTIONS). Set length to 80, value to 0. Wire exec_in from the last Set Var. This creates a list of 80 zeros.\n2. Add a SET VARIABLE node, name it 'positions'. Wire List Fill exec_out into it, and List Fill's list output into its value pin.\n3. Add a FOR LOOP node (CORE → LOGIC). Set start to 0, end to 80. Wire exec_out from Set Var (positions) into For Loop exec_in.\n4. Inside the loop body, add a RANDOM INT node (CORE → MATH). Set min to -24, max to 0.\n5. Add a LIST SET AT INDEX node (CORE → COLLECTIONS). Wire loop_body exec into it. Wire Get Var (positions) into its list pin. Wire For Loop index into its index pin. Wire Random Int result into its value pin.\n6. Add another SET VARIABLE (positions) to save the updated list back. Wire List Set At Index exec_out and list output into it.\n\nSay 'place them' and I will build all of this.",
      hint:       "LIST FILL is under CORE → COLLECTIONS. LIST SET AT INDEX is also under CORE → COLLECTIONS. RANDOM INT is under CORE → MATH. FOR LOOP is under CORE → LOGIC. The loop walks every column index and sets a random starting height using List Set At Index.",
      autoPlace:  {
        nodes: [
          { id: 'n_fill',      nodeKind: 'list_fill',   x: 900, y: 100, props: { length: 80, value: 0 } },
          { id: 'n_set_pos',   nodeKind: 'set_var',     x: 1100, y: 100, props: { var_name: 'positions' } },
          { id: 'n_init_loop', nodeKind: 'for_loop',    x: 900, y: 250, props: { start: 0, end: 80 } },
          { id: 'n_neg24',     nodeKind: 'const_int',   x: 900, y: 420, props: { value: -24 } },
          { id: 'n_zero2',     nodeKind: 'const_int',   x: 900, y: 490, props: { value: 0 } },
          { id: 'n_rand_pos',  nodeKind: 'random_int',  x: 1100, y: 420 },
          { id: 'n_get_pos',   nodeKind: 'get_var',     x: 1100, y: 550, props: { var_name: 'positions' } },
          { id: 'n_set_idx',   nodeKind: 'list_set_index', x: 1300, y: 350 },
          { id: 'n_save_pos',  nodeKind: 'set_var',     x: 1500, y: 350, props: { var_name: 'positions' } },
        ],
        edges: [
          { source: 'n_set_clear',  target: 'n_fill',      sourceHandle: 'exec_out',  targetHandle: 'exec_in'  },
          { source: 'n_fill',       target: 'n_set_pos',   sourceHandle: 'exec_out',  targetHandle: 'exec_in'  },
          { source: 'n_set_pos',    target: 'n_init_loop', sourceHandle: 'exec_out',  targetHandle: 'exec_in'  },
          { source: 'n_neg24',      target: 'n_rand_pos',  sourceHandle: 'value',     targetHandle: 'min'      },
          { source: 'n_zero2',      target: 'n_rand_pos',  sourceHandle: 'value',     targetHandle: 'max'      },
          { source: 'n_init_loop',  target: 'n_set_idx',   sourceHandle: 'loop_body', targetHandle: 'exec_in'  },
          { source: 'n_get_pos',    target: 'n_set_idx',   sourceHandle: 'data_out',  targetHandle: 'list'     },
          { source: 'n_init_loop',  target: 'n_set_idx',   sourceHandle: 'index',     targetHandle: 'index'    },
          { source: 'n_rand_pos',   target: 'n_set_idx',   sourceHandle: 'val',       targetHandle: 'value'    },
          { source: 'n_set_idx',    target: 'n_save_pos',  sourceHandle: 'exec_out',  targetHandle: 'exec_in'  },
          { source: 'n_set_idx',    target: 'n_save_pos',  sourceHandle: 'list',      targetHandle: 'value'    },
        ]
      },
      completion:  { type: 'node_exists', nodeKind: 'list_set_index' },
      successSays: "Stream positions initialised. Each column has a random starting height. List Set At Index is the new node doing the work — updating a value inside a list at a specific position. Now the main animation loop.",
    },
    {
      id:         'main_loop',
      evelynSays: "The main animation loop. Here is the full structure:\n\n1. Add a WHILE LOOP node (CORE → LOGIC). Wire exec_out from the last Set Var (positions) into it. Add a CONST BOOL node (CORE → DATA) set to true and wire it into the While Loop condition pin — this makes it run forever.\n2. Inside loop_body, add a FOR LOOP (CORE → LOGIC). Set start 0, end 80. Wire loop_body exec into For Loop exec_in.\n3. Inside the For Loop's loop_body, add a RANDOM INT node (CORE → MATH). Set min 0, max 39 — this picks an index into the character pool.\n4. Add a STRING GET CHARACTER node (CORE → TEXT). Wire Get Var (char_pool) into its text pin. Wire Random Int result into its index pin.\n5. Add a GET VARIABLE node for 'green' and another for 'reset'.\n6. Add a TERMINAL PRINT CHAR node (CORE → TERMINAL). Wire For Loop loop_body exec into it. Wire String Get Character's char output into its char pin. Wire green into color_code. Wire reset into reset_code.\n\nSay 'place them' and I will wire the whole thing.",
      hint:       "WHILE LOOP and FOR LOOP are under CORE → LOGIC. STRING GET CHARACTER is under CORE → TEXT. TERMINAL PRINT CHAR is under CORE → TERMINAL. RANDOM INT is under CORE → MATH. The structure is: While Loop → For Loop → Random Int + String Get Character → Terminal Print Char.",
      autoPlace:  {
        nodes: [
          { id: 'n_true',      nodeKind: 'const_bool',          x: 650,  y: 250, props: { value: true } },
          { id: 'n_main',      nodeKind: 'while_loop',          x: 900,  y: 350 },
          { id: 'n_get_cols2', nodeKind: 'get_var',             x: 1150, y: 220, props: { var_name: 'columns'   } },
          { id: 'n_col_zero',  nodeKind: 'const_int',           x: 1150, y: 300, props: { value: 0 } },
          { id: 'n_col_loop',  nodeKind: 'for_loop',            x: 1150, y: 400 },
          { id: 'n_get_pool2', nodeKind: 'get_var',             x: 1400, y: 280, props: { var_name: 'char_pool' } },
          { id: 'n_rand_char', nodeKind: 'random_int',          x: 1400, y: 370, props: { min: 0, max: 39 } },
          { id: 'n_get_char',  nodeKind: 'string_get_char',     x: 1650, y: 330 },
          { id: 'n_get_green', nodeKind: 'get_var',             x: 1400, y: 480, props: { var_name: 'green' } },
          { id: 'n_get_reset', nodeKind: 'get_var',             x: 1400, y: 560, props: { var_name: 'reset' } },
          { id: 'n_tprint',    nodeKind: 'terminal_print_char', x: 1900, y: 400 },
        ],
        edges: [
          { source: 'n_save_pos',  target: 'n_main',     sourceHandle: 'exec_out',  targetHandle: 'exec_in'   },
          { source: 'n_true',      target: 'n_main',     sourceHandle: 'value',     targetHandle: 'condition' },
          { source: 'n_main',      target: 'n_col_loop', sourceHandle: 'loop_body', targetHandle: 'exec_in'   },
          { source: 'n_col_zero',  target: 'n_col_loop', sourceHandle: 'value',     targetHandle: 'start'     },
          { source: 'n_get_cols2', target: 'n_col_loop', sourceHandle: 'data_out',  targetHandle: 'end'       },
          { source: 'n_col_loop',  target: 'n_tprint',   sourceHandle: 'loop_body', targetHandle: 'exec_in'   },
          { source: 'n_get_pool2', target: 'n_get_char', sourceHandle: 'data_out',  targetHandle: 'text'      },
          { source: 'n_rand_char', target: 'n_get_char', sourceHandle: 'val',       targetHandle: 'index'     },
          { source: 'n_get_char',  target: 'n_tprint',   sourceHandle: 'char',      targetHandle: 'char'      },
          { source: 'n_get_green', target: 'n_tprint',   sourceHandle: 'data_out',  targetHandle: 'color_code'},
          { source: 'n_get_reset', target: 'n_tprint',   sourceHandle: 'data_out',  targetHandle: 'reset_code'},
        ]
      },
      completion:  { type: 'node_exists', nodeKind: 'terminal_print_char' },
      successSays: "Complete — zero raw code. Terminal Codes gave us the ANSI sequences. String Get Character picked individual characters from the pool. List Set At Index managed the stream positions. Terminal Print Char output coloured text. Check the CODE panel and run it in a terminal.",
    },
  ]
};

// ============================================================================
// EXPORTED JOURNEY REGISTRY
// ============================================================================

export const JOURNEYS: Journey[] = [
  HELLO_FLOWPINS,
  MAKE_A_DECISION,
  DO_IT_REPEATEDLY,
  FIRST_PIPELINE,
  VALIDATE_DELIVERY,
  FIRST_GAME_LOOP,
  MATRIX_RAIN,
];

export const getJourney = (id: string): Journey | undefined =>
  JOURNEYS.find(j => j.id === id);
