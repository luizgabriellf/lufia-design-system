import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return cssFiles(path);
    return name.endsWith(".css") ? [path] : [];
  });
}

/** Properties that, while animated and held by a fill, create a containing block for `position: fixed` descendants. */
const CONTAINING_BLOCK =
  /(^|[\s;{])(transform|translate|scale|rotate|filter|backdrop-filter|perspective)\s*:/;

/** Names of the keyframes in one stylesheet whose frames set a containing-block property. */
function containingBlockKeyframes(css: string): Set<string> {
  const names = new Set<string>();
  for (const match of css.matchAll(/@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g)) {
    if (CONTAINING_BLOCK.test(match[2] ?? "")) names.add(match[1] ?? "");
  }
  return names;
}

const TIME = /^[+-]?(\d+|\d*\.\d+)m?s$/;
const COUNT = /^(infinite|[+-]?(\d+|\d*\.\d+))$/;
const SHORTHAND_KEYWORDS = new Set([
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "step-start",
  "step-end",
  "normal",
  "reverse",
  "alternate",
  "alternate-reverse",
  "none",
  "forwards",
  "backwards",
  "both",
  "running",
  "paused",
]);

/** The keyframes name in one `animation` shorthand part: the token that is no time, easing, count, direction, fill mode or play state. */
function shorthandName(part: string): string {
  const tokens = part
    .trim()
    .replace(/(cubic-bezier|steps|linear)\([^)]*\)/g, "")
    .split(/\s+/);
  return (
    tokens.find(
      (token) => token && !TIME.test(token) && !COUNT.test(token) && !SHORTHAND_KEYWORDS.has(token),
    ) ?? ""
  );
}

/** Every animation of every rule in one stylesheet: its keyframes name and the fill mode it ends up with. */
function animations(css: string): { name: string; fill: string; text: string }[] {
  const found: { name: string; fill: string; text: string }[] = [];
  for (const rule of css.matchAll(/\{([^{}]*)\}/g)) {
    const body = rule[1] ?? "";
    const shorthand = body.match(/(?:^|[\s;])animation\s*:\s*([^;]+);/)?.[1];
    const longhandName = body.match(/(?:^|[\s;])animation-name\s*:\s*([^;]+);/)?.[1];
    const longhandFill = body.match(/(?:^|[\s;])animation-fill-mode\s*:\s*([^;]+);/)?.[1] ?? "";
    const parts = shorthand ? shorthand.split(/,(?![^(]*\))/) : [];
    for (const part of parts) {
      const text = part.trim();
      found.push({ name: shorthandName(text), fill: `${text} ${longhandFill}`, text });
    }
    if (longhandName) {
      for (const name of longhandName.split(",")) {
        found.push({ name: name.trim(), fill: longhandFill, text: `animation-name: ${name.trim()}` });
      }
    }
    if (!shorthand && longhandFill && !longhandName) {
      found.push({ name: "", fill: longhandFill, text: `animation-fill-mode: ${longhandFill}` });
    }
  }
  return found;
}

describe("animation fill mode", () => {
  const files = cssFiles("src").map((path) => ({ path, css: readFileSync(path, "utf8") }));

  it("finds the package stylesheets", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  // A forwards fill keeps the animation's `transform` (or `translate`, `scale`, `rotate`, `filter`) applied after it
  // ends. Even an identity value makes the element the containing block and a stacking context for `position: fixed`
  // descendants. Entrances therefore fill `backwards` only; exits (`*-out`) end on an element that is about to unmount,
  // so they may hold their last frame. Keyframes are scoped per stylesheet: CSS Modules do not share them, and two
  // modules may reuse a name (`backdrop-in`).
  it("no entrance that animates a containing-block property fills forwards", () => {
    const offenders: string[] = [];
    for (const { path, css } of files) {
      const guarded = containingBlockKeyframes(css);
      for (const { name, fill, text } of animations(css)) {
        if (name.endsWith("-out") || !guarded.has(name)) continue;
        if (/\b(both|forwards)\b/.test(fill)) offenders.push(`${path}: ${text}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the scanner flags the shapes it guards", () => {
    const bad = `.a { animation: rise 1s ease both; } .b { animation: rise 1s; animation-fill-mode: forwards; }
      .c { animation-name: rise; animation-fill-mode: both; } @keyframes rise { from { translate: 0 1rem; } }`;
    const guarded = containingBlockKeyframes(bad);
    expect(guarded).toContain("rise");
    const flagged = animations(bad).filter(
      ({ name, fill }) => guarded.has(name) && /\b(both|forwards)\b/.test(fill),
    );
    expect(flagged).toHaveLength(3);
  });

  it("reads the keyframes name from anywhere in the animation shorthand", () => {
    const names = (value: string) => animations(`.a { animation: ${value}; }`).map(({ name }) => name);
    expect(names("rise 1s ease")).toEqual(["rise"]);
    expect(names("1s ease rise both")).toEqual(["rise"]);
    expect(names("ease-in 200ms 2 alternate paused rise")).toEqual(["rise"]);
    expect(names(".5s cubic-bezier(0.2, 0, 0, 1) infinite rise-in, 1s steps(4, end) fade")).toEqual([
      "rise-in",
      "fade",
    ]);
    const bad = `.a { animation: 1s ease rise both; } @keyframes rise { from { translate: 0 1rem; } }`;
    const guarded = containingBlockKeyframes(bad);
    expect(
      animations(bad).filter(({ name, fill }) => guarded.has(name) && /\b(both|forwards)\b/.test(fill)),
    ).toHaveLength(1);
  });

  it("guards backdrop-filter keyframes", () => {
    expect(containingBlockKeyframes("@keyframes veil { from { backdrop-filter: blur(0); } }")).toContain(
      "veil",
    );
  });

  it("sees the keyframes it guards in the real stylesheets", () => {
    const seen = new Set(files.flatMap(({ css }) => [...containingBlockKeyframes(css)]));
    for (const name of ["route-rise", "stagger-in", "reveal-in", "modal-in", "toast-in"])
      expect(seen).toContain(name);
  });
});
