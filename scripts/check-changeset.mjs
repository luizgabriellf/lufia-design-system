// Pull request gate: a change to the published package needs a new changeset.
// Usage (CI): BASE_REF=main HEAD_REF=<branch> HEAD_REPO=<owner/repo> BASE_REPO=<owner/repo> ACTOR=<login> \
//   node scripts/check-changeset.mjs
import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Build inputs outside src/ that change what ships.
const BUILD_INPUTS = new Set(["scripts/postbuild.mjs", "scripts/build-tokens.mjs", "tsup.config.ts"]);
// package.json fields that reach consumers; devDependencies, scripts and the like do not.
const SHIPPED_MANIFEST_FIELDS = [
  "exports",
  "peerDependencies",
  "dependencies",
  "files",
  "bin",
  "sideEffects",
];

// Source and build inputs that end up in the published package: not stories, tests, docs pages or helpers.
export function isPublishedSource(file) {
  if (BUILD_INPUTS.has(file) || file.startsWith("tokens/")) return true;
  if (!file.startsWith("src/")) return false;
  if (/\.(stories|test)\.[cm]?[jt]sx?$/.test(file)) return false;
  if (/\.mdx?$/.test(file)) return false;
  if (file.startsWith("src/docs/") || file.startsWith("src/test/")) return false;
  return true;
}

export function isChangeset(file) {
  return /^\.changeset\/[^/]+\.md$/.test(file) && file !== ".changeset/README.md";
}

// True when a shipped field of package.json differs; a devDependency bump does not count.
export function shippedManifestChanged(base, head) {
  return SHIPPED_MANIFEST_FIELDS.some(
    (field) => JSON.stringify(base?.[field]) !== JSON.stringify(head?.[field]),
  );
}

// Branches whose pull requests never carry release notes. Only trusted when the head lives in this repository.
export function isExemptPullRequest({ headRef = "", headRepo = "", baseRepo = "", actor = "" }) {
  if (!headRepo || headRepo !== baseRepo) return false;
  return (
    headRef.startsWith("changeset-release/") ||
    headRef.startsWith("dependabot/") ||
    actor === "dependabot[bot]"
  );
}

// `added` are files the pull request adds; `changed` is every file it touches.
export function changesetProblem({ changed, added, manifestChanged = false, ...origin }) {
  if (isExemptPullRequest(origin)) return null;
  const source = changed.filter(isPublishedSource);
  if (manifestChanged) source.push("package.json (shipped fields)");
  if (source.length === 0 || added.some(isChangeset)) return null;
  return `${source.length} published file(s) changed but the pull request adds no .changeset/*.md (npm run changeset). First: ${source[0]}`;
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function gitList(base, filter) {
  return git(["diff", "--name-only", `--diff-filter=${filter}`, `origin/${base}...HEAD`])
    .split("\n")
    .filter(Boolean);
}

function manifestAt(ref) {
  try {
    return JSON.parse(git(["show", `${ref}:package.json`]));
  } catch {
    return undefined;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const base = process.env.BASE_REF || "main";
  const mergeBase = git(["merge-base", `origin/${base}`, "HEAD"]).trim();
  const problem = changesetProblem({
    changed: gitList(base, "ACDMRT"),
    added: gitList(base, "A"),
    manifestChanged: shippedManifestChanged(manifestAt(mergeBase), manifestAt("HEAD")),
    headRef: process.env.HEAD_REF,
    headRepo: process.env.HEAD_REPO,
    baseRepo: process.env.BASE_REPO,
    actor: process.env.ACTOR,
  });
  if (problem) {
    console.error(`check-changeset failed: ${problem}`);
    console.error("Docs-only and tooling-only changes touch nothing that ships and need none.");
    process.exit(1);
  }
  console.log("check-changeset ok");
}
