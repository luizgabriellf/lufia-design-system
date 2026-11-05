import type { CSSProperties } from "react";
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
      <svg
        className={styles.searchIcon}
        width="17"
        height="17"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
        <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
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
          <span aria-hidden="true">✕</span>
        </button>
      ) : null}
    </div>
  );
}
