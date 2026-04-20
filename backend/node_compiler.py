# backend/node_compiler.py
import json
import sys
import os

def trace_data_flow(node_id, nodes, edges):
    """Finds data connected to this node and strips React Flow prefixes."""
    incoming_edges = [e for e in edges if e['target'] == node_id]
    results = {}
    for edge in incoming_edges:
        source_node = next((n for n in nodes if n['id'] == edge['source']), None)
        if source_node:
            val = source_node['data'].get('props', {}).get('value')
            raw_handle = edge['targetHandle'] or ""
            clean_handle = raw_handle.replace('in:', '').replace('out:', '')
            results[clean_handle] = val
    return results

def run_production_test():
    graph_path = sys.argv[1] if len(sys.argv) > 1 else 'backend/workspace.json'
    memory = {} # Our runtime memory

    try:
        with open(graph_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        nodes = data.get('nodes', [])
        edges = data.get('edges', [])
        print(f"--- PRODUCTION RUN: FLOWPINS ENGINE ---")

        for n in nodes:
            kind = n.get('data', {}).get('nodeKind')
            props = n.get('data', {}).get('props', {})

            if kind == 'set_var':
                data_in = trace_data_flow(n['id'], nodes, edges)
                name = data_in.get('var_name') or "unnamed"
                val = data_in.get('value') or 0
                memory[name] = val
                print(f" [OK] Memory Updated: {name} = {val}")

            if kind == 'maya_create_locator':
                # Try to get name from a variable if nothing is hardcoded
                loc_name = props.get('name') or memory.get('PlayerGold', 'Default_Loc')
                print(f" [OK] Maya Command: cmds.spaceLocator(n='{loc_name}')")

    except Exception as e:
        print(f"[SYSTEM ERROR] {str(e)}")

if __name__ == "__main__":
    run_production_test()