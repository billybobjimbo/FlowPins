from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Any


# -----------------------------
# Specs
# -----------------------------
@dataclass(frozen=True)
class PinSpec:
    name: str
    pin_type: str  # "int", "string", "bool", "any", "exec"


@dataclass(frozen=True)
class NodeSpec:
    kind: str
    title: str
    inputs: List[PinSpec] = field(default_factory=list)
    outputs: List[PinSpec] = field(default_factory=list)
    default_props: Dict[str, Any] = field(default_factory=dict)


# -----------------------------
# UI helper: title formatting
# (Import this from graphics_items.py)
# -----------------------------
def display_title_for_node(node_data) -> str:
    """
    Returns a user-friendly title based on node kind + props.
    UI-only: does not affect export/model behavior.
    """
    kind = getattr(node_data, "kind", "")
    props = getattr(node_data, "props", {}) or {}
    base = getattr(node_data, "title", kind)

    # Vars
    if kind in {"get_var", "set_var_exec", "inc_var_exec", "add_to_var_exec", "sub_from_var_exec"}:
        name = str(props.get("name", "x")).strip() or "x"
        if kind == "get_var":
            return f"Get Var: {name}"
        if kind == "set_var_exec":
            return f"Set Var: {name}"
        if kind == "inc_var_exec":
            return f"Inc Var: {name}"
        if kind == "add_to_var_exec":
            return f"Add To Var: {name}"
        if kind == "sub_from_var_exec":
            return f"Sub From Var: {name}"

    # Functions
    if kind in {"function_exec", "call_function_exec"}:
        name = str(props.get("name", "MyFunction")).strip() or "MyFunction"
        if kind == "function_exec":
            return f"Function: {name}"
        if kind == "call_function_exec":
            return f"Call: {name}"

    # Compare
    if kind == "compare_int":
        op = str(props.get("op", ">")).strip() or ">"
        return f"Compare (int) {op}"

    # Params
    if kind == "get_param":
        name = str(props.get("name", "param")).strip() or "param"
        return f"Get Param: {name}"

    # Maya helper title (optional)
    if kind == "maya_create_locator_exec":
        # If you later add props like prefix/name, show them nicely
        nm = str(props.get("name", "fp_loc")).strip() or "fp_loc"
        return f"Maya Locator: {nm}"

    # Collections
    if kind == "make_list_empty":
        return "List"
    if kind.startswith("make_list_"):
        # e.g. "make_list_3" -> "Make List (3)"
        try:
            n = int(kind.split("_")[-1])
            return f"Make List ({n})"
        except Exception:
            return "Make List"
    if kind == "make_map_empty":
        return "Map"
    if kind == "list_append_exec":
        return "List Append"
    if kind == "list_get":
        return "List Get"
    if kind == "list_len":
        return "List Len"
    if kind == "map_set_exec":
        return "Map Set"
    if kind == "map_get":
        return "Map Get"
    if kind == "foreach_list_exec":
        return "ForEach List"
    if kind == "foreach_map_items_exec":
        return "ForEach Map Items"

    return base


def _make_list_n_spec(n: int) -> NodeSpec:
    inputs = [PinSpec(f"item_{i}", "any") for i in range(1, n + 1)]
    return NodeSpec(
        kind=f"make_list_{n}",
        title=f"Make List ({n})",
        inputs=inputs,
        outputs=[PinSpec("list", "any")],
        default_props={},
    )


# -----------------------------
# Node Library
# -----------------------------
NODE_LIBRARY: Dict[str, NodeSpec] = {
    # -------------------------
    # Data / Expression nodes
    # -------------------------
    "const_int": NodeSpec(
        kind="const_int",
        title="Const Int",
        inputs=[],
        outputs=[PinSpec("value", "int")],
        default_props={"value": 0},
    ),
    "const_string": NodeSpec(
        kind="const_string",
        title="Const String",
        inputs=[],
        outputs=[PinSpec("value", "string")],
        default_props={"value": ""},
    ),
    "add_int": NodeSpec(
        kind="add_int",
        title="Add (int)",
        inputs=[PinSpec("a", "int"), PinSpec("b", "int")],
        outputs=[PinSpec("result", "int")],
        default_props={},
    ),
    # NEW
    "mul_int": NodeSpec(
        kind="mul_int",
        title="Multiply (int)",
        inputs=[PinSpec("a", "int"), PinSpec("b", "int")],
        outputs=[PinSpec("result", "int")],
        default_props={},
    ),
    "compare_int": NodeSpec(
        kind="compare_int",
        title="Compare (int)",
        inputs=[PinSpec("a", "int"), PinSpec("b", "int")],
        outputs=[PinSpec("result", "bool")],
        default_props={"op": ">"},
    ),
    "branch": NodeSpec(
        kind="branch",
        title="Branch (expr)",
        inputs=[PinSpec("cond", "bool"), PinSpec("then", "any"), PinSpec("else", "any")],
        outputs=[PinSpec("value", "any")],
        default_props={},
    ),
    "print": NodeSpec(
        kind="print",
        title="Print (expr)",
        inputs=[PinSpec("value", "any")],
        outputs=[],
        default_props={},
    ),

    # -------------------------
    # Params
    # -------------------------
    "get_param": NodeSpec(
        kind="get_param",
        title="Get Param",
        inputs=[],
        outputs=[PinSpec("value", "any")],
        default_props={"name": "param"},
    ),

    # -------------------------
    # Exec flow nodes
    # -------------------------
    "start": NodeSpec(
        kind="start",
        title="Start",
        inputs=[],
        outputs=[PinSpec("exec", "exec")],  # backward compatible
        default_props={},
    ),
    "print_exec": NodeSpec(
        kind="print_exec",
        title="Print (Exec)",
        inputs=[PinSpec("exec_in", "exec"), PinSpec("value", "any")],
        outputs=[PinSpec("exec_out", "exec")],
        default_props={},
    ),
    "if_exec": NodeSpec(
        kind="if_exec",
        title="If (Exec)",
        inputs=[PinSpec("exec_in", "exec"), PinSpec("cond", "bool")],
        outputs=[PinSpec("then", "exec"), PinSpec("else", "exec")],
        default_props={},
    ),
    "merge_exec": NodeSpec(
        kind="merge_exec",
        title="Merge (Exec)",
        inputs=[PinSpec("in_a", "exec"), PinSpec("in_b", "exec")],
        outputs=[PinSpec("exec_out", "exec")],
        default_props={},
    ),
    "sequence_exec": NodeSpec(
        kind="sequence_exec",
        title="Sequence (Exec)",
        inputs=[PinSpec("exec_in", "exec")],
        outputs=[PinSpec("exec_out_1", "exec"), PinSpec("exec_out_2", "exec")],
        default_props={},
    ),

    "function_exec": NodeSpec(
        kind="function_exec",
        title="Function (Exec)",
        inputs=[],
        outputs=[PinSpec("body", "exec")],
        default_props={"name": "MyFunction"},
    ),
    "call_function_exec": NodeSpec(
        kind="call_function_exec",
        title="Call Function (Exec)",
        inputs=[PinSpec("exec_in", "exec")],
        outputs=[PinSpec("exec_out", "exec"), PinSpec("result", "any")],
        default_props={"name": "MyFunction"},
    ),
    "return_exec": NodeSpec(
        kind="return_exec",
        title="Return (Exec)",
        inputs=[PinSpec("exec_in", "exec"), PinSpec("value", "any")],
        outputs=[],
        default_props={},
    ),

    # -------------------------
    # Loop nodes
    # -------------------------
    "foreach_range_exec": NodeSpec(
        kind="foreach_range_exec",
        title="ForEach Range (Exec)",
        inputs=[PinSpec("exec_in", "exec"), PinSpec("start", "int"), PinSpec("end", "int")],
        outputs=[PinSpec("loop_body", "exec"), PinSpec("completed", "exec"), PinSpec("index", "int")],
        default_props={},
    ),
    "foreach_list_exec": NodeSpec(
        kind="foreach_list_exec",
        title="ForEach List (Exec)",
        inputs=[PinSpec("exec_in", "exec"), PinSpec("list", "any")],
        outputs=[
            PinSpec("loop_body", "exec"),
            PinSpec("completed", "exec"),
            PinSpec("item", "any"),
            PinSpec("index", "int"),
        ],
        default_props={},
    ),
    "foreach_map_items_exec": NodeSpec(
        kind="foreach_map_items_exec",
        title="ForEach Map Items (Exec)",
        inputs=[PinSpec("exec_in", "exec"), PinSpec("map", "any")],
        outputs=[
            PinSpec("loop_body", "exec"),
            PinSpec("completed", "exec"),
            PinSpec("key", "any"),
            PinSpec("value", "any"),
            PinSpec("index", "int"),
        ],
        default_props={},
    ),
    "break_exec": NodeSpec(
        kind="break_exec",
        title="Break (Exec)",
        inputs=[PinSpec("exec_in", "exec")],
        outputs=[],
        default_props={},
    ),
    "continue_exec": NodeSpec(
        kind="continue_exec",
        title="Continue (Exec)",
        inputs=[PinSpec("exec_in", "exec")],
        outputs=[],
        default_props={},
    ),

    # -------------------------
    # Variables (data + exec)
    # -------------------------
    "get_var": NodeSpec(
        kind="get_var",
        title="Get Var",
        inputs=[],
        outputs=[PinSpec("value", "any")],
        default_props={"name": "x"},
    ),
    "set_var_exec": NodeSpec(
        kind="set_var_exec",
        title="Set Var (Exec)",
        inputs=[PinSpec("exec_in", "exec"), PinSpec("value", "any")],
        outputs=[PinSpec("exec_out", "exec")],
        default_props={"name": "x"},
    ),
    "inc_var_exec": NodeSpec(
        kind="inc_var_exec",
        title="Inc Var (Exec)",
        inputs=[PinSpec("exec_in", "exec")],
        outputs=[PinSpec("exec_out", "exec")],
        default_props={"name": "x"},
    ),
    "add_to_var_exec": NodeSpec(
        kind="add_to_var_exec",
        title="Add To Var (Exec)",
        inputs=[PinSpec("exec_in", "exec"), PinSpec("value", "any")],
        outputs=[PinSpec("exec_out", "exec")],
        default_props={"name": "x"},
    ),
    "sub_from_var_exec": NodeSpec(
        kind="sub_from_var_exec",
        title="Sub From Var (Exec)",
        inputs=[PinSpec("exec_in", "exec"), PinSpec("value", "any")],
        outputs=[PinSpec("exec_out", "exec")],
        default_props={"name": "x"},
    ),

    # -------------------------
    # Maya (Exec)
    # -------------------------
    "maya_create_locator_exec": NodeSpec(
        kind="maya_create_locator_exec",
        title="Maya: Create Locator (Exec)",
        inputs=[
            PinSpec("exec_in", "exec"),
            PinSpec("name", "string"),
            PinSpec("x", "int"),
            PinSpec("y", "int"),
            PinSpec("z", "int"),
        ],
        outputs=[
            PinSpec("exec_out", "exec"),
            PinSpec("locator", "any"),
        ],
        default_props={"name": "fp_loc"},
    ),

    # -------------------------
    # Collections (List / Map)
    # -------------------------
    "make_list_empty": NodeSpec(
        kind="make_list_empty",
        title="Make List",
        inputs=[],
        outputs=[PinSpec("list", "any")],
        default_props={},
    ),

    # Make List (N)
    "make_list_1": _make_list_n_spec(1),
    "make_list_2": _make_list_n_spec(2),
    "make_list_3": _make_list_n_spec(3),
    "make_list_4": _make_list_n_spec(4),
    "make_list_5": _make_list_n_spec(5),
    "make_list_6": _make_list_n_spec(6),

    "list_append_exec": NodeSpec(
        kind="list_append_exec",
        title="List Append (Exec)",
        inputs=[PinSpec("exec_in", "exec"), PinSpec("list", "any"), PinSpec("value", "any")],
        outputs=[PinSpec("exec_out", "exec")],
        default_props={},
    ),
    "list_get": NodeSpec(
        kind="list_get",
        title="List Get",
        inputs=[PinSpec("list", "any"), PinSpec("index", "int")],
        outputs=[PinSpec("value", "any")],
        default_props={},
    ),
    "list_len": NodeSpec(
        kind="list_len",
        title="List Length",
        inputs=[PinSpec("list", "any")],
        outputs=[PinSpec("length", "int")],
        default_props={},
    ),
    "make_map_empty": NodeSpec(
        kind="make_map_empty",
        title="Make Map",
        inputs=[],
        outputs=[PinSpec("map", "any")],
        default_props={},
    ),
    "map_set_exec": NodeSpec(
        kind="map_set_exec",
        title="Map Set (Exec)",
        inputs=[PinSpec("exec_in", "exec"), PinSpec("map", "any"), PinSpec("key", "any"), PinSpec("value", "any")],
        outputs=[PinSpec("exec_out", "exec")],
        default_props={},
    ),
    "map_get": NodeSpec(
        kind="map_get",
        title="Map Get",
        inputs=[PinSpec("map", "any"), PinSpec("key", "any")],
        outputs=[PinSpec("value", "any")],
        default_props={},
    ),
}