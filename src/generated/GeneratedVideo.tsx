import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const VIDEO_CONFIG = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 300,
} as const;

const C = {
  bg: "#07090E",
  panel: "#0B1019",
  green: "#14F195",
  purple: "#9945FF",
  cyan: "#00F0FF",
  red: "#FF557E",
  white: "#F0F5FF",
  muted: "#79899F",
  line: "#203043",
};

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';
const SANS = 'Inter, "Arial", sans-serif';

const reveal = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 16, mass: 0.6, stiffness: 110 },
  });

const polar = (cx: number, cy: number, r: number, degrees: number) => {
  const angle = (degrees * Math.PI) / 180;
  return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
};

const wedge = (cx: number, cy: number, r: number, a: number, b: number) => {
  const p = polar(cx, cy, r, a);
  const q = polar(cx, cy, r, b);
  return `M ${cx} ${cy} L ${p.x} ${p.y} A ${r} ${r} 0 ${
    b - a > 180 ? 1 : 0
  } 1 ${q.x} ${q.y} Z`;
};

const SolanaMark: React.FC<{ size?: number }> = ({ size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M11 7H43L36 14H4L11 7Z" fill={C.green} />
    <path d="M4 20H36L43 27H11L4 20Z" fill={C.cyan} />
    <path d="M11 33H43L36 40H4L11 33Z" fill={C.purple} />
  </svg>
);

const KineticText: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, stagger = 1.4, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let characterIndex = 0;
  return (
    <span style={{ display: "inline-block", whiteSpace: "nowrap", ...style }}>
      {text.split(" ").map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} style={{ display: "inline-block" }}>
          {Array.from(word).map((character, index) => {
            const at = characterIndex++;
            const progress = reveal(frame, fps, delay + at * stagger);
            return (
              <span
                key={index}
                style={{
                  display: "inline-block",
                  opacity: interpolate(progress, [0, 1], [0, 1], CLAMP),
                  transform: `translateY(${(1 - progress) * 28}px)`,
                  filter: `blur(${Math.max(0, 1 - progress) * 6}px)`,
                }}
              >
                {character}
              </span>
            );
          })}
          {wordIndex < text.split(" ").length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(ellipse at ${22 + Math.sin(seconds * 0.5) * 5}% 48%, #9945FF15, transparent 52%),
            radial-gradient(ellipse at 85% ${40 + Math.cos(seconds * 0.4) * 8}%, #00F0FF10, transparent 44%)
          `,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -90,
          backgroundImage:
            "linear-gradient(#23304A24 1px, transparent 1px), linear-gradient(90deg, #23304A24 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          transform: `translate(${seconds * 2}px, ${seconds * 3}px)`,
          maskImage: "linear-gradient(black, transparent 95%)",
        }}
      />
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        <path
          d="M0 860 H40 L70 830 V200 L110 160 H400"
          fill="none"
          stroke={C.purple}
          strokeOpacity={0.25}
          strokeWidth={1}
        />
        <path
          d="M1920 230 H1880 L1855 255 V920 L1805 970 H1570"
          fill="none"
          stroke={C.cyan}
          strokeOpacity={0.24}
          strokeWidth={1}
        />
        {Array.from({ length: 32 }, (_, index) => {
          const x = (index * 293 + 61) % 1920;
          const y =
            ((index * 167 + frame * (0.15 + (index % 4) * 0.07)) % 1080);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={index % 5 === 0 ? 2 : 1}
              fill={index % 2 ? C.cyan : C.purple}
              opacity={0.15 + Math.sin(seconds + index) * 0.1}
            />
          );
        })}
      </svg>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, #00000012 4px)",
        }}
      />
    </AbsoluteFill>
  );
};

const FloatingSignals: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: 1370 + index * 160,
            top: 135 + Math.sin(seconds * 0.8 + index) * 11,
            width: 44,
            height: 44,
            border: `1px solid ${index % 2 ? C.purple : C.cyan}22`,
            transform: `rotate(${45 + Math.sin(seconds + index) * 12}deg)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Header: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = reveal(frame, fps);

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 38,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: progress,
        transform: `translateY(${(1 - progress) * -15}px)`,
        borderBottom: `1px solid ${C.line}`,
        paddingBottom: 22,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        <SolanaMark />
        <span
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 4,
            color: C.white,
          }}
        >
          SOLANA
        </span>
        <span style={{ color: C.muted, fontSize: 22 }}>/</span>
        <span style={{ fontFamily: MONO, color: C.muted, fontSize: 15 }}>
          QUANTUM TERMINAL
        </span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 34,
          alignItems: "center",
          fontFamily: MONO,
          fontSize: 14,
        }}
      >
        <span style={{ color: C.muted }}>MAINNET-BETA</span>
        <span style={{ color: C.green }}>
          <span
            style={{
              display: "inline-block",
              width: 7,
              height: 7,
              marginRight: 11,
              borderRadius: "50%",
              background: C.green,
              boxShadow: `0 0 ${9 + Math.sin(frame / 8) * 4}px ${C.green}`,
            }}
          />
          NETWORK ONLINE
        </span>
        <span
          style={{
            color: C.cyan,
            border: `1px solid ${C.cyan}45`,
            padding: "8px 13px",
            background: `${C.cyan}08`,
          }}
        >
          LIVE FEED
        </span>
      </div>
    </div>
  );
};

const CandlestickChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = reveal(frame, fps, 7);
  const time = frame / fps;
  const plot = { x: 40, y: 30, width: 1005, height: 318 };
  const priceY = (price: number) =>
    plot.y + plot.height - ((price - 140) / 17) * plot.height;

  const candles = Array.from({ length: 38 }, (_, index) => {
    const base =
      143.4 +
      index * 0.225 +
      Math.sin(index * 0.51) * 1.95 +
      Math.cos(index * 1.17) * 0.42;
    const motion =
      Math.sin(time * 1.5 + index * 0.38) *
      (index > 30 ? 0.5 : 0.19);
    const open = base + Math.sin(index * 2.37) * 0.62 + motion;
    const close =
      base + Math.cos(index * 1.7) * 0.72 + motion +
      (index === 37 ? Math.sin(time * 3.2) * 0.48 : 0);
    return {
      open,
      close,
      high: Math.max(open, close) + 0.36 + (index % 4) * 0.12,
      low: Math.min(open, close) - 0.32 - (index % 3) * 0.16,
      x: plot.x + 12 + index * 25.9,
    };
  });

  const last = candles[candles.length - 1];
  const liveY = priceY(last.close);
  const linePath = candles
    .map((candle, index) => `${index === 0 ? "M" : "L"} ${candle.x} ${priceY(candle.close)}`)
    .join(" ");
  const areaPath = `${linePath} L ${last.x} ${plot.y + plot.height} L ${candles[0].x} ${plot.y + plot.height} Z`;
  const lineReveal = interpolate(frame, [12, 88], [0, 1], CLAMP);

  return (
    <div
      style={{
        width: 1190,
        height: 565,
        position: "relative",
        background: "linear-gradient(145deg, #101824ED, #090E17F5)",
        border: `1px solid ${C.line}`,
        overflow: "hidden",
        opacity: interpolate(progress, [0, 1], [0, 1], CLAMP),
        transform: `translateY(${(1 - progress) * 35}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 180,
          height: 2,
          background: `linear-gradient(90deg, ${C.green}, transparent)`,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "26px 32px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <SolanaMark size={34} />
          <span style={{ fontSize: 26, fontWeight: 800 }}>SOL</span>
          <span style={{ color: C.muted, fontSize: 20 }}>/ USDC</span>
          <span
            style={{
              color: C.green,
              background: `${C.green}12`,
              fontSize: 11,
              padding: "5px 9px",
              fontFamily: MONO,
              letterSpacing: 1,
            }}
          >
            SPOT
          </span>
        </div>
        <div style={{ display: "flex", gap: 24, fontFamily: MONO, fontSize: 13 }}>
          {["1m", "5m", "15m", "1h", "1d"].map((label) => (
            <span
              key={label}
              style={{
                color: label === "5m" ? C.cyan : C.muted,
                borderBottom: label === "5m" ? `2px solid ${C.cyan}` : "none",
                paddingBottom: 7,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          margin: "16px 32px 0",
          display: "flex",
          alignItems: "baseline",
          gap: 19,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 43,
            fontWeight: 700,
            letterSpacing: -2,
            color: C.white,
          }}
        >
          ${last.close.toFixed(2)}
        </span>
        <span style={{ color: C.green, fontFamily: MONO, fontSize: 16 }}>
          ↗ +{(((last.close - 141.2) / 141.2) * 100).toFixed(2)}%
        </span>
        <span style={{ fontFamily: MONO, color: C.muted, fontSize: 12 }}>
          24H CHANGE
        </span>
      </div>

      <svg
        width="1190"
        height="395"
        viewBox="0 0 1190 395"
        style={{ position: "absolute", left: 0, top: 143 }}
      >
        <defs>
          <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.green} stopOpacity="0.12" />
            <stop offset="100%" stopColor={C.green} stopOpacity="0" />
          </linearGradient>
          <clipPath id="chart-reveal">
            <rect x={plot.x} y="0" width={plot.width * lineReveal} height="360" />
          </clipPath>
          <filter id="chart-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {[140, 144, 148, 152, 156].map((price) => (
          <g key={price}>
            <line
              x1={plot.x}
              x2={plot.x + plot.width}
              y1={priceY(price)}
              y2={priceY(price)}
              stroke={C.line}
              strokeOpacity="0.6"
              strokeDasharray="3 6"
            />
            <text
              x="1070"
              y={priceY(price) + 4}
              fill={C.muted}
              fontFamily={MONO}
              fontSize="12"
            >
              {price.toFixed(2)}
            </text>
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <g key={index}>
            <line
              x1={plot.x + index * 195}
              x2={plot.x + index * 195}
              y1={plot.y}
              y2={plot.y + plot.height}
              stroke={C.line}
              strokeOpacity="0.45"
            />
            <text
              x={plot.x + index * 195}
              y="378"
              fill={C.muted}
              fontFamily={MONO}
              fontSize="11"
            >
              {`${14 + Math.floor(index / 3)}:${String((index % 3) * 20).padStart(2, "0")}`}
            </text>
          </g>
        ))}

        <g clipPath="url(#chart-reveal)">
          <path d={areaPath} fill="url(#chart-area)" />
          <path
            d={linePath}
            fill="none"
            stroke={C.green}
            strokeWidth="1"
            strokeOpacity="0.23"
          />
        </g>

        {candles.map((candle, index) => {
          const growth = reveal(frame, fps, 12 + index * 1.6);
          const color = candle.close >= candle.open ? C.green : C.red;
          const center = (priceY(candle.open) + priceY(candle.close)) / 2;
          const height = Math.max(3, Math.abs(priceY(candle.open) - priceY(candle.close)));

          return (
            <g
              key={index}
              opacity={interpolate(growth, [0, 1], [0, 1], CLAMP)}
              transform={`translate(${candle.x}, ${center}) scale(1, ${growth})`}
            >
              <line
                x1="0"
                x2="0"
                y1={priceY(candle.high) - center}
                y2={priceY(candle.low) - center}
                stroke={color}
                strokeWidth="1.5"
              />
              <rect
                x="-6.5"
                y={-height / 2}
                width="13"
                height={height}
                rx="1"
                fill={color}
              />
              <rect
                x="-7"
                y={plot.y + plot.height - center - 12 - (index % 7) * 3}
                width="14"
                height={12 + (index % 7) * 3}
                fill={color}
                opacity="0.12"
              />
            </g>
          );
        })}

        <g opacity={interpolate(frame, [72, 95], [0, 1], CLAMP)}>
          <line
            x1={plot.x}
            x2="1050"
            y1={liveY}
            y2={liveY}
            stroke={C.green}
            strokeWidth="1"
            strokeDasharray="5 6"
            opacity="0.6"
          />
          <circle cx={last.x} cy={liveY} r="8" fill={C.green} filter="url(#chart-glow)" />
          <circle cx={last.x} cy={liveY} r="3" fill={C.white} />
          <rect x="1056" y={liveY - 15} width="105" height="30" rx="3" fill={C.green} />
          <text
            x="1108"
            y={liveY + 5}
            textAnchor="middle"
            fill={C.bg}
            fontFamily={MONO}
            fontSize="14"
            fontWeight="700"
          >
            {last.close.toFixed(2)}
          </text>
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 35,
          borderTop: `1px solid ${C.line}`,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: 1,
          color: C.muted,
        }}
      >
        <span>ORDER FLOW VISUALIZATION</span>
        <span style={{ color: C.green }}>● STREAM SYNCHRONIZED</span>
      </div>
    </div>
  );
};

const Radar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = reveal(frame, fps, 20);
  const angle = (frame / fps) * 92;
  const center = 190;
  const radius = 145;
  const targets = [
    { angle: 31, radius: 100, label: "01" },
    { angle: 115, radius: 73, label: "02" },
    { angle: 211, radius: 122, label: "03" },
    { angle: 292, radius: 89, label: "04" },
    { angle: 338, radius: 49, label: "05" },
  ];

  return (
    <div
      style={{
        width: 550,
        height: 565,
        border: `1px solid ${C.line}`,
        background: "linear-gradient(155deg, #101925E8, #090E16F5)",
        position: "relative",
        overflow: "hidden",
        opacity: interpolate(progress, [0, 1], [0, 1], CLAMP),
        transform: `translateY(${(1 - progress) * 35}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 180,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${C.cyan})`,
        }}
      />
      <div
        style={{
          padding: "28px 28px 0",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontSize: 14,
        }}
      >
        <span style={{ color: C.white, letterSpacing: 2 }}>LIQUIDITY RADAR</span>
        <span style={{ color: C.cyan, fontSize: 11 }}>SCANNING_</span>
      </div>

      <svg
        width="390"
        height="390"
        viewBox="0 0 380 380"
        style={{ position: "absolute", left: 80, top: 63 }}
      >
        <defs>
          <radialGradient id="radar-base">
            <stop offset="0%" stopColor={C.cyan} stopOpacity="0.09" />
            <stop offset="100%" stopColor={C.cyan} stopOpacity="0.015" />
          </radialGradient>
          <filter id="radar-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <circle cx={center} cy={center} r={radius} fill="url(#radar-base)" />
        {[36, 72, 109, 145].map((r) => (
          <circle
            key={r}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={C.cyan}
            strokeOpacity={r === radius ? 0.4 : 0.16}
            strokeWidth="1"
          />
        ))}
        {[0, 45, 90, 135].map((a) => {
          const p = polar(center, center, radius, a);
          const q = polar(center, center, radius, a + 180);
          return (
            <line
              key={a}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke={C.cyan}
              strokeOpacity="0.13"
            />
          );
        })}
        {Array.from({ length: 72 }, (_, index) => {
          const p = polar(center, center, 157, index * 5);
          const q = polar(center, center, index % 3 === 0 ? 165 : 160, index * 5);
          return (
            <line
              key={index}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke={C.cyan}
              strokeOpacity={index % 3 === 0 ? 0.55 : 0.25}
            />
          );
        })}

        <g transform={`rotate(${angle} ${center} ${center})`}>
          {Array.from({ length: 30 }, (_, index) => (
            <path
              key={index}
              d={wedge(center, center, radius, -60 + index * 2, -58 + index * 2)}
              fill={C.cyan}
              opacity={0.006 + (index / 29) * 0.1}
            />
          ))}
          <line
            x1={center}
            y1={center}
            x2={center + radius}
            y2={center}
            stroke={C.cyan}
            strokeWidth="2"
          />
          <line
            x1={center}
            y1={center}
            x2={center + radius}
            y2={center}
            stroke={C.cyan}
            strokeWidth="5"
            filter="url(#radar-glow)"
            opacity="0.6"
          />
        </g>

        {targets.map((target, index) => {
          const point = polar(center, center, target.radius, target.angle);
          const elapsed = ((angle - target.angle) % 360 + 360) % 360;
          const intensity = interpolate(elapsed, [0, 110, 360], [1, 0.25, 0.12], CLAMP);
          const pulse = interpolate(elapsed, [0, 90], [4, 22], CLAMP);

          return (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r={pulse}
                fill="none"
                stroke={C.green}
                opacity={interpolate(elapsed, [0, 90], [0.8, 0], CLAMP)}
              />
              <circle cx={point.x} cy={point.y} r="7" fill={C.green} opacity={intensity * 0.65} filter="url(#radar-glow)" />
              <circle cx={point.x} cy={point.y} r="3" fill={C.green} opacity={intensity} />
              <text x={point.x + 9} y={point.y - 8} fill={C.green} opacity={intensity} fontFamily={MONO} fontSize="9">
                {target.label}
              </text>
            </g>
          );
        })}

        <circle cx={center} cy={center} r="5" fill={C.cyan} />
        <circle cx={center} cy={center} r="10" fill="none" stroke={C.cyan} strokeOpacity="0.5" />
        <text x="190" y="15" textAnchor="middle" fill={C.muted} fontFamily={MONO} fontSize="9">000°</text>
        <text x="190" y="374" textAnchor="middle" fill={C.muted} fontFamily={MONO} fontSize="9">180°</text>
        <text x="365" y="194" textAnchor="middle" fill={C.muted} fontFamily={MONO} fontSize="9">090°</text>
        <text x="15" y="194" textAnchor="middle" fill={C.muted} fontFamily={MONO} fontSize="9">270°</text>
      </svg>

      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          bottom: 25,
          borderTop: `1px solid ${C.line}`,
          paddingTop: 20,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {[
          { value: "05", label: "ACTIVE POOLS", color: C.cyan },
          { value: "98.7%", label: "SIGNAL QUALITY", color: C.green },
          { value: `${18 + Math.floor(Math.sin(frame / 17) * 2)}ms`, label: "LATENCY", color: C.white },
        ].map((item) => (
          <div key={item.label}>
            <div style={{ fontFamily: MONO, fontSize: 25, color: item.color, fontWeight: 700 }}>
              {item.value}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.muted, marginTop: 7, letterSpacing: 1 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BottomStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = reveal(frame, fps, 45);
  const metrics = [
    { label: "VOLUME / 24H", value: "$2.84B", color: C.white },
    { label: "TRANSACTIONS / SEC", value: (4280 + Math.floor(Math.sin(frame / 21) * 75)).toLocaleString("en-US"), color: C.cyan },
    { label: "FINALITY", value: "400ms", color: C.green },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 895,
        height: 115,
        display: "flex",
        borderTop: `1px solid ${C.line}`,
        borderBottom: `1px solid ${C.line}`,
        background: "#0B1019AA",
        opacity: interpolate(progress, [0, 1], [0, 1], CLAMP),
        transform: `translateY(${(1 - progress) * 22}px)`,
      }}
    >
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          style={{
            width: 278,
            padding: "22px 28px",
            borderRight: `1px solid ${C.line}`,
          }}
        >
          <div style={{ fontFamily: MONO, color: C.muted, fontSize: 10, letterSpacing: 1.5 }}>
            <KineticText text={metric.label} delay={48 + index * 5} stagger={0.6} />
          </div>
          <div style={{ fontFamily: MONO, color: metric.color, fontSize: 31, fontWeight: 700, marginTop: 9 }}>
            {metric.value}
          </div>
        </div>
      ))}
      <div style={{ flex: 1, padding: "21px 29px", fontFamily: MONO }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted, letterSpacing: 1.4 }}>
          <span>EXECUTION LOG</span>
          <span style={{ color: C.purple }}>ENGINE v.04</span>
        </div>
        <div style={{ fontSize: 13, marginTop: 13, color: C.green }}>
          <KineticText text="> Liquidity route optimized. Ready to execute." delay={63} stagger={0.45} />
        </div>
        <div style={{ fontSize: 12, marginTop: 9, color: C.muted }}>
          <span style={{ color: C.cyan }}>[OK]</span>
          {" "}Block #{(291847200 + Math.floor(frame / 12)).toLocaleString("en-US")}
          {" · "}Consensus verified
          <span
            style={{
              display: "inline-block",
              marginLeft: 9,
              width: 7,
              height: 12,
              background: C.cyan,
              opacity: Math.floor(frame / 14) % 2 === 0 ? 1 : 0.15,
              verticalAlign: "middle",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const TerminalScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 70, top: 145 }}>
        <div style={{ fontFamily: MONO, color: C.cyan, fontSize: 12, letterSpacing: 4, marginBottom: 14 }}>
          <KineticText text="ON-CHAIN. REAL-TIME. TANPA BATAS." stagger={0.8} />
        </div>
        <div
          style={{
            fontSize: 79,
            fontWeight: 900,
            lineHeight: 1.06,
            letterSpacing: -3.4,
            color: C.white,
          }}
        >
          <KineticText text="PASAR" delay={5} />
          {" "}
          <KineticText
            text="BERGERAK."
            delay={13}
            style={{
              color: C.green,
              textShadow: "0 0 32px #14F19530",
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 75,
          top: 213,
          fontFamily: MONO,
          fontSize: 12,
          lineHeight: 1.9,
          color: C.muted,
          textAlign: "right",
          letterSpacing: 1,
        }}
      >
        <KineticText text="ANDA MEMIMPIN." delay={27} stagger={2} style={{ color: C.white }} />
        <br />
        <KineticText text="PRECISION AT THE SPEED OF SOLANA" delay={36} stagger={0.7} />
      </div>

      <div style={{ position: "absolute", left: 70, top: 303, display: "flex", gap: 40 }}>
        <CandlestickChart />
        <Radar />
      </div>

      <BottomStrip />
    </AbsoluteFill>
  );
};

const Overlays: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = reveal(frame, fps, 65);
  const opening = interpolate(frame, [0, 16], [1, 0], CLAMP);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Header />
      <div
        style={{
          position: "absolute",
          bottom: 25,
          left: 70,
          right: 70,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: 1.5,
          color: C.muted,
          opacity: interpolate(progress, [0, 1], [0, 1], CLAMP),
        }}
      >
        <span>QUANTUM / SOLANA TRADING INTERFACE</span>
        <span style={{ color: C.purple }}>SIMULATED MARKET DATA · VISUAL DEMO</span>
        <span>SESSION 001 / SECURE CONNECTION</span>
      </div>
      <AbsoluteFill style={{ background: C.bg, opacity: opening }} />
    </AbsoluteFill>
  );
};

/**
 * Composition settings:
 * width: 1920 · height: 1080 · fps: 30 · durationInFrames: 300
 */
export const GeneratedVideo: React.FC = () => {
  const { width, height } = useVideoConfig();
  const scale = Math.min(width / VIDEO_CONFIG.width, height / VIDEO_CONFIG.height);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden", fontFamily: SANS, color: C.white }}>
      <div
        style={{
          position: "absolute",
          width: VIDEO_CONFIG.width,
          height: VIDEO_CONFIG.height,
          left: (width - VIDEO_CONFIG.width * scale) / 2,
          top: (height - VIDEO_CONFIG.height * scale) / 2,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <Sequence from={0} durationInFrames={300} name="01 · Grid / ambient circuitry">
          <Background />
        </Sequence>
        <Sequence from={0} durationInFrames={300} name="02 · Floating signals">
          <FloatingSignals />
        </Sequence>
        <Sequence from={12} durationInFrames={288} name="03 · Live trading terminal">
          <TerminalScene />
        </Sequence>
        <Sequence from={0} durationInFrames={300} name="04 · Identity / status overlays">
          <Overlays />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

export default GeneratedVideo;