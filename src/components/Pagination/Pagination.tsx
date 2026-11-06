"use client";

import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { useLufia } from "../LufiaProvider";
import styles from "./Pagination.module.css";

export type PaginationLabels = {
  /** Accessible name of the navigation landmark. */
  nav: string;
  /** Visible text of the previous control. */
  previous: string;
  /** Visible text of the next control. */
  next: string;
  /** Accessible name of the button that goes to a page, such as "Page 3". The current page also gets `aria-current`. */
  page: (page: number) => string;
  /** The status line, announced politely when the page changes: "Page 2 of 5, 43 results". */
  summary: (page: number, totalPages: number, total?: number) => string;
};

export type PaginationProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** Current page, starting at 1. Controlled. */
  page: number;
  totalPages: number;
  /** Total item count, handed to `labels.summary`. */
  total?: number;
  onPageChange: (page: number) => void;
  /**
   * Makes every control a real link (through the configured `linkComponent`) so pages can be opened in a new tab and
   * crawled. `onPageChange` still fires on a plain click; call `event.preventDefault()` there to handle it in place.
   */
  hrefFor?: (page: number) => string;
  /** Page numbers shown on each side of the current one. Default 1. */
  siblingCount?: number;
  labels: PaginationLabels;
  /**
   * `default` shows the numbered pages (they give way to previous and next in containers under 40rem). `compact` is
   * previous and next only, with the status line; the status line then carries the position at every width.
   */
  variant?: "default" | "compact";
  /**
   * A class for every control (previous, next and the page numbers), for an app that already has a button look. When set, the
   * built-in control look is left out (layout, the current-page and disabled states stay), so your class is not fighting it.
   */
  buttonClassName?: string;
};

type Entry = number | "start-gap" | "end-gap";

/**
 * The page numbers to show: always the first and last, the current page with its siblings, and gaps collapsed into an
 * ellipsis. The number of slots is constant (siblings * 2 + 5), so the controls do not jump while paging.
 */
function pageEntries(page: number, totalPages: number, siblings: number): Entry[] {
  const slots = siblings * 2 + 5; // first, last, current and its siblings, two gap slots
  if (totalPages <= slots) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const start = Math.max(Math.min(page - siblings, totalPages - siblings * 2 - 2), 3);
  const end = Math.min(Math.max(page + siblings, siblings * 2 + 3), totalPages - 2);
  const entries: Entry[] = [1, start > 3 ? "start-gap" : 2];
  for (let n = start; n <= end; n += 1) entries.push(n);
  entries.push(end < totalPages - 2 ? "end-gap" : totalPages - 1, totalPages);
  return entries;
}

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/**
 * Page navigation for a list or table, built on `usePagination` (`page`, `totalPages` and `setPage` map straight onto the
 * props). Previous and next are always present; the numbered pages collapse into an ellipsis and give way on narrow
 * screens, where the status line carries the position.
 */
export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  hrefFor,
  siblingCount = 1,
  labels,
  variant = "default",
  buttonClassName,
  className,
  ...rest
}: PaginationProps) {
  const { linkComponent: Link } = useLufia();
  const last = Math.max(1, Math.floor(totalPages));
  const current = Math.min(Math.max(1, Math.floor(page)), last);
  const compact = variant === "compact";
  const entries = compact ? [] : pageEntries(current, last, Math.max(0, Math.floor(siblingCount)));
  const controlClass = (extra: string) =>
    [buttonClassName ? styles.bare : styles.control, extra, buttonClassName].filter(Boolean).join(" ");

  const control = (
    target: number,
    enabled: boolean,
    text: ReactNode,
    props: { "aria-label"?: string; current?: boolean; className: string },
  ) => {
    const common = {
      className: props.className,
      "aria-label": props["aria-label"],
      "aria-current": props.current ? ("page" as const) : undefined,
      "aria-disabled": enabled ? undefined : true,
    };
    const choose = (event: MouseEvent<HTMLElement>) => {
      if (!enabled) {
        event.preventDefault();
        return;
      }
      if (hrefFor && !isPlainClick(event)) return;
      if (!props.current) onPageChange(target);
    };
    return hrefFor ? (
      <Link {...common} href={hrefFor(target)} tabIndex={enabled ? undefined : -1} onClick={choose}>
        {text}
      </Link>
    ) : (
      <button type="button" {...common} onClick={choose}>
        {text}
      </button>
    );
  };

  return (
    <nav
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      aria-label={labels.nav}
      data-variant={variant}
    >
      <p className={styles.summary} aria-live="polite" aria-atomic="true">
        {labels.summary(current, last, total)}
      </p>
      <ul className={styles.list}>
        <li>
          {control(current - 1, current > 1, labels.previous, {
            className: controlClass(styles.step!),
          })}
        </li>
        {entries.map((entry) =>
          typeof entry === "number" ? (
            <li key={entry} className={styles.number}>
              {control(entry, true, entry, {
                "aria-label": labels.page(entry),
                current: entry === current,
                className: controlClass(styles.page!),
              })}
            </li>
          ) : (
            <li key={entry} className={styles.number} aria-hidden="true">
              <span className={styles.gap}>…</span>
            </li>
          ),
        )}
        <li>
          {control(current + 1, current < last, labels.next, {
            className: controlClass(styles.step!),
          })}
        </li>
      </ul>
    </nav>
  );
}
