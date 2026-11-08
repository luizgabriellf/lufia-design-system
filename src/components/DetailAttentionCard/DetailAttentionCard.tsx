import type { HTMLAttributes, ReactNode } from "react";
import { StatusIcon, type StatusTone } from "../StatusIcon/StatusIcon";
import styles from "../DetailSurface/DetailSurface.module.css";

export type DetailAttentionTone = "ok" | "warn" | "danger" | "critical" | "neutral";

export type DetailAttentionCardProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  tone: DetailAttentionTone;
  title: string;
  description?: string;
  meta?: string;
  /** Call-to-action rendered under the copy (a button or link). */
  action?: ReactNode;
  /**
   * Text that names the tone for assistive technology (for example "Overdue").
   * The tone is otherwise conveyed by colour and a glyph only, so pass it whenever the tone carries meaning.
   */
  toneLabel?: string;
};

const MARKS: Record<DetailAttentionTone, StatusTone> = {
  ok: "success",
  warn: "warning",
  danger: "danger",
  critical: "danger",
  neutral: "neutral",
};

/** High-signal status card for deadlines, risk and missing-data states. */
export function DetailAttentionCard({
  tone,
  title,
  description,
  meta,
  action,
  toneLabel,
  className,
  ...rest
}: DetailAttentionCardProps) {
  return (
    <section
      {...rest}
      className={[styles.attentionCard, className].filter(Boolean).join(" ")}
      data-tone={tone}
    >
      <div className={styles.attentionHeader}>
        <StatusIcon tone={MARKS[tone]} variant="ring" size="lg" className={styles.attentionMark} />
        <div className={styles.attentionCopy}>
          <h3 className={styles.attentionTitle}>
            {toneLabel ? <span className={styles.srOnly}>{toneLabel}: </span> : null}
            {title}
          </h3>
          {description ? <p className={styles.attentionDescription}>{description}</p> : null}
          {meta ? <p className={styles.attentionMeta}>{meta}</p> : null}
        </div>
      </div>
      {action ? <div className={styles.attentionAction}>{action}</div> : null}
    </section>
  );
}
