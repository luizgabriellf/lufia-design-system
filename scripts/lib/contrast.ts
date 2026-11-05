/** WCAG 2.2 contrast helpers. Shared by the CI check and the Storybook foundations pages. */

export type Rgba = { r: number; g: number; b: number; a: number };

/** Parses `#rgb`, `#rrggbb`, `#rrggbbaa` and `rgb()/rgba()` strings. */
export function parseColor(input: string): Rgba {
  const value = input.trim().toLowerCase();
  if (value.startsWith("#")) {
    let hex = value.slice(1);
    if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
    if (hex.length !== 6 && hex.length !== 8) throw new Error(`Unsupported colour: ${input}`);
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
    };
  }
  const match = value.match(/^rgba?\(([^)]+)\)$/);
  if (!match?.[1]) throw new Error(`Unsupported colour: ${input}`);
  const parts = match[1]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map(Number);
  return { r: parts[0]!, g: parts[1]!, b: parts[2]!, a: parts[3] ?? 1 };
}

/** Source-over compositing of `top` on an already opaque `bottom`. */
export function composite(top: Rgba, bottom: Rgba): Rgba {
  const a = top.a;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    a: 1,
  };
}

export function luminance({ r, g, b }: Rgba): number {
  const lin = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

export function contrastRatio(fg: Rgba, bg: Rgba): number {
  const solidFg = fg.a < 1 ? composite(fg, bg) : fg;
  const l1 = luminance(solidFg);
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Flattens a stack of layers (bottom first) into one opaque colour. */
export function flatten(layers: string[]): Rgba {
  return layers
    .map(parseColor)
    .reduce((below, layer) => composite(layer, below), { r: 255, g: 255, b: 255, a: 1 });
}

export function ratioFor(fgLayers: string[], bgLayers: string[]): number {
  const bg = flatten(bgLayers);
  const fg = parseColor(fgLayers[fgLayers.length - 1]!);
  return contrastRatio(fg, bg);
}
