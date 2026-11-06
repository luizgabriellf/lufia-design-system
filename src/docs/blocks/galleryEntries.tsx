import type { ReactNode } from "react";
import {
  DeleteIcon,
  DuplicateIcon,
  EditIcon,
  OpenIcon,
  PendingIcon,
  ReportIcon,
} from "../../components/ActionIcons";
import { DetailAttentionCard } from "../../components/DetailAttentionCard";
import { DetailList } from "../../components/DetailList";
import { DetailSectionCard } from "../../components/DetailSectionCard";
import { EmptyState } from "../../components/EmptyState";
import { SortableTh } from "../../components/SortableTh";
import { StatusTimeline } from "../../components/StatusTimeline";
import { Stepper } from "../../components/Stepper";
import { TableToolbar } from "../../components/TableToolbar";
import { AnimatedNumber, ChangeHighlight, Collapse, Reveal, Skeleton } from "../../motion";
import { DemoButton, DocumentIcon } from "../demo";
import styles from "./ComponentGallery.module.css";

export type GalleryEntry = {
  name: string;
  group: "Components" | "Motion";
  /** Storybook docs id of the page the card links to. */
  docsId: string;
  summary: string;
  preview: ReactNode;
};

const noop = () => {};

const ICONS = [EditIcon, DuplicateIcon, OpenIcon, ReportIcon, PendingIcon, DeleteIcon];

export const GALLERY_ENTRIES: GalleryEntry[] = [
  {
    name: "EmptyState",
    group: "Components",
    docsId: "components-emptystate",
    summary: "What to show when a list or panel has nothing yet, with the one next step.",
    preview: (
      <EmptyState
        icon={<DocumentIcon size={32} />}
        title="No documents yet"
        body="Documents you upload will appear here."
        action={<DemoButton size="sm">Upload</DemoButton>}
        className={styles.emptyState}
      />
    ),
  },
  {
    name: "DetailAttentionCard",
    group: "Components",
    docsId: "components-detailattentioncard",
    summary: "A high-signal card for deadlines and risk, with a tone mark and an optional action.",
    preview: (
      <DetailAttentionCard
        tone="warn"
        toneLabel="Warning"
        title="Review due in 5 days"
        description="Schedule it before the deadline."
        action={<DemoButton size="sm">Schedule</DemoButton>}
      />
    ),
  },
  {
    name: "DetailList",
    group: "Components",
    docsId: "components-detaillist",
    summary: "Key and value rows in a native description list.",
    preview: (
      <DetailList
        rows={[
          { label: "Name", value: "Ada Example" },
          { label: "Role", value: "Team lead" },
          { label: "Identifier", value: "A-1042", mono: true },
        ]}
      />
    ),
  },
  {
    name: "DetailSectionCard",
    group: "Components",
    docsId: "components-detailsectioncard",
    summary: "A section container with a consistent heading, action slot and content area.",
    preview: (
      <DetailSectionCard
        title="Contact details"
        icon={<EditIcon />}
        action={<DemoButton size="sm">Edit</DemoButton>}
      >
        <DetailList rows={[{ label: "Email", value: "ada@example.com" }]} />
      </DetailSectionCard>
    ),
  },
  {
    name: "SortableTh",
    group: "Components",
    docsId: "components-sortableth",
    summary: "A column header with a real button and aria-sort on the cell.",
    preview: (
      <table className={styles.miniTable}>
        <thead>
          <tr>
            <SortableTh label="Name" active dir="asc" onSort={noop} />
            <SortableTh label="Role" active={false} dir="asc" onSort={noop} />
          </tr>
        </thead>
      </table>
    ),
  },
  {
    name: "StatusTimeline",
    group: "Components",
    docsId: "components-statustimeline",
    summary: "A connected timeline of steps grouped into tracks, each with a state pill.",
    preview: (
      <StatusTimeline
        tracks={[
          {
            id: "review",
            title: "Review",
            nodes: [
              {
                id: "a",
                label: "Request submitted",
                state: "done",
                stateLabel: "Done",
                timestampLabel: "5 Nov",
              },
              {
                id: "b",
                label: "Written feedback",
                state: "pending",
                stateLabel: "Pending",
                deadlineLabel: "Due 12 Nov",
              },
            ],
          },
        ]}
      />
    ),
  },
  {
    name: "Stepper",
    group: "Components",
    docsId: "components-stepper",
    summary: "A mobile-first step indicator that expands into a numbered row from 600px.",
    preview: (
      <Stepper
        steps={[
          { key: "a", label: "Details" },
          { key: "b", label: "Review" },
          { key: "c", label: "Done" },
        ]}
        current={1}
      />
    ),
  },
  {
    name: "TableToolbar",
    group: "Components",
    docsId: "components-tabletoolbar",
    summary: "Filter chips and an optional search box for the top of a table or list.",
    preview: (
      <TableToolbar
        filters={[
          { key: "all", label: "All" },
          { key: "open", label: "Open" },
          { key: "done", label: "Done" },
        ]}
        activeFilter="open"
        onFilterChange={noop}
      />
    ),
  },
  {
    name: "ActionIcons",
    group: "Components",
    docsId: "components-actionicons",
    summary: "Six small outline icons that inherit the colour of their text.",
    preview: (
      <div className={styles.iconRow}>
        {ICONS.map((Icon, index) => (
          <span key={index} className={styles.iconTile}>
            <Icon size={18} />
          </span>
        ))}
      </div>
    ),
  },
  {
    name: "useBodyScrollLock",
    group: "Components",
    docsId: "components-usebodyscrolllock",
    summary: "Locks page scroll under an overlay and restores it. Stacked overlays are safe.",
    preview: (
      <pre className={styles.snippet}>
        <code>{"useBodyScrollLock(isOpen);"}</code>
      </pre>
    ),
  },
  {
    name: "Reveal",
    group: "Motion",
    docsId: "motion-reveal",
    summary: "Mount and unmount content with an enter and an exit animation.",
    preview: (
      <Reveal show variant="rise">
        <div className={styles.toast}>Changes saved</div>
      </Reveal>
    ),
  },
  {
    name: "Collapse",
    group: "Motion",
    docsId: "motion-collapse",
    summary: "Animate height with CSS grid rows. No measuring in JavaScript.",
    preview: (
      <div className={styles.disclosure}>
        <span className={styles.disclosureHead}>Shipping details</span>
        <Collapse open>
          <p className={styles.disclosureBody}>Orders ship within two working days.</p>
        </Collapse>
      </div>
    ),
  },
  {
    name: "Skeleton",
    group: "Motion",
    docsId: "motion-skeleton",
    summary: "Loading placeholders shaped like the content that replaces them.",
    preview: (
      <div className={styles.skeletons} aria-hidden="true">
        <Skeleton variant="circle" width="2.5rem" still />
        <div className={styles.skeletonLines}>
          <Skeleton width="70%" still />
          <Skeleton width="45%" still />
        </div>
      </div>
    ),
  },
  {
    name: "AnimatedNumber",
    group: "Motion",
    docsId: "motion-animatednumber",
    summary: "A number that counts to its new value, with no animation library.",
    preview: (
      <p className={styles.bigNumber}>
        <AnimatedNumber value={1280} format={(n) => n.toLocaleString("en-US")} />
      </p>
    ),
  },
  {
    name: "ChangeHighlight",
    group: "Motion",
    docsId: "motion-changehighlight",
    summary: "A soft wash behind a value that changed while it was on screen. Never on mount.",
    preview: (
      <p className={styles.statusLine}>
        Status:{" "}
        <ChangeHighlight value="Shipped">
          <strong>Shipped</strong>
        </ChangeHighlight>
      </p>
    ),
  },
  {
    name: "usePrefersReducedMotion",
    group: "Motion",
    docsId: "motion-useprefersreducedmotion",
    summary: "Returns true while the system asks for reduced motion, and follows changes.",
    preview: (
      <pre className={styles.snippet}>
        <code>{"const reduced = usePrefersReducedMotion();"}</code>
      </pre>
    ),
  },
];
