import type { HTMLAttributes, ReactNode } from "react";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./AttentionList.module.css";

export type AttentionTone = "danger" | "warning" | "info" | "neutral";

export type AttentionItem = {
  /** Stable id, used as the React key. */
  id: string;
  tone?: AttentionTone;
  /** The tone in words for screen readers ("Overdue"). Read before the title, so the colour is never the only signal. */
  toneLabel?: string;
  title: ReactNode;
  /** Small line under the title: the deadline, the owner, the count. */
  meta?: ReactNode;
  /** A link or button for this item. */
  action?: ReactNode;
};

export type AttentionBarStyle = "edge" | "inset";

export type AttentionListProps = Omit<HTMLAttributes<HTMLUListElement>, "children"> & {
  items: readonly AttentionItem[];
  /**
   * `edge` (default) draws the tone bar as the row's own start border, flush with the card edge. `inset` draws a rounded
   * bar set in from the edge. The bar width is `--lufia-attention-list-bar-width`.
   */
  barStyle?: AttentionBarStyle;
};

/**
 * A short list of things that need a decision: each row has a tone bar, a title, a line of context and one action.
 * Name the list with `aria-label` or `aria-labelledby` (for example the id of a `SectionHeader` title).
 * Renders nothing when `items` is empty: show an `EmptyState` instead, or leave the section out.
 */
export function AttentionList({ items, barStyle = "edge", className, ...rest }: AttentionListProps) {
  if (items.length === 0) return null;
  return (
    <ul {...rest} className={[styles.root, className].filter(Boolean).join(" ")} data-bar-style={barStyle}>
      {items.map((item) => (
        <li key={item.id} className={styles.item} data-tone={item.tone ?? "neutral"}>
          <span className={styles.text}>
            <span className={styles.title}>
              {item.toneLabel ? <VisuallyHidden>{item.toneLabel}: </VisuallyHidden> : null}
              {item.title}
            </span>
            {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
          </span>
          {item.action ? <span className={styles.action}>{item.action}</span> : null}
        </li>
      ))}
    </ul>
  );
}
