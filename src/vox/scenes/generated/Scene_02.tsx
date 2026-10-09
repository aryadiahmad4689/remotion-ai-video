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
  muted: "#77746E",
  line: "#DAD5CA",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
  white: "#FFFEFA",
};

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const rise = (frame: number, start: number, duration = 24) =>
  interpolate(frame, [start, start + duration], [0, 1], CLAMP);

const presence = (
  frame: number,
  start: number,
  end: number,
  fade = 24,
) =>
  Math.min(
    start === 0 ? 1 : rise(frame, start, fade),
    interpolate(frame, [end - fade, end], [1, 0], CLAMP),
  );

const settle = (frame: number, fps: number, start: number) =>
  spring({
    frame: Math.max(0, frame - start),
    fps,
    config: { damping: 18, mass: 0.7, stiffness: 100 },
  });

/**
 * A self-contained timeline layer. It preserves mounted graphics and
 * crossfades at its boundaries without importing additional Remotion APIs.
 */
const Sequence: React.FC<{
  frame: number;
  from: number;
  durationInFrames: number;
  children: React.ReactNode;
  fade?: number;
  style?: React.CSSProperties;
}> = ({
  frame,
  from,
  durationInFrames,
  children,
  fade = 24,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity: presence(frame, from, from + durationInFrames, fade),
      ...style,
    }}
  >
    {children}
  </div>
);

const Words: React.FC<{
  text: string;
  frame: number;
  fps: number;
  start: number;
  size?: number;
  color?: string;
  initial?: boolean;
  style?: React.CSSProperties;
}> = ({
  text,
  frame,
  fps,
  start,
  size = 34,
  color = C.ink,
  initial = false,
  style,
}) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "0 0.25em",
      color,
      fontSize: size,
      fontWeight: 750,
      lineHeight: 1.2,
      letterSpacing: "-0.035em",
      ...style,
    }}
  >
    {text.split(" ").map((word, index) => {
      const cue = start + index * 3;
      const progress = initial ? 1 : settle(frame, fps, cue);
      return (
        <span
          key={`${index}-${word}`}
          style={{
            display: "inline-block",
            opacity: initial ? 1 : rise(frame, cue, 12),
            transform: `translateY(${(1 - progress) * 15}px)`,
          }}
        >
          {word}
        </span>
      );
    })}
  </div>
);

const Pill: React.FC<{
  children: React.ReactNode;
  color?: string;
  background?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  color = C.ink,
  background = C.yellow,
  style,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 9,
      padding: "10px 16px",
      borderRadius: 30,
      background,
      color,
      fontSize: 16,
      fontWeight: 750,
      letterSpacing: "0.055em",
      ...style,
    }}
  >
    {children}
  </div>
);

const Phone: React.FC<{ frame: number }> = ({ frame }) => {
  const notification = rise(frame, 185, 18);
  const vibration =
    Math.sin((frame - 185) * 0.8) *
    3 *
    presence(frame, 185, 235, 12);

  return (
    <svg
      viewBox="0 0 230 180"
      width="230"
      height="180"
      fill="none"
      style={{ transform: `rotate(${vibration}deg)` }}
    >
      <rect
        x="76"
        y="13"
        width="80"
        height="148"
        rx="17"
        fill={C.ink}
      />
      <rect
        x="82"
        y="20"
        width="68"
        height="132"
        rx="12"
        fill="#E8EDF1"
      />
      <rect x="99" y="24" width="35" height="7" rx="3.5" fill={C.ink} />
      <path
        d="M101 136H130"
        stroke={C.ink}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g
        opacity={notification}
        transform={`translate(${(1 - notification) * 12} 0)`}
      >
        <rect
          x="51"
          y="56"
          width="132"
          height="47"
          rx="10"
          fill={C.yellow}
          stroke={C.ink}
          strokeWidth="2"
        />
        <circle cx="70" cy="79" r="7" fill={C.ink} />
        <path
          d="M87 72H164M87 84H144"
          stroke={C.ink}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="158" cy="20" r="15" fill={C.red} />
        <text
          x="158"
          y="26"
          textAnchor="middle"
          fontSize="18"
          fontWeight="800"
          fill={C.white}
        >
          1
        </text>
      </g>
      {[0, 1].map((i) => (
        <path
          key={i}
          d={`M${38 - i * 13} ${56 - i * 8} Q${22 - i * 13} 80 ${38 - i * 13} ${104 + i * 8}`}
          stroke={C.teal}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={notification * (0.45 + 0.25 * Math.sin(frame * 0.12 + i))}
        />
      ))}
    </svg>
  );
};

const Criticism: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width="250" height="170" viewBox="0 0 250 170" fill="none">
    <circle cx="55" cy="110" r="24" fill="#D8D2C5" />
    <path
      d="M17 164C18 121 93 121 94 164"
      fill="#D8D2C5"
      stroke={C.ink}
      strokeWidth="2.5"
    />
    <circle cx="55" cy="110" r="24" stroke={C.ink} strokeWidth="2.5" />
    <path
      d="M83 24H221V96H123L91 117V96H83Z"
      fill={C.white}
      stroke={C.ink}
      strokeWidth="2.5"
    />
    <path
      d="M105 44H197M105 59H183M105 74H155"
      stroke={C.muted}
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M109 79L180 79"
      stroke={C.yellow}
      strokeWidth="10"
      opacity={rise(frame, 480, 35)}
    />
    <path
      d="M191 108L185 128L200 124L194 148"
      stroke={C.red}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={rise(frame, 460, 22)}
    />
  </svg>
);

const Hand: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const motion = settle(frame, fps, 274);
  return (
    <svg width="260" height="180" viewBox="0 0 260 180" fill="none">
      <rect
        x="151"
        y="14"
        width="62"
        height="110"
        rx="12"
        fill="#E5EAF0"
        stroke={C.ink}
        strokeWidth="3"
      />
      <path d="M169 24H193" stroke={C.ink} strokeWidth="4" />
      <g transform={`translate(${(1 - motion) * -43} ${(1 - motion) * 20})`}>
        <path
          d="M44 169L66 115C70 105 80 97 91 91L122 74C129 70 136 77 132 83L110 102L163 57C169 52 178 60 172 66L143 93L174 72C182 67 190 78 181 84L153 105L183 89C192 84 199 97 190 103L163 119L184 113C195 110 199 123 189 128L145 151L132 173"
          fill="#E5D4B8"
          stroke={C.ink}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M95 111L114 129" stroke="#B59C7C" strokeWidth="2.5" />
      </g>
      <path
        d="M28 62C66 29 99 28 135 37"
        stroke={C.teal}
        strokeWidth="3"
        strokeDasharray="5 7"
        pathLength="1"
        strokeDashoffset={1 - rise(frame, 274, 38)}
      />
      <path d="M125 26L138 37L123 44" stroke={C.teal} strokeWidth="3" />
    </svg>
  );
};

const Emotion: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width="240" height="180" viewBox="0 0 240 180" fill="none">
    <circle
      cx="120"
      cy="90"
      r="59"
      fill="#F5E2D9"
      stroke={C.ink}
      strokeWidth="3"
    />
    <path
      d="M82 73L105 80M157 73L135 80"
      stroke={C.ink}
      strokeWidth="5"
      strokeLinecap="round"
    />
    <circle cx="97" cy="90" r="4" fill={C.ink} />
    <circle cx="143" cy="90" r="4" fill={C.ink} />
    <path
      d="M102 119Q120 108 139 119"
      stroke={C.ink}
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M182 37L174 57L188 54L181 76"
      stroke={C.red}
      strokeWidth="4"
      strokeLinejoin="round"
      opacity={rise(frame, 460, 25)}
    />
    <ellipse
      cx="120"
      cy="91"
      rx="88"
      ry="76"
      stroke={C.red}
      strokeWidth="3"
      pathLength="1"
      strokeDasharray="1"
      strokeDashoffset={1 - rise(frame, 520, 55)}
      transform={`rotate(${-8 + Math.sin(frame * 0.018)} 120 91)`}
    />
  </svg>
);

const Walking: React.FC<{ frame: number }> = ({ frame }) => {
  const phase = (frame - 1383) * 0.105;
  const stride = Math.sin(phase) * 22;
  return (
    <svg width="260" height="180" viewBox="0 0 260 180" fill="none">
      <path
        d="M34 155H224"
        stroke={C.line}
        strokeWidth="2"
        strokeDasharray="4 8"
      />
      <g transform={`translate(0 ${Math.sin(phase * 2) * 2})`}>
        <circle cx="130" cy="32" r="15" fill={C.teal} />
        <path
          d="M130 53L124 96"
          stroke={C.ink}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={`M127 62L${102 - stride * 0.4} 91L${89 - stride * 0.65} 85M127 62L${153 + stride * 0.4} 88L${167 + stride * 0.65} 76`}
          stroke={C.ink}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M124 96L${108 + stride} 121L${99 + stride * 1.5} 151M124 96L${146 - stride} 122L${162 - stride * 1.5} 151`}
          stroke={C.ink}
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {[0, 1, 2].map((i) => (
        <ellipse
          key={i}
          cx={47 + i * 56}
          cy="164"
          rx="10"
          ry="3"
          fill={C.teal}
          opacity={0.15 + 0.2 * ((Math.sin(phase - i) + 1) / 2)}
        />
      ))}
    </svg>
  );
};

const Brain: React.FC<{ frame: number }> = ({ frame }) => {
  const automatic = rise(frame, 1174, 45);
  const nodes = [
    [122, 124],
    [167, 81],
    [217, 113],
    [256, 72],
    [293, 126],
    [318, 177],
    [264, 208],
    [210, 176],
    [163, 213],
    [108, 183],
  ];
  const connections = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 0],
    [0, 7],
    [2, 7],
    [4, 7],
    [1, 8],
  ];

  return (
    <svg width="390" height="300" viewBox="0 0 420 310" fill="none">
      <defs>
        <clipPath id="scene02-brain-clip">
          <path d="M88 196C58 177 62 139 87 121C80 87 110 61 143 64C158 29 197 26 220 48C250 24 292 43 298 73C336 69 366 99 357 134C387 164 371 204 340 212C326 246 293 257 263 247C240 271 201 265 189 245C145 264 108 240 106 220C97 219 90 207 88 196Z" />
        </clipPath>
      </defs>

      <circle
        cx="214"
        cy="151"
        r="138"
        stroke={C.line}
        strokeWidth="1"
        strokeDasharray="3 8"
      />
      <g transform={`rotate(${frame * 0.095} 214 151)`}>
        <path
          d="M214 10A141 141 0 0 1 340 88"
          stroke={C.teal}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />
        <circle cx="214" cy="10" r="4" fill={C.teal} />
      </g>

      <path
        d="M88 196C58 177 62 139 87 121C80 87 110 61 143 64C158 29 197 26 220 48C250 24 292 43 298 73C336 69 366 99 357 134C387 164 371 204 340 212C326 246 293 257 263 247C240 271 201 265 189 245C145 264 108 240 106 220C97 219 90 207 88 196Z"
        fill="#E6E4DB"
        stroke={C.ink}
        strokeWidth="3"
      />

      <g clipPath="url(#scene02-brain-clip)">
        <path
          d="M74 166C110 126 128 156 160 137C192 118 190 80 230 87C269 92 285 129 335 112L385 192L298 265L173 267Z"
          fill={C.teal}
          opacity={0.07 + automatic * 0.13}
        />
        <path
          d="M103 115C141 110 121 78 159 83M115 196C133 172 156 192 154 154C151 130 180 139 186 119M161 223C186 204 179 178 203 167M216 54C198 89 224 106 213 135C204 154 238 174 226 210L234 247M252 62C250 94 283 94 274 126C267 148 306 144 301 169M332 111C303 122 329 147 347 157M274 224C268 196 295 190 323 207M96 155C116 147 110 172 127 176"
          stroke="#ABA89F"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {connections.map(([a, b], i) => (
          <path
            key={i}
            d={`M${nodes[a][0]} ${nodes[a][1]}L${nodes[b][0]} ${nodes[b][1]}`}
            stroke={C.teal}
            strokeWidth={automatic > 0.5 ? 2 : 1.5}
            opacity={0.18 + 0.12 * Math.sin(frame * 0.028 + i)}
          />
        ))}
        {nodes.map(([x, y], i) => {
          const pulse = (Math.sin(frame * 0.07 - i * 0.7) + 1) / 2;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={7 + pulse * 6}
                fill={C.teal}
                opacity={0.04 + pulse * 0.1}
              />
              <circle
                cx={x}
                cy={y}
                r={3 + pulse * 1.5}
                fill={i % 3 === 0 ? C.blue : C.teal}
                opacity={0.5 + pulse * 0.5}
              />
            </g>
          );
        })}
        <rect
          x={60 + ((frame * 0.65) % 330)}
          y="35"
          width="12"
          height="235"
          fill={C.white}
          opacity="0.15"
        />
      </g>
      <path
        d="M238 249L246 280L267 281"
        stroke={C.ink}
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const Scene_02: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);

  const phoneOpacity = presence(frame, 185, 476, 30);
  const criticismOpacity = presence(frame, 440, 1000, 36);
  const handOpacity = presence(frame, 274, 476, 30);
  const abstractOpacity = rise(frame, 952, 36);
  const walkingOpacity = rise(frame, 1383, 24);
  const neuralLabelOpacity = rise(frame, 1050, 28);
  const firstFlow = rise(frame, 185, 40);
  const reactionFlow = rise(frame, 274, 45);
  const thought = rise(frame, 691, 45);
  const automatic = rise(frame, 1174, 40);
  const float = Math.sin(frame * 0.025) * 2.5;

  const panelStyle: React.CSSProperties = {
    position: "absolute",
    top: 371,
    width: 315,
    height: 300,
    border: `1px solid ${C.line}`,
    borderRadius: 18,
    background: C.white,
    boxShadow: "0 8px 22px rgba(24,24,27,0.035)",
    overflow: "hidden",
  };

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
        }}
      >
        <Sequence frame={frame} from={0} durationInFrames={1500} fade={20}>
          <svg
            width="1920"
            height="1080"
            viewBox="0 0 1920 1080"
            style={{ position: "absolute", inset: 0 }}
          >
            <defs>
              <pattern
                id="scene02-paper-dots"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="0.65" fill="#A9A291" opacity="0.23" />
              </pattern>
              <radialGradient id="scene02-warm-glow">
                <stop offset="0%" stopColor={C.yellow} stopOpacity="0.13" />
                <stop offset="100%" stopColor={C.yellow} stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1920" height="1080" fill="url(#scene02-paper-dots)" />
            <ellipse
              cx={1150 + Math.sin(frame * 0.008) * 45}
              cy="460"
              rx="730"
              ry="470"
              fill="url(#scene02-warm-glow)"
            />
            <path d="M96 114H1824" stroke={C.ink} strokeWidth="1" />
            <path d="M96 876H1824" stroke={C.line} strokeWidth="1" />
          </svg>
        </Sequence>

        <Sequence frame={frame} from={0} durationInFrames={1500}>
          <div
            style={{
              position: "absolute",
              top: 64,
              left: 96,
              display: "flex",
              alignItems: "center",
              gap: 15,
              fontSize: 17,
              fontWeight: 750,
              letterSpacing: "0.12em",
            }}
          >
            <span
              style={{
                width: 29,
                height: 29,
                display: "grid",
                placeItems: "center",
                background: C.yellow,
                letterSpacing: 0,
              }}
            >
              02
            </span>
            DI BALIK REAKSI KITA
          </div>
          <div
            style={{
              position: "absolute",
              right: 96,
              top: 71,
              color: C.muted,
              fontSize: 15,
              letterSpacing: "0.12em",
            }}
          >
            OTAK & PERILAKU / 02—08
          </div>

          <Words
            text="Bereaksi dulu."
            frame={frame}
            fps={fps}
            start={0}
            initial
            size={73}
            style={{ position: "absolute", left: 96, top: 151 }}
          />
          <div style={{ position: "absolute", left: 610, top: 151 }}>
            <div
              style={{
                position: "absolute",
                left: -6,
                top: 47,
                height: 28,
                width: 623 * rise(frame, 36, 55),
                background: C.yellow,
                transform: "rotate(-1deg)",
              }}
            />
            <Words
              text="Berpikir kemudian?"
              frame={frame}
              fps={fps}
              start={18}
              size={73}
              style={{ position: "relative" }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 99,
              top: 245,
              fontSize: 23,
              color: C.muted,
            }}
          >
            Sebuah peta sederhana tentang respons yang mendahului pertimbangan.
          </div>

          <div
            style={{
              position: "absolute",
              left: 96,
              top: 306,
              width: 1728,
              height: 416,
              borderRadius: 24,
              border: `1px solid ${C.line}`,
              background: "rgba(255,254,250,0.65)",
              boxShadow: "0 12px 40px rgba(24,24,27,0.025)",
            }}
          />

          <div style={{ ...panelStyle, left: 166 }}>
            <div
              style={{
                margin: "20px 24px",
                fontSize: 14,
                fontWeight: 800,
                color: C.muted,
                letterSpacing: "0.13em",
              }}
            >
              01 / PEMICU
            </div>
            <div
              style={{
                position: "absolute",
                left: 43,
                top: 59,
                opacity: 1 - rise(frame, 185, 24),
                transform: `translateY(${float}px)`,
              }}
            >
              <svg width="230" height="170" viewBox="0 0 230 170" fill="none">
                <circle cx="115" cy="86" r="52" stroke={C.line} strokeWidth="2" />
                <circle cx="115" cy="86" r="31" stroke={C.teal} strokeWidth="2" />
                <circle cx="115" cy="86" r="9" fill={C.teal} />
                <path
                  d="M115 20V38M115 135V152M48 86H65M165 86H182"
                  stroke={C.ink}
                  strokeWidth="2"
                />
                <g transform={`rotate(${frame * 0.5} 115 86)`}>
                  <path d="M115 86L151 50" stroke={C.teal} strokeWidth="2" />
                </g>
              </svg>
            </div>
            <div
              style={{
                position: "absolute",
                left: 43,
                top: 51,
                opacity: phoneOpacity,
                transform: `translateY(${float}px)`,
              }}
            >
              <Phone frame={frame} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 31,
                top: 57,
                opacity: criticismOpacity,
                transform: `translateY(${float}px)`,
              }}
            >
              <Criticism frame={frame} />
            </div>
            <div
              style={{
                position: "absolute",
                inset: "68px 38px auto",
                height: 160,
                opacity: abstractOpacity,
                background: C.white,
              }}
            >
              <svg width="240" height="160" viewBox="0 0 240 160" fill="none">
                {[0, 1, 2].map((i) => (
                  <g key={i} transform={`translate(0 ${Math.sin(frame * 0.025 + i) * 3})`}>
                    <circle cx="42" cy={35 + i * 45} r="10" fill={i === 1 ? C.blue : C.teal} />
                    <path
                      d={`M65 ${35 + i * 45}H149Q174 ${35 + i * 45} 196 80`}
                      stroke={C.line}
                      strokeWidth="2"
                    />
                  </g>
                ))}
                <circle cx="199" cy="80" r="15" fill={C.yellow} stroke={C.ink} strokeWidth="2" />
              </svg>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 24,
                width: "100%",
                textAlign: "center",
                fontSize: 24,
                fontWeight: 750,
              }}
            >
              <span style={{ opacity: 1 - rise(frame, 185, 24) }}>Sinal dari sekitar</span>
              <span style={{ position: "absolute", inset: 0, opacity: phoneOpacity }}>HP berbunyi</span>
              <span style={{ position: "absolute", inset: 0, opacity: criticismOpacity }}>Mendengar kritik</span>
              <span style={{ position: "absolute", inset: 0, opacity: abstractOpacity }}>Masukan & kebutuhan</span>
            </div>
          </div>

          <svg
            width="1920"
            height="900"
            viewBox="0 0 1920 900"
            style={{ position: "absolute", inset: 0 }}
          >
            <defs>
              <marker
                id="scene02-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <path d="M0 0L7 4L0 8" fill="none" stroke={C.teal} strokeWidth="1.6" />
              </marker>
            </defs>
            <path d="M508 505H739" stroke={C.line} strokeWidth="2" />
            <path d="M1174 505H1407" stroke={C.line} strokeWidth="2" />
            <path
              d="M508 505H739"
              stroke={C.teal}
              strokeWidth="3"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - firstFlow}
              markerEnd="url(#scene02-arrow)"
              opacity={firstFlow}
            />
            <path
              d="M1174 505H1407"
              stroke={C.teal}
              strokeWidth="3"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - reactionFlow}
              markerEnd="url(#scene02-arrow)"
              opacity={reactionFlow}
            />
            {[0, 1].map((i) => {
              const phase = ((frame * 0.009 + i * 0.5) % 1);
              return (
                <g key={i} opacity={firstFlow * 0.7}>
                  <circle cx={516 + phase * 206} cy="505" r="4" fill={C.teal} />
                  <circle cx={1182 + phase * 206} cy="505" r="4" fill={C.teal} opacity={reactionFlow} />
                </g>
              );
            })}
            <path
              d="M968 618V655Q968 684 1030 684H1234"
              stroke={C.blue}
              strokeWidth="2"
              strokeDasharray="5 7"
              opacity={thought * (1 - automatic * 0.45)}
            />
          </svg>

          <div
            style={{
              position: "absolute",
              left: 752,
              top: 366 + float,
              width: 410,
              height: 300,
            }}
          >
            <Brain frame={frame} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 790,
              top: 330,
              width: 340,
              textAlign: "center",
              fontWeight: 800,
              fontSize: 15,
              color: C.teal,
              letterSpacing: "0.12em",
            }}
          >
            <span style={{ opacity: 1 - neuralLabelOpacity }}>PEMROSESAN</span>
            <span style={{ position: "absolute", inset: 0, opacity: neuralLabelOpacity }}>
              OTAK MANUSIA
            </span>
          </div>

          <div style={{ ...panelStyle, left: 1438 }}>
            <div
              style={{
                margin: "20px 24px",
                fontSize: 14,
                fontWeight: 800,
                color: C.muted,
                letterSpacing: "0.13em",
              }}
            >
              02 / RESPONS
            </div>
            <div
              style={{
                position: "absolute",
                left: 37,
                top: 62,
                opacity: 1 - rise(frame, 274, 24),
              }}
            >
              <svg width="240" height="170" viewBox="0 0 240 170" fill="none">
                <path d="M47 90H191" stroke={C.line} strokeWidth="2" />
                <path
                  d="M55 91L94 91L112 53L132 118L151 91H189"
                  stroke={C.teal}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="112"
                  cy="53"
                  r={6 + Math.sin(frame * 0.06) * 1.5}
                  fill={C.yellow}
                  stroke={C.ink}
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div style={{ position: "absolute", left: 27, top: 57, opacity: handOpacity }}>
              <Hand frame={frame} fps={fps} />
            </div>
            <div style={{ position: "absolute", left: 37, top: 52, opacity: criticismOpacity }}>
              <Emotion frame={frame} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 27,
                top: 55,
                opacity: abstractOpacity * (1 - walkingOpacity),
                background: C.white,
              }}
            >
              <svg width="260" height="180" viewBox="0 0 260 180" fill="none">
                <circle cx="130" cy="86" r="52" stroke={C.teal} strokeWidth="3" />
                <g transform={`rotate(${frame * 0.25} 130 86)`}>
                  <path d="M130 21A65 65 0 0 1 193 69" stroke={C.teal} strokeWidth="3" />
                  <path d="M184 58L194 71L201 56" stroke={C.teal} strokeWidth="3" />
                  <path d="M130 151A65 65 0 0 1 67 103" stroke={C.teal} strokeWidth="3" />
                  <path d="M76 115L66 101L59 117" stroke={C.teal} strokeWidth="3" />
                </g>
                <path d="M110 87L124 101L151 73" stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ position: "absolute", left: 27, top: 57, opacity: walkingOpacity, background: C.white }}>
              <Walking frame={frame} />
            </div>
            <div style={{ position: "absolute", bottom: 24, width: "100%", textAlign: "center", fontSize: 24, fontWeight: 750 }}>
              <span style={{ opacity: 1 - rise(frame, 274, 24) }}>Reaksi cepat</span>
              <span style={{ position: "absolute", inset: 0, opacity: handOpacity }}>Tangan bergerak</span>
              <span style={{ position: "absolute", inset: 0, opacity: criticismOpacity }}>Merasa tersinggung</span>
              <span style={{ position: "absolute", inset: 0, opacity: abstractOpacity * (1 - walkingOpacity) }}>Respons otomatis</span>
              <span style={{ position: "absolute", inset: 0, opacity: walkingOpacity }}>Berjalan</span>
            </div>
          </div>

          <div style={{ position: "absolute", left: 553, top: 463, fontSize: 16, color: C.teal, opacity: firstFlow }}>
            sinyal masuk
          </div>
          <div style={{ position: "absolute", left: 1212, top: 463, fontSize: 16, color: C.teal, opacity: reactionFlow }}>
            respons muncul
          </div>
          <div
            style={{
              position: "absolute",
              left: 1252,
              top: 671,
              fontSize: 17,
              color: C.blue,
              opacity: thought,
            }}
          >
            pertimbangan sadar
          </div>
          <div
            style={{
              position: "absolute",
              right: 120,
              top: 697,
              fontSize: 11,
              color: C.muted,
              letterSpacing: "0.09em",
            }}
          >
            DIAGRAM KONSEPTUAL · BUKAN URUTAN WAKTU TERUKUR
          </div>
        </Sequence>

        {/* Three long-form editorial acts; the core diagram never disappears. */}
        <Sequence frame={frame} from={0} durationInFrames={490} fade={40}>
          <div style={{ position: "absolute", left: 111, top: 763 }}>
            <Pill background="#E4ECE6" color={C.teal}>PENGAMATAN 01</Pill>
          </div>
          <div style={{ position: "absolute", left: 342, top: 763 }}>
            <Words
              text="Respons bisa muncul sebelum kita sempat menilai."
              frame={frame}
              fps={fps}
              start={55}
              size={31}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 343,
              top: 822,
              fontSize: 21,
              color: C.muted,
              opacity: rise(frame, 274, 28),
            }}
          >
            Notifikasinya penting? Tangan sudah bergerak lebih dulu.
          </div>
        </Sequence>

        <Sequence frame={frame} from={440} durationInFrames={560} fade={40}>
          <div style={{ position: "absolute", left: 111, top: 763 }}>
            <Pill background="#F3DFDA" color={C.red}>PENGAMATAN 02</Pill>
          </div>
          <div style={{ position: "absolute", left: 342, top: 764 }}>
            <Words
              text="Perasaan juga bisa mendahului pemahaman."
              frame={frame}
              fps={fps}
              start={455}
              size={31}
            />
          </div>
          <div style={{ position: "absolute", left: 342, top: 819, opacity: rise(frame, 691, 25) }}>
            <div
              style={{
                position: "absolute",
                left: -5,
                top: 13,
                width: 775 * rise(frame, 691, 55),
                height: 18,
                background: C.yellow,
                transform: "rotate(-0.6deg)",
              }}
            />
            <Words
              text="Seolah keputusan datang sebelum pertimbangan."
              frame={frame}
              fps={fps}
              start={691}
              size={25}
              style={{ position: "relative" }}
            />
          </div>
          <svg
            width="1920"
            height="900"
            viewBox="0 0 1920 900"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <path
              d="M1230 655C1337 626 1445 647 1438 685C1432 722 1279 725 1239 701C1199 677 1230 653 1270 649"
              fill="none"
              stroke={C.red}
              strokeWidth="3"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - rise(frame, 730, 55)}
              opacity={rise(frame, 730, 15)}
            />
          </svg>
        </Sequence>

        <Sequence frame={frame} from={952} durationInFrames={548} fade={32}>
          <div style={{ position: "absolute", left: 111, top: 763 }}>
            <Pill background={C.yellow}>PERTANYAAN KUNCI</Pill>
          </div>
          <div
            style={{
              position: "absolute",
              left: 370,
              top: 763,
              opacity: 1 - rise(frame, 1174, 30),
            }}
          >
            <Words
              text="Siapa yang mengendalikan respons ini?"
              frame={frame}
              fps={fps}
              start={952}
              size={33}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 370,
              top: 818,
              color: C.muted,
              opacity: rise(frame, 1050, 24) * (1 - rise(frame, 1174, 30)),
            }}
          >
            <Words
              text="Mulai dari cara otak bekerja."
              frame={frame}
              fps={fps}
              start={1050}
              size={23}
              color={C.muted}
            />
          </div>

          <div style={{ position: "absolute", left: 370, top: 763, opacity: automatic }}>
            <div
              style={{
                position: "absolute",
                left: -6,
                top: 22,
                width: 911 * rise(frame, 1174, 65),
                height: 23,
                background: C.yellow,
                transform: "rotate(-0.5deg)",
              }}
            />
            <Words
              text="Otak tidak selalu menunggu perintah sadar."
              frame={frame}
              fps={fps}
              start={1174}
              size={35}
              style={{ position: "relative" }}
            />
          </div>
          <div style={{ position: "absolute", left: 371, top: 820, opacity: rise(frame, 1298, 24) }}>
            <Words
              text="Banyak proses berlangsung otomatis."
              frame={frame}
              fps={fps}
              start={1298}
              size={24}
              color={C.teal}
            />
          </div>
          <div
            style={{
              position: "absolute",
              right: 112,
              top: 812,
              opacity: walkingOpacity,
              transform: `translateY(${(1 - settle(frame, fps, 1383)) * 12}px)`,
            }}
          >
            <Pill background="#E4ECE6" color={C.teal}>
              CONTOH / BERJALAN
            </Pill>
          </div>
        </Sequence>

        <Sequence frame={frame} from={0} durationInFrames={1500}>
          <div
            style={{
              position: "absolute",
              right: 128,
              top: 184,
              transform: `rotate(-3deg) translateY(${Math.sin(frame * 0.019) * 2}px)`,
              padding: "12px 17px",
              border: `1px solid ${C.line}`,
              background: C.white,
              fontSize: 13,
              fontWeight: 750,
              letterSpacing: "0.08em",
              color: C.muted,
            }}
          >
            CATATAN PERILAKU
          </div>
        </Sequence>
      </div>
    </div>
  );
};