import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  paper: "#F5F2EB",
  ink: "#18181B",
  muted: "#77736B",
  line: "#D8D3C8",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
  white: "#FFFEFA",
};

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const FONT =
  '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif';

const ramp = (frame: number, start: number, length = 24) =>
  interpolate(frame, [start, start + length], [0, 1], CLAMP);

const settle = (frame: number, fps: number, start: number) =>
  spring({
    frame: Math.max(0, frame - start),
    fps,
    config: { damping: 18, mass: 0.65, stiffness: 100 },
  });

/**
 * A self-contained frame-driven sequence layer.
 * All timing uses the parent scene's local frame; no extra imports are needed.
 */
const Sequence: React.FC<{
  frame: number;
  from: number;
  durationInFrames: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  holdAtEnd?: boolean;
}> = ({
  frame,
  from,
  durationInFrames,
  children,
  style,
  holdAtEnd = false,
}) => {
  const enter = from === 0 ? 1 : ramp(frame, from, 24);
  const leave = holdAtEnd
    ? 1
    : 1 - ramp(frame, from + durationInFrames - 24, 24);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        ...style,
        opacity: Math.min(enter, leave),
      }}
    >
      {children}
    </div>
  );
};

const Reveal: React.FC<{
  frame: number;
  fps: number;
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  distance?: number;
}> = ({ frame, fps, at, children, style, distance = 14 }) => {
  const p = settle(frame, fps, at);

  return (
    <div
      style={{
        ...style,
        opacity: ramp(frame, at, 20),
        transform: `translateY(${(1 - p) * distance}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Words: React.FC<{
  text: string;
  frame: number;
  fps: number;
  at: number;
  stagger?: number;
  established?: boolean;
  style?: React.CSSProperties;
}> = ({
  text,
  frame,
  fps,
  at,
  stagger = 4,
  established = false,
  style,
}) => (
  <span style={style}>
    {text.split(" ").map((word, index) => {
      const cue = at + index * stagger;
      const p = settle(frame, fps, cue);

      return (
        <React.Fragment key={`${index}-${word}`}>
          <span
            style={{
              display: "inline-block",
              opacity: established ? 1 : ramp(frame, cue, 14),
              transform: `translateY(${
                established ? Math.sin(frame * 0.018 + index) * 0.5 : (1 - p) * 12
              }px)`,
            }}
          >
            {word}
          </span>
          {index < text.split(" ").length - 1 ? " " : ""}
        </React.Fragment>
      );
    })}
  </span>
);

const Highlight: React.FC<{
  frame: number;
  at: number;
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ frame, at, children, color = C.yellow, style }) => (
  <span
    style={{
      position: "relative",
      display: "inline-block",
      isolation: "isolate",
      ...style,
    }}
  >
    <span
      style={{
        position: "absolute",
        zIndex: -1,
        left: -5,
        right: -5,
        top: "43%",
        bottom: "3%",
        background: color,
        transformOrigin: "left center",
        transform: `rotate(-1.1deg) scaleX(${ramp(frame, at, 34)})`,
        opacity: 0.95,
      }}
    />
    {children}
  </span>
);

const Marker: React.FC<{
  frame: number;
  at: number;
  width: number;
  height: number;
  style?: React.CSSProperties;
}> = ({ frame, at, width, height, style }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 400 120"
    style={{
      position: "absolute",
      pointerEvents: "none",
      overflow: "visible",
      ...style,
    }}
    aria-hidden
  >
    <path
      d="M361 31 C304 -4 111 -4 42 30 C-14 56 10 107 119 111
         C232 123 387 99 389 60 C391 39 371 20 343 18"
      fill="none"
      stroke={C.red}
      strokeWidth={4}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - ramp(frame, at, 42)}
      opacity={0.9}
    />
  </svg>
);

const Icon: React.FC<{
  type: "pause" | "search" | "choice" | "phone" | "clock" | "speech";
  color?: string;
  size?: number;
}> = ({ type, color = C.ink, size = 38 }) => {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      {type === "pause" && (
        <g {...common}>
          <rect x={14} y={10} width={6} height={28} rx={2} />
          <rect x={28} y={10} width={6} height={28} rx={2} />
        </g>
      )}
      {type === "search" && (
        <g {...common}>
          <circle cx={21} cy={21} r={11} />
          <path d="M29 29 L40 40 M17 21 H25 M21 17 V25" />
        </g>
      )}
      {type === "choice" && (
        <g {...common}>
          <path d="M24 39 V24 C24 16 32 13 39 13 M24 25 C24 17 16 13 9 13" />
          <path d="M33 7 L39 13 L33 19 M15 7 L9 13 L15 19" />
        </g>
      )}
      {type === "phone" && (
        <g {...common}>
          <rect x={13} y={5} width={22} height={38} rx={5} />
          <path d="M20 10 H28 M21 37 H27" />
          <circle cx={24} cy={23} r={5} />
        </g>
      )}
      {type === "clock" && (
        <g {...common}>
          <circle cx={24} cy={24} r={16} />
          <path d="M24 13 V24 L32 29 M11 6 L6 11 M37 6 L42 11" />
        </g>
      )}
      {type === "speech" && (
        <g {...common}>
          <path d="M8 9 H40 V31 H22 L12 40 V31 H8 Z" />
          <path d="M16 18 H32 M16 24 H27" />
        </g>
      )}
    </svg>
  );
};

const Brain: React.FC<{ frame: number }> = ({ frame }) => {
  const anger = ramp(frame, 644, 34);
  const settleDown = ramp(frame, 972, 80);
  const nodes = [
    [103, 125],
    [151, 76],
    [190, 134],
    [235, 62],
    [264, 112],
    [311, 78],
    [345, 139],
    [292, 180],
    [220, 193],
    [149, 187],
    [376, 185],
  ];
  const links = [
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
    [2, 4],
    [2, 8],
    [3, 4],
    [3, 5],
    [4, 5],
    [4, 6],
    [4, 7],
    [5, 6],
    [6, 7],
    [6, 10],
    [7, 8],
    [8, 9],
    [9, 0],
  ];
  const redOpacity = anger * (1 - settleDown * 0.55);

  return (
    <svg
      width={440}
      height={278}
      viewBox="0 0 460 290"
      style={{ overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <clipPath id="scene06-brain-clip">
          <path d="M88 211 C48 201 39 158 57 133 C41 105 62 72 94 68
            C100 36 139 24 163 43 C184 17 224 18 242 43
            C272 22 310 34 321 58 C357 51 391 79 390 108
            C422 122 433 158 412 182 C416 212 390 239 360 235
            C343 259 307 265 283 246 C261 264 230 253 220 235
            C185 253 153 242 146 223 C122 235 100 225 88 211 Z" />
        </clipPath>
      </defs>

      <ellipse cx={234} cy={268} rx={156} ry={9} fill={C.ink} opacity={0.035} />

      <path
        d="M88 211 C48 201 39 158 57 133 C41 105 62 72 94 68
          C100 36 139 24 163 43 C184 17 224 18 242 43
          C272 22 310 34 321 58 C357 51 391 79 390 108
          C422 122 433 158 412 182 C416 212 390 239 360 235
          C343 259 307 265 283 246 C261 264 230 253 220 235
          C185 253 153 242 146 223 C122 235 100 225 88 211 Z"
        fill={C.white}
        stroke={C.ink}
        strokeWidth={2.6}
      />

      <g clipPath="url(#scene06-brain-clip)">
        <ellipse
          cx={285}
          cy={155}
          rx={116 + Math.sin(frame * 0.026) * 5}
          ry={102}
          fill={C.red}
          opacity={redOpacity * 0.13}
        />
        <path
          d="M96 74 C136 87 107 122 136 137
            M165 47 C148 98 203 85 188 130
            M244 46 C210 83 244 101 230 137
            M321 61 C286 94 323 118 299 145
            M386 114 C347 99 334 125 349 155
            M89 205 C115 166 146 186 149 219
            M191 231 C183 180 221 165 233 205
            M284 245 C255 218 273 192 309 195
            M361 233 C342 202 379 190 407 183"
          fill="none"
          stroke={C.line}
          strokeWidth={2}
        />

        {links.map(([a, b], index) => (
          <line
            key={`link-${index}`}
            x1={nodes[a][0]}
            y1={nodes[a][1]}
            x2={nodes[b][0]}
            y2={nodes[b][1]}
            stroke={C.blue}
            strokeWidth={1.5}
            opacity={0.13 + (Math.sin(frame * 0.022 + index) + 1) * 0.07}
          />
        ))}

        {links.slice(0, 9).map(([a, b], index) => {
          const progress = ((frame + index * 37) % 150) / 150;
          const x = nodes[a][0] + (nodes[b][0] - nodes[a][0]) * progress;
          const y = nodes[a][1] + (nodes[b][1] - nodes[a][1]) * progress;

          return (
            <circle
              key={`signal-${index}`}
              cx={x}
              cy={y}
              r={2.7}
              fill={index % 3 === 0 && anger > 0.5 ? C.red : C.blue}
              opacity={Math.sin(progress * Math.PI) * 0.65}
            />
          );
        })}

        {nodes.map(([x, y], index) => (
          <g key={`node-${index}`}>
            <circle
              cx={x}
              cy={y}
              r={9 + Math.sin(frame * 0.025 + index) * 2}
              fill={index > 4 && anger > 0.5 ? C.red : C.blue}
              opacity={0.08}
            />
            <circle
              cx={x}
              cy={y}
              r={3.4}
              fill={index > 4 && anger > 0.5 ? C.red : C.blue}
              opacity={0.7}
            />
          </g>
        ))}

        <rect
          x={40 + ((frame * 0.55) % 400)}
          y={20}
          width={18}
          height={245}
          fill={C.blue}
          opacity={0.025}
          transform="skewX(-12)"
        />
      </g>
    </svg>
  );
};

const InsightCard: React.FC<{
  frame: number;
  fps: number;
  at: number;
  x: number;
  number: string;
  title: string;
  detail: string;
  accent?: string;
}> = ({
  frame,
  fps,
  at,
  x,
  number,
  title,
  detail,
  accent = C.ink,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: 654,
      width: 548,
      height: 178,
      padding: "25px 29px",
      boxSizing: "border-box",
      border: `1px solid ${C.line}`,
      borderRadius: 5,
      background: C.white,
      boxShadow: "0 5px 0 rgba(24,24,27,0.035)",
    }}
  >
    <div
      style={{
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 2,
        color: C.muted,
        marginBottom: 14,
      }}
    >
      {number}
    </div>
    <div style={{ fontSize: 28, fontWeight: 750, lineHeight: 1.2 }}>
      <Highlight frame={frame} at={at + 12}>
        <Words text={title} frame={frame} fps={fps} at={at} />
      </Highlight>
    </div>
    <Reveal
      frame={frame}
      fps={fps}
      at={at + 22}
      distance={8}
      style={{
        marginTop: 13,
        color: accent,
        fontSize: 19,
        lineHeight: 1.4,
      }}
    >
      {detail}
    </Reveal>
  </div>
);

export const Scene_06: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const scale = Math.min(width / 1920, height / 1080);
  const anger = ramp(frame, 644, 30);
  const pause = ramp(frame, 972, 34);
  const finalAct = ramp(frame, 1153, 28);
  const responseReveal = ramp(frame, 512, 42);
  const finalClaim = ramp(frame, 1419, 26);
  const bob = Math.sin(frame * 0.019) * 2.4;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: C.paper,
        fontFamily: FONT,
        color: C.ink,
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
        {/* Background layer: living paper, not a frozen slide. */}
        <Sequence
          frame={frame}
          from={0}
          durationInFrames={1574}
          holdAtEnd
        >
          <svg width={1920} height={1080} aria-hidden>
            <defs>
              <radialGradient id="scene06-paper-glow">
                <stop offset="0%" stopColor={C.yellow} stopOpacity={0.11} />
                <stop offset="100%" stopColor={C.yellow} stopOpacity={0} />
              </radialGradient>
              <pattern
                id="scene06-paper-grid"
                width={48}
                height={48}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M48 0 H0 V48"
                  fill="none"
                  stroke={C.ink}
                  strokeWidth={0.7}
                  opacity={0.032}
                />
              </pattern>
            </defs>
            <rect width={1920} height={1080} fill={C.paper} />
            <rect width={1920} height={900} fill="url(#scene06-paper-grid)" />
            <ellipse
              cx={970 + Math.sin(frame * 0.007) * 95}
              cy={455 + Math.cos(frame * 0.008) * 24}
              rx={730}
              ry={460}
              fill="url(#scene06-paper-glow)"
            />
            {Array.from({ length: 145 }, (_, index) => (
              <circle
                key={index}
                cx={(index * 173 + 31) % 1920}
                cy={(index * 97 + 19) % 1080}
                r={index % 3 === 0 ? 1.1 : 0.7}
                fill={C.ink}
                opacity={0.035}
              />
            ))}
          </svg>
        </Sequence>

        {/* Floating diagram framing remains established from frame zero. */}
        <Sequence
          frame={frame}
          from={0}
          durationInFrames={1574}
          holdAtEnd
        >
          <svg
            width={1920}
            height={900}
            style={{ position: "absolute", inset: 0 }}
            aria-hidden
          >
            <path
              d="M95 335 V316 H114 M1787 316 H1806 V335
                 M95 605 V624 H114 M1787 624 H1806 V605"
              fill="none"
              stroke={C.line}
              strokeWidth={2}
            />
            <path
              d="M560 483 H690 M1190 483 H1354"
              fill="none"
              stroke={C.line}
              strokeWidth={2}
              strokeDasharray="5 7"
            />
            <path
              d="M565 483 H690"
              fill="none"
              stroke={C.blue}
              strokeWidth={3}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - ramp(frame, 40, 60)}
            />
            <path
              d="M680 477 L690 483 L680 489"
              fill="none"
              stroke={C.blue}
              strokeWidth={2.5}
              opacity={ramp(frame, 84, 20)}
            />
            <path
              d="M1190 483 H1354"
              fill="none"
              stroke={C.teal}
              strokeWidth={3}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - responseReveal}
            />
            <path
              d="M1343 476 L1354 483 L1343 490"
              fill="none"
              stroke={C.teal}
              strokeWidth={2.5}
              opacity={responseReveal}
            />
            <circle
              cx={565 + ((frame * 0.65) % 120)}
              cy={483}
              r={3}
              fill={C.blue}
              opacity={0.45 * ramp(frame, 65)}
            />
            <circle
              cx={1195 + ((frame * 0.5) % 151)}
              cy={483}
              r={3}
              fill={C.teal}
              opacity={responseReveal * 0.5}
            />
          </svg>
        </Sequence>

        {/* Main content: one persistent decision model across all three acts. */}
        <Sequence
          frame={frame}
          from={0}
          durationInFrames={1574}
          holdAtEnd
        >
          <div
            style={{
              position: "absolute",
              left: 104,
              top: 73,
              display: "flex",
              alignItems: "center",
              gap: 15,
            }}
          >
            <div
              style={{
                padding: "8px 11px",
                background: C.ink,
                color: C.paper,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 1,
              }}
            >
              06
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 750,
                letterSpacing: 3,
              }}
            >
              PIKIRAN, PERASAAN & PILIHAN
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              right: 110,
              top: 87,
              color: C.muted,
              fontSize: 12,
              letterSpacing: 1.8,
            }}
          >
            MODEL KONSEPTUAL / BUKAN DIAGRAM ANATOMI
          </div>

          <div
            style={{
              position: "absolute",
              left: 104,
              top: 142,
              fontSize: 76,
              fontWeight: 850,
              letterSpacing: -3.7,
              lineHeight: 1.12,
              whiteSpace: "nowrap",
            }}
          >
            <Words
              text="Dorongan"
              frame={frame}
              fps={fps}
              at={0}
              established
            />
            <span
              style={{
                display: "inline-block",
                color: C.red,
                margin: "0 22px",
                transform: `rotate(${-5 + Math.sin(frame * 0.015) * 0.6}deg)`,
              }}
            >
              ≠
            </span>
            <Highlight frame={frame} at={344}>
              <Words text="keputusan" frame={frame} fps={fps} at={15} />
            </Highlight>
          </div>

          <div
            style={{
              position: "absolute",
              top: 254,
              left: 104,
              width: 1702,
              height: 1,
              background: C.line,
            }}
          />

          {[
            { x: 114, n: "01", label: "YANG MUNCUL" },
            { x: 714, n: "02", label: "RUANG UNTUK MEMILIH" },
            { x: 1382, n: "03", label: "YANG KITA LAKUKAN" },
          ].map((item) => (
            <div
              key={item.n}
              style={{
                position: "absolute",
                left: item.x,
                top: 292,
                display: "flex",
                alignItems: "center",
                gap: 13,
                fontSize: 13,
                fontWeight: 750,
                letterSpacing: 2,
              }}
            >
              <span style={{ color: C.muted }}>{item.n}</span>
              <span>{item.label}</span>
            </div>
          ))}

          <div
            style={{
              position: "absolute",
              left: 110,
              top: 338,
              transform: `translateY(${bob}px)`,
            }}
          >
            <Brain frame={frame} />
          </div>

          <div
            style={{
              position: "absolute",
              left: 170,
              top: 598,
              fontSize: 20,
              fontWeight: 650,
            }}
          >
            <span style={{ opacity: 1 - anger }}>
              Pikiran & perasaan
            </span>
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                color: finalAct > 0.5 ? C.blue : C.red,
                opacity: anger,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ opacity: 1 - finalAct }}>Rasa marah muncul</span>
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  opacity: finalAct,
                }}
              >
                Dorongan muncul
              </span>
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              left: 710,
              top: 369,
              width: 460,
              height: 232,
              boxSizing: "border-box",
              border: `1.5px solid ${C.ink}`,
              borderRadius: 9,
              background: C.white,
              boxShadow: "7px 8px 0 rgba(24,24,27,0.05)",
              transform: `translateY(${Math.sin(frame * 0.017 + 1) * 1.7}px)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 27,
                top: 23,
                fontSize: 12,
                letterSpacing: 2,
                fontWeight: 800,
                color: C.muted,
              }}
            >
              BUKAN AUTOPILOT
            </div>

            <div
              style={{
                position: "absolute",
                left: 28,
                top: 62,
                fontSize: 61,
                fontWeight: 800,
                letterSpacing: -2.8,
                opacity: 1 - pause,
              }}
            >
              Perhatian
            </div>

            <div
              style={{
                position: "absolute",
                left: 29,
                top: 61,
                display: "flex",
                alignItems: "center",
                gap: 15,
                opacity: pause,
                transform: `translateY(${(1 - settle(frame, fps, 972)) * 10}px)`,
              }}
            >
              <Icon type="pause" color={C.teal} size={47} />
              <Highlight frame={frame} at={981}>
                <span
                  style={{
                    fontSize: 69,
                    fontWeight: 800,
                    letterSpacing: -3,
                  }}
                >
                  Jeda
                </span>
              </Highlight>
            </div>

            <Reveal
              frame={frame}
              fps={fps}
              at={512}
              style={{
                position: "absolute",
                left: 29,
                top: 156,
                fontSize: 18,
                color: C.teal,
                fontWeight: 650,
              }}
            >
              Mengamati sebelum bertindak
            </Reveal>

            <div
              style={{
                position: "absolute",
                left: 29,
                right: 29,
                bottom: 20,
                height: 3,
                background: "#ECE8DF",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${ramp(frame, 512, 120) * 100}%`,
                  height: "100%",
                  background: C.teal,
                  opacity: 0.55 + Math.sin(frame * 0.025) * 0.12,
                }}
              />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 1380,
              top: 369,
              width: 420,
              height: 232,
              borderRadius: 9,
              border: `1.5px solid ${C.line}`,
              background: C.white,
              boxSizing: "border-box",
              padding: "24px 29px",
              transform: `translateY(${Math.sin(frame * 0.017 + 2) * 1.7}px)`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                letterSpacing: 2,
                fontWeight: 800,
                color: C.muted,
              }}
            >
              TINDAKAN
            </div>
            <div
              style={{
                marginTop: 26,
                fontSize: 61,
                fontWeight: 800,
                letterSpacing: -2.8,
              }}
            >
              <Highlight frame={frame} at={530}>Respons</Highlight>
            </div>

            <Reveal
              frame={frame}
              fps={fps}
              at={512}
              style={{
                marginTop: 16,
                fontSize: 21,
                color: C.teal,
                fontWeight: 650,
              }}
            >
              <Words
                text="Bisa kita latih."
                frame={frame}
                fps={fps}
                at={520}
                stagger={5}
              />
            </Reveal>
            <Marker
              frame={frame}
              at={1419}
              width={355}
              height={107}
              style={{ left: 12, top: 114 }}
            />
          </div>

          {/* Act I — influence is not absolute control. */}
          <Sequence frame={frame} from={0} durationInFrames={548}>
            <InsightCard
              frame={frame}
              fps={fps}
              at={15}
              x={104}
              number="PENGARUH"
              title="Tidak selalu disadari"
              detail="Ada faktor di balik pikiran dan perasaan."
              accent={C.blue}
            />
            <InsightCard
              frame={frame}
              fps={fps}
              at={201}
              x={680}
              number="BUKAN KESIMPULANNYA"
              title="Kita bukan robot"
              detail="Pengaruh bukan berarti kendali mutlak."
            />
            <InsightCard
              frame={frame}
              fps={fps}
              at={392}
              x={1256}
              number="BATAS AWAL"
              title="Pikiran bisa muncul"
              detail="Tidak semua kemunculan bisa kita pilih."
            />
            <Marker
              frame={frame}
              at={240}
              width={335}
              height={81}
              style={{ left: 696, top: 697 }}
            />
          </Sequence>

          {/* Act II — the same model, now tested against anger. */}
          <Sequence frame={frame} from={510} durationInFrames={690}>
            <div
              style={{
                position: "absolute",
                left: 104,
                top: 654,
                width: 1702,
                height: 178,
                border: `1px solid ${C.line}`,
                borderRadius: 5,
                background: C.white,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 25,
                  top: 20,
                  fontSize: 12,
                  letterSpacing: 2,
                  color: C.muted,
                  fontWeight: 800,
                }}
              >
                LATIHAN RESPONS
              </div>

              {[
                {
                  x: 28,
                  icon: "pause" as const,
                  title: "Berhenti sejenak",
                  detail: "Beri jarak sebelum bereaksi.",
                  cue: 972,
                  number: "1",
                },
                {
                  x: 592,
                  icon: "search" as const,
                  title: "Pahami pemicunya",
                  detail: "Apa yang membuatmu marah?",
                  cue: 1030,
                  number: "2",
                },
                {
                  x: 1156,
                  icon: "choice" as const,
                  title: "Pilih tindakan",
                  detail: "Putuskan respons berikutnya.",
                  cue: 1090,
                  number: "3",
                },
              ].map((step, index) => {
                const active = ramp(frame, step.cue, 25);

                return (
                  <div
                    key={step.number}
                    style={{
                      position: "absolute",
                      left: step.x,
                      top: 59,
                      width: 500,
                      height: 95,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 2,
                        width: 53,
                        height: 53,
                        borderRadius: "50%",
                        background: "#EEEAE2",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 2,
                        width: 53,
                        height: 53,
                        borderRadius: "50%",
                        background: C.yellow,
                        opacity: active,
                        transform: `scale(${0.9 + active * 0.1})`,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 8,
                        top: 10,
                        opacity: 0.35 + active * 0.65,
                      }}
                    >
                      <Icon type={step.icon} size={37} />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        left: 71,
                        top: 3,
                        fontSize: 25,
                        fontWeight: 750,
                        color: C.ink,
                        opacity: 0.4 + active * 0.6,
                      }}
                    >
                      {step.title}
                    </div>
                    <Reveal
                      frame={frame}
                      fps={fps}
                      at={step.cue + 7}
                      distance={7}
                      style={{
                        position: "absolute",
                        left: 71,
                        top: 43,
                        fontSize: 18,
                        color: C.teal,
                      }}
                    >
                      {step.detail}
                    </Reveal>
                    {index < 2 && (
                      <svg
                        width={42}
                        height={20}
                        style={{ position: "absolute", left: 497, top: 22 }}
                        aria-hidden
                      >
                        <path
                          d="M2 10 H36 M29 3 L36 10 L29 17"
                          stroke={C.line}
                          strokeWidth={2}
                          fill="none"
                        />
                        <path
                          d="M2 10 H36 M29 3 L36 10 L29 17"
                          stroke={C.teal}
                          strokeWidth={2}
                          fill="none"
                          pathLength={1}
                          strokeDasharray={1}
                          strokeDashoffset={1 - ramp(frame, step.cue + 20, 30)}
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>

            <Reveal
              frame={frame}
              fps={fps}
              at={644}
              distance={10}
              style={{
                position: "absolute",
                left: 127,
                top: 342,
                padding: "9px 14px",
                border: `1px solid ${C.red}`,
                borderRadius: 30,
                background: C.white,
                color: C.red,
                fontSize: 16,
                fontWeight: 750,
              }}
            >
              CONTOH: MARAH
            </Reveal>

            <Reveal
              frame={frame}
              fps={fps}
              at={726}
              style={{
                position: "absolute",
                left: 395,
                top: 338,
                width: 251,
                fontSize: 16,
                color: C.muted,
                lineHeight: 1.45,
              }}
            >
              <Words
                text="Detik pertama tidak selalu bisa dicegah."
                frame={frame}
                fps={fps}
                at={726}
                stagger={3}
              />
            </Reveal>

            <Reveal
              frame={frame}
              fps={fps}
              at={830}
              style={{
                position: "absolute",
                left: 1397,
                top: 611,
                fontSize: 19,
                fontWeight: 700,
                color: C.teal,
              }}
            >
              <Highlight frame={frame} at={848}>
                Tidak langsung membentak
              </Highlight>
            </Reveal>
          </Sequence>

          {/* Act III — transfer the skill to everyday impulses. */}
          <Sequence
            frame={frame}
            from={1153}
            durationInFrames={421}
            holdAtEnd
          >
            {[
              {
                x: 104,
                icon: "phone" as const,
                title: "Membuka HP",
                detail: "Dorongan untuk segera mengecek.",
                at: 1153,
              },
              {
                x: 680,
                icon: "clock" as const,
                title: "Menunda pekerjaan",
                detail: "Dorongan untuk menghindari tugas.",
                at: 1235,
              },
              {
                x: 1256,
                icon: "speech" as const,
                title: "Bicara spontan",
                detail: "Kata-kata yang bisa kita sesali.",
                at: 1315,
              },
            ].map((item, index) => (
              <div
                key={item.title}
                style={{
                  position: "absolute",
                  left: item.x,
                  top: 654,
                  width: 548,
                  height: 151,
                  boxSizing: "border-box",
                  padding: "24px 26px",
                  border: `1px solid ${C.line}`,
                  borderRadius: 5,
                  background: C.white,
                  transform: `translateY(${
                    Math.sin(frame * 0.016 + index * 1.2) * 1.3
                  }px)`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 25,
                    top: 28,
                    width: 55,
                    height: 55,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    background: "#EEEBE4",
                  }}
                >
                  <Icon type={item.icon} color={C.blue} size={34} />
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: 97,
                    top: 28,
                    fontSize: 27,
                    fontWeight: 750,
                  }}
                >
                  <Highlight frame={frame} at={item.at + 18}>
                    <Words
                      text={item.title}
                      frame={frame}
                      fps={fps}
                      at={item.at}
                    />
                  </Highlight>
                </div>

                <Reveal
                  frame={frame}
                  fps={fps}
                  at={item.at + 22}
                  distance={8}
                  style={{
                    position: "absolute",
                    left: 97,
                    top: 76,
                    fontSize: 18,
                    lineHeight: 1.4,
                    color: C.muted,
                    maxWidth: 410,
                  }}
                >
                  {item.detail}
                </Reveal>
              </div>
            ))}

            <Reveal
              frame={frame}
              fps={fps}
              at={1153}
              style={{
                position: "absolute",
                left: 745,
                top: 612,
                fontSize: 18,
                color: C.teal,
                fontWeight: 650,
              }}
            >
              Prinsip yang sama, situasi berbeda.
            </Reveal>

            <div
              style={{
                position: "absolute",
                left: 104,
                top: 826,
                width: 1702,
                height: 61,
                borderTop: `1px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 13,
                opacity: finalClaim,
                transform: `translateY(${
                  (1 - settle(frame, fps, 1419)) * 12
                }px)`,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: C.teal,
                  opacity: 0.75 + Math.sin(frame * 0.035) * 0.2,
                }}
              />
              <div style={{ fontSize: 28, fontWeight: 750 }}>
                <Words
                  text="Dorongan boleh muncul."
                  frame={frame}
                  fps={fps}
                  at={1419}
                  stagger={5}
                />{" "}
                <Highlight frame={frame} at={1441}>
                  <Words
                    text="Tidak harus diikuti."
                    frame={frame}
                    fps={fps}
                    at={1438}
                    stagger={5}
                  />
                </Highlight>
              </div>
            </div>
          </Sequence>
        </Sequence>

        {/* Editorial overlay: influence ≠ loss of agency. */}
        <Sequence
          frame={frame}
          from={0}
          durationInFrames={1574}
          holdAtEnd
        >
          <Reveal
            frame={frame}
            fps={fps}
            at={201}
            distance={8}
            style={{
              position: "absolute",
              right: 116,
              top: 170,
              padding: "12px 19px",
              borderRadius: 40,
              border: `1px solid ${C.ink}`,
              background: C.white,
              fontSize: 16,
              fontWeight: 750,
              letterSpacing: 0.3,
            }}
          >
            PENGARUH ≠ KENDALI MUTLAK
          </Reveal>

          <svg
            width={440}
            height={22}
            style={{
              position: "absolute",
              left: 736,
              top: 233,
              overflow: "visible",
            }}
            aria-hidden
          >
            <path
              d="M4 9 C123 3 277 7 427 4 M18 15 C161 12 282 14 412 11"
              fill="none"
              stroke={C.red}
              strokeWidth={2.8}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - ramp(frame, 344, 40)}
              opacity={0.78}
            />
          </svg>
        </Sequence>

        {/* Y >= 900 intentionally contains background only. */}
      </div>
    </div>
  );
};