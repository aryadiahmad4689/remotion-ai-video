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

const COLORS = {
  ink: "#18181B",
  muted: "#74716B",
  paper: "#FFFCF5",
  line: "#D8D3C8",
  yellow: "#FFE600",
  red: "#E63946",
  softRed: "#FFF0ED",
};

const FONT =
  '"Arial", "Helvetica Neue", Helvetica, sans-serif';

export const MinoScene_02: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const progress = (start: number, end: number) =>
    interpolate(
      frame,
      [start, Math.max(start + 0.001, end)],
      [0, 1],
      CLAMP,
    );

  // Finite, normalized springs guarantee completely still resting states.
  const settle = (start: number, end: number) => {
    if (frame <= start) return 0;
    if (frame >= end) return 1;

    const duration = Math.max(0.001, end - start);
    const config = { damping: 22, mass: 0.9, stiffness: 70 };
    const endpoint = spring({ frame: duration, fps, config });
    const value = spring({
      frame: Math.max(0, frame - start),
      fps,
      config,
    });

    return Math.max(0, Math.min(1, value / Math.max(0.001, endpoint)));
  };

  const scale = Math.min(width / 1080, height / 1920);
  const chosenPose: MinoPose = "confused";

  const headlineUnderline = progress(50, 64);
  const cardEntrance = settle(87, 123);
  const selectionStroke = progress(142, 166);
  const whyEntrance = settle(190, 208);
  const brainEntrance = settle(218, 254);
  const connectionStroke = progress(272, 299);
  const familiarHighlight = progress(319, 341);
  const evidenceEntrance = settle(376, 402);

  const renderWord = (word: string, index: number) => {
    // Each word finishes before the next word begins.
    const entrance = progress(15 + index * 5, 20 + index * 5);

    return (
      <span
        key={`${index}-${word}`}
        style={{
          display: "inline-block",
          position: "relative",
          opacity: entrance,
          transform: `translateY(${(1 - entrance) * 12}px)`,
          whiteSpace: "nowrap",
        }}
      >
        {word}
      </span>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        fontFamily: FONT,
        color: COLORS.ink,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 1080,
          height: 1920,
          left: (width - 1080 * scale) / 2,
          top: (height - 1920 * scale) / 2,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* ACT I — The question. No graphic moves during the word sequence. */}
        <div
          style={{
            position: "absolute",
            left: 76,
            top: 190,
            width: 928,
          }}
        >
          <div
            style={{
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: 3,
              color: COLORS.muted,
              marginBottom: 23,
            }}
          >
            02 / TAKUT MELANGKAH
          </div>

          <div
            style={{
              display: "flex",
              gap: 17,
              alignItems: "baseline",
              fontSize: 59,
              fontWeight: 800,
              letterSpacing: -2.2,
              lineHeight: 1.16,
            }}
          >
            {renderWord("Kalau", 0)}
            {renderWord("ternyata", 1)}
            {renderWord("gue", 2)}
          </div>

          <div
            style={{
              display: "flex",
              gap: 17,
              alignItems: "baseline",
              marginTop: 4,
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -2.6,
              lineHeight: 1.16,
            }}
          >
            <span
              style={{
                position: "relative",
                display: "inline-flex",
                gap: 17,
                isolation: "isolate",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: -5,
                  right: -7,
                  bottom: 5,
                  height: 19,
                  background: COLORS.yellow,
                  transform: `scaleX(${headlineUnderline}) rotate(-1deg)`,
                  transformOrigin: "left center",
                  zIndex: -1,
                }}
              />
              {renderWord("nggak", 3)}
              {renderWord("mampu", 4)}
            </span>
            {renderWord("gimana?", 5)}
          </div>
        </div>

        {/* This question is added without replacing the original headline. */}
        <div
          style={{
            position: "absolute",
            top: 369,
            left: 77,
            display: "flex",
            alignItems: "center",
            gap: 13,
            opacity: whyEntrance,
            transform: `translateX(${(1 - whyEntrance) * -14}px)`,
          }}
        >
          <svg width={28} height={28} viewBox="0 0 28 28">
            <path
              d="M4 14H23M16 7L23 14L16 21"
              fill="none"
              stroke={COLORS.red}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontSize: 29,
              fontWeight: 800,
              letterSpacing: -0.6,
            }}
          >
            Tapi kenapa?
          </span>
        </div>

        {/* ACT II — A single evidence panel progressively accumulates context. */}
        <div
          style={{
            position: "absolute",
            left: 72,
            top: 430,
            width: 936,
            height: 478,
            borderRadius: 24,
            background: COLORS.paper,
            border: `2px solid ${COLORS.line}`,
            boxShadow: "0 10px 0 rgba(24,24,27,0.045)",
            opacity: cardEntrance,
            transform: `translateY(${(1 - cardEntrance) * 26}px)`,
          }}
        >
          <svg
            width={936}
            height={478}
            viewBox="0 0 936 478"
            style={{
              position: "absolute",
              inset: 0,
              overflow: "visible",
            }}
          >
            <text
              x={32}
              y={39}
              fill={COLORS.muted}
              fontFamily={FONT}
              fontSize={20}
              fontWeight={700}
              letterSpacing={2.2}
            >
              DUA PILIHAN, SATU KEBIASAAN
            </text>

            {/* Familiar room: the chair is deliberately motionless. */}
            <rect
              x={32}
              y={69}
              width={410}
              height={218}
              rx={15}
              fill="#F1EEE6"
              stroke={COLORS.line}
              strokeWidth={2}
            />
            <path
              d="M55 206H156M68 204V107H150"
              fill="none"
              stroke="#C5BFAF"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <rect
              x={85}
              y={120}
              width={45}
              height={57}
              rx={8}
              fill="#D4C5AB"
              stroke={COLORS.ink}
              strokeWidth={3}
            />
            <path
              d="M78 160V181H138V160M87 183V203M129 183V203"
              fill="none"
              stroke={COLORS.ink}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <text
              x={179}
              y={130}
              fill={COLORS.ink}
              fontFamily={FONT}
              fontSize={31}
              fontWeight={800}
              letterSpacing={-0.8}
            >
              Tempat
            </text>
            <text
              x={179}
              y={168}
              fill={COLORS.ink}
              fontFamily={FONT}
              fontSize={31}
              fontWeight={800}
              letterSpacing={-0.8}
            >
              yang sama
            </text>

            <path
              d="M57 221H415"
              stroke={COLORS.line}
              strokeWidth={1.5}
            />

            <rect
              x={58}
              y={239}
              width={240 * familiarHighlight}
              height={29}
              rx={3}
              fill={COLORS.yellow}
            />
            <text
              x={65}
              y={260}
              fill={COLORS.ink}
              fontFamily={FONT}
              fontSize={22}
              fontWeight={800}
              letterSpacing={0.9}
            >
              SUDAH DIKENAL
            </text>

            {/* New possibility: open doorway, not a competing animation. */}
            <rect
              x={494}
              y={69}
              width={410}
              height={218}
              rx={15}
              fill="#FBFAF6"
              stroke={COLORS.line}
              strokeWidth={2}
            />
            <path
              d="M522 206H627M539 203V111H598V203"
              fill="none"
              stroke="#AFA99D"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M541 113L580 126V204L541 202Z"
              fill="#E3DFD4"
              stroke={COLORS.ink}
              strokeWidth={3}
              strokeLinejoin="round"
            />
            <circle cx={570} cy={164} r={3} fill={COLORS.ink} />
            <path
              d="M595 159H618M610 151L619 159L610 167"
              fill="none"
              stroke="#8D877B"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <text
              x={643}
              y={130}
              fill={COLORS.muted}
              fontFamily={FONT}
              fontSize={29}
              fontWeight={700}
              letterSpacing={-0.7}
            >
              Kemungkinan
            </text>
            <text
              x={643}
              y={168}
              fill={COLORS.muted}
              fontFamily={FONT}
              fontSize={29}
              fontWeight={700}
              letterSpacing={-0.7}
            >
              baru
            </text>
            <path
              d="M519 221H879"
              stroke={COLORS.line}
              strokeWidth={1.5}
            />
            <text
              x={526}
              y={260}
              fill={COLORS.muted}
              fontFamily={FONT}
              fontSize={22}
              fontWeight={700}
              letterSpacing={0.6}
            >
              BELUM DIKENAL
            </text>

            {/* The choice is marked only after the entire panel has settled. */}
            <path
              d="M49 75H424"
              fill="none"
              stroke={COLORS.yellow}
              strokeWidth={9}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - selectionStroke}
              opacity={frame >= 142 ? 1 : 0}
            />

            {/* After the brain settles, one connector traces its preference. */}
            <path
              d="M427 352C348 352 240 356 240 296"
              fill="none"
              stroke={COLORS.ink}
              strokeWidth={3}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - connectionStroke}
              opacity={frame >= 272 ? 1 : 0}
            />
            <path
              d="M231 307L240 296L249 307"
              fill="none"
              stroke={COLORS.ink}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={progress(296, 299)}
            />
          </svg>

          {/* ACT III — Explanation, then qualification, never simultaneously. */}
          <div
            style={{
              position: "absolute",
              left: 419,
              top: 315,
              display: "flex",
              alignItems: "center",
              gap: 22,
              opacity: brainEntrance,
              transform: `translateY(${(1 - brainEntrance) * 14}px)`,
            }}
          >
            <svg
              width={101}
              height={89}
              viewBox="0 0 101 89"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M49 15C40 4 24 9 22 21C9 20 3 34 10 44C1 57 11 71 24 70C27 83 43 85 50 74C59 86 76 80 77 68C93 69 101 52 91 42C97 28 85 17 75 19C69 7 56 6 49 15Z"
                fill="#E9E0D3"
                stroke={COLORS.ink}
                strokeWidth={3.5}
                strokeLinejoin="round"
              />
              <path
                d="M50 16V72M24 23C35 22 37 33 30 40M11 44C22 39 30 48 27 57M25 70C25 60 37 56 43 63M75 21C63 20 61 32 68 38M90 43C79 40 72 47 75 56M77 68C69 58 60 60 57 66"
                fill="none"
                stroke={COLORS.ink}
                strokeWidth={3}
                strokeLinecap="round"
              />
            </svg>

            <div>
              <div
                style={{
                  fontSize: 27,
                  fontWeight: 500,
                  color: COLORS.muted,
                  lineHeight: 1.28,
                }}
              >
                Otak memilih
              </div>
              <div
                style={{
                  fontSize: 35,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: -1,
                }}
              >
                yang familier.
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 32,
              top: 425,
              right: 32,
              height: 36,
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: evidenceEntrance,
              transform: `translateX(${(1 - evidenceEntrance) * -12}px)`,
            }}
          >
            <div
              style={{
                width: 8,
                height: 28,
                background: COLORS.red,
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: -0.4,
              }}
            >
              Dikenal
              <span
                style={{
                  color: COLORS.red,
                  padding: "0 12px",
                  fontSize: 31,
                  fontWeight: 800,
                }}
              >
                ≠
              </span>
              bikin bahagia.
            </span>
          </div>
        </div>

        {/* Persistent host: fixed placement, fixed pose, no entrance or exit. */}
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