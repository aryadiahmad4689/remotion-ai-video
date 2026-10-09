import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MinoCharacter, MinoPose } from "../../MinoCharacter";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const INK = "#18181B";
const MUTED = "#77746D";
const PAPER = "#FFFCF5";
const YELLOW = "#FFE600";
const RED = "#E63946";

export const MinoScene_05: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chosenPose: MinoPose = "pointing";

  const progress = (start: number, end: number): number =>
    interpolate(
      frame,
      [start, Math.max(start + 0.001, end)],
      [0, 1],
      CLAMP,
    );

  // Finite spring windows guarantee completely motionless resting states.
  const settle = (start: number, end: number): number => {
    const safeEnd = Math.max(start + 0.001, end);
    if (frame <= start) return 0;
    if (frame >= safeEnd) return 1;

    const config = { damping: 22, mass: 0.9, stiffness: 70 };
    const endpoint = spring({
      frame: safeEnd - start,
      fps,
      config,
    });
    const value = spring({
      frame: Math.max(0, frame - start),
      fps,
      config,
    });

    return Math.min(1, Math.max(0, value / Math.max(0.001, endpoint)));
  };

  /*
   * One focal animation at a time:
   *   0–32    Headline, one word at a time
   *  43–73    Entire evidence card settles
   *  86–104   Path draws
   * 107–117   Headline highlighter
   * 153–175   First comparison statement
   * 205–227   Second comparison statement
   * 245–273   Fear barrier draws
   * 291–315   Hypothetical thought appears
   * 338–358   Final evidence tag
   *
   * Nothing exits; Mino never enters, fades, or changes position.
   */
  const card = settle(43, 73);
  const path = progress(86, 104);
  const highlight = progress(107, 117);
  const ability = progress(153, 175);
  const fearStatement = progress(205, 227);
  const barrier = progress(245, 273);
  const thought = settle(291, 315);
  const evidence = progress(338, 358);

  const word = (
    text: string,
    cue: number,
    key: string,
    marginRight = 0,
  ) => {
    const entrance = settle(cue, cue + 8);
    return (
      <span
        key={key}
        style={{
          display: "inline-block",
          marginRight,
          opacity: entrance,
          transform: `translateY(${(1 - entrance) * 15}px)`,
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
        width: 1080,
        height: 1920,
        color: INK,
        fontFamily: "Arial, Helvetica, sans-serif",
        pointerEvents: "none",
      }}
    >
      {/* Typography stays locked once its sequential entrance is complete. */}
      <div
        style={{
          position: "absolute",
          left: 82,
          top: 184,
          width: 916,
          zIndex: 10,
          fontSize: 88,
          lineHeight: 1.06,
          fontWeight: 800,
          letterSpacing: -4,
        }}
      >
        <div style={{ height: 99, whiteSpace: "nowrap" }}>
          {word("Mulai", 0, "mulai", 24)}
          {word("dari", 8, "dari")}
        </div>

        <div
          style={{
            position: "relative",
            display: "inline-block",
            whiteSpace: "nowrap",
            isolation: "isolate",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -6,
              right: -12,
              top: 43,
              height: 47,
              zIndex: -1,
              backgroundColor: YELLOW,
              clipPath: `inset(0 ${(1 - highlight) * 100}% 0 0)`,
              transform: "rotate(-1deg)",
            }}
          />
          {word("langkah", 16, "langkah", 23)}
          {word("kecil.", 24, "kecil")}
        </div>
      </div>

      {/* A single editorial diagram accumulates evidence across both beats. */}
      <div
        style={{
          position: "absolute",
          left: 82,
          top: 420,
          width: 916,
          height: 520,
          boxSizing: "border-box",
          overflow: "hidden",
          border: "2px solid #D9D4C9",
          borderRadius: 22,
          backgroundColor: PAPER,
          boxShadow: "0 12px 0 rgba(24,24,27,0.045)",
          opacity: card,
          transform: `translateY(${(1 - card) * 26}px)`,
          zIndex: 12,
        }}
      >
        <svg
          width={916}
          height={520}
          viewBox="0 0 916 520"
          style={{ position: "absolute", inset: 0, display: "block" }}
          aria-label="Satu langkah nyata menuju kemungkinan di depan. Ketakutan, bukan ketidakmampuan, menjadi penghalang."
        >
          {/* Static editorial scaffolding enters with the card. */}
          <text
            x={36}
            y={46}
            fill={MUTED}
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={18}
            fontWeight={700}
            letterSpacing={3}
          >
            NYATA SEKARANG
          </text>
          <text
            x={880}
            y={46}
            textAnchor="end"
            fill={MUTED}
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={18}
            fontWeight={700}
            letterSpacing={3}
          >
            MASIH KEMUNGKINAN
          </text>

          <line
            x1={36}
            y1={69}
            x2={880}
            y2={69}
            stroke="#E7E1D5"
            strokeWidth={2}
          />

          {/* The first small step: solid, tangible, already available. */}
          <circle
            cx={137}
            cy={250}
            r={58}
            fill={YELLOW}
            stroke={INK}
            strokeWidth={3}
          />
          <path
            d="M108 258 L116 233 L132 233 L142 245
               L164 251 Q174 254 172 266
               L110 266 Q104 265 108 258 Z"
            fill={INK}
          />
          <path
            d="M112 270 H170"
            stroke={INK}
            strokeWidth={4}
            strokeLinecap="round"
          />

          <text
            x={137}
            y={337}
            textAnchor="middle"
            fill={INK}
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={25}
            fontWeight={800}
          >
            1 langkah
          </text>

          {/* The unknown destination is deliberately outlined, not solid. */}
          <circle
            cx={765}
            cy={250}
            r={57}
            fill="none"
            stroke="#B6B0A4"
            strokeWidth={2}
            strokeDasharray="7 8"
          />
          <text
            x={765}
            y={266}
            textAnchor="middle"
            fill="#9B9487"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={49}
            fontWeight={400}
          >
            ?
          </text>
          <text
            x={765}
            y={337}
            textAnchor="middle"
            fill={MUTED}
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={25}
            fontWeight={700}
          >
            di depan
          </text>

          {/* One continuous path drawing, followed by a locked resting state. */}
          <path
            d="M211 250 H685"
            fill="none"
            stroke={INK}
            strokeWidth={4}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - path}
          />
          <path
            d="M669 235 L686 250 L669 265"
            fill="none"
            stroke={INK}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={progress(101, 104)}
          />

          {/* The obstruction draws over the existing route, never replaces it. */}
          <g opacity={barrier}>
            <rect
              x={420}
              y={182}
              width={61}
              height={136}
              rx={9}
              fill={PAPER}
            />
            <path
              d="M433 306 V195 H468 V306 Z"
              fill="none"
              stroke={RED}
              strokeWidth={5}
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - barrier}
            />
            <text
              x={450}
              y={165}
              textAnchor="middle"
              fill={RED}
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize={24}
              fontWeight={800}
              letterSpacing={2}
            >
              TAKUT
            </text>
          </g>

          <line
            x1={36}
            y1={373}
            x2={880}
            y2={373}
            stroke="#E7E1D5"
            strokeWidth={2}
          />
        </svg>

        {/* Beat two: readable statements appear one at a time. */}
        <div
          style={{
            position: "absolute",
            left: 36,
            top: 393,
            opacity: ability,
            fontSize: 32,
            lineHeight: 1.15,
            fontWeight: 600,
            letterSpacing: -0.7,
            color: MUTED,
          }}
        >
          Bukan tidak mampu.
        </div>
        <div
          style={{
            position: "absolute",
            left: 36,
            top: 443,
            opacity: fearStatement,
            fontSize: 34,
            lineHeight: 1.15,
            fontWeight: 800,
            letterSpacing: -0.9,
            color: INK,
          }}
        >
          Tapi takut pada kemungkinan.
        </div>

        {/* Hypothetical worry grows out of the existing unknown destination. */}
        <div
          style={{
            position: "absolute",
            left: 625,
            top: 87,
            width: 258,
            height: 91,
            boxSizing: "border-box",
            border: "2px dashed #B6B0A4",
            borderRadius: 14,
            backgroundColor: PAPER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: thought,
            transform: `translateY(${(1 - thought) * 12}px)`,
            color: MUTED,
            fontSize: 23,
            lineHeight: 1.2,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          “Bagaimana
          <br />
          kalau gagal?”
        </div>

        {/* Final annotation: one restrained highlighter reveal. */}
        <div
          style={{
            position: "absolute",
            left: 631,
            top: 187,
            width: 249,
            height: 39,
            overflow: "hidden",
            clipPath: `inset(0 ${(1 - evidence) * 100}% 0 0)`,
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: YELLOW,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 19,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: INK,
            }}
          >
            BELUM TERJADI
          </div>
        </div>
      </div>

      {/* Persistent host: no entrance, exit, pose swapping, or local motion. */}
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