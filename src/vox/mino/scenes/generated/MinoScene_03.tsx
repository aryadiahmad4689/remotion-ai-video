import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MinoCharacter, MinoPose } from "../../MinoCharacter";

const INK = "#202320";
const MUTED = "#73746C";
const YELLOW = "#FFE600";
const RED = "#E63946";
const PAPER = "#FFFDF6";
const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const FONT = '"Inter", "Helvetica Neue", Arial, sans-serif';
const SERIF = '"Playfair Display", Georgia, serif';

const range = (
  frame: number,
  start: number,
  end: number,
  from: number,
  to: number,
) =>
  interpolate(
    frame,
    [start, Math.max(start + 0.001, end)],
    [from, to],
    CLAMP,
  );

const enter = (frame: number, fps: number, delay: number) =>
  spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 17, mass: 0.65, stiffness: 110 },
  });

/**
 * Frame-gated layer sequencing without additional Remotion imports.
 * Children use the scene's absolute frame clock.
 */
const Sequence: React.FC<{
  from: number;
  durationInFrames: number;
  zIndex: number;
  children: React.ReactNode;
}> = ({ from, durationInFrames, zIndex, children }) => {
  const frame = useCurrentFrame();

  if (frame < from || frame >= from + durationInFrames) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
};

const Words: React.FC<{
  text: string;
  frame: number;
  fps: number;
  start: number;
  size: number;
  color?: string;
  serif?: boolean;
  stagger?: number;
}> = ({
  text,
  frame,
  fps,
  start,
  size,
  color = INK,
  serif = false,
  stagger = 3,
}) => (
  <span
    style={{
      display: "inline-flex",
      flexWrap: "wrap",
      columnGap: size * 0.23,
      fontFamily: serif ? SERIF : FONT,
      fontSize: size,
      lineHeight: 1.06,
      fontWeight: serif ? 700 : 850,
      letterSpacing: serif ? -1.7 : -2.4,
      color,
    }}
  >
    {text.split(" ").map((word, index) => {
      const delay = start + index * stagger;
      const progress = enter(frame, fps, delay);
      return (
        <span
          key={`${word}-${index}`}
          style={{
            display: "inline-block",
            opacity: range(frame, delay, delay + 10, 0, 1),
            transform: `translateY(${(1 - progress) * 19}px)`,
          }}
        >
          {word}
        </span>
      );
    })}
  </span>
);

const DreamSketch: React.FC<{ faded?: boolean }> = ({ faded = false }) => (
  <svg
    viewBox="0 0 210 130"
    width="100%"
    height="100%"
    fill="none"
    aria-hidden
  >
    <rect width="210" height="130" fill={faded ? "#EEEDE5" : "#E8EBDF"} />
    <path
      d="M0 109L44 77L72 96L117 54L161 94L210 70V130H0Z"
      fill={faded ? "#DADCD3" : "#BBC9B2"}
    />
    <path
      d="M0 117L47 101L92 118L151 87L210 111V130H0Z"
      fill={faded ? "#D1D4CB" : "#8CA58B"}
    />
    <path
      d="M149 23C140 27 138 39 145 47C152 55 165 51 170 43C155 49 145 36 149 23Z"
      fill={faded ? "#D1C79D" : "#FFE600"}
    />
    <path
      d="M35 40C41 31 48 31 54 40M69 28C74 23 80 23 85 28"
      stroke={INK}
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity={faded ? 0.25 : 0.65}
    />
    <path
      d="M105 130C127 113 133 107 128 96"
      stroke={PAPER}
      strokeWidth="5"
      strokeLinecap="round"
    />
    {faded && (
      <>
        <path
          d="M24 15L77 63L38 118M120 8L109 70L168 118"
          stroke={PAPER}
          strokeWidth="13"
          strokeLinecap="round"
        />
        <rect width="210" height="130" fill={PAPER} opacity="0.25" />
      </>
    )}
  </svg>
);

export const MinoScene_03: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelEnter = enter(frame, fps, 12);
  const loss = range(frame, 67, 194, 0, 1);
  const secondEnter = enter(frame, fps, 208);
  const pathReveal = range(frame, 28, 80, 1, 0);
  const underlineReveal = range(frame, 18, 43, 0, 1);
  const quoteCircle = range(frame, 277, 312, 1, 0);

  const chosenPose: MinoPose =
    frame < 92 ? "searching" : frame < 208 ? "confused" : "curious";

  const nodes = [
    { x: 390, y: 108 },
    { x: 432, y: 75 },
    { x: 479, y: 104 },
    { x: 515, y: 65 },
    { x: 554, y: 119 },
    { x: 588, y: 82 },
    { x: 422, y: 154 },
    { x: 475, y: 172 },
    { x: 526, y: 154 },
    { x: 569, y: 187 },
    { x: 382, y: 203 },
    { x: 449, y: 218 },
    { x: 508, y: 219 },
  ];

  const connections = [
    [0, 1],
    [0, 6],
    [1, 2],
    [2, 3],
    [2, 7],
    [3, 4],
    [4, 5],
    [4, 8],
    [6, 7],
    [6, 10],
    [7, 8],
    [7, 11],
    [8, 9],
    [8, 12],
    [10, 11],
    [11, 12],
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: 1080,
        height: 1920,
        overflow: "hidden",
        color: INK,
        fontFamily: FONT,
      }}
    >
      {/* Transparent atmosphere; the master provides the paper background. */}
      <Sequence from={0} durationInFrames={375} zIndex={1}>
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 358,
            width: 930,
            height: 380,
            opacity: 0.16 + Math.sin(frame / 52) * 0.025,
            background:
              "radial-gradient(ellipse at 52% 50%, #FFE600 0%, rgba(255,230,0,0) 68%)",
          }}
        />
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0 }}
          aria-hidden
        >
          <g stroke={INK} strokeWidth="1" opacity="0.075">
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${115 + i * 205} 401V682`}
                strokeDasharray="2 13"
              />
            ))}
          </g>
        </svg>
      </Sequence>

      {/* Persistent editorial headline. */}
      <Sequence from={0} durationInFrames={375} zIndex={10}>
        <div style={{ position: "absolute", top: 183, left: 78, right: 78 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              marginBottom: 19,
              opacity: range(frame, 0, 12, 0, 1),
            }}
          >
            <span
              style={{
                width: 28,
                height: 4,
                background: RED,
                display: "block",
              }}
            />
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: 3.5,
              }}
            >
              INGATAN MIMPI
            </span>
          </div>

          <Words
            text="Makin dicari,"
            frame={frame}
            fps={fps}
            start={0}
            size={76}
          />

          <div style={{ position: "relative", marginTop: 4 }}>
            <div
              style={{
                position: "absolute",
                left: -6,
                top: 45,
                width: 777,
                height: 30,
                background: YELLOW,
                transform: `rotate(-1deg) scaleX(${underlineReveal})`,
                transformOrigin: "left center",
              }}
            />
            <div style={{ position: "relative" }}>
              <Words
                text="makin menghilang."
                frame={frame}
                fps={fps}
                start={10}
                size={76}
                serif
              />
            </div>
          </div>
        </div>
      </Sequence>

      {/* The memory dossier remains in place through the entire scene. */}
      <Sequence from={12} durationInFrames={363} zIndex={15}>
        <div
          style={{
            position: "absolute",
            left: 78,
            top: 410,
            width: 924,
            height: 296,
            border: "1.5px solid rgba(32,35,32,0.23)",
            borderRadius: 5,
            background: "rgba(255,253,246,0.78)",
            boxShadow: "0 7px 0 rgba(32,35,32,0.045)",
            opacity: range(frame, 12, 28, 0, 1),
            transform: `translateY(${(1 - panelEnter) * 20}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 22,
              top: 15,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: 2.2,
              color: MUTED,
            }}
          >
            JEJAK INGATAN
          </div>
          <div
            style={{
              position: "absolute",
              right: 22,
              top: 15,
              fontSize: 14,
              letterSpacing: 1.8,
              color: MUTED,
            }}
          >
            ILUSTRASI KONSEPTUAL
          </div>

          <svg
            viewBox="0 0 924 296"
            width="924"
            height="296"
            style={{ position: "absolute", inset: 0 }}
            aria-hidden
          >
            <path
              d="M247 145C295 119 317 114 359 142"
              stroke={INK}
              strokeWidth="2"
              strokeDasharray="5 7"
              opacity="0.4"
            />
            <path
              d="M607 142C635 122 654 121 679 135"
              stroke={INK}
              strokeWidth="2"
              strokeDasharray="5 7"
              opacity="0.4"
            />
            <path
              d="M666 125L680 135L665 141"
              stroke={INK}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />

            <path
              d="M382 213C360 199 352 174 359 153C343 133 353 109 375 102C371 77 388 57 410 59C424 40 449 41 464 54C485 37 513 43 525 61C550 56 571 72 573 94C598 98 610 118 602 140C623 157 619 184 599 196C601 220 582 238 558 235C540 253 514 249 500 237C477 252 452 248 441 234C416 243 393 231 382 213Z"
              stroke={INK}
              strokeWidth="2"
              fill="#F3F2E8"
            />
            <path
              d="M483 61C469 89 490 113 475 140C461 166 489 189 478 229"
              stroke={INK}
              strokeWidth="1.5"
              opacity="0.18"
            />

            {connections.map(([a, b], index) => {
              const first = nodes[a];
              const second = nodes[b];
              return (
                <path
                  key={`connection-${index}`}
                  d={`M${first.x} ${first.y}Q${(first.x + second.x) / 2 + 9} ${(first.y + second.y) / 2 - 8} ${second.x} ${second.y}`}
                  pathLength={1}
                  stroke={index % 3 === 0 ? RED : INK}
                  strokeWidth={index % 3 === 0 ? 2.5 : 1.5}
                  strokeDasharray="1"
                  strokeDashoffset={pathReveal}
                  opacity={0.68 - loss * (index % 3 === 0 ? 0.43 : 0.34)}
                  fill="none"
                />
              );
            })}

            {nodes.map((node, index) => {
              const pulse =
                (Math.sin(frame / 14 - index * 0.65) + 1) / 2;
              return (
                <g key={`node-${index}`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={9 + pulse * 4}
                    fill={YELLOW}
                    opacity={(0.15 + pulse * 0.2) * (1 - loss * 0.7)}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={index % 3 === 0 ? 4.5 : 3}
                    fill={index % 3 === 0 ? RED : INK}
                    opacity={0.9 - loss * 0.45}
                  />
                </g>
              );
            })}
          </svg>

          {[
            { left: 27, faded: false, angle: -5, label: "TADI MASIH JELAS" },
            { left: 690, faded: true, angle: 5, label: "TINGGAL POTONGAN" },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                position: "absolute",
                left: card.left,
                top: 70,
                width: 205,
                height: 172,
                padding: "9px 9px 0",
                boxSizing: "border-box",
                background: PAPER,
                boxShadow: "0 4px 12px rgba(32,35,32,0.12)",
                transform: `rotate(${card.angle}deg)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  left: 65,
                  width: 72,
                  height: 25,
                  background: "rgba(228,205,144,0.64)",
                  transform: "rotate(-7deg)",
                  borderLeft: "2px dotted rgba(255,253,246,0.5)",
                  borderRight: "2px dotted rgba(255,253,246,0.5)",
                  zIndex: 2,
                }}
              />
              <div style={{ width: 187, height: 116, overflow: "hidden" }}>
                <DreamSketch faded={card.faded} />
              </div>
              <div
                style={{
                  marginTop: 14,
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  color: card.faded ? MUTED : INK,
                }}
              >
                {card.label}
              </div>
            </div>
          ))}

          <div
            style={{
              position: "absolute",
              bottom: 15,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 17,
              color: MUTED,
              fontWeight: 600,
            }}
          >
            Waktu berlalu, detail memudar.
          </div>
        </div>
      </Sequence>

      {/* Beat 2 is an upper-area editorial quote, not a subtitle banner. */}
      <Sequence from={208} durationInFrames={167} zIndex={20}>
        <div
          style={{
            position: "absolute",
            top: 744,
            left: 88,
            width: 904,
            height: 199,
            boxSizing: "border-box",
            padding: "18px 31px 20px 42px",
            borderLeft: `5px solid ${RED}`,
            background: "rgba(255,253,246,0.9)",
            boxShadow: "0 3px 0 rgba(32,35,32,0.06)",
            opacity: range(frame, 208, 223, 0, 1),
            transform: `translateY(${(1 - secondEnter) * 16}px)`,
          }}
        >
          <div
            style={{
              marginBottom: 13,
              color: MUTED,
              fontSize: 15,
              letterSpacing: 2.4,
              fontWeight: 800,
            }}
          >
            PAGI-PAGI, YANG TERSISA:
          </div>

          <div>
            <Words
              text="“Kayaknya tadi gue"
              frame={frame}
              fps={fps}
              start={221}
              size={45}
              serif
              stagger={5}
            />
          </div>

          <div style={{ position: "relative", marginTop: 5 }}>
            <div
              style={{
                position: "absolute",
                left: 1,
                top: 27,
                width: 324,
                height: 20,
                background: YELLOW,
                transform: `scaleX(${range(frame, 253, 274, 0, 1)})`,
                transformOrigin: "left center",
              }}
            />
            <div style={{ position: "relative" }}>
              <Words
                text="mimpi sesuatu.”"
                frame={frame}
                fps={fps}
                start={250}
                size={45}
                serif
                stagger={6}
              />
            </div>

            <svg
              width="430"
              height="73"
              viewBox="0 0 430 73"
              style={{ position: "absolute", left: -14, top: -10 }}
              aria-hidden
            >
              <path
                d="M329 14C263 -1 67 1 22 22C-16 44 37 65 149 64C255 67 360 57 371 35C379 19 348 7 310 5"
                fill="none"
                stroke={RED}
                strokeWidth="3.5"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={quoteCircle}
              />
            </svg>
          </div>

          <svg
            width="104"
            height="104"
            viewBox="0 0 104 104"
            style={{
              position: "absolute",
              right: 23,
              top: 55,
              opacity: range(frame, 261, 278, 0, 0.85),
              transform: `rotate(${Math.sin(frame / 38) * 2}deg)`,
            }}
            aria-hidden
          >
            <path
              d="M20 26C13 18 14 8 23 8H79C88 8 92 18 87 26L73 47L84 73C88 82 82 90 74 90H28C19 90 15 82 19 74L31 48Z"
              fill="#F0EFE5"
              stroke={INK}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M26 26H76L52 45Z" fill={YELLOW} />
            <path d="M29 79L52 58L73 79Z" fill={YELLOW} />
            <path
              d="M52 47V53"
              stroke={RED}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M12 8H90M12 90H90"
              stroke={INK}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </Sequence>

      {/* Persistent host: no entry animation, no opacity change, no displacement. */}
      <div
        style={{
          position: "absolute",
          bottom: 270,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          zIndex: 30,
          pointerEvents: "none",
        }}
      >
        <MinoCharacter pose={chosenPose} scale={1.35} />
      </div>
    </div>
  );
};