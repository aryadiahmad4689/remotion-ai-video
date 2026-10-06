import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Gentle pulsing glow positions
  const glow1X = 25 + Math.sin(frame / 35) * 8;
  const glow1Y = 30 + Math.cos(frame / 40) * 10;
  const glow2X = 75 + Math.cos(frame / 30) * 8;
  const glow2Y = 70 + Math.sin(frame / 35) * 10;

  // Grid line animation
  const gridOffsetY = (frame * 1.5) % 40;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: "#07090E",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* Dynamic Aurora Glows */}
      <div
        style={{
          position: "absolute",
          top: `${glow1Y}%`,
          left: `${glow1X}%`,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(153, 69, 255, 0.28) 0%, rgba(153, 69, 255, 0) 70%)",
          transform: "translate(-50%, -50%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: `${glow2Y}%`,
          left: `${glow2X}%`,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20, 241, 149, 0.22) 0%, rgba(20, 241, 149, 0) 70%)",
          transform: "translate(-50%, -50%)",
          filter: "blur(70px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 194, 255, 0.15) 0%, rgba(0, 194, 255, 0) 70%)",
          transform: "translate(-50%, -50%)",
          filter: "blur(80px)",
        }}
      />

      {/* Cyberpunk Animated Perspective Grid */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "65%",
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          backgroundPosition: `0px ${gridOffsetY}px`,
          transform: "perspective(600px) rotateX(65deg)",
          transformOrigin: "bottom center",
          opacity: 0.6,
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 90%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 90%)",
        }}
      />

      {/* Subtle Vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at center, transparent 40%, rgba(7, 9, 14, 0.8) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
