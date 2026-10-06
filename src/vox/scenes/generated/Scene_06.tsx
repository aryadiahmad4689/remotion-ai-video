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
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
  muted: "#77736B",
  line: "#D9D4CA",
  white: "#FFFEFA",
};

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const BEATS = [
  [27, 37, "Tapi,"],
  [60, 92, "informasi yang kamu baca"],
  [94, 189, "tidak diproses cukup dalam untuk menjadi ingatan yang kuat."],
  [201, 254, "Makanya kamu bisa membaca satu halaman,"],
  [264, 294, "lalu sadar bahwa"],
  [298, 354, "kamu sama sekali nggak tahu isinya."],
  [368, 402, "Dan akhirnya,"],
  [411, 434, "baca ulang."],
  [442, 447, "Lagi,"],
  [460, 479, "dan lagi,"],
  [500, 540, "sampai akhirnya tetap lupa."],
  [558, 597, "Otak kita memang agak ngeselin,"],
  [614, 641, "tapi belum selesai."],
  [655, 723, "Karena bukan cuma ingatan dan penglihatan"],
  [723, 765, "yang bisa membuat kita salah."],
  [765, 829, "Waktu juga bisa ditipu oleh otak."],
  [843, 926, "Pernah merasa satu jam berlalu seperti 10 menit?"],
  [934, 945, "Misalnya,"],
  [952, 981, "kamu sedang main game,"],
  [1001, 1017, "nonton film,"],
  [1038, 1064, "ngobrol dengan teman,"],
  [1074, 1109, "atau scroll HP."],
  [1125, 1142, "Tiba-tiba,"],
  [1157, 1170, "lihat jam."],
  [1186, 1191, "Hah?"],
  [1202, 1221, "Udah jam 12?"],
  [1243, 1295, "Padahal rasanya baru sebentar."],
  [1302, 1311, "Tapi,"],
  [1329, 1364, "coba lakukan hal sebaliknya."],
  [1382, 1388, "Duduk,"],
  [1404, 1425, "menunggu seseorang."],
  [1441, 1470, "Tidak melakukan apa-apa."],
  [1491, 1503, "Lihat jam."],
  [1519, 1534, "5 menit."],
] as const;

const mix = (
  frame: number,
  start: number,
  end: number,
  from = 0,
  to = 1,
) => interpolate(frame, [start, Math.max(start + 0.001, end)], [from, to], CLAMP);

const pop = (frame: number, cue: number, fps: number) =>
  frame < cue
    ? 0
    : spring({
        frame: Math.max(0, frame - cue),
        fps,
        config: { damping: 12, mass: 0.5, stiffness: 100 },
      });

/**
 * Scene-local layer sequence.
 * Deliberately preserves the narration's absolute scene frame for every layer.
 */
const Sequence: React.FC<{
  from: number;
  durationInFrames: number;
  children: React.ReactNode;
}> = ({ from, durationInFrames, children }) => {
  const frame = useCurrentFrame();
  return frame >= from && frame < from + durationInFrames ? (
    <>{children}</>
  ) : null;
};

const KineticText: React.FC<{
  text: string;
  cue: number;
  end?: number;
  size?: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ text, cue, end, size = 54, color = C.ink, weight = 800, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const stagger = end
    ? Math.min(7, Math.max(1, (end - cue - 7) / Math.max(1, words.length - 1)))
    : 3;

  return (
    <div
      style={{
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.12,
        letterSpacing: "-0.045em",
        color,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const start = cue + i * stagger;
        const p = pop(frame, start, fps);
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              marginRight: "0.23em",
              opacity: mix(frame, start, start + 6),
              transform: `translateY(${(1 - p) * 24}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const Reveal: React.FC<{
  cue: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  distance?: number;
}> = ({ cue, children, style, distance = 28 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, cue, fps);
  return (
    <div
      style={{
        opacity: mix(frame, cue, cue + 10),
        transform: `translateY(${(1 - p) * distance}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Tag: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color = C.yellow, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "10px 15px",
      background: color,
      color: color === C.ink ? C.paper : C.ink,
      fontSize: 17,
      fontWeight: 800,
      letterSpacing: "0.13em",
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </div>
);

const Brain: React.FC<{
  frame: number;
  cue: number;
  color?: string;
  weak?: boolean;
}> = ({ frame, cue, color = C.blue, weak = false }) => {
  const reveal = mix(frame, cue, cue + 54);
  const nodes = [
    [95, 136],
    [150, 82],
    [219, 67],
    [274, 103],
    [327, 154],
    [275, 197],
    [208, 154],
    [148, 203],
    [102, 257],
    [220, 269],
    [306, 269],
    [356, 216],
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [0, 6],
    [1, 6],
    [6, 3],
    [6, 5],
    [5, 4],
    [6, 7],
    [7, 8],
    [7, 9],
    [9, 10],
    [10, 5],
    [10, 11],
    [11, 4],
  ];

  return (
    <svg viewBox="0 0 450 360" style={{ width: "100%", height: "100%" }}>
      <path
        d="M224 43 C188 19 151 35 135 58 C98 49 66 76 67 111
           C35 131 40 170 57 187 C39 224 62 256 90 260
           C89 292 120 314 149 306 C171 331 205 327 224 305
           C247 329 282 327 301 305 C338 309 361 286 363 261
           C401 245 414 209 393 182 C412 147 394 116 371 108
           C369 73 339 51 311 59 C286 28 250 26 224 43Z"
        fill={C.white}
        stroke={C.ink}
        strokeWidth="3"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - reveal}
      />
      <path
        d="M224 48 C208 83 237 109 220 139 C201 166 236 188 221 217
           C205 245 231 273 224 304
           M136 60 Q119 96 151 119 M70 111 Q109 117 108 156
           M62 188 Q115 173 137 208 M95 260 Q148 245 167 274
           M311 62 Q282 103 315 124 M371 111 Q329 138 354 166
           M391 185 Q336 176 325 213 M360 260 Q303 239 288 278"
        fill="none"
        stroke={C.line}
        strokeWidth="3"
        opacity={reveal}
      />
      <g opacity={reveal}>
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a][0]}
            y1={nodes[a][1]}
            x2={nodes[b][0]}
            y2={nodes[b][1]}
            stroke={color}
            strokeWidth={weak ? 1.8 : 2.8}
            opacity={weak ? 0.18 : 0.35}
          />
        ))}
        {edges.map(([a, b], i) => {
          const t = ((Math.max(0, frame - cue) + i * 13) % 95) / 95;
          return (
            <circle
              key={`signal-${i}`}
              cx={nodes[a][0] + (nodes[b][0] - nodes[a][0]) * t}
              cy={nodes[a][1] + (nodes[b][1] - nodes[a][1]) * t}
              r={weak ? 2.5 : 3.5}
              fill={color}
              opacity={weak ? 0.2 : 0.8}
            />
          );
        })}
        {nodes.map(([x, y], i) => {
          const pulse = (Math.sin((frame - cue) / 14 - i) + 1) / 2;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={9 + pulse * 7}
                fill={color}
                opacity={weak ? 0.04 : 0.08 + pulse * 0.08}
              />
              <circle
                cx={x}
                cy={y}
                r={weak ? 3 : 4.5}
                fill={color}
                opacity={weak ? 0.4 : 1}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

const PaperDocument: React.FC<{ frame: number }> = ({ frame }) => {
  const fade = mix(frame, 298, 337, 1, 0.1);
  const highlight = mix(frame, 60, 92);
  const rereadCue = frame >= 460 ? 460 : frame >= 442 ? 442 : 411;
  const scanning = mix(frame, rereadCue, rereadCue + 28);
  const scanY = frame >= 411 ? 122 + scanning * 230 : 122;

  return (
    <svg viewBox="0 0 400 480" style={{ width: "100%", height: "100%" }}>
      <rect x="27" y="24" width="345" height="432" fill={C.ink} opacity="0.08" />
      <path
        d="M18 12 H312 L360 60 V444 H18Z"
        fill={C.white}
        stroke={C.ink}
        strokeWidth="2"
      />
      <path d="M312 12 V60 H360" fill={C.paper} stroke={C.ink} strokeWidth="2" />
      <text
        x="44"
        y="55"
        fill={C.muted}
        fontSize="12"
        letterSpacing="3"
        fontFamily="Arial, sans-serif"
      >
        CATATAN / 006
      </text>
      <rect x="44" y="80" width="164" height="12" fill={C.ink} />
      <g opacity={fade}>
        <rect
          x="40"
          y="115"
          width={265 * highlight}
          height="23"
          fill={C.yellow}
          transform="rotate(-1 40 115)"
        />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i}>
            <rect
              x="44"
              y={122 + i * 21}
              width={[252, 267, 214, 247, 232, 264][i % 6]}
              height="5"
              rx="2"
              fill={C.ink}
              opacity={i < 2 ? 0.65 : 0.23}
            />
          </g>
        ))}
      </g>
      {frame >= 298 && (
        <text
          x="190"
          y="266"
          textAnchor="middle"
          fontSize="90"
          fontWeight="700"
          fontFamily="Arial, sans-serif"
          fill={C.red}
          opacity={mix(frame, 298, 315)}
        >
          ?
        </text>
      )}
      {frame >= 411 && frame < 500 && (
        <g>
          <rect x="40" y={scanY - 7} width="275" height="20" fill={C.yellow} opacity=".55" />
          <path d={`M29 ${scanY + 2} H9`} stroke={C.red} strokeWidth="4" />
        </g>
      )}
      <line x1="44" y1="401" x2="313" y2="401" stroke={C.line} />
      <text x="44" y="424" fontSize="12" fill={C.muted} fontFamily="Arial, sans-serif">
        01 / 01
      </text>
    </svg>
  );
};

const MemoryPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const loop = mix(frame, 411, 434);
  const low = mix(frame, 148, 189);
  const panelExit = mix(frame, 542, 558, 1, 0);
  const readCount = frame >= 460 ? 3 : frame >= 442 ? 2 : frame >= 411 ? 1 : 0;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: panelExit }}>
      <div style={{ position: "absolute", left: 100, top: 155 }}>
        {frame < 201 ? (
          <KineticText
            text={frame < 60 ? "Tapi." : "Dibaca ≠ diingat."}
            cue={frame < 60 ? 27 : 60}
            size={88}
          />
        ) : frame < 368 ? (
          <KineticText
            text={frame < 298 ? "Satu halaman selesai." : "Isinya? Kosong."}
            cue={frame < 298 ? 201 : 298}
            size={88}
          />
        ) : frame < 500 ? (
          <KineticText text="Baca. Ulang. Ulang." cue={368} size={88} />
        ) : (
          <KineticText text="Tetap lupa." cue={500} size={88} color={C.red} />
        )}
      </div>

      <Reveal cue={60} style={{ position: "absolute", left: 111, top: 320, width: 380, height: 460 }}>
        <PaperDocument frame={frame} />
      </Reveal>

      <Reveal cue={94} style={{ position: "absolute", left: 670, top: 359, width: 470, height: 380 }}>
        <Brain frame={frame} cue={94} weak />
      </Reveal>

      <svg
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <path
          d="M506 532 C570 532 587 532 665 532"
          fill="none"
          stroke={C.blue}
          strokeWidth="3"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - mix(frame, 94, 120)}
        />
        <path
          d="M1157 532 H1350"
          fill="none"
          stroke={C.red}
          strokeWidth="3"
          strokeDasharray="7 12"
          opacity={mix(frame, 124, 154) * 0.55}
        />
        {frame >= 94 && frame < 189 && (
          <circle
            cx={506 + mix(frame, 94, 150) * 650}
            cy="532"
            r="7"
            fill={C.blue}
            opacity={mix(frame, 158, 189, 1, 0)}
          />
        )}
        {frame >= 411 && (
          <g opacity={loop}>
            <path
              d="M1134 740 C1190 846 371 889 307 758"
              fill="none"
              stroke={C.ink}
              strokeWidth="3"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - loop}
            />
            <path d="M294 776 L307 754 L332 767" fill="none" stroke={C.ink} strokeWidth="3" />
          </g>
        )}
      </svg>

      <Reveal cue={136} style={{ position: "absolute", left: 1390, top: 397, width: 400 }}>
        <Tag color={C.paper} style={{ border: `1px solid ${C.line}` }}>
          Kekuatan ingatan
        </Tag>
        <div style={{ marginTop: 28, fontSize: 72, fontWeight: 850, letterSpacing: "-0.055em" }}>
          {frame >= 500 ? "Hilang." : "Lemah."}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              style={{
                width: 27,
                height: 55 + i * 5,
                background: i < 2 && frame < 500 ? C.red : C.line,
                opacity: mix(frame, 148 + i * 2, 158 + i * 2),
                transformOrigin: "bottom",
                transform: `scaleY(${pop(frame, 148 + i * 2, fps)})`,
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 19, color: C.muted, marginTop: 19, opacity: low }}>
          Informasi lewat. Jejak tidak kuat.
        </div>
      </Reveal>

      <Reveal cue={94} style={{ position: "absolute", left: 738, top: 737 }}>
        <Tag color={C.white}>Pemrosesan dangkal</Tag>
      </Reveal>

      {frame >= 264 && frame < 368 && (
        <Reveal cue={264} style={{ position: "absolute", left: 142, top: 784 }}>
          <Tag color={frame >= 298 ? C.red : C.yellow} style={{ color: frame >= 298 ? C.white : C.ink }}>
            {frame >= 298 ? "Tidak tahu isinya" : "Halaman dibaca"}
          </Tag>
        </Reveal>
      )}

      {frame >= 411 && (
        <Reveal cue={411} style={{ position: "absolute", left: 695, top: 833 }}>
          <Tag color={frame >= 500 ? C.red : C.yellow}>
            {frame >= 500 ? "Diulang ≠ tersimpan" : `Baca ulang / ${String(readCount).padStart(2, "0")}`}
          </Tag>
        </Reveal>
      )}

      {frame >= 500 && (
        <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <path
            d="M1365 411 C1451 346 1763 357 1795 457 C1830 568 1439 584 1374 489
               C1344 447 1364 402 1403 392"
            fill="none"
            stroke={C.red}
            strokeWidth="6"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - mix(frame, 500, 535)}
          />
        </svg>
      )}
    </div>
  );
};

const BridgePanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = mix(frame, 830, 843, 1, 0);
  const badges = [
    { cue: 655, text: "INGATAN", x: 290, y: 451, color: C.blue, n: "01" },
    { cue: 689, text: "PENGLIHATAN", x: 1300, y: 451, color: C.teal, n: "02" },
    { cue: 765, text: "WAKTU", x: 803, y: 761, color: C.red, n: "03" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, opacity: exit }}>
      <div style={{ position: "absolute", left: 100, top: 155 }}>
        <KineticText
          text={frame < 614 ? "Otak memang ngeselin." : frame < 765 ? "Tapi, belum selesai." : "Waktu juga bisa ditipu."}
          cue={frame < 614 ? 558 : frame < 765 ? 614 : 765}
          size={82}
        />
      </div>
      <Reveal cue={558} style={{ position: "absolute", left: 620, top: 330, width: 680, height: 445 }}>
        <svg viewBox="0 0 680 445" style={{ width: "100%", height: "100%", position: "absolute" }}>
          <circle cx="340" cy="216" r="208" fill="none" stroke={C.line} strokeWidth="1" />
          <circle cx="340" cy="216" r="190" fill="none" stroke={C.line} strokeDasharray="2 13" />
          <g transform={`rotate(${(frame - 558) * 0.18} 340 216)`}>
            <path d="M340 8 A208 208 0 0 1 539 156" fill="none" stroke={C.yellow} strokeWidth="8" />
          </g>
          <line x1="340" y1="0" x2="340" y2="24" stroke={C.ink} />
          <line x1="120" y1="216" x2="145" y2="216" stroke={C.ink} />
          <line x1="535" y1="216" x2="560" y2="216" stroke={C.ink} />
        </svg>
        <div style={{ position: "absolute", left: 101, top: 24, width: 480, height: 390 }}>
          <Brain frame={frame} cue={558} color={frame >= 765 ? C.red : C.blue} />
        </div>
      </Reveal>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        {badges.map((b, i) => (
          <path
            key={b.text}
            d={i === 0 ? "M582 504 H690" : i === 1 ? "M1227 504 H1300" : "M960 710 V759"}
            fill="none"
            stroke={b.color}
            strokeWidth="2"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - mix(frame, b.cue, b.cue + 20)}
          />
        ))}
      </svg>
      {badges.map((b) => (
        <Reveal key={b.text} cue={b.cue} style={{ position: "absolute", left: b.x, top: b.y, width: 292 }}>
          <div style={{ background: C.white, border: `1px solid ${C.line}`, padding: 24, boxShadow: "7px 7px 0 rgba(24,24,27,0.05)" }}>
            <div style={{ fontSize: 14, letterSpacing: "0.15em", color: b.color, fontWeight: 800 }}>
              {b.n} / PERSEPSI
            </div>
            <div style={{ marginTop: 14, fontSize: 29, fontWeight: 850 }}>{b.text}</div>
            <div style={{ height: 4, marginTop: 16, background: b.color, transformOrigin: "left", transform: `scaleX(${Math.min(1, pop(frame, b.cue, fps))})` }} />
          </div>
        </Reveal>
      ))}
      {frame >= 723 && frame < 765 && (
        <Reveal cue={723} style={{ position: "absolute", left: 746, top: 812 }}>
          <Tag color={C.red} style={{ color: C.white }}>Bisa membuat kita salah</Tag>
        </Reveal>
      )}
    </div>
  );
};

const ActivityIcon: React.FC<{ type: number; color: string }> = ({ type, color }) => (
  <svg viewBox="0 0 100 80" style={{ width: 100, height: 80 }}>
    {type === 0 && (
      <g fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 25 H72 Q80 25 84 40 L91 61 Q93 73 81 69 L65 57 H35 L19 69 Q7 74 9 61 L16 40 Q20 25 28 25Z" />
        <path d="M30 36 V52 M22 44 H38" />
        <circle cx="69" cy="39" r="3" fill={color} />
        <circle cx="77" cy="49" r="3" fill={color} />
      </g>
    )}
    {type === 1 && (
      <g fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round">
        <rect x="12" y="15" width="76" height="53" rx="5" />
        <path d="M43 29 L63 41 L43 54Z" fill={color} stroke="none" />
        <path d="M24 15 V68 M77 15 V68" strokeDasharray="5 8" />
      </g>
    )}
    {type === 2 && (
      <g fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round">
        <path d="M13 13 H69 V47 H36 L23 59 V47 H13Z" />
        <path d="M75 30 H89 V66 H79 V75 L65 66 H45 V55" />
        <path d="M25 26 H56 M25 36 H47" />
      </g>
    )}
    {type === 3 && (
      <g fill="none" stroke={color} strokeWidth="4" strokeLinecap="round">
        <rect x="29" y="6" width="43" height="68" rx="7" />
        <path d="M43 14 H58 M46 65 H55 M50 48 V28 M43 35 L50 28 L57 35" />
        <path d="M38 55 H63" stroke={C.line} />
      </g>
    )}
  </svg>
);

const AnalogClock: React.FC<{
  frame: number;
  cue: number;
  waiting?: boolean;
}> = ({ frame, cue, waiting = false }) => {
  const elapsed = mix(frame, cue, waiting ? 1519 : 1202);
  const minuteAngle = waiting ? elapsed * 30 : elapsed * 360;
  const hourAngle = waiting ? 0 : -30 + elapsed * 30;
  return (
    <svg viewBox="0 0 300 300" style={{ width: "100%", height: "100%" }}>
      <circle cx="155" cy="155" r="135" fill={C.ink} opacity=".07" />
      <circle cx="150" cy="150" r="135" fill={C.white} stroke={C.ink} strokeWidth="3" />
      <circle cx="150" cy="150" r="118" fill="none" stroke={C.line} />
      {Array.from({ length: 60 }, (_, i) => (
        <line
          key={i}
          x1="150"
          y1={i % 5 === 0 ? 29 : 34}
          x2="150"
          y2={i % 5 === 0 ? 43 : 40}
          stroke={i % 5 === 0 ? C.ink : C.line}
          strokeWidth={i % 5 === 0 ? 3 : 1}
          transform={`rotate(${i * 6} 150 150)`}
        />
      ))}
      <g fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700" textAnchor="middle" fill={C.ink}>
        <text x="150" y="69">12</text>
        <text x="240" y="157">3</text>
        <text x="150" y="245">6</text>
        <text x="59" y="157">9</text>
      </g>
      <line x1="150" y1="150" x2="150" y2="91" stroke={C.ink} strokeWidth="8" strokeLinecap="round" transform={`rotate(${hourAngle} 150 150)`} />
      <line x1="150" y1="150" x2="150" y2="53" stroke={waiting ? C.teal : C.red} strokeWidth="5" strokeLinecap="round" transform={`rotate(${minuteAngle} 150 150)`} />
      <circle cx="150" cy="150" r="8" fill={C.ink} />
    </svg>
  );
};

const TimePanel: React.FC = () => {
  const frame = useCurrentFrame();
  const activities = [
    { cue: 952, name: "MAIN GAME", color: C.blue },
    { cue: 1001, name: "NONTON FILM", color: C.red },
    { cue: 1038, name: "NGOBROL", color: C.teal },
    { cue: 1074, name: "SCROLL HP", color: C.ink },
  ];
  const compression = mix(frame, 886, 926);
  const clockMode = frame >= 1125;
  const exit = mix(frame, 1295, 1302, 1, 0);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: exit }}>
      <div style={{ position: "absolute", left: 100, top: 155 }}>
        <KineticText
          text={frame < 1125 ? "Satu jam. Terasa sebentar." : frame < 1243 ? "Ke mana waktunya?" : "Rasanya baru sebentar."}
          cue={frame < 1125 ? 843 : frame < 1243 ? 1125 : 1243}
          size={80}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 110,
          top: 345,
          width: 1700,
          height: 357,
          opacity: clockMode ? mix(frame, 1125, 1157, 1, 0.13) : 1,
        }}
      >
        <Reveal cue={843}>
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <div style={{ width: 255 }}>
              <div style={{ fontSize: 16, letterSpacing: "0.14em", color: C.muted, fontWeight: 700 }}>
                WAKTU BERLALU
              </div>
              <div style={{ fontSize: 68, fontWeight: 850, letterSpacing: "-0.05em", marginTop: 13 }}>
                1 jam
              </div>
            </div>
            <svg viewBox="0 0 1320 108" style={{ width: 1320, height: 108 }}>
              <rect x="0" y="19" width={1280 * mix(frame, 843, 878)} height="59" fill={C.ink} />
              {Array.from({ length: 13 }, (_, i) => (
                <g key={i} opacity={mix(frame, 843 + i * 2, 853 + i * 2)}>
                  <line x1={i * 106} y1="83" x2={i * 106} y2="94" stroke={C.muted} />
                  <line x1={i * 106} y1="23" x2={i * 106} y2="73" stroke={C.paper} opacity=".4" />
                </g>
              ))}
            </svg>
          </div>
        </Reveal>

        <Reveal cue={886} style={{ marginTop: 66 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <div style={{ width: 255 }}>
              <div style={{ fontSize: 16, letterSpacing: "0.14em", color: C.muted, fontWeight: 700 }}>
                TERASA SEPERTI
              </div>
              <div style={{ fontSize: 68, fontWeight: 850, letterSpacing: "-0.05em", marginTop: 13 }}>
                10 menit
              </div>
            </div>
            <svg viewBox="0 0 1320 108" style={{ width: 1320, height: 108 }}>
              <rect x="0" y="19" width={1280 - compression * (1280 - 213)} height="59" fill={C.yellow} />
              <path d="M0 92 H1280" stroke={C.line} />
              <path
                d={`M${1280 - compression * (1280 - 213)} 12 V90`}
                stroke={C.red}
                strokeWidth="3"
              />
              <text x={244 + (1 - compression) * 800} y="59" fontSize="16" fill={C.muted} fontFamily="Arial, sans-serif" opacity={compression}>
                persepsi waktu menyusut
              </text>
            </svg>
          </div>
        </Reveal>
      </div>

      {frame >= 934 && (
        <Reveal cue={934} style={{ position: "absolute", left: 110, top: 746, opacity: clockMode ? mix(frame, 1125, 1157, 1, 0.18) : undefined }}>
          <Tag color={C.paper} style={{ paddingLeft: 0 }}>Saat perhatian terserap</Tag>
        </Reveal>
      )}
      <div style={{ position: "absolute", left: 110, top: 792, display: "flex", gap: 22, opacity: clockMode ? mix(frame, 1125, 1157, 1, 0.18) : 1 }}>
        {activities.map((a, i) => (
          <Reveal key={a.name} cue={a.cue}>
            <div style={{ width: 392, height: 121, boxSizing: "border-box", border: `1px solid ${C.line}`, background: C.white, padding: "17px 22px", display: "flex", alignItems: "center", gap: 14 }}>
              <ActivityIcon type={i} color={a.color} />
              <div>
                <div style={{ color: a.color, fontSize: 13, letterSpacing: "0.13em", fontWeight: 800 }}>
                  0{i + 1}
                </div>
                <div style={{ fontWeight: 800, fontSize: 19, marginTop: 8 }}>
                  {a.name}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {frame >= 1125 && (
        <Reveal cue={1125} style={{ position: "absolute", left: 430, top: 314, width: 1060, height: 434 }}>
          <div style={{ position: "absolute", inset: 0, background: C.paper, boxShadow: "0 15px 70px rgba(24,24,27,0.08)", border: `1px solid ${C.line}` }} />
          <Reveal cue={1157} style={{ position: "absolute", left: 37, top: 45, width: 335, height: 335 }}>
            <AnalogClock frame={frame} cue={1157} />
          </Reveal>
          <div style={{ position: "absolute", left: 420, top: 58 }}>
            <Reveal cue={1157}><Tag>Lihat jam.</Tag></Reveal>
            {frame >= 1186 && (
              <KineticText text="Hah?" cue={1186} size={43} color={C.red} style={{ marginTop: 20 }} />
            )}
            {frame >= 1202 && (
              <KineticText text="12:00" cue={1202} size={145} style={{ fontVariantNumeric: "tabular-nums", marginTop: 2 }} />
            )}
            {frame >= 1243 && (
              <KineticText text="Padahal baru sebentar…" cue={1243} end={1295} size={28} weight={600} style={{ marginTop: 8, letterSpacing: "-0.025em" }} />
            )}
          </div>
          <svg viewBox="0 0 1060 434" style={{ position: "absolute", inset: 0 }}>
            <path
              d="M409 211 C443 158 922 147 961 251 C1001 356 493 368 427 298"
              fill="none"
              stroke={C.red}
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - mix(frame, 1202, 1232)}
            />
          </svg>
        </Reveal>
      )}
    </div>
  );
};

const WaitingPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seated = pop(frame, 1382, fps);
  const person = mix(frame, 1382, 1393);
  const watch = mix(frame, 1491, 1506);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 100, top: 155 }}>
        <KineticText
          text={frame < 1329 ? "Tapi…" : "Coba yang sebaliknya."}
          cue={frame < 1329 ? 1302 : 1329}
          size={84}
        />
      </div>

      <Reveal cue={1329} style={{ position: "absolute", left: 107, top: 315 }}>
        <Tag color={C.ink}>Eksperimen kecil / menunggu</Tag>
      </Reveal>

      <svg
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <g opacity={mix(frame, 1329, 1364)}>
          <path d="M161 808 H1759" stroke={C.line} strokeWidth="2" />
          <path d="M246 386 V808 M1667 386 V808" stroke={C.line} />
          <path d="M246 386 H1667" stroke={C.line} strokeDasharray="3 10" />
          <path d="M1240 808 V423 H1460 V808" fill={C.white} stroke={C.line} strokeWidth="2" />
          <circle cx="1425" cy="624" r="5" fill={C.line} />
          <text x="1350" y="452" textAnchor="middle" fill={C.muted} fontSize="12" letterSpacing="3" fontFamily="Arial, sans-serif">
            RUANG TUNGGU
          </text>
        </g>

        <g opacity={mix(frame, 1382, 1392)}>
          <rect x="357" y="620" width="529" height="17" rx="3" fill={C.ink} />
          <path d="M378 637 V808 M861 637 V808" stroke={C.ink} strokeWidth="10" />
          <path d="M374 554 H870 M374 583 H870" stroke={C.ink} strokeWidth="13" />
          <path d="M385 548 V620 M857 548 V620" stroke={C.ink} strokeWidth="6" />
        </g>

        <g opacity={person} transform={`translate(0 ${(1 - seated) * -32})`}>
          <ellipse cx="625" cy="800" rx="89" ry="10" fill={C.ink} opacity=".06" />
          <circle cx="594" cy="449" r="33" fill={C.paper} stroke={C.ink} strokeWidth="4" />
          <path d="M568 431 Q590 406 621 433" fill={C.ink} />
          <path d="M579 481 Q561 520 566 608 H648 L637 515 Q624 481 609 479Z" fill={C.blue} stroke={C.ink} strokeWidth="3" />
          <path d="M576 507 L552 567 L618 586" fill="none" stroke={C.ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M630 509 L650 556 L632 592" fill="none" stroke={C.ink} strokeWidth="12" strokeLinecap="round" />
          <path d="M578 611 H678 V694 L687 779 M632 618 L625 705 L618 778" fill="none" stroke={C.ink} strokeWidth="19" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M605 786 H639 M676 786 H705" stroke={C.ink} strokeWidth="10" strokeLinecap="round" />
          <path d="M580 455 H587 M603 455 H610" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
          <path d="M590 468 H602" stroke={C.ink} strokeWidth="2" />
          <g opacity={watch}>
            <rect x="594" y="576" width="14" height="16" rx="3" fill={C.yellow} stroke={C.ink} strokeWidth="2" />
            <path d="M616 570 Q686 529 759 523" fill="none" stroke={C.teal} strokeDasharray="4 8" strokeWidth="2" />
          </g>
        </g>

        {frame >= 1404 && (
          <g opacity={mix(frame, 1404, 1425)}>
            <path d="M951 629 Q947 537 964 489 M949 631 L938 774 M949 631 L982 774" fill="none" stroke={C.line} strokeWidth="8" strokeDasharray="9 12" />
            <circle cx="965" cy="457" r="29" fill="none" stroke={C.line} strokeWidth="3" strokeDasharray="6 9" />
            <path d="M943 499 L923 576 M975 499 L994 573" stroke={C.line} strokeWidth="6" strokeDasharray="8 11" />
            <text x="963" y="835" fill={C.muted} fontSize="15" textAnchor="middle" fontFamily="Arial, sans-serif">
              belum datang
            </text>
          </g>
        )}
      </svg>

      {frame >= 1404 && frame < 1491 && (
        <Reveal cue={1404} style={{ position: "absolute", left: 1000, top: 316 }}>
          <KineticText text="Menunggu seseorang." cue={1404} end={1425} size={32} />
        </Reveal>
      )}

      {frame >= 1441 && frame < 1491 && (
        <Reveal cue={1441} style={{ position: "absolute", left: 1050, top: 526 }}>
          <div style={{ padding: "23px 28px", background: C.paper, border: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 13, color: C.muted, letterSpacing: "0.15em", fontWeight: 800 }}>
              AKTIVITAS
            </div>
            <KineticText text="Tidak melakukan apa-apa." cue={1441} end={1470} size={31} style={{ width: 370, marginTop: 16 }} />
            <div style={{ marginTop: 25, height: 3, width: 360, background: C.line }}>
              <div style={{ width: 5, height: 3, background: C.ink }} />
            </div>
          </div>
        </Reveal>
      )}

      {frame >= 1491 && (
        <Reveal cue={1491} style={{ position: "absolute", left: 1055, top: 419, width: 530, height: 324 }}>
          <div style={{ position: "absolute", inset: 0, background: C.white, border: `1px solid ${C.line}`, boxShadow: "9px 9px 0 rgba(24,24,27,0.05)" }} />
          <div style={{ position: "absolute", left: 18, top: 51, width: 205, height: 205 }}>
            <AnalogClock frame={frame} cue={1491} waiting />
          </div>
          <div style={{ position: "absolute", left: 247, top: 60 }}>
            <Tag color={C.paper} style={{ padding: 0, color: C.muted, fontSize: 13 }}>Lihat jam</Tag>
            {frame >= 1519 && (
              <>
                <KineticText text="5" cue={1519} size={121} color={C.teal} style={{ marginTop: 11 }} />
                <KineticText text="menit." cue={1523} size={36} style={{ marginTop: -6 }} />
              </>
            )}
          </div>
        </Reveal>
      )}

      <div style={{ position: "absolute", left: 110, top: 875 }}>
        {frame >= 1382 && frame < 1441 && (
          <KineticText text="Duduk. Menunggu." cue={1382} size={34} weight={600} />
        )}
        {frame >= 1441 && frame < 1519 && (
          <KineticText text="Perhatian tidak punya tempat lain untuk pergi." cue={1441} end={1470} size={27} weight={500} color={C.muted} />
        )}
        {frame >= 1519 && (
          <KineticText text="Baru lima menit." cue={1519} end={1534} size={40} color={C.teal} />
        )}
      </div>
    </div>
  );
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 190) * 28;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.paper }}>
      <div
        style={{
          position: "absolute",
          left: 1130 + drift,
          top: 120 + Math.cos(frame / 230) * 24,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.yellow}12 0%, ${C.yellow}05 40%, transparent 70%)`,
        }}
      />
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {Array.from({ length: 28 }, (_, row) =>
          Array.from({ length: 49 }, (_, col) => (
            <circle key={`${row}-${col}`} cx={col * 40 + 10} cy={row * 40 + 8} r=".75" fill={C.ink} opacity=".065" />
          )),
        )}
        <path d="M70 130 H1850 M70 953 H1850" stroke={C.line} />
        <path d="M70 70 H87 M70 70 V87 M1850 70 H1833 M1850 70 V87" stroke={C.ink} strokeWidth="2" />
      </svg>
    </div>
  );
};

const EditorialOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const activeIndex = BEATS.findIndex((beat, i) => {
    const next = BEATS[i + 1]?.[0] ?? 1549;
    return frame >= beat[0] && frame < next;
  });
  const active = activeIndex >= 0 ? BEATS[activeIndex] : undefined;
  const chapter = frame < 655 ? "INGATAN" : frame < 765 ? "PERSEPSI" : "WAKTU";
  const progress = mix(frame, 0, 1548);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 103, top: 76, display: "flex", gap: 17, alignItems: "center" }}>
        <div style={{ background: C.ink, color: C.yellow, padding: "5px 10px", fontSize: 20, fontWeight: 900, letterSpacing: "-0.055em" }}>
          vox
        </div>
        <div style={{ fontSize: 14, fontWeight: 750, letterSpacing: "0.18em" }}>
          OTAK & REALITAS
        </div>
      </div>
      <div style={{ position: "absolute", right: 104, top: 84, display: "flex", gap: 23, fontSize: 14, fontWeight: 750, letterSpacing: "0.14em" }}>
        <span style={{ color: C.muted }}>06 / 11</span>
        <span>{chapter}</span>
      </div>

      {active && (
        <div style={{ position: "absolute", left: 140, right: 140, top: 981, textAlign: "center" }}>
          <KineticText
            key={active[0]}
            text={active[2]}
            cue={active[0]}
            end={active[1]}
            size={32}
            weight={550}
            style={{ lineHeight: 1.25, letterSpacing: "-0.02em" }}
          />
        </div>
      )}

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: C.line }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: C.ink }} />
      </div>
    </div>
  );
};

export const Scene_06: React.FC = () => {
  const { width, height } = useVideoConfig();
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
        <Sequence from={0} durationInFrames={1549}>
          <Background />
        </Sequence>

        <Sequence from={27} durationInFrames={531}>
          <MemoryPanel />
        </Sequence>

        <Sequence from={558} durationInFrames={285}>
          <BridgePanel />
        </Sequence>

        <Sequence from={843} durationInFrames={459}>
          <TimePanel />
        </Sequence>

        <Sequence from={1302} durationInFrames={247}>
          <WaitingPanel />
        </Sequence>

        <Sequence from={0} durationInFrames={1549}>
          <EditorialOverlay />
        </Sequence>
      </div>
    </div>
  );
};