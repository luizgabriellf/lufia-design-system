/**
 * Prints the SHA-256 of a lowercase token, for `scripts/ai/leak-tokens.json`:
 *
 *   node scripts/ai/hash-token.mjs <word>
 *
 * The leak gate stores hashes, never the words, so the denylist itself does not identify anything.
 */
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const hashToken = (token) => createHash("sha256").update(String(token).toLowerCase()).digest("hex");

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const word = process.argv[2];
  if (!word) {
    console.error("Usage: node scripts/ai/hash-token.mjs <word>");
    process.exitCode = 1;
  } else {
    console.log(hashToken(word));
  }
}
