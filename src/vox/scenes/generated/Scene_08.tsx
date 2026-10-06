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
  muted: "#77736C",
  line: "#D8D3C8",
  yellow: "#FFE600",
  red: "#E63946",
  blue: "#2563EB",
  teal: "#0D9488",
  white: "#FFFEFA",
};

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const FONT = "Arial, Helvetica, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

const cues = [
  [38, 73, "Itulah sebabnya,"],
  [80, 86, "kadang,"],
  [103, 161, "kita bisa melihat sesuatu di depan mata,"],
  [177, 233, "tapi tidak benar-benar menyadarinya."],
  [241, 257, "Contohnya,"],
  [276, 328, "ketika kamu sedang mencari kunci,"],
  [350, 386, "kuncinya sebenarnya ada di meja."],
  [404, 444, "Kamu sudah melihat meja itu."],
  [456, 461, "Tapi,"],
  [483, 543, "karena otak sedang mencari bentuk tertentu,"],
  [560, 600, "kamu bisa saja melewatkannya."],
  [618, 626, "Lalu,"],
  [647, 678, "beberapa detik kemudian,"],
  [696, 703, "lah,"],
  [725, 750, "dari tadi ada di sini."],
  [768, 797, "Bukan matamu yang rusak."],
  [815, 829, "Otakmu"],
  [829, 891, "hanya tidak memberikan perhatian penuh"],
  [891, 925, "pada benda tersebut."],
  [937, 950, "Dan,"],
  [967, 978, "sebenarnya,"],
  [999, 1034, "semua ini"],
  [1034, 1094, "menunjukkan sesuatu yang cukup penting."],
  [1110, 1133, "Kita sering merasa,"],
  [1133, 1176, "apa yang saya lihat,"],
  [1196, 1226, "berarti itu kenyataan."],
  [1243, 1263, "Kalau saya ingat,"],
  [1278, 1311, "berarti memang terjadi."],
  [1331, 1365, "Kalau saya merasa familiar,"],
  [1394, 1431, "berarti saya pernah mengalaminya."],
  [1449, 1488, "Kalau saya merasa waktunya lama,"],
  [1514, 1548, "berarti memang waktunya lama."],
] as const;

function progress(frame: number, from: number, to: number) {
  return interpolate(frame, [from, Math.max(from + 1, to)], [0, 1], CLAMP);
}

function enter(frame: number, cue: number, fps: number, delay = 0) {
  if (frame < cue + delay) return 0;
  return spring({
    frame: Math.max(0, frame - cue - delay),
    fps,
    config: { damping: 18, mass: 0.8, stiffness: 95 },
  });
}

function opacity(frame: number, cue: number, duration = 12) {
  return progress(frame, cue, cue + duration);
}

const Words: React.FC<{
  text: string;
  frame: number;
  fps: number;
  start: number;
  end: number;
  size?: number;
  color?: string;
  weight?: number;
  serif?: boolean;
  style?: React.CSSProperties;
}> = ({
  text,
  frame,
  fps,
  start,
  end,
  size = 56,
  color = C.ink,
  weight = 700,
  serif = false,
  style,
}) => {
  const words = text.split(" ");
  const span = Math.max(0, end - start - 7);
  return (
    <span
      style={{
        fontFamily: serif ? SERIF : FONT,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.12,
        letterSpacing: serif ? -1.6 : -1.8,
        color,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const cue = start + (words.length <= 1 ? 0 : (span * i) / (words.length - 1));
        const s = enter(frame, cue, fps);
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              opacity: opacity(frame, cue, 7),
              transform: `translateY(${(1 - s) * 17}px)`,
              marginRight: "0.24em",
              whiteSpace: "nowrap",
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

const Label: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color = C.muted, style }) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: 2.8,
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

const Key: React.FC<{
  x?: number;
  y?: number;
  rotation?: number;
  scale?: number;
  color?: string;
  outline?: boolean;
}> = ({
  x = 0,
  y = 0,
  rotation = -23,
  scale = 1,
  color = C.ink,
  outline = false,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`}>
    <circle
      cx="0"
      cy="0"
      r="28"
      fill={outline ? "none" : C.paper}
      stroke={color}
      strokeWidth="10"
    />
    <path
      d="M25 0 H118 V19 H100 V0 M78 0 V15"
      fill="none"
      stroke={color}
      strokeWidth="10"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    {!outline && (
      <path
        d="M-17 -23 C-53 -63 -80 -17 -45 11 C-27 25 -4 8 -15 -14"
        fill="none"
        stroke={C.muted}
        strokeWidth="4"
      />
    )}
  </g>
);

const Eye: React.FC<{
  x: number;
  y: number;
  scale?: number;
  color?: string;
  look?: number;
}> = ({ x, y, scale = 1, color = C.ink, look = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path
      d="M-82 0 Q0 -77 82 0 Q0 77 -82 0Z"
      fill={C.white}
      stroke={color}
      strokeWidth="5"
    />
    <circle cx={look} cy="0" r="29" fill={color} />
    <circle cx={look + 8} cy="-8" r="7" fill={C.white} />
    <path
      d="M-63 -33 L-73 -49 M0 -48 V-66 M63 -33 L73 -49"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </g>
);

const PaperBackground: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", inset: 0, background: C.paper }}>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <pattern id="s08-paper-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.8" fill={C.ink} opacity="0.1" />
        </pattern>
        <radialGradient id="s08-paper-glow">
          <stop offset="0%" stopColor={C.yellow} stopOpacity="0.13" />
          <stop offset="100%" stopColor={C.yellow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#s08-paper-dots)" />
      <ellipse
        cx={1460 + Math.sin(frame / 160) * 65}
        cy={400 + Math.cos(frame / 190) * 45}
        rx="720"
        ry="600"
        fill="url(#s08-paper-glow)"
      />
      <path d="M76 125 H1844 M76 914 H1844" stroke={C.line} />
      <path d="M76 148 V887 M1844 148 V887" stroke={C.line} opacity="0.4" />
    </svg>
  </div>
);

const Intro: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const visible = enter(frame, 103, fps);
  const distinction = progress(frame, 177, 221);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 125, top: 190, width: 980 }}>
        <Words text="Itulah sebabnya," frame={frame} fps={fps} start={38} end={73} size={43} weight={400} serif />
        <div style={{ marginTop: 18 }}>
          <Words text="kadang…" frame={frame} fps={fps} start={80} end={86} size={29} color={C.muted} weight={400} />
        </div>
      </div>

      <div style={{ position: "absolute", left: 125, top: 385, width: 800 }}>
        <Words text="Melihat." frame={frame} fps={fps} start={103} end={119} size={112} serif />
        <div style={{ marginTop: 30 }}>
          <Words
            text="Belum tentu menyadari."
            frame={frame}
            fps={fps}
            start={177}
            end={230}
            size={65}
            color={C.red}
            serif
          />
        </div>
      </div>

      <svg
        style={{ position: "absolute", left: 990, top: 250, overflow: "visible" }}
        width="770"
        height="540"
        viewBox="0 0 770 540"
      >
        <g opacity={opacity(frame, 103)} transform={`translate(0 ${(1 - visible) * 30})`}>
          <circle cx="355" cy="255" r="211" fill={C.white} stroke={C.line} />
          <circle cx="355" cy="255" r="167" fill="none" stroke={C.line} strokeDasharray="3 12" />
          <g transform={`rotate(${frame * 0.13} 355 255)`}>
            <path d="M355 66 A189 189 0 0 1 537 305" fill="none" stroke={C.blue} strokeWidth="3" />
          </g>
          <Eye x={355} y={255} scale={1.4} look={Math.sin(frame / 36) * 8} />
          <path d="M142 255 H222 M488 255 H567" stroke={C.blue} strokeWidth="2" />
          <text x="355" y="370" textAnchor="middle" fontFamily={FONT} fontSize="17" letterSpacing="4" fill={C.blue}>
            INFORMASI MASUK
          </text>
        </g>
        <g opacity={distinction}>
          <path
            d="M604 182 C704 206 705 328 618 355"
            pathLength="1"
            stroke={C.red}
            strokeWidth="5"
            fill="none"
            strokeDasharray="1"
            strokeDashoffset={1 - distinction}
            strokeLinecap="round"
          />
          <path d="M596 241 L656 303 M656 241 L596 303" stroke={C.red} strokeWidth="5" />
          <text x="621" y="401" textAnchor="middle" fontFamily={FONT} fontSize="15" letterSpacing="2" fill={C.red}>
            BELUM DISADARI
          </text>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 128, top: 807, opacity: opacity(frame, 177) }}>
        <Label>01 / Informasi ≠ perhatian</Label>
      </div>
    </div>
  );
};

const Desk: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sceneIn = enter(frame, 241, fps);
  const scanning = frame >= 404 && frame < 696;
  const scanX = 140 + ((Math.sin((frame - 404) / 47) + 1) / 2) * 870;
  const realization = progress(frame, 696, 738);
  const target = enter(frame, 483, fps);
  const missed = progress(frame, 560, 590);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 125, top: 164 }}>
        <Label style={{ opacity: opacity(frame, 241) }}>02 / Sebuah contoh sehari-hari</Label>
        <div style={{ marginTop: 20 }}>
          <Words
            text={frame < 276 ? "Contohnya." : "Mencari kunci."}
            frame={frame}
            fps={fps}
            start={frame < 276 ? 241 : 276}
            end={frame < 276 ? 257 : 328}
            size={69}
            serif
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 110,
          top: 305,
          transform: `translateY(${(1 - sceneIn) * 36}px)`,
          opacity: opacity(frame, 241),
        }}
      >
        <svg width="1190" height="565" viewBox="0 0 1190 565">
          <defs>
            <clipPath id="s08-desk-clip">
              <path d="M100 118 L954 72 L1110 400 L230 462Z" />
            </clipPath>
            <linearGradient id="s08-scan">
              <stop offset="0%" stopColor={C.blue} stopOpacity="0" />
              <stop offset="100%" stopColor={C.blue} stopOpacity="0.14" />
            </linearGradient>
          </defs>
          <ellipse cx="633" cy="495" rx="475" ry="24" fill={C.ink} opacity="0.055" />
          <path d="M230 462 L1110 400 V426 L230 488 L100 143 V118Z" fill="#CFC6B5" stroke={C.ink} strokeWidth="2" />
          <path d="M100 118 L954 72 L1110 400 L230 462Z" fill="#E9DFCC" stroke={C.ink} strokeWidth="3" />
          <path d="M275 487 V524 M1028 435 V494" stroke={C.ink} strokeWidth="13" />
          <g opacity="0.28" stroke="#AA9D85" fill="none">
            <path d="M188 163 L968 125 M206 230 L992 191 M235 299 L1030 252 M267 373 L1066 311" />
          </g>

          <g transform="translate(292 213) rotate(-10)">
            <rect x="-73" y="-55" width="168" height="122" rx="3" fill={C.teal} stroke={C.ink} strokeWidth="2" />
            <rect x="-61" y="-45" width="155" height="113" fill="#F2ECDD" stroke={C.ink} />
            <path d="M-40 -18 H65 M-40 0 H60 M-40 18 H37" stroke={C.line} strokeWidth="3" />
            <path d="M-65 -49 V60" stroke={C.teal} strokeWidth="8" />
          </g>
          <g transform="translate(823 170)">
            <ellipse cy="43" rx="58" ry="19" fill={C.ink} opacity="0.1" />
            <path d="M-40 -8 V37 Q0 66 40 37 V-8" fill={C.white} stroke={C.ink} strokeWidth="2.5" />
            <ellipse rx="40" ry="17" cy="-8" fill={C.white} stroke={C.ink} strokeWidth="2.5" />
            <ellipse rx="30" ry="10" cy="-7" fill="#634A36" />
            <path d="M42 3 C87 -3 81 52 41 36" fill="none" stroke={C.ink} strokeWidth="5" />
          </g>
          <g transform="translate(382 369) rotate(-8)">
            <rect x="-35" y="-62" width="70" height="119" rx="10" fill={C.ink} />
            <rect x="-28" y="-51" width="56" height="93" rx="3" fill="#A8BDBB" />
            <path d="M-17 -32 H15 M-17 -18 H7" stroke={C.white} opacity="0.5" />
            <circle cy="49" r="4" fill={C.paper} />
          </g>

          {frame >= 350 && (
            <g opacity={opacity(frame, 350, 15)}>
              <ellipse cx="620" cy="299" rx="79" ry="18" fill={C.ink} opacity="0.09" />
              <Key x={589} y={271} scale={0.85} rotation={14} />
            </g>
          )}

          {scanning && (
            <g clipPath="url(#s08-desk-clip)" opacity={opacity(frame, 404, 18) * (1 - missed * 0.42)}>
              <rect x={scanX - 190} y="60" width="190" height="430" fill="url(#s08-scan)" />
              <path d={`M${scanX} 50 V490`} stroke={C.blue} strokeWidth="2" />
              <circle cx={scanX} cy="263" r="120" fill="none" stroke={C.blue} strokeWidth="1.5" strokeDasharray="8 7" />
            </g>
          )}

          <g opacity={opacity(frame, 350)}>
            <path d="M618 310 L716 388 H847" fill="none" stroke={C.ink} strokeWidth="1.5" />
            <circle cx="618" cy="310" r="4" fill={C.ink} />
            <rect x="733" y="368" width="220" height="43" fill={C.paper} />
            <text x="749" y="396" fontFamily={FONT} fontSize="20" fontWeight="700" fill={C.ink}>
              ADA DI MEJA
            </text>
          </g>

          {frame >= 696 && (
            <g>
              <path
                d="M528 238 C566 188 706 211 724 263 C751 326 574 360 529 310 C499 276 510 243 543 225"
                fill="none"
                stroke={C.red}
                strokeWidth="6"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={1 - realization}
              />
              <circle cx="595" cy="270" r={95 + Math.sin(frame / 17) * 3} fill={C.yellow} opacity={realization * 0.12} />
            </g>
          )}

          <g opacity={opacity(frame, 404)} transform="translate(167 34)">
            <circle r="6" fill={frame >= 696 ? C.teal : C.blue} />
            <text x="19" y="6" fontFamily={FONT} fontSize="15" letterSpacing="2" fill={C.muted}>
              {frame >= 696 ? "OBJEK DIKENALI" : "MEJA SUDAH TERLIHAT"}
            </text>
          </g>
        </svg>
      </div>

      <div style={{ position: "absolute", left: 1320, top: 323, width: 456 }}>
        <div style={{ opacity: opacity(frame, 276), borderTop: `3px solid ${C.ink}`, paddingTop: 18 }}>
          <Label>Yang sedang dicari</Label>
          <Words text="Kunci" frame={frame} fps={fps} start={276} end={290} size={44} serif style={{ display: "block", marginTop: 12 }} />
        </div>

        {frame >= 456 && (
          <div style={{ marginTop: 28 }}>
            <Words text="Tapi…" frame={frame} fps={fps} start={456} end={461} size={30} color={C.red} serif />
          </div>
        )}

        {frame >= 483 && (
          <div
            style={{
              marginTop: 24,
              background: C.white,
              border: `1px solid ${C.line}`,
              padding: "24px 26px",
              transform: `translateY(${(1 - target) * 22}px)`,
              opacity: opacity(frame, 483),
              boxShadow: "7px 7px 0 rgba(24,24,27,0.05)",
            }}
          >
            <Label color={C.blue}>Bentuk yang dibayangkan</Label>
            <svg width="330" height="103" viewBox="0 0 330 103">
              <Key x={96} y={53} rotation={0} scale={0.75} color={C.blue} outline />
              <path d="M51 17 H32 V39 M265 17 H284 V39 M32 72 V89 H51 M265 89 H284 V72" fill="none" stroke={C.blue} />
            </svg>
            <Words
              text="Perhatian mengikuti bentuk tertentu."
              frame={frame}
              fps={fps}
              start={483}
              end={543}
              size={26}
              weight={400}
              style={{ lineHeight: 1.35, letterSpacing: -0.4 }}
            />
          </div>
        )}

        {frame >= 560 && frame < 696 && (
          <div style={{ marginTop: 24, paddingLeft: 18, borderLeft: `4px solid ${C.red}` }}>
            <Words text="Bisa terlewat." frame={frame} fps={fps} start={560} end={600} size={34} color={C.red} serif />
          </div>
        )}

        {frame >= 618 && frame < 696 && (
          <div style={{ marginTop: 25 }}>
            <Words text="Lalu…" frame={frame} fps={fps} start={618} end={626} size={24} color={C.muted} weight={400} />
            <div style={{ marginTop: 12 }}>
              <Words text="Beberapa detik kemudian" frame={frame} fps={fps} start={647} end={678} size={23} weight={400} />
            </div>
            <svg width="330" height="24" style={{ marginTop: 13 }}>
              <path d="M3 12 H320" stroke={C.line} strokeWidth="2" />
              <path d="M3 12 H320" stroke={C.ink} strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - progress(frame, 647, 696)} />
              {[0, 1, 2, 3, 4].map((n) => (
                <circle key={n} cx={3 + n * 79} cy="12" r="4" fill={frame >= 647 + n * 12 ? C.ink : C.line} />
              ))}
            </svg>
          </div>
        )}

        {frame >= 696 && (
          <div style={{ marginTop: 24 }}>
            <Words text="Lah!" frame={frame} fps={fps} start={696} end={703} size={55} color={C.red} serif />
            <div
              style={{
                marginTop: 15,
                padding: "14px 16px",
                background: frame >= 725 ? C.yellow : "transparent",
              }}
            >
              <Words text="Dari tadi ada di sini." frame={frame} fps={fps} start={725} end={750} size={31} weight={700} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BrainDiagram: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const brainIn = enter(frame, 815, fps);
  const flow = progress(frame, 829, 891);
  const object = progress(frame, 891, 917);
  const nodes = [
    [561, 333], [625, 286], [692, 334], [751, 268],
    [809, 344], [867, 294], [914, 373], [851, 426],
    [764, 412], [681, 447], [603, 409],
  ];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 125, top: 164 }}>
        <Label style={{ opacity: opacity(frame, 768) }}>03 / Melihat bukan hanya soal mata</Label>
        <div style={{ marginTop: 22 }}>
          <Words text="Bukan matamu yang rusak." frame={frame} fps={fps} start={768} end={797} size={61} serif />
        </div>
      </div>
      <svg style={{ position: "absolute", left: 100, top: 300 }} width="1730" height="390" viewBox="0 0 1730 560">
        <g opacity={opacity(frame, 768)}>
          <circle cx="207" cy="337" r="134" fill={C.white} stroke={C.line} />
          <Eye x={207} y={337} scale={1.05} color={C.teal} />
          <text x="207" y="517" textAnchor="middle" fontFamily={FONT} fontSize="19" letterSpacing="3" fill={C.teal}>MATA</text>
          <circle cx="298" cy="233" r="23" fill={C.teal} />
          <path d="M287 233 L295 241 L309 225" fill="none" stroke={C.white} strokeWidth="4" />
        </g>

        <g opacity={opacity(frame, 815)} transform={`translate(0 ${(1 - brainIn) * 25})`}>
          <path
            d="M542 431 C478 390 492 329 511 303 C480 244 526 190 586 190 C606 124 685 113 726 145 C775 96 852 125 870 165 C943 145 1000 201 994 254 C1052 288 1058 352 1016 386 C1019 452 953 482 899 464 C867 510 798 509 764 482 C714 519 654 495 636 470 C591 494 549 472 542 431Z"
            fill={C.white}
            stroke={C.ink}
            strokeWidth="4"
          />
          <path
            d="M727 151 C701 211 744 237 719 283 C694 328 735 369 726 419 L764 482 M586 190 C627 214 601 258 629 280 M511 303 C554 311 592 281 614 319 M542 431 C558 389 597 375 629 387 M870 165 C850 219 908 229 894 269 M994 254 C951 272 936 311 965 340 M899 464 C878 417 829 437 815 386"
            fill="none"
            stroke={C.line}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M561 333 L625 286 L692 334 L751 268 L809 344 L867 294 L914 373 L851 426 L764 412 L681 447 L603 409 L561 333 M692 334 L681 447 M809 344 L764 412 M625 286 L603 409"
            fill="none"
            stroke={C.blue}
            strokeWidth="2.5"
            opacity={0.15 + flow * 0.6}
          />
          {nodes.map(([x, y], i) => {
            const pulse = (Math.sin(frame / 10 - i * 0.9) + 1) / 2;
            return (
              <g key={i} opacity={opacity(frame, 829 + i * 3)}>
                <circle cx={x} cy={y} r={10 + pulse * 8} fill={C.blue} opacity={0.08 + pulse * 0.12} />
                <circle cx={x} cy={y} r="5" fill={C.blue} />
              </g>
            );
          })}
          <text x="762" y="552" textAnchor="middle" fontFamily={FONT} fontSize="19" letterSpacing="3" fill={C.ink}>OTAK / ALOKASI PERHATIAN</text>
        </g>

        <path
          d="M350 337 H493"
          stroke={C.teal}
          strokeWidth="4"
          fill="none"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - flow}
        />
        <path d="M477 327 L494 337 L477 347" fill="none" stroke={C.teal} strokeWidth="4" opacity={flow} />

        <g opacity={flow}>
          <path d="M1045 337 H1320" stroke={C.line} strokeWidth="4" strokeDasharray="10 12" />
          <path d="M1045 337 H1173" stroke={C.blue} strokeWidth="4" />
          <circle cx="1193" cy="337" r="19" fill={C.paper} stroke={C.red} strokeWidth="3" />
          <path d="M1185 329 L1201 345 M1201 329 L1185 345" stroke={C.red} strokeWidth="2" />
          <text x="1189" y="289" textAnchor="middle" fontFamily={FONT} fontSize="17" fill={C.red}>PERHATIAN TIDAK PENUH</text>
        </g>

        <g opacity={object}>
          <rect x="1351" y="220" width="247" height="234" rx="3" fill={C.white} stroke={C.line} strokeWidth="2" />
          <Key x={1434} y={336} rotation={-20} scale={0.8} color={C.muted} />
          <text x="1475" y="499" textAnchor="middle" fontFamily={FONT} fontSize="19" letterSpacing="3" fill={C.muted}>BENDA</text>
          <path d="M1370 241 H1400 M1370 241 V271 M1578 241 H1548 M1578 241 V271 M1370 435 H1400 M1370 435 V405 M1578 435 H1548 M1578 435 V405" stroke={C.red} strokeWidth="2" fill="none" />
        </g>
      </svg>

      <div style={{ position: "absolute", left: 345, top: 764, width: 1230, textAlign: "center" }}>
        <Words text="Otakmu" frame={frame} fps={fps} start={815} end={829} size={37} serif />
        <Words text="hanya tidak memberikan perhatian penuh" frame={frame} fps={fps} start={829} end={891} size={37} serif color={C.blue} />
        <div style={{ marginTop: 12 }}>
          <Words text="pada benda tersebut." frame={frame} fps={fps} start={891} end={925} size={30} weight={400} />
        </div>
      </div>
    </div>
  );
};

const EvidenceBridge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const inSpring = enter(frame, 999, fps);
  const highlight = progress(frame, 1034, 1082);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 125, top: 185 }}>
        <Words text="Dan," frame={frame} fps={fps} start={937} end={950} size={37} serif />
        <div style={{ marginTop: 15 }}>
          <Words text="sebenarnya…" frame={frame} fps={fps} start={967} end={978} size={37} serif color={C.muted} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 198,
          width: 1100,
          height: 600,
          background: C.white,
          border: `1px solid ${C.line}`,
          boxShadow: "15px 18px 0 rgba(24,24,27,0.055)",
          padding: "48px 58px",
          boxSizing: "border-box",
          opacity: opacity(frame, 999),
          transform: `translateY(${(1 - inSpring) * 35}px) rotate(-1.2deg)`,
        }}
      >
        <Label>Catatan investigasi / persepsi</Label>
        <div style={{ height: 1, background: C.line, marginTop: 25, marginBottom: 35 }} />
        <Words text="Semua ini" frame={frame} fps={fps} start={999} end={1034} size={59} serif />
        <div style={{ position: "relative", marginTop: 25 }}>
          <div
            style={{
              position: "absolute",
              left: -10,
              top: 10,
              width: `${highlight * 95}%`,
              height: 63,
              background: C.yellow,
              transform: "rotate(-0.8deg)",
            }}
          />
          <div style={{ position: "relative" }}>
            <Words text="menunjukkan sesuatu" frame={frame} fps={fps} start={1034} end={1064} size={57} serif />
            <div style={{ marginTop: 11 }}>
              <Words text="yang cukup penting." frame={frame} fps={fps} start={1064} end={1094} size={57} serif />
            </div>
          </div>
        </div>
        <svg width="970" height="115" style={{ marginTop: 34 }} viewBox="0 0 970 115">
          <path d="M0 20 H970" stroke={C.line} />
          <g opacity={opacity(frame, 1034)}>
            <Eye x={73} y={76} scale={0.43} />
            <path d="M135 76 H314" stroke={C.line} strokeWidth="2" />
            <circle cx="367" cy="76" r="28" fill="none" stroke={C.blue} strokeWidth="2" />
            <path d="M349 76 L362 63 L380 86" stroke={C.blue} strokeWidth="3" fill="none" />
            <path d="M420 76 H600" stroke={C.line} strokeWidth="2" />
            <Key x={649} y={76} scale={0.37} />
            <text x="765" y="83" fontFamily={FONT} fontSize="17" fill={C.muted} letterSpacing="2">08 / 11</text>
          </g>
        </svg>
      </div>
    </div>
  );
};

const BeliefIcon: React.FC<{ type: number; frame: number; cue: number }> = ({ type, frame, cue }) => {
  const t = frame - cue;
  return (
    <svg width="86" height="86" viewBox="0 0 86 86">
      <circle cx="43" cy="43" r="40" fill={C.white} stroke={C.line} />
      {type === 0 && <Eye x={43} y={43} scale={0.32} look={Math.sin(t / 30) * 7} color={C.blue} />}
      {type === 1 && (
        <g fill="none" stroke={C.teal} strokeWidth="2.5">
          <rect x="23" y="20" width="36" height="44" transform="rotate(-7 43 43)" fill={C.white} />
          <rect x="29" y="25" width="36" height="44" fill={C.white} />
          <path d="M36 36 H57 M36 44 H57 M36 52 H49" />
          <path d="M19 38 C10 53 18 67 29 68" opacity={0.5 + Math.sin(t / 20) * 0.2} />
        </g>
      )}
      {type === 2 && (
        <g fill="none" stroke={C.red} strokeWidth="2.5">
          <circle cx="35" cy="43" r="16" />
          <circle cx="51" cy="43" r="16" />
          <path d="M35 43 H51" strokeDasharray="2 3" />
          <circle cx="43" cy="43" r={4 + Math.sin(t / 17)} fill={C.red} opacity="0.2" />
        </g>
      )}
      {type === 3 && (
        <g fill="none" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round">
          <circle cx="43" cy="45" r="24" />
          <path d="M37 14 H49 M43 15 V21" />
          <path d="M43 45 V29" transform={`rotate(${Math.max(0, t) * 0.7} 43 45)`} />
          <path d="M43 45 L54 51" />
          <circle cx="43" cy="45" r="2" fill={C.ink} />
        </g>
      )}
    </svg>
  );
};

const Beliefs: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const rows = [
    {
      cue: 1133, end: 1176, resultCue: 1196, resultEnd: 1226,
      condition: "Apa yang saya lihat", result: "itu kenyataan.",
      label: "PENGLIHATAN", color: C.blue,
    },
    {
      cue: 1243, end: 1263, resultCue: 1278, resultEnd: 1311,
      condition: "Kalau saya ingat", result: "memang terjadi.",
      label: "INGATAN", color: C.teal,
    },
    {
      cue: 1331, end: 1365, resultCue: 1394, resultEnd: 1431,
      condition: "Kalau saya merasa familiar", result: "saya pernah mengalaminya.",
      label: "FAMILIARITAS", color: C.red,
    },
    {
      cue: 1449, end: 1488, resultCue: 1514, resultEnd: 1548,
      condition: "Kalau saya merasa waktunya lama", result: "memang waktunya lama.",
      label: "WAKTU", color: C.ink,
    },
  ];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 125, top: 160 }}>
        <Label style={{ opacity: opacity(frame, 1110) }}>04 / Dari pengalaman ke kesimpulan</Label>
        <div style={{ marginTop: 18 }}>
          <Words text="Kita sering merasa…" frame={frame} fps={fps} start={1110} end={1133} size={61} serif />
        </div>
      </div>

      <div style={{ position: "absolute", left: 125, top: 287, width: 1668 }}>
        {rows.map((row, index) => {
          if (frame < row.cue) return null;
          const s = enter(frame, row.cue, fps);
          const arrow = progress(frame, row.resultCue, row.resultCue + 17);
          return (
            <div
              key={row.label}
              style={{
                position: "absolute",
                top: index * 144,
                width: "100%",
                height: 130,
                display: "flex",
                alignItems: "center",
                background: C.white,
                border: `1px solid ${C.line}`,
                opacity: opacity(frame, row.cue),
                transform: `translateY(${(1 - s) * 20}px)`,
                boxShadow: "4px 4px 0 rgba(24,24,27,0.025)",
              }}
            >
              <div style={{ width: 5, alignSelf: "stretch", background: row.color }} />
              <div style={{ width: 116, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                <BeliefIcon type={index} frame={frame} cue={row.cue} />
              </div>
              <div style={{ width: 643, flexShrink: 0 }}>
                <Label color={row.color} style={{ fontSize: 11, letterSpacing: 2, marginBottom: 11, opacity: opacity(frame, row.cue + 5) }}>
                  {row.label}
                </Label>
                <Words
                  text={row.condition}
                  frame={frame}
                  fps={fps}
                  start={row.cue}
                  end={row.end}
                  size={index === 3 ? 31 : 35}
                  weight={400}
                  style={{ letterSpacing: -1 }}
                />
              </div>
              <svg width="117" height="62" viewBox="0 0 117 62" style={{ flexShrink: 0 }}>
                <path
                  d="M5 36 H101"
                  stroke={row.color}
                  strokeWidth="2"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={1 - arrow}
                />
                <path d="M91 26 L102 36 L91 46" fill="none" stroke={row.color} strokeWidth="2" opacity={arrow} />
                <text x="53" y="18" textAnchor="middle" fontFamily={FONT} fontSize="10" letterSpacing="2" fill={C.muted} opacity={arrow}>
                  BERARTI
                </text>
              </svg>
              <div style={{ marginLeft: 31, width: 660, position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: -8,
                    top: 2,
                    height: 39,
                    width: `${progress(frame, row.resultCue, row.resultEnd) * 98}%`,
                    background: C.yellow,
                    opacity: 0.85,
                    transform: "rotate(-0.4deg)",
                  }}
                />
                <div style={{ position: "relative" }}>
                  <Words
                    text={row.result}
                    frame={frame}
                    fps={fps}
                    start={row.resultCue}
                    end={row.resultEnd}
                    size={index > 1 ? 34 : 38}
                    serif
                    weight={400}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Caption: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  let selected: (typeof cues)[number] | undefined;
  for (let i = 0; i < cues.length; i++) {
    const nextStart = cues[i + 1]?.[0] ?? 1550;
    if (frame >= cues[i][0] && frame < nextStart) {
      selected = cues[i];
      break;
    }
  }
  if (!selected) return null;
  const [start, end, text] = selected;
  return (
    <div
      style={{
        position: "absolute",
        left: 145,
        right: 145,
        bottom: 49,
        height: 78,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ maxWidth: 1560, textAlign: "center", padding: "12px 28px" }}>
        <Words
          text={text}
          frame={frame}
          fps={fps}
          start={start}
          end={end}
          size={29}
          weight={400}
          color={C.ink}
          style={{ letterSpacing: -0.35, lineHeight: 1.35 }}
        />
      </div>
    </div>
  );
};

export const Scene_08: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);
  const sceneDuration = 1549;

  const section =
    frame < 241 ? "MELIHAT / MENYADARI" :
    frame < 768 ? "KUNCI YANG TERLEWAT" :
    frame < 937 ? "ALOKASI PERHATIAN" :
    frame < 1110 ? "CATATAN INVESTIGASI" :
    "PENGALAMAN / KESIMPULAN";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: C.paper,
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
          color: C.ink,
          fontFamily: FONT,
        }}
      >
        <Sequence from={0} durationInFrames={sceneDuration} layout="none">
          <PaperBackground frame={frame} />
        </Sequence>

        <Sequence from={38} durationInFrames={203} layout="none">
          <Intro frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={241} durationInFrames={527} layout="none">
          <Desk frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={768} durationInFrames={169} layout="none">
          <BrainDiagram frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={937} durationInFrames={173} layout="none">
          <EvidenceBridge frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={1110} durationInFrames={439} layout="none">
          <Beliefs frame={frame} fps={fps} />
        </Sequence>

        <Sequence from={38} durationInFrames={1511} layout="none">
          <div
            style={{
              position: "absolute",
              left: 79,
              top: 53,
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: opacity(frame, 38),
            }}
          >
            <div
              style={{
                background: C.yellow,
                padding: "8px 14px",
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: -2,
              }}
            >
              vox
            </div>
            <Label color={C.ink}>Cara otak membentuk pengalaman</Label>
          </div>

          <div
            style={{
              position: "absolute",
              right: 79,
              top: 68,
              display: "flex",
              alignItems: "center",
              gap: 22,
              opacity: opacity(frame, 38),
            }}
          >
            <Label style={{ fontSize: 12, letterSpacing: 2 }}>{section}</Label>
            <div style={{ width: 1, height: 19, background: C.line }} />
            <Label color={C.ink}>08 / 11</Label>
          </div>

          <Caption frame={frame} fps={fps} />

          <div
            style={{
              position: "absolute",
              left: 79,
              bottom: 28,
              fontSize: 11,
              letterSpacing: 2,
              color: C.muted,
            }}
          >
            PERSEPSI · PERHATIAN · PENGALAMAN
          </div>
          <div
            style={{
              position: "absolute",
              left: 125,
              right: 125,
              bottom: 14,
              height: 2,
              background: C.line,
            }}
          >
            <div
              style={{
                width: `${progress(frame, 0, 1548) * 100}%`,
                height: "100%",
                background: C.ink,
              }}
            />
          </div>
        </Sequence>
      </div>
    </div>
  );
};