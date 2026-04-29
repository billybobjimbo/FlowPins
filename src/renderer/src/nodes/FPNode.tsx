// src/renderer/src/nodes/FPNode.tsx
import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

// --- THE BRAND COLOR LOOKUP ---
const getProfileColor = (profile: string) => {
  const p = (profile || "").toLowerCase();
  
  if (p.includes('toon boom - blur'))     return "#5b9bd5"; // Light Blue - Blur
  if (p.includes('toon boom - effects'))  return "#7b68ee"; // Purple - Effects  
  if (p.includes('toon boom - colour'))   return "#48a999"; // Teal - Colour
  if (p.includes('toon boom - output'))   return "#e8503a"; // Red - Output
  if (p.includes('toon boom - composite'))return "#4a83c4"; // Blue - Composite
  if (p.includes('toon boom - rigging'))  return "#66bb6a"; // Green - Rigging
  if (p.includes('toon boom - scene'))    return "#ffa726"; // Orange - Scene
  if (p.includes('toon boom - ui'))       return "#ab47bc"; // Violet - UI
  if (p.includes('toon boom - camera'))   return "#26c6da"; // Cyan - Camera
  if (p.includes('toon boom - query'))    return "#8d6e63"; // Brown - Query
  if (p.includes('toon boom') || p.includes('toonboom')) return "#4a83c4"; // Blue - fallback
  if (p.includes('maya')) return "#c343ea"; // Grey
  if (p.includes('python')) return "#2d572c"; // Green
  if (p.includes('lua') || p.includes('fusion')) return "#242a59"; // Navy
  if (p.includes('c#') || p.includes('unity')) return "#e66900"; // Orange
  if (p.includes('game') || p.includes('gml')) return "#00ff8c"; // GameMaker Cyan
  if (p.includes('pipeline - naming'))   return "#f5a623"; // Amber - Naming
  if (p.includes('pipeline - reporting')) return "#e8943a"; // Dark Amber - Reporting
  if (p.includes('pipeline - image'))     return "#ffcc44"; // Yellow - Image
  if (p.includes('pipeline'))             return "#f5a623"; // Amber - Pipeline (fallback)
  if (p.includes('core')) return "#aaaaaa"; // Neutral Grey for Standard Library
  
  return "#ffffff"; // Fallback
};

// --- THE DATA PIN COLOR LOOKUP ---
const getPinColor = (pinType?: string) => {
  if (!pinType) return "#888888";
  if (pinType === "exec") return "#ffffff";
  if (pinType === "string") return "#ff007f"; // Magenta
  if (pinType === "int" || pinType === "float" || pinType === "number") return "#00e5ff"; // Cyan
  if (pinType === "boolean") return "#ff2a2a"; // Red
  if (pinType === "any") return "#826cf3"; // Light Purple
  return "#aaaaaa"; // Fallback Gray
};

export const FPNode = memo(function FPNode(props: NodeProps<any>) {
  const { data, selected } = props;
  const nodeKind = data.nodeKind;

  let inputs = [...(data.injectedInputs || [])];
  const outputs = [...(data.injectedOutputs || [])];

  if (nodeKind === "tb_dynamic_refract") {
    const currentBlur = data.props?.blur_type || "Box";
    inputs.push({ name: "intensity", pin_type: "float" });
    if (currentBlur === "Box") inputs.push({ name: "box_radius", pin_type: "float" });
    else if (currentBlur === "Gaussian") inputs.push({ name: "gauss_radius", pin_type: "float" });
    else if (currentBlur === "Radial") inputs.push({ name: "radial_radius", pin_type: "float" });
  }

  // Grab the theme color for this specific node
  const themeColor = getProfileColor(data.profile);

  return (
    <div
      style={{
        minWidth: 200, borderRadius: 12, padding: "14px", position: "relative",
        background: "rgba(20,20,20,0.95)",
        // The border and glow now match the App's brand color!
        border: selected ? `2px solid ${themeColor}` : "2px solid #333",
        boxShadow: selected ? `0 0 20px ${themeColor}60` : "0 10px 30px rgba(0,0,0,0.5)", 
        color: "white", display: "flex", flexDirection: "column", gap: 12,
        transition: "all 0.2s ease"
      }}
    >
      {/* Node Header */}
      <div style={{ borderBottom: "1px solid #333", paddingBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: themeColor }}>
          {data.label}
        </div>
        <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2, textTransform: 'uppercase', letterSpacing: '1px' }}>
          {data.profile}
        </div>
      </div>

      {/* Pins Container */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
        
        {/* INPUTS (LEFT) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
          {inputs.map((p: any) => {
            const isExec = p.pin_type === "exec";
            const pinColor = getPinColor(p.pin_type);
            return (
              <div key={p.name} style={{ display: "flex", alignItems: "center", position: "relative", height: 20 }}>
                <Handle 
                  type="target" position={Position.Left} id={p.name} 
                  style={{ 
                    width: isExec ? 12 : 10, height: isExec ? 12 : 10, 
                    borderRadius: isExec ? 2 : 999, 
                    background: pinColor,
                    border: "1px solid #000", left: -21 
                  }} 
                />
                <span style={{ fontSize: 12, color: pinColor }}>{p.name}</span> 
              </div>
            );
          })}
        </div>

        {/* OUTPUTS (RIGHT) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
          {outputs.map((p: any) => {
            const isExec = p.pin_type === "exec";
            const pinColor = getPinColor(p.pin_type);
            return (
              <div key={p.name} style={{ display: "flex", alignItems: "center", position: "relative", height: 20 }}>
                {/* Note how the text label comes BEFORE the handle on the right side! */}
                <span style={{ fontSize: 12, color: pinColor }}>{p.name}</span> 
                <Handle 
                  type="source" position={Position.Right} id={p.name} 
                  style={{ 
                    width: isExec ? 12 : 10, height: isExec ? 12 : 10, 
                    borderRadius: isExec ? 2 : 999, 
                    background: pinColor,
                    border: "1px solid #000", right: -21 
                  }} 
                />
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
});