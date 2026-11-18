import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import * as stylelintModule from "stylelint";

const stylelint = stylelintModule.default ?? stylelintModule;

/** Lints one declaration the way the repo lints a CSS Module and returns the rule names that fired. */
async function violations(declaration) {
  const { results } = await stylelint.lint({
    code: `.a {\n  ${declaration}\n}\n`,
    configFile: resolve(process.cwd(), ".stylelintrc.json"),
    codeFilename: resolve(process.cwd(), "src/components/Example/Example.module.css"),
  });
  return results[0].warnings.map((w) => w.rule);
}

const RULE = "declaration-property-value-disallowed-list";

describe("token guard in the stylelint config", () => {
  it.each([
    "letter-spacing: 0.08em;",
    "letter-spacing: -0.03em;",
    "letter-spacing: var(--x, 0.06em);",
    "letter-spacing: 1px;",
    "outline: 2px solid var(--lufia-color-focus-ring);",
    "outline: 2px solid transparent;",
    "outline-width: 3px;",
    "outline: thick solid red;",
    "border-radius: 14px;",
    "border-start-start-radius: 0.5rem;",
    "box-shadow: 0 0 0 2px #fff;",
    "box-shadow: 0 1px 2px rgb(0 0 0 / 10%);",
    "box-shadow: 0 1px 2px oklch(0 0 0 / 10%);",
  ])("rejects %s", async (declaration) => {
    expect(await violations(declaration)).toContain(RULE);
  });

  it.each([
    "letter-spacing: var(--lufia-letter-spacing-caps);",
    "letter-spacing: var(--lufia-x, var(--lufia-letter-spacing-wide));",
    "letter-spacing: normal;",
    "letter-spacing: inherit;",
    "letter-spacing: 0;",
    "outline: var(--lufia-border-width-thick) solid var(--lufia-color-focus-ring);",
    "outline: var(--lufia-border-width-thin) solid CanvasText;",
    "outline-offset: 2px;",
    "border-radius: var(--lufia-radius-card);",
    "border-radius: 50%;",
    "border-radius: 0;",
    "box-shadow: var(--lufia-shadow-md);",
    "box-shadow: 0 0 0 2px var(--lufia-color-bg-surface);",
  ])("accepts %s", async (declaration) => {
    expect(await violations(declaration)).not.toContain(RULE);
  });
});
