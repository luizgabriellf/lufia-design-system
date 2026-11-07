import { readFileSync } from "node:fs";

/** The stylesheet with whitespace collapsed, so a declaration Prettier wrapped over lines still matches. */
const read = (name: string) =>
  readFileSync(`src/components/${name}/${name}.module.css`, "utf8")
    .replace(/\s+/g, " ")
    .replace(/\( /g, "(")
    .replace(/,? \)/g, ")");

/**
 * Component tokens are read with a fallback equal to the value the component had before the token existed, so a consuming
 * app that sets nothing sees no change. Each row is `[component, declaration that must be in its stylesheet]`.
 */
const CONTRACT: [string, string][] = [
  ["PageHeader", "color: var(--lufia-page-header-eyebrow-color, var(--lufia-color-text-subtle))"],
  ["PageHeader", "letter-spacing: var(--lufia-page-header-eyebrow-tracking, 0.08em)"],
  ["PageHeader", "inline-size: var(--lufia-page-header-eyebrow-dash-size, 0)"],
  [
    "PageHeader",
    "block-size: var(--lufia-page-header-eyebrow-dash-thickness, var(--lufia-border-width-thin))",
  ],
  ["PageHeader", "font-weight: var(--lufia-page-header-eyebrow-weight, var(--lufia-font-weight-semibold))"],
  ["PageHeader", "font-size: var(--lufia-page-header-title-size, var(--lufia-font-size-2xl))"],
  ["PageHeader", "font-size: var(--lufia-page-header-title-size, var(--lufia-font-size-3xl))"],
  ["PageHeader", "letter-spacing: var(--lufia-page-header-title-tracking, normal)"],
  ["StatTile", "color: var(--lufia-stat-tile-label-color, var(--lufia-color-text-muted))"],
  ["StatTile", "font-family: var(--lufia-stat-tile-label-font, var(--lufia-font-family-mono))"],
  ["StatTile", "font-size: var(--lufia-stat-tile-label-size, var(--lufia-font-size-2xs))"],
  ["StatTile", "letter-spacing: var(--lufia-stat-tile-label-tracking, 0.09em)"],
  ["StatTile", "font-size: var(--lufia-stat-tile-value-size, var(--lufia-font-size-3xl))"],
  ["Card", "padding: var(--lufia-card-header-padding, var(--card-padding))"],
  [
    "Card",
    "padding: var(--lufia-card-body-padding, var(--lufia-card-body-padding-block, var(--card-padding)) var(--lufia-card-body-padding-inline, var(--card-padding)))",
  ],
  [
    "Card",
    "padding-block-start: var(--lufia-card-body-padding, var(--lufia-card-body-padding-block, var(--card-padding)))",
  ],
  ["Card", "box-shadow: var(--lufia-card-shadow, var(--lufia-shadow-sm))"],
  ["Card", "box-shadow: var(--lufia-card-shadow-hover, var(--lufia-shadow-md))"],
  [
    "AttentionList",
    "inset-block: var(--lufia-attention-list-bar-inset-block, var(--lufia-attention-list-bar-inset, 0.5rem))",
  ],
  [
    "AttentionList",
    "inset-inline-start: var(--lufia-attention-list-bar-inset-inline, var(--lufia-attention-list-bar-inset, 0.5rem))",
  ],
  [
    "AttentionList",
    "calc(var(--lufia-attention-list-bar-inset-inline, var(--lufia-attention-list-bar-inset, 0.5rem)) + var(--attention-bar-width) + 0.75rem)",
  ],
  ["AttentionList", "--attention-bar-width: var(--lufia-attention-list-bar-width, 0.25rem)"],
  ["Badge", "border-radius: var(--lufia-badge-radius, var(--lufia-radius-full))"],
  ["ColumnChart", "grid-template-rows: var(--lufia-column-chart-plot-height, 7rem) auto"],
  ["Toast", "inline-size: var(--lufia-toast-width, 24rem)"],
  ["Toast", "min-inline-size: var(--lufia-toast-min-width, auto)"],
  ["Toast", "max-inline-size: var(--lufia-toast-max-width, calc(100% - 2 * var(--lufia-space-4)))"],
  ["Toast", "gap: var(--lufia-toast-gap, var(--lufia-space-3))"],
  ["Toast", "flex-direction: column; gap: var(--lufia-toast-gap, var(--lufia-space-3)); max-inline-size"],
  ["Toast", "align-items: var(--lufia-toast-align-items, flex-start)"],
  ["Toast", "line-height: var(--lufia-toast-line-height, var(--lufia-font-line-height-normal))"],
  ["Toast", "padding-block: var(--lufia-toast-padding-block, var(--lufia-space-3))"],
  [
    "Toast",
    "padding-inline: var(--lufia-toast-padding-inline-start, var(--lufia-toast-padding-inline, var(--lufia-space-4))) var(--lufia-toast-padding-inline-end, var(--lufia-toast-padding-inline, var(--lufia-space-3)))",
  ],
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
