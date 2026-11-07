// publint plus are-the-types-wrong on the packed package. attw does not expand the `./components/*`
// wildcard export, so every component subpath is passed explicitly. The four asset entrypoints
// ship no types by design and are excluded by name (no rule is ignored globally).
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";

const assets = ["./tokens.json", "./tokens.css", "./themes/default.css", "./themes/example-brand.css"];
const componentsDir = "dist/components";

if (!existsSync(componentsDir)) {
  console.error("verify:package needs a build: run npm run build first");
  process.exit(1);
}

const components = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(`${componentsDir}/${entry.name}/index.js`))
  .map((entry) => `./components/${entry.name}`);

const run = (args) => execFileSync("npx", args, { stdio: "inherit" });

run(["publint"]);
console.log(`attw: checking ${components.length} component subpaths explicitly`);
run([
  "attw",
  "--pack",
  ".",
  "--profile",
  "esm-only",
  "--exclude-entrypoints",
  ...assets,
  "--include-entrypoints",
  ...components,
]);
