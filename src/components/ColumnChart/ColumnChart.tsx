import { useId, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import type { ChartTone } from "../ChartKit";
import styles from "./ColumnChart.module.css";

export type ColumnChartSeries = {
  /** Stable id, used as the React key. */
  key: string;
  /** Names the series in the legend and in the data table. Required: colour alone never names a series. */
  label: string;
  /** Colour of the series. Defaults by position: accent, neutral, success, warning, danger, then it repeats. */
  tone?: ChartTone;
};

export type ColumnChartColumn = {
  /** Stable id, used as the React key. */
  key: string;
  /** Printed under the column and used as its heading in the data table ("Mon", "Week 12"). */
  label: ReactNode;
  /** One number per series, in the order of `series`. Missing numbers count as 0. Negative and non-finite numbers are drawn as 0 but the data table shows them as given (through `formatValue`), so bad data is visible to assistive technology and not silently hidden. */
  values: readonly number[];
};

export type ColumnChartProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  /** Caption of the figure, and its accessible name. */
  title: ReactNode;
  /** `"hidden"` keeps the title as the accessible name for screen readers only. Defaults to `"visible"`. */
  titleVisibility?: "visible" | "hidden";
  /** A written summary of what the columns show. Shown above them. */
  summary?: ReactNode;
  /** The measures. One series draws plain columns; several stack in this order, the first at the bottom. */
  series: readonly ColumnChartSeries[];
  /** One column per entry, left to right (right to left in an RTL page). */
  columns: readonly ColumnChartColumn[];
  /**
   * How a number is written in the data table ("12 h", "1,240"). Defaults to `String`. Format with your locale here.
   */
  formatValue?: (value: number) => string;
  /** The legend of a stacked chart. `"auto"` (default) shows it when there is more than one series. */
  legend?: "auto" | "hidden";
};

const DEFAULT_TONES: readonly ChartTone[] = ["accent", "neutral", "success", "warning", "danger"];
const MAX_STAGGER = 6;
/** Series told apart by a fill pattern in forced-colors mode, where tones collapse to one colour. */
const PATTERNS = 5;

const clean = (value: number | undefined) =>
  value !== undefined && Number.isFinite(value) && value > 0 ? value : 0;

/**
 * Columns on one zero baseline, for a weekly strip or a stack of measures per period.
 *
 * The data is a visually hidden table named by the title (series are rows, columns are the headings) that a screen reader can navigate; the
 * drawing is `aria-hidden` shape on top of it. One scale for the whole chart, so columns compare. A zero column keeps its
 * slot and shows a thin baseline mark. The draw-in plays once on mount, on `transform` only, and is removed under reduced
 * motion. Renders nothing when `columns` or `series` is empty: show an `EmptyState` instead.
 */
export function ColumnChart({
  title,
  titleVisibility = "visible",
  summary,
  series,
  columns,
  formatValue = String,
  legend = "auto",
  className,
  style,
  ...rest
}: ColumnChartProps) {
  const captionId = useId();
  if (columns.length === 0 || series.length === 0) return null;
  const toneOf = (index: number) => series[index]!.tone ?? DEFAULT_TONES[index % DEFAULT_TONES.length]!;
  const totals = columns.map((column) =>
    series.reduce((sum, _series, index) => sum + clean(column.values[index]), 0),
  );
  const max = Math.max(0, ...totals);
  const showLegend = legend === "auto" && series.length > 1;
  return (
    <figure
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={style}
      aria-labelledby={captionId}
    >
      <figcaption
        id={captionId}
        className={[styles.title, titleVisibility === "hidden" ? styles.titleHidden : ""]
          .filter(Boolean)
          .join(" ")}
        data-title-visibility={titleVisibility}
      >
        {title}
      </figcaption>
      {summary ? <p className={styles.summary}>{summary}</p> : null}
      <div className={styles.plot} aria-hidden="true" data-empty={max === 0 ? "" : undefined}>
        {columns.map((column, columnIndex) => (
          <div key={column.key} className={styles.column}>
            <div className={styles.stack}>
              {totals[columnIndex] === 0 ? (
                <span className={styles.zero} data-zero="" />
              ) : (
                series.map((entry, index) => {
                  const value = clean(column.values[index]);
                  return value > 0 ? (
                    <span
                      key={entry.key}
                      className={styles.segment}
                      data-tone={toneOf(index)}
                      data-series={index % PATTERNS}
                      style={
                        {
                          blockSize: `${(value * 100) / max}%`,
                          "--chart-index": Math.min(columnIndex, MAX_STAGGER),
                        } as CSSProperties
                      }
                    />
                  ) : null;
                })
              )}
            </div>
            <span className={styles.label}>{column.label}</span>
          </div>
        ))}
      </div>
      {showLegend ? (
        <ul className={styles.legend}>
          {series.map((entry, index) => (
            <li
              key={entry.key}
              className={styles.legendItem}
              data-tone={toneOf(index)}
              data-series={index % PATTERNS}
            >
              {entry.label}
            </li>
          ))}
        </ul>
      ) : null}
      <table className={styles.table} aria-labelledby={captionId}>
        <thead>
          <tr>
            <td />
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {series.map((entry, index) => (
            <tr key={entry.key}>
              <th scope="row">{entry.label}</th>
              {columns.map((column) => (
                <td key={column.key}>{formatValue(column.values[index] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
