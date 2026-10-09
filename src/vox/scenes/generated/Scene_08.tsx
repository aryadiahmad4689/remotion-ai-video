import React from "react";
import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

const C = {
  paper: "#F5F2EB",
  ink: "#18181B",
  muted: "#73716A",
  line: "#D9D5CB",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
  white: "#FFFEFA",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ramp = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], clamp);

const settle = (frame: number, fps: number, from: number) =>
  spring({
    frame: Math.max(0, frame - from),
    fps,
    config: {damping: 18, mass: 0.7, stiffness: 95},
  });

const MONO = '"Courier New", monospace';
const SANS = 'Arial, Helvetica, sans-serif';

type WordsProps = {
  text: string;
  frame: number;
  fps: number;
  start: number;
  stagger?: number;
  style?: React.CSSProperties;
};

const Words: React.FC<WordsProps> = ({
  text,
  frame,
  fps,
  start,
  stagger = 3,
  style,
}) => (
  <span
    style={{
      display: "inline-flex",
      flexWrap: "wrap",
      columnGap: "0.26em",
      rowGap: "0.06em",
      ...style,
    }}
  >
    {text.split(" ").map((word, index) => {
      const cue = start + index * stagger;
      const s = settle(frame, fps, cue);
      return (
        <span
          key={`${word}-${index}`}
          style={{
            display: "inline-block",
            opacity: ramp(frame, cue, cue + 12),
            transform: `translateY(${(1 - s) * 13}px)`,
          }}
        >
          {word}
        </span>
      );
    })}
  </span>
);

type HighlightProps = {
  children: React.ReactNode;
  frame: number;
  start: number;
  color?: string;
};

const Highlight: React.FC<HighlightProps> = ({
  children,
  frame,
  start,
  color = C.yellow,
}) => (
  <span style={{position: "relative", display: "inline-block", isolation: "isolate"}}>
    <span
      style={{
        position: "absolute",
        left: -4,
        right: -4,
        top: "47%",
        height: "48%",
        background: color,
        transform: `scaleX(${ramp(frame, start, start + 32)}) rotate(-1deg)`,
        transformOrigin: "left center",
        zIndex: -1,
      }}
    />
    {children}
  </span>
);

type PillProps = {
  x: number;
  y: number;
  text: string;
  cue: number;
  frame: number;
  fps: number;
  color?: string;
  width?: number;
};

const Pill: React.FC<PillProps> = ({
  x,
  y,
  text,
  cue,
  frame,
  fps,
  color = C.ink,
  width,
}) => {
  const s = settle(frame, fps, cue);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        opacity: ramp(frame, cue, cue + 20),
        transform: `translate(${(1 - s) * 16}px, ${Math.sin(frame * 0.019 + x) * 1.5}px)`,
        padding: "11px 17px",
        border: `1px solid ${color}`,
        borderRadius: 25,
        background: C.white,
        color,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 20,
        whiteSpace: "nowrap",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      {text}
    </div>
  );
};

const neurons = [
  {x: 125, y: 220},
  {x: 160, y: 155},
  {x: 219, y: 120},
  {x: 281, y: 147},
  {x: 329, y: 197},
  {x: 360, y: 257},
  {x: 293, y: 278},
  {x: 234, y: 221},
  {x: 186, y: 280},
  {x: 138, y: 313},
  {x: 227, y: 344},
  {x: 300, y: 347},
  {x: 257, y: 402},
  {x: 346, y: 377},
];

const links = [
  [0, 1], [0, 8], [1, 2], [1, 7], [2, 3], [2, 7],
  [3, 4], [3, 7], [4, 5], [4, 6], [5, 6], [5, 13],
  [6, 7], [6, 11], [7, 8], [7, 10], [8, 9], [8, 10],
  [9, 10], [10, 11], [10, 12], [11, 12], [11, 13],
];

const Brain: React.FC<{frame: number}> = ({frame}) => (
  <g transform={`translate(0 ${Math.sin(frame * 0.018) * 3})`}>
    <path
      d="M246 85 C209 61 164 82 145 112 C100 112 72 153 79 192
         C45 217 49 261 68 286 C45 324 68 365 101 376
         C111 417 155 434 184 420 C202 451 249 450 269 429
         C299 451 340 432 348 404 C391 397 416 357 403 322
         C437 288 425 246 401 230 C415 188 387 151 357 146
         C343 109 302 90 275 105 C269 94 258 88 246 85 Z"
      fill="#EAE6DC"
      stroke={C.ink}
      strokeWidth={2.5}
    />
    <path
      d="M246 98 C230 149 251 176 240 217 C228 251 252 281 243 311
         C231 351 250 386 245 427
         M145 115 C184 126 188 155 171 178 C142 194 117 185 100 207
         M82 286 C124 278 144 302 130 338 C153 351 166 371 166 409
         M286 124 C279 161 316 170 341 164
         M402 236 C361 229 344 249 350 280 C361 303 387 306 396 323
         M284 422 C278 386 302 369 336 377"
      fill="none"
      stroke="#BAB5A8"
      strokeWidth={2}
      strokeLinecap="round"
    />
    {links.map(([a, b], index) => {
      const n1 = neurons[a];
      const n2 = neurons[b];
      const t = ((frame + index * 17) % 135) / 135;
      return (
        <g key={`link-${index}`}>
          <line
            x1={n1.x}
            y1={n1.y}
            x2={n2.x}
            y2={n2.y}
            stroke={index % 3 === 0 ? C.blue : C.teal}
            strokeWidth={1.7}
            opacity={0.3}
          />
          <circle
            cx={n1.x + (n2.x - n1.x) * t}
            cy={n1.y + (n2.y - n1.y) * t}
            r={2.8}
            fill={index % 3 === 0 ? C.blue : C.teal}
            opacity={Math.sin(t * Math.PI) * 0.8}
          />
        </g>
      );
    })}
    {neurons.map((n, index) => {
      const pulse = (Math.sin(frame * 0.046 + index * 1.7) + 1) / 2;
      return (
        <g key={`neuron-${index}`}>
          <circle cx={n.x} cy={n.y} r={8 + pulse * 7} fill={C.teal} opacity={0.06 + pulse * 0.06} />
          <circle cx={n.x} cy={n.y} r={4.2 + pulse} fill={index % 3 === 0 ? C.blue : C.teal} />
          <circle cx={n.x - 1} cy={n.y - 1} r={1.3} fill={C.white} />
        </g>
      );
    })}
  </g>
);

export const Scene_08: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const scale = Math.min(width / 1920, height / 1080);
  const boardOpacity = interpolate(frame, [984, 1026], [1, 0.14], clamp);
  const questionOpacity = ramp(frame, 997, 1035);
  const finalReveal = ramp(frame, 1478, 1512);
  const questionDim = interpolate(frame, [1478, 1512], [1, 0.12], clamp);
  const secondAct = ramp(frame, 660, 698);
  const firstTitleOpacity = 1 - ramp(frame, 654, 687);
  const secondTitleOpacity = ramp(frame, 654, 687) * (1 - ramp(frame, 991, 1023));
  const thirdTitleOpacity = ramp(frame, 991, 1023) * (1 - finalReveal);
  const reflection = ramp(frame, 371, 414);
  const route = ramp(frame, 794, 851);
  const caution = ramp(frame, 676, 710);
  const marker = ramp(frame, 1324, 1387);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: C.paper,
        overflow: "hidden",
        fontFamily: SANS,
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
          background: C.paper,
        }}
      >
        {/* BACKGROUND: low-contrast print grid and drifting light. */}
        <svg
          width={1920}
          height={900}
          viewBox="0 0 1920 900"
          style={{position: "absolute", left: 0, top: 0}}
        >
          <defs>
            <pattern id="s08-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0V48" fill="none" stroke="#D6D0C4" strokeWidth={0.65} />
            </pattern>
            <radialGradient id="s08-glow">
              <stop offset="0%" stopColor="#FFE600" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#FFE600" stopOpacity="0" />
            </radialGradient>
            <marker id="s08-arrow-dark" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0L10 5L0 10Z" fill={C.ink} />
            </marker>
            <marker id="s08-arrow-teal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0L10 5L0 10Z" fill={C.teal} />
            </marker>
          </defs>
          <rect width={1920} height={900} fill="url(#s08-grid)" opacity={0.36} />
          <ellipse
            cx={1180 + Math.sin(frame * 0.007) * 110}
            cy={350 + Math.cos(frame * 0.009) * 55}
            rx={720}
            ry={470}
            fill="url(#s08-glow)"
          />
          <path d="M80 88H1840" stroke={C.line} />
        </svg>

        {/* EDITORIAL HEADER: established on the very first frame. */}
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 41,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: MONO,
            fontSize: 19,
            letterSpacing: 2.2,
          }}
        >
          <span style={{width: 12, height: 12, background: C.yellow, border: `1px solid ${C.ink}`}} />
          <span>PIKIRAN / KENDALI</span>
          <span style={{color: C.muted, marginLeft: 15}}>KESIMPULAN</span>
        </div>

        <div
          style={{
            position: "absolute",
            right: 80,
            top: 37,
            display: "flex",
            alignItems: "center",
            gap: 19,
          }}
        >
          <span style={{fontFamily: MONO, fontSize: 18, color: C.muted}}>08 / 08</span>
          <span
            style={{
              background: C.ink,
              color: C.yellow,
              padding: "5px 11px 6px",
              fontWeight: 900,
              fontSize: 24,
              letterSpacing: -1.5,
            }}
          >
            mino.
          </span>
        </div>

        {/* Three slow editorial acts; the underlying diagram is never cut away. */}
        <div style={{position: "absolute", left: 80, top: 121, opacity: firstTitleOpacity}}>
          <div style={{fontSize: 63, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1.1}}>
            Tidak semua pikiran kita{" "}
            <Highlight frame={frame} start={19}>pilih.</Highlight>
          </div>
          <div style={{marginTop: 15, fontSize: 24, color: C.muted}}>
            Sebagian muncul otomatis. Respons kita masih bisa dipertimbangkan.
          </div>
        </div>

        <div style={{position: "absolute", left: 80, top: 121, opacity: secondTitleOpacity}}>
          <div style={{fontSize: 63, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1.1}}>
            Pikiran datang.{" "}
            <Highlight frame={frame} start={794}>Arah bisa dipilih.</Highlight>
          </div>
          <div style={{marginTop: 15, fontSize: 24, color: C.muted}}>
            Bukan kendali penuh atas pikiran — tetapi ruang untuk menentukan respons.
          </div>
        </div>

        <div style={{position: "absolute", left: 80, top: 121, opacity: thirdTitleOpacity}}>
          <div style={{fontSize: 63, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1.1}}>
            <Words text="Coba pikirkan satu hal." frame={frame} fps={fps} start={997} stagger={5} />
          </div>
          <div style={{marginTop: 15, fontSize: 24, color: C.muted}}>
            Sebuah pikiran bukan perintah.
          </div>
        </div>

        {/* MAIN CONTENT: one persistent decision diagram across acts one and two. */}
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 268,
            width: 1760,
            height: 580,
            opacity: boardOpacity,
            transform: `translateY(${Math.sin(frame * 0.011) * 1.7}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: `1px solid ${C.line}`,
              borderRadius: 8,
              background: "rgba(255,254,250,0.90)",
              boxShadow: "0 13px 34px rgba(50,45,35,0.055)",
            }}
          />
          <svg
            width={1760}
            height={580}
            viewBox="0 0 1760 580"
            style={{position: "absolute", inset: 0}}
          >
            <path d="M525 38V536M1106 38V536" stroke={C.line} strokeDasharray="4 8" />
            <text x={32} y={43} fontFamily={MONO} fontSize={17} fill={C.muted} letterSpacing={2}>01 / MUNCUL</text>
            <text x={563} y={43} fontFamily={MONO} fontSize={17} fill={C.muted} letterSpacing={2}>02 / PERTIMBANGKAN</text>
            <text x={1144} y={43} fontFamily={MONO} fontSize={17} fill={C.muted} letterSpacing={2}>03 / TENTUKAN RESPONS</text>

            <Brain frame={frame} />

            {/* The automatic channel exists before its emphasized reveal. */}
            <path
              d="M431 263C501 263 548 263 614 263"
              fill="none"
              stroke={C.ink}
              strokeWidth={2}
              opacity={0.25}
              markerEnd="url(#s08-arrow-dark)"
            />
            <path
              d="M431 263C501 263 548 263 614 263"
              fill="none"
              stroke={C.ink}
              strokeWidth={2.5}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - ramp(frame, 257, 305)}
              opacity={ramp(frame, 257, 277)}
            />

            {/* Reflection chamber: wireframe from frame zero, progressively activated. */}
            <rect x={631} y={162} width={370} height={210} rx={18} fill={C.paper} stroke={C.line} strokeWidth={2} />
            <rect
              x={631}
              y={162}
              width={370}
              height={210}
              rx={18}
              fill="none"
              stroke={C.teal}
              strokeWidth={2.5}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - reflection}
              opacity={reflection}
            />
            <circle cx={686} cy={219} r={18} fill={C.yellow} opacity={reflection} />
            <path d="M678 220L684 226L695 212" fill="none" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" opacity={reflection} />

            <path
              d="M688 388C698 429 755 449 816 449C877 449 943 429 954 387"
              fill="none"
              stroke={C.teal}
              strokeWidth={2}
              pathLength={1}
              strokeDasharray="0.035 0.025"
              strokeDashoffset={-frame * 0.0008}
              opacity={reflection * 0.6}
              markerEnd="url(#s08-arrow-teal)"
            />

            {/* Branches distinguish the arrival of a thought from a chosen response. */}
            <path d="M1004 263H1158" fill="none" stroke={C.line} strokeWidth={2} />
            <path
              d="M1004 263H1158"
              fill="none"
              stroke={C.teal}
              strokeWidth={3}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - route}
              opacity={route}
              markerEnd="url(#s08-arrow-teal)"
            />
            <path d="M1178 263C1250 263 1250 157 1318 157H1680" fill="none" stroke={C.line} strokeWidth={2} />
            <path d="M1178 263H1680" fill="none" stroke={C.line} strokeWidth={2} />
            <path d="M1178 263C1250 263 1250 378 1318 378H1680" fill="none" stroke={C.line} strokeWidth={2} />

            <path
              d="M1178 263C1250 263 1250 378 1318 378H1680"
              fill="none"
              stroke={C.teal}
              strokeWidth={5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - route}
              opacity={route}
              markerEnd="url(#s08-arrow-teal)"
            />

            <circle cx={1178} cy={263} r={12} fill={C.white} stroke={route > 0 ? C.teal : C.line} strokeWidth={3} />
            <circle cx={1178} cy={263} r={20 + Math.sin(frame * 0.045) * 4} fill="none" stroke={C.teal} opacity={route * 0.18} />
            <circle cx={1680} cy={157} r={6} fill={C.line} />
            <circle cx={1680} cy={263} r={6} fill={C.line} />
            <circle cx={1680} cy={378} r={7} fill={C.teal} opacity={route} />

            {/* Scanning signal travels only along the selected branch. */}
            <circle
              cx={1328 + ((frame % 190) / 190) * 325}
              cy={378}
              r={5}
              fill={C.white}
              stroke={C.teal}
              strokeWidth={2}
              opacity={route * Math.sin(((frame % 190) / 190) * Math.PI)}
            />

            {/* Red pencil emphasizes the automatic channel without erasing it. */}
            <path
              d="M104 486C78 455 166 443 259 447C364 450 428 473 397 503
                 C365 535 149 535 104 486C91 464 137 448 172 445"
              fill="none"
              stroke={C.red}
              strokeWidth={3.2}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - caution}
              opacity={caution}
            />
          </svg>

          <div style={{position: "absolute", left: 74, top: 455, width: 340, textAlign: "center", fontSize: 31, fontWeight: 800}}>
            <Highlight frame={frame} start={43}>Pikiran otomatis</Highlight>
          </div>

          <Pill x={63} y={70} text="KEBIASAAN" cue={155} frame={frame} fps={fps} color={C.blue} />
          <Pill x={291} y={92} text="EMOSI" cue={183} frame={frame} fps={fps} color={C.red} />

          <div
            style={{
              position: "absolute",
              left: 69,
              top: 516,
              width: 385,
              textAlign: "center",
              fontSize: 20,
              color: C.muted,
              opacity: ramp(frame, 257, 289),
            }}
          >
            Asalnya tidak selalu kita ketahui.
          </div>

          <div style={{position: "absolute", left: 660, top: 246, width: 311, textAlign: "center"}}>
            <div style={{fontSize: 38, fontWeight: 800, letterSpacing: -1.2}}>
              Ruang refleksi
            </div>
            <div style={{fontSize: 21, color: C.muted, marginTop: 11}}>
              Jeda sebelum merespons
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 727,
              top: 194,
              fontFamily: MONO,
              fontSize: 17,
              color: C.teal,
              letterSpacing: 1,
              opacity: reflection,
            }}
          >
            BISA DILATIH
          </div>

          <Pill x={564} y={470} text="REFLEKSI" cue={389} frame={frame} fps={fps} color={C.teal} width={196} />
          <Pill x={773} y={470} text="PILIHAN" cue={450} frame={frame} fps={fps} color={C.teal} width={196} />
          <Pill x={564} y={525} text="UBAH KEBIASAAN" cue={527} frame={frame} fps={fps} color={C.teal} width={196} />
          <Pill x={773} y={525} text="BELAJAR" cue={594} frame={frame} fps={fps} color={C.teal} width={196} />

          <div style={{position: "absolute", left: 1320, top: 114, fontSize: 23, color: C.muted}}>
            Ikuti begitu saja
          </div>
          <div style={{position: "absolute", left: 1320, top: 221, fontSize: 23, color: C.muted}}>
            Tunda keputusan
          </div>
          <div
            style={{
              position: "absolute",
              left: 1307,
              top: 315,
              padding: "11px 16px",
              background: C.yellow,
              borderRadius: 3,
              opacity: route,
              transform: `translateY(${(1 - settle(frame, fps, 805)) * 12}px)`,
              fontSize: 29,
              fontWeight: 800,
            }}
          >
            Pilih responsmu
          </div>

          <div
            style={{
              position: "absolute",
              left: 1150,
              top: 453,
              width: 541,
              borderTop: `1px solid ${C.line}`,
              paddingTop: 20,
              opacity: secondAct,
            }}
          >
            <div style={{fontFamily: MONO, fontSize: 17, color: C.muted, letterSpacing: 1.2, marginBottom: 9}}>
              KENDALI ≠ KENDALI PENUH
            </div>
            <div style={{fontSize: 27, lineHeight: 1.3, fontWeight: 700}}>
              <Words text="Pikiran tidak harus menentukan arah hidup." frame={frame} fps={fps} start={827} stagger={4} />
            </div>
          </div>
        </div>

        {/* ACT THREE: a question sheet settles over, rather than erases, the diagram. */}
        <div
          style={{
            position: "absolute",
            left: 150,
            top: 282,
            width: 1620,
            height: 561,
            opacity: questionOpacity * questionDim,
            transform: `translateY(${(1 - settle(frame, fps, 997)) * 17 + Math.sin(frame * 0.014) * 1.5}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: C.white,
              border: `1px solid ${C.line}`,
              borderRadius: 6,
              boxShadow: "0 18px 42px rgba(50,45,35,0.07)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 10,
              background: C.yellow,
              borderRadius: "6px 0 0 6px",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: 43,
              top: 34,
              color: C.muted,
              fontFamily: MONO,
              fontSize: 18,
              letterSpacing: 2,
            }}
          >
            EKSPERIMEN PIKIRAN
          </div>

          {/* Thought bubble and its deliberately separate acceptance gate. */}
          <svg
            width={320}
            height={360}
            viewBox="0 0 320 360"
            style={{position: "absolute", left: 32, top: 95}}
          >
            <circle cx={151} cy={135} r={98} fill={C.paper} stroke={C.line} strokeWidth={1.5} />
            <circle
              cx={151}
              cy={135}
              r={112}
              fill="none"
              stroke={C.teal}
              strokeWidth={2}
              strokeDasharray="29 675"
              transform={`rotate(${frame * 0.32} 151 135)`}
              opacity={0.6}
            />
            <path
              d="M93 134C72 117 81 91 101 89C106 65 142 58 158 76
                 C186 60 214 79 213 102C241 114 230 150 209 152
                 C202 179 171 183 155 168C130 181 99 166 102 146Z"
              fill={C.white}
              stroke={C.ink}
              strokeWidth={2.2}
            />
            <circle cx={104} cy={180} r={8} fill={C.white} stroke={C.ink} strokeWidth={2} />
            <circle cx={89} cy={204} r={4.5} fill={C.ink} />
            <text x={151} y={132} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={39} fill={C.ink}>?</text>
            <path d="M152 237V273" stroke={C.line} strokeWidth={2} strokeDasharray="4 5" />
            <rect x={68} y={275} width={166} height={49} rx={24.5} fill={C.yellow} opacity={marker} />
            <text x={151} y={306} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={19} fill={C.ink} opacity={marker}>
              QUESTIONAR
            </text>
          </svg>

          <div style={{position: "absolute", left: 380, top: 84, width: 1166}}>
            <div
              style={{
                fontSize: 30,
                color: C.muted,
                lineHeight: 1.4,
                minHeight: 84,
              }}
            >
              <Words
                text="Se um pensamento surge sem você escolher..."
                frame={frame}
                fps={fps}
                start={1070}
                stagger={4}
                style={{display: "none"}}
              />
              <Words
                text="Jika sebuah pikiran muncul tanpa kamu memilihnya..."
                frame={frame}
                fps={fps}
                start={1070}
                stagger={4}
              />
            </div>

            <div style={{fontSize: 65, lineHeight: 1.08, fontWeight: 800, letterSpacing: -2}}>
              <Words text="haruskah kamu" frame={frame} fps={fps} start={1155} stagger={6} />
              <br />
              <Highlight frame={frame} start={1220}>
                <Words text="mempercayainya?" frame={frame} fps={fps} start={1199} />
              </Highlight>
            </div>

            <div
              style={{
                marginTop: 35,
                paddingTop: 24,
                borderTop: `1px solid ${C.line}`,
                opacity: ramp(frame, 1324, 1354),
                transform: `translateY(${(1 - settle(frame, fps, 1324)) * 10}px)`,
              }}
            >
              <div style={{fontFamily: MONO, fontSize: 17, letterSpacing: 1.2, color: C.teal, marginBottom: 11}}>
                BENTUK KENDALI YANG KITA MILIKI
              </div>
              <div style={{fontSize: 35, lineHeight: 1.25, fontWeight: 800, letterSpacing: -0.7}}>
                <Words text="Mempertanyakan pikiran sendiri." frame={frame} fps={fps} start={1337} stagger={7} />
              </div>
            </div>
          </div>

          <svg
            width={1620}
            height={561}
            viewBox="0 0 1620 561"
            style={{position: "absolute", inset: 0, pointerEvents: "none"}}
          >
            <path
              d="M369 467C347 416 463 402 672 405C879 408 1024 423 1015 461
                 C1004 505 510 517 387 483C366 477 360 460 373 448"
              fill="none"
              stroke={C.red}
              strokeWidth={3.5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - marker}
            />
          </svg>
        </div>

        {/* Closing signature grows out of the persistent editorial identity. */}
        <div
          style={{
            position: "absolute",
            left: 470,
            top: 343,
            width: 980,
            textAlign: "center",
            opacity: finalReveal,
            transform: `translateY(${(1 - settle(frame, fps, 1478)) * 18 + Math.sin(frame * 0.02) * 2}px)`,
          }}
        >
          <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 4, color: C.muted, marginBottom: 24}}>
            INI
          </div>
          <div style={{position: "relative", display: "inline-block", isolation: "isolate"}}>
            <div
              style={{
                position: "absolute",
                left: -24,
                right: -27,
                top: 43,
                bottom: 3,
                background: C.yellow,
                zIndex: -1,
                transform: `scaleX(${ramp(frame, 1484, 1515)}) rotate(-2deg)`,
                transformOrigin: "left",
              }}
            />
            <div style={{fontSize: 155, lineHeight: 1.04, letterSpacing: -12, fontWeight: 900}}>
              mino.
            </div>
          </div>
          <div style={{marginTop: 45, fontSize: 49, fontWeight: 700, letterSpacing: -1.5}}>
            <Words text="Tetap penasaran?" frame={frame} fps={fps} start={1528} stagger={4} />
          </div>
          <div
            style={{
              margin: "29px auto 0",
              width: 64,
              height: 3,
              background: C.ink,
              transform: `scaleX(${ramp(frame, 1533, 1553)})`,
            }}
          />
        </div>

        {/* Quiet editorial progress, intentionally above the master caption area. */}
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 875,
            width: 1760,
            height: 2,
            background: C.line,
          }}
        >
          <div
            style={{
              width: `${interpolate(frame, [0, 1563], [0, 100], clamp)}%`,
              height: 2,
              background: C.ink,
              opacity: 0.5,
            }}
          />
        </div>
      </div>
    </div>
  );
};