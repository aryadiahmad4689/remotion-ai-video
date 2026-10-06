import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("🔍 Testing still render on every scene to catch checkValidInputRange...\n");

const scenes = [
  { id: 1, name: "Scene_01", frame: 100 },
  { id: 2, name: "Scene_02", frame: 1600 },
  { id: 3, name: "Scene_03", frame: 3200 },
  { id: 4, name: "Scene_04", frame: 4800 },
  { id: 5, name: "Scene_05", frame: 6300 },
  { id: 6, name: "Scene_06", frame: 7900 },
  { id: 7, name: "Scene_07", frame: 9400 },
  { id: 8, name: "Scene_08", frame: 11000 },
  { id: 9, name: "Scene_09", frame: 12500 },
  { id: 10, name: "Scene_10", frame: 14100 },
  { id: 11, name: "Scene_11", frame: 15600 },
];

for (const s of scenes) {
  try {
    process.stdout.write(`Testing Scene ${s.id} (Frame ${s.frame})... `);
    execSync(`npx remotion still src/index.ts LongFormVideo out/test-s${s.id}.png --frame=${s.frame}`, {
      cwd: rootDir,
      stdio: "pipe",
    });
    console.log("✅ OK");
  } catch (err) {
    console.log("❌ FAILED");
    const out = err.stdout?.toString() || err.stderr?.toString() || err.message;
    console.error(`\nError in Scene ${s.id}:\n${out}\n`);
  }
}
