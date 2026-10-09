import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const COLORS = {
  paper: "#F5F2EB",
  ink: "#18181B",
  muted: "#77766F",
  line: "#D7D3C9",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
  white: "#FFFDF8",
};

const SCENE_DURATION = 1565;
const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const FONT = 'Arial, Helvetica, sans-serif';

const fade = (frame: number, start: number, length = 22) =>
  interpolate(frame, [start, start + length], [0, 1], CLAMP);

const progress = (frame: number, start: number, length: number) =>
  interpolate(frame, [start, start + length], [0, 1], CLAMP);

const settle = (frame: number, fps: number, start: number) =>
  spring({
    frame: Math.max(0, frame - start),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

/**
 * Absolute-scene-frame layer sequencing.
 * This local wrapper preserves the restricted Remotion import surface and keeps
 * children mounted through overlapping fades, rather than cutting on boundaries.
 */
const Sequence: React.FC<{
  from: number;
  durationInFrames: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  from,
  durationInFrames,
  fadeIn = 20,
  fadeOut = 20,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const end = from + durationInFrames;
  const entrance = from === 0 ? 1 : fade(frame, from, fadeIn);
  const exit =
    end >= SCENE_DURATION
      ? 1
      : interpolate(frame, [end - fadeOut, end], [1, 0], CLAMP);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: Math.min(entrance, exit),
        pointerEvents: "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const KineticText: React.FC<{
  text: string;
  start: number;
  frame: number;
  fps: number;
  size: number;
  color?: string;
  weight?: number;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  start,
  frame,
  fps,
  size,
  color = COLORS.ink,
  weight = 800,
  stagger = 3,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: size,
      fontWeight: weight,
      color,
      lineHeight: 1.12,
      letterSpacing: "-0.035em",
      ...style,
    }}
  >
    {text.split(" ").map((word, index) => {
      const cue = start + index * stagger;
      const motion = settle(frame, fps, cue);
      return (
        <span
          key={`${word}-${index}`}
          style={{
            display: "inline-block",
            marginRight: "0.24em",
            opacity: fade(frame, cue, 16),
            transform: `translateY(${(1 - motion) * 14}px)`,
          }}
        >
          {word}
        </span>
      );
    })}
  </div>
);

const SmallLabel: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color = COLORS.muted, style }) => (
  <div
    style={{
      fontFamily: FONT,
      color,
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: "0.15em",
      lineHeight: 1.4,
      ...style,
    }}
  >
    {children}
  </div>
);

const Icon: React.FC<{
  type: "phone" | "anger" | "action" | "thought" | "reaction";
  color: string;
  size?: number;
  frame?: number;
}> = ({ type, color, size = 48, frame = 0 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    style={{ display: "block", flexShrink: 0 }}
  >
    {type === "phone" && (
      <>
        <rect
          x="12"
          y="3"
          width="24"
          height="42"
          rx="6"
          stroke={color}
          strokeWidth="2.3"
        />
        <path d="M20 8h8M21 40h6" stroke={color} strokeWidth="2" />
        {[0, 1, 2].map((i) => {
          const y = 13 + ((frame * 0.15 + i * 8) % 22);
          return (
            <g key={i} opacity={Math.sin(((y - 13) / 22) * Math.PI) * 0.7}>
              <rect x="17" y={y} width="14" height="3" rx="1.5" fill={color} />
              <rect x="17" y={y + 4} width="9" height="2" rx="1" fill={color} />
            </g>
          );
        })}
      </>
    )}
    {type === "anger" && (
      <>
        <path
          d="M7 10h30v23H24l-9 8v-8H7z"
          stroke={color}
          strokeWidth="2.3"
          strokeLinejoin="round"
        />
        <path d="m15 16 5 3m12-3-5 3" stroke={color} strokeWidth="2.3" />
        <path d="M18 27c4-4 8-4 12 0" stroke={color} strokeWidth="2.3" />
        <path d="m40 5 3-3m-3 17h5M5 5 2 2" stroke={color} strokeWidth="2" />
      </>
    )}
    {type === "action" && (
      <path
        d="m20 7 17 17-17 17M8 24h28"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
    {type === "thought" && (
      <>
        <path
          d="M13 31c-5-3-7-8-5-14 2-7 9-11 17-10 8 1 14 7 14 14 0 7-5 11-12 12H17"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="15" cy="37" r="3" stroke={color} strokeWidth="2" />
        <circle cx="9" cy="43" r="1.8" fill={color} />
        <path d="M16 20h16M16 25h10" stroke={color} strokeWidth="2" />
      </>
    )}
    {type === "reaction" && (
      <path
        d="m27 4-17 23h13l-2 17 17-24H25z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const PaperBackground: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", inset: 0, background: COLORS.paper }}>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <pattern
          id="s01-paper-dots"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="0.75" fill="#AAA393" opacity="0.3" />
        </pattern>
        <radialGradient id="s01-paper-glow">
          <stop offset="0" stopColor="#FFFDF6" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFFDF6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1920" height="900" fill="url(#s01-paper-dots)" />
      <ellipse
        cx={960 + Math.sin(frame * 0.006) * 70}
        cy="400"
        rx="800"
        ry="490"
        fill="url(#s01-paper-glow)"
      />
      <g
        transform={`translate(${Math.sin(frame * 0.005) * 12}, ${Math.cos(
          frame * 0.007,
        ) * 9})`}
        fill="none"
        stroke={COLORS.line}
        strokeWidth="1"
        opacity="0.25"
      >
        {[0, 1, 2, 3].map((i) => (
          <ellipse
            key={i}
            cx="980"
            cy="515"
            rx={440 + i * 52}
            ry={280 + i * 35}
          />
        ))}
      </g>
      <path d="M96 98H1824" stroke={COLORS.ink} strokeOpacity="0.2" />
      <path d="M96 878H1824" stroke={COLORS.ink} strokeOpacity="0.12" />
    </svg>
  </div>
);

const BrainDiagram: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const impulse = fade(frame, 439, 45);
  const questioning = fade(frame, 814, 50);
  const choices = fade(frame, 1063, 50);
  const shortcut = progress(frame, 1421, 75);
  const float = Math.sin(frame * 0.019) * 3;
  const draw = progress(frame, 18, 110);

  const routes = [
    {
      d: "M98 206C160 206 158 129 220 142S287 195 333 177",
      color: COLORS.blue,
      x: (t: number) => 98 + 235 * t,
      y: (t: number) => 206 - 56 * Math.sin(t * Math.PI) - 29 * t,
    },
    {
      d: "M333 177C387 159 407 236 467 238S535 215 572 207",
      color: COLORS.red,
      x: (t: number) => 333 + 239 * t,
      y: (t: number) => 177 + 59 * Math.sin(t * Math.PI * 0.76),
    },
    {
      d: "M216 314C244 259 290 284 333 263S414 285 451 319",
      color: COLORS.teal,
      x: (t: number) => 216 + 235 * t,
      y: (t: number) => 314 - 49 * Math.sin(t * Math.PI) + 5 * t,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 607,
        top: 315,
        width: 690,
        height: 438,
        transform: `translateY(${float}px) scale(${1 + Math.sin(frame * 0.004) * 0.003})`,
      }}
    >
      <svg width="690" height="438" viewBox="0 0 690 438" fill="none">
        <defs>
          <clipPath id="s01-brain-clip">
            <path d="M335 83C303 50 250 44 220 66C171 43 117 66 107 110C64 124 51 171 76 205C54 249 78 286 117 299C127 342 166 368 207 356C245 393 301 380 335 348C370 383 425 390 465 357C511 367 554 341 565 300C612 287 631 248 609 208C635 166 615 124 575 111C557 67 513 48 469 67C425 40 374 55 335 83Z" />
          </clipPath>
          <linearGradient id="s01-brain-fill" x1="60" y1="100" x2="610" y2="330">
            <stop offset="0" stopColor="#EAF0FC" />
            <stop offset="0.53" stopColor="#FFFDF8" />
            <stop offset="1" stopColor="#FBE9E5" />
          </linearGradient>
        </defs>

        <circle cx="335" cy="221" r="206" stroke={COLORS.line} strokeDasharray="2 9" />
        <g transform={`rotate(${frame * 0.07} 335 221)`} opacity="0.45">
          <path
            d="M335 15a206 206 0 0 1 177 100"
            stroke={COLORS.blue}
            strokeWidth="2"
          />
          <path
            d="M335 427a206 206 0 0 1-177-100"
            stroke={COLORS.red}
            strokeWidth="2"
          />
        </g>

        <path
          d="M335 83C303 50 250 44 220 66C171 43 117 66 107 110C64 124 51 171 76 205C54 249 78 286 117 299C127 342 166 368 207 356C245 393 301 380 335 348C370 383 425 390 465 357C511 367 554 341 565 300C612 287 631 248 609 208C635 166 615 124 575 111C557 67 513 48 469 67C425 40 374 55 335 83Z"
          fill="url(#s01-brain-fill)"
          stroke={COLORS.ink}
          strokeWidth="2.5"
        />

        <g stroke={COLORS.ink} strokeWidth="2" strokeLinecap="round" opacity="0.26">
          <path d="M335 84C321 128 350 149 335 193S315 266 335 348" />
          <path d="M218 67C213 100 166 100 171 144S125 188 132 222" />
          <path d="M108 112C158 100 153 139 136 157S114 195 144 209" />
          <path d="M78 207C117 194 159 224 170 255S201 270 210 308" />
          <path d="M116 299C142 285 154 318 179 319S209 338 207 356" />
          <path d="M237 93C267 82 303 116 288 148S252 178 262 207" />
          <path d="M175 177C198 156 237 177 224 209S248 249 281 236" />
          <path d="M222 277C248 261 273 292 265 321S289 347 313 330" />
          <path d="M470 68C467 108 507 111 501 142S547 174 536 211" />
          <path d="M574 112C537 101 529 131 544 153S572 186 545 205" />
          <path d="M608 208C568 205 530 237 516 268S475 281 468 310" />
          <path d="M563 299C535 286 524 317 497 320S468 337 465 357" />
          <path d="M427 91C391 91 369 113 385 145S415 178 403 207" />
          <path d="M489 181C457 165 433 183 444 212S421 248 386 234" />
          <path d="M450 277C419 264 401 290 410 319S383 348 360 330" />
        </g>

        <g clipPath="url(#s01-brain-clip)">
          <rect
            x="60"
            y={65 + ((frame * 0.42) % 315)}
            width="575"
            height="2"
            fill={COLORS.blue}
            opacity="0.075"
          />
          {routes.map((route, index) => {
            const t = ((frame + index * 57) % 180) / 180;
            return (
              <g key={route.color}>
                <path
                  d={route.d}
                  stroke={route.color}
                  strokeWidth="3"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={1 - draw}
                  opacity={index === 1 ? 0.35 + impulse * 0.65 : 0.8}
                />
                <circle
                  cx={route.x(t)}
                  cy={route.y(t)}
                  r="9"
                  fill={route.color}
                  opacity="0.1"
                />
                <circle
                  cx={route.x(t)}
                  cy={route.y(t)}
                  r="3.3"
                  fill={route.color}
                  opacity={0.45 + 0.5 * Math.sin(t * Math.PI)}
                />
              </g>
            );
          })}
          <path
            d="M135 220Q335 370 545 220"
            stroke={COLORS.red}
            strokeWidth="3"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - shortcut}
            opacity="0.85"
          />
        </g>

        {[
          { x: 134, y: 220, color: COLORS.blue },
          { x: 335, y: 176, color: COLORS.teal },
          { x: 545, y: 220, color: COLORS.red },
        ].map((node, i) => (
          <g key={node.color}>
            <circle
              cx={node.x}
              cy={node.y}
              r={15 + Math.sin(frame * 0.05 + i * 2) * 2.5}
              stroke={node.color}
              opacity="0.2"
            />
            <circle cx={node.x} cy={node.y} r="7" fill={COLORS.white} stroke={node.color} strokeWidth="3" />
          </g>
        ))}

        <g opacity={questioning * (1 - choices * 0.65)}>
          <circle
            cx="335"
            cy="222"
            r="45"
            fill={COLORS.yellow}
            opacity="0.9"
          />
          <text
            x="335"
            y="241"
            textAnchor="middle"
            fontFamily={FONT}
            fontWeight="800"
            fontSize="57"
            fill={COLORS.ink}
          >
            ?
          </text>
        </g>

        <text x="95" y="31" fontFamily={FONT} fontSize="13" letterSpacing="2" fill={COLORS.blue}>
          NIAT
        </text>
        <text x="495" y="31" fontFamily={FONT} fontSize="13" letterSpacing="2" fill={COLORS.red}>
          RESPONS
        </text>
        <text
          x="335"
          y="425"
          textAnchor="middle"
          fontFamily={FONT}
          fontSize="11"
          letterSpacing="2.1"
          fill={COLORS.muted}
        >
          ESQUEMA CONCEITUAL · NÃO É UM MAPA ANATÔMICO
        </text>
      </svg>
    </div>
  );
};

const EvidenceCard: React.FC<{
  frame: number;
  fps: number;
  top: number;
  cue: number;
  index: string;
  icon: "phone" | "anger";
  intention: string;
  outcome: string;
  annotation: string;
  initialTitle: string;
  initialBody: string;
}> = ({
  frame,
  fps,
  top,
  cue,
  index,
  icon,
  intention,
  outcome,
  annotation,
  initialTitle,
  initialBody,
}) => {
  const reveal = fade(frame, cue, 28);
  const motion = settle(frame, fps, cue);
  const highlight = progress(frame, cue + 40, 36);

  return (
    <div
      style={{
        position: "absolute",
        left: 100,
        top,
        width: 435,
        height: 162,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 3,
        background: COLORS.white,
        boxShadow: "0 7px 20px rgba(24,24,27,0.035)",
        transform: `translateY(${Math.sin(frame * 0.014 + top) * 1.5}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 20,
          color: COLORS.muted,
          fontSize: 12,
          letterSpacing: 2,
          fontWeight: 700,
        }}
      >
        {index}
      </div>

      <div style={{ position: "absolute", left: 22, top: 49, opacity: 1 - reveal }}>
        <div style={{ fontSize: 29, fontWeight: 700, letterSpacing: -1 }}>
          {initialTitle}
        </div>
        <div style={{ marginTop: 13, fontSize: 17, color: COLORS.muted }}>
          {initialBody}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: reveal,
          transform: `translateX(${(1 - motion) * -18}px)`,
        }}
      >
        <div style={{ position: "absolute", left: 22, top: 48 }}>
          <Icon type={icon} color={COLORS.ink} frame={frame} size={43} />
        </div>
        <div style={{ position: "absolute", left: 84, top: 37 }}>
          <div style={{ fontSize: 16, color: COLORS.muted, marginBottom: 9 }}>
            {intention}
          </div>
          <div style={{ position: "relative", display: "inline-block" }}>
            <div
              style={{
                position: "absolute",
                left: -4,
                right: -6,
                top: 11,
                height: 22,
                background: COLORS.yellow,
                transform: `scaleX(${highlight}) rotate(-1deg)`,
                transformOrigin: "left center",
              }}
            />
            <KineticText
              text={outcome}
              start={cue + 9}
              frame={frame}
              fps={fps}
              size={28}
              style={{ position: "relative", letterSpacing: "-0.045em" }}
            />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 84,
            top: 119,
            fontSize: 12,
            letterSpacing: 1.3,
            color: COLORS.red,
            fontWeight: 700,
            opacity: fade(frame, cue + 58, 20),
          }}
        >
          {annotation}
        </div>
      </div>
    </div>
  );
};

export const Scene_01: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const scale = Math.min(width / 1920, height / 1080);
  const left = (width - 1920 * scale) / 2;
  const top = (height - 1080 * scale) / 2;

  const badHabit = fade(frame, 650, 30);
  const inquiry = fade(frame, 814, 32);
  const reflection = fade(frame, 1010, 22);
  const agency = fade(frame, 1063, 35);
  const conclusion = fade(frame, 1421, 26);
  const marker = progress(frame, 870, 65);
  const arrow = progress(frame, 165, 85);
  const questionHighlight = progress(frame, 826, 46);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: COLORS.paper,
        fontFamily: FONT,
        color: COLORS.ink,
      }}
    >
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          overflow: "hidden",
        }}
      >
        <Sequence from={0} durationInFrames={SCENE_DURATION}>
          <PaperBackground frame={frame} />
        </Sequence>

        <Sequence from={0} durationInFrames={SCENE_DURATION}>
          <svg
            width="1920"
            height="900"
            viewBox="0 0 1920 900"
            style={{ position: "absolute", inset: 0 }}
            fill="none"
          >
            <path
              d="M535 436H582Q600 436 600 454V518H720"
              stroke={COLORS.blue}
              strokeWidth="2"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - arrow}
              opacity="0.55"
            />
            <path
              d="M535 631H575Q598 631 598 608V568H720"
              stroke={COLORS.red}
              strokeWidth="2"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - progress(frame, 439, 75)}
              opacity="0.55"
            />
            <path
              d="M1152 535H1324"
              stroke={COLORS.ink}
              strokeWidth="2"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - progress(frame, 205, 80)}
              opacity="0.42"
            />
            <path
              d="m1312 528 12 7-12 7"
              stroke={COLORS.ink}
              strokeWidth="2"
              opacity={fade(frame, 270, 25) * 0.42}
            />
            <circle
              cx={1160 + ((frame * 0.8) % 155)}
              cy="535"
              r="3"
              fill={COLORS.ink}
              opacity={0.12 + Math.sin(frame * 0.03) * 0.05}
            />
          </svg>
        </Sequence>

        <Sequence from={0} durationInFrames={SCENE_DURATION}>
          {/* Established editorial hierarchy is visible on the first frame. */}
          <div
            style={{
              position: "absolute",
              left: 98,
              top: 43,
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                padding: "7px 11px",
                background: COLORS.yellow,
                fontSize: 17,
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              vox
            </div>
            <SmallLabel color={COLORS.ink}>PIKIRAN / INVESTIGASI</SmallLabel>
          </div>

          <SmallLabel style={{ position: "absolute", right: 99, top: 56 }}>
            01 — 08
          </SmallLabel>

          <KineticText
            text="Siapa yang"
            start={-30}
            frame={frame}
            fps={fps}
            size={76}
            style={{ position: "absolute", left: 97, top: 133 }}
          />
          <div style={{ position: "absolute", left: 97, top: 216 }}>
            <div
              style={{
                position: "absolute",
                left: -3,
                top: 41,
                width: 779,
                height: 33,
                background: COLORS.yellow,
                transform: `scaleX(${progress(frame, 45, 55)}) rotate(-0.5deg)`,
                transformOrigin: "left",
              }}
            />
            <KineticText
              text="memegang kendali?"
              start={-12}
              frame={frame}
              fps={fps}
              size={76}
              style={{ position: "relative" }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              right: 101,
              top: 149,
              width: 424,
              borderLeft: `3px solid ${COLORS.ink}`,
              paddingLeft: 21,
            }}
          >
            <Sequence
              from={0}
              durationInFrames={680}
              style={{ position: "relative", height: 103 }}
              fadeOut={30}
            >
              <SmallLabel color={COLORS.blue}>01 / JANJI & KENYATAAN</SmallLabel>
              <div style={{ marginTop: 12, fontSize: 25, lineHeight: 1.35 }}>
                Ada jarak antara rencana
                <br />
                dan apa yang kita lakukan.
              </div>
            </Sequence>

            <Sequence from={650} durationInFrames={443} fadeIn={30} fadeOut={30}>
              <SmallLabel color={COLORS.red}>02 / PARADOKS KENDALI</SmallLabel>
              <KineticText
                text="Tahu, tetapi tetap melakukan."
                start={654}
                frame={frame}
                fps={fps}
                size={25}
                weight={500}
                style={{ marginTop: 12, lineHeight: 1.35, letterSpacing: "-0.01em" }}
              />
            </Sequence>

            <Sequence from={1063} durationInFrames={502} fadeIn={30}>
              <SmallLabel color={COLORS.teal}>03 / RASA MEMILIH</SmallLabel>
              <KineticText
                text="Kita merasa menjadi pembuat keputusan."
                start={1065}
                frame={frame}
                fps={fps}
                size={25}
                weight={500}
                style={{ marginTop: 12, lineHeight: 1.35, letterSpacing: "-0.01em" }}
              />
            </Sequence>
          </div>

          <SmallLabel style={{ position: "absolute", left: 100, top: 325 }}>
            CATATAN KESEHARIAN
          </SmallLabel>

          <EvidenceCard
            frame={frame}
            fps={fps}
            top={363}
            cue={289}
            index="A / RENCANA"
            icon="phone"
            intention="“Mau tidur lebih cepat.”"
            outcome="Masih scrolling."
            annotation="SAMPAI TENGAH MALAM"
            initialTitle="Aku akan…"
            initialBody="Sebuah janji kepada diri sendiri."
          />

          <EvidenceCard
            frame={frame}
            fps={fps}
            top={557}
            cue={439}
            index="B / RESPONS"
            icon="anger"
            intention="“Gak akan marah lagi.”"
            outcome="Langsung meledak."
            annotation="SAAT ADA PEMICU"
            initialTitle="Tapi kemudian…"
            initialBody="Tindakan bisa bergerak ke arah lain."
          />

          <BrainDiagram frame={frame} fps={fps} />

          <div
            style={{
              position: "absolute",
              left: 1360,
              top: 359,
              width: 459,
              height: 363,
              background: COLORS.white,
              border: `1px solid ${COLORS.line}`,
              borderTop: `4px solid ${COLORS.ink}`,
              boxShadow: "0 12px 35px rgba(24,24,27,0.045)",
            }}
          >
            <SmallLabel
              color={COLORS.ink}
              style={{ position: "absolute", left: 28, top: 24 }}
            >
              PERTANYAAN UTAMA
            </SmallLabel>

            <div
              style={{
                position: "absolute",
                left: 28,
                top: 75,
                fontSize: 51,
                fontWeight: 800,
                letterSpacing: "-0.06em",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span>NIAT</span>
              <span
                style={{
                  color: COLORS.red,
                  transform: `rotate(${Math.sin(frame * 0.015) * 2}deg)`,
                }}
              >
                ≠
              </span>
              <span style={{ fontSize: 43 }}>TINDAKAN</span>
            </div>

            <div
              style={{
                position: "absolute",
                left: 28,
                top: 154,
                width: 396,
                height: 1,
                background: COLORS.line,
              }}
            />

            <div
              style={{
                position: "absolute",
                left: 28,
                top: 181,
                width: 396,
                opacity: 1 - inquiry,
              }}
            >
              <div style={{ fontSize: 26, lineHeight: 1.38 }}>
                Berjanji satu hal.
                <br />
                Melakukan yang sebaliknya.
              </div>
              <div
                style={{
                  marginTop: 23,
                  display: "inline-block",
                  padding: "7px 10px",
                  background: "#FBE9E5",
                  color: COLORS.red,
                  fontSize: 14,
                  fontWeight: 700,
                  opacity: badHabit,
                  transform: `translateX(${(1 - settle(frame, fps, 650)) * 18}px)`,
                }}
              >
                TAHU BURUK ≠ BERHENTI
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                left: 28,
                top: 183,
                width: 395,
                opacity: inquiry,
              }}
            >
              <KineticText
                text="Kalau kita mengendalikan pikiran…"
                start={814}
                frame={frame}
                fps={fps}
                size={27}
                weight={500}
                style={{ lineHeight: 1.25, letterSpacing: "-0.025em" }}
              />
              <div style={{ position: "relative", marginTop: 13 }}>
                <div
                  style={{
                    position: "absolute",
                    left: -4,
                    top: 4,
                    width: 375,
                    height: 57,
                    background: COLORS.yellow,
                    transform: `scaleX(${questionHighlight})`,
                    transformOrigin: "left",
                  }}
                />
                <KineticText
                  text="kenapa sulit mengendalikan diri?"
                  start={850}
                  frame={frame}
                  fps={fps}
                  size={27}
                  style={{ position: "relative", lineHeight: 1.16 }}
                />
              </div>
            </div>

            <svg
              width="459"
              height="363"
              viewBox="0 0 459 363"
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            >
              <path
                d="M20 284C19 257 109 250 226 252C346 254 433 266 431 294C429 322 335 329 215 324C111 322 24 309 20 284M31 274C16 300 59 325 117 327"
                fill="none"
                stroke={COLORS.red}
                strokeWidth="2.8"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={1 - marker}
              />
            </svg>
          </div>

          {/* A persistent lower diagram rail, entirely above the caption zone. */}
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 776,
              width: 1718,
              height: 78,
              borderTop: `1px solid ${COLORS.line}`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 23,
                opacity: 1 - agency,
              }}
            >
              <SmallLabel color={COLORS.ink}>RENCANA</SmallLabel>
            </div>
            <div
              style={{
                position: "absolute",
                left: 255,
                top: 25,
                width: 853,
                opacity: 1 - agency,
              }}
            >
              <svg width="853" height="24" viewBox="0 0 853 24">
                <path d="M0 12H853" stroke={COLORS.line} strokeWidth="1.5" />
                <circle
                  cx={12 + ((frame * 0.5) % 829)}
                  cy="12"
                  r="4"
                  fill={COLORS.blue}
                  opacity="0.5"
                />
                <path d="m842 6 10 6-10 6" stroke={COLORS.ink} fill="none" />
              </svg>
            </div>
            <SmallLabel
              color={COLORS.ink}
              style={{
                position: "absolute",
                right: 0,
                top: 23,
                opacity: 1 - agency,
              }}
            >
              TINDAKAN
            </SmallLabel>

            <div
              style={{
                position: "absolute",
                left: 590,
                top: 14,
                padding: "10px 19px",
                background: COLORS.paper,
                opacity: reflection * (1 - agency),
                fontSize: 20,
                fontStyle: "italic",
                color: COLORS.muted,
              }}
            >
              Coba pikirkan itu sebentar.
            </div>

            <div
              style={{
                position: "absolute",
                left: 0,
                top: 23,
                opacity: agency,
              }}
            >
              <KineticText
                text="“Aku yang memilih.”"
                start={1063}
                frame={frame}
                fps={fps}
                size={27}
                style={{ letterSpacing: "-0.025em" }}
              />
            </div>

            {[
              { x: 470, text: "Melakukan", cue: 1204, icon: "action" as const },
              { x: 792, text: "Memikirkan", cue: 1252, icon: "thought" as const },
              { x: 1123, text: "Bereaksi", cue: 1320, icon: "reaction" as const },
            ].map((item) => {
              const reveal = fade(frame, item.cue, 24);
              return (
                <div
                  key={item.text}
                  style={{
                    position: "absolute",
                    left: item.x,
                    top: 14,
                    height: 49,
                    width: 278,
                    border: `1px solid ${COLORS.line}`,
                    background: COLORS.white,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 13,
                    paddingLeft: 15,
                    opacity: agency * (0.2 + reveal * 0.8),
                    transform: `translateY(${(1 - settle(frame, fps, item.cue)) * 5}px)`,
                  }}
                >
                  <Icon type={item.icon} color={COLORS.teal} size={28} />
                  <span style={{ fontSize: 20, fontWeight: 700 }}>{item.text}</span>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: -1,
                      height: 3,
                      width: "100%",
                      background: COLORS.teal,
                      transform: `scaleX(${progress(frame, item.cue, 40)})`,
                      transformOrigin: "left",
                    }}
                  />
                </div>
              );
            })}

            <div
              style={{
                position: "absolute",
                right: 0,
                top: 23,
                opacity: agency,
                color: COLORS.teal,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.13em",
              }}
            >
              RASA KENDALI
            </div>
          </div>
        </Sequence>

        <Sequence from={1063} durationInFrames={502} fadeIn={30}>
          {/* This badge is established for the entire third act.
              Its annotation changes progressively with the final spoken insight. */}
          <div
            style={{
              position: "absolute",
              left: 770,
              top: 302,
              width: 365,
              height: 47,
              borderRadius: 24,
              border: `1px solid ${COLORS.line}`,
              background: COLORS.white,
              boxShadow: "0 4px 14px rgba(24,24,27,0.04)",
              transform: `translateY(${Math.sin(frame * 0.024) * 2}px)`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                opacity: 1 - conclusion,
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.teal,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: COLORS.teal,
                }}
              />
              Keputusan terasa seperti pilihan.
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                background: COLORS.yellow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: conclusion,
              }}
            >
              <KineticText
                text="Tidak selalu berpikir panjang."
                start={1421}
                frame={frame}
                fps={fps}
                size={19}
                style={{ letterSpacing: "-0.025em" }}
              />
            </div>
          </div>
        </Sequence>

        <Sequence from={0} durationInFrames={SCENE_DURATION}>
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 742,
              display: "flex",
              gap: 7,
              alignItems: "center",
              opacity: fade(frame, 95, 32),
            }}
          >
            {[COLORS.blue, COLORS.teal, COLORS.red].map((color, i) => (
              <div
                key={color}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: color,
                  opacity: 0.5 + Math.sin(frame * 0.035 + i) * 0.25,
                }}
              />
            ))}
            <span
              style={{
                marginLeft: 7,
                color: COLORS.muted,
                fontSize: 11,
                letterSpacing: "0.09em",
              }}
            >
              ILUSTRASI PERILAKU · BUKAN DIAGNOSIS
            </span>
          </div>
        </Sequence>
      </div>
    </div>
  );
};