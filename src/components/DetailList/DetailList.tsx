import { Fragment, type HTMLAttributes, type ReactNode } from "react";
import styles from "./DetailList.module.css";

export type DetailListRow = {
  label: string;
  value: ReactNode;
  /** Render the value in the mono font (dates, counts, identifiers). */
  mono?: boolean;
};

export type DetailListProps = HTMLAttributes<HTMLDListElement> & { rows: DetailListRow[] };

/**
 * Key-value rows ("label: value") for detail panels and modals.
 *
 * The label column is capped at 40% and allowed to wrap. Sizing it to `max-content` lets a
 * single long label push every value out of its container.
 */
export function DetailList({ rows, className, ...rest }: DetailListProps) {
  return (
    <dl {...rest} className={[styles.list, className].filter(Boolean).join(" ")}>
      {rows.map((row, index) => (
        <Fragment key={index}>
          <dt className={styles.term}>{row.label}</dt>
          <dd className={row.mono ? `${styles.value} ${styles.mono}` : styles.value}>{row.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
