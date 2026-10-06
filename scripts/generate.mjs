import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env manually if not already present in process.env
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

// Parse CLI arguments
const rawArgs = process.argv.slice(2);
let isDryRun = rawArgs.includes("--dry-run");
let skipRender = rawArgs.includes("--no-render");
let requestedModel = process.env.OPENAI_MODEL || "gpt-6.1-sol";
let fallbackModel = process.env.FALLBACK_MODEL || "gpt-4o";

const promptWords = rawArgs.filter((arg) => !arg.startsWith("--"));
const userPrompt =
  promptWords.join(" ").trim() ||
  "Peluncuran Autonomous AI Agent di Solana dengan kecepatan tinggi dan biaya murah";

console.log("\n=======================================================");
console.log("🎬  REMOTION AUTOMATED VIDEO GENERATOR (POWERED BY GPT-6.1)");
console.log("=======================================================\n");
console.log(`📌 Topic Prompt : "${userPrompt}"`);
console.log(`🤖 Target Model : ${requestedModel}`);
console.log(`⚡ Dry-Run Mode : ${isDryRun ? "Active" : "Inactive"}\n`);

const JSON_SCHEMA_EXAMPLE = {
  badge: "SOLANA SVM × GPT-6.1 SOL",
  theme: {
    primaryColor: "#14F195",
    secondaryColor: "#9945FF",
    accentColor: "#00F0FF",
  },
  scene1: {
    title: "REVOLUTIONARY AI AGENTS ON SOLANA",
    highlightWords: ["REVOLUTIONARY", "AI", "SOLANA"],
    subtitle: "Empowering next-generation autonomous workflows at warp speed.",
  },
  scene2: {
    sectionTitle: "BUILT FOR AUTONOMOUS SCALE",
    highlightWords: ["AUTONOMOUS", "SCALE"],
    features: [
      {
        title: "Sub-Second Finality",
        desc: "Instant confirmations powered by the 400ms block pipeline.",
        icon: "⚡",
        color: "#14F195",
      },
      {
        title: "Parallel SVM Execution",
        desc: "Concurrent multi-threaded smart contracts for limitless throughput.",
        icon: "🧠",
        color: "#00F0FF",
      },
      {
        title: "Micro-Cent Transaction Fees",
        desc: "Less than $0.0003 per execution enables high-frequency agent actions.",
        icon: "💎",
        color: "#9945FF",
      },
    ],
  },
  scene3: {
    sectionTitle: "PROVEN ON-CHAIN PERFORMANCE",
    highlightWords: ["PROVEN", "PERFORMANCE"],
    metrics: [
      {
        label: "Peak Throughput",
        targetValue: 65000,
        suffix: " TPS",
        subtext: "Massive scale for global high-frequency trading and swaps.",
        accentColor: "#14F195",
      },
      {
        label: "Avg Gas Cost",
        targetValue: 0.00025,
        prefix: "$",
        decimals: 5,
        subtext: "Fractional-cent fee frictionless micro-transactions.",
        accentColor: "#00F0FF",
      },
      {
        label: "Inference Efficiency",
        targetValue: 80,
        suffix: "% LESS",
        subtext: "Cost reduction with GPT-6.1 Sol agentic reasoning.",
        accentColor: "#9945FF",
      },
    ],
  },
  scene4: {
    badge: "START BUILDING TODAY",
    headline: "THE FUTURE OF DECENTRALIZED AI IS HERE",
    highlightWords: ["FUTURE", "DECENTRALIZED", "AI"],
    ctaText: "Launch with Remotion × Solana",
    url: "solana.com/ai • deterministic programmatic video",
  },
};

async function callOpenAi(modelToUse) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes("your_openai_api_key")) {
    throw new Error(
      "OPENAI_API_KEY is missing or invalid in .env. Please check your .env file."
    );
  }

  const systemPrompt = `You are a world-class Motion Graphics Director and Remotion Engineer.
Your task is to design a high-converting, cinematic 10-second tech video storyboard based on the user's prompt.
Follow these kinetic motion rules:
1. Title must be punchy (5 to 8 words maximum). Use UPPERCASE for titles.
2. 'highlightWords' must contain 2-3 words that exist verbatim in the title.
3. Feature list must contain EXACTLY 3 items with distinct icons/emojis and colors.
4. Metrics list must contain EXACTLY 3 quantitative metrics with realistic numerical targetValue.
5. Theme must use high-contrast cyber/fintech colors (like Solana Green #14F195, Purple #9945FF, Cyber Cyan #00F0FF).
Output MUST be strictly valid JSON matching this schema:
${JSON.stringify(JSON_SCHEMA_EXAMPLE, null, 2)}`;

  console.log(`📡 Sending request to OpenAI API (${modelToUse})...`);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelToUse,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a video storyboard for: ${userPrompt}` },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawContent = data.choices[0]?.message?.content;
  if (!rawContent) {
    throw new Error("Empty response from OpenAI API.");
  }

  return JSON.parse(rawContent);
}

async function run() {
  let videoData = null;

  if (isDryRun) {
    console.log("🧪 Using Mock / Dry-Run Storyboard data...");
    videoData = JSON_SCHEMA_EXAMPLE;
  } else {
    try {
      videoData = await callOpenAi(requestedModel);
      console.log(`✅ Storyboard successfully generated with ${requestedModel}!`);
    } catch (err) {
      console.warn(`⚠️ Warning: Failed with model ${requestedModel}. Reason: ${err.message}`);
      if (fallbackModel && requestedModel !== fallbackModel) {
        console.log(`🔄 Attempting fallback to ${fallbackModel}...`);
        try {
          videoData = await callOpenAi(fallbackModel);
          console.log(`✅ Storyboard generated with fallback model ${fallbackModel}!`);
        } catch (fallbackErr) {
          console.error(`❌ Fallback failed: ${fallbackErr.message}`);
          console.log("💡 Falling back to pre-configured high-production storyboard.");
          videoData = JSON_SCHEMA_EXAMPLE;
        }
      } else {
        console.log("💡 Falling back to pre-configured high-production storyboard.");
        videoData = JSON_SCHEMA_EXAMPLE;
      }
    }
  }

  // Save generated props to src/dynamic-props.json
  const propsPath = path.join(rootDir, "src", "dynamic-props.json");
  fs.writeFileSync(propsPath, JSON.stringify(videoData, null, 2), "utf-8");
  console.log(`💾 Storyboard data saved to: ${propsPath}`);

  // Display summary
  console.log("\n📋 Generated Video Overview:");
  console.log(`   - Headline: "${videoData.scene1.title}"`);
  console.log(`   - Highlights: ${JSON.stringify(videoData.scene1.highlightWords)}`);
  console.log(`   - Features: ${videoData.scene2.features.map((f) => f.title).join(", ")}`);
  console.log(
    `   - Metrics: ${videoData.scene3.metrics
      .map((m) => `${m.label}: ${m.prefix || ""}${m.targetValue}${m.suffix || ""}`)
      .join(" | ")}`
  );

  if (skipRender) {
    console.log("\n⏭️  Skipping MP4 render (--no-render specified).");
    console.log("   Run 'npm run start' to preview in Remotion Studio!");
    return;
  }

  // Trigger Remotion Render
  console.log("\n🎥 Starting Remotion render to MP4...");
  const outPath = path.join(rootDir, "out", "generated-video.mp4");
  const renderCmd = `npx remotion render src/index.ts AutoGpt6Video "${outPath}"`;

  try {
    execSync(renderCmd, { stdio: "inherit", cwd: rootDir });
    console.log("\n🎉 Video successfully rendered!");
    console.log(`📁 File location: ${outPath}\n`);
  } catch (renderErr) {
    console.error("❌ Render error:", renderErr.message);
    process.exit(1);
  }
}

run();
