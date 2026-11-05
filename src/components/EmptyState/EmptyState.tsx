import type { HTMLAttributes, ReactNode } from "react";
import styles from "./EmptyState.module.css";

export type EmptyStateProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /** Decorative illustration or icon (hidden from assistive technology). */
  icon?: ReactNode;
  title: string;
  body?: string;
  /** Next step, usually a button or link. */
  action?: ReactNode;
};

/** Placeholder for a list, table or panel that has nothing to show yet. */
export function EmptyState({ icon, title, body, action, className, ...rest }: EmptyStateProps) {
  return (
    <div role="status" {...rest} className={[styles.root, className].filter(Boolean).join(" ")}>
      {icon ? (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <p className={styles.title}>{title}</p>
      {body ? <p className={styles.body}>{body}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
