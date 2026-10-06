import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SolanaBadge } from "../components/SolanaBadge";
import { KineticText } from "../components/KineticText";

export const Scene2_Capabilities: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exit transition
  const exitProgress = spring({
    frame: frame - 72,
    fps,
    config: { damping: 14, mass: 0.5, stiffness: 120 },
  });

  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const exitY = interpolate(exitProgress, [0, 1], [0, -30], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const features = [
    {
      title: "Parallel SVM Compute",
      desc: "Multi-threaded state execution handles thousands of autonomous agent actions concurrently.",
      icon: "⚡",
      color: "#14F195",
    },
    {
      title: "Sub-Second Finality",
      desc: "400ms block times ensure real-time AI decision-making without blockchain lag.",
      icon: "⏱️",
      color: "#00F0FF",
    },
    {
      title: "Fractional-Cent Gas",
      desc: "Under $0.0003 per transaction enables micro-frequency agent payments and calls.",
      icon: "💎",
      color: "#9945FF",
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        opacity: exitOpacity,
        transform: `translateY(${exitY}px)`,
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <SolanaBadge label="CORE CAPABILITIES" delay={2} />
      </div>

      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <KineticText
          text="WHY SOLANA IS THE HOME FOR AI AGENTS"
          fontSize={54}
          highlightWords={["SOLANA", "AGENTS"]}
          delay={6}
          staggerFrames={2}
        />
      </div>

      {/* Feature Cards Grid */}
      <div
        style={{
          display: "flex",
          gap: 24,
          width: "100%",
          maxWidth: 1100,
          justifyContent: "center",
        }}
      >
        {features.map((feat, idx) => {
          const cardSpring = spring({
            frame: frame - (18 + idx * 7),
            fps,
            config: { damping: 14, mass: 0.6, stiffness: 110 },
          });

          const scale = interpolate(cardSpring, [0, 1], [0.85, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });
          const opacity = interpolate(cardSpring, [0, 1], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });
          const translateY = interpolate(cardSpring, [0, 1], [40, 0], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });

          return (
            <div
              key={feat.title}
              style={{
                flex: 1,
                padding: "36px 30px",
                borderRadius: 24,
                background: "rgba(15, 23, 42, 0.65)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: `0 15px 35px -10px rgba(0, 0, 0, 0.6), 0 0 15px ${feat.color}22`,
                backdropFilter: "blur(16px)",
                transform: `translateY(${translateY}px) scale(${scale})`,
                opacity,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 16,
                  background: `${feat.color}15`,
                  border: `1px solid ${feat.color}33`,
                }}
              >
                {feat.icon}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  marginBottom: 12,
                }}
              >
                {feat.title}
              </div>
              <div
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 15,
                  color: "#94A3B8",
                  lineHeight: 1.5,
                }}
              >
                {feat.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
