/**
 * Drift gate for the AI layer (`npm run verify:ai-docs`). Fails when:
 *  - a generated file under docs/ai differs from a fresh regeneration, or is missing, or is stale;
 *  - a component exported from src/index.ts is missing from the committed manifest or has no spec;
 *  - the agent entry files reference a path or an npm script that does not exist.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./build-manifest.mjs";
import { OUT, generate } from "./render.mjs";

const problems = [];
const fail = (message) => problems.push(message);
const read = (file) => readFileSync(path.join(ROOT, file), "utf8");
const exists = (file) => existsSync(path.join(ROOT, file));

// 1. Regenerate and compare.
const expected = generate();
for (const [file, content] of expected) {
  if (!exists(file)) fail(`${file} is missing`);
  else if (read(file) !== content) fail(`${file} is out of date`);
}
const specDir = path.join(ROOT, OUT, "components");
if (existsSync(specDir)) {
  for (const name of readdirSync(specDir)) {
    if (!expected.has(`${OUT}/components/${name}`))
      fail(`${OUT}/components/${name} is stale (no such component)`);
  }
}

// 2. Coverage of src/index.ts, read independently of the generator.
const exportedNames = [];
for (const m of read("src/index.ts").matchAll(/export \* from "\.\/(components|motion)(?:\/([^"]+))?";/g)) {
  if (m[2]) exportedNames.push(m[2]);
  else {
    for (const inner of read(`src/${m[1]}/index.ts`).matchAll(/export \* from "\.\/([^"]+)";/g))
      exportedNames.push(inner[1]);
  }
}
const committed = exists(`${OUT}/components.json`)
  ? JSON.parse(read(`${OUT}/components.json`)).components.map((c) => c.name)
  : [];
for (const name of exportedNames) {
  if (!committed.includes(name))
    fail(`${name} is exported from src/index.ts but missing from ${OUT}/components.json`);
  if (!exists(`${OUT}/components/${name}.md`))
    fail(`${name} is exported from src/index.ts but has no ${OUT}/components/${name}.md`);
}

// 3. Agent entry files: pointers, paths and scripts.
const scripts = JSON.parse(read("package.json")).scripts;
const IGNORED = /^(dist|storybook-static|coverage|node_modules|src\/tokens\/generated|\.husky\/_)(\/|$)/;
const checkReferences = (file) => {
  if (!exists(file)) return fail(`${file} is missing`);
  const text = read(file);
  const refs = new Set();
  for (const m of text.matchAll(/`([^`\n]+)`/g)) refs.add(m[1]);
  for (const m of text.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) if (!/^[a-z]+:/.test(m[1])) refs.add(m[1]);
  for (const ref of refs) {
    const script = /^npm run ([\w:-]+)/.exec(ref);
    if (script) {
      if (!(script[1] in scripts)) fail(`${file} references missing npm script "${script[1]}"`);
      continue;
    }
    const target = ref.replace(/^\.\//, "").replace(/[.,;:]+$/, "");
    const base = path.dirname(file);
    const looksLikePath =
      /^[\w.@-][\w./@-]*$/.test(target) &&
      (target.includes("/") || /\.(md|mdx|json|mjs|ts|tsx|css|yml|yaml|txt|mdc)$/.test(target));
    if (
      !looksLikePath ||
      /[*<>{}]/.test(target) ||
      IGNORED.test(target) ||
      /^@[\w-]+\//.test(target) ||
      /^(https?:|\/|@|\.\w)/.test(target)
    )
      continue;
    if (/^(?:tsx?|node|npx|git|gh)\b/.test(target)) continue;
    const candidates = [target, path.posix.normalize(path.posix.join(base, target))];
    if (!candidates.some(exists)) fail(`${file} references missing path "${target}"`);
  }
  return undefined;
};
for (const file of [
  "AGENTS.md",
  `${OUT}/README.md`,
  `${OUT}/CONSUMING.md`,
  ".github/copilot-instructions.md",
])
  checkReferences(file);
if (!exists("CLAUDE.md") || read("CLAUDE.md").trim() !== "@AGENTS.md")
  fail("CLAUDE.md must contain exactly `@AGENTS.md`");
if (!exists(".cursor/rules/design-system.mdc")) fail(".cursor/rules/design-system.mdc is missing");
else if (!read(".cursor/rules/design-system.mdc").includes("AGENTS.md"))
  fail(".cursor/rules/design-system.mdc must point to AGENTS.md");
if (
  exists(".github/copilot-instructions.md") &&
  !read(".github/copilot-instructions.md").includes("AGENTS.md")
)
  fail(".github/copilot-instructions.md must point to AGENTS.md");

if (problems.length > 0) {
  console.error(
    `verify:ai-docs failed:\n${problems.map((p) => `  - ${p}`).join("\n")}\nRun \`npm run build:ai-docs\` and commit the result.`,
  );
  process.exit(1);
}
console.log(
  `verify:ai-docs ok (${expected.size} generated files, ${exportedNames.length} exported components)`,
);
