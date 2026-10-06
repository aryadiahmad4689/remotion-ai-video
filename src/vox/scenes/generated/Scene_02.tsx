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
  muted: "#73716D",
  line: "#D8D3C9",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
  white: "#FFFD F8".replace(" ", ""),
};

const FONT = "Arial, Helvetica, sans-serif";
const MONO = "'Courier New', monospace";
const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const progress = (f: number, cue: number, duration = 24) =>
  interpolate(f, [cue, cue + Math.max(0.001, duration)], [0, 1], CLAMP);

const entrance = (f: number, cue: number, fps: number) =>
  f < cue
    ? 0
    : spring({
        frame: Math.max(0, f - cue),
        fps,
        config: { damping: 16, mass: 0.7, stiffness: 95 },
      });

type TimedProps = {
  f: number;
  fps: number;
};

const beats = [
  { start: 11, end: 153, text: "Tapi sebenarnya, ada sesuatu yang menarik di balik semua kejadian itu." },
  { start: 164, end: 207, text: "Otak kita, bukan kamera." },
  { start: 225, end: 251, text: "Otak kita lebih mirip." },
  { start: 265, end: 284, text: "Mesin prediksi." },
  { start: 308, end: 375, text: "Setiap saat otak menerima informasi dari mata," },
  { start: 399, end: 497, text: "telinga, hidung, kulit, dan seluruh tubuh." },
  { start: 519, end: 633, text: "Masalahnya, informasi yang masuk itu, sebenarnya nggak selalu lengkap." },
  { start: 648, end: 713, text: "Misalnya, kamu melihat seseorang dari jauh." },
  { start: 720, end: 779, text: "Yang kamu lihat mungkin cuma bentuk tubuhnya," },
  { start: 798, end: 870, text: "cara jalannya, bajunya, rambutnya." },
  { start: 870, end: 946, text: "Otak kemudian mengambil semua informasi itu," },
  { start: 965, end: 1023, text: "dan mencoba menjawab satu pertanyaan." },
  { start: 1032, end: 1050, text: "Siapa orang ini?" },
  { start: 1065, end: 1130, text: "Kalau beberapa cirinya mirip dengan temanmu," },
  { start: 1146, end: 1197, text: "otak bisa langsung membuat kesimpulan." },
  { start: 1209, end: 1220, text: "Teman gue?" },
  { start: 1237, end: 1266, text: "Padahal belum tentu." },
  { start: 1269, end: 1386, text: "Jadi, sebelum kamu benar-benar tahu siapa orang itu," },
  { start: 1400, end: 1457, text: "otakmu sudah membuat perkiraan terlebih dahulu." },
  { start: 1472, end: 1515, text: "Dan ini sebenarnya sangat berguna." },
  { start: 1526, end: 1549, text: "Bayangkan, kalau setiap hal kecil harus diproses dari nol," },
];

const Kinetic: React.FC<{
  text: string;
  f: number;
  fps: number;
  cue: number;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({ text, f, fps, cue, stagger = 4, style }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      columnGap: "0.25em",
      rowGap: "0.03em",
      fontFamily: FONT,
      ...style,
    }}
  >
    {text.split(" ").map((word, i) => {
      const at = cue + i * stagger;
      const p = entrance(f, at, fps);
      return (
        <span
          key={`${word}-${i}`}
          style={{
            display: "inline-block",
            opacity: progress(f, at, 8),
            transform: `translateY(${(1 - p) * 18}px)`,
          }}
        >
          {word}
        </span>
      );
    })}
  </div>
);

const SvgWords: React.FC<{
  text: string;
  f: number;
  cue: number;
  x: number;
  y: number;
  size?: number;
  fill?: string;
  weight?: number;
  anchor?: "start" | "middle" | "end";
  mono?: boolean;
  stagger?: number;
}> = ({
  text,
  f,
  cue,
  x,
  y,
  size = 22,
  fill = C.ink,
  weight = 700,
  anchor = "start",
  mono = false,
  stagger = 3,
}) => (
  <text
    x={x}
    y={y}
    fill={fill}
    fontSize={size}
    fontWeight={weight}
    fontFamily={mono ? MONO : FONT}
    textAnchor={anchor}
  >
    {text.split(" ").map((word, i) => (
      <tspan key={i} opacity={progress(f, cue + i * stagger, 8)}>
        {i ? " " : ""}
        {word}
      </tspan>
    ))}
  </text>
);

const Reveal: React.FC<
  TimedProps & {
    cue: number;
    children: React.ReactNode;
    x?: number;
    y?: number;
    lift?: number;
  }
> = ({ f, fps, cue, children, x = 0, y = 0, lift = 18 }) => {
  const p = entrance(f, cue, fps);
  return (
    <g
      opacity={progress(f, cue, 12)}
      transform={`translate(${x},${y + (1 - p) * lift})`}
    >
      {children}
    </g>
  );
};

const Brain: React.FC<TimedProps & { cue: number; size?: number }> = ({
  f,
  fps,
  cue,
  size = 1,
}) => {
  const p = entrance(f, cue, fps);
  const paths = [
    "M89 157 C56 155 47 128 58 109 C38 82 55 52 83 54 C88 23 119 14 144 33 C164 10 205 25 212 48 C248 43 270 71 260 99 C287 128 265 159 243 166 C239 191 205 201 184 186 C158 208 125 195 118 175 C106 178 96 172 89 157Z",
    "M144 33 C129 58 155 69 145 90 C130 111 157 125 147 148 C139 169 151 190 163 195",
    "M83 54 C101 57 110 72 96 86 C78 99 94 116 112 117",
    "M58 109 C83 99 100 127 85 145",
    "M113 45 C97 28 79 49 85 65",
    "M177 41 C198 50 191 70 174 73 C161 87 181 99 193 93",
    "M212 48 C218 69 245 68 244 87 C226 103 209 91 208 115",
    "M261 99 C239 117 248 133 225 140 C209 148 217 165 242 166",
    "M173 113 C187 124 173 143 187 156 C201 166 199 183 184 186",
    "M112 117 C133 124 126 141 113 147 C98 155 107 170 118 175",
  ];
  const nodes = [
    [91, 81],
    [125, 128],
    [171, 65],
    [220, 92],
    [195, 152],
    [151, 170],
    [76, 123],
  ];
  return (
    <g transform={`scale(${size * (0.96 + 0.04 * p)})`}>
      <path d={paths[0]} fill="#EAE4D9" stroke={C.ink} strokeWidth={4} />
      <path d="M149 192 Q153 214 173 228 L197 225 Q182 206 191 188" fill="#DDD4C4" stroke={C.ink} strokeWidth={4} />
      <path d="M165 38 C205 31 237 65 237 99 L210 124 L176 105Z" fill={C.yellow} opacity={0.46} />
      <path d="M66 95 Q72 146 118 166 L143 149 L125 107Z" fill={C.blue} opacity={0.12} />
      {paths.slice(1).map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={C.ink}
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress(f, cue + 8 + i * 3, 28)}
        />
      ))}
      <g stroke={C.teal} strokeWidth={2} opacity={0.75}>
        <path d="M91 81L125 128L171 65L220 92L195 152L151 170L76 123L91 81" fill="none" />
        <path d="M125 128L195 152M171 65L151 170" fill="none" />
      </g>
      {nodes.map(([x, y], i) => {
        const pulse = 0.5 + 0.5 * Math.sin((f - cue) / 16 - i * 1.1);
        return (
          <g key={i} opacity={progress(f, cue + 20 + i * 3, 14)}>
            <circle cx={x} cy={y} r={6 + pulse * 9} fill={C.teal} opacity={0.12 * pulse} />
            <circle cx={x} cy={y} r={3 + pulse * 2} fill={i % 2 ? C.blue : C.teal} />
          </g>
        );
      })}
    </g>
  );
};

const Person: React.FC<{
  f: number;
  walking?: boolean;
  detailed?: boolean;
  color?: string;
}> = ({ f, walking = false, detailed = false, color = C.ink }) => {
  const stride = walking ? Math.sin(f / 14) * 8 : 0;
  return (
    <g>
      <ellipse cx={0} cy={156} rx={42} ry={8} fill={C.ink} opacity={0.12} />
      <circle cx={0} cy={-21} r={24} fill={detailed ? "#C9A78C" : color} />
      {detailed && <path d="M-25 -23Q-18 -56 11 -47Q32 -40 24 -16L14 -29L-7 -28L-20 -12Z" fill={C.ink} />}
      <path
        d="M-20 8 Q0 0 20 8L32 79L-31 79Z"
        fill={detailed ? C.blue : color}
        stroke={color}
        strokeWidth={2}
      />
      <path
        d={`M-23 19L${-42 - stride} 79M24 19L${42 + stride} 78`}
        fill="none"
        stroke={detailed ? "#C9A78C" : color}
        strokeWidth={13}
        strokeLinecap="round"
      />
      <path
        d={`M-15 77L${-20 + stride} 145M14 77L${23 - stride} 145`}
        fill="none"
        stroke={color}
        strokeWidth={19}
        strokeLinecap="round"
      />
      <path d={`M${-20 + stride} 146h-13M${23 - stride} 146h13`} stroke={color} strokeWidth={10} strokeLinecap="round" />
    </g>
  );
};

const SensorIcon: React.FC<{ kind: number }> = ({ kind }) => (
  <g fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    {kind === 0 && (
      <>
        <path d="M-36 0Q0 -35 36 0Q0 35 -36 0Z" />
        <circle r={13} />
        <circle r={5} fill={C.blue} stroke="none" />
      </>
    )}
    {kind === 1 && (
      <>
        <path d="M-17 26C-33 11 -26 -25 -6 -31C23 -39 40 -6 23 12C11 21 9 36 -4 35" />
        <path d="M-10 9C-23 -5 -7 -23 6 -17C18 -11 16 3 7 7L2 18" />
      </>
    )}
    {kind === 2 && (
      <>
        <path d="M-4 -31L-17 11Q-21 23 -9 22Q0 13 9 22Q25 24 21 10L12 -14" />
        <path d="M-12 32Q2 37 16 31" />
      </>
    )}
    {kind === 3 && (
      <>
        <path d="M-23 25L-32 -1Q-33 -11 -25 -10L-13 3V-29Q-13 -40 -5 -37L0 -8V-37Q6 -44 12 -35L15 -7V-26Q24 -34 29 -22L30 14Q31 35 13 39H-7Z" />
        <path d="M-3 14Q11 8 19 18" />
      </>
    )}
    {kind === 4 && (
      <>
        <circle cx={0} cy={-29} r={10} />
        <path d="M-24 -4L0 -13L24 -4M0 -12V17M0 17L-18 40M0 17L18 40" />
      </>
    )}
  </g>
);

const Background: React.FC<{ f: number }> = ({ f }) => (
  <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <pattern id="s02-paper" width="64" height="64" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="8" r="0.8" fill={C.ink} opacity="0.055" />
        <circle cx="39" cy="44" r="0.65" fill={C.ink} opacity="0.04" />
        <path d="M0 63.5H64" stroke={C.ink} strokeOpacity="0.022" />
      </pattern>
      <pattern id="s02-grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M48 0H0V48" fill="none" stroke={C.ink} strokeWidth="0.6" strokeOpacity="0.08" />
      </pattern>
      <radialGradient id="s02-wash">
        <stop offset="0" stopColor={C.yellow} stopOpacity="0.14" />
        <stop offset="1" stopColor={C.yellow} stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="1920" height="1080" fill={C.paper} />
    <ellipse cx={1300 + Math.sin(f / 180) * 70} cy={410} rx={650} ry={460} fill="url(#s02-wash)" />
    <rect width="1920" height="1080" fill="url(#s02-paper)" />
    <rect x="110" y="264" width="1700" height="614" fill="url(#s02-grid)" opacity={0.35} />
    <path d="M112 92H1808M112 916H1808" stroke={C.line} strokeWidth="2" />
    <path d="M112 916H1808" stroke={C.ink} strokeWidth="2" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - f / 1549} />
  </svg>
);

const Dossier: React.FC<TimedProps> = ({ f, fps }) => {
  const highlighter = progress(f, 77, 54);
  return (
    <svg viewBox="0 0 1700 620" width="1700" height="620">
      <Reveal f={f} fps={fps} cue={11} x={445} y={28}>
        <g transform="rotate(-3 390 265)">
          <rect x="12" y="15" width="790" height="510" fill={C.ink} opacity={0.09} />
          <rect width="790" height="510" fill={C.white} stroke={C.line} strokeWidth={2} />
          <rect width="790" height="8" fill={C.ink} />
          <SvgWords text="CATATAN PERSEPSI / 02" f={f} cue={16} x={38} y={53} size={19} mono />
          <path d="M38 76H752" stroke={C.line} />
          <SvgWords text="Apa yang sebenarnya kita lihat?" f={f} cue={31} x={38} y={126} size={30} />
          <g transform="translate(315 267)">
            <path d="M-150 0Q0 -145 150 0Q0 145 -150 0Z" fill="#F0EDE5" stroke={C.ink} strokeWidth={4} />
            <circle r={65} fill={C.yellow} />
            <circle r={31} fill={C.ink} />
            <circle cx={11} cy={-13} r={9} fill={C.white} />
            <path d="M-166 -85h35M-158 84h35M147 -85h35M148 84h35" stroke={C.line} strokeWidth={2} />
          </g>
          <g opacity={progress(f, 49, 20)}>
            <path d="M540 198H726M540 222H699M540 246H720M540 298H680M540 322H729" stroke={C.line} strokeWidth={9} />
            <SvgWords text="LIHAT" f={f} cue={49} x={540} y={178} size={18} mono />
            <SvgWords text="PAHAMI?" f={f} cue={82} x={540} y={280} size={18} mono fill={C.red} />
          </g>
          <rect x={35} y={410} width={715 * highlighter} height={49} fill={C.yellow} />
          <SvgWords text="Ada sesuatu di balik kejadian itu." f={f} cue={80} x={49} y={444} size={29} />
          <path
            d="M518 261C493 206 747 205 747 266C747 323 495 326 514 269"
            fill="none"
            stroke={C.red}
            strokeWidth={5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - progress(f, 107, 35)}
          />
        </g>
      </Reveal>
      <Reveal f={f} fps={fps} cue={39} x={42} y={165}>
        <g transform="rotate(-7)">
          <rect width="300" height="218" fill="#E8E3D9" stroke={C.line} />
          <SvgWords text="KEJADIAN" f={f} cue={43} x={24} y={36} size={17} mono />
          <path d="M35 175V95L89 53L158 85L227 51V175Z" fill={C.muted} opacity={0.18} />
          <circle cx={150} cy={103} r={23} fill={C.ink} opacity={0.7} />
          <path d="M116 169L124 132Q150 118 177 133L186 169" fill={C.ink} opacity={0.7} />
          <path d="M21 194H274" stroke={C.muted} strokeDasharray="4 6" />
        </g>
      </Reveal>
      <Reveal f={f} fps={fps} cue={73} x={1360} y={112}>
        <rect width="274" height="252" fill={C.yellow} />
        <SvgWords text="BUKAN SEKADAR" f={f} cue={78} x={22} y={47} size={17} mono />
        <SvgWords text="MELIHAT." f={f} cue={93} x={22} y={103} size={34} />
        <path d="M28 142C90 130 122 172 192 151M179 136L196 151L180 167" fill="none" stroke={C.ink} strokeWidth={3} />
        <SvgWords text="Ada proses di baliknya." f={f} cue={114} x={22} y={216} size={17} weight={400} />
      </Reveal>
      <path
        d="M321 310C390 310 381 211 445 211M1234 211C1300 210 1300 242 1352 242"
        stroke={C.ink}
        strokeWidth={2}
        strokeDasharray="5 9"
        fill="none"
        opacity={progress(f, 65, 30) * 0.4}
      />
    </svg>
  );
};

const Network: React.FC<TimedProps> = ({ f, fps }) => {
  const receive = progress(f, 308, 32);
  const bx = interpolate(receive, [0, Math.max(0 + 0.001, 1)], [1110, 850], CLAMP);
  const by = interpolate(receive, [0, Math.max(0 + 0.001, 1)], [235, 275], CLAMP);
  const sensors = [
    { cue: 308, x: 210, y: 230, name: "MATA", kind: 0 },
    { cue: 399, x: 350, y: 473, name: "TELINGA", kind: 1 },
    { cue: 425, x: 1350, y: 140, name: "HIDUNG", kind: 2 },
    { cue: 448, x: 1470, y: 327, name: "KULIT", kind: 3 },
    { cue: 473, x: 1280, y: 506, name: "TUBUH", kind: 4 },
  ];
  return (
    <svg viewBox="0 0 1700 620" width="1700" height="620">
      <g opacity={1 - progress(f, 308, 24)}>
        <Reveal f={f} fps={fps} cue={164} x={350} y={185}>
          <rect x={-128} y={-73} width={256} height={168} rx={15} fill={C.white} stroke={C.ink} strokeWidth={5} />
          <path d="M-81 -73L-59 -107H24L49 -73" fill={C.white} stroke={C.ink} strokeWidth={5} />
          <circle r={58} fill="#E8E3D9" stroke={C.ink} strokeWidth={4} />
          <circle r={37} fill={C.ink} />
          <circle cx={-10} cy={-12} r={13} fill={C.blue} opacity={0.65} />
          <rect x={82} y={-51} width={27} height={15} fill={C.ink} />
          <SvgWords text="MEREKAM" f={f} cue={164} x={0} y={150} anchor="middle" mono size={20} />
          <path d="M-156 -111L157 117" stroke={C.red} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress(f, 182, 22)} />
        </Reveal>
        <SvgWords text="≠" f={f} cue={183} x={726} y={247} size={105} anchor="middle" />
      </g>

      {sensors.map((node, i) => {
        const d = `M${node.x} ${node.y} Q${(node.x + 850) / 2} ${node.y} 850 310`;
        const travel = ((Math.max(0, f - node.cue - 24) % 92) / 92);
        const px = node.x + (850 - node.x) * travel;
        const py = node.y + (310 - node.y) * travel * travel;
        const incomplete = f >= 519;
        return (
          <g key={node.name}>
            <path
              d={d}
              fill="none"
              stroke={incomplete ? C.muted : C.teal}
              strokeWidth={3}
              opacity={progress(f, node.cue + 10, 24) * 0.55}
              pathLength={1}
              strokeDasharray={incomplete ? "0.04 0.025" : "1"}
              strokeDashoffset={incomplete ? 0 : 1 - progress(f, node.cue + 12, 34)}
            />
            {f >= node.cue + 24 && (!incomplete || travel < 0.4 || travel > 0.73) && (
              <circle cx={px} cy={py} r={6} fill={incomplete ? C.red : C.teal} />
            )}
            <Reveal f={f} fps={fps} cue={node.cue} x={node.x} y={node.y}>
              <circle r={65} fill={C.white} stroke={C.line} strokeWidth={2} />
              <circle r={71} fill="none" stroke={i === 0 ? C.blue : C.teal} strokeWidth={2} opacity={0.4} />
              <SensorIcon kind={node.kind} />
              <SvgWords text={node.name} f={f} cue={node.cue + 4} x={0} y={98} size={19} anchor="middle" mono />
            </Reveal>
          </g>
        );
      })}

      <Reveal f={f} fps={fps} cue={225} x={bx - 157} y={by - 125}>
        <circle cx={157} cy={124} r={166} fill={C.white} stroke={C.line} strokeWidth={2} />
        <g transform={`rotate(${(f - 225) * 0.18} 157 124)`}>
          <circle cx={157} cy={124} r={181} fill="none" stroke={C.blue} strokeWidth={2} strokeDasharray="90 1040" opacity={0.55} />
        </g>
        <Brain f={f} fps={fps} cue={225} />
      </Reveal>
      <g opacity={1 - progress(f, 308, 20)}>
        <rect x={918} y={419} width={384 * progress(f, 265, 18)} height={52} fill={C.yellow} />
        <SvgWords text="MESIN PREDIKSI" f={f} cue={265} x={1110} y={455} anchor="middle" size={35} />
        <SvgWords text="Menyusun, bukan menyalin." f={f} cue={279} x={1110} y={504} anchor="middle" size={22} weight={400} />
      </g>
      <g opacity={progress(f, 308, 22)}>
        <SvgWords text="OTAK" f={f} cue={308} x={850} y={502} anchor="middle" size={22} mono />
        <SvgWords text="Informasi masuk → interpretasi" f={f} cue={345} x={850} y={539} anchor="middle" size={21} weight={400} />
      </g>
      <Reveal f={f} fps={fps} cue={519} x={585} y={26}>
        <rect width={530} height={55} fill={C.yellow} />
        <SvgWords text="TIDAK SEMUA SINYAL LENGKAP" f={f} cue={519} x={265} y={36} anchor="middle" size={23} />
      </Reveal>
      <g opacity={progress(f, 541, 18)}>
        <path d="M1058 338C1117 278 1253 336 1225 397C1196 454 1068 427 1058 338" fill="none" stroke={C.red} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress(f, 549, 36)} />
        <SvgWords text="celah informasi" f={f} cue={576} x={1135} y={456} size={18} fill={C.red} mono anchor="middle" />
      </g>
    </svg>
  );
};

const Observation: React.FC<TimedProps> = ({ f, fps }) => {
  const scan = 150 + ((f - 648) / 4.5) % 275;
  const gathered = progress(f, 870, 40);
  const evidence = [
    { cue: 720, label: "01  BENTUK TUBUH", detail: "Siluet yang terlihat", color: C.ink },
    { cue: 798, label: "02  CARA BERJALAN", detail: "Pola gerak", color: C.teal },
    { cue: 825, label: "03  BAJU", detail: "Warna & bentuk", color: C.blue },
    { cue: 847, label: "04  RAMBUT", detail: "Potongan rambut", color: C.ink },
  ];
  return (
    <svg viewBox="0 0 1700 620" width="1700" height="620">
      <Reveal f={f} fps={fps} cue={648}>
        <rect x={0} y={18} width={1020} height={565} fill="#E7E6DF" stroke={C.line} strokeWidth={2} />
        <path d="M0 18L411 179H650L1020 18M0 583L411 385H650L1020 583M411 179V385M650 179V385" fill="none" stroke="#BDBEB8" strokeWidth={2} />
        <path d="M0 430L530 283L1020 430M0 510L530 283L1020 510M118 583L530 283L890 583" fill="none" stroke="#C9CAC3" strokeWidth={1.5} />
        <rect x={411} y={179} width={239} height={206} fill={C.white} opacity={0.38} />
        <path d="M91 110V72H129M891 72H929V110M91 490V528H129M891 528H929V490" fill="none" stroke={C.ink} strokeWidth={2} opacity={0.5} />
        <SvgWords text="PENGAMATAN / JARAK JAUH" f={f} cue={648} x={42} y={57} size={17} mono />
        <SvgWords text="Identitas belum terlihat jelas" f={f} cue={678} x={42} y={553} size={21} weight={400} />
        <g transform={`translate(530 ${258 + (f >= 798 ? Math.sin(f / 14) * 2 : 0)}) scale(0.63)`}>
          <Person f={f} walking={f >= 798} detailed={f >= 825} />
        </g>
        <g opacity={progress(f, 720, 20)}>
          <rect x={462} y={204} width={136} height={173} fill="none" stroke={C.blue} strokeWidth={2} strokeDasharray="9 7" />
          <path d="M462 218H449V203H467M595 203H611V218M449 365V381H465M596 381H611V365" fill="none" stroke={C.blue} strokeWidth={3} />
          <path d={`M453 ${scan}H607`} stroke={C.blue} strokeWidth={2} opacity={0.35} />
          <path d="M608 250L785 165H1038" fill="none" stroke={C.blue} strokeWidth={2} opacity={0.6} />
        </g>
        <g opacity={progress(f, 798, 20)}>
          <path d="M503 396Q530 414 556 396M505 408Q530 426 552 409" fill="none" stroke={C.teal} strokeWidth={3} />
        </g>
        <g opacity={progress(f, 847, 12)}>
          <circle cx={530} cy={240} r={25} fill="none" stroke={C.red} strokeWidth={3} />
          <path d="M557 230L650 195H751" fill="none" stroke={C.red} strokeWidth={2} />
          <SvgWords text="detail terbatas" f={f} cue={850} x={659} y={186} size={16} mono fill={C.red} />
        </g>
      </Reveal>
      <SvgWords text="POTONGAN INFORMASI" f={f} cue={720} x={1100} y={49} size={20} mono />
      {evidence.map((item, i) => {
        const y = 80 + i * 100;
        return (
          <Reveal key={item.label} f={f} fps={fps} cue={item.cue} x={1100} y={y - gathered * i * 6}>
            <rect width={570} height={82} fill={C.white} stroke={C.line} strokeWidth={2} />
            <rect width={6} height={82} fill={item.color} />
            <SvgWords text={item.label} f={f} cue={item.cue} x={24} y={30} size={21} />
            <SvgWords text={item.detail} f={f} cue={item.cue + 6} x={24} y={60} size={18} weight={400} fill={C.muted} />
            <circle cx={530} cy={41} r={14} fill={C.yellow} opacity={progress(f, item.cue + 10, 14)} />
            <path d="M523 41L528 46L537 35" fill="none" stroke={C.ink} strokeWidth={2} opacity={progress(f, item.cue + 13, 12)} />
          </Reveal>
        );
      })}
      <Reveal f={f} fps={fps} cue={870} x={1150} y={480}>
        <path d="M234 -39V-9M225 -20L234 -8L244 -20" fill="none" stroke={C.teal} strokeWidth={3} />
        <rect width={474} height={103} fill={C.ink} />
        <g transform="translate(18 5) scale(0.39)">
          <Brain f={f} fps={fps} cue={870} />
        </g>
        <SvgWords text="OTAK MENGGABUNGKAN" f={f} cue={870} x={156} y={43} fill={C.white} size={19} />
        <SvgWords text="petunjuk yang tersedia" f={f} cue={888} x={156} y={73} fill={C.yellow} size={18} weight={400} />
      </Reveal>
    </svg>
  );
};

const Reasoning: React.FC<TimedProps> = ({ f, fps }) => {
  const correction = progress(f, 1237, 12);
  return (
    <svg viewBox="0 0 1700 620" width="1700" height="620">
      <Reveal f={f} fps={fps} cue={965} x={40} y={28}>
        <rect width={385} height={490} fill={C.white} stroke={C.line} strokeWidth={2} />
        <rect width={385} height={52} fill="#E5E8E4" />
        <SvgWords text="YANG TERLIHAT" f={f} cue={965} x={24} y={34} size={20} mono />
        <g transform="translate(193 159) scale(1.15)">
          <Person f={f} detailed />
        </g>
        <path d="M22 380H363" stroke={C.line} />
        <SvgWords text="Baju • rambut • gerak" f={f} cue={977} x={193} y={420} anchor="middle" size={23} weight={400} />
        <SvgWords text="Identitas: belum diketahui" f={f} cue={989} x={193} y={458} anchor="middle" size={18} mono fill={C.muted} />
      </Reveal>
      <path
        d="M445 252H660"
        fill="none"
        stroke={C.teal}
        strokeWidth={3}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - progress(f, 978, 34)}
      />
      <Reveal f={f} fps={fps} cue={965} x={680} y={96}>
        <Brain f={f} fps={fps} cue={965} size={1.1} />
      </Reveal>
      <Reveal f={f} fps={fps} cue={1032} x={580} y={14} lift={8}>
        <rect width={540} height={63} fill={C.yellow} />
        <SvgWords text="SIAPA ORANG INI?" f={f} cue={1032} x={270} y={44} anchor="middle" size={34} stagger={2} />
      </Reveal>
      <Reveal f={f} fps={fps} cue={1065} x={1275} y={28}>
        <g transform="rotate(2 192 245)">
          <rect x={8} y={8} width={385} height={490} fill={C.ink} opacity={0.08} />
          <rect width={385} height={490} fill="#EEE9DB" stroke={C.line} strokeWidth={2} />
          <rect width={385} height={52} fill={C.yellow} />
          <SvgWords text="INGATAN TENTANG TEMAN" f={f} cue={1065} x={18} y={34} size={18} mono />
          <g transform="translate(193 159) scale(1.15)">
            <Person f={f} detailed />
          </g>
          <path d="M22 380H363" stroke={C.line} />
          <SvgWords text="Beberapa ciri mirip" f={f} cue={1083} x={193} y={420} anchor="middle" size={25} />
          <SvgWords text="Kemiripan ≠ kepastian" f={f} cue={1100} x={193} y={458} anchor="middle" size={18} mono fill={C.muted} />
        </g>
      </Reveal>
      <path
        d="M1270 251H1050"
        fill="none"
        stroke={C.blue}
        strokeWidth={3}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - progress(f, 1073, 33)}
      />
      <g opacity={progress(f, 1088, 20)}>
        <path
          d="M273 212C318 152 402 190 387 251C373 304 282 287 273 212M1423 210C1469 151 1549 188 1540 246C1528 304 1438 289 1423 210"
          fill="none"
          stroke={C.red}
          strokeWidth={4}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress(f, 1090, 32)}
        />
      </g>
      <Reveal f={f} fps={fps} cue={1146} x={594} y={380}>
        <path d="M256 -65V-17M247 -29L256 -16L266 -29" stroke={C.ink} strokeWidth={3} fill="none" />
        <rect width={512} height={156} fill={C.white} stroke={C.ink} strokeWidth={2} strokeDasharray="8 6" />
        <SvgWords text="KESIMPULAN SEMENTARA" f={f} cue={1146} x={256} y={37} anchor="middle" size={19} mono fill={C.muted} />
        <g opacity={1 - correction * 0.45}>
          <rect x={71} y={61} width={370 * progress(f, 1209, 8)} height={61} fill={C.yellow} />
          <SvgWords text="TEMAN GUE?" f={f} cue={1209} x={256} y={105} anchor="middle" size={44} stagger={2} />
        </g>
      </Reveal>
      <Reveal f={f} fps={fps} cue={1237} x={647} y={495} lift={10}>
        <g transform={`rotate(${-5 * entrance(f, 1237, fps)} 207 38)`}>
          <rect width={414} height={78} fill={C.paper} stroke={C.red} strokeWidth={4} />
          <SvgWords text="BELUM TENTU." f={f} cue={1237} x={207} y={53} anchor="middle" size={37} fill={C.red} stagger={2} />
        </g>
      </Reveal>
      <SvgWords text="MIRIP" f={f} cue={1101} x={1167} y={230} size={18} anchor="middle" mono fill={C.blue} />
      <SvgWords text="PETUNJUK" f={f} cue={995} x={552} y={230} size={18} anchor="middle" mono fill={C.teal} />
    </svg>
  );
};

const Forecast: React.FC<TimedProps> = ({ f, fps }) => {
  const useful = progress(f, 1472, 16);
  const next = progress(f, 1526, 12);
  return (
    <svg viewBox="0 0 1700 620" width="1700" height="620">
      <Reveal f={f} fps={fps} cue={1269}>
        <rect x={10} y={32} width={1680} height={355} fill={C.white} stroke={C.line} strokeWidth={2} />
        <SvgWords text="URUTAN PROSES / ILUSTRASI KONSEPTUAL" f={f} cue={1269} x={42} y={69} size={18} mono fill={C.muted} />
        <path d="M282 267H1430" stroke={C.line} strokeWidth={3} />
        <g transform="translate(270 137) scale(0.55)">
          <Person f={f} detailed />
        </g>
        <circle cx={270} cy={267} r={10} fill={C.ink} />
        <SvgWords text="PETUNJUK MASUK" f={f} cue={1269} x={270} y={318} anchor="middle" size={24} />
        <SvgWords text="Yang sempat terlihat" f={f} cue={1294} x={270} y={350} anchor="middle" size={18} weight={400} fill={C.muted} />

        <g transform="translate(705 104) scale(0.55)">
          <Brain f={f} fps={fps} cue={1269} />
        </g>

        <g opacity={0.22 + progress(f, 1400, 18) * 0.78}>
          <rect x={679} y={284} width={346} height={47} fill={C.yellow} />
          <circle cx={850} cy={267} r={10} fill={C.ink} />
          <SvgWords text="PERKIRAAN" f={f} cue={1400} x={850} y={318} anchor="middle" size={28} />
          <SvgWords text="Sudah dibuat oleh otak" f={f} cue={1415} x={850} y={355} anchor="middle" size={18} weight={400} fill={C.muted} />
        </g>
        <g opacity={0.6}>
          <circle cx={1430} cy={178} r={56} fill="none" stroke={C.muted} strokeWidth={2} strokeDasharray="6 7" />
          <SvgWords text="?" f={f} cue={1299} x={1430} y={198} anchor="middle" size={60} fill={C.muted} />
          <circle cx={1430} cy={267} r={10} fill={C.paper} stroke={C.muted} strokeWidth={2} />
          <SvgWords text="IDENTITAS SEBENARNYA" f={f} cue={1312} x={1430} y={318} anchor="middle" size={23} />
          <SvgWords text="Masih perlu dipastikan" f={f} cue={1330} x={1430} y={350} anchor="middle" size={18} weight={400} fill={C.muted} />
        </g>
        <path d="M280 267H837" stroke={C.teal} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress(f, 1400, 35)} />
        <path d="M848 255L861 267L848 279" fill="none" stroke={C.teal} strokeWidth={4} opacity={progress(f, 1420, 14)} />
        <path
          d="M657 294C701 255 1028 263 1039 309C1057 364 654 370 657 294"
          fill="none"
          stroke={C.red}
          strokeWidth={4}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress(f, 1424, 32)}
        />
      </Reveal>
      <Reveal f={f} fps={fps} cue={1400} x={10} y={418}>
        <rect width={1680} height={149} fill={C.ink} />
        <g opacity={1 - useful}>
          <SvgWords text="PERKIRAAN MENDAHULUI KEPASTIAN." f={f} cue={1400} x={48} y={483 - 418} size={48} fill={C.white} stagger={4} />
          <SvgWords text="Bukan rekaman utuh. Sebuah interpretasi." f={f} cue={1420} x={48} y={113} size={24} weight={400} fill="#C8C5BF" />
        </g>
        <g opacity={useful * (1 - next)}>
          <SvgWords text="CEPAT. EFISIEN. BERGUNA." f={f} cue={1472} x={48} y={66} size={47} fill={C.yellow} />
          <SvgWords text="Otak tidak harus menunggu semua informasi lengkap." f={f} cue={1483} x={48} y={112} size={24} weight={400} fill={C.white} />
          <g transform="translate(1530 73)" fill="none" stroke={C.yellow} strokeWidth={4}>
            <circle r={43} />
            <path d="M0 -24V0L23 12" />
          </g>
        </g>
        <g opacity={next}>
          <SvgWords text="BAGAIMANA KALAU SELALU DARI NOL?" f={f} cue={1526} x={48} y={67} size={39} fill={C.yellow} stagger={2} />
          <SvgWords text="Setiap hal kecil. Setiap kali." f={f} cue={1535} x={48} y={111} size={25} fill={C.white} weight={400} stagger={2} />
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={progress(f, 1526 + i * 5, 8)} transform={`translate(${1432 + i * 66} 54)`}>
              <rect width={48} height={48} fill="none" stroke={C.white} strokeWidth={2} />
              <text x={24} y={34} fontFamily={MONO} fontSize={30} textAnchor="middle" fill={C.white}>0</text>
            </g>
          ))}
        </g>
      </Reveal>
    </svg>
  );
};

const Heading: React.FC<TimedProps> = ({ f, fps }) => {
  let title = "";
  let cue = 11;
  let kicker = "01 / DI BALIK PERSEPSI";
  let size = 62;

  if (f < 164) {
    title = "ADA SESUATU DI BALIKNYA.";
  } else if (f < 225) {
    title = "OTAK KITA, BUKAN KAMERA.";
    cue = 164;
    kicker = "02 / CARA OTAK BEKERJA";
  } else if (f < 265) {
    title = "OTAK KITA LEBIH MIRIP…";
    cue = 225;
    kicker = "02 / CARA OTAK BEKERJA";
  } else if (f < 308) {
    title = "MESIN PREDIKSI.";
    cue = 265;
    kicker = "02 / CARA OTAK BEKERJA";
  } else if (f < 519) {
    title = "OTAK MENERIMA SINYAL.";
    cue = 308;
    kicker = "02 / INFORMASI DARI INDRA";
  } else if (f < 648) {
    title = "INFORMASINYA TIDAK SELALU LENGKAP.";
    cue = 519;
    kicker = "02 / CELAH INFORMASI";
    size = 54;
  } else if (f < 870) {
    title = "DARI JAUH, HANYA PETUNJUK.";
    cue = 648;
    kicker = "03 / SESEORANG DI KEJAUHAN";
  } else if (f < 965) {
    title = "OTAK MENGUMPULKAN PETUNJUK.";
    cue = 870;
    kicker = "03 / MENYUSUN INFORMASI";
    size = 58;
  } else if (f < 1032) {
    title = "SATU PERTANYAAN.";
    cue = 965;
    kicker = "04 / DARI PETUNJUK KE DUGAAN";
  } else if (f < 1065) {
    title = "SIAPA ORANG INI?";
    cue = 1032;
    kicker = "04 / DARI PETUNJUK KE DUGAAN";
  } else if (f < 1146) {
    title = "CIRI YANG MIRIP, INGATAN YANG MUNCUL.";
    cue = 1065;
    kicker = "04 / MEMBANDINGKAN DENGAN INGATAN";
    size = 51;
  } else if (f < 1237) {
    title = "KESIMPULAN BISA DATANG LANGSUNG.";
    cue = 1146;
    kicker = "04 / DARI KEMIRIPAN KE KESIMPULAN";
    size = 54;
  } else if (f < 1269) {
    title = "TAPI BELUM TENTU.";
    cue = 1237;
    kicker = "04 / DUGAAN BUKAN KEPASTIAN";
  } else if (f < 1400) {
    title = "SEBELUM IDENTITASNYA PASTI…";
    cue = 1269;
    kicker = "05 / PERKIRAAN TERLEBIH DAHULU";
  } else if (f < 1472) {
    title = "OTAK SUDAH MEMBUAT PERKIRAAN.";
    cue = 1400;
    kicker = "05 / PERKIRAAN TERLEBIH DAHULU";
    size = 56;
  } else if (f < 1526) {
    title = "DAN ITU SANGAT BERGUNA.";
    cue = 1472;
    kicker = "05 / KEUNTUNGAN MESIN PREDIKSI";
  } else {
    title = "BAYANGKAN, MULAI DARI NOL.";
    cue = 1526;
    kicker = "LANJUTAN / BIAYA MEMPROSES SEMUANYA";
    size = 58;
  }

  return (
    <div style={{ position: "absolute", left: 112, top: 117, width: 1696 }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 18,
          letterSpacing: 2,
          color: C.muted,
          opacity: progress(f, cue, 8),
          marginBottom: 16,
        }}
      >
        {kicker}
      </div>
      <Kinetic
        key={cue}
        text={title}
        f={f}
        fps={fps}
        cue={cue}
        stagger={f >= 1526 ? 2 : 4}
        style={{
          fontSize: size,
          fontWeight: 900,
          letterSpacing: -2.4,
          lineHeight: 1.04,
          color: f >= 1237 && f < 1269 ? C.red : C.ink,
        }}
      />
    </div>
  );
};

const Narration: React.FC<TimedProps> = ({ f, fps }) => {
  const beat = beats.find((b) => f >= b.start && f <= b.end);
  if (!beat) return null;
  const words = beat.text.split(" ");
  const stagger = Math.max(1, ((beat.end - beat.start) * 0.7) / Math.max(1, words.length - 1));
  return (
    <div
      style={{
        position: "absolute",
        left: 170,
        right: 170,
        top: 958,
        display: "flex",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Kinetic
        key={beat.start}
        text={beat.text}
        f={f}
        fps={fps}
        cue={beat.start}
        stagger={stagger}
        style={{
          justifyContent: "center",
          maxWidth: 1510,
          fontSize: 29,
          lineHeight: 1.32,
          fontWeight: 500,
          color: C.ink,
          letterSpacing: -0.4,
        }}
      />
    </div>
  );
};

export const Scene_02: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);
  const common = { f, fps };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: C.paper,
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
        <Sequence from={0} durationInFrames={1550} name="Paper / background">
          <Background f={f} />
        </Sequence>

        <Sequence from={0} durationInFrames={1550} name="Editorial furniture">
          <div
            style={{
              position: "absolute",
              top: 39,
              left: 112,
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div style={{ width: 38, height: 28, backgroundColor: C.yellow }} />
            <span style={{ fontSize: 18, letterSpacing: 2.4, fontWeight: 800 }}>
              ANATOMI SEBUAH PERSEPSI
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              right: 112,
              top: 42,
              fontFamily: MONO,
              fontSize: 18,
              color: C.muted,
              letterSpacing: 1.4,
            }}
          >
            BAB 02 / 11
          </div>
          <div
            style={{
              position: "absolute",
              left: 112,
              top: 889,
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: 1.5,
              color: C.muted,
            }}
          >
            DIAGRAM KONSEPTUAL • ILUSTRASI PERSEPSI
          </div>
          <div
            style={{
              position: "absolute",
              right: 112,
              top: 885,
              display: "flex",
              gap: 7,
              alignItems: "center",
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => {
              const active =
                f < 164 ? 0 : f < 648 ? 1 : f < 965 ? 2 : f < 1269 ? 3 : 4;
              return (
                <div
                  key={i}
                  style={{
                    width: active === i ? 35 : 12,
                    height: 5,
                    backgroundColor: active === i ? C.ink : C.line,
                  }}
                />
              );
            })}
          </div>
        </Sequence>

        <Sequence from={0} durationInFrames={164} name="01 / Behind the observation">
          <div style={{ position: "absolute", left: 110, top: 263 }}>
            <Dossier {...common} />
          </div>
        </Sequence>

        <Sequence from={164} durationInFrames={484} name="02 / Brain and incomplete sensory signals">
          <div style={{ position: "absolute", left: 110, top: 263 }}>
            <Network {...common} />
          </div>
        </Sequence>

        <Sequence from={648} durationInFrames={317} name="03 / A person seen from a distance">
          <div style={{ position: "absolute", left: 110, top: 263 }}>
            <Observation {...common} />
          </div>
        </Sequence>

        <Sequence from={965} durationInFrames={304} name="04 / Memory comparison and tentative conclusion">
          <div style={{ position: "absolute", left: 110, top: 263 }}>
            <Reasoning {...common} />
          </div>
        </Sequence>

        <Sequence from={1269} durationInFrames={281} name="05 / Prediction before certainty">
          <div style={{ position: "absolute", left: 110, top: 263 }}>
            <Forecast {...common} />
          </div>
        </Sequence>

        <Sequence from={0} durationInFrames={1550} name="Kinetic editorial headings">
          <Heading {...common} />
        </Sequence>

        <Sequence from={0} durationInFrames={1550} name="Narration-synchronized captions">
          <Narration {...common} />
        </Sequence>
      </div>
    </div>
  );
};