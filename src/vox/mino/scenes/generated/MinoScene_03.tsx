import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MinoCharacter, MinoPose } from "../../MinoCharacter";

const INK = "#18181B";
const MUTED = "#77736C";
const PAPER = "#FFFCF5";
const YELLOW = "#FFE600";
const RED = "#E63946";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const FONT =
  '"Arial", "Helvetica Neue", Helvetica, sans-serif';

const progress = (
  frame: number,
  start: number,
  end: number,
): number =>
  interpolate(
    frame,
    [start, Math.max(start + 0.001, end)],
    [0, 1],
    CLAMP,
  );

/**
 * A finite, normalized documentary spring.
 * Explicit endpoints guarantee a genuinely motionless resting state.
 */
const settledSpring = (
  frame: number,
  fps: number,
  start: number,
  end: number,
): number => {
  if (frame <= start) return 0;
  if (frame >= end) return 1;

  const config = { damping: 22, mass: 0.9, stiffness: 70 };
  const terminal = spring({
    frame: Math.max(0, end - start),
    fps,
    config,
  });

  const value = spring({
    frame: Math.max(0, frame - start),
    fps,
    config,
  });

  return Math.max(0, Math.min(1, value / Math.max(0.001, terminal)));
};

export const MinoScene_03: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chosenPose: MinoPose = "curious";

  // One moving focus at a time:
  // 17–37   headline, one word at a time
  // 58–84   complete editorial panel
  // 90–106  yellow headline underline
  // 135–184 branching connector, drawn as one continuous stroke
  // 235–253 first possible outcome
  // 284–302 second possible outcome
  // 311–327 red marker emphasis
  const panelEntrance = settledSpring(frame, fps, 58, 84);
  const highlight = progress(frame, 90, 106);
  const connector = progress(frame, 135, 184);
  const success = progress(frame, 235, 253);
  const regret = progress(frame, 284, 302);
  const marker = progress(frame, 311, 327);

  const wordStyle = (cue: number): React.CSSProperties => {
    const p = progress(frame, cue, cue + 5);
    return {
      display: "inline-block",
      opacity: p,
      transform: `translateY(${(1 - p) * 13}px)`,
      whiteSpace: "nowrap",
    };
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: 1080,
        height: 1920,
        overflow: "hidden",
        fontFamily: FONT,
        color: INK,
      }}
    >
      {/* Headline: short, sequential word entrances, then fully locked. */}
      <div
        style={{
          position: "absolute",
          left: 84,
          top: 192,
          width: 912,
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 73,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-3.7px",
            display: "flex",
            gap: 18,
            alignItems: "baseline",
          }}
        >
          <span style={wordStyle(17)}>Hal</span>
          <span style={wordStyle(22)}>baru</span>
          <span style={wordStyle(27)}>membawa</span>
        </div>

        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginTop: 8,
          }}
        >
          <svg
            width={780}
            height={30}
            viewBox="0 0 780 30"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: -5,
              bottom: -3,
              overflow: "visible",
              zIndex: 0,
            }}
          >
            <path
              d="M 12 18 C 185 12, 465 13, 756 15"
              fill="none"
              stroke={YELLOW}
              strokeWidth={23}
              strokeLinecap="butt"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - highlight}
              opacity={highlight > 0 ? 1 : 0}
            />
          </svg>

          <span
            style={{
              ...wordStyle(32),
              position: "relative",
              zIndex: 1,
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-4px",
            }}
          >
            ketidakpastian.
          </span>
        </div>
      </div>

      {/* One persistent panel; later beats add evidence instead of replacing it. */}
      <div
        style={{
          position: "absolute",
          left: 84,
          top: 447,
          width: 912,
          height: 490,
          borderRadius: 22,
          border: "2px solid #D6D0C5",
          backgroundColor: PAPER,
          boxShadow: "0 12px 0 rgba(24,24,27,0.045)",
          opacity: panelEntrance,
          transform: `translateY(${(1 - panelEntrance) * 25}px)`,
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        <svg
          width={912}
          height={490}
          viewBox="0 0 912 490"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
          }}
        >
          <defs>
            <pattern
              id="mino-scene03-editorial-grid"
              width={32}
              height={32}
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="#E8E3D9"
                strokeWidth={1}
              />
            </pattern>
          </defs>

          <rect
            x={0}
            y={70}
            width={912}
            height={420}
            fill="url(#mino-scene03-editorial-grid)"
            opacity={0.55}
          />

          <line
            x1={32}
            y1={69}
            x2={880}
            y2={69}
            stroke="#DCD6CA"
            strokeWidth={1.5}
          />

          {/* Quiet registration marks give the diagram an editorial-print feel. */}
          <path
            d="M 34 103 L 34 88 L 49 88 M 863 88 L 878 88 L 878 103"
            fill="none"
            stroke="#BDB6AA"
            strokeWidth={2}
          />

          <circle
            cx={456}
            cy={139}
            r={49}
            fill={INK}
          />
          <circle
            cx={456}
            cy={139}
            r={57}
            fill="none"
            stroke="#D8D1C4"
            strokeWidth={1.5}
          />

          {/*
           * A single uninterrupted path traces the trunk, left branch,
           * then returns along the same branch to reveal the right.
           * Previously drawn geometry remains perfectly still.
           */}
          <path
            d="M 456 241
               L 456 272
               Q 456 287 441 287
               L 247 287
               Q 228 287 228 306
               L 228 332
               L 228 306
               Q 228 287 247 287
               L 441 287
               L 665 287
               Q 684 287 684 306
               L 684 332"
            fill="none"
            stroke={INK}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - connector}
            opacity={connector > 0 ? 1 : 0}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            top: 25,
            left: 34,
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: "2.5px",
            color: MUTED,
          }}
        >
          HAL BARU / HASIL BELUM DIKETAHUI
        </div>

        <div
          style={{
            position: "absolute",
            right: 33,
            top: 22,
            fontSize: 23,
            fontWeight: 700,
            color: "#AAA295",
            letterSpacing: "1px",
          }}
        >
          ?
        </div>

        <div
          style={{
            position: "absolute",
            left: 407,
            top: 91,
            width: 98,
            height: 98,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: PAPER,
            fontSize: 74,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ?
        </div>

        <div
          style={{
            position: "absolute",
            left: 70,
            right: 70,
            top: 207,
            textAlign: "center",
            fontSize: 29,
            fontWeight: 600,
            letterSpacing: "-0.8px",
          }}
        >
          Apa yang akan terjadi?
        </div>

        {/* Outcome one: opacity only, followed by a long resting state. */}
        <div
          style={{
            position: "absolute",
            left: 62,
            top: 336,
            width: 332,
            height: 112,
            borderRadius: 13,
            border: "2px solid #AAB9A7",
            backgroundColor: "#EDF2E8",
            opacity: success,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 9,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "2.4px",
              color: "#65745F",
            }}
          >
            KEMUNGKINAN A
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 33,
              fontWeight: 800,
              letterSpacing: "-0.6px",
            }}
          >
            <svg
              width={29}
              height={29}
              viewBox="0 0 29 29"
              aria-hidden="true"
            >
              <path
                d="M 5 15 L 12 22 L 24 7"
                fill="none"
                stroke="#4E6648"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Berhasil
          </div>
        </div>

        {/* Outcome two: a separate, non-overlapping reveal. */}
        <div
          style={{
            position: "absolute",
            left: 518,
            top: 336,
            width: 332,
            height: 112,
            borderRadius: 13,
            border: "2px solid #D6BDB3",
            backgroundColor: "#F7EDE7",
            opacity: regret,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 9,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "2.4px",
              color: "#926F64",
            }}
          >
            KEMUNGKINAN B
          </div>
          <div
            style={{
              fontSize: 33,
              fontWeight: 800,
              letterSpacing: "-0.6px",
            }}
          >
            Menyesal
          </div>
        </div>

        {/* Last spoken emphasis: one hand-drawn red oval, then hold. */}
        <svg
          width={912}
          height={490}
          viewBox="0 0 912 490"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          <path
            d="M 797 407
               C 788 432, 595 439, 574 411
               C 550 377, 624 369, 699 373
               C 764 375, 810 386, 797 407
               C 791 419, 770 426, 750 428"
            fill="none"
            stroke={RED}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - marker}
            opacity={marker > 0 ? 1 : 0}
          />
        </svg>
      </div>

      {/* Persistent host: no entrance, fade, translation, or pose switching. */}
      <div
        style={{
          position: "absolute",
          bottom: 270,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          zIndex: 30,
          pointerEvents: "none",
        }}
      >
        <MinoCharacter pose={chosenPose} scale={1.35} />
      </div>
    </div>
  );
};