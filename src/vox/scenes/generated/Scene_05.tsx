import React from "react";
import {
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  paper: "#F5F2EB",
  ink: "#18181B",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
  muted: "#77756F",
  line: "#D9D5CB",
};

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const BEATS = [
  [34, 66, "dan tetap salah."],
  [80, 101, "Itulah kenapa,"],
  [125, 162, "kamu mungkin pernah yakin banget"],
  [162, 206, "pernah melakukan sesuatu,"],
  [223, 267, "sampai akhirnya sadar."],
  [277, 297, "Oh,"],
  [311, 331, "ternyata bukan gue."],
  [348, 391, "Otak kita mengisi bagian yang hilang"],
  [397, 466, "dengan informasi yang dianggap masuk akal."],
  [476, 546, "Dan karena hasil akhirnya terasa seperti ingatan,"],
  [562, 597, "kita jarang mempertanyakannya."],
  [597, 652, "Sekarang coba perhatikan hal lain."],
  [665, 713, "Pernah baca artikel panjang,"],
  [724, 747, "sampai selesai,"],
  [763, 804, "tapi begitu ditanya isinya,"],
  [826, 833, "kosong."],
  [848, 867, "Padahal,"],
  [886, 930, "matamu membaca semua kalimatnya."],
  [946, 976, "Ini juga bukan berarti,"],
  [997, 1047, "otakmu tiba-tiba menghapus semuanya."],
  [1065, 1079, "Bisa jadi,"],
  [1098, 1120, "sejak awal,"],
  [1137, 1159, "perhatianmu"],
  [1159, 1222, "tidak benar-benar berada di sana."],
  [1240, 1258, "Mata membaca,"],
  [1272, 1324, "tapi pikiran sedang memikirkan chat,"],
  [1339, 1352, "kerjaan,"],
  [1365, 1392, "masalah tadi pagi,"],
  [1402, 1419, "atau bahkan,"],
  [1437, 1461, "setelah ini makan apa."],
  [1461, 1492, "Jadi,"],
  [1522, 1534, "secara fisik,"],
  [1539, 1548, "kamu sedang membaca."],
] as const;

const motion = (frame: number, cue: number, fps: number) =>
  spring({
    frame: Math.max(0, frame - cue),
    fps,
    config: { damping: 18, mass: 0.8, stiffness: 85 },
  });

const progress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, Math.max(start + 0.001, end)], [0, 1], CLAMP);

type TimedProps = {
  frame: number;
  fps: number;
  cue: number;
};

const Enter: React.FC<
  TimedProps & {
    children: React.ReactNode;
    style?: React.CSSProperties;
    distance?: number;
  }
> = ({ frame, fps, cue, children, style, distance = 24 }) => {
  if (frame < cue) return null;
  const p = motion(frame, cue, fps);
  return (
    <div
      style={{
        ...style,
        opacity: Math.min(1, p),
        transform: `translateY(${(1 - p) * distance}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Words: React.FC<
  TimedProps & {
    text: string;
    size?: number;
    color?: string;
    weight?: number;
    spread?: number;
  }
> = ({
  frame,
  fps,
  cue,
  text,
  size = 64,
  color = C.ink,
  weight = 800,
  spread = 4,
}) => (
  <span
    style={{
      display: "inline-flex",
      flexWrap: "wrap",
      gap: "0.26em",
      fontSize: size,
      color,
      fontWeight: weight,
      lineHeight: 1.12,
      letterSpacing: "-0.045em",
    }}
  >
    {text.split(" ").map((word, i) => {
      const start = cue + i * spread;
      const p = motion(frame, start, fps);
      return (
        <span
          key={`${word}-${i}`}
          style={{
            display: "inline-block",
            opacity: frame < start ? 0 : Math.min(1, p),
            transform: `translateY(${(1 - p) * 18}px)`,
          }}
        >
          {word}
        </span>
      );
    })}
  </span>
);

const Label: React.FC<{
  children: React.ReactNode;
  color?: string;
}> = ({ children, color = C.muted }) => (
  <div
    style={{
      fontFamily: "monospace",
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: "0.12em",
      color,
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const Heading: React.FC<
  TimedProps & { eyebrow: string; text: string }
> = ({ frame, fps, cue, eyebrow, text }) => (
  <div style={{ position: "absolute", top: 135, left: 108, right: 108 }}>
    <Enter frame={frame} fps={fps} cue={cue}>
      <Label>{eyebrow}</Label>
    </Enter>
    <div style={{ marginTop: 16 }}>
      <Words frame={frame} fps={fps} cue={cue} text={text} />
    </div>
  </div>
);

const Marker: React.FC<{
  frame: number;
  cue: number;
  width?: number;
  height?: number;
}> = ({ frame, cue, width = 440, height = 100 }) => {
  const p = progress(frame, cue, cue + 28);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 440 100"
      style={{ overflow: "visible" }}
    >
      <path
        d="M423 48 C417 6 112 -5 29 25 C-10 40 2 78 84 87 C200 107 438 92 426 46 M45 21 C145 -3 343 1 403 25"
        fill="none"
        stroke={C.red}
        strokeWidth="6"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
    </svg>
  );
};

const Person: React.FC<{ color: string; x: number; y: number }> = ({
  color,
  x,
  y,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cy="-45" r="24" fill={color} />
    <path
      d="M-51 53 V18 C-51 -21 51 -21 51 18 V53 Z"
      fill={color}
    />
    <path d="M-20 54 V102 M20 54 V102" stroke={color} strokeWidth="19" />
  </g>
);

const MemoryScene: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const reveal = progress(frame, 223, 267);
  return (
    <>
      <Heading
        frame={frame}
        fps={fps}
        cue={80}
        eyebrow="01 / Ingatan & kenyataan"
        text="Yakin bukan berarti benar."
      />

      <Enter
        frame={frame}
        fps={fps}
        cue={34}
        style={{ position: "absolute", right: 110, top: 145 }}
      >
        <div
          style={{
            background: C.red,
            color: "white",
            padding: "12px 22px",
            fontWeight: 900,
            fontSize: 24,
            transform: "rotate(4deg)",
          }}
        >
          TETAP SALAH
        </div>
      </Enter>

      <Enter
        frame={frame}
        fps={fps}
        cue={125}
        style={{
          position: "absolute",
          left: 108,
          top: 330,
          width: 760,
          height: 455,
          padding: 32,
          boxSizing: "border-box",
          background: "#FFFDF8",
          border: `2px solid ${C.ink}`,
          boxShadow: "10px 12px 0 #E4DFD3",
        }}
      >
        <Label color={C.blue}>Versi di kepala</Label>
        <svg
          viewBox="0 0 690 290"
          style={{ width: "100%", height: 290, marginTop: 12 }}
        >
          <path
            d="M45 239 V60 L207 25 H620 V239 Z M45 60 H470 V239 M470 60 L620 25 M207 25 V60"
            fill="#ECEFF5"
            stroke="#B7BEC8"
            strokeWidth="2"
          />
          <path d="M45 239 L207 180 H620" fill="none" stroke="#B7BEC8" />
          <Person color={C.blue} x={292} y={138} />
          <g opacity={progress(frame, 162, 185)}>
            <rect x="416" y="164" width="144" height="21" fill={C.ink} />
            <path d="M434 185 V237 M543 185 V237" stroke={C.ink} strokeWidth="7" />
            <path d="M304 130 L401 162" stroke={C.blue} strokeWidth="17" strokeLinecap="round" />
            <rect x="388" y="125" width="28" height="38" rx="5" fill={C.yellow} stroke={C.ink} strokeWidth="2" />
          </g>
          <circle cx="293" cy="95" r="68" fill="none" stroke={C.blue} strokeDasharray="5 9" opacity=".45" />
        </svg>
        <Enter frame={frame} fps={fps} cue={162}>
          <div style={{ fontSize: 31, fontWeight: 800 }}>
            “Gue yang melakukan itu.”
          </div>
        </Enter>
      </Enter>

      <Enter
        frame={frame}
        fps={fps}
        cue={223}
        style={{
          position: "absolute",
          left: 1020,
          top: 330,
          width: 790,
          height: 455,
          padding: 32,
          boxSizing: "border-box",
          background: "#FFFDF8",
          border: `2px solid ${C.ink}`,
          boxShadow: "10px 12px 0 #E4DFD3",
        }}
      >
        <Label color={C.teal}>Kenyataan</Label>
        <svg viewBox="0 0 690 290" style={{ width: "100%", height: 290, marginTop: 12 }}>
          <path d="M45 239 V60 L207 25 H620 V239 Z M45 60 H470 V239 M470 60 L620 25 M207 25 V60" fill="#E6EFEB" stroke="#B4C5BB" strokeWidth="2" />
          <path d="M45 239 L207 180 H620" fill="none" stroke="#B4C5BB" />
          <g opacity={1 - reveal * 0.8}>
            <Person color={C.blue} x={210} y={138} />
          </g>
          <g opacity={reveal}>
            <Person color={C.teal} x={340} y={138} />
            <path d="M351 130 L432 162" stroke={C.teal} strokeWidth="17" strokeLinecap="round" />
          </g>
          <rect x="435" y="164" width="130" height="21" fill={C.ink} />
          <path d="M448 185 V237 M548 185 V237" stroke={C.ink} strokeWidth="7" />
          <rect x="425" y="125" width="28" height="38" rx="5" fill={C.yellow} stroke={C.ink} strokeWidth="2" />
        </svg>
        <Enter frame={frame} fps={fps} cue={311}>
          <div style={{ fontSize: 31, fontWeight: 800, color: C.red }}>
            Ternyata, bukan gue.
          </div>
        </Enter>
        <div style={{ position: "absolute", left: 12, bottom: 0 }}>
          <Marker frame={frame} cue={311} />
        </div>
      </Enter>

      <Enter
        frame={frame}
        fps={fps}
        cue={277}
        style={{ position: "absolute", left: 879, top: 520 }}
      >
        <div
          style={{
            borderRadius: "50%",
            width: 108,
            height: 108,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: C.yellow,
            border: `2px solid ${C.ink}`,
            fontSize: 36,
            fontWeight: 900,
          }}
        >
          Oh.
        </div>
      </Enter>
    </>
  );
};

const Brain: React.FC<{
  frame: number;
  fillCue: number;
  focused?: boolean;
}> = ({ frame, fillCue, focused = true }) => {
  const fill = progress(frame, fillCue, fillCue + 55);
  const trace = progress(frame, 348, 391);
  const paths = [
    "M165 202 C140 158 166 94 222 102 C216 52 286 38 316 75 C349 28 408 59 407 105 C475 92 508 148 478 187 C535 222 495 284 447 280 C447 330 382 351 351 311 C303 348 250 323 250 285 C186 311 142 262 165 202 Z",
    "M317 78 C295 124 334 151 310 192 C285 235 327 269 350 310",
    "M220 106 C263 115 257 157 231 181 C209 202 237 245 251 281",
    "M410 106 C365 117 385 159 413 173 C447 191 427 232 399 242",
    "M174 199 C226 178 268 190 308 195 M332 201 C365 174 423 181 477 189",
    "M197 263 C228 239 268 252 290 273 M358 275 C382 250 428 269 447 278",
  ];
  return (
    <svg viewBox="0 0 640 430" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <circle cx="322" cy="196" r="183" fill="none" stroke={C.line} strokeWidth="1" />
      <circle cx="322" cy="196" r="211" fill="none" stroke={C.line} strokeDasharray="3 12" />
      <g transform={`rotate(${frame * 0.13} 322 196)`}>
        <path d="M322 -15 A211 211 0 0 1 523 130" fill="none" stroke={focused ? C.blue : C.red} strokeWidth="3" />
      </g>
      {paths.map((d, i) => (
        <path
          key={d}
          d={d}
          fill={i === 0 ? "#E7E9EC" : "none"}
          stroke={C.ink}
          strokeWidth={i === 0 ? 4 : 2.4}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={i === 0 ? undefined : 1}
          strokeDashoffset={i === 0 ? undefined : 1 - trace}
        />
      ))}
      <path
        d="M322 140 C354 111 387 134 388 165 C425 168 433 204 406 224 C390 249 346 246 329 220 C305 199 307 165 322 140 Z"
        fill={C.yellow}
        opacity={fill * 0.95}
        stroke={C.ink}
        strokeWidth="2"
        strokeDasharray="5 5"
      />
      {[
        [210, 166], [271, 137], [304, 200], [371, 181],
        [420, 222], [261, 259], [365, 285],
      ].map(([x, y], i) => {
        const pulse = (Math.sin(frame * 0.06 - i) + 1) / 2;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={9 + pulse * 8} fill={C.blue} opacity={0.05 + pulse * 0.1} />
            <circle cx={x} cy={y} r="4.5" fill={i === 3 ? C.red : C.blue} />
          </g>
        );
      })}
      <path d="M350 315 Q347 354 378 378" fill="none" stroke={C.ink} strokeWidth="17" strokeLinecap="round" />
    </svg>
  );
};

const ReconstructionScene: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => (
  <>
    <Heading
      frame={frame}
      fps={fps}
      cue={348}
      eyebrow="02 / Rekonstruksi"
      text="Otak melengkapi bagian yang hilang."
    />
    <Enter
      frame={frame}
      fps={fps}
      cue={348}
      style={{ position: "absolute", left: 66, top: 330, width: 785, height: 485 }}
    >
      <Brain frame={frame} fillCue={397} />
    </Enter>
    <div style={{ position: "absolute", left: 930, top: 354, width: 830 }}>
      <Enter frame={frame} fps={fps} cue={348}>
        <Label>Potongan informasi</Label>
        <div style={{ display: "flex", gap: 18, marginTop: 24 }}>
          {["TERLIHAT", "TERDENGAR", "?"].map((text, i) => (
            <div
              key={text}
              style={{
                width: 220,
                height: 102,
                background: i === 2 ? "transparent" : "#FFFDF8",
                border: `2px ${i === 2 ? "dashed" : "solid"} ${i === 2 ? C.red : C.ink}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: i === 2 ? C.red : C.ink,
                fontWeight: 900,
                fontSize: i === 2 ? 48 : 24,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </Enter>
      <Enter frame={frame} fps={fps} cue={397} style={{ marginTop: 29 }}>
        <div
          style={{
            background: C.yellow,
            padding: "18px 24px",
            border: `2px solid ${C.ink}`,
            width: 674,
          }}
        >
          <Label color={C.ink}>Isian dari otak</Label>
          <div style={{ fontSize: 35, fontWeight: 800, marginTop: 8 }}>
            Informasi yang “masuk akal”
          </div>
        </div>
      </Enter>
      <Enter frame={frame} fps={fps} cue={476} style={{ marginTop: 30 }}>
        <div style={{ display: "flex", gap: 25, alignItems: "center" }}>
          <svg width="45" height="50" viewBox="0 0 45 50">
            <path d="M22 0 V40 M8 26 L22 42 L37 26" fill="none" stroke={C.ink} strokeWidth="3" />
          </svg>
          <div style={{ background: C.ink, color: C.paper, padding: "18px 26px", fontSize: 31, fontWeight: 800 }}>
            Terasa seperti ingatan.
          </div>
        </div>
      </Enter>
      <Enter frame={frame} fps={fps} cue={562} style={{ marginTop: 25 }}>
        <div style={{ color: C.red, fontSize: 25, fontWeight: 700 }}>
          Jarang dipertanyakan.
        </div>
      </Enter>
    </div>
    <Enter frame={frame} fps={fps} cue={397} style={{ position: "absolute", left: 220, top: 808 }}>
      <Label color={C.muted}>Diagram konseptual · bukan pemindaian otak</Label>
    </Enter>
  </>
);

const DocumentGraphic: React.FC<{
  frame: number;
  cue: number;
  scanStart: number;
  scanEnd: number;
  compact?: boolean;
}> = ({ frame, cue, scanStart, scanEnd, compact = false }) => {
  const scan = progress(frame, scanStart, scanEnd);
  const widths = [420, 461, 390, 452, 433, 330, 454, 407, 447, 465, 356, 445];
  return (
    <svg viewBox="0 0 580 590" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <rect x="22" y="19" width="530" height="560" fill="#E0DBD0" />
      <rect x="10" y="7" width="530" height="560" fill="#FFFDF8" stroke={C.ink} strokeWidth="2" />
      <rect x="42" y="34" width="120" height="8" fill={C.yellow} />
      <text x="42" y="80" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="28" fill={C.ink}>
        Artikel panjang
      </text>
      <text x="42" y="109" fontFamily="monospace" fontSize="12" fill={C.muted}>
        ILUSTRASI BACAAN / 01
      </text>
      <line x1="42" x2="505" y1="129" y2="129" stroke={C.line} />
      {widths.map((w, i) => {
        const lineStart = scanStart + (i / 12) * (scanEnd - scanStart);
        const lineEnd = lineStart + (scanEnd - scanStart) / 12;
        const p = progress(frame, lineStart, lineEnd);
        return (
          <g key={i}>
            <rect x="38" y={150 + i * 28} width={w * p} height="18" fill={C.yellow} opacity=".66" />
            <rect x="42" y={155 + i * 28} width={w} height="4" fill="#7B7A75" opacity=".78" />
            <rect x="42" y={163 + i * 28} width={Math.max(60, w - 38)} height="3" fill="#B8B4AC" />
          </g>
        );
      })}
      <g opacity={frame >= scanStart ? 1 : 0}>
        <line x1="24" x2="520" y1={149 + scan * 318} y2={149 + scan * 318} stroke={C.blue} strokeWidth="2" />
        <circle cx="24" cy={149 + scan * 318} r="5" fill={C.blue} />
      </g>
      {!compact && frame >= cue && (
        <>
          <text x="42" y="539" fontFamily="monospace" fontSize="14" fill={C.muted}>
            PROGRES BACA
          </text>
          <rect x="200" y="526" width="265" height="12" fill="#E8E4DA" />
          <rect x="200" y="526" width={265 * scan} height="12" fill={C.teal} />
          <text x="476" y="538" fontFamily="monospace" fontSize="13" fill={C.teal}>
            {Math.round(scan * 100)}%
          </text>
        </>
      )}
    </svg>
  );
};

const Eye: React.FC<{ frame: number; color?: string }> = ({
  frame,
  color = C.blue,
}) => (
  <svg width="190" height="95" viewBox="0 0 190 95">
    <path d="M8 48 Q94 -24 182 48 Q95 118 8 48 Z" fill="#FFFDF8" stroke={C.ink} strokeWidth="3" />
    <circle cx={95 + Math.sin(frame * 0.035) * 13} cy="48" r="25" fill={color} />
    <circle cx={95 + Math.sin(frame * 0.035) * 13} cy="48" r="10" fill={C.ink} />
    <circle cx={88 + Math.sin(frame * 0.035) * 13} cy="40" r="5" fill="white" />
  </svg>
);

const ReadingScene: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => (
  <>
    <Heading
      frame={frame}
      fps={fps}
      cue={597}
      eyebrow="03 / Eksperimen sehari-hari"
      text="Selesai membaca. Apa yang tersisa?"
    />
    <Enter
      frame={frame}
      fps={fps}
      cue={665}
      style={{
        position: "absolute",
        left: 167,
        top: 305,
        width: 540,
        height: 565,
        transformOrigin: "center",
      }}
    >
      <div style={{ transform: "rotate(-3deg)", height: "100%" }}>
        <DocumentGraphic frame={frame} cue={665} scanStart={665} scanEnd={747} />
      </div>
    </Enter>
    <Enter frame={frame} fps={fps} cue={724} style={{ position: "absolute", left: 598, top: 790 }}>
      <div
        style={{
          padding: "13px 22px",
          background: C.teal,
          color: "white",
          fontWeight: 800,
          fontSize: 22,
          transform: "rotate(-5deg)",
        }}
      >
        SELESAI ✓
      </div>
    </Enter>

    <Enter
      frame={frame}
      fps={fps}
      cue={763}
      style={{
        position: "absolute",
        left: 955,
        top: 340,
        width: 780,
        height: 345,
        border: `2px solid ${C.ink}`,
        background: "#FFFDF8",
        padding: 38,
        boxSizing: "border-box",
      }}
    >
      <Label>Ketika ditanya</Label>
      <div style={{ fontSize: 42, fontWeight: 800, marginTop: 18 }}>
        “Tadi, isinya apa?”
      </div>
      <Enter frame={frame} fps={fps} cue={826} distance={10}>
        <div style={{ fontSize: 89, color: C.red, fontWeight: 900, letterSpacing: "-0.06em", marginTop: 25 }}>
          Kosong.
        </div>
      </Enter>
      <div style={{ position: "absolute", left: 15, top: 170 }}>
        <Marker frame={frame} cue={826} width={475} height={110} />
      </div>
    </Enter>

    <Enter frame={frame} fps={fps} cue={848} style={{ position: "absolute", left: 964, top: 740 }}>
      <Label>Padahal…</Label>
    </Enter>
    <Enter frame={frame} fps={fps} cue={886} style={{ position: "absolute", left: 953, top: 774 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Eye frame={frame} />
        <div style={{ fontSize: 31, fontWeight: 800, maxWidth: 520 }}>
          Mata membaca semua kalimat.
        </div>
      </div>
    </Enter>
  </>
);

const AttentionScene: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => (
  <>
    <Heading
      frame={frame}
      fps={fps}
      cue={946}
      eyebrow="04 / Membaca ≠ memperhatikan"
      text="Bukan otomatis terhapus."
    />
    <Enter
      frame={frame}
      fps={fps}
      cue={997}
      style={{ position: "absolute", left: 109, top: 355, width: 630 }}
    >
      <div style={{ border: `2px solid ${C.line}`, padding: 32, background: "#FFFDF8" }}>
        <Label>Penjelasan yang belum tentu benar</Label>
        <div style={{ fontSize: 36, fontWeight: 800, marginTop: 26 }}>
          “Otak menghapus semuanya.”
        </div>
        <svg width="555" height="72" viewBox="0 0 555 72" style={{ marginTop: 16 }}>
          <path
            d="M17 59 L530 13 M22 10 L535 60"
            stroke={C.red}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - progress(frame, 997, 1047)}
          />
        </svg>
      </div>
    </Enter>

    <Enter frame={frame} fps={fps} cue={1065} style={{ position: "absolute", left: 109, top: 626 }}>
      <div style={{ color: C.teal, fontWeight: 800, fontSize: 31 }}>Bisa jadi…</div>
    </Enter>
    <Enter frame={frame} fps={fps} cue={1098} style={{ position: "absolute", left: 109, top: 680 }}>
      <div style={{ fontSize: 43, fontWeight: 800 }}>Sejak awal,</div>
    </Enter>
    <Enter frame={frame} fps={fps} cue={1137} style={{ position: "absolute", left: 109, top: 737 }}>
      <div style={{ background: C.yellow, display: "inline-block", padding: "6px 14px", fontSize: 43, fontWeight: 900 }}>
        perhatian
      </div>
    </Enter>
    <Enter frame={frame} fps={fps} cue={1159} style={{ position: "absolute", left: 109, top: 811 }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: C.red }}>tidak berada di sana.</div>
    </Enter>

    <Enter frame={frame} fps={fps} cue={1065} style={{ position: "absolute", left: 855, top: 323, width: 850, height: 510 }}>
      <Brain frame={frame} fillCue={2000} focused={false} />
      <svg viewBox="0 0 850 510" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
        <path d="M370 410 C295 461 218 422 198 352" fill="none" stroke={C.blue} strokeWidth="3" strokeDasharray="7 9" />
        <g opacity={progress(frame, 1159, 1195)}>
          <path d="M516 194 C657 191 673 67 773 76" fill="none" stroke={C.red} strokeWidth="3" strokeDasharray="7 9" />
          <path d="M755 65 L774 76 L755 88" fill="none" stroke={C.red} strokeWidth="3" />
          <circle cx="781" cy="76" r="35" fill={C.paper} stroke={C.red} strokeWidth="2" />
          <text x="781" y="85" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="800" fill={C.red}>…</text>
        </g>
      </svg>
    </Enter>
    <Enter frame={frame} fps={fps} cue={1137} style={{ position: "absolute", left: 1140, top: 834 }}>
      <Label color={C.red}>Perhatian ≠ sekadar melihat</Label>
    </Enter>
  </>
);

const DistractionIcon: React.FC<{ kind: number }> = ({ kind }) => (
  <svg width="55" height="55" viewBox="0 0 64 64">
    {kind === 0 && (
      <>
        <path d="M9 12 H55 V43 H29 L15 53 V43 H9 Z" fill="none" stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="22" cy="28" r="3" fill={C.ink} />
        <circle cx="32" cy="28" r="3" fill={C.ink} />
        <circle cx="42" cy="28" r="3" fill={C.ink} />
      </>
    )}
    {kind === 1 && (
      <>
        <rect x="8" y="21" width="48" height="33" rx="3" fill="none" stroke={C.ink} strokeWidth="3" />
        <path d="M23 21 V11 H41 V21 M8 33 H56 M26 33 V39 H38 V33" fill="none" stroke={C.ink} strokeWidth="3" />
      </>
    )}
    {kind === 2 && (
      <>
        <circle cx="32" cy="32" r="23" fill="none" stroke={C.ink} strokeWidth="3" />
        <path d="M32 16 V33 L43 39" fill="none" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
        <path d="M6 8 L14 14 M50 14 L58 8" stroke={C.ink} strokeWidth="3" />
      </>
    )}
    {kind === 3 && (
      <>
        <circle cx="34" cy="33" r="18" fill="none" stroke={C.ink} strokeWidth="3" />
        <circle cx="34" cy="33" r="11" fill="none" stroke={C.ink} strokeWidth="2" />
        <path d="M8 10 V27 M14 10 V27 M20 10 V27 M8 25 Q14 34 20 25 M14 31 V55 M57 10 V55" fill="none" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const DistractionsScene: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const items = [
    { cue: 1272, text: "Chat", x: 1210, y: 326, color: C.yellow, kind: 0 },
    { cue: 1339, text: "Kerjaan", x: 1490, y: 467, color: "#DDE8FA", kind: 1 },
    { cue: 1365, text: "Masalah tadi pagi", x: 1145, y: 650, color: "#F7DEDA", kind: 2 },
    { cue: 1437, text: "Nanti makan apa?", x: 1450, y: 785, color: "#D7EBE6", kind: 3 },
  ];
  return (
    <>
      <Heading
        frame={frame}
        fps={fps}
        cue={1240}
        eyebrow="05 / Dua jalur, satu tubuh"
        text="Mata di sini. Pikiran di tempat lain."
      />
      <Enter frame={frame} fps={fps} cue={1240} style={{ position: "absolute", left: 98, top: 340, width: 470, height: 500 }}>
        <DocumentGraphic frame={frame} cue={1240} scanStart={1240} scanEnd={1461} compact />
      </Enter>
      <Enter frame={frame} fps={fps} cue={1240} style={{ position: "absolute", left: 602, top: 385 }}>
        <Eye frame={frame} />
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Label color={C.blue}>Mata membaca</Label>
        </div>
      </Enter>
      <Enter frame={frame} fps={fps} cue={1272} style={{ position: "absolute", left: 691, top: 534, width: 560, height: 350 }}>
        <Brain frame={frame} fillCue={2000} focused={false} />
      </Enter>

      <svg
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <path
          d="M603 430 C540 427 545 520 514 533"
          fill="none"
          stroke={C.blue}
          strokeWidth="3"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress(frame, 1240, 1258)}
        />
        {items.map((item, i) => (
          <path
            key={item.cue}
            d={`M1045 682 C${1140 + i * 14} ${590 - i * 30}, ${item.x - 90} ${item.y + 50}, ${item.x} ${item.y + 50}`}
            fill="none"
            stroke={i === 2 ? C.red : C.muted}
            strokeWidth="2"
            pathLength={1}
            strokeDasharray="0.018 0.018"
            strokeDashoffset={1 - progress(frame, item.cue, item.cue + 25)}
            opacity={frame >= item.cue ? 0.65 : 0}
          />
        ))}
      </svg>

      {items.map((item, i) => {
        const bob = Math.sin((frame - item.cue) * 0.025 + i) * 3;
        return (
          <Enter
            key={item.cue}
            frame={frame}
            fps={fps}
            cue={item.cue}
            style={{ position: "absolute", left: item.x, top: item.y }}
          >
            <div
              style={{
                transform: `translateY(${bob}px) rotate(${i % 2 === 0 ? -3 : 3}deg)`,
                minWidth: i > 1 ? 275 : 210,
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                gap: 18,
                background: item.color,
                border: `2px solid ${C.ink}`,
                boxShadow: "6px 7px 0 #D8D2C7",
              }}
            >
              <DistractionIcon kind={item.kind} />
              <div style={{ fontSize: 27, fontWeight: 800 }}>{item.text}</div>
            </div>
          </Enter>
        );
      })}

      <Enter frame={frame} fps={fps} cue={1402} style={{ position: "absolute", left: 1615, top: 661 }}>
        <div style={{ color: C.muted, fontSize: 45, fontWeight: 700 }}>…</div>
      </Enter>

      <Enter frame={frame} fps={fps} cue={1461} style={{ position: "absolute", left: 111, top: 855 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: C.blue }} />
          <Label color={C.blue}>Jadi…</Label>
        </div>
      </Enter>
      <Enter frame={frame} fps={fps} cue={1522} style={{ position: "absolute", left: 243, top: 847 }}>
        <div style={{ background: C.yellow, padding: "8px 14px", fontSize: 25, fontWeight: 800 }}>
          Secara fisik:
        </div>
      </Enter>
      <div style={{ position: "absolute", left: 470, top: 856 }}>
        <Words frame={frame} fps={fps} cue={1539} text="kamu sedang membaca." size={27} spread={1} />
      </div>
    </>
  );
};

const Captions: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  let index = -1;
  BEATS.forEach((beat, i) => {
    if (frame >= beat[0]) index = i;
  });
  if (index < 0) return null;

  const [cue, end, text] = BEATS[index];
  const next = BEATS[index + 1]?.[0] ?? 1549;
  const fadeStart = Math.max(end + 8, next - 6);
  const opacity = 1 - progress(frame, fadeStart, Math.max(fadeStart + 1, next));
  const words = text.split(" ");
  const spread = Math.max(1, Math.min(4, Math.floor((end - cue) / (words.length + 2))));

  return (
    <div
      style={{
        position: "absolute",
        left: 108,
        right: 108,
        bottom: 50,
        height: 67,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          borderLeft: `5px solid ${C.yellow}`,
          padding: "10px 22px",
          background: C.ink,
          color: C.paper,
          boxShadow: "0 5px 18px #18181B10",
        }}
      >
        <Words
          frame={frame}
          fps={fps}
          cue={cue}
          text={text}
          size={33}
          color={C.paper}
          weight={600}
          spread={spread}
        />
      </div>
    </div>
  );
};

export const Scene_05: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const scale = Math.min(width / 1920, height / 1080);
  const stage =
    frame < 348 ? 1 :
    frame < 597 ? 2 :
    frame < 946 ? 3 :
    frame < 1240 ? 4 : 5;

  const chapters = [
    { frame: 34, label: "INGATAN" },
    { frame: 348, label: "REKONSTRUKSI" },
    { frame: 597, label: "MEMBACA" },
    { frame: 946, label: "PERHATIAN" },
    { frame: 1240, label: "DISTRAKSI" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: C.paper,
        fontFamily: "Arial, Helvetica, sans-serif",
        color: C.ink,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: (width - 1920 * scale) / 2,
          top: (height - 1080 * scale) / 2,
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          overflow: "hidden",
        }}
      >
        <Sequence from={0} durationInFrames={1548} layout="none">
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `
                radial-gradient(ellipse at ${22 + Math.sin(frame * 0.004) * 3}% 38%, #FFE6000D, transparent 48%),
                radial-gradient(ellipse at 83% 69%, #2563EB08, transparent 45%)
              `,
            }}
          />
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
            <defs>
              <pattern id="scene05-paper-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#BDB7AA" />
              </pattern>
            </defs>
            <rect width="1920" height="1080" fill="url(#scene05-paper-grid)" />
            <path d="M108 106 H1812 M108 937 H1812" stroke={C.line} strokeWidth="2" />
          </svg>
          <div style={{ position: "absolute", left: 108, top: 43, display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ width: 40, height: 31, background: C.yellow, transform: "skew(-12deg)" }} />
            <Label color={C.ink}>Cara otak membangun kenyataan</Label>
          </div>
          <div style={{ position: "absolute", right: 108, top: 47 }}>
            <Label>Bab 05 / 11</Label>
          </div>
          <div style={{ position: "absolute", left: 108, right: 108, bottom: 22, height: 3, background: "#E1DBCF" }}>
            <div style={{ width: `${progress(frame, 0, 1548) * 100}%`, height: "100%", background: C.ink }} />
          </div>
        </Sequence>

        <Sequence from={0} durationInFrames={348} layout="none">
          <MemoryScene frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={348} durationInFrames={249} layout="none">
          <ReconstructionScene frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={597} durationInFrames={349} layout="none">
          <ReadingScene frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={946} durationInFrames={294} layout="none">
          <AttentionScene frame={frame} fps={fps} />
        </Sequence>
        <Sequence from={1240} durationInFrames={308} layout="none">
          <DistractionsScene frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={0} durationInFrames={1548} layout="none">
          <div
            style={{
              position: "absolute",
              right: 108,
              top: 281,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {chapters.map((chapter, i) => (
              <div
                key={chapter.frame}
                style={{
                  width: stage === i + 1 ? 34 : 10,
                  height: 6,
                  background: frame >= chapter.frame ? C.ink : C.line,
                }}
              />
            ))}
          </div>
          <Captions frame={frame} fps={fps} />
        </Sequence>
      </div>
    </div>
  );
};