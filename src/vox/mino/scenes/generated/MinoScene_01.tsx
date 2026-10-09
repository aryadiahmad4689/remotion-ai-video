import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MinoCharacter, MinoPose } from "../../MinoCharacter";

const INK = "#18181B";
const MUTED = "#6F716B";
const YELLOW = "#FFE600";
const RED = "#E63946";
const LINE = "#DDDCD3";
const CARD = "#FFFEFA";

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const progress = (frame: number, start: number, end: number): number =>
  interpolate(
    frame,
    [start, Math.max(start + 0.001, end)],
    [0, 1],
    CLAMP,
  );

const smooth = (value: number): number =>
  value * value * (3 - 2 * value);

type IconKind = "work" | "business" | "new";

const ExampleIcon: React.FC<{ kind: IconKind }> = ({ kind }) => (
  <svg
    width={38}
    height={38}
    viewBox="0 0 40 40"
    fill="none"
    aria-hidden="true"
    style={{ display: "block" }}
  >
    {kind === "work" && (
      <g stroke={INK} strokeWidth={2.2} strokeLinejoin="round">
        <rect x={6} y={13} width={28} height={21} rx={3} />
        <path d="M14 13V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
        <path d="M6 21c8 5 20 5 28 0" />
        <path d="M20 21v7" />
      </g>
    )}
    {kind === "business" && (
      <g stroke={INK} strokeWidth={2.2} strokeLinejoin="round">
        <path d="M7 17v17h26V17" />
        <path d="M5 17 9 7h22l4 10" />
        <path d="M5 17c0 5 6 5 6 0 0 5 6 5 6 0 0 5 6 5 6 0 0 5 6 5 6 0 0 5 6 5 6 0" />
        <path d="M17 34V24h8v10" />
      </g>
    )}
    {kind === "new" && (
      <g stroke={INK} strokeWidth={2.2} strokeLinecap="round">
        <path d="M20 6v8M20 26v8M6 20h8M26 20h8" />
        <path d="m10 10 5 5m10 10 5 5M30 10l-5 5M15 25l-5 5" />
        <circle cx={20} cy={20} r={5} fill={YELLOW} />
      </g>
    )}
  </svg>
);

type ExampleRowProps = {
  frame: number;
  top: number;
  cue: number;
  emphasisCue: number;
  number: string;
  label: string;
  fear: string;
  kind: IconKind;
};

const ExampleRow: React.FC<ExampleRowProps> = ({
  frame,
  top,
  cue,
  emphasisCue,
  number,
  label,
  fear,
  kind,
}) => {
  const entrance = smooth(progress(frame, cue, cue + 26));
  const emphasis = smooth(
    progress(frame, emphasisCue, emphasisCue + 18),
  );

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 30,
        right: 30,
        height: 74,
        display: "flex",
        alignItems: "center",
        borderTop: `1px solid ${LINE}`,
        opacity: entrance,
        transform: `translateX(${(1 - entrance) * 18}px)`,
      }}
    >
      <span
        style={{
          width: 42,
          flexShrink: 0,
          color: MUTED,
          fontSize: 18,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {number}
      </span>

      <div
        style={{
          width: 49,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <ExampleIcon kind={kind} />
      </div>

      <span
        style={{
          color: INK,
          fontSize: 28,
          fontWeight: 650,
          letterSpacing: -0.7,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>

      <span
        style={{
          marginLeft: "auto",
          paddingLeft: 12,
          color: MUTED,
          fontSize: 23,
        }}
      >
        tapi
      </span>

      <span
        style={{
          position: "relative",
          marginLeft: 14,
          minWidth: 190,
          padding: "7px 9px",
          color: INK,
          fontSize: 25,
          fontWeight: 750,
          letterSpacing: -0.6,
          whiteSpace: "nowrap",
          isolation: "isolate",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: "5px 0",
            backgroundColor: YELLOW,
            borderRadius: "3px 7px 4px 2px",
            transform: `scaleX(${emphasis})`,
            transformOrigin: "left center",
            zIndex: -1,
          }}
        />
        {fear}
      </span>
    </div>
  );
};

export const MinoScene_01: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chosenPose: MinoPose = "curious";

  // Every entrance owns a separate, non-overlapping movement window.
  const cardStart = 55;
  const cardEnd = 105;
  const localCardFrame = Math.min(
    Math.max(0, frame - cardStart),
    cardEnd - cardStart,
  );

  const springConfig = { damping: 22, mass: 0.9, stiffness: 70 };
  const springEnd = spring({
    frame: cardEnd - cardStart,
    fps,
    config: springConfig,
  });

  const cardEntrance =
    frame >= cardEnd
      ? 1
      : Math.min(
          1,
          Math.max(
            0,
            spring({
              frame: localCardFrame,
              fps,
              config: springConfig,
            }) / Math.max(0.001, springEnd),
          ),
        );

  const connector = smooth(progress(frame, 125, 151));
  const fearUnderline = smooth(progress(frame, 171, 193));

  const headlineWord = (
    word: string,
    cue: number,
    underline = false,
  ) => {
    // Six-frame windows abut, rather than overlap.
    const entrance = smooth(progress(frame, cue, cue + 6));

    return (
      <span
        key={`${cue}-${word}`}
        style={{
          position: "relative",
          display: "inline-block",
          opacity: entrance,
          transform: `translateY(${(1 - entrance) * 12}px)`,
        }}
      >
        {word}
        {underline && (
          <svg
            width="100%"
            height={18}
            viewBox="0 0 210 18"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              bottom: -9,
              overflow: "visible",
            }}
          >
            <path
              d="M5 12 Q95 2 205 8"
              pathLength={1}
              fill="none"
              stroke={RED}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray="1 1"
              strokeDashoffset={1 - fearUnderline}
              opacity={fearUnderline > 0 ? 1 : 0}
            />
          </svg>
        )}
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
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 180,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            width: 26,
            height: 5,
            backgroundColor: INK,
          }}
        />
        <span
          style={{
            fontSize: 20,
            fontWeight: 750,
            letterSpacing: 3.2,
            color: MUTED,
          }}
        >
          KEINGINAN & KERAGUAN
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 90,
          top: 233,
          width: 900,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 22,
            alignItems: "baseline",
            fontSize: 91,
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: -5,
          }}
        >
          {headlineWord("Ingin", 0)}
          {headlineWord("berubah.", 6)}
        </div>

        <div
          style={{
            marginTop: 17,
            display: "flex",
            gap: 17,
            alignItems: "baseline",
            fontSize: 69,
            lineHeight: 1.12,
            fontWeight: 750,
            letterSpacing: -3.3,
          }}
        >
          {headlineWord("Kenapa", 12)}
          {headlineWord("malah", 18)}
          {headlineWord("takut?", 24, true)}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 90,
          top: 465,
          width: 900,
          height: 475,
          backgroundColor: CARD,
          border: `1.5px solid ${LINE}`,
          borderRadius: 22,
          boxSizing: "border-box",
          boxShadow: "0 12px 28px rgba(24,24,27,0.055)",
          opacity: cardEntrance,
          transform: `translateY(${(1 - cardEntrance) * 25}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 22,
            color: MUTED,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 2.3,
          }}
        >
          SAAT KESEMPATAN DATANG
        </div>

        <svg
          width={196}
          height={152}
          viewBox="0 0 196 152"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 35,
            top: 52,
          }}
        >
          <path
            d="M17 139H180"
            stroke={LINE}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <rect
            x={47}
            y={12}
            width={87}
            height={126}
            rx={3}
            fill="#F5F2EB"
            stroke={INK}
            strokeWidth={3}
          />
          <path
            d="M55 18h73v113H55z"
            fill={YELLOW}
            opacity={0.78}
          />
          <path
            d="M48 13 110 30v108l-62-1Z"
            fill={CARD}
            stroke={INK}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <circle cx={96} cy={85} r={4} fill={INK} />
          <path
            d="M147 43h24M149 65h32M147 87h24"
            stroke="#B9AE4A"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </svg>

        <svg
          width={150}
          height={44}
          viewBox="0 0 150 44"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 258,
            top: 115,
          }}
        >
          <path
            d="M7 22H130l-13-11M130 22l-13 11"
            pathLength={1}
            fill="none"
            stroke={INK}
            strokeWidth={2.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 1"
            strokeDashoffset={1 - connector}
            opacity={connector > 0 ? 1 : 0}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            left: 450,
            top: 79,
            width: 410,
          }}
        >
          <div
            style={{
              fontSize: 39,
              lineHeight: 1.15,
              fontWeight: 750,
              letterSpacing: -1.5,
            }}
          >
            Peluang terbuka.
          </div>
          <div
            style={{
              marginTop: 11,
              fontSize: 31,
              lineHeight: 1.2,
              color: MUTED,
              letterSpacing: -0.9,
            }}
          >
            Ragu ikut muncul.
          </div>
        </div>

        <ExampleRow
          frame={frame}
          top={225}
          cue={220}
          emphasisCue={274}
          number="01"
          label="Pindah kerja"
          fear="takut gagal"
          kind="work"
        />

        <ExampleRow
          frame={frame}
          top={304}
          cue={318}
          emphasisCue={365}
          number="02"
          label="Mulai bisnis"
          fear="takut rugi"
          kind="business"
        />

        <ExampleRow
          frame={frame}
          top={383}
          cue={411}
          emphasisCue={463}
          number="03"
          label="Mencoba hal baru"
          fear="kepikiran terus"
          kind="new"
        />
      </div>

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