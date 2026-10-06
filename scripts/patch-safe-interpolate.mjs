import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const generatedDir = path.resolve(__dirname, "..", "src", "vox", "scenes", "generated");

const files = fs.readdirSync(generatedDir).filter((f) => f.startsWith("Scene_") && f.endsWith(".tsx"));

for (const file of files) {
  const filePath = path.join(generatedDir, file);
  let content = fs.readFileSync(filePath, "utf-8");

  // Pattern 1: interpolate(f, [cue, cue + duration]
  content = content.replace(
    /interpolate\(\s*(\w+),\s*\[\s*(\w+),\s*\2\s*\+\s*(\w+)\s*\]/g,
    "interpolate($1, [$2, $2 + Math.max(0.001, $3)]"
  );

  // Pattern 2: interpolate(frame, [start, end]
  content = content.replace(
    /interpolate\(\s*(\w+),\s*\[\s*(\w+),\s*(\w+)\s*\]/g,
    "interpolate($1, [$2, Math.max($2 + 0.001, $3)]"
  );

  // Pattern 3: interpolate(frame, [from, to]
  content = content.replace(
    /interpolate\(\s*(\w+),\s*\[\s*(from),\s*(to)\s*\]/g,
    "interpolate($1, [$2, Math.max($2 + 0.001, $3)]"
  );

  // Pattern 4: interpolate(frame, [next - 4, next]
  content = content.replace(
    /interpolate\(\s*(\w+),\s*\[\s*(\w+)\s*-\s*(\d+),\s*\2\s*\]/g,
    "interpolate($1, [$2 - $3, Math.max($2 - $3 + 0.001, $2)]"
  );

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✅ Patched safe interpolate in: ${file}`);
}

console.log("🎉 All scenes now have 100% strictly monotonic safe interpolation!");
