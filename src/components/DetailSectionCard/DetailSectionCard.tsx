import type { HTMLAttributes, ReactNode } from "react";
import styles from "../DetailSurface/DetailSurface.module.css";

export type DetailSectionCardProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title: string;
  description?: string;
  /** Decorative icon shown before the title (hidden from assistive technology). */
  icon?: ReactNode;
  /** Control aligned to the end of the header, such as an "Edit" button. */
  action?: ReactNode;
  children: ReactNode;
};

/** Section container with a consistent heading, action and content layout. */
export function DetailSectionCard({
  title,
  description,
  icon,
  action,
  children,
  className,
  ...rest
}: DetailSectionCardProps) {
  return (
    <section {...rest} className={[styles.sectionCard, className].filter(Boolean).join(" ")}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeading}>
          {icon ? (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <div className={styles.titleGroup}>
            <h3 className={styles.title}>{title}</h3>
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
        </div>
        {action ? <div className={styles.sectionAction}>{action}</div> : null}
      </div>
      <div className={styles.sectionContent}>{children}</div>
    </section>
  );
}
