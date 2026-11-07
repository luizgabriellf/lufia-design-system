import type { HTMLAttributes, ReactNode } from "react";
import { LufiaLink } from "../LufiaProvider";
import styles from "./Card.module.css";

export type CardPadding = "none" | "sm" | "md" | "lg";

export type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /** Heading of the card. With `href` it is also the text of the card's single link. */
  title?: ReactNode;
  /** Heading level of `title` (2 to 6). Pick the one that fits the page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** One short line under the `title` (or on its own, when there is no title). */
  description?: ReactNode;
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
  /**
   * Lets the body span the full width of the card while the header and footer keep their padding. For lists and
   * tables that draw their own row padding and dividers.
   */
  flush?: boolean;
  /** Draws a rule under the header, between it and the body. Its colour is `--lufia-card-divider-color`. */
  divider?: boolean;
};

/**
 * A surface that groups related content, with optional header, body and footer slots.
 *
 * The interactive variant uses the stretched-link pattern: the card's own link is the one around the title, and its
 * `::after` covers the card. The card is therefore one tab stop with a meaningful name, not a clickable `div`. Any other
 * link or control anywhere in the card (body, header action, footer) is lifted above the covered area and stays usable.
 * The trade-off is that the covered text cannot be selected with the mouse; use a plain Card where people need to select.
 */
export function Card({
  title,
  description,
  headingLevel = 3,
  headerAction,
  footer,
  href,
  padding = "md",
  flush = false,
  divider = false,
  className,
  children,
  ...rest
}: CardProps) {
  const Heading = `h${headingLevel}` as const;
  const interactive = href !== undefined;
  const hasDescription = description !== undefined && description !== null && description !== false;
  const hasHeader = title !== undefined || headerAction !== undefined || hasDescription;
  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-padding={padding}
      data-interactive={interactive || undefined}
      data-flush={flush || undefined}
      data-divider={divider || undefined}
    >
      {hasHeader ? (
        <div className={styles.header}>
          {title !== undefined || hasDescription ? (
            <HeadingBlock hasDescription={hasDescription} description={description}>
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
            </HeadingBlock>
          ) : null}
          {headerAction ? <div className={styles.action}>{headerAction}</div> : null}
        </div>
      ) : null}
      {children !== undefined && children !== null ? <div className={styles.body}>{children}</div> : null}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
}

/** Wraps the heading only when there is a description, so a card without one keeps its original markup. */
function HeadingBlock({
  hasDescription,
  description,
  children,
}: {
  hasDescription: boolean;
  description: ReactNode;
  children: ReactNode;
}) {
  if (!hasDescription) return children;
  return (
    <div className={styles.heading}>
      {children}
      <p className={styles.description}>{description}</p>
    </div>
  );
}
