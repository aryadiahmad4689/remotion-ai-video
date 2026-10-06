import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface VoxRedMarkerProps {
  width?: number;
  height?: number;
  delay?: number;
  strokeWidth?: number;
  color?: string; // Vox red "#E63946"
}

export const VoxRedMarker: React.FC<VoxRedMarkerProps> = ({
  width = 280,
  height = 90,
  delay = 0,
  strokeWidth = 5,
  color = "#E63946",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drawProgress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 15,
      mass: 0.7,
      stiffness: 90,
    },
  });

  const pathLength = 650;
  const strokeDashoffset = interpolate(drawProgress, [0, 1], [pathLength, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const opacity = interpolate(drawProgress, [0, 0.1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Hand-drawn organic ellipse path with overlapping tail
  const rx = width / 2;
  const ry = height / 2;
  const cx = width / 2 + 10;
  const cy = height / 2 + 10;

  return (
    <div
      style={{
        position: "absolute",
        top: -12,
        left: -16,
        width: width + 24,
        height: height + 24,
        pointerEvents: "none",
        zIndex: 10,
        opacity,
      }}
    >
      <svg
        width={width + 24}
        height={height + 24}
        style={{ overflow: "visible" }}
      >
        <path
          d={`
            M ${cx - rx + 10} ${cy - 4}
            C ${cx - rx} ${cy - ry}, ${cx + rx} ${cy - ry - 2}, ${cx + rx} ${cy}
            C ${cx + rx + 4} ${cy + ry}, ${cx - rx + 15} ${cy + ry + 4}, ${cx - rx + 5} ${cy + 6}
            C ${cx - rx - 2} ${cy + 2}, ${cx - rx + 30} ${cy - ry + 10}, ${cx} ${cy - ry + 4}
          `}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
    </div>
  );
};
