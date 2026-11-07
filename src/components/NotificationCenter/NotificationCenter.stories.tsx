import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  BookIcon,
  ChartIcon,
  DocumentIcon,
  InboxIcon,
  ServerIcon,
  ShieldIcon,
  UsersIcon,
} from "../../docs/demo";
import { Button } from "../Button";
import { NotificationCenter, type NotificationCenterProps } from "./NotificationCenter";
import { NotificationPanel } from "./NotificationPanel";
import { NotificationSummary } from "./NotificationSummary";
import type { NotificationItem } from "./types";

const formatUnread = (count: number) => `${count} unread`;

function Initials({ children }: { children: string }) {
  return (
    <span
      style={{
        display: "grid",
        placeItems: "center",
        inlineSize: "100%",
        blockSize: "100%",
        background: "var(--lufia-color-accent-subtle)",
        color: "var(--lufia-color-text-accent)",
        fontSize: "0.75rem",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

const items: NotificationItem[] = [
  {
    id: "1",
    group: "today",
    tab: "approvals",
    title: "Supplier proposal needs your review",
    meta: "Procurement assistant",
    time: "07:52",
    icon: <DocumentIcon size={16} />,
    unread: true,
    href: "#proposal-1",
  },
  {
    id: "2",
    group: "today",
    tab: "approvals",
    title: "Renewal quote is waiting for approval",
    meta: "Contracts",
    time: "07:31",
    icon: <ShieldIcon size={16} />,
    unread: true,
    href: "#quote",
  },
  {
    id: "3",
    group: "today",
    tab: "agents",
    title: "The weekly report finished running",
    meta: "Reporting agent",
    time: "06:58",
    icon: <ChartIcon size={16} />,
    unread: true,
    href: "#report",
  },
  {
    id: "4",
    group: "today",
    tab: "approvals",
    title: "Alex Rivera commented on your request",
    meta: "Alex Rivera",
    time: "06:12",
    avatar: <Initials>AR</Initials>,
    unread: true,
    href: "#comment",
  },
  {
    id: "5",
    group: "earlier",
    tab: "approvals",
    title: "Budget for the spring plan was approved",
    meta: "Finance",
    time: "Yesterday",
    icon: <BookIcon size={16} />,
    href: "#budget",
  },
  {
    id: "6",
    group: "earlier",
    tab: "agents",
    title: "Two documents could not be classified",
    meta: "Intake agent",
    time: "Yesterday",
    icon: <InboxIcon size={16} />,
    href: "#intake",
  },
  {
    id: "7",
    group: "earlier",
    tab: "stock",
    title: "Safety gloves are below the reorder level",
    meta: "Warehouse",
    time: "Mon",
    icon: <ServerIcon size={16} />,
    unread: true,
    href: "#stock",
  },
  {
    id: "8",
    group: "earlier",
    tab: "approvals",
    title: "Jordan Lee joined the approvals group",
    meta: "Jordan Lee",
    time: "Mon",
    icon: <UsersIcon size={16} />,
    href: "#group",
  },
];

const tabs = [
  { key: "all", label: "All", count: 8, all: true },
  { key: "approvals", label: "Approvals", count: 5 },
  { key: "agents", label: "Agents", count: 2 },
  {
    key: "stock",
    label: "Stock",
    count: 1,
  },
];

const base = {
  label: "Notifications",
  unreadCount: 5,
  unreadLabel: "unread",
  unreadCountLabel: formatUnread,
  items,
  groups: [
    { key: "today", label: "Today" },
    { key: "earlier", label: "Earlier" },
  ],
  tabs,
  markAllLabel: "Mark all as read",
  onMarkAllRead: () => {},
  footer: { label: "Notification settings", href: "#settings" },
  empty: { title: "You are all caught up", description: "New notifications will show up here." },
  loadingLabel: "Loading notifications",
} satisfies NotificationCenterProps;

const summary = (
  <NotificationSummary
    title="2 proposals due today"
    description="Review them before the end of the day."
    progress={{ done: 3, total: 8, label: "Proposals reviewed this week", valueText: "3 of 8 reviewed" }}
    action={{ label: "Review", href: "#review" }}
    footnote="2 due today · 6 later this week"
  />
);

const meta = {
  title: "Components/Overlays/NotificationCenter",
  component: NotificationCenter,
  parameters: { layout: "padded" },
  args: base,
  argTypes: {
    presentation: { control: "inline-radio", options: ["auto", "popover", "sheet"] },
    align: { control: "inline-radio", options: ["start", "end"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          minBlockSize: "46rem",
          maxInlineSize: "34rem",
          paddingInline: "1rem",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotificationCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: a bell with the unread count. Its accessible name reads "Notifications, 5 unread". */
export const Default: Story = { args: { presentation: "popover" } };
/** Open as a popover from the bell. Tabs, groups, unread rows and the footer link. */
export const Open: Story = { args: { defaultOpen: true, presentation: "popover" } };
export const WithSummary: Story = { args: { defaultOpen: true, presentation: "popover", summary } };
export const Loading: Story = { args: { defaultOpen: true, presentation: "popover", loading: true } };
export const Empty: Story = {
  args: {
    defaultOpen: true,
    presentation: "popover",
    items: [],
    unreadCount: 0,
    tabs: tabs.map((tab) => ({ ...tab, count: 0 })),
  },
};
export const Failed: Story = {
  args: {
    defaultOpen: true,
    presentation: "popover",
    error: (
      <div style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}>
        <span>Notifications could not be loaded.</span>
        <Button size="sm">Try again</Button>
      </div>
    ),
  },
};

const many: NotificationItem[] = Array.from({ length: 30 }, (_, index) => ({
  id: `m${index}`,
  group: index < 6 ? "today" : "earlier",
  tab: "approvals",
  title: `Notification number ${index + 1} with a title long enough to wrap onto a second line`,
  meta: "Procurement assistant",
  time: index < 6 ? `0${index + 1}:15` : "Last week",
  icon: <DocumentIcon size={16} />,
  unread: index < 4,
  href: `#many-${index}`,
}));

/** A long list scrolls inside the panel; the header, the tabs and the footer stay in place. */
export const ManyItems: Story = {
  args: { defaultOpen: true, presentation: "popover", items: many, unreadCount: 4, summary },
};

/** `presentation="auto"` is a sheet below 60rem. */
export const SheetPhone390: Story = {
  args: { defaultOpen: true, presentation: "auto", summary },
  globals: { viewport: { value: "w390", isRotated: false } },
};
export const SheetPhone320: Story = {
  args: { defaultOpen: true, presentation: "sheet" },
  globals: { viewport: { value: "w320", isRotated: false } },
};

/** The app raises `--lufia-overlay-z` above its fixed dock and header, and the sheet clears both. */
export const SheetOverDock: Story = {
  args: { defaultOpen: true, presentation: "sheet" },
  globals: { viewport: { value: "w390", isRotated: false } },
  decorators: [
    (Story) => (
      <>
        <style>{":root { --lufia-overlay-z: 9999; }"}</style>
        <div
          data-testid="header"
          style={{
            position: "fixed",
            insetInline: 0,
            insetBlockStart: 0,
            blockSize: "3rem",
            zIndex: 9000,
            background: "var(--lufia-color-bg-surface-solid)",
            borderBlockEnd: "1px solid var(--lufia-color-border-strong)",
          }}
        />
        <div
          data-testid="dock"
          style={{
            position: "fixed",
            insetInline: 0,
            insetBlockEnd: 0,
            blockSize: "4rem",
            zIndex: 9000,
            background: "var(--lufia-color-bg-surface-solid)",
            borderBlockStart: "1px solid var(--lufia-color-border-strong)",
          }}
        />
        <div style={{ transform: "translateZ(0)", position: "relative", zIndex: 1 }}>
          <Story />
        </div>
      </>
    ),
  ],
};

export const Dark: Story = {
  args: { defaultOpen: true, presentation: "popover", summary },
  globals: { mode: "dark" },
};

/** Closed on load, the way a person meets it: open it, switch tabs, mark everything read, or simulate a new arrival. */
function Playground() {
  const [list, setList] = useState(items);
  const [tab, setTab] = useState("all");
  const [arrivals, setArrivals] = useState(0);
  const unread = list.filter((item) => item.unread).length;
  const count = (key: string) => list.filter((item) => item.tab === key && item.unread).length;
  return (
    <div style={{ display: "grid", gap: "1rem", justifyItems: "end" }}>
      <NotificationCenter
        {...base}
        presentation="popover"
        items={list}
        unreadCount={unread}
        activeTab={tab}
        onTabChange={setTab}
        tabs={[
          { key: "all", label: "All", count: unread, all: true },
          { key: "approvals", label: "Approvals", count: count("approvals") },
          { key: "agents", label: "Agents", count: count("agents") },
          { key: "stock", label: "Stock", count: count("stock") },
        ]}
        onMarkAllRead={() => setList(list.map((item) => ({ ...item, unread: false })))}
        summary={summary}
      />
      <Button
        size="sm"
        onClick={() => {
          const id = `new-${arrivals}`;
          setArrivals(arrivals + 1);
          setList([
            {
              id,
              group: "today",
              tab: "approvals",
              title: `A new proposal arrived (${arrivals + 1})`,
              meta: "Procurement assistant",
              time: "Now",
              icon: <DocumentIcon size={16} />,
              unread: true,
              href: "#new",
            },
            ...list,
          ]);
        }}
      >
        Simulate a new notification
      </Button>
    </div>
  );
}
export const Interactive: Story = { render: () => <Playground /> };

/** The panel on its own, hosted in a page instead of a popover. */
export const PanelOnly: Story = {
  render: () => (
    <div
      style={{
        inlineSize: "min(100%, 26rem)",
        border: "1px solid var(--lufia-color-border-subtle)",
        borderRadius: "var(--lufia-radius-panel)",
        overflow: "hidden",
        display: "flex",
        maxBlockSize: "40rem",
      }}
    >
      <NotificationPanel {...base} summary={summary} />
    </div>
  ),
};
