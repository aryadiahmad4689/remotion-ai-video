import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export interface EditorialHeaderProps {
  channel?: string;
  tagline?: string;
  badge?: string;
  padding?: string;
  progressBarHeight?: number;
}

const BLUE = "#2563EB";
const RED = "#E63946";
const MUTED = "#71717A";
const MONO = "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace";

export const EditorialHeader: React.FC<EditorialHeaderProps> = ({
  channel = "MINO",
  tagline = "POWERED BY SUSAHBELAJAR",
  badge,
  padding,
  progressBarHeight = 6,
}) => {
  const frame = useCurrentFrame();
  const { width, durationInFrames } = useVideoConfig();

  const isWidescreen = width >= 1600;
  const effectivePadding = padding || (isWidescreen ? "16px 64px 0 64px" : "36px 48px 0 48px");
  const effectiveBadge = badge || (isWidescreen ? "LONG FORM" : "SHORTS");

  const progress = interpolate(
    frame,
    [0, Math.max(1, durationInFrames - 1)],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        pointerEvents: "none",
      }}
    >
      {/* Top Red & Blue Progress Bar */}
      <div style={{ width: "100%", height: progressBarHeight, background: "rgba(0, 0, 0, 0.08)" }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${BLUE}, ${RED})`,
          }}
        />
      </div>

      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: effectivePadding,
        }}
      >
        {/* Left: [MINO] POWERED BY SUSAHBELAJAR */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: BLUE,
              color: "#FFFFFF",
              fontFamily: MONO,
              fontSize: isWidescreen ? 15 : 18,
              fontWeight: 800,
              padding: isWidescreen ? "4px 12px" : "6px 14px",
              borderRadius: 4,
              letterSpacing: 2,
            }}
          >
            {channel}
          </div>
          <span
            style={{
              fontFamily: MONO,
              fontSize: isWidescreen ? 14 : 15,
              fontWeight: 700,
              color: MUTED,
              letterSpacing: 1.5,
            }}
          >
            {tagline}
          </span>
        </div>

        {/* Right Badge: ● LONG FORM / SHORTS */}
        {effectiveBadge && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: MONO,
              fontSize: isWidescreen ? 13 : 14,
              color: RED,
              fontWeight: 700,
              background: "rgba(230, 57, 70, 0.08)",
              padding: isWidescreen ? "4px 12px" : "6px 14px",
              borderRadius: 4,
              border: `1px solid ${RED}33`,
              letterSpacing: 1,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: RED,
              }}
            />
            {effectiveBadge}
          </div>
        )}
      </div>
    </div>
  );
};
