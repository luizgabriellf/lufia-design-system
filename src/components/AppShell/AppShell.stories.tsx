import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DemoBrand,
  DemoFooter,
  DemoPage,
  DemoShell,
  demoGroups,
  demoLabels,
} from "../../docs/demo/AppShellDemo";
import {
  ArrowRightIcon,
  ChartIcon,
  DocumentIcon,
  HelpIcon,
  HomeIcon,
  InboxIcon,
  PlusIcon,
  SettingsIcon,
} from "../../docs/demo";
import { Skeleton } from "../../motion";
import { Button } from "../Button";
import { AppShell } from "./AppShell";
import { ShellFooter, ShellFooterItem } from "./ShellFooter";
import { ShellPrimaryActionSlot, useShellPrimaryAction } from "./primaryAction";

const meta = {
  title: "Components/Navigation/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    docs: { story: { inline: false, iframeHeight: 640 } },
  },
  args: { groups: demoGroups, labels: demoLabels, children: null },
  render: (args) => <DemoShell {...args} />,
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Wide screens: the sidebar with its groups. Choose items to move the current page. */
export const Desktop: Story = {
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** The sidebar as a rail: icons only, names kept for assistive technology, and a tooltip on hover and keyboard focus (never on touch). */
export const Rail: Story = {
  args: { defaultCollapsed: true },
  globals: { viewport: { value: "w1440", isRotated: false } },
};

export const GroupOpenOnArrival: Story = {
  render: (args) => <DemoShell {...args} initialPath="/insights/trends" />,
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** Phones: the top bar, the floating bar above the safe area and, behind the menu button, the navigation sheet. */
export const Phone: Story = {
  globals: { viewport: { value: "w390", isRotated: false } },
};

export const SmallPhone: Story = {
  globals: { viewport: { value: "w320", isRotated: false } },
};

export const Tablet: Story = {
  globals: { viewport: { value: "w768", isRotated: false } },
};

/** The floating bar without a main action: search and the menu. */
export const PhoneWithoutPrimaryAction: Story = {
  args: { primaryAction: undefined },
  globals: { viewport: { value: "w390", isRotated: false } },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** Fully custom slots and a page of your own. */
export const CustomSlots: Story = {
  render: (args) => (
    <DemoShell
      {...args}
      brand={({ collapsed }) => <DemoBrand collapsed={collapsed} />}
      footer={({ collapsed }) => <DemoFooter collapsed={collapsed} />}
      groups={demoGroups.slice(0, 1)}
    >
      <DemoPage title="One group, no search" />
    </DemoShell>
  ),
  args: { search: undefined },
  globals: { viewport: { value: "w1440", isRotated: false } },
};

const barStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.5rem 2rem",
  borderBlockEnd: "1px solid var(--lufia-color-border-subtle)",
  color: "var(--lufia-color-text-muted)",
} as const;

/** `topBar` and `statusRow` sit beside the sidebar, above the page, at every width. */
export const TopBarAndStatusRow: Story = {
  args: {
    topBar: (
      <div style={barStyle}>
        <strong>Unit: Lisbon</strong>
        <Button size="sm">Change unit</Button>
      </div>
    ),
    statusRow: (
      <div role="status" style={{ ...barStyle, background: "var(--lufia-color-status-success-bg)" }}>
        All changes synced
      </div>
    ),
  },
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** `navigationPending`: a skeleton stands in for the navigation while the next route loads. */
export const NavigationPending: Story = {
  args: {
    navigationPending: (
      <div style={{ display: "grid", gap: "0.75rem", padding: "0.5rem" }}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} style={{ blockSize: "2rem" }} />
        ))}
      </div>
    ),
  },
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** `searchTrigger` replaces the sidebar's search entry; here a custom entry that announces its shortcut and popup. */
export const CustomSearchTrigger: Story = {
  args: {
    searchTrigger: ({ collapsed }) => (
      <Button
        fullWidth
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K"
        iconEnd={collapsed ? undefined : <kbd>Ctrl K</kbd>}
      >
        {collapsed ? "Find" : "Find anything"}
      </Button>
    ),
  },
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** Static (non-collapsible) headings, a base group with no heading, and a per-item `ariaLabel`. */
export const StaticHeadings: Story = {
  args: {
    groups: [
      { key: "base", items: [{ key: "home", label: "Overview", href: "/", exact: true }] },
      {
        key: "work",
        label: "Work",
        items: [{ key: "inbox", label: "Inbox", href: "/inbox", badge: 3, ariaLabel: "Inbox, 3 unread" }],
      },
    ],
  },
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** `data-*` attributes on the floating bar's controls. Inspect the bar on a phone. */
export const FloatBarDataAttributes: Story = {
  args: {
    search: { label: "Search…", onSelect: () => {}, data: { "data-tour": "search" } },
    primaryAction: { label: "New item", onSelect: () => {}, data: { "data-tour": "primary" } },
    menuData: { "data-tour": "menu" },
  },
  globals: { viewport: { value: "w390", isRotated: false } },
};

/** `sheetAs="dialog"`: the phone navigation is a native dialog in the browser's top layer. */
export const NativeDialogSheet: Story = {
  args: { sheetAs: "dialog" },
  globals: { viewport: { value: "w390", isRotated: false } },
};

function RegisteredPage() {
  const hosted = useShellPrimaryAction({
    label: "New order",
    icon: <PlusIcon size={16} />,
    onSelect: () => {},
  });
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
      <h1 style={{ margin: 0 }}>Orders</h1>
      {hosted ? <ShellPrimaryActionSlot /> : <Button variant="primary">New order</Button>}
    </div>
  );
}

/** A page registers its main action with `useShellPrimaryAction`: the desktop slot and the phone floating bar both show it. */
export const RegisteredPrimaryAction: Story = {
  args: { primaryAction: undefined },
  render: (args) => (
    <DemoShell {...args}>
      <RegisteredPage />
    </DemoShell>
  ),
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** Counts with a tone, capped at 99+ and hidden at 0; a word badge with its own tone. In the rail the count sits on the icon. */
export const CountsAndBadges: Story = {
  args: {
    groups: [
      {
        key: "work",
        items: [
          { key: "home", label: "Overview", href: "/", exact: true, icon: <HomeIcon size={18} /> },
          {
            key: "deadlines",
            label: "Deadlines",
            href: "/deadlines",
            icon: <ChartIcon size={18} />,
            count: 7,
            countTone: "danger",
          },
          {
            key: "exams",
            label: "Exams",
            href: "/exams",
            icon: <DocumentIcon size={18} />,
            count: 240,
            countTone: "warning",
          },
          {
            key: "inbox",
            label: "Inbox",
            href: "/inbox",
            icon: <InboxIcon size={18} />,
            count: 0,
            badge: "New",
            badgeTone: "neutral",
          },
        ],
      },
    ],
  },
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** `ShellFooter` and `ShellFooterItem`: links and buttons with an icon and a label, a count and a pending state. */
export const Footer: Story = {
  render: (args) => (
    <DemoShell
      {...args}
      footer={
        <ShellFooter aria-label="Account and help">
          <ShellFooterItem label="Settings" href="/settings" icon={<SettingsIcon size={18} />} active />
          <ShellFooterItem
            label="Help"
            href="#help"
            icon={<HelpIcon size={18} />}
            count={3}
            countTone="danger"
          />
          <ShellFooterItem label="Sign out" icon={<ArrowRightIcon size={18} />} pending />
        </ShellFooter>
      }
    />
  ),
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** The same footer in the rail: icons only, the tooltip names each one, the count sits on the icon. */
export const FooterInRail: Story = {
  ...Footer,
  args: { defaultCollapsed: true },
};

/** `mainProps`, `mainKey` and `mainStart`: the `<main>` is the shell's, and a banner can live inside it. */
export const MainSlots: Story = {
  args: {
    mainProps: { id: "content", "data-page-area": "demo" },
    mainStart: (
      <div
        role="note"
        style={{ ...barStyle, marginBlockEnd: "1rem", border: "1px solid var(--lufia-color-border-subtle)" }}
      >
        Your trial ends in 5 days. This banner scrolls with the page and remounts with `mainKey`.
      </div>
    ),
    topBar: (
      <div style={barStyle}>
        <strong>Beside the sidebar, above the page: stays put</strong>
      </div>
    ),
  },
  globals: { viewport: { value: "w1440", isRotated: false } },
};
