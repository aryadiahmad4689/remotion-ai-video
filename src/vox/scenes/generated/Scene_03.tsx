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
  muted: "#77746D",
  line: "#D8D3C8",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
  white: "#FFFDF8",
};

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const FONT = 'Arial, Helvetica, sans-serif';
const MONO = '"Courier New", monospace';

type MotionProps = {
  frame: number;
  fps: number;
};

const beats = [
  { start: 122, end: 160, text: "kamu melihat kursi." },
  { start: 165, end: 191, text: "Otak harus berpikir." },
  { start: 191, end: 228, text: "Ini benda apa?" },
  { start: 248, end: 277, text: "Apakah bisa diduduki?" },
  { start: 296, end: 310, text: "Apakah kuat?" },
  { start: 324, end: 361, text: "Apakah ini kursi?" },
  { start: 367, end: 418, text: "Kamu nggak akan selesai-selesai." },
  {
    start: 426,
    end: 496,
    text: "Makanya otak menggunakan pengalaman sebelumnya",
  },
  { start: 496, end: 551, text: "untuk membuat prediksi dengan cepat." },
  { start: 569, end: 624, text: "Masalahnya, prediksi bisa salah." },
  { start: 636, end: 697, text: "Dan ketika prediksi itu salah," },
  { start: 715, end: 763, text: "kita bisa mengalami hal-hal aneh." },
  { start: 780, end: 864, text: "Salah satunya adalah dejavu." },
  { start: 878, end: 919, text: "Kamu sedang berada di tempat baru." },
  { start: 935, end: 989, text: "Tiba-tiba muncul perasaan," },
  { start: 991, end: 1027, text: "gue pernah mengalami ini." },
  { start: 1042, end: 1067, text: "Padahal belum tentu." },
  {
    start: 1067,
    end: 1163,
    text: "Otak mungkin menemukan kemiripan antara situasi sekarang",
  },
  { start: 1163, end: 1213, text: "dengan pengalaman sebelumnya." },
  { start: 1219, end: 1280, text: "Mungkin tata letak ruangan mirip," },
  { start: 1298, end: 1319, text: "suasananya mirip," },
  { start: 1338, end: 1360, text: "pencahayaan mirip," },
  { start: 1372, end: 1448, text: "atau bahkan perasaan yang kamu rasakan" },
  { start: 1448, end: 1497, text: "mirip dengan pengalaman lama." },
  { start: 1511, end: 1548, text: "Otak kemudian memberi sinyal," },
];

const reveal = (frame: number, cue: number, duration = 30) =>
  interpolate(frame, [cue, cue + Math.max(0.001, duration)], [0, 1], CLAMP);

const settle = (frame: number, cue: number, fps: number) =>
  spring({
    frame: Math.max(0, frame - cue),
    fps,
    config: { damping: 18, mass: 0.8, stiffness: 85 },
  });

const KineticText: React.FC<{
  text: string;
  frame: number;
  fps: number;
  cue: number;
  size?: number;
  color?: string;
  weight?: number;
  stagger?: number;
}> = ({
  text,
  frame,
  fps,
  cue,
  size = 46,
  color = C.ink,
  weight = 700,
  stagger = 3,
}) => (
  <span
    style={{
      display: "inline-flex",
      flexWrap: "wrap",
      gap: "0.26em",
      fontFamily: FONT,
      fontSize: size,
      fontWeight: weight,
      color,
      lineHeight: 1.2,
    }}
  >
    {text.split(" ").map((word, index) => {
      const start = cue + index * stagger;
      const p = settle(frame, start, fps);
      return (
        <span
          key={`${word}-${index}`}
          style={{
            display: "inline-block",
            opacity: reveal(frame, start, 9),
            transform: `translateY(${(1 - p) * 20}px)`,
          }}
        >
          {word}
        </span>
      );
    })}
  </span>
);

const Tag: React.FC<{
  children: React.ReactNode;
  color?: string;
  dark?: boolean;
}> = ({ children, color = C.yellow, dark = false }) => (
  <div
    style={{
      display: "inline-block",
      padding: "10px 15px",
      background: color,
      color: dark ? C.white : C.ink,
      fontFamily: MONO,
      fontWeight: 700,
      fontSize: 19,
      letterSpacing: 1.5,
    }}
  >
    {children}
  </div>
);

const DrawPath: React.FC<{
  d: string;
  progress: number;
  color?: string;
  width?: number;
  opacity?: number;
  dashed?: boolean;
}> = ({
  d,
  progress,
  color = C.ink,
  width = 4,
  opacity = 1,
  dashed = false,
}) => (
  <path
    d={d}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray={dashed ? "0.025 0.025" : 1}
    strokeDashoffset={dashed ? 0 : 1 - progress}
    opacity={dashed ? opacity * progress : opacity}
  />
);

const Chair: React.FC<{
  color?: string;
  fill?: string;
  wire?: boolean;
}> = ({ color = C.ink, fill = C.yellow, wire = false }) => (
  <g stroke={color} strokeWidth={7} strokeLinejoin="round">
    <path
      d="M48 20 L210 20 L225 170 L68 170 Z"
      fill={wire ? "none" : fill}
    />
    <path
      d="M68 170 L225 170 L278 221 L99 221 Z"
      fill={wire ? "none" : C.white}
    />
    <path d="M100 221 L85 355 M270 221 L290 355 M74 174 L43 300 M221 170 L228 290" />
    <path d="M76 63 L210 63 M81 104 L214 104" strokeWidth={3} opacity={0.35} />
  </g>
);

const Brain: React.FC<{
  frame: number;
  active?: boolean;
  error?: boolean;
}> = ({ frame, active = true, error = false }) => {
  const nodes = [
    [75, 112],
    [125, 66],
    [168, 112],
    [224, 60],
    [259, 120],
    [207, 180],
    [118, 179],
    [294, 181],
    [170, 228],
  ];
  const links = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [2, 4],
    [2, 6],
    [4, 5],
    [4, 7],
    [5, 6],
    [5, 8],
    [6, 8],
    [7, 8],
  ];
  const accent = error ? C.red : C.blue;
  return (
    <g>
      <path
        d="M170 30 C137 4 90 20 81 49 C40 46 19 79 29 111
           C2 140 20 184 51 191 C50 227 90 250 122 240
           C144 267 187 269 207 246 C246 259 279 238 286 213
           C322 210 344 173 328 143 C350 106 325 66 297 65
           C287 29 251 16 222 30 C204 13 183 16 170 30 Z"
        fill={C.white}
        stroke={C.ink}
        strokeWidth={4}
      />
      <path
        d="M170 31 C152 70 183 100 163 133 C143 169 183 203 171 251
           M82 50 C112 67 92 91 62 100
           M31 143 C68 129 96 145 89 178
           M53 192 C93 185 114 212 122 240
           M224 31 C212 73 259 69 268 97
           M328 143 C283 131 258 152 270 181
           M208 246 C227 207 204 201 217 171"
        fill="none"
        stroke={C.line}
        strokeWidth={5}
        strokeLinecap="round"
      />
      {links.map(([a, b], index) => (
        <line
          key={index}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke={accent}
          strokeWidth={2}
          opacity={active ? 0.26 : 0.08}
        />
      ))}
      {nodes.map(([x, y], index) => {
        const phase = (Math.sin(frame / 16 - index * 0.9) + 1) / 2;
        return (
          <g key={index}>
            <circle
              cx={x}
              cy={y}
              r={active ? 9 + phase * 8 : 8}
              fill={accent}
              opacity={active ? 0.08 + phase * 0.12 : 0.04}
            />
            <circle
              cx={x}
              cy={y}
              r={active ? 4 + phase * 2 : 4}
              fill={accent}
              opacity={active ? 0.55 + phase * 0.45 : 0.2}
            />
          </g>
        );
      })}
    </g>
  );
};

const Room: React.FC<{
  variant?: "present" | "memory";
  layout?: number;
  atmosphere?: number;
  light?: number;
}> = ({
  variant = "present",
  layout = 0,
  atmosphere = 0,
  light = 0,
}) => {
  const memory = variant === "memory";
  const accent = memory ? C.teal : C.blue;
  return (
    <g>
      <rect x={0} y={0} width={620} height={380} fill={memory ? "#EFEDE3" : "#F8F7F2"} />
      <path d="M0 0 L115 83 L505 83 L620 0" fill="#E8E4DA" />
      <path d="M0 380 L115 282 L505 282 L620 380" fill="#E1DDCF" />
      <rect x={115} y={83} width={390} height={199} fill={C.white} />
      <path
        d="M0 0 L115 83 V282 L0 380 M620 0 L505 83 V282 L620 380 M115 282 H505"
        fill="none"
        stroke="#B6B1A5"
        strokeWidth={2}
      />
      <rect x={memory ? 323 : 328} y={113} width={115} height={104} fill="#DCE8ED" stroke="#AEBCC1" strokeWidth={4} />
      <path d="M385 114 V216 M329 164 H438" stroke={C.white} strokeWidth={4} />
      <path
        d="M331 218 L439 218 L572 380 L276 380 Z"
        fill={C.yellow}
        opacity={0.045 + light * 0.3}
      />
      <rect x={165} y={129} width={77} height={63} fill={memory ? "#DADACD" : "#E3D5C6"} />
      <path d="M172 181 L194 151 L215 169 L234 143" fill="none" stroke="#B4A38E" strokeWidth={3} />
      <g transform={`translate(${memory ? 163 : 159}, 216) scale(.29)`}>
        <Chair fill={memory ? "#AFC7BE" : "#DDBF96"} color="#625F55" />
      </g>
      <ellipse cx={384} cy={311} rx={88} ry={20} fill="#C9C4B7" opacity={0.4} />
      <path d="M317 268 H450 L462 290 H305 Z" fill={memory ? "#B2B7A7" : "#BDAF99"} stroke="#797567" strokeWidth={2} />
      <path d="M318 288 L310 344 M449 289 L457 344" stroke="#797567" strokeWidth={5} />
      <path d="M77 218 V313 M57 244 Q40 209 77 226 Q101 186 104 225 Q100 249 77 244" fill="#A2B6A0" stroke="#7B967B" strokeWidth={3} />
      <path d="M58 290 H97 L90 322 H64 Z" fill="#B9A28C" />
      <rect x={0} y={0} width={620} height={380} fill={accent} opacity={atmosphere * 0.065} />
      <g opacity={layout}>
        <path d="M144 251 H261 V362 H144 Z M298 254 H467 V353 H298 Z" fill="none" stroke={accent} strokeWidth={3} strokeDasharray="9 7" />
        <path d="M155 346 H451" stroke={accent} strokeWidth={2} />
        <circle cx={203} cy={309} r={7} fill={accent} />
        <circle cx={382} cy={309} r={7} fill={accent} />
      </g>
      <g opacity={light}>
        <rect x={325} y={109} width={118} height={111} fill="none" stroke={C.yellow} strokeWidth={5} />
        <path d="M387 229 L408 266 M401 224 L435 255 M375 229 L381 268" stroke={C.yellow} strokeWidth={4} />
      </g>
    </g>
  );
};

const Background: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteLayer>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <pattern id="s03-paper-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0 H0 V48" fill="none" stroke={C.ink} strokeWidth={0.6} opacity={0.055} />
        </pattern>
        <radialGradient id="s03-paper-glow">
          <stop offset="0%" stopColor={C.yellow} stopOpacity={0.15} />
          <stop offset="100%" stopColor={C.yellow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill={C.paper} />
      <rect width="1920" height="1080" fill="url(#s03-paper-grid)" />
      <ellipse
        cx={970 + Math.sin(frame / 160) * 130}
        cy={435 + Math.cos(frame / 190) * 65}
        rx={710}
        ry={470}
        fill="url(#s03-paper-glow)"
      />
      <path d="M72 148 H1848 M72 902 H1848" stroke={C.line} />
      <path d="M72 132 V148 H88 M1832 148 H1848 V132 M72 918 V902 H88 M1832 902 H1848 V918" stroke={C.ink} strokeWidth={2} />
    </svg>
  </AbsoluteLayer>
);

const AbsoluteLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", inset: 0 }}>{children}</div>
);

const Inquiry: React.FC<MotionProps> = ({ frame, fps }) => {
  const questions = [
    { cue: 191, text: "Ini benda apa?", code: "IDENTIFIKASI" },
    { cue: 248, text: "Bisa diduduki?", code: "FUNGSI" },
    { cue: 296, text: "Apakah kuat?", code: "KEAMANAN" },
    { cue: 324, text: "Apakah ini kursi?", code: "KESIMPULAN" },
  ];
  const overload = reveal(frame, 367, 34);

  return (
    <AbsoluteLayer>
      <div style={{ position: "absolute", top: 186, left: 100 }}>
        {frame >= 122 && (
          <KineticText text="Melihat ≠ sekadar menerima." cue={122} frame={frame} fps={fps} size={51} />
        )}
      </div>

      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, fontFamily: FONT }}
      >
        {frame >= 122 && (
          <g
            opacity={reveal(frame, 122, 22)}
            transform={`translate(182 ${366 + (1 - settle(frame, 122, fps)) * 30})`}
          >
            <ellipse cx={170} cy={384} rx={170} ry={22} fill={C.ink} opacity={0.065} />
            <g transform="translate(18 0) scale(1.06)">
              <Chair />
            </g>
            <circle cx={162} cy={176} r={222} fill="none" stroke={C.line} strokeWidth={2} />
            <g transform={`rotate(${(frame - 122) * 0.18}, 162, 176)`}>
              <path d="M162 -46 A222 222 0 0 1 376 117" fill="none" stroke={C.blue} strokeWidth={3} />
              <circle cx={376} cy={117} r={5} fill={C.blue} />
            </g>
            <text x={-5} y={450} fontSize={19} fontFamily={MONO} fill={C.muted}>01 / INPUT VISUAL</text>
          </g>
        )}

        {frame >= 165 && (
          <g opacity={reveal(frame, 165, 20)}>
            <DrawPath d="M590 534 H750" progress={reveal(frame, 165, 28)} color={C.blue} />
            <path d="M738 525 L751 534 L738 543" fill="none" stroke={C.blue} strokeWidth={3} />
            <g transform={`translate(740 ${395 + (1 - settle(frame, 165, fps)) * 22}) scale(.9)`}>
              <Brain frame={frame} error={frame >= 367} />
            </g>
            <text x={760} y={735} fontSize={23} fontWeight={700}>OTAK HARUS BERPIKIR</text>
          </g>
        )}

        {questions.map((q, i) => {
          if (frame < q.cue) return null;
          const y = 331 + i * 112;
          return (
            <g key={q.cue} opacity={reveal(frame, q.cue, 12)}>
              <DrawPath
                d={`M1060 527 C1115 527 1090 ${y + 37} 1150 ${y + 37}`}
                progress={reveal(frame, q.cue, 24)}
                color={frame >= 367 ? C.red : C.ink}
                width={2}
              />
              <g transform={`translate(${1150 + (1 - settle(frame, q.cue, fps)) * 20},${y})`}>
                <rect width={530} height={83} fill={C.white} stroke={C.line} strokeWidth={2} />
                <rect width={6} height={83} fill={frame >= 367 ? C.red : C.yellow} />
                <text x={25} y={27} fill={C.muted} fontSize={13} fontFamily={MONO} letterSpacing={2}>{q.code}</text>
                <text x={25} y={61} fontSize={31} fontWeight={700}>{q.text}</text>
                <text x={484} y={55} fontSize={30} fill={C.muted}>?</text>
              </g>
            </g>
          );
        })}

        {frame >= 367 && (
          <g>
            <DrawPath
              d="M1712 755 C1818 781 1827 323 1689 305 C1609 286 1215 283 1132 311"
              progress={overload}
              color={C.red}
              width={5}
            />
            <path d="M1147 297 L1132 311 L1153 316" fill="none" stroke={C.red} strokeWidth={4} opacity={overload} />
            <text x={1158} y={831} fill={C.red} fontSize={24} fontWeight={700} opacity={overload}>PERTANYAAN TANPA AKHIR ↻</text>
          </g>
        )}
      </svg>
    </AbsoluteLayer>
  );
};

const Prediction: React.FC<MotionProps> = ({ frame, fps }) => {
  const wrong = frame >= 569;
  return (
    <AbsoluteLayer>
      <div style={{ position: "absolute", left: 100, top: 186 }}>
        <KineticText text="Pengalaman menjadi jalan pintas." cue={426} frame={frame} fps={fps} size={51} stagger={5} />
      </div>

      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ fontFamily: FONT }}>
        <g opacity={reveal(frame, 426, 24)}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${142 + i * 21},${360 - i * 18}) rotate(${(i - 1) * 3}, 175, 170)`}>
              <rect width={350} height={348} fill={C.white} stroke={C.line} strokeWidth={2} />
              <rect x={20} y={20} width={310} height={35} fill={i === 2 ? C.yellow : "#E7E3D8"} />
              <path d="M22 82 H325 M22 94 H255" stroke={C.line} strokeWidth={3} />
              <g transform="translate(113 116) scale(.46)">
                <Chair fill="#DCD7C6" color="#69675E" />
              </g>
              <text x={23} y={324} fontSize={14} fontFamily={MONO}>ARSIP PENGALAMAN / {String(i + 1).padStart(2, "0")}</text>
            </g>
          ))}
          <text x={160} y={784} fontSize={23} fontWeight={700}>PENGALAMAN SEBELUMNYA</text>
          <DrawPath d="M583 535 H774" progress={reveal(frame, 426, 55)} color={C.blue} />
          <g transform="translate(771 392) scale(1.05)">
            <Brain frame={frame} error={wrong} />
          </g>
          <text x={878} y={784} fontSize={23} fontWeight={700}>MODEL INTERNAL</text>
        </g>

        {frame >= 496 && (
          <g opacity={reveal(frame, 496, 24)}>
            <DrawPath d="M1143 535 H1322" progress={reveal(frame, 496, 32)} color={wrong ? C.red : C.teal} />
            <g transform={`translate(1320 ${345 + (1 - settle(frame, 496, fps)) * 25})`}>
              <rect width={424} height={358} fill={C.white} stroke={wrong ? C.red : C.teal} strokeWidth={3} />
              <rect x={0} y={0} width={424} height={47} fill={wrong ? C.red : C.teal} />
              <text x={22} y={31} fontSize={18} fontFamily={MONO} fill={C.white}>PREDIKSI</text>
              <g transform="translate(141 72) scale(.43)">
                <Chair fill={wrong ? "#F5C9C8" : "#D6E6D7"} color={wrong ? C.red : C.teal} />
              </g>
              <text x={212} y={291} textAnchor="middle" fontSize={37} fontWeight={700}>“Ini kursi.”</text>
              <text x={212} y={326} textAnchor="middle" fontSize={16} fontFamily={MONO} fill={C.muted}>HASIL, BUKAN KEPASTIAN</text>
            </g>
          </g>
        )}

        {frame >= 569 && (
          <g opacity={reveal(frame, 569, 20)}>
            <DrawPath
              d="M1353 640 C1300 572 1353 493 1550 485 C1764 477 1798 571 1721 639 C1659 692 1388 697 1349 636"
              progress={reveal(frame, 569, 43)}
              color={C.red}
              width={7}
            />
            <text x={1325} y={759} fontSize={27} fill={C.red} fontWeight={700}>PREDIKSI BISA SALAH.</text>
          </g>
        )}

        {frame >= 636 && (
          <g opacity={reveal(frame, 636, 24)}>
            <DrawPath
              d="M1483 779 C1450 852 1110 854 992 719"
              progress={reveal(frame, 636, 45)}
              color={C.red}
              dashed
              width={3}
            />
            <circle cx={992} cy={719} r={8} fill={C.red} />
          </g>
        )}

        {frame >= 715 && (
          <g opacity={reveal(frame, 715, 22)}>
            <rect x={756} y={811} width={397} height={49} fill={C.yellow} />
            <text x={954} y={843} textAnchor="middle" fontSize={22} fontWeight={700}>PERSEPSI TERASA ANEH</text>
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M${815 + i * 110} 320 l14 -13 l14 13 l14 -13`}
                fill="none"
                stroke={C.red}
                strokeWidth={3}
                opacity={0.5 + 0.3 * Math.sin(frame / 15 + i)}
              />
            ))}
          </g>
        )}
      </svg>
    </AbsoluteLayer>
  );
};

const DejaVu: React.FC<MotionProps> = ({ frame, fps }) => (
  <AbsoluteLayer>
    <div style={{ position: "absolute", left: 100, top: 178 }}>
      <Tag>CONTOH / 01</Tag>
      <div style={{ marginTop: 18 }}>
        <KineticText text="DÉJÀ VU" cue={780} frame={frame} fps={fps} size={104} stagger={7} />
      </div>
      <div
        style={{
          height: 12,
          width: 443 * reveal(frame, 804, 43),
          marginTop: 2,
          background: C.yellow,
        }}
      />
    </div>

    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ fontFamily: FONT }}>
      <g opacity={reveal(frame, 780, 34)} transform="translate(1180 268)">
        <circle cx={228} cy={226} r={211} fill="none" stroke={C.line} strokeWidth={2} />
        <g transform={`rotate(${(frame - 780) * 0.11},228,226)`}>
          <path d="M228 15 A211 211 0 0 1 439 226" stroke={C.blue} strokeWidth={4} fill="none" />
          <path d="M228 437 A211 211 0 0 1 17 226" stroke={C.teal} strokeWidth={4} fill="none" />
        </g>
        <g transform="translate(72 92) scale(.9)">
          <Brain frame={frame} active={frame >= 935} />
        </g>
        <text x={228} y={490} textAnchor="middle" fontFamily={MONO} fontSize={18} fill={C.muted}>RASA FAMILIAR ≠ BUKTI</text>
      </g>

      {frame >= 878 && (
        <g opacity={reveal(frame, 878, 27)} transform="translate(104 419)">
          <rect x={-8} y={-8} width={730} height={402} fill={C.white} stroke={C.line} strokeWidth={2} />
          <g transform="scale(1.15 .99)">
            <Room />
          </g>
          <rect x={19} y={18} width={184} height={33} fill={C.blue} />
          <text x={34} y={41} fill={C.white} fontSize={17} fontFamily={MONO}>TEMPAT BARU</text>
        </g>
      )}

      {frame >= 935 && (
        <g opacity={reveal(frame, 935, 30)}>
          <DrawPath d="M838 609 C974 609 1010 513 1232 513" progress={reveal(frame, 935, 35)} color={C.teal} width={3} />
          <circle cx={1070} cy={562} r={33 + Math.sin((frame - 935) / 18) * 4} fill={C.teal} opacity={0.08} />
          <circle cx={1070} cy={562} r={8} fill={C.teal} />
          <text x={904} y={650} fontSize={18} fontFamily={MONO} fill={C.teal}>RASA FAMILIAR</text>
        </g>
      )}
    </svg>

    {frame >= 991 && (
      <div
        style={{
          position: "absolute",
          left: 889,
          top: 706,
          padding: "19px 24px",
          background: C.yellow,
          transform: `rotate(-2deg) translateY(${(1 - settle(frame, 991, fps)) * 16}px)`,
          opacity: reveal(frame, 991, 15),
        }}
      >
        <KineticText text="“Gue pernah mengalami ini.”" frame={frame} fps={fps} cue={991} size={36} stagger={3} />
      </div>
    )}

    {frame >= 1042 && (
      <div style={{ position: "absolute", left: 924, top: 812 }}>
        <KineticText text="Padahal belum tentu." cue={1042} frame={frame} fps={fps} size={30} color={C.red} stagger={2} />
      </div>
    )}
  </AbsoluteLayer>
);

const Comparison: React.FC<MotionProps> = ({ frame, fps }) => {
  const layout = reveal(frame, 1219, 35);
  const atmosphere = reveal(frame, 1298, 24);
  const lighting = reveal(frame, 1338, 24);
  const feeling = reveal(frame, 1372, 42);
  const matched = reveal(frame, 1448, 34);
  const signal = reveal(frame, 1511, 28);

  const chips = [
    { cue: 1219, x: 271, text: "TATA LETAK", color: C.blue },
    { cue: 1298, x: 619, text: "SUASANA", color: C.teal },
    { cue: 1338, x: 967, text: "PENCAHAYAAN", color: "#927A00" },
    { cue: 1372, x: 1315, text: "PERASAAN", color: C.red },
  ];

  return (
    <AbsoluteLayer>
      <div style={{ position: "absolute", left: 100, top: 186 }}>
        <KineticText text="Mirip, bukan berarti sama." cue={1067} frame={frame} fps={fps} size={51} stagger={5} />
      </div>

      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ fontFamily: FONT }}>
        <g opacity={reveal(frame, 1067, 26)}>
          <text x={117} y={317} fontSize={18} fontFamily={MONO} fill={C.blue} letterSpacing={2}>01 / SITUASI SEKARANG</text>
          <rect x={108} y={344} width={722} height={454} fill={C.white} stroke={C.blue} strokeWidth={2} />
          <g transform="translate(119 355) scale(1.127 1.134)">
            <Room layout={layout} atmosphere={atmosphere} light={lighting} />
          </g>
          <rect x={131} y={371} width={83} height={30} fill={C.blue} />
          <text x={144} y={392} fill={C.white} fontFamily={MONO} fontSize={15}>BARU</text>
        </g>

        {frame >= 1163 && (
          <g opacity={reveal(frame, 1163, 30)}>
            <text x={1109} y={317} fontSize={18} fontFamily={MONO} fill={C.teal} letterSpacing={2}>02 / PENGALAMAN SEBELUMNYA</text>
            <rect x={1100} y={344} width={722} height={454} fill={C.white} stroke={C.teal} strokeWidth={2} />
            <g transform="translate(1111 355) scale(1.127 1.134)">
              <Room variant="memory" layout={layout} atmosphere={atmosphere} light={lighting} />
            </g>
            <rect x={1123} y={371} width={170} height={30} fill={C.teal} />
            <text x={1136} y={392} fill={C.white} fontFamily={MONO} fontSize={15}>MEMORI LAMA</text>
            <DrawPath d="M850 565 H922 M1001 565 H1080" progress={reveal(frame, 1163, 35)} color={C.ink} width={2} />
            <circle cx={960} cy={565} r={40} fill={C.yellow} />
            <text x={960} y={577} textAnchor="middle" fontSize={36} fontWeight={700}>≈</text>
          </g>
        )}

        {frame >= 1219 && (
          <g opacity={layout}>
            <DrawPath d="M349 707 C549 822 1227 822 1341 707" progress={layout} color={C.blue} width={2} dashed />
            <circle cx={349} cy={707} r={6} fill={C.blue} />
            <circle cx={1341} cy={707} r={6} fill={C.blue} />
          </g>
        )}

        {frame >= 1372 && (
          <g opacity={feeling}>
            <path d="M291 742 H332 L342 727 L354 754 L369 728 L380 742 H464" fill="none" stroke={C.red} strokeWidth={3} />
            <path d="M1283 742 H1324 L1334 727 L1346 754 L1361 728 L1372 742 H1456" fill="none" stroke={C.red} strokeWidth={3} />
            <ellipse cx={379} cy={739} rx={119} ry={38} fill="none" stroke={C.red} strokeWidth={2} opacity={0.3} />
            <ellipse cx={1371} cy={739} rx={119} ry={38} fill="none" stroke={C.red} strokeWidth={2} opacity={0.3} />
          </g>
        )}

        {chips.map((chip) => {
          if (frame < chip.cue) return null;
          return (
            <g key={chip.cue} opacity={reveal(frame, chip.cue, 18)} transform={`translate(${chip.x},${823 + (1 - settle(frame, chip.cue, fps)) * 12})`}>
              <rect width={288} height={49} fill={C.white} stroke={chip.color} strokeWidth={1.5} />
              <circle cx={24} cy={24} r={5} fill={chip.color} />
              <text x={43} y={31} fontFamily={MONO} fontSize={17} fontWeight={700} fill={chip.color}>{chip.text}</text>
            </g>
          );
        })}

        {frame >= 1448 && (
          <g opacity={matched}>
            <DrawPath
              d="M894 557 C891 507 1018 504 1027 559 C1036 615 898 632 889 567"
              progress={matched}
              color={C.red}
              width={4}
            />
            <rect x={839} y={648} width={243} height={57} fill={C.yellow} />
            <text x={960} y={672} textAnchor="middle" fontFamily={MONO} fontSize={13}>POLA SERUPA</text>
            <text x={960} y={696} textAnchor="middle" fontSize={19} fontWeight={700}>MEMORI TERPICU</text>
          </g>
        )}

        {frame >= 1511 && (
          <g opacity={signal}>
            <rect x={811} y={359} width={298} height={117} rx={3} fill={C.ink} />
            <text x={960} y={393} textAnchor="middle" fontFamily={MONO} fontSize={16} fill={C.yellow}>SINYAL DARI OTAK</text>
            <path d="M845 433 H873 L886 411 L902 450 L921 415 L938 433 H1075" fill="none" stroke={C.yellow} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - signal} />
            <DrawPath d="M960 476 V514" progress={signal} color={C.ink} width={3} />
          </g>
        )}
      </svg>
    </AbsoluteLayer>
  );
};

const Overlay: React.FC<MotionProps> = ({ frame, fps }) => {
  const active = beats.reduce<(typeof beats)[number] | null>(
    (previous, beat) => (frame >= beat.start ? beat : previous),
    null,
  );
  const act =
    frame < 426 ? "01 / MELIHAT" :
    frame < 780 ? "02 / MEMPREDIKSI" :
    frame < 1067 ? "03 / MERASA FAMILIAR" :
    "04 / MENCARI KEMIRIPAN";

  return (
    <AbsoluteLayer>
      <div
        style={{
          position: "absolute",
          left: 74,
          right: 74,
          top: 58,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 19 }}>
          <div style={{ width: 53, height: 53, background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 25 }}>03</div>
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: 2 }}>CARA OTAK MEMBACA DUNIA</div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 16, color: C.muted, letterSpacing: 1.5 }}>{act}</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 101,
          right: 101,
          top: 942,
          height: 81,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {active && (
          <div key={active.start}>
            <KineticText
              text={active.text}
              frame={frame}
              fps={fps}
              cue={active.start}
              size={36}
              weight={500}
              stagger={Math.min(3, Math.max(1, Math.floor((active.end - active.start) / (active.text.split(" ").length * 2))))}
            />
          </div>
        )}
      </div>

      <div style={{ position: "absolute", left: 73, bottom: 28, fontFamily: MONO, fontSize: 12, color: C.muted, letterSpacing: 1.8 }}>
        PENJELASAN KONSEPTUAL · ILUSTRASI SKEMATIS
      </div>
      <div style={{ position: "absolute", right: 74, bottom: 28, fontFamily: MONO, fontSize: 12, color: C.muted }}>
        03 / 11
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 5,
          width: `${interpolate(frame, [0, Math.max(0 + 0.001, 1548)], [0, 100], CLAMP)}%`,
          background: C.ink,
        }}
      />
    </AbsoluteLayer>
  );
};

export const Scene_03: React.FC = () => {
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
        color: C.ink,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: (width - 1920 * scale) / 2,
          top: (height - 1080 * scale) / 2,
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <Sequence from={0} durationInFrames={1549} layout="none">
          <Background frame={frame} />
        </Sequence>

        <Sequence from={0} durationInFrames={426} layout="none">
          <Inquiry frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={426} durationInFrames={354} layout="none">
          <Prediction frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={780} durationInFrames={287} layout="none">
          <DejaVu frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={1067} durationInFrames={482} layout="none">
          <Comparison frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={0} durationInFrames={1549} layout="none">
          <Overlay frame={frame} fps={fps} />
        </Sequence>
      </div>
    </div>
  );
};