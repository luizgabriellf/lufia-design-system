import type { HTMLAttributes, ReactNode } from "react";
import { LufiaLink } from "../LufiaProvider";
import styles from "./Card.module.css";

export type CardPadding = "none" | "sm" | "md" | "lg";

export type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /** Heading of the card. With `href` it is also the text of the card's single link. */
  title?: ReactNode;
  /** Heading level of `title` (2 to 6). Pick the one that fits the page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Control or badge at the end of the header row. Not available together with `href` unless it is non-interactive. */
  headerAction?: ReactNode;
  /** Pinned to the bottom of the card, separated from the body. */
  footer?: ReactNode;
  /**
   * Makes the whole card clickable through one link: the `title` renders as a link whose hit area is stretched over the
   * card. Needs a `title`, which is the link's accessible name.
   */
  href?: string;
  /** Inner spacing of every slot. Defaults to `md`. */
  padding?: CardPadding;
};

/**
 * A surface that groups related content, with optional header, body and footer slots.
 *
 * The interactive variant uses the stretched-link pattern: there is exactly one link, around the title, and its `::after`
 * covers the card. The card is therefore one tab stop with a meaningful name, not a clickable `div`, and text inside it
 * stays selectable. Other controls in the card (a button in `footer`) sit above the stretched area and stay usable.
 */
export function Card({
  title,
  headingLevel = 3,
  headerAction,
  footer,
  href,
  padding = "md",
  className,
  children,
  ...rest
}: CardProps) {
  const Heading = `h${headingLevel}` as const;
  const interactive = href !== undefined;
  const hasHeader = title !== undefined || headerAction !== undefined;
  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-padding={padding}
      data-interactive={interactive || undefined}
    >
      {hasHeader ? (
        <div className={styles.header}>
          {title !== undefined ? (
            <Heading className={styles.title}>
              {interactive ? (
                <LufiaLink href={href} className={styles.link}>
                  {title}
                </LufiaLink>
              ) : (
                title
              )}
            </Heading>
          ) : null}
          {headerAction ? <div className={styles.action}>{headerAction}</div> : null}
        </div>
      ) : null}
      {children !== undefined && children !== null ? <div className={styles.body}>{children}</div> : null}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
}
