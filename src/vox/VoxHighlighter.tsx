import { Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SFX_ENABLED } from "./sfxConfig";

interface VoxHighlighterProps {
  children: React.ReactNode;
  delay?: number;
  durationInFrames?: number;
  color?: string; // default Vox yellow "#FFE600"
  playSound?: boolean;
  style?: React.CSSProperties;
}

export const VoxHighlighter: React.FC<VoxHighlighterProps> = ({
  children,
  delay = 0,
  durationInFrames = 20,
  color = "#FFE600",
  playSound = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 18,
      mass: 0.8,
      stiffness: 110,
    },
  });

  const widthPct = interpolate(progress, [0, 1], [0, 100], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        zIndex: 1,
        ...style,
      }}
    >
      {/* The Highlighter Pen Stroke */}
      <span
        style={{
          position: "absolute",
          left: -4,
          top: "8%",
          height: "88%",
          width: `${widthPct}%`,
          backgroundColor: color,
          opacity: 0.88,
          borderRadius: 4,
          transform: "skewX(-3deg)",
          zIndex: -1,
          pointerEvents: "none",
          boxShadow: `0 0 10px ${color}66`,
          transition: "none",
        }}
      />
      {playSound && SFX_ENABLED && (
        <Sequence from={delay}>
          <Audio src={staticFile("sfx/highlighter_scratch.mp3")} volume={0.3} />
        </Sequence>
      )}
      {children}
    </span>
  );
};
