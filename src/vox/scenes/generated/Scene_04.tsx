import React from "react";
import {
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  paper: "#F5F2EB",
  ink: "#18181B",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
  muted: "#77756F",
  line: "#D7D3C9",
};

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const BEATS = [
  { start: 13, end: 36, text: "ini familiar." },
  { start: 67, end: 92, text: "Se..." },
  { start: 92, end: 143, text: "Dan kita menerjemahkannya sebagai," },
  { start: 163, end: 209, text: "gue pernah mengalami ini." },
  { start: 212, end: 227, text: "Padahal," },
  { start: 261, end: 282, text: "rasa familiar" },
  { start: 282, end: 356, text: "tidak selalu berarti pengalaman itu" },
  { start: 356, end: 402, text: "benar-benar pernah terjadi." },
  { start: 402, end: 430, text: "Sekarang," },
  { start: 444, end: 496, text: "kita masuk ke hal yang lebih dekat lagi." },
  { start: 505, end: 519, text: "Ingatan." },
  { start: 537, end: 575, text: "Kita sering menganggap ingatan" },
  { start: 575, end: 642, text: "seperti video yang tersimpan di dalam kepala." },
  { start: 663, end: 708, text: "Kalau mau mengingat sesuatu," },
  { start: 725, end: 746, text: "tinggal tekan play." },
  { start: 761, end: 811, text: "Tapi ternyata tidak sesederhana itu." },
  { start: 830, end: 869, text: "Ketika kamu mengingat sesuatu," },
  { start: 888, end: 939, text: "otak tidak sekadar memutar rekaman." },
  { start: 957, end: 979, text: "Otak seperti," },
  { start: 995, end: 1038, text: "membangun kembali kejadian tersebut." },
  { start: 1055, end: 1118, text: "Makanya dua orang yang mengalami kejadian yang sama," },
  { start: 1132, end: 1175, text: "bisa mengingat detail yang berbeda." },
  { start: 1194, end: 1213, text: "Satu orang bilang," },
  { start: 1227, end: 1248, text: "waktu itu hujan." },
  { start: 1268, end: 1284, text: "Yang lain bilang," },
  { start: 1284, end: 1307, text: "enggak," },
  { start: 1323, end: 1343, text: "waktu itu panas." },
  { start: 1364, end: 1374, text: "Padahal," },
  { start: 1396, end: 1435, text: "mereka berada di tempat yang sama." },
  { start: 1453, end: 1459, text: "Bahkan," },
  { start: 1493, end: 1527, text: "kita sendiri bisa yakin" },
  { start: 1527, end: 1548, text: "terhadap sebuah ingatan," },
];

function ease(frame: number, from: number, to: number) {
  return interpolate(frame, [from, Math.max(from + 0.001, to)], [0, 1], CLAMP);
}

function pop(frame: number, cue: number, fps: number, damping = 17) {
  return spring({
    frame: Math.max(0, frame - cue),
    fps,
    config: { damping, mass: 0.7, stiffness: 100 },
  });
}

type MotionProps = {
  frame: number;
  fps: number;
  cue: number;
};

const Words: React.FC<
  MotionProps & {
    text: string;
    size?: number;
    color?: string;
    highlight?: boolean;
    stagger?: number;
    style?: React.CSSProperties;
  }
> = ({
  frame,
  fps,
  cue,
  text,
  size = 64,
  color = C.ink,
  highlight = false,
  stagger = 3,
  style,
}) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "baseline",
      columnGap: size * 0.23,
      rowGap: 6,
      fontSize: size,
      fontWeight: 800,
      lineHeight: 1.08,
      letterSpacing: "-0.045em",
      color,
      ...style,
    }}
  >
    {text.split(" ").map((word, i) => {
      const start = cue + i * stagger;
      const p = pop(frame, start, fps);
      return (
        <span
          key={`${word}-${i}`}
          style={{
            display: "inline-block",
            opacity: ease(frame, start, start + 9),
            transform: `translateY(${(1 - p) * 24}px)`,
            background: highlight ? C.yellow : undefined,
            padding: highlight ? "2px 9px 7px" : undefined,
          }}
        >
          {word}
        </span>
      );
    })}
  </div>
);

const Enter: React.FC<
  MotionProps & {
    children: React.ReactNode;
    style?: React.CSSProperties;
    distance?: number;
  }
> = ({ frame, fps, cue, children, style, distance = 35 }) => {
  if (frame < cue) return null;
  const p = pop(frame, cue, fps);
  return (
    <div
      style={{
        opacity: ease(frame, cue, cue + 12),
        transform: `translateY(${(1 - p) * distance}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const SmallLabel: React.FC<
  MotionProps & { text: string; color?: string; style?: React.CSSProperties }
> = ({ text, color = C.muted, style, ...motion }) => (
  <Words
    {...motion}
    text={text}
    size={19}
    color={color}
    stagger={3}
    style={{
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontWeight: 600,
      letterSpacing: "0.08em",
      ...style,
    }}
  />
);

const DrawPath: React.FC<{
  frame: number;
  cue: number;
  duration?: number;
  d: string;
  color?: string;
  width?: number;
  opacity?: number;
}> = ({
  frame,
  cue,
  duration = 30,
  d,
  color = C.ink,
  width = 3,
  opacity = 1,
}) => (
  <path
    d={d}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray="1"
    strokeDashoffset={1 - ease(frame, cue, cue + duration)}
    opacity={frame < cue ? 0 : opacity}
  />
);

const Paper: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", inset: 0, background: C.paper }}>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <pattern id="s04-grid" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M64 0H0V64" fill="none" stroke={C.ink} strokeWidth="0.7" opacity="0.07" />
        </pattern>
        <radialGradient id="s04-glow">
          <stop offset="0" stopColor={C.yellow} stopOpacity="0.17" />
          <stop offset="1" stopColor={C.yellow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#s04-grid)" />
      <ellipse
        cx={1390 + Math.sin(frame / 145) * 90}
        cy={420 + Math.cos(frame / 170) * 60}
        rx="670"
        ry="510"
        fill="url(#s04-glow)"
      />
      {Array.from({ length: 145 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 239 + 31) % 1920}
          cy={(i * 173 + 87) % 1080}
          r={i % 3 === 0 ? 1 : 0.6}
          fill={C.ink}
          opacity="0.065"
        />
      ))}
    </svg>
    <div
      style={{
        position: "absolute",
        left: 96,
        right: 96,
        top: 103,
        height: 1,
        background: C.line,
      }}
    />
  </div>
);

const Brain: React.FC<MotionProps & { active?: boolean }> = ({
  frame,
  fps,
  cue,
  active = true,
}) => {
  const nodes = [
    [115, 170],
    [180, 100],
    [262, 82],
    [343, 116],
    [391, 189],
    [313, 239],
    [230, 195],
    [160, 267],
    [275, 309],
    [380, 303],
    [446, 240],
    [102, 226],
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    [6, 0], [6, 7], [7, 8], [8, 9], [9, 10], [10, 4],
    [0, 11], [11, 7], [2, 6], [5, 8], [6, 9],
  ];
  return (
    <Enter frame={frame} fps={fps} cue={cue}>
      <svg width="100%" viewBox="0 0 560 420">
        <path
          d="M115 314C66 305 49 265 63 229C34 200 49 151 86 138C78 91 119 54 163 64C185 20 247 22 273 49C307 27 365 42 376 78C424 70 464 109 455 150C502 169 516 214 490 247C507 291 475 326 435 330C427 373 379 391 343 372L318 407L277 407L266 358C211 386 164 365 150 338C134 337 121 328 115 314Z"
          fill="#E8E3D8"
          stroke={C.ink}
          strokeWidth="3"
        />
        <path
          d="M83 202C89 159 120 133 157 141C151 96 204 66 243 89C262 66 306 80 306 112C357 105 380 143 363 174C386 201 358 235 321 232C317 269 270 278 244 252C207 277 165 254 172 222C132 235 103 226 83 202Z"
          fill={C.yellow}
          fillOpacity="0.38"
          stroke={C.ink}
          strokeWidth="1.5"
        />
        <path
          d="M373 98C418 100 444 132 430 166C469 179 478 214 455 239C434 268 401 263 381 244C368 272 333 267 321 232C358 235 386 201 363 174C380 143 357 105 306 112C330 78 354 77 373 98Z"
          fill={C.blue}
          fillOpacity="0.12"
          stroke={C.ink}
          strokeWidth="1.5"
        />
        <path
          d="M172 222C165 254 207 277 244 252C270 278 317 269 321 232C337 268 361 282 392 271C426 263 457 290 441 320C417 356 366 346 342 325C306 350 271 340 258 319C219 350 177 326 180 297C147 295 133 267 145 244"
          fill={C.teal}
          fillOpacity="0.13"
          stroke={C.ink}
          strokeWidth="1.5"
        />
        <path
          d="M120 164Q156 169 148 190M208 115Q226 145 203 164M282 120Q266 155 293 174M403 179Q419 199 401 218M204 281Q227 296 219 320M282 293Q312 281 327 303"
          fill="none"
          stroke={C.ink}
          strokeWidth="2"
          opacity="0.35"
        />
        {edges.map(([a, b], i) => {
          const from = nodes[a];
          const to = nodes[b];
          const progress = ((Math.max(0, frame - cue) + i * 11) % 82) / 82;
          return (
            <g key={i}>
              <DrawPath
                frame={frame}
                cue={cue + 8 + i * 2}
                duration={28}
                d={`M${from[0]} ${from[1]}L${to[0]} ${to[1]}`}
                color={i % 2 ? C.teal : C.blue}
                width={1.8}
                opacity={0.45}
              />
              {active && frame >= cue + 30 + i * 2 && (
                <circle
                  cx={from[0] + (to[0] - from[0]) * progress}
                  cy={from[1] + (to[1] - from[1]) * progress}
                  r="3.5"
                  fill={i % 2 ? C.teal : C.blue}
                  opacity={Math.sin(progress * Math.PI) * 0.9}
                />
              )}
            </g>
          );
        })}
        {nodes.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4 + Math.sin(frame / 13 + i) * 0.7}
            fill={i % 3 ? C.ink : C.red}
            opacity={ease(frame, cue + i * 2, cue + i * 2 + 12)}
          />
        ))}
      </svg>
    </Enter>
  );
};

const Room: React.FC<{
  frame: number;
  weather?: "neutral" | "rain" | "sun";
  weatherCue?: number;
  id: string;
}> = ({ frame, weather = "neutral", weatherCue = 0, id }) => {
  const w = ease(frame, weatherCue, weatherCue + 16);
  return (
    <svg width="100%" height="100%" viewBox="0 0 620 330">
      <defs>
        <clipPath id={`s04-window-${id}`}>
          <rect x="329" y="55" width="155" height="123" />
        </clipPath>
      </defs>
      <rect width="620" height="330" fill="#EFEADF" />
      <path d="M0 0L119 43H512L620 0M119 43V238L0 330M512 43V238L620 330M119 238H512" fill="none" stroke="#A29E93" strokeWidth="2" />
      <path d="M119 238H512L620 330H0Z" fill="#DDD5C5" />
      <path d="M193 238L141 330M302 238L307 330M406 238L473 330" stroke="#C0B7A7" strokeWidth="2" />
      <rect x="329" y="55" width="155" height="123" fill="#D7E1DE" stroke={C.ink} strokeWidth="3" />
      <g clipPath={`url(#s04-window-${id})`}>
        {weather === "rain" && (
          <g opacity={w}>
            <rect x="329" y="55" width="155" height="123" fill="#B9CDDF" />
            <path d="M325 94Q343 69 363 84Q377 56 401 79Q424 68 440 91Q471 79 491 101V118H325Z" fill="#728FA8" />
            {Array.from({ length: 17 }, (_, i) => {
              const y = 55 + ((i * 23 + Math.max(0, frame - weatherCue) * 3) % 145);
              const x = 338 + ((i * 37) % 149);
              return <path key={i} d={`M${x} ${y}l-7 15`} stroke={C.blue} strokeWidth="2" opacity="0.7" />;
            })}
          </g>
        )}
        {weather === "sun" && (
          <g opacity={w}>
            <rect x="329" y="55" width="155" height="123" fill="#F9E4A2" />
            <circle cx="437" cy="93" r="23" fill={C.yellow} stroke="#C5A120" strokeWidth="2" />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * Math.PI) / 4 + Math.max(0, frame - weatherCue) / 300;
              return (
                <line
                  key={i}
                  x1={437 + Math.cos(a) * 29}
                  y1={93 + Math.sin(a) * 29}
                  x2={437 + Math.cos(a) * 38}
                  y2={93 + Math.sin(a) * 38}
                  stroke="#C5A120"
                  strokeWidth="2.5"
                />
              );
            })}
          </g>
        )}
      </g>
      <path d="M406 55V178M329 116H484" stroke={C.ink} strokeWidth="3" />
      <path d="M175 65H257V163H175Z" fill="#E7D0B9" stroke={C.ink} strokeWidth="2" />
      <path d="M188 145L212 111L229 130L244 107" fill="none" stroke={C.teal} strokeWidth="4" />
      <path d="M212 220H408L443 255H174Z" fill="#A87A58" stroke={C.ink} strokeWidth="2" />
      <path d="M188 255V300M428 255V300" stroke={C.ink} strokeWidth="6" />
      <ellipse cx="303" cy="230" rx="24" ry="8" fill={C.paper} stroke={C.ink} strokeWidth="2" />
      <path d="M289 221H315V233Q301 245 289 233Z" fill={C.paper} stroke={C.ink} strokeWidth="2" />
      <path d="M315 223Q327 221 326 229Q325 235 315 232" fill="none" stroke={C.ink} strokeWidth="2" />
    </svg>
  );
};

const Person: React.FC<{ color: string }> = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="23" fill={color} fillOpacity="0.12" />
    <circle cx="24" cy="17" r="7" fill={color} />
    <path d="M10 38Q10 25 24 25Q38 25 38 38" fill={color} />
  </svg>
);

const Familiarity: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <div style={{ opacity: 1 - ease(frame, 402, 434) }}>
      <div style={{ position: "absolute", left: 110, top: 158 }}>
        <SmallLabel frame={frame} fps={fps} cue={13} text="01 / SINYAL FAMILIAR" />
        <Words frame={frame} fps={fps} cue={13} text="Ini familiar." size={108} style={{ marginTop: 22 }} />
      </div>

      <Enter frame={frame} fps={fps} cue={13} style={{ position: "absolute", left: 165, top: 340 }}>
        <svg width="370" height="370" viewBox="0 0 370 370">
          <circle cx="185" cy="185" r="156" fill={C.paper} stroke={C.line} strokeWidth="2" />
          {[58, 105, 150].map((r) => <circle key={r} cx="185" cy="185" r={r} fill="none" stroke={C.ink} strokeOpacity="0.15" strokeWidth="1" />)}
          <path d="M185 29V341M29 185H341" stroke={C.ink} strokeOpacity="0.15" />
          <g transform={`rotate(${Math.max(0, frame - 13) * 0.52} 185 185)`}>
            <path d="M185 185L185 36A149 149 0 0 1 291 80Z" fill={C.yellow} fillOpacity="0.38" />
            <path d="M185 185V36" stroke={C.ink} strokeWidth="2" />
            <path d="M185 21A164 164 0 0 1 339 129" fill="none" stroke={C.teal} strokeWidth="4" />
          </g>
          <circle cx="185" cy="185" r="24" fill={C.yellow} stroke={C.ink} strokeWidth="3" />
          <circle cx="185" cy="185" r="6" fill={C.ink} />
          {[[-73, -62], [96, -40], [42, 104]].map(([x, y], i) => (
            <circle key={i} cx={185 + x} cy={185 + y} r={5 + Math.sin(frame / 14 + i) * 1.4} fill={C.teal} />
          ))}
        </svg>
      </Enter>

      {frame >= 67 && frame < 92 && (
        <Words frame={frame} fps={fps} cue={67} text="Se…" size={32} color={C.teal} style={{ position: "absolute", left: 303, top: 735 }} />
      )}

      <svg style={{ position: "absolute", left: 535, top: 450 }} width="290" height="130" viewBox="0 0 290 130">
        <DrawPath frame={frame} cue={92} duration={46} d="M5 65H259M235 45L260 65L235 85" color={C.ink} width={3} />
      </svg>
      <SmallLabel frame={frame} fps={fps} cue={92} text="DITERJEMAHKAN" style={{ position: "absolute", left: 573, top: 430 }} />

      <Enter
        frame={frame}
        fps={fps}
        cue={163}
        style={{
          position: "absolute",
          left: 855,
          top: 350,
          width: 805,
          padding: "39px 42px 42px",
          background: "#FFFDFA",
          border: `1px solid ${C.line}`,
          boxShadow: "9px 12px 0 #18181B0B",
          transform: `translateY(${(1 - pop(frame, 163, fps)) * 30}px) rotate(-1.2deg)`,
        }}
      >
        <SmallLabel frame={frame} fps={fps} cue={163} text="KESIMPULAN SPONTAN" />
        <Words frame={frame} fps={fps} cue={163} text="“Gue pernah" size={66} style={{ marginTop: 28 }} />
        <Words frame={frame} fps={fps} cue={177} text="mengalami ini.”" size={66} />
      </Enter>

      <Enter frame={frame} fps={fps} cue={212} style={{ position: "absolute", left: 1260, top: 617 }}>
        <div style={{ background: C.red, color: "white", padding: "10px 20px", transform: "rotate(-5deg)" }}>
          <Words frame={frame} fps={fps} cue={212} text="PADAHAL…" size={27} color="white" />
        </div>
      </Enter>

      <div style={{ position: "absolute", left: 238, top: 775, display: "flex", alignItems: "center", gap: 35 }}>
        <Words frame={frame} fps={fps} cue={261} text="Rasa familiar" size={41} highlight />
        <Words frame={frame} fps={fps} cue={282} text="≠" size={72} color={C.red} />
        <Words frame={frame} fps={fps} cue={356} text="Pernah terjadi" size={41} />
      </div>
      <svg style={{ position: "absolute", left: 610, top: 747 }} width="150" height="118" viewBox="0 0 150 118">
        <DrawPath frame={frame} cue={356} duration={36} d="M123 32C104 5 39 4 17 34C-1 68 17 103 66 106C112 110 142 76 129 43C120 19 72 11 43 22" color={C.red} width={4} />
      </svg>
    </div>
    <Words frame={frame} fps={fps} cue={402} text="Sekarang," size={82} style={{ position: "absolute", top: 430, left: 650, opacity: ease(frame, 414, 429) }} />
  </div>
);

const Recording: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const exit = 1 - ease(frame, 810, 830);
  const playing = frame >= 725;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: exit }}>
      <div style={{ position: "absolute", left: 110, top: 158 }}>
        <SmallLabel frame={frame} fps={fps} cue={444} text="02 / LEBIH DEKAT LAGI" />
        {frame < 505 ? (
          <Words frame={frame} fps={fps} cue={444} text="Di dalam kepala." size={88} style={{ marginTop: 22 }} />
        ) : (
          <Words frame={frame} fps={fps} cue={505} text="Ingatan." size={112} style={{ marginTop: 16 }} />
        )}
      </div>

      <div style={{ position: "absolute", left: 90, top: 360, width: 695 }}>
        <Brain frame={frame} fps={fps} cue={537} />
        <SmallLabel frame={frame} fps={fps} cue={537} text="ANGGAPAN YANG FAMILIAR" style={{ justifyContent: "center", marginTop: -8 }} />
      </div>

      <svg style={{ position: "absolute", left: 728, top: 410 }} width="270" height="350" viewBox="0 0 270 350">
        <DrawPath frame={frame} cue={575} duration={46} d="M0 154H58Q82 154 82 130V78Q82 57 106 57H239" color={C.ink} width={2.5} />
        <DrawPath frame={frame} cue={663} duration={40} d="M238 232H127Q105 232 105 254V290H8M28 273L8 290L28 307" color={C.teal} width={3} />
      </svg>

      <Enter frame={frame} fps={fps} cue={575} style={{ position: "absolute", left: 982, top: 340, width: 770 }}>
        <div style={{ background: C.ink, padding: "15px 18px 20px", boxShadow: "12px 13px 0 #18181B12", transform: "rotate(1deg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <SmallLabel frame={frame} fps={fps} cue={575} text="MEMORY_001" color={C.paper} />
            <SmallLabel frame={frame} fps={fps} cue={575} text="ARSIP / VIDEO" color="#AAA69D" />
          </div>
          <div style={{ height: 335, overflow: "hidden", position: "relative" }}>
            <Room frame={frame} id="recording" />
            <div style={{ position: "absolute", inset: 0, background: "#18181B0B" }} />
            <div style={{ position: "absolute", left: 28, bottom: 20, color: "white", fontFamily: "monospace", fontSize: 20, background: "#18181BC9", padding: "5px 8px" }}>
              {playing ? `00:00:${String(Math.floor((frame - 725) / 30)).padStart(2, "0")}` : "00:00:00"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, paddingTop: 16 }}>
            <svg width="33" height="33" viewBox="0 0 33 33">
              {playing ? <path d="M8 6H13V27H8ZM20 6H25V27H20Z" fill={C.yellow} /> : <path d="M9 5L27 16.5L9 28Z" fill={C.paper} />}
            </svg>
            <div style={{ height: 3, flex: 1, background: "#66645E" }}>
              <div style={{ width: `${ease(frame, 725, 811) * 61}%`, height: 3, background: C.yellow }} />
            </div>
            <span style={{ color: "#C6C3BA", fontFamily: "monospace", fontSize: 16 }}>REC</span>
          </div>
        </div>
      </Enter>

      <Words frame={frame} fps={fps} cue={663} text="Panggil kembali." size={36} color={C.teal} style={{ position: "absolute", left: 235, top: 825 }} />
      <Enter frame={frame} fps={fps} cue={725} style={{ position: "absolute", left: 1245, top: 819 }}>
        <div style={{ background: C.yellow, padding: "12px 23px", border: `2px solid ${C.ink}` }}>
          <Words frame={frame} fps={fps} cue={725} text="TEKAN PLAY" size={29} />
        </div>
      </Enter>

      <svg style={{ position: "absolute", left: 940, top: 315, pointerEvents: "none" }} width="865" height="530" viewBox="0 0 865 530">
        <DrawPath frame={frame} cue={761} duration={42} d="M743 69C670 12 162 9 63 91C-30 176 0 393 113 458C236 525 646 514 774 423C877 340 843 143 748 86" color={C.red} width={5} />
        <DrawPath frame={frame} cue={779} duration={24} d="M733 116L807 186M807 116L733 186" color={C.red} width={6} />
      </svg>
    </div>
  );
};

const Reconstruction: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const assembling = pop(frame, 995, fps, 22);
  const scatter = ease(frame, 888, 932) * (1 - Math.min(1, assembling));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - ease(frame, 1038, 1055) }}>
      <div style={{ position: "absolute", left: 110, top: 158 }}>
        <SmallLabel frame={frame} fps={fps} cue={830} text="03 / CARA KERJA INGATAN" />
        {frame < 957 ? (
          <Words frame={frame} fps={fps} cue={830} text="Saat kita mengingat…" size={82} style={{ marginTop: 24 }} />
        ) : (
          <>
            <Words frame={frame} fps={fps} cue={957} text="Otak" size={88} style={{ marginTop: 19 }} />
            <Words frame={frame} fps={fps} cue={995} text="membangun kembali." size={76} highlight style={{ position: "absolute", left: 245, top: 41, width: 1300 }} />
          </>
        )}
      </div>

      <div style={{ position: "absolute", left: 110, top: 370, width: 620 }}>
        <Brain frame={frame} fps={fps} cue={830} />
      </div>

      <Enter frame={frame} fps={fps} cue={888} style={{ position: "absolute", left: 198, top: 785 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="43" height="43" viewBox="0 0 43 43">
            <path d="M12 7L34 22L12 36Z" fill="none" stroke={C.ink} strokeWidth="2.5" />
            <path d="M4 4L39 39" stroke={C.red} strokeWidth="4" />
          </svg>
          <Words frame={frame} fps={fps} cue={888} text="Bukan memutar rekaman." size={30} />
        </div>
      </Enter>

      <svg style={{ position: "absolute", left: 650, top: 360 }} width="470" height="430" viewBox="0 0 470 430">
        <DrawPath frame={frame} cue={957} duration={37} d="M30 150C149 150 150 76 279 76H418M399 59L418 76L399 93" color={C.blue} width={3} />
        <DrawPath frame={frame} cue={957} duration={40} d="M31 214C161 214 171 198 304 198H418" color={C.teal} width={3} />
        <DrawPath frame={frame} cue={957} duration={43} d="M30 275C176 275 171 321 297 321H418" color={C.ink} width={3} />
        {[C.blue, C.teal, C.yellow].map((color, i) => (
          <rect
            key={color}
            x={155 + i * 39}
            y={77 + i * 112 + Math.sin(frame / 18 + i) * 5}
            width="27"
            height="27"
            rx="2"
            fill={color}
            stroke={C.ink}
            opacity={ease(frame, 957 + i * 4, 974 + i * 4)}
            transform={`rotate(${i % 2 ? -9 : 8},${169 + i * 39},${91 + i * 112})`}
          />
        ))}
      </svg>

      <Enter frame={frame} fps={fps} cue={888} style={{ position: "absolute", left: 1110, top: 400, width: 620, height: 330 }}>
        {Array.from({ length: 6 }, (_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const dx = [-54, 8, 55, -39, 18, 57][i] * scatter;
          const dy = [-36, -55, -29, 39, 63, 31][i] * scatter;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: col * (620 / 3),
                top: row * 165,
                width: 620 / 3,
                height: 165,
                overflow: "hidden",
                transform: `translate(${dx}px,${dy}px) rotate(${[-8, 4, 9, 6, -4, -7][i] * scatter}deg)`,
                boxShadow: scatter > 0.03 ? "0 7px 16px #18181B18" : undefined,
                border: scatter > 0.03 ? `1px solid ${C.paper}` : undefined,
              }}
            >
              <div style={{ position: "absolute", width: 620, height: 330, left: -col * (620 / 3), top: -row * 165 }}>
                <Room frame={frame} id={`fragment-${i}`} />
              </div>
            </div>
          );
        })}
      </Enter>

      <div style={{ position: "absolute", left: 1108, top: 796 }}>
        <SmallLabel frame={frame} fps={fps} cue={995} text="KEJADIAN / DIRAKIT KEMBALI" color={C.teal} />
        <svg width="620" height="27">
          <rect x="0" y="12" width={620 * ease(frame, 995, 1038)} height="8" fill={C.yellow} />
        </svg>
      </div>
    </div>
  );
};

const MemoryCard: React.FC<
  MotionProps & {
    side: "A" | "B";
    left: number;
    quoteCue: number;
    weatherCue: number;
    weather: "rain" | "sun";
  }
> = ({ frame, fps, cue, side, left, quoteCue, weatherCue, weather }) => {
  const color = side === "A" ? C.blue : C.teal;
  return (
    <Enter frame={frame} fps={fps} cue={cue} style={{ position: "absolute", left, top: 345, width: 740 }}>
      <div style={{ background: "#FFFDFA", border: `1px solid ${C.line}`, padding: 22, boxShadow: "7px 9px 0 #18181B08" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", height: 52 }}>
          <Person color={color} />
          <SmallLabel frame={frame} fps={fps} cue={cue} text={`PERSPEKTIF ${side}`} color={color} />
          <div style={{ marginLeft: "auto", width: 55, height: 3, background: color }} />
        </div>
        <div style={{ height: 344, marginTop: 14, border: `1px solid ${C.line}`, overflow: "hidden" }}>
          <Room
            frame={frame}
            weather={frame >= weatherCue ? weather : "neutral"}
            weatherCue={weatherCue}
            id={`perspective-${side}`}
          />
        </div>
        <div style={{ height: 78, paddingTop: 18 }}>
          <Words
            frame={frame}
            fps={fps}
            cue={quoteCue}
            text={side === "A" ? "“Waktu itu hujan.”" : "“Waktu itu panas.”"}
            size={43}
            color={color}
            stagger={2}
          />
        </div>
      </div>
    </Enter>
  );
};

const Perspectives: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const closing = ease(frame, 1453, 1487);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ opacity: 1 - closing * 0.87 }}>
        <div style={{ position: "absolute", left: 110, top: 158 }}>
          <SmallLabel frame={frame} fps={fps} cue={1055} text="04 / SATU KEJADIAN, DUA PERSPEKTIF" />
          <Words
            frame={frame}
            fps={fps}
            cue={frame < 1132 ? 1055 : 1132}
            text={frame < 1132 ? "Kejadian yang sama." : "Detail yang berbeda."}
            size={84}
            style={{ marginTop: 24 }}
          />
        </div>

        <MemoryCard frame={frame} fps={fps} cue={1055} side="A" left={110} quoteCue={1227} weatherCue={1227} weather="rain" />
        <MemoryCard frame={frame} fps={fps} cue={1055} side="B" left={1070} quoteCue={1323} weatherCue={1323} weather="sun" />

        <svg style={{ position: "absolute", left: 887, top: 478 }} width="145" height="150" viewBox="0 0 145 150">
          <DrawPath frame={frame} cue={1132} duration={28} d="M27 57H118M27 94H118M103 24L41 124" color={C.red} width={5} />
        </svg>

        <SmallLabel frame={frame} fps={fps} cue={1194} text="SATU ORANG BILANG" color={C.blue} style={{ position: "absolute", left: 148, top: 307 }} />
        <SmallLabel frame={frame} fps={fps} cue={1268} text="YANG LAIN BILANG" color={C.teal} style={{ position: "absolute", left: 1107, top: 307 }} />

        <Enter frame={frame} fps={fps} cue={1284} style={{ position: "absolute", left: 1646, top: 319 }}>
          <div style={{ border: `3px solid ${C.red}`, padding: "7px 14px", transform: "rotate(8deg)", background: C.paper }}>
            <Words frame={frame} fps={fps} cue={1284} text="ENGGAK." size={23} color={C.red} stagger={1} />
          </div>
        </Enter>

        <svg style={{ position: "absolute", left: 110, top: 810 }} width="1700" height="110" viewBox="0 0 1700 110">
          <DrawPath frame={frame} cue={1364} duration={27} d="M331 8C325 35 463 44 735 49C992 52 1251 40 1354 12" color={C.red} width={3.5} />
          <DrawPath frame={frame} cue={1396} duration={31} d="M835 57C777 50 729 68 744 91C760 111 932 111 953 89C975 63 916 46 858 57" color={C.red} width={3} />
        </svg>

        <div style={{ position: "absolute", left: 575, top: 870, width: 780 }}>
          <Words frame={frame} fps={fps} cue={1396} text="Tempat yang sama." size={38} highlight style={{ justifyContent: "center" }} />
        </div>
      </div>

      {frame >= 1453 && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              left: 375,
              top: 350,
              width: 1170,
              minHeight: 350,
              background: C.paper,
              padding: "45px 50px",
              opacity: ease(frame, 1453, 1474),
              boxShadow: "0 14px 50px #18181B09",
              border: `1px solid ${C.line}`,
              transform: `translateY(${(1 - pop(frame, 1453, fps)) * 22}px) rotate(-0.7deg)`,
            }}
          >
            <SmallLabel frame={frame} fps={fps} cue={1453} text="BAHKAN, KITA SENDIRI…" />
            <Words frame={frame} fps={fps} cue={1493} text="Bisa yakin" size={105} highlight style={{ marginTop: 29, width: "fit-content" }} />
            <Words frame={frame} fps={fps} cue={1527} text="terhadap sebuah ingatan." size={49} stagger={2} style={{ marginTop: 27 }} />
          </div>
          <svg style={{ position: "absolute", left: 1400, top: 336 }} width="160" height="140" viewBox="0 0 160 140">
            <DrawPath frame={frame} cue={1493} duration={34} d="M23 24C44 4 107 4 133 35C165 72 133 124 74 121C21 123 3 82 15 50C23 24 75 13 109 25" color={C.red} width={3.5} />
          </svg>
        </div>
      )}
    </div>
  );
};

const Caption: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  let index = -1;
  for (let i = 0; i < BEATS.length; i++) {
    if (frame >= BEATS[i].start) index = i;
  }
  if (index < 0) return null;
  const beat = BEATS[index];
  const nextStart = BEATS[index + 1]?.start ?? 1549;
  const holdEnd = Math.min(nextStart, beat.end + 16);
  const opacity =
    ease(frame, beat.start, beat.start + 3) *
    (1 - ease(frame, Math.max(beat.end, holdEnd - 5), holdEnd));
  const count = beat.text.split(" ").length;
  const stagger = Math.max(1, Math.min(3, Math.floor((beat.end - beat.start - 5) / count)));

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        top: 958,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <div style={{ background: C.ink, padding: "14px 24px 16px", boxShadow: "0 4px 0 #18181B0C" }}>
        <Words
          frame={frame}
          fps={fps}
          cue={beat.start}
          text={beat.text}
          size={32}
          color={C.paper}
          stagger={stagger}
          style={{ fontWeight: 500, letterSpacing: "-0.015em", justifyContent: "center" }}
        />
      </div>
    </div>
  );
};

const Overlay: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const chapter = frame < 444 ? "FAMILIARITAS" : frame < 830 ? "INGATAN" : frame < 1055 ? "REKONSTRUKSI" : "PERSPEKTIF";
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 96, top: 47, display: "flex", alignItems: "center", gap: 15 }}>
        <div style={{ background: C.yellow, width: 43, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 900 }}>
          04
        </div>
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "0.13em" }}>PIKIRAN & REALITAS</span>
      </div>
      <div style={{ position: "absolute", right: 100, top: 54, fontFamily: "monospace", fontSize: 16, letterSpacing: "0.1em", color: C.muted }}>
        {chapter} / 04—11
      </div>
      <Caption frame={frame} fps={fps} />
      <div style={{ position: "absolute", left: 96, right: 96, bottom: 22, display: "flex", gap: 7 }}>
        {[
          [0, 444],
          [444, 830],
          [830, 1055],
          [1055, 1548],
        ].map(([a, b], i) => (
          <div key={i} style={{ height: 3, flex: b - a, background: C.line }}>
            <div style={{ width: `${ease(frame, a, b) * 100}%`, height: "100%", background: C.ink }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const Scene_04: React.FC = () => {
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
        fontFamily: 'Arial, Helvetica, sans-serif',
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
          overflow: "hidden",
        }}
      >
        <Sequence from={0} durationInFrames={1548} layout="none">
          <Paper frame={frame} />
        </Sequence>

        <Sequence from={0} durationInFrames={444} layout="none">
          <Familiarity frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={444} durationInFrames={386} layout="none">
          <Recording frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={830} durationInFrames={225} layout="none">
          <Reconstruction frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={1055} durationInFrames={493} layout="none">
          <Perspectives frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={0} durationInFrames={1548} layout="none">
          <Overlay frame={frame} fps={fps} />
        </Sequence>
      </div>
    </div>
  );
};