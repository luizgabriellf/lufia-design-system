import type { ThHTMLAttributes } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "../Icon/icons";
import styles from "./SortableTh.module.css";

export type SortDirection = "asc" | "desc";

export type SortableThProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, "onClick" | "children"> & {
  /** Column name: the text of the sort button, and its accessible name. */
  label: string;
  /** Whether the table is currently sorted by this column. */
  active: boolean;
  /** Sort direction, `asc` or `desc`. Drawn as an arrow and set as `aria-sort` only while `active` is true. */
  dir: SortDirection;
  /** Called when the user activates the header button. Change the sort in it; the header keeps no state. */
  onSort: () => void;
  /** Lets the label wrap onto a second line (balanced, bottom-aligned in the header row), as `Th wrap` does inside a `Table`. */
  wrap?: boolean;
  /**
   * A short visible text for a long `label`, as `Th abbr` does inside a `Table`. The full `label` stays the button's
   * accessible name, and the short text carries it as a `title` tooltip. Also set natively on the `<th>`.
   */
  abbr?: string;
};

/**
 * Sortable column header. A real `<button>` sits inside the `<th>` so keyboard users can focus and
 * activate it, and `aria-sort` stays on the `<th>` as WAI-ARIA requires.
 */
export function SortableTh({ label, active, dir, onSort, wrap, abbr, className, ...rest }: SortableThProps) {
  return (
    <th
      {...rest}
      className={className}
      abbr={abbr}
      data-wrap={wrap ? "" : undefined}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button type="button" className={styles.button} onClick={onSort}>
        {abbr ? (
          <>
            <span aria-hidden="true" data-th-short="" title={label}>
              {abbr}
            </span>
            <span data-th-full="">{label}</span>
          </>
        ) : (
          label
        )}
        {active ? (
          <span aria-hidden="true" className={styles.arrow}>
            {dir === "asc" ? <ArrowUpIcon size="sm" /> : <ArrowDownIcon size="sm" />}
          </span>
        ) : null}
      </button>
    </th>
  );
}
