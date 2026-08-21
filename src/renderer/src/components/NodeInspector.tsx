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
      <div style={{ width: 280, background: "var(--fp-surface-base)", borderLeft: "2px solid var(--fp-surface-overlay)", padding: 20, color: "var(--fp-text-disabled)" }}>
        Select a node to inspect its properties.
      </div>
    );
  }

  const spec = NODE_LIBRARY[node.data.nodeKind];

  return (
    <div style={{ width: 280, background: "var(--fp-surface-base)", borderLeft: "2px solid var(--fp-surface-overlay)", padding: 20, color: "white", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 14, fontWeight: "bold", color: "var(--fp-accent-primary)", borderBottom: "1px solid var(--fp-border-default)", paddingBottom: 8 }}>
        Properties: {node.data.nodeKind}
      </div>

      {/* Node Title/Label */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 11, color: "var(--fp-text-secondary)", textTransform: "uppercase" }}>Display Name</label>
        <input
          type="text"
          value={node.data.label}
          onChange={(e) => onChangeLabel(e.target.value)}
          style={{ background: "var(--fp-surface-overlay)", border: "1px solid var(--fp-border-strong)", color: "white", padding: "8px", borderRadius: 4, fontSize: 12 }}
        />
      </div>

      {/* GENERIC UI RENDERER */}
      {spec?.ui_schema?.map((uiItem: any) => (
        <div key={uiItem.prop_key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, color: "var(--fp-accent-primary)", textTransform: "uppercase", fontWeight: "bold" }}>
            {uiItem.label}
          </label>

          {/* NUMBER INPUT (Fixed variable name to uiItem) */}
          {uiItem.type === "number" && (
            <input
              type="number"
              value={node.data.props?.[uiItem.prop_key] ?? 0}
              onChange={(e) => onChangeProp(uiItem.prop_key, parseInt(e.target.value) || 0)}
              style={{ width: "100%", background: "var(--fp-surface-overlay)", border: "1px solid var(--fp-border-strong)", color: "var(--fp-text-bright)", padding: "8px", borderRadius: "4px" }}
            />
          )}

          {/* TEXT INPUT (For Joint Names, etc) */}
          {uiItem.type === "input" && (
            <input
              type="text"
              value={node.data.props?.[uiItem.prop_key] ?? ""}
              onChange={(e) => onChangeProp(uiItem.prop_key, e.target.value)}
              style={{ width: "100%", background: "var(--fp-surface-overlay)", border: "1px solid var(--fp-border-strong)", color: "var(--fp-text-bright)", padding: "8px", borderRadius: "4px" }}
            />
          )}
          
          {/* DROPDOWN */}
          {uiItem.type === "dropdown" && (
            <select
              value={node.data.props?.[uiItem.prop_key] || (uiItem.options ? uiItem.options[0] : "")}
              onChange={(e) => onChangeProp(uiItem.prop_key, e.target.value)}
              style={{ background: "var(--fp-surface-canvas)", border: "1px solid var(--fp-border-strong)", color: "white", padding: "8px", borderRadius: 4, fontSize: 12 }}
            >
              {uiItem.options?.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {/* CHECKBOX */}
          {uiItem.type === "checkbox" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={node.data.props?.[uiItem.prop_key] === true || node.data.props?.[uiItem.prop_key] === "true"}
                onChange={(e) => onChangeProp(uiItem.prop_key, e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--fp-accent-primary)", cursor: "pointer" }}
              />
              <span style={{ fontSize: 12, color: "var(--fp-text-primary)" }}>
                {node.data.props?.[uiItem.prop_key] === true || node.data.props?.[uiItem.prop_key] === "true" ? "true" : "false"}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Manual override for Const String (optional if ui_schema is used instead) */}
      {node.data.nodeKind === "const_string" && !spec?.ui_schema && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, color: "var(--fp-accent-primary)", textTransform: "uppercase", fontWeight: "bold" }}>String Value</label>
          <input
            type="text"
            value={node.data.props?.value || ""}
            onChange={(e) => onChangeProp("value", e.target.value)}
            style={{ background: "var(--fp-surface-canvas)", border: "1px solid var(--fp-accent-primary)", color: "white", padding: "8px", borderRadius: 4, fontSize: 12 }}
          />
        </div>
      )}
    </div>
  );
};