import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...values] = trimmed.split("=");
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = values.join("=").trim();
      }
    }
  }
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("❌ Error: OPENAI_API_KEY is not defined in .env");
  process.exit(1);
}

const publicDir = path.join(rootDir, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const cacheDir = path.join(rootDir, ".cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

const rawArgs = process.argv.slice(2);
const audioArg = rawArgs.find((a) => !a.startsWith("--"));
const forceRegenerate = rawArgs.includes("--force");
const enableSfx = rawArgs.includes("--sfx");
const shouldRender = rawArgs.includes("--render");
const isRepairOnly = rawArgs.includes("--repair") || rawArgs.includes("--fix");
const targetAudioFile = path.join(publicDir, "voiceover.mp3");

// Reasoning effort configuration (Default: medium)
let reasoningEffort = "medium";
if (rawArgs.includes("--high")) {
  reasoningEffort = "high";
} else if (rawArgs.includes("--low")) {
  reasoningEffort = "low";
} else if (rawArgs.includes("--medium")) {
  reasoningEffort = "medium";
}

// Sync SFX configuration file
const sfxConfigFile = path.join(rootDir, "src", "vox", "sfxConfig.ts");
try {
  fs.writeFileSync(
    sfxConfigFile,
    `/**
 * Global Sound Effects (SFX) Configuration
 * Generated automatically by pipeline
 */
export const SFX_ENABLED = ${enableSfx};\n`
  );
} catch (e) {
  console.warn("⚠️ Gagal memperbarui sfxConfig.ts:", e.message);
}

console.log("\n==================================================================");
console.log("🎬 FULL AUTONOMOUS MULTI-SCENE REACT GENERATOR (LONG-FORM 10+ MINS)");
console.log("   Whisper AI + GPT-6.1 Sol -> Autonomous TSX React Scenes");
console.log(`🧠  Reasoning Effort : ${reasoningEffort.toUpperCase()} (pilihan: --low, --medium [default], --high)`);
if (enableSfx) {
  console.log("🔊  Sound Effects (SFX): DIAKTIFKAN (--sfx)");
} else {
  console.log("🔇  Sound Effects (SFX): NONAKTIF (default). Gunakan flag --sfx jika ingin menambahkan SFX.");
}
console.log("==================================================================\n");

async function prepareAudio() {
  if (audioArg) {
    const resolvedPath = path.isAbsolute(audioArg)
      ? audioArg
      : path.join(rootDir, audioArg);

    if (fs.existsSync(resolvedPath)) {
      console.log(`📁 Using specified audio: ${resolvedPath}`);
      fs.copyFileSync(resolvedPath, targetAudioFile);
      return resolvedPath;
    }
  }

  // Check audio/suara-panjang.mp3 first
  const suaraPanjang = path.join(rootDir, "audio", "suara-panjang.mp3");
  if (fs.existsSync(suaraPanjang)) {
    console.log(`📁 Auto-selected long-form audio: audio/suara-panjang.mp3`);
    fs.copyFileSync(suaraPanjang, targetAudioFile);
    return suaraPanjang;
  }

  const audioDirPath = path.join(rootDir, "audio");
  if (fs.existsSync(audioDirPath)) {
    const files = fs
      .readdirSync(audioDirPath)
      .filter((f) => f.endsWith(".mp3") || f.endsWith(".wav") || f.endsWith(".m4a"))
      .sort((a, b) => {
        return (
          fs.statSync(path.join(audioDirPath, b)).mtimeMs -
          fs.statSync(path.join(audioDirPath, a)).mtimeMs
        );
      });

    if (files.length > 0) {
      const chosen = path.join(audioDirPath, files[0]);
      console.log(`📁 Auto-detected audio from folder audio/: ${files[0]}`);
      fs.copyFileSync(chosen, targetAudioFile);
      return chosen;
    }
  }

  if (fs.existsSync(targetAudioFile)) {
    console.log(`🔊 Using existing voiceover in: public/voiceover.mp3`);
    return targetAudioFile;
  }

  throw new Error("No audio file found. Place an MP3 file in audio/ or pass it as an argument.");
}

async function transcribeWithWhisper(sourceAudioPath) {
  const stat = fs.statSync(sourceAudioPath);
  const cacheKey = `whisper_${stat.size}_${Math.round(stat.mtimeMs)}.json`;
  const cacheFile = path.join(cacheDir, cacheKey);

  if (fs.existsSync(cacheFile)) {
    console.log(`⚡ Loaded transcription from cache: ${cacheKey}`);
    return JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
  }

  console.log("👂 Transcribing full audio with OpenAI Whisper API (words & segments)...");

  const fileBuffer = fs.readFileSync(targetAudioFile);
  const blob = new Blob([fileBuffer], { type: "audio/mpeg" });

  const formData = new FormData();
  formData.append("file", blob, "voiceover.mp3");
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json");
  formData.append("timestamp_granularities[]", "word");
  formData.append("timestamp_granularities[]", "segment");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Whisper API Error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  const words = result.words || [];
  const segments = result.segments || [];
  const duration = result.duration || 10;

  console.log(`✅ Whisper transcription complete: ${words.length} words, ${segments.length} segments.`);
  console.log(`⏱️ Duration: ${duration.toFixed(1)} seconds (${Math.ceil(duration * 30)} frames)`);

  const payload = { transcript: result.text, words, segments, duration };
  fs.writeFileSync(cacheFile, JSON.stringify(payload, null, 2), "utf-8");
  return payload;
}

function partitionIntoStoryChapters(segments, totalDuration) {
  // Target chapter duration: ~45 to 55 seconds (ideal for Vox scene pacing)
  const targetSec = 50;
  const numChapters = Math.max(2, Math.round(totalDuration / targetSec));

  // Natural sentence snapping: find Whisper segment boundaries closest to target intervals
  const cutIndices = [];
  for (let c = 1; c < numChapters; c++) {
    const targetTime = c * (totalDuration / numChapters);
    let bestIdx = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < segments.length - 1; i++) {
      const diff = Math.abs(segments[i].end - targetTime);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = i;
      }
    }
    cutIndices.push(bestIdx);
  }

  const boundaries = [0, ...cutIndices.map((idx) => segments[idx].end), totalDuration];
  const chapters = [];
  let currentFrameCursor = 0;
  const totalFrames = Math.ceil(totalDuration * 30);

  for (let i = 0; i < numChapters; i++) {
    const startSec = boundaries[i];
    const endSec = boundaries[i + 1];
    const durationFrames =
      i === numChapters - 1
        ? totalFrames - currentFrameCursor
        : Math.round((endSec - startSec) * 30);
    const startFrame = currentFrameCursor;
    const endFrame = startFrame + durationFrames;
    currentFrameCursor = endFrame;

    const chapterSegments = segments.filter(
      (s) => s.start >= startSec - 0.05 && s.end <= endSec + 0.05
    );
    const chapterText = chapterSegments.map((s) => s.text).join(" ").trim();

    chapters.push({
      id: i + 1,
      startFrame,
      endFrame,
      startSec,
      endSec,
      durationFrames,
      text: chapterText || `Bagian ${i + 1}`,
      segments: chapterSegments.map((s) => ({
        localStartFrame: Math.max(0, Math.round((s.start - startSec) * 30)),
        localEndFrame: Math.min(durationFrames, Math.round((s.end - startSec) * 30)),
        startSec: Number(s.start - startSec).toFixed(1),
        endSec: Number(s.end - startSec).toFixed(1),
        text: s.text.trim(),
      })),
    });
  }

  return chapters;
}

async function callOpenAI(messages, model, reasoningEffort = "medium", maxRetries = 4) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const payload = {
        model,
        messages,
      };
      if (reasoningEffort) {
        payload.reasoning_effort = reasoningEffort;
      }

      let response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(360_000), // 6-minute generous timeout
      });

      // If reasoning_effort is rejected by a model, retry without it
      if (!response.ok && response.status === 400) {
        const errText = await response.text();
        if (errText.includes("reasoning_effort")) {
          delete payload.reasoning_effort;
          response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(360_000),
          });
        } else {
          throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
        }
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (err) {
      const reason = err.cause?.message || err.cause?.code || err.message || "Unknown network error";
      console.warn(`   ⚠️ Koneksi OpenAI percobaan ${attempt}/${maxRetries} terkendala (${reason}).`);

      if (attempt === maxRetries) throw err;
      const waitTime = attempt * 3000;
      console.log(`   ⏳ Menunggu ${waitTime / 1000} detik sebelum mencoba kembali...`);
      await new Promise((r) => setTimeout(r, waitTime));
    }
  }
}

async function generateAutonomousSceneCode(chapter, totalChapters, rulesText, enableSfx = false, reasoningEffort = "medium") {
  const model = process.env.OPENAI_MODEL || "gpt-6.1-sol";
  const sceneNum = chapter.id;
  const scenePad = sceneNum.toString().padStart(2, "0");
  const componentName = `Scene_${scenePad}`;
  const durationSec = chapter.durationFrames / 30;

  // Group segments into 2 to 3 calm Story Acts (15-20s each)
  const segments = chapter.segments || [];
  const numActs = Math.min(3, Math.max(2, Math.round(chapter.durationFrames / 500)));
  const actDuration = Math.round(chapter.durationFrames / numActs);

  const actsList = [];
  for (let a = 0; a < numActs; a++) {
    const actStart = a * actDuration;
    const actEnd = a === numActs - 1 ? chapter.durationFrames : (a + 1) * actDuration;
    const actSegments = segments.filter(
      (s) => s.localStartFrame >= actStart && s.localStartFrame < actEnd
    );
    const actText = actSegments.map((s) => s.text).join(" ").trim();
    const cuesText = actSegments
      .map(
        (s) =>
          `      • Cue at local frame ${s.localStartFrame} (+${s.startSec}s): "${s.text}"`
      )
      .join("\n");

    actsList.push({
      actNum: a + 1,
      startFrame: actStart,
      endFrame: actEnd,
      durationSec: ((actEnd - actStart) / 30).toFixed(1),
      text: actText || `Act ${a + 1}`,
      cues: cuesText || "      • Progressive visual buildup",
    });
  }

  const timelineCues = actsList
    .map(
      (act) =>
        `   🎬 ACT ${act.actNum} [Frames ${act.startFrame} to ${act.endFrame} | ~${act.durationSec}s]:\n      Narration: "${act.text}"\n${act.cues}`
    )
    .join("\n\n");

  const sfxPrompt = enableSfx
    ? `5. DOCUMENTARY SOUND DESIGN (AUDIO SFX - MINIMALIST & STRICTLY RELEVANT):
   Sound effects MUST be subtle, organic, and STRICTLY tied to real physical visual events.
   import { VoxSoundEffect } from "../../VoxSoundEffect";

   STRICT MATCHING RULES (Never violate these):
   • "highlighter": ONLY use when an actual yellow highlighter stroke animates across text. NEVER use on plain text!
   • "paper_slide": ONLY use when a dossier card, archival document, or comparison panel slides into view. NEVER on plain words!
   • "camera": ONLY use when an archival photograph, polaroid snapshot, or historical clipping appears. NEVER on checklists!
   • "click": ONLY use on subtle interactive checklist checkmarks or toggle switches.
   • "pop": ONLY use on small tactile data badges or pill callouts.

   GOLDEN EDITORIAL RULES:
   - In Vox documentaries, the narrator's voice is PRIMARY. Over-using SFX sounds cartoonish and chaotic.
   - Limit to 1 to 2 SFX per scene! If a scene is pure kinetic typography or dialogue, use 0 SFX (silence is elegant).
   - Keep volume warm and gentle: volume={0.25} to {0.30} (never exceed 0.32).
   Example:
   <VoxSoundEffect type="paper_slide" cue={dossierCue} volume={0.28} />`
    : `5. SOUND EFFECTS RESTRICTION (DEFAULT: NO SFX):
   DO NOT import VoxSoundEffect or Audio!
   DO NOT add any sound effects or audio elements in this component.
   The audio is strictly handled globally by the voiceover narration track without SFX.`;

  const systemPrompt = `You are a Lead Motion Designer and Master React/Remotion Engineer at Vox Media.
Your task is to write a COMPLETE, BEAUTIFUL, PRODUCTION-READY, 100% SELF-CONTAINED TypeScript React component (.tsx) for Scene ${sceneNum} of ${totalChapters} in an investigative Vox-style documentary.

### REMOTION STRICT RULES:
${rulesText}

### MANDATORY COMPONENT SPECIFICATIONS:
1. Export EXACTLY:
   export const ${componentName}: React.FC = () => { ... }
2. Frame Scope:
   useCurrentFrame() is local to this scene, starting at 0 and ending at ${chapter.durationFrames} (${durationSec.toFixed(1)} seconds at 30 fps).

3. CRITICAL VOX MOTION DESIGN & PACING RULES (SEAMLESS, CALM & ELEGANT):
   - SATU TITIK FOKUS / ANTI PUSING (ONE MOVEMENT AT A TIME - CHOREOGRAPHED EYE FLOW):
     * NEVER animate multiple elements simultaneously across the screen! (DILARANG teks bergerak bersamaan dengan diagram membesar dan badge berdenyut).
     * The viewer's eyes must be guided like a director's spotlight: ONE clear movement at a time.
     * Sequential Choreography Order:
       1) Frame 0-30: Headline or core question enters smoothly. Once entered, IT STAYS COMPLETELY STILL (locked resting state).
       2) Frame 35-75: ONLY after the text is still, the main card / diagram enters. The text remains still.
       3) Frame 90-140: ONLY after the card is still, a connector line or arrow draws out.
       4) Frame Cue: When the narrator speaks a key word, an animated yellow highlighter (#FFE600) or red marker circle (#E63946) highlights that specific word.

   - RESTING STATES (TENANG & STABIL - NO SENSORY OVERLOAD):
     * Once an element finishes its entrance, it MUST enter a calm resting state.
     * FORBIDDEN: constant jitter, harsh pulsing, fast spinning, or shaking that distracts from the voiceover.
     * Ketenangan (visual rest) gives the video weight, authority, and premium documentary feel.

   - CALM DOCUMENTARY PACING (2 TO 3 ACTS MAX PER SCENE):
     * A Vox documentary is NOT a frantic TikTok slideshow! Do NOT switch slides every 3-5 seconds!
     * Structure this 50-second scene strictly into the 2 or 3 Acts defined below.
     * Within an Act, DO NOT wipe the canvas! Use PROGRESSIVE BUILDUP: keep the core card present and build context on top of it.
     * NEVER create short sequences or cards that last under 150 frames (5 seconds).

   - PROGRESSIVE BUILDUP OVER REPLACING:
     * Instead of wiping the screen clean every time a new sentence is spoken, BUILD UPON the existing screen!
     * Keep the core visual card/diagram present, and progressively animate:
       1) an animated yellow highlighter (#FFE600) across key words,
       2) an evidence badge/pill sliding in beside it,
       3) a red marker circle (#E63946) drawing around a key insight,
       4) an SVG arrow expanding to connect two ideas.
     * This gives the viewer time to read and digest the information naturally.

   - NEVER LEAVE THE SCREEN BLANK AT FRAME 0:
     * Every scene MUST open at frame 0 with an immediate established layout (title, editorial header, and foundational diagram framing). Do NOT wait until frame 60 or 160 to show the first visual!

   - NO HARD JUMPS / PATAH (CROSSFADE TRANSITIONS):
     * Never abruptly remove elements with hard 'return null' cuts without a fade-out.
     * Always crossfade smoothly between narrative Acts (e.g., interpolate opacity over 15-20 frames on entrance and exit: Math.min(fadeIn, fadeOut)).

   - GENTLE DOCUMENTARY SPRING PHYSICS:
     * Use weighted, cinematic spring configs:
       spring({ frame: Math.max(0, frame - cue), fps, config: { damping: 22, mass: 0.9, stiffness: 70 } })
     * DURATION: entrances should feel deliberate and elegant (~20-25 frames), never nervous or hyperactive.

   - STRUCTURED STORY ACTS FOR THIS SCENE:
${timelineCues}

4. RICH VOX VISUAL GRAPHICS (NO STATIC SCREENS):
   - Bespoke custom SVG diagrams tailored directly to this scene's concepts:
     * Neural pathways, cross-sections, synaptic firing, brain lobes
     * Perception radar, scanning HUD, rotating focus arcs
     * Comparison boxes, perspective room, memory vs reality
     * Archival research documents with animated yellow highlighter (#FFE600)
     * Decision flowcharts, timeline branching, floating evidence cards
     * Hand-drawn red marker circle (#E63946) to emphasize key findings
   - High visual polish: Vox warm paper background (#F5F2EB), rich accents (#18181B, #FFE600, #E63946, #2563EB, #0D9488).

${sfxPrompt}

6. STRICT CODING RESTRICTIONS:
   - All styles must be inline React CSS.
   - All visual graphics must be native inline SVG (<svg viewBox="...">) or HTML elements.
   - Do NOT import non-existent external packages, icons, or CSS files.
   - Only import from "remotion": interpolate, spring, useCurrentFrame, useVideoConfig.
   - NEVER use CSS transitions, keyframes, or setTimeout.
   - ALWAYS clamp interpolations: { extrapolateLeft: "clamp", extrapolateRight: "clamp" }.
   - DO NOT render bottom subtitles or caption boxes inside this scene! The master composition already has a dedicated subtitle layer (<VoxCaptions />). Keep the bottom area (Y >= 900) clean and free of caption overlays.
7. OUTPUT:
   - Output ONLY the TypeScript React code wrapped in: \`\`\`tsx ... \`\`\`. No conversation.`;

  const userPrompt = `SCENE ${sceneNum} OF ${totalChapters} (${chapter.durationFrames} frames, ${durationSec.toFixed(1)} seconds):
SPOKEN NARRATION FOR THIS SCENE:
"${chapter.text}"

Write the complete ${componentName}.tsx React code from scratch now!`;

  const rawContent = await callOpenAI(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model,
    reasoningEffort
  );

  const match = rawContent.match(/```(?:tsx|typescript|jsx|javascript)?([\s\S]*?)```/);
  return match ? match[1].trim() : rawContent.trim();
}

async function fixSceneCode(sceneFile, code, errorOutput, rulesText) {
  const model = process.env.OPENAI_MODEL || "gpt-6.1-sol";
  const fixPrompt = `The TypeScript compiler found these errors in ${path.basename(sceneFile)}:
${errorOutput}

Current code:
${code}

Remotion Rules:
${rulesText}

Return the COMPLETE, FIXED TypeScript code wrapped in \`\`\`tsx ... \`\`\` with 0 errors.`;

  const rawContent = await callOpenAI(
    [
      { role: "system", content: "You are a Master TypeScript Remotion Engineer. Fix all type errors." },
      { role: "user", content: fixPrompt },
    ],
    model
  );

  const match = rawContent.match(/```(?:tsx|typescript|jsx|javascript)?([\s\S]*?)```/);
  return match ? match[1].trim() : rawContent.trim();
}

async function run() {
  const audioSource = await prepareAudio();
  const { words, segments, duration } = await transcribeWithWhisper(audioSource);

  const totalFrames = Math.ceil(duration * 30);
  console.log(`\n🧩 Partitioning 10-minute audio into story scenes...`);
  const chapters = partitionIntoStoryChapters(segments, duration);

  // Reconcile total frames
  const currentTotal = chapters.reduce((acc, c) => acc + c.durationFrames, 0);
  const diff = totalFrames - currentTotal;
  if (diff !== 0 && chapters.length > 0) {
    chapters[chapters.length - 1].durationFrames += diff;
  }

  console.log(`📑 Total Scenes to Generate: ${chapters.length} scenes (~${Math.round(duration / chapters.length)}s each)`);

  const rulesPath = path.join(rootDir, "REMOTION_RULES.md");
  const rulesText = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, "utf-8") : "";

  const generatedDir = path.join(rootDir, "src", "vox", "scenes", "generated");
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  function updateGeneratedIndex() {
    const availableChapters = chapters
      .filter((c) => {
        const scenePad = c.id.toString().padStart(2, "0");
        return fs.existsSync(path.join(generatedDir, `Scene_${scenePad}.tsx`));
      })
      .sort((a, b) => a.id - b.id);

    if (availableChapters.length === 0) {
      const emptyContent = `import React from "react";

export interface GeneratedSceneInfo {
  id: number;
  name: string;
  Component: React.FC;
  startFrame: number;
  durationFrames: number;
}

export const generatedScenes: GeneratedSceneInfo[] = [];
`;
      fs.writeFileSync(path.join(generatedDir, "index.ts"), emptyContent, "utf-8");
      return;
    }

    const importLines = availableChapters.map((c) => {
      const scenePad = c.id.toString().padStart(2, "0");
      return `import { Scene_${scenePad} } from "./Scene_${scenePad}";`;
    });
    const exportNames = availableChapters.map((c) => `Scene_${c.id.toString().padStart(2, "0")}`);
    const sceneListEntries = availableChapters.map(
      (c) =>
        `  { id: ${c.id}, name: "Scene_${c.id.toString().padStart(2, "0")}", Component: Scene_${c.id.toString().padStart(2, "0")}, startFrame: ${c.startFrame}, durationFrames: ${c.durationFrames} },`
    );

    const barrelContent = `import React from "react";
${importLines.join("\n")}

export {
  ${exportNames.join(",\n  ")},
};

export interface GeneratedSceneInfo {
  id: number;
  name: string;
  Component: React.FC;
  startFrame: number;
  durationFrames: number;
}

export const generatedScenes: GeneratedSceneInfo[] = [
${sceneListEntries.join("\n")}
];
`;
    fs.writeFileSync(path.join(generatedDir, "index.ts"), barrelContent, "utf-8");
  }

  // Audio change detection
  const metaFile = path.join(generatedDir, "longform-audio-meta.json");
  let previousAudioKey = "";
  if (fs.existsSync(metaFile)) {
    try {
      const prevMeta = JSON.parse(fs.readFileSync(metaFile, "utf-8"));
      previousAudioKey = prevMeta.audioKey || "";
    } catch {}
  }
  const currentStat = fs.statSync(audioSource);
  const currentAudioKey = `${path.basename(audioSource)}_${currentStat.size}_${Math.round(currentStat.mtimeMs)}`;
  const isDifferentAudio = previousAudioKey !== currentAudioKey;

  if (isDifferentAudio && !isRepairOnly) {
    console.log(`🆕 Audio baru: ${path.basename(audioSource)} (${duration.toFixed(1)}s)`);
    console.log(`🧹 Membersihkan scene lama & meng-generate ulang untuk audio baru...`);
    const existing = fs.readdirSync(generatedDir);
    for (const f of existing) {
      if (f.startsWith("Scene_") && f.endsWith(".tsx")) {
        fs.unlinkSync(path.join(generatedDir, f));
      }
    }
    updateGeneratedIndex();
  }

  // Save current audio metadata
  fs.writeFileSync(
    metaFile,
    JSON.stringify(
      {
        audioKey: currentAudioKey,
        audioFile: path.basename(audioSource),
        duration,
        scenesCount: chapters.length,
      },
      null,
      2
    )
  );

  // Ensure index.ts starts safe
  updateGeneratedIndex();

  if (!isRepairOnly) {
    console.log(`\n🧠 GPT-6.1 Sol is writing AUTONOMOUS REACT COMPONENTS for each scene...`);

    // Strictly sequential: Scene 1, then Scene 2, then Scene 3... in exact order
    for (let i = 0; i < chapters.length; i++) {
      const chap = chapters[i];
      const scenePad = chap.id.toString().padStart(2, "0");
      const sceneFile = path.join(generatedDir, `Scene_${scenePad}.tsx`);

      if (fs.existsSync(sceneFile) && !forceRegenerate && !isDifferentAudio) {
        console.log(`   ⚡ [Scene ${chap.id}/${chapters.length}] Scene_${scenePad}.tsx already exists, using cached code.`);
        continue;
      }

      console.log(`   🎨 [Scene ${chap.id}/${chapters.length}] GPT-6.1 Sol coding Scene_${scenePad}.tsx (${chap.durationFrames} frames | ${reasoningEffort} reasoning)...`);
      const code = await generateAutonomousSceneCode(chap, chapters.length, rulesText, enableSfx, reasoningEffort);
      fs.writeFileSync(sceneFile, code, "utf-8");
      // Live progressive update
      updateGeneratedIndex();
      console.log(`   ✅ Saved: src/vox/scenes/generated/Scene_${scenePad}.tsx`);
    }
  } else {
    console.log(`🔧 Mode perbaikan aktif (--repair/--fix): Melewati pembuatan scene baru, langsung memeriksa dan memperbaiki error...`);
  }

  // Finalize barrel file
  updateGeneratedIndex();

  // Save metadata
  const metaPath = path.join(rootDir, "src", "vox", "longform-meta.json");
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      {
        totalFrames,
        totalDurationSeconds: Math.ceil(duration),
        audioFile: "voiceover.mp3",
        chapters: chapters.map((c) => ({
          id: c.id,
          name: `Scene_${c.id.toString().padStart(2, "0")}`,
          durationFrames: c.durationFrames,
          text: c.text,
        })),
      },
      null,
      2
    ),
    "utf-8"
  );

  // Save captions
  const captionsPath = path.join(rootDir, "src", "vox", "longform-captions.json");
  fs.writeFileSync(
    captionsPath,
    JSON.stringify(
      words.map((w) => ({
        word: w.word,
        start: Number(w.start),
        end: Number(w.end),
      })),
      null,
      2
    ),
    "utf-8"
  );

  // Verify TypeScript build
  console.log("\n🔍 Verifying all generated scenes with TypeScript compiler (tsc)...");
  try {
    execSync("npx tsc --noEmit", { cwd: rootDir, stdio: "pipe" });
    console.log("✅ TypeScript check PASSED with 0 errors across all generated scenes!");
  } catch (tscErr) {
    const errorOutput = tscErr.stdout?.toString() || tscErr.stderr?.toString() || tscErr.message;
    console.warn(`⚠️ TypeScript found type errors:\n${errorOutput.slice(0, 600)}...`);

    // Identify which scene has error
    for (const chap of chapters) {
      const scenePad = chap.id.toString().padStart(2, "0");
      const sceneFileName = `Scene_${scenePad}.tsx`;
      if (errorOutput.includes(sceneFileName)) {
        console.log(`🛠️ Self-healing ${sceneFileName} with GPT-6.1 Sol...`);
        const sceneFile = path.join(generatedDir, sceneFileName);
        const currentCode = fs.readFileSync(sceneFile, "utf-8");
        const fixedCode = await fixSceneCode(sceneFile, currentCode, errorOutput, rulesText);
        fs.writeFileSync(sceneFile, fixedCode, "utf-8");
      }
    }

    try {
      execSync("npx tsc --noEmit", { cwd: rootDir, stdio: "pipe" });
      console.log("✅ Self-healing succeeded: TypeScript check PASSED!");
    } catch {
      console.warn("⚠️ Continuing with render...");
    }
  }

  if (shouldRender) {
    // Generate snapshots
    console.log("\n📸 Capturing visual inspection snapshots for story chapters...");
    let accumulatedFrames = 0;
    for (const snapChap of chapters.slice(0, 4)) {
      const snapFrame = accumulatedFrames + Math.round(snapChap.durationFrames * 0.3);
      const snapFile = path.join(rootDir, "out", `longform-scene${snapChap.id.toString().padStart(2, "0")}.png`);
      try {
        execSync(`npx remotion still src/index.ts LongFormVideo "${snapFile}" --frame=${snapFrame}`, { cwd: rootDir, stdio: "pipe" });
        console.log(`   📸 Captured Snapshot Scene ${snapChap.id} (Frame ${snapFrame})`);
      } catch (e) {
        console.warn(`   ⚠️ Snapshot Scene ${snapChap.id} warning:`, e.message);
      }
      accumulatedFrames += snapChap.durationFrames;
    }

    // Render MP4
    const tempVideo = path.join(rootDir, "out", "longform-temp.mp4");
    const finalVideo = path.join(rootDir, "out", "longform-video.mp4");

    console.log(`\n🎥 1. Rendering ${totalFrames} frames with Remotion <Series> across ${chapters.length} autonomous scenes...`);
    const renderCmd = `npx remotion render src/index.ts LongFormVideo "${tempVideo}"`;
    execSync(renderCmd, { stdio: "inherit", cwd: rootDir });

    console.log("\n🔊 2. Muxing original audio track directly into MP4 via FFmpeg...");
    const muxCmd = `npx remotion ffmpeg -y -i "${tempVideo}" -i "${targetAudioFile}" -c:v copy -c:a aac -b:a 192k -shortest "${finalVideo}"`;
    try {
      execSync(muxCmd, { stdio: "inherit", cwd: rootDir });
      if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
      console.log("\n🎉 Full Autonomous Long-Form Vox Video is Ready!");
      console.log(`📁 File location : ${finalVideo}`);
      console.log(`⏱️ Duration      : ${Math.ceil(duration)}s (${totalFrames} frames)`);
      console.log(`🎬 Total Scenes  : ${chapters.length} uniquely coded React components in src/vox/scenes/generated/\n`);
    } catch (muxErr) {
      console.warn("⚠️ FFmpeg mux warning, keeping temp video:", muxErr.message);
      if (fs.existsSync(tempVideo)) fs.renameSync(tempVideo, finalVideo);
    }
  } else {
    console.log("\n🎉 SELESAI! Video long-form 16:9 siap dijalankan.");
    console.log("👉 Untuk melihat preview di Remotion Studio:");
    console.log("   npm start");
    console.log("👉 Untuk merender video MP4:");
    console.log(`   npm run longform -- ${path.basename(audioSource)} --render`);
    console.log("   atau: npx remotion render src/index.ts LongFormVideo out/longform-video.mp4\n");
  }
}

run();
