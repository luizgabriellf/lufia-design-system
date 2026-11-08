import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(__dirname, "fieldControl.module.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);
const [baseCss = "", forcedCss = ""] = source.split("@media (forced-colors: active) {");

const rules = (css: string) =>
  [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({
    selectors: (m[1] ?? "").split(",").map((x) => x.trim()),
    body: m[2] ?? "",
  }));

/** The rule whose selector list is exactly `selectors`: a merged list fails the lookup. */
const rule = (css: string, ...selectors: string[]) =>
  rules(css).find(
    (r) => r.selectors.length === selectors.length && selectors.every((x) => r.selectors.includes(x)),
  )?.body ?? "";

const COVER = "var(--lufia-color-bg-field-autofill, var(--lufia-color-bg-field))";

describe("field control autofill CSS", () => {
  it.each(["-webkit-autofill", "autofill"])("covers :%s from tokens, in its own rule", (pseudo) => {
    const body = rule(baseCss, `.native:${pseudo}`);
    expect(body).toContain(`0 0 0 100rem ${COVER} inset`);
    expect(body).toContain("-webkit-text-fill-color: var(--lufia-color-text-default)");
    expect(body).toContain("filter: none");
  });

  it("draws the invalid inner line once, on the box, and not through autofill rules", () => {
    const body = rule(baseCss, ".box[data-invalid]::after");
    expect(body).toContain("position: absolute");
    expect(body).toContain("pointer-events: none");
    expect(body).toContain(
      "box-shadow: inset 0 0 0 var(--lufia-border-width-thin) var(--lufia-color-status-danger-fg)",
    );
    expect(rule(baseCss, ".box[data-invalid]")).not.toContain("box-shadow");
    const invalidAutofill = rules(source).filter((r) =>
      r.selectors.some((x) => x.includes("data-invalid") && x.includes("autofill")),
    );
    expect(invalidAutofill).toEqual([]);
    expect(rule(forcedCss, ".box[data-invalid]::after")).toContain("CanvasText");
  });

  it.each(["-webkit-autofill", "autofill"])(
    "covers read-only and disabled boxes with the surface for :%s",
    (pseudo) => {
      const body = rule(
        baseCss,
        `.box[data-readonly] .native:${pseudo}`,
        `.box[data-disabled] .native:${pseudo}`,
      );
      expect(body).toContain("var(--lufia-color-bg-surface) inset");
    },
  );

  it.each(["-webkit-autofill", "autofill"])(
    "drops the cover for :%s under forced-colors, in every box state",
    (pseudo) => {
      const body = rule(forcedCss, `.box[class] .native:${pseudo}`);
      expect(body).toContain("box-shadow: none");
      expect(body).toContain("FieldText");
    },
  );

  it("squares the inner corners beside any sibling", () => {
    expect(rule(baseCss, "* + .native")).toContain("border-start-start-radius: 0");
    expect(rule(baseCss, ".native:not(:last-child)")).toContain("border-end-end-radius: 0");
  });
});
