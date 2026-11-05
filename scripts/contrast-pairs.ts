/** Semantic pairs checked in every theme x mode. Backgrounds list layers bottom-first so translucent tokens are composited. */
export type Pair = {
  id: string;
  fg: string;
  bg: string[];
  /** 4.5 for text, 3 for large text and non-text UI (WCAG 1.4.3 / 1.4.11). */
  min: 4.5 | 3;
};

const TEXT_ON: Record<string, string[]> = {
  canvas: ["bg.canvas"],
  surface: ["bg.canvas", "bg.surface"],
  "surface-raised": ["bg.canvas", "bg.surface-raised"],
  "surface-solid": ["bg.canvas", "bg.surface-solid"],
  field: ["bg.canvas", "bg.field"],
};

const pairs: Pair[] = [];
for (const [surface, layers] of Object.entries(TEXT_ON)) {
  for (const fg of ["text.default", "text.muted", "text.subtle", "text.accent"]) {
    pairs.push({ id: `${fg} on ${surface}`, fg, bg: layers, min: 4.5 });
  }
}
for (const tone of ["success", "warning", "danger", "ai"]) {
  pairs.push({
    id: `status.${tone}.fg on status.${tone}.bg`,
    fg: `status.${tone}.fg`,
    bg: ["bg.canvas", "bg.surface", `status.${tone}.bg`],
    min: 4.5,
  });
  pairs.push({
    id: `status.${tone}.fg on surface`,
    fg: `status.${tone}.fg`,
    bg: ["bg.canvas", "bg.surface"],
    min: 4.5,
  });
}
pairs.push(
  {
    id: "status.neutral.fg on status.neutral.bg",
    fg: "status.neutral.fg",
    bg: ["bg.canvas", "status.neutral.bg"],
    min: 4.5,
  },
  {
    id: "text.on-accent on accent.default",
    fg: "text.on-accent",
    bg: ["bg.canvas", "accent.default"],
    min: 4.5,
  },
  {
    id: "status.danger.on-solid on status.danger.solid",
    fg: "status.danger.on-solid",
    bg: ["bg.canvas", "status.danger.solid"],
    min: 4.5,
  },
  {
    id: "text.accent on accent.subtle",
    fg: "text.accent",
    bg: ["bg.canvas", "bg.surface", "accent.subtle"],
    min: 4.5,
  },
  { id: "focus.ring on canvas (UI)", fg: "focus.ring", bg: ["bg.canvas"], min: 3 },
  { id: "focus.ring on surface (UI)", fg: "focus.ring", bg: ["bg.canvas", "bg.surface"], min: 3 },
  { id: "accent.default on canvas (UI)", fg: "accent.default", bg: ["bg.canvas"], min: 3 },
);

export default pairs;
