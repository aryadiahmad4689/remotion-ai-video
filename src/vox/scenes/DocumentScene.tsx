import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { VoxHighlighter } from "../VoxHighlighter";
import { VoxRedMarker } from "../VoxRedMarker";
import { DocumentSceneData } from "../longform-types";

export const DocumentScene: React.FC<{ data: DocumentSceneData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 90 },
  });

  const continuousZoom = interpolate(frame, [0, durationInFrames], [1, 1.06], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const scale = interpolate(entrance, [0, 1], [0.88, 1]) * continuousZoom;
  const rotateX = interpolate(entrance, [0, 1], [12, 3]);
  const rotateY = interpolate(entrance, [0, 1], [-10, -2]);
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
          padding: "55px 65px",
          borderRadius: 4,
          boxShadow: `
            0 30px 60px -15px rgba(0, 0, 0, 0.22),
            0 10px 25px -5px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(0, 0, 0, 0.08)
          `,
          transform: `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          opacity,
          transformOrigin: "center center",
          position: "relative",
          color: "#18181B",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #18181B",
            paddingBottom: 12,
            marginBottom: 24,
            fontFamily: "monospace",
            fontSize: 13,
            letterSpacing: "0.12em",
            color: "#52525B",
            textTransform: "uppercase",
          }}
        >
          <span>{data.source}</span>
          <span>DATE: {data.date}</span>
          <span style={{ color: "#E63946", fontWeight: 700 }}>[EXHIBIT]</span>
        </div>

        {/* Headline */}
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 42,
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#09090B",
            marginBottom: 20,
          }}
        >
          {data.headline}
        </h2>

        {/* Quote */}
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
          <VoxHighlighter delay={15} color="#FFE600">
            <span style={{ fontWeight: 600 }}>{data.highlightedExcerpt}</span>
          </VoxHighlighter>
          {data.quote.split(data.highlightedExcerpt)[1] || ""}
        </p>

        {/* Evidence Marker */}
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
          <span>EVIDENCE RECORD // #VERIFIED</span>
          <VoxRedMarker delay={35} width={260} height={42} />
        </div>
      </div>
    </div>
  );
};
