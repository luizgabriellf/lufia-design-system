import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "ai";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** The text. Always required: the tone never carries the meaning on its own (WCAG 1.4.1). */
  children: ReactNode;
  tone?: BadgeTone;
  /** A small dot before the text, for statuses that read as a state rather than a label. Decorative. */
  dot?: boolean;
};

/** A short, non-interactive label that classifies or states something: a category, a count, a record's status. */
export function Badge({ tone = "neutral", dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span {...rest} className={[styles.root, className].filter(Boolean).join(" ")} data-tone={tone}>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/** A `Badge` that shows a dot by default, for the state of a record (open, paid, overdue). */
export function StatusBadge({ dot = true, ...rest }: BadgeProps) {
  return <Badge dot={dot} {...rest} />;
}
