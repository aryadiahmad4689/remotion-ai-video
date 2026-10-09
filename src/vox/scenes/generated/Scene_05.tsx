import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const PAPER = "#F5F2EB";
const INK = "#18181B";
const YELLOW = "#FFE600";
const RED = "#E63946";
const BLUE = "#2563EB";
const TEAL = "#0D9488";
const MUTED = "#73716B";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const progress = (frame: number, start: number, length = 24) =>
  interpolate(frame, [start, start + length], [0, 1], CLAMP);

const entrance = (frame: number, fps: number, start: number) =>
  spring({
    frame: Math.max(0, frame - start),
    fps,
    config: { damping: 18, mass: 0.7, stiffness: 90 },
  });

/**
 * Frame-scoped layer wrapper. Children retain the scene's shared clock,
 * so every annotation remains synchronized with the narration.
 */
const Sequence: React.FC<{
  from: number;
  durationInFrames: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
}> = ({
  from,
  durationInFrames,
  fadeIn = 20,
  fadeOut = 20,
  children,
}) => {
  const frame = useCurrentFrame();
  const end = from + durationInFrames;
  const incoming =
    fadeIn === 0 ? (frame >= from ? 1 : 0) : progress(frame, from, fadeIn);
  const outgoing =
    fadeOut === 0
      ? frame < end
        ? 1
        : 0
      : 1 - progress(frame, end - fadeOut, fadeOut);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: Math.min(incoming, outgoing),
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
};

const Words: React.FC<{
  text: string;
  start: number;
  size?: number;
  color?: string;
  weight?: number;
  stagger?: number;
}> = ({
  text,
  start,
  size = 56,
  color = INK,
  weight = 750,
  stagger = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <span
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        gap: "0.25em",
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.12,
        letterSpacing: "-0.045em",
        color,
      }}
    >
      {text.split(" ").map((word, index) => {
        const cue = start + index * stagger;
        const p = entrance(frame, fps, cue);
        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: "inline-block",
              opacity: progress(frame, cue, 12),
              transform: `translateY(${(1 - p) * 17}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

const Highlight: React.FC<{
  start: number;
  children: React.ReactNode;
  color?: string;
}> = ({ start, children, color = YELLOW }) => {
  const frame = useCurrentFrame();
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          left: -5,
          right: -5,
          bottom: 1,
          height: "46%",
          background: color,
          transformOrigin: "left center",
          transform: `scaleX(${progress(frame, start, 34)}) rotate(-1deg)`,
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

const EvidenceIcon: React.FC<{ type: "person" | "fear" | "belief"; color: string }> =
  ({ type, color }) => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {type === "person" ? (
        <>
          <circle cx="24" cy="15" r="7" stroke={color} strokeWidth="2.4" />
          <path
            d="M11 39C11 30 16 26 24 26C32 26 37 30 37 39"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M36 9L42 5M39 18H45"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      ) : type === "fear" ? (
        <>
          <path
            d="M24 6L44 40H4L24 6Z"
            stroke={color}
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="M24 18V28"
            stroke={color}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <circle cx="24" cy="34" r="1.7" fill={color} />
        </>
      ) : (
        <>
          <path
            d="M8 12H34V30H22L13 38V30H8V12Z"
            stroke={color}
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="M17 20L21 24L29 16M36 34L42 40M42 34L36 40"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );

const EvidenceCard: React.FC<{
  cue: number;
  index: number;
  title: string;
  detail: string;
  type: "person" | "fear" | "belief";
  color: string;
}> = ({ cue, index, title, detail, type, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = entrance(frame, fps, cue);

  return (
    <div
      style={{
        position: "absolute",
        left: 1052,
        top: 318 + index * 158,
        width: 728,
        height: 137,
        boxSizing: "border-box",
        padding: "23px 27px",
        background: "#FFFEFA",
        border: "1px solid #DCD7CC",
        borderRadius: 5,
        boxShadow: "0 8px 24px rgba(24,24,27,0.035)",
        opacity: progress(frame, cue, 22),
        transform: `translateX(${(1 - p) * 32}px) translateY(${
          Math.sin(frame * 0.018 + index * 1.6) * 1.5
        }px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 15,
          bottom: 15,
          width: 4,
          background: color,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <EvidenceIcon type={type} color={color} />
        <div style={{ flex: 1 }}>
          <Words text={title} start={cue + 5} size={29} weight={720} />
          <div
            style={{
              marginTop: 11,
              fontSize: 20,
              color: MUTED,
              opacity: progress(frame, cue + 22, 20),
            }}
          >
            {detail}
          </div>
        </div>
        <div
          style={{
            alignSelf: "flex-start",
            fontFamily: "monospace",
            fontSize: 14,
            color: MUTED,
            paddingTop: 5,
          }}
        >
          0{index + 1}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 13,
          left: 95,
          height: 4,
          width: 205 + index * 30,
          background: YELLOW,
          transformOrigin: "left",
          transform: `scaleX(${progress(frame, cue + 60, 36)}) rotate(-0.7deg)`,
        }}
      />
    </div>
  );
};

const BRAIN_OUTLINE =
  "M168 309C121 305 101 270 109 233C83 205 94 162 125 144C121 102 160 69 202 77C223 43 264 35 297 52C324 24 367 31 391 56C437 39 473 61 485 94C527 91 558 119 558 152C595 161 614 198 600 231C626 264 611 302 582 317C578 355 544 378 510 368C489 401 450 410 418 391C390 419 349 414 327 387C292 404 257 389 243 363C205 370 176 347 168 309Z";

const PATHS = [
  "M151 194C188 174 176 124 216 113C251 105 257 146 284 151",
  "M188 289C223 276 212 230 241 216C265 204 299 230 313 201",
  "M235 92C227 137 260 170 241 216C226 254 252 280 281 281",
  "M292 68C312 106 281 126 299 159C321 192 356 177 370 211",
  "M339 59C331 99 369 111 348 146C329 174 342 207 370 211",
  "M398 81C370 110 403 139 386 171C369 200 409 225 404 260",
  "M458 116C417 115 429 159 449 177C470 196 457 232 489 246",
  "M518 158C477 149 483 191 514 200C541 210 547 239 533 259",
  "M160 240C178 209 201 233 205 255C214 287 252 286 260 317",
  "M281 281C301 251 321 276 334 299C350 323 378 301 390 325",
  "M370 211C345 241 370 272 404 260C432 249 448 278 438 304",
  "M489 246C461 263 493 299 466 325C449 342 419 325 418 359",
  "M260 317C285 311 305 336 296 359",
  "M334 299C324 333 348 363 374 364",
  "M533 259C556 280 530 305 506 310C484 313 483 348 459 355",
];

const NODES = [
  [151, 194],
  [216, 113],
  [284, 151],
  [241, 216],
  [313, 201],
  [281, 281],
  [299, 159],
  [348, 146],
  [370, 211],
  [386, 171],
  [404, 260],
  [449, 177],
  [489, 246],
  [514, 200],
  [533, 259],
  [205, 255],
  [260, 317],
  [334, 299],
  [390, 325],
  [438, 304],
  [418, 359],
  [374, 364],
];

const BrainDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const late = progress(frame, 1165, 100);
  const active = progress(frame, 115, 100);
  const truth = progress(frame, 977, 40);
  const sourceLabels = [
    { name: "PENGALAMAN", cue: 1165, x: 38, y: 109, tx: 216, ty: 113 },
    { name: "INGATAN", cue: 1210, x: 489, y: 63, tx: 398, ty: 81 },
    { name: "EMOSI", cue: 1255, x: 20, y: 391, tx: 260, ty: 317 },
    { name: "KONTEKS", cue: 1300, x: 501, y: 393, tx: 489, ty: 246 },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 92,
        top: 294,
        width: 873,
        height: 514,
        transform: `translateY(${Math.sin(frame * 0.014) * 3}px)`,
      }}
    >
      <svg
        width="873"
        height="514"
        viewBox="0 0 700 450"
        fill="none"
        style={{ overflow: "visible" }}
      >
        <defs>
          <radialGradient id="s05-brain-glow">
            <stop offset="0%" stopColor={YELLOW} stopOpacity=".2" />
            <stop offset="100%" stopColor={YELLOW} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="s05-brain-paper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFDF6" />
            <stop offset="100%" stopColor="#EAE5D9" />
          </linearGradient>
          <clipPath id="s05-brain-clip">
            <path d={BRAIN_OUTLINE} />
          </clipPath>
          <marker
            id="s05-input-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M1 1L6 4L1 7" stroke={TEAL} strokeWidth="1.5" />
          </marker>
        </defs>

        <circle cx="352" cy="223" r="214" fill="url(#s05-brain-glow)" />
        <circle
          cx="352"
          cy="223"
          r="207"
          stroke="#D8D2C6"
          strokeDasharray="2 11"
        />
        <circle cx="352" cy="223" r="184" stroke="#E1DCCF" />
        <g transform={`rotate(${frame * 0.065},352,223)`} opacity=".55">
          <circle
            cx="352"
            cy="223"
            r="207"
            stroke={TEAL}
            strokeWidth="2"
            strokeDasharray="58 1243"
            strokeLinecap="round"
          />
          <circle
            cx="352"
            cy="223"
            r="184"
            stroke={BLUE}
            strokeWidth="1.5"
            strokeDasharray="35 1121"
            strokeDashoffset="-430"
          />
        </g>

        <path
          d={BRAIN_OUTLINE}
          transform="translate(0 7)"
          fill={INK}
          opacity=".045"
        />
        <path
          d={BRAIN_OUTLINE}
          fill="url(#s05-brain-paper)"
          stroke={INK}
          strokeWidth="2.7"
          strokeLinejoin="round"
        />

        <g clipPath="url(#s05-brain-clip)">
          <path
            d="M341 42C319 103 359 142 339 194C314 246 354 282 329 387"
            stroke="#B7B0A1"
            strokeWidth="1.7"
            strokeDasharray="5 7"
          />
          {PATHS.map((d, index) => (
            <g key={d}>
              <path
                d={d}
                stroke={index % 3 === 0 ? "#AABBB4" : "#B7B1A4"}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d={d}
                pathLength={100}
                stroke={index % 3 === 0 ? TEAL : BLUE}
                strokeWidth={2.2 + late * 0.6}
                strokeLinecap="round"
                strokeDasharray="9 91"
                strokeDashoffset={-((frame * 0.48 + index * 13) % 100)}
                opacity={0.22 + active * 0.4 + late * 0.25}
              />
            </g>
          ))}
          {NODES.map(([x, y], index) => {
            const pulse = (Math.sin(frame * 0.065 - index * 0.8) + 1) / 2;
            return (
              <g key={`${x}-${y}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={5 + pulse * 6}
                  fill={index % 2 ? BLUE : TEAL}
                  opacity={0.035 + pulse * 0.07}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={2.5 + pulse}
                  fill={index % 2 ? BLUE : TEAL}
                  opacity={0.5 + pulse * 0.45}
                />
              </g>
            );
          })}
          <rect
            x="91"
            y={70 + ((frame * 0.58) % 340)}
            width="530"
            height="2"
            fill={TEAL}
            opacity=".085"
          />
        </g>

        {sourceLabels.map(({ name, cue, x, y, tx, ty }, index) => {
          const p = progress(frame, cue, 32);
          return (
            <g key={name} opacity={p}>
              <path
                d={`M${x + 55} ${y + 13} Q${(x + 55 + tx) / 2} ${
                  index < 2 ? y - 20 : y + 16
                } ${tx} ${ty}`}
                stroke={TEAL}
                strokeWidth="1.4"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={1 - p}
                markerEnd="url(#s05-input-arrow)"
              />
              <rect
                x={x - 8}
                y={y - 10}
                width={name === "PENGALAMAN" ? 126 : 105}
                height="29"
                rx="3"
                fill={PAPER}
                stroke="#B6CEC4"
              />
              <text
                x={x}
                y={y + 9}
                fill={TEAL}
                fontSize="11"
                fontWeight="700"
                letterSpacing="1.2"
              >
                {name}
              </text>
            </g>
          );
        })}

        <g opacity={1 - truth}>
          <path d="M352 412V433" stroke={INK} strokeWidth="1.2" />
          <text
            x="352"
            y="455"
            textAnchor="middle"
            fill={MUTED}
            fontSize="12"
            letterSpacing="2"
          >
            PIKIRAN YANG KITA SEBUT “DIRI”
          </text>
        </g>
        <g opacity={truth}>
          <path d="M352 412V433" stroke={TEAL} strokeWidth="1.5" />
          <text
            x="352"
            y="455"
            textAnchor="middle"
            fill={TEAL}
            fontSize="12"
            fontWeight="700"
            letterSpacing="2"
          >
            OTAK MENAFSIRKAN, BUKAN SEKADAR MEREKAM
          </text>
        </g>
      </svg>
    </div>
  );
};

export const Scene_05: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);
  const finalBuild = progress(frame, 1165, 38);
  const examplesExit = 1 - progress(frame, 977, 28);
  const insight = progress(frame, 878, 24);
  const arrow = progress(frame, 284, 45);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: PAPER,
        fontFamily:
          'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
        color: INK,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 1920,
          height: 1080,
          left: (width - 1920 * scale) / 2,
          top: (height - 1080 * scale) / 2,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Established paper, editorial structure, and diagram from frame zero. */}
        <Sequence from={0} durationInFrames={1398} fadeIn={0} fadeOut={0}>
          <svg
            width="1920"
            height="1080"
            viewBox="0 0 1920 1080"
            style={{ position: "absolute", inset: 0 }}
          >
            <defs>
              <radialGradient id="s05-ambient">
                <stop stopColor="#E9DBAC" stopOpacity=".28" />
                <stop offset="1" stopColor={PAPER} stopOpacity="0" />
              </radialGradient>
              <pattern
                id="s05-paper"
                width="37"
                height="43"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="5" cy="11" r=".6" fill="#A69B85" opacity=".17" />
                <circle cx="26" cy="32" r=".45" fill="#A69B85" opacity=".13" />
              </pattern>
            </defs>
            <rect width="1920" height="1080" fill={PAPER} />
            <ellipse
              cx={520 + Math.sin(frame * 0.006) * 35}
              cy="475"
              rx="670"
              ry="480"
              fill="url(#s05-ambient)"
            />
            <rect width="1920" height="1080" fill="url(#s05-paper)" />
            <path
              d="M96 107H1824M96 869H1824"
              stroke="#D4CEC1"
              strokeWidth="1"
            />
            <path
              d="M993 288V815"
              stroke="#DAD4C7"
              strokeWidth="1"
              strokeDasharray="3 8"
            />
          </svg>

          <div
            style={{
              position: "absolute",
              top: 52,
              left: 96,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                background: YELLOW,
                color: INK,
                padding: "8px 12px",
                fontSize: 17,
                fontWeight: 850,
                letterSpacing: 1,
              }}
            >
              05
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 750,
                letterSpacing: 3,
              }}
            >
              DI BALIK PIKIRAN
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              right: 96,
              top: 65,
              fontSize: 13,
              letterSpacing: 2,
              color: MUTED,
              fontFamily: "monospace",
            }}
          >
            PERSEPSI / KEPUTUSAN / INTERPRETASI
          </div>

          <div
            style={{
              position: "absolute",
              left: 113,
              top: 276,
              fontSize: 13,
              fontFamily: "monospace",
              letterSpacing: 1.6,
              color: MUTED,
            }}
          >
            A / MODEL KONSEPTUAL
          </div>
          <div
            style={{
              position: "absolute",
              left: 1052,
              top: 276,
              fontSize: 13,
              fontFamily: "monospace",
              letterSpacing: 1.6,
              color: MUTED,
            }}
          >
            B / PENGALAMAN SEHARI-HARI
          </div>

          <BrainDiagram />

          {/* Empty evidence frames are present before their contents arrive. */}
          <div style={{ opacity: examplesExit }}>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: 1052,
                  top: 318 + index * 158,
                  width: 728,
                  height: 137,
                  border: "1px dashed #D4CEC1",
                  borderRadius: 5,
                  background: "rgba(255,254,250,0.22)",
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    right: 24,
                    top: 23,
                    fontSize: 14,
                    color: "#B5AD9E",
                    fontFamily: "monospace",
                  }}
                >
                  0{index + 1}
                </span>
              </div>
            ))}
          </div>
        </Sequence>

        {/* ACT I — a familiar mind, an unfamiliar mechanism. */}
        <Sequence from={0} durationInFrames={515} fadeIn={0} fadeOut={35}>
          <div style={{ position: "absolute", left: 96, top: 143 }}>
            <div
              style={{
                fontSize: 61,
                fontWeight: 800,
                letterSpacing: "-0.045em",
                lineHeight: 1.08,
              }}
            >
              Pikiran sendiri.{" "}
              <Highlight start={14}>
                Belum tentu dipahami.
              </Highlight>
            </div>
            <div style={{ marginTop: 20 }}>
              <Words
                text="Seberapa jauh kita mengenal cara kita berpikir?"
                start={115}
                size={27}
                weight={450}
                color={MUTED}
                stagger={4}
              />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 124,
              top: 795,
              padding: "10px 17px",
              border: "1px solid #CFC7B7",
              background: "#FFFBF0",
              borderRadius: 4,
              opacity: progress(frame, 263, 22),
              transform: `translateY(${
                (1 - entrance(frame, fps, 263)) * 15
              }px)`,
              fontSize: 20,
            }}
          >
            <Words
              text="Ingat satu keputusanmu."
              start={263}
              size={20}
              weight={650}
            />
          </div>
        </Sequence>

        {/* ACT II — the same diagram accumulates three pieces of evidence. */}
        <Sequence from={480} durationInFrames={527} fadeIn={35} fadeOut={30}>
          <div style={{ position: "absolute", left: 96, top: 143 }}>
            <Words
              text="Terasa meyakinkan. Belum tentu akurat."
              start={480}
              size={61}
              stagger={3}
            />
            <div
              style={{
                marginTop: 20,
                fontSize: 27,
                color: MUTED,
                opacity: progress(frame, 500, 24),
              }}
            >
              Kesan, rasa takut, dan keyakinan bisa mendahului pemeriksaan.
            </div>
          </div>
        </Sequence>

        <Sequence from={263} durationInFrames={744} fadeIn={20} fadeOut={30}>
          <svg
            width="1920"
            height="900"
            viewBox="0 0 1920 900"
            style={{ position: "absolute", inset: 0 }}
          >
            <path
              d="M838 493C919 493 949 388 1027 388"
              fill="none"
              stroke="#A29B8C"
              strokeWidth="1.8"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - arrow}
            />
            <path
              d="M1018 381L1027 388L1018 395"
              fill="none"
              stroke="#A29B8C"
              strokeWidth="1.8"
              opacity={progress(frame, 318, 16)}
            />
          </svg>

          <EvidenceCard
            cue={349}
            index={0}
            title="Kesan pertama"
            detail="Tidak suka — sebelum benar-benar mengenal."
            type="person"
            color={BLUE}
          />
          <EvidenceCard
            cue={505}
            index={1}
            title="Rasa takut"
            detail="Terasa berbahaya — meski risikonya kecil."
            type="fear"
            color={RED}
          />
          <EvidenceCard
            cue={710}
            index={2}
            title="Keyakinan"
            detail="Merasa benar — lalu menyadari kekeliruan."
            type="belief"
            color={TEAL}
          />

          <div
            style={{
              position: "absolute",
              left: 1095,
              top: 818,
              fontSize: 22,
              fontWeight: 650,
              opacity: insight,
              transform: `translateY(${
                (1 - entrance(frame, fps, 878)) * 12
              }px)`,
            }}
          >
            <Highlight start={889}>
              Perasaannya nyata.
            </Highlight>
          </div>
        </Sequence>

        {/* ACT III — perceived truth is separated from external reality. */}
        <Sequence from={977} durationInFrames={421} fadeIn={28} fadeOut={0}>
          <div style={{ position: "absolute", left: 96, top: 143 }}>
            <Words
              text="Terasa benar ≠ kenyataan."
              start={977}
              size={61}
              stagger={5}
            />
            <div style={{ marginTop: 20 }}>
              <Words
                text="Otak membangun tafsir dari informasi yang tersedia."
                start={1004}
                size={27}
                color={MUTED}
                weight={450}
              />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 1052,
              top: 318,
              width: 728,
              height: 453,
              boxSizing: "border-box",
              background: "#FFFEFA",
              border: "1px solid #D4CEC1",
              borderRadius: 5,
              boxShadow: "0 10px 30px rgba(24,24,27,0.035)",
              transform: `translateY(${Math.sin(frame * 0.016) * 1.5}px)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 33,
                top: 28,
                fontSize: 12,
                letterSpacing: 2,
                fontFamily: "monospace",
                color: MUTED,
              }}
            >
              MEMISAHKAN DUA HAL
            </div>

            <div
              style={{
                position: "absolute",
                left: 33,
                top: 91,
                width: 287,
                height: 166,
                padding: "25px 23px",
                boxSizing: "border-box",
                background: "#FFF8CC",
                border: "1px solid #E6DDA6",
              }}
            >
              <div style={{ fontSize: 13, letterSpacing: 1.7, color: MUTED }}>
                DI DALAM PIKIRAN
              </div>
              <div style={{ marginTop: 20 }}>
                <Words
                  text="Terasa benar"
                  start={995}
                  size={34}
                  weight={750}
                />
              </div>
              <div
                style={{
                  marginTop: 15,
                  fontSize: 18,
                  color: MUTED,
                  opacity: progress(frame, 1021, 24),
                }}
              >
                Perasaan & keyakinan
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                right: 33,
                top: 91,
                width: 287,
                height: 166,
                padding: "25px 23px",
                boxSizing: "border-box",
                background: "#EEF4F1",
                border: "1px solid #CDDCD5",
              }}
            >
              <div style={{ fontSize: 13, letterSpacing: 1.7, color: MUTED }}>
                DI LUAR PIKIRAN
              </div>
              <div style={{ marginTop: 20 }}>
                <Words
                  text="Kenyataan"
                  start={1034}
                  size={34}
                  weight={750}
                />
              </div>
              <div
                style={{
                  marginTop: 15,
                  fontSize: 18,
                  color: MUTED,
                  opacity: progress(frame, 1045, 24),
                }}
              >
                Perlu diperiksa
              </div>
            </div>

            <svg
              width="728"
              height="453"
              viewBox="0 0 728 453"
              style={{ position: "absolute", inset: 0 }}
            >
              <g opacity={progress(frame, 1034, 24)}>
                <path
                  d="M349 167H379M349 183H379M378 154L350 196"
                  stroke={RED}
                  strokeWidth="3.6"
                  strokeLinecap="round"
                />
                <path
                  d="M341 142C359 126 389 136 397 160C406 187 388 211 365 213C337 216 321 193 326 169C329 151 341 141 354 140"
                  fill="none"
                  stroke={RED}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={1 - progress(frame, 1060, 48)}
                />
              </g>
              <path d="M33 290H695" stroke="#DED8CB" />
            </svg>

            <div
              style={{
                position: "absolute",
                left: 34,
                top: 318,
                fontSize: 29,
                fontWeight: 700,
                opacity: progress(frame, 1092, 22),
              }}
            >
              <Highlight start={1104}>
                Tafsir bukan salinan.
              </Highlight>
            </div>
            <div
              style={{
                position: "absolute",
                left: 34,
                top: 371,
                width: 650,
                fontSize: 21,
                lineHeight: 1.5,
                color: MUTED,
                opacity: progress(frame, 1120, 25),
              }}
            >
              Apa yang kita rasakan tidak otomatis menjadi
              <br />
              gambaran yang akurat tentang dunia.
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 1052,
              top: 800,
              display: "flex",
              alignItems: "center",
              gap: 13,
              opacity: finalBuild,
              transform: `translateX(${
                (1 - entrance(frame, fps, 1165)) * 20
              }px)`,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: TEAL,
                boxShadow: `0 0 0 ${
                  4 + Math.sin(frame * 0.07) * 2
                }px rgba(13,148,136,0.10)`,
              }}
            />
            <Words
              text="Interpretasi terus diperbarui."
              start={1165}
              size={22}
              color={TEAL}
              weight={650}
            />
          </div>
        </Sequence>

        {/* Persistent editorial progress rail; subtitle territory stays empty. */}
        <Sequence from={0} durationInFrames={1398} fadeIn={0} fadeOut={0}>
          <div
            style={{
              position: "absolute",
              left: 96,
              top: 868,
              height: 2,
              width: 1728,
              background: "#D4CEC1",
            }}
          >
            <div
              style={{
                height: 2,
                width: `${interpolate(frame, [0, 1397], [8, 100], CLAMP)}%`,
                background: TEAL,
                opacity: 0.65,
              }}
            />
          </div>
        </Sequence>
      </div>
    </div>
  );
};