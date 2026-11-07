// Pull request gate: a change to the published source needs a new changeset.
// Usage (CI): BASE_REF=main HEAD_REF=<branch> node scripts/check-changeset.mjs
import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Source that ends up in the published package: not stories, tests, docs pages or test helpers.
export function isPublishedSource(file) {
  if (!file.startsWith("src/")) return false;
  if (/\.(stories|test)\.[cm]?[jt]sx?$/.test(file)) return false;
  if (/\.mdx?$/.test(file)) return false;
  if (file.startsWith("src/docs/") || file.startsWith("src/test/")) return false;
  return true;
}

export function isChangeset(file) {
  return /^\.changeset\/[^/]+\.md$/.test(file) && file !== ".changeset/README.md";
}

// `added` are files the pull request adds; `changed` is every file it touches.
export function changesetProblem({ changed, added, headRef = "" }) {
  // The release workflow's "Version packages" PR and dependency bots never carry release notes.
  if (headRef.startsWith("changeset-release/") || headRef.startsWith("dependabot/")) return null;
  const source = changed.filter(isPublishedSource);
  if (source.length === 0 || added.some(isChangeset)) return null;
  return `${source.length} published source file(s) changed but the pull request adds no .changeset/*.md (npm run changeset). First: ${source[0]}`;
}

function gitList(base, filter) {
  return execFileSync("git", ["diff", "--name-only", `--diff-filter=${filter}`, `origin/${base}...HEAD`], {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const base = process.env.BASE_REF || "main";
  const problem = changesetProblem({
    changed: gitList(base, "ACDMRT"),
    added: gitList(base, "A"),
    headRef: process.env.HEAD_REF,
  });
  if (problem) {
    console.error(`check-changeset failed: ${problem}`);
    console.error("Docs-only and tooling-only changes touch no published source and need none.");
    process.exit(1);
  }
  console.log("check-changeset ok");
}
