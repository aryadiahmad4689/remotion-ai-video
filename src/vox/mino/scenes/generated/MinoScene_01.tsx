import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MinoCharacter, MinoPose } from "../../MinoCharacter";
import { VoxSoundEffect } from "../../../VoxSoundEffect";

const INK = "#222320";
const MUTED = "#77766E";
const YELLOW = "#FFE600";
const RED = "#E63946";
const PAPER = "#FFFEF8";

const SANS = '"Inter", "Arial", sans-serif';
const SERIF = '"Playfair Display", "Georgia", serif';

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const mix = (
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
    clamp,
  );

const entrance = (frame: number, fps: number, delay: number) =>
  frame < delay
    ? 0
    : spring({
        frame: frame - delay,
        fps,
        config: { damping: 15, mass: 0.65, stiffness: 110 },
      });

type WordsProps = {
  text: string;
  frame: number;
  fps: number;
  start: number;
  stagger?: number;
  style?: React.CSSProperties;
};

const Words: React.FC<WordsProps> = ({
  text,
  frame,
  fps,
  start,
  stagger = 4,
  style,
}) => (
  <span style={style}>
    {text.split(" ").map((word, index) => {
      const delay = start + index * stagger;
      const progress = entrance(frame, fps, delay);

      return (
        <React.Fragment key={`${word}-${index}`}>
          {index > 0 ? " " : null}
          <span
            style={{
              display: "inline-block",
              opacity: mix(frame, delay, delay + 9, 0, 1),
              transform: `translateY(${(1 - progress) * 23}px)`,
            }}
          >
            {word}
          </span>
        </React.Fragment>
      );
    })}
  </span>
);

const Tape: React.FC<{ rotate: number }> = ({ rotate }) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: -14,
      width: 126,
      height: 31,
      transform: `translateX(-50%) rotate(${rotate}deg)`,
      background: "rgba(225, 210, 168, 0.74)",
      borderLeft: "2px dashed rgba(153, 135, 93, 0.22)",
      borderRight: "2px dashed rgba(153, 135, 93, 0.22)",
      zIndex: 3,
    }}
  />
);

type MemoryDiagramProps = {
  frame: number;
  fps: number;
  fragmented?: boolean;
};

const MemoryDiagram: React.FC<MemoryDiagramProps> = ({
  frame,
  fps,
  fragmented = false,
}) => {
  const reveal = mix(frame, fragmented ? 170 : 64, fragmented ? 205 : 100, 0, 1);
  const forgetting = mix(frame, 183, 239, 0, 1);
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * 2.2);

  const nodes = [
    { x: 64, y: 118 },
    { x: 112, y: 67 },
    { x: 160, y: 109 },
    { x: 195, y: 52 },
    { x: 241, y: 104 },
    { x: 292, y: 73 },
    { x: 320, y: 131 },
    { x: 260, y: 174 },
    { x: 198, y: 151 },
    { x: 123, y: 173 },
  ];

  const edges = [
    [0, 1],
    [0, 9],
    [1, 2],
    [1, 3],
    [2, 3],
    [2, 8],
    [2, 9],
    [3, 4],
    [4, 5],
    [4, 8],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
  ];

  return (
    <svg
      viewBox="0 0 380 230"
      width="100%"
      height="100%"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <rect
        x="0"
        y="0"
        width="380"
        height="230"
        fill={fragmented ? "#ECEBE4" : "#242B35"}
      />

      {[45, 90, 135, 180].map((y) => (
        <path
          key={y}
          d={`M0 ${y} H380`}
          stroke={fragmented ? "#DAD8CD" : "#39404A"}
          strokeWidth="1"
        />
      ))}

      {[55, 110, 165, 220, 275, 330].map((x) => (
        <path
          key={x}
          d={`M${x} 0 V230`}
          stroke={fragmented ? "#DAD8CD" : "#39404A"}
          strokeWidth="1"
        />
      ))}

      <path
        d="M61 139 C35 93 70 42 113 40 C125 16 176 16 191 35 C221 17 260 27 273 49 C316 42 351 78 340 119 C360 150 331 187 295 184 C275 211 228 205 208 186 C174 208 125 205 112 183 C77 186 53 165 61 139Z"
        fill="none"
        stroke={fragmented ? "#B4B2A7" : "#BDC7CF"}
        strokeWidth="2"
        strokeDasharray={fragmented ? "4 7" : undefined}
        opacity={0.8}
      />

      {edges.map(([a, b], index) => {
        const first = nodes[a];
        const second = nodes[b];
        const broken = fragmented && index % 3 !== 0;
        const visibility = broken ? 1 - forgetting * 0.88 : 1;

        return (
          <path
            key={`${a}-${b}`}
            d={`M${first.x} ${first.y} Q${(first.x + second.x) / 2 + 8} ${
              (first.y + second.y) / 2 - 12
            } ${second.x} ${second.y}`}
            fill="none"
            stroke={fragmented ? "#898A80" : YELLOW}
            strokeWidth={fragmented ? 2 : 2.6}
            strokeLinecap="round"
            strokeDasharray={broken ? "8 12" : "220"}
            strokeDashoffset={broken ? 0 : 220 * (1 - reveal)}
            opacity={visibility * (fragmented ? 0.8 : 0.85)}
          />
        );
      })}

      {nodes.map((node, index) => {
        const lost = fragmented && index % 3 !== 0;
        const visibility = lost ? 1 - forgetting * 0.83 : 1;

        return (
          <g key={index} opacity={reveal * visibility}>
            {!fragmented && (
              <circle
                cx={node.x}
                cy={node.y}
                r={10 + pulse * 4}
                fill={YELLOW}
                opacity={0.08 + pulse * 0.06}
              />
            )}
            <circle
              cx={node.x}
              cy={node.y}
              r={fragmented ? 4 : 5}
              fill={fragmented ? "#93958A" : YELLOW}
            />
            {!fragmented && (
              <circle
                cx={node.x}
                cy={node.y}
                r="2"
                fill="#FFFEF4"
              />
            )}
          </g>
        );
      })}

      {fragmented ? (
        <g opacity={mix(frame, 208, 230, 0, 1)}>
          <rect
            x="159"
            y="78"
            width="65"
            height="80"
            rx="16"
            fill="#ECEBE4"
            opacity="0.95"
          />
          <text
            x="191"
            y="137"
            textAnchor="middle"
            fill={RED}
            fontFamily={SERIF}
            fontWeight="700"
            fontSize="66"
          >
            ?
          </text>
        </g>
      ) : (
        <g opacity={reveal}>
          <path
            d="M301 22 A15 15 0 1 0 319 43 A12 12 0 0 1 301 22Z"
            fill="#FFF3BB"
          />
          <path
            d="M43 31 V43 M37 37 H49 M332 190 V202 M326 196 H338"
            stroke="#FFF3BB"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}

      <text
        x="17"
        y="214"
        fill={fragmented ? "#858578" : "#C9D0D4"}
        fontFamily={SANS}
        fontSize="10"
        letterSpacing="2.2"
      >
        {fragmented ? "FRAGMEN INGATAN" : "PETA MIMPI"}
      </text>
    </svg>
  );
};

export const MinoScene_01: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const firstCard = entrance(frame, fps, 58);
  const secondCard = entrance(frame, fps, 163);
  const quote = entrance(frame, fps, 208);
  const arrow = mix(frame, 156, 180, 0, 1);
  const highlighter = mix(frame, 65, 92, 0, 1);
  const circle = mix(frame, 236, 268, 0, 1);
  const pose: MinoPose = frame >= 208 ? "confused" : "curious";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: 1080,
        height: 1920,
        overflow: "hidden",
        color: INK,
        fontFamily: SANS,
        isolation: "isolate",
      }}
    >
      {/* Procedural Sound Design */}
      <VoxSoundEffect type="paper_slide" cue={0} volume={0.4} />
      <VoxSoundEffect type="pop" cue={24} volume={0.4} />
      <VoxSoundEffect type="highlighter" cue={40} volume={0.45} />
      <VoxSoundEffect type="pop" cue={70} volume={0.35} />
      <VoxSoundEffect type="click" cue={208} volume={0.35} />

      {/* Transparent atmospheric layer; the master supplies the paper. */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 410,
          width: 850,
          height: 430,
          background:
            "radial-gradient(ellipse, rgba(255,230,0,0.10) 0%, rgba(255,230,0,0) 70%)",
          opacity: 0.65 + 0.12 * Math.sin((frame / fps) * 1.4),
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Floating editorial marks. */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      >
        <g opacity={mix(frame, 20, 45, 0, 0.6)}>
          <path
            d="M963 280 l12 -13 M972 306 h18 M958 325 l12 10"
            fill="none"
            stroke={INK}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M64 608 h19 M73.5 598.5 v19"
            stroke={RED}
            strokeWidth="2.5"
            transform={`rotate(${Math.sin((frame / fps) * 1.1) * 5} 73.5 608)`}
          />
        </g>
      </svg>

      {/* Beat 1: the vivid dream. All entered content stays on screen. */}
      <div
        style={{
          position: "absolute",
          left: 86,
          right: 86,
          top: 184,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: 3.3,
            height: 28,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              background: RED,
              borderRadius: "50%",
              opacity: mix(frame, 0, 12, 0, 1),
            }}
          />
          <Words
            text="MISTERI INGATAN"
            frame={frame}
            fps={fps}
            start={0}
          />
        </div>

        <div
          style={{
            marginTop: 20,
            fontFamily: SERIF,
            fontSize: 84,
            lineHeight: 1.08,
            fontWeight: 700,
            letterSpacing: -3.6,
          }}
        >
          <Words
            text="Mimpi terasa"
            frame={frame}
            fps={fps}
            start={24}
            stagger={7}
          />
        </div>

        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginTop: 6,
            padding: "0 11px 4px 4px",
            fontSize: 83,
            lineHeight: 1.08,
            fontWeight: 900,
            letterSpacing: -4,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -3,
              right: -7,
              top: 17,
              bottom: 3,
              background: YELLOW,
              clipPath:
                "polygon(0 7%, 99% 0, 100% 92%, 2% 100%)",
              transform: `scaleX(${highlighter}) rotate(-1deg)`,
              transformOrigin: "left center",
              zIndex: -1,
            }}
          />
          <Words
            text="NYATA BANGET."
            frame={frame}
            fps={fps}
            start={59}
            stagger={8}
          />
        </div>
      </div>

      {/* Archival comparison dossier. */}
      <div
        style={{
          position: "absolute",
          left: 89,
          top: 465,
          width: 407,
          height: 316,
          padding: "15px 15px 0",
          boxSizing: "border-box",
          background: PAPER,
          border: "1px solid #DDD9CC",
          boxShadow: "0 9px 18px rgba(37,34,24,0.10)",
          transform: `translateY(${(1 - firstCard) * 25}px) rotate(${
            -3 + (1 - firstCard) * -2
          }deg)`,
          opacity: mix(frame, 58, 73, 0, 1),
          zIndex: 12,
        }}
      >
        <Tape rotate={6} />
        <div style={{ width: "100%", height: 229 }}>
          <MemoryDiagram frame={frame} fps={fps} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 13,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 850,
              letterSpacing: -0.6,
            }}
          >
            <Words
              text="Saat bermimpi"
              frame={frame}
              fps={fps}
              start={70}
            />
          </span>
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 27,
              fontStyle: "italic",
              color: MUTED,
            }}
          >
            01
          </span>
        </div>
      </div>

      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 13,
          pointerEvents: "none",
        }}
      >
        <g opacity={arrow}>
          <path
            d="M506 598 C522 585 546 586 568 599 M555 588 L570 600 L553 608"
            fill="none"
            stroke={RED}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="120"
            strokeDashoffset={120 * (1 - arrow)}
          />
          <text
            x="538"
            y="641"
            textAnchor="middle"
            fontFamily={SERIF}
            fontSize="20"
            fontStyle="italic"
            fill={MUTED}
          >
            lalu…
          </text>
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          left: 583,
          top: 465,
          width: 407,
          height: 316,
          padding: "15px 15px 0",
          boxSizing: "border-box",
          background: PAPER,
          border: "1px solid #DDD9CC",
          boxShadow: "0 9px 18px rgba(37,34,24,0.10)",
          transform: `translateY(${(1 - secondCard) * 25}px) rotate(${
            3 + (1 - secondCard) * 2
          }deg)`,
          opacity: mix(frame, 163, 178, 0, 1),
          zIndex: 12,
        }}
      >
        <Tape rotate={-7} />
        <div style={{ width: "100%", height: 229 }}>
          <MemoryDiagram frame={frame} fps={fps} fragmented />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 13,
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 850,
              letterSpacing: -0.6,
            }}
          >
            <Words
              text="Beberapa detik kemudian"
              frame={frame}
              fps={fps}
              start={171}
              stagger={4}
            />
          </span>
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 27,
              fontStyle: "italic",
              color: MUTED,
              marginLeft: 8,
            }}
          >
            02
          </span>
        </div>
      </div>

      {/* Beat 2: an editorial pull quote, not a subtitle banner. */}
      <div
        style={{
          position: "absolute",
          left: 135,
          right: 135,
          top: 825,
          height: 125,
          textAlign: "center",
          transform: `translateY(${(1 - quote) * 15}px)`,
          opacity: mix(frame, 208, 220, 0, 1),
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 53,
            fontWeight: 700,
            fontStyle: "italic",
            lineHeight: 1.14,
            letterSpacing: -1.6,
          }}
        >
          <Words
            text="“Tadi aku mimpi"
            frame={frame}
            fps={fps}
            start={208}
            stagger={6}
          />
          <br />
          <span style={{ position: "relative", display: "inline-block" }}>
            <Words
              text="apa, ya?”"
              frame={frame}
              fps={fps}
              start={227}
              stagger={7}
            />
            <svg
              width="330"
              height="92"
              viewBox="0 0 330 92"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "50%",
                top: -12,
                transform: "translateX(-50%)",
                overflow: "visible",
                pointerEvents: "none",
              }}
            >
              <path
                d="M292 22 C239 -1 100 -3 40 22 C-3 43 26 77 113 81 C201 89 304 75 312 46 C317 28 286 13 265 12"
                fill="none"
                stroke={RED}
                strokeWidth="4"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={1 - circle}
                opacity={mix(frame, 236, 242, 0, 1)}
              />
            </svg>
          </span>
        </div>
      </div>

      {/* Persistent host: no entrance, fade, bounce, or positional changes. */}
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
        <MinoCharacter pose={pose} scale={1.35} />
      </div>
    </div>
  );
};