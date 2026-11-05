import { DEFAULT_TOKEN_PREFIXES, hasGlobalKillSwitch, scanCss, scanScript, type Rule } from "./scan";

const options = { tokenPrefixes: DEFAULT_TOKEN_PREFIXES, globalReducedMotion: false };
const guarded = { ...options, globalReducedMotion: true };
const rules = (css: string, o = guarded): Rule[] => scanCss(css, o).map((f) => f.rule);

describe("scanCss: duration", () => {
  it("flags literal durations in transition and animation", () => {
    expect(rules(".a{transition:opacity .2s}")).toContain("duration");
    expect(rules(".a{animation:fade 240ms}")).toContain("duration");
    expect(rules(".a{transition-duration:300ms}")).toEqual(["duration"]);
  });

  it("accepts tokens, literal delays, 1ms steps and endless loaders", () => {
    expect(
      rules(".a{transition:opacity var(--lufia-motion-duration-fast) var(--lufia-motion-easing-out)}"),
    ).toEqual([]);
    expect(
      rules(".a{animation:fade var(--lufia-motion-duration-enter) var(--lufia-motion-easing-out) 80ms both}"),
    ).toEqual([]);
    expect(rules(".a{animation:flip 1ms linear forwards}")).toEqual([]);
    expect(rules(".a{animation:spin 700ms linear infinite}")).toEqual([]);
  });

  it("does not accept another prefix unless it is configured", () => {
    expect(rules(".a{transition:opacity var(--other-fast)}")).toEqual([]);
    expect(rules(".a{transition:opacity 0.3s var(--other-fast)}")).toEqual(["duration"]);
    const custom = { ...guarded, tokenPrefixes: ["--other-"] };
    expect(rules(".a{transition:opacity var(--other-fast)}", custom)).toEqual([]);
  });

  it("ignores commented-out code and reports the right line", () => {
    expect(rules("/* transition: opacity .2s */ .a{color:red}")).toEqual([]);
    expect(scanCss(".a{\n  color:red;\n  transition: opacity 1s;\n}", guarded)[0]?.line).toBe(3);
  });
});

describe("scanCss: easing", () => {
  it("flags keyword and cubic-bezier easings", () => {
    expect(rules(".a{transition:opacity var(--lufia-motion-duration-fast) ease-in-out}")).toEqual(["easing"]);
    expect(rules(".a{animation-timing-function:cubic-bezier(.2,0,0,1)}")).toEqual(["easing"]);
    expect(rules(".a{transition:opacity var(--lufia-motion-duration-fast) ease}")).toEqual(["easing"]);
  });

  it("accepts easing tokens, linear and steps", () => {
    expect(rules(".a{transition-timing-function:var(--lufia-motion-easing-out)}")).toEqual([]);
    expect(rules(".a{animation-timing-function:linear}")).toEqual([]);
    expect(rules(".a{animation-timing-function:steps(4)}")).toEqual([]);
  });
});

describe("scanCss: layout", () => {
  it("flags layout properties in transitions and keyframes", () => {
    expect(rules(".a{transition:width var(--lufia-motion-duration-fast)}")).toEqual(["layout"]);
    expect(
      rules(
        ".a{transition:opacity var(--lufia-motion-duration-fast),margin-top var(--lufia-motion-duration-fast)}",
      ),
    ).toEqual(["layout"]);
    expect(rules(".a{transition:all var(--lufia-motion-duration-fast)}")).toEqual(["layout"]);
    expect(rules(".a{transition-property:height}")).toEqual(["layout"]);
    expect(rules("@keyframes g{from{height:0}to{height:10rem}}")).toEqual(["layout", "layout"]);
    expect(rules(".a{transition:inline-size var(--lufia-motion-duration-fast)}")).toEqual(["layout"]);
  });

  it("accepts compositor properties", () => {
    expect(
      rules(
        ".a{transition:transform var(--lufia-motion-duration-fast),opacity var(--lufia-motion-duration-fast),background-color var(--lufia-motion-duration-fast)}",
      ),
    ).toEqual([]);
    expect(rules("@keyframes r{from{opacity:0;transform:translateY(.5rem)}}")).toEqual([]);
  });

  it("honours the allow directive on the same or the previous line", () => {
    expect(
      rules(
        ".a{\n  /* lufia-motion-allow layout */\n  transition: grid-template-rows var(--lufia-motion-duration-fast);\n}",
      ),
    ).toEqual([]);
    expect(
      rules(".a{ transition: width var(--lufia-motion-duration-fast); /* lufia-motion-allow layout */ }"),
    ).toEqual([]);
    expect(rules("/* lufia-motion-allow layout */\n@keyframes g{from{height:0}}")).toEqual([]);
    // The directive names a rule; it does not silence others.
    expect(
      rules(
        ".a{\n  /* lufia-motion-allow duration */\n  transition: width var(--lufia-motion-duration-fast);\n}",
      ),
    ).toEqual(["layout"]);
    // And it only reaches the next line.
    expect(
      rules("/* lufia-motion-allow layout */\n.x{}\n.a{transition: width var(--lufia-motion-duration-fast)}"),
    ).toEqual(["layout"]);
  });
});

describe("scanCss: reduced motion", () => {
  it("accepts token-only, non-looping motion because the tokens collapse", () => {
    expect(
      rules(
        ".a{transition:opacity var(--lufia-motion-duration-fast) var(--lufia-motion-easing-out)}",
        options,
      ),
    ).toEqual([]);
  });

  it("flags literal or endless motion in a file with no guard", () => {
    expect(rules(".a{animation:spin 700ms linear infinite}", options)).toEqual(["reduced-motion"]);
    expect(rules(".a{transition:opacity 200ms var(--lufia-motion-easing-out)}", options)).toContain(
      "reduced-motion",
    );
    expect(
      rules(
        ".a{animation:pulse var(--lufia-motion-duration-slow) var(--lufia-motion-easing-out) infinite}",
        options,
      ),
    ).toEqual(["reduced-motion"]);
    expect(rules("html{scroll-behavior:smooth}", options)).toEqual(["reduced-motion"]);
    expect(rules("html{scroll-behavior:auto}", options)).toEqual([]);
  });

  it("is satisfied by a media query in the file or a global kill-switch", () => {
    const guard = "@media (prefers-reduced-motion: reduce){.a{animation:none}}";
    expect(rules(`.a{animation:spin 700ms linear infinite}${guard}`, options)).toEqual([]);
    expect(rules(".a{animation:spin 700ms linear infinite}", guarded)).toEqual([]);
  });
});

describe("hasGlobalKillSwitch", () => {
  it("needs a universal selector inside the reduced-motion query", () => {
    expect(
      hasGlobalKillSwitch(
        "@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation:none;transition:none}}",
      ),
    ).toBe(true);
    expect(hasGlobalKillSwitch("@media (prefers-reduced-motion: reduce){.a{animation:none}}")).toBe(false);
    expect(hasGlobalKillSwitch("*{animation:none}")).toBe(false);
    expect(hasGlobalKillSwitch("/* @media (prefers-reduced-motion: reduce){*{animation:none}} */")).toBe(
      false,
    );
  });
});

describe("scanScript", () => {
  it("applies the CSS rules to inline style strings", () => {
    const rule = (src: string) => scanScript(src, guarded).map((f) => f.rule);
    expect(rule(`<div style={{ transition: "opacity 200ms ease" }} />`)).toEqual(["duration", "easing"]);
    expect(rule(`<div style={{ transitionProperty: "height" }} />`)).toEqual(["layout"]);
    expect(
      rule(
        "<div style={{ transition: `opacity var(--lufia-motion-duration-fast) var(--lufia-motion-easing-out)` }} />",
      ),
    ).toEqual([]);
  });

  it("flags rAF and WAAPI without a reduced-motion check", () => {
    expect(scanScript("requestAnimationFrame(tick)", options).map((f) => f.rule)).toEqual(["reduced-motion"]);
    expect(scanScript("el.animate([{opacity:0},{opacity:1}], 200)", options).map((f) => f.rule)).toEqual([
      "reduced-motion",
    ]);
    expect(scanScript("const r = usePrefersReducedMotion(); requestAnimationFrame(tick)", options)).toEqual(
      [],
    );
    expect(scanScript("// lufia-motion-allow reduced-motion\nrequestAnimationFrame(tick)", options)).toEqual(
      [],
    );
  });
});
