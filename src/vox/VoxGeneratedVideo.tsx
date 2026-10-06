import React from "react";
import {
  Audio,
  staticFile,
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * VoxGeneratedVideo.tsx
 * Composition: 1920 × 1080 · 30 fps · 1706 frames.
 * Required public asset: voiceover.mp3.
 * All graphics, textures, typography, and motion are generated here.
 */

const PAPER = "#F5F2EB";
const INK = "#242621";
const YELLOW = "#FFE600";
const RED = "#E63946";
const MUTED = "#77776F";
const TEAL = "#526F68";
const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const SANS = 'Arial, Helvetica, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = '"Courier New", monospace';

const easeSpring = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

const fadeIn = (frame: number, start = 0, length = 12) =>
  interpolate(frame, [start, start + length], [0, 1], CLAMP);

type Word = { w: string; s: number; e: number };

const EXACT_WORDS: Word[] = [
  { w: "Pernah", s: 0, e: 0.4 },
  { w: "masuk", s: 0.4, e: 0.62 },
  { w: "ke", s: 0.62, e: 0.8 },
  { w: "suatu", s: 0.8, e: 1.02 },
  { w: "tempat,", s: 1.02, e: 1.4 },
  { w: "terus", s: 1.88, e: 2.08 },
  { w: "tiba-", s: 2.08, e: 2.38 },
  { w: "tiba", s: 2.38, e: 2.5 },
  { w: "merasa", s: 2.5, e: 3 },
  { w: "gue", s: 3, e: 3.7 },
  { w: "pernah", s: 3.7, e: 3.96 },
  { w: "di sini.", s: 3.96, e: 4.4 },
  { w: "Padahal", s: 5, e: 5.52 },
  { w: "kalau", s: 5.52, e: 5.84 },
  { w: "dipikir-", s: 5.84, e: 6.22 },
  { w: "pikir,", s: 6.22, e: 6.7 },
  { w: "kamu", s: 7.32, e: 7.46 },
  { w: "belum", s: 7.46, e: 7.64 },
  { w: "pernah", s: 7.64, e: 7.88 },
  { w: "ke sana.", s: 7.88, e: 8.28 },
  { w: "Aneh", s: 8.98, e: 9.04 },
  { w: "kan?", s: 9.04, e: 9.3 },
  { w: "Fenomena", s: 9.9, e: 10.14 },
  { w: "ini", s: 10.14, e: 10.38 },
  { w: "disebut", s: 10.38, e: 10.82 },
  { w: "Déjà", s: 10.82, e: 11.62 },
  { w: "Vu.", s: 11.62, e: 11.82 },
  { w: "Otak", s: 12.48, e: 12.62 },
  { w: "kita", s: 12.62, e: 13.06 },
  { w: "kadang", s: 13.06, e: 13.36 },
  { w: "memproses", s: 13.36, e: 13.82 },
  { w: "pengalaman", s: 13.82, e: 14.34 },
  { w: "baru", s: 14.34, e: 14.72 },
  { w: "dengan", s: 14.98, e: 15.64 },
  { w: "cara", s: 15.64, e: 15.92 },
  { w: "yang", s: 15.92, e: 16.08 },
  { w: "membuatnya", s: 16.08, e: 16.54 },
  { w: "terasa", s: 16.54, e: 16.86 },
  { w: "seperti", s: 16.86, e: 17.24 },
  { w: "sesuatu", s: 17.24, e: 17.76 },
  { w: "yang", s: 17.76, e: 17.98 },
  { w: "pernah", s: 17.98, e: 18.2 },
  { w: "kita", s: 18.2, e: 18.6 },
  { w: "alami.", s: 18.6, e: 18.86 },
  { w: "Bukan", s: 19.52, e: 19.66 },
  { w: "berarti", s: 19.66, e: 19.96 },
  { w: "kamu", s: 19.96, e: 20.26 },
  { w: "benar-", s: 20.26, e: 20.6 },
  { w: "benar", s: 20.6, e: 20.8 },
  { w: "pernah", s: 20.8, e: 21.06 },
];

/**
 * The supplied word-level timestamps stop at 21.06 seconds.
 * Remaining timings are deterministic phrase-based estimates, not forced
 * alignment. Replace these estimates with full word timestamps if available.
 */
const estimatedPhrase = (text: string, start: number, end: number): Word[] => {
  const words = text.split(" ");
  const weights = words.map((word) => Math.max(2, word.replace(/[.,!?]/g, "").length));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = start;
  return words.map((w, index) => {
    const s = cursor;
    cursor += ((end - start) * weights[index]) / total;
    return { w, s, e: cursor };
  });
};

const WORDS: Word[] = [
  ...EXACT_WORDS,
  ...estimatedPhrase("melihat kejadian itu.", 21.06, 22.35),
  ...estimatedPhrase("Bisa jadi otak hanya menemukan kemiripan kecil", 22.7, 25.8),
  ...estimatedPhrase("dengan sesuatu yang pernah kamu lihat,", 25.8, 28.2),
  ...estimatedPhrase("dengar, atau alami sebelumnya.", 28.2, 30.6),
  ...estimatedPhrase("Misalnya suasana ruangan,", 31.05, 32.65),
  ...estimatedPhrase("posisi benda, atau bahkan perasaan yang mirip.", 32.65, 35.7),
  ...estimatedPhrase("Lalu otak seperti bilang, ini familiar,", 36.05, 38.75),
  ...estimatedPhrase("padahal sebenarnya belum tentu pernah terjadi.", 38.75, 41.05),
  ...estimatedPhrase("Jadi kalau suatu hari kamu merasa,", 41.4, 43.6),
  ...estimatedPhrase("gue kayaknya pernah mengalami ini.", 43.6, 45.6),
  ...estimatedPhrase("Tenang, mungkin bukan ingatan masa lalu.", 46, 48.65),
  ...estimatedPhrase("Otakmu cuma lagi bikin kamu merasa familiar", 49, 52.3),
  ...estimatedPhrase("dengan sesuatu yang baru.", 52.3, 53.85),
  ...estimatedPhrase("Ini Mino, tetap penasaran.", 54.25, 56.65),
];

const CAPTION_GROUPS: Word[][] = [];
for (const word of WORDS) {
  const current = CAPTION_GROUPS[CAPTION_GROUPS.length - 1];
  const previous = current?.[current.length - 1];
  if (
    !current ||
    current.length >= 7 ||
    (previous && (/[.!?]$/.test(previous.w) || word.s - previous.e > 0.42))
  ) {
    CAPTION_GROUPS.push([word]);
  } else {
    current.push(word);
  }
}

const Kinetic: React.FC<{
  text: string;
  size?: number;
  delay?: number;
  color?: string;
  serif?: boolean;
  style?: React.CSSProperties;
}> = ({ text, size = 72, delay = 0, color = INK, serif = false, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        fontFamily: serif ? SERIF : SANS,
        fontSize: size,
        fontWeight: serif ? 400 : 800,
        letterSpacing: serif ? -2 : -3,
        lineHeight: 1.06,
        color,
        ...style,
      }}
    >
      {text.split(" ").map((word, index) => {
        const progress = easeSpring(frame, fps, delay + index * 3);
        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: "inline-block",
              marginRight: "0.24em",
              opacity: fadeIn(frame, delay + index * 3, 8),
              transform: `translateY(${(1 - progress) * 38}px) rotate(${(1 - progress) * 3}deg)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const Label: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 20,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: MUTED,
      ...style,
    }}
  >
    {children}
  </div>
);

const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = easeSpring(frame, fps, delay);
  return (
    <div
      style={{
        opacity: fadeIn(frame, delay, 10),
        transform: `translateY(${(1 - progress) * 40}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const MarkerCircle: React.FC<{
  width?: number;
  height?: number;
  delay?: number;
  color?: string;
}> = ({ width = 470, height = 170, delay = 0, color = RED }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [delay, delay + 27], [0, 1], CLAMP);
  return (
    <svg width={width} height={height} viewBox="0 0 470 170" fill="none">
      <path
        d="M438 55C390 9 163 4 68 36C-19 65 24 129 123 144C236 163 434 144 449 100C461 63 409 34 358 29"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - progress}
      />
    </svg>
  );
};

const Highlighter: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [delay, delay + 22], [0, 1], CLAMP);
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <span
        style={{
          position: "absolute",
          left: -7,
          right: -7,
          top: "22%",
          height: "75%",
          background: YELLOW,
          transform: `scaleX(${wipe}) rotate(-0.8deg)`,
          transformOrigin: "left center",
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

const PaperBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drift = Math.sin((frame / fps) * 0.3) * 8;
  return (
    <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: -60,
          opacity: 0.19,
          transform: `translate(${drift}px, ${drift * 0.5}px)`,
          backgroundImage:
            "linear-gradient(#C7C5BA 1px, transparent 1px), linear-gradient(90deg, #C7C5BA 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="vox-paper-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves={3}
              seed={14}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect
          width="1920"
          height="1080"
          filter="url(#vox-paper-grain)"
          opacity={0.045}
        />
        {[
          [52, 52],
          [1868, 52],
          [52, 1028],
          [1868, 1028],
        ].map(([x, y], index) => (
          <g key={index} stroke={INK} strokeWidth={1} opacity={0.4}>
            <path d={`M${x - 12} ${y}h24M${x} ${y - 12}v24`} />
            <circle cx={x} cy={y} r={4} fill="none" />
          </g>
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 45% 35%, transparent 35%, rgba(88,75,50,0.075) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const Room: React.FC<{
  variant?: "new" | "memory";
  highlight?: boolean;
  style?: React.CSSProperties;
}> = ({ variant = "new", highlight = false, style }) => {
  const memory = variant === "memory";
  return (
    <svg
      viewBox="0 0 640 430"
      style={{ width: "100%", height: "100%", display: "block", ...style }}
    >
      <rect width="640" height="430" fill={memory ? "#D9DFD8" : "#E8DFCD"} />
      <path d="M0 0H640V300H0Z" fill={memory ? "#DDE4DD" : "#EAE3D5"} />
      <path d="M0 430V0L150 70V290Z" fill={memory ? "#C3CEC5" : "#D9CFBD"} />
      <path d="M640 430V0L525 70V290Z" fill={memory ? "#BBCBC6" : "#D4C7AF"} />
      <path d="M0 430L150 290H525L640 430Z" fill={memory ? "#ADBCB3" : "#BBA98B"} />
      <g stroke={INK} strokeWidth={2} opacity={0.45} fill="none">
        <path d="M0 0L150 70H525L640 0M150 70V290L0 430M525 70V290L640 430M150 290H525" />
        <path d="M210 430L280 290M430 430L395 290M70 362H583" opacity={0.25} />
      </g>
      <rect x="210" y="100" width="155" height="135" fill="#F5F2EB" stroke={INK} strokeWidth={3} />
      <rect x="220" y="110" width="135" height="115" fill={memory ? "#A4BCB3" : "#BCCCD0"} />
      <path d="M287 110V225M220 170H355" stroke="#F5F2EB" strokeWidth={8} />
      <path d="M220 198L257 162L281 185L320 143L355 184V225H220Z" fill={memory ? "#758F82" : "#8EA599"} />
      {memory ? (
        <>
          <rect x="405" y="117" width="60" height="82" fill="#E9DDC4" stroke={INK} strokeWidth={3} />
          <circle cx="435" cy="149" r="16" fill="#B98F76" />
          <path d="M413 183L435 158L457 183" fill="#788D7D" />
        </>
      ) : (
        <>
          <circle cx="435" cy="143" r="30" fill={PAPER} stroke={INK} strokeWidth={3} />
          <path d="M435 123V144L451 152" stroke={INK} strokeWidth={3} fill="none" />
        </>
      )}
      <ellipse cx="347" cy="345" rx="125" ry="38" fill={INK} opacity={0.1} />
      <path d="M232 274H462L441 301H250Z" fill={memory ? "#8D715C" : "#725B49"} stroke={INK} strokeWidth={3} />
      <path d="M257 301L248 365M429 301L439 365" stroke={INK} strokeWidth={9} />
      <path d="M323 272V220" stroke={INK} strokeWidth={5} />
      <path d="M290 227L303 188H343L357 227Z" fill={highlight ? YELLOW : "#D8B760"} stroke={INK} strokeWidth={3} />
      <ellipse cx="323" cy="274" rx="22" ry="5" fill={INK} />
      <path d="M510 319V267" stroke={INK} strokeWidth={4} />
      <path d="M483 280Q468 217 507 230Q542 191 546 241Q570 266 519 286" fill={memory ? "#627E63" : "#73855C"} stroke={INK} strokeWidth={2} />
      <path d="M489 302H537L528 339H498Z" fill={memory ? "#BC8A6D" : "#9D6D53"} stroke={INK} strokeWidth={2} />
      {highlight && (
        <g fill="none" stroke={YELLOW} strokeWidth={5}>
          <circle cx="324" cy="226" r="58" />
          <path d="M270 281H461" />
        </g>
      )}
    </svg>
  );
};

const SceneFrame: React.FC<{
  number: string;
  category: string;
  children: React.ReactNode;
}> = ({ number, category, children }) => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 110,
        top: 69,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #BDBDB1",
        paddingBottom: 20,
      }}
    >
      <Label style={{ color: INK }}>MINO / TETAP PENASARAN</Label>
      <Label>{number} — {category}</Label>
    </div>
    {children}
  </AbsoluteFill>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = easeSpring(frame, fps, 7);
  const deja = easeSpring(frame, fps, 291);
  const photoPan = interpolate(frame, [0, 270], [1.06, 1.13], CLAMP);
  return (
    <SceneFrame number="01" category="Catatan pengalaman">
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 153,
          width: 850,
          height: 697,
          padding: 42,
          boxSizing: "border-box",
          background: "#FFFCF5",
          border: "1px solid #D3CEBF",
          boxShadow: "8px 12px 0 rgba(42,40,30,0.07)",
          transform: `translateY(${(1 - card) * 75}px) rotate(-1.5deg)`,
          opacity: fadeIn(frame, 7),
        }}
      >
        <Label>ARSIP 001 / PENGAMATAN SEHARI-HARI</Label>
        <div style={{ marginTop: 26 }}>
          <Kinetic text="Rasanya pernah di sini." size={72} serif delay={15} />
        </div>
        <div
          style={{
            position: "relative",
            height: 350,
            marginTop: 30,
            overflow: "hidden",
            border: `1px solid ${INK}`,
          }}
        >
          <div style={{ width: "100%", height: "100%", transform: `scale(${photoPan})` }}>
            <Room />
          </div>
          <div
            style={{
              position: "absolute",
              right: 18,
              bottom: 18,
              padding: "8px 13px",
              background: PAPER,
              fontFamily: MONO,
              fontSize: 17,
            }}
          >
            LOKASI: BARU
          </div>
        </div>
        <div style={{ marginTop: 24, fontFamily: SERIF, fontSize: 32 }}>
          <Highlighter delay={85}>“Gue pernah di sini.”</Highlighter>
        </div>
      </div>

      <div style={{ position: "absolute", left: 1070, top: 190, width: 715 }}>
        <Label>CATATAN DI PINGGIR</Label>
        <div style={{ marginTop: 36 }}>
          <Kinetic text="Tempat baru." size={75} delay={40} />
        </div>
        <div style={{ marginTop: 13 }}>
          <Kinetic text="Rasa lama?" size={94} serif delay={76} />
        </div>
        <Reveal delay={145} style={{ marginTop: 48 }}>
          <div style={{ borderLeft: `5px solid ${RED}`, paddingLeft: 25 }}>
            <Kinetic text="Padahal belum pernah ke sana." size={38} delay={147} style={{ letterSpacing: -1, lineHeight: 1.25 }} />
          </div>
        </Reveal>
        <div
          style={{
            position: "relative",
            marginTop: 64,
            opacity: fadeIn(frame, 292),
            transform: `translateY(${(1 - deja) * 40}px)`,
          }}
        >
          <Label style={{ color: INK }}>NAMA FENOMENANYA</Label>
          <div style={{ marginTop: 16 }}>
            <Highlighter delay={313}>
              <Kinetic text="DÉJÀ VU" size={102} delay={297} />
            </Highlighter>
          </div>
          <div style={{ position: "absolute", left: -34, top: 17 }}>
            <MarkerCircle width={560} height={166} delay={327} />
          </div>
        </div>
      </div>
    </SceneFrame>
  );
};

const BrainDiagram: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = easeSpring(frame, fps, delay);
  const edges = [
    [158, 209, 265, 145],
    [265, 145, 384, 160],
    [384, 160, 466, 248],
    [158, 209, 222, 310],
    [222, 310, 346, 277],
    [346, 277, 466, 248],
    [265, 145, 346, 277],
    [384, 160, 346, 277],
    [222, 310, 336, 364],
    [336, 364, 460, 352],
    [460, 352, 466, 248],
    [346, 277, 460, 352],
  ];
  const nodes = [
    [158, 209],
    [265, 145],
    [384, 160],
    [466, 248],
    [222, 310],
    [346, 277],
    [336, 364],
    [460, 352],
  ];
  return (
    <svg
      viewBox="0 0 640 500"
      style={{
        width: "100%",
        height: "100%",
        transform: `scale(${0.92 + grow * 0.08})`,
        opacity: fadeIn(frame, delay),
      }}
    >
      <path
        d="M160 371C74 355 68 276 100 235C63 180 94 124 149 115C161 59 238 49 278 77C325 36 394 54 417 88C483 73 534 117 529 170C586 197 583 266 552 293C575 348 526 402 475 401C447 447 385 440 355 412C310 448 258 426 240 408C199 423 164 405 160 371Z"
        fill="#E4E6DC"
        stroke={INK}
        strokeWidth={4}
      />
      <g fill="none" stroke="#AFB6A8" strokeWidth={3}>
        <path d="M145 151Q186 122 215 160T277 138M116 253Q140 277 164 252M173 349Q162 317 196 303M300 92Q323 115 305 148M417 113Q460 143 432 181M499 192Q461 208 502 246M523 313Q477 289 485 323M384 393Q399 363 425 383" />
        <path d="M299 168Q312 213 287 240M247 337Q272 348 284 317M367 188Q403 212 383 237" />
      </g>
      {edges.map(([x1, y1, x2, y2], index) => {
        const progress = interpolate(
          frame,
          [delay + 12 + index * 3, delay + 34 + index * 3],
          [0, 1],
          CLAMP,
        );
        const pulse = (Math.sin(frame * 0.085 - index * 0.7) + 1) / 2;
        return (
          <g key={index}>
            <line
              x1={x1}
              y1={y1}
              x2={x1 + (x2 - x1) * progress}
              y2={y1 + (y2 - y1) * progress}
              stroke={TEAL}
              strokeWidth={3}
            />
            {progress > 0.99 && (
              <circle
                cx={x1 + (x2 - x1) * pulse}
                cy={y1 + (y2 - y1) * pulse}
                r={5}
                fill={YELLOW}
                stroke={INK}
                strokeWidth={1}
              />
            )}
          </g>
        );
      })}
      {nodes.map(([x, y], index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r={11 * easeSpring(frame, fps, delay + 14 + index * 4)}
          fill={index === 5 ? YELLOW : PAPER}
          stroke={INK}
          strokeWidth={3}
        />
      ))}
      <path d="M354 414Q365 451 392 460L417 452L404 412" fill="#D3D8CA" stroke={INK} strokeWidth={3} />
    </svg>
  );
};

const ProcessScene: React.FC = () => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [55, 98], [0, 1], CLAMP);
  return (
    <SceneFrame number="02" category="Pengalaman → familiar">
      <div style={{ position: "absolute", left: 115, top: 157 }}>
        <Label>DI DALAM KEPALA</Label>
        <Kinetic text="Baru, tapi terasa lama." size={82} serif delay={6} style={{ marginTop: 20 }} />
      </div>
      <Reveal delay={18} style={{ position: "absolute", left: 125, top: 370, width: 395 }}>
        <div style={{ background: "#FFFCF5", padding: 16, border: "1px solid #C4C1B5", transform: "rotate(-3deg)" }}>
          <div style={{ height: 252, overflow: "hidden" }}><Room /></div>
          <Label style={{ color: INK, marginTop: 20, marginBottom: 10 }}>01 / INPUT BARU</Label>
        </div>
        <Kinetic text="Pengalaman baru" size={35} delay={30} style={{ marginTop: 25, letterSpacing: -1 }} />
      </Reveal>

      <div style={{ position: "absolute", left: 621, top: 310, width: 635, height: 485 }}>
        <BrainDiagram delay={30} />
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <path
          d="M545 531H663M1235 531H1381"
          fill="none"
          stroke={INK}
          strokeWidth={3}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - line}
        />
        <path d="M647 520L663 531L647 542M1365 520L1381 531L1365 542" fill="none" stroke={INK} strokeWidth={3} opacity={line} />
      </svg>
      <Label style={{ position: "absolute", top: 800, left: 768 }}>SKEMA KONSEPTUAL OTAK</Label>

      <Reveal delay={88} style={{ position: "absolute", left: 1420, top: 395, width: 360 }}>
        <Label>02 / KESAN YANG MUNCUL</Label>
        <div style={{ marginTop: 34 }}>
          <Highlighter delay={108}>
            <Kinetic text="FAMILIAR" size={62} delay={92} />
          </Highlighter>
        </div>
        <Kinetic text="Seperti pernah dialami." size={40} serif delay={118} style={{ marginTop: 35, lineHeight: 1.2 }} />
      </Reveal>
    </SceneFrame>
  );
};

const MatchScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const match = easeSpring(frame, fps, 87);
  const proof = interpolate(frame, [0, 23], [0, 1], CLAMP);
  return (
    <SceneFrame number="03" category="Kemiripan kecil">
      <div style={{ position: "absolute", left: 115, top: 155, width: 1690 }}>
        <Kinetic text="Familiar ≠ pernah terjadi." size={84} delay={4} />
        <div style={{ position: "absolute", left: 0, top: 103, width: 870, height: 7, background: RED, transform: `scaleX(${proof})`, transformOrigin: "left" }} />
      </div>

      <Reveal delay={25} style={{ position: "absolute", left: 150, top: 338, width: 685 }}>
        <div style={{ padding: 18, background: "#FFFCF5", border: "1px solid #C7C2B7", boxShadow: "7px 9px 0 #DAD6C9", transform: "rotate(-2deg)" }}>
          <Label style={{ marginBottom: 16, color: INK }}>A / YANG SEDANG KAMU LIHAT</Label>
          <div style={{ height: 370 }}><Room highlight={frame > 100} /></div>
          <Label style={{ marginTop: 18 }}>TEMPAT BARU</Label>
        </div>
      </Reveal>
      <Reveal delay={44} style={{ position: "absolute", left: 1080, top: 338, width: 685 }}>
        <div style={{ padding: 18, background: "#FFFCF5", border: "1px solid #C7C2B7", boxShadow: "7px 9px 0 #DAD6C9", transform: "rotate(2deg)" }}>
          <Label style={{ marginBottom: 16, color: INK }}>B / POTONGAN PENGALAMAN LAMA</Label>
          <div style={{ height: 370 }}><Room variant="memory" highlight={frame > 100} /></div>
          <Label style={{ marginTop: 18 }}>BUKAN KEJADIAN YANG SAMA</Label>
        </div>
      </Reveal>

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <path
          d="M489 601C720 775 1150 775 1424 601"
          stroke={RED}
          strokeWidth={4}
          fill="none"
          strokeDasharray="9 9"
          opacity={fadeIn(frame, 88)}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 833,
          top: 470,
          width: 252,
          textAlign: "center",
          transform: `scale(${match}) rotate(-5deg)`,
          opacity: fadeIn(frame, 87),
        }}
      >
        <div style={{ background: YELLOW, border: `2px solid ${INK}`, padding: "21px 12px", fontFamily: SANS, fontSize: 31, fontWeight: 800 }}>
          ADA YANG<br />MIRIP
        </div>
      </div>
      <Reveal delay={125} style={{ position: "absolute", left: 570, top: 824, width: 780, textAlign: "center" }}>
        <Kinetic text="Detail kecil bisa terasa akrab." size={38} serif delay={128} />
      </Reveal>
    </SceneFrame>
  );
};

const DetailCard: React.FC<{
  index: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ index, title, subtitle, children }) => {
  const delay = 12 + index * 29;
  return (
    <Reveal
      delay={delay}
      style={{
        width: 510,
        height: 478,
        background: "#FFFCF5",
        border: "1px solid #C9C3B6",
        boxShadow: "6px 8px 0 #DED8CA",
        padding: 26,
        boxSizing: "border-box",
        transformOrigin: "bottom center",
      }}
    >
      <Label>DETAIL 0{index + 1}</Label>
      <div style={{ height: 254, marginTop: 15 }}>{children}</div>
      <Kinetic text={title} size={39} delay={delay + 9} style={{ marginTop: 22, letterSpacing: -1 }} />
      <Reveal delay={delay + 18}>
        <div style={{ marginTop: 12, fontFamily: SERIF, fontSize: 25, color: MUTED }}>{subtitle}</div>
      </Reveal>
    </Reveal>
  );
};

const DetailScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heartbeat = 1 + Math.sin((frame / fps) * 3) * 0.035;
  return (
    <SceneFrame number="04" category="Tiga petunjuk familiar">
      <div style={{ position: "absolute", left: 115, top: 157 }}>
        <Label>TIDAK HARUS SELURUH KEJADIAN</Label>
        <Kinetic text="Kadang, cukup satu detail." size={79} serif delay={6} style={{ marginTop: 22 }} />
      </div>
      <div style={{ position: "absolute", left: 150, right: 150, top: 355, display: "flex", gap: 45 }}>
        <DetailCard index={0} title="Suasana ruangan" subtitle="Cahaya. Warna. Nuansa.">
          <div style={{ height: "100%", overflow: "hidden", border: "1px solid #D0C8B9" }}>
            <Room />
          </div>
        </DetailCard>
        <DetailCard index={1} title="Posisi benda" subtitle="Pola yang terasa akrab.">
          <svg viewBox="0 0 460 254" width="100%" height="100%">
            <rect width="460" height="254" fill="#E8E4DA" />
            <path d="M42 211H420M78 35V227" stroke="#BBB6A9" strokeDasharray="5 6" />
            <rect x="112" y="95" width="236" height="95" rx="2" fill="#AC9278" stroke={INK} strokeWidth={3} />
            <rect x="122" y="105" width="216" height="75" fill="#BFA58A" stroke={INK} strokeWidth={1} />
            <circle cx="177" cy="141" r="25" fill={YELLOW} stroke={INK} strokeWidth={3} />
            <rect x="265" y="119" width="45" height="52" fill={PAPER} stroke={INK} strokeWidth={3} />
            <path d="M265 125H310M271 136H302M271 145H296" stroke={INK} strokeWidth={2} />
            <path d="M177 44V89M155 62L177 43L198 62" stroke={RED} strokeWidth={3} fill="none" />
            <circle cx="177" cy="141" r="42" fill="none" stroke={RED} strokeWidth={3} strokeDasharray="7 5" />
          </svg>
        </DetailCard>
        <DetailCard index={2} title="Perasaan yang mirip" subtitle="Bukan cuma yang terlihat.">
          <svg viewBox="0 0 460 254" width="100%" height="100%">
            <rect width="460" height="254" fill="#DDE5DE" />
            <g stroke="#BECABD" strokeWidth={1}>
              {[45, 90, 135, 180, 225].map((y) => <path key={y} d={`M25 ${y}H435`} />)}
            </g>
            <g transform={`translate(230 126) scale(${heartbeat}) translate(-230 -126)`}>
              <path d="M29 137H114L139 112L164 159L190 80L219 182L247 119L273 137H430" fill="none" stroke={TEAL} strokeWidth={4} />
              <circle cx="232" cy="127" r="68" fill={PAPER} stroke={INK} strokeWidth={3} />
              <path d="M232 164C208 146 182 123 197 104C209 88 226 101 232 111C241 92 263 93 271 108C282 129 253 151 232 164Z" fill={YELLOW} stroke={INK} strokeWidth={3} />
            </g>
          </svg>
        </DetailCard>
      </div>
    </SceneFrame>
  );
};

const FamiliarScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const thought = easeSpring(frame, fps, 16);
  const stamp = easeSpring(frame, fps, 86);
  const spin = Math.sin((frame / fps) * 0.8) * 1.2;
  return (
    <SceneFrame number="05" category="Sinyal, bukan bukti">
      <div style={{ position: "absolute", left: 120, top: 161 }}>
        <Kinetic text="Otak seperti bilang…" size={73} serif delay={5} />
      </div>
      <div style={{ position: "absolute", left: 133, top: 313, width: 650, height: 510 }}>
        <BrainDiagram delay={5} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 880,
          top: 303,
          width: 800,
          height: 260,
          background: "#FFFCF5",
          border: `3px solid ${INK}`,
          padding: "44px 47px",
          boxSizing: "border-box",
          transform: `translateY(${(1 - thought) * 50}px) rotate(${spin}deg)`,
          opacity: fadeIn(frame, 16),
        }}
      >
        <div style={{ position: "absolute", left: -38, top: 142, width: 66, height: 66, background: "#FFFCF5", borderLeft: `3px solid ${INK}`, borderBottom: `3px solid ${INK}`, transform: "rotate(45deg)" }} />
        <Label style={{ color: INK }}>KESAN YANG MUNCUL</Label>
        <div style={{ marginTop: 22 }}>
          <Highlighter delay={37}>
            <Kinetic text="“Ini familiar.”" size={91} serif delay={21} />
          </Highlighter>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 969,
          top: 630,
          border: `5px solid ${RED}`,
          padding: "22px 31px",
          color: RED,
          background: PAPER,
          transform: `scale(${1.4 - stamp * 0.4}) rotate(-7deg)`,
          opacity: fadeIn(frame, 86, 5),
        }}
      >
        <Kinetic text="BELUM TENTU PERNAH TERJADI" size={34} delay={86} color={RED} style={{ letterSpacing: 0 }} />
      </div>
      <Reveal delay={114} style={{ position: "absolute", left: 937, top: 778 }}>
        <Label>RASA AKRAB ≠ BUKTI INGATAN</Label>
      </Reveal>
    </SceneFrame>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shift = easeSpring(frame, fps, 12);
  const newReveal = interpolate(frame, [223, 259], [0, 1], CLAMP);
  return (
    <SceneFrame number="06" category="Jadi, tenang">
      <div
        style={{
          position: "absolute",
          left: 180,
          top: 160,
          width: 1560,
          height: 675,
          background: "#FFFCF5",
          border: "1px solid #CCC6B7",
          boxShadow: "10px 13px 0 #DFD9CB",
          transform: `translateY(${(1 - shift) * 55}px) rotate(-0.6deg)`,
          opacity: fadeIn(frame, 12),
        }}
      >
        <div style={{ position: "absolute", left: 54, top: 45 }}>
          <Label>CATATAN PENUTUP / UNTUK LAIN KALI</Label>
        </div>
        <div style={{ position: "absolute", left: 57, top: 112, width: 1120 }}>
          <Kinetic text="“Gue kayaknya pernah mengalami ini.”" size={76} serif delay={20} style={{ lineHeight: 1.15 }} />
        </div>
        <div style={{ position: "absolute", left: 64, top: 323 }}>
          <Highlighter delay={140}>
            <Kinetic text="Tenang." size={111} delay={137} />
          </Highlighter>
        </div>
        <div style={{ position: "absolute", left: 67, top: 468, width: 1040 }}>
          <Kinetic text="Mungkin bukan ingatan masa lalu." size={50} delay={160} style={{ letterSpacing: -1 }} />
          <div style={{ marginTop: 22 }}>
            <Kinetic text="Bisa jadi rasa familiar pada sesuatu yang baru." size={44} serif delay={233} style={{ lineHeight: 1.2 }} />
          </div>
        </div>

        <div style={{ position: "absolute", right: 62, top: 178, width: 355, height: 360 }}>
          <div style={{ position: "absolute", inset: 0, background: "#E1E5DC", border: `2px solid ${INK}`, transform: "rotate(5deg)" }} />
          <div style={{ position: "absolute", inset: 0, padding: 14, background: PAPER, border: `2px solid ${INK}`, transform: "rotate(-5deg)" }}>
            <div style={{ height: 240, overflow: "hidden" }}><Room /></div>
            <Label style={{ marginTop: 24, color: INK, textAlign: "center" }}>PENGALAMAN BARU</Label>
          </div>
          <div
            style={{
              position: "absolute",
              left: -35,
              right: -35,
              top: 135,
              background: YELLOW,
              padding: "18px 12px",
              border: `2px solid ${INK}`,
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 43,
              textAlign: "center",
              transform: `rotate(-9deg) scale(${newReveal})`,
              opacity: newReveal,
            }}
          >
            TERASA FAMILIAR
          </div>
        </div>
      </div>
    </SceneFrame>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = easeSpring(frame, fps, 2);
  const underline = interpolate(frame, [20, 45], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 390,
          height: 390,
          borderRadius: "50%",
          background: YELLOW,
          left: 770,
          top: 206,
          transform: `scale(${scale})`,
        }}
      />
      <div style={{ position: "absolute", left: 570, top: 265, width: 780, textAlign: "center" }}>
        <Label style={{ color: INK }}>INI</Label>
        <Kinetic text="MINO" size={198} delay={5} style={{ letterSpacing: -13, marginTop: 20 }} />
        <div style={{ width: 590, height: 9, margin: "24px auto 32px", background: INK, transform: `scaleX(${underline})`, transformOrigin: "left" }} />
        <Kinetic text="Tetap penasaran." size={67} serif delay={24} />
      </div>
      <Reveal delay={38} style={{ position: "absolute", left: 0, right: 0, top: 758, textAlign: "center" }}>
        <Label>DÉJÀ VU / BARU, TAPI TERASA AKRAB</Label>
      </Reveal>
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const groupIndex = CAPTION_GROUPS.findIndex((group, index) => {
    const nextStart = CAPTION_GROUPS[index + 1]?.[0].s ?? 56.86;
    const lastEnd = group[group.length - 1].e;
    return seconds >= group[0].s && seconds < Math.min(lastEnd + 0.28, nextStart);
  });
  if (groupIndex < 0) return null;
  const group = CAPTION_GROUPS[groupIndex];
  const localFrame = frame - group[0].s * fps;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 76,
        left: 100,
        right: 100,
        display: "flex",
        justifyContent: "center",
        zIndex: 30,
        opacity: fadeIn(localFrame, 0, 4),
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          padding: "17px 26px",
          background: INK,
          boxShadow: "0 4px 0 rgba(0,0,0,0.1)",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 34,
          lineHeight: 1.25,
          color: PAPER,
          whiteSpace: "nowrap",
        }}
      >
        {group.map((word, index) => {
          const active = seconds >= word.s && seconds < word.e;
          const stagger = easeSpring(localFrame, fps, index * 2);
          return (
            <span
              key={`${word.s}-${word.w}`}
              style={{
                display: "inline-block",
                padding: "3px 6px",
                background: active ? YELLOW : "transparent",
                color: active ? INK : PAPER,
                opacity: fadeIn(localFrame, index * 2, 5),
                transform: `translateY(${(1 - stagger) * 9}px)`,
              }}
            >
              {word.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EditorialOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 1705], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 40 }}>
      <div style={{ position: "absolute", bottom: 37, left: 110, right: 110, height: 2, background: "#D1CDBF" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: INK }} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 47,
          right: 111,
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: 1,
          color: MUTED,
        }}
      >
        PSIKOLOGI / DÉJÀ VU
      </div>
    </AbsoluteFill>
  );
};

export const VoxGeneratedVideo: React.FC = () => {
  const { width, height } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);
  return (
    <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
      <Audio src={staticFile("voiceover.mp3")} />
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
          fontFamily: SANS,
          color: INK,
        }}
      >
        <Sequence from={0} durationInFrames={1706} name="Archival paper">
          <PaperBackground />
        </Sequence>

        <Sequence from={0} durationInFrames={374} name="01 · A place you have never visited">
          <HookScene />
        </Sequence>
        <Sequence from={374} durationInFrames={212} name="02 · New experience, familiar feeling">
          <ProcessScene />
        </Sequence>
        <Sequence from={586} durationInFrames={345} name="03 · Similarity is not the same event">
          <MatchScene />
        </Sequence>
        <Sequence from={931} durationInFrames={151} name="04 · Three familiar details">
          <DetailScene />
        </Sequence>
        <Sequence from={1082} durationInFrames={160} name="05 · A signal, not proof">
          <FamiliarScene />
        </Sequence>
        <Sequence from={1242} durationInFrames={385} name="06 · A reassuring explanation">
          <TakeawayScene />
        </Sequence>
        <Sequence from={1627} durationInFrames={79} name="07 · Mino sign-off">
          <OutroScene />
        </Sequence>

        <Sequence from={0} durationInFrames={1706} name="Word-highlighted narration">
          <Captions />
        </Sequence>
        <Sequence from={0} durationInFrames={1706} name="Editorial furniture">
          <EditorialOverlay />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};