// Copies CSS Modules next to the compiled JS (the consumer's bundler processes them).
import { chmodSync, cpSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

let copied = 0;
for (const file of walk("src").filter((f) => f.endsWith(".css") && !f.startsWith("src/docs"))) {
  const target = join("dist", file.slice("src/".length));
  mkdirSync(dirname(target), { recursive: true });
  cpSync(file, target);
  copied += 1;
}
console.log(`postbuild: copied ${copied} CSS files`);

// Ship the AI docs and the plain-ESM lookup CLI (no build step: the same files the repo tests run against).
mkdirSync("dist/ai/components", { recursive: true });
let aiFiles = 0;
for (const file of ["components.json", "llms.txt", "llms-full.txt", "CONSUMING.md"]) {
  if (!existsSync(`docs/ai/${file}`)) continue;
  cpSync(`docs/ai/${file}`, `dist/ai/${file}`);
  aiFiles += 1;
}
for (const file of readdirSync("docs/ai/components").filter((f) => f.endsWith(".md"))) {
  cpSync(`docs/ai/components/${file}`, `dist/ai/components/${file}`);
  aiFiles += 1;
}
mkdirSync("dist/cli", { recursive: true });
cpSync("src/cli/lufia-ai.js", "dist/cli/lufia-ai.js");
cpSync("src/cli/lufia-ai", "dist/cli/lufia-ai", { recursive: true, filter: (f) => !/\.test\./.test(f) });
chmodSync("dist/cli/lufia-ai.js", 0o755);
console.log(`postbuild: copied ${aiFiles} AI docs and the lufia-ai CLI`);

// Native ESM needs explicit file extensions: rewrite extensionless relative specifiers.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

let rewritten = 0;
for (const file of walk("dist").filter((f) => /\.(js|d\.ts)$/.test(f))) {
  const source = readFileSync(file, "utf8");
  const next = source.replace(
    /(from\s+|import\s*\()(["'])(\.{1,2}\/[^"']+)\2/g,
    (match, lead, quote, spec) => {
      if (/\.(js|css|json)$/.test(spec)) return match;
      const base = resolve(dirname(file), spec);
      const ext = file.endsWith(".d.ts") ? ".d.ts" : ".js";
      if (existsSync(base + ext)) return `${lead}${quote}${spec}.js${quote}`;
      if (existsSync(join(base, `index${ext}`))) return `${lead}${quote}${spec}/index.js${quote}`;
      return match;
    },
  );
  if (next !== source) {
    writeFileSync(file, next);
    rewritten += 1;
  }
}
console.log(`postbuild: added extensions in ${rewritten} files`);
