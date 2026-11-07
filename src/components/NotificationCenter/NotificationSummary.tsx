"use client";

import { useContext, useId, type CSSProperties, type HTMLAttributes } from "react";
import { NotificationActionContext } from "./context";
import { LufiaLink } from "../LufiaProvider";
import styles from "./NotificationPanel.module.css";

export type NotificationSummaryProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> & {
  /** The headline ("2 proposals due today"). */
  title: string;
  /** One line under the headline. */
  description?: string;
  /** A segmented bar: `done` of `total` segments are filled. It is a native `progressbar`, so `label` names it. */
  progress?: {
    done: number;
    total: number;
    /** Accessible name of the bar. */
    label: string;
    /** Spoken instead of "done of total" when that is not enough. */
    valueText?: string;
  };
  /** The one primary action: a link with `href`, a button otherwise. */
  action?: { label: string; href?: string; onSelect?: () => void };
  /** Small print under the action ("2 due today · 6 later this week"). */
  footnote?: string;
};

const MAX_SEGMENTS = 24;

/**
 * A highlight card for the top of a `NotificationPanel`: a headline, a segmented progress bar, one primary action and a
 * footnote. It inverts the page colours, so it stands out in both light and dark mode.
 */
export function NotificationSummary({
  title,
  description,
  progress,
  action,
  footnote,
  className,
  ...rest
}: NotificationSummaryProps) {
  const titleId = useId();
  // Inside a `NotificationCenter` the panel closes first, then the action runs.
  const run = useContext(NotificationActionContext);
  const total = progress ? Math.max(0, Math.min(MAX_SEGMENTS, Math.round(progress.total))) : 0;
  const done = progress ? Math.max(0, Math.min(total, Math.round(progress.done))) : 0;
  return (
    <div
      {...rest}
      role="group"
      aria-labelledby={titleId}
      className={[styles.summary, className].filter(Boolean).join(" ")}
    >
      <p id={titleId} className={styles.summaryTitle}>
        {title}
      </p>
      {description ? <p className={styles.summaryDescription}>{description}</p> : null}
      {progress && total > 0 ? (
        <div
          className={styles.segments}
          role="progressbar"
          aria-label={progress.label}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          aria-valuetext={progress.valueText}
        >
          {Array.from({ length: total }, (_, index) => (
            <span
              key={index}
              className={styles.segment}
              data-filled={index < done || undefined}
              style={{ "--segment-index": Math.min(index, 10) } as CSSProperties}
            />
          ))}
        </div>
      ) : null}
      {action ? (
        action.href !== undefined ? (
          <LufiaLink
            href={action.href}
            className={styles.summaryAction}
            onClick={() => run(() => action.onSelect?.())}
          >
            {action.label}
          </LufiaLink>
        ) : (
          <button
            type="button"
            className={styles.summaryAction}
            onClick={() => run(() => action.onSelect?.())}
          >
            {action.label}
          </button>
        )
      ) : null}
      {footnote ? <p className={styles.summaryFootnote}>{footnote}</p> : null}
    </div>
  );
}
