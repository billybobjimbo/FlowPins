// src/renderer/src/nodes/FPNode.tsx
import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { alpha, pinColor } from "../libraries/theme";
import { profileColorFor } from "../libraries/skins";
import { useSkin } from "../libraries/SkinProvider";

// Colour lookups previously lived here as getProfileColor() and getPinColor().
// Both are now in theme.ts — getPinColor was missing a 'list' case, so list
// pins rendered grey here and cyan on Confluence nodes.

export const FPNode = memo(function FPNode(props: NodeProps<any>) {
  const { data, selected } = props;
  const nodeKind = data.nodeKind;

  // Tokens come from the active skin, so switching target restyles every node
  // without this component knowing which skin is in play.
  const skin = useSkin();
  const { surface, border, text, shadow, radius } = skin;

  let inputs = [...(data.injectedInputs || [])];
  const outputs = [...(data.injectedOutputs || [])];

  if (nodeKind === "tb_dynamic_refract") {
    const currentBlur = data.props?.blur_type || "Box";
    inputs.push({ name: "intensity", pin_type: "float" });
    if (currentBlur === "Box") inputs.push({ name: "box_radius", pin_type: "float" });
    else if (currentBlur === "Gaussian") inputs.push({ name: "gauss_radius", pin_type: "float" });
    else if (currentBlur === "Radial") inputs.push({ name: "radial_radius", pin_type: "float" });
  }

  const themeColor = profileColorFor(data.profile, skin);

  return (
    <div
      style={{
        minWidth: 200, borderRadius: radius.lg, padding: "14px", position: "relative",
        background: surface.node,
        // Unselected nodes used a flat neutral border, which sat ~7 L* off the
        // node body and gave the card no edge — it read as a blur on the canvas.
        // Tinting the border with the node's own profile colour defines the
        // edge AND makes category legible across the whole graph at a glance,
        // not just on the selected node.
        border: selected
          ? `2px solid ${themeColor}`
          : `2px solid ${alpha(themeColor, 0.55)}`,
        boxShadow: selected
          ? `0 0 18px ${alpha(themeColor, 0.28)}, ${shadow.node}`
          : shadow.node,
        color: text.primary, display: "flex", flexDirection: "column", gap: 12,
        transition: "all 0.2s ease"
      }}
    >
      {/* Node Header */}
      <div style={{ borderBottom: `1px solid ${border.default}`, paddingBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: themeColor }}>
          {data.label}
        </div>
        <div style={{ fontSize: 11, color: text.disabled, marginTop: 2, textTransform: 'uppercase', letterSpacing: '1px' }}>
          {data.profile}
        </div>
      </div>

      {/* Pins Container */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>

        {/* INPUTS (LEFT) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
          {inputs.map((p: any) => {
            const isExec = p.pin_type === "exec";
            const c = pinColor(p.pin_type);
            return (
              <div key={p.name} style={{ display: "flex", alignItems: "center", position: "relative", height: 20 }}>
                <Handle
                  type="target" position={Position.Left} id={p.name}
                  style={{
                    width: isExec ? 12 : 10, height: isExec ? 12 : 10,
                    borderRadius: isExec ? 2 : 999,
                    background: c,
                    border: `1px solid ${alpha(surface.canvas, 0.75)}`, left: -21
                  }}
                />
                <span style={{ fontSize: 12, color: c }}>{p.name}</span>
              </div>
            );
          })}
        </div>

        {/* OUTPUTS (RIGHT) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
          {outputs.map((p: any) => {
            const isExec = p.pin_type === "exec";
            const c = pinColor(p.pin_type);
            return (
              <div key={p.name} style={{ display: "flex", alignItems: "center", position: "relative", height: 20 }}>
                {/* Label sits before the handle on the right side */}
                <span style={{ fontSize: 12, color: c }}>{p.name}</span>
                <Handle
                  type="source" position={Position.Right} id={p.name}
                  style={{
                    width: isExec ? 12 : 10, height: isExec ? 12 : 10,
                    borderRadius: isExec ? 2 : 999,
                    background: c,
                    border: `1px solid ${alpha(surface.canvas, 0.75)}`, right: -21
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
