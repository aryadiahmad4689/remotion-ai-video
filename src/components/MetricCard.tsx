import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface MetricCardProps {
  label: string;
  targetValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  subtext: string;
  delay?: number;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  targetValue,
  prefix = "",
  suffix = "",
  decimals = 0,
  subtext,
  delay = 0,
  accentColor = "#14F195",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 14,
      mass: 0.7,
      stiffness: 110,
    },
  });

  const cardScale = interpolate(entrance, [0, 1], [0.85, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const cardOpacity = interpolate(entrance, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const cardY = interpolate(entrance, [0, 1], [30, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Number counting progress
  const countProgress = spring({
    frame: frame - (delay + 6),
    fps,
    config: {
      damping: 20,
      mass: 1,
      stiffness: 80,
    },
  });

  const animatedVal = interpolate(countProgress, [0, 1], [0, targetValue], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const formattedValue =
    decimals > 0
      ? animatedVal.toFixed(decimals)
      : Math.floor(animatedVal).toLocaleString();

  // Progress line width
  const progressWidth = interpolate(countProgress, [0, 1], [0, 100], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        flex: 1,
        minWidth: 260,
        maxWidth: 360,
        padding: "32px 28px",
        borderRadius: 24,
        background: "rgba(17, 24, 39, 0.65)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 20px -5px ${accentColor}33`,
        backdropFilter: "blur(20px)",
        transform: `translateY(${cardY}px) scale(${cardScale})`,
        opacity: cardOpacity,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent light bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 3,
          width: `${progressWidth}%`,
          background: `linear-gradient(90deg, #9945FF, ${accentColor})`,
          boxShadow: `0 0 10px ${accentColor}`,
        }}
      />

      {/* Label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "#94A3B8",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {label}
      </div>

      {/* Numeric Metric */}
      <div
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 48,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          marginBottom: 8,
          textShadow: `0 0 25px ${accentColor}44`,
        }}
      >
        <span style={{ color: accentColor }}>{prefix}</span>
        <span>{formattedValue}</span>
        <span style={{ fontSize: 28, color: "#A1A1AA" }}>{suffix}</span>
      </div>

      {/* Subtext */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 14,
          color: "#64748B",
          lineHeight: 1.4,
        }}
      >
        {subtext}
      </div>
    </div>
  );
};
