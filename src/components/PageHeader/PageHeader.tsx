import type { HTMLAttributes, ReactNode } from "react";
import styles from "./PageHeader.module.css";

export type PageHeaderProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  /** Small line above the title: the section or the parent record. */
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Heading level of `title`. Defaults to 1: a page has one. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  description?: ReactNode;
  /** Page-level actions, usually a `PageActions`. They wrap under the text on narrow screens. */
  actions?: ReactNode;
};

/** The top of a page: an optional eyebrow, the title as a heading, a description, and the page's actions. */
export function PageHeader({
  eyebrow,
  title,
  headingLevel = 1,
  description,
  actions,
  className,
  ...rest
}: PageHeaderProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <header {...rest} className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.text}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <Heading className={styles.title}>{title}</Heading>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
