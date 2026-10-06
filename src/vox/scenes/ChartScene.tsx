import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ChartSceneData } from "../longform-types";
import { VoxRedMarker } from "../VoxRedMarker";

export const ChartScene: React.FC<{ data: ChartSceneData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 90 },
  });

  const maxValue = Math.max(...data.items.map((i) => i.value));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        padding: "0 120px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1080,
          background: "#FFFFFF",
          padding: "48px 60px",
          borderRadius: 8,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.18)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          opacity: interpolate(entrance, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(entrance, [0, 1], [30, 0])}px)`,
        }}
      >
        <div style={{ marginBottom: 32, borderBottom: "1px solid #E4E4E7", paddingBottom: 14 }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              color: "#71717A",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            [DATA // {data.unit}]
          </div>
          <h3
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 34,
              fontWeight: 700,
              color: "#09090B",
              margin: 0,
            }}
          >
            {data.title}
          </h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "#52525B", marginTop: 4, marginBottom: 0 }}>
            {data.subtitle}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {data.items.map((item, idx) => {
            const barSpring = spring({
              frame: frame - (15 + idx * 8),
              fps,
              config: { damping: 14, mass: 0.7, stiffness: 85 },
            });

            const barPct = interpolate(barSpring, [0, 1], [0, (item.value / maxValue) * 100], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            });

            const animatedValue = Math.floor(
              interpolate(barSpring, [0, 1], [0, item.value], {
                extrapolateRight: "clamp",
                extrapolateLeft: "clamp",
              })
            );

            return (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div
                  style={{
                    width: 220,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 18,
                    fontWeight: item.highlight ? 800 : 500,
                    color: item.highlight ? "#09090B" : "#71717A",
                    textAlign: "right",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 36,
                    background: "#F4F4F5",
                    borderRadius: 6,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barPct}%`,
                      background: item.highlight
                        ? "linear-gradient(90deg, #14F195 0%, #00C2FF 100%)"
                        : "#A1A1AA",
                      borderRadius: 6,
                    }}
                  />
                </div>
                <div
                  style={{
                    position: "relative",
                    width: 140,
                    fontFamily: "monospace",
                    fontSize: 22,
                    fontWeight: 800,
                    color: item.highlight ? "#09090B" : "#52525B",
                  }}
                >
                  {animatedValue.toLocaleString()}
                  {item.highlight && (
                    <VoxRedMarker delay={38} width={130} height={34} color="#E63946" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
