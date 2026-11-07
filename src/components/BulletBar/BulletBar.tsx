import type { HTMLAttributes } from "react";
import type { ChartTone } from "../ChartKit";
import styles from "./BulletBar.module.css";

export type BulletBarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children" | "role" | "aria-label"> & {
  value: number;
  /** Where the tick sits. The scale is the target, so bars of different rows share one "percent of target" axis. */
  target: number;
  /** Room past the target, as a multiple of it. Defaults to 1.25. */
  headroom?: number;
  tone?: ChartTone;
  /**
   * Accessible name stating the value, the target and what they mean ("Delivered 80 of 100"). Pass `null` to hide the
   * drawing from assistive technology, only when the numbers are printed as text next to it.
   */
  label: string | null;
};

/**
 * A value as a bar against a target tick. The scale is the target, so the tick sits at the same place on every row
 * of a list. Print the numbers as text: the bar adds shape, not data. The draw-in plays once and is removed under
 * reduced motion.
 */
export function BulletBar({
  value,
  target,
  headroom = 1.25,
  tone = "accent",
  label,
  className,
  ...rest
}: BulletBarProps) {
  const scale = Math.max(1, target) * headroom;
  const at = (amount: number) => `${Math.max(0, Math.min(100, (amount * 100) / scale))}%`;
  return (
    <span
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      role={label === null ? undefined : "img"}
      aria-label={label === null ? undefined : label}
      aria-hidden={label === null ? true : undefined}
      data-tone={tone}
    >
      {value > 0 ? <span className={styles.fill} style={{ inlineSize: at(value) }} /> : null}
      {target > 0 ? <span className={styles.tick} style={{ insetInlineStart: at(target) }} /> : null}
    </span>
  );
}
