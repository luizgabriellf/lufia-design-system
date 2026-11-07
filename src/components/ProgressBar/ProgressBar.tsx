import type { HTMLAttributes } from "react";
import type { ChartTone } from "../ChartKit";
import styles from "./ProgressBar.module.css";

export type ProgressBarProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "role"> & {
  /** Current value, from 0 to `max`. Values outside the range are clamped. */
  value: number;
  /** The value that means done. Defaults to 100. */
  max?: number;
  /** Accessible name of the bar ("Storage used"). Required: a progress bar without a name is announced as a bare number. */
  label: string;
  /** Spoken instead of the percentage when the number alone is not enough ("12 of 40 steps"). */
  valueText?: string;
  tone?: ChartTone;
  size?: "sm" | "md";
  /**
   * Animate later changes of `value` with a `transform: scaleX` transition. Off by default: `value` then applies at once.
   * The fill keeps its full width and is scaled, so no layout property animates. A non-zero value never draws thinner than 2% of the track. The end cap is scaled with the fill, so it flattens slightly for small values. Removed under reduced motion.
   */
  animateChanges?: boolean;
};

/** Smallest visible fill with `animateChanges` for a non-zero value: a sliver, as the width-based fill keeps with `min-inline-size`. */
const MIN_SCALE = 0.02;

/**
 * A determinate progress bar: a native `progressbar` role with its value, drawn as a track and a fill.
 *
 * It states a fraction, so print the figure beside it as text. The fill draws in once on mount and is removed under
 * reduced motion. Later changes of `value` apply at once, unless `animateChanges` is set: then the fill is scaled with a
 * `transform` transition (never width), and reduced motion applies the new value at once.
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  valueText,
  tone = "accent",
  size = "md",
  animateChanges = false,
  className,
  ...rest
}: ProgressBarProps) {
  const top = max > 0 ? max : 100;
  const now = Math.max(0, Math.min(top, Number.isFinite(value) ? value : 0));
  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={top}
      aria-valuenow={now}
      aria-valuetext={valueText}
      data-tone={tone}
      data-size={size}
    >
      {animateChanges ? (
        <span
          className={styles.fill}
          data-animate=""
          style={{ transform: `scaleX(${now > 0 ? Math.max(now / top, MIN_SCALE) : 0})` }}
        />
      ) : now > 0 ? (
        <span className={styles.fill} style={{ inlineSize: `${(now * 100) / top}%` }} />
      ) : null}
    </div>
  );
}
