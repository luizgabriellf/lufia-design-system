import { useId, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import type { ChartTone } from "../ChartKit";
import styles from "./ColumnChart.module.css";
import { ColumnChartPlot } from "./ColumnChartPlot";

export type ColumnChartSeries = {
  /** Stable id, used as the React key. */
  key: string;
  /** Names the series in the legend and in the data table. Required: colour alone never names a series. */
  label: string;
  /** Colour of the series. Defaults by position: accent, neutral, success, warning, danger, then it repeats. */
  tone?: ChartTone;
  /**
   * `"hatch"` draws the series with diagonal stripes, in the columns and in the legend, so it is told apart without colour
   * (a forecast, a provisional figure). Off by default. In `forced-colors` mode every series already has its own fill
   * pattern, which then takes over.
   */
  pattern?: "hatch";
};

export type ColumnChartColumn = {
  /** Stable id, used as the React key. */
  key: string;
  /** Printed under the column and used as its heading in the data table ("Mon", "Week 12"). */
  label: ReactNode;
  /** One number per series, in the order of `series`. Missing numbers count as 0. Negative and non-finite numbers are drawn as 0 but the data table shows them as given (through `formatValue`), so bad data is visible to assistive technology and not silently hidden. */
  values: readonly number[];
  /**
   * A line of context for this column ("Holiday, shop closed"). Shown in the tooltip and read as part of the column's name
   * when the chart is `interactive`; ignored otherwise.
   */
  detail?: string;
  /**
   * An error bar for this column: the range the real value is expected to fall in ("12 h" measured, 10 to 14 h likely).
   * Drawn on the same scale as the columns and counted in the maximum, so a bar above every column still fits. Listed in
   * the data table under `bandLabel`, and in the tooltip. Negative or non-finite numbers, or `high` below `low`, drop it.
   */
  band?: { low: number; high: number };
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
  /**
   * Makes every column a focusable element named "<column label>: <values> · <detail>" that shows a tooltip on hover, focus
   * and tap. Escape dismisses the tooltip. Off by default: the chart is then static and needs no client code.
   */
  interactive?: boolean;
  /**
   * Prints the formatted total above each column. `"auto"` prints it when there are 6 columns or fewer, so a long strip
   * does not crowd; `true` always and `false` (default) never. The numbers repeat the data table, so they are hidden from
   * assistive technology.
   */
  printValues?: "auto" | boolean;
  /** Names the range row of the data table and the range in the tooltip, when a column has a `band`. Aria and tooltip text, so it has an English default. Defaults to `"Range"`. */
  bandLabel?: string;
  /**
   * What a screen reader calls each column when `interactive` is set (`aria-roledescription`), so it is announced as a
   * "column", not as an image, which tells people the arrow keys move between columns. Aria-only text, so it has an
   * English default. Defaults to `"column"`.
   */
  columnLabel?: string;
};

const DEFAULT_TONES: readonly ChartTone[] = ["accent", "neutral", "success", "warning", "danger"];
const MAX_STAGGER = 6;
/** Series told apart by a fill pattern in forced-colors mode, where tones collapse to one colour. */
const PATTERNS = 5;
/** `printValues="auto"` prints the totals up to this many columns. */
const PRINT_AUTO_MAX = 6;

const clean = (value: number | undefined) =>
  value !== undefined && Number.isFinite(value) && value > 0 ? value : 0;

/**
 * Columns on one zero baseline, for a weekly strip or a stack of measures per period.
 *
 * The data is a visually hidden table named by the title (series are rows, columns are the headings) that a screen reader can navigate; the
 * drawing is `aria-hidden` shape on top of it (unless `interactive`, which exposes the columns). One scale for the whole chart, so columns compare. A zero column keeps its
 * slot and shows a thin baseline mark. The draw-in plays once on mount, on `transform` only, and is removed under reduced
 * motion. Renders nothing when `columns` or `series` is empty: show an `EmptyState` instead.
 *
 * Opt-in: `interactive` makes each column focusable with a tooltip (hover, focus, tap; Escape dismisses), `printValues` prints
 * the totals above the columns, a column `band` draws an error bar, and a series `pattern` adds a non-colour cue.
 */
export function ColumnChart({
  title,
  titleVisibility = "visible",
  summary,
  series,
  columns,
  formatValue = String,
  legend = "auto",
  interactive = false,
  printValues = false,
  bandLabel = "Range",
  columnLabel = "column",
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
  const bands = columns.map((column) => {
    const low = clean(column.band?.low);
    const high = clean(column.band?.high);
    const valid = column.band && Number.isFinite(column.band.low) && Number.isFinite(column.band.high);
    return valid && high >= low && high > 0 ? { low, high } : null;
  });
  const max = Math.max(0, ...totals, ...bands.map((band) => band?.high ?? 0));
  const showLegend = legend === "auto" && series.length > 1;
  const printTotals = printValues === "auto" ? columns.length <= PRINT_AUTO_MAX : printValues;
  const hasBands = bands.some(Boolean);
  const bandText = (index: number) => {
    const band = bands[index];
    return band ? `${formatValue(band.low)} \u2013 ${formatValue(band.high)}` : "";
  };
  // What a column says, as text: one number per series (named when there are several), then its range.
  const valuesText = (column: ColumnChartColumn, index: number) =>
    [
      series
        .map((entry, seriesIndex) => {
          const text = formatValue(column.values[seriesIndex] ?? 0);
          return series.length > 1 ? `${entry.label} ${text}` : text;
        })
        .join(", "),
      bands[index] ? `${bandLabel} ${bandText(index)}` : "",
    ]
      .filter(Boolean)
      .join(", ");
  const columnNodes = columns.map((column, columnIndex) => {
    const rest = [valuesText(column, columnIndex), column.detail].filter(Boolean).join(" \u00b7 ");
    const plainLabel = typeof column.label === "string" || typeof column.label === "number";
    const band = bands[columnIndex];
    const interactiveProps = interactive
      ? plainLabel
        ? { "aria-label": `${column.label}: ${rest}` }
        : { "aria-labelledby": `${captionId}-l${columnIndex} ${captionId}-r${columnIndex}` }
      : null;
    return (
      <div
        key={column.key}
        className={styles.column}
        {...(interactiveProps
          ? {
              ...interactiveProps,
              role: "img",
              "aria-roledescription": columnLabel,
              "data-column": columnIndex,
              "data-interactive": "",
            }
          : null)}
      >
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
                  data-pattern={entry.pattern}
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
          {band ? (
            <span
              className={styles.band}
              data-band=""
              style={
                {
                  insetBlockEnd: `${(band.low * 100) / max}%`,
                  blockSize: `${((band.high - band.low) * 100) / max}%`,
                } as CSSProperties
              }
            />
          ) : null}
          {printTotals ? (
            <span
              className={styles.total}
              data-total=""
              style={{
                insetBlockEnd: `${((band ? Math.max(band.high, totals[columnIndex]!) : totals[columnIndex]!) * 100) / max}%`,
              }}
            >
              {formatValue(totals[columnIndex]!)}
            </span>
          ) : null}
        </div>
        <span id={`${captionId}-l${columnIndex}`} className={styles.label}>
          {column.label}
        </span>
        {interactiveProps && !plainLabel ? (
          <span id={`${captionId}-r${columnIndex}`} hidden>
            {rest}
          </span>
        ) : null}
      </div>
    );
  });
  const tips = interactive
    ? columns.map((column, columnIndex) => (
        <>
          <strong className={styles.tipTitle}>{column.label}</strong>
          <span>{valuesText(column, columnIndex)}</span>
          {column.detail ? <span className={styles.tipDetail}>{column.detail}</span> : null}
        </>
      ))
    : [];
  const plotProps = {
    "data-empty": max === 0 ? "" : undefined,
    "data-print-values": printTotals ? "" : undefined,
  };
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
      {interactive ? (
        <ColumnChartPlot {...plotProps} tips={tips}>
          {columnNodes}
        </ColumnChartPlot>
      ) : (
        <div className={styles.plot} aria-hidden="true" {...plotProps}>
          {columnNodes}
        </div>
      )}
      {showLegend ? (
        <ul className={styles.legend}>
          {series.map((entry, index) => (
            <li
              key={entry.key}
              className={styles.legendItem}
              data-tone={toneOf(index)}
              data-series={index % PATTERNS}
              data-pattern={entry.pattern}
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
          {hasBands ? (
            <tr>
              <th scope="row">{bandLabel}</th>
              {columns.map((column, index) => (
                <td key={column.key}>{bandText(index)}</td>
              ))}
            </tr>
          ) : null}
        </tbody>
      </table>
    </figure>
  );
}
