import React from "react";
import {
  interpolate,
  spring,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  paper: "#F5F2EB",
  ink: "#18181B",
  muted: "#77746D",
  line: "#D6D1C6",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
  white: "#FFFD F8".replace(" ", ""),
};

const FONT = 'Arial, Helvetica, sans-serif';
const MONO = '"Courier New", monospace';
const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const range = (
  frame: number,
  start: number,
  end: number,
  from = 0,
  to = 1,
) => interpolate(frame, [start, Math.max(start + 0.001, end)], [from, to], CLAMP);

const enter = (frame: number, cue: number, fps: number) =>
  spring({
    frame: Math.max(0, frame - cue),
    fps,
    config: { damping: 19, stiffness: 105, mass: 0.85 },
  });

const appear = (
  frame: number,
  cue: number,
  fps: number,
  distance = 24,
): React.CSSProperties => ({
  opacity: range(frame, cue, cue + 12),
  transform: `translateY(${(1 - enter(frame, cue, fps)) * distance}px)`,
});

const Kinetic: React.FC<{
  text: string;
  frame: number;
  cue: number;
  end: number;
  fps: number;
  size?: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  frame,
  cue,
  end,
  fps,
  size = 44,
  color = C.ink,
  weight = 700,
  style,
}) => {
  const words = text.split(" ");
  const spread = Math.max(0, Math.min((end - cue) * 0.65, words.length * 5));

  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.13,
        letterSpacing: "-0.035em",
        ...style,
      }}
    >
      {words.map((word, index) => {
        const delay =
          cue + (words.length > 1 ? (index / (words.length - 1)) * spread : 0);
        const p = enter(frame, delay, fps);
        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: "inline-block",
              marginRight: "0.24em",
              opacity: range(frame, delay, delay + Math.min(8, (end - cue) / 3)),
              transform: `translateY(${(1 - p) * 18}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const Label: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: "0.11em",
      textTransform: "uppercase",
      color: C.muted,
      ...style,
    }}
  >
    {children}
  </div>
);

const Paper: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", inset: 0, background: C.paper }}>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <pattern
          id="s09-paper-dots"
          width="26"
          height="26"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="3" cy="3" r="0.65" fill={C.ink} opacity="0.12" />
        </pattern>
        <radialGradient id="s09-warm-glow">
          <stop offset="0" stopColor={C.yellow} stopOpacity="0.13" />
          <stop offset="1" stopColor={C.yellow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#s09-paper-dots)" />
      <ellipse
        cx={1120 + Math.sin(frame / 180) * 140}
        cy={470 + Math.cos(frame / 230) * 70}
        rx="680"
        ry="550"
        fill="url(#s09-warm-glow)"
      />
      <path d="M72 98H1848 M72 1005H1848" stroke={C.line} />
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${72 + i * 592} 91v14`}
          stroke={C.muted}
          strokeWidth="1"
        />
      ))}
    </svg>
  </div>
);

const neuralNodes = [
  [163, 149],
  [235, 101],
  [305, 135],
  [361, 95],
  [423, 152],
  [130, 221],
  [221, 205],
  [293, 233],
  [381, 206],
  [455, 240],
  [170, 292],
  [248, 309],
  [338, 294],
  [416, 323],
  [286, 370],
];
const neuralEdges = [
  [0, 1],
  [0, 5],
  [0, 6],
  [1, 2],
  [2, 3],
  [2, 6],
  [2, 7],
  [3, 4],
  [4, 8],
  [4, 9],
  [5, 6],
  [5, 10],
  [6, 7],
  [6, 11],
  [7, 8],
  [7, 12],
  [8, 9],
  [8, 12],
  [9, 13],
  [10, 11],
  [11, 12],
  [11, 14],
  [12, 13],
  [12, 14],
];

const Brain: React.FC<{
  frame: number;
  activation: number;
  accent?: string;
  style?: React.CSSProperties;
}> = ({ frame, activation, accent = C.blue, style }) => (
  <svg viewBox="0 0 580 450" style={style}>
    <path
      d="M283 49C246 22 203 39 186 69C135 52 94 94 98 139
      C53 163 49 216 83 245C60 291 92 337 137 339
      C153 381 197 397 234 380C262 415 306 412 333 381
      C376 410 423 389 438 354C489 356 524 315 508 271
      C545 235 529 183 492 165C502 116 460 75 420 80
      C391 40 347 35 314 59C304 47 292 45 283 49Z"
      fill={C.white}
      stroke={C.ink}
      strokeWidth="4"
    />
    <path
      d="M289 65C277 106 307 134 286 168C262 205 304 227 284 265
      C266 300 303 333 284 391
      M187 82C157 117 193 130 169 164
      M111 160C143 147 166 181 150 202
      M104 258C150 232 174 257 178 293
      M193 350C195 319 221 304 242 324
      M327 91C348 125 389 101 411 132
      M427 164C395 151 372 177 389 202
      M475 236C436 218 419 247 435 278
      M365 345C337 327 345 299 372 284"
      fill="none"
      stroke={C.line}
      strokeWidth="4"
      strokeLinecap="round"
    />
    {neuralEdges.map(([a, b], index) => {
      const [x1, y1] = neuralNodes[a];
      const [x2, y2] = neuralNodes[b];
      const pulse = (Math.sin(frame / 17 - index * 0.72) + 1) / 2;
      const t = ((frame + index * 13) % 95) / 95;
      return (
        <g key={index} opacity={activation}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={accent}
            strokeWidth={1.2 + pulse * 1.3}
            opacity={0.15 + pulse * 0.45}
          />
          <circle
            cx={x1 + (x2 - x1) * t}
            cy={y1 + (y2 - y1) * t}
            r="3.6"
            fill={accent}
            opacity={0.8}
          />
        </g>
      );
    })}
    {neuralNodes.map(([x, y], i) => (
      <g key={i}>
        <circle
          cx={x}
          cy={y}
          r={8 + Math.sin(frame / 20 + i) * 2}
          fill={accent}
          opacity={activation * 0.1}
        />
        <circle
          cx={x}
          cy={y}
          r="4"
          fill={accent}
          opacity={0.2 + activation * 0.8}
        />
      </g>
    ))}
  </svg>
);

const Marker: React.FC<{
  progress: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ progress, color = C.red, style }) => (
  <svg viewBox="0 0 440 120" style={style}>
    <path
      d="M408 61C416 12 290 2 160 14C56 22 15 44 24 73
      C34 108 179 116 311 99C391 89 429 64 404 40"
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeLinecap="round"
      pathLength="1"
      strokeDasharray="1"
      strokeDashoffset={1 - progress}
    />
  </svg>
);

const Perception: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const output = range(frame, 276, 315);
  const sceneExit = range(frame, 532, 547, 1, 0);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: sceneExit }}>
      <div style={{ position: "absolute", left: 96, top: 145 }}>
        <Kinetic
          text="Padahal,"
          frame={frame}
          cue={13}
          end={27}
          fps={fps}
          size={72}
        />
        <div style={{ position: "relative", marginTop: 8 }}>
          <div
            style={{
              position: "absolute",
              left: -8,
              top: 7,
              height: 64,
              width: 390 * range(frame, 46, 72),
              background: C.yellow,
              transform: "rotate(-1.5deg)",
            }}
          />
          <Kinetic
            text="belum tentu."
            frame={frame}
            cue={46}
            end={72}
            fps={fps}
            size={68}
            style={{ position: "relative" }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 610,
          top: 272,
          width: 660,
          ...appear(frame, 80, fps),
        }}
      >
        <Brain
          frame={frame}
          activation={range(frame, 80, 151)}
          style={{ width: "100%", height: 505 }}
        />
        {frame >= 80 && (
          <Label style={{ textAlign: "center", marginTop: -10 }}>
            Otak / model prediktif
          </Label>
        )}
      </div>

      <svg
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }}
      >
        {frame >= 80 && (
          <path
            d="M470 478H550Q584 478 614 497"
            fill="none"
            stroke={C.blue}
            strokeWidth="3"
            strokeDasharray="7 8"
            opacity={range(frame, 80, 151)}
          />
        )}
        {frame >= 172 && (
          <path
            d="M470 727H547Q586 727 645 649"
            fill="none"
            stroke={C.teal}
            strokeWidth="3"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - range(frame, 172, 233)}
          />
        )}
        <path
          d="M1230 507H1329"
          stroke={C.ink}
          strokeWidth="3"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - output}
        />
        <path
          d="M1314 499l15 8-15 8"
          fill="none"
          stroke={C.ink}
          strokeWidth="3"
          opacity={output}
        />
      </svg>

      {frame >= 80 && (
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 390,
            width: 370,
            ...appear(frame, 80, fps),
          }}
        >
          <Label style={{ color: C.blue }}>01 / Masukan</Label>
          <Kinetic
            text="Informasi terbatas"
            frame={frame}
            cue={80}
            end={151}
            fps={fps}
            size={38}
            style={{ marginTop: 15 }}
          />
          <svg width="340" height="100" viewBox="0 0 340 100">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect
                key={i}
                x={i * 41 + 2}
                y={22 + (i % 3) * 7}
                width="26"
                height={49 - (i % 3) * 9}
                rx="2"
                fill={i === 2 || i === 5 ? "none" : C.blue}
                stroke={C.blue}
                strokeDasharray={i === 2 || i === 5 ? "4 4" : undefined}
                opacity={range(frame, 85 + i * 7, 100 + i * 7)}
              />
            ))}
          </svg>
        </div>
      )}

      {frame >= 172 && (
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 638,
            width: 375,
            ...appear(frame, 172, fps),
          }}
        >
          <Label style={{ color: C.teal }}>02 / Konteks</Label>
          <Kinetic
            text="Pengalaman masa lalu"
            frame={frame}
            cue={172}
            end={233}
            fps={fps}
            size={38}
            style={{ marginTop: 15 }}
          />
          <div style={{ display: "flex", gap: 9, marginTop: 24 }}>
            {["A", "B", "C"].map((letter, i) => (
              <div
                key={letter}
                style={{
                  width: 90,
                  height: 65,
                  background: C.white,
                  border: `1px solid ${C.teal}`,
                  transform: `rotate(${i * 3 - 3}deg)`,
                  opacity: range(frame, 175 + i * 12, 195 + i * 12),
                  padding: "12px 13px",
                  boxSizing: "border-box",
                  fontFamily: MONO,
                  color: C.teal,
                  fontSize: 15,
                }}
              >
                {letter}
                <div
                  style={{
                    height: 3,
                    width: 52,
                    background: C.line,
                    marginTop: 12,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {frame >= 242 && (
        <div
          style={{
            position: "absolute",
            left: 758,
            top: 275,
            padding: "10px 20px",
            background: C.yellow,
            transform: `rotate(-3deg) scale(${0.9 + enter(frame, 242, fps) * 0.1})`,
            opacity: range(frame, 242, 250),
          }}
        >
          <Kinetic
            text="PREDIKSI"
            frame={frame}
            cue={242}
            end={262}
            fps={fps}
            size={26}
          />
        </div>
      )}

      {frame >= 276 && (
        <div
          style={{
            position: "absolute",
            left: 1360,
            top: 318,
            width: 450,
            ...appear(frame, 276, fps),
          }}
        >
          <Label>03 / Hasil konstruksi</Label>
          <Kinetic
            text="Versi dunia"
            frame={frame}
            cue={276}
            end={325}
            fps={fps}
            size={44}
            style={{ marginTop: 14 }}
          />
          <svg
            viewBox="0 0 430 260"
            style={{ width: 430, height: 260, marginTop: 24 }}
          >
            <rect
              x="3"
              y="3"
              width="424"
              height="254"
              fill={C.white}
              stroke={C.ink}
              strokeWidth="2"
            />
            <path
              d="M3 3L121 72H310L427 3M121 72V179L3 257
              M310 72V179L427 257M121 179H310"
              fill="none"
              stroke={C.line}
              strokeWidth="2"
            />
            <path
              d="M160 179V126L226 111L278 130V179M160 126L214 145L278 130
              M214 145V197L278 179M160 179L214 197"
              fill={C.yellow}
              fillOpacity={range(frame, 296, 325)}
              stroke={C.ink}
              strokeWidth="2"
              opacity={range(frame, 276, 325)}
            />
            <circle
              cx="215"
              cy="130"
              r="90"
              fill="none"
              stroke={C.blue}
              strokeWidth="1"
              strokeDasharray="3 8"
              opacity={0.25}
              transform={`rotate(${frame * 0.12} 215 130)`}
            />
          </svg>
          <Kinetic
            text="Menurut otak,"
            frame={frame}
            cue={328}
            end={374}
            fps={fps}
            size={28}
            weight={400}
            style={{ marginTop: 18 }}
          />
          <div style={{ position: "relative", marginTop: 8 }}>
            <Kinetic
              text="paling masuk akal."
              frame={frame}
              cue={374}
              end={418}
              fps={fps}
              size={31}
            />
            <Marker
              progress={range(frame, 384, 418)}
              style={{
                position: "absolute",
                left: -23,
                top: -26,
                width: 385,
                height: 105,
              }}
            />
          </div>
        </div>
      )}

      {frame >= 420 && (
        <div
          style={{
            position: "absolute",
            left: 615,
            top: 826,
            width: 690,
            textAlign: "center",
          }}
        >
          <Kinetic
            text="Dan versi itulah"
            frame={frame}
            cue={420}
            end={447}
            fps={fps}
            size={29}
            weight={400}
          />
          <Kinetic
            text="yang kita rasakan sebagai"
            frame={frame}
            cue={447}
            end={498}
            fps={fps}
            size={29}
            weight={400}
            style={{ marginTop: 8 }}
          />
          <div
            style={{
              display: "inline-block",
              position: "relative",
              marginTop: 9,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "5px -14px 0",
                background: C.yellow,
                transform: `scaleX(${range(frame, 523, 540)})`,
                transformOrigin: "left",
              }}
            />
            <Kinetic
              text="KENYATAAN."
              frame={frame}
              cue={523}
              end={543}
              fps={fps}
              size={49}
              style={{ position: "relative" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const cases = [
  {
    cue: 547,
    end: 615,
    answer: 623,
    answerEnd: 663,
    title: "Salah mengenali orang",
    result: "Otak sedang melakukan prediksi.",
    tag: "PREDIKSI",
    color: C.blue,
  },
  {
    cue: 687,
    end: 742,
    answer: 762,
    answerEnd: 808,
    title: "Merasa pernah mengalami",
    result: "Otak sedang menghubungkan pola.",
    tag: "POLA",
    color: C.teal,
  },
  {
    cue: 819,
    end: 879,
    answer: 899,
    answerEnd: 940,
    title: "Lupa bacaan barusan",
    result: "Perhatian mungkin tidak cukup dalam.",
    tag: "PERHATIAN",
    color: C.red,
  },
  {
    cue: 961,
    end: 993,
    answer: 1009,
    answerEnd: 1052,
    title: "Waktu terasa cepat",
    result: "Otak sedang menilai pengalamanmu.",
    tag: "PENGALAMAN",
    color: C.blue,
  },
  {
    cue: 1063,
    end: 1140,
    answer: 1158,
    answerEnd: 1236,
    title: "Yakin terhadap ingatan",
    result: "Belum tentu rekaman sempurna.",
    tag: "REKONSTRUKSI",
    color: C.red,
  },
];

const Person: React.FC<{
  x: number;
  y: number;
  color: string;
  dashed?: boolean;
}> = ({ x, y, color, dashed }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle
      cx="0"
      cy="-45"
      r="37"
      fill={C.paper}
      stroke={color}
      strokeWidth="3"
      strokeDasharray={dashed ? "5 6" : undefined}
    />
    <path
      d="M-66 83V45C-66-11 66-11 66 45V83Z"
      fill={C.paper}
      stroke={color}
      strokeWidth="3"
      strokeDasharray={dashed ? "5 6" : undefined}
    />
    <path
      d="M-13-47h2m23 0h2M-12-28q12 9 24 0"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </g>
);

const CaseGraphic: React.FC<{
  index: number;
  frame: number;
  cue: number;
  answer: number;
}> = ({ index, frame, cue, answer }) => {
  const p = range(frame, answer, answer + 35);
  const a = range(frame, cue, cue + 35);
  const commonText: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 17,
    letterSpacing: 1.4,
    fill: C.muted,
  };

  return (
    <svg viewBox="0 0 850 410" style={{ width: 850, height: 410 }}>
      {index === 0 && (
        <g opacity={a}>
          <rect
            x="57"
            y="34"
            width="288"
            height="299"
            fill={C.paper}
            stroke={C.line}
          />
          <rect
            x="505"
            y="34"
            width="288"
            height="299"
            fill={C.paper}
            stroke={C.line}
          />
          <Person x={201} y={171} color={C.ink} />
          <Person x={649} y={171} color={C.blue} dashed />
          <text x="201" y="305" textAnchor="middle" style={commonText}>
            YANG DILIHAT
          </text>
          <text x="649" y="305" textAnchor="middle" style={commonText}>
            YANG DIDUGA
          </text>
          <path
            d="M359 174H490m-15-9 15 9-15 9"
            stroke={C.blue}
            strokeWidth="3"
            fill="none"
            opacity={p}
          />
          <g opacity={p}>
            <rect x="335" y="210" width="180" height="41" fill={C.yellow} />
            <text
              x="425"
              y="237"
              textAnchor="middle"
              style={{ ...commonText, fill: C.ink, fontWeight: 700 }}
            >
              PREDIKSI
            </text>
          </g>
          <path
            d="M577 67C639 45 716 66 728 133"
            stroke={C.red}
            strokeWidth="4"
            fill="none"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - p}
          />
        </g>
      )}

      {index === 1 && (
        <g opacity={a}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${85 + i * 247} 65)`}>
              <rect
                width="190"
                height="210"
                rx="2"
                fill={C.paper}
                stroke={C.line}
                strokeWidth="2"
              />
              <path
                d="M30 160L95 55L159 160Z"
                fill="none"
                stroke={i === 2 ? C.teal : C.ink}
                strokeWidth="3"
              />
              <circle
                cx="95"
                cy="130"
                r="23"
                fill={i === 2 ? C.teal : C.yellow}
                opacity={0.7}
              />
              <text
                x="95"
                y="244"
                textAnchor="middle"
                style={commonText}
              >
                {["DULU", "SEKARANG", "TERASA FAMILIAR"][i]}
              </text>
            </g>
          ))}
          <path
            d="M180 65V25H674V65"
            fill="none"
            stroke={C.teal}
            strokeWidth="3"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - p}
          />
          <g opacity={p}>
            <circle cx="427" cy="25" r="7" fill={C.teal} />
            <path
              d="M295 170H320M542 170H565"
              stroke={C.teal}
              strokeWidth="3"
            />
            <text
              x="425"
              y="378"
              textAnchor="middle"
              style={{ ...commonText, fill: C.teal }}
            >
              POLA SERUPA → RASA FAMILIAR
            </text>
          </g>
        </g>
      )}

      {index === 2 && (
        <g opacity={a}>
          <g transform="translate(92 24) rotate(-2 205 163)">
            <rect
              width="412"
              height="326"
              fill={C.paper}
              stroke={C.line}
              strokeWidth="2"
            />
            <text x="29" y="39" style={commonText}>
              CATATAN / HALAMAN 09
            </text>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <g key={i}>
                {i === 2 && (
                  <rect
                    x="28"
                    y={66 + i * 31}
                    width={320 * p}
                    height="18"
                    fill={C.yellow}
                  />
                )}
                <path
                  d={`M30 ${77 + i * 31}H${i % 2 ? 341 : 376}`}
                  stroke={C.ink}
                  strokeWidth="3"
                  opacity={i < 3 ? 0.6 : 0.15 + (1 - p) * 0.45}
                />
              </g>
            ))}
          </g>
          <g transform="translate(670 178)">
            <circle r="106" fill="none" stroke={C.line} strokeWidth="2" />
            <circle r="71" fill="none" stroke={C.line} />
            <circle r="32" fill="none" stroke={C.line} />
            <path d="M-115 0H115M0-115V115" stroke={C.line} />
            <g transform={`rotate(${(frame - cue) * 0.45})`}>
              <path
                d="M0 0L97-40A105 105 0 0 1 105 0Z"
                fill={C.red}
                opacity="0.13"
              />
              <path d="M0 0L105 0" stroke={C.red} strokeWidth="2" />
            </g>
            <circle cx="34" cy="-21" r="6" fill={C.red} opacity={1 - p * 0.75} />
            <text
              x="0"
              y="156"
              textAnchor="middle"
              style={{ ...commonText, fill: C.red }}
            >
              KEDALAMAN PERHATIAN
            </text>
          </g>
        </g>
      )}

      {index === 3 && (
        <g opacity={a}>
          <g transform="translate(216 175)">
            <circle r="130" fill={C.paper} stroke={C.ink} strokeWidth="3" />
            {Array.from({ length: 12 }, (_, i) => (
              <path
                key={i}
                d="M0-110V-99"
                stroke={C.ink}
                strokeWidth="2"
                transform={`rotate(${i * 30})`}
              />
            ))}
            <path
              d="M0 0V-86"
              stroke={C.blue}
              strokeWidth="4"
              strokeLinecap="round"
              transform={`rotate(${(frame - cue) * 0.6})`}
            />
            <path
              d="M0 0L-48-24"
              stroke={C.ink}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle r="7" fill={C.ink} />
            <text x="0" y="173" textAnchor="middle" style={commonText}>
              WAKTU YANG DIRASAKAN
            </text>
          </g>
          <g transform="translate(438 79)" opacity={p}>
            <text x="0" y="0" style={commonText}>
              JEJAK PENGALAMAN
            </text>
            <path d="M0 93H340" stroke={C.line} strokeWidth="2" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <g key={i}>
                <rect
                  x={i * 49}
                  y={93 - [53, 91, 36, 73, 111, 46, 83][i]}
                  width="25"
                  height={[53, 91, 36, 73, 111, 46, 83][i]}
                  fill={i === 4 ? C.yellow : C.blue}
                  opacity={range(frame, answer + i * 3, answer + 20 + i * 3)}
                />
                <circle cx={i * 49 + 12} cy="93" r="4" fill={C.ink} />
              </g>
            ))}
            <path d="M0 127H340" stroke={C.line} strokeDasharray="4 6" />
            <text
              x="0"
              y="205"
              style={{ ...commonText, fill: C.blue, fontSize: 16 }}
            >
              MENILAI, BUKAN SEKADAR MENGHITUNG
            </text>
          </g>
        </g>
      )}

      {index === 4 && (
        <g opacity={a}>
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${67 + i * 451} 48)`}>
              <rect
                width="265"
                height="250"
                fill={C.paper}
                stroke={C.ink}
                strokeWidth="2"
              />
              <path
                d="M0 187L68 132L120 161L175 86L265 187Z"
                fill={i === 0 ? "#DBD7CF" : "#C9D8F4"}
                stroke={C.ink}
                strokeWidth="2"
              />
              <circle
                cx={i === 0 ? 72 : 181}
                cy="63"
                r="23"
                fill={i === 0 ? C.yellow : C.paper}
                stroke={C.ink}
                strokeWidth="2"
              />
              {i === 1 && (
                <g opacity={p}>
                  <path
                    d="M96 0L133 58L109 115L150 181L132 250"
                    stroke={C.red}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="8 5"
                  />
                  <rect
                    x="180"
                    y="116"
                    width="63"
                    height="32"
                    fill={C.paper}
                    stroke={C.red}
                    strokeDasharray="4 4"
                  />
                </g>
              )}
              <text
                x="132"
                y="289"
                textAnchor="middle"
                style={commonText}
              >
                {i === 0 ? "PERISTIWA" : "INGATAN"}
              </text>
            </g>
          ))}
          <path
            d="M355 171H495m-15-9 15 9-15 9"
            stroke={C.ink}
            strokeWidth="2"
            fill="none"
          />
          <g opacity={p}>
            <rect x="326" y="205" width="200" height="40" fill={C.yellow} />
            <text
              x="426"
              y="231"
              textAnchor="middle"
              style={{ ...commonText, fill: C.ink, fontSize: 16 }}
            >
              REKONSTRUKSI
            </text>
            <path
              d="M506 34C563 10 779 17 800 89"
              fill="none"
              stroke={C.red}
              strokeWidth="4"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - p}
            />
          </g>
        </g>
      )}
    </svg>
  );
};

const Evidence: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  let current = 0;
  cases.forEach((item, index) => {
    if (frame >= item.cue) current = index;
  });
  const item = cases[current];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: range(frame, 1237, 1245, 1, 0),
      }}
    >
      <div style={{ position: "absolute", left: 96, top: 153 }}>
        <Label style={{ color: C.ink, ...appear(frame, 547, fps) }}>
          Satu mekanisme, banyak pengalaman
        </Label>
        <Kinetic
          text="Ketika otak menafsirkan."
          frame={frame}
          cue={547}
          end={615}
          fps={fps}
          size={54}
          style={{ marginTop: 13 }}
        />
      </div>

      <div style={{ position: "absolute", left: 96, top: 312, width: 605 }}>
        {cases.map((entry, index) => {
          if (frame < entry.cue) return null;
          const active = index === current;
          return (
            <div
              key={entry.cue}
              style={{
                position: "relative",
                minHeight: 109,
                marginBottom: 18,
                padding: "21px 24px 18px 80px",
                boxSizing: "border-box",
                border: `1px solid ${active ? C.ink : C.line}`,
                background: active ? C.white : "#EEEBE3",
                boxShadow: active ? "5px 5px 0 #DDD8CB" : undefined,
                ...appear(frame, entry.cue, fps, 18),
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 24,
                  top: 26,
                  fontFamily: MONO,
                  fontSize: 23,
                  fontWeight: 700,
                  color: active ? entry.color : C.muted,
                }}
              >
                0{index + 1}
              </div>
              <Kinetic
                text={entry.title}
                frame={frame}
                cue={entry.cue}
                end={entry.end}
                fps={fps}
                size={28}
                color={active ? C.ink : C.muted}
              />
              {frame >= entry.answer && (
                <div
                  style={{
                    marginTop: 10,
                    display: "inline-block",
                    fontFamily: MONO,
                    fontSize: 13,
                    letterSpacing: "0.08em",
                    color: entry.color,
                    opacity: range(frame, entry.answer, entry.answer + 12),
                  }}
                >
                  → {entry.tag}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        key={current}
        style={{
          position: "absolute",
          left: 772,
          top: 312,
          width: 1052,
          height: 609,
          background: C.white,
          border: `1px solid ${C.line}`,
          boxShadow: "8px 8px 0 #E5E0D5",
          ...appear(frame, item.cue, fps, 22),
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "26px 32px 0",
            paddingBottom: 20,
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          <Label style={{ color: item.color }}>
            Studi visual / 0{current + 1}
          </Label>
          <Label style={{ fontSize: 14 }}>Persepsi ≠ salinan mentah</Label>
        </div>
        <div style={{ position: "absolute", left: 101, top: 102 }}>
          <CaseGraphic
            index={current}
            frame={frame}
            cue={item.cue}
            answer={item.answer}
          />
        </div>
        {frame >= item.answer && (
          <div
            style={{
              position: "absolute",
              left: 36,
              right: 36,
              bottom: 28,
              minHeight: 74,
              borderLeft: `5px solid ${item.color}`,
              paddingLeft: 23,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Kinetic
              text={item.result}
              frame={frame}
              cue={item.answer}
              end={item.answerEnd}
              fps={fps}
              size={35}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Conclusion: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const turn = range(frame, 1392, 1428);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 162,
          opacity: range(frame, 1380, 1400, 1, 0),
        }}
      >
        <Kinetic
          text="Tapi jangan salah."
          frame={frame}
          cue={1245}
          end={1267}
          fps={fps}
          size={65}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 96,
          top: 298,
          width: 920,
          opacity: range(frame, 1380, 1405, 1, 0),
        }}
      >
        <Kinetic
          text="Ini bukan berarti kita tidak bisa mempercayai otak sama sekali."
          frame={frame}
          cue={1267}
          end={1374}
          fps={fps}
          size={61}
          style={{ maxWidth: 810, lineHeight: 1.17 }}
        />
        <div
          style={{
            marginTop: 40,
            height: 5,
            background: C.yellow,
            width: 680 * range(frame, 1320, 1374),
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 1080 - turn * 230,
          top: 269 - turn * 44,
          width: 685,
          ...{
            opacity: range(frame, 1245, 1267),
            transform: `translateY(${(1 - enter(frame, 1245, fps)) * 28}px)`,
          },
        }}
      >
        <svg
          viewBox="0 0 700 600"
          style={{ position: "absolute", left: 0, top: -48, width: 700 }}
        >
          <circle
            cx="350"
            cy="290"
            r="251"
            fill="none"
            stroke={C.line}
            strokeWidth="1.5"
            strokeDasharray="4 9"
          />
          <g transform={`rotate(${frame * 0.08} 350 290)`}>
            <path
              d="M350 39A251 251 0 0 1 591 220"
              stroke={C.teal}
              strokeWidth="4"
              fill="none"
              opacity={0.3 + turn * 0.5}
            />
            <circle cx="350" cy="39" r="5" fill={C.teal} />
          </g>
        </svg>
        <Brain
          frame={frame}
          activation={0.55 + turn * 0.45}
          accent={C.teal}
          style={{ position: "relative", width: 685, height: 530 }}
        />
        <div
          style={{
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 16,
            letterSpacing: "0.12em",
            color: C.teal,
            opacity: turn,
            marginTop: 0,
          }}
        >
          SISTEM ADAPTIF / BUKAN KAMERA
        </div>
      </div>

      {frame >= 1392 && (
        <div style={{ position: "absolute", left: 96, top: 158 }}>
          <Kinetic
            text="Justru sebaliknya."
            frame={frame}
            cue={1392}
            end={1428}
            fps={fps}
            size={67}
          />
          <div
            style={{
              marginTop: 23,
              height: 7,
              width: 572 * range(frame, 1399, 1428),
              background: C.yellow,
            }}
          />
        </div>
      )}

      {frame >= 1432 && (
        <div style={{ position: "absolute", left: 96, top: 363, width: 654 }}>
          <Kinetic
            text="Kemampuan otak:"
            frame={frame}
            cue={1432}
            end={1452}
            fps={fps}
            size={30}
            weight={400}
            style={{ marginBottom: 27 }}
          />

          {[
            {
              cue: 1432,
              end: 1478,
              text: "Memprediksi",
              number: "01",
              color: C.blue,
              icon: "predict",
            },
            {
              cue: 1499,
              end: 1519,
              text: "Menyederhanakan",
              number: "02",
              color: C.teal,
              icon: "simplify",
            },
            {
              cue: 1535,
              end: 1548,
              text: "Mengisi informasi yang kurang",
              number: "03",
              color: C.ink,
              icon: "complete",
            },
          ].map((capability) => {
            if (frame < capability.cue) return null;
            const p = range(frame, capability.cue, capability.end);
            return (
              <div
                key={capability.cue}
                style={{
                  position: "relative",
                  height: capability.icon === "complete" ? 135 : 114,
                  marginBottom: 17,
                  background: C.white,
                  border: `1px solid ${C.line}`,
                  borderLeft: `5px solid ${capability.color}`,
                  padding: "24px 112px 22px 27px",
                  boxSizing: "border-box",
                  ...appear(frame, capability.cue, fps, 20),
                }}
              >
                <Label
                  style={{
                    fontSize: 12,
                    color: capability.color,
                    marginBottom: 10,
                  }}
                >
                  {capability.number} / Fungsi adaptif
                </Label>
                <Kinetic
                  text={capability.text}
                  frame={frame}
                  cue={capability.cue}
                  end={capability.end}
                  fps={fps}
                  size={capability.icon === "complete" ? 31 : 35}
                />
                <svg
                  viewBox="0 0 90 80"
                  style={{
                    position: "absolute",
                    width: 90,
                    height: 80,
                    right: 18,
                    top: 17,
                  }}
                >
                  {capability.icon === "predict" && (
                    <>
                      <path
                        d="M10 63L32 48L49 54L73 22"
                        fill="none"
                        stroke={C.blue}
                        strokeWidth="3"
                        pathLength="1"
                        strokeDasharray="1"
                        strokeDashoffset={1 - p}
                      />
                      <path
                        d="M60 22H73V35"
                        fill="none"
                        stroke={C.blue}
                        strokeWidth="3"
                      />
                      {[10, 32, 49].map((x, i) => (
                        <circle
                          key={x}
                          cx={x}
                          cy={[63, 48, 54][i]}
                          r="4"
                          fill={C.blue}
                        />
                      ))}
                    </>
                  )}
                  {capability.icon === "simplify" && (
                    <>
                      {[0, 1, 2].map((i) => (
                        <path
                          key={i}
                          d={`M7 ${18 + i * 22}H31L52 40H80`}
                          stroke={C.teal}
                          strokeWidth="2.5"
                          fill="none"
                        />
                      ))}
                      <circle cx="75" cy="40" r="8" fill={C.teal} />
                    </>
                  )}
                  {capability.icon === "complete" && (
                    <>
                      {[0, 1, 2, 3].map((i) => (
                        <rect
                          key={i}
                          x={9 + (i % 2) * 34}
                          y={9 + Math.floor(i / 2) * 34}
                          width="27"
                          height="27"
                          fill={i === 3 ? C.yellow : C.ink}
                          fillOpacity={i === 3 ? p : 1}
                          stroke={C.ink}
                          strokeDasharray={i === 3 ? "3 3" : undefined}
                        />
                      ))}
                    </>
                  )}
                </svg>
              </div>
            );
          })}
        </div>
      )}

      {frame >= 1432 && (
        <svg
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <path
            d="M777 503H830"
            fill="none"
            stroke={C.teal}
            strokeWidth="2"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - range(frame, 1432, 1478)}
          />
          <circle
            cx="830"
            cy="503"
            r="5"
            fill={C.teal}
            opacity={range(frame, 1432, 1478)}
          />
          <path
            d="M1530 503H1720"
            fill="none"
            stroke={C.teal}
            strokeWidth="2"
            opacity={range(frame, 1432, 1478)}
          />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={1722 + (i % 2) * 38}
              y={470 + Math.floor(i / 2) * 38}
              width="29"
              height="29"
              fill={i === 3 ? C.yellow : C.teal}
              fillOpacity={
                i === 3 ? range(frame, 1535, 1548) : range(frame, 1432, 1478)
              }
              stroke={C.teal}
              strokeDasharray={i === 3 ? "3 4" : undefined}
              opacity={range(frame, 1432, 1478)}
            />
          ))}
        </svg>
      )}
    </div>
  );
};

export const Scene_09: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: C.paper,
        fontFamily: FONT,
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
          overflow: "hidden",
          color: C.ink,
        }}
      >
        <Sequence from={0} durationInFrames={1549} layout="none">
          <Paper frame={frame} />
        </Sequence>

        <Sequence from={0} durationInFrames={547} layout="none">
          <Perception frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={547} durationInFrames={698} layout="none">
          <Evidence frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={1245} durationInFrames={304} layout="none">
          <Conclusion frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={0} durationInFrames={1549} layout="none">
          <div
            style={{
              position: "absolute",
              left: 96,
              right: 96,
              top: 43,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 17 }}>
              <div
                style={{
                  background: C.ink,
                  color: C.yellow,
                  width: 42,
                  height: 31,
                  fontFamily: MONO,
                  fontSize: 18,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                09
              </div>
              <Label style={{ fontSize: 14, color: C.ink }}>
                Cara otak membangun kenyataan
              </Label>
            </div>
            <Label style={{ fontSize: 13 }}>Persepsi / Ingatan / Prediksi</Label>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 38,
              left: 96,
              right: 96,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Label style={{ fontSize: 12 }}>Investigasi / Pikiran manusia</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 168,
                  height: 3,
                  background: C.line,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${range(frame, 0, 1548) * 100}%`,
                    background: C.ink,
                  }}
                />
              </div>
              <Label style={{ fontSize: 12 }}>09 / 11</Label>
            </div>
          </div>
        </Sequence>
      </div>
    </div>
  );
};