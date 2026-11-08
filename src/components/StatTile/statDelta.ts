import type { StatTileTone, StatTileTrend } from "./StatTile";

export type StatDeltaGoodDirection = "up" | "down" | "neutral";

export type StatDeltaLabels = {
  /** Direction word read before the change when it rose ("Up"). */
  up: string;
  /** Direction word when it fell ("Down"). */
  down: string;
  /** Direction word when it did not change ("No change"). */
  flat: string;
  /**
   * The period compared against ("vs previous 30 days"). A string is appended after the formatted change. A function
   * receives the formatted change ("+12%") and returns the whole text of `delta`, so a language can put the period first.
   */
  comparison: string | ((change: string) => string);
};

export type StatDeltaInput = {
  /** The figure the tile shows. */
  current: number;
  /** The figure of the period compared against. `null`, `undefined` and `NaN` mean no history: the result is `null`. */
  previous: number | null | undefined;
  /** Which direction is good news. It decides the tone: a good change is `success`, a bad one `badTone`. */
  goodDirection: StatDeltaGoodDirection;
  /** BCP 47 tag for number formatting. Defaults to the runtime locale. */
  locale?: string;
  /** All text comes from the caller: the package has no built-in language. */
  labels: StatDeltaLabels;
  /** Tone of a change in the wrong direction. Default `warning`. A flat change and `goodDirection: "neutral"` stay `neutral`. */
  badTone?: Extract<StatTileTone, "warning" | "danger">;
  /**
   * `percent` or `absolute` forces the format. Unset (default), the helper uses percent and switches to absolute when the
   * base is too small. A base of exactly 0 is always absolute, because a percentage of zero does not exist.
   */
  mode?: "percent" | "absolute";
  /** Below this `|previous|` the default mode shows an absolute change instead of a percentage. Default 5. */
  minBase?: number;
  /** Formats the size of an absolute change (a non-negative number, no sign: the helper adds it). Default `Intl.NumberFormat`. */
  formatValue?: (magnitude: number) => string;
  /** A percentage change within plus or minus this many percent counts as flat. Default 0.5. Absolute mode is flat only when equal. */
  flatThreshold?: number;
};

export type StatDelta = {
  delta: string;
  trend: StatTileTrend;
  trendLabel: string;
  deltaTone: StatTileTone;
};

export const DEFAULT_MIN_BASE = 5;
export const DEFAULT_FLAT_THRESHOLD = 0.5;

function signs(locale: string | undefined): { plus: string; minus: string } {
  const parts = (n: number) => new Intl.NumberFormat(locale, { signDisplay: "always" }).formatToParts(n);
  return {
    plus: parts(1).find((p) => p.type === "plusSign")?.value ?? "+",
    minus: parts(-1).find((p) => p.type === "minusSign")?.value ?? "-",
  };
}

function formatPercent(percent: number, locale: string | undefined): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    signDisplay: "exceptZero",
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.abs(percent) < 10 ? 1 : 0,
  }).format(percent / 100);
}

function tone(
  trend: StatTileTrend,
  goodDirection: StatDeltaGoodDirection,
  badTone: "warning" | "danger",
): StatTileTone {
  if (trend === "flat" || goodDirection === "neutral") return "neutral";
  return trend === goodDirection ? "success" : badTone;
}

/**
 * Computes the props of `StatTile` that describe a change against a previous period: `delta`, `trend`, `trendLabel` and
 * `deltaTone`. Spread the result into the tile. Returns `null` when there is no previous value, so the tile shows no
 * change until there is history.
 *
 * It is pure and locale-aware, so it is safe on the server. The default format is a percentage with one decimal under 10%
 * and none above. On a zero or small base (`|previous|` below `minBase`) it switches to the absolute change, so a tile
 * never says "+Infinity%" or "+400%" for going from 1 to 5.
 */
export function computeStatDelta(input: StatDeltaInput): StatDelta | null {
  const {
    current,
    previous,
    goodDirection,
    locale,
    labels,
    badTone = "warning",
    mode,
    minBase = DEFAULT_MIN_BASE,
    formatValue,
    flatThreshold = DEFAULT_FLAT_THRESHOLD,
  } = input;
  if (
    previous === null ||
    previous === undefined ||
    !Number.isFinite(previous) ||
    !Number.isFinite(current)
  ) {
    return null;
  }

  const diff = current - previous;
  const absolute =
    previous === 0 || mode === "absolute" || (mode === undefined && Math.abs(previous) < minBase);
  const percent = absolute ? 0 : (diff / Math.abs(previous)) * 100;
  const flat = absolute ? diff === 0 : Math.abs(percent) <= flatThreshold;
  const trend: StatTileTrend = flat ? "flat" : diff > 0 ? "up" : "down";

  let change: string;
  if (!absolute) {
    change = formatPercent(percent, locale);
  } else if (formatValue) {
    const { plus, minus } = signs(locale);
    change = `${diff > 0 ? plus : diff < 0 ? minus : ""}${formatValue(Math.abs(diff))}`;
  } else {
    change = new Intl.NumberFormat(locale, { signDisplay: "exceptZero" }).format(diff);
  }

  const { comparison } = labels;
  return {
    delta: typeof comparison === "function" ? comparison(change) : `${change} ${comparison}`,
    trend,
    trendLabel: labels[trend],
    deltaTone: tone(trend, goodDirection, badTone),
  };
}
