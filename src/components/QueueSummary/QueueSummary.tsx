import type { HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { Stagger } from "../../motion/Stagger";
import { ChevronDownIcon, ChevronRightIcon } from "../Icon/icons";
import { LufiaLink } from "../LufiaProvider";
import { StatTile } from "../StatTile";
import { StatusIcon } from "../StatusIcon";
import styles from "./QueueSummary.module.css";

export type QueueSummaryTone = "neutral" | "warning" | "danger";

export type QueueSummaryItem = {
  /** Stable id, used as the React key. */
  id: string;
  /** Name of the queue. It is the text of the row's link. */
  label: ReactNode;
  /** How many items wait here. `0` folds the queue away; `null` means unknown and it stays in view with `unknownValue`. */
  count: number | null;
  /** The figure as shown (formatted, or an `AnimatedNumber`). Defaults to `count`. */
  value?: ReactNode;
  /** `danger` rows come first, then `warning`, then `neutral`; rows keep their given order inside a tone. */
  tone?: QueueSummaryTone;
  /** A line of context. */
  hint?: ReactNode;
  /** A small chart beside the figure, usually a `Sparkline`. */
  sparkline?: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  /** Hooks for the consuming app's own tests and analytics, set on the row. */
  [dataAttribute: `data-${string}`]: string | undefined;
};

export type QueueSummaryProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  items: readonly QueueSummaryItem[];
  /** The line that folds the empty queues ("6 queues are clear"). */
  clearLabel: (count: number) => ReactNode;
  /** Heading of the all-clear state, shown only when every count is exactly `0`. */
  allClearTitle: ReactNode;
  /** A short line under the all-clear heading. */
  allClearBody?: ReactNode;
  /** The figure of a queue whose count is unknown. */
  unknownValue?: ReactNode;
};

const TONE_RANK: Record<QueueSummaryTone, number> = { danger: 0, warning: 1, neutral: 2 };

function dataAttributes(item: QueueSummaryItem) {
  return Object.fromEntries(Object.entries(item).filter(([key]) => key.startsWith("data-"))) as Record<
    string,
    string | undefined
  >;
}

function ClearRow({ item }: { item: QueueSummaryItem }) {
  const content = (
    <>
      <span className={styles.clearText}>
        <span className={styles.clearName}>{item.label}</span>
        {item.hint ? <span className={styles.clearHint}>{item.hint}</span> : null}
      </span>
      <span className={styles.clearCount}>{item.value ?? item.count}</span>
    </>
  );
  if (item.href === undefined && item.onClick === undefined) {
    return <div className={styles.clearRow}>{content}</div>;
  }
  const trailing = <ChevronRightIcon className={styles.clearChevron} size="sm" />;
  return item.href !== undefined ? (
    <LufiaLink href={item.href} onClick={item.onClick} className={styles.clearRow}>
      {content}
      {trailing}
    </LufiaLink>
  ) : (
    <button type="button" onClick={item.onClick} className={styles.clearRow}>
      {content}
      {trailing}
    </button>
  );
}

/**
 * A home-screen summary of many work queues, built on `StatTile` rows. Open queues lead, ordered by tone and then by the
 * given order; queues at zero fold into one quiet line that still opens to every destination; and when every count is
 * zero, an all-clear replaces the rows. A queue whose count is unknown stays in view, so it never passes for clear.
 */
export function QueueSummary({
  items,
  clearLabel,
  allClearTitle,
  allClearBody,
  unknownValue = "—",
  className,
  ...rest
}: QueueSummaryProps) {
  if (items.length === 0) return null;
  const clear = items.filter((item) => item.count === 0);
  const unknown = items.filter((item) => item.count === null);
  const open = items
    .filter((item) => item.count !== null && item.count !== 0)
    .sort((a, b) => TONE_RANK[a.tone ?? "neutral"] - TONE_RANK[b.tone ?? "neutral"]);
  const leading = [...open, ...unknown];
  const allClear = leading.length === 0;

  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-all-clear={allClear || undefined}
    >
      {allClear ? (
        <div className={styles.allClear}>
          <StatusIcon tone="success" variant="ring" size="md" />
          <div className={styles.allClearText}>
            <span className={styles.allClearTitle}>{allClearTitle}</span>
            {allClearBody ? <span className={styles.allClearBody}>{allClearBody}</span> : null}
          </div>
        </div>
      ) : (
        <Stagger className={styles.list} role="list">
          {leading.map((item) => (
            <StatTile
              key={item.id}
              {...dataAttributes(item)}
              role="listitem"
              layout="row"
              label={item.label}
              value={item.count === null ? unknownValue : (item.value ?? item.count)}
              tone={item.count === null ? "neutral" : (item.tone ?? "neutral")}
              hint={item.hint}
              sparkline={item.sparkline}
              href={item.href}
              onClick={item.onClick}
            />
          ))}
        </Stagger>
      )}
      {clear.length > 0 ? (
        <details className={styles.clear}>
          <summary className={styles.clearSummary}>
            <span>{clearLabel(clear.length)}</span>
            <ChevronDownIcon className={styles.clearToggle} size="sm" />
          </summary>
          <ul className={styles.clearList}>
            {clear.map((item) => (
              <li key={item.id} {...dataAttributes(item)}>
                <ClearRow item={item} />
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
