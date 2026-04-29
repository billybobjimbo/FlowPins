// src/libraries/evelyn.ts
// ============================================================================
// EVELYN: THE FLOWPINS LIBRARIAN
// Named after Evelyn Carnahan-O'Connell from The Mummy (1999).
// A brilliant, slightly exasperated librarian who will help you build node
// graphs — but absolutely reserves the right to complain about it.
//
// Her response system has three tiers:
//   1. EXACT  — Found a perfect blueprint in the archives.
//   2. IMPROV — Couldn't find an exact match, built something approximate.
//   3. BAFFLED — Genuinely no idea, but here's what she scraped together.
// ============================================================================

import { NODE_LIBRARY } from './index';
import { LOCAL_TEMPLATES } from './templates';
import { NodeSpec } from './types';

// ============================================================================
// EVELYN'S PERSONALITY BANKS
// ============================================================================

const EXACT_RESPONSES = [
  "Found it immediately. Try not to act surprised.",
  "I had this one filed under 'obvious requests'. Here you go.",
  "That one was on the first shelf. Some of us are organised.",
  "Pulled it right away. The archives are impeccable, unlike some people's filing habits.",
  "Oh, this one I actually enjoy. Here is your blueprint.",
  "Already in the catalogue. I've been expecting someone to ask for this.",
];

const IMPROV_RESPONSES = [
  "There's no exact blueprint for that, so I improvised. Don't push your luck asking for more.",
  "Wasn't in the archives, but I pieced something together. You're welcome, I suppose.",
  "I had to extrapolate from what we had. The wiring is approximate — like your request.",
  "No perfect match, so I assembled the closest thing I could. Consider it a rough draft.",
  "I'll be honest: I made this up on the spot. But it's a reasonable starting point.",
  "The archives were unhelpful, so I improvised. Adjust the nodes as you see fit.",
];

const BAFFLED_RESPONSES = [
  "I have absolutely no idea what you're asking for, but I dropped some relevant nodes nearby. You figure it out.",
  "That request was... something. Here are some nodes that might be adjacent to what you want.",
  "I searched every shelf and came up nearly empty. I've left you some pieces. Good luck.",
  "There are limits to what even I can decipher. Here's my best guess at a starting point.",
  "I've put out what I could find. If this isn't right, perhaps try using actual words next time.",
];

const MUMMY_RESPONSES = [
  "I explicitly asked you not to ask about mummies. But fine. Here is a random fact generator.",
  "Why is it always mummies? Here, take your logic tree and leave me alone.",
  "Do I look like an Egyptologist to you? Ugh. Dropping the node graph.",
  "Seriously? We're building a professional pipeline tool and you want mummy facts? Fine.",
  "If you say that word again, I will personally rewrite history to exclude you.",
  "I asked for silence on the matter, not a sequel.",
  "You seem determined to awaken something, and it won't be my patience.",
  "Remarkable. You've managed to ignore me completely — again.",
  "I assure you, there are far worse things than curses — and you're approaching one.",
  "Do you practice being this irritating, or is it a natural talent?",
  "Yes, yes, very dusty, very ancient — now, can we kindly move on?",
  "I gave you one instruction. One. It wasn't a riddle.",
  "You're not uncovering secrets — you're unearthing my temper.",
  "Next time you feel the urge to mention it, try… not doing that.",
];

const EMPTY_CANVAS_RESPONSES = [
  "You rang? I can help you set up a node graph. Try something like 'spawn 10 objects' or 'create a loop'.",
  "The canvas is empty and so, apparently, is this prompt. What are we building today?",
  "I'm listening. Though I'd prefer it if you said something.",
  "A blank prompt. Inspirational. What would you actually like me to build?",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================================
// INTENT SYSTEM
// A parsed request breaks down into intent + entities.
// Intents can stack — a prompt can match multiple.
// ============================================================================

export interface ParsedRequest {
  intent: string;
  subIntent?: string;
  entities: Record<string, any>;
  confidence: 'high' | 'medium' | 'low';
  rawPrompt: string;
}

export interface EvelynBlueprint {
  id: string;
  message: string;
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
}

interface BlueprintNode {
  id: string;
  nodeKind: string;
  x: number;
  y: number;
  props?: Record<string, any>;
}

interface BlueprintEdge {
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

// ============================================================================
// THE LIBRARIAN CLASS
// ============================================================================

export class EvelynLibrarian {

  // --------------------------------------------------------------------------
  // PASS 1: PARSE THE PROMPT INTO STRUCTURED INTENT
  // --------------------------------------------------------------------------

  static parsePrompt(prompt: string): ParsedRequest {
    const p = prompt.toLowerCase().trim();
    const entities: Record<string, any> = {};

    if (!p) {
      return { intent: 'empty', entities: {}, confidence: 'high', rawPrompt: prompt };
    }

    // --- Mummy trap ---
    if (/mummy|mummies|mummif|pharaoh|egypt/i.test(p)) {
      return { intent: 'mummy', entities: {}, confidence: 'high', rawPrompt: prompt };
    }

    // --- Template keyword scan (HIGHEST priority — runs before all intent regexes) ---
    // Pipeline and custom templates always win over generic intent matching.
    for (const template of LOCAL_TEMPLATES) {
      if (template.keywords.some((kw: string) => p.includes(kw))) {
        return {
          intent: 'fetch_template',
          entities: { templateId: template.id },
          confidence: 'high',
          rawPrompt: prompt
        };
      }
    }

    // --- Extract numbers (e.g. "10 objects", "5 joints") ---
    const numberMatch = p.match(/(\d+)\s*(objects?|items?|instances?|things?|joints?|nodes?|copies|times?)/);
    if (numberMatch) entities.count = parseInt(numberMatch[1], 10);

    // --- Extract names in quotes or after "called/named" ---
    const nameMatch = p.match(/(?:called|named|for)\s+["']?([a-zA-Z_][a-zA-Z0-9_]*)["']?/);
    if (nameMatch) entities.name = nameMatch[1];

    // --- SPAWN / CREATE ---
    if (/spawn|create|make|generate|instantiate|duplicate/i.test(p)) {
      const intent = /grid|row|line|multiple|array|pattern/i.test(p) ? 'spawn_grid' : 'spawn';
      return { intent, entities, confidence: entities.count ? 'high' : 'medium', rawPrompt: prompt };
    }

    // --- LOOP ---
    if (/loop|iterate|repeat|for each|forEach|cycle/i.test(p)) {
      return { intent: 'loop', entities, confidence: 'high', rawPrompt: prompt };
    }

    // --- BRANCH / IF ---
    if (/branch|if |condition|compare|when |unless/i.test(p)) {
      return { intent: 'branch', entities, confidence: 'high', rawPrompt: prompt };
    }

    // --- FUNCTION / CUSTOM NODE ---
    if (/function|def |method|subroutine|callable|procedure/i.test(p)) {
      return { intent: 'function', entities, confidence: 'high', rawPrompt: prompt };
    }

    // --- PRINT / DEBUG ---
    if (/print|log|debug|output|display|show|trace/i.test(p)) {
      return { intent: 'print', entities, confidence: 'high', rawPrompt: prompt };
    }

    // --- VARIABLE ---
    if (/variable|var |store|assign|save value|hold/i.test(p)) {
      return { intent: 'variable', entities, confidence: 'medium', rawPrompt: prompt };
    }

    // --- MATH ---
    if (/math|calculat|add|subtract|multiply|divide|plus|minus|sum/i.test(p)) {
      return { intent: 'math', entities, confidence: 'medium', rawPrompt: prompt };
    }

    // --- RIGGING (Toon Boom / Maya speciality) ---
    if (/rig|joint|peg|bone|limb|arm|leg|spine|skeleton/i.test(p)) {
      return { intent: 'rig', entities, confidence: 'medium', rawPrompt: prompt };
    }

    // --- LIST / ARRAY ---
    if (/list|array|collection|group of/i.test(p)) {
      return { intent: 'list', entities, confidence: 'medium', rawPrompt: prompt };
    }

    // --- BASIC SETUP ---
    if (/basic|hello|start|setup|begin|simple|starter/i.test(p)) {
      return { intent: 'basic_setup', entities, confidence: 'high', rawPrompt: prompt };
    }

    return { intent: 'unknown', entities, confidence: 'low', rawPrompt: prompt };
  }

  // --------------------------------------------------------------------------
  // PASS 2: BUILD A GRAPH FROM THE PARSED REQUEST
  // --------------------------------------------------------------------------

  static buildGraph(req: ParsedRequest): EvelynBlueprint | null {
    const { intent, entities } = req;

    // --- Empty prompt ---
    if (intent === 'empty') {
      return {
        id: 'evelyn_empty',
        message: pickRandom(EMPTY_CANVAS_RESPONSES),
        nodes: [], edges: []
      };
    }

    // --- Mummy easter egg ---
    if (intent === 'mummy') {
      const template = LOCAL_TEMPLATES.find((t: any) => t.id === 'mummy_easter_egg');
      if (template) {
        return {
          id: 'evelyn_mummy',
          message: pickRandom(MUMMY_RESPONSES),
          nodes: template.nodes,
          edges: template.edges
        };
      }
    }

    // --- Exact template match ---
    if (intent === 'fetch_template') {
      const template = LOCAL_TEMPLATES.find((t: any) => t.id === entities.templateId);
      if (template) {
        const msg = template.id === 'mummy_easter_egg'
          ? pickRandom(MUMMY_RESPONSES)
          : pickRandom(EXACT_RESPONSES);
        return {
          id: `evelyn_template_${template.id}`,
          message: msg,
          nodes: template.nodes,
          edges: template.edges
        };
      }
    }

    // --- Spawn grid ---
    if (intent === 'spawn_grid' || intent === 'spawn') {
      const count   = entities.count || 10;
      const spacing = 64;
      return {
        id: 'evelyn_spawn',
        message: `${pickRandom(EXACT_RESPONSES)} Grid spawner for ${count} objects — spacing is set to ${spacing}px on the Const Int node.`,
        nodes: [
          { id: 'n_start',   nodeKind: 'start',         x: 0,   y: 150 },
          { id: 'n_limit',   nodeKind: 'const_int',     x: 0,   y: 300, props: { value: count } },
          { id: 'n_loop',    nodeKind: 'for_loop',       x: 250, y: 150 },
          { id: 'n_spacing', nodeKind: 'const_int',     x: 250, y: 350, props: { value: spacing } },
          { id: 'n_math',    nodeKind: 'multiply_int',  x: 500, y: 250 },
          { id: 'n_spawn',   nodeKind: 'spawn_instance',x: 750, y: 150, props: { obj_name: 'MyObject' } }
        ],
        edges: [
          { source: 'n_start',   target: 'n_loop',  sourceHandle: 'exec_out', targetHandle: 'exec_in' },
          { source: 'n_limit',   target: 'n_loop',  sourceHandle: 'value',    targetHandle: 'end' },
          { source: 'n_loop',    target: 'n_spawn', sourceHandle: 'loop_body',targetHandle: 'exec_in' },
          { source: 'n_loop',    target: 'n_math',  sourceHandle: 'index',    targetHandle: 'a' },
          { source: 'n_spacing', target: 'n_math',  sourceHandle: 'value',    targetHandle: 'b' },
          { source: 'n_math',    target: 'n_spawn', sourceHandle: 'result',   targetHandle: 'x' }
        ]
      };
    }

    // --- Loop ---
    if (intent === 'loop') {
      const count = entities.count || 10;
      return {
        id: 'evelyn_loop',
        message: `${pickRandom(EXACT_RESPONSES)} For loop set to ${count} iterations.`,
        nodes: [
          { id: 'n_start', nodeKind: 'start',     x: 0,   y: 150 },
          { id: 'n_max',   nodeKind: 'const_int', x: 0,   y: 300, props: { value: count } },
          { id: 'n_loop',  nodeKind: 'for_loop',  x: 250, y: 150 },
          { id: 'n_print', nodeKind: 'console_print', x: 550, y: 150 },
        ],
        edges: [
          { source: 'n_start', target: 'n_loop',  sourceHandle: 'exec_out',  targetHandle: 'exec_in' },
          { source: 'n_max',   target: 'n_loop',  sourceHandle: 'value',     targetHandle: 'end' },
          { source: 'n_loop',  target: 'n_print', sourceHandle: 'loop_body', targetHandle: 'exec_in' },
          { source: 'n_loop',  target: 'n_print', sourceHandle: 'index',     targetHandle: 'message' },
        ]
      };
    }

    // --- Branch / If ---
    if (intent === 'branch') {
      return {
        id: 'evelyn_branch',
        message: `${pickRandom(EXACT_RESPONSES)} If-branch with true and false paths ready to wire up.`,
        nodes: [
          { id: 'n_start',   nodeKind: 'start',        x: 0,   y: 150 },
          { id: 'n_bool',    nodeKind: 'const_bool',   x: 0,   y: 300, props: { value: 'true' } },
          { id: 'n_branch',  nodeKind: 'if_branch',    x: 280, y: 150 },
          { id: 'n_true',    nodeKind: 'console_print',x: 560, y: 50,  props: {} },
          { id: 'n_false',   nodeKind: 'console_print',x: 560, y: 280, props: {} },
        ],
        edges: [
          { source: 'n_start',  target: 'n_branch', sourceHandle: 'exec_out',   targetHandle: 'exec_in' },
          { source: 'n_bool',   target: 'n_branch', sourceHandle: 'value',       targetHandle: 'condition' },
          { source: 'n_branch', target: 'n_true',   sourceHandle: 'true',        targetHandle: 'exec_in' },
          { source: 'n_branch', target: 'n_false',  sourceHandle: 'false',       targetHandle: 'exec_in' },
        ]
      };
    }

    // --- Function definition ---
    if (intent === 'function') {
      const funcName = entities.name || 'myFunction';
      return {
        id: 'evelyn_function',
        message: `${pickRandom(EXACT_RESPONSES)} Function definition for "${funcName}" with a call site below it.`,
        nodes: [
          { id: 'n_def',    nodeKind: 'func_def',     x: 0,   y: 0,   props: { func_name: funcName } },
          { id: 'n_return', nodeKind: 'func_return',  x: 300, y: 0 },
          { id: 'n_start',  nodeKind: 'start',        x: 0,   y: 250 },
          { id: 'n_call',   nodeKind: 'func_call',    x: 300, y: 250, props: { func_name: funcName } },
        ],
        edges: [
          { source: 'n_def',   target: 'n_return', sourceHandle: 'exec_out', targetHandle: 'exec_in' },
          { source: 'n_start', target: 'n_call',   sourceHandle: 'exec_out', targetHandle: 'exec_in' },
        ]
      };
    }

    // --- Print / Debug ---
    if (intent === 'print') {
      return {
        id: 'evelyn_print',
        message: `${pickRandom(EXACT_RESPONSES)} Start node wired to a Print node. Drop a Const String in to give it something to say.`,
        nodes: [
          { id: 'n_start', nodeKind: 'start',         x: 0,   y: 150 },
          { id: 'n_str',   nodeKind: 'const_string',  x: 0,   y: 300, props: { value: 'Hello from FlowPins' } },
          { id: 'n_print', nodeKind: 'console_print', x: 300, y: 150 },
        ],
        edges: [
          { source: 'n_start', target: 'n_print', sourceHandle: 'exec_out', targetHandle: 'exec_in' },
          { source: 'n_str',   target: 'n_print', sourceHandle: 'value',    targetHandle: 'message' },
        ]
      };
    }

    // --- Variable ---
    if (intent === 'variable') {
      const varName = entities.name || 'myVar';
      return {
        id: 'evelyn_variable',
        message: `${pickRandom(IMPROV_RESPONSES)} Set and Get nodes for variable "${varName}".`,
        nodes: [
          { id: 'n_start',  nodeKind: 'start',        x: 0,   y: 150 },
          { id: 'n_val',    nodeKind: 'const_int',    x: 0,   y: 300, props: { value: 0 } },
          { id: 'n_set',    nodeKind: 'set_var',      x: 280, y: 150, props: { var_name: varName } },
          { id: 'n_get',    nodeKind: 'get_var',      x: 560, y: 250, props: { var_name: varName } },
        ],
        edges: [
          { source: 'n_start', target: 'n_set', sourceHandle: 'exec_out', targetHandle: 'exec_in' },
          { source: 'n_val',   target: 'n_set', sourceHandle: 'value',    targetHandle: 'value' },
        ]
      };
    }

    // --- Math ---
    if (intent === 'math') {
      return {
        id: 'evelyn_math',
        message: `${pickRandom(IMPROV_RESPONSES)} Two integers feeding into an Add node. Swap it for Subtract, Multiply, or Divide as needed.`,
        nodes: [
          { id: 'n_a',   nodeKind: 'const_int', x: 0,   y: 100, props: { value: 10 } },
          { id: 'n_b',   nodeKind: 'const_int', x: 0,   y: 250, props: { value: 5 } },
          { id: 'n_add', nodeKind: 'add_int',   x: 300, y: 175 },
        ],
        edges: [
          { source: 'n_a', target: 'n_add', sourceHandle: 'value', targetHandle: 'a' },
          { source: 'n_b', target: 'n_add', sourceHandle: 'value', targetHandle: 'b' },
        ]
      };
    }

    // --- Rig ---
    if (intent === 'rig') {
      const baseName = entities.name || 'Arm';
      return {
        id: 'evelyn_rig',
        message: `${pickRandom(IMPROV_RESPONSES)} Basic 3-part limb builder for "${baseName}". Works in both Harmony and Maya.`,
        nodes: [
          { id: 'n_start', nodeKind: 'start',           x: 0,   y: 150 },
          { id: 'n_limb',  nodeKind: 'uni_limb_builder', x: 280, y: 150, props: { base_name: baseName, side: 'L' } },
        ],
        edges: [
          { source: 'n_start', target: 'n_limb', sourceHandle: 'exec_out', targetHandle: 'exec_in' },
        ]
      };
    }

    // --- List ---
    if (intent === 'list') {
      return {
        id: 'evelyn_list',
        message: `${pickRandom(IMPROV_RESPONSES)} Empty list with an Append node wired up.`,
        nodes: [
          { id: 'n_start',  nodeKind: 'start',         x: 0,   y: 150 },
          { id: 'n_list',   nodeKind: 'make_empty_list',x: 0,   y: 300 },
          { id: 'n_item',   nodeKind: 'const_string',  x: 0,   y: 430, props: { value: 'item' } },
          { id: 'n_append', nodeKind: 'list_append',   x: 300, y: 150 },
        ],
        edges: [
          { source: 'n_start',  target: 'n_append', sourceHandle: 'exec_out', targetHandle: 'exec_in' },
          { source: 'n_list',   target: 'n_append', sourceHandle: 'list',     targetHandle: 'list' },
          { source: 'n_item',   target: 'n_append', sourceHandle: 'value',    targetHandle: 'item' },
        ]
      };
    }

    // --- Basic setup ---
    if (intent === 'basic_setup') {
      return {
        id: 'evelyn_basic',
        message: `${pickRandom(EXACT_RESPONSES)} Start node wired to a Print. The simplest possible graph — somewhere even you can build from.`,
        nodes: [
          { id: 'n_start', nodeKind: 'start',         x: 0,   y: 150 },
          { id: 'n_str',   nodeKind: 'const_string',  x: 0,   y: 300, props: { value: 'Hello from FlowPins!' } },
          { id: 'n_print', nodeKind: 'console_print', x: 300, y: 150 },
        ],
        edges: [
          { source: 'n_start', target: 'n_print', sourceHandle: 'exec_out', targetHandle: 'exec_in' },
          { source: 'n_str',   target: 'n_print', sourceHandle: 'value',    targetHandle: 'message' },
        ]
      };
    }

    // --- Unknown: Evelyn scavenges what she can ---
    if (intent === 'unknown') {
      // Try to find nodes whose titles contain words from the prompt
      const words = req.rawPrompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const matchedKinds: string[] = [];
      for (const word of words) {
        for (const [kind, spec] of Object.entries(NODE_LIBRARY as Record<string, NodeSpec>)) {
          if (spec.title.toLowerCase().includes(word) && !matchedKinds.includes(kind)) {
            matchedKinds.push(kind);
            if (matchedKinds.length >= 4) break;
          }
        }
        if (matchedKinds.length >= 4) break;
      }

      if (matchedKinds.length > 0) {
        return {
          id: 'evelyn_scavenged',
          message: pickRandom(BAFFLED_RESPONSES),
          nodes: matchedKinds.map((kind, i) => ({
            id: `n_scav_${i}`,
            nodeKind: kind,
            x: i * 250,
            y: 150
          })),
          edges: []
        };
      }

      // Truly nothing found — drop a start node so they at least have something
      return {
        id: 'evelyn_nothing',
        message: "I have combed the entire archive and found nothing matching that description. I've placed a Start node. You're on your own from here.",
        nodes: [{ id: 'n_start', nodeKind: 'start', x: 0, y: 150 }],
        edges: []
      };
    }

    return null;
  }
}
