import type { HTMLAttributes } from "react";
import type { ChartTone } from "../ChartKit";
import styles from "./ProgressBar.module.css";

type ProgressBarValue =
  | {
      /** Current value, from 0 to `max`. Values outside the range are clamped. Left out only with `indeterminate`. */
      value: number;
      indeterminate?: false;
    }
  | {
      value?: undefined;
      /**
       * The work has started and its length is not known: a short fill travels along the track and the bar states no
       * value (`aria-valuenow` is absent, which is how assistive technology reads "busy"). Use it for a wait of a few
       * seconds inside a panel; switch to `value` as soon as a fraction is known. Under reduced motion the fill stays
       * in place and fades gently instead of travelling.
       */
      indeterminate: true;
    };

export type ProgressBarProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "role"> &
  ProgressBarValue & {
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
 * A progress bar: a native `progressbar` role with its value, drawn as a track and a fill. With `indeterminate` it has
 * no value and shows that work is under way.
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
  indeterminate = false,
  className,
  ...rest
}: ProgressBarProps) {
  const top = max > 0 ? max : 100;
  const now = Math.max(0, Math.min(top, typeof value === "number" && Number.isFinite(value) ? value : 0));
  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={top}
      aria-valuenow={indeterminate ? undefined : now}
      aria-valuetext={valueText}
      data-tone={tone}
      data-size={size}
      data-indeterminate={indeterminate ? "" : undefined}
    >
      {indeterminate ? (
        <span className={styles.fill} data-indeterminate="" />
      ) : animateChanges ? (
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
