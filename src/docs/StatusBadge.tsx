import styles from "./docs.module.css";

export type ComponentStatus = "alpha" | "beta" | "stable" | "deprecated";

/** Maturity label shown at the top of a component's docs (see docs/STANDARDS.md §3). */
export function StatusBadge({ status }: { status: ComponentStatus }) {
  return (
    <span className={styles.badge} data-status={status}>
      {status}
    </span>
  );
}
