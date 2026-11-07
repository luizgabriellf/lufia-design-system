/**
 * Leak gate (part of `npm run verify:ai-docs`, and run again in CI after the build). The repository is public, so no
 * tracked file and no built file may contain an identifier of a consuming app. The denylist is never stored here: it is
 * read from `$LUFIA_LEAK_TOKENS` (newline- or comma-separated) or from `~/.config/lufia/leak-tokens` (one per line). With
 * neither, the gate prints a notice (a workflow warning in CI) and passes. A failure names the file, the line and the token's index in the list,
 * never the token.
 */
import { execFileSync } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync, readSync, readdirSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MAX_JOIN = 4;
const CHUNK_BYTES = 1 << 20;
/** Files that are not text. Everything else is scanned, whatever bytes it holds. */
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|pdf|zip|gz|mp4|webm)$/i;

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

/** Words of a line: diacritics stripped, split at camelCase (`aB`, `ABc`) and letter/digit boundaries, lowercased. */
const wordsOf = (line) =>
  line
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])([0-9])/g, "$1 $2")
    .replace(/([0-9])([A-Za-z])/g, "$1 $2")
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

/** Scans text that may be large, a chunk of whole lines at a time, so line numbers stay right. */
function scanFile(abs, tokens) {
  const hits = [];
  const fd = openSync(abs, "r");
  try {
    const buffer = Buffer.alloc(CHUNK_BYTES);
    let carry = Buffer.alloc(0);
    let line = 0;
    const flush = (text) => {
      for (const hit of scanText(text, tokens)) hits.push({ line: line + hit.line, token: hit.token });
      line += text.split("\n").length - 1;
    };
    for (;;) {
      const read = readSync(fd, buffer, 0, CHUNK_BYTES, null);
      if (read === 0) break;
      const joined = Buffer.concat([carry, buffer.subarray(0, read)]);
      const cut = joined.lastIndexOf(10) + 1;
      carry = Buffer.from(joined.subarray(cut));
      if (cut > 0) flush(joined.subarray(0, cut).toString("utf8").replaceAll("\0", ""));
    }
    if (carry.length > 0) flush(carry.toString("utf8").replaceAll("\0", ""));
  } finally {
    closeSync(fd);
  }
  return hits;
}

/**
 * Problems found in `files` (relative to `root`) for the given token list: the path itself, then the content. Only files
 * with a known binary extension are skipped; `skipped` counts them.
 */
export function findLeaks(tokens, files = filesToScan(), root = ROOT) {
  const problems = [];
  let skipped = 0;
  for (const file of files) {
    if (scanText(file, tokens).length > 0) {
      for (const { token } of scanText(file, tokens))
        problems.push(`${file} path matches denylist token #${token + 1}`);
    }
    if (BINARY.test(file)) {
      skipped += 1;
      continue;
    }
    for (const { line, token } of scanFile(path.join(root, file), tokens))
      problems.push(`${file}:${line} matches denylist token #${token + 1}`);
  }
  return { problems, skipped };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const tokens = loadTokens();
  if (!tokens) {
    // In CI a silent skip hides a missing secret, so surface it as a workflow warning.
    console.log(
      `${process.env.GITHUB_ACTIONS ? "::warning::" : ""}verify:leaks skipped (no denylist configured)`,
    );
  } else {
    const files = filesToScan();
    const { problems, skipped } = findLeaks(tokens, files);
    if (problems.length > 0) {
      console.error(
        `verify:leaks failed:\n${problems.map((p) => `  - ${p}`).join("\n")}\nThe repository is public: remove the identifier (write "consuming apps").`,
      );
      process.exit(1);
    }
    console.log(
      `verify:leaks ok (${files.length} files, ${skipped} binary skipped, ${tokens.length} denylist tokens)`,
    );
  }
}
