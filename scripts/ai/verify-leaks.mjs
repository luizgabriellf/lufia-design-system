/**
 * Leak gate (part of `npm run verify:ai-docs`). The repository is public, so no generated or shipped file may contain an
 * identifier from the denylist in `scripts/ai/leak-tokens.json`. The denylist holds only SHA-256 hashes of lowercase
 * tokens: the scanned text is split into words and every word (and every run of up to four hyphen-joined words) is
 * hashed and compared. A failure names the file, the line and a hash prefix, never the word.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { hashToken } from "./hash-token.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TOKENS_FILE = "scripts/ai/leak-tokens.json";
const TEXT_FILE = /\.(md|mdx|txt|json|tsx?|mjs|cjs|js|css|ya?ml|mdc)$/;
const SKIP_DIR = /^(node_modules|\.git|\.next|coverage)$/;
const MAX_JOIN = 4;

export function loadDenylist() {
  const parsed = JSON.parse(readFileSync(path.join(ROOT, TOKENS_FILE), "utf8"));
  return new Set(parsed.hashes);
}

/** Hashes found in one line of text, as a map of hash to the position of its first occurrence. */
export function findHits(line, denylist) {
  const hits = new Set();
  for (const run of line.toLowerCase().match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? []) {
    const parts = run.split("-");
    for (let start = 0; start < parts.length; start += 1) {
      for (let end = start + 1; end <= Math.min(parts.length, start + MAX_JOIN); end += 1) {
        const hash = hashToken(parts.slice(start, end).join("-"));
        if (denylist.has(hash)) hits.add(hash);
      }
    }
  }
  return [...hits];
}

/** Hits of a whole text as `{ line, hash }` entries. */
export function scanText(text, denylist) {
  return text
    .split("\n")
    .flatMap((line, index) => findHits(line, denylist).map((hash) => ({ line: index + 1, hash })));
}

function walk(dir, out) {
  const abs = path.join(ROOT, dir);
  if (!existsSync(abs)) return;
  if (!statSync(abs).isDirectory()) {
    out.push(dir);
    return;
  }
  for (const name of readdirSync(abs)) {
    if (SKIP_DIR.test(name)) continue;
    const rel = `${dir}/${name}`;
    if (statSync(path.join(ROOT, rel)).isDirectory()) walk(rel, out);
    else if (TEXT_FILE.test(name)) out.push(rel);
  }
}

/** Generated and shipped files, plus the stories and docs pages that feed them. */
export function filesToScan() {
  const files = [];
  for (const entry of [
    "docs/ai",
    "docs/adr",
    "dist",
    "README.md",
    "CONTRIBUTING.md",
    "AGENTS.md",
    "CHANGELOG.md",
    ".changeset",
  ])
    walk(entry, files);
  for (const name of existsSync(path.join(ROOT, "docs")) ? readdirSync(path.join(ROOT, "docs")) : [])
    if (name.endsWith(".md")) files.push(`docs/${name}`);
  const stories = [];
  walk("src", stories);
  files.push(...stories.filter((file) => /\.(stories\.tsx|mdx)$/.test(file)));
  return [...new Set(files)].sort();
}

export function findLeaks() {
  const denylist = loadDenylist();
  const problems = [];
  for (const file of filesToScan()) {
    for (const { line, hash } of scanText(readFileSync(path.join(ROOT, file), "utf8"), denylist))
      problems.push(`${file}:${line} contains a denylisted token (sha256 ${hash.slice(0, 12)}...)`);
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const problems = findLeaks();
  if (problems.length > 0) {
    console.error(
      `verify:leaks failed:\n${problems.map((p) => `  - ${p}`).join("\n")}\nThe repository is public: remove the identifier (write "consuming apps").`,
    );
    process.exit(1);
  }
  console.log(`verify:leaks ok (${filesToScan().length} files, ${loadDenylist().size} denylisted hashes)`);
}
