import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MinoCharacter, MinoPose } from "./MinoCharacter";
import { VoxCaptions } from "../VoxCaptions";
import { VoxPaperBackground } from "../VoxPaperBackground";
import { EditorialHeader } from "../EditorialHeader";
import { VoxHighlighter } from "../VoxHighlighter";
import { VoxRedMarker } from "../VoxRedMarker";
import { generatedMinoScenes } from "./scenes/generated";
import rawCaptions from "../../../public/captions.json";
import { CaptionWord } from "../types";

const captions = rawCaptions as CaptionWord[];

// Palette
const INK = "#18181B";
const PAPER = "#F5F2EB";
const YELLOW = "#FFE600";
const RED = "#E63946";
const BLUE = "#2563EB";
const MUTED = "#71717A";
const BORDER = "#D4D4D8";

const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MONO = "'SF Mono', Menlo, Monaco, 'Courier New', monospace";



/* -------------------------------------------------------------------------- */
/* Visual Scene 1 (0s - 9.5s): Hook & Polaroid                                */
/* -------------------------------------------------------------------------- */
const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const cardSpring = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 14, stiffness: 90 } });

  return (
    <div
      style={{
        position: "absolute",
        top: 180,
        left: 48,
        right: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 20,
      }}
    >
      {/* Editorial Headline */}
      <div
        style={{
          fontFamily: SANS,
          fontSize: 62,
          fontWeight: 900,
          color: INK,
          textAlign: "center",
          lineHeight: 1.08,
          letterSpacing: -2,
          transform: `translateY(${(1 - titleSpring) * 30}px)`,
          opacity: titleSpring,
        }}
      >
        Pernah Merasa{" "}
        <span style={{ color: RED, textDecoration: "underline wavy #E63946" }}>
          Di Sini?
        </span>
      </div>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 18,
          color: MUTED,
          marginTop: 14,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        [ Kasus: Tempat Asing Terasa Familiar ]
      </div>

      {/* Polaroid Archival Card */}
      <div
        style={{
          marginTop: 40,
          background: "#FFFFFF",
          padding: "24px 24px 36px 24px",
          borderRadius: 8,
          boxShadow: "0 20px 45px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
          border: `1px solid ${BORDER}`,
          transform: `scale(${cardSpring}) rotate(-2.5deg)`,
          width: 520,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Archival Tape on Top */}
        <div
          style={{
            position: "absolute",
            top: -16,
            width: 140,
            height: 32,
            background: "rgba(254, 240, 138, 0.75)",
            border: "1px dashed rgba(0,0,0,0.15)",
            transform: "rotate(1.5deg)",
          }}
        />

        {/* Vintage Room Illustration Box */}
        <div
          style={{
            width: "100%",
            height: 310,
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
            borderRadius: 4,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Room perspective grid */}
          <svg width="100%" height="100%" viewBox="0 0 480 310">
            <line x1="0" y1="0" x2="240" y2="155" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <line x1="480" y1="0" x2="240" y2="155" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <line x1="0" y1="310" x2="240" y2="155" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <line x1="480" y1="310" x2="240" y2="155" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            {/* Window */}
            <rect x="290" y="70" width="80" height="110" fill="#38BDF8" opacity="0.3" stroke="#93C5FD" strokeWidth="3" />
            {/* Door */}
            <rect x="110" y="85" width="65" height="150" fill="#64748B" opacity="0.4" stroke="#CBD5E1" strokeWidth="2" />
            {/* Lamp glowing */}
            <circle cx="240" cy="50" r="14" fill={YELLOW} opacity="0.9" />
            <line x1="240" y1="0" x2="240" y2="50" stroke="#FFFFFF" strokeWidth="2" />
          </svg>

          {/* Stamped Tag */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              background: "rgba(0, 0, 0, 0.75)",
              color: "#FFFFFF",
              padding: "6px 14px",
              fontFamily: MONO,
              fontSize: 14,
              letterSpacing: 1,
              borderRadius: 3,
            }}
          >
            LOKASI: KAFE BARU #04
          </div>
        </div>

        {/* Polaroid Caption */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ fontFamily: SERIF, fontSize: 22, fontStyle: "italic", color: INK }}>
            &ldquo;Belum pernah ke sini... tapi akrab?&rdquo;
          </div>
          <div
            style={{
              background: RED,
              color: "#FFFFFF",
              fontSize: 13,
              fontFamily: MONO,
              padding: "4px 8px",
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            ANEH?
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Visual Scene 2 (9.5s - 19s): Déjà Vu & Brain Synapse                       */
/* -------------------------------------------------------------------------- */
const Scene2Brain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const pulse = Math.sin((frame / fps) * 8) * 0.15 + 1;

  return (
    <div
      style={{
        position: "absolute",
        top: 180,
        left: 48,
        right: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 20,
      }}
    >
      {/* Title with Highlighter */}
      <div
        style={{
          fontFamily: SANS,
          fontSize: 58,
          fontWeight: 900,
          color: INK,
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: -1.5,
          transform: `translateY(${(1 - titleSpring) * 25}px)`,
          opacity: titleSpring,
        }}
      >
        Fenomena Ini Disebut{" "}
        <VoxHighlighter delay={10} color={YELLOW}>
          <span style={{ padding: "0 8px" }}>DÉJÀ VU</span>
        </VoxHighlighter>
      </div>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 18,
          color: MUTED,
          marginTop: 14,
          letterSpacing: 1.5,
        }}
      >
        [ SISTEM PEMROSESAN MEMORI DI TEMPORAL LOBE ]
      </div>

      {/* SVG Stylized Brain Diagram Card */}
      <div
        style={{
          marginTop: 36,
          background: "#FFFFFF",
          padding: "32px 36px",
          borderRadius: 12,
          boxShadow: "0 20px 45px rgba(0,0,0,0.08)",
          border: `1px solid ${BORDER}`,
          width: 580,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Brain Cross Section SVG */}
        <svg width="420" height="260" viewBox="0 0 420 260" fill="none">
          {/* Brain Outline Left & Right */}
          <path
            d="M80 130 C60 90, 100 30, 190 30 C205 30, 210 50, 210 130 C210 210, 160 230, 120 220 C90 210, 60 170, 80 130 Z"
            fill="#EFF6FF"
            stroke={BLUE}
            strokeWidth="5"
          />
          <path
            d="M340 130 C360 90, 320 30, 230 30 C215 30, 210 50, 210 130 C210 210, 260 230, 300 220 C330 210, 360 170, 340 130 Z"
            fill="#FEF2F2"
            stroke={RED}
            strokeWidth="5"
          />

          {/* Center Dividing Fissure */}
          <line x1="210" y1="30" x2="210" y2="225" stroke={INK} strokeWidth="4" strokeDasharray="6 4" />

          {/* Synapse pulses and signals */}
          <g transform={`scale(${pulse})`} style={{ transformOrigin: "210px 130px" }}>
            <circle cx="150" cy="110" r="28" fill={BLUE} opacity="0.25" />
            <circle cx="150" cy="110" r="14" fill={BLUE} opacity="0.8" />
            <circle cx="270" cy="110" r="28" fill={RED} opacity="0.25" />
            <circle cx="270" cy="110" r="14" fill={RED} opacity="0.8" />
          </g>

          {/* Synapse connecting spark */}
          <path
            d="M150 110 Q210 70 270 110"
            stroke={YELLOW}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Labels inside SVG */}
          <text x="100" y="190" fontFamily={MONO} fontSize="14" fontWeight="bold" fill={BLUE}>
            PENGALAMAN BARU
          </text>
          <text x="240" y="190" fontFamily={MONO} fontSize="14" fontWeight="bold" fill={RED}>
            RASA PERNAH ALAMI
          </text>
        </svg>

        {/* Informational Callout */}
        <div
          style={{
            marginTop: 18,
            background: "#F8FAFC",
            borderLeft: `4px solid ${BLUE}`,
            padding: "12px 18px",
            width: "100%",
            borderRadius: 4,
          }}
        >
          <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: INK }}>
            &ldquo;Otak memproses persepsi baru lewat jalur memori lama.&rdquo;
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: MUTED, marginTop: 4 }}>
            Delay transmisi ~10-20 milidetik menciptakan ilusi ingatan.
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Visual Scene 3 (19s - 31s): Match Finder & Clues                          */
/* -------------------------------------------------------------------------- */
const Scene3Match: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const scanProgress = interpolate(frame % 90, [0, 90], [0, 100]);

  return (
    <div
      style={{
        position: "absolute",
        top: 180,
        left: 48,
        right: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 20,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 58,
          fontWeight: 900,
          color: INK,
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: -1.5,
          transform: `translateY(${(1 - titleSpring) * 25}px)`,
          opacity: titleSpring,
        }}
      >
        Hanya Menemukan{" "}
        <span style={{ color: BLUE }}>Kemiripan Kecil</span>
      </div>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 18,
          color: MUTED,
          marginTop: 14,
          letterSpacing: 1.5,
        }}
      >
        [ BUKAN BERARTI PERNAH MELIHAT KEJADIAN PERSIS ]
      </div>

      {/* Dual Dossier Cards Comparison */}
      <div
        style={{
          marginTop: 36,
          display: "flex",
          gap: 20,
          width: 620,
          justifyContent: "center",
        }}
      >
        {/* Card 1: Memori Lama */}
        <div
          style={{
            flex: 1,
            background: "#FFFFFF",
            padding: "24px 20px",
            borderRadius: 8,
            boxShadow: "0 14px 30px rgba(0,0,0,0.06)",
            border: `1px solid ${BORDER}`,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 13, color: MUTED, fontWeight: 700 }}>
            DOSSIER A // 2018
          </div>
          <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: INK, marginTop: 6 }}>
            Kamar Masa Lalu
          </div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontFamily: SANS }}>
              <span style={{ color: BLUE, fontWeight: 900 }}>•</span> Sudut Meja Kayu
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontFamily: SANS }}>
              <span style={{ color: BLUE, fontWeight: 900 }}>•</span> Lampu Kuning Hangat
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontFamily: SANS }}>
              <span style={{ color: BLUE, fontWeight: 900 }}>•</span> Suara Kipas Angin
            </div>
          </div>
        </div>

        {/* Card 2: Pengalaman Baru */}
        <div
          style={{
            flex: 1,
            background: "#FFFFFF",
            padding: "24px 20px",
            borderRadius: 8,
            boxShadow: "0 14px 30px rgba(0,0,0,0.06)",
            border: `2px solid ${RED}`,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 13, color: RED, fontWeight: 700 }}>
            DOSSIER B // HARI INI
          </div>
          <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: INK, marginTop: 6 }}>
            Kafe Baru (Asing)
          </div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontFamily: SANS, background: "#FEF08A", padding: "2px 6px", borderRadius: 3 }}>
              <span style={{ color: RED, fontWeight: 900 }}>✔</span> Sudut Meja Mirip!
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontFamily: SANS }}>
              <span style={{ color: MUTED }}>•</span> Barista Asing
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontFamily: SANS }}>
              <span style={{ color: MUTED }}>•</span> Musik Jazz Baru
            </div>
          </div>

          {/* Scanner Line */}
          <div
            style={{
              position: "absolute",
              top: `${scanProgress}%`,
              left: 0,
              right: 0,
              height: 2,
              background: RED,
              boxShadow: `0 0 8px ${RED}`,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Matching Pill Tag */}
      <div
        style={{
          marginTop: 24,
          background: INK,
          color: PAPER,
          padding: "10px 24px",
          borderRadius: 20,
          fontFamily: MONO,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        MATCH FITUR: <span style={{ color: YELLOW }}>HANYA 15%</span> · OTAK SALAH SIMPUL!
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Visual Scene 4 (31s - 41s): 3 Triggers / Detail Radar                      */
/* -------------------------------------------------------------------------- */
const Scene4Triggers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });

  const triggers = [
    { num: "01", label: "Suasana Ruangan", detail: "Pencahayaan & aroma ruangan yang identik", delay: 8 },
    { num: "02", label: "Posisi Benda", detail: "Tata letak perabot yang memicu rasa familiar", delay: 20 },
    { num: "03", label: "Perasaan Mirip", detail: "Kondisi emosi atau kelelahan mental", delay: 32 },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 180,
        left: 48,
        right: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 20,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 58,
          fontWeight: 900,
          color: INK,
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: -1.5,
          transform: `translateY(${(1 - titleSpring) * 25}px)`,
          opacity: titleSpring,
        }}
      >
        Tiga Pemicu Utama
      </div>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 18,
          color: MUTED,
          marginTop: 14,
          letterSpacing: 1.5,
        }}
      >
        [ LALU OTAK BILANG: &ldquo;INI FAMILIAR!&rdquo; ]
      </div>

      {/* 3 Triggers Stack */}
      <div
        style={{
          marginTop: 36,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: 580,
        }}
      >
        {triggers.map((t) => {
          const s = spring({ frame: Math.max(0, frame - t.delay), fps, config: { damping: 14, stiffness: 110 } });
          return (
            <div
              key={t.num}
              style={{
                background: "#FFFFFF",
                borderRadius: 8,
                padding: "18px 24px",
                boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                border: `1px solid ${BORDER}`,
                display: "flex",
                alignItems: "center",
                gap: 20,
                transform: `translateX(${(1 - s) * -40}px)`,
                opacity: s,
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 22,
                  fontWeight: 900,
                  color: BLUE,
                  background: "#DBEAFE",
                  padding: "6px 12px",
                  borderRadius: 6,
                }}
              >
                {t.num}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: INK }}>
                  {t.label}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED, marginTop: 2 }}>
                  {t.detail}
                </div>
              </div>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: YELLOW }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Visual Scene 5 (41s - 49s): The 67% Stat Card                              */
/* -------------------------------------------------------------------------- */
const Scene5Stat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const statSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 12, stiffness: 90 } });

  return (
    <div
      style={{
        position: "absolute",
        top: 180,
        left: 48,
        right: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 20,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 58,
          fontWeight: 900,
          color: INK,
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: -1.5,
          transform: `translateY(${(1 - titleSpring) * 25}px)`,
          opacity: titleSpring,
        }}
      >
        Tenang, Kamu Normal!
      </div>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 18,
          color: MUTED,
          marginTop: 14,
          letterSpacing: 1.5,
        }}
      >
        [ BUKAN INGATAN MASA LALU ATAU KEAJAIBAN ]
      </div>

      {/* Big Editorial Stat Card */}
      <div
        style={{
          marginTop: 36,
          background: "#FFFFFF",
          borderRadius: 12,
          padding: "36px 40px",
          boxShadow: "0 22px 48px rgba(0,0,0,0.08)",
          border: `1px solid ${BORDER}`,
          width: 580,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          transform: `scale(${statSpring})`,
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 16, color: MUTED, letterSpacing: 1 }}>
          STATISTIK POPULASI DUNIA
        </div>

        {/* Big Number with Red Marker Circle */}
        <div style={{ position: "relative", margin: "20px 0" }}>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 110,
              fontWeight: 900,
              color: RED,
              lineHeight: 1,
              letterSpacing: -4,
            }}
          >
            67%
          </div>
          <VoxRedMarker delay={20} width={240} height={110} color={RED} />
        </div>

        <div
          style={{
            fontFamily: SANS,
            fontSize: 22,
            fontWeight: 800,
            color: INK,
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          Orang dewasa sehat pernah mengalami déjà vu
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: MONO,
            fontSize: 14,
            color: MUTED,
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 14,
            width: "100%",
            textAlign: "center",
          }}
        >
          Sumber: Alan S. Brown (2003), Psychological Bulletin
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Visual Scene 6 (49s - 54s): Scientific Verdict Card                        */
/* -------------------------------------------------------------------------- */
const Scene6Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });

  return (
    <div
      style={{
        position: "absolute",
        top: 180,
        left: 48,
        right: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 20,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 58,
          fontWeight: 900,
          color: INK,
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: -1.5,
          transform: `translateY(${(1 - titleSpring) * 25}px)`,
          opacity: titleSpring,
        }}
      >
        Kesimpulan Ilmiah
      </div>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 18,
          color: MUTED,
          marginTop: 14,
          letterSpacing: 1.5,
        }}
      >
        [ HANYA SINYAL RASA FAMILIAR TERHADAP HAL BARU ]
      </div>

      {/* Dossier Card with Quote */}
      <div
        style={{
          marginTop: 40,
          background: "#FFFFFF",
          borderRadius: 12,
          padding: "36px 40px",
          boxShadow: "0 22px 48px rgba(0,0,0,0.08)",
          border: `1px solid ${BORDER}`,
          width: 580,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 32,
            lineHeight: 1.35,
            color: INK,
            fontStyle: "italic",
          }}
        >
          &ldquo;Otakmu cuma lagi bikin kamu merasa familiar dengan sesuatu yang baru.&rdquo;
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              background: "#DBEAFE",
              color: BLUE,
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 800,
              padding: "6px 14px",
              borderRadius: 4,
            }}
          >
            VERIFIED SCIENCE
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, color: MUTED }}>
            KOGNISI MANUSIA
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Visual Scene 7 (54s - 57s): Mino Sign-off Hero                             */
/* -------------------------------------------------------------------------- */
const Scene7Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });

  return (
    <div
      style={{
        position: "absolute",
        top: 200,
        left: 48,
        right: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 20,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 76,
          fontWeight: 900,
          color: INK,
          textAlign: "center",
          lineHeight: 1.05,
          letterSpacing: -3,
          transform: `translateY(${(1 - titleSpring) * 30}px)`,
          opacity: titleSpring,
        }}
      >
        Ini Mino.
      </div>

      <div
        style={{
          marginTop: 12,
          fontFamily: SERIF,
          fontSize: 42,
          fontStyle: "italic",
          color: BLUE,
          textAlign: "center",
        }}
      >
        <VoxHighlighter delay={8} color={YELLOW}>
          <span style={{ padding: "0 12px" }}>Tetap Penasaran!</span>
        </VoxHighlighter>
      </div>

      <div
        style={{
          marginTop: 32,
          background: INK,
          color: PAPER,
          padding: "12px 28px",
          borderRadius: 30,
          fontFamily: MONO,
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        FOLLOW UNTUK INVESTIGASI BERIKUTNYA
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Master 9:16 Mino Shorts Composition                                        */
/* -------------------------------------------------------------------------- */
export const MinoShortsComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  // Determine current Mino pose dynamically based on voiceover beat
  let currentPose: MinoPose = "idle";
  if (seconds < 4.5) {
    currentPose = "curious";
  } else if (seconds < 9.5) {
    currentPose = "confused";
  } else if (seconds < 19.0) {
    currentPose = "pointing";
  } else if (seconds < 31.0) {
    currentPose = "searching";
  } else if (seconds < 41.0) {
    currentPose = "shocked";
  } else if (seconds < 49.0) {
    currentPose = "curious";
  } else if (seconds < 54.0) {
    currentPose = "idle";
  } else {
    currentPose = "waving";
  }

  // Visual Scene timings (in frames @ 30fps)
  const F_S1 = 0;
  const D_S1 = 285; // 0s - 9.5s
  const F_S2 = 285;
  const D_S2 = 285; // 9.5s - 19.0s
  const F_S3 = 570;
  const D_S3 = 360; // 19.0s - 31.0s
  const F_S4 = 930;
  const D_S4 = 300; // 31.0s - 41.0s
  const F_S5 = 1230;
  const D_S5 = 240; // 41.0s - 49.0s
  const F_S6 = 1470;
  const D_S6 = 150; // 49.0s - 54.0s
  const F_S7 = 1620;
  const D_S7 = 90; // 54.0s - 57.0s (1710 total)

  return (
    <AbsoluteFill
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: PAPER,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* 1. Global Audio */}
      <Audio src={staticFile("voiceover.mp3")} />

      {/* 2. Archival Paper Texture & Grid */}
      <VoxPaperBackground hideCornerLabels />

      {/* 3. Top Editorial Header & Progress Bar */}
      <EditorialHeader />

      {/* 4. Modular Autonomous Scenes via Remotion <Series> */}
      {generatedMinoScenes && generatedMinoScenes.length > 0 ? (
        <Series>
          {generatedMinoScenes.map((scene) => {
            const Comp = scene.Component;
            return (
              <Series.Sequence
                key={`${scene.id}-${scene.name}`}
                durationInFrames={scene.durationFrames}
                name={scene.name}
              >
                <Comp />
              </Series.Sequence>
            );
          })}
        </Series>
      ) : (
        <>
          <Sequence from={F_S1} durationInFrames={D_S1} name="Scene 1: Hook & Polaroid">
            <Scene1Hook />
          </Sequence>
          <Sequence from={F_S2} durationInFrames={D_S2} name="Scene 2: Déjà Vu & Brain">
            <Scene2Brain />
          </Sequence>
          <Sequence from={F_S3} durationInFrames={D_S3} name="Scene 3: Small Match & Clues">
            <Scene3Match />
          </Sequence>
          <Sequence from={F_S4} durationInFrames={D_S4} name="Scene 4: 3 Triggers">
            <Scene4Triggers />
          </Sequence>
          <Sequence from={F_S5} durationInFrames={D_S5} name="Scene 5: 67% Stat Card">
            <Scene5Stat />
          </Sequence>
          <Sequence from={F_S6} durationInFrames={D_S6} name="Scene 6: Verdict">
            <Scene6Verdict />
          </Sequence>
          <Sequence from={F_S7} durationInFrames={D_S7} name="Scene 7: Mino Outro">
            <Scene7Outro />
          </Sequence>

          {/* Fallback Mino Stage */}
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
            <MinoCharacter pose={currentPose} scale={1.35} words={captions} />
          </div>
        </>
      )}

      {/* 5. Word-highlighted Captions at Safe Bottom Area */}
      <VoxCaptions words={captions} bottom={130} fontSize={36} />
    </AbsoluteFill>
  );
};
