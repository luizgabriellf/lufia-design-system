/**
 * Copies the AI-layer files into storybook-static so GitHub Pages serves them: llms.txt, llms-full.txt,
 * agent-index.md and components.json at the site root, the specs and the consuming guide under /ai/. Runs after `storybook build`.
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { AGENT_INDEX_FILE } from "./agent-index.mjs";
import { ROOT } from "./build-manifest.mjs";
import { OUT } from "./render.mjs";

const site = path.join(ROOT, "storybook-static");
if (!existsSync(site)) throw new Error("storybook-static is missing; run `storybook build` first.");
for (const file of ["llms.txt", "llms-full.txt", AGENT_INDEX_FILE, "components.json"])
  cpSync(path.join(ROOT, OUT, file), path.join(site, file));
mkdirSync(path.join(site, "ai"), { recursive: true });
cpSync(path.join(ROOT, OUT, "CONSUMING.md"), path.join(site, "ai", "CONSUMING.md"));
cpSync(path.join(ROOT, OUT, "components"), path.join(site, "ai", "components"), { recursive: true });
console.log(
  "ai-docs: published llms.txt, llms-full.txt, agent-index.md, components.json and /ai/ into storybook-static",
);
