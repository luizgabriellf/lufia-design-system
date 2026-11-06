import type { ReactNode } from "react";
import styles from "./docs.module.css";

/** Scroll container for a wide table. It is a focusable named region so keyboard users can scroll it (WCAG 2.1.1). */
export function ScrollTable({ label, children }: { label: string; children: ReactNode }) {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be focusable
    <div className={styles.tableWrap} role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}
