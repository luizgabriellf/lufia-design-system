import { useId, type HTMLAttributes, type ReactNode } from "react";
import { StatusIcon, type StatusTone } from "../StatusIcon";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./Checklist.module.css";

export type ChecklistStatus = "todo" | "done" | "attention";

export type ChecklistItem = {
  /** Stable key, used as the React key. */
  key: string;
  /** The item's text. */
  text: ReactNode;
  /** `todo` (default), `done` or `attention`. Each has its own icon shape, so the status never rests on colour. */
  status?: ChecklistStatus;
  /** A small line under the text: why it needs attention, the date it was done. */
  hint?: ReactNode;
};

export type ChecklistProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  items: readonly ChecklistItem[];
  /** A visible title above the list. It also names the list for screen readers. */
  title?: ReactNode;
  /**
   * The status in words, read before the item text ("Done", "Needs attention"). Strings come from the app. A status
   * without a label is conveyed by its icon alone, so give one for every status the list uses.
   */
  statusLabels?: Partial<Record<ChecklistStatus, string>>;
  /** `md` (default) or `sm`, a tighter row for dense panels. */
  density?: "md" | "sm";
};

const TONE: Record<ChecklistStatus, StatusTone> = {
  todo: "neutral",
  done: "success",
  attention: "warning",
};

/**
 * A read-only list of items, each with a status icon and text. It is not a form control: nothing is checkable or
 * focusable. Name the list with `title`, or with `aria-label` or `aria-labelledby`, which go to the list. Renders
 * nothing when there are no items.
 */
export function Checklist({
  items,
  title,
  statusLabels,
  density = "md",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...rest
}: ChecklistProps) {
  const titleId = useId();
  if (items.length === 0) return null;
  const hasTitle = title !== undefined && title !== null && title !== false;
  return (
    <div {...rest} className={[styles.root, className].filter(Boolean).join(" ")} data-density={density}>
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
        {items.map((item) => {
          const status = item.status ?? "todo";
          const statusLabel = statusLabels?.[status];
          return (
            <li key={item.key} className={styles.item} data-status={status}>
              <StatusIcon tone={TONE[status]} size="sm" className={styles.icon} />
              <span className={styles.body}>
                <span className={styles.text}>
                  {statusLabel ? <VisuallyHidden>{statusLabel}: </VisuallyHidden> : null}
                  {item.text}
                </span>
                {item.hint ? <span className={styles.hint}>{item.hint}</span> : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
