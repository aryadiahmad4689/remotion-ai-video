import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { VoxHighlighter } from "./VoxHighlighter";
import { VoxRedMarker } from "./VoxRedMarker";
import { VoxDocumentData } from "./types";

interface VoxDocumentProps {
  data: VoxDocumentData;
  delay?: number;
}

export const VoxDocument: React.FC<VoxDocumentProps> = ({ data, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 90 },
  });

  // Slow continuous documentary Ken Burns zoom
  const continuousZoom = interpolate(frame, [0, 300], [1, 1.08], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const scale = interpolate(entrance, [0, 1], [0.85, 1]) * continuousZoom;
  const rotateX = interpolate(entrance, [0, 1], [15, 4]);
  const rotateY = interpolate(entrance, [0, 1], [-12, -3]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        perspective: 1200,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          width: 960,
          background: "#FFFFFF",
          padding: "60px 70px",
          borderRadius: 4,
          boxShadow: `
            0 30px 60px -15px rgba(0, 0, 0, 0.25),
            0 10px 25px -5px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(0, 0, 0, 0.08)
          `,
          transform: `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          opacity,
          transformOrigin: "center center",
          position: "relative",
          color: "#18181B",
        }}
      >
        {/* Document Header Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #18181B",
            paddingBottom: 14,
            marginBottom: 28,
            fontFamily: "monospace",
            fontSize: 13,
            letterSpacing: "0.12em",
            color: "#52525B",
            textTransform: "uppercase",
          }}
        >
          <span>{data.source}</span>
          <span>DATE: {data.date}</span>
          <span style={{ color: "#E63946", fontWeight: 700 }}>[EXHIBIT A]</span>
        </div>

        {/* Big Editorial Headline */}
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#09090B",
            marginBottom: 24,
            letterSpacing: "-0.01em",
          }}
        >
          {data.headline}
        </h2>

        {/* Lead Quote Paragraph with Vox Highlighter */}
        <p
          style={{
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: 22,
            lineHeight: 1.6,
            color: "#27272A",
            marginBottom: 28,
          }}
        >
          {data.quote.split(data.highlightedExcerpt)[0]}
          <VoxHighlighter delay={delay + 20} color="#FFE600">
            <span style={{ fontWeight: 600 }}>{data.highlightedExcerpt}</span>
          </VoxHighlighter>
          {data.quote.split(data.highlightedExcerpt)[1] || ""}
        </p>

        {/* Red Marker Circle around specific evidence */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            padding: "8px 16px",
            background: "#F4F4F5",
            borderRadius: 6,
            fontFamily: "monospace",
            fontSize: 16,
            color: "#18181B",
          }}
        >
          <span>EVIDENCE ID // #SOL-65K-TPS</span>
          <VoxRedMarker delay={delay + 45} width={260} height={42} />
        </div>

        {/* Archival Stamp */}
        <div
          style={{
            position: "absolute",
            bottom: 45,
            right: 60,
            border: "3px solid #E63946",
            color: "#E63946",
            padding: "6px 18px",
            fontFamily: "monospace",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: "0.15em",
            transform: "rotate(-12deg)",
            opacity: 0.85,
            borderRadius: 6,
          }}
        >
          VERIFIED
        </div>
      </div>
    </div>
  );
};
