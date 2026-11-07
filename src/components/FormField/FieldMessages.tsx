import type { ReactNode } from "react";
import styles from "./FieldMessages.module.css";

/** Help text under a control. Internal: shared by the fields of this package. */
export function FieldHint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className={styles.hint} data-lufia-part="hint">
      {children}
    </p>
  );
}

/** An error under a control: an icon and text, announced when it appears. Internal. */
export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <div id={id} className={styles.error} role="alert" data-lufia-part="error">
      <svg
        className={styles.errorIcon}
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.75v3.9M8 10.9v.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <div>{children}</div>
    </div>
  );
}
