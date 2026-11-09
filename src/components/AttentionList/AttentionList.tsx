import { useId, type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
import { LufiaLink } from "../LufiaProvider";
import { ChevronRightIcon } from "../Icon/icons";
import { StatusIcon } from "../StatusIcon";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./AttentionList.module.css";

export type AttentionTone = "danger" | "warning" | "info" | "neutral";

export type AttentionItem = {
  /** Stable id, used as the React key. */
  id: string;
  /** Tone of a flat row. Inside `groups` the tone comes from the group, so this is ignored there. */
  tone?: AttentionTone;
  /** The tone in words for screen readers ("Overdue"). Read before the title, so the colour is never the only signal. */
  toneLabel?: string;
  title: ReactNode;
  /** Small line under the title: the deadline, the owner, the count. */
  meta?: ReactNode;
  /** A link or button for this item. Ignored when the row itself is a target (`href` or `onSelect`). */
  action?: ReactNode;
  /** Makes the whole row one link with a trailing chevron, rendered through the configured `linkComponent`. */
  href?: string;
  /** Called on press. Alone, it makes the whole row a button. Together with `href` it runs before navigation. */
  onSelect?: MouseEventHandler<HTMLElement>;
  /** Short trailing figure, already formatted, before the chevron. */
  count?: ReactNode;
};

export type AttentionGroup = {
  /** Stable id, used as the React key. */
  id: string;
  /** Tone of the group's mark and rail. Each tone has its own glyph. Default `neutral`. */
  tone?: AttentionTone;
  /** The urgency in words ("Overdue"). It names the group's list, so the tone never rests on colour. */
  label: ReactNode;
  /** The figure beside the label, already formatted. Defaults to the number of items. */
  count?: ReactNode;
  items: readonly AttentionItem[];
};

export type AttentionBarStyle = "edge" | "inset";

export type AttentionListProps = Omit<HTMLAttributes<HTMLUListElement>, "children"> & {
  /** The rows of a flat list, each with its own tone bar and tint. Ignored when `groups` is set. */
  items?: readonly AttentionItem[];
  /** Rows grouped by urgency, on a neutral surface: each group has a mark, a label and a count. Empty groups are skipped. */
  groups?: readonly AttentionGroup[];
  /**
   * `edge` (default) draws the tone bar as the row's own start border, flush with the card edge. `inset` draws a rounded
   * bar set in from the edge. The bar width is `--lufia-attention-list-bar-width`. Applies to flat `items` only.
   */
  barStyle?: AttentionBarStyle;
};

function isTarget(item: AttentionItem) {
  return Boolean(item.href || item.onSelect);
}

function RowContent({ item }: { item: AttentionItem }) {
  return (
    <span className={styles.text}>
      <span className={styles.title}>
        {item.toneLabel ? <VisuallyHidden>{item.toneLabel}: </VisuallyHidden> : null}
        {item.title}
      </span>
      {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
    </span>
  );
}

function Row({ item }: { item: AttentionItem }) {
  const count =
    item.count !== undefined && item.count !== null ? (
      <span className={styles.count}>{item.count}</span>
    ) : null;
  const content = (
    <>
      <RowContent item={item} />
      {count}
      {isTarget(item) ? <ChevronRightIcon className={styles.chevron} size="sm" /> : null}
    </>
  );
  if (item.href) {
    return (
      <LufiaLink href={item.href} className={styles.target} onClick={item.onSelect}>
        {content}
      </LufiaLink>
    );
  }
  if (item.onSelect) {
    return (
      <button type="button" className={styles.target} onClick={item.onSelect}>
        {content}
      </button>
    );
  }
  return (
    <>
      {content}
      {item.action ? <span className={styles.action}>{item.action}</span> : null}
    </>
  );
}

function Group({ group }: { group: AttentionGroup }) {
  const labelId = useId();
  const tone = group.tone ?? "neutral";
  return (
    <li className={styles.group} data-tone={tone}>
      <div id={labelId} className={styles.groupHeader}>
        <StatusIcon tone={tone} size="sm" />
        <span>{group.label}</span>{" "}
        <span className={styles.groupCount}>{group.count ?? group.items.length}</span>
      </div>
      <ul className={styles.groupItems} aria-labelledby={labelId}>
        {group.items.map((item) => (
          <li key={item.id} className={styles.groupRow} data-target={isTarget(item) || undefined}>
            <Row item={item} />
          </li>
        ))}
      </ul>
    </li>
  );
}

/**
 * A short list of things that need a decision. With `groups`, rows are sorted under urgency headers on a neutral surface
 * and each row can be one link with a chevron. With `items`, each row has a tone bar, a title, a line of context and one
 * action. Name the list with `aria-label` or `aria-labelledby` (for example the id of a `SectionHeader` title).
 * Renders nothing when there is nothing to show: use an `EmptyState` instead, or leave the section out.
 */
export function AttentionList({
  items = [],
  groups,
  barStyle = "edge",
  className,
  ...rest
}: AttentionListProps) {
  const classes = [styles.root, className].filter(Boolean).join(" ");
  if (groups) {
    const visible = groups.filter((group) => group.items.length > 0);
    if (visible.length === 0) return null;
    return (
      <ul {...rest} className={classes} data-layout="groups">
        {visible.map((group) => (
          <Group key={group.id} group={group} />
        ))}
      </ul>
    );
  }
  if (items.length === 0) return null;
  return (
    <ul {...rest} className={classes} data-bar-style={barStyle}>
      {items.map((item) => (
        <li
          key={item.id}
          className={styles.item}
          data-tone={item.tone ?? "neutral"}
          data-target={isTarget(item) || undefined}
        >
          <Row item={item} />
        </li>
      ))}
    </ul>
  );
}
