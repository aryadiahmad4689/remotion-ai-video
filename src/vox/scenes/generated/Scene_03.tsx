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
  muted: "#77746D",
  line: "#D9D4C9",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
  white: "#FFFD F8".replace(" ", ""),
};

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const FONT = 'Arial, Helvetica, sans-serif';
const MONO = '"Courier New", Courier, monospace';

const ramp = (frame: number, start: number, duration = 24) =>
  interpolate(frame, [start, start + duration], [0, 1], CLAMP);

const enter = (frame: number, fps: number, start: number) =>
  spring({
    frame: Math.max(0, frame - start),
    fps,
    config: { damping: 18, mass: 0.65, stiffness: 90 },
  });

/**
 * An SVG-native timeline layer. All layers stay mounted; entrances and exits
 * are continuous, frame-derived crossfades. This keeps the component
 * self-contained without importing any additional Remotion components.
 */
const Sequence: React.FC<{
  frame: number;
  from: number;
  durationInFrames: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
}> = ({
  frame,
  from,
  durationInFrames,
  fadeIn = 24,
  fadeOut = 24,
  children,
}) => {
  const incoming = from === 0 ? 1 : ramp(frame, from, fadeIn);
  const outgoing =
    fadeOut === 0
      ? 1
      : interpolate(
          frame,
          [from + durationInFrames - fadeOut, from + durationInFrames],
          [1, 0],
          CLAMP,
        );

  return <g opacity={Math.min(incoming, outgoing)}>{children}</g>;
};

const Words: React.FC<{
  text: string;
  x: number;
  y: number;
  width: number;
  frame: number;
  fps: number;
  start: number;
  size?: number;
  weight?: number;
  color?: string;
  stagger?: number;
}> = ({
  text,
  x,
  y,
  width,
  frame,
  fps,
  start,
  size = 34,
  weight = 700,
  color = C.ink,
  stagger = 3,
}) => (
  <foreignObject x={x} y={y} width={width} height={size * 2.8}>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        columnGap: size * 0.25,
        rowGap: 4,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.18,
        letterSpacing: size > 55 ? -2.6 : -0.7,
        color,
      }}
    >
      {text.split(" ").map((word, i) => {
        const p = enter(frame, fps, start + i * stagger);
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              opacity: ramp(frame, start + i * stagger, 14),
              transform: `translateY(${(1 - p) * 13}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  </foreignObject>
);

const Label: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  color?: string;
  size?: number;
  spacing?: number;
}> = ({
  x,
  y,
  children,
  color = C.muted,
  size = 16,
  spacing = 2,
}) => (
  <text
    x={x}
    y={y}
    fill={color}
    fontFamily={MONO}
    fontSize={size}
    fontWeight={700}
    letterSpacing={spacing}
  >
    {children}
  </text>
);

const Pill: React.FC<{
  x: number;
  y: number;
  width: number;
  text: string;
  frame: number;
  fps: number;
  start: number;
  fill?: string;
  color?: string;
}> = ({
  x,
  y,
  width,
  text,
  frame,
  fps,
  start,
  fill = C.ink,
  color = C.white,
}) => {
  const p = enter(frame, fps, start);
  return (
    <g
      opacity={ramp(frame, start, 22)}
      transform={`translate(${x + (1 - p) * 24} ${y})`}
    >
      <rect width={width} height={39} rx={19.5} fill={fill} />
      <text
        x={width / 2}
        y={25}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize={17}
        fontWeight={700}
        fill={color}
        letterSpacing={0.5}
      >
        {text}
      </text>
    </g>
  );
};

const Marker: React.FC<{
  frame: number;
  start: number;
  d: string;
  duration?: number;
}> = ({ frame, start, d, duration = 48 }) => (
  <path
    d={d}
    fill="none"
    stroke={C.red}
    strokeWidth={5}
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray="1 1"
    strokeDashoffset={1 - ramp(frame, start, duration)}
    opacity={ramp(frame, start, 12)}
  />
);

const Arrow: React.FC<{
  d: string;
  frame: number;
  start: number;
  color?: string;
  dashed?: boolean;
}> = ({ d, frame, start, color = C.ink, dashed = false }) => {
  const p = ramp(frame, start, 40);
  return (
    <g opacity={ramp(frame, start, 20)}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - p}
      />
      {dashed ? (
        <path
          d={d}
          fill="none"
          stroke={C.paper}
          strokeWidth={3.5}
          strokeDasharray="3 13"
          strokeDashoffset={-frame * 0.25}
          opacity={p}
        />
      ) : null}
    </g>
  );
};

const FaceIcon: React.FC<{ x: number; y: number; color?: string }> = ({
  x,
  y,
  color = C.blue,
}) => (
  <g
    transform={`translate(${x} ${y})`}
    fill="none"
    stroke={color}
    strokeWidth={3}
    strokeLinecap="round"
  >
    <rect x={-23} y={-29} width={46} height={57} rx={19} />
    <path d="M-9 -4h1 M8 -4h1 M0 -3v10 M-9 15q9 7 18 0" />
    <path d="M-35 -17v-18h18 M17 -35h18v18 M35 18v18H17 M-17 36h-18V18" />
  </g>
);

const HeartIcon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path
      d="M0 25C-8 17-28 3-28-11C-28-29-8-35 0-19C8-35 28-29 28-11C28 3 8 17 0 25Z"
      fill={C.red}
      fillOpacity={0.1}
      stroke={C.red}
      strokeWidth={3}
    />
    <path
      d="M-23 0h11l6-9 9 18 6-9h15"
      fill="none"
      stroke={C.red}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  </g>
);

const LoopIcon: React.FC<{
  x: number;
  y: number;
  frame: number;
  color?: string;
}> = ({ x, y, frame, color = C.teal }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle
      r={29}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeDasharray="128 54"
      transform={`rotate(${frame * 0.12 - 35})`}
    />
    <path d="M20-23l12 1-4 11" fill="none" stroke={color} strokeWidth={3} />
    <path d="M-20 23l-12-1 4-11" fill="none" stroke={color} strokeWidth={3} />
    <circle r={6} fill={color} />
  </g>
);

const brainOutline =
  "M-182 83C-219 72-239 37-227 7C-261-24-252-71-214-88" +
  "C-218-132-179-157-143-152C-120-192-66-202-34-175" +
  "C-1-201 48-185 60-159C102-174 146-153 154-119" +
  "C195-111 225-73 215-39C247-12 241 33 216 54" +
  "C219 91 188 123 150 124C132 158 84 167 52 145" +
  "C24 166-18 163-41 141C-77 164-125 146-137 122" +
  "C-156 126-179 110-182 83Z";

const NODES = [
  [-176, -47],
  [-125, -112],
  [-66, -135],
  [2, -122],
  [69, -115],
  [133, -73],
  [179, -12],
  [141, 54],
  [72, 103],
  [-4, 94],
  [-89, 101],
  [-153, 43],
  [-82, -25],
  [-15, -46],
  [68, -20],
  [13, 24],
  [-59, 39],
] as const;

const CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [10, 11],
  [11, 0],
  [0, 12],
  [2, 12],
  [12, 13],
  [13, 3],
  [13, 14],
  [14, 5],
  [14, 7],
  [14, 15],
  [15, 9],
  [15, 16],
  [16, 10],
  [16, 12],
] as const;

const Brain: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const habitual = ramp(frame, 763, 65);
  const warning = ramp(frame, 1001, 55);
  const float = Math.sin(frame * 0.018) * 3;

  return (
    <g transform={`translate(450 ${472 + float})`}>
      <circle r={242} fill="none" stroke={C.line} strokeWidth={1} />
      <circle
        r={254}
        fill="none"
        stroke={C.line}
        strokeDasharray="2 15"
        strokeWidth={2}
        transform={`rotate(${frame * 0.045})`}
      />
      <g transform={`rotate(${frame * 0.09})`}>
        <path
          d="M-252 0A252 252 0 0 1-218-126"
          fill="none"
          stroke={C.blue}
          strokeWidth={3}
          opacity={0.45}
        />
        <path
          d="M252 0A252 252 0 0 1 218 126"
          fill="none"
          stroke={C.teal}
          strokeWidth={3}
          opacity={0.45}
        />
      </g>

      <path
        d={brainOutline}
        fill={C.white}
        stroke={C.ink}
        strokeWidth={3}
        strokeLinejoin="round"
      />

      <path
        d="M-144-147C-131-102-155-83-127-56C-105-33-119-1-104 22
           M-38-171C-51-140-32-117-48-91C-65-68-47-44-55-23
           M59-155C41-127 71-111 48-78C28-51 57-24 42-1
           M151-116C114-105 133-79 105-58C83-40 103-13 90 8
           M-181 78C-158 65-151 92-127 83C-96 68-76 91-53 73
           M-29 137C-18 109 1 105 0 77C-2 53 26 62 37 42
           M143 121C120 99 139 78 114 65C94 51 106 26 82 21"
        fill="none"
        stroke={C.line}
        strokeWidth={5}
        strokeLinecap="round"
      />

      {CONNECTIONS.map(([a, b], i) => {
        const n1 = NODES[a];
        const n2 = NODES[b];
        const phase = ((frame * 0.007 + i * 0.173) % 1 + 1) % 1;
        const px = n1[0] + (n2[0] - n1[0]) * phase;
        const py = n1[1] + (n2[1] - n1[1]) * phase;

        return (
          <g key={`edge-${i}`}>
            <line
              x1={n1[0]}
              y1={n1[1]}
              x2={n2[0]}
              y2={n2[1]}
              stroke={i % 3 === 0 ? C.blue : C.teal}
              strokeWidth={1.8}
              opacity={0.28}
            />
            <circle
              cx={px}
              cy={py}
              r={2.4}
              fill={i % 3 === 0 ? C.blue : C.teal}
              opacity={0.45 + Math.sin(phase * Math.PI) * 0.45}
            />
          </g>
        );
      })}

      <g opacity={habitual}>
        <path
          d="M-153 43C-126-38-70-100 2-122C90-149 177-58 141 54
             C115 128-59 143-153 43"
          fill="none"
          stroke={C.yellow}
          strokeWidth={13}
          strokeOpacity={0.6}
          strokeLinecap="round"
        />
        <path
          d="M-153 43C-126-38-70-100 2-122C90-149 177-58 141 54
             C115 128-59 143-153 43"
          fill="none"
          stroke={C.teal}
          strokeWidth={3}
          strokeDasharray="7 10"
          strokeDashoffset={-frame * 0.55}
        />
      </g>

      {NODES.map(([x, y], i) => {
        const pulse = 1 + Math.sin(frame * 0.055 + i * 1.3) * 0.14;
        return (
          <g key={`node-${i}`}>
            <circle
              cx={x}
              cy={y}
              r={10 * pulse}
              fill={i % 3 === 0 ? C.blue : C.teal}
              opacity={0.09}
            />
            <circle
              cx={x}
              cy={y}
              r={4.6}
              fill={i % 3 === 0 ? C.blue : C.teal}
              stroke={C.white}
              strokeWidth={1.5}
            />
          </g>
        );
      })}

      <g opacity={warning}>
        <path
          d="M13 24C91 28 131-35 179-12"
          fill="none"
          stroke={C.red}
          strokeWidth={4}
          strokeDasharray="8 7"
          strokeDashoffset={-frame * 0.4}
        />
        <circle
          cx={179}
          cy={-12}
          r={13 + Math.sin(frame * 0.055) * 3}
          fill={C.red}
          opacity={0.15}
        />
        <circle cx={179} cy={-12} r={5.5} fill={C.red} />
      </g>

      <g opacity={ramp(frame, 341, 26)}>
        <rect
          x={-140}
          y={184}
          width={280}
          height={47}
          rx={9}
          fill={C.yellow}
          transform={`scale(${0.98 + enter(frame, fps, 341) * 0.02} 1)`}
        />
        <text
          x={0}
          y={215}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={23}
          fontWeight={800}
          fill={C.ink}
        >
          PROSES OTOMATIS
        </text>
      </g>
    </g>
  );
};

const RecognitionAct: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const emotion = enter(frame, fps, 175);
  const automatic = enter(frame, fps, 341);

  return (
    <g>
      <Label x={973} y={278}>01 — BEKERJA TANPA DISURUH</Label>

      <g transform={`translate(0 ${Math.sin(frame * 0.018) * 1.4})`}>
        <rect x={970} y={313} width={772} height={130} rx={16} fill="#F0F4F7" />
        <FaceIcon x={1038} y={377} />
        <Words
          text="Wajah yang familiar"
          x={1100}
          y={335}
          width={570}
          size={32}
          frame={frame}
          fps={fps}
          start={-38}
        />
        <rect
          x={1099}
          y={384}
          width={374 * ramp(frame, 36, 43)}
          height={29}
          rx={2}
          fill={C.yellow}
          opacity={0.85}
        />
        <text
          x={1102}
          y={405}
          fontFamily={FONT}
          fontSize={22}
          fill={C.ink}
          opacity={ramp(frame, 18, 24)}
        >
          Dikenali tanpa sengaja mengingat
        </text>
        <circle cx={1699} cy={378} r={6} fill={C.blue} />
        <circle
          cx={1699}
          cy={378}
          r={12 + Math.sin(frame * 0.06) * 3}
          fill={C.blue}
          opacity={0.1}
        />
      </g>

      <g
        opacity={ramp(frame, 175, 25)}
        transform={`translate(${(1 - emotion) * 26} 0)`}
      >
        <rect x={970} y={462} width={772} height={130} rx={16} fill="#F8EFEC" />
        <HeartIcon x={1038} y={527} />
        <Words
          text="Reaksi emosional"
          x={1100}
          y={484}
          width={590}
          size={32}
          frame={frame}
          fps={fps}
          start={179}
        />
        <text
          x={1102}
          y={555}
          fontFamily={FONT}
          fontSize={22}
          fill={C.muted}
          opacity={ramp(frame, 198, 26)}
        >
          Terasa dulu. Alasannya menyusul.
        </text>
        <path
          d="M1632 527h17l9-16 12 32 9-16h30"
          fill="none"
          stroke={C.red}
          strokeWidth={2.5}
          strokeDasharray="104 104"
          strokeDashoffset={104 * (1 - ramp(frame, 201, 42))}
        />
      </g>

      <g
        opacity={ramp(frame, 341, 24)}
        transform={`translate(0 ${(1 - automatic) * 16})`}
      >
        <line x1={1002} y1={629} x2={1710} y2={629} stroke={C.line} />
        <LoopIcon x={1038} y={701} frame={frame} />
        <Words
          text="Tidak perlu memikirkan"
          x={1100}
          y={660}
          width={590}
          size={30}
          frame={frame}
          fps={fps}
          start={345}
        />
        <Words
          text="setiap hal kecil."
          x={1100}
          y={699}
          width={580}
          size={30}
          frame={frame}
          fps={fps}
          start={359}
          color={C.teal}
        />
        <Pill
          x={1100}
          y={764}
          width={244}
          text="LEBIH SEDIKIT USAHA"
          frame={frame}
          fps={fps}
          start={392}
          fill="#E0ECE7"
          color={C.teal}
        />
      </g>
    </g>
  );
};

const Walker: React.FC<{ frame: number; active: number }> = ({
  frame,
  active,
}) => {
  const cycle = frame * 0.065;
  const step = Math.sin(cycle) * 19;
  const lift = Math.sin(cycle * 2) * 2.5;

  return (
    <g transform={`translate(1116 ${548 + lift})`}>
      <ellipse cx={0} cy={177 - lift} rx={78} ry={11} fill={C.ink} opacity={0.06} />
      <g stroke={C.ink} strokeWidth={10} strokeLinecap="round" fill="none">
        <circle cx={0} cy={-104} r={27} fill={C.white} strokeWidth={4} />
        <path d="M0-74L-5 9" />
        <g transform={`rotate(${step} -5 9)`}>
          <path d="M-5 9L-25 84L-7 153L13 153" />
        </g>
        <g transform={`rotate(${-step} -5 9)`}>
          <path d="M-5 9L27 84L14 153L35 153" />
        </g>
        <g transform={`rotate(${-step * 0.9} 0 -58)`}>
          <path d="M0-58L-34-11L-18 19" />
        </g>
        <g transform={`rotate(${step * 0.9} 0 -58)`}>
          <path d="M0-58L35-11L46-34" />
        </g>
      </g>
      <g fill={C.yellow} stroke={C.ink} strokeWidth={2}>
        <circle cx={-5} cy={9} r={7} />
        <circle cx={0} cy={-58} r={7} />
      </g>
      <g opacity={active} stroke={C.teal} fill="none" strokeWidth={2}>
        <circle
          cx={-5}
          cy={9}
          r={16 + Math.sin(frame * 0.06) * 3}
          strokeOpacity={0.55}
        />
        <path d="M-21 9H-76V-61" />
        <path d="M14 14H76V-45" />
      </g>
    </g>
  );
};

const WalkingAct: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const learned = ramp(frame, 763, 40);

  return (
    <g>
      <Label x={973} y={278}>02 — BAYANGKAN SETIAP LANGKAH</Label>
      <Words
        text="Kalau semuanya harus dipikirkan…"
        x={973}
        y={308}
        width={755}
        size={35}
        frame={frame}
        fps={fps}
        start={492}
      />

      <Walker frame={frame - 487} active={ramp(frame, 535, 35)} />

      <g opacity={ramp(frame, 548, 28)}>
        <Label x={996} y={435} size={13} spacing={1}>BAHU</Label>
        <Label x={1170} y={467} size={13} spacing={1}>PINGGUL</Label>
        <path
          d="M1200 544h74 M1200 629h74 M1200 704h74"
          fill="none"
          stroke={C.line}
          strokeWidth={2}
        />
      </g>

      {[
        { y: 442, text: "Gerakkan otot", start: 539 },
        { y: 522, text: "Jaga keseimbangan", start: 572 },
        { y: 602, text: "Ulangi lagi", start: 605 },
      ].map((item, i) => {
        const p = enter(frame, fps, item.start);
        return (
          <g
            key={item.text}
            opacity={ramp(frame, item.start, 24)}
            transform={`translate(${(1 - p) * 20} 0)`}
          >
            <rect
              x={1292}
              y={item.y}
              width={405}
              height={62}
              rx={10}
              fill={C.white}
              stroke={C.line}
            />
            <text
              x={1310}
              y={item.y + 39}
              fill={C.muted}
              fontFamily={MONO}
              fontSize={17}
            >
              0{i + 1}
            </text>
            <Words
              text={item.text}
              x={1360}
              y={item.y + 18}
              width={330}
              size={23}
              weight={600}
              frame={frame}
              fps={fps}
              start={item.start + 3}
            />
          </g>
        );
      })}

      <g opacity={ramp(frame, 671, 28)}>
        <text
          x={1495}
          y={718}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={27}
          fontWeight={700}
          fill={C.ink}
        >
          Pasti melelahkan.
        </text>
        <Marker
          frame={frame}
          start={687}
          d="M1336 695C1383 677 1607 674 1651 704C1681 736 1591 750 1478 748C1368 749 1326 728 1336 695"
        />
      </g>

      <g opacity={learned}>
        <rect x={971} y={767} width={770} height={58} rx={10} fill={C.yellow} />
        <LoopIcon x={1008} y={796} frame={frame} />
        <Words
          text="Pengalaman + kebiasaan → lebih otomatis"
          x={1053}
          y={782}
          width={667}
          size={25}
          frame={frame}
          fps={fps}
          start={767}
          stagger={4}
        />
        <Arrow
          d="M1723 780C1780 712 1772 457 1719 423"
          frame={frame}
          start={814}
          color={C.teal}
          dashed
        />
        <path
          d="M1719 423l2 17m-2-17l17 5"
          stroke={C.teal}
          strokeWidth={3}
          fill="none"
          opacity={ramp(frame, 850, 20)}
        />
      </g>
    </g>
  );
};

const PhoneAct: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const social = ramp(frame, 1222, 30);
  const notification = enter(frame, fps, 1318);
  const float = Math.sin(frame * 0.022) * 2.2;

  return (
    <g>
      <Label x={973} y={278} color={C.red}>03 — SISI LAIN AUTOPILOT</Label>
      <Words
        text="Membantu. Tapi bisa kebablasan."
        x={973}
        y={310}
        width={775}
        size={37}
        frame={frame}
        fps={fps}
        start={1005}
      />

      <g opacity={ramp(frame, 1042, 30)}>
        <rect x={980} y={426} width={398} height={73} rx={12} fill="#EAF1EB" />
        <LoopIcon x={1026} y={462} frame={frame} />
        <Words
          text="Respons yang terbiasa"
          x={1077}
          y={450}
          width={289}
          size={23}
          frame={frame}
          fps={fps}
          start={1045}
        />

        <Arrow
          d="M1180 507V570"
          frame={frame}
          start={1073}
          color={C.red}
        />
        <path
          d="M1172 560l8 11 8-11"
          fill="none"
          stroke={C.red}
          strokeWidth={3}
          opacity={ramp(frame, 1095, 20)}
        />

        <rect
          x={980}
          y={586}
          width={398}
          height={91}
          rx={12}
          fill="#F8EEEB"
        />
        <Words
          text="Bukan selalu"
          x={1003}
          y={602}
          width={359}
          size={27}
          frame={frame}
          fps={fps}
          start={1084}
        />
        <Words
          text="yang kita inginkan."
          x={1003}
          y={638}
          width={359}
          size={27}
          color={C.red}
          frame={frame}
          fps={fps}
          start={1096}
        />

        <Marker
          frame={frame}
          start={1134}
          d="M978 600C1011 565 1325 565 1388 597C1421 639 1377 690 1232 695C1087 702 957 675 978 600"
          duration={58}
        />
      </g>

      <g transform={`translate(1571 ${582 + float})`}>
        <rect
          x={-118}
          y={-184}
          width={236}
          height={373}
          rx={35}
          fill={C.ink}
          opacity={ramp(frame, 1001, 38)}
        />
        <rect
          x={-108}
          y={-174}
          width={216}
          height={352}
          rx={26}
          fill="#EEEAE1"
          opacity={ramp(frame, 1001, 38)}
        />
        <rect
          x={-42}
          y={-163}
          width={84}
          height={17}
          rx={8.5}
          fill={C.ink}
          opacity={ramp(frame, 1001, 38)}
        />
        <rect
          x={-38}
          y={160}
          width={76}
          height={5}
          rx={2.5}
          fill={C.ink}
          opacity={0.25 * ramp(frame, 1001, 38)}
        />

        <g opacity={social}>
          <Label x={-84} y={-108} size={12} spacing={1}>MEDIA SOSIAL</Label>
          <rect x={-86} y={-85} width={172} height={91} rx={12} fill={C.white} />
          <circle cx={-58} cy={-60} r={11} fill="#D4E5E8" />
          <rect x={-36} y={-66} width={83} height={7} rx={3.5} fill={C.line} />
          <rect x={-36} y={-51} width={52} height={5} rx={2.5} fill={C.line} />
          <rect x={-72} y={-27} width={144} height={19} rx={4} fill="#E1E9EC" />
          <rect x={-86} y={19} width={172} height={78} rx={12} fill={C.white} />
          <rect x={-71} y={34} width={142} height={38} rx={5} fill="#D7E5DC" />
          <rect x={-71} y={80} width={94} height={5} rx={2.5} fill={C.line} />

          <g transform={`translate(0 ${119 + Math.sin(frame * 0.025) * 1.5})`}>
            <rect x={-28} y={-20} width={56} height={42} rx={11} fill={C.blue} />
            <path
              d="M-11-7H11V7H1L-5 13V7H-11Z"
              fill="none"
              stroke={C.white}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          </g>
        </g>

        <g
          opacity={ramp(frame, 1318, 18)}
          transform={`translate(29 97) scale(${0.75 + notification * 0.25})`}
        >
          <circle
            r={22 + Math.sin(frame * 0.075) * 2}
            fill={C.red}
            opacity={0.13}
          />
          <circle r={16} fill={C.red} stroke={C.white} strokeWidth={3} />
          <text
            y={6}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={18}
            fontWeight={800}
            fill={C.white}
          >
            1
          </text>
        </g>
      </g>

      <g opacity={social}>
        <Arrow
          d="M1386 633C1413 633 1430 655 1457 685"
          frame={frame}
          start={1240}
          color={C.red}
        />
        <path
          d="M1442 680l15 5-2-15"
          fill="none"
          stroke={C.red}
          strokeWidth={3}
          opacity={ramp(frame, 1270, 20)}
        />
        <Pill
          x={980}
          y={748}
          width={323}
          text="KEBIASAAN MEMBUKA APLIKASI"
          frame={frame}
          fps={fps}
          start={1228}
          fill={C.ink}
        />
      </g>

      <g opacity={ramp(frame, 1318, 24)}>
        <path
          d="M1600 701V804H1410"
          fill="none"
          stroke={C.red}
          strokeWidth={2}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - ramp(frame, 1318, 37)}
        />
        <rect x={1309} y={781} width={258} height={39} rx={5} fill={C.yellow} />
        <Words
          text="“Cuma satu notifikasi.”"
          x={1320}
          y={789}
          width={250}
          size={21}
          frame={frame}
          fps={fps}
          start={1322}
          stagger={4}
        />
      </g>
    </g>
  );
};

export const Scene_03: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const scanY = 246 + ((frame * 0.36) % 568);
  const awareness = ramp(frame, 763, 45);
  const warning = ramp(frame, 1001, 45);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width,
        height,
        overflow: "hidden",
        backgroundColor: C.paper,
      }}
    >
      <svg
        viewBox="0 0 1920 1080"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Diagram proses otomatis otak: mengenali wajah, bereaksi, berjalan, dan membuka media sosial."
        style={{ display: "block", fontFamily: FONT }}
      >
        <defs>
          <pattern id="s03-grid" width={40} height={40} patternUnits="userSpaceOnUse">
            <path
              d="M40 0H0V40"
              fill="none"
              stroke={C.ink}
              strokeWidth={0.6}
              opacity={0.055}
            />
          </pattern>
          <pattern id="s03-paper" width={13} height={17} patternUnits="userSpaceOnUse">
            <circle cx={2} cy={4} r={0.65} fill={C.ink} opacity={0.06} />
            <circle cx={9} cy={13} r={0.55} fill={C.ink} opacity={0.04} />
          </pattern>
          <radialGradient id="s03-glow">
            <stop offset="0%" stopColor={C.yellow} stopOpacity={0.13} />
            <stop offset="100%" stopColor={C.yellow} stopOpacity={0} />
          </radialGradient>
          <clipPath id="s03-brain-panel">
            <rect x={90} y={231} width={735} height={615} rx={20} />
          </clipPath>
        </defs>

        {/* Background: quiet paper, drifting warmth, and fine diagram grid. */}
        <g>
          <rect width={1920} height={1080} fill={C.paper} />
          <rect width={1920} height={1080} fill="url(#s03-paper)" />
          <ellipse
            cx={450 + Math.sin(frame * 0.006) * 35}
            cy={440 + Math.cos(frame * 0.008) * 20}
            rx={610}
            ry={465}
            fill="url(#s03-glow)"
          />
          <rect x={65} y={208} width={1790} height={665} fill="url(#s03-grid)" />
        </g>

        {/* Established editorial header — already readable at frame zero. */}
        <g>
          <rect x={91} y={48} width={41} height={29} rx={3} fill={C.yellow} />
          <text
            x={111.5}
            y={69}
            fill={C.ink}
            fontSize={17}
            fontFamily={MONO}
            fontWeight={800}
            textAnchor="middle"
          >
            03
          </text>
          <Label x={150} y={69}>PIKIRAN DI BALIK KEBIASAAN</Label>
          <Label x={1709} y={69} size={14}>03 / 08</Label>

          <Words
            text="Otak di balik autopilot"
            x={88}
            y={100}
            width={1550}
            size={76}
            weight={800}
            frame={frame}
            fps={fps}
            start={-70}
            stagger={3}
          />
          <line x1={92} y1={199} x2={1824} y2={199} stroke={C.ink} strokeWidth={1.5} />
          <rect
            x={92}
            y={198}
            width={interpolate(frame, [0, 1405], [215, 1732], CLAMP)}
            height={3}
            fill={C.yellow}
          />
        </g>

        {/* Persistent foundations: the diagram never disappears between acts. */}
        <g>
          <rect
            x={96}
            y={239}
            width={735}
            height={615}
            rx={20}
            fill={C.ink}
            opacity={0.04}
          />
          <rect
            x={90}
            y={231}
            width={735}
            height={615}
            rx={20}
            fill={C.white}
            stroke={C.line}
            strokeWidth={1.3}
          />
          <rect
            x={930}
            y={231}
            width={858}
            height={615}
            rx={20}
            fill={C.white}
            stroke={C.line}
            strokeWidth={1.3}
          />
          <Label x={123} y={271} size={14}>DIAGRAM KONSEPTUAL / OTAK</Label>
          <circle
            cx={785}
            cy={265}
            r={4.5 + Math.sin(frame * 0.04) * 0.5}
            fill={C.teal}
          />
          <Label x={123} y={805} size={13} spacing={1.4}>PERSEPSI → PENGALAMAN → RESPONS</Label>

          <g clipPath="url(#s03-brain-panel)" opacity={0.11}>
            <line
              x1={103}
              y1={scanY}
              x2={810}
              y2={scanY}
              stroke={C.blue}
              strokeWidth={1}
            />
          </g>
        </g>

        {/* Persistent living neural network. */}
        <Brain frame={frame} fps={fps} />

        {/* The connector gains meaning rather than being replaced. */}
        <g>
          <path
            d="M825 480H928"
            fill="none"
            stroke={C.line}
            strokeWidth={2}
          />
          <path
            d="M825 480H928"
            fill="none"
            stroke={C.teal}
            strokeWidth={3}
            strokeDasharray="5 10"
            strokeDashoffset={-frame * 0.35}
            opacity={0.55}
          />
          <path d="M916 472l12 8-12 8" fill="none" stroke={C.teal} strokeWidth={3} />
          <circle
            cx={872}
            cy={480}
            r={7 + Math.sin(frame * 0.06) * 1.3}
            fill={C.white}
            stroke={C.teal}
            strokeWidth={2}
          />
          <g opacity={warning}>
            <path
              d="M825 480H928"
              fill="none"
              stroke={C.red}
              strokeWidth={3}
              strokeDasharray="5 10"
              strokeDashoffset={-frame * 0.35}
            />
            <path d="M916 472l12 8-12 8" fill="none" stroke={C.red} strokeWidth={3} />
          </g>
        </g>

        {/* Three long, overlapping acts: 0–511, 487–1025, 1001–1406. */}
        <Sequence frame={frame} from={0} durationInFrames={511}>
          <RecognitionAct frame={frame} fps={fps} />
        </Sequence>

        <Sequence frame={frame} from={487} durationInFrames={538}>
          <WalkingAct frame={frame} fps={fps} />
        </Sequence>

        <Sequence
          frame={frame}
          from={1001}
          durationInFrames={405}
          fadeOut={0}
        >
          <PhoneAct frame={frame} fps={fps} />
        </Sequence>

        {/* Small evidence tags build onto the original left-side diagram. */}
        <g>
          <Pill
            x={118}
            y={722}
            width={202}
            text="TANPA DISENGAJA"
            frame={frame}
            fps={fps}
            start={72}
            fill="#EAF0F5"
            color={C.blue}
          />
          <Pill
            x={333}
            y={722}
            width={192}
            text="SEBELUM ALASAN"
            frame={frame}
            fps={fps}
            start={224}
            fill="#F8EAE6"
            color={C.red}
          />
          <Pill
            x={538}
            y={722}
            width={256}
            text="BELAJAR DARI KEBIASAAN"
            frame={frame}
            fps={fps}
            start={781}
            fill="#DFEEE7"
            color={C.teal}
          />

          <g opacity={awareness * (1 - warning)}>
            <path
              d="M151 692C199 680 225 656 264 631"
              fill="none"
              stroke={C.teal}
              strokeWidth={2}
              strokeDasharray="4 7"
              strokeDashoffset={-frame * 0.2}
            />
          </g>
        </g>

        {/* Intentionally no text, caption boxes, or foreground content at Y ≥ 900. */}
      </svg>
    </div>
  );
};