// Runs tsup with a larger V8 heap. The declaration (dts) build of the full
// component surface needs more than Node's default old-space limit, and this
// build also runs on `npm install` from a git tag (see prepare.mjs).
import { spawnSync } from "node:child_process";

const heap = "--max-old-space-size=4096";
const nodeOptions = [process.env.NODE_OPTIONS, heap].filter(Boolean).join(" ");
const result = spawnSync("npx", ["tsup", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
});
process.exit(result.status ?? 1);
