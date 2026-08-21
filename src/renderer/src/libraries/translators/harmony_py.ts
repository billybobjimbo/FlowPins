// src/renderer/src/libraries/translators/harmony_py.ts
// ============================================================================
// FLOWPINS: TOON BOOM HARMONY (PYTHON INTERFACE) TRANSLATION DICTIONARY
// Target: Harmony 22+ Python Interface  (from ToonBoom import harmony)
//
// This is a SEPARATE target from harmony.ts (Qt Script / "Harmony 21+
// JavaScript scripting API"). Qt Script and the Python Interface are not
// interchangeable at the node level — Qt Script globals like node.add(),
// node.link(), node.subNodes() do not exist in the Python object model.
// The Python Interface instead exposes a live object graph:
//
//   from ToonBoom import harmony
//   sess  = harmony.session()
//   proj  = sess.project
//   scene = proj.scene
//   nodes = scene.nodes            # OMC::NodeList — all nodes in the scene
//   node.ports_in / node.ports_out # OMC::PortList — iterable port lists
//   in_port.source                 # the connected OutPort, or None if empty
//
// WHY THIS TARGET EXISTS:
//   Scene Pulse (Harmony scene health monitor) requires real port-linkage
//   introspection (orphan detection) and a path to real OS-level memory
//   diagnostics via psutil — neither is clean to do in Qt Script. The
//   Python Interface gives us both, plus a much flatter object model for
//   traversal (scene.nodes is a direct list — no manual recursive walk).
//
// CONFIRMED API SURFACE (tested in Harmony 27, Python 3.9.13):
//   in_port.source         → returns connected OutPort or None ✓
//   out_port.destinations  → returns list of downstream InPorts ✓
//   out_port.cables        → also exists (lower-level, unused here) ✓
//   MULTIPORT_IN nodes     → throw on .source — must be skipped ✓
//   psutil                 → works after pip install into Py39 ✓
//   scene.nodes            → returns full node list (2166 in test scene) ✓
//
// Style: mirrors houdini.ts / maya.ts — inherits PYTHON_TRANSLATIONS,
// overrides only Harmony-Python-specific behaviour below.
// ============================================================================

import { PYTHON_TRANSLATIONS } from './python';

// Every compiled Harmony-Python script needs this session boilerplate once
// at the top. The compiler should prepend this automatically for any graph
// targeting the "toonboom_python" profile — see compiler.ts note at bottom
// of this file for the suggested hook point.
export const HARMONY_PY_PREAMBLE = `from ToonBoom import harmony

_fp_sess  = harmony.session()
_fp_proj  = _fp_sess.project
_fp_scene = _fp_proj.scene
`;

export const HARMONY_PY_TRANSLATIONS: Record<string, any> = {
  // Inherit all Core Math, Logic, Variables, Collections, and Loops
  ...PYTHON_TRANSLATIONS,

  // --- HARMONY PYTHON OVERRIDES: App-specific behaviour ---
  "keyboard_check": "False  # Harmony lacks realtime key loops",
  "is_free":        "True  # No collision engine in Harmony",

  // ==========================================================================
  // SCENE PULSE — CORE DETECTION NODES (Harmony 22+ Python Interface)
  // ==========================================================================

  // ── Get every node in the scene as a flat list ───────────────────────────
  // Spec pins stay path-based (string) like every other tb_ node so this
  // slots into the existing palette/UI conventions. The translator does the
  // object lookup internally.
  "tb_get_scene_nodes": `# Get every node in the scene as a flat list of paths
_fp_node_objs_{node_id} = list(_fp_scene.nodes)
node_list  = [n.path for n in _fp_node_objs_{node_id}]
node_count = len(node_list)
print("FlowPins: Scene has " + str(node_count) + " nodes.")
{exec_out}`,

  // ── Orphan check: is this node disconnected on all ports? ────────────────
  // node_path is UI-only (ui_schema literal, no data pin).
  // CONFIRMED in Harmony 27: .destinations works, MULTIPORT_IN throws on
  // .source so those nodes are treated as always-connected (never orphaned).
  "tb_is_node_orphaned": `# Check whether a node has zero connections on every in-port and out-port
_fp_target_{node_id} = _fp_scene.nodes["{node_path}"]

# MULTIPORT_IN nodes throw on .source — treat as always connected
if _fp_target_{node_id}.node_type == "MULTIPORT_IN":
    _fp_in_linked_{node_id} = True
else:
    _fp_in_linked_{node_id} = any(
        (p.source is not None) for p in _fp_target_{node_id}.ports_in
    )

# Confirmed: out_port.destinations returns downstream InPort list
_fp_out_linked_{node_id} = any(
    len(list(p.destinations)) > 0 for p in _fp_target_{node_id}.ports_out
)

is_orphaned = (not _fp_in_linked_{node_id}) and (not _fp_out_linked_{node_id})
{exec_out}`,

  // ── Severity classification (the context-aware differentiator) ──────────
  // node_path is UI-only here too (same reasoning as tb_is_node_orphaned
  // above) — quoted explicitly in the substitution below.
  // Pure logic, no new API surface beyond .name and .parent_group(). This
  // is the studio-configurable layer: suppression patterns below should
  // become a user-editable list in the panel, not a hardcoded constant —
  // ship with a sane default set, let Mercury (or any studio) edit it.
  "tb_classify_orphan_severity": `# Classify an orphaned node's severity based on naming + context
import re

_fp_node_{node_id} = _fp_scene.nodes["{node_path}"]
_fp_name_{node_id}  = _fp_node_{node_id}.name

# Studio-configurable suppression patterns — group names that indicate
# the artist intentionally parked work-in-progress / scratch nodes here.
_fp_suppress_groups_{node_id} = ["_temp", "_scratch", "_unused", "_wip"]

# Harmony's default auto-generated name patterns (Peg-1, Drawing-3, etc.)
_fp_default_name_{node_id} = bool(re.match(r"^(Peg|Drawing|Composite|Group|Read)-\\d+$", _fp_name_{node_id}))

_fp_parent_{node_id} = _fp_node_{node_id}.parent_group()
_fp_parent_name_{node_id} = _fp_parent_{node_id}.name if _fp_parent_{node_id} else ""

_fp_in_scratch_group_{node_id} = any(
    tag in _fp_parent_name_{node_id}.lower() for tag in _fp_suppress_groups_{node_id}
)

if _fp_in_scratch_group_{node_id}:
    severity = "Suppressed"
    reason   = "Inside scratch/WIP group: " + _fp_parent_name_{node_id}
elif _fp_default_name_{node_id}:
    severity = "Critical"
    reason   = "Default name + zero connections: " + _fp_name_{node_id}
else:
    severity = "Review"
    reason   = "Custom name but zero connections: " + _fp_name_{node_id}

{exec_out}`,

  // ── Convenience compound: scan + filter + classify in one pass ──────────
  // Loops the scene node list through orphan-check + classification.
  // Built from the primitives above rather than being its own opaque block,
  // so a studio can still drop down to the primitive nodes if they want a
  // custom pipeline (e.g. only scanning a sub-group, not the whole scene).
  "tb_scan_orphaned_nodes": `# Full scan: find every orphaned node in the scene and classify severity
import re

_fp_suppress_groups_{node_id} = ["_temp", "_scratch", "_unused", "_wip"]
_fp_results_{node_id} = []

for _fp_n_{node_id} in _fp_scene.nodes:
    # MULTIPORT_IN nodes throw on .source — treat as always connected
    if _fp_n_{node_id}.node_type == "MULTIPORT_IN":
        _fp_in_linked_{node_id} = True
    else:
        _fp_in_linked_{node_id} = any((p.source is not None) for p in _fp_n_{node_id}.ports_in)
    # Confirmed: out_port.destinations is the correct property
    _fp_out_linked_{node_id} = any(len(list(p.destinations)) > 0 for p in _fp_n_{node_id}.ports_out)

    if _fp_in_linked_{node_id} or _fp_out_linked_{node_id}:
        continue  # not orphaned, skip

    _fp_name_{node_id} = _fp_n_{node_id}.name
    _fp_default_name_{node_id} = bool(re.match(r"^(Peg|Drawing|Composite|Group|Read)-\\d+$", _fp_name_{node_id}))
    _fp_parent_{node_id} = _fp_n_{node_id}.parent_group()
    _fp_parent_name_{node_id} = _fp_parent_{node_id}.name if _fp_parent_{node_id} else ""
    _fp_in_scratch_{node_id} = any(tag in _fp_parent_name_{node_id}.lower() for tag in _fp_suppress_groups_{node_id})

    if _fp_in_scratch_{node_id}:
        _fp_sev_{node_id} = "Suppressed"
        _fp_reason_{node_id} = "Inside scratch/WIP group: " + _fp_parent_name_{node_id}
    elif _fp_default_name_{node_id}:
        _fp_sev_{node_id} = "Critical"
        _fp_reason_{node_id} = "Default name + zero connections"
    else:
        _fp_sev_{node_id} = "Review"
        _fp_reason_{node_id} = "Custom name but zero connections"

    _fp_results_{node_id}.append({
        "path": _fp_n_{node_id}.path,
        "name": _fp_name_{node_id},
        "severity": _fp_sev_{node_id},
        "reason": _fp_reason_{node_id},
    })

orphan_results = _fp_results_{node_id}
orphan_count   = len(_fp_results_{node_id})
print("FlowPins: Scene Pulse found " + str(orphan_count) + " orphaned node(s).")
{exec_out}`,

  // ==========================================================================
  // SCENE PULSE — MEMORY PULSE (OS-level, via psutil)
  // ==========================================================================
  // Ambient/ always-on gauge reading — real process memory, not per-node
  // estimation. Per-node "why" breakdown is a separate Phase 2 node once
  // the inferred-cost model (resolution x bit depth x frame count) is
  // scoped — that piece does NOT need this translator, it's pure Harmony
  // attribute reads (no psutil), so it can be drafted independent of this.
  "tb_get_process_memory_mb": `# Real OS-level memory usage of the Harmony process (ambient pulse reading)
import psutil, os

_fp_proc_{node_id} = psutil.Process(os.getpid())
memory_mb = round(_fp_proc_{node_id}.memory_info().rss / (1024 * 1024), 1)
{exec_out}`,

};

// ============================================================================
// COMPILER HOOK NOTE (for compiler.ts — not wired up in this file)
// ============================================================================
// Any graph compiling to the "toonboom_python" profile needs
// HARMONY_PY_PREAMBLE prepended once, ahead of the per-node translated
// body, the same way Python target scripts already get their header.
// Suggest mirroring whatever mechanism currently injects the Maya
// `import maya.cmds as cmds` line for maya_python-profile graphs, since
// this is the same shape of problem — one shared import block, not
// per-node repetition.
// ============================================================================
