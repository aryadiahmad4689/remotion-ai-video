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

const rawArgs = process.argv.slice(2);
let isDryRun = rawArgs.includes("--dry-run");
let skipRender = rawArgs.includes("--no-render");
let requestedModel = process.env.OPENAI_MODEL || "gpt-6.1-sol";
let fallbackModel = process.env.FALLBACK_MODEL || "gpt-4o";

const promptWords = rawArgs.filter((arg) => !arg.startsWith("--"));
const userPrompt =
  promptWords.join(" ").trim() ||
  "Video animasi trading chart candlestick naik-turun dengan visual radar, live ticker orderbook, dan glowing neon cyber theme";

console.log("\n==================================================================");
console.log("⚡  AUTONOMOUS REACT CODE GENERATOR (POWERED BY GPT-6.1 SOL)  ⚡");
console.log("==================================================================\n");
console.log(`📌 Creative Prompt : "${userPrompt}"`);
console.log(`🤖 Generator Model : ${requestedModel}\n`);

// Read guidelines
const rulesPath = path.join(rootDir, "REMOTION_RULES.md");
const rulesText = fs.existsSync(rulesPath)
  ? fs.readFileSync(rulesPath, "utf-8")
  : "Use spring() and interpolate(). Never use CSS transitions.";

async function requestReactCode(modelToUse, customInstruction = "") {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes("your_openai_api_key")) {
    throw new Error("OPENAI_API_KEY is missing in .env.");
  }

  const systemPrompt = `You are an elite Motion Graphics Programmer and React/Remotion Master Engineer (functioning identically to Claude Code in the Remotion AI workflow).
You write COMPLETE, BEAUTIFUL, PRODUCTION-GRADE, 100% SELF-CONTAINED TypeScript React code (.tsx) for Remotion.

### REMOTION STRICT RULES:
${rulesText}

### TECHNICAL CONSTRAINTS:
1. You MUST export the main component named exactly:
   export const GeneratedVideo: React.FC = () => { ... }
2. Video specs: 1920x1080 resolution, 30 FPS, total duration is 300 frames (10 seconds).
3. EVERYTHING is animated with Remotion:
   - Import from 'remotion': useCurrentFrame, useVideoConfig, spring, interpolate, Sequence, AbsoluteFill.
   - Derive all animations, transformations, charts, scales, opacities, and movements from useCurrentFrame() and useVideoConfig().
   - Never use CSS transitions or setTimeout/setInterval.
   - Always clamp interpolations: { extrapolateRight: "clamp", extrapolateLeft: "clamp" }.
4. DESIGN UNIQUENESS:
   - Do NOT just create standard slide cards. Build CUSTOM interactive visual elements matching the user's prompt (e.g., animated SVG charts, candlestick bars, glowing neon radar, simulated terminal logs, particle meshes, kinetic wave lines, custom cyber badges).
   - Use high-contrast modern dark mode with Solana/Cyberpunk accents (#07090E, #14F195 green, #9945FF purple, #00F0FF cyan).
5. Self-Contained:
   - Do not import external non-existent assets or third-party component libraries. Use native inline SVG, HTML elements, and React styling.
6. OUTPUT FORMAT:
   - Output ONLY the TypeScript React code wrapped in a markdown code block (\`\`\`tsx ... \`\`\`).
   - Do not include conversational filler before or after the code block.`;

  console.log(`🧠 GPT-6.1 Sol is designing and writing the React components...`);

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: customInstruction || `Generate a complete Remotion video component (.tsx) for this creative prompt: "${userPrompt}".`,
    },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelToUse,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawContent = data.choices[0]?.message?.content;
  if (!rawContent) {
    throw new Error("Empty response from OpenAI.");
  }

  // Extract ```tsx ... ``` or ```typescript ... ``` block
  const match = rawContent.match(/```(?:tsx|typescript|jsx|javascript)?([\s\S]*?)```/);
  const code = match ? match[1].trim() : rawContent.trim();
  return code;
}

async function run() {
  const targetFile = path.join(rootDir, "src", "generated", "GeneratedVideo.tsx");
  let generatedCode = "";

  try {
    generatedCode = await requestReactCode(requestedModel);
  } catch (err) {
    console.warn(`⚠️ Failed with ${requestedModel}: ${err.message}`);
    if (fallbackModel && requestedModel !== fallbackModel) {
      console.log(`🔄 Retrying with fallback model ${fallbackModel}...`);
      generatedCode = await requestReactCode(fallbackModel);
    } else {
      throw err;
    }
  }

  // Save generated TSX
  fs.writeFileSync(targetFile, generatedCode, "utf-8");
  console.log(`\n💾 React code successfully written to: src/generated/GeneratedVideo.tsx`);

  // Verify TypeScript build
  console.log("🔍 Checking code with TypeScript compiler (tsc)...");
  try {
    execSync("npx tsc --noEmit", { cwd: rootDir, stdio: "pipe" });
    console.log("✅ TypeScript check PASSED with 0 errors!");
  } catch (tscErr) {
    const errorOutput = tscErr.stdout?.toString() || tscErr.stderr?.toString() || tscErr.message;
    console.warn(`⚠️ TypeScript found type errors:\n${errorOutput.slice(0, 400)}...`);
    console.log("🛠️ Invoking GPT-6.1 Sol self-healing loop to fix code...");

    const fixPrompt = `The TypeScript compiler found these errors in the code you generated:
${errorOutput}

Here is the current code:
${generatedCode}

Please return the COMPLETE, FIXED TypeScript code wrapped in \`\`\`tsx ... \`\`\` resolving all type errors.`;

    const fixedCode = await requestReactCode(requestedModel, fixPrompt);
    fs.writeFileSync(targetFile, fixedCode, "utf-8");
    console.log("💾 Fixed code saved. Verifying again...");
    try {
      execSync("npx tsc --noEmit", { cwd: rootDir, stdio: "pipe" });
      console.log("✅ Self-healing succeeded: TypeScript check PASSED!");
    } catch {
      console.warn("⚠️ Continuing to render anyway (Remotion bundler may tolerate minor lint errors)...");
    }
  }

  if (skipRender) {
    console.log("\n⏭️ Skipping render (--no-render). Run 'npm run start' to preview.");
    return;
  }

  // Render MP4
  const outPath = path.join(rootDir, "out", "autonomous-video.mp4");
  console.log("\n🎥 Rendering autonomous video to MP4...");
  const renderCmd = `npx remotion render src/index.ts AutonomousVideo "${outPath}"`;

  try {
    execSync(renderCmd, { stdio: "inherit", cwd: rootDir });
    console.log("\n🎉 Full Autonomous Video Successfully Created!");
    console.log(`📁 Video file : ${outPath}`);
    console.log(`📝 Code file  : src/generated/GeneratedVideo.tsx\n`);
  } catch (renderErr) {
    console.error("❌ Render error:", renderErr.message);
    process.exit(1);
  }
}

run();
