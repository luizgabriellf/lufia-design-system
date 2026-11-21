"use client";

import type { CSSProperties } from "react";
import { CloseIcon, SearchIcon } from "../Icon/icons";
import { useLufia } from "../LufiaProvider";
import styles from "./TableToolbar.module.css";

export type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** Also used as the accessible name of the input. */
  placeholder: string;
  /** Accessible name of the clear button (already localised). Defaults to the provider's `labels.clearSearch`. */
  clearLabel?: string;
  style?: CSSProperties;
};

/** Search input with a clear button. Internal to TableToolbar. */
export function SearchField({ value, onChange, placeholder, clearLabel, style }: SearchFieldProps) {
  const { labels } = useLufia();
  return (
    <div className={styles.search} style={style}>
      <SearchIcon className={styles.searchIcon} size="sm" />
      <input
        className={styles.searchInput}
        autoComplete="off"
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button
          type="button"
          className={styles.clear}
          aria-label={clearLabel ?? labels.clearSearch}
          onClick={() => onChange("")}
        >
          <CloseIcon size="sm" />
        </button>
      ) : null}
    </div>
  );
}
