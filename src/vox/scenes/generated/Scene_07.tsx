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
  [6, 14, "Lihat lagi."],
  [34, 51, "Baru 2 menit."],
  [72, 81, "Lihat lagi."],
  [81, 126, "Masih 1 menit,"],
  [138, 167, "rasanya waktu berhenti."],
  [183, 201, "Padahal,"],
  [214, 253, "jamnya tetap berjalan"],
  [253, 294, "dengan kecepatan yang sama."],
  [312, 317, "Jadi,"],
  [337, 370, "yang berubah bukan waktunya."],
  [390, 436, "Pengalaman otak kita"],
  [436, 475, "terhadap waktu yang berubah."],
  [490, 513, "Ketika kita sibuk"],
  [513, 569, "dan tidak terlalu memperhatikan waktu,"],
  [591, 613, "waktu terasa cepat."],
  [628, 696, "Ketika kita menunggu dan terus memperhatikan waktu,"],
  [720, 744, "waktu terasa lambat."],
  [756, 800, "Dan ini membawa kita"],
  [800, 856, "ke sesuatu yang mungkin paling menarik."],
  [876, 883, "Kadang,"],
  [900, 947, "kita bahkan bisa melihat sesuatu"],
  [947, 1017, "tanpa benar-benar menyadarinya."],
  [1024, 1038, "Bayangkan,"],
  [1053, 1101, "kamu sedang berjalan di tempat ramai."],
  [1115, 1134, "Ada banyak orang."],
  [1155, 1185, "Banyak kendaraan."],
  [1194, 1207, "Banyak suara."],
  [1227, 1248, "Banyak benda bergerak."],
  [1260, 1275, "Kalau otak"],
  [1278, 1332, "harus memperhatikan semuanya."],
  [1346, 1380, "Kita bakal kewalahan."],
  [1390, 1425, "Jadi otak memilih."],
  [1434, 1444, "Ini penting."],
  [1460, 1483, "Ini tidak penting."],
  [1497, 1525, "Ini perlu diperhatikan."],
  [1542, 1548, "Ini bisa diabaikan."],
] as const;

const smooth = (frame: number, start: number, length = 24) =>
  interpolate(frame, [start, start + Math.max(0.001, length)], [0, 1], CLAMP);

const physical = (frame: number, fps: number, start: number) =>
  spring({
    frame: Math.max(0, frame - start),
    fps,
    config: { damping: 16, mass: 0.7, stiffness: 85 },
  });

/**
 * Scene-local sequence gate. It deliberately preserves the parent frame:
 * every animation below is addressed against the supplied narration cues.
 * No additional Remotion imports or external assets are required.
 */
const Sequence: React.FC<{
  from: number;
  durationInFrames: number;
  frame: number;
  children: React.ReactNode;
}> = ({ from, durationInFrames, frame, children }) => {
  if (frame < from || frame >= from + durationInFrames) return null;
  return <>{children}</>;
};

const Kinetic: React.FC<{
  text: string;
  frame: number;
  fps: number;
  cue: number;
  reveal?: number;
  size?: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  frame,
  fps,
  cue,
  reveal = 24,
  size = 54,
  color = INK,
  weight = 800,
  style,
}) => {
  const words = text.split(" ");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.24em",
        fontSize: size,
        color,
        fontWeight: weight,
        lineHeight: 1.13,
        letterSpacing: "-0.035em",
        ...style,
      }}
    >
      {words.map((word, index) => {
        const delay = cue + (index * reveal) / Math.max(1, words.length);
        const p = physical(frame, fps, delay);
        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: "inline-block",
              opacity: smooth(frame, delay, Math.min(7, reveal / words.length + 2)),
              transform: `translateY(${(1 - p) * 15}px)`,
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
  frame: number;
  fps: number;
  cue: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ frame, fps, cue, children, style }) => {
  if (frame < cue) return null;
  const p = physical(frame, fps, cue);
  return (
    <div
      style={{
        opacity: smooth(frame, cue, 12),
        transform: `translateY(${(1 - p) * 22}px)`,
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
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ children, color = YELLOW, dark = false, style }) => (
  <div
    style={{
      display: "inline-block",
      background: color,
      color: dark ? PAPER : INK,
      padding: "11px 17px",
      fontSize: 17,
      letterSpacing: "0.09em",
      fontWeight: 800,
      lineHeight: 1,
      ...style,
    }}
  >
    {children}
  </div>
);

const Brain: React.FC<{
  frame: number;
  activeFrom: number;
  color?: string;
  activity?: number;
}> = ({ frame, activeFrom, color = BLUE, activity = 1 }) => {
  const active = frame >= activeFrom;
  const paths = [
    "M110 156 C125 107 172 94 207 120 S262 173 294 131",
    "M99 211 C150 166 166 217 214 196 S285 181 313 213",
    "M116 258 C153 227 185 266 211 241 S268 259 303 237",
    "M169 89 C148 151 199 154 183 208 S164 279 213 306",
    "M233 88 C211 128 252 150 238 198 S227 260 264 283",
  ];
  const nodes = [
    [121, 156],
    [181, 128],
    [234, 149],
    [285, 142],
    [150, 191],
    [209, 197],
    [280, 197],
    [182, 240],
    [248, 250],
    [213, 289],
  ];
  return (
    <g>
      <path
        d="M207 65 C168 45 132 66 119 92 C76 95 58 127 66 160
        C34 187 47 224 69 237 C61 273 93 303 126 301
        C147 336 183 344 210 319 C236 344 276 322 286 303
        C331 303 352 273 344 245 C376 220 366 181 343 164
        C351 125 323 96 291 94 C273 62 240 48 207 65Z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M208 67 C194 107 216 135 204 171 C188 210 219 239 208 320"
        fill="none"
        stroke={INK}
        strokeWidth="3"
      />
      <path
        d="M205 320 L213 353 Q236 365 245 341 L241 320"
        fill={PAPER}
        stroke={INK}
        strokeWidth="4"
      />
      {paths.map((d, i) => (
        <g key={d}>
          <path d={d} fill="none" stroke="#D6D3CA" strokeWidth="3" />
          <path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray="18 130"
            strokeDashoffset={-(frame - activeFrom) * (0.7 + i * 0.11) * activity}
            opacity={active ? 0.8 : 0}
          />
        </g>
      ))}
      {nodes.map(([x, y], i) => {
        const pulse = active
          ? (Math.sin((frame - activeFrom) * 0.085 * activity - i * 1.3) + 1) / 2
          : 0;
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={5 + pulse * 9}
              fill={color}
              opacity={active ? pulse * 0.15 : 0}
            />
            <circle
              cx={x}
              cy={y}
              r={active ? 3 + pulse * 2 : 3}
              fill={active ? color : "#B6B2A8"}
            />
          </g>
        );
      })}
    </g>
  );
};

const Clock: React.FC<{
  frame: number;
  fps: number;
  radius?: number;
  color?: string;
}> = ({ frame, fps, radius = 180, color = INK }) => {
  const angle = (frame / fps) * 6;
  return (
    <g>
      <circle r={radius + 12} fill="#E9E5DA" />
      <circle r={radius} fill="#FFFDF7" stroke={color} strokeWidth="5" />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * Math.PI) / 30;
        const major = i % 5 === 0;
        return (
          <line
            key={i}
            x1={Math.sin(a) * (radius - (major ? 23 : 13))}
            y1={-Math.cos(a) * (radius - (major ? 23 : 13))}
            x2={Math.sin(a) * (radius - 6)}
            y2={-Math.cos(a) * (radius - 6)}
            stroke={color}
            strokeWidth={major ? 4 : 1.5}
            opacity={major ? 1 : 0.4}
          />
        );
      })}
      <line
        x1="0"
        y1="0"
        x2={radius * 0.4}
        y2={radius * 0.22}
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <line
        x1="0"
        y1="0"
        x2={radius * 0.06}
        y2={-radius * 0.65}
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <g transform={`rotate(${angle})`}>
        <line
          x1="0"
          y1={radius * 0.18}
          x2="0"
          y2={-radius * 0.8}
          stroke={RED}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <circle r="7" fill={RED} />
    </g>
  );
};

const Marker: React.FC<{
  frame: number;
  cue: number;
  d: string;
  length?: number;
}> = ({ frame, cue, d, length = 650 }) => (
  <path
    d={d}
    fill="none"
    stroke={RED}
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeDasharray={length}
    strokeDashoffset={length * (1 - smooth(frame, cue, 27))}
    opacity={frame >= cue ? 0.92 : 0}
  />
);

const Person: React.FC<{
  x: number;
  y: number;
  color: string;
  scale?: number;
}> = ({ x, y, color, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx="0" cy="77" rx="21" ry="6" fill={INK} opacity="0.08" />
    <circle cy="-5" r="12" fill={color} />
    <path
      d="M-16 18 Q0 8 16 18 L20 46 L10 48 L8 73 L0 73
      L-3 49 L-9 73 L-18 73 L-13 43 L-22 42Z"
      fill={color}
    />
  </g>
);

const Car: React.FC<{ x: number; y: number; color: string }> = ({
  x,
  y,
  color,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <path
      d="M0 25 L20 25 L38 2 L90 2 L112 25 L135 29 L138 53 L0 53Z"
      fill={color}
      stroke={INK}
      strokeWidth="2"
    />
    <path d="M43 8 L62 8 L62 25 L29 25Z M69 8 L87 8 L104 25 L69 25Z" fill={PAPER} />
    <circle cx="29" cy="54" r="12" fill={INK} />
    <circle cx="108" cy="54" r="12" fill={INK} />
    <circle cx="29" cy="54" r="5" fill={PAPER} />
    <circle cx="108" cy="54" r="5" fill={PAPER} />
  </g>
);

const SceneHeader: React.FC<{
  frame: number;
  fps: number;
  cue: number;
  title: string;
  label: string;
}> = ({ frame, fps, cue, title, label }) => (
  <div style={{ position: "absolute", left: 110, right: 110, top: 143 }}>
    <Reveal frame={frame} fps={fps} cue={cue}>
      <div
        style={{
          fontSize: 16,
          letterSpacing: "0.17em",
          color: MUTED,
          fontWeight: 700,
          marginBottom: 14,
        }}
      >
        {label}
      </div>
    </Reveal>
    <Kinetic
      text={title}
      frame={frame}
      fps={fps}
      cue={cue}
      size={61}
      reveal={30}
    />
  </div>
);

const ClockChapter: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const checking = frame < 183;
  const pingCue = frame < 72 ? 6 : 72;
  const ping = smooth(frame, pingCue, 35);
  return (
    <>
      <SceneHeader
        frame={frame}
        fps={fps}
        cue={6}
        title="Lihat lagi."
        label="01 / WAKTU YANG KITA RASAKAN"
      />
      <svg
        viewBox="0 0 1700 580"
        style={{ position: "absolute", left: 110, top: 284, width: 1700, height: 580 }}
      >
        <path
          d="M95 495 H1600"
          stroke={INK}
          strokeWidth="1"
          opacity="0.15"
        />
        <g transform="translate(375 260)">
          <Clock frame={frame} fps={fps} radius={189} />
          {frame >= pingCue && frame < pingCue + 35 && (
            <circle
              r={200 + ping * 28}
              fill="none"
              stroke={YELLOW}
              strokeWidth="12"
              opacity={1 - ping}
            />
          )}
        </g>
        <path
          d="M610 260 H766"
          stroke={INK}
          strokeWidth="2"
          strokeDasharray="5 8"
          opacity="0.25"
        />
        <text
          x="375"
          y="533"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          letterSpacing="3"
          fill={MUTED}
        >
          {checking ? "CEK JAM. CEK LAGI." : "JARUM TIDAK BERHENTI"}
        </text>
        {frame >= 214 && (
          <g opacity={smooth(frame, 214, 20)}>
            <path d="M138 464 H610" stroke={BLUE} strokeWidth="3" />
            {Array.from({ length: 13 }, (_, i) => (
              <line
                key={i}
                x1={138 + i * 39.3}
                x2={138 + i * 39.3}
                y1="454"
                y2="474"
                stroke={BLUE}
                strokeWidth="2"
              />
            ))}
            <circle
              cx={138 + ((frame - 214) % 120) * (472 / 120)}
              cy="464"
              r="6"
              fill={BLUE}
            />
          </g>
        )}
        <Marker
          frame={frame}
          cue={138}
          d="M858 268 C871 233 1410 211 1487 256 C1550 302 1494 365 1144 366 C895 369 812 328 858 268"
          length={1500}
        />
      </svg>

      <div style={{ position: "absolute", left: 950, top: 345, width: 670 }}>
        {frame < 183 ? (
          <>
            <Reveal frame={frame} fps={fps} cue={34}>
              <Tag>WAKTU TERSISA</Tag>
            </Reveal>
            {frame >= 34 && (
              <Kinetic
                key={frame < 81 ? "two" : "one"}
                text={frame < 81 ? "2 menit" : "1 menit"}
                cue={frame < 81 ? 34 : 81}
                reveal={16}
                frame={frame}
                fps={fps}
                size={112}
                style={{ marginTop: 24 }}
              />
            )}
            <Kinetic
              text="Rasanya berhenti."
              frame={frame}
              fps={fps}
              cue={138}
              size={46}
              reveal={23}
              color={RED}
              style={{ marginTop: 34 }}
            />
          </>
        ) : (
          <>
            <Reveal frame={frame} fps={fps} cue={183}>
              <Tag color={INK} dark>PADAHAL…</Tag>
            </Reveal>
            <Kinetic
              text="Jam tetap berjalan."
              frame={frame}
              fps={fps}
              cue={214}
              size={72}
              reveal={30}
              style={{ marginTop: 27, maxWidth: 650 }}
            />
            <Reveal frame={frame} fps={fps} cue={253} style={{ marginTop: 38 }}>
              <div
                style={{
                  borderLeft: `6px solid ${BLUE}`,
                  padding: "17px 24px",
                  background: "#E6EAF0",
                }}
              >
                <Kinetic
                  text="Kecepatan yang sama."
                  frame={frame}
                  fps={fps}
                  cue={253}
                  reveal={28}
                  size={32}
                  color={BLUE}
                />
              </div>
            </Reveal>
          </>
        )}
      </div>
    </>
  );
};

const PerceptionChapter: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => (
  <>
    <SceneHeader
      frame={frame}
      fps={fps}
      cue={312}
      title="Jadi, apa yang berubah?"
      label="02 / JAM ≠ PENGALAMAN"
    />
    <svg
      viewBox="0 0 1700 580"
      style={{ position: "absolute", left: 110, top: 280, width: 1700, height: 580 }}
    >
      <g opacity={smooth(frame, 337, 16)}>
        <rect x="40" y="42" width="610" height="485" rx="3" fill="#ECE8DE" />
        <g transform="translate(345 251)">
          <Clock frame={frame} fps={fps} radius={142} />
        </g>
        <text
          x="345"
          y="455"
          textAnchor="middle"
          fill={INK}
          fontSize="32"
          fontWeight="800"
        >
          BUKAN WAKTUNYA
        </text>
        <path
          d="M192 475 H498"
          stroke={YELLOW}
          strokeWidth="11"
          strokeDasharray="306"
          strokeDashoffset={306 * (1 - smooth(frame, 337, 33))}
        />
      </g>
      <g opacity={smooth(frame, 390, 20)}>
        <rect x="800" y="42" width="835" height="485" rx="3" fill="#E7EBED" />
        <g transform="translate(1015 60) scale(1.02)">
          <Brain frame={frame} activeFrom={390} />
        </g>
      </g>
      <path
        d="M685 272 H762 M742 254 L762 272 L742 290"
        fill="none"
        stroke={INK}
        strokeWidth="3"
        opacity={smooth(frame, 390, 16)}
      />
      <Marker
        frame={frame}
        cue={436}
        d="M928 431 C991 402 1494 405 1532 453 C1552 507 1167 530 976 497 C909 482 906 452 928 431"
        length={1400}
      />
    </svg>
    <div style={{ position: "absolute", left: 1026, top: 710, width: 595 }}>
      <Kinetic
        text="Pengalaman otak."
        frame={frame}
        fps={fps}
        cue={390}
        reveal={35}
        size={38}
      />
      <Kinetic
        text="Itu yang berubah."
        frame={frame}
        fps={fps}
        cue={436}
        reveal={28}
        size={32}
        color={BLUE}
        style={{ marginTop: 11 }}
      />
    </div>
  </>
);

const ComparisonChapter: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const topP = physical(frame, fps, 490);
  const bottomP = physical(frame, fps, 628);
  const fast = smooth(frame, 591, 55);
  const slow = smooth(frame, 720, 29);
  return (
    <>
      <SceneHeader
        frame={frame}
        fps={fps}
        cue={490}
        title="Perhatian mengubah rasa waktu."
        label="03 / DUA PENGALAMAN"
      />
      <svg
        viewBox="0 0 1700 580"
        style={{ position: "absolute", left: 110, top: 282, width: 1700, height: 580 }}
      >
        <g
          opacity={smooth(frame, 490, 18)}
          transform={`translate(0 ${(1 - topP) * 20})`}
        >
          <rect x="40" y="30" width="1600" height="220" fill="#E5EBE4" />
          <rect x="40" y="30" width="8" height="220" fill={TEAL} />
          <g transform="translate(90 48) scale(.43)">
            <Brain frame={frame} activeFrom={490} color={TEAL} activity={1.5} />
          </g>
          <path d="M620 141 H1250" stroke="#B5C7BE" strokeWidth="3" />
          {frame >= 513 &&
            Array.from({ length: 7 }, (_, i) => {
              const x = 665 + i * 82;
              const t = (frame - 513) * 0.025 + i;
              return (
                <g
                  key={i}
                  opacity={smooth(frame, 513 + i * 5, 15)}
                  transform={`translate(${x} ${133 + Math.sin(t) * 9})`}
                >
                  <rect x="-18" y="-18" width="36" height="36" fill={TEAL} />
                  <path d="M-8 0 L-1 7 L10 -7" fill="none" stroke={PAPER} strokeWidth="3" />
                </g>
              );
            })}
          <path
            d="M650 201 H1210 M1197 190 L1210 201 L1197 212"
            fill="none"
            stroke={TEAL}
            strokeWidth="4"
            strokeDasharray="620"
            strokeDashoffset={620 * (1 - fast)}
          />
        </g>
        {frame >= 628 && (
          <g
            opacity={smooth(frame, 628, 18)}
            transform={`translate(0 ${(1 - bottomP) * 20})`}
          >
            <rect x="40" y="284" width="1600" height="220" fill="#EEE4DF" />
            <rect x="40" y="284" width="8" height="220" fill={RED} />
            <g transform="translate(175 386)">
              <Clock frame={frame} fps={fps} radius={67} />
            </g>
            <path d="M620 393 H1250" stroke="#D7BAB0" strokeWidth="3" />
            {Array.from({ length: 16 }, (_, i) => (
              <line
                key={i}
                x1={650 + i * 35}
                x2={650 + i * 35}
                y1="382"
                y2="404"
                stroke={RED}
                strokeWidth="2"
                opacity={smooth(frame, 628 + i * 3, 15)}
              />
            ))}
            <circle
              cx={660 + ((frame - 628) % 120) * 0.65}
              cy="393"
              r="9"
              fill={RED}
            />
            <path
              d="M650 452 H785 M772 441 L785 452 L772 463"
              fill="none"
              stroke={RED}
              strokeWidth="4"
              strokeDasharray="175"
              strokeDashoffset={175 * (1 - slow)}
            />
          </g>
        )}
        <text x="45" y="556" fontSize="17" fill={MUTED} letterSpacing="2">
          ILUSTRASI PENGALAMAN SUBJEKTIF — BUKAN PERUBAHAN LAJU JAM
        </text>
      </svg>
      <div style={{ position: "absolute", left: 405, top: 351, width: 300 }}>
        <Kinetic text="SIBUK" frame={frame} fps={fps} cue={490} reveal={14} size={38} />
        <Kinetic
          text="Perhatian di tempat lain."
          frame={frame}
          fps={fps}
          cue={513}
          reveal={35}
          size={25}
          color={MUTED}
          style={{ marginTop: 18, lineHeight: 1.3 }}
        />
      </div>
      <div style={{ position: "absolute", left: 1450, top: 369 }}>
        <Kinetic text="CEPAT" frame={frame} fps={fps} cue={591} size={44} color={TEAL} reveal={14} />
      </div>
      <div style={{ position: "absolute", left: 405, top: 605, width: 300 }}>
        <Kinetic text="MENUNGGU" frame={frame} fps={fps} cue={628} size={34} reveal={20} />
        <Kinetic
          text="Perhatian pada waktu."
          frame={frame}
          fps={fps}
          cue={652}
          reveal={30}
          size={25}
          color={MUTED}
          style={{ marginTop: 18, lineHeight: 1.3 }}
        />
      </div>
      <div style={{ position: "absolute", left: 1432, top: 624 }}>
        <Kinetic text="LAMBAT" frame={frame} fps={fps} cue={720} size={44} color={RED} reveal={14} />
      </div>
    </>
  );
};

const AwarenessChapter: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const scan = (frame - 800) * 0.32;
  return (
    <>
      <SceneHeader
        frame={frame}
        fps={fps}
        cue={756}
        title="Ada hal yang lebih menarik."
        label="04 / MELIHAT DAN MENYADARI"
      />
      <svg
        viewBox="0 0 1700 580"
        style={{ position: "absolute", left: 110, top: 285, width: 1700, height: 580 }}
      >
        <g opacity={smooth(frame, 800, 25)}>
          <circle cx="390" cy="274" r="208" fill="#ECE9DF" />
          {[83, 145, 208].map((r) => (
            <circle
              key={r}
              cx="390"
              cy="274"
              r={r}
              fill="none"
              stroke={INK}
              opacity="0.17"
              strokeWidth="1"
            />
          ))}
          <path d="M160 274 H620 M390 44 V504" stroke={INK} opacity="0.12" />
          <g transform={`rotate(${scan} 390 274)`}>
            <path d="M390 274 L390 66 A208 208 0 0 1 537 127Z" fill={YELLOW} opacity="0.38" />
            <path d="M390 274 V66" stroke={INK} strokeWidth="2" />
          </g>
          {[[-115, -87], [104, -117], [127, 86], [-82, 127]].map(([x, y], i) => (
            <g key={i} transform={`translate(${390 + x} ${274 + y})`}>
              <rect x="-9" y="-9" width="18" height="18" fill={i === 1 ? BLUE : MUTED} />
              <circle r={18 + Math.sin(frame * 0.04 + i) * 3} fill="none" stroke={i === 1 ? BLUE : MUTED} opacity="0.35" />
            </g>
          ))}
        </g>
        <g opacity={smooth(frame, 900, 20)}>
          <path
            d="M252 274 Q390 166 528 274 Q390 382 252 274Z"
            fill={PAPER}
            stroke={INK}
            strokeWidth="4"
          />
          <circle cx="390" cy="274" r="44" fill={BLUE} />
          <circle cx="390" cy="274" r="21" fill={INK} />
          <circle cx="404" cy="260" r="8" fill={PAPER} />
          <path d="M634 274 H860" stroke={INK} strokeWidth="2" strokeDasharray="6 8" />
          <path d="M846 265 L861 274 L846 283" fill="none" stroke={INK} strokeWidth="2" />
        </g>
        <g opacity={smooth(frame, 947, 20)}>
          <g transform="translate(1060 53) scale(1.08)">
            <Brain frame={frame} activeFrom={947} color={TEAL} activity={0.45} />
          </g>
          <path
            d="M918 94 H992 V438 H918 M1549 94 H1475 V438 H1549"
            fill="none"
            stroke={TEAL}
            strokeWidth="2"
          />
        </g>
        <Marker
          frame={frame}
          cue={947}
          d="M1014 468 C1096 444 1442 444 1515 474 C1559 515 1112 551 1024 510 C994 496 990 480 1014 468"
          length={1150}
        />
      </svg>
      <div style={{ position: "absolute", left: 315, top: 805 }}>
        <Kinetic text="TERLIHAT" frame={frame} fps={fps} cue={900} size={34} reveal={28} />
      </div>
      <div style={{ position: "absolute", left: 1140, top: 758, width: 470 }}>
        <Kinetic
          text="Belum tentu disadari."
          frame={frame}
          fps={fps}
          cue={947}
          size={37}
          reveal={38}
          color={TEAL}
        />
      </div>
      <Reveal frame={frame} fps={fps} cue={876} style={{ position: "absolute", left: 823, top: 336 }}>
        <Tag>KADANG…</Tag>
      </Reveal>
    </>
  );
};

const StreetChapter: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const choosing = frame >= 1390;
  const overwhelm = frame >= 1346 && frame < 1390;
  const streetOpacity = choosing ? 0.44 : 1;
  const focus = smooth(frame, 1497, 18);
  const cardRows = [
    { cue: 1434, y: 313, text: "PENTING", color: YELLOW, mark: "✓" },
    { cue: 1460, y: 381, text: "TIDAK PENTING", color: "#E4E0D7", mark: "−" },
    { cue: 1497, y: 449, text: "PERLU DIPERHATIKAN", color: TEAL, mark: "✓" },
    { cue: 1542, y: 517, text: "BISA DIABAIKAN", color: "#E4E0D7", mark: "−" },
  ];
  return (
    <>
      <SceneHeader
        frame={frame}
        fps={fps}
        cue={1024}
        title="Bayangkan tempat yang ramai."
        label="05 / OTAK TIDAK MEMPROSES SEMUANYA"
      />
      <svg
        viewBox="0 0 1700 595"
        style={{ position: "absolute", left: 110, top: 274, width: 1700, height: 595 }}
      >
        <defs>
          <clipPath id="scene07-street-clip">
            <rect x="25" y="24" width="975" height="530" rx="3" />
          </clipPath>
        </defs>
        <g clipPath="url(#scene07-street-clip)">
          <rect x="25" y="24" width="975" height="530" fill="#EBE6DA" />
          <g opacity={smooth(frame, 1053, 25) * streetOpacity}>
            {[
              [35, 45, 135, 222],
              [182, 84, 142, 183],
              [338, 28, 120, 239],
              [472, 107, 153, 160],
              [639, 53, 142, 214],
              [795, 85, 193, 182],
            ].map(([x, y, w, h], i) => (
              <g key={i}>
                <rect x={x} y={y} width={w} height={h} fill={i % 2 ? "#DBD5C8" : "#E2DCCC"} />
                <line x1={x} y1={y} x2={x + w} y2={y} stroke={INK} opacity="0.25" />
                {Array.from({ length: 6 }, (_, j) => (
                  <rect
                    key={j}
                    x={x + 18 + (j % 3) * 34}
                    y={y + 25 + Math.floor(j / 3) * 53}
                    width="17"
                    height="27"
                    fill={PAPER}
                    opacity="0.8"
                  />
                ))}
              </g>
            ))}
            <path d="M25 287 H1000" stroke={INK} strokeWidth="2" opacity="0.25" />
            <rect x="25" y="366" width="975" height="145" fill="#D7D2C6" />
            <path d="M25 438 H1000" stroke={PAPER} strokeWidth="5" strokeDasharray="55 35" />
            <path d="M25 511 H1000" stroke={INK} strokeWidth="2" opacity="0.2" />
          </g>

          {frame >= 1053 && (
            <g opacity={smooth(frame, 1053, 18)}>
              <ellipse cx="475" cy="351" rx="60" ry="17" fill={YELLOW} opacity="0.75" />
              <Person
                x={475 + Math.sin((frame - 1053) * 0.045) * 4}
                y={255 + Math.sin((frame - 1053) * 0.09) * 2}
                color={BLUE}
                scale={1.16}
              />
              <path d="M433 346 L475 327 L516 346" fill="none" stroke={BLUE} strokeWidth="2" />
            </g>
          )}

          {frame >= 1115 &&
            Array.from({ length: 8 }, (_, i) => {
              const x = 80 + i * 116 + Math.sin((frame - 1115) * 0.018 + i) * 18;
              return (
                <g
                  key={i}
                  opacity={smooth(frame, 1115 + i * 2, 12) * streetOpacity}
                >
                  <Person
                    x={x}
                    y={i % 2 ? 222 : 290}
                    scale={i % 2 ? 0.68 : 0.86}
                    color={i % 3 === 0 ? "#B46755" : "#8C8B7C"}
                  />
                </g>
              );
            })}

          {frame >= 1155 && (
            <g opacity={smooth(frame, 1155, 18) * streetOpacity}>
              <Car
                x={70 + ((frame - 1155) * 0.7) % 800}
                y={389}
                color={TEAL}
              />
              <Car
                x={850 - ((frame - 1155) * 0.85) % 850}
                y={449}
                color="#C4A76C"
              />
            </g>
          )}

          {frame >= 1194 &&
            [0, 1, 2].map((i) => {
              const pulse = (Math.sin((frame - 1194) * 0.07 - i) + 1) / 2;
              return (
                <g key={i} opacity={smooth(frame, 1194, 12) * streetOpacity}>
                  <path
                    d={`M${725 + i * 16} ${173 - i * 17} Q${758 + i * 19} 208 ${725 + i * 16} ${245 + i * 17}`}
                    fill="none"
                    stroke={RED}
                    strokeWidth="3"
                    opacity={0.3 + pulse * 0.55}
                  />
                </g>
              );
            })}

          {frame >= 1227 && (
            <g opacity={smooth(frame, 1227, 15) * streetOpacity}>
              <g transform={`translate(${130 + (frame - 1227) * 0.4} ${150 + Math.sin(frame * 0.035) * 17})`}>
                <path d="M0 0 L37 13 L0 26 L8 13Z" fill={RED} />
                <path d="M0 0 L-23 -9" stroke={INK} strokeWidth="1.5" />
              </g>
              <g transform={`translate(${840 - (frame - 1227) * 0.35} ${310 + Math.sin(frame * 0.065) * 8})`}>
                <circle r="17" fill="#C89A62" stroke={INK} strokeWidth="2" />
                <path d="M-16 0 H16 M0 -16 V16" stroke={INK} opacity="0.45" />
              </g>
            </g>
          )}

          {overwhelm && (
            <g opacity={smooth(frame, 1346, 12)}>
              <rect x="25" y="24" width="975" height="530" fill={RED} opacity="0.08" />
              {Array.from({ length: 12 }, (_, i) => (
                <g key={i} transform={`translate(${65 + (i % 4) * 232} ${75 + Math.floor(i / 4) * 155})`}>
                  <path d="M0 20 V0 H28 M92 0 H120 V20 M0 65 V85 H28 M92 85 H120 V65" fill="none" stroke={RED} strokeWidth="2" />
                  <circle cx="60" cy="42" r="5" fill={RED} />
                </g>
              ))}
            </g>
          )}

          {frame >= 1497 && (
            <g opacity={focus}>
              <rect x="420" y="229" width="110" height="129" fill={YELLOW} opacity="0.15" />
              <path d="M420 255 V229 H447 M503 229 H530 V255 M420 330 V358 H447 M503 358 H530 V330" fill="none" stroke={TEAL} strokeWidth="4" />
              <path d="M530 293 H976" stroke={TEAL} strokeWidth="2" strokeDasharray="7 6" />
            </g>
          )}
        </g>

        <rect x="25" y="24" width="975" height="530" rx="3" fill="none" stroke={INK} strokeWidth="1.5" opacity="0.3" />

        {frame >= 1260 && (
          <g opacity={smooth(frame, 1260, 17)}>
            <g transform="translate(1110 10) scale(.69)">
              <Brain
                frame={frame}
                activeFrom={1260}
                color={overwhelm ? RED : choosing ? TEAL : BLUE}
                activity={overwhelm ? 2.8 : 1}
              />
            </g>
            <path d="M1018 175 H1098 M1084 165 L1098 175 L1084 185" fill="none" stroke={overwhelm ? RED : INK} strokeWidth="2" />
          </g>
        )}

        {frame >= 1278 && frame < 1390 && (
          <g opacity={smooth(frame, 1278, 17)}>
            {Array.from({ length: 6 }, (_, i) => (
              <path
                key={i}
                d={`M${210 + i * 128} ${108 + (i % 3) * 102} Q1040 ${40 + i * 55} 1185 155`}
                fill="none"
                stroke={overwhelm ? RED : BLUE}
                strokeWidth="1.5"
                strokeDasharray="5 12"
                strokeDashoffset={-(frame - 1278) * 1.5}
                opacity={overwhelm ? 0.68 : 0.23}
              />
            ))}
          </g>
        )}

        {choosing && (
          <g opacity={smooth(frame, 1390, 17)}>
            <path d="M1255 255 V552" fill="none" stroke={INK} strokeWidth="2" opacity="0.25" />
            <circle cx="1255" cy="271" r="7" fill={TEAL} />
          </g>
        )}

        {cardRows.map(({ cue, y, text, color, mark }) => {
          if (frame < cue) return null;
          const enter = smooth(frame, cue, cue === 1542 ? 5 : 10);
          return (
            <g key={cue} opacity={enter} transform={`translate(${(1 - enter) * 14} 0)`}>
              <path d={`M1255 ${y + 22} H1310`} stroke={color === TEAL ? TEAL : MUTED} strokeWidth="2" />
              <circle cx="1255" cy={y + 22} r="4" fill={color === TEAL ? TEAL : INK} />
              <rect x="1310" y={y} width="352" height="47" fill={color} />
              <text
                x="1330"
                y={y + 31}
                fontSize="21"
                fontWeight="800"
                fill={color === TEAL ? PAPER : INK}
              >
                {mark}
              </text>
              <text
                x="1368"
                y={y + 30}
                fontSize="18"
                letterSpacing="0.8"
                fontWeight="800"
                fill={color === TEAL ? PAPER : INK}
              >
                {text}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ position: "absolute", left: 153, top: 850, display: "flex", gap: 24 }}>
        {[
          { cue: 1115, text: "ORANG", color: "#B46755" },
          { cue: 1155, text: "KENDARAAN", color: TEAL },
          { cue: 1194, text: "SUARA", color: RED },
          { cue: 1227, text: "GERAKAN", color: BLUE },
        ].map((item) => (
          <Reveal key={item.cue} frame={frame} fps={fps} cue={item.cue}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: choosing ? 0.5 : 1 }}>
              <span style={{ width: 8, height: 8, background: item.color, borderRadius: "50%" }} />
              <span style={{ fontSize: 15, letterSpacing: "0.07em", color: MUTED, fontWeight: 700 }}>{item.text}</span>
            </div>
          </Reveal>
        ))}
      </div>

      {frame >= 1260 && frame < 1390 && (
        <div style={{ position: "absolute", left: 1215, top: 555, width: 480 }}>
          {frame < 1346 ? (
            <Kinetic
              text={frame < 1278 ? "Kalau otak…" : "Memperhatikan semuanya?"}
              frame={frame}
              fps={fps}
              cue={frame < 1278 ? 1260 : 1278}
              reveal={33}
              size={35}
            />
          ) : (
            <>
              <Tag color={RED} dark>TERLALU BANYAK INPUT</Tag>
              <Kinetic
                text="Kewalahan."
                frame={frame}
                fps={fps}
                cue={1346}
                reveal={16}
                size={51}
                color={RED}
                style={{ marginTop: 22 }}
              />
            </>
          )}
        </div>
      )}

      {frame >= 1390 && (
        <div style={{ position: "absolute", left: 1217, top: 538 }}>
          <Kinetic
            text="Otak memilih."
            frame={frame}
            fps={fps}
            cue={1390}
            reveal={25}
            size={36}
            color={TEAL}
          />
        </div>
      )}
    </>
  );
};

export const Scene_07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const scale = Math.min(width / 1920, height / 1080);
  const activeCueIndex = CUES.reduce(
    (found, cue, index) => (frame >= cue[0] ? index : found),
    -1,
  );
  const activeCue = activeCueIndex >= 0 ? CUES[activeCueIndex] : null;
  const chapter =
    frame < 312 ? "LEBIH LAMBAT?"
      : frame < 490 ? "PERSEPSI"
        : frame < 756 ? "PERHATIAN"
          : frame < 1024 ? "KESADARAN"
            : "SELEKSI";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: PAPER,
        fontFamily: 'Arial, Helvetica, sans-serif',
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
          background: PAPER,
          color: INK,
          overflow: "hidden",
        }}
      >
        <Sequence from={0} durationInFrames={1549} frame={frame}>
          <svg
            viewBox="0 0 1920 1080"
            style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }}
          >
            <defs>
              <pattern id="scene07-paper-grid" width="46" height="46" patternUnits="userSpaceOnUse">
                <path d="M46 0 H0 V46" fill="none" stroke="#D5D0C5" strokeWidth="0.7" />
                <circle cx="0" cy="0" r="1" fill="#BCB6A8" />
              </pattern>
              <radialGradient id="scene07-paper-glow">
                <stop offset="0" stopColor="#FFFBEA" stopOpacity="0.9" />
                <stop offset="1" stopColor={PAPER} stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1920" height="1080" fill="url(#scene07-paper-grid)" opacity="0.28" />
            <ellipse
              cx={1010 + Math.sin(frame * 0.003) * 130}
              cy={380 + Math.cos(frame * 0.004) * 60}
              rx="960"
              ry="600"
              fill="url(#scene07-paper-glow)"
            />
            <path d="M110 114 H1810" stroke={INK} strokeWidth="1.5" opacity="0.22" />
            <path d="M110 891 H1810" stroke={INK} strokeWidth="1.5" opacity="0.22" />
          </svg>
        </Sequence>

        <Sequence from={0} durationInFrames={1549} frame={frame}>
          <div
            style={{
              position: "absolute",
              left: 110,
              top: 58,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                background: INK,
                color: YELLOW,
                fontSize: 24,
                fontWeight: 900,
                padding: "7px 12px",
                letterSpacing: "-0.06em",
              }}
            >
              vox
            </div>
            <span style={{ fontSize: 16, letterSpacing: "0.17em", fontWeight: 700 }}>
              CARA OTAK MEMBENTUK REALITAS
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              right: 110,
              top: 69,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.13em",
              color: MUTED,
            }}
          >
            07 / 11 &nbsp; — &nbsp; {chapter}
          </div>

          <div
            style={{
              position: "absolute",
              right: 69,
              top: 390,
              writingMode: "vertical-rl",
              fontSize: 12,
              letterSpacing: "0.2em",
              color: "#A09A8D",
            }}
          >
            DIAGRAM KONSEPTUAL / PERSEPSI & PERHATIAN
          </div>
        </Sequence>

        <Sequence from={0} durationInFrames={312} frame={frame}>
          <ClockChapter frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={312} durationInFrames={178} frame={frame}>
          <PerceptionChapter frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={490} durationInFrames={266} frame={frame}>
          <ComparisonChapter frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={756} durationInFrames={268} frame={frame}>
          <AwarenessChapter frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={1024} durationInFrames={525} frame={frame}>
          <StreetChapter frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={6} durationInFrames={1543} frame={frame}>
          {activeCue && (
            <div
              style={{
                position: "absolute",
                left: 110,
                right: 110,
                top: 916,
                minHeight: 102,
                display: "flex",
                alignItems: "center",
                gap: 25,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 8,
                  height: 54,
                  background: YELLOW,
                }}
              />
              <div style={{ flex: 1 }}>
                <Kinetic
                  key={activeCue[0]}
                  text={activeCue[2]}
                  frame={frame}
                  fps={fps}
                  cue={activeCue[0]}
                  reveal={Math.max(3, Math.min(40, (activeCue[1] - activeCue[0]) * 0.78))}
                  size={43}
                  weight={600}
                  style={{ letterSpacing: "-0.025em" }}
                />
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontFamily: "monospace",
                  color: MUTED,
                  alignSelf: "center",
                  letterSpacing: "0.05em",
                  minWidth: 110,
                  textAlign: "right",
                }}
              >
                {String(Math.floor(frame / fps)).padStart(2, "0")}
                <span style={{ opacity: 0.4 }}> / 52</span>
              </div>
            </div>
          )}
          <div
            style={{
              position: "absolute",
              left: 110,
              bottom: 35,
              width: 1700,
              height: 3,
              background: "#DDD8CD",
            }}
          >
            <div
              style={{
                height: 3,
                background: INK,
                width: `${interpolate(frame, [0, Math.max(0 + 0.001, 1548)], [0, 100], CLAMP)}%`,
              }}
            />
          </div>
        </Sequence>
      </div>
    </div>
  );
};