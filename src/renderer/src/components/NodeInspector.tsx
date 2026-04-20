import React from "react";
import { type Node } from "reactflow";
import { NODE_LIBRARY } from "../libraries"; 

export type FPNodeData = {
  label: string;
  nodeKind: string;
  profile: string;
  props: Record<string, any>;
  injectedInputs?: any[];
  injectedOutputs?: any[];
};

interface Props {
  node: Node<FPNodeData> | null;
  onChangeLabel: (label: string) => void;
  onChangeProp: (key: string, value: any) => void;
}

export const NodeInspector = ({ node, onChangeLabel, onChangeProp }: Props) => {
  if (!node) {
    return (
      <div style={{ width: 280, background: "#111", borderLeft: "2px solid #222", padding: 20, color: "#666" }}>
        Select a node to inspect its properties.
      </div>
    );
  }

  const spec = NODE_LIBRARY[node.data.nodeKind];

  return (
    <div style={{ width: 280, background: "#111", borderLeft: "2px solid #222", padding: 20, color: "white", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 14, fontWeight: "bold", color: "#00d8ff", borderBottom: "1px solid #333", paddingBottom: 8 }}>
        Properties: {node.data.nodeKind}
      </div>

      {/* Node Title/Label */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase" }}>Display Name</label>
        <input
          type="text"
          value={node.data.label}
          onChange={(e) => onChangeLabel(e.target.value)}
          style={{ background: "#222", border: "1px solid #444", color: "white", padding: "8px", borderRadius: 4, fontSize: 12 }}
        />
      </div>

      {/* GENERIC UI RENDERER */}
      {spec?.ui_schema?.map((uiItem: any) => (
        <div key={uiItem.prop_key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, color: "#00d8ff", textTransform: "uppercase", fontWeight: "bold" }}>
            {uiItem.label}
          </label>

          {/* NUMBER INPUT (Fixed variable name to uiItem) */}
          {uiItem.type === "number" && (
            <input
              type="number"
              value={node.data.props?.[uiItem.prop_key] ?? 0}
              onChange={(e) => onChangeProp(uiItem.prop_key, parseInt(e.target.value) || 0)}
              style={{ width: "100%", background: "#222", border: "1px solid #444", color: "#eee", padding: "8px", borderRadius: "4px" }}
            />
          )}

          {/* TEXT INPUT (For Joint Names, etc) */}
          {uiItem.type === "input" && (
            <input
              type="text"
              value={node.data.props?.[uiItem.prop_key] ?? ""}
              onChange={(e) => onChangeProp(uiItem.prop_key, e.target.value)}
              style={{ width: "100%", background: "#222", border: "1px solid #444", color: "#eee", padding: "8px", borderRadius: "4px" }}
            />
          )}
          
          {/* DROPDOWN */}
          {uiItem.type === "dropdown" && (
            <select
              value={node.data.props?.[uiItem.prop_key] || (uiItem.options ? uiItem.options[0] : "")}
              onChange={(e) => onChangeProp(uiItem.prop_key, e.target.value)}
              style={{ background: "#050505", border: "1px solid #444", color: "white", padding: "8px", borderRadius: 4, fontSize: 12 }}
            >
              {uiItem.options?.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}
        </div>
      ))}

      {/* Manual override for Const String (optional if ui_schema is used instead) */}
      {node.data.nodeKind === "const_string" && !spec?.ui_schema && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, color: "#00d8ff", textTransform: "uppercase", fontWeight: "bold" }}>String Value</label>
          <input
            type="text"
            value={node.data.props?.value || ""}
            onChange={(e) => onChangeProp("value", e.target.value)}
            style={{ background: "#050505", border: "1px solid #00d8ff", color: "white", padding: "8px", borderRadius: 4, fontSize: 12 }}
          />
        </div>
      )}
    </div>
  );
};