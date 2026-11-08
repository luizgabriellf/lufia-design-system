import type { CSSProperties, HTMLAttributes } from "react";
import type { ChartTone } from "../ChartKit";
import styles from "./StackedBar.module.css";

export type StackedBarSegment = {
  /** Stable id, used as the React key. */
  key: string;
  /** Names the segment in the legend and to assistive technology. Required: colour alone never names a segment. */
  label: string;
  /** The amount, as a number. Negative and non-finite values count as 0. Its share is `value` over the sum of all segments. */
  value: number;
  /** Colour of the segment. Defaults by position: accent, neutral, success, warning, danger, then it repeats. */
  tone?: ChartTone;
  /**
   * `"hatch"` draws the segment with diagonal stripes, in the bar and in the legend, so it is told apart without colour.
   * Off by default. In `forced-colors` mode every segment already has its own fill pattern, which then takes over.
   */
  pattern?: "hatch";
};

export type StackedBarProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "role" | "aria-label"> & {
  /** The parts of the whole, in drawing order. Segments with no value are not drawn but stay in the legend and the text. */
  segments: readonly StackedBarSegment[];
  /** Accessible name of the whole bar ("Plan mix"). Required: the bar is a group that a screen reader reads by its parts. */
  label: string;
  /** Formats each value for the legend and the text alternative ("1,240", "3 sites"). Defaults to `String(value)`. */
  formatValue?: (value: number) => string;
  /**
   * Formats each share, given as a number from 0 to 100, for the legend and the text alternative. Defaults to the
   * rounded number and `%` ("38%"). Pass it to localise the number or the symbol.
   */
  formatPercent?: (percent: number) => string;
  /**
   * Prints the legend under the bar: a dot, the label and the value of every segment. When `false` the same list stays
   * in the page for screen readers only, so the bar never loses its text alternative. Defaults to `true`.
   */
  legend?: boolean;
  /** Prints each share next to its value in the legend. Off by default; the share is always read by assistive technology. */
  showPercent?: boolean;
};

const DEFAULT_TONES: readonly ChartTone[] = ["accent", "neutral", "success", "warning", "danger"];
/** Segments told apart by a fill pattern in forced-colors mode, where tones collapse to one colour. */
const PATTERNS = 5;

const clean = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);
const defaultPercent = (percent: number) => `${Math.round(percent)}%`;

/**
 * A single bar split into proportional segments, with a legend: a part-of-whole breakdown such as a plan mix.
 *
 * The text is the accessible data: every segment is a list item with its label, value and share, and the bar is
 * `aria-hidden` shape on top of it. The legend can be hidden visually and the list stays. A zero total draws an empty
 * track and reads 0% for every segment. Segments are told apart by a thin gap, an optional `pattern` and, in
 * `forced-colors` mode, one fill pattern each. The bar draws in once on mount and is removed under reduced motion.
 * For several measures per period use `ColumnChart`; for one value against a target use `BulletBar`.
 */
export function StackedBar({
  segments,
  label,
  formatValue = String,
  formatPercent = defaultPercent,
  legend = true,
  showPercent = false,
  className,
  ...rest
}: StackedBarProps) {
  const total = segments.reduce((sum, segment) => sum + clean(segment.value), 0);
  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={label}
    >
      <div className={styles.track} aria-hidden="true" data-empty={total === 0 ? "" : undefined}>
        {total > 0 ? (
          <div className={styles.bar}>
            {segments.map((segment, index) => {
              const value = clean(segment.value);
              return value > 0 ? (
                <span
                  key={segment.key}
                  className={styles.segment}
                  data-tone={segment.tone ?? DEFAULT_TONES[index % DEFAULT_TONES.length]}
                  data-series={index % PATTERNS}
                  data-pattern={segment.pattern}
                  style={{ inlineSize: `${(value * 100) / total}%` } as CSSProperties}
                />
              ) : null;
            })}
          </div>
        ) : null}
      </div>
      <ul className={styles.legend} data-visible={legend ? "" : undefined}>
        {segments.map((segment, index) => {
          const value = clean(segment.value);
          const percent = total > 0 ? (value * 100) / total : 0;
          return (
            <li
              key={segment.key}
              className={styles.item}
              data-tone={segment.tone ?? DEFAULT_TONES[index % DEFAULT_TONES.length]}
              data-series={index % PATTERNS}
              data-pattern={segment.pattern}
            >
              <span className={styles.name}>{segment.label}</span>{" "}
              <strong>{formatValue(segment.value)}</strong>{" "}
              <span className={styles.percent} data-visible={showPercent ? "" : undefined}>
                ({formatPercent(percent)})
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
