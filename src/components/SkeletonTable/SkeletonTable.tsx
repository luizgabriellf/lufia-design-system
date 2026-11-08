import type { CSSProperties, HTMLAttributes } from "react";
import { Skeleton } from "../../motion/Skeleton";
import styles from "./SkeletonTable.module.css";

export type SkeletonTableProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Number of placeholder rows. Give the page size of the table that will replace it, so nothing jumps. Default 5. */
  rows?: number;
  /** Number of columns in each row. Default 3. */
  columns?: number;
  /**
   * CSS length. Below this width of the table each row stacks its cells in one column, like a table that turns into a
   * list on phones. Default `45rem`.
   */
  stackBelow?: string;
  /** Turn the shimmer off. It also stops under `prefers-reduced-motion`. */
  still?: boolean;
};

/* Each bar takes a share of its own cell, varied so the rows do not read as one solid block. */
const SHARES = ["72%", "48%", "60%", "36%", "56%", "66%", "42%"];

const count = (value: number, fallback: number) =>
  Number.isFinite(value) && value >= 1 ? Math.floor(value) : fallback;

/**
 * Placeholder rows for a table or a list that is loading. The columns share the width equally and every bar is a share
 * of its own cell, so nothing overflows at any width; below `stackBelow` each row stacks its cells. Decorative
 * (`aria-hidden`): mark the region `aria-busy` and name the loading state once, for example with a labelled `Skeleton`.
 */
export function SkeletonTable({
  rows = 5,
  columns = 3,
  stackBelow,
  still = false,
  className,
  style,
  ...rest
}: SkeletonTableProps) {
  const rowCount = count(rows, 5);
  const columnCount = count(columns, 3);
  const sized = {
    ...style,
    "--skeleton-table-columns": columnCount,
    "--skeleton-table-stack": stackBelow,
  } as CSSProperties;
  return (
    <div
      {...rest}
      aria-hidden="true"
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={sized}
      data-columns={columnCount}
    >
      {Array.from({ length: rowCount }, (_, row) => (
        <div key={row} className={styles.row}>
          {Array.from({ length: columnCount }, (_, column) => (
            <div key={column} className={styles.cell}>
              <Skeleton width={SHARES[(row * 3 + column * 2) % SHARES.length]} still={still} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
