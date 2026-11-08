import type { CSSProperties } from "react";
import { CloseIcon, SearchIcon } from "../Icon/icons";
import styles from "./TableToolbar.module.css";

export type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** Also used as the accessible name of the input. */
  placeholder: string;
  /** Accessible name of the clear button (already localised). */
  clearLabel: string;
  style?: CSSProperties;
};

/** Search input with a clear button. Internal to TableToolbar. */
export function SearchField({ value, onChange, placeholder, clearLabel, style }: SearchFieldProps) {
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
        <button type="button" className={styles.clear} aria-label={clearLabel} onClick={() => onChange("")}>
          <CloseIcon size="sm" />
        </button>
      ) : null}
    </div>
  );
}
