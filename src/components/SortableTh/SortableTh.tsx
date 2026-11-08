import type { ThHTMLAttributes } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "../Icon/icons";
import styles from "./SortableTh.module.css";

export type SortDirection = "asc" | "desc";

export type SortableThProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, "onClick" | "children"> & {
  label: string;
  /** Whether the table is currently sorted by this column. */
  active: boolean;
  dir: SortDirection;
  onSort: () => void;
};

/**
 * Sortable column header. A real `<button>` sits inside the `<th>` so keyboard users can focus and
 * activate it, and `aria-sort` stays on the `<th>` as WAI-ARIA requires.
 */
export function SortableTh({ label, active, dir, onSort, className, ...rest }: SortableThProps) {
  return (
    <th
      {...rest}
      className={className}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button type="button" className={styles.button} onClick={onSort}>
        {label}
        {active ? (
          <span aria-hidden="true" className={styles.arrow}>
            {dir === "asc" ? <ArrowUpIcon size="sm" /> : <ArrowDownIcon size="sm" />}
          </span>
        ) : null}
      </button>
    </th>
  );
}
