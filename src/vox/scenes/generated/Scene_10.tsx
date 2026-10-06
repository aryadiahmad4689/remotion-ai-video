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
const MUTED = "#77746D";
const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const CUES = [
  { start: 52, end: 84, text: "adalah salah satu alasan" },
  { start: 84, end: 157, text: "kita bisa menjalani kehidupan sehari-hari" },
  { start: 157, end: 227, text: "tanpa harus memikirkan setiap hal kecil." },
  { start: 251, end: 272, text: "Bayangkan," },
  { start: 280, end: 325, text: "kalau setiap kali melihat jalan," },
  { start: 341, end: 373, text: "kita harus menganalisis" },
  { start: 377, end: 418, text: "setiap kendaraan." },
  { start: 434, end: 463, text: "Setiap kali mendengar suara," },
  { start: 478, end: 538, text: "kita harus memproses setiap gelombangnya." },
  { start: 554, end: 594, text: "Setiap kali melihat wajah," },
  {
    start: 594,
    end: 665,
    text: "kita harus menghitung semua cirinya satu persatu.",
  },
  { start: 682, end: 706, text: "Kita akan kelelahan." },
  { start: 716, end: 766, text: "Jadi otak memilih jalan pintas." },
  { start: 791, end: 851, text: "Cepat, efisien, praktis." },
  { start: 870, end: 888, text: "Hanya saja," },
  { start: 905, end: 932, text: "jalan pintas" },
  { start: 932, end: 995, text: "kadang menghasilkan kesalahan." },
  { start: 1006, end: 1024, text: "Dan mungkin," },
  { start: 1042, end: 1063, text: "itu sebabnya" },
  {
    start: 1063,
    end: 1124,
    text: "kita sering mengalami momen seperti,",
  },
  { start: 1142, end: 1144, text: "eh," },
  { start: 1158, end: 1193, text: "bukannya tadi begini." },
  { start: 1204, end: 1216, text: "Kayaknya," },
  { start: 1232, end: 1258, text: "gue pernah lihat ini." },
  { start: 1276, end: 1326, text: "Perasaan HP gue tadi di sini," },
  { start: 1345, end: 1384, text: "gue yakin banget tadi udah baca." },
  { start: 1403, end: 1412, text: "Atau," },
  { start: 1435, end: 1460, text: "gue tahu jawabannya." },
  { start: 1460, end: 1510, text: "Tapi kok sekarang lupa?" },
  { start: 1528, end: 1549, text: "Jadi sebenarnya," },
];

const ease = (frame: number, cue: number, fps: number, damping = 18) =>
  spring({
    frame: Math.max(0, frame - cue),
    fps,
    config: { damping, mass: 0.7, stiffness: 85 },
  });

const reveal = (frame: number, cue: number, duration = 30) =>
  interpolate(frame, [cue, cue + Math.max(0.001, duration)], [0, 1], CLAMP);

const absolute: React.CSSProperties = {
  position: "absolute",
  inset: 0,
};

/**
 * Scene-local sequence gates keep every child on the supplied scene clock.
 * No nested clock offsets: narration cues remain absolute within Scene 10.
 */
const Sequence: React.FC<{
  from: number;
  durationInFrames: number;
  frame: number;
  fade?: number;
  children: React.ReactNode;
}> = ({ from, durationInFrames, frame, fade = 12, children }) => {
  if (frame < from || frame >= from + durationInFrames) return null;
  const opacity =
    fade === 0
      ? 1
      : interpolate(
          frame,
          [from, from + fade, from + durationInFrames - fade, from + durationInFrames],
          [0, 1, 1, 0],
          CLAMP,
        );
  return <div style={{ ...absolute, opacity }}>{children}</div>;
};

const Enter: React.FC<{
  frame: number;
  fps: number;
  cue: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ frame, fps, cue, style, children }) => {
  if (frame < cue) return null;
  const p = ease(frame, cue, fps);
  return (
    <div
      style={{
        ...style,
        opacity: reveal(frame, cue, 12),
        transform: `translateY(${(1 - p) * 28}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Words: React.FC<{
  text: string;
  cue: number;
  end: number;
  frame: number;
  fps: number;
  size?: number;
  color?: string;
  weight?: number;
}> = ({ text, cue, end, frame, fps, size = 52, color = INK, weight = 750 }) => {
  const words = text.split(" ");
  const spacing = Math.min(6, Math.max(1, (end - cue - 10) / words.length));
  return (
    <span
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        gap: "0 0.27em",
        fontSize: size,
        fontWeight: weight,
        letterSpacing: "-0.035em",
        lineHeight: 1.15,
        color,
      }}
    >
      {words.map((word, i) => {
        const start = cue + i * spacing;
        const p = ease(frame, start, fps);
        return (
          <span
            key={`${cue}-${i}`}
            style={{
              display: "inline-block",
              opacity:
                frame < start
                  ? 0
                  : end - cue <= 3
                    ? 1
                    : interpolate(frame, [start, start + Math.max(0.001, 7)], [0.18, 1], CLAMP),
              transform: `translateY(${(1 - p) * 15}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

const Label: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color = MUTED, style }) => (
  <div
    style={{
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 17,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

const Background: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ ...absolute, background: PAPER }}>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <pattern id="s10-paper-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" fill="none" stroke={INK} strokeOpacity="0.045" />
          <circle cx="0" cy="0" r="1.2" fill={INK} opacity="0.12" />
        </pattern>
        <radialGradient id="s10-glow">
          <stop offset="0" stopColor={YELLOW} stopOpacity="0.16" />
          <stop offset="1" stopColor={YELLOW} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#s10-paper-grid)" />
      <ellipse
        cx={1100 + Math.sin(frame / 170) * 100}
        cy={450 + Math.cos(frame / 150) * 70}
        rx="730"
        ry="470"
        fill="url(#s10-glow)"
      />
      <path d="M96 112H1824M96 954H1824" stroke={INK} strokeOpacity="0.18" />
      {Array.from({ length: 42 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 281 + 37) % 1920}
          cy={(i * 193 + 81) % 1080}
          r={i % 3 === 0 ? 1.4 : 0.7}
          fill={INK}
          opacity="0.11"
        />
      ))}
    </svg>
  </div>
);

const Brain: React.FC<{
  frame: number;
  fps: number;
  cue?: number;
  stressed?: boolean;
}> = ({ frame, fps, cue = 52, stressed = false }) => {
  const growth = reveal(frame, cue, 55);
  const nodes = [
    [145, 133], [215, 88], [290, 124], [354, 86], [407, 150],
    [465, 198], [367, 220], [290, 189], [207, 231], [143, 205],
    [228, 313], [316, 295], [396, 303], [466, 281],
  ];
  const links = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
    [7, 0], [7, 8], [8, 9], [8, 10], [10, 11], [11, 12],
    [12, 13], [13, 5], [2, 7], [6, 12], [3, 6], [7, 11],
  ];
  return (
    <svg viewBox="0 0 600 430" style={{ width: "100%", height: "100%" }}>
      <path
        d="M292 64C253 29 199 37 175 77C122 62 88 108 98 153C56 184 68 242 107 257C94 304 130 344 176 339C191 381 242 387 274 354L301 339L324 353C369 387 416 364 427 332C477 338 513 303 502 259C548 233 541 180 511 164C517 118 476 87 440 97C416 51 368 38 337 64C318 51 305 52 292 64Z"
        fill={stressed ? "#F8DEDA" : "#E8ECE5"}
        stroke={INK}
        strokeWidth="3.5"
      />
      <path
        d="M300 66C282 119 312 133 297 184C280 233 313 259 301 339M171 88C164 122 186 149 159 177M105 204C146 184 186 205 185 247M139 297C176 268 223 280 232 336M216 79C230 117 267 119 247 151M351 75C325 109 349 148 389 148M450 116C417 158 457 178 477 203M497 251C454 223 417 264 439 303M350 344C348 311 333 281 365 260"
        fill="none"
        stroke={INK}
        strokeOpacity="0.28"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke={stressed ? RED : TEAL}
          strokeWidth="2"
          opacity={growth * 0.52}
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - reveal(frame, cue + i * 2, 30)}
        />
      ))}
      {nodes.map(([x, y], i) => {
        const p = frame >= cue + i * 3 ? ease(frame, cue + i * 3, fps) : 0;
        const pulse = (Math.sin(frame / (stressed ? 4 : 15) - i) + 1) / 2;
        return (
          <g key={i} opacity={p}>
            <circle cx={x} cy={y} r={8 + pulse * 7} fill={stressed ? RED : TEAL} opacity="0.1" />
            <circle cx={x} cy={y} r="4.5" fill={stressed ? RED : TEAL} />
          </g>
        );
      })}
      {frame >= cue && (
        <g transform={`translate(${300 + Math.sin(frame / 21) * 85} 189)`}>
          <circle r="10" fill={YELLOW} stroke={INK} strokeWidth="2" />
          <circle r="20" fill="none" stroke={YELLOW} strokeWidth="2" opacity="0.5" />
        </g>
      )}
    </svg>
  );
};

const Opening: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <>
    <div style={{ position: "absolute", left: 910, top: 245, width: 840, height: 550 }}>
      <Brain frame={frame} fps={fps} />
      <svg style={absolute} viewBox="0 0 840 550">
        <circle cx="420" cy="260" r="246" fill="none" stroke={INK} strokeOpacity="0.12" strokeDasharray="3 12" />
        <g transform={`rotate(${frame * 0.11} 420 260)`}>
          <path d="M420 14A246 246 0 0 1 641 152" fill="none" stroke={TEAL} strokeWidth="3" opacity="0.5" />
        </g>
      </svg>
    </div>
    <Enter frame={frame} fps={fps} cue={52} style={{ position: "absolute", left: 100, top: 260 }}>
      <Label>01 / Filter sehari-hari</Label>
      <div style={{ marginTop: 24, maxWidth: 790 }}>
        <Words text="Salah satu alasan" cue={52} end={84} frame={frame} fps={fps} size={80} />
      </div>
    </Enter>
    <Enter frame={frame} fps={fps} cue={84} style={{ position: "absolute", left: 100, top: 412 }}>
      <div style={{ background: YELLOW, padding: "12px 22px 17px", transform: "rotate(-1deg)" }}>
        <Words text="Kehidupan sehari-hari" cue={84} end={157} frame={frame} fps={fps} size={52} />
      </div>
    </Enter>
    <Enter frame={frame} fps={fps} cue={157} style={{ position: "absolute", left: 104, top: 553, width: 650 }}>
      <Words text="Tanpa memikirkan setiap hal kecil." cue={157} end={227} frame={frame} fps={fps} size={41} weight={500} />
      <div style={{ marginTop: 40, height: 3, background: "#D8D5CE", width: 580 }}>
        <div style={{ height: 3, background: TEAL, width: `${reveal(frame, 157, 60) * 100}%` }} />
      </div>
    </Enter>
  </>
);

const Card: React.FC<{
  frame: number;
  fps: number;
  cue: number;
  x: number;
  number: string;
  title: string;
  color: string;
  children: React.ReactNode;
}> = ({ frame, fps, cue, x, number, title, color, children }) => (
  <Enter frame={frame} fps={fps} cue={cue} style={{ position: "absolute", left: x, top: 315, width: 544 }}>
    <div
      style={{
        height: 424,
        background: "#FCFAF5",
        border: "1.5px solid #C9C5BD",
        boxShadow: "7px 10px 0 rgba(24,24,27,0.055)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 15, padding: "22px 25px", borderBottom: "1px solid #D9D5CD" }}>
        <span style={{ color, fontSize: 17, fontFamily: "monospace" }}>{number}</span>
        <span style={{ fontSize: 26, fontWeight: 700 }}>{title}</span>
        <span style={{ marginLeft: "auto", width: 9, height: 9, borderRadius: "50%", background: color }} />
      </div>
      {children}
    </div>
  </Enter>
);

const Road: React.FC<{ frame: number }> = ({ frame }) => {
  const scan = reveal(frame, 341, 32);
  return (
    <svg viewBox="0 0 544 340" style={{ width: "100%", height: 340 }}>
      <rect x="0" y="68" width="544" height="214" fill="#E8E6E0" />
      <path d="M0 80H544M0 270H544" stroke={INK} strokeWidth="3" />
      <path d="M0 175H544" stroke={PAPER} strokeWidth="5" strokeDasharray="38 24" />
      {[0, 1, 2, 3, 4].map((i) => {
        const direction = i < 3 ? 1 : -1;
        const x = 34 + i * 101 + Math.sin(frame / 65 + i) * 10 * direction;
        const y = i < 3 ? 103 : 202;
        const p = reveal(frame, 377 + i * 5, 20);
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect width="66" height="37" rx="7" fill={i % 2 ? TEAL : BLUE} stroke={INK} strokeWidth="2" />
            <rect x="16" y="6" width="28" height="25" rx="4" fill={PAPER} opacity="0.65" />
            <path d="M10-3V3M52-3V3M10 34V40M52 34V40" stroke={INK} strokeWidth="5" />
            <g opacity={p}>
              <rect x="-8" y="-9" width="82" height="56" fill="none" stroke={RED} strokeWidth="1.8" />
              <path d="M33-9V-27H65" fill="none" stroke={RED} />
              <text x="67" y="-23" fontSize="12" fill={RED} fontFamily="monospace">{`0${i + 1}`}</text>
            </g>
          </g>
        );
      })}
      {frame >= 341 && (
        <g opacity={scan}>
          <rect x={18 + reveal(frame, 341, 72) * 486} y="60" width="2" height="230" fill={RED} />
          <text x="24" y="319" fontFamily="monospace" fontSize="15" fill={RED}>
            {frame >= 377 ? "5 OBJEK / ANALISIS INDIVIDUAL" : "MEMINDAI JALAN…"}
          </text>
        </g>
      )}
    </svg>
  );
};

const Sound: React.FC<{ frame: number }> = ({ frame }) => (
  <svg viewBox="0 0 544 340" style={{ width: "100%", height: 340 }}>
    {[80, 170, 260].map((y) => (
      <path key={y} d={`M24 ${y}H520`} stroke={INK} strokeOpacity="0.09" />
    ))}
    <path d="M24 40V285M272 40V285M520 40V285" stroke={INK} strokeOpacity="0.09" />
    {Array.from({ length: 58 }, (_, i) => {
      const h = 14 + Math.abs(Math.sin(i * 0.71 + frame / 24)) * 87;
      return <rect key={i} x={25 + i * 8.5} y={165 - h} width="4" height={h * 2} rx="2" fill={TEAL} opacity={0.45 + (i % 3) * 0.2} />;
    })}
    {Array.from({ length: 8 }, (_, i) => {
      const p = reveal(frame, 478 + i * 5, 18);
      return (
        <g key={i} opacity={p}>
          <rect x={25 + i * 62} y="48" width="51" height="235" fill={BLUE} fillOpacity="0.055" stroke={BLUE} strokeWidth="1" />
          <text x={30 + i * 62} y="310" fill={BLUE} fontSize="12" fontFamily="monospace">{`ω${i + 1}`}</text>
        </g>
      );
    })}
    <path
      d="M28 170C78 30 107 309 154 167S224 28 271 165S339 304 386 162S457 37 510 168"
      fill="none"
      stroke={INK}
      strokeWidth="2"
      pathLength="1"
      strokeDasharray="1"
      strokeDashoffset={1 - reveal(frame, 478, 55)}
    />
  </svg>
);

const Face: React.FC<{ frame: number }> = ({ frame }) => {
  const points = [[216, 118], [329, 118], [272, 163], [247, 206], [299, 206], [272, 258], [177, 157], [367, 157]];
  return (
    <svg viewBox="0 0 544 340" style={{ width: "100%", height: 340 }}>
      <ellipse cx="272" cy="156" rx="103" ry="126" fill="#EADFD0" stroke={INK} strokeWidth="2.5" />
      <path d="M169 130C164 33 217 22 272 23C339 19 380 57 374 130L348 72L307 86L263 65L210 86L194 137" fill={INK} />
      <path d="M204 116Q218 106 234 116M310 116Q326 106 341 116" fill="none" stroke={INK} strokeWidth="3" />
      <circle cx="218" cy="126" r="4" fill={INK} />
      <circle cx="327" cy="126" r="4" fill={INK} />
      <path d="M273 132L261 176H279M238 210Q272 227 306 210M213 270L202 321M331 270L342 321" fill="none" stroke={INK} strokeWidth="2.5" />
      <g opacity={reveal(frame, 594, 20)}>
        <path d="M155 31H189M155 31V65M389 31H355M389 31V65M155 282H189M155 282V248M389 282H355M389 282V248" fill="none" stroke={BLUE} strokeWidth="2" />
        <path d="M215 118L272 163L329 118M177 157L247 206L272 258L299 206L367 157M216 118L247 206H299L329 118" fill="none" stroke={BLUE} strokeOpacity="0.5" strokeDasharray="4 5" />
      </g>
      {points.map(([x, y], i) => (
        <g key={i} opacity={reveal(frame, 594 + i * 6, 12)}>
          <circle cx={x} cy={y} r="5" fill={YELLOW} stroke={BLUE} strokeWidth="2" />
          <path d={`M${x} ${y}H${i % 2 ? 436 : 105}`} stroke={BLUE} strokeOpacity="0.4" />
          <text x={i % 2 ? 442 : 68} y={y + 4} fill={BLUE} fontFamily="monospace" fontSize="12">{`0${i + 1}`}</text>
        </g>
      ))}
    </svg>
  );
};

const Overload: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <>
    <Enter frame={frame} fps={fps} cue={251} style={{ position: "absolute", left: 100, top: 168 }}>
      <Label>02 / Semua harus dianalisis</Label>
      <div style={{ marginTop: 14 }}>
        <Words text="Bayangkan," cue={251} end={272} frame={frame} fps={fps} size={75} />
      </div>
    </Enter>
    <Card frame={frame} fps={fps} cue={280} x={100} number="01" title="Melihat jalan" color={BLUE}>
      <Road frame={frame} />
    </Card>
    <Card frame={frame} fps={fps} cue={434} x={688} number="02" title="Mendengar suara" color={TEAL}>
      <Sound frame={frame} />
    </Card>
    <Card frame={frame} fps={fps} cue={554} x={1276} number="03" title="Melihat wajah" color={BLUE}>
      <Face frame={frame} />
    </Card>
    <Enter frame={frame} fps={fps} cue={682} style={{ position: "absolute", left: 100, top: 766, width: 1720 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 25 }}>
        <div style={{ background: RED, color: PAPER, padding: "11px 23px", fontSize: 29, fontWeight: 800 }}>
          KELELAHAN
        </div>
        <div style={{ flex: 1, height: 13, background: "#D9D4CC" }}>
          <div style={{ width: `${(1 - reveal(frame, 682, 22) * 0.94) * 100}%`, height: "100%", background: RED }} />
        </div>
        <Label color={RED}>Beban pemrosesan</Label>
      </div>
    </Enter>
  </>
);

const Shortcut: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const error = frame >= 932;
  const route = reveal(frame, 716, 50);
  const badRoute = reveal(frame, 932, 48);
  return (
    <>
      <Enter frame={frame} fps={fps} cue={716} style={{ position: "absolute", left: 100, top: 166 }}>
        <Label>03 / Strategi otak</Label>
        <div style={{ marginTop: 17 }}>
          <Words text="Jalan pintas." cue={716} end={766} frame={frame} fps={fps} size={83} />
        </div>
      </Enter>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={absolute}>
        <path d="M578 553C777 553 688 366 949 367H1101C1316 367 1232 553 1445 553" fill="none" stroke="#C6C2B9" strokeWidth="3" strokeDasharray="7 9" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={693 + i * 120} y={i === 0 || i === 4 ? 411 : 340} width="68" height="48" rx="2" fill={PAPER} stroke="#C6C2B9" />
            <path d={`M${707 + i * 120} ${i === 0 || i === 4 ? 426 : 355}h39m-39 9h25`} stroke="#B9B5AD" strokeWidth="3" />
          </g>
        ))}
        <path
          d="M555 553H1450"
          fill="none"
          stroke={YELLOW}
          strokeWidth="26"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - route}
        />
        <path d="M555 553H1450" fill="none" stroke={INK} strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - route} />
        <path d="M1432 540L1450 553L1432 566" fill="none" stroke={INK} strokeWidth="3" opacity={route} />
        {frame >= 905 && (
          <path
            d="M980 553C1130 553 1162 686 1309 691H1470"
            fill="none"
            stroke={RED}
            strokeWidth="5"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - badRoute}
          />
        )}
        {frame >= 716 && (
          <circle
            cx={590 + ((Math.max(0, frame - 748) % 120) / 120) * 795}
            cy="553"
            r="8"
            fill={INK}
            opacity={reveal(frame, 748, 15)}
          />
        )}
      </svg>
      <div style={{ position: "absolute", left: 92, top: 347, width: 514, height: 372 }}>
        <Brain frame={frame} fps={fps} cue={716} />
      </div>
      <Enter frame={frame} fps={fps} cue={716} style={{ position: "absolute", left: 1465, top: 488 }}>
        <div style={{ width: 330, padding: "25px 20px", background: INK, color: PAPER, border: "2px solid #18181B" }}>
          <Label color={YELLOW}>Output</Label>
          <div style={{ fontSize: 35, fontWeight: 750, marginTop: 12 }}>Keputusan</div>
        </div>
      </Enter>
      {[
        { cue: 791, label: "Cepat", x: 657 },
        { cue: 811, label: "Efisien", x: 907 },
        { cue: 831, label: "Praktis", x: 1157 },
      ].map((item) => (
        <Enter key={item.cue} frame={frame} fps={fps} cue={item.cue} style={{ position: "absolute", left: item.x, top: 607 }}>
          <div style={{ background: "#E3EBDF", border: `1px solid ${TEAL}`, padding: "13px 28px", fontSize: 29, fontWeight: 700, color: TEAL }}>
            {item.label}
          </div>
        </Enter>
      ))}
      <Enter frame={frame} fps={fps} cue={870} style={{ position: "absolute", left: 104, top: 765 }}>
        <Words text="Hanya saja…" cue={870} end={888} frame={frame} fps={fps} size={36} weight={500} />
      </Enter>
      <Enter frame={frame} fps={fps} cue={905} style={{ position: "absolute", left: 373, top: 765 }}>
        <Words text="jalan pintas" cue={905} end={932} frame={frame} fps={fps} size={36} weight={500} />
      </Enter>
      <Enter frame={frame} fps={fps} cue={932} style={{ position: "absolute", left: 1454, top: 665 }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: RED, padding: "10px 24px" }}>KESALAHAN</div>
        <svg viewBox="0 0 320 110" style={{ position: "absolute", left: -15, top: -19, width: 320, height: 110 }}>
          <path
            d="M274 20C182-8 14 4 13 56C11 105 286 106 293 53C298 17 233 10 204 9"
            fill="none"
            stroke={RED}
            strokeWidth="4"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - reveal(frame, 932, 40)}
          />
        </svg>
      </Enter>
      {error && (
        <div style={{ position: "absolute", left: 624, top: 766 }}>
          <Words text="kadang menghasilkan kesalahan." cue={932} end={995} frame={frame} fps={fps} size={36} color={RED} />
        </div>
      )}
    </>
  );
};

const Room: React.FC<{ frame: number; mode: string }> = ({ frame, mode }) => {
  const p = reveal(frame, 1158, 30);
  const phone = mode === "phone";
  const familiar = mode === "familiar";
  return (
    <svg viewBox="0 0 1040 420" style={{ width: "100%", height: "100%" }}>
      <defs>
        <pattern id="s10-room-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <path d="M0 0V8" stroke={BLUE} strokeWidth="2" strokeOpacity="0.18" />
        </pattern>
      </defs>
      <path d="M45 38H990V351H45Z" fill="#EAE5DA" stroke={INK} strokeWidth="2" />
      <path d="M45 38L260 100H770L990 38M260 100V269L45 351M770 100V269L990 351M260 269H770" fill="none" stroke={INK} strokeOpacity="0.3" strokeWidth="2" />
      <path d="M45 351H990L1040 420H0Z" fill="#DFD9CD" />
      <path d="M260 269L170 420M770 269L869 420M515 269V420M79 379H1011" stroke={INK} strokeOpacity="0.12" />
      <rect x="304" y="120" width="116" height="88" fill="#C8D6D3" stroke={INK} strokeWidth="2" />
      <path d="M362 120V208M304 164H420" stroke={INK} strokeWidth="2" />
      <rect x="609" y="121" width="88" height="75" fill={PAPER} stroke={INK} strokeWidth="2" />
      <path d="M621 182L640 145L656 160L675 138L686 182Z" fill={TEAL} opacity="0.5" />
      <path d="M174 292L528 273L706 322L315 348Z" fill="#D4B998" stroke={INK} strokeWidth="2.5" />
      <path d="M174 292V313L315 371V348M315 371L706 344V322M206 328V389M660 347V399" fill="none" stroke={INK} strokeWidth="3" />
      <path d="M801 294V204M780 204H822L834 251H767Z" fill="#F3DCA2" stroke={INK} strokeWidth="2" />
      <ellipse cx="801" cy="300" rx="27" ry="8" fill={INK} />
      {!phone && (
        <>
          <path d="M438 277L509 273L549 290L475 297Z" fill={BLUE} stroke={INK} strokeWidth="2" />
          <path d="M455 279L501 277L525 287L478 291Z" fill={PAPER} opacity="0.7" />
        </>
      )}
      {frame >= 1158 && mode === "changed" && (
        <g opacity={p}>
          <path d="M341 270L411 268L450 284L377 291Z" fill="url(#s10-room-hatch)" stroke={BLUE} strokeWidth="2" strokeDasharray="5 4" />
          <path d="M381 247C409 226 472 226 493 252" fill="none" stroke={RED} strokeWidth="2" strokeDasharray="5 4" />
          <path d="M486 242L494 252L481 251" fill="none" stroke={RED} strokeWidth="2" />
        </g>
      )}
      {phone && (
        <g>
          <path d="M438 277L509 273L549 290L475 297Z" fill="url(#s10-room-hatch)" stroke={BLUE} strokeWidth="2" strokeDasharray="5 4" />
          <ellipse cx="489" cy="285" rx="105" ry="40" fill="none" stroke={RED} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - reveal(frame, 1276, 40)} />
          <text x="576" y="273" fill={RED} fontSize="37" fontWeight="700">?</text>
        </g>
      )}
      {familiar && (
        <g opacity={reveal(frame, 1232, 22)}>
          <rect x="35" y="28" width="966" height="334" fill={BLUE} fillOpacity="0.03" stroke={BLUE} strokeWidth="2" strokeDasharray="8 8" />
          <path d="M81 66H114M81 66V98M955 322H922M955 322V290" stroke={BLUE} strokeWidth="4" />
          <circle cx="523" cy="202" r={95 + Math.sin(frame / 20) * 5} fill="none" stroke={BLUE} strokeWidth="2" strokeDasharray="3 10" />
        </g>
      )}
    </svg>
  );
};

const Document: React.FC<{ frame: number }> = ({ frame }) => {
  const p = reveal(frame, 1345, 35);
  return (
    <svg viewBox="0 0 1040 420" style={{ width: "100%", height: "100%" }}>
      <rect x="255" y="39" width="559" height="345" fill={INK} opacity="0.06" transform="rotate(-3 520 210)" />
      <g transform="rotate(-3 520 210)">
        <rect x="237" y="23" width="559" height="345" fill="#FFFEF9" stroke="#BEB9AF" strokeWidth="2" />
        <rect x="270" y="51" width="52" height="9" fill={INK} />
        <text x="340" y="60" fontSize="13" fontFamily="monospace" fill={MUTED}>CATATAN / PERSEPSI</text>
        <path d="M270 86H755" stroke={INK} strokeWidth="2" />
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M270 ${113 + i * 20}H${i % 3 === 0 ? 695 : 752}`} stroke="#B7B2A9" strokeWidth="5" />
        ))}
        <rect x="263" y="141" width={p * 463} height="22" fill={YELLOW} opacity="0.75" />
        <rect x="263" y="201" width={reveal(frame, 1357, 28) * 375} height="22" fill={YELLOW} opacity="0.75" />
        <path d="M691 280L707 297L739 254" fill="none" stroke={TEAL} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity={p} />
      </g>
      <g opacity={reveal(frame, 1364, 18)}>
        <circle cx="793" cy="111" r="51" fill={PAPER} stroke={RED} strokeWidth="3" />
        <text x="793" y="127" textAnchor="middle" fontSize="47" fontWeight="700" fill={RED}>?</text>
      </g>
    </svg>
  );
};

const Retrieval: React.FC<{ frame: number }> = ({ frame }) => {
  const known = reveal(frame, 1435, 20);
  const lost = reveal(frame, 1460, 35);
  const nodes = [[179, 121], [342, 83], [323, 274], [507, 172], [636, 85], [676, 293], [853, 182]];
  return (
    <svg viewBox="0 0 1040 420" style={{ width: "100%", height: "100%" }}>
      {[[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6]].map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="#CAC4BA" strokeWidth="2" strokeDasharray="5 7" />
      ))}
      <path d="M179 121L342 83L507 172L636 85L853 182" fill="none" stroke={TEAL} strokeWidth="5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - known} opacity={1 - lost * 0.78} />
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === 6 ? 48 : 19} fill={i === 6 ? YELLOW : PAPER} stroke={i === 6 && frame >= 1460 ? RED : INK} strokeWidth="2" />
          {i !== 6 && <circle cx={x} cy={y} r="5" fill={TEAL} />}
        </g>
      ))}
      <text x="853" y="198" textAnchor="middle" fontSize="44" fill={INK} fontWeight="800" opacity={known * (1 - lost)}>!</text>
      <text x="853" y="198" textAnchor="middle" fontSize="44" fill={RED} fontWeight="800" opacity={lost}>?</text>
      <g opacity={lost}>
        <path d="M575 99L606 147M604 100L576 145" stroke={RED} strokeWidth="5" strokeLinecap="round" />
        <rect x="459" y="323" width="295" height="40" fill="#F7E3DE" />
        <text x="606" y="349" textAnchor="middle" fill={RED} fontFamily="monospace" fontSize="17">AKSES TERPUTUS</text>
      </g>
    </svg>
  );
};

const Memory: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const mode =
    frame >= 1403 ? "retrieval" :
    frame >= 1345 ? "document" :
    frame >= 1276 ? "phone" :
    frame >= 1204 ? "familiar" : "changed";

  const evidence = [
    { cue: 1158, id: "01", text: "Bukannya tadi begini?", color: BLUE },
    { cue: 1232, id: "02", text: "Pernah lihat ini.", color: BLUE },
    { cue: 1276, id: "03", text: "HP tadi di sini.", color: RED },
    { cue: 1345, id: "04", text: "Yakin sudah baca.", color: TEAL },
    { cue: 1460, id: "05", text: "Sekarang lupa.", color: RED },
  ];
  return (
    <>
      <Enter frame={frame} fps={fps} cue={1006} style={{ position: "absolute", left: 100, top: 166 }}>
        <Label>04 / Momen yang terasa familiar</Label>
        <div style={{ marginTop: 16 }}>
          <Words text="Dan mungkin…" cue={1006} end={1024} frame={frame} fps={fps} size={72} />
        </div>
      </Enter>
      <Enter frame={frame} fps={fps} cue={1042} style={{ position: "absolute", left: 111, top: 312, width: 1110 }}>
        <div style={{ border: "1.5px solid #BFB9AF", background: "#EFEAE0", padding: 18, boxShadow: "8px 10px 0 rgba(24,24,27,0.045)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px 20px" }}>
            <Label color={BLUE}>Ingatan / realitas</Label>
            <Label>{mode === "retrieval" ? "05" : mode === "document" ? "04" : mode === "phone" ? "03" : mode === "familiar" ? "02" : "01"} — rekonstruksi visual</Label>
          </div>
          <div style={{ height: 420 }}>
            {mode === "document" ? <Document frame={frame} /> :
              mode === "retrieval" ? <Retrieval frame={frame} /> :
              <Room frame={frame} mode={mode} />}
          </div>
        </div>
      </Enter>
      <Enter frame={frame} fps={fps} cue={1063} style={{ position: "absolute", left: 1300, top: 328 }}>
        <Label>Catatan pengalaman</Label>
        <div style={{ width: 492, marginTop: 20, height: 1, background: "#BFB9AF" }} />
      </Enter>
      {evidence.map((item, i) => (
        <Enter key={item.id} frame={frame} fps={fps} cue={item.cue} style={{ position: "absolute", left: 1300, top: 385 + i * 78 }}>
          <div style={{ width: 495, display: "flex", alignItems: "center", gap: 18, borderBottom: "1px solid #D3CDC2", padding: "14px 4px" }}>
            <span style={{ fontFamily: "monospace", fontSize: 17, color: item.color }}>{item.id}</span>
            <span style={{ fontSize: 27, fontWeight: 650 }}>{item.text}</span>
            <span style={{ marginLeft: "auto", width: 7, height: 7, background: item.color, borderRadius: "50%" }} />
          </div>
        </Enter>
      ))}
      {frame >= 1142 && frame < 1158 && (
        <div style={{ position: "absolute", left: 525, top: 465, background: YELLOW, padding: "13px 30px", transform: "rotate(-5deg)", boxShadow: "5px 6px 0 rgba(24,24,27,.12)" }}>
          <Words text="Eh?" cue={1142} end={1144} frame={frame} fps={fps} size={67} />
        </div>
      )}
      <Enter frame={frame} fps={fps} cue={1063} style={{ position: "absolute", left: 111, top: 816 }}>
        <Label color={MUTED}>Ilustrasi konseptual · bukan rekaman kejadian</Label>
      </Enter>
    </>
  );
};

const Closing: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <>
    <div style={{ ...absolute, background: PAPER, opacity: reveal(frame, 1528, 12) }} />
    <Enter frame={frame} fps={fps} cue={1528} style={{ position: "absolute", left: 155, top: 382 }}>
      <Label>Menuju pertanyaan berikutnya</Label>
      <div style={{ marginTop: 29, position: "relative" }}>
        <div style={{ position: "absolute", left: -14, right: -24, bottom: -8, height: 37, background: YELLOW, transform: `scaleX(${reveal(frame, 1528, 18)})`, transformOrigin: "left" }} />
        <div style={{ position: "relative" }}>
          <Words text="Jadi sebenarnya," cue={1528} end={1549} frame={frame} fps={fps} size={106} />
        </div>
      </div>
    </Enter>
    <svg viewBox="0 0 1920 1080" style={absolute}>
      <path d="M1360 497H1645M1614 466L1645 497L1614 528" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - reveal(frame, 1532, 17)} />
    </svg>
  </>
);

export const Scene_10: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);
  const section = frame < 251 ? "01" : frame < 716 ? "02" : frame < 1006 ? "03" : "04";

  return (
    <div
      style={{
        ...absolute,
        overflow: "hidden",
        background: PAPER,
        fontFamily: "Arial, Helvetica, sans-serif",
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
          overflow: "hidden",
        }}
      >
        <Sequence from={0} durationInFrames={1550} frame={frame} fade={0}>
          <Background frame={frame} />
        </Sequence>

        <Sequence from={0} durationInFrames={1550} frame={frame} fade={0}>
          <svg viewBox="0 0 1920 1080" style={{ ...absolute, pointerEvents: "none" }}>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${1770 + Math.sin(frame / 90 + i) * 10} ${205 + i * 205 + Math.cos(frame / 110 + i) * 8})`} opacity="0.14">
                <circle r="19" fill="none" stroke={INK} />
                <path d="M-27 0H27M0-27V27" stroke={INK} />
              </g>
            ))}
          </svg>
        </Sequence>

        <Sequence from={0} durationInFrames={275} frame={frame} fade={12}>
          <Opening frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={251} durationInFrames={477} frame={frame} fade={12}>
          <Overload frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={716} durationInFrames={302} frame={frame} fade={12}>
          <Shortcut frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={1006} durationInFrames={534} frame={frame} fade={12}>
          <Memory frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={1528} durationInFrames={22} frame={frame} fade={0}>
          <Closing frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={0} durationInFrames={1550} frame={frame} fade={0}>
          <div style={{ position: "absolute", left: 100, top: 45, display: "flex", gap: 18, alignItems: "center" }}>
            <div style={{ background: YELLOW, padding: "5px 13px 7px", fontSize: 27, fontWeight: 900, letterSpacing: "-0.08em" }}>vox</div>
            <Label color={INK}>Pikiran / persepsi / ingatan</Label>
          </div>
          <div style={{ position: "absolute", right: 100, top: 57, display: "flex", gap: 29 }}>
            <Label color={INK}>Bab {section}</Label>
            <Label>10 / 11</Label>
          </div>

          <div style={{ position: "absolute", left: 100, top: 985 }}>
            <Label>Jalan pintas & konsekuensinya</Label>
          </div>
          <div style={{ position: "absolute", right: 100, top: 985, display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 230, height: 3, background: "#D0CBC2" }}>
              <div style={{ width: `${reveal(frame, 0, 1549) * 100}%`, height: 3, background: INK }} />
            </div>
            <Label color={INK}>10</Label>
          </div>
        </Sequence>
      </div>
    </div>
  );
};