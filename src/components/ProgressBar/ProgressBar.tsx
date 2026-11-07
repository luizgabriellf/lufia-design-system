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
};

/**
 * A determinate progress bar: a native `progressbar` role with its value, drawn as a track and a fill.
 *
 * It states a fraction, so print the figure beside it as text. The fill draws in once on mount and is removed under
 * reduced motion; later changes of `value` apply at once, because animating width would move layout.
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  valueText,
  tone = "accent",
  size = "md",
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
      {now > 0 ? <span className={styles.fill} style={{ inlineSize: `${(now * 100) / top}%` }} /> : null}
    </div>
  );
}
