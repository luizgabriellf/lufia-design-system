import type { HTMLAttributes, ReactNode } from "react";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./ActivityList.module.css";

export type ActivityTone = "neutral" | "success" | "warning" | "danger" | "info";

export type ActivityItem = {
  /** Stable id, used as the React key. */
  id: string;
  title: ReactNode;
  /** Small line under the title: who did it, what it touched. */
  meta?: ReactNode;
  /** When it happened, already formatted ("2 h ago", "12 Mar"). */
  time: ReactNode;
  /** Machine-readable timestamp for the `<time>` element (ISO 8601). */
  dateTime?: string;
  tone?: ActivityTone;
  /** The tone in words for screen readers ("Failed"). Read before the title. */
  toneLabel?: string;
  /** A link or button for this entry. */
  action?: ReactNode;
};

export type ActivityListProps = Omit<HTMLAttributes<HTMLOListElement>, "children"> & {
  items: readonly ActivityItem[];
  /** Draws a rail with a marker per entry, for a feed read as a sequence. Plain rows by default. */
  timeline?: boolean;
};

/**
 * A feed of what happened, newest first: a title, a line of context, the time and an optional action per entry.
 * It is a flat chronological list. For per-obligation states with deadlines and inline inputs use `StatusTimeline`.
 * Name the list with `aria-label` or `aria-labelledby`. Renders nothing when `items` is empty.
 */
export function ActivityList({ items, timeline = false, className, ...rest }: ActivityListProps) {
  if (items.length === 0) return null;
  return (
    <ol
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-timeline={timeline || undefined}
    >
      {items.map((item) => (
        <li key={item.id} className={styles.item} data-tone={item.tone ?? "neutral"}>
          {timeline ? (
            <span className={styles.rail} aria-hidden="true">
              <span className={styles.marker} />
            </span>
          ) : null}
          <span className={styles.text}>
            <span className={styles.title}>
              {item.toneLabel ? <VisuallyHidden>{item.toneLabel}: </VisuallyHidden> : null}
              {item.title}
            </span>
            {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
          </span>
          <span className={styles.aside}>
            {item.dateTime ? (
              <time className={styles.time} dateTime={item.dateTime}>
                {item.time}
              </time>
            ) : (
              <span className={styles.time}>{item.time}</span>
            )}
            {item.action ? <span className={styles.action}>{item.action}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
