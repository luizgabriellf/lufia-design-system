/**
 * Targeted, read-only discovery over the committed Lufia AI manifest.
 * Prefer this to loading the entire components.json into an agent's context.
 * The logic lives in src/cli/lufia-ai/core.js, shared with the shipped `lufia-ai` CLI; this file only points it at
 * docs/ai/components.json.
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as core from "../../src/cli/lufia-ai/core.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MANIFEST_PATH = path.join(ROOT, "docs/ai/components.json");

export const { inspectComponent, listComponents, searchComponents } = core;
export const loadManifest = () => core.loadManifest(MANIFEST_PATH);

const usage = `Usage:
  npm run ai:list -- [--json]
  npm run ai:search -- "<task or component>" [--json] [--limit 8]
  npm run ai:show -- <ComponentName> [--json]

All results are generated from docs/ai/components.json.
Do not invent props or import paths that are absent from this manifest.
Use Storybook to verify behavior, and typecheck the consuming application.`;

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    console.log(core.execute(process.argv.slice(2), { manifestPath: MANIFEST_PATH, usage }));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
