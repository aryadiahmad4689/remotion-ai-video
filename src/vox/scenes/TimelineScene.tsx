import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TimelineSceneData } from "../longform-types";

export const TimelineScene: React.FC<{ data: TimelineSceneData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 90 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        padding: "0 100px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 14,
            color: "#E63946",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          [CHRONOLOGY // TIMELINE]
        </div>
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 44,
            fontWeight: 700,
            color: "#09090B",
            margin: 0,
          }}
        >
          {data.title}
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, color: "#71717A", marginTop: 8 }}>
          {data.subtitle}
        </p>
      </div>

      {/* 3 Step Timeline Cards */}
      <div style={{ display: "flex", gap: 32, width: "100%", maxWidth: 1200, position: "relative" }}>
        {data.steps.map((step, idx) => {
          const cardSpring = spring({
            frame: frame - (12 + idx * 10),
            fps,
            config: { damping: 14, mass: 0.6, stiffness: 100 },
          });

          const scale = interpolate(cardSpring, [0, 1], [0.85, 1]);
          const opacity = interpolate(cardSpring, [0, 1], [0, 1]);
          const translateY = interpolate(cardSpring, [0, 1], [30, 0]);

          return (
            <div
              key={`${step.time}-${idx}`}
              style={{
                flex: 1,
                background: "#FFFFFF",
                padding: "36px 30px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)",
                transform: `translateY(${translateY}px) scale(${scale})`,
                opacity,
                position: "relative",
              }}
            >
              {/* Timestamp badge */}
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  background: idx === data.steps.length - 1 ? "#FFE600" : "#F4F4F5",
                  borderRadius: 4,
                  fontFamily: "monospace",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#18181B",
                  marginBottom: 16,
                }}
              >
                {step.time}
              </div>

              <h4
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#09090B",
                  marginBottom: 10,
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </h4>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: "#52525B",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
