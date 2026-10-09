import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  paper: "#F5F2EB",
  white: "#FFFEFA",
  ink: "#18181B",
  muted: "#76746D",
  line: "#DAD6CC",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
};

const FONT = '"Arial", "Helvetica Neue", sans-serif';
const MONO = '"Courier New", monospace';

const ramp = (
  frame: number,
  start: number,
  end: number,
  from = 0,
  to = 1,
) =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const settle = (frame: number, fps: number, cue: number) =>
  spring({
    frame: Math.max(0, frame - cue),
    fps,
    config: { damping: 18, mass: 0.7, stiffness: 95 },
  });

type TimelineProps = {
  frame: number;
  from: number;
  durationInFrames: number;
  established?: boolean;
  children: React.ReactNode;
};

/**
 * A scene-local timeline layer. Absolute scene frames are preserved so that
 * all diagrams, typography, and crossfades share the same deterministic clock.
 */
const TimelineLayer: React.FC<TimelineProps> = ({
  frame,
  from,
  durationInFrames,
  established = false,
  children,
}) => {
  const entrance = established ? 1 : ramp(frame, from, from + 24);
  const end = from + durationInFrames;
  const exit = end >= 1586 ? 1 : ramp(frame, end - 24, end, 1, 0);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: Math.min(entrance, exit),
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
};

const KineticText: React.FC<{
  text: string;
  frame: number;
  fps: number;
  cue: number;
  size?: number;
  color?: string;
  weight?: number;
  stagger?: number;
}> = ({
  text,
  frame,
  fps,
  cue,
  size = 30,
  color = C.ink,
  weight = 700,
  stagger = 3,
}) => (
  <span
    style={{
      fontFamily: FONT,
      fontSize: size,
      fontWeight: weight,
      color,
      lineHeight: 1.2,
    }}
  >
    {text.split(" ").map((word, index) => {
      const delay = cue + index * stagger;
      const progress = settle(frame, fps, delay);
      return (
        <span
          key={`${word}-${index}`}
          style={{
            display: "inline-block",
            marginRight: size * 0.24,
            opacity: ramp(frame, delay, delay + 12),
            transform: `translateY(${(1 - progress) * 14}px)`,
          }}
        >
          {word}
        </span>
      );
    })}
  </span>
);

const Highlight: React.FC<{
  frame: number;
  cue: number;
  children: React.ReactNode;
}> = ({ frame, cue, children }) => (
  <span style={{ position: "relative", display: "inline-block", zIndex: 0 }}>
    <span
      style={{
        position: "absolute",
        left: -4,
        right: -5,
        bottom: 1,
        height: "58%",
        background: C.yellow,
        transform: `scaleX(${ramp(frame, cue, cue + 30)}) rotate(-1deg)`,
        transformOrigin: "left center",
        zIndex: -1,
      }}
    />
    {children}
  </span>
);

const Icon: React.FC<{
  kind: "moon" | "bolt" | "people" | "phone" | "eye";
  color?: string;
  size?: number;
}> = ({ kind, color = C.ink, size = 30 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    stroke={color}
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {kind === "moon" && (
      <path d="M29 29A15 15 0 0 1 13 5a15 15 0 1 0 21 21A15 15 0 0 1 29 29Z" />
    )}
    {kind === "bolt" && <path d="M23 3 8 23h12l-3 14 16-22H21Z" />}
    {kind === "people" && (
      <>
        <circle cx="15" cy="12" r="5" />
        <path d="M5 32v-4a10 10 0 0 1 20 0v4M27 7a5 5 0 0 1 0 10M30 23a8 8 0 0 1 6 9" />
      </>
    )}
    {kind === "phone" && (
      <>
        <rect x="10" y="3" width="20" height="34" rx="4" />
        <path d="M17 7h6M18 32h4" />
      </>
    )}
    {kind === "eye" && (
      <>
        <path d="M3 20s6-10 17-10 17 10 17 10-6 10-17 10S3 20 3 20Z" />
        <circle cx="20" cy="20" r="4" />
      </>
    )}
  </svg>
);

const Badge: React.FC<{
  frame: number;
  fps: number;
  cue: number;
  text: string;
  color?: string;
  background?: string;
}> = ({
  frame,
  fps,
  cue,
  text,
  color = C.ink,
  background = C.yellow,
}) => {
  const s = settle(frame, fps, cue);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: 40,
        background,
        color,
        fontFamily: MONO,
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: 0.5,
        opacity: ramp(frame, cue, cue + 16),
        transform: `translateX(${(1 - s) * 24}px)`,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
        }}
      />
      {text}
    </div>
  );
};

const BrainLoop: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const loop = ramp(frame, 422, 530);
  const trigger = ramp(frame, 563, 625);
  const gap = ramp(frame, 757, 835);
  const phase = ((frame * 0.0018) % 1) * Math.PI * 2;
  const pulseX = 380 + Math.cos(phase) * 220;
  const pulseY = 225 + Math.sin(phase) * 130;

  return (
    <div
      style={{
        position: "absolute",
        left: 944,
        top: 292,
        width: 880,
        height: 548,
        border: `1px solid ${C.line}`,
        borderRadius: 22,
        background: "rgba(255,254,250,0.76)",
        boxShadow: "0 14px 40px rgba(24,24,27,0.035)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 25,
          fontFamily: MONO,
          fontSize: 15,
          color: C.muted,
          letterSpacing: 2,
        }}
      >
        02 / POLA YANG BERULANG
      </div>

      <svg
        viewBox="0 0 760 430"
        style={{
          position: "absolute",
          left: 52,
          top: 70,
          width: 776,
          height: 438,
          overflow: "visible",
        }}
      >
        <defs>
          <marker
            id="s04-arrow-teal"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="m1 1 7 4-7 4" fill="none" stroke={C.teal} strokeWidth="1.6" />
          </marker>
          <marker
            id="s04-arrow-ink"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="m1 1 7 4-7 4" fill="none" stroke={C.ink} strokeWidth="1.6" />
          </marker>
        </defs>

        <ellipse
          cx="380"
          cy="225"
          rx="220"
          ry="130"
          fill="none"
          stroke={C.line}
          strokeWidth="2"
          strokeDasharray="4 9"
        />
        <path
          d="M186 169C235 57 501 44 578 165"
          fill="none"
          stroke={C.teal}
          strokeWidth="4"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - ramp(frame, 563, 671)}
          markerEnd={trigger > 0.95 ? "url(#s04-arrow-teal)" : undefined}
        />
        <path
          d="M591 242C539 389 222 409 161 254"
          fill="none"
          stroke={C.ink}
          strokeWidth="3"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - loop}
          markerEnd={loop > 0.95 ? "url(#s04-arrow-ink)" : undefined}
        />

        <g transform={`translate(0 ${Math.sin(frame * 0.018) * 2.5})`}>
          <path
            d="M378 139C356 122 331 134 323 153C295 145 275 163 279 188C257 207 265 232 283 239C278 266 301 283 322 277C336 302 361 299 379 283C399 300 428 296 439 276C463 281 485 261 479 239C502 224 501 197 480 185C485 162 462 144 438 153C428 129 400 124 378 139Z"
            fill="#ECEAE2"
            stroke={C.ink}
            strokeWidth="2.5"
          />
          <path
            d="M379 143v139M323 153c-12 20 2 31 18 29M280 189c19-9 30 5 30 19M287 239c18-17 39-9 44 12M340 188c-7 16 12 24 28 18M322 276c0-15 17-24 30-15M439 155c13 20-2 31-18 29M479 187c-18-7-29 7-29 20M473 238c-19-15-36-5-42 14M416 190c8 16-10 25-27 17M435 275c-2-16-18-24-32-14"
            fill="none"
            stroke="#98988F"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M308 217 341 187 378 218 412 187 451 217 411 252 378 218 343 254 308 217"
            fill="none"
            stroke={C.teal}
            strokeWidth={2 + loop}
            opacity={0.2 + loop * 0.65}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {[
            [308, 217],
            [341, 187],
            [378, 218],
            [412, 187],
            [451, 217],
            [411, 252],
            [343, 254],
          ].map(([x, y], i) => {
            const glow = (Math.sin(frame * 0.055 - i * 0.9) + 1) / 2;
            return (
              <g key={i} opacity={0.25 + loop * 0.75}>
                <circle
                  cx={x}
                  cy={y}
                  r={6 + glow * 6}
                  fill={C.teal}
                  opacity={0.08 + glow * 0.08}
                />
                <circle cx={x} cy={y} r={3 + glow} fill={C.teal} />
              </g>
            );
          })}
        </g>

        <circle
          cx={pulseX}
          cy={pulseY}
          r={5}
          fill={frame >= 422 ? C.teal : C.ink}
          opacity={0.25 + loop * 0.55}
        />

        <g transform={`translate(93 ${180 + Math.sin(frame * 0.02) * 2})`}>
          <rect
            width="174"
            height="79"
            rx="14"
            fill={C.white}
            stroke={trigger > 0 ? C.teal : C.line}
            strokeWidth="2"
          />
          <circle cx="26" cy="39" r="7" fill={C.teal} opacity={0.4 + trigger * 0.6} />
          <text x="47" y="35" fontFamily={FONT} fontSize="21" fontWeight="700" fill={C.ink}>
            Pemicu
          </text>
          <text x="47" y="56" fontFamily={FONT} fontSize="13" fill={C.muted}>
            terasa familiar
          </text>
        </g>

        <g transform={`translate(503 ${180 - Math.sin(frame * 0.02) * 2})`}>
          <rect width="174" height="79" rx="14" fill={C.white} stroke={C.line} strokeWidth="2" />
          <text x="23" y="35" fontFamily={FONT} fontSize="21" fontWeight="700" fill={C.ink}>
            Tindakan
          </text>
          <text x="23" y="56" fontFamily={FONT} fontSize="13" fill={C.muted}>
            dilakukan lagi
          </text>
        </g>

        <g opacity={loop}>
          <rect x="315" y="333" width="135" height="34" rx="17" fill={C.yellow} />
          <text
            x="382"
            y="355"
            textAnchor="middle"
            fontFamily={MONO}
            fontSize="14"
            fontWeight="700"
            fill={C.ink}
          >
            DIULANG
          </text>
        </g>

        <path
          d="M301 325C330 304 438 305 464 333C480 359 455 383 384 383C306 386 283 355 301 325M307 319C348 298 439 308 466 333"
          fill="none"
          stroke={C.red}
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - ramp(frame, 457, 519)}
          opacity={loop}
        />

        <g opacity={gap}>
          <path
            d="M379 64v56"
            stroke={C.blue}
            strokeWidth="2"
            strokeDasharray="4 6"
          />
          <rect x="303" y="21" width="152" height="39" rx="8" fill="#EAF0FD" />
          <text
            x="379"
            y="46"
            textAnchor="middle"
            fontFamily={FONT}
            fontSize="17"
            fontWeight="700"
            fill={C.blue}
          >
            “Aku sudah tahu”
          </text>
          <path d="m370 89 18 18m0-18-18 18" stroke={C.red} strokeWidth="3" />
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          bottom: 19,
          left: 30,
          right: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${C.line}`,
          paddingTop: 14,
          fontSize: 13,
          fontFamily: MONO,
          letterSpacing: 0.6,
          color: C.muted,
        }}
      >
        <span>SKEMA PERILAKU · ILUSTRASI KONSEPTUAL</span>
        <span style={{ color: C.teal }}>● POLA AKTIF</span>
      </div>
    </div>
  );
};

const ScrollAct: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const elapsed = Math.round(ramp(frame, 26, 215, 0, 30));
  const scroll = ramp(frame, 45, 192, 0, 260);
  const habit = ramp(frame, 422, 457);

  return (
    <div style={{ position: "absolute", left: 96, top: 294, width: 796, height: 545 }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 364 }}>
        <div
          style={{
            width: 238,
            height: 390,
            position: "relative",
            marginLeft: 38,
            border: `8px solid ${C.ink}`,
            borderRadius: 34,
            background: C.ink,
            boxShadow: "12px 17px 0 rgba(24,24,27,0.07)",
            transform: `rotate(-3deg) translateY(${Math.sin(frame * 0.018) * 3}px)`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "13px 8px 24px",
              overflow: "hidden",
              borderRadius: 18,
              background: "#E8E6DF",
            }}
          >
            <div style={{ transform: `translateY(${-scroll}px)` }}>
              {[C.teal, C.blue, "#C87150", "#707F66"].map((color, i) => (
                <div
                  key={color}
                  style={{
                    height: 212,
                    marginBottom: 12,
                    position: "relative",
                    background: color,
                    overflow: "hidden",
                  }}
                >
                  <svg width="206" height="212" viewBox="0 0 206 212">
                    <circle cx={146 - i * 13} cy="67" r="66" fill="white" opacity="0.12" />
                    <path d="M-15 196 77 79l62 78 41-49 62 100Z" fill="white" opacity="0.18" />
                    <circle cx="101" cy="101" r="24" fill="white" opacity="0.85" />
                    <path d="m96 88 16 13-16 13Z" fill={color} />
                    <rect x="16" y="166" width="112" height="5" rx="2" fill="white" opacity="0.7" />
                    <rect x="16" y="179" width="79" height="4" rx="2" fill="white" opacity="0.4" />
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      top: 13,
                      left: 13,
                      color: "white",
                      fontFamily: MONO,
                      fontSize: 12,
                    }}
                  >
                    VIDEO {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 74,
              width: 74,
              height: 13,
              borderRadius: "0 0 12px 12px",
              background: C.ink,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 82,
              width: 58,
              height: 4,
              background: "white",
              borderRadius: 4,
            }}
          />
        </div>
        <div style={{ marginTop: 25, marginLeft: 35 }}>
          <Badge frame={frame} fps={fps} cue={26} text="SATU VIDEO LAGI" background="#E9E6DD" />
        </div>
      </div>

      <div style={{ position: "absolute", left: 337, top: 12, width: 437 }}>
        <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 2, color: C.muted }}>
          WAKTU BERLALU
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 124,
            fontWeight: 800,
            letterSpacing: -8,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <Highlight frame={frame} cue={180}>{String(elapsed).padStart(2, "0")}</Highlight>
          <span style={{ fontSize: 31, letterSpacing: -1, marginLeft: 14 }}>menit</span>
        </div>
        <div style={{ marginTop: 20 }}>
          <KineticText text="Tanpa terasa." frame={frame} fps={fps} cue={164} size={32} />
        </div>

        <div
          style={{
            marginTop: 41,
            paddingTop: 23,
            borderTop: `1px solid ${C.line}`,
            opacity: ramp(frame, 230, 250),
          }}
        >
          <div style={{ color: C.muted, fontSize: 22, marginBottom: 8 }}>
            Tidak selalu menikmati.
          </div>
          <KineticText
            text="Tetap melanjutkan."
            frame={frame}
            fps={fps}
            cue={250}
            size={31}
          />
          <svg width="390" height="20" viewBox="0 0 390 20" style={{ display: "block" }}>
            <path
              d="M2 11Q176 3 344 10"
              stroke={C.red}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - ramp(frame, 302, 338)}
            />
          </svg>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 336,
          top: 407,
          width: 440,
          opacity: habit,
          transform: `translateY(${(1 - settle(frame, fps, 422)) * 15}px)`,
        }}
      >
        <div style={{ fontSize: 25, fontWeight: 700 }}>
          Pengulangan → <Highlight frame={frame} cue={457}>kebiasaan</Highlight>
        </div>
        <div style={{ marginTop: 9, fontSize: 18, color: C.muted }}>
          Pola mulai terbentuk.
        </div>
      </div>
    </div>
  );
};

const MechanismAct: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => (
  <div style={{ position: "absolute", left: 96, top: 300, width: 796, height: 532 }}>
    <div style={{ fontFamily: MONO, fontSize: 16, color: C.muted, letterSpacing: 2 }}>
      01 / DARI PENGULANGAN KE KEBIASAAN
    </div>
    <div style={{ marginTop: 27, fontSize: 46, fontWeight: 800, letterSpacing: -1.8 }}>
      <KineticText text="Pemicu yang familiar." frame={frame} fps={fps} cue={563} size={46} />
    </div>

    <div style={{ display: "flex", alignItems: "center", marginTop: 34, gap: 18 }}>
      <div
        style={{
          width: 246,
          padding: "23px 20px",
          background: "#E4EFEB",
          border: `1px solid #BEDAD2`,
          borderRadius: 13,
          opacity: ramp(frame, 563, 587),
          transform: `translateY(${(1 - settle(frame, fps, 563)) * 18}px)`,
        }}
      >
        <Icon kind="phone" color={C.teal} size={34} />
        <div style={{ marginTop: 15, fontSize: 26, fontWeight: 700 }}>Buka aplikasi</div>
        <div style={{ marginTop: 7, fontSize: 18, color: C.muted }}>Situasi yang dikenali</div>
      </div>
      <svg width="81" height="44" viewBox="0 0 81 44">
        <path
          d="M3 22h67m-13-12 14 12-14 12"
          stroke={C.teal}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - ramp(frame, 608, 650)}
        />
      </svg>
      <div
        style={{
          width: 246,
          padding: "23px 20px",
          background: C.white,
          border: `1px solid ${C.line}`,
          borderRadius: 13,
          opacity: ramp(frame, 641, 665),
          transform: `translateY(${(1 - settle(frame, fps, 641)) * 18}px)`,
        }}
      >
        <Icon kind="eye" size={34} />
        <div style={{ marginTop: 15, fontSize: 26, fontWeight: 700 }}>Lanjut menonton</div>
        <div style={{ marginTop: 7, fontSize: 18, color: C.muted }}>Tindakan yang sama</div>
      </div>
    </div>

    <div style={{ marginTop: 26 }}>
      <Badge
        frame={frame}
        fps={fps}
        cue={681}
        text="TANPA BANYAK PERTIMBANGAN"
        background="#E9E6DD"
      />
    </div>

    <div
      style={{
        position: "absolute",
        left: 0,
        top: 383,
        width: 765,
        paddingTop: 22,
        borderTop: `1px solid ${C.line}`,
        opacity: ramp(frame, 757, 777),
      }}
    >
      <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1.4 }}>
        <KineticText text="Tahu" frame={frame} fps={fps} cue={757} size={42} color={C.blue} />
        <span
          style={{
            display: "inline-block",
            padding: "0 19px 0 8px",
            color: C.red,
            opacity: ramp(frame, 779, 799),
          }}
        >
          ≠
        </span>
        <KineticText text="melakukan" frame={frame} fps={fps} cue={799} size={42} />
      </div>
      <div style={{ marginTop: 16, fontSize: 23 }}>
        <Highlight frame={frame} cue={823}>Pengetahuan saja tidak selalu cukup.</Highlight>
      </div>
    </div>
  </div>
);

const ExampleRow: React.FC<{
  frame: number;
  fps: number;
  cue: number;
  index: string;
  icon: "moon" | "bolt" | "people";
  knowledge: string;
  behavior: string;
}> = ({ frame, fps, cue, index, icon, knowledge, behavior }) => {
  const s = settle(frame, fps, cue);
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        height: 114,
        marginTop: 14,
        padding: "0 19px",
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        background: C.white,
        opacity: ramp(frame, cue, cue + 22),
        transform: `translateY(${(1 - s) * 20}px)`,
        boxShadow: "0 5px 13px rgba(24,24,27,0.025)",
      }}
    >
      <div
        style={{
          width: 49,
          height: 49,
          borderRadius: 12,
          background: "#EAF0FD",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginRight: 19,
        }}
      >
        <Icon kind={icon} color={C.blue} size={29} />
      </div>
      <div style={{ width: 279 }}>
        <div style={{ fontFamily: MONO, fontSize: 12, color: C.muted, marginBottom: 8 }}>
          {index} / TAHU
        </div>
        <KineticText text={knowledge} frame={frame} fps={fps} cue={cue + 9} size={22} />
      </div>
      <div
        style={{
          width: 48,
          color: C.red,
          fontSize: 28,
          opacity: ramp(frame, cue + 35, cue + 52),
        }}
      >
        ≠
      </div>
      <div style={{ flex: 1, opacity: ramp(frame, cue + 48, cue + 68) }}>
        <div style={{ fontFamily: MONO, fontSize: 12, color: C.muted, marginBottom: 8 }}>
          TETAP
        </div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>
          <Highlight frame={frame} cue={cue + 66}>{behavior}</Highlight>
        </div>
      </div>
    </div>
  );
};

const ExamplesAct: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => (
  <div style={{ position: "absolute", left: 96, top: 300, width: 796, height: 548 }}>
    <div style={{ fontFamily: MONO, fontSize: 16, color: C.muted, letterSpacing: 2 }}>
      03 / DALAM KEHIDUPAN SEHARI-HARI
    </div>
    <div style={{ marginTop: 15, marginBottom: 22 }}>
      <KineticText
        text="Tahu, tetapi tetap…"
        frame={frame}
        fps={fps}
        cue={949}
        size={43}
      />
    </div>

    <ExampleRow
      frame={frame}
      fps={fps}
      cue={949}
      index="01"
      icon="moon"
      knowledge="Tidur lebih awal"
      behavior="Tidur larut"
    />
    <ExampleRow
      frame={frame}
      fps={fps}
      cue={1108}
      index="02"
      icon="bolt"
      knowledge="Marah memperburuk"
      behavior="Bereaksi impulsif"
    />
    <ExampleRow
      frame={frame}
      fps={fps}
      cue={1298}
      index="03"
      icon="people"
      knowledge="Membandingkan merugikan"
      behavior="Membandingkan diri"
    />

    <div style={{ position: "absolute", top: 501, left: 0 }}>
      <Badge
        frame={frame}
        fps={fps}
        cue={1467}
        text="PEMICU: MEMBUKA MEDIA SOSIAL"
        color={C.teal}
        background="#E1EEE8"
      />
    </div>
  </div>
);

export const Scene_04: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const scale = Math.min(width / 1920, height / 1080);
  const actTwo = ramp(frame, 543, 567);
  const actThree = ramp(frame, 949, 973);
  const ambient = Math.sin(frame * 0.012);
  const titleDrift = Math.sin(frame * 0.009) * 0.7;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: C.paper,
        overflow: "hidden",
        fontFamily: FONT,
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
        {/* Background hierarchy: paper, drafting grid, and slow ambient light. */}
        <TimelineLayer frame={frame} from={0} durationInFrames={1586} established>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(24,24,27,0.055) 1px, transparent 0)",
              backgroundSize: "28px 28px",
              opacity: 0.46,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 1190 + ambient * 20,
              top: 180 + Math.cos(frame * 0.009) * 15,
              width: 550,
              height: 550,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,230,0,0.09), rgba(255,230,0,0) 70%)",
              transform: `scale(${1 + ambient * 0.035})`,
            }}
          />
          <svg
            width="1920"
            height="900"
            viewBox="0 0 1920 900"
            style={{ position: "absolute", inset: 0, opacity: 0.22 }}
          >
            <path d="M70 273h1780M70 862h1780" stroke={C.line} />
            <path d="M923 293v547" stroke={C.line} strokeDasharray="3 9" />
            <path
              d={`M${1050 + ramp(frame, 0, 1585, 0, 630)} 304v478`}
              stroke={C.teal}
              strokeWidth="1"
              opacity="0.12"
            />
          </svg>
        </TimelineLayer>

        {/* An established editorial frame is present on the very first frame. */}
        <TimelineLayer frame={frame} from={0} durationInFrames={1586} established>
          <div
            style={{
              position: "absolute",
              top: 65,
              left: 96,
              right: 96,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              <div
                style={{
                  width: 41,
                  height: 30,
                  background: C.yellow,
                  transform: "skewX(-10deg)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                04
              </div>
              <span style={{ fontSize: 16, fontFamily: MONO, letterSpacing: 2.4 }}>
                PERILAKU / KEBIASAAN
              </span>
            </div>
            <span style={{ fontSize: 14, fontFamily: MONO, color: C.muted, letterSpacing: 2 }}>
              INVESTIGASI · 04 / 08
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              left: 96,
              top: 136,
              transform: `translateY(${titleDrift}px)`,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                lineHeight: 1.04,
                letterSpacing: -3.7,
              }}
            >
              Ketika <Highlight frame={frame} cue={422}>kebiasaan</Highlight> mengambil alih.
            </div>
            <div
              style={{
                marginTop: 20,
                fontSize: 24,
                color: C.muted,
                letterSpacing: -0.3,
              }}
            >
              Bukan hanya soal apa yang kita ketahui—tetapi pola yang terus kita ulang.
            </div>
          </div>

          <BrainLoop frame={frame} fps={fps} />
        </TimelineLayer>

        {/* Three long visual acts; the diagram persists through both crossfades. */}
        <TimelineLayer frame={frame} from={0} durationInFrames={567} established>
          <ScrollAct frame={frame} fps={fps} />
        </TimelineLayer>

        <TimelineLayer frame={frame} from={543} durationInFrames={430}>
          <MechanismAct frame={frame} fps={fps} />
        </TimelineLayer>

        <TimelineLayer frame={frame} from={949} durationInFrames={637}>
          <ExamplesAct frame={frame} fps={fps} />
        </TimelineLayer>

        {/* Editorial navigation stays above the master caption-safe region. */}
        <TimelineLayer frame={frame} from={0} durationInFrames={1586} established>
          <div
            style={{
              position: "absolute",
              left: 96,
              right: 96,
              top: 874,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: 1.6,
              color: C.muted,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 19 }}>
              {[
                { label: "01 PENGULANGAN", active: 1 - actTwo },
                { label: "02 PEMICU", active: actTwo * (1 - actThree) },
                { label: "03 TAHU ≠ MELAKUKAN", active: actThree },
              ].map(({ label, active }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: C.ink,
                      opacity: 0.16 + active * 0.84,
                      transform: `scale(${1 + active * 0.2})`,
                    }}
                  />
                  <span style={{ opacity: 0.4 + active * 0.6 }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ width: 150, height: 3, background: C.line }}>
              <div
                style={{
                  height: 3,
                  width: `${ramp(frame, 0, 1585, 0, 100)}%`,
                  background: C.ink,
                }}
              />
            </div>
          </div>
        </TimelineLayer>
      </div>
    </div>
  );
};