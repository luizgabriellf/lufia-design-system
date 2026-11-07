import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return cssFiles(path);
    return name.endsWith(".css") ? [path] : [];
  });
}

/** Names of the keyframes whose frames set `transform`. */
function transformKeyframes(css: string): Set<string> {
  const names = new Set<string>();
  for (const match of css.matchAll(/@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g)) {
    if (/(^|[\s;{])transform\s*:/.test(match[2] ?? "")) names.add(match[1] ?? "");
  }
  return names;
}

/** Every `animation` shorthand with the keyframes name and the fill mode it asks for. */
function animations(css: string): { name: string; value: string }[] {
  return [...css.matchAll(/(?:^|[\s;{])animation\s*:\s*([^;]+);/g)].flatMap((match) =>
    (match[1] ?? "")
      .split(/,(?![^(]*\))/)
      .map((part) => ({ value: part.trim(), name: part.trim().split(/\s+/)[0] ?? "" })),
  );
}

describe("animation fill mode", () => {
  const files = cssFiles("src").map((path) => ({ path, css: readFileSync(path, "utf8") }));

  it("finds the package stylesheets", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  // A forwards fill keeps the animation's `transform` applied after it ends. Even an identity matrix makes the element the
  // containing block and a stacking context for `position: fixed` descendants. Entrances therefore fill `backwards`
  // only; exits (`*-out`) end on an element that is about to unmount, so they may hold their last frame.
  it("no entrance that animates transform fills forwards", () => {
    const offenders: string[] = [];
    // Keyframes can live in another module than the rule using them: the names are unique across the package.
    const withTransform = new Set(files.flatMap(({ css }) => [...transformKeyframes(css)]));
    for (const { path, css } of files) {
      for (const { name, value } of animations(css)) {
        if (name.endsWith("-out") || !withTransform.has(name)) continue;
        if (/\b(both|forwards)\b/.test(value)) offenders.push(`${path}: ${value}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the check sees the transform keyframes it guards", () => {
    const names = new Set(files.flatMap(({ css }) => [...transformKeyframes(css)]));
    for (const name of ["route-rise", "stagger-in", "reveal-in", "modal-in", "toast-in"]) {
      expect(names).toContain(name);
    }
  });
});
