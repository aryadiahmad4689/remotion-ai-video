import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SolanaBadge } from "../components/SolanaBadge";
import { KineticText } from "../components/KineticText";

export const Scene1_Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exit transition for Scene 1
  const exitProgress = spring({
    frame: frame - 65,
    fps,
    config: { damping: 15, mass: 0.5, stiffness: 120 },
  });

  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const exitScale = interpolate(exitProgress, [0, 1], [1, 1.05], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Subtitle spring
  const subSpr = spring({
    frame: frame - 22,
    fps,
    config: { damping: 14, mass: 0.5, stiffness: 100 },
  });

  const subOpacity = interpolate(subSpr, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const subY = interpolate(subSpr, [0, 1], [25, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

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
        transform: `scale(${exitScale})`,
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <SolanaBadge label="NEXT-GEN AUTONOMOUS STACK" delay={5} />
      </div>

      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <KineticText
          text="GPT-6.1 SOLANA INTELLIGENCE AT HYPERSPEED"
          fontSize={68}
          highlightWords={["GPT-6.1", "SOLANA", "HYPERSPEED"]}
          delay={12}
          staggerFrames={3}
        />
      </div>

      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 24,
          color: "#94A3B8",
          letterSpacing: "0.02em",
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          textAlign: "center",
          maxWidth: 800,
        }}
      >
        Bridging frontier OpenAI agentic reasoning with the ultra-fast Solana Virtual Machine.
      </div>
    </div>
  );
};
