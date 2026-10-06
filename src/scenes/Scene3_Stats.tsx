import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SolanaBadge } from "../components/SolanaBadge";
import { KineticText } from "../components/KineticText";
import { MetricCard } from "../components/MetricCard";

export const Scene3_Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exit transition
  const exitProgress = spring({
    frame: frame - 70,
    fps,
    config: { damping: 15, mass: 0.5, stiffness: 120 },
  });

  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.95], {
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
      <div style={{ marginBottom: 24 }}>
        <SolanaBadge label="PERFORMANCE BENCHMARKS" delay={2} />
      </div>

      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <KineticText
          text="UNRIVALED SPEED AND INFRASTRUCTURE"
          fontSize={54}
          highlightWords={["UNRIVALED", "SPEED"]}
          delay={6}
          staggerFrames={2}
        />
      </div>

      {/* 3 Metric Cards */}
      <div
        style={{
          display: "flex",
          gap: 28,
          width: "100%",
          maxWidth: 1100,
          justifyContent: "center",
        }}
      >
        <MetricCard
          label="NETWORK CAPACITY"
          targetValue={65000}
          suffix=" TPS"
          subtext="Theoretical peak throughput across parallel SVM runtimes."
          delay={12}
          accentColor="#14F195"
        />

        <MetricCard
          label="TRANSACTION FEE"
          targetValue={0.00025}
          prefix="$"
          decimals={5}
          subtext="Negligible friction for high-frequency AI micro-swaps."
          delay={20}
          accentColor="#00F0FF"
        />

        <MetricCard
          label="GPT-6.1 SOL SAVINGS"
          targetValue={80}
          suffix="% LESS"
          subtext="Agentic inference cost reduction vs legacy flagship models."
          delay={28}
          accentColor="#9945FF"
        />
      </div>
    </div>
  );
};
