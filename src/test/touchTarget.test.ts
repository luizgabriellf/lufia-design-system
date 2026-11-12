import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

const sheets = globSync("src/components/**/*.module.css");
const flat = (path: string) => readFileSync(path, "utf8").replace(/\s+/g, " ");

describe("touch target token", () => {
  it("is always read with a fallback, so a page that has not loaded the tokens keeps the minimum", () => {
    expect(sheets.length).toBeGreaterThan(0);
    const bare = sheets.filter((path) => /var\(--lufia-target-touch\)/.test(readFileSync(path, "utf8")));
    expect(bare).toEqual([]);
  });

  it("gives the table toolbar search input and clear button the touch size at narrow widths", () => {
    const css = flat("src/components/TableToolbar/TableToolbar.module.css");
    expect(css).toMatch(
      /@media \(pointer: coarse\), \(width < 40rem\) \{[^@]*\.searchInput \{ min-block-size: var\(--lufia-target-touch, 2\.75rem\);/,
    );
    expect(css).toContain("min-block-size: var(--lufia-target-touch, 2.75rem); }");
  });

  it("gives the file remove button the touch size at narrow widths and a 24px floor everywhere", () => {
    const css = flat("src/components/FileField/FileField.module.css");
    expect(css).toMatch(/\.remove \{[^}]*min-block-size: 2\.25rem;/);
    expect(css).toMatch(
      /@media \(pointer: coarse\), \(width < 40rem\) \{ \.remove \{ min-inline-size: var\(--lufia-target-touch, 2\.75rem\); min-block-size: var\(--lufia-target-touch, 2\.75rem\);/,
    );
  });
});
