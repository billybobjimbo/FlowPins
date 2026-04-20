// src/libraries/librarian.ts
import { NodeSpec } from './types';
import { NODE_LIBRARY } from './index';
import { LOCAL_TEMPLATES } from './templates';

// ============================================================================
// EVELYN: THE FLOWPINS LIBRARIAN
// ============================================================================

export class EvelynLibrarian {
  
  // --- 1. THE PARSER (Evelyn reading the prompt) ---
  static parsePrompt(prompt: string) {
    const p = prompt.toLowerCase();
    let intent = "unknown";
    let entities: any = {};

    // Intent: Spawning / Creating Objects
    if (p.includes("spawn") || p.includes("create") || p.includes("make") || p.includes("generate")) {
      intent = "spawn";
      
      // Sub-Intent: Grids, rows, or multiple items
      if (p.includes("grid") || p.includes("row") || p.includes("line") || p.includes("multiple")) {
        intent = "spawn_grid";
      }

      // Extract Numbers (e.g., "10 objects", "5 instances")
      const numberMatch = p.match(/(\d+)\s*(objects|items|instances|things)/);
      if (numberMatch) {
        entities.count = parseInt(numberMatch[1], 10);
      }
    }

    // Intent: Basic Setup / Hello World
    if (p.includes("basic") || p.includes("hello")) {
      intent = "basic_setup";
    }
    // --- NEW: SCAN ARCHIVES FOR TEMPLATE KEYWORDS ---
    // If the prompt didn't trigger 'spawn' or 'basic', check our custom templates
    if (intent === "unknown") {
      for (const template of LOCAL_TEMPLATES) {
        // If the user's prompt includes ANY of the keywords from the template...
        if (template.keywords.some((kw: string) => p.includes(kw))) {
          intent = "fetch_template";
          entities.templateId = template.id;
          break; // Stop searching once we find a match
        }
      }
    }

    return { intent, entities };
  }
    

    

  // --- 2. THE ARCHIVE (Evelyn's blueprints) ---
  static buildGraph(parsedReq: { intent: string, entities: any }) {
    const { intent, entities } = parsedReq;
    

    if (intent === "spawn_grid" || intent === "spawn") {
      const loopCount = entities.count || 10; // Default to 10 if she didn't find a number
      const spacing = 64; 

      return {
        id: "evelyn_spawn_grid",
        message: `I've set up a grid spawner for ${loopCount} objects. I left the spacing at ${spacing} pixels, but you can change it on the Const Int node!`,
        nodes: [
          { id: "n_start", nodeKind: "start", x: 0, y: 150 },
          { id: "n_limit", nodeKind: "const_int", x: 0, y: 250, props: { value: loopCount } }, 
          { id: "n_loop", nodeKind: "for_loop", x: 250, y: 150 },
          { id: "n_spacing", nodeKind: "const_int", x: 250, y: 350, props: { value: spacing } }, 
          { id: "n_math", nodeKind: "multiply_int", x: 500, y: 250 },
          { id: "n_spawn", nodeKind: "spawn_instance", x: 750, y: 150, props: { obj_name: "MyObject" } }
        ],
        edges: [
          { source: "n_start", target: "n_loop", sourceHandle: "exec_out", targetHandle: "exec" },
          { source: "n_limit", target: "n_loop", sourceHandle: "value", targetHandle: "end" },
          { source: "n_loop", target: "n_spawn", sourceHandle: "loop_body", targetHandle: "exec" },
          { source: "n_loop", target: "n_math", sourceHandle: "index", targetHandle: "a" },
          { source: "n_spacing", target: "n_math", sourceHandle: "value", targetHandle: "b" },
          { source: "n_math", target: "n_spawn", sourceHandle: "result", targetHandle: "x" }
        ]
      };
    }

    if (intent === "fetch_template") {
      // Find the exact template she identified
      const template = LOCAL_TEMPLATES.find((t: any) => t.id === entities.templateId);
      
      if (template) {
        
        // 1. Set her default response
        let evelynResponse = `I found a blueprint for ${template.id.replace('_', ' ')} in the archives. Dropping it now.`;
        
        // 2. Override the response if it's the Mummy Easter Egg!
        if (template.id === "mummy_easter_egg") {
          const comebacks = [
            "I explicitly asked you not to ask about mummies. But fine. Here is a random fact generator.",
            "Why is it always mummies? Here, take your logic tree and leave me alone.",
            "Do I look like an Egyptologist to you? Ugh. Dropping the node graph.",
            "Seriously? We're building a professional pipeline tool and you want mummy facts? Fine.",
            "If you say that word again, I will personally rewrite history to exclude you.",
            "I asked for silence on the matter, not a sequel.",
            "You seem determined to awaken something, and it won’t be my patience.",
            "Remarkable. You’ve managed to ignore me completely—again.",
            "I assure you, there are far worse things than curses—and you’re approaching one.",
            "Do you practice being this irritating, or is it a natural talent?",
            "Yes, yes, very dusty, very ancient—now, can we kindly move on?.",
            "I gave you one instruction. One. It wasn’t a riddle.",
            "You’re not uncovering secrets—you’re unearthing my temper.",
            "Next time you feel the urge to mention it, try… not doing that."

            
          ];
          // Pick a random comeback from the list
          evelynResponse = comebacks[Math.floor(Math.random() * comebacks.length)];
        }

        return {
          id: `evelyn_template_${template.id}`,
          message: evelynResponse,
          nodes: template.nodes,
          edges: template.edges
        };
      }
    }
    

    // Evelyn couldn't find a matching blueprint
    return null; 
  }
}