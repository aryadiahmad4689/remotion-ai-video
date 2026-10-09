import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MinoCharacter, MinoPose } from "../../MinoCharacter";

const COLORS = {
  ink: "#18181B",
  muted: "#706D65",
  paper: "#FFFCF5",
  rule: "#D8D2C6",
  yellow: "#FFE600",
  red: "#E63946",
};

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const FONT =
  '"Arial", "Helvetica Neue", Helvetica, sans-serif';

const progressBetween = (
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

const smoothProgress = (
  frame: number,
  start: number,
  end: number,
): number => {
  const progress = progressBetween(frame, start, end);
  return progress * progress * (3 - 2 * progress);
};

/**
 * A finite, normalized documentary spring.
 * Clamping its input gives every entrance an exact locked resting state.
 */
const settledSpring = (
  frame: number,
  fps: number,
  start: number,
  duration: number,
): number => {
  const safeDuration = Math.max(1, duration);
  const elapsed = Math.min(
    safeDuration,
    Math.max(0, frame - start),
  );

  const config = {
    damping: 22,
    mass: 0.9,
    stiffness: 70,
  };

  const endpoint = spring({
    frame: safeDuration,
    fps,
    config,
  });

  const value = spring({
    frame: elapsed,
    fps,
    config,
  });

  return Math.min(
    1,
    Math.max(0, value / Math.max(0.001, endpoint)),
  );
};

export const MinoScene_04: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const chosenPose: MinoPose = "curious";

  // One moving focal group at a time:
  // 7–31: headline words, with non-overlapping six-frame entrances.
  // 44–82: the complete editorial card.
  // 108–132: connector.
  // 148–168: red annotation around the impossible prerequisite.
  // 195–221: the second-beat takeaway.
  // All completed elements remain completely still.
  const cardProgress = settledSpring(frame, fps, 44, 38);
  const connectorProgress = smoothProgress(frame, 108, 132);
  const markerProgress = smoothProgress(frame, 148, 168);
  const takeawayProgress = settledSpring(frame, fps, 195, 26);

  const headlineWord = (
    text: string,
    cue: number,
    key: string,
  ): React.ReactNode => {
    const progress = smoothProgress(frame, cue, cue + 6);

    return (
      <span
        key={key}
        style={{
          display: "inline-block",
          opacity: progress,
          transform: `translateY(${(1 - progress) * 7}px)`,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Transparent design-space wrapper: the master owns the background. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          transform: `scale(${width / 1080}, ${height / 1920})`,
          transformOrigin: "top left",
          fontFamily: FONT,
          color: COLORS.ink,
        }}
      >
        {/* ACT I — A short editorial question, not a subtitle. */}
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 180,
            width: 888,
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: -3.8,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 22,
              height: 88,
            }}
          >
            {headlineWord("Kalau", 7, "kalau")}
            {headlineWord("menunggu", 13, "menunggu")}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 22,
              height: 88,
            }}
          >
            {headlineWord("takut", 19, "takut")}
            {headlineWord("hilang…", 25, "hilang")}
          </div>
        </div>

        {/* ACT I — One cohesive card enters, then stays put. */}
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 404,
            width: 888,
            height: 406,
            boxSizing: "border-box",
            backgroundColor: COLORS.paper,
            border: `2px solid ${COLORS.ink}`,
            borderRadius: 22,
            boxShadow: "0 10px 0 rgba(24, 24, 27, 0.08)",
            opacity: cardProgress,
            transform: `translateY(${(1 - cardProgress) * 24}px)`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 44,
              top: 30,
              fontSize: 22,
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: 2.6,
              color: COLORS.muted,
            }}
          >
            SYARAT YANG MENAHAN KITA
          </div>

          <div
            style={{
              position: "absolute",
              left: 44,
              right: 44,
              top: 72,
              height: 1,
              backgroundColor: COLORS.rule,
            }}
          />

          {/* Left: the imagined prerequisite. */}
          <div
            style={{
              position: "absolute",
              left: 48,
              top: 114,
              width: 354,
            }}
          >
            <div
              style={{
                fontSize: 21,
                fontWeight: 700,
                letterSpacing: 2.1,
                color: COLORS.muted,
                marginBottom: 15,
              }}
            >
              MENUNGGU SAMPAI
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
                height: 88,
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  letterSpacing: -2,
                }}
              >
                takut
              </span>

              <span
                style={{
                  fontSize: 41,
                  fontWeight: 500,
                  color: COLORS.muted,
                }}
              >
                =
              </span>

              <span
                style={{
                  display: "flex",
                  width: 100,
                  height: 88,
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 74,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: -3,
                }}
              >
                0
              </span>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 24,
                lineHeight: 1.2,
                color: COLORS.muted,
              }}
            >
              Tidak tersisa sama sekali.
            </div>
          </div>

          {/* Right: the first step remains on hold. */}
          <div
            style={{
              position: "absolute",
              left: 564,
              top: 139,
              width: 268,
              height: 114,
              boxSizing: "border-box",
              border: `2px solid ${COLORS.rule}`,
              backgroundColor: "#F1EEE7",
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 7,
            }}
          >
            <div
              style={{
                fontSize: 46,
                lineHeight: 1,
                letterSpacing: -1.5,
                fontWeight: 800,
                color: "#8E8A80",
              }}
            >
              MULAI
            </div>

            <div
              style={{
                fontSize: 18,
                letterSpacing: 2.1,
                fontWeight: 700,
                color: COLORS.muted,
              }}
            >
              TERUS TERTUNDA
            </div>
          </div>

          {/* Only this connector moves during frames 108–132. */}
          <svg
            width={888}
            height={406}
            viewBox="0 0 888 406"
            style={{
              position: "absolute",
              inset: 0,
              overflow: "visible",
            }}
          >
            <path
              d="M 424 196 L 540 196 M 525 184 L 540 196 L 525 208"
              fill="none"
              stroke={COLORS.ink}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - connectorProgress}
              opacity={connectorProgress > 0 ? 1 : 0}
            />

            {/* A single hand-drawn red annotation; no looping or pulsing. */}
            <path
              d="M 331 155
                 C 357 139, 390 146, 396 177
                 C 404 212, 381 237, 348 237
                 C 311 238, 291 219, 292 189
                 C 293 164, 309 146, 334 148"
              fill="none"
              stroke={COLORS.red}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - markerProgress}
              opacity={markerProgress > 0 ? 1 : 0}
            />
          </svg>

          <div
            style={{
              position: "absolute",
              left: 44,
              right: 44,
              top: 294,
              height: 1,
              backgroundColor: COLORS.rule,
            }}
          />

          <div
            style={{
              position: "absolute",
              left: 44,
              right: 44,
              top: 320,
              fontSize: 31,
              lineHeight: 1.25,
              letterSpacing: -0.6,
              fontWeight: 600,
            }}
          >
            Menunggu sempurna bisa berarti tidak mulai.
          </div>
        </div>

        {/* ACT II — Add the reassurance without removing earlier context. */}
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 846,
            width: 888,
            height: 100,
            boxSizing: "border-box",
            padding: "0 28px",
            backgroundColor: COLORS.yellow,
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: takeawayProgress,
            transform: `translateY(${(1 - takeawayProgress) * 14}px)`,
            zIndex: 12,
          }}
        >
          <span
            style={{
              fontSize: 43,
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: -1.5,
              whiteSpace: "nowrap",
            }}
          >
            Nggak harus berani semuanya.
          </span>
        </div>

        {/* Persistent host: no entrance, fade, scale animation, or pose switch. */}
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
    </div>
  );
};