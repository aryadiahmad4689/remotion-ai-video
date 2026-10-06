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

const rawArgs = process.argv.slice(2);
const audioArg = rawArgs.find((a) => !a.startsWith("--"));
const targetAudioFile = path.join(publicDir, "voiceover.mp3");

console.log("\n==================================================================");
console.log("🎙️  FULL AUTONOMOUS VOX REACT GENERATOR (WHISPER + GPT-6.1 SOL)");
console.log("==================================================================\n");

async function prepareAudio() {
  if (audioArg) {
    const resolvedPath = path.isAbsolute(audioArg)
      ? audioArg
      : path.join(rootDir, audioArg);

    if (fs.existsSync(resolvedPath)) {
      console.log(`📁 Using specified audio: ${resolvedPath}`);
      fs.copyFileSync(resolvedPath, targetAudioFile);
      return;
    }
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
      console.log(`📁 Auto-detected latest audio from folder audio/: ${files[0]}`);
      fs.copyFileSync(chosen, targetAudioFile);
      return;
    }
  }

  if (fs.existsSync(targetAudioFile)) {
    console.log(`🔊 Using existing voiceover in: public/voiceover.mp3`);
    return;
  }

  throw new Error("No audio file found. Place an MP3 file in audio/ or pass it as an argument.");
}

async function transcribeWithWhisper() {
  console.log("👂 Transcribing audio with OpenAI Whisper API (words & segments)...");

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
  console.log(`⏱️  Duration: ${duration.toFixed(1)} seconds (${Math.ceil(duration * 30)} frames)`);
  console.log(`📝 Full Transcript:\n"${result.text}"\n`);

  // Update vox-meta.json
  const metaPath = path.join(rootDir, "src", "vox", "vox-meta.json");
  fs.writeFileSync(
    metaPath,
    JSON.stringify({ durationSeconds: Math.ceil(duration) }, null, 2),
    "utf-8"
  );

  return { transcript: result.text, words, segments, duration };
}

async function generateAutonomousVoxReact(transcript, words, segments, duration, customInstruction = "") {
  console.log("🧠 GPT-6.1 Sol is CODING A BRAND NEW REACT COMPONENT from scratch for this audio...");

  const model = process.env.OPENAI_MODEL || "gpt-6.1-sol";
  const rulesPath = path.join(rootDir, "REMOTION_RULES.md");
  const rulesText = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, "utf-8") : "";

  // Prepare segment summary across the entire duration
  const timelineSummary = segments.map((s, idx) => ({
    seg: idx + 1,
    time: `${Number(s.start).toFixed(1)}s - ${Number(s.end).toFixed(1)}s`,
    startFrame: Math.round(Number(s.start) * 30),
    endFrame: Math.round(Number(s.end) * 30),
    text: s.text.trim(),
  }));

  const systemPrompt = `You are a Lead Motion Designer and Master React/Remotion Engineer at Vox Media.
Your task is to write a COMPLETE, BEAUTIFUL, PRODUCTION-READY, 100% SELF-CONTAINED TypeScript React component (.tsx) for a Vox-style explainer video.

### REMOTION STRICT RULES:
${rulesText}

### MANDATORY VOX AESTHETIC & MULTI-SCENE PACING:
1. Export EXACTLY:
   export const VoxGeneratedVideo: React.FC = () => { ... }
2. Must import and include audio:
   import { Audio, staticFile, AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
   <Audio src={staticFile("voiceover.mp3")} />
3. Warm paper archival background (#F5F2EB) with subtle documentary grid or crosshair markers.
4. Total duration is ${Math.ceil(duration * 30)} frames (${Math.ceil(duration)} seconds at 30 fps).
5. DO NOT KEEP THE SCREEN STATIC! In Vox videos, the visual scene MUST CHANGE or EVOLVE every 25 to 50 seconds:
   - Divide the audio timeline into multiple distinct <Sequence> scenes matching the story progression:
     * Scene A: Clinical / Academic archival document with slow Ken Burns 3D tilt, headline, and animated yellow highlighter (#FFE600) wiping across key phrases.
     * Scene B: Custom interactive SVG illustration/diagram (e.g. brain hemispheres, neural signal path, perception timeline, or conceptual model) with spring-animated lines and labels.
     * Scene C: Editorial data chart (bar or line comparison) with highlighted hero metric and animated hand-drawn red marker circle (#E63946).
     * Scene D: Evidence breakdown / 3 polaroid-style evidence cards or timeline steps with stamps.
     * Scene E: Summary takeaway card with big quotation marks and author attribution.
6. Bottom Captions:
   - Include kinetic subtitles at the bottom with active yellow highlight (#FFE600) matching current spoken words.
7. Self-Contained:
   - Use native inline SVG, HTML elements, and React inline styles. Do not import external non-existent libraries.
   - All animations must be derived from useCurrentFrame() and useVideoConfig() via spring() and interpolate().
   - Never use CSS transitions or setTimeout.
   - Always clamp interpolations: { extrapolateRight: "clamp", extrapolateLeft: "clamp" }.
8. OUTPUT:
   - Output ONLY the TypeScript React code wrapped in a markdown block: \`\`\`tsx ... \`\`\`. No conversational text.`;

  const userContent = customInstruction || `VOICEOVER TRANSCRIPT (${Math.ceil(duration)} seconds, ${Math.ceil(duration * 30)} frames):
"${transcript}"

SEGMENTED STORY TIMELINE:
${JSON.stringify(timelineSummary, null, 2)}

Write the complete VoxGeneratedVideo.tsx React code from scratch now!`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawContent = data.choices[0]?.message?.content;
  if (!rawContent) throw new Error("Empty response from OpenAI.");

  const match = rawContent.match(/```(?:tsx|typescript|jsx|javascript)?([\s\S]*?)```/);
  return match ? match[1].trim() : rawContent.trim();
}

async function run() {
  await prepareAudio();
  const { transcript, words, segments, duration } = await transcribeWithWhisper();

  const targetFile = path.join(rootDir, "src", "vox", "VoxGeneratedVideo.tsx");
  let generatedCode = await generateAutonomousVoxReact(transcript, words, segments, duration);

  fs.writeFileSync(targetFile, generatedCode, "utf-8");
  console.log(`💾 Brand new React component written to: src/vox/VoxGeneratedVideo.tsx`);

  // Verify TypeScript build
  console.log("🔍 Checking code with TypeScript compiler (tsc)...");
  try {
    execSync("npx tsc --noEmit", { cwd: rootDir, stdio: "pipe" });
    console.log("✅ TypeScript check PASSED with 0 errors!");
  } catch (tscErr) {
    const errorOutput = tscErr.stdout?.toString() || tscErr.stderr?.toString() || tscErr.message;
    console.warn(`⚠️ TypeScript found type errors:\n${errorOutput.slice(0, 400)}...`);
    console.log("🛠️ Invoking GPT-6.1 Sol self-healing loop to fix code...");

    const fixPrompt = `The TypeScript compiler found these errors in your VoxGeneratedVideo.tsx code:
${errorOutput}

Current code:
${generatedCode}

Return the COMPLETE, FIXED TypeScript code wrapped in \`\`\`tsx ... \`\`\` with 0 errors.`;

    generatedCode = await generateAutonomousVoxReact(transcript, words, segments, duration, fixPrompt);
    fs.writeFileSync(targetFile, generatedCode, "utf-8");
    console.log("💾 Fixed code saved. Verifying again...");
    try {
      execSync("npx tsc --noEmit", { cwd: rootDir, stdio: "pipe" });
      console.log("✅ Self-healing succeeded: TypeScript check PASSED!");
    } catch {
      console.warn("⚠️ Continuing with render...");
    }
  }

  // Render MP4
  const tempVideo = path.join(rootDir, "out", "vox-temp.mp4");
  const finalVideo = path.join(rootDir, "out", "vox-video.mp4");

  console.log("\n🎥 1. Rendering visual animation frames with Remotion...");
  const renderCmd = `npx remotion render src/index.ts VoxVideo "${tempVideo}"`;
  execSync(renderCmd, { stdio: "inherit", cwd: rootDir });

  console.log("\n🔊 2. Muxing original audio track directly into MP4 via FFmpeg...");
  const muxCmd = `npx remotion ffmpeg -y -i "${tempVideo}" -i "${targetAudioFile}" -c:v copy -c:a aac -b:a 192k -shortest "${finalVideo}"`;
  try {
    execSync(muxCmd, { stdio: "inherit", cwd: rootDir });
    if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
    console.log("\n🎉 Full Autonomous Vox Video with Crystal Clear Audio is Ready!");
    console.log(`📁 File location: ${finalVideo}`);
    console.log(`⏱️ Duration     : ${Math.ceil(duration)}s (${Math.ceil(duration * 30)} frames)`);
    console.log(`📝 Component    : src/vox/VoxGeneratedVideo.tsx\n`);
  } catch (muxErr) {
    console.warn("⚠️ FFmpeg mux warning, keeping temp video:", muxErr.message);
    if (fs.existsSync(tempVideo)) fs.renameSync(tempVideo, finalVideo);
  }
}

run();
