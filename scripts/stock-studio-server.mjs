import { exec, execSync, spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. Load Environment Variables from .env
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

const PORT = parseInt(process.env.PORT || "3400", 10);
const apiKey = process.env.OPENAI_API_KEY;
const defaultModel = process.env.OPENAI_MODEL || "gpt-6.1-sol";
const fallbackModel = process.env.FALLBACK_MODEL || "gpt-4o";

// Default directories
const defaultOutputDir = path.join(rootDir, "out", "stock");
if (!fs.existsSync(defaultOutputDir)) {
  fs.mkdirSync(defaultOutputDir, { recursive: true });
}

const stockDir = path.join(rootDir, "src", "stock");
const generatedDir = path.join(stockDir, "generated");
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// Global Queue State
let queue = [];
let isWorkerRunning = false;
let shouldStop = false;
let currentProcessingId = null;
const sseClients = new Set();

// Helper: Broadcast to all SSE connections
function broadcastSSE(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

function broadcastLog(text, level = "info") {
  const timestamp = new Date().toLocaleTimeString("id-ID");
  console.log(`[${timestamp}] ${text}`);
  broadcastSSE("log", { timestamp, text, level });
}

// 2. Microstock System Prompt & Rules
function getStockSystemPrompt(width, height, durationFrames, durationSec) {
  const rulesPath = path.join(rootDir, "REMOTION_RULES.md");
  const rulesText = fs.existsSync(rulesPath)
    ? fs.readFileSync(rulesPath, "utf-8")
    : "Use spring() and interpolate(). Never use CSS transitions.";

  return `You are an elite Motion Graphics Programmer and React/Remotion Master Engineer specializing in high-selling commercial STOCK FOOTAGE for Adobe Stock and Shutterstock.
Your task is to write a COMPLETE, BEAUTIFUL, PRODUCTION-GRADE, 100% SELF-CONTAINED TypeScript React component (.tsx) for Remotion.

### REMOTION STRICT RULES:
${rulesText}

### CRITICAL MICROSTOCK SPECIFICATIONS (ADOBE STOCK & SHUTTERSTOCK):
1. EXPORT SIGNATURE:
   You MUST export EXACTLY:
   export const ActiveStockVideo: React.FC = () => { ... }

2. CANVAS & DURATION:
   Canvas dimensions: ${width} × ${height} (${width === 3840 ? "4K UHD" : "1080p Full HD"}).
   Video length: EXACTLY ${durationFrames} frames (${durationSec} seconds @ 30 FPS).
   useCurrentFrame() runs from 0 to ${durationFrames}.

3. 100% MATHEMATICALLY SEAMLESS LOOP (MANDATORY):
   Stock footage buyers require seamless loops that can repeat indefinitely on a timeline without stutter!
   - Every moving element MUST return EXACTLY to its starting state at frame ${durationFrames}.
   - ALWAYS use circular harmonic trigonometry:
     const loopAngle = (frame / ${durationFrames}) * Math.PI * 2;
     const harmonic1 = Math.sin(loopAngle);
     const harmonic2 = Math.cos(loopAngle);
   - Rotations: (frame / ${durationFrames}) * 360 * n (where n is an integer like 1 or 2).
   - Positions / Offsets: derive from Math.sin(loopAngle) or cyclical modulo.
   - Frame 0 MUST be visually identical to Frame ${durationFrames}.

4. ZERO AUDIO & ZERO WATERMARKS:
   - Microstock rules FORBID random audio. DO NOT import Audio or SFX.
   - FORBIDDEN: Any brand logos, real trademarks (Apple, Bitcoin, Tesla, Nike), watermarks, or language-specific narrative text.
   - Allowed text: Only generic universal data (e.g., numbers, "+14.8%", "01001", "SECURE", "STATUS: ACTIVE", "24.5°").

5. HIGH COMMERCIAL APPEAL AESTHETIC:
   - High visual richness, depth, and elegance.
   - Use dynamic SVG paths, gradient glows, glowing wireframe meshes, subtle particle fields, depth of field blur effects, or high-end fintech charts.
   - Modern palettes: Dark Luxury (#070A13 with gold/emerald accents), Cyberpunk (#0B0F19 with #14F195 / #00F0FF / #9945FF), or Clean Corporate Glassmorphism.

6. TECHNICAL CONSTRAINTS:
   - Inline React styles with SVG and HTML only. No external icon libraries or image URLs.
   - Only import from 'remotion': useCurrentFrame, useVideoConfig, spring, interpolate, Sequence, AbsoluteFill.
   - Always clamp interpolations: { extrapolateLeft: "clamp", extrapolateRight: "clamp" }.
   - Protect interpolate ranges: Math.max(start + 0.001, end).
   - Output ONLY the TypeScript React code wrapped in: \`\`\`tsx ... \`\`\`.`;
}

// 3. OpenAI Generation Call with reasoning_effort & Multi-Attempt Retries
async function callOpenAIForStock(prompt, width, height, durationFrames, durationSec, reasoningEffort = "medium", maxRetries = 4) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not defined in .env");
  }

  const systemPrompt = getStockSystemPrompt(width, height, durationFrames, durationSec);
  const userPrompt = `Generate a 100% seamless looping commercial stock video (.tsx) for Adobe Stock / Shutterstock based on this creative prompt:
"${prompt}"

Specs: ${width}x${height}, ${durationFrames} frames (${durationSec}s @ 30fps). Output ONLY \`\`\`tsx ... \`\`\`.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const isLastAttempt = attempt === maxRetries;
    const currentModel = isLastAttempt && defaultModel !== fallbackModel ? fallbackModel : defaultModel;
    if (isLastAttempt && defaultModel !== fallbackModel) {
      broadcastLog(`🔄 Mencoba model cadangan (${fallbackModel})...`, "warning");
    }

    try {
      const payload = {
        model: currentModel,
        messages,
      };
      if (reasoningEffort && currentModel !== fallbackModel) {
        payload.reasoning_effort = reasoningEffort;
      }

      broadcastLog(`🧠 [Percobaan ${attempt}/${maxRetries}] Memanggil OpenAI (${currentModel})${payload.reasoning_effort ? ` [reasoning: ${payload.reasoning_effort}]` : ""}...`);

      let response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(180_000),
      });

      // If reasoning_effort is rejected by model, retry without it
      if (!response.ok && response.status === 400) {
        const errText = await response.text();
        if (errText.includes("reasoning_effort")) {
          broadcastLog(`⚠️ Parameter reasoning_effort tidak didukung model, mencoba tanpa parameter...`, "warning");
          delete payload.reasoning_effort;
          response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(180_000),
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
      const rawContent = data.choices[0]?.message?.content || "";
      const match = rawContent.match(/```(?:tsx|typescript|jsx|javascript)?([\s\S]*?)```/);
      return match ? match[1].trim() : rawContent.trim();
    } catch (err) {
      const reason = err.cause?.message || err.cause?.code || err.message || "Network Error";
      broadcastLog(`⚠️ Percobaan ${attempt}/${maxRetries} terkendala (${reason})`, "warning");
      if (attempt === maxRetries) {
        throw new Error(`Gagal menghubungi OpenAI setelah ${maxRetries} percobaan: ${reason}`);
      }
      const waitMs = attempt * 3000;
      broadcastLog(`⏳ Menunggu ${waitMs / 1000} detik sebelum mencoba kembali...`);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
}

// 4. Targeted TypeScript Self-Healing
async function selfHealStockCode(code, errorOutput) {
  broadcastLog(`🛠️ Melakukan self-healing TypeScript compiler...`, "warning");
  try {
    const fixPrompt = `The TypeScript compiler reported these errors:
${errorOutput}

Current code:
${code}

Fix all errors and return the COMPLETE, FIXED TypeScript code wrapped in \`\`\`tsx ... \`\`\` with 0 errors.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: fallbackModel || "gpt-4o",
        messages: [
          { role: "system", content: "You are a Master TypeScript Remotion Engineer. Fix all type errors." },
          { role: "user", content: fixPrompt },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) return code;
    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content || "";
    const match = rawContent.match(/```(?:tsx|typescript|jsx|javascript)?([\s\S]*?)```/);
    return match ? match[1].trim() : code;
  } catch {
    return code;
  }
}

// Helper: Format Bytes to MB
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

// Helper: Sanitize Filename from prompt
function sanitizePromptToFilename(prompt, index) {
  const clean = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
  const num = (index + 1).toString().padStart(2, "0");
  return `stock_${num}_${clean || "loop"}.mp4`;
}

// 5. Queue Worker Orchestrator
async function processQueue() {
  if (isWorkerRunning) return;
  isWorkerRunning = true;
  shouldStop = false;

  broadcastLog("🚀 Antrean render dimulai!");
  broadcastSSE("queue_status", { isRunning: true });

  while (queue.length > 0 && !shouldStop) {
    const item = queue.find((q) => q.status === "pending");
    if (!item) break;

    currentProcessingId = item.id;
    item.status = "generating";
    item.progress = 10;
    broadcastSSE("item_updated", item);
    broadcastLog(`\n[${item.id}] Sedang memproses prompt: "${item.prompt}"`);

    const width = item.resolution === "4k" ? 3840 : 1920;
    const height = item.resolution === "4k" ? 2160 : 1080;
    const durationFrames = item.durationSec * 30;

    try {
      // Step A: Update dynamic metadata
      const metaPath = path.join(stockDir, "stock-meta.json");
      fs.writeFileSync(
        metaPath,
        JSON.stringify(
          {
            width,
            height,
            fps: 30,
            durationFrames,
            title: item.prompt,
          },
          null,
          2
        )
      );

      // Step B: AI Code Generation
      broadcastLog(`[${item.id}] Generate kode TSX (${item.reasoningEffort} reasoning, ${width}x${height}, ${durationFrames}f)...`);
      let code = await callOpenAIForStock(
        item.prompt,
        width,
        height,
        durationFrames,
        item.durationSec,
        item.reasoningEffort
      );

      const targetTsx = path.join(generatedDir, "ActiveStockVideo.tsx");
      fs.writeFileSync(targetTsx, code, "utf-8");

      item.status = "compiling";
      item.progress = 30;
      broadcastSSE("item_updated", item);

      // Step C: TypeScript Verification
      broadcastLog(`[${item.id}] Memverifikasi kode dengan TypeScript compiler (tsc)...`);
      try {
        execSync("npx tsc --noEmit", { cwd: rootDir, stdio: "pipe" });
        broadcastLog(`[${item.id}] ✅ TypeScript compiler lulus 100%!`);
      } catch (tscErr) {
        const errorOutput = tscErr.stdout?.toString() || tscErr.stderr?.toString() || tscErr.message;
        code = await selfHealStockCode(code, errorOutput);
        fs.writeFileSync(targetTsx, code, "utf-8");
        try {
          execSync("npx tsc --noEmit", { cwd: rootDir, stdio: "pipe" });
          broadcastLog(`[${item.id}] ✅ Self-healing TypeScript berhasil!`);
        } catch {
          broadcastLog(`[${item.id}] ⚠️ Tetap melanjutkan render...`, "warning");
        }
      }

      // Step D: Remotion Rendering
      item.status = "rendering";
      item.progress = 40;
      broadcastSSE("item_updated", item);

      const outDir = item.outputDir || defaultOutputDir;
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      const fileName = sanitizePromptToFilename(item.prompt, queue.indexOf(item));
      const outFilePath = path.join(outDir, fileName);

      broadcastLog(`[${item.id}] 🎥 Memulai render Remotion ke: ${outFilePath}`);

      await new Promise((resolve, reject) => {
        const renderProc = spawn(
          "npx",
          ["remotion", "render", "src/index.ts", "StockVideo", outFilePath, "--codec=h264"],
          { cwd: rootDir, env: process.env }
        );

        renderProc.stdout.on("data", (data) => {
          const str = data.toString();
          // Look for frame render pattern: Rendered 45/180 frames (25%)
          const matchPercent = str.match(/(\d+)%/);
          if (matchPercent) {
            const pct = parseInt(matchPercent[1], 10);
            item.progress = Math.min(99, 40 + Math.round(pct * 0.58));
            broadcastSSE("item_updated", item);
          }
        });

        renderProc.stderr.on("data", (data) => {
          // ignore or log non-fatal warnings
        });

        renderProc.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Render process exited with code ${code}`));
        });
      });

      // Step E: Finalize Completed Item
      const stats = fs.statSync(outFilePath);
      item.status = "completed";
      item.progress = 100;
      item.outputFile = outFilePath;
      item.fileName = fileName;
      item.fileSize = formatBytes(stats.size);
      item.finishedAt = new Date().toISOString();

      broadcastLog(`[${item.id}] 🎉 Sukses! Video selesai (${item.fileSize}): ${fileName}`, "success");
      broadcastSSE("item_updated", item);
    } catch (err) {
      broadcastLog(`[${item.id}] ❌ Error: ${err.message}`, "error");
      item.status = "failed";
      item.error = err.message;
      broadcastSSE("item_updated", item);
    }

    currentProcessingId = null;
  }

  isWorkerRunning = false;
  broadcastSSE("queue_status", { isRunning: false });
  broadcastLog("🏁 Semua antrean yang aktif telah selesai!");
}

// 6. Embedded Modern Dashboard UI (HTML / CSS / JS)
function getDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stock Footage Studio (Adobe Stock & Shutterstock)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090D16;
      --card: #111726;
      --card-border: #1E293B;
      --accent: #14F195;
      --accent-glow: rgba(20, 241, 149, 0.25);
      --purple: #9945FF;
      --cyan: #00F0FF;
      --danger: #EF4444;
      --text: #F8FAFC;
      --text-muted: #94A3B8;
      --radius: 14px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Header */
    header {
      background: rgba(17, 23, 38, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--card-border);
      padding: 16px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent), var(--cyan));
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      font-weight: 900;
      font-size: 20px;
      box-shadow: 0 0 20px var(--accent-glow);
    }
    .brand h1 {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .brand p {
      font-size: 12px;
      color: var(--text-muted);
    }
    .badges {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .badge {
      font-size: 11px;
      padding: 5px 11px;
      border-radius: 20px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-adobe {
      background: rgba(230, 57, 70, 0.15);
      color: #FF5A67;
      border: 1px solid rgba(230, 57, 70, 0.3);
    }
    .badge-shutter {
      background: rgba(255, 122, 0, 0.15);
      color: #FF8F26;
      border: 1px solid rgba(255, 122, 0, 0.3);
    }
    .badge-port {
      background: rgba(20, 241, 149, 0.15);
      color: var(--accent);
      border: 1px solid rgba(20, 241, 149, 0.3);
      font-family: 'JetBrains Mono', monospace;
    }

    /* Main Container */
    main {
      flex: 1;
      padding: 32px;
      max-width: 1600px;
      width: 100%;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 460px 1fr;
      gap: 28px;
    }

    /* Left Card: Input & Settings */
    .card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    label {
      font-size: 13px;
      font-weight: 600;
      color: #CBD5E1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .label-hint {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 400;
    }
    textarea, input, select {
      background: #090E1A;
      border: 1px solid var(--card-border);
      color: var(--text);
      font-family: inherit;
      font-size: 13px;
      padding: 12px 14px;
      border-radius: 10px;
      outline: none;
      transition: all 0.2s ease;
    }
    textarea:focus, input:focus, select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    textarea {
      resize: vertical;
      min-height: 140px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      line-height: 1.5;
    }
    .presets-btn {
      font-size: 11px;
      color: var(--cyan);
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 600;
      text-decoration: underline;
    }

    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* Primary Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), #00D284);
      color: #051A10;
      box-shadow: 0 4px 18px var(--accent-glow);
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 22px rgba(20, 241, 149, 0.4);
    }
    .btn-secondary {
      background: #1E293B;
      color: #F8FAFC;
      border: 1px solid #334155;
    }
    .btn-secondary:hover {
      background: #27354A;
    }
    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.25);
    }
    .btn-group {
      display: flex;
      gap: 10px;
    }

    /* Right Column: Queue & Preview */
    .right-col {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Queue Table / Cards */
    .queue-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .queue-stats {
      display: flex;
      gap: 14px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .stat-badge {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .stat-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .queue-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 480px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .queue-empty {
      padding: 48px;
      text-align: center;
      color: var(--text-muted);
      font-size: 14px;
      border: 2px dashed #1E293B;
      border-radius: 12px;
    }

    .job-card {
      background: #090E1A;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: all 0.2s ease;
    }
    .job-card.rendering {
      border-color: var(--accent);
      box-shadow: 0 0 16px rgba(20, 241, 149, 0.15);
    }
    .job-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .job-prompt {
      font-size: 13px;
      font-weight: 600;
      color: #F1F5F9;
      line-height: 1.4;
      flex: 1;
    }
    .job-badge {
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 700;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
      white-space: nowrap;
    }
    .status-pending { background: #1E293B; color: #94A3B8; }
    .status-generating { background: rgba(153, 69, 255, 0.2); color: #C084FC; border: 1px solid rgba(153, 69, 255, 0.4); }
    .status-compiling { background: rgba(0, 240, 255, 0.2); color: #67E8F9; border: 1px solid rgba(0, 240, 255, 0.4); }
    .status-rendering { background: rgba(20, 241, 149, 0.2); color: var(--accent); border: 1px solid rgba(20, 241, 149, 0.4); }
    .status-completed { background: rgba(34, 197, 94, 0.2); color: #4ADE80; border: 1px solid rgba(34, 197, 94, 0.4); }
    .status-failed { background: rgba(239, 68, 68, 0.2); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.4); }

    .progress-bar-wrap {
      width: 100%;
      height: 6px;
      background: #1E293B;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--cyan));
      width: 0%;
      transition: width 0.3s ease;
    }

    .job-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: var(--text-muted);
    }
    .job-tags {
      display: flex;
      gap: 6px;
    }
    .tag {
      background: #162032;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Video Preview Modal / Drawer */
    .preview-section {
      background: #090E1A;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      gap: 18px;
      align-items: center;
    }
    .preview-video {
      width: 220px;
      height: 124px;
      border-radius: 8px;
      background: #000;
      object-fit: cover;
    }
    .preview-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* Live Terminal Console */
    .terminal-card {
      background: #05080F;
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .terminal-title {
      font-size: 12px;
      font-weight: 700;
      color: #94A3B8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .terminal-logs {
      height: 140px;
      overflow-y: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      line-height: 1.6;
      color: #94A3B8;
      display: flex;
      flex-direction: column;
    }
    .log-line { display: flex; gap: 8px; }
    .log-time { color: #475569; }
    .log-info { color: #CBD5E1; }
    .log-warning { color: #FBBF24; }
    .log-error { color: #F87171; }
    .log-success { color: var(--accent); }
  </style>
</head>
<body>

  <!-- Header -->
  <header>
    <div class="brand">
      <div class="brand-icon">⚡</div>
      <div>
        <h1>Stock Footage Studio</h1>
        <p>Autonomous Seamless Loop Video Generator</p>
      </div>
    </div>
    <div class="badges">
      <span class="badge badge-adobe">Adobe Stock</span>
      <span class="badge badge-shutter">Shutterstock</span>
      <span class="badge badge-port">PORT: 3400</span>
    </div>
  </header>

  <main>
    <!-- Left Column: Settings & Bulk Input -->
    <div class="card">
      <div class="card-title">
        <span>📝 Batch Prompt Creator</span>
        <button class="presets-btn" onclick="loadSamplePrompts()">Load Contoh Prompt</button>
      </div>

      <div class="form-group">
        <label>
          Daftar Prompt (1 Baris = 1 Video)
          <span class="label-hint" id="promptCountHint">0 prompt</span>
        </label>
        <textarea id="bulkPrompts" placeholder="Contoh:&#10;Abstract glowing golden wave seamless loop&#10;Bullish crypto candlestick chart glowing green HUD&#10;Cyber security digital shield pulse network" oninput="updatePromptCount()"></textarea>
      </div>

      <div class="form-group">
        <label>
          Lokasi Simpan (Folder di Mac)
          <button class="presets-btn" onclick="openFinderFolder()">Buka di Finder</button>
        </label>
        <input type="text" id="outputFolder" value="${defaultOutputDir}">
      </div>

      <div class="row-2">
        <div class="form-group">
          <label>Model Mikir</label>
          <select id="reasoningEffort">
            <option value="medium" selected>Medium (Seimbang)</option>
            <option value="low">Low (Super Cepat)</option>
            <option value="high">High (Deep Logic)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Durasi (Microstock)</label>
          <select id="durationSec">
            <option value="6" selected>6 Detik (180 frames)</option>
            <option value="5">5 Detik (150 frames)</option>
          </select>
        </div>
      </div>

      <div class="row-2">
        <div class="form-group">
          <label>Resolusi</label>
          <select id="resolution">
            <option value="4k" selected>4K UHD (3840×2160)</option>
            <option value="1080p">1080p Full HD (1920×1080)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Audio</label>
          <input type="text" value="Muted / Silent (Wajib Stock)" disabled style="opacity: 0.6; cursor: not-allowed;">
        </div>
      </div>

      <div class="btn-group">
        <button class="btn btn-primary" style="flex: 1;" onclick="addBatchQueue(true)">
          ▶ Mulai Render Antrean
        </button>
        <button class="btn btn-secondary" onclick="addBatchQueue(false)">
          + Tambah Antrean Saja
        </button>
      </div>

      <div class="btn-group">
        <button class="btn btn-danger" style="flex: 1;" onclick="clearPendingQueue()">
          Bersihkan Antrean
        </button>
        <button class="btn btn-secondary" onclick="togglePauseQueue()" id="pauseBtn">
          Jeda Antrean
        </button>
      </div>
    </div>

    <!-- Right Column: Queue & Active Player -->
    <div class="right-col">
      <div class="card">
        <div class="queue-header">
          <div class="card-title">
            <span>📋 Antrean Produksi Video</span>
          </div>
          <div class="queue-stats">
            <span class="stat-badge"><span class="stat-dot" style="background: var(--accent);"></span> <span id="statCompleted">0 Selesai</span></span>
            <span class="stat-badge"><span class="stat-dot" style="background: #38BDF8;"></span> <span id="statPending">0 Menunggu</span></span>
          </div>
        </div>

        <div class="queue-list" id="queueList">
          <div class="queue-empty">Belum ada prompt dalam antrean. Masukkan prompt di sebelah kiri dan klik Mulai!</div>
        </div>
      </div>

      <!-- Preview Player for Latest Render -->
      <div class="preview-section" id="previewBox" style="display: none;">
        <video id="previewVideo" class="preview-video" controls loop autoplay muted></video>
        <div class="preview-details">
          <div style="font-weight: 700; font-size: 14px;" id="previewTitle">Video Selesai</div>
          <div style="font-size: 12px; color: var(--text-muted);" id="previewMeta">4K UHD • 6.0s • 14.2 MB</div>
          <div style="margin-top: 8px;">
            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px;" onclick="openFinderFolder()">
              📂 Buka di Folder Finder
            </button>
          </div>
        </div>
      </div>

      <!-- Terminal Logs -->
      <div class="terminal-card">
        <div class="terminal-title">
          <span>📟 Live Studio Logs</span>
        </div>
        <div class="terminal-logs" id="terminalLogs"></div>
      </div>
    </div>
  </main>

  <script>
    let queueData = [];
    let isRunning = false;

    // Load sample stock prompts
    function loadSamplePrompts() {
      const samples = [
        "Abstract flowing golden gradient wave with luminous dust particles seamless loop",
        "Bullish fintech cryptocurrency candlestick chart glowing neon green HUD grid",
        "Cyber security digital shield protection with scanning futuristic laser grid",
        "Luxury dark silk fabric wave with subtle metallic reflections 4k seamless loop",
        "Clean minimal technology network nodes connected by glowing geometric lines"
      ];
      document.getElementById('bulkPrompts').value = samples.join("\\n");
      updatePromptCount();
    }

    function updatePromptCount() {
      const text = document.getElementById('bulkPrompts').value.trim();
      const count = text ? text.split('\\n').filter(l => l.trim()).length : 0;
      document.getElementById('promptCountHint').innerText = count + " prompt";
    }

    // Append to live console
    function appendLog(timestamp, text, level = "info") {
      const logs = document.getElementById('terminalLogs');
      const div = document.createElement('div');
      div.className = 'log-line';
      div.innerHTML = \`<span class="log-time">[\${timestamp}]</span> <span class="log-\${level}">\${text}</span>\`;
      logs.appendChild(div);
      logs.scrollTop = logs.scrollHeight;
    }

    // Connect Server-Sent Events (SSE)
    function initSSE() {
      const evtSource = new EventSource('/api/events');
      evtSource.addEventListener('log', (e) => {
        const data = JSON.parse(e.data);
        appendLog(data.timestamp, data.text, data.level);
      });

      evtSource.addEventListener('queue_status', (e) => {
        const data = JSON.parse(e.data);
        isRunning = data.isRunning;
        document.getElementById('pauseBtn').innerText = isRunning ? 'Jeda Antrean' : 'Lanjutkan Antrean';
      });

      evtSource.addEventListener('item_updated', (e) => {
        const item = JSON.parse(e.data);
        const idx = queueData.findIndex(q => q.id === item.id);
        if (idx !== -1) {
          queueData[idx] = item;
        } else {
          queueData.push(item);
        }
        renderQueue();

        if (item.status === 'completed') {
          showPreview(item);
        }
      });
    }

    // Show Preview Video
    function showPreview(item) {
      const box = document.getElementById('previewBox');
      const video = document.getElementById('previewVideo');
      const title = document.getElementById('previewTitle');
      const meta = document.getElementById('previewMeta');

      box.style.display = 'flex';
      video.src = '/api/preview/' + encodeURIComponent(item.fileName);
      title.innerText = item.prompt;
      meta.innerText = (item.resolution === '4k' ? '4K UHD' : '1080p') + ' • ' + item.durationSec + 's • ' + item.fileSize;
    }

    // Render Queue UI
    function renderQueue() {
      const list = document.getElementById('queueList');
      if (queueData.length === 0) {
        list.innerHTML = '<div class="queue-empty">Belum ada prompt dalam antrean. Masukkan prompt di sebelah kiri dan klik Mulai!</div>';
        document.getElementById('statCompleted').innerText = '0 Selesai';
        document.getElementById('statPending').innerText = '0 Menunggu';
        return;
      }

      let completedCount = 0;
      let pendingCount = 0;

      list.innerHTML = queueData.map(q => {
        if (q.status === 'completed') completedCount++;
        if (q.status === 'pending' || q.status === 'generating' || q.status === 'compiling' || q.status === 'rendering') pendingCount++;

        const isRendering = q.status === 'generating' || q.status === 'compiling' || q.status === 'rendering';
        return \`
          <div class="job-card \${isRendering ? 'rendering' : ''}">
            <div class="job-top">
              <div class="job-prompt">\${q.prompt}</div>
              <span class="job-badge status-\${q.status}">\${q.status} \${q.progress > 0 && q.progress < 100 ? q.progress + '%' : ''}</span>
            </div>
            \${isRendering ? \`
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill" style="width: \${q.progress}%"></div>
              </div>
            \` : ''}
            <div class="job-meta">
              <div class="job-tags">
                <span class="tag">\${q.resolution.toUpperCase()}</span>
                <span class="tag">\${q.durationSec}s</span>
                <span class="tag">\${q.reasoningEffort} reasoning</span>
                \${q.fileSize ? \`<span class="tag" style="color: var(--accent);">\${q.fileSize}</span>\` : ''}
              </div>
              <div>\${q.fileName || ''}</div>
            </div>
          </div>
        \`;
      }).join('');

      document.getElementById('statCompleted').innerText = completedCount + ' Selesai';
      document.getElementById('statPending').innerText = pendingCount + ' Menunggu';
    }

    // Add Batch Queue
    async function addBatchQueue(autoStart = true) {
      const text = document.getElementById('bulkPrompts').value.trim();
      if (!text) {
        alert('Masukkan setidaknya satu prompt!');
        return;
      }

      const prompts = text.split('\\n').map(p => p.trim()).filter(Boolean);
      const outputDir = document.getElementById('outputFolder').value.trim();
      const reasoningEffort = document.getElementById('reasoningEffort').value;
      const durationSec = parseInt(document.getElementById('durationSec').value, 10);
      const resolution = document.getElementById('resolution').value;

      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts, outputDir, reasoningEffort, durationSec, resolution, autoStart })
      });

      const data = await res.json();
      queueData = data.queue;
      renderQueue();
      document.getElementById('bulkPrompts').value = '';
      updatePromptCount();
    }

    async function togglePauseQueue() {
      await fetch('/api/queue/toggle', { method: 'POST' });
    }

    async function clearPendingQueue() {
      const res = await fetch('/api/queue/clear', { method: 'POST' });
      const data = await res.json();
      queueData = data.queue;
      renderQueue();
    }

    async function openFinderFolder() {
      const folder = document.getElementById('outputFolder').value.trim();
      await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder })
      });
    }

    // Load initial status
    async function loadStatus() {
      const res = await fetch('/api/status');
      const data = await res.json();
      queueData = data.queue;
      isRunning = data.isRunning;
      renderQueue();
    }

    window.onload = () => {
      initSSE();
      loadStatus();
    };
  </script>
</body>
</html>`;
}

// 7. HTTP Server Setup
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // Serve Dashboard HTML
  if (req.method === "GET" && pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(getDashboardHtml());
    return;
  }

  // SSE Stream
  if (req.method === "GET" && pathname === "/api/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("\n");
    sseClients.add(res);

    req.on("close", () => {
      sseClients.delete(res);
    });
    return;
  }

  // API: Get Status & Queue
  if (req.method === "GET" && pathname === "/api/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ queue, isRunning: isWorkerRunning }));
    return;
  }

  // API: Add to Queue
  if (req.method === "POST" && pathname === "/api/queue") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { prompts, outputDir, reasoningEffort, durationSec, resolution, autoStart } = JSON.parse(body);
        const folder = outputDir || defaultOutputDir;

        const newItems = prompts.map((p, idx) => ({
          id: `stock_${Date.now()}_${idx + 1}`,
          prompt: p,
          outputDir: folder,
          reasoningEffort: reasoningEffort || "medium",
          durationSec: durationSec || 6,
          resolution: resolution || "4k",
          status: "pending",
          progress: 0,
          createdAt: new Date().toISOString(),
        }));

        queue.push(...newItems);
        broadcastLog(`📥 Ditambahkan ${newItems.length} video baru ke dalam antrean.`);

        if (autoStart) {
          processQueue();
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, queue }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: Toggle / Pause Queue
  if (req.method === "POST" && pathname === "/api/queue/toggle") {
    if (isWorkerRunning) {
      shouldStop = true;
      broadcastLog("⏸️ Antrean akan dijeda setelah video aktif saat ini selesai.");
    } else {
      processQueue();
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // API: Clear Pending Queue
  if (req.method === "POST" && pathname === "/api/queue/clear") {
    queue = queue.filter((q) => q.status === "completed" || q.id === currentProcessingId);
    broadcastLog("🧹 Antrean yang belum berjalan telah dibersihkan.");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, queue }));
    return;
  }

  // API: Open Folder in macOS Finder
  if (req.method === "POST" && pathname === "/api/open-folder") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { folder } = JSON.parse(body || "{}");
        const target = folder || defaultOutputDir;
        if (!fs.existsSync(target)) {
          fs.mkdirSync(target, { recursive: true });
        }
        exec(`open "${target}"`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: Video Preview Stream
  if (req.method === "GET" && pathname.startsWith("/api/preview/")) {
    const filename = decodeURIComponent(pathname.replace("/api/preview/", ""));
    // Search in queue or defaultOutputDir
    let filePath = path.join(defaultOutputDir, filename);
    const item = queue.find((q) => q.fileName === filename);
    if (item && item.outputFile && fs.existsSync(item.outputFile)) {
      filePath = item.outputFile;
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Video not found");
      return;
    }

    const stat = fs.statSync(filePath);
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": stat.size,
        "Content-Type": "video/mp4",
      });
      fs.createReadStream(filePath).pipe(res);
    }
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log("\n==================================================================");
  console.log("⚡  STOCK FOOTAGE STUDIO - WEB DASHBOARD BERJALAN!");
  console.log(`🌐  Buka di Browser: http://localhost:${PORT}`);
  console.log("📦  Target Microstock: Adobe Stock & Shutterstock");
  console.log("==================================================================\n");
});
