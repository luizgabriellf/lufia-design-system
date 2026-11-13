import { useId, type HTMLAttributes, type ReactNode } from "react";
import { Link } from "../Link";
import styles from "./CitationList.module.css";

export type CitationItem = {
  /** Stable key, used as the React key. */
  key: string;
  /** The reference itself ("Standard 123, clause 4"). Wraps when long. */
  reference: ReactNode;
  /** A short muted prefix before the reference, such as its kind ("Standard", "Guide"). */
  label?: ReactNode;
  /** Makes the reference a link, rendered through `Link` and so the configured `linkComponent`. */
  href?: string;
};

export type CitationListProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  items: readonly CitationItem[];
  /** A visible title above the list ("Sources"). It also names the list for screen readers. */
  title?: ReactNode;
};

/**
 * A compact list of references or sources, drawn as chips that wrap. A reference with `href` is a link; the others are
 * plain text. Name the list with `title`, or with `aria-label` or `aria-labelledby`, which go to the list. Renders
 * nothing when there are no items.
 */
export function CitationList({
  items,
  title,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...rest
}: CitationListProps) {
  const titleId = useId();
  if (items.length === 0) return null;
  const hasTitle = title !== undefined && title !== null && title !== false;
  return (
    <div {...rest} className={[styles.root, className].filter(Boolean).join(" ")}>
      {hasTitle ? (
        <p id={titleId} className={styles.title}>
          {title}
        </p>
      ) : null}
      <ul
        className={styles.list}
        aria-label={hasTitle ? undefined : ariaLabel}
        aria-labelledby={hasTitle ? titleId : ariaLabelledBy}
      >
        {items.map((item) => (
          <li key={item.key} className={styles.item}>
            {item.label ? <span className={styles.label}>{item.label}</span> : null}
            {item.href ? (
              <Link href={item.href} className={styles.link}>
                {item.reference}
              </Link>
            ) : (
              <span className={styles.reference}>{item.reference}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
