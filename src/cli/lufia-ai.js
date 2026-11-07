#!/usr/bin/env node
/**
 * `lufia-ai`: look up the docs of the installed @lufia/design-system version, offline.
 * Reads `dist/ai/components.json` next to this file, so `npx lufia-ai` always matches the installed version.
 */
import { readFileSync } from "node:fs";
import { execute, loadManifest } from "./lufia-ai/core.js";
import { serve } from "./lufia-ai/mcp.js";

const manifestPath = new URL("../ai/components.json", import.meta.url);
const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

const usage = `lufia-ai ${pkg.version}: docs of the installed ${pkg.name}

Usage:
  lufia-ai search "<task or component>" [--json] [--limit 8]
  lufia-ai list [--json]
  lufia-ai show <ComponentName> [--json]
  lufia-ai version
  lufia-ai mcp            Start a local stdio MCP server (search_components, get_component, list_components)

Results come from the manifest shipped with this version (dist/ai/components.json).
Do not invent props or import paths that are absent from it.`;

try {
  const [command] = process.argv.slice(2);
  if (command === "version" || command === "--version" || command === "-v") {
    console.log(pkg.version);
  } else if (command === "mcp") {
    serve(loadManifest(manifestPath), { name: "lufia-ai", version: pkg.version });
  } else {
    console.log(execute(process.argv.slice(2), { manifestPath, usage }));
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
