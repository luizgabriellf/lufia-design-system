import { useId, type HTMLAttributes, type ReactNode } from "react";
import type { ChartTone } from "../ChartKit";
import styles from "./BarList.module.css";

export type BarListRow = {
  /** Stable id, used as the React key. */
  key: string;
  name: ReactNode;
  /** Small line under the name. */
  note?: ReactNode;
  /** The value as people read it, already formatted ("1,240", "38%"). The bar is drawn from `amount`. */
  value: ReactNode;
  /** Small line under the value. */
  detail?: ReactNode;
  /** The number the bar is drawn from. The largest amount in the list fills the track. */
  amount: number;
  tone?: ChartTone;
};

export type BarListProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  /** Caption of the figure, and its accessible name. */
  title: ReactNode;
  /** A written summary of what the bars show. Shown above them. */
  summary?: ReactNode;
  rows: readonly BarListRow[];
  /** Closes the list with a total line. */
  total?: { label: ReactNode; value: ReactNode };
};

/**
 * Horizontal bars with the name and the value as text above each track.
 *
 * The text is the accessible data: every name and value is a list item a screen reader reads, and the bars are
 * `aria-hidden` shape on top of it. One scale per list, so rows compare. The draw-in plays once on mount and is removed
 * under reduced motion. Renders nothing when `rows` is empty: show an `EmptyState` instead.
 */
export function BarList({ title, summary, rows, total, className, ...rest }: BarListProps) {
  const captionId = useId();
  if (rows.length === 0) return null;
  const max = Math.max(0, ...rows.map((row) => row.amount));
  const share = (amount: number) => (max > 0 ? Math.max(0, Math.min(100, (amount * 100) / max)) : 0);
  return (
    <figure
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      aria-labelledby={captionId}
    >
      <figcaption id={captionId} className={styles.title}>
        {title}
      </figcaption>
      {summary ? <p className={styles.summary}>{summary}</p> : null}
      <ul className={styles.list}>
        {rows.map((row) => (
          <li key={row.key} className={styles.row}>
            <span className={styles.name}>
              {row.name}
              {row.note ? <small className={styles.small}>{row.note}</small> : null}
            </span>
            <span className={styles.value}>
              {row.value}
              {row.detail ? <small className={styles.small}>{row.detail}</small> : null}
            </span>
            <span className={styles.track} aria-hidden="true">
              {row.amount > 0 ? (
                <span
                  className={styles.fill}
                  data-tone={row.tone ?? "accent"}
                  style={{ inlineSize: `${share(row.amount)}%` }}
                />
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      {total ? (
        <p className={styles.total}>
          <span>{total.label}</span>
          <span>{total.value}</span>
        </p>
      ) : null}
    </figure>
  );
}
