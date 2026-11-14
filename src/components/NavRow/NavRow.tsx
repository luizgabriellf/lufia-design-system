"use client";

import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { useLufia } from "../LufiaProvider";
import { ChevronRightIcon } from "../Icon/icons";
import styles from "./NavRow.module.css";

export type NavRowProps = Omit<HTMLAttributes<HTMLElement>, "title" | "onClick"> & {
  title: string;
  /** Supporting line under the title. */
  description?: string;
  /**
   * Quiet last line: a date, a count, a status in words. It is read in order after the title, so it must carry its own
   * context ("3 items", "Due 12 Nov"), not a bare "3".
   */
  meta?: string;
  /** Short trailing mark beside the title, such as a count. */
  badge?: ReactNode;
  /** Decorative icon before the text; hidden from assistive technology. */
  icon?: ReactNode;
  /** Makes the row a link, rendered through the configured `linkComponent`. */
  href?: string;
  /** Makes the row a button when there is no `href`. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
};

/**
 * A compact, clickable list row with a title, optional description and meta, a badge, an icon and a trailing chevron.
 * With `href` it is a link, with `onClick` a button, and with neither a plain block (no chevron, nothing to activate).
 * Several rows belong in a list the caller marks up (`ul` / `li`).
 */
export function NavRow({
  title,
  description,
  meta,
  badge,
  icon,
  href,
  onClick,
  disabled = false,
  className,
  ...rest
}: NavRowProps) {
  const { linkComponent: Link } = useLufia();
  const classes = [styles.root, className].filter(Boolean).join(" ");
  const common = { ...rest, className: classes, "data-disabled": disabled || undefined };

  const content = (
    <>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.copy}>
        <span className={styles.topline}>
          <span className={styles.title}>{title}</span>{" "}
          {badge !== undefined && badge !== null ? <span className={styles.badge}>{badge}</span> : null}
        </span>
        {description ? <span className={styles.description}>{description}</span> : null}
        {meta ? <span className={styles.meta}>{meta}</span> : null}
      </span>
      {href || onClick ? <ChevronRightIcon className={styles.chevron} /> : null}
    </>
  );

  if (href) {
    return (
      <Link
        {...common}
        href={href}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={(event) => {
          if (disabled) event.preventDefault();
          else onClick?.(event);
        }}
      >
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" {...common} disabled={disabled} onClick={onClick}>
        {content}
      </button>
    );
  }
  return <div {...common}>{content}</div>;
}
