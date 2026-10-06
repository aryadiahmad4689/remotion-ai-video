import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { CaptionWord } from "./types";

interface VoxCaptionsProps {
  words: CaptionWord[];
  bottom?: number;
  fontSize?: number;
}

interface CaptionPhrase {
  words: CaptionWord[];
  start: number;
  end: number;
}

export const VoxCaptions: React.FC<VoxCaptionsProps> = ({
  words,
  bottom = 50,
  fontSize = 32,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSeconds = frame / fps;

  // Group words into natural stable phrases (4-6 words or sentence pauses)
  const phrases = useMemo(() => {
    if (!words || words.length === 0) return [];
    const result: CaptionPhrase[] = [];
    let currentChunk: CaptionWord[] = [];

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const prev = currentChunk[currentChunk.length - 1];
      const isPause = prev && (w.start - prev.end > 0.4 || /[.,!?]$/.test(prev.word));
      const isMaxWords = currentChunk.length >= 6;

      if (currentChunk.length > 0 && (isPause || isMaxWords)) {
        result.push({
          words: currentChunk,
          start: currentChunk[0].start,
          end: currentChunk[currentChunk.length - 1].end + 0.3,
        });
        currentChunk = [w];
      } else {
        currentChunk.push(w);
      }
    }
    if (currentChunk.length > 0) {
      result.push({
        words: currentChunk,
        start: currentChunk[0].start,
        end: currentChunk[currentChunk.length - 1].end + 0.3,
      });
    }
    return result;
  }, [words]);

  // Find the active phrase for current time
  const currentPhrase = phrases.find(
    (p) => currentSeconds >= p.start - 0.05 && currentSeconds <= p.end
  );

  if (!currentPhrase) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 28px",
          background: "#18181B",
          borderRadius: 8,
          boxShadow: "0 14px 36px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: -0.5,
          color: "#F5F2EB",
          whiteSpace: "nowrap",
        }}
      >
        {currentPhrase.words.map((item, idx) => {
          const isSpoken = currentSeconds >= item.start;
          const isCurrent = currentSeconds >= item.start && currentSeconds <= item.end + 0.05;

          return (
            <span
              key={`${item.word}-${item.start}-${idx}`}
              style={{
                display: "inline-block",
                padding: "3px 8px",
                background: isCurrent ? "#FFE600" : "transparent",
                color: isCurrent ? "#18181B" : isSpoken ? "#FFFFFF" : "#A1A1AA",
                borderRadius: 4,
                transform: isCurrent ? "scale(1.05)" : "scale(1)",
                transition: "none",
              }}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
