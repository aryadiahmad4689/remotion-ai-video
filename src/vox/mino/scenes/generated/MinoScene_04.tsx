import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MinoCharacter, MinoPose } from "../../MinoCharacter";

const INK = "#192322";
const MUTED = "#68716C";
const YELLOW = "#FFE600";
const RED = "#E63946";
const FONT = 'Inter, Arial, Helvetica, sans-serif';
const SERIF = '"Playfair Display", Georgia, serif';

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const ramp = (
  frame: number,
  start: number,
  end: number,
  from = 0,
  to = 1,
) =>
  interpolate(
    frame,
    [start, Math.max(start + 0.001, end)],
    [from, to],
    CLAMP,
  );

const enter = (frame: number, fps: number, start: number) =>
  spring({
    frame: Math.max(0, frame - start),
    fps,
    config: { damping: 16, mass: 0.65, stiffness: 110 },
  });

/**
 * Frame-gated layer sequencing without additional Remotion imports.
 * Children intentionally retain the scene's absolute frame clock.
 */
const Sequence: React.FC<{
  from: number;
  durationInFrames: number;
  children: React.ReactNode;
}> = ({ from, durationInFrames, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= from + durationInFrames) return null;
  return <>{children}</>;
};

const Word: React.FC<{
  text: string;
  start: number;
  size?: number;
  color?: string;
  serif?: boolean;
  highlight?: boolean;
}> = ({
  text,
  start,
  size = 76,
  color = INK,
  serif = false,
  highlight = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = enter(frame, fps, start);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        isolation: "isolate",
        opacity: ramp(frame, start, start + 7),
        transform: `translateY(${(1 - progress) * 25}px)`,
        fontFamily: serif ? SERIF : FONT,
        fontSize: size,
        fontWeight: serif ? 700 : 850,
        letterSpacing: serif ? -2.3 : -3,
        lineHeight: 1.12,
        color,
      }}
    >
      {highlight ? (
        <span
          style={{
            position: "absolute",
            left: -7,
            right: -7,
            bottom: 4,
            height: "43%",
            background: YELLOW,
            zIndex: -1,
            transformOrigin: "left center",
            transform: `rotate(-1.8deg) scaleX(${ramp(
              frame,
              start + 4,
              start + 19,
            )})`,
          }}
        />
      ) : null}
      {text}
    </span>
  );
};

const NeuralArchive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrival = enter(frame, fps, 55);
  const pathway = ramp(frame, 76, 105);
  const cardArrival = enter(frame, fps, 91);
  const pulse = ramp(frame, 81, 109);
  const pulseOpacity =
    ramp(frame, 81, 86) * (1 - ramp(frame, 102, 109));
  const emphasis = ramp(frame, 113, 133);

  const nodes = [
    [147, 109],
    [195, 78],
    [249, 101],
    [283, 146],
    [230, 170],
    [182, 149],
    [143, 191],
    [218, 218],
    [279, 210],
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 462,
        left: 90,
        width: 900,
        height: 338,
        opacity: ramp(frame, 55, 66),
        transform: `translateY(${(1 - arrival) * 20}px)`,
      }}
    >
      <svg
        width={900}
        height={338}
        viewBox="0 0 900 338"
        style={{ overflow: "visible" }}
        aria-label="Jalur mimpi di otak menuju arsip ingatan yang belum tersimpan"
      >
        <defs>
          <linearGradient id="mino04-brain-fill" x1="0" x2="1">
            <stop offset="0%" stopColor="#FFE600" stopOpacity="0.19" />
            <stop offset="100%" stopColor="#FFE600" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        <text
          x="210"
          y="27"
          textAnchor="middle"
          fill={MUTED}
          fontFamily={FONT}
          fontSize="19"
          fontWeight="750"
          letterSpacing="3"
        >
          OTAK SAAT BERMIMPI
        </text>

        <path
          d="M209 59 C183 43 157 56 149 77
             C116 74 94 101 101 127
             C77 147 86 182 108 193
             C100 225 128 246 155 241
             C175 268 207 259 219 244
             C242 267 272 254 280 231
             C311 235 333 206 324 182
             C348 154 329 127 308 120
             C307 88 280 74 258 81
             C247 59 227 52 209 59 Z"
          fill="url(#mino04-brain-fill)"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        <path
          d="M210 69 C199 103 215 124 205 147
             C192 174 216 193 210 240
             M147 109 L195 78 L249 101 L283 146
             L230 170 L182 149 L147 109
             M182 149 L143 191 L218 218 L279 210 L230 170
             M195 78 L182 149 M249 101 L230 170
             M143 191 L230 170 M218 218 L182 149"
          fill="none"
          stroke={INK}
          strokeOpacity="0.35"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {nodes.map(([x, y], index) => {
          const activation =
            ramp(frame, 63 + index * 3, 72 + index * 3) *
            (0.85 + Math.sin(frame * 0.075 + index) * 0.15);

          return (
            <g key={`${x}-${y}`}>
              <circle
                cx={x}
                cy={y}
                r={8 + activation * 5}
                fill={YELLOW}
                opacity={activation * 0.45}
              />
              <circle
                cx={x}
                cy={y}
                r={4.5}
                fill={activation > 0.3 ? INK : MUTED}
              />
            </g>
          );
        })}

        <path
          d="M337 156 C392 123 450 124 510 155"
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeDasharray="7 9"
          pathLength={1}
          strokeDashoffset={1 - pathway}
          opacity={pathway * 0.5}
        />

        <circle
          cx={337 + pulse * 157}
          cy={156 - Math.sin(pulse * Math.PI) * 25}
          r={8}
          fill={YELLOW}
          stroke={INK}
          strokeWidth="2"
          opacity={pulseOpacity}
        />

        <g opacity={ramp(frame, 103, 114)}>
          <circle cx="514" cy="156" r="18" fill="#FFF9E7" />
          <path
            d="M505 147 L523 165 M523 147 L505 165"
            stroke={RED}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        <g
          transform={`translate(578 ${43 + (1 - cardArrival) * 18}) rotate(4 118 120)`}
          opacity={ramp(frame, 91, 102)}
        >
          <rect
            x="5"
            y="8"
            width="237"
            height="244"
            rx="3"
            fill={INK}
            opacity="0.07"
          />
          <rect
            width="237"
            height="244"
            rx="3"
            fill="#FFFEF8"
            stroke="#C9CDC3"
            strokeWidth="2"
          />
          <rect
            x="16"
            y="19"
            width="205"
            height="156"
            fill="#EEF0E8"
            stroke="#A4ADA1"
            strokeDasharray="7 6"
          />

          <g opacity="0.28">
            <circle cx="163" cy="56" r="18" fill="#B6BCAF" />
            <path
              d="M24 163 L86 88 L131 136 L169 103 L214 163 Z"
              fill="#B6BCAF"
            />
            <path
              d="M81 32 C66 45 85 57 77 70"
              fill="none"
              stroke={MUTED}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          <text
            x="118"
            y="207"
            textAnchor="middle"
            fill={INK}
            fontFamily={FONT}
            fontSize="17"
            fontWeight="800"
            letterSpacing="1"
          >
            ARSIP INGATAN
          </text>
          <text
            x="118"
            y="229"
            textAnchor="middle"
            fill={MUTED}
            fontFamily={FONT}
            fontSize="13"
            letterSpacing="1"
          >
            BELUM TERSIMPAN
          </text>

          <path
            d="M80 -10 L153 -6 L149 24 L77 18 Z"
            fill="#E4D89D"
            opacity="0.83"
          />

          <path
            d="M33 222 C29 193 215 192 220 218
               C228 248 32 253 33 222
               M42 228 C33 201 201 198 215 218"
            fill="none"
            stroke={RED}
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - emphasis}
            opacity={emphasis}
          />
        </g>

        <text
          x="424"
          y="218"
          textAnchor="middle"
          fill={MUTED}
          fontFamily={FONT}
          fontSize="17"
          fontWeight="600"
          opacity={ramp(frame, 106, 118)}
        >
          belum sempat
        </text>
        <text
          x="424"
          y="242"
          textAnchor="middle"
          fill={MUTED}
          fontFamily={FONT}
          fontSize="17"
          fontWeight="600"
          opacity={ramp(frame, 109, 121)}
        >
          disimpan
        </text>

        <g opacity={ramp(frame, 122, 137)}>
          <path
            d="M133 306 Q450 318 766 304"
            fill="none"
            stroke={INK}
            strokeWidth="1"
            opacity="0.2"
          />
          <text
            x="450"
            y="335"
            textAnchor="middle"
            fill={INK}
            fontFamily={FONT}
            fontSize="21"
            fontWeight="700"
            letterSpacing="1.5"
          >
            MENGALAMI MIMPI ≠ MENGINGAT MIMPI
          </text>
        </g>
      </svg>
    </div>
  );
};

export const MinoScene_04: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chosenPose: MinoPose = frame >= 158 ? "waving" : "idle";
  const closing = enter(frame, fps, 158);

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
      {/* Transparent atmospheric accents: the master owns the paper. */}
      <Sequence from={0} durationInFrames={222}>
        <div
          style={{
            position: "absolute",
            top: 440,
            left: 114,
            width: 360,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(255,230,0,0.12) 0%, rgba(255,230,0,0) 70%)",
            transform: `translateX(${Math.sin(frame / fps * 0.65) * 8}px)`,
            pointerEvents: "none",
          }}
        />
      </Sequence>

      <Sequence from={13} durationInFrames={209}>
        <div
          style={{
            position: "absolute",
            top: 182,
            left: 100,
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: ramp(frame, 13, 23),
            zIndex: 10,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              background: RED,
              borderRadius: "50%",
            }}
          />
          <span
            style={{
              fontSize: 20,
              fontWeight: 750,
              letterSpacing: 3,
              color: MUTED,
            }}
          >
            04 / CATATAN PENUTUP
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            top: 236,
            left: 98,
            right: 80,
            zIndex: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <Word text="Mimpinya" start={22} serif />
            <Word text="mungkin" start={31} size={65} serif />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 19,
              marginTop: 6,
            }}
          >
            <Word text="BUKAN" start={43} />
            <Word text="HILANG." start={52} highlight />
          </div>
          <div
            style={{
              display: "flex",
              gap: 9,
              flexWrap: "wrap",
              marginTop: 25,
            }}
          >
            {["Otak", "belum", "sempat", "menyimpan."].map((word, index) => (
              <span
                key={word}
                style={{
                  display: "inline-block",
                  fontSize: 30,
                  lineHeight: 1.3,
                  fontWeight: 500,
                  color: MUTED,
                  opacity: ramp(frame, 77 + index * 5, 85 + index * 5),
                  transform: `translateY(${
                    (1 - enter(frame, fps, 77 + index * 5)) * 12
                  }px)`,
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </Sequence>

      <Sequence from={55} durationInFrames={167}>
        <NeuralArchive />
      </Sequence>

      <Sequence from={158} durationInFrames={64}>
        <div
          style={{
            position: "absolute",
            top: 853,
            left: 100,
            right: 100,
            minHeight: 91,
            display: "flex",
            alignItems: "center",
            gap: 25,
            zIndex: 20,
            opacity: ramp(frame, 158, 169),
            transform: `translateY(${(1 - closing) * 14}px)`,
          }}
        >
          <div
            style={{
              position: "relative",
              padding: "10px 18px",
              background: YELLOW,
              transform: "rotate(-2deg)",
              fontSize: 44,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            MINO
          </div>

          <div style={{ display: "flex", gap: 11, alignItems: "baseline" }}>
            {["tetap", "penasaran."].map((word, index) => (
              <span
                key={word}
                style={{
                  display: "inline-block",
                  fontFamily: SERIF,
                  fontSize: 44,
                  fontWeight: 700,
                  fontStyle: "italic",
                  letterSpacing: -1.5,
                  opacity: ramp(frame, 173 + index * 8, 182 + index * 8),
                  transform: `translateY(${
                    (1 - enter(frame, fps, 173 + index * 8)) * 15
                  }px)`,
                }}
              >
                {word}
              </span>
            ))}
          </div>

          <svg
            width="54"
            height="60"
            viewBox="0 0 54 60"
            style={{
              marginLeft: "auto",
              flexShrink: 0,
              opacity: ramp(frame, 193, 206),
              transform: `rotate(${(1 - enter(frame, fps, 193)) * -16}deg)`,
            }}
            aria-hidden="true"
          >
            <path
              d="M27 5 L30 21 L45 13 L35 27 L51 32
                 L34 35 L40 51 L27 40 L16 55 L19 37
                 L3 34 L19 28 L10 13 L25 22 Z"
              fill={YELLOW}
              stroke={INK}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Sequence>

      {/* Persistent host: no entrance, opacity animation, or translation. */}
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