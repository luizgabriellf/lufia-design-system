import type { ReactNode } from "react";
import { StatusIcon } from "../StatusIcon/StatusIcon";
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
      <StatusIcon tone="danger" size="sm" className={styles.errorIcon} />
      <div>{children}</div>
    </div>
  );
}
