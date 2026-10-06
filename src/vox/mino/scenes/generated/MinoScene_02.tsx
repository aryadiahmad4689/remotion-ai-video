import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MinoCharacter, MinoPose } from "../../MinoCharacter";

const INK = "#202523";
const MUTED = "#68716A";
const YELLOW = "#FFE600";
const RED = "#E63946";
const GREEN = "#386653";
const FONT = 'Inter, Arial, Helvetica, sans-serif';
const SERIF = '"Playfair Display", Georgia, serif';

const map = (
  value: number,
  start: number,
  end: number,
  from: number,
  to: number,
) =>
  interpolate(value, [start, Math.max(start + 0.001, end)], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const enter = (frame: number, fps: number, start: number) =>
  spring({
    frame: Math.max(0, frame - start),
    fps,
    config: { damping: 16, mass: 0.5, stiffness: 100 },
  });

/**
 * Frame-gated editorial layers. Children intentionally share the scene clock
 * so every spoken-cue offset remains an absolute scene-frame value.
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

const Words: React.FC<{
  text: string;
  start: number;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({ text, start, stagger = 3, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <span style={style}>
      {text.split(" ").map((word, index) => {
        const cue = start + index * stagger;
        const progress = enter(frame, fps, cue);
        return (
          <React.Fragment key={`${word}-${index}`}>
            {index > 0 ? " " : null}
            <span
              style={{
                display: "inline-block",
                opacity: map(frame, cue, cue + 9, 0, 1),
                transform: `translateY(${(1 - progress) * 17}px)`,
              }}
            >
              {word}
            </span>
          </React.Fragment>
        );
      })}
    </span>
  );
};

const BrainDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = map(frame, 35, 85, 0, 1);
  const signal = map(frame, 63, 120, 0, 1);
  const nodes = [
    [108, 94],
    [163, 63],
    [213, 109],
    [264, 77],
    [309, 125],
    [143, 157],
    [204, 189],
    [266, 164],
    [113, 216],
    [291, 226],
  ];

  return (
    <svg
      viewBox="0 0 420 285"
      width="420"
      height="285"
      role="img"
      aria-label="Jalur saraf otak saat tidur; tidak semua mimpi menjadi ingatan jangka panjang"
      style={{ display: "block", overflow: "visible" }}
    >
      <path
        d="M205 39 C179 16 143 28 130 50 C101 41 72 61 73 86
           C40 100 37 129 52 151 C35 179 55 209 80 214
           C77 245 108 264 138 253 C154 276 186 269 205 249
           C226 274 260 274 278 250 C310 264 342 242 339 213
           C368 203 382 174 366 150 C385 119 369 91 343 84
           C340 53 310 35 282 46 C261 21 226 20 205 39 Z"
        fill="#E4ECE2"
        stroke={GREEN}
        strokeWidth="3"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - draw}
      />
      <path
        d="M205 44 C191 79 221 95 203 123 C184 149 220 162 204 190
           C190 211 214 229 205 249"
        fill="none"
        stroke={GREEN}
        strokeWidth="2"
        opacity={draw * 0.5}
      />
      <g
        fill="none"
        stroke={GREEN}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity={draw * 0.6}
      >
        <path d="M108 94 L163 63 L213 109 L264 77 L309 125 L266 164 L291 226" />
        <path d="M108 94 L143 157 L113 216 M143 157 L204 189 L266 164" />
        <path d="M213 109 L143 157 M213 109 L266 164 M204 189 L213 109" />
      </g>
      <path
        d="M108 94 L143 157 L204 189 L266 164 L309 125"
        fill="none"
        stroke={YELLOW}
        strokeWidth="8"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - signal}
        opacity={0.95}
      />
      {nodes.map(([x, y], index) => {
        const progress = enter(frame, fps, 44 + index * 3);
        const pulse =
          1 + Math.sin(frame / 15 - index * 0.7) * 0.12 * progress;
        return (
          <g key={index} opacity={map(frame, 44 + index * 3, 56 + index * 3, 0, 1)}>
            <circle
              cx={x}
              cy={y}
              r={11 * progress * pulse}
              fill={index % 3 === 0 ? YELLOW : "#F7F8EF"}
              stroke={GREEN}
              strokeWidth="2.5"
            />
            <circle cx={x} cy={y} r={3 * progress} fill={GREEN} />
          </g>
        );
      })}
      <g opacity={map(frame, 28, 45, 0, 1)} fill={INK}>
        <text x="334" y="30" fontFamily={SERIF} fontSize="29">
          z
        </text>
        <text x="358" y="10" fontFamily={SERIF} fontSize="21">
          z
        </text>
      </g>
    </svg>
  );
};

const DreamArchive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrival = enter(frame, fps, 57);
  const circle = map(frame, 112, 143, 0, 1);

  return (
    <div
      style={{
        position: "relative",
        width: 360,
        height: 320,
        opacity: map(frame, 57, 70, 0, 1),
        transform: `translateY(${(1 - arrival) * 20}px) rotate(${(1 - arrival) * 4 + 2}deg)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "9px -7px 3px 9px",
          backgroundColor: "#DEE2D5",
          border: "1px solid #B9C1B5",
          transform: "rotate(-5deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FFFDF5",
          border: "1px solid #CCCFC2",
          boxShadow: "0 9px 18px rgba(32,37,35,0.09)",
          padding: "18px 20px",
          boxSizing: "border-box",
        }}
      >
        <svg
          viewBox="0 0 320 175"
          width="320"
          height="175"
          role="img"
          aria-label="Polaroid ilustrasi mimpi"
          style={{ display: "block" }}
        >
          <rect width="320" height="175" fill="#273D3B" />
          <circle cx="237" cy="45" r="24" fill="#F6E9A7" />
          <circle cx="249" cy="35" r="23" fill="#273D3B" />
          <path d="M0 141 L69 68 L144 145 L211 89 L320 160 V175 H0Z" fill="#56766A" />
          <path d="M0 166 L90 120 L177 170 L253 131 L320 166 V175 H0Z" fill="#789389" />
          <path
            d="M55 48 C45 34 29 45 35 55 C18 53 16 70 33 72 H88
               C107 69 100 48 84 52 C82 35 61 32 55 48Z"
            fill="#E5ECD7"
            opacity="0.88"
          />
          {[30, 109, 157, 186, 285].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy={22 + ((i * 23) % 59)}
              r={2}
              fill="#FFF9D9"
              opacity={0.6 + Math.sin(frame / 19 + i) * 0.2}
            />
          ))}
        </svg>
        <div
          style={{
            marginTop: 12,
            fontFamily: FONT,
            fontSize: 19,
            letterSpacing: 3,
            color: MUTED,
            fontWeight: 700,
          }}
        >
          <Words text="ARSIP JANGKA PANJANG" start={82} stagger={4} />
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 35,
            color: INK,
          }}
        >
          <Words text="Tidak selalu." start={101} stagger={5} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: -14,
          left: 117,
          width: 116,
          height: 32,
          backgroundColor: "rgba(223,205,154,0.76)",
          borderLeft: "2px dashed rgba(124,103,63,0.2)",
          borderRight: "2px dashed rgba(124,103,63,0.2)",
          transform: "rotate(-7deg)",
        }}
      />
      <svg
        width="360"
        height="320"
        viewBox="0 0 360 320"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <path
          d="M21 263 C30 234 280 224 294 257 C311 291 42 303 22 271
             C13 246 223 227 293 248"
          fill="none"
          stroke={RED}
          strokeWidth="4"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - circle}
        />
      </svg>
    </div>
  );
};

const WakeCard: React.FC<{
  index: number;
  start: number;
  title: string;
  detail: string;
  type: "wake" | "attention" | "memory";
}> = ({ index, start, title, detail, type }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = enter(frame, fps, start);
  const memory = map(frame, 300, 355, 1, 0.2);
  const ray = map(frame, start + 5, start + 30, 0, 1);

  return (
    <div
      style={{
        position: "relative",
        width: 284,
        height: 177,
        boxSizing: "border-box",
        backgroundColor: type === "attention" ? "#F6F3CF" : "#FBFAF3",
        border: `1.5px solid ${type === "memory" ? "#D7C1BC" : "#CCD1C5"}`,
        borderRadius: 12,
        padding: "14px 18px",
        opacity: map(frame, start, start + 11, 0, 1),
        transform: `translateY(${(1 - progress) * 24}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          right: 17,
          top: 16,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 15,
          color: MUTED,
          letterSpacing: 2,
        }}
      >
        {`0${index + 1}`}
      </div>
      <svg width="61" height="51" viewBox="0 0 64 54" aria-hidden="true">
        {type === "wake" ? (
          <g stroke={GREEN} strokeWidth="2.8" fill="none" strokeLinecap="round">
            <path d="M6 43 H58" />
            <path d="M18 39 A14 14 0 0 1 46 39" fill={YELLOW} />
            <g opacity={ray}>
              <path d="M32 9 V17 M11 20 L17 26 M53 20 L47 26 M4 34 H11 M53 34 H60" />
            </g>
          </g>
        ) : type === "attention" ? (
          <g stroke={GREEN} strokeWidth="2.8" fill="none" strokeLinejoin="round">
            <path d="M8 27 Q32 1 56 27 Q32 53 8 27Z" />
            <circle cx={32 + ray * 5} cy="27" r="8" fill={YELLOW} />
            <path d="M44 8 H58 V22 M58 8 L46 20" />
          </g>
        ) : (
          <g fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round">
            <path
              d="M15 36 C4 32 9 18 19 19 C20 4 42 5 45 20
                 C61 16 65 37 49 39 H16"
              opacity={memory}
              strokeDasharray="4 5"
            />
            <path d="M18 47 H47" opacity="0.5" />
          </g>
        )}
      </svg>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 27,
          lineHeight: 1.2,
          fontWeight: 800,
          marginTop: 5,
          color: INK,
          letterSpacing: -0.7,
        }}
      >
        <Words text={title} start={start + 5} />
      </div>
      <div
        style={{
          marginTop: 9,
          fontFamily: FONT,
          fontSize: 19,
          lineHeight: 1.3,
          color: type === "memory" ? "#9C4045" : MUTED,
        }}
      >
        <Words text={detail} start={start + 12} stagger={3} />
      </div>
    </div>
  );
};

export const MinoScene_02: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headline = enter(frame, fps, 16);
  const marker = map(frame, 32, 63, 0, 1);
  const connector = map(frame, 74, 104, 0, 1);

  const chosenPose: MinoPose =
    frame < 55
      ? "curious"
      : frame < 165
        ? "pointing"
        : frame < 216
          ? "idle"
          : frame < 298
            ? "pointing"
            : "curious";

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
        isolation: "isolate",
      }}
    >
      <Sequence from={0} durationInFrames={370}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 95,
            top: 335,
            width: 440,
            height: 365,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(185,203,163,0.16), rgba(185,203,163,0) 70%)",
            opacity: map(frame, 11, 45, 0, 1),
            transform: `translateX(${Math.sin(frame / 65) * 8}px)`,
            zIndex: 0,
          }}
        />
      </Sequence>

      <Sequence from={11} durationInFrames={359}>
        <div
          style={{
            position: "absolute",
            left: 84,
            right: 84,
            top: 180,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 3.2,
              color: GREEN,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: GREEN,
                opacity: map(frame, 11, 22, 0, 1),
              }}
            />
            <Words text="CATATAN OTAK / 02" start={11} stagger={2} />
          </div>

          <div
            style={{
              marginTop: 19,
              fontFamily: SERIF,
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -3.5,
              transform: `translateY(${(1 - headline) * 5}px)`,
            }}
          >
            <Words text="Mimpi bukan" start={17} stagger={5} />
            <br />
            <span style={{ position: "relative", display: "inline-block" }}>
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: -5,
                  right: -10,
                  bottom: 6,
                  height: 25,
                  backgroundColor: YELLOW,
                  transform: `rotate(-1deg) scaleX(${marker})`,
                  transformOrigin: "left center",
                  zIndex: -1,
                }}
              />
              <Words text="arsip permanen." start={29} stagger={5} />
            </span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 397,
            left: 86,
            width: 908,
            height: 320,
            zIndex: 12,
          }}
        >
          <div style={{ position: "absolute", left: 0, top: 5 }}>
            <BrainDiagram />
            <div
              style={{
                position: "absolute",
                left: 90,
                top: 279,
                fontSize: 20,
                fontWeight: 700,
                color: GREEN,
                letterSpacing: 1.5,
              }}
            >
              <Words text="OTAK SAAT TIDUR" start={43} stagger={3} />
            </div>
          </div>

          <svg
            width="130"
            height="130"
            viewBox="0 0 130 130"
            style={{ position: "absolute", left: 412, top: 79 }}
            aria-hidden="true"
          >
            <path
              d="M5 68 C39 45 72 46 109 65"
              fill="none"
              stroke={MUTED}
              strokeWidth="2.5"
              strokeDasharray="5 7"
              pathLength="1"
              strokeDashoffset={1 - connector}
              opacity={connector}
            />
            <path
              d="M98 52 L111 65 L94 70"
              fill="none"
              stroke={MUTED}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={connector}
            />
            <path
              d="M56 58 L71 74 M71 58 L56 74"
              stroke={RED}
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity={map(frame, 103, 115, 0, 1)}
            />
          </svg>

          <div style={{ position: "absolute", right: 8, top: 0 }}>
            <DreamArchive />
          </div>
        </div>
      </Sequence>

      <Sequence from={186} durationInFrames={184}>
        <div
          style={{
            position: "absolute",
            top: 742,
            left: 84,
            right: 84,
            zIndex: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 15,
              marginBottom: 13,
              color: INK,
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: 1.2,
            }}
          >
            <span
              style={{
                width: 33,
                height: 4,
                backgroundColor: YELLOW,
                transform: `scaleX(${map(frame, 186, 201, 0, 1)})`,
                transformOrigin: "left",
              }}
            />
            <Words text="BEGITU KITA BANGUN…" start={186} stagger={4} />
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            <WakeCard
              index={0}
              start={190}
              title="Kita bangun"
              detail="Tidur selesai"
              type="wake"
            />
            <WakeCard
              index={1}
              start={223}
              title="Fokus beralih"
              detail="Ke dunia nyata"
              type="attention"
            />
            <WakeCard
              index={2}
              start={283}
              title="Mimpi memudar"
              detail="Ingatan cepat pudar"
              type="memory"
            />
          </div>
        </div>
      </Sequence>

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