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
import { DocumentIcon } from "../demo";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Checkbox } from "../../components/Checkbox";
import { SegmentedToggle } from "../../components/SegmentedToggle";
import { Switch } from "../../components/Switch";
import { TextInput } from "../../components/TextInput";
import styles from "./ComponentGallery.module.css";

export type GalleryEntry = {
  name: string;
  preview: ReactNode;
};

const noop = () => {};

const ICONS = [EditIcon, DuplicateIcon, OpenIcon, ReportIcon, PendingIcon, DeleteIcon];

export const GALLERY_ENTRIES: GalleryEntry[] = [
  {
    name: "Button",
    preview: (
      <div className={styles.chipRow}>
        <Button variant="primary" size="sm">
          Save
        </Button>
        <Button size="sm">Cancel</Button>
        <Button variant="danger" size="sm">
          Delete
        </Button>
      </div>
    ),
  },
  {
    name: "Badge",
    preview: (
      <div className={styles.chipRow}>
        <Badge tone="success" dot>
          Done
        </Badge>
        <Badge tone="warning" dot>
          Pending
        </Badge>
        <Badge tone="danger">Overdue</Badge>
      </div>
    ),
  },
  {
    name: "Card",
    preview: (
      <Card title="Storage" padding="sm">
        <span className={styles.statusLine}>14.2 of 20 GB used</span>
      </Card>
    ),
  },
  {
    name: "TextInput",
    preview: <TextInput aria-label="Work email" placeholder="name@example.com" readOnly />,
  },
  {
    name: "Switch",
    preview: <Switch label="Weekly summary" defaultChecked />,
  },
  {
    name: "Checkbox",
    preview: <Checkbox label="Remember me" defaultChecked />,
  },
  {
    name: "SegmentedToggle",
    preview: (
      <SegmentedToggle
        label="Density"
        defaultValue="comfortable"
        options={[
          { value: "comfortable", label: "Comfortable" },
          { value: "compact", label: "Compact" },
        ]}
      />
    ),
  },
  {
    name: "EmptyState",
    preview: (
      <EmptyState
        icon={<DocumentIcon size={32} />}
        title="No documents yet"
        body="Documents you upload will appear here."
        action={<Button size="sm">Upload</Button>}
        className={styles.emptyState}
      />
    ),
  },
  {
    name: "DetailAttentionCard",
    preview: (
      <DetailAttentionCard
        tone="warn"
        toneLabel="Warning"
        title="Review due in 5 days"
        description="Schedule it before the deadline."
        action={<Button size="sm">Schedule</Button>}
      />
    ),
  },
  {
    name: "DetailList",
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
    preview: (
      <DetailSectionCard title="Contact details" icon={<EditIcon />} action={<Button size="sm">Edit</Button>}>
        <DetailList rows={[{ label: "Email", value: "ada@example.com" }]} />
      </DetailSectionCard>
    ),
  },
  {
    name: "SortableTh",
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
    preview: (
      <pre className={styles.snippet}>
        <code>{"useBodyScrollLock(isOpen);"}</code>
      </pre>
    ),
  },
  {
    name: "Reveal",
    preview: (
      <Reveal show variant="rise">
        <div className={styles.toast}>Changes saved</div>
      </Reveal>
    ),
  },
  {
    name: "Collapse",
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
    preview: (
      <p className={styles.bigNumber}>
        <AnimatedNumber value={1280} format={(n) => n.toLocaleString("en-US")} />
      </p>
    ),
  },
  {
    name: "ChangeHighlight",
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
    preview: (
      <pre className={styles.snippet}>
        <code>{"const reduced = usePrefersReducedMotion();"}</code>
      </pre>
    ),
  },
];
