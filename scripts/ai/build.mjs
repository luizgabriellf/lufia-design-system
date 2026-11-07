/** Regenerates the AI-layer outputs under docs/ai. Run with `npm run build:ai-docs`. */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./build-manifest.mjs";
import { OUT, generate } from "./render.mjs";

const files = generate();
const specDir = path.join(ROOT, OUT, "components");
rmSync(specDir, { recursive: true, force: true });
mkdirSync(specDir, { recursive: true });
for (const [file, content] of files) writeFileSync(path.join(ROOT, file), content);
console.log(`ai-docs: wrote ${files.size} files (${readdirSync(specDir).length} component specs) to ${OUT}/`);
