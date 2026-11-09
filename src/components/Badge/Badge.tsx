import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "ai";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** The text. Always required: the tone never carries the meaning on its own (WCAG 1.4.1). */
  children: ReactNode;
  tone?: BadgeTone;
  /** A small dot before the text, for statuses that read as a state rather than a label. Decorative. */
  dot?: boolean;
  /**
   * Keeps the badge on one line and ends long text with an ellipsis instead of wrapping into a tall oval. The full text
   * stays in the DOM for assistive technology and, when the children are a string, becomes the native tooltip. For
   * other children, pass `title` yourself.
   */
  truncate?: boolean;
};

/** A short, non-interactive label that classifies or states something: a category, a count, a record's status. */
export function Badge({
  tone = "neutral",
  dot = false,
  truncate = false,
  className,
  children,
  title,
  ...rest
}: BadgeProps) {
  return (
    <span
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-truncate={truncate || undefined}
      title={title ?? (truncate && typeof children === "string" ? children : undefined)}
    >
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {truncate ? <span className={styles.text}>{children}</span> : children}
    </span>
  );
}

/** A `Badge` that shows a dot by default, for the state of a record (open, paid, overdue). */
export function StatusBadge({ dot = true, ...rest }: BadgeProps) {
  return <Badge dot={dot} {...rest} />;
}
