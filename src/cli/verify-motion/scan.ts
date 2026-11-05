/** Pure scanning rules for `lufia-verify-motion`. No file system access, so every rule is unit-testable. */

export type Rule = "duration" | "easing" | "layout" | "reduced-motion";
export const RULES: readonly Rule[] = ["duration", "easing", "layout", "reduced-motion"];

export type Finding = { rule: Rule; line: number; text: string };

export type ScanOptions = {
  /** Custom property prefixes that count as motion tokens. */
  tokenPrefixes: readonly string[];
  /** Whether the project already has a global reduced-motion kill-switch (`*` rules inside the media query). */
  globalReducedMotion: boolean;
};

export const DEFAULT_TOKEN_PREFIXES: readonly string[] = ["--lufia-motion-"];

const TIME = /(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g;
const LAYOUT =
  /^(all|width|height|min-width|min-height|max-width|max-height|inline-size|block-size|min-inline-size|min-block-size|max-inline-size|max-block-size|top|left|right|bottom|inset|inset-[\w-]+|margin(-[\w-]+)?|padding(-[\w-]+)?|flex-basis|font-size|border-width|grid-template(-\w+)?)$/;
const EASING_KEYWORDS = new Set(["ease", "ease-in", "ease-out", "ease-in-out"]);
const TIMED = new Set(["transition", "transition-duration", "animation", "animation-duration"]);
const TIMING = new Set([
  "transition",
  "transition-timing-function",
  "animation",
  "animation-timing-function",
]);
const DIRECTIVE = /lufia-motion-allow\s+([a-z-]+(?:\s*,\s*[a-z-]+)*)/g;

/** Replaces comment bodies with spaces (keeping line breaks) so offsets and line numbers stay valid. */
export const stripComments = (css: string): string =>
  css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

const lineOf = (source: string, index: number): number => source.slice(0, index).split("\n").length;

/** Splits on `separator` outside parentheses. */
function splitTop(value: string, separator: RegExp): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of value) {
    if (char === "(") depth++;
    else if (char === ")") depth--;
    if (depth === 0 && separator.test(char)) {
      if (current) parts.push(current);
      current = "";
    } else current += char;
  }
  if (current) parts.push(current);
  return parts;
}

/** Lines a `lufia-motion-allow <rule>[, <rule>]` directive covers: its own line and the one after it. */
export function allowedLines(source: string): Map<number, Set<string>> {
  const allowed = new Map<number, Set<string>>();
  for (const match of source.matchAll(DIRECTIVE)) {
    const line = lineOf(source, match.index);
    const rules = (match[1] ?? "").split(",").map((r) => r.trim());
    for (const covered of [line, line + 1]) {
      const set = allowed.get(covered) ?? new Set<string>();
      rules.forEach((r) => set.add(r));
      allowed.set(covered, set);
    }
  }
  return allowed;
}

type Declaration = { property: string; value: string; index: number; anchor: number };

/** Declarations inside @keyframes blocks. `anchor` is the offset of the @keyframes rule itself. */
function keyframeDeclarations(css: string): Declaration[] {
  const found: Declaration[] = [];
  for (const start of css.matchAll(/@keyframes\s+[\w-]+\s*\{/g)) {
    let depth = 1;
    let cursor = start.index + start[0].length;
    const bodyStart = cursor;
    while (cursor < css.length && depth > 0) {
      if (css[cursor] === "{") depth++;
      else if (css[cursor] === "}") depth--;
      cursor++;
    }
    for (const d of css.slice(bodyStart, cursor - 1).matchAll(/([a-z-]+)\s*:\s*([^;{}]+)/gi))
      found.push({
        property: (d[1] ?? "").toLowerCase(),
        value: d[2] ?? "",
        index: bodyStart + d.index,
        anchor: start.index,
      });
  }
  return found;
}

function stripTokens(value: string, prefixes: readonly string[]): { value: string; usesToken: boolean } {
  let usesToken = false;
  const tokenCall = new RegExp(
    `var\\(\\s*(?:${prefixes.map((p) => p.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})[^)]*\\)`,
    "g",
  );
  let out = value.replace(tokenCall, () => {
    usesToken = true;
    return " 0s ";
  });
  out = out.replace(/var\([^)]*\)/g, " ");
  return { value: out, usesToken };
}

type Motion = { property: string; line: number; text: string; literalTime: boolean; infinite: boolean };

/** Analyses one `property: value` pair; pushes findings and returns motion facts for the reduced-motion rule. */
function analyse(
  property: string,
  rawValue: string,
  line: number,
  text: string,
  options: ScanOptions,
  findings: Finding[],
): Motion | undefined {
  const { value } = stripTokens(rawValue, options.tokenPrefixes);
  const infinite = /\binfinite\b/.test(rawValue);
  let literalTime = false;

  if (TIMED.has(property)) {
    // In a shorthand the first time is the duration; a later one is a delay and may stay literal.
    const layers = property.endsWith("duration") ? [value] : splitTop(value, /,/);
    const hard = layers.some((layer) => {
      const first = [...layer.matchAll(TIME)][0];
      if (!first) return false;
      const ms = first[2] === "s" ? Number(first[1]) * 1000 : Number(first[1]);
      return ms > 1; // 1ms is a step (a visibility toggle), not motion
    });
    // Endless loaders keep their own pace.
    literalTime = hard;
    if (hard && !infinite) findings.push({ rule: "duration", line, text });
  }

  if (TIMING.has(property)) {
    const bad = splitTop(rawValue.replace(/var\([^)]*\)/g, " "), /[\s,]/).some(
      (word) => EASING_KEYWORDS.has(word.toLowerCase()) || /^cubic-bezier\(/i.test(word),
    );
    if (bad) findings.push({ rule: "easing", line, text });
  }

  if (property === "transition" || property === "transition-property") {
    const names = splitTop(value, /,/).map((part) => part.trim().split(/\s+/)[0] ?? "");
    if (names.some((name) => name && LAYOUT.test(name.toLowerCase())))
      findings.push({ rule: "layout", line, text });
  }

  if (property === "scroll-behavior")
    return /smooth/.test(rawValue) ? { property, line, text, literalTime: true, infinite: false } : undefined;
  return TIMED.has(property) ? { property, line, text, literalTime, infinite } : undefined;
}

/** The body text of every `@media (prefers-reduced-motion ...)` block. */
function reducedMotionBlocks(css: string): string[] {
  const blocks: string[] = [];
  for (const start of css.matchAll(/@media[^{]*prefers-reduced-motion[^{]*\{/g)) {
    let depth = 1;
    let cursor = start.index + start[0].length;
    const bodyStart = cursor;
    while (cursor < css.length && depth > 0) {
      if (css[cursor] === "{") depth++;
      else if (css[cursor] === "}") depth--;
      cursor++;
    }
    blocks.push(css.slice(bodyStart, cursor - 1));
  }
  return blocks;
}

/** Whether a stylesheet carries a global reduced-motion kill-switch: a `*` selector that resets animation or transition. */
export function hasGlobalKillSwitch(source: string): boolean {
  return reducedMotionBlocks(stripComments(source)).some(
    (body) =>
      /(^|[,{}\s])\*(::before|::after)?\s*[,{]/.test(body) &&
      /(animation|transition)(-duration)?\s*:/.test(body),
  );
}

function applyAllowed(source: string, found: { finding: Finding; anchorLine?: number }[]): Finding[] {
  const allowed = allowedLines(source);
  return found
    .filter(
      ({ finding, anchorLine }) =>
        ![finding.line, anchorLine].some(
          (line) => line !== undefined && allowed.get(line)?.has(finding.rule),
        ),
    )
    .map(({ finding }) => finding);
}

/** Findings for one stylesheet. */
export function scanCss(source: string, options: ScanOptions): Finding[] {
  const css = stripComments(source);
  const found: { finding: Finding; anchorLine?: number }[] = [];
  const motions: Motion[] = [];

  for (const d of css.matchAll(/(?<![\w-])([a-z-]+)\s*:\s*([^;{}]+)/gi)) {
    const property = (d[1] ?? "").toLowerCase();
    if (
      !TIMED.has(property) &&
      !TIMING.has(property) &&
      property !== "transition-property" &&
      property !== "scroll-behavior"
    )
      continue;
    const line = lineOf(css, d.index);
    const local: Finding[] = [];
    const motion = analyse(property, d[2] ?? "", line, d[0].trim().replace(/\s+/g, " "), options, local);
    local.forEach((finding) => found.push({ finding }));
    if (motion) motions.push(motion);
  }
  for (const d of keyframeDeclarations(css)) {
    if (LAYOUT.test(d.property) && d.property !== "all")
      found.push({
        finding: { rule: "layout", line: lineOf(css, d.index), text: `@keyframes ${d.property}` },
        anchorLine: lineOf(css, d.anchor),
      });
  }

  const guarded = options.globalReducedMotion || /prefers-reduced-motion/.test(css);
  const needsGuard = motions.find((m) => m.literalTime || m.infinite);
  if (!guarded && needsGuard)
    found.push({
      finding: { rule: "reduced-motion", line: needsGuard.line, text: "no prefers-reduced-motion handling" },
    });

  return applyAllowed(source, found).sort((a, b) => a.line - b.line);
}

const CAMEL =
  /\b(transition|transitionDuration|transitionProperty|transitionTimingFunction|animation|animationDuration|animationTimingFunction)\s*:\s*(["'`])((?:\\.|(?!\2)[^\\])*)\2/g;
const kebab = (name: string) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Findings for a script or component file: inline styles, and JavaScript-driven motion without a reduced-motion check. */
export function scanScript(source: string, options: ScanOptions): Finding[] {
  const found: { finding: Finding; anchorLine?: number }[] = [];
  for (const m of source.matchAll(CAMEL)) {
    const line = lineOf(source, m.index);
    const local: Finding[] = [];
    analyse(kebab(m[1] ?? ""), m[3] ?? "", line, m[0], options, local);
    local.forEach((finding) => found.push({ finding }));
  }
  const driver = /\b(requestAnimationFrame\s*\(|\.animate\s*\()/.exec(source);
  const aware = /prefers-reduced-motion|usePrefersReducedMotion|useReducedMotion/.test(source);
  if (driver && !aware)
    found.push({
      finding: {
        rule: "reduced-motion",
        line: lineOf(source, driver.index),
        text: `${driver[1]?.replace(/\s*\($/, "")} without a reduced-motion check`,
      },
    });
  return applyAllowed(source, found).sort((a, b) => a.line - b.line);
}
