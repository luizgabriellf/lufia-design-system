import type { HTMLAttributes, ReactNode } from "react";
import { SearchField } from "./SearchField";
import styles from "./TableToolbar.module.css";

export type FilterOption = {
  key: string;
  /** Already localised by the caller. */
  label: string;
};

export type TableToolbarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The filter chips, in order. Each is a toggle button; the one whose `key` equals `activeFilter` is pressed. */
  filters?: FilterOption[];
  /** `key` of the pressed filter chip. Controlled: the toolbar keeps no state, so update it from `onFilterChange`. */
  activeFilter?: string;
  /** Called with the `key` of the chip the user clicks. */
  onFilterChange?: (key: string) => void;
  /** Current text of the search field. Controlled: update it from `onSearchChange`. Default `""`. */
  search?: string;
  /** The search field renders only when this handler is provided. */
  onSearchChange?: (value: string) => void;
  /** Placeholder of the search field. Default none. */
  searchPlaceholder?: string;
  /** Accessible name of the search field's clear button. Required whenever search is shown. */
  clearSearchLabel?: string;
  /** Layout variant: "inline" sits inside a surface (bottom border); "standalone" has outer spacing. */
  variant?: "inline" | "standalone";
  /** Extra controls, such as dropdowns for open-ended lists, rendered before the search box. */
  children?: ReactNode;
};

/** Filter chips plus an optional search box for the top of a table or list. */
export function TableToolbar({
  filters,
  activeFilter,
  onFilterChange,
  search,
  onSearchChange,
  searchPlaceholder,
  clearSearchLabel = "Clear search",
  variant = "inline",
  className,
  children,
  ...rest
}: TableToolbarProps) {
  return (
    <div
      role="group"
      {...rest}
      className={[styles.toolbar, className].filter(Boolean).join(" ")}
      data-variant={variant}
    >
      {filters?.map((filter) => {
        const active = activeFilter === filter.key;
        return (
          <button
            type="button"
            key={filter.key}
            className={styles.chip}
            data-active={active ? "true" : undefined}
            aria-pressed={active}
            onClick={() => onFilterChange?.(filter.key)}
          >
            {filter.label}
          </button>
        );
      })}
      {children}
      {onSearchChange !== undefined && (
        <SearchField
          value={search ?? ""}
          onChange={onSearchChange}
          placeholder={searchPlaceholder ?? ""}
          clearLabel={clearSearchLabel}
        />
      )}
    </div>
  );
}
