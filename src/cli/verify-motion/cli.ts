#!/usr/bin/env node
import { existsSync, lstatSync, readdirSync, realpathSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compare, countFindings, emptyBaseline, type Baseline } from "./ratchet";
import { DEFAULT_TOKEN_PREFIXES, hasGlobalKillSwitch, scanCss, scanScript, type Finding } from "./scan";

const HELP = `lufia-verify-motion: check that motion in your source follows the --lufia-motion-* tokens.

Usage: lufia-verify-motion [paths...] [options]

  paths                  Files or directories to scan (default: current directory)

Options:
  --baseline <file>      Ratchet file. Violations listed there are tolerated; the file can only shrink
  --init                 Create the baseline from the current violations (refuses if it already exists)
  --update               Rewrite the baseline after fixing violations (refuses to add any)
  --ignore <path>        Skip this file or directory (matches whole path segments; repeatable)
  --token-prefix <p>     Extra custom-property prefix that counts as a motion token (repeatable)
  -h, --help             Show this help

Rules: duration, easing, layout, reduced-motion. Silence one deliberate use with a comment
"lufia-motion-allow <rule>" on the same line or the line above. See docs/MOTION.md.
Exit codes: 0 ok, 1 violations, 2 usage error.`;

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  "storybook-static",
  ".next",
  ".turbo",
]);
const CSS = /\.(css|scss|less)$/;
const SCRIPT = /\.(tsx?|jsx?|mjs|cjs|mts|cts)$/;
const NOT_SOURCE = /(\.d\.ts|\.(test|spec)\.[a-z]+)$/;

export type Io = { cwd: string; out: (line: string) => void; err: (line: string) => void };

type Options = {
  paths: string[];
  baseline?: string;
  init: boolean;
  update: boolean;
  ignore: string[];
  tokenPrefixes: string[];
};

function parseArgs(argv: string[]): Options | string {
  const options: Options = {
    paths: [],
    init: false,
    update: false,
    ignore: [],
    tokenPrefixes: [...DEFAULT_TOKEN_PREFIXES],
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    const value = () => argv[++i];
    if (arg === "--init") options.init = true;
    else if (arg === "--update") options.update = true;
    else if (arg === "--baseline") options.baseline = value();
    else if (arg === "--ignore") options.ignore.push(value() ?? "");
    else if (arg === "--token-prefix") options.tokenPrefixes.push(value() ?? "");
    else if (arg.startsWith("-")) return `Unknown option ${arg}`;
    else options.paths.push(arg);
  }
  if ((options.init || options.update) && !options.baseline)
    return "--init and --update need --baseline <file>";
  if (options.init && options.update) return "Use either --init or --update";
  if (options.baseline === "" || options.ignore.includes("") || options.tokenPrefixes.includes(""))
    return "An option is missing its value";
  return options;
}

function isIgnored(file: string, ignored: string): boolean {
  const base = path.posix.normalize(ignored.split(path.sep).join("/")).replace(/\/+$/, "");
  return file === base || file.startsWith(`${base}/`);
}

function walk(root: string, rel: string, out: string[]) {
  const full = path.join(root, rel);
  const stat = lstatSync(full);
  if (stat.isSymbolicLink()) return; // never follow links: they can leave the project or loop
  if (stat.isDirectory()) {
    for (const entry of readdirSync(full).sort()) {
      if (!SKIP_DIRS.has(entry)) walk(root, path.posix.join(rel, entry), out);
    }
  } else out.push(rel);
}

/** Runs the check and returns the process exit code. */
export function run(argv: string[], io: Io): number {
  if (argv.includes("-h") || argv.includes("--help")) {
    io.out(HELP);
    return 0;
  }
  const options = parseArgs(argv);
  if (typeof options === "string") {
    io.err(`${options}\n\n${HELP}`);
    return 2;
  }

  const files: string[] = [];
  for (const p of options.paths.length ? options.paths : ["."]) {
    const absolute = path.resolve(io.cwd, p);
    const rel = path.relative(io.cwd, absolute).split(path.sep).join("/");
    if (rel.startsWith("..")) {
      io.err(`Path is outside the current directory: ${p}`);
      return 2;
    }
    if (!existsSync(absolute)) {
      io.err(`Path not found: ${p}`);
      return 2;
    }
    walk(io.cwd, rel || ".", files);
  }
  const sources = [...new Set(files.map((f) => f.replace(/^\.\//, "")))]
    .filter((f) => (CSS.test(f) || SCRIPT.test(f)) && !NOT_SOURCE.test(f))
    .filter((f) => !options.ignore.some((ignored) => isIgnored(f, ignored)));
  const contents = new Map(sources.map((f) => [f, readFileSync(path.join(io.cwd, f), "utf8")]));

  const globalReducedMotion = [...contents].some(([f, c]) => CSS.test(f) && hasGlobalKillSwitch(c));
  const scanOptions = { tokenPrefixes: options.tokenPrefixes, globalReducedMotion };
  const byFile: Record<string, Finding[]> = {};
  for (const [file, source] of contents) {
    const findings = CSS.test(file) ? scanCss(source, scanOptions) : scanScript(source, scanOptions);
    if (findings.length) byFile[file] = findings;
  }
  const current = countFindings(byFile);

  const baselinePath = options.baseline ? path.resolve(io.cwd, options.baseline) : undefined;
  if (baselinePath !== undefined && path.relative(io.cwd, baselinePath).startsWith("..")) {
    io.err(`Baseline is outside the current directory: ${options.baseline}`);
    return 2;
  }
  const exists = baselinePath !== undefined && existsSync(baselinePath);
  if (options.init) {
    if (exists) {
      io.err(`${options.baseline} already exists. Use --update to shrink it.`);
      return 2;
    }
    writeFileSync(baselinePath as string, `${JSON.stringify({ version: 1, files: current }, null, 2)}\n`);
    io.out(`lufia-verify-motion: baseline written to ${options.baseline}`);
    return 0;
  }
  let baseline: Baseline = emptyBaseline();
  if (exists) {
    try {
      baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as Baseline;
    } catch {
      io.err(`${options.baseline} is not valid JSON`);
      return 2;
    }
    if (
      typeof baseline !== "object" ||
      baseline === null ||
      typeof baseline.files !== "object" ||
      baseline.files === null
    ) {
      io.err(`${options.baseline} is not a baseline file (expected {"version":1,"files":{...}})`);
      return 2;
    }
  } else if (options.baseline && !options.update) {
    io.err(`${options.baseline} not found. Create it with --init, or drop --baseline.`);
    return 2;
  }

  const { problems, shrinkable } = compare(current, baseline.files ?? {});
  if (options.update) {
    if (problems.length) {
      io.err(`Refusing to grow the baseline:\n- ${problems.join("\n- ")}`);
      return 1;
    }
    writeFileSync(baselinePath as string, `${JSON.stringify({ version: 1, files: current }, null, 2)}\n`);
    io.out(`lufia-verify-motion: baseline updated`);
    return 0;
  }
  if (problems.length) {
    const lines = Object.entries(byFile)
      .filter(([file]) => problems.some((p) => p.startsWith(`${file}:`)))
      .flatMap(([file, findings]) => findings.map((f) => `${file}:${f.line}  ${f.rule}  ${f.text}`));
    io.err(`lufia-verify-motion failed (docs/MOTION.md):\n${lines.join("\n")}\n\n- ${problems.join("\n- ")}`);
    return 1;
  }
  io.out(
    `lufia-verify-motion ok (${sources.length} files)${shrinkable ? "; the baseline can shrink: run with --update" : ""}`,
  );
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  process.exitCode = run(process.argv.slice(2), {
    cwd: process.cwd(),
    out: (line) => console.log(line),
    err: (line) => console.error(line),
  });
}
