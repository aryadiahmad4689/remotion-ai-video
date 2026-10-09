import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MinoCharacter, MinoPose } from "../../MinoCharacter";

const INK = "#18181B";
const MUTED = "#6D6A62";
const YELLOW = "#FFE600";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const MinoScene_06: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pose: MinoPose = "curious";

  const progress = (start: number, end: number): number =>
    interpolate(
      frame,
      [start, Math.max(start + 0.001, end)],
      [0, 1],
      CLAMP,
    );

  // Finite spring windows guarantee perfectly still resting states.
  const settledSpring = (start: number, end: number): number => {
    const safeEnd = Math.max(start + 0.001, end);
    const elapsed = Math.max(0, Math.min(frame - start, safeEnd - start));
    const config = { damping: 22, mass: 0.9, stiffness: 70 };

    const value = spring({ frame: elapsed, fps, config });
    const terminal = spring({
      frame: safeEnd - start,
      fps,
      config,
    });

    return Math.min(1, Math.max(0, value / Math.max(terminal, 0.0001)));
  };

  // Non-overlapping cues:
  // 12–18: first word; 18–24: second word;
  // 30–49: question card; 53–63: marker underline.
  const firstWord = progress(12, 18);
  const secondWord = progress(18, 24);
  const cardOpacity = progress(30, 46);
  const cardMotion = settledSpring(30, 49);
  const marker = progress(53, 63);

  const wordStyle = (amount: number): React.CSSProperties => ({
    display: "block",
    opacity: amount,
    transform: `translateY(${(1 - amount) * 8}px)`,
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: 1080,
        height: 1920,
        overflow: "hidden",
        color: INK,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <section
        aria-label="Mino: tetap penasaran"
        style={{
          position: "absolute",
          top: 180,
          left: 86,
          right: 86,
          height: 770,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            height: 42,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              backgroundColor: INK,
              color: YELLOW,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 27,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            M
          </div>
          <span
            style={{
              fontSize: 23,
              fontWeight: 800,
              letterSpacing: 5,
            }}
          >
            MINO
          </span>
          <div
            style={{
              width: 1,
              height: 23,
              backgroundColor: "#BDB8AC",
              marginLeft: 5,
              marginRight: 5,
            }}
          />
          <span
            style={{
              color: MUTED,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 2.5,
            }}
          >
            TERUS BERTANYA
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            top: 94,
            left: 0,
            right: 0,
            fontSize: 116,
            fontWeight: 900,
            letterSpacing: -7,
            lineHeight: 1.04,
          }}
        >
          <span style={wordStyle(firstWord)}>Tetap</span>
          <span
            style={{
              ...wordStyle(secondWord),
              position: "relative",
              width: "fit-content",
              marginTop: 8,
            }}
          >
            <svg
              width={810}
              height={32}
              viewBox="0 0 810 32"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: -8,
                bottom: -6,
                zIndex: 0,
                overflow: "visible",
              }}
            >
              <path
                d="M 14 18 C 194 12, 399 22, 790 14"
                fill="none"
                stroke={YELLOW}
                strokeWidth={23}
                strokeLinecap="butt"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - marker}
                opacity={marker > 0 ? 1 : 0}
              />
            </svg>
            <span style={{ position: "relative", zIndex: 1 }}>
              penasaran.
            </span>
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            top: 407,
            left: 0,
            right: 0,
            height: 280,
            opacity: cardOpacity,
            transform: `translateY(${(1 - cardMotion) * 24}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#FCFAF4",
              border: `2px solid ${INK}`,
              borderRadius: 5,
              boxShadow: "10px 10px 0 rgba(24,24,27,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 9,
                backgroundColor: YELLOW,
              }}
            />

            <div
              style={{
                position: "absolute",
                top: 35,
                left: 38,
                color: MUTED,
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: 3,
              }}
            >
              CATATAN TERAKHIR
            </div>

            <div
              style={{
                position: "absolute",
                left: 38,
                top: 91,
                width: 565,
                fontSize: 43,
                fontWeight: 700,
                letterSpacing: -1.5,
                lineHeight: 1.2,
              }}
            >
              Selalu ada
              <br />
              pertanyaan berikutnya.
            </div>

            <svg
              width={210}
              height={210}
              viewBox="0 0 210 210"
              aria-hidden="true"
              style={{
                position: "absolute",
                right: 25,
                top: 34,
              }}
            >
              <circle
                cx="102"
                cy="96"
                r="70"
                fill="#FFE600"
                fillOpacity={0.28}
              />
              <circle
                cx="97"
                cy="91"
                r="66"
                fill="none"
                stroke={INK}
                strokeWidth={4}
              />
              <path
                d="M 145 139 L 182 178"
                stroke={INK}
                strokeWidth={13}
                strokeLinecap="round"
              />
              <path
                d="M 80 74 C 80 48, 122 48, 122 74 C 122 92, 98 94, 98 111"
                fill="none"
                stroke={INK}
                strokeWidth={9}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="98" cy="132" r="5.5" fill={INK} />
            </svg>
          </div>
        </div>
      </section>

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
        <MinoCharacter pose={pose} scale={1.35} />
      </div>
    </div>
  );
};