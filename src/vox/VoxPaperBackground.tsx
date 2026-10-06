import React from "react";
import { AbsoluteFill } from "remotion";

interface VoxPaperBackgroundProps {
  hideCornerLabels?: boolean;
}

export const VoxPaperBackground: React.FC<VoxPaperBackgroundProps> = ({
  hideCornerLabels = false,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F5F2EB",
        overflow: "hidden",
      }}
    >
      {/* Subtle Archival Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Editorial Corner Crosshairs */}
      {!hideCornerLabels && (
        <>
          <div
            style={{
              position: "absolute",
              top: 36,
              left: 36,
              color: "rgba(0,0,0,0.25)",
              fontFamily: "monospace",
              fontSize: 16,
            }}
          >
            + [MINO // SUSAHBELAJAR]
          </div>
          <div
            style={{
              position: "absolute",
              top: 36,
              right: 36,
              color: "rgba(0,0,0,0.25)",
              fontFamily: "monospace",
              fontSize: 14,
            }}
          >
            FIG. 24B
          </div>
        </>
      )}

      {/* Subtle Vignette for Paper Depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, transparent 60%, rgba(0, 0, 0, 0.06) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
