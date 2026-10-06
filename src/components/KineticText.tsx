import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface KineticTextProps {
  text: string;
  fontSize?: number;
  highlightWords?: string[];
  delay?: number;
  lineHeight?: number;
  staggerFrames?: number;
  align?: "center" | "left" | "right";
  fontWeight?: number | string;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  fontSize = 64,
  highlightWords = [],
  delay = 0,
  lineHeight = 1.15,
  staggerFrames = 3,
  align = "center",
  fontWeight = 800,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
        gap: `${fontSize * 0.28}px`,
        maxWidth: 1200,
        margin: "0 auto",
        lineHeight,
      }}
    >
      {words.map((word, index) => {
        const wordDelay = delay + index * staggerFrames;
        const spr = spring({
          frame: frame - wordDelay,
          fps,
          config: {
            damping: 12,
            mass: 0.4,
            stiffness: 120,
          },
        });

        const translateY = interpolate(spr, [0, 1], [40, 0], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });

        const opacity = interpolate(spr, [0, 1], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });

        const blur = interpolate(spr, [0, 1], [10, 0], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });

        const scale = interpolate(spr, [0, 1], [0.85, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });

        const isHighlight = highlightWords.some(
          (hw) => hw.toLowerCase() === word.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")
        );

        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: "inline-block",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize,
              fontWeight,
              letterSpacing: "-0.02em",
              transform: `translateY(${translateY}px) scale(${scale})`,
              opacity,
              filter: `blur(${blur}px)`,
              background: isHighlight
                ? "linear-gradient(135deg, #14F195 0%, #00F0FF 50%, #9945FF 100%)"
                : "linear-gradient(180deg, #FFFFFF 30%, #A1A1AA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: isHighlight ? "0 0 35px rgba(20, 241, 149, 0.4)" : "none",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
