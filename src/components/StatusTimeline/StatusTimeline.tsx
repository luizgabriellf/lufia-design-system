import type { HTMLAttributes, ReactNode } from "react";
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

/* One marker family: every glyph is drawn on the same 16-unit grid, with the same stroke weight and round caps, and
   centred on (8, 8), so the shape alone tells the states apart (WCAG 1.4.1) and none sits off-centre in its ring. */
const GLYPH_STROKE = {
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const NODE_GLYPH: Record<StatusTimelineNodeState, ReactNode> = {
  done: <path d="M4.6 8.3l2.3 2.3 4.5-4.9" {...GLYPH_STROKE} />,
  pending: <path d="M8 4.6V8l2.4 1.6" {...GLYPH_STROKE} />,
  overdue: <path d="M8 4.5v4.3M8 11.5v.01" {...GLYPH_STROKE} />,
  needsTimestamp: <path d="M5 8h.01M8 8h.01M11 8h.01" {...GLYPH_STROKE} />,
  notApplicable: <path d="M5 8h6" {...GLYPH_STROKE} />,
};

function NodeMarker({ state }: { state: StatusTimelineNodeState }) {
  return (
    <svg className={styles.glyph} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {NODE_GLYPH[state]}
    </svg>
  );
}

function StatusTimelineNodeItem({ node }: { node: StatusTimelineNode }) {
  return (
    <li className={`${styles.node} ${styles[node.state]}`}>
      <span className={styles.icon}>
        <NodeMarker state={node.state} />
      </span>
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
