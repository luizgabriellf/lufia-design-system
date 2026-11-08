import type { HTMLAttributes, ReactNode } from "react";
import { StatusIcon, type StatusTone } from "../StatusIcon/StatusIcon";
import { StatusBadge, type BadgeTone } from "../Badge";
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

const NODE_TONE: Record<StatusTimelineNodeState, BadgeTone> = {
  needsTimestamp: "neutral",
  pending: "warning",
  overdue: "danger",
  done: "success",
  notApplicable: "neutral",
};

/* The marker is the shared status family: its shape names the state (WCAG 1.4.1), the colour only reinforces it. */
const NODE_STATUS: Record<StatusTimelineNodeState, StatusTone> = {
  needsTimestamp: "needsInput",
  pending: "pending",
  overdue: "danger",
  done: "success",
  notApplicable: "neutral",
};

function StatusTimelineNodeItem({ node }: { node: StatusTimelineNode }) {
  return (
    <li className={styles.node} data-state={node.state}>
      <StatusIcon tone={NODE_STATUS[node.state]} variant="ring" className={styles.icon} />
      <div className={styles.body}>
        <div className={styles.head}>
          <strong className={styles.label}>{node.label}</strong>
          <StatusBadge tone={NODE_TONE[node.state]}>{node.stateLabel}</StatusBadge>
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
