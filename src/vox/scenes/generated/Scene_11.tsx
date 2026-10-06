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
  line: "#D8D3C9",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
};

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const BEATS = [
  { start: 22, end: 88, text: "otak kita bukan sedang berusaha menipu kita." },
  { start: 101, end: 168, text: "Otak hanya berusaha membuat dunia yang sangat rumit," },
  { start: 179, end: 231, text: "menjadi cukup sederhana untuk kita pahami." },
  { start: 253, end: 273, text: "Masalahnya," },
  { start: 285, end: 362, text: "kadang otak terlalu percaya diri dengan tebakannya sendiri." },
  { start: 377, end: 439, text: "Dan mungkin bagian paling anehnya adalah," },
  { start: 453, end: 498, text: "kita tidak sadar sedang ditebak." },
  { start: 511, end: 536, text: "Kita cuma merasa," },
  { start: 554, end: 567, text: "yah," },
  { start: 578, end: 621, text: "memang begitulah kenyataannya." },
  { start: 639, end: 652, text: "Padahal," },
  { start: 675, end: 715, text: "dibalik setiap hal yang kita lihat," },
  { start: 737, end: 742, text: "ingat," },
  { start: 750, end: 784, text: "dan rasakan," },
  { start: 784, end: 828, text: "ada otak yang terus bekerja," },
  { start: 840, end: 850, text: "menebak," },
  { start: 866, end: 883, text: "memilih," },
  { start: 902, end: 917, text: "menghubungkan," },
  { start: 929, end: 954, text: "dan sesekali," },
  { start: 964, end: 976, text: "salah." },
  { start: 990, end: 1012, text: "Jadi lain kali," },
  { start: 1027, end: 1081, text: "kalau kamu yakin banget terhadap sesuatu," },
  { start: 1102, end: 1142, text: "coba berhenti sebentar dan tanya," },
  { start: 1162, end: 1200, text: "ini benar-benar yang terjadi?" },
  { start: 1228, end: 1290, text: "Atau ini cuma versi yang dibuat otakku?" },
  { start: 1304, end: 1327, text: "Karena ternyata," },
  { start: 1345, end: 1392, text: "kadang yang paling mudah menipu kita," },
  { start: 1407, end: 1431, text: "bukan orang lain," },
  { start: 1442, end: 1473, text: "tapi otak kita sendiri." },
  { start: 1488, end: 1503, text: "Ini Mino." },
  { start: 1520, end: 1539, text: "Tetap penasaran?" },
];

const progress = (frame: number, cue: number, duration = 24) =>
  interpolate(frame, [cue, cue + Math.max(0.001, duration)], [0, 1], CLAMP);

const entrance = (frame: number, cue: number, fps: number) =>
  spring({
    frame: Math.max(0, frame - cue),
    fps,
    config: { damping: 18, mass: 0.8, stiffness: 85 },
  });

const Reveal: React.FC<{
  frame: number;
  cue: number;
  fps: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ frame, cue, fps, children, style }) => {
  if (frame < cue) return null;
  const s = entrance(frame, cue, fps);
  return (
    <div
      style={{
        opacity: progress(frame, cue, 15),
        transform: `translateY(${(1 - s) * 28}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Words: React.FC<{
  text: string;
  frame: number;
  cue: number;
  fps: number;
  size?: number;
  color?: string;
  spread?: number;
  weight?: number;
}> = ({
  text,
  frame,
  cue,
  fps,
  size = 76,
  color = C.ink,
  spread = 3,
  weight = 800,
}) => (
  <span
    style={{
      fontSize: size,
      lineHeight: 1.06,
      fontWeight: weight,
      letterSpacing: size > 50 ? "-0.045em" : "-0.015em",
      color,
    }}
  >
    {text.split(" ").map((word, i) => {
      const start = cue + i * spread;
      const s = entrance(frame, start, fps);
      return (
        <span
          key={`${word}-${i}`}
          style={{
            display: "inline-block",
            marginRight: "0.23em",
            opacity: frame < start ? 0 : progress(frame, start, 10),
            transform: `translateY(${(1 - s) * 24}px)`,
          }}
        >
          {word}
        </span>
      );
    })}
  </span>
);

const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = C.muted,
}) => (
  <div
    style={{
      fontSize: 19,
      fontWeight: 700,
      letterSpacing: "0.17em",
      textTransform: "uppercase",
      color,
      marginBottom: 26,
    }}
  >
    {children}
  </div>
);

const Page: React.FC<{
  frame: number;
  start: number;
  end: number;
  children: React.ReactNode;
}> = ({ frame, start, end, children }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity: interpolate(frame, [end - 9, Math.max(end - 9 + 0.001, end)], [1, 0], CLAMP),
      transform: `translateY(${interpolate(frame, [end - 9, Math.max(end - 9 + 0.001, end)],
        [0, -12],
        CLAMP,
      )}px)`,
      pointerEvents: "none",
    }}
    data-scene-start={start}
  >
    {children}
  </div>
);

const Brain: React.FC<{
  frame: number;
  cue: number;
  fps: number;
  accent?: string;
  errorCue?: number;
}> = ({ frame, cue, fps, accent = C.teal, errorCue = 100000 }) => {
  const grow = progress(frame, cue, 45);
  const neurons = [
    [116, 211], [166, 139], [230, 98], [297, 112],
    [365, 145], [394, 213], [348, 269], [272, 249],
    [213, 295], [150, 267], [214, 188], [301, 184],
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    [6, 7], [7, 8], [8, 9], [9, 0], [1, 10], [10, 11],
    [11, 4], [10, 8], [11, 7], [2, 10], [0, 10], [5, 11],
  ];
  return (
    <svg viewBox="0 0 510 410" style={{ width: "100%", overflow: "visible" }}>
      <path
        d="M111 285 C64 268 56 225 77 199 C58 166 83 127 115 126
           C111 85 145 57 183 69 C208 33 251 36 274 62
           C310 39 353 55 366 86 C410 80 443 112 437 148
           C478 174 472 214 447 234 C463 268 435 306 400 310
           C374 346 330 355 296 329 C258 357 217 344 197 320
           C159 337 125 315 111 285 Z"
        fill={C.paper}
        stroke={C.ink}
        strokeWidth="3"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - grow}
        fillOpacity={grow}
      />
      <path
        d="M272 64 C249 102 279 124 259 157 C237 192 274 205 255 239
           C236 272 267 298 296 329 M114 128 C145 142 150 168 130 194
           M368 88 C342 116 362 145 391 154 M113 285 C146 255 170 283 196 319
           M400 309 C373 284 380 249 411 235"
        fill="none"
        stroke={C.line}
        strokeWidth="3"
        opacity={grow}
      />
      <path
        d="M295 330 C308 355 312 371 308 389 L333 389 C337 363 330 350 324 341"
        fill={C.paper}
        stroke={C.ink}
        strokeWidth="3"
        opacity={grow}
      />
      {edges.map(([a, b], i) => {
        const p = progress(frame, cue + 12 + i * 2, 28);
        const wrong = frame >= errorCue && i === 12;
        return (
          <path
            key={i}
            d={`M${neurons[a][0]} ${neurons[a][1]} Q255 ${145 + (i % 4) * 32} ${neurons[b][0]} ${neurons[b][1]}`}
            fill="none"
            stroke={wrong ? C.red : accent}
            strokeWidth={wrong ? 5 : 2.3}
            opacity={wrong ? 0.95 : 0.38}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - p}
          />
        );
      })}
      {neurons.map(([x, y], i) => {
        const p = progress(frame, cue + 14 + i * 3, 16);
        const pulse = 0.5 + 0.5 * Math.sin((frame - cue) / 17 - i);
        return (
          <g key={i} opacity={p}>
            <circle cx={x} cy={y} r={8 + pulse * 7} fill={accent} opacity={0.1} />
            <circle cx={x} cy={y} r={4 + pulse * 1.5} fill={accent} />
            <circle cx={x} cy={y} r={1.5} fill={C.paper} />
          </g>
        );
      })}
      <circle
        cx="255"
        cy="202"
        r="171"
        fill="none"
        stroke={C.line}
        strokeWidth="1"
        strokeDasharray="3 12"
        opacity={progress(frame, cue + 10, 30) * 0.5}
      />
    </svg>
  );
};

const Marker: React.FC<{
  frame: number;
  cue: number;
  style?: React.CSSProperties;
}> = ({ frame, cue, style }) => (
  <svg viewBox="0 0 600 160" style={{ width: "100%", ...style }}>
    <path
      d="M550 46 C470 -1 84 2 34 64 C-12 126 133 154 317 139
         C518 148 601 100 552 52 C530 27 491 18 446 17"
      fill="none"
      stroke={C.red}
      strokeWidth="7"
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress(frame, cue, 25)}
    />
  </svg>
);

const Background: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: C.paper }}>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <pattern id="s11-grid" width="72" height="72" patternUnits="userSpaceOnUse">
          <path d="M72 0H0V72" fill="none" stroke={C.ink} strokeWidth="0.6" opacity="0.055" />
        </pattern>
        <pattern id="s11-grain" width="43" height="47" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="9" r="0.65" fill={C.ink} opacity="0.08" />
          <circle cx="29" cy="34" r="0.5" fill={C.ink} opacity="0.06" />
        </pattern>
      </defs>
      <rect width="1920" height="1080" fill="url(#s11-grid)" />
      <rect width="1920" height="1080" fill="url(#s11-grain)" />
      <circle
        cx={1530 + Math.sin(frame / 210) * 45}
        cy={320 + Math.cos(frame / 180) * 35}
        r="325"
        fill={C.yellow}
        opacity="0.035"
      />
      <path d="M88 94H1832 M88 914H1832" stroke={C.line} strokeWidth="1" />
      <path d="M88 76V112 M1832 76V112" stroke={C.ink} strokeWidth="2" />
    </svg>
  </div>
);

const Caption: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const index = BEATS.findIndex(
    (beat, i) =>
      frame >= beat.start &&
      frame < (BEATS[i + 1]?.start ?? 1549),
  );
  if (index < 0 || index >= 29) return null;
  const beat = BEATS[index];
  const words = beat.text.split(" ");
  const spread = Math.min(4, (beat.end - beat.start) / Math.max(words.length, 1));
  const next = BEATS[index + 1]?.start ?? 1549;
  const opacity = interpolate(frame, [next - 4, Math.max(next - 4 + 0.001, next)], [1, 0], CLAMP);
  return (
    <div
      style={{
        position: "absolute",
        left: 175,
        right: 175,
        top: 958,
        textAlign: "center",
        opacity,
      }}
    >
      <Words
        text={beat.text}
        frame={frame}
        cue={beat.start}
        fps={fps}
        size={31}
        spread={spread}
        weight={500}
      />
    </div>
  );
};

const Simplification: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <Page frame={frame} start={0} end={253}>
    <div style={{ position: "absolute", left: 128, top: 208, width: 720 }}>
      <Reveal frame={frame} cue={22} fps={fps}>
        <Eyebrow>Kesimpulan / 01</Eyebrow>
      </Reveal>
      <Words text="Bukan menipu." frame={frame} cue={22} fps={fps} size={100} spread={7} />
      <Reveal frame={frame} cue={101} fps={fps} style={{ marginTop: 26 }}>
        <Words text="Menyederhanakan." frame={frame} cue={101} fps={fps} size={66} color={C.teal} />
      </Reveal>
      <Reveal frame={frame} cue={179} fps={fps} style={{ marginTop: 52 }}>
        <div
          style={{
            display: "inline-block",
            padding: "15px 23px",
            backgroundColor: C.yellow,
            fontSize: 28,
            fontWeight: 700,
            transform: "rotate(-1deg)",
          }}
        >
          Cukup sederhana untuk dipahami.
        </div>
      </Reveal>
    </div>
    <Reveal frame={frame} cue={22} fps={fps} style={{ position: "absolute", left: 1050, top: 212, width: 625 }}>
      <Brain frame={frame} cue={22} fps={fps} />
    </Reveal>
    <div style={{ position: "absolute", left: 950, top: 704 }}>
      <svg width="790" height="130" viewBox="0 0 790 130">
        {Array.from({ length: 13 }, (_, i) => (
          <path
            key={i}
            d={`M10 ${15 + i * 7} C105 ${20 + ((i * 23) % 90)} 130 ${125 - i * 7} 238 65`}
            fill="none"
            stroke={i % 3 === 0 ? C.blue : C.teal}
            strokeWidth="1.8"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - progress(frame, 101 + i * 2, 30)}
          />
        ))}
        <path
          d="M238 65H550"
          fill="none"
          stroke={C.ink}
          strokeWidth="3"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress(frame, 179, 25)}
        />
        <g opacity={progress(frame, 179, 18)}>
          <rect x="551" y="37" width="205" height="56" rx="3" fill={C.yellow} />
          <text x="653" y="73" textAnchor="middle" fontSize="23" fontWeight="700" fill={C.ink}>
            BISA DIPAHAMI
          </text>
        </g>
        <text x="16" y="125" fontSize="15" letterSpacing="2" fill={C.muted} opacity={progress(frame, 101, 20)}>
          DUNIA YANG RUMIT
        </text>
      </svg>
    </div>
  </Page>
);

const Confidence: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = progress(frame, 285, 58);
  return (
    <Page frame={frame} start={253} end={377}>
      <div style={{ position: "absolute", left: 128, top: 206, width: 720 }}>
        <Reveal frame={frame} cue={253} fps={fps}>
          <Eyebrow color={C.red}>Titik rawan</Eyebrow>
        </Reveal>
        <Words text="Masalahnya," frame={frame} cue={253} fps={fps} size={98} />
        <div style={{ marginTop: 30 }}>
          <Words text="terlalu percaya diri." frame={frame} cue={285} fps={fps} size={78} color={C.red} spread={6} />
        </div>
        <Reveal frame={frame} cue={285} fps={fps} style={{ marginTop: 42 }}>
          <div style={{ fontSize: 27, color: C.muted, borderLeft: `4px solid ${C.red}`, paddingLeft: 22 }}>
            Tebakan terasa seperti kepastian.
          </div>
        </Reveal>
      </div>
      <Reveal frame={frame} cue={285} fps={fps} style={{ position: "absolute", left: 1010, top: 192, width: 750 }}>
        <div style={{ background: "#FFFD F7".replace(" ", ""), border: `1px solid ${C.line}`, padding: 42, transform: "rotate(1.2deg)", boxShadow: "10px 12px 0 rgba(24,24,27,0.045)" }}>
          <Eyebrow>Model persepsi / ilustrasi konseptual</Eyebrow>
          <div style={{ height: 230 }}>
            <Brain frame={frame} cue={285} fps={fps} accent={C.blue} />
          </div>
          <div style={{ marginTop: 95, fontSize: 22, display: "flex", justifyContent: "space-between" }}>
            <span>TEBAKAN</span>
            <span style={{ fontWeight: 800, color: C.red }}>TERASA PASTI</span>
          </div>
          <div style={{ height: 17, marginTop: 18, backgroundColor: C.line }}>
            <div style={{ height: "100%", width: `${p * 100}%`, backgroundColor: C.yellow }} />
          </div>
          <div style={{ marginTop: 18, color: C.muted, fontSize: 17 }}>Rasa yakin ≠ bukti kebenaran</div>
        </div>
        <Marker frame={frame} cue={285} style={{ position: "absolute", width: 390, right: 8, bottom: 39 }} />
      </Reveal>
    </Page>
  );
};

const Reality: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <Page frame={frame} start={377} end={639}>
    <div style={{ position: "absolute", left: 128, top: 195, width: 730 }}>
      <Reveal frame={frame} cue={377} fps={fps}><Eyebrow>Yang paling aneh</Eyebrow></Reveal>
      <Words text="Tanpa kita sadari." frame={frame} cue={453} fps={fps} size={88} spread={5} />
      <Reveal frame={frame} cue={511} fps={fps} style={{ marginTop: 40 }}>
        <div style={{ color: C.muted, fontSize: 34 }}>Yang kita rasakan:</div>
      </Reveal>
      <Reveal frame={frame} cue={554} fps={fps} style={{ marginTop: 16 }}>
        <Words text="“Yah," frame={frame} cue={554} fps={fps} size={68} />
      </Reveal>
      <Reveal frame={frame} cue={578} fps={fps}>
        <Words text="memang begitulah kenyataannya.”" frame={frame} cue={578} fps={fps} size={62} spread={4} />
      </Reveal>
    </div>
    <Reveal frame={frame} cue={377} fps={fps} style={{ position: "absolute", left: 1050, top: 188, width: 655 }}>
      <svg viewBox="0 0 660 640" style={{ width: "100%" }}>
        <defs>
          <clipPath id="s11-room-clip"><rect x="65" y="78" width="530" height="388" /></clipPath>
        </defs>
        <rect x="47" y="59" width="566" height="425" fill="#FFFDF7" stroke={C.ink} strokeWidth="2" />
        <g clipPath="url(#s11-room-clip)">
          <path d="M65 78L228 187H431L595 78 M65 466L228 351H431L595 466 M228 187V351 M431 187V351" fill="none" stroke={C.line} strokeWidth="2" />
          <path d="M228 187H431V351H228Z" fill="#E9E5DB" stroke={C.ink} strokeWidth="1.5" />
          <path d="M65 466L228 351H431L595 466Z" fill="#DDD8CB" />
          <path d="M308 299L354 274L398 299L353 327Z M308 299V347L353 376V327 M353 376L398 346V299" fill={C.yellow} stroke={C.ink} strokeWidth="2.5" />
          <g opacity={progress(frame, 453, 24)}>
            <circle cx="330" cy="269" r="132" fill="none" stroke={C.blue} strokeWidth="1.4" strokeDasharray="5 9" />
            <circle cx="330" cy="269" r="180" fill="none" stroke={C.blue} strokeWidth="1" opacity="0.3" />
            <g transform={`rotate(${(frame - 453) * 0.42} 330 269)`}>
              <path d="M330 89A180 180 0 0 1 489 185" fill="none" stroke={C.blue} strokeWidth="5" />
              <path d="M330 269L330 89" stroke={C.blue} strokeWidth="1" opacity="0.5" />
            </g>
            <path d="M310 269H350 M330 249V289" stroke={C.blue} strokeWidth="2" />
          </g>
        </g>
        <g opacity={progress(frame, 453, 20)}>
          <rect x="378" y="39" width="232" height="44" fill={C.blue} />
          <text x="494" y="68" fill="white" fontSize="18" textAnchor="middle" fontWeight="700">PREDIKSI TAK TERLIHAT</text>
        </g>
        <g opacity={progress(frame, 578, 23)}>
          <rect x="96" y="519" width="467" height="64" fill={C.yellow} />
          <text x="329" y="559" fontSize="24" fontWeight="700" textAnchor="middle" fill={C.ink}>TERASA SEPERTI KENYATAAN</text>
          <path d="M329 484V519" stroke={C.ink} strokeWidth="2" />
        </g>
      </svg>
    </Reveal>
  </Page>
);

const Process: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const inputs = [
    { cue: 675, word: "LIHAT", color: C.blue },
    { cue: 737, word: "INGAT", color: C.teal },
    { cue: 750, word: "RASAKAN", color: C.red },
  ];
  const steps = [
    { cue: 840, word: "Menebak", color: C.blue },
    { cue: 866, word: "Memilih", color: C.teal },
    { cue: 902, word: "Menghubungkan", color: C.ink },
    { cue: 964, word: "Salah", color: C.red },
  ];
  return (
    <Page frame={frame} start={639} end={990}>
      <div style={{ position: "absolute", left: 128, top: 168 }}>
        <Words text="Padahal," frame={frame} cue={639} fps={fps} size={69} />
        <div style={{ marginTop: 15 }}>
          <Words text="ada kerja di baliknya." frame={frame} cue={784} fps={fps} size={65} spread={4} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 133, top: 382, width: 375 }}>
        {inputs.map((input, i) => (
          <Reveal key={input.word} frame={frame} cue={input.cue} fps={fps}>
            <div style={{ height: 98, marginBottom: 26, display: "flex", alignItems: "center", gap: 25, border: `1px solid ${C.line}`, background: "#FFFCF5", padding: "0 24px" }}>
              <svg width="58" height="58" viewBox="0 0 60 60">
                {i === 0 ? (
                  <><path d="M4 30Q30 2 56 30Q30 58 4 30Z" stroke={input.color} strokeWidth="3" fill="none" /><circle cx="30" cy="30" r="9" fill={input.color} /></>
                ) : i === 1 ? (
                  <><path d="M15 6H40L49 15V54H15Z M40 6V17H49 M23 27H40 M23 36H40 M23 45H35" fill="none" stroke={input.color} strokeWidth="3" /></>
                ) : (
                  <path d="M5 32H16L23 12L32 48L40 25L45 32H56" fill="none" stroke={input.color} strokeWidth="3" />
                )}
              </svg>
              <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.05em" }}>{input.word}</span>
            </div>
          </Reveal>
        ))}
      </div>
      <svg style={{ position: "absolute", left: 509, top: 377, width: 299, height: 383 }} viewBox="0 0 299 383">
        {inputs.map((item, i) => (
          <path key={i} d={`M0 ${54 + i * 125}C150 ${54 + i * 125} 149 186 299 186`} fill="none" stroke={item.color} strokeWidth="2" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress(frame, item.cue, 30)} />
        ))}
      </svg>
      <Reveal frame={frame} cue={675} fps={fps} style={{ position: "absolute", left: 780, top: 370, width: 572 }}>
        <Brain frame={frame} cue={675} fps={fps} errorCue={964} />
      </Reveal>
      <Reveal frame={frame} cue={784} fps={fps} style={{ position: "absolute", left: 872, top: 817 }}>
        <div style={{ fontSize: 18, letterSpacing: "0.15em", color: C.muted }}>OTAK TERUS BEKERJA</div>
      </Reveal>
      <div style={{ position: "absolute", left: 1390, top: 364, width: 378 }}>
        {steps.map((step, i) => (
          <Reveal key={step.word} frame={frame} cue={step.cue} fps={fps}>
            <div style={{ display: "flex", gap: 20, alignItems: "center", height: 88, marginBottom: 19, borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 17, fontFamily: "monospace", color: C.muted }}>0{i + 1}</span>
              <Words text={step.word} frame={frame} cue={step.cue} fps={fps} size={i === 2 ? 31 : 39} color={step.color} />
            </div>
          </Reveal>
        ))}
        <Reveal frame={frame} cue={929} fps={fps} style={{ position: "absolute", left: 47, top: 312 }}>
          <div style={{ color: C.muted, fontSize: 19 }}>dan sesekali...</div>
        </Reveal>
        <Marker frame={frame} cue={964} style={{ position: "absolute", width: 340, top: 307, left: -8 }} />
      </div>
    </Page>
  );
};

const Questions: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <Page frame={frame} start={990} end={1304}>
    <div style={{ position: "absolute", left: 128, top: 160 }}>
      <Words text="Jadi, lain kali..." frame={frame} cue={990} fps={fps} size={61} spread={4} />
      <div style={{ marginTop: 19 }}>
        <Words text="Yakin banget?" frame={frame} cue={1027} fps={fps} size={87} spread={7} />
      </div>
    </div>
    <Reveal frame={frame} cue={1027} fps={fps} style={{ position: "absolute", right: 156, top: 155, width: 314 }}>
      <svg viewBox="0 0 314 155" style={{ width: "100%" }}>
        <path d="M25 115A125 125 0 0 1 275 115" fill="none" stroke={C.line} strokeWidth="17" />
        <path d="M25 115A125 125 0 0 1 275 115" fill="none" stroke={C.yellow} strokeWidth="17" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress(frame, 1027, 42)} />
        <path d="M150 115L260 67" stroke={C.ink} strokeWidth="4" transform={`rotate(${interpolate(frame, [1027, Math.max(1027 + 0.001, 1069)], [-118, 0], CLAMP)} 150 115)`} />
        <circle cx="150" cy="115" r="10" fill={C.ink} />
      </svg>
    </Reveal>
    <Reveal frame={frame} cue={1102} fps={fps} style={{ position: "absolute", left: 128, top: 378 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 25 }}>
        <div style={{ width: 62, height: 62, background: C.ink, display: "flex", justifyContent: "center", alignItems: "center", gap: 7 }}>
          <div style={{ height: 28, width: 7, background: C.yellow }} />
          <div style={{ height: 28, width: 7, background: C.yellow }} />
        </div>
        <Words text="Berhenti sebentar. Tanya." frame={frame} cue={1102} fps={fps} size={40} spread={5} />
      </div>
    </Reveal>
    <Reveal frame={frame} cue={1162} fps={fps} style={{ position: "absolute", left: 128, top: 497, width: 786, height: 337 }}>
      <div style={{ height: "100%", padding: 40, border: `2px solid ${C.ink}`, background: "#FFFDF7", position: "relative" }}>
        <Eyebrow color={C.blue}>Pertanyaan 01 / kejadian</Eyebrow>
        <Words text="Ini benar-benar yang terjadi?" frame={frame} cue={1162} fps={fps} size={62} spread={5} />
        <svg width="138" height="50" viewBox="0 0 138 50" style={{ position: "absolute", bottom: 25, right: 30 }}>
          <path d="M8 25H127M111 10L128 25L111 40" stroke={C.blue} strokeWidth="3" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress(frame, 1162, 35)} />
        </svg>
      </div>
    </Reveal>
    <Reveal frame={frame} cue={1228} fps={fps} style={{ position: "absolute", left: 959, top: 497, width: 831, height: 337 }}>
      <div style={{ height: "100%", padding: 40, border: `2px solid ${C.ink}`, background: C.yellow, transform: "rotate(-0.7deg)" }}>
        <Eyebrow color={C.ink}>Pertanyaan 02 / interpretasi</Eyebrow>
        <Words text="Atau cuma versi yang dibuat otakku?" frame={frame} cue={1228} fps={fps} size={62} spread={5} />
      </div>
    </Reveal>
  </Page>
);

const Conclusion: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <Page frame={frame} start={1304} end={1488}>
    <div style={{ position: "absolute", left: 128, top: 186, width: 845 }}>
      <Reveal frame={frame} cue={1304} fps={fps}><Eyebrow>Karena ternyata</Eyebrow></Reveal>
      <Words text="Yang paling mudah menipu kita..." frame={frame} cue={1345} fps={fps} size={76} spread={5} />
      <Reveal frame={frame} cue={1407} fps={fps} style={{ marginTop: 41 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <Words text="bukan orang lain." frame={frame} cue={1407} fps={fps} size={53} color={C.muted} />
          <div style={{ position: "absolute", height: 3, backgroundColor: C.red, top: "55%", left: 0, width: `${progress(frame, 1407, 20) * 100}%`, transform: "rotate(-2deg)" }} />
        </div>
      </Reveal>
      <Reveal frame={frame} cue={1442} fps={fps} style={{ marginTop: 29, position: "relative" }}>
        <div style={{ display: "inline-block", position: "relative", padding: "10px 0" }}>
          <div style={{ position: "absolute", inset: "7px -10px", backgroundColor: C.yellow, transform: `scaleX(${progress(frame, 1442, 22)}) rotate(-1deg)`, transformOrigin: "left center" }} />
          <div style={{ position: "relative" }}>
            <Words text="otak kita sendiri." frame={frame} cue={1442} fps={fps} size={78} spread={4} />
          </div>
        </div>
      </Reveal>
    </div>
    <Reveal frame={frame} cue={1304} fps={fps} style={{ position: "absolute", left: 1090, top: 213, width: 565 }}>
      <svg viewBox="0 0 565 565" style={{ width: "100%" }}>
        <rect x="58" y="15" width="449" height="505" rx="220" fill="#EAE6DB" stroke={C.ink} strokeWidth="2" />
        <rect x="76" y="33" width="413" height="469" rx="204" fill={C.paper} stroke={C.line} strokeWidth="2" />
        <path d="M153 453C153 353 190 342 202 310C171 278 172 214 206 176C231 142 285 123 329 147C377 163 397 209 381 256L403 286L380 298V323C378 342 356 350 329 346L329 381C365 398 395 418 410 453" fill="#DED8CB" stroke={C.ink} strokeWidth="2" opacity={progress(frame, 1345, 30)} />
        <path d="M128 90L399 455 M100 160L347 490" stroke="white" strokeWidth="18" opacity="0.38" />
      </svg>
      <Reveal frame={frame} cue={1442} fps={fps} style={{ position: "absolute", left: 164, top: 156, width: 267 }}>
        <Brain frame={frame} cue={1442} fps={fps} accent={C.red} />
      </Reveal>
      <Marker frame={frame} cue={1442} style={{ position: "absolute", left: 112, top: 163, width: 370 }} />
    </Reveal>
  </Page>
);

const EndCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingBottom: 52 }}>
    <Reveal frame={frame} cue={1488} fps={fps}>
      <div style={{ position: "relative", padding: "14px 51px 24px" }}>
        <div style={{ position: "absolute", inset: "15px 0", backgroundColor: C.yellow, transform: `scaleX(${progress(frame, 1488, 11)}) rotate(-2deg)`, transformOrigin: "left center" }} />
        <div style={{ position: "relative" }}>
          <Words text="mino." frame={frame} cue={1488} fps={fps} size={170} weight={900} />
        </div>
      </div>
    </Reveal>
    <Reveal frame={frame} cue={1520} fps={fps} style={{ marginTop: 42 }}>
      <Words text="Tetap penasaran?" frame={frame} cue={1520} fps={fps} size={56} spread={4} weight={600} />
    </Reveal>
    <svg width="390" height="52" viewBox="0 0 390 52" style={{ marginTop: 8 }}>
      <path d="M15 23Q190 45 373 16" fill="none" stroke={C.red} strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress(frame, 1520, 18)} />
    </svg>
  </div>
);

export const Scene_11: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: C.paper,
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
        }}
      >
        <Sequence from={0} durationInFrames={1549} name="Paper / grid" layout="none">
          <Background frame={frame} />
        </Sequence>

        <Sequence from={0} durationInFrames={1488} name="Floating registration marks" layout="none">
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
            {[0, 1, 2].map((i) => (
              <g key={i} opacity={0.18} transform={`translate(${1742 + Math.sin(frame / 85 + i) * 8}, ${140 + i * 41})`}>
                <path d="M-6 0H6M0 -6V6" stroke={i === 1 ? C.red : C.ink} strokeWidth="1" />
              </g>
            ))}
          </svg>
        </Sequence>

        <Sequence from={0} durationInFrames={253} name="01 / Simplification" layout="none">
          <Simplification frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={253} durationInFrames={124} name="02 / Overconfidence" layout="none">
          <Confidence frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={377} durationInFrames={262} name="03 / Invisible prediction" layout="none">
          <Reality frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={639} durationInFrames={351} name="04 / Behind perception" layout="none">
          <Process frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={990} durationInFrames={314} name="05 / Pause and question" layout="none">
          <Questions frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={1304} durationInFrames={184} name="06 / The mirror" layout="none">
          <Conclusion frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={1488} durationInFrames={61} name="07 / Mino end card" layout="none">
          <EndCard frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={0} durationInFrames={1549} name="Editorial overlay / narration" layout="none">
          <div
            style={{
              position: "absolute",
              left: 128,
              top: 49,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: C.muted,
            }}
          >
            MINO / OTAK & KENYATAAN
          </div>
          <div
            style={{
              position: "absolute",
              right: 128,
              top: 42,
              fontSize: 20,
              fontFamily: "monospace",
              backgroundColor: C.ink,
              color: C.paper,
              padding: "8px 14px",
            }}
          >
            11 / 11
          </div>
          <Caption frame={frame} fps={fps} />
          <div style={{ position: "absolute", bottom: 31, left: 128, fontSize: 13, letterSpacing: "0.14em", color: C.muted }}>
            TETAP PENASARAN.
          </div>
          <div style={{ position: "absolute", bottom: 31, right: 128, display: "flex", gap: 6 }}>
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} style={{ width: i === 10 ? 32 : 12, height: 5, backgroundColor: i === 10 ? C.ink : C.line }} />
            ))}
          </div>
        </Sequence>
      </div>
    </div>
  );
};