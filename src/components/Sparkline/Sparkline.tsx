import type { CSSProperties, SVGAttributes } from "react";
import type { ChartTone } from "../ChartKit";
import styles from "./Sparkline.module.css";

export type SparklineVariant = "columns" | "line";

export type SparklineProps = Omit<
  SVGAttributes<SVGSVGElement>,
  "children" | "role" | "aria-label" | "values"
> & {
  /** The series, oldest first. Non-finite numbers count as 0. */
  values: readonly number[];
  /** `columns` draws one bar per value from a zero baseline, `line` a trend line scaled to the range. */
  variant?: SparklineVariant;
  tone?: ChartTone;
  /**
   * Accessible name: a sentence that carries the numbers ("Deliveries per week: 3, 5, 4, 8"). Pass `null` to hide the
   * drawing from assistive technology, only when the numbers are printed as text next to it.
   */
  label: string | null;
};

const WIDTH = 120;
const HEIGHT = 24;
const MAX_STAGGER = 6;

const finite = (value: number) => (Number.isFinite(value) ? value : 0);

function columns(values: readonly number[]) {
  const max = Math.max(1, ...values.map((value) => Math.max(0, value)));
  const gap = Math.min(3, (WIDTH / Math.max(1, values.length)) * 0.25);
  const column = (WIDTH - gap * (values.length - 1)) / Math.max(1, values.length);
  return values.map((value, index) => {
    const height = value > 0 ? Math.max(3, (value / max) * HEIGHT) : 1.5;
    return (
      <rect
        key={index}
        className={value > 0 ? styles.column : `${styles.column} ${styles.zero}`}
        style={{ "--chart-index": Math.min(index, MAX_STAGGER) } as CSSProperties}
        x={index * (column + gap)}
        y={HEIGHT - height}
        width={column}
        height={height}
        rx={1}
      />
    );
  });
}

function line(values: readonly number[]) {
  const pad = 2;
  const min = Math.min(...values);
  const range = Math.max(...values) - min;
  const y = (value: number) =>
    range === 0 ? HEIGHT / 2 : HEIGHT - pad - ((value - min) / range) * (HEIGHT - pad * 2);
  const points =
    values.length === 1
      ? [`0 ${y(values[0]!)}`, `${WIDTH} ${y(values[0]!)}`]
      : values.map((value, index) => `${(index * WIDTH) / (values.length - 1)} ${y(value)}`);
  return <path className={styles.line} d={`M${points.join(" L")}`} pathLength={1} />;
}

/**
 * A word-sized chart with no axes, for the trend next to a figure. Drawn in SVG with no chart library.
 *
 * Give it a `label` that states the numbers, or pass `null` when the sentence beside it already does.
 * The draw-in plays once when it mounts, on `transform` and stroke only, and is removed under reduced motion.
 */
export function Sparkline({
  values,
  variant = "columns",
  tone = "accent",
  label,
  className,
  ...rest
}: SparklineProps) {
  const series = values.map(finite);
  return (
    <svg
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role={label === null ? undefined : "img"}
      aria-label={label === null ? undefined : label}
      aria-hidden={label === null ? true : undefined}
      focusable="false"
      data-variant={variant}
      data-tone={tone}
    >
      {series.length === 0 ? null : variant === "line" ? line(series) : columns(series)}
    </svg>
  );
}
