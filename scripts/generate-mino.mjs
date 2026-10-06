import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. Load .env
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

const outDir = path.join(rootDir, "out");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const rawArgs = process.argv.slice(2);
const shouldRender = rawArgs.includes("--render");
const forceRegenerate = rawArgs.includes("--force");
const isRepairOnly = rawArgs.includes("--repair") || rawArgs.includes("--fix");
const audioArg = rawArgs.find((a) => !a.startsWith("--"));
const targetAudioFile = path.join(publicDir, "voiceover.mp3");

console.log("\n==================================================================");
console.log("🧢  AUTONOMOUS MINO SHORTS 9:16 GENERATOR (GPT-6.1 SOL MEDIUM + WHISPER)");
console.log("    Whisper Timestamps -> Dynamic Shorts Pacing -> AI TSX Scenes -> Remotion <Series>");
console.log("==================================================================\n");

// 2. Audio Preparation
async function prepareAudio() {
  if (audioArg) {
    const resolvedPath = path.isAbsolute(audioArg)
      ? audioArg
      : path.join(rootDir, audioArg);

    if (fs.existsSync(resolvedPath)) {
      console.log(`📁 Menggunakan audio input: ${resolvedPath}`);
      fs.copyFileSync(resolvedPath, targetAudioFile);
      return resolvedPath;
    }
  }

  const audioDirPath = path.join(rootDir, "audio");
  if (fs.existsSync(audioDirPath)) {
    // Explicitly exclude suara-panjang / long-form files, prioritize MiniMax short audios
    const files = fs
      .readdirSync(audioDirPath)
      .filter((f) => (f.endsWith(".mp3") || f.endsWith(".wav") || f.endsWith(".m4a")) && !f.toLowerCase().includes("panjang"))
      .sort((a, b) => {
        // Prioritize MiniMax files that match Mino
        if (a.includes("19_03_54")) return -1;
        if (b.includes("19_03_54")) return 1;
        return fs.statSync(path.join(audioDirPath, b)).mtimeMs - fs.statSync(path.join(audioDirPath, a)).mtimeMs;
      });

    if (files.length > 0) {
      const chosen = path.join(audioDirPath, files[0]);
      console.log(`📁 Terpilih audio pendek MiniMax: ${files[0]}`);
      fs.copyFileSync(chosen, targetAudioFile);
      return chosen;
    }
  }

  if (fs.existsSync(targetAudioFile)) {
    console.log(`📁 Menggunakan audio yang sudah ada di: public/voiceover.mp3`);
    return targetAudioFile;
  }

  throw new Error("Tidak ada file audio yang ditemukan! Simpan file MP3 di folder audio/ atau tentukan argumen.");
}

// 3. Whisper AI Transcription with Caching
async function transcribeWithWhisper(sourceAudioPath) {
  const stat = fs.statSync(sourceAudioPath);
  const cacheKey = `whisper_${stat.size}_${Math.round(stat.mtimeMs)}.json`;
  const cacheFile = path.join(cacheDir, cacheKey);

  if (fs.existsSync(cacheFile) && !forceRegenerate) {
    console.log(`⚡ Memuat transkripsi Whisper dari cache: ${cacheKey}`);
    const data = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
    fs.writeFileSync(path.join(publicDir, "captions.json"), JSON.stringify(data.words, null, 2));
    return data;
  }

  console.log("👂 Mentranskripsi audio dengan Whisper API (word & segment timestamps)...");

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
  const duration = result.duration || 40;

  console.log(`✅ Transkripsi selesai: ${words.length} kata, ${segments.length} segmen.`);
  console.log(`⏱️ Durasi: ${duration.toFixed(1)} detik (${Math.ceil(duration * 30)} frame @ 30fps)`);

  const payload = { transcript: result.text, words, segments, duration };
  fs.writeFileSync(cacheFile, JSON.stringify(payload, null, 2), "utf-8");
  fs.writeFileSync(path.join(publicDir, "captions.json"), JSON.stringify(words, null, 2));
  return payload;
}

// 4. Shorts Scene Partitioning (Semantic Sentence-Aware Pacing ~9 - 13s)
function partitionIntoShortsScenes(segments, totalDuration) {
  const scenes = [];
  let currentGroup = [];
  let groupStart = 0;

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    currentGroup.push(s);
    const durationSoFar = s.end - groupStart;
    const isLast = i === segments.length - 1;
    const next = segments[i + 1];
    const pauseToNext = next ? next.start - s.end : 0;
    const hasPunctuation = /[.!?]$/.test(s.text.trim());

    // Clean thought cut criteria:
    // Accumulate at least 8.0s AND cut on sentence punctuation / natural silence pause (>0.35s), OR if duration >= 14s, OR final segment
    if (
      isLast ||
      (durationSoFar >= 8.0 && (hasPunctuation || pauseToNext > 0.35)) ||
      durationSoFar >= 14.0
    ) {
      const endSec = isLast ? totalDuration : s.end + Math.min(0.25, Math.max(0, pauseToNext / 2));
      const startFrame = Math.round(groupStart * 30);
      const endFrame = Math.round(endSec * 30);
      const durationFrames = endFrame - startFrame;

      scenes.push({
        id: scenes.length + 1,
        startSec: groupStart,
        endSec,
        durationFrames,
        text: currentGroup.map((item) => item.text.trim()).join(" "),
        isFirst: scenes.length === 0,
        isLast,
        segments: currentGroup.map((item) => ({
          localStartFrame: Math.max(0, Math.round((item.start - groupStart) * 30)),
          localEndFrame: Math.min(durationFrames, Math.round((item.end - groupStart) * 30)),
          startSec: Number(item.start - groupStart).toFixed(1),
          endSec: Number(item.end - groupStart).toFixed(1),
          text: item.text.trim(),
        })),
      });

      groupStart = endSec;
      currentGroup = [];
    }
  }

  return scenes;
}

// 5. OpenAI API Call with reasoning_effort: "medium"
async function callOpenAI(messages, model, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const payload = {
        model,
        messages,
        reasoning_effort: "medium", // User requested medium reasoning effort
      };

      let response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      // If reasoning_effort is rejected by a standard model, retry without it
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
      console.warn(`   ⚠️ OpenAI percobaan ${attempt}/${maxRetries} gagal: ${err.message}`);
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, attempt * 2000));
    }
  }
}

// 6. Generate Autonomous TSX React Code for a Single Scene
async function generateAutonomousMinoSceneCode(scene, totalScenes, rulesText) {
  const model = process.env.OPENAI_MODEL || "gpt-6.1-sol";
  const sceneNum = scene.id;
  const scenePad = sceneNum.toString().padStart(2, "0");
  const componentName = `MinoScene_${scenePad}`;
  const durationSec = scene.durationFrames / 30;

  const timelineCues = (scene.segments || [])
    .map(
      (s, idx) =>
        `   • Beat ${idx + 1} [Frames ${s.localStartFrame} - ${s.localEndFrame} | +${s.startSec}s to +${s.endSec}s]: "${s.text}"`
    )
    .join("\n");

  const systemPrompt = `You are a Lead Motion Graphics Designer and Master React/Remotion Engineer at Vox Media.
Your task is to write a COMPLETE, BEAUTIFUL, PRODUCTION-READY, 100% SELF-CONTAINED TypeScript React component (.tsx) for Scene ${sceneNum} of ${totalScenes} in a 9:16 VERTICAL SHORT-FORM VIDEO (1080 × 1920).

### REMOTION STRICT RULES:
${rulesText}

### COMPONENT SPECIFICATIONS:
1. Export EXACTLY:
   export const ${componentName}: React.FC = () => { ... }

2. Canvas & Scope:
   useCurrentFrame() starts at 0 and ends at ${scene.durationFrames} (${durationSec.toFixed(1)} seconds at 30 fps).
   Canvas coordinate space is 1080 × 1920 (Vertical 9:16).

3. CHARACTER "MINO" INTEGRATION:
   You MUST import and render the character Mino:
   import { MinoCharacter, MinoPose } from "../../MinoCharacter";
   
   Available poses:
   "curious" | "confused" | "pointing" | "searching" | "shocked" | "waving" | "idle"
   
   CRITICAL FOR SMOOTH SEAMLESS CONTINUITY:
   - Mino is the persistent host of the show. DO NOT animate Mino entering with translateY bounce or opacity fade from 0!
   - Simply render:
     <div style={{ position: "absolute", bottom: 270, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "flex-end", zIndex: 30, pointerEvents: "none" }}>
       <MinoCharacter pose={chosenPose} scale={1.35} />
     </div>
   - Keep Mino grounded and steady on screen so there is zero flicker or jumping across scene boundaries.

4. BESPOKE VOX VISUAL PANEL (Upper Area: Y = 180 to 950):
   Create dynamic, bespoke editorial visual graphics in the top area (Y: 180 - 950):
   - Kinetic editorial headline (bold typography, Playfair Display / Inter, staggered word entry).
   - Bespoke inline SVG diagrams illustrating this scene's concepts:
     * Brain synapses / neural pathways
     * Polaroid archival photo cards with tape
     * Dual comparison dossier / matching cues
     * 3-item trigger cards / checklist
     * Data statistics / large numbers with hand-drawn red circles (#E63946)
     * Editorial yellow highlighter (#FFE600)
   - Synchronize visual animations with the EXACT spoken cues:
${timelineCues}
   - VISUAL LONGEVITY & COMFORTABLE PACING:
     Do NOT fade out or dismiss headline/cards halfway through the scene! Elements should enter smoothly at their respective spoken beat cue and REMAIN visible and readable until the scene concludes. Give the viewer time to read!

5. PROCEDURAL SOUND DESIGN (AUDIO SFX):
   You can add documentary-grade sound effects synchronized with visual events:
   import { VoxSoundEffect } from "../../../VoxSoundEffect";

   Available SFX types:
   • "paper_slide" or "woosh": Trigger at frame 0 or when a new card/panel slides into view.
   • "highlighter": Trigger when highlighting text or data.
   • "pop": Trigger when a stat card, callout bubble, or data badge pops up.
   • "click": Trigger on subtle checklist checks, toggle switches, or data tick points.
   • "camera": Trigger when an archival photo, polaroid, or evidence item appears.

   Usage example:
   <VoxSoundEffect type="paper_slide" cue={0} volume={0.45} />
   <VoxSoundEffect type="pop" cue={statCueFrame} volume={0.4} />

   RULES:
   - Select 2 to 4 purposeful, punchy moments per scene that match the visual events.
   - Keep volume balanced (0.35 to 0.5) so it enhances the narrator's voice without overpowering it.

6. STRICT RESTRICTIONS:
   - All styles inline React CSS.
   - Native inline SVG (<svg>) or HTML elements only. No external icon packages or images.
   - Only import from "remotion": interpolate, spring, useCurrentFrame, useVideoConfig.
   - NEVER use CSS transitions, keyframes, or setTimeout.
   - ALWAYS clamp interpolations: { extrapolateLeft: "clamp", extrapolateRight: "clamp" }.
   - Protect all interpolate ranges from invalid input: Math.max(start + 0.001, end).
   - DO NOT render bottom subtitles or caption banners! The master composition already has <VoxCaptions /> at bottom: 130 (Y >= 1600). Keep the bottom clean to avoid double captions.
   - DO NOT render background paper or top progress bar (master composition handles those globally).

7. OUTPUT:
   Output ONLY the TypeScript React code wrapped in: \`\`\`tsx ... \`\`\`.`;

  const userPrompt = `SCENE ${sceneNum} OF ${totalScenes} (${scene.durationFrames} frames, ${durationSec.toFixed(1)} seconds):
SPOKEN NARRATION FOR THIS SCENE:
"${scene.text}"

Write the complete ${componentName}.tsx React code from scratch now!`;

  const rawContent = await callOpenAI(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model
  );

  const match = rawContent.match(/```(?:tsx|typescript|jsx|javascript)?([\s\S]*?)```/);
  return match ? match[1].trim() : rawContent.trim();
}

// 7. Targeted Self-Healing: Fix ONLY the Broken Scene File
async function fixSceneCode(sceneFile, code, errorOutput, rulesText) {
  const model = process.env.OPENAI_MODEL || "gpt-6.1-sol";
  const fixPrompt = `The TypeScript compiler found these errors in ${path.basename(sceneFile)}:
${errorOutput}

Current code:
${code}

Remotion Rules:
${rulesText}

Fix all errors and return the COMPLETE, FIXED TypeScript code wrapped in \`\`\`tsx ... \`\`\` with 0 errors.`;

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

// 8. Main Orchestration Pipeline
async function run() {
  const audioSource = await prepareAudio();
  const { words, segments, duration } = await transcribeWithWhisper(audioSource);

  const totalFrames = Math.ceil(duration * 30);
  console.log(`\n🧩 Mempartisi audio (${duration.toFixed(1)} detik) menjadi adegan Shorts vertikal...`);
  const scenes = partitionIntoShortsScenes(segments, duration);

  // Reconcile total frames so sum exactly equals totalFrames
  const currentTotal = scenes.reduce((acc, s) => acc + s.durationFrames, 0);
  const diff = totalFrames - currentTotal;
  if (diff !== 0 && scenes.length > 0) {
    scenes[scenes.length - 1].durationFrames += diff;
  }

  console.log(`📑 Total Adegan yang Dihasilkan: ${scenes.length} adegan (~${(duration / scenes.length).toFixed(1)}s per adegan)\n`);

  const rulesPath = path.join(rootDir, "REMOTION_RULES.md");
  const rulesText = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, "utf-8") : "";

  const generatedDir = path.join(rootDir, "src", "vox", "mino", "scenes", "generated");
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  // Audio change detection
  const metaFile = path.join(generatedDir, "audio-meta.json");
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
      if (f.startsWith("MinoScene_") && f.endsWith(".tsx")) {
        fs.unlinkSync(path.join(generatedDir, f));
      }
    }
  }

  // Save current audio metadata
  fs.writeFileSync(
    metaFile,
    JSON.stringify(
      {
        audioKey: currentAudioKey,
        audioFile: path.basename(audioSource),
        duration,
        scenesCount: scenes.length,
      },
      null,
      2
    )
  );

  if (!isRepairOnly) {
    console.log(`🧠 GPT-6.1 Sol (medium reasoning) sedang menulis KODE REACT TSX untuk tiap adegan...`);

    // Parallel generation in batches of 2
    const concurrency = 2;
    for (let i = 0; i < scenes.length; i += concurrency) {
      const batch = scenes.slice(i, i + concurrency);
      await Promise.all(
        batch.map(async (scene) => {
          const scenePad = scene.id.toString().padStart(2, "0");
          const filename = `MinoScene_${scenePad}.tsx`;
          const filePath = path.join(generatedDir, filename);

          if (fs.existsSync(filePath) && !forceRegenerate && !isDifferentAudio) {
            console.log(`   ⚡ Menggunakan scene yang sudah ada: ${filename}`);
            return;
          }

          console.log(`   ✍️ Menulis ${filename} (${scene.durationFrames} frames, ~${(scene.durationFrames / 30).toFixed(1)}s)...`);
          const code = await generateAutonomousMinoSceneCode(scene, scenes.length, rulesText);
          fs.writeFileSync(filePath, code, "utf-8");
          console.log(`   ✅ Selesai: ${filename}`);
        })
      );
    }
  } else {
    console.log(`🔧 Mode perbaikan aktif (--repair/--fix): Melewati pembuatan scene baru, langsung memeriksa dan memperbaiki error...`);
  }

  // Generate index.ts
  console.log(`\n📦 Menyusun file index.ts untuk semua adegan...`);
  const indexImports = scenes
    .map((s) => `import { MinoScene_${s.id.toString().padStart(2, "0")} } from "./MinoScene_${s.id.toString().padStart(2, "0")}";`)
    .join("\n");
  const indexExports = scenes
    .map((s) => `  MinoScene_${s.id.toString().padStart(2, "0")},`)
    .join("\n");
  const indexScenesList = scenes
    .map(
      (s) =>
        `  { id: ${s.id}, name: "MinoScene_${s.id.toString().padStart(2, "0")}", Component: MinoScene_${s.id.toString().padStart(2, "0")}, durationFrames: ${s.durationFrames} },`
    )
    .join("\n");

  const indexContent = `import React from "react";
${indexImports}

export {
${indexExports}
};

export interface GeneratedMinoSceneInfo {
  id: number;
  name: string;
  Component: React.FC;
  durationFrames: number;
}

export const generatedMinoScenes: GeneratedMinoSceneInfo[] = [
${indexScenesList}
];
`;

  fs.writeFileSync(path.join(generatedDir, "index.ts"), indexContent, "utf-8");
  console.log(`✅ src/vox/mino/scenes/generated/index.ts berhasil dibuat.`);

  // Update vox-meta.json
  const metaPath = path.join(rootDir, "src", "vox", "vox-meta.json");
  fs.writeFileSync(metaPath, JSON.stringify({ durationSeconds: Math.ceil(duration) }, null, 2));

  // Targeted Self-Healing via TypeScript Compiler
  console.log(`\n🔍 Memverifikasi semua adegan dengan TypeScript compiler (tsc)...`);
  let isClean = false;
  let attempts = 0;

  while (!isClean && attempts < 3) {
    attempts++;
    try {
      execSync("npx tsc --noEmit", { cwd: rootDir, stdio: "pipe" });
      isClean = true;
      console.log(`✨ Semua adegan valid! 0 error TypeScript.`);
    } catch (tscErr) {
      const output = tscErr.stdout?.toString() || tscErr.stderr?.toString() || "";
      console.warn(`⚠️ TypeScript menemukan error pada percobaan ${attempts}:`);

      // Find which MinoScene_*.tsx files have errors
      const failedFiles = new Set();
      for (const line of output.split("\n")) {
        const match = line.match(/(src\/vox\/mino\/scenes\/generated\/MinoScene_\d+\.tsx)/);
        if (match) {
          failedFiles.add(match[1]);
        }
      }

      if (failedFiles.size === 0) {
        console.error(output);
        throw new Error("Ditemukan error kompilasi di luar adegan MinoScene.");
      }

      for (const relFile of failedFiles) {
        const fullPath = path.join(rootDir, relFile);
        console.log(`🛠️ Self-healing ${path.basename(fullPath)} dengan GPT-6.1 Sol...`);
        const currentCode = fs.readFileSync(fullPath, "utf-8");
        const fixedCode = await fixSceneCode(fullPath, currentCode, output, rulesText);
        fs.writeFileSync(fullPath, fixedCode, "utf-8");
        console.log(`   ✅ Selesai perbaikan ${path.basename(fullPath)}.`);
      }
    }
  }

  if (!isClean) {
    console.error("❌ Gagal memperbaiki beberapa adegan setelah 3 percobaan.");
    process.exit(1);
  }

  // Render option
  if (shouldRender) {
    console.log(`\n🎬 Memulai render video vertikal 9:16 (MinoShorts) ke out/mino-shorts.mp4...`);
    execSync("npx remotion render src/index.ts MinoShorts out/mino-shorts.mp4", {
      cwd: rootDir,
      stdio: "inherit",
    });
    console.log(`🎉 Berhasil! Video vertikal tersimpan di out/mino-shorts.mp4`);
  } else {
    console.log(`\n🎉 SELESAI! Video vertikal 9:16 siap dijalankan.`);
    console.log(`👉 Untuk melihat preview di Remotion Studio:`);
    console.log(`   npm start`);
    console.log(`👉 Untuk merender video MP4:`);
    console.log(`   npm run mino -- --render`);
    console.log(`   atau: npx remotion render src/index.ts MinoShorts out/mino-shorts.mp4\n`);
  }
}

run().catch((err) => {
  console.error("❌ Terjadi kesalahan:", err);
  process.exit(1);
});
