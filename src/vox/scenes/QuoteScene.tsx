import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { QuoteSceneData } from "../longform-types";
import { VoxHighlighter } from "../VoxHighlighter";

export const QuoteScene: React.FC<{ data: QuoteSceneData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.7, stiffness: 95 },
  });

  const scale = interpolate(entrance, [0, 1], [0.88, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        padding: "0 140px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          background: "#FFFFFF",
          padding: "60px 80px",
          borderRadius: 8,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.18)",
          transform: `scale(${scale})`,
          opacity,
          position: "relative",
        }}
      >
        {/* Giant Quote Mark Accent */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 35,
            fontFamily: "Georgia, serif",
            fontSize: 120,
            lineHeight: 1,
            color: "rgba(0,0,0,0.08)",
            pointerEvents: "none",
          }}
        >
          “
        </div>

        {/* Quote Content */}
        <blockquote
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 38,
            lineHeight: 1.45,
            color: "#09090B",
            margin: "0 0 32px 0",
            position: "relative",
            zIndex: 1,
          }}
        >
          {data.quote.split(data.highlightWord)[0]}
          <VoxHighlighter delay={15} color="#FFE600">
            <span>{data.highlightWord}</span>
          </VoxHighlighter>
          {data.quote.split(data.highlightWord)[1] || ""}
        </blockquote>

        {/* Attribution Bar */}
        <div style={{ borderTop: "2px solid #18181B", paddingTop: 18, display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 800, color: "#18181B" }}>
              {data.author}
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 14, color: "#71717A", marginTop: 4 }}>
              {data.source}
            </div>
          </div>
          <div
            style={{
              padding: "6px 16px",
              background: "#F4F4F5",
              borderRadius: 4,
              fontFamily: "monospace",
              fontSize: 14,
              color: "#E63946",
              fontWeight: 700,
              height: "fit-content",
            }}
          >
            [EXPERT TESTIMONY]
          </div>
        </div>
      </div>
    </div>
  );
};
