import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { VoxChartData } from "./types";
import { VoxRedMarker } from "./VoxRedMarker";

interface VoxChartProps {
  data: VoxChartData;
  delay?: number;
}

export const VoxChart: React.FC<VoxChartProps> = ({ data, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
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
          maxWidth: 1100,
          background: "#FFFFFF",
          padding: "50px 65px",
          borderRadius: 8,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.18)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          opacity: interpolate(entrance, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(entrance, [0, 1], [30, 0])}px)`,
        }}
      >
        {/* Chart Header */}
        <div style={{ marginBottom: 36, borderBottom: "1px solid #E4E4E7", paddingBottom: 16 }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              color: "#71717A",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            [DATA VISUALIZATION // {data.unit}]
          </div>
          <h3
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 36,
              fontWeight: 700,
              color: "#09090B",
              margin: 0,
            }}
          >
            {data.title}
          </h3>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              color: "#52525B",
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            {data.subtitle}
          </p>
        </div>

        {/* Bar List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {data.items.map((item, idx) => {
            const barSpring = spring({
              frame: frame - (delay + 15 + idx * 8),
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
                {/* Bar Label */}
                <div
                  style={{
                    width: 220,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 20,
                    fontWeight: item.highlight ? 800 : 500,
                    color: item.highlight ? "#09090B" : "#71717A",
                    textAlign: "right",
                  }}
                >
                  {item.label}
                </div>

                {/* Bar Track & Fill */}
                <div
                  style={{
                    flex: 1,
                    height: 38,
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
                      boxShadow: item.highlight ? "0 0 15px rgba(20, 241, 149, 0.4)" : "none",
                    }}
                  />
                </div>

                {/* Numerical Value */}
                <div
                  style={{
                    position: "relative",
                    width: 140,
                    fontFamily: "monospace",
                    fontSize: 24,
                    fontWeight: 800,
                    color: item.highlight ? "#09090B" : "#52525B",
                  }}
                >
                  {animatedValue.toLocaleString()}
                  {item.highlight && (
                    <VoxRedMarker delay={delay + 45} width={130} height={36} color="#E63946" />
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
