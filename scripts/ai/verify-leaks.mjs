/**
 * Leak gate (part of `npm run verify:ai-docs`, and run again in CI after the build). The repository is public, so no
 * tracked file and no built file may contain an identifier of a consuming app. The denylist is never stored here: it is
 * read from `$LUFIA_LEAK_TOKENS` (newline- or comma-separated) or from `~/.config/lufia/leak-tokens` (one per line). With
 * neither, the gate prints a notice and passes. A failure names the file, the line and the token's index in the list,
 * never the token.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MAX_JOIN = 4;
const MAX_BYTES = 5_000_000;

/** Lowercase, no diacritics, nothing but letters and digits: the form a token is compared in. */
export const compact = (text) =>
  String(text)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

/** The denylist as written (env var first, then the config file), or null when none is configured. */
export function loadTokens(env = process.env, home = os.homedir()) {
  const fromEnv = env.LUFIA_LEAK_TOKENS?.trim();
  const file = path.join(home, ".config/lufia/leak-tokens");
  const raw = fromEnv || (existsSync(file) ? readFileSync(file, "utf8") : "");
  const tokens = raw
    .split(/[\n,]/)
    .map((token) => token.trim())
    .filter(Boolean);
  return tokens.length > 0 ? tokens : null;
}

/** Words of a line: diacritics stripped, camelCase split at `[a-z0-9][A-Z]`, lowercased. */
const wordsOf = (line) =>
  line
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .match(/[a-z0-9]+/g) ?? [];

/**
 * Indexes (into `tokens`) of the tokens found in one line. A token matches whole words, or up to four adjacent words
 * joined, so `foo-bar`, `fooBar`, `foo bar` and `foobar` all match the token `foo-bar` and `foobar`.
 */
export function findHits(line, tokens) {
  const wanted = new Map();
  tokens.forEach((token, index) => {
    const key = compact(token);
    if (key) wanted.set(key, [...(wanted.get(key) ?? []), index]);
  });
  const hits = new Set();
  const words = wordsOf(line);
  for (let start = 0; start < words.length; start += 1) {
    for (let end = start + 1; end <= Math.min(words.length, start + MAX_JOIN); end += 1) {
      for (const index of wanted.get(words.slice(start, end).join("")) ?? []) hits.add(index);
    }
  }
  return [...hits].sort((a, b) => a - b);
}

/** Hits of a whole text as `{ line, token }` entries (`token` is an index into the list). */
export function scanText(text, tokens) {
  return text
    .split("\n")
    .flatMap((line, index) => findHits(line, tokens).map((token) => ({ line: index + 1, token })));
}

function walk(root, dir, out) {
  for (const name of readdirSync(path.join(root, dir))) {
    const rel = `${dir}/${name}`;
    if (statSync(path.join(root, rel)).isDirectory()) walk(root, rel, out);
    else out.push(rel);
  }
}

/** Every tracked file plus `dist/` when it exists, as repo-relative paths. */
export function filesToScan(root = ROOT) {
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 })
    .split("\0")
    .filter(Boolean);
  const files = tracked.filter((file) => existsSync(path.join(root, file)));
  if (existsSync(path.join(root, "dist"))) walk(root, "dist", files);
  return [...new Set(files)].sort();
}

/** Problems found in `files` (relative to `root`) for the given token list. Binary and oversized files are skipped. */
export function findLeaks(tokens, files = filesToScan(), root = ROOT) {
  const problems = [];
  for (const file of files) {
    const abs = path.join(root, file);
    if (statSync(abs).size > MAX_BYTES) continue;
    const buffer = readFileSync(abs);
    if (buffer.includes(0)) continue;
    for (const { line, token } of scanText(buffer.toString("utf8"), tokens))
      problems.push(`${file}:${line} matches denylist token #${token + 1}`);
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const tokens = loadTokens();
  if (!tokens) {
    console.log("verify:leaks skipped (no denylist configured)");
  } else {
    const files = filesToScan();
    const problems = findLeaks(tokens, files);
    if (problems.length > 0) {
      console.error(
        `verify:leaks failed:\n${problems.map((p) => `  - ${p}`).join("\n")}\nThe repository is public: remove the identifier (write "consuming apps").`,
      );
      process.exit(1);
    }
    console.log(`verify:leaks ok (${files.length} files, ${tokens.length} denylist tokens)`);
  }
}
