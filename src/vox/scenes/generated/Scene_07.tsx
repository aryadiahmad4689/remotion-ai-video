import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  paper: "#F5F2EB",
  white: "#FFFD F8".replace(" ", ""),
  ink: "#18181B",
  muted: "#73716B",
  line: "#D9D5CC",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
};

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const ramp = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], CLAMP);

const windowOpacity = (
  frame: number,
  start: number,
  end: number,
  fade = 24,
) =>
  Math.min(
    start === 0 ? 1 : ramp(frame, start, start + fade),
    1 - ramp(frame, end - fade, end),
  );

const settle = (frame: number, fps: number, cue: number) =>
  spring({
    frame: Math.max(0, frame - cue),
    fps,
    config: { damping: 18, mass: 0.7, stiffness: 90 },
  });

/**
 * Frame-driven layer sequence. Children remain mounted throughout the scene.
 * This local implementation keeps all timing in scene coordinates and uses
 * only the four permitted Remotion imports.
 */
const Sequence: React.FC<{
  from: number;
  durationInFrames: number;
  children: React.ReactNode;
  fade?: number;
}> = ({ from, durationInFrames, children, fade = 24 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: windowOpacity(frame, from, from + durationInFrames, fade),
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
};

const KineticWords: React.FC<{
  text: string;
  frame: number;
  fps: number;
  cue: number;
  size?: number;
  color?: string;
  initiallyVisible?: boolean;
}> = ({
  text,
  frame,
  fps,
  cue,
  size = 66,
  color = C.ink,
  initiallyVisible = false,
}) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "0 17px",
      fontSize: size,
      fontWeight: 800,
      lineHeight: 1.12,
      letterSpacing: "-2.6px",
      color,
    }}
  >
    {text.split(" ").map((word, index) => {
      const delay = cue + index * 3;
      const progress = settle(frame, fps, delay);
      const visibility = ramp(frame, delay, delay + 13);
      return (
        <span
          key={`${word}-${index}`}
          style={{
            display: "inline-block",
            opacity: initiallyVisible
              ? 0.78 + 0.22 * visibility
              : visibility,
            transform: `translateY(${(1 - progress) * (initiallyVisible ? 6 : 16)}px)`,
          }}
        >
          {word}
        </span>
      );
    })}
  </div>
);

const SvgReveal: React.FC<{
  frame: number;
  fps: number;
  cue: number;
  children: React.ReactNode;
  distance?: number;
}> = ({ frame, fps, cue, children, distance = 10 }) => {
  const progress = settle(frame, fps, cue);
  return (
    <g
      opacity={ramp(frame, cue, cue + 22)}
      transform={`translate(0 ${(1 - progress) * distance})`}
    >
      {children}
    </g>
  );
};

const EvidenceChip: React.FC<{
  x: number;
  y: number;
  width: number;
  label: string;
  number: string;
  color: string;
  frame: number;
  fps: number;
  cue: number;
}> = ({ x, y, width, label, number, color, frame, fps, cue }) => (
  <SvgReveal frame={frame} fps={fps} cue={cue}>
    <g transform={`translate(${x} ${y})`}>
      <rect
        width={width}
        height={58}
        rx={12}
        fill={C.white}
        stroke={C.line}
      />
      <rect x={14} y={13} width={32} height={32} rx={8} fill={color} />
      <text
        x={30}
        y={34}
        textAnchor="middle"
        fontSize={13}
        fontWeight={800}
        fill={color === C.yellow ? C.ink : C.white}
      >
        {number}
      </text>
      <text x={60} y={36} fontSize={22} fontWeight={700} fill={C.ink}>
        {label}
      </text>
    </g>
  </SvgReveal>
);

export const Scene_07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const scale = Math.min(width / 1920, height / 1080);
  const offsetX = (width - 1920 * scale) / 2;
  const offsetY = (height - 1080 * scale) / 2;

  const awareness = ramp(frame, 213, 505);
  const pressure = ramp(frame, 650, 810);
  const understanding = ramp(frame, 1038, 1215);
  const finalQuestion = ramp(frame, 1287, 1311);
  const answer = ramp(frame, 1416, 1442);
  const gapReveal = ramp(frame, 32, 105);
  const marker = ramp(frame, 702, 780);
  const secondMarker = ramp(frame, 1105, 1190);
  const float = Math.sin(frame * 0.018) * 2.3;
  const scanX = 70 + ((frame * 1.16) % 1570);
  const conditionOpacity = windowOpacity(frame, 544, 1062, 24);
  const recognitionOpacity = 1 - ramp(frame, 544, 568);
  const resolutionOpacity = ramp(frame, 1038, 1062);

  const neuralPaths = [
    "M190 231 C222 204 250 204 276 218 S330 249 370 225",
    "M205 278 C244 258 260 269 286 287 S332 294 354 266",
    "M233 169 C250 202 278 193 303 173 S346 174 364 191",
    "M273 139 C264 168 287 201 282 238 S275 297 298 329",
    "M337 149 C312 176 323 213 341 235 S350 284 327 305",
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: C.paper,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          left: offsetX,
          top: offsetY,
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          overflow: "hidden",
          color: C.ink,
        }}
      >
        {/* BACKGROUND — remains established from the very first frame. */}
        <Sequence from={0} durationInFrames={1488}>
          <svg width={1920} height={1080} viewBox="0 0 1920 1080">
            <defs>
              <pattern
                id="s07-paper"
                width={26}
                height={26}
                patternUnits="userSpaceOnUse"
              >
                <circle cx={2} cy={3} r={0.65} fill="#ADA79B" opacity={0.22} />
                <circle cx={18} cy={17} r={0.45} fill="#ADA79B" opacity={0.16} />
              </pattern>
              <radialGradient id="s07-glow">
                <stop offset="0%" stopColor={C.yellow} stopOpacity={0.14} />
                <stop offset="100%" stopColor={C.yellow} stopOpacity={0} />
              </radialGradient>
            </defs>
            <rect width={1920} height={1080} fill="url(#s07-paper)" />
            <ellipse
              cx={1100 + Math.sin(frame * 0.005) * 80}
              cy={470}
              rx={760}
              ry={450}
              fill="url(#s07-glow)"
            />
            <path
              d="M100 108H1820"
              stroke={C.line}
              strokeWidth={1}
            />
            <path
              d="M1820 137V840M100 864H1820"
              stroke={C.line}
              strokeWidth={1}
              opacity={0.55}
            />
          </svg>
        </Sequence>

        {/* EDITORIAL MASTHEAD */}
        <Sequence from={0} durationInFrames={1488}>
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 54,
              display: "flex",
              alignItems: "center",
              gap: 19,
            }}
          >
            <div
              style={{
                padding: "8px 11px",
                background: C.ink,
                color: C.paper,
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: 2,
              }}
            >
              PIKIRAN / KENDALI
            </div>
            <span
              style={{
                fontSize: 17,
                color: C.muted,
                letterSpacing: 3,
                fontWeight: 700,
              }}
            >
              RUANG UNTUK MEMILIH
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              right: 100,
              top: 64,
              display: "flex",
              alignItems: "baseline",
              gap: 10,
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 23 }}>07</span>
            <span style={{ color: C.muted, fontSize: 15 }}>/ 08</span>
          </div>
        </Sequence>

        {/* ACT 1 — the distinction, then recognition. */}
        <Sequence from={0} durationInFrames={568}>
          <div style={{ position: "absolute", left: 100, top: 151 }}>
            <KineticWords
              text="Pikiran bukan tindakan."
              frame={frame}
              fps={fps}
              cue={0}
              initiallyVisible
              size={72}
            />
            <div
              style={{
                position: "absolute",
                top: 77,
                left: 254,
                height: 10,
                width: 220 * ramp(frame, 32, 91),
                background: C.yellow,
                transform: "rotate(-1deg)",
              }}
            />
            <div
              style={{
                marginTop: 27,
                fontSize: 23,
                color: C.muted,
                opacity: 0.7 + 0.3 * gapReveal,
              }}
            >
              Di antara keduanya, ada ruang untuk memilih.
            </div>
          </div>
        </Sequence>

        {/* ACT 2 — same diagram; pressure is added, not a new slide. */}
        <Sequence from={544} durationInFrames={518}>
          <div style={{ position: "absolute", left: 100, top: 151 }}>
            <KineticWords
              text="Kendali tidak selalu mudah."
              frame={frame}
              fps={fps}
              cue={544}
              size={70}
            />
            <div
              style={{
                marginTop: 27,
                fontSize: 23,
                color: C.muted,
                opacity: ramp(frame, 570, 599),
              }}
            >
              Kapasitas kita berubah bersama kondisi yang kita hadapi.
            </div>
          </div>
        </Sequence>

        {/* ACT 3 — understanding, followed by the closing question. */}
        <Sequence from={1038} durationInFrames={450}>
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 151,
              opacity: 1 - finalQuestion,
            }}
          >
            <KineticWords
              text="Memahami. Tidak selalu mengikuti."
              frame={frame}
              fps={fps}
              cue={1038}
              size={64}
            />
            <div
              style={{
                marginTop: 27,
                fontSize: 23,
                color: C.muted,
                opacity: ramp(frame, 1070, 1100),
              }}
            >
              Kendali diri bukan mengatur setiap pikiran yang muncul.
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 100,
              top: 151,
              opacity: finalQuestion,
            }}
          >
            <KineticWords
              text="Apakah pikiran sepenuhnya kita kendalikan?"
              frame={frame}
              fps={fps}
              cue={1287}
              size={59}
            />
            <div
              style={{
                position: "relative",
                display: "inline-block",
                marginTop: 28,
                fontSize: 29,
                fontWeight: 700,
                opacity: answer,
                transform: `translateY(${(1 - settle(frame, fps, 1416)) * 8}px)`,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: -4,
                  right: -8,
                  top: 18,
                  height: 17,
                  background: C.yellow,
                  transform: `scaleX(${answer}) rotate(-0.6deg)`,
                  transformOrigin: "left center",
                }}
              />
              <span style={{ position: "relative" }}>
                Tidak sesederhana “ya”.
              </span>
            </div>
          </div>
        </Sequence>

        {/* FOUNDATIONAL DIAGRAM — persistent for the full 48.6 seconds. */}
        <Sequence from={0} durationInFrames={1488}>
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 315,
              width: 1720,
              height: 525,
              borderRadius: 22,
              background: C.white,
              border: `1px solid ${C.line}`,
              boxShadow: "0 12px 40px rgba(41,35,23,0.045)",
              overflow: "hidden",
            }}
          >
            <svg
              width={1720}
              height={525}
              viewBox="0 0 1720 525"
              style={{ display: "block" }}
            >
              <defs>
                <pattern
                  id="s07-diagram-grid"
                  width={36}
                  height={36}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M36 0H0V36"
                    fill="none"
                    stroke={C.line}
                    strokeWidth={0.65}
                    opacity={0.3}
                  />
                </pattern>
                <linearGradient id="s07-scan">
                  <stop offset="0%" stopColor={C.teal} stopOpacity={0} />
                  <stop offset="50%" stopColor={C.teal} stopOpacity={0.045} />
                  <stop offset="100%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
                <marker
                  id="s07-arrow"
                  viewBox="0 0 12 12"
                  refX={10}
                  refY={6}
                  markerWidth={8}
                  markerHeight={8}
                  orient="auto"
                >
                  <path d="M2 2L10 6L2 10" fill="none" stroke={C.teal} strokeWidth={2} />
                </marker>
                <marker
                  id="s07-muted-arrow"
                  viewBox="0 0 12 12"
                  refX={10}
                  refY={6}
                  markerWidth={8}
                  markerHeight={8}
                  orient="auto"
                >
                  <path d="M2 2L10 6L2 10" fill="none" stroke={C.muted} strokeWidth={2} />
                </marker>
              </defs>

              <rect width={1720} height={525} fill="url(#s07-diagram-grid)" />
              <rect
                x={scanX - 110}
                y={83}
                width={220}
                height={310}
                fill="url(#s07-scan)"
              />
              <text
                x={35}
                y={43}
                fontSize={13}
                letterSpacing={2.8}
                fontWeight={700}
                fill={C.muted}
              >
                DIAGRAM KONSEPTUAL
              </text>
              <path d="M35 65H1685" stroke={C.line} />

              <g opacity={1 - ramp(frame, 650, 679)}>
                <text
                  x={1685}
                  y={43}
                  textAnchor="end"
                  fontSize={14}
                  fontWeight={700}
                  fill={C.muted}
                >
                  PIKIRAN ≠ TINDAKAN
                </text>
              </g>
              <SvgReveal frame={frame} fps={fps} cue={650} distance={5}>
                <g opacity={1 - ramp(frame, 1038, 1062)}>
                  <rect x={1435} y={20} width={250} height={33} rx={16} fill="#FBE6E7" />
                  <circle cx={1456} cy={36} r={4} fill={C.red} />
                  <text x={1470} y={41} fontSize={14} fontWeight={700} fill={C.red}>
                    KAPASITAS BISA BERUBAH
                  </text>
                </g>
              </SvgReveal>
              <g opacity={resolutionOpacity}>
                <rect x={1437} y={20} width={248} height={33} rx={16} fill="#E4F3EF" />
                <circle cx={1458} cy={36} r={4} fill={C.teal} />
                <text x={1473} y={41} fontSize={14} fontWeight={700} fill={C.teal}>
                  MEMAHAMI ≠ MENGIKUTI
                </text>
              </g>

              {/* Column labels stay visible at frame zero. */}
              <text x={286} y={105} textAnchor="middle" fontSize={16} letterSpacing={2.2} fontWeight={700} fill={C.muted}>
                PIKIRAN MUNCUL
              </text>
              <text x={855} y={105} textAnchor="middle" fontSize={16} letterSpacing={2.2} fontWeight={700} fill={C.muted}>
                RUANG DI ANTARANYA
              </text>
              <text x={1414} y={105} textAnchor="middle" fontSize={16} letterSpacing={2.2} fontWeight={700} fill={C.muted}>
                RESPONS
              </text>

              {/* Custom brain silhouette and continuously firing pathways. */}
              <g transform={`translate(0 ${float})`}>
                <ellipse cx={286} cy={245} rx={155} ry={118} fill="#EAF0FB" opacity={0.68} />
                <path
                  d="M194 293
                     C166 284 157 257 168 236
                     C148 211 160 177 188 169
                     C191 143 216 128 239 135
                     C254 112 285 113 302 129
                     C330 114 359 130 365 152
                     C398 156 415 180 405 205
                     C432 232 416 260 394 269
                     C401 297 378 318 353 315
                     C341 339 311 344 290 328
                     C270 348 240 336 231 315
                     C216 322 199 312 194 293Z"
                  fill="#EEF3FC"
                  stroke={C.blue}
                  strokeWidth={3}
                  strokeLinejoin="round"
                />
                <path
                  d="M305 327C303 346 314 351 327 350"
                  stroke={C.blue}
                  strokeWidth={6}
                  fill="none"
                  strokeLinecap="round"
                />
                {neuralPaths.map((path, index) => (
                  <g key={path}>
                    <path
                      d={path}
                      fill="none"
                      stroke={C.blue}
                      strokeWidth={2.1}
                      opacity={0.26}
                    />
                    <path
                      d={path}
                      pathLength={100}
                      fill="none"
                      stroke={index % 2 === 0 ? C.blue : C.teal}
                      strokeWidth={2.8}
                      strokeLinecap="round"
                      strokeDasharray="9 91"
                      strokeDashoffset={-(frame * 0.45 + index * 21) % 100}
                      opacity={0.75}
                    />
                  </g>
                ))}
                {[
                  [233, 169],
                  [276, 218],
                  [341, 235],
                  [286, 287],
                  [303, 173],
                  [354, 266],
                ].map(([x, y], index) => (
                  <g key={`${x}-${y}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={8 + Math.sin(frame * 0.035 + index) * 2}
                      fill={C.blue}
                      opacity={0.08}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={3.3}
                      fill={index % 2 ? C.teal : C.blue}
                      opacity={0.6 + Math.sin(frame * 0.03 + index) * 0.2}
                    />
                  </g>
                ))}
              </g>

              {/* Foundational connectors are visible before emphasis begins. */}
              <path
                d="M450 235H737"
                stroke={C.line}
                strokeWidth={3}
                fill="none"
                strokeDasharray="5 8"
              />
              <path
                d="M962 235H1227"
                stroke={C.line}
                strokeWidth={3}
                fill="none"
                strokeDasharray="5 8"
              />
              <path
                d="M450 235H737"
                pathLength={100}
                stroke={C.blue}
                strokeWidth={3}
                fill="none"
                strokeDasharray={100}
                strokeDashoffset={100 * (1 - gapReveal)}
              />
              <path
                d="M962 235H1227"
                pathLength={100}
                stroke={C.teal}
                strokeWidth={3}
                fill="none"
                strokeDasharray={100}
                strokeDashoffset={100 * (1 - ramp(frame, 140, 210))}
                markerEnd="url(#s07-arrow)"
                opacity={ramp(frame, 140, 165)}
              />
              <circle
                cx={450 + ((frame * 1.2) % 281)}
                cy={235}
                r={4}
                fill={C.blue}
                opacity={0.25 + 0.25 * gapReveal}
              />

              {/* The agency gate: a constant anchor across all three acts. */}
              <g transform={`translate(855 ${235 + Math.sin(frame * 0.016 + 1) * 1.6})`}>
                <circle r={104} fill={C.paper} stroke={C.line} strokeWidth={1.5} />
                <circle
                  r={86}
                  fill={C.yellow}
                  opacity={0.14 + gapReveal * 0.57 - pressure * 0.18 + understanding * 0.15}
                />
                <circle
                  r={96}
                  fill="none"
                  stroke={understanding > 0.5 ? C.teal : C.ink}
                  strokeWidth={2}
                  strokeDasharray="28 575"
                  transform={`rotate(${frame * 0.13 - 90})`}
                  opacity={0.3}
                />
                <path
                  d="M-13 -45V-20M13 -45V-20"
                  stroke={C.ink}
                  strokeWidth={5}
                  strokeLinecap="round"
                  opacity={1 - understanding}
                />
                <path
                  d="M-20 -32L-5 -18L22 -46"
                  pathLength={100}
                  stroke={C.teal}
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray={100}
                  strokeDashoffset={100 * (1 - understanding)}
                  opacity={understanding}
                />
                <text y={17} textAnchor="middle" fontSize={37} fontWeight={800} letterSpacing={1}>
                  JEDA
                </text>
                <text y={47} textAnchor="middle" fontSize={16} fill={C.muted}>
                  sebelum merespons
                </text>
              </g>

              <path
                d="M748 192
                   C763 128 926 116 960 192
                   C1004 283 919 352 815 326
                   C729 309 719 230 748 192
                   M767 158C827 118 938 144 964 210"
                pathLength={100}
                fill="none"
                stroke={C.red}
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={100}
                strokeDashoffset={100 * (1 - marker)}
                opacity={0.8 * conditionOpacity}
              />

              {/* Available responses: a choice, not an automatic endpoint. */}
              <g transform={`translate(1250 ${159 + Math.sin(frame * 0.017 + 2) * 1.7})`}>
                <rect width={324} height={82} rx={13} fill="#EDF6F3" stroke="#BADAD0" />
                <rect
                  x={15}
                  y={15}
                  width={5}
                  height={52}
                  rx={2}
                  fill={C.teal}
                  opacity={0.35 + awareness * 0.65}
                />
                <text x={37} y={34} fontSize={13} fontWeight={700} letterSpacing={1.4} fill={C.teal}>
                  PILIHAN 01
                </text>
                <text x={37} y={61} fontSize={25} fontWeight={700}>Bertindak</text>
                <rect y={96} width={324} height={82} rx={13} fill={C.paper} stroke={C.line} />
                <text x={37} y={130} fontSize={13} fontWeight={700} letterSpacing={1.4} fill={C.muted}>
                  PILIHAN 02
                </text>
                <text x={37} y={157} fontSize={25} fontWeight={700}>Tidak mengikuti</text>
                <circle cx={286} cy={137} r={12} fill={C.teal} opacity={understanding} />
                <path
                  d="M280 137L284 141L292 132"
                  fill="none"
                  stroke={C.white}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={understanding}
                />
              </g>

              <path
                d="M1085 235C1140 235 1155 296 1235 296"
                pathLength={100}
                stroke={C.teal}
                strokeWidth={2.5}
                fill="none"
                strokeDasharray={100}
                strokeDashoffset={100 * (1 - understanding)}
                markerEnd="url(#s07-arrow)"
                opacity={understanding}
              />

              {/* A quiet annotation, progressively highlighted. */}
              <g opacity={1 - understanding}>
                <rect
                  x={727}
                  y={358}
                  width={256 * ramp(frame, 213, 282)}
                  height={23}
                  fill={C.yellow}
                  opacity={0.65}
                  transform="rotate(-0.8 855 370)"
                />
                <text x={855} y={377} textAnchor="middle" fontSize={23} fontWeight={700}>
                  Ruang untuk memilih
                </text>
              </g>
              <g opacity={understanding}>
                <text x={855} y={377} textAnchor="middle" fontSize={23} fontWeight={700} fill={C.teal}>
                  Memahami ≠ mengikuti
                </text>
                <path
                  d="M695 363C724 341 967 341 1012 364
                     C1038 397 720 405 692 376"
                  pathLength={100}
                  fill="none"
                  stroke={C.red}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeDasharray={100}
                  strokeDashoffset={100 * (1 - secondMarker)}
                  opacity={0.8}
                />
              </g>

              <path d="M35 401H1685" stroke={C.line} />

              {/* ACT 1 evidence accumulates and remains readable. */}
              <g opacity={recognitionOpacity}>
                <text x={48} y={449} fontSize={15} fontWeight={700} letterSpacing={1.3} fill={C.muted}>
                  MENGENALI DIRI
                </text>
                <EvidenceChip x={310} y={420} width={272} label="Kebiasaan" number="01" color={C.yellow} frame={frame} fps={fps} cue={213} />
                <EvidenceChip x={607} y={420} width={247} label="Pemicu" number="02" color={C.blue} frame={frame} fps={fps} cue={315} />
                <EvidenceChip x={879} y={420} width={272} label="Reaksi diri" number="03" color={C.teal} frame={frame} fps={fps} cue={410} />
                <SvgReveal frame={frame} fps={fps} cue={455}>
                  <path
                    d="M1183 449H1261"
                    fill="none"
                    stroke={C.teal}
                    strokeWidth={2}
                    markerEnd="url(#s07-arrow)"
                  />
                  <text x={1285} y={442} fontSize={19} fontWeight={700} fill={C.teal}>
                    Pilihan yang
                  </text>
                  <text x={1285} y={465} fontSize={19} fontWeight={700} fill={C.teal}>
                    lebih sadar
                  </text>
                </SvgReveal>
              </g>

              {/* ACT 2 adds contextual pressures to the existing model. */}
              <g opacity={conditionOpacity}>
                <text x={48} y={449} fontSize={15} fontWeight={700} letterSpacing={1.3} fill={C.muted}>
                  DIPENGARUHI OLEH
                </text>
                {[
                  { label: "Emosi", x: 310, width: 222, cue: 650 },
                  { label: "Stres", x: 553, width: 208, cue: 681 },
                  { label: "Kelelahan", x: 782, width: 267, cue: 718 },
                  { label: "Lingkungan", x: 1070, width: 289, cue: 759 },
                ].map((item, index) => (
                  <EvidenceChip
                    key={item.label}
                    {...item}
                    y={420}
                    number={String(index + 1).padStart(2, "0")}
                    color={index % 2 === 0 ? C.red : C.ink}
                    frame={frame}
                    fps={fps}
                  />
                ))}
                <SvgReveal frame={frame} fps={fps} cue={856} distance={6}>
                  <text x={1680} y={443} textAnchor="end" fontSize={17} fontWeight={700} fill={C.muted}>
                    Bukan kontrol
                  </text>
                  <text x={1680} y={466} textAnchor="end" fontSize={17} fontWeight={700} fill={C.muted}>
                    atas segalanya.
                  </text>
                </SvgReveal>
              </g>

              {/* ACT 3: a calm, persistent three-step synthesis. */}
              <g opacity={resolutionOpacity}>
                <text x={48} y={449} fontSize={15} fontWeight={700} letterSpacing={1.3} fill={C.muted}>
                  CARA MEMANDANGNYA
                </text>
                <EvidenceChip x={310} y={420} width={330} label="Pikiran hadir" number="01" color={C.blue} frame={frame} fps={fps} cue={1038} />
                <SvgReveal frame={frame} fps={fps} cue={1080}>
                  <path d="M656 449H701" stroke={C.muted} strokeWidth={2} markerEnd="url(#s07-muted-arrow)" />
                </SvgReveal>
                <EvidenceChip x={720} y={420} width={340} label="Belajar memahami" number="02" color={C.yellow} frame={frame} fps={fps} cue={1095} />
                <SvgReveal frame={frame} fps={fps} cue={1160}>
                  <path d="M1076 449H1121" stroke={C.teal} strokeWidth={2} markerEnd="url(#s07-arrow)" />
                </SvgReveal>
                <EvidenceChip x={1140} y={420} width={360} label="Memilih respons" number="03" color={C.teal} frame={frame} fps={fps} cue={1180} />
              </g>

              <text x={48} y={507} fontSize={11} letterSpacing={1.1} fill={C.muted} opacity={0.65}>
                ILUSTRASI KONSEPTUAL · BUKAN PEMETAAN ANATOMIS
              </text>
              <g transform={`translate(1631 502)`}>
                {[0, 1, 2, 3, 4].map((index) => (
                  <rect
                    key={index}
                    x={index * 10}
                    y={-5 - Math.sin(frame * 0.025 + index * 0.8) * 2}
                    width={4}
                    height={5 + (Math.sin(frame * 0.025 + index * 0.8) + 1) * 3}
                    rx={2}
                    fill={C.teal}
                    opacity={0.3}
                  />
                ))}
              </g>
            </svg>
          </div>
        </Sequence>
        {/* Y >= 900 intentionally reserved for the global caption layer. */}
      </div>
    </div>
  );
};