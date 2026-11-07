import { readFileSync } from "node:fs";

const read = (name: string) => readFileSync(`src/components/${name}/${name}.module.css`, "utf8");

/**
 * Component tokens are read with a fallback equal to the value the component had before the token existed, so a consuming
 * app that sets nothing sees no change. Each row is `[component, declaration that must be in its stylesheet]`.
 */
const CONTRACT: [string, string][] = [
  ["PageHeader", "color: var(--lufia-page-header-eyebrow-color, var(--lufia-color-text-subtle))"],
  ["PageHeader", "letter-spacing: var(--lufia-page-header-eyebrow-tracking, 0.08em)"],
  ["PageHeader", "inline-size: var(--lufia-page-header-eyebrow-dash-size, 0)"],
  ["PageHeader", "font-size: var(--lufia-page-header-title-size, var(--lufia-font-size-2xl))"],
  ["PageHeader", "font-size: var(--lufia-page-header-title-size, var(--lufia-font-size-3xl))"],
  ["PageHeader", "letter-spacing: var(--lufia-page-header-title-tracking, normal)"],
  ["StatTile", "color: var(--lufia-stat-tile-label-color, var(--lufia-color-text-muted))"],
  ["StatTile", "font-size: var(--lufia-stat-tile-label-size, var(--lufia-font-size-2xs))"],
  ["StatTile", "letter-spacing: var(--lufia-stat-tile-label-tracking, 0.09em)"],
  ["StatTile", "font-size: var(--lufia-stat-tile-value-size, var(--lufia-font-size-3xl))"],
  ["Card", "padding: var(--lufia-card-header-padding, var(--card-padding))"],
  ["Card", "padding: var(--lufia-card-body-padding, var(--card-padding))"],
  ["Card", "box-shadow: var(--lufia-card-shadow, var(--lufia-shadow-sm))"],
  ["Card", "box-shadow: var(--lufia-card-shadow-hover, var(--lufia-shadow-md))"],
  ["AttentionList", "--attention-bar-width: var(--lufia-attention-list-bar-width, 0.25rem)"],
];

describe("component tokens", () => {
  it.each(CONTRACT)("%s reads %s", (component, declaration) => {
    expect(read(component)).toContain(declaration);
  });

  // StatTile's width contract (a browser test would need a layout engine, which jsdom lacks and the repo has no browser
  // runner for): the root fills its container and may shrink to zero, and the narrow-tile query lives on the inner body, so
  // a tile never collapses to its padding in a flex row or a start-aligned grid.
  it("StatTile keeps its width contract", () => {
    const css = read("StatTile");
    expect(css).toMatch(/\.root \{[^}]*inline-size: 100%;[^}]*min-inline-size: 0;/);
    expect(css).toMatch(/\.body \{[^}]*container-type: inline-size;/);
    expect(css).not.toMatch(/\.root \{[^}]*container-type/);
  });
});
