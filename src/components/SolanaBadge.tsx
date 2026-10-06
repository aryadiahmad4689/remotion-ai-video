import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface SolanaBadgeProps {
  label?: string;
  delay?: number;
}

export const SolanaBadge: React.FC<SolanaBadgeProps> = ({
  label = "SOLANA SVM × GPT-6.1 SOL",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 14,
      mass: 0.6,
      stiffness: 140,
    },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const translateY = interpolate(entrance, [0, 1], [25, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const scale = interpolate(entrance, [0, 1], [0.85, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Pulse effect
  const pulse = Math.sin((frame - delay) / 15) * 0.05 + 1;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 24px",
        borderRadius: 999,
        background: "rgba(15, 23, 42, 0.75)",
        border: "1px solid rgba(20, 241, 149, 0.35)",
        boxShadow: "0 0 25px rgba(20, 241, 149, 0.15), 0 0 15px rgba(153, 69, 255, 0.2)",
        backdropFilter: "blur(12px)",
        transform: `translateY(${translateY}px) scale(${scale * (entrance >= 0.99 ? pulse : 1)})`,
        opacity,
      }}
    >
      {/* Solana Logo Micro-Emblem */}
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
          boxShadow: "0 0 10px #14F195",
        }}
      />
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          background: "linear-gradient(90deg, #FFFFFF 0%, #14F195 50%, #9945FF 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {label}
      </span>
    </div>
  );
};
