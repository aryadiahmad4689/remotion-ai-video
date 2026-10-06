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
const targetAudioFile = path.join(publicDir, "voiceover.mp3");

console.log("\n==================================================================");
console.log("🎬 FULL AUTONOMOUS MULTI-SCENE REACT GENERATOR (LONG-FORM 10+ MINS)");
console.log("   Whisper AI + GPT-6.1 Sol -> Autonomous TSX React Scenes -> Remotion <Series>");
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
  const chapterDuration = totalDuration / numChapters;
  const chapters = [];

  for (let i = 0; i < numChapters; i++) {
    const startSec = i * chapterDuration;
    const endSec = i === numChapters - 1 ? totalDuration : (i + 1) * chapterDuration;

    const chapterSegments = segments.filter((s) => s.start >= startSec && s.start < endSec);
    const chapterText = chapterSegments.map((s) => s.text).join(" ").trim();

    const startFrame = Math.round(startSec * 30);
    const endFrame = Math.round(endSec * 30);
    const durationFrames = endFrame - startFrame;

    chapters.push({
      id: i + 1,
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

async function callOpenAI(messages, model, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (err) {
      console.warn(`   ⚠️ OpenAI network attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, attempt * 2000));
    }
  }
}

async function generateAutonomousSceneCode(chapter, totalChapters, rulesText) {
  const model = process.env.OPENAI_MODEL || "gpt-6.1-sol";
  const sceneNum = chapter.id;
  const scenePad = sceneNum.toString().padStart(2, "0");
  const componentName = `Scene_${scenePad}`;
  const durationSec = chapter.durationFrames / 30;

  const timelineCues = (chapter.segments || [])
    .map(
      (s, idx) =>
        `   • Beat ${idx + 1} [Frames ${s.localStartFrame} - ${s.localEndFrame} | +${s.startSec}s to +${s.endSec}s]: "${s.text}"`
    )
    .join("\n");

  const systemPrompt = `You are a Lead Motion Designer and Master React/Remotion Engineer at Vox Media.
Your task is to write a COMPLETE, BEAUTIFUL, PRODUCTION-READY, 100% SELF-CONTAINED TypeScript React component (.tsx) for Scene ${sceneNum} of ${totalChapters} in an investigative Vox-style documentary.

### REMOTION STRICT RULES:
${rulesText}

### MANDATORY COMPONENT SPECIFICATIONS:
1. Export EXACTLY:
   export const ${componentName}: React.FC = () => { ... }
2. Frame Scope:
   useCurrentFrame() is local to this scene, starting at 0 and ending at ${chapter.durationFrames} (${durationSec.toFixed(1)} seconds at 30 fps).

3. CRITICAL AUDIO-VISUAL SYNCHRONIZATION (DO NOT ANIMATE TOO FAST!):
   In previous renders, animations appeared too fast before the narrator actually spoke the words.
   The narrator speaks in a calm, measured documentary tone.
   You MUST time each visual entrance, text reveal, and diagram animation to match the EXACT spoken timeline cues below:
${timelineCues}

   RULES FOR PERFECT PACING:
   - DO NOT trigger all graphics in the first 50-100 frames!
   - Elements for Beat 1 must enter at Beat 1's start frame.
   - Elements for Beat 2 must enter at Beat 2's start frame.
   - When a specific sentence or concept is spoken (e.g. at frame 400), reveal the corresponding graphic/card at frame 400!
   - Use 'spring({ frame: Math.max(0, frame - cueFrame), ... })' or conditional render 'frame >= cueFrame'.
   - This ensures the visual motion flows in 100% perfect lockstep with the spoken voice!

4. RICH VOX VISUAL GRAPHICS (NO STATIC SCREENS):
   - Bespoke custom SVG diagrams tailored directly to this scene's concepts:
     * Neural pathways, cross-sections, synaptic firing, brain lobes
     * Perception radar, scanning HUD, rotating focus arcs
     * Comparison boxes, perspective room, memory vs reality
     * Archival research documents with animated yellow highlighter (#FFE600)
     * Decision flowcharts, timeline branching, floating evidence cards
     * Hand-drawn red marker circle (#E63946) to emphasize key findings
   - High visual polish: Vox warm paper background (#F5F2EB), rich accents (#18181B, #FFE600, #E63946, #2563EB, #0D9488).

5. PROCEDURAL SOUND DESIGN (AUDIO SFX):
   You can add documentary-grade sound effects synchronized with visual events:
   import { VoxSoundEffect } from "../../VoxSoundEffect";

   Available SFX types:
   • "paper_slide" or "woosh": Trigger at frame 0 or when a new card/dossier slides into view.
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
    model
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

  console.log(`\n🧠 GPT-6.1 Sol is writing AUTONOMOUS REACT COMPONENTS for each scene...`);

  // Generate in parallel batches of 3 scenes
  const concurrency = 3;
  for (let i = 0; i < chapters.length; i += concurrency) {
    const batch = chapters.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (chap) => {
        const scenePad = chap.id.toString().padStart(2, "0");
        const sceneFile = path.join(generatedDir, `Scene_${scenePad}.tsx`);

        if (fs.existsSync(sceneFile) && !forceRegenerate) {
          console.log(`   ⚡ [Scene ${chap.id}/${chapters.length}] Scene_${scenePad}.tsx already exists, using cached code.`);
          return;
        }

        console.log(`   🎨 [Scene ${chap.id}/${chapters.length}] GPT-6.1 Sol coding Scene_${scenePad}.tsx (${chap.durationFrames} frames)...`);
        const code = await generateAutonomousSceneCode(chap, chapters.length, rulesText);
        fs.writeFileSync(sceneFile, code, "utf-8");
        console.log(`   ✅ Saved: src/vox/scenes/generated/Scene_${scenePad}.tsx`);
      })
    );
  }

  // Create generated/index.ts barrel file
  const importLines = [];
  const exportNames = [];
  const sceneListEntries = [];
  for (const chap of chapters) {
    const scenePad = chap.id.toString().padStart(2, "0");
    const name = `Scene_${scenePad}`;
    importLines.push(`import { ${name} } from "./${name}";`);
    exportNames.push(name);
    sceneListEntries.push(`  { id: ${chap.id}, name: "${name}", Component: ${name}, durationFrames: ${chap.durationFrames} },`);
  }

  const barrelContent = `import React from "react";
${importLines.join("\n")}

export {
  ${exportNames.join(",\n  ")},
};

export interface GeneratedSceneInfo {
  id: number;
  name: string;
  Component: React.FC;
  durationFrames: number;
}

export const generatedScenes: GeneratedSceneInfo[] = [
${sceneListEntries.join("\n")}
];
`;
  fs.writeFileSync(path.join(generatedDir, "index.ts"), barrelContent, "utf-8");

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
}

run();
