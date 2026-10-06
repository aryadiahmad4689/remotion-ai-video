import React from "react";
import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

const PAPER = "#F5F2EB";
const INK = "#18181B";
const YELLOW = "#FFE600";
const RED = "#E63946";
const BLUE = "#2563EB";
const TEAL = "#0D9488";
const MUTED = "#77756F";
const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';
const CLAMP = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const LAST_FRAME = 1548;

const ramp = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, Math.max(start + 0.001, end)], [0, 1], CLAMP);

const settle = (frame: number, cue: number, fps: number, damping = 18) =>
  frame < cue
    ? 0
    : spring({
        frame: Math.max(0, frame - cue),
        fps,
        config: {damping, mass: 0.7, stiffness: 95},
      });

/**
 * Scene-local sequencing gate. Children deliberately retain the scene's
 * absolute clock, so every graphic uses the narration's original cue frames.
 */
const Sequence: React.FC<{
  from: number;
  durationInFrames: number;
  children: React.ReactNode;
}> = ({from, durationInFrames, children}) => {
  const frame = useCurrentFrame();
  return frame >= from && frame < from + durationInFrames ? <>{children}</> : null;
};

type Clock = {frame: number; fps: number};

const beats = [
  {start: 0, end: 124, text: "Bagaimana kalau ternyata otak kita nggak selalu mengatakan yang sebenarnya?"},
  {start: 139, end: 194, text: "Bukan karena otak kita sengaja berbohong,"},
  {start: 211, end: 322, text: "tapi karena hampir setiap detik otak kita sedang menebak apa yang sedang terjadi."},
  {start: 338, end: 435, text: "Dan yang lebih aneh lagi, kita biasanya percaya begitu saja."},
  {start: 455, end: 532, text: "Coba ingat, sesuatu yang pernah kamu alami."},
  {start: 537, end: 622, text: "Pernah masuk ke sebuah tempat, lalu tiba-tiba merasa,"},
  {start: 641, end: 674, text: "gue kayaknya pernah di sini."},
  {start: 689, end: 772, text: "Padahal kamu yakin, belum pernah datang ke tempat itu."},
  {start: 772, end: 892, text: "Atau, pernah membaca satu paragraf, sampai selesai."},
  {start: 910, end: 962, text: "Lalu beberapa detik kemudian berpikir,"},
  {start: 979, end: 1013, text: "tadi gue sebenarnya baca apa?"},
  {start: 1032, end: 1133, text: "Atau, sedang mencari HP, karena merasa HPmu hilang."},
  {start: 1147, end: 1241, text: "Padahal, ternyata HPnya sedang ada di tangan."},
  {start: 1244, end: 1348, text: "Dan mungkin yang paling sering, kita melihat seseorang dari jauh."},
  {start: 1358, end: 1395, text: "Kita yakin itu teman kita."},
  {start: 1413, end: 1485, text: "Kita panggil namanya, orangnya menoleh."},
  {start: 1496, end: 1514, text: "Ternyata bukan."},
  {start: 1532, end: 1548, text: "Malu? Tentu."},
];

const KineticWords: React.FC<Clock & {
  text: string;
  cue: number;
  spread?: number;
  fontSize?: number;
  color?: string;
  weight?: number;
  gap?: number;
}> = ({
  text, cue, frame, fps, spread = 24, fontSize = 74,
  color = INK, weight = 800, gap = 16,
}) => {
  const words = text.split(" ");
  return (
    <span style={{display: "flex", flexWrap: "wrap", gap: `8px ${gap}px`, alignItems: "baseline"}}>
      {words.map((word, index) => {
        const delay = cue + (words.length > 1 ? (index / (words.length - 1)) * spread : 0);
        const p = settle(frame, delay, fps);
        return (
          <span key={`${cue}-${index}`} style={{display: "inline-block", overflow: "hidden", paddingBottom: 5}}>
            <span style={{
              display: "inline-block", fontSize, fontWeight: weight, color,
              lineHeight: 1.08, letterSpacing: fontSize > 45 ? "-3px" : "-0.3px",
              opacity: ramp(frame, delay, delay + 9),
              transform: `translateY(${(1 - p) * 42}px)`,
            }}>{word}</span>
          </span>
        );
      })}
    </span>
  );
};

const CueCard: React.FC<Clock & {
  cue: number;
  label: string;
  children: React.ReactNode;
  accent?: string;
}> = ({frame, fps, cue, label, children, accent = YELLOW}) => {
  const p = settle(frame, cue, fps);
  if (frame < cue) return null;
  return (
    <div style={{
      border: `1px solid ${INK}22`, borderLeft: `5px solid ${accent}`,
      background: "#FFFEFA", padding: "23px 27px", width: 595,
      boxShadow: "0 9px 22px #18181B08",
      opacity: ramp(frame, cue, cue + 12),
      transform: `translateY(${(1 - p) * 24}px) rotate(${(1 - p) * -1.5}deg)`,
    }}>
      <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: 2, color: MUTED, marginBottom: 12}}>{label}</div>
      <div style={{fontSize: 26, lineHeight: 1.42, fontWeight: 600}}>{children}</div>
    </div>
  );
};

const Marker: React.FC<{d: string; progress: number; color?: string; width?: number}> = ({
  d, progress, color = RED, width = 5,
}) => (
  <path d={d} fill="none" stroke={color} strokeWidth={width}
    strokeLinecap="round" strokeLinejoin="round" pathLength={1}
    strokeDasharray={1} strokeDashoffset={1 - Math.min(1, Math.max(0, progress))}/>
);

const Background: React.FC<Clock> = ({frame, fps}) => (
  <div style={{position: "absolute", inset: 0, background: PAPER, overflow: "hidden"}}>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: "absolute", inset: 0}}>
      <defs>
        <pattern id="s01-paper-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" stroke={INK} strokeWidth="0.65" fill="none" opacity="0.07"/>
        </pattern>
        <radialGradient id="s01-glow">
          <stop stopColor={YELLOW} stopOpacity="0.17"/>
          <stop offset="1" stopColor={YELLOW} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#s01-paper-grid)"/>
      <ellipse cx={1350 + Math.sin(frame / (fps * 6)) * 100} cy="410" rx="570" ry="430" fill="url(#s01-glow)"/>
      <path d="M62 173H1858 M62 863H1858" stroke={INK} strokeOpacity="0.18"/>
      <path d="M62 57V85 M48 71H76 M1858 57V85 M1844 71H1872 M62 1010V1038 M48 1024H76 M1858 1010V1038 M1844 1024H1872"
        stroke={INK} strokeOpacity="0.28" strokeWidth="1"/>
    </svg>
  </div>
);

const NeuralDiagram: React.FC<Clock> = ({frame, fps}) => {
  const enter = settle(frame, 0, fps);
  const hypothesis = ramp(frame, 211, 263);
  const accept = ramp(frame, 338, 372);
  const lobes = [
    {d: "M367 110C289 62 219 123 208 189C139 213 119 277 151 333C126 380 164 440 225 449C267 503 339 489 376 446L393 313Z", fill: BLUE},
    {d: "M367 110C402 73 475 77 503 122C576 107 623 158 618 212C677 240 674 308 640 336C661 402 608 449 558 440C517 486 445 483 408 447L393 313Z", fill: TEAL},
  ];
  const nodes = [
    [216, 224], [269, 164], [334, 205], [289, 291], [210, 354],
    [306, 405], [366, 344], [428, 182], [516, 163], [575, 244],
    [483, 283], [575, 357], [479, 406], [421, 346],
  ];
  const edges = [[0,1],[1,2],[0,3],[2,3],[3,4],[4,5],[3,6],[5,6],[2,7],[7,8],[8,9],[7,10],[9,10],[10,11],[11,12],[10,13],[12,13],[6,13]];
  return (
    <svg viewBox="0 0 900 600" width="100%" height="100%">
      <defs>
        <clipPath id="s01-brain-clip"><path d="M367 110C289 62 219 123 208 189C139 213 119 277 151 333C126 380 164 440 225 449C267 503 339 489 376 446L408 447C445 483 517 486 558 440C608 449 661 402 640 336C674 308 677 240 618 212C623 158 576 107 503 122C475 77 402 73 367 110Z"/></clipPath>
      </defs>
      <g opacity={ramp(frame, 0, 35)} transform={`translate(0 ${(1 - enter) * 35})`}>
        <circle cx="395" cy="289" r="228" fill="none" stroke={INK} strokeOpacity="0.08"/>
        <circle cx="395" cy="289" r="254" fill="none" stroke={INK} strokeOpacity="0.1" strokeDasharray="2 12"/>
        <g transform={`rotate(${frame * 0.32} 395 289)`}>
          <path d="M395 35A254 254 0 0 1 649 289" fill="none" stroke={BLUE} strokeWidth="2" opacity="0.45"/>
          <path d="M395 543A254 254 0 0 1 141 289" fill="none" stroke={TEAL} strokeWidth="2" opacity="0.45"/>
        </g>
        {lobes.map((lobe, i) => (
          <path key={i} d={lobe.d} fill={lobe.fill} fillOpacity="0.085"
            stroke={INK} strokeWidth="3" strokeLinejoin="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(frame, 5 + i * 10, 83 + i * 10)}/>
        ))}
        <path d="M383 116C349 172 405 203 378 245S412 323 388 366S400 418 396 450
          M213 194C246 188 249 225 277 229 M169 300C207 272 231 300 255 275
          M201 384C242 361 254 399 279 424 M522 127C489 179 535 190 566 181
          M614 230C564 210 574 290 615 282 M539 367C500 344 496 388 517 429"
          fill="none" stroke={INK} strokeOpacity={0.22 * ramp(frame, 18, 100)} strokeWidth="3"/>
        <g clipPath="url(#s01-brain-clip)">
          {edges.map(([a,b], i) => {
            const progress = ramp(frame, 28 + i * 3, 63 + i * 3);
            const pulse = (Math.sin(frame * 0.075 - i * 0.8) + 1) / 2;
            return <path key={i} d={`M${nodes[a][0]} ${nodes[a][1]}L${nodes[b][0]} ${nodes[b][1]}`}
              fill="none" stroke={i % 3 === 0 ? TEAL : BLUE} strokeWidth={1.6 + pulse}
              strokeOpacity={0.2 + pulse * 0.35} pathLength={1}
              strokeDasharray={1} strokeDashoffset={1 - progress}/>;
          })}
          {nodes.map(([x,y], i) => (
            <g key={i} opacity={ramp(frame, 30 + i * 4, 48 + i * 4)}>
              <circle cx={x} cy={y} r={8 + Math.sin(frame * 0.09 - i) * 3} fill={YELLOW} opacity="0.32"/>
              <circle cx={x} cy={y} r="4.5" fill={i % 2 ? TEAL : BLUE}/>
            </g>
          ))}
        </g>
        <text x="39" y="80" fontFamily={MONO} fontSize="13" fill={MUTED}>MODEL PERSEPSI / 01</text>
        <path d="M90 132H154L211 181" fill="none" stroke={INK} strokeOpacity="0.3"/>
        <text x="40" y="123" fontFamily={MONO} fontSize="12" fill={INK}>OTAK</text>
        <g opacity={ramp(frame, 139, 158)}>
          <rect x="651" y="123" width="204" height="75" rx="3" fill={PAPER} stroke={INK} strokeOpacity="0.18"/>
          <text x="670" y="153" fontFamily={MONO} fontSize="13" fill={MUTED}>BUKAN</text>
          <text x="670" y="178" fontFamily={FONT} fontSize="21" fontWeight="700" fill={INK}>kebohongan</text>
          <Marker d="M665 164L837 183" progress={ramp(frame, 155, 185)} width={3}/>
        </g>
        {frame >= 211 && (
          <g opacity={hypothesis} transform={`translate(${(1 - settle(frame, 211, fps)) * 30} 0)`}>
            <path d="M623 313H690V273H722" stroke={BLUE} strokeWidth="2" fill="none"/>
            <rect x="684" y="237" width="177" height="76" fill={YELLOW}/>
            <text x="702" y="263" fontFamily={MONO} fontSize="12" fill={INK}>PROSES AKTIF</text>
            <text x="702" y="292" fontFamily={FONT} fontWeight="800" fontSize="26" fill={INK}>MENEBAK</text>
            <path d="M720 313V370" stroke={INK} strokeWidth="2" strokeDasharray="4 5"/>
            <rect x="684" y="370" width="177" height="57" fill={PAPER} stroke={INK} strokeOpacity="0.3"/>
            <text x="702" y="405" fontFamily={FONT} fontWeight="700" fontSize="21" fill={INK}>apa yang terjadi</text>
          </g>
        )}
        {frame >= 338 && (
          <g opacity={accept} transform={`rotate(-8 712 466) translate(0 ${(1 - settle(frame,338,fps)) * 20})`}>
            <rect x="612" y="442" width="244" height="65" fill={TEAL}/>
            <text x="634" y="484" fontFamily={FONT} fontSize="29" fontWeight="900" fill="white">DIPERCAYA.</text>
          </g>
        )}
      </g>
    </svg>
  );
};

const RoomDiagram: React.FC<Clock> = ({frame, fps}) => {
  const build = ramp(frame, 537, 594);
  const familiar = settle(frame, 641, fps);
  return (
    <svg viewBox="0 0 900 600" width="100%" height="100%">
      <defs>
        <pattern id="s01-floor" width="72" height="48" patternUnits="userSpaceOnUse">
          <path d="M0 0H72V48" fill="none" stroke={INK} strokeOpacity="0.12"/>
        </pattern>
      </defs>
      <g opacity={ramp(frame,455,480)}>
        <text x="38" y="55" fontFamily={MONO} fontSize="13" fill={MUTED}>
          {frame < 537 ? "ARSIP PENGALAMAN" : "REKONSTRUKSI / SEBUAH TEMPAT"}
        </text>
        {frame < 537 && (
          <g transform={`translate(0 ${Math.sin(frame / 35) * 3})`}>
            {[0,1,2].map((i) => (
              <g key={i} transform={`translate(${160 + i * 140} ${150 + i * 26}) rotate(${(i - 1) * 8})`}
                opacity={ramp(frame, 455 + i * 14, 478 + i * 14)}>
                <rect width="250" height="290" fill="#FFFEFA" stroke={INK} strokeOpacity="0.3"/>
                <rect x="18" y="18" width="214" height="188" fill={i === 1 ? "#DDE5DE" : "#E5E1D8"}/>
                <path d="M18 206L83 91L156 206 M98 206L171 121L232 206" fill="none" stroke={INK} strokeOpacity="0.2" strokeWidth="2"/>
                <circle cx="187" cy="64" r="17" fill={YELLOW} opacity="0.7"/>
                <path d="M23 231H140 M23 248H202" stroke={INK} strokeOpacity="0.22" strokeWidth="3"/>
              </g>
            ))}
          </g>
        )}
      </g>
      {frame >= 537 && (
        <g opacity={ramp(frame,537,553)} transform={`translate(0 ${(1 - settle(frame,537,fps)) * 25})`}>
          <path d="M138 122L325 194H656L787 122Z" fill="#E8E4DC"/>
          <path d="M138 122L325 194V394L138 510Z" fill="#DFE5DF"/>
          <path d="M325 194H656V394H325Z" fill="#FCFAF4"/>
          <path d="M656 194L787 122V510L656 394Z" fill="#EAE6DC"/>
          <path d="M138 510L325 394H656L787 510Z" fill="url(#s01-floor)"/>
          <path d="M138 122L325 194H656L787 122V510L656 394H325L138 510ZM325 194V394M656 194V394"
            fill="none" stroke={INK} strokeWidth="2.5" pathLength={1}
            strokeDasharray={1} strokeDashoffset={1-build}/>
          <path d="M421 394V239H506V394" fill="#C6D5CA" stroke={INK} strokeWidth="2" opacity={ramp(frame,549,579)}/>
          <circle cx="486" cy="322" r="4" fill={INK}/>
          <path d="M571 264H629V316H571Z M600 264V316 M571 290H629" fill="#D8E6EE" stroke={INK} strokeWidth="2" opacity={ramp(frame,558,588)}/>
          <path d="M219 421V336L273 357V389 M206 421H239" fill="none" stroke={TEAL} strokeWidth="4" opacity={ramp(frame,568,598)}/>
          <ellipse cx="459" cy="468" rx="46" ry="12" fill={INK} opacity="0.08"/>
          <g opacity={ramp(frame,576,612)}>
            <circle cx="459" cy="414" r="14" fill={INK}/>
            <path d="M459 429V461M459 443L439 453M459 443L479 453M459 461L443 487M459 461L475 487"
              stroke={INK} strokeWidth="8" strokeLinecap="round"/>
          </g>
          {frame >= 641 && (
            <g opacity={ramp(frame,641,649)} transform={`translate(0 ${(1-familiar)*20})`}>
              <rect x="219" y="76" width="454" height="63" fill={YELLOW}/>
              <text x="245" y="118" fontFamily={FONT} fontSize="28" fontWeight="800" fill={INK}>“Kayaknya pernah di sini.”</text>
              <path d="M447 139L466 170L478 139" fill={YELLOW}/>
              <Marker d="M370 225C341 206 304 219 300 297C297 389 362 420 527 418C650 416 686 373 675 294C667 225 575 210 411 219"
                progress={ramp(frame,646,673)} color={TEAL} width={3}/>
            </g>
          )}
          {frame >= 689 && (
            <g opacity={ramp(frame,689,700)} transform={`translate(0 ${(1-settle(frame,689,fps))*22})`}>
              <rect x="274" y="484" width="399" height="75" fill="#FFFEFA" stroke={INK} strokeOpacity="0.25"/>
              <rect x="274" y="484" width="7" height="75" fill={RED}/>
              <text x="299" y="510" fontFamily={MONO} fontSize="12" fill={MUTED}>RIWAYAT KUNJUNGAN</text>
              <text x="299" y="540" fontFamily={FONT} fontWeight="800" fontSize="26" fill={INK}>Belum pernah datang.</text>
              <Marker d="M285 477C246 462 246 568 319 570H650C706 570 712 478 664 477H335"
                progress={ramp(frame,713,759)} width={4}/>
            </g>
          )}
        </g>
      )}
    </svg>
  );
};

const ReadingDiagram: React.FC<Clock> = ({frame, fps}) => {
  const lines = [
    "Pagi itu, cahaya masuk melalui jendela.",
    "Di luar, orang-orang berjalan menuju",
    "tempat yang berbeda. Suara kendaraan",
    "bercampur dengan percakapan singkat.",
    "Seseorang membuka buku di meja,",
    "membaca satu paragraf, lalu berhenti.",
  ];
  const read = ramp(frame, 784, 887) * lines.length;
  const forgotten = ramp(frame,910,960);
  return (
    <svg viewBox="0 0 900 600" width="100%" height="100%">
      <defs>
        <clipPath id="s01-reading-scan">
          <rect x="149" y="166" width="613" height="285"/>
        </clipPath>
      </defs>
      <g opacity={ramp(frame,772,787)} transform={`translate(0 ${(1-settle(frame,772,fps))*35}) rotate(-2 450 300)`}>
        <rect x="118" y="59" width="662" height="488" fill={INK} opacity="0.055"/>
        <rect x="107" y="48" width="662" height="488" fill="#FFFEFA" stroke={INK} strokeOpacity="0.22"/>
        <rect x="107" y="48" width="7" height="488" fill={BLUE}/>
        <text x="150" y="89" fontFamily={MONO} fontSize="12" fill={MUTED}>CATATAN PEMBACA / 02</text>
        <text x="149" y="131" fontFamily={FONT} fontSize="29" fontWeight="800" fill={INK}>Satu paragraf.</text>
        <path d="M149 147H720" stroke={INK} strokeOpacity="0.2"/>
        {lines.map((line,i) => {
          const amount = Math.max(0, Math.min(1, read-i));
          return (
            <g key={line} opacity={ramp(frame,780+i*3,795+i*3)}>
              <rect x="145" y={175+i*43} width={amount * (i === 5 ? 501 : 574)} height="29" fill={YELLOW} opacity={0.65 * (1-forgotten*0.7)}/>
              <text x="150" y={198+i*43} fontFamily="Georgia, serif" fontSize="24" fill={INK}
                opacity={1-forgotten*0.78}>{line}</text>
              {frame >= 910 && (
                <path d={`M150 ${193+i*43}H${150+((i*53)%160)+360}`}
                  stroke={INK} strokeWidth="9" strokeOpacity={forgotten*0.1}/>
              )}
            </g>
          );
        })}
        <text x="149" y="491" fontFamily={MONO} fontSize="12" fill={MUTED}>HALAMAN 001</text>
        {frame >= 910 && (
          <g opacity={ramp(frame,910,930)}>
            <circle cx="675" cy="482" r="23" fill={PAPER} stroke={INK} strokeOpacity="0.35"/>
            <path d={`M675 482L${675+Math.sin((frame-910)*0.05)*16} ${482-Math.cos((frame-910)*0.05)*16}`}
              stroke={BLUE} strokeWidth="2"/>
            <path d="M675 482L665 478" stroke={INK} strokeWidth="2"/>
          </g>
        )}
      </g>
      {frame >= 979 && (
        <g opacity={ramp(frame,979,988)} transform={`translate(0 ${(1-settle(frame,979,fps))*25}) rotate(4 455 300)`}>
          <rect x="201" y="233" width="494" height="140" fill={YELLOW}/>
          <text x="232" y="281" fontFamily={MONO} fontSize="13" fill={INK}>ISI YANG DIINGAT</text>
          <text x="232" y="339" fontFamily={FONT} fontSize="44" fontWeight="900" fill={INK}>Tadi baca apa?</text>
          <Marker d="M224 219C169 210 167 385 232 389H660C732 383 736 218 670 217H265"
            progress={ramp(frame,983,1012)} width={4}/>
        </g>
      )}
    </svg>
  );
};

const PhoneDiagram: React.FC<Clock> = ({frame, fps}) => {
  const reveal = settle(frame,1147,fps);
  const searching = frame < 1147;
  const targets = [[247,209],[624,180],[688,398],[234,437]];
  return (
    <svg viewBox="0 0 900 600" width="100%" height="100%">
      <g opacity={ramp(frame,1032,1052)}>
        <text x="37" y="54" fontFamily={MONO} fontSize="13" fill={MUTED}>
          {searching ? "PENCARIAN AKTIF / 03" : "LOKASI TERKONFIRMASI"}
        </text>
        <g opacity={searching ? 1 : 0.18}>
          {[100,180,255].map((r,i) => <circle key={r} cx="451" cy="305" r={r} fill="none" stroke={TEAL} strokeOpacity={0.13+i*0.04}/>)}
          <path d="M170 305H730M451 41V569" stroke={TEAL} strokeOpacity="0.15" strokeDasharray="4 9"/>
          <g transform={`rotate(${(frame-1032)*0.95} 451 305)`}>
            <path d="M451 305L451 50A255 255 0 0 1 631 125Z" fill={TEAL} opacity="0.085"/>
            <path d="M451 305V50" stroke={TEAL} strokeWidth="2" opacity="0.65"/>
          </g>
          {targets.map(([x,y],i) => (
            <g key={i} opacity={ramp(frame,1044+i*15,1060+i*15)}>
              <rect x={x-35} y={y-30} width="70" height="60" fill={PAPER} stroke={INK} strokeOpacity="0.3"/>
              <path d={`M${x-19} ${y-10}H${x+19}V${y+13}H${x-19}Z`} fill="none" stroke={INK} strokeOpacity="0.45"/>
              <text x={x} y={y+49} textAnchor="middle" fontFamily={MONO} fontSize="11" fill={MUTED}>
                {["MEJA","TAS","SOFA","SUDUT"][i]}
              </text>
              <path d={`M${x-7} ${y-7}L${x+7} ${y+7}M${x+7} ${y-7}L${x-7} ${y+7}`}
                stroke={RED} strokeWidth="2" opacity={ramp(frame,1080+i*9,1093+i*9)}/>
            </g>
          ))}
        </g>
        {searching && (
          <g opacity={ramp(frame,1040,1060)}>
            <circle cx="451" cy="305" r="49" fill={PAPER} stroke={TEAL} strokeWidth="2"/>
            <text x="451" y="321" fontFamily={FONT} fontSize="49" fontWeight="800" textAnchor="middle" fill={TEAL}>?</text>
            <rect x="325" y="508" width="252" height="47" fill={INK}/>
            <text x="451" y="539" textAnchor="middle" fontFamily={MONO} fontSize="15" fill="white">HP-NYA DI MANA?</text>
          </g>
        )}
        {frame >= 1147 && (
          <g opacity={ramp(frame,1147,1160)} transform={`translate(0 ${(1-reveal)*70})`}>
            <path d="M333 579L318 446C281 415 270 380 291 355C306 338 326 350 346 370L364 383L346 270C342 243 370 226 390 244L405 268L411 199C414 168 445 165 455 191L465 258L480 200C488 174 516 181 522 205L529 267L545 227C557 202 583 215 582 240L575 350C606 320 630 329 631 350C635 389 602 431 582 455L561 579Z"
              fill="#EACBB1" stroke={INK} strokeWidth="3" strokeLinejoin="round"/>
            <g transform="rotate(-8 465 309)">
              <rect x="379" y="134" width="176" height="318" rx="23" fill={INK}/>
              <rect x="389" y="146" width="156" height="293" rx="16" fill="#D7E9E2"/>
              <rect x="435" y="152" width="63" height="12" rx="6" fill={INK}/>
              <text x="466" y="249" textAnchor="middle" fontFamily={FONT} fontSize="44" fontWeight="700" fill={INK}>09:41</text>
              <text x="466" y="281" textAnchor="middle" fontFamily={MONO} fontSize="11" fill={TEAL}>TERNYATA DI SINI</text>
              <circle cx="465" cy="345" r="25" fill={TEAL}/>
              <path d="M452 345L461 354L478 335" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
              <path d="M439 425H493" stroke={INK} strokeWidth="4" strokeLinecap="round"/>
            </g>
            <path d="M575 350C553 331 537 343 535 366L524 407" fill="#EACBB1" stroke={INK} strokeWidth="3"/>
            <path d="M340 389L360 410 M368 458C411 479 440 479 471 465" fill="none" stroke={INK} strokeOpacity="0.24" strokeWidth="2"/>
            <Marker d="M365 128C321 131 334 455 377 468C438 496 574 477 579 432C602 333 590 139 551 117C511 95 427 100 388 111"
              progress={ramp(frame,1167,1215)} width={4}/>
            <path d="M588 256H678V222" stroke={INK} strokeWidth="1.5" fill="none"/>
            <rect x="623" y="169" width="219" height="53" fill={YELLOW}/>
            <text x="641" y="203" fontFamily={FONT} fontWeight="800" fontSize="24" fill={INK}>Ada di tangan.</text>
          </g>
        )}
      </g>
    </svg>
  );
};

const PersonDiagram: React.FC<Clock> = ({frame, fps}) => {
  const approach = ramp(frame,1244,1348);
  const turn = ramp(frame,1413,1475);
  const stranger = frame >= 1496;
  const embarrassed = frame >= 1532;
  const scale = 0.67 + approach*0.14 + turn*0.35;
  return (
    <svg viewBox="0 0 900 600" width="100%" height="100%">
      <g opacity={ramp(frame,1244,1260)}>
        <text x="37" y="54" fontFamily={MONO} fontSize="13" fill={MUTED}>IDENTIFIKASI VISUAL / 04</text>
        <path d="M70 486L447 250L834 486M70 486H834M164 426H737M275 356H632" stroke={INK} strokeOpacity="0.12" fill="none"/>
        <path d="M124 487V176H230V415 M673 416V131H784V487 M253 403V223H308V367"
          fill="none" stroke={INK} strokeWidth="2" strokeOpacity="0.13"/>
        <circle cx="465" cy="292" r="173" stroke={BLUE} strokeOpacity="0.15" fill="none" strokeDasharray="3 9"/>
        <g transform={`rotate(${frame*0.22} 465 292)`}>
          <path d="M292 292A173 173 0 0 1 465 119" fill="none" stroke={stranger ? RED : BLUE} strokeWidth="2"/>
        </g>
        <ellipse cx="465" cy="476" rx={57*scale} ry="12" fill={INK} opacity="0.1"/>
        <g transform={`translate(465 467) scale(${scale}) translate(-465 -467)`}>
          <path d="M412 338C408 311 431 293 464 293C500 293 522 312 519 340L535 403L512 409L501 355V427H429V355L417 409L394 403Z"
            fill={stranger ? "#E7B384" : "#4A6563"} stroke={INK} strokeWidth="2"/>
          <path d="M433 426L430 469H454L465 433L478 469H502L497 426" fill={INK}/>
          <path d="M430 467H451 M480 467H502" stroke={INK} strokeWidth="10" strokeLinecap="round"/>
          <rect x="452" y="282" width="24" height="23" rx="6" fill="#DABDA6"/>
          <ellipse cx="465" cy="251" rx={34 + turn*3} ry="43" fill={frame < 1413 ? INK : "#EACBB1"}/>
          <path d="M431 250C424 197 494 194 501 241L486 224L449 229L434 256Z" fill={INK}/>
          {frame >= 1413 && (
            <g opacity={turn}>
              <circle cx={454-turn*5} cy="252" r="3" fill={INK}/>
              <circle cx={477-turn*2} cy="252" r="3" fill={INK}/>
              <path d="M464 255L462 268H469" stroke={INK} strokeOpacity="0.5" strokeWidth="2" fill="none"/>
              <path d={stranger ? "M453 283Q465 276 477 283" : "M455 280H475"} fill="none" stroke={INK} strokeWidth="2"/>
            </g>
          )}
        </g>
        <g opacity={ramp(frame,1260,1290)}>
          <path d="M345 167H319V198M589 167H615V198M319 374V405H350M615 374V405H584"
            fill="none" stroke={stranger ? RED : BLUE} strokeWidth="3"/>
        </g>
        {frame >= 1358 && (
          <g opacity={ramp(frame,1358,1370)} transform={`translate(0 ${(1-settle(frame,1358,fps))*20})`}>
            <rect x="302" y="89" width="325" height="52" fill={stranger ? RED : YELLOW}/>
            <text x="464" y="123" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="25" fill={stranger ? "white" : INK}>
              {stranger ? "TERNYATA BUKAN." : "Itu teman kita."}
            </text>
          </g>
        )}
        {frame >= 1413 && frame < 1496 && (
          <g opacity={ramp(frame,1413,1426)} transform={`translate(${(1-settle(frame,1413,fps))*-25} 0)`}>
            <path d="M101 241H304V299H258L280 325L232 299H101Z" fill={YELLOW}/>
            <text x="202" y="280" fontFamily={FONT} fontSize="29" fontWeight="800" textAnchor="middle" fill={INK}>“Hei!”</text>
            {[0,1,2].map((i) => <path key={i} d={`M${320+i*14} ${245-i*7}Q${341+i*14} 270 ${320+i*14} ${296+i*7}`}
              fill="none" stroke={INK} strokeWidth="2" opacity={ramp(frame,1421+i*8,1433+i*8)*0.55}/>)}
          </g>
        )}
        {stranger && (
          <g opacity={ramp(frame,1496,1503)}>
            <Marker d="M401 174C337 190 353 338 433 352C525 369 567 319 552 239C545 195 481 172 430 177"
              progress={ramp(frame,1496,1514)} width={4}/>
            <rect x="603" y="284" width="226" height="79" fill="#FFFEFA" stroke={RED} strokeWidth="2"/>
            <text x="622" y="311" fontFamily={MONO} fontSize="12" fill={MUTED}>HASIL VERIFIKASI</text>
            <text x="622" y="344" fontFamily={FONT} fontSize="26" fontWeight="800" fill={RED}>Orang lain.</text>
          </g>
        )}
        {embarrassed && (
          <g opacity={ramp(frame,1532,1538)} transform={`translate(0 ${(1-settle(frame,1532,fps))*12})`}>
            <rect x="224" y="497" width="477" height="59" fill={YELLOW}/>
            <text x="462" y="537" textAnchor="middle" fontFamily={FONT} fontWeight="900" fontSize="30" fill={INK}>Malu? Tentu.</text>
          </g>
        )}
      </g>
    </svg>
  );
};

const EditorialContent: React.FC<Clock> = ({frame, fps}) => {
  let cue = 0;
  let title = "Bisa percaya otak sendiri?";
  let accent = "PERTANYAAN PEMBUKA";
  let cardLabel = "CATATAN / 01";
  let cardText = "Bagaimana kalau yang kita rasakan tidak selalu sama dengan kenyataan?";
  let cardCue = 47;
  let cardAccent = YELLOW;

  if (frame >= 139) {
    cue = 139; title = "Bukan kebohongan."; accent = "TAPI ADA SESUATU YANG LAIN";
    cardCue = 139; cardLabel = "BUKAN SOAL NIAT";
    cardText = "Otak tidak sengaja berbohong.";
  }
  if (frame >= 211) {
    cue = 211; title = "Otak sedang menebak."; accent = "HAMPIR SETIAP DETIK";
    cardCue = 238; cardLabel = "CARA KERJA PERSEPSI";
    cardText = "Apa yang sedang terjadi?";
    cardAccent = BLUE;
  }
  if (frame >= 338) {
    cue = 338; title = "Dan kita percaya."; accent = "BEGITU SAJA";
    cardCue = 355; cardLabel = "DARI DUGAAN KE KEYAKINAN";
    cardText = "Terasa nyata. Maka kita menerimanya.";
    cardAccent = TEAL;
  }
  if (frame >= 455) {
    cue = 455; title = "Coba ingat."; accent = "PENGALAMAN SEHARI-HARI";
    cardCue = 477; cardLabel = "BUKA ARSIP INGATAN";
    cardText = "Sesuatu yang pernah kamu alami.";
    cardAccent = YELLOW;
  }
  if (frame >= 537) {
    cue = 537; title = "Masuk ke sebuah tempat."; accent = "01 / RASA FAMILIAR";
    cardCue = 557; cardLabel = "SITUASI";
    cardText = "Lalu, tiba-tiba muncul sebuah perasaan.";
  }
  if (frame >= 641) {
    cue = 641; title = "Pernah di sini."; accent = "01 / RASA FAMILIAR";
    cardCue = 641; cardLabel = "YANG TERASA";
    cardText = "“Gue kayaknya pernah di sini.”";
    cardAccent = TEAL;
  }
  if (frame >= 689) {
    cue = 689; title = "Tapi belum pernah."; accent = "PERASAAN ≠ RIWAYAT";
    cardCue = 705; cardLabel = "YANG SEBENARNYA";
    cardText = "Kamu yakin belum pernah datang.";
    cardAccent = RED;
  }
  if (frame >= 772) {
    cue = 772; title = "Membaca sampai selesai."; accent = "02 / SATU PARAGRAF";
    cardCue = 800; cardLabel = "AKTIVITAS";
    cardText = "Mata mengikuti kalimat demi kalimat.";
    cardAccent = YELLOW;
  }
  if (frame >= 910) {
    cue = 910; title = "Beberapa detik kemudian…"; accent = "02 / SATU PARAGRAF";
    cardCue = 928; cardLabel = "JEDA SINGKAT";
    cardText = "Lalu kamu mulai berpikir.";
  }
  if (frame >= 979) {
    cue = 979; title = "Tadi baca apa?"; accent = "SELESAI DIBACA. TAPI…";
    cardCue = 979; cardLabel = "PERTANYAAN";
    cardText = "“Tadi gue sebenarnya baca apa?”";
    cardAccent = RED;
  }
  if (frame >= 1032) {
    cue = 1032; title = "HP-nya hilang?"; accent = "03 / MENCARI HP";
    cardCue = 1058; cardLabel = "YANG KITA RASAKAN";
    cardText = "HP tidak ada. Jadi, kita mencarinya.";
    cardAccent = BLUE;
  }
  if (frame >= 1147) {
    cue = 1147; title = "Ada di tangan."; accent = "TERNYATA…";
    cardCue = 1162; cardLabel = "YANG SEBENARNYA";
    cardText = "Benda yang dicari sedang kita pegang.";
    cardAccent = RED;
  }
  if (frame >= 1244) {
    cue = 1244; title = "Dari kejauhan."; accent = "04 / MELIHAT SESEORANG";
    cardCue = 1271; cardLabel = "PENGAMATAN";
    cardText = "Kita melihat seseorang dari jauh.";
    cardAccent = BLUE;
  }
  if (frame >= 1358) {
    cue = 1358; title = "Yakin itu teman."; accent = "IDENTITAS: DIPERKIRAKAN";
    cardCue = 1358; cardLabel = "KESIMPULAN AWAL";
    cardText = "Rasanya, kita mengenali orang itu.";
    cardAccent = YELLOW;
  }
  if (frame >= 1413) {
    cue = 1413; title = "Kita panggil."; accent = "LALU IA MENOLEH";
    cardCue = 1436; cardLabel = "VERIFIKASI";
    cardText = "Orangnya menoleh.";
  }
  if (frame >= 1496) {
    cue = 1496; title = "Ternyata bukan."; accent = "KEYAKINAN ≠ KENYATAAN";
    cardCue = 1496; cardLabel = "KOREKSI";
    cardText = "Bukan teman kita.";
    cardAccent = RED;
  }
  if (frame >= 1532) {
    cue = 1532; title = "Malu? Tentu."; accent = "OTAK BISA SALAH TEBAK";
    cardCue = 1532; cardLabel = "PENGALAMAN MANUSIA";
    cardText = "Dan kita pernah mengalaminya.";
    cardAccent = YELLOW;
  }

  return (
    <div style={{position: "absolute", left: 105, top: 249, width: 650}}>
      <div key={`eyebrow-${cue}`} style={{
        fontFamily: MONO, fontSize: 17, letterSpacing: 2.2,
        color: frame >= 1496 ? RED : MUTED, marginBottom: 27,
        opacity: ramp(frame,cue,cue+12),
        transform: `translateX(${(1-settle(frame,cue,fps))*-15}px)`,
      }}>{accent}</div>
      <div style={{minHeight: 264}}>
        <KineticWords key={`title-${cue}`} text={title} cue={cue} frame={frame} fps={fps}
          spread={frame >= 1496 ? 6 : 25} fontSize={frame >= 910 && frame < 979 ? 68 : 78}/>
      </div>
      <div style={{width: 94*ramp(frame,cue+8,cue+30), height: 9, background: cardAccent, marginTop: 7, marginBottom: 39}}/>
      <CueCard key={`card-${cardCue}`} frame={frame} fps={fps} cue={cardCue} label={cardLabel} accent={cardAccent}>
        <KineticWords text={cardText} cue={cardCue} frame={frame} fps={fps}
          spread={frame >= 1496 ? 4 : 18} fontSize={26} weight={600} gap={7}/>
      </CueCard>
    </div>
  );
};

const Overlay: React.FC<Clock> = ({frame, fps}) => {
  const beatIndex = beats.reduce((last, beat, i) => frame >= beat.start ? i : last, 0);
  const active = beats[beatIndex];
  const words = active.text.split(" ");
  const section = frame < 455 ? 0 : frame < 772 ? 1 : frame < 1032 ? 2 : frame < 1244 ? 3 : 4;
  const sectionNames = ["OTAK & PERSEPSI", "SEBUAH TEMPAT", "SATU PARAGRAF", "MENCARI HP", "DARI KEJAUHAN"];
  const sections = [0,455,772,1032,1244,1549];

  return (
    <>
      <div style={{position: "absolute", top: 63, left: 105, right: 105, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <div style={{display: "flex", alignItems: "center", gap: 21, opacity: ramp(frame,0,24)}}>
          <div style={{background: YELLOW, color: INK, padding: "12px 18px", fontWeight: 900, fontSize: 27, letterSpacing: -1}}>01</div>
          <div>
            <div style={{fontFamily: MONO, fontSize: 13, color: MUTED, letterSpacing: 2, marginBottom: 6}}>INVESTIGASI / PIKIRAN MANUSIA</div>
            <div style={{fontWeight: 800, fontSize: 24, letterSpacing: -0.7}}>Ketika otak salah menebak</div>
          </div>
        </div>
        <div style={{display: "flex", alignItems: "center", gap: 13, opacity: ramp(frame,0,30)}}>
          <span style={{width: 8, height: 8, background: RED, borderRadius: "50%", opacity: 0.55+Math.sin(frame/fps*2)*0.25}}/>
          <span style={{fontFamily: MONO, fontSize: 15, letterSpacing: 1.6}}>{sectionNames[section]}</span>
        </div>
      </div>

      <div style={{position: "absolute", top: 203, right: 109, display: "flex", alignItems: "center", gap: 10, opacity: ramp(frame,0,25)}}>
        <span style={{fontFamily: MONO, fontSize: 12, color: MUTED, letterSpacing: 1.5}}>ILUSTRASI KONSEPTUAL</span>
        <div style={{width: 24, height: 1, background: MUTED}}/>
      </div>

      <div style={{position: "absolute", bottom: 49, left: 105, right: 105, display: "flex", gap: 7}}>
        {sections.slice(0,-1).map((start,i) => (
          <div key={start} style={{height: 4, flex: sections[i+1]-start, background: `${INK}13`, overflow: "hidden"}}>
            <div style={{
              height: "100%", background: i === section ? INK : TEAL,
              width: `${ramp(frame,start,sections[i+1]-1)*100}%`,
            }}/>
          </div>
        ))}
      </div>
      <div style={{position: "absolute", bottom: 21, left: 105, right: 105, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 10, letterSpacing: 1.2, color: MUTED}}>
        <span>01 / 11 — PEMBUKA</span>
        <span>PERASAAN · INGATAN · KEYAKINAN</span>
      </div>
    </>
  );
};

export const Scene_01: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const scale = Math.min(width/1920, height/1080);
  const clock = {frame, fps};

  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden",
      background: PAPER, color: INK, fontFamily: FONT,
    }}>
      <div style={{
        position: "absolute", width: 1920, height: 1080,
        left: (width-1920*scale)/2, top: (height-1080*scale)/2,
        transform: `scale(${scale})`, transformOrigin: "top left",
        overflow: "hidden",
      }}>
        <Sequence from={0} durationInFrames={LAST_FRAME+1}>
          <Background {...clock}/>
        </Sequence>

        <Sequence from={0} durationInFrames={LAST_FRAME+1}>
          <div style={{
            position: "absolute", left: 864, top: 232, width: 946, height: 598,
            border: `1px solid ${INK}15`, background: "#FFFEFA66",
            boxShadow: "0 20px 50px #18181B04",
            opacity: ramp(frame,0,26),
          }}/>
          <div style={{
            position: "absolute", left: 809, top: 274, width: 1, height: 511,
            background: `${INK}17`, opacity: ramp(frame,0,35),
          }}/>
        </Sequence>

        <Sequence from={0} durationInFrames={455}>
          <div style={{position: "absolute", left: 869, top: 232, width: 936, height: 598}}>
            <NeuralDiagram {...clock}/>
          </div>
        </Sequence>
        <Sequence from={455} durationInFrames={317}>
          <div style={{position: "absolute", left: 869, top: 232, width: 936, height: 598}}>
            <RoomDiagram {...clock}/>
          </div>
        </Sequence>
        <Sequence from={772} durationInFrames={260}>
          <div style={{position: "absolute", left: 869, top: 232, width: 936, height: 598}}>
            <ReadingDiagram {...clock}/>
          </div>
        </Sequence>
        <Sequence from={1032} durationInFrames={212}>
          <div style={{position: "absolute", left: 869, top: 232, width: 936, height: 598}}>
            <PhoneDiagram {...clock}/>
          </div>
        </Sequence>
        <Sequence from={1244} durationInFrames={305}>
          <div style={{position: "absolute", left: 869, top: 232, width: 936, height: 598}}>
            <PersonDiagram {...clock}/>
          </div>
        </Sequence>

        <Sequence from={0} durationInFrames={LAST_FRAME+1}>
          <EditorialContent {...clock}/>
        </Sequence>
        <Sequence from={0} durationInFrames={LAST_FRAME+1}>
          <Overlay {...clock}/>
        </Sequence>
      </div>
    </div>
  );
};