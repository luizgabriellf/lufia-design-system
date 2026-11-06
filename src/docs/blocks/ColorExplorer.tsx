import { Unstyled } from "@storybook/addon-docs/blocks";
import { useState } from "react";
import { flatten, ratioFor } from "../../../scripts/lib/contrast";
import { ContrastTable } from "../ColorTables";
import { tokensData, type TokenDoc } from "../tokensData";
import styles from "./ColorExplorer.module.css";

const THEMES = Object.keys(tokensData.themes);
const MODES = ["light", "dark"] as const;

type Spec = {
  /** Text colour drawn on a filled swatch, as a semantic path without the `color.` prefix. */
  sample?: string;
  /** Layers a filled swatch sits on, bottom first; the swatch itself is appended. */
  under?: string[];
  /** For text tokens: the layers the ink is drawn on, bottom first. */
  on?: string[];
  /** Minimum contrast: 4.5 for text, 3 for UI. Absent for decorative tokens. */
  min?: 4.5 | 3;
};

const CANVAS = ["bg.canvas"];
const SURFACE = ["bg.canvas", "bg.surface"];

/** How each semantic token is judged. Mirrors scripts/contrast-pairs.ts, which CI enforces on every surface. */
const SPECS: Record<string, Spec> = {
  "bg.canvas": { sample: "text.default", min: 4.5 },
  "bg.surface": { sample: "text.default", under: CANVAS, min: 4.5 },
  "bg.surface-raised": { sample: "text.default", under: CANVAS, min: 4.5 },
  "bg.surface-solid": { sample: "text.default", under: CANVAS, min: 4.5 },
  "bg.field": { sample: "text.default", under: CANVAS, min: 4.5 },
  "text.default": { on: CANVAS, min: 4.5 },
  "text.muted": { on: CANVAS, min: 4.5 },
  "text.subtle": { on: CANVAS, min: 4.5 },
  "text.accent": { on: CANVAS, min: 4.5 },
  "text.on-accent": { on: [...CANVAS, "accent.default"], min: 4.5 },
  "border.subtle": {},
  "border.strong": {},
  "accent.default": { sample: "text.on-accent", under: CANVAS, min: 4.5 },
  "accent.hover": { sample: "text.on-accent", under: CANVAS, min: 4.5 },
  "accent.subtle": { sample: "text.accent", under: SURFACE, min: 4.5 },
  "accent.border": {},
  "focus.ring": { under: CANVAS, min: 3 },
  "status.danger.solid": { sample: "status.danger.on-solid", under: CANVAS, min: 4.5 },
  "status.danger.on-solid": { on: [...CANVAS, "status.danger.solid"], min: 4.5 },
};

for (const tone of ["success", "warning", "danger", "ai"]) {
  SPECS[`status.${tone}.fg`] = { on: [...SURFACE, `status.${tone}.bg`], min: 4.5 };
  SPECS[`status.${tone}.bg`] = { sample: `status.${tone}.fg`, under: SURFACE, min: 4.5 };
  SPECS[`status.${tone}.border`] = {};
}
SPECS["status.neutral.fg"] = { on: [...CANVAS, "status.neutral.bg"], min: 4.5 };
SPECS["status.neutral.bg"] = { sample: "status.neutral.fg", under: CANVAS, min: 4.5 };

const GROUPS: { title: string; blurb: string; match: (path: string) => boolean }[] = [
  { title: "Surfaces", blurb: "What content sits on.", match: (p) => p.startsWith("bg.") },
  { title: "Text", blurb: "Judged against the page canvas.", match: (p) => p.startsWith("text.") },
  {
    title: "Borders",
    blurb: "Decorative separators, never the only cue.",
    match: (p) => p.startsWith("border."),
  },
  {
    title: "Accent and focus",
    blurb: "Interactive emphasis and the focus ring.",
    match: (p) => p.startsWith("accent.") || p.startsWith("focus."),
  },
  {
    title: "Status",
    blurb: "Success, warning, danger, AI and neutral.",
    match: (p) => p.startsWith("status."),
  },
];

function ratingFor(ratio: number, min: number | undefined) {
  if (!min) return { label: "Decorative", tone: "neutral" } as const;
  if (ratio + 1e-9 < min) return { label: "Fail", tone: "fail" } as const;
  if (min === 4.5 && ratio >= 7) return { label: "AAA", tone: "pass" } as const;
  return { label: "AA", tone: "pass" } as const;
}

/** Flattens layers (bottom first) into one opaque CSS colour, so no checkerboard shows through stacked tints. */
function opaque(colors: string[]): string {
  const { r, g, b } = flatten(colors);
  return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
}

function Swatch({ token, tokens }: { token: TokenDoc; tokens: Record<string, TokenDoc> }) {
  const path = token.path.slice(1).join(".");
  const spec = SPECS[path] ?? {};
  const value = (p: string) => tokens[`color.${p}`]?.value ?? "#000000";

  let background: string;
  let ink: string | undefined;
  let ratio: number | undefined;
  if (spec.on) {
    // Text token: drawn as ink on the layers it is used on.
    background = opaque(spec.on.map(value));
    ink = token.value;
    ratio = ratioFor([token.value], spec.on.map(value));
  } else {
    const under = (spec.under ?? []).map(value);
    const layers = [...under, token.value];
    // Without anything underneath, translucent tokens keep the checkerboard so they read as translucent.
    background = under.length
      ? `linear-gradient(${token.value}, ${token.value}), ${opaque(under)}`
      : token.value;
    ink = spec.sample ? value(spec.sample) : undefined;
    if (spec.min) ratio = ink ? ratioFor([ink], layers) : ratioFor([token.value], under);
  }
  const rating = ratingFor(ratio ?? 0, spec.min);

  return (
    <li className={styles.swatch}>
      <div className={styles.chip}>
        <span className={styles.chipFill} style={{ background }}>
          {ink ? (
            <span className={styles.sample} style={{ color: ink }} aria-hidden="true">
              Aa
            </span>
          ) : null}
        </span>
      </div>
      <div className={styles.meta}>
        <code className={styles.name}>{path}</code>
        <code className={styles.value}>{token.value}</code>
        {token.original ? <code className={styles.alias}>{token.original}</code> : null}
        <span className={styles.rating} data-tone={rating.tone}>
          {ratio !== undefined ? `${ratio.toFixed(2)}:1 · ` : ""}
          {rating.label}
        </span>
      </div>
    </li>
  );
}

/** Every semantic colour of one theme and mode, grouped, with the contrast ratio against the pair it is used with. */
export function ColorExplorer() {
  const [theme, setTheme] = useState(THEMES[0] ?? "default");
  const [mode, setMode] = useState<(typeof MODES)[number]>("light");
  const tokens = tokensData.themes[theme]?.[mode] ?? {};
  const entries = Object.values(tokens);

  return (
    <Unstyled>
      <div className={styles.explorer}>
        <div className={styles.controls}>
          <fieldset className={styles.segment}>
            <legend className={styles.legend}>Theme</legend>
            {THEMES.map((name) => (
              <button key={name} type="button" aria-pressed={theme === name} onClick={() => setTheme(name)}>
                {name}
              </button>
            ))}
          </fieldset>
          <fieldset className={styles.segment}>
            <legend className={styles.legend}>Mode</legend>
            {MODES.map((name) => (
              <button key={name} type="button" aria-pressed={mode === name} onClick={() => setMode(name)}>
                {name}
              </button>
            ))}
          </fieldset>
        </div>
        <div className={styles.panel} data-lufia-theme={theme} data-lufia-mode={mode}>
          {GROUPS.map((group) => {
            const members = entries.filter((token) => group.match(token.path.slice(1).join(".")));
            if (members.length === 0) return null;
            return (
              <section key={group.title} aria-labelledby={`colors-${group.title}`}>
                <h3 id={`colors-${group.title}`} className={styles.groupTitle}>
                  {group.title}
                  <span className={styles.blurb}>{group.blurb}</span>
                </h3>
                <ul className={styles.grid}>
                  {members.map((token) => (
                    <Swatch key={token.name} token={token} tokens={tokens} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
        <details className={styles.details}>
          <summary>All contrast pairs checked in CI for this theme and mode</summary>
          <ContrastTable theme={theme} mode={mode} />
        </details>
      </div>
    </Unstyled>
  );
}
