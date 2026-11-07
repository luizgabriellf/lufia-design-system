import type { HTMLAttributes, ReactNode } from "react";
import styles from "./SectionHeader.module.css";

export type SectionHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: ReactNode;
  /** Heading level of `title` (2 to 6). Defaults to 2: pick the one that keeps the page outline in order. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** One short line under the title. */
  description?: ReactNode;
  /** Links or controls at the end of the row ("View all"). They wrap under the text on narrow screens. */
  actions?: ReactNode;
  /** Id of the heading, so a `<section aria-labelledby>` can point at it. */
  titleId?: string;
};

/**
 * The title row of one section of a page: a heading, an optional description and the section's actions.
 * `PageHeader` is for the top of a page; this is for the blocks inside it.
 */
export function SectionHeader({
  title,
  headingLevel = 2,
  description,
  actions,
  titleId,
  className,
  ...rest
}: SectionHeaderProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div {...rest} className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.text}>
        <Heading id={titleId} className={styles.title}>
          {title}
        </Heading>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}
