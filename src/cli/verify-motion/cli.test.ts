import {
  existsSync,
  mkdirSync,
  symlinkSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { run } from "./cli";
import { compare } from "./ratchet";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "lufia-motion-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

const write = (file: string, content: string) => {
  mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
  writeFileSync(path.join(dir, file), content);
};
function cli(...args: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = run(args, { cwd: dir, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

const BAD = ".a{transition:width 200ms ease}";
const GOOD = ".a{transition:opacity var(--lufia-motion-duration-fast) var(--lufia-motion-easing-out)}";

describe("compare (ratchet)", () => {
  it("fails on more violations, passes on equal, and reports shrinkable on fewer", () => {
    const baseline = { "a.css": { duration: 2 } };
    expect(compare({ "a.css": { duration: 3 } }, baseline).problems).toHaveLength(1);
    expect(compare({ "b.css": { layout: 1 } }, baseline).problems).toHaveLength(1);
    expect(compare({ "a.css": { duration: 2 } }, baseline)).toEqual({ problems: [], shrinkable: false });
    expect(compare({ "a.css": { duration: 1 } }, baseline)).toEqual({ problems: [], shrinkable: true });
    expect(compare({}, baseline)).toEqual({ problems: [], shrinkable: true });
  });
});

describe("lufia-verify-motion", () => {
  it("passes a clean tree and fails a dirty one with file:line output", () => {
    write("src/ok.module.css", GOOD);
    expect(cli("src").code).toBe(0);
    write("src/bad.module.css", `\n${BAD}`);
    const result = cli("src");
    expect(result.code).toBe(1);
    expect(result.err).toContain("src/bad.module.css:2");
    expect(result.err).toMatch(/duration/);
    expect(result.err).toMatch(/layout/);
    expect(result.err).toMatch(/easing/);
  });

  it("skips node_modules, tests and the --ignore prefixes", () => {
    write("node_modules/x/bad.css", BAD);
    write("src/a.test.ts", "requestAnimationFrame(x)");
    write("legacy/bad.css", BAD);
    expect(cli("--ignore", "legacy/", ".").code).toBe(0);
    expect(cli(".").code).toBe(1);
  });

  it("scans TSX inline styles and unguarded requestAnimationFrame", () => {
    write("src/a.tsx", `export const A = () => <i style={{ transition: "opacity 1s" }} />;`);
    write("src/b.ts", "requestAnimationFrame(() => {});");
    const result = cli("src");
    expect(result.code).toBe(1);
    expect(result.err).toContain("src/a.tsx");
    expect(result.err).toContain("src/b.ts");
  });

  it("treats a global kill-switch in any stylesheet as the reduced-motion guard", () => {
    write("src/spin.css", ".a{animation:spin 700ms linear infinite}");
    expect(cli("src").code).toBe(1);
    write(
      "src/global.css",
      "@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation:none;transition:none}}",
    );
    expect(cli("src").code).toBe(0);
  });

  describe("baseline", () => {
    it("--init records today's violations and then the run passes", () => {
      write("src/bad.css", BAD);
      expect(cli("src", "--baseline", "b.json", "--init").code).toBe(0);
      expect(JSON.parse(readFileSync(path.join(dir, "b.json"), "utf8")).files["src/bad.css"]).toEqual({
        duration: 1,
        easing: 1,
        layout: 1,
        "reduced-motion": 1,
      });
      expect(cli("src", "--baseline", "b.json").code).toBe(0);
      expect(cli("src", "--baseline", "b.json", "--init").code).toBe(2);
    });

    it("fails when a violation is added, even in a baselined file", () => {
      write("src/bad.css", BAD);
      cli("src", "--baseline", "b.json", "--init");
      write("src/bad.css", `${BAD}\n.b{transition:height 1s}`);
      expect(cli("src", "--baseline", "b.json").code).toBe(1);
    });

    it("--update shrinks but refuses to grow", () => {
      write("src/bad.css", BAD);
      cli("src", "--baseline", "b.json", "--init");
      write("src/bad.css", GOOD);
      expect(cli("src", "--baseline", "b.json").out).toContain("can shrink");
      expect(cli("src", "--baseline", "b.json", "--update").code).toBe(0);
      expect(JSON.parse(readFileSync(path.join(dir, "b.json"), "utf8")).files).toEqual({});
      write("src/new.css", BAD);
      expect(cli("src", "--baseline", "b.json", "--update").code).toBe(1);
      expect(JSON.parse(readFileSync(path.join(dir, "b.json"), "utf8")).files).toEqual({});
    });

    it("requires the baseline file to exist", () => {
      write("src/ok.css", GOOD);
      expect(cli("src", "--baseline", "missing.json").code).toBe(2);
    });
  });

  it("accepts absolute paths inside the working directory and rejects ones outside", () => {
    write("src/bad.css", BAD);
    expect(cli(path.join(dir, "src")).code).toBe(1);
    expect(cli(path.dirname(dir)).code).toBe(2);
  });

  it("rejects a baseline path outside the working directory without writing it", () => {
    write("src/ok.css", GOOD);
    const outside = path.join(path.dirname(dir), "escaped-motion.json");
    expect(cli("src", "--baseline", "../escaped-motion.json", "--init").code).toBe(2);
    expect(cli("src", "--baseline", outside, "--init").code).toBe(2);
    expect(existsSync(outside)).toBe(false);
  });

  it("exits 2 for a baseline that is invalid JSON, null or the wrong shape", () => {
    write("src/ok.css", GOOD);
    for (const content of ["{nope", "null", "[]", '{"files":null}', "42"]) {
      write("b.json", content);
      const result = cli("src", "--baseline", "b.json");
      expect(result.code, content).toBe(2);
      expect(result.err).toMatch(/baseline|JSON/);
    }
  });

  it("does not follow symlinks", () => {
    write("outside/bad.css", BAD);
    write("src/ok.css", GOOD);
    symlinkSync(path.join(dir, "outside"), path.join(dir, "src", "link"));
    expect(cli("src").code).toBe(0);
  });

  it("--ignore matches whole path segments, not prefixes", () => {
    write("src/bad.css", BAD);
    write("srcx/bad.css", BAD);
    const result = cli("--ignore", "src", ".");
    expect(result.code).toBe(1);
    expect(result.err).toContain("srcx/bad.css");
    expect(result.err).not.toContain("src/bad.css");
    expect(cli("--ignore", "src/", "--ignore", "srcx", ".").code).toBe(0);
  });

  it("reports usage errors with exit code 2", () => {
    expect(cli("--nope").code).toBe(2);
    expect(cli("missing-dir").code).toBe(2);
    expect(cli("--update").code).toBe(2);
    expect(cli("--help").out).toContain("Usage");
  });
});
