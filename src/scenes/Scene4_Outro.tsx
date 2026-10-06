import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SolanaBadge } from "../components/SolanaBadge";
import { KineticText } from "../components/KineticText";

export const Scene4_Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // CTA Button entrance
  const btnSpr = spring({
    frame: frame - 25,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 120 },
  });

  const btnScale = interpolate(btnSpr, [0, 1], [0.8, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const btnOpacity = interpolate(btnSpr, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const glowPulse = Math.sin(frame / 12) * 15 + 30;

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
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <SolanaBadge label="AUTONOMOUS ECOSYSTEM" delay={2} />
      </div>

      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <KineticText
          text="BUILD THE NEXT GENERATION OF ON-CHAIN AI"
          fontSize={62}
          highlightWords={["GENERATION", "ON-CHAIN", "AI"]}
          delay={8}
          staggerFrames={3}
        />
      </div>

      {/* Action / Branding Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          transform: `scale(${btnScale})`,
          opacity: btnOpacity,
        }}
      >
        <div
          style={{
            padding: "18px 48px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
            boxShadow: `0 0 ${glowPulse}px rgba(20, 241, 149, 0.5), 0 0 40px rgba(153, 69, 255, 0.4)`,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 20,
              fontWeight: 800,
              color: "#0B0E14",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Launch with Remotion × GPT-6.1 Sol
          </span>
          <span style={{ fontSize: 22, color: "#0B0E14" }}>🚀</span>
        </div>

        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 16,
            color: "#64748B",
            letterSpacing: "0.05em",
          }}
        >
          solana.com/ai • deterministic programmatic video
        </div>
      </div>
    </div>
  );
};
