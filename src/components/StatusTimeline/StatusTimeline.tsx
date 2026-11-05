import type { HTMLAttributes, ReactNode } from "react";
import { PendingIcon } from "../ActionIcons";
import styles from "./StatusTimeline.module.css";

/**
 * Generic obligation-tracking vocabulary. Consumers can pass their own domain state values
 * straight through without a mapping layer.
 */
export type StatusTimelineNodeState = "needsTimestamp" | "pending" | "overdue" | "done" | "notApplicable";

export type StatusTimelineNode = {
  /** Stable id — used as the React key. */
  id: string;
  /** Already localised by the caller. */
  label: string;
  state: StatusTimelineNodeState;
  /** Localised caption shown in the node's state pill. It must name the state in words, not only by colour. */
  stateLabel: string;
  /** Pre-formatted, already-localized text for a recorded timestamp. */
  timestampLabel?: string;
  /** Pre-formatted, already-localized deadline text, shown only while there's no timestamp yet. */
  deadlineLabel?: string;
  /** Optional caption under the label (for example a short rule or note). */
  hint?: string;
  /** Inline control rendered on the node when it needs input — e.g. a datetime
   *  field plus a save button. Omit for a display-only node. */
  action?: ReactNode;
};

export type StatusTimelineTrack = {
  id: string;
  /** Localised track heading, for example "Review" or "Release". */
  title: string;
  /** A track with zero nodes is omitted entirely: the way to represent an obligation that does not
   *  apply at all, as opposed to a single node in the "notApplicable" state, which does not apply
   *  within an otherwise live track. */
  nodes: StatusTimelineNode[];
};

export type StatusTimelineProps = HTMLAttributes<HTMLDivElement> & { tracks: StatusTimelineTrack[] };

const NODE_TONE: Record<StatusTimelineNodeState, "neutral" | "warn" | "danger" | "ok"> = {
  needsTimestamp: "neutral",
  pending: "warn",
  overdue: "danger",
  done: "ok",
  notApplicable: "neutral",
};

function CheckIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OverdueIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3L12.5 10.5H3.5L8 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 5.6v2.4M8 9.3v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function NeedsTimestampIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.8" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.4 2.4" />
    </svg>
  );
}

function NotApplicableIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4.5 8h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const NODE_ICON: Record<StatusTimelineNodeState, () => ReactNode> = {
  needsTimestamp: NeedsTimestampIcon,
  pending: () => <PendingIcon size={13} />,
  overdue: OverdueIcon,
  done: CheckIcon,
  notApplicable: NotApplicableIcon,
};

function StatusTimelineNodeItem({ node }: { node: StatusTimelineNode }) {
  const Icon = NODE_ICON[node.state];
  return (
    <li className={`${styles.node} ${styles[node.state]}`}>
      <span className={styles.icon}>
        <Icon />
      </span>
      <div className={styles.body}>
        <div className={styles.head}>
          <strong className={styles.label}>{node.label}</strong>
          <span className={`${styles.pill} ${styles[NODE_TONE[node.state]]}`}>{node.stateLabel}</span>
        </div>
        {node.timestampLabel && <span className={styles.timestamp}>{node.timestampLabel}</span>}
        {!node.timestampLabel && node.deadlineLabel && (
          <span className={styles.due}>{node.deadlineLabel}</span>
        )}
        {node.hint && <p className={styles.hint}>{node.hint}</p>}
        {node.action && <div className={styles.actionSlot}>{node.action}</div>}
      </div>
    </li>
  );
}

/**
 * Connected-node status timeline: each node carries an icon, a state pill, an optional
 * timestamp or deadline, and an optional inline action.
 *
 * Nodes stack vertically at every viewport. A horizontal node graph does not fit a 320px screen
 * without scrolling or truncating text, so the layout only gains breathing room as it widens.
 */
export function StatusTimeline({ tracks, className, ...rest }: StatusTimelineProps) {
  return (
    <div {...rest} className={[styles.timeline, className].filter(Boolean).join(" ")}>
      {tracks
        .filter((track) => track.nodes.length > 0)
        .map((track) => (
          <section key={track.id} className={styles.track}>
            <h3 className={styles.trackTitle}>{track.title}</h3>
            <ol className={styles.nodes}>
              {track.nodes.map((node) => (
                <StatusTimelineNodeItem key={node.id} node={node} />
              ))}
            </ol>
          </section>
        ))}
    </div>
  );
}
