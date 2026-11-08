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
  ShieldIcon,
  UsersIcon,
} from "../../docs/demo";
import { Skeleton } from "../../motion";
import { Button } from "../Button";
import { AppShell } from "./AppShell";
import { useState } from "react";
import { ShellFooter, ShellFooterItem } from "./ShellFooter";
import { CommandPalette, type CommandItem } from "../CommandPalette";
import {
  ShellPrimaryActionOwner,
  ShellPrimaryActionSlot,
  useShellPrimaryAction,
  useShellPrimaryActionState,
} from "./primaryAction";
import { doneRouteProgress, startRouteProgress } from "./RouteProgress";
import type { ShellNavGroup } from "./navigation";

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

/**
 * The shell sits in a dark scope set on its wrapper (`data-lufia-theme` and `data-lufia-mode`), not on `<html>`. The phone
 * sheet is portalled to `<body>`, outside that wrapper, and copies the wrapper's theme and mode so it opens dark too. An app
 * that scopes its palette with its own class passes it in `sheetProps`.
 */
export const SheetInScopedDarkMode: Story = {
  render: (args) => (
    <div
      data-lufia-theme="default"
      data-lufia-mode="dark"
      style={{
        minBlockSize: "100dvh",
        background: "var(--lufia-color-bg-canvas)",
        color: "var(--lufia-color-text-default)",
      }}
    >
      <DemoShell {...args} />
    </div>
  ),
  args: { menuOpen: true, sheetProps: { "data-demo": "scoped-sheet" } },
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

/** Counts with a tone (`neutral`, `success`, `warning`, `danger`), capped at 99+ and hidden at 0; a word badge with its own tone. In the rail the count sits on the icon. */
export const CountsAndBadges: Story = {
  args: {
    groups: [
      {
        key: "work",
        items: [
          { key: "home", label: "Overview", href: "/", exact: true, icon: <HomeIcon size={18} /> },
          {
            key: "messages",
            label: "Inbox",
            href: "/inbox",
            icon: <InboxIcon size={18} />,
            count: 7,
            countTone: "danger",
          },
          {
            key: "tasks",
            label: "Tasks",
            href: "/tasks",
            icon: <DocumentIcon size={18} />,
            count: 240,
            countTone: "warning",
          },
          {
            key: "archive",
            label: "Archive",
            href: "/archive",
            icon: <ChartIcon size={18} />,
            count: 0,
            badge: "New",
            badgeTone: "neutral",
          },
          {
            key: "backups",
            label: "Backups",
            href: "/backups",
            icon: <ShieldIcon size={18} />,
            badge: "Healthy",
            badgeTone: "success",
          },
          {
            key: "done",
            label: "Completed",
            href: "/done",
            icon: <DocumentIcon size={18} />,
            count: 12,
            countTone: "success",
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

/**
 * `context`: the workspace the person is in, between the brand and the search, and above the navigation in the sheet. A
 * function gets the surface, so the same switcher is a card in the sidebar and a button that closes the sheet in it.
 */
export const ContextSlot: Story = {
  args: {
    context: ({ surface, collapsed, closeSheet }) => (
      <button
        type="button"
        onClick={surface === "sheet" ? closeSheet : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: "0.6rem",
          inlineSize: "100%",
          padding: "0.5rem",
          border: "1px solid var(--lufia-color-border-subtle)",
          borderRadius: "var(--lufia-radius-control)",
          background: "var(--lufia-color-bg-surface-raised)",
          color: "var(--lufia-color-text-default)",
          font: "inherit",
        }}
      >
        <span aria-hidden="true">A</span>
        {collapsed ? <span className="sb-sr-only">Acme Lisbon</span> : <span>Acme Lisbon</span>}
      </button>
    ),
  },
  globals: { viewport: { value: "w1440", isRotated: false } },
};

function ControlledSheet(args: Parameters<typeof DemoShell>[0]) {
  const [open, setOpen] = useState(false);
  return (
    <DemoShell
      {...args}
      menuOpen={open}
      onMenuOpenChange={setOpen}
      hideSheetNavigation
      topBarEnd={
        <Button size="sm" onClick={() => setOpen(true)}>
          Switch
        </Button>
      }
      context={
        <p style={{ margin: 0, padding: "0.5rem" }}>
          Pick another workspace here, in place of the navigation.
        </p>
      }
    />
  );
}

/** `menuOpen` and `hideSheetNavigation`: a control of your own opens the sheet, and a switcher takes the navigation's place. */
export const ControlledSheetWithSwitcher: Story = {
  render: (args) => <ControlledSheet {...args} />,
  globals: { viewport: { value: "w390", isRotated: false } },
};

function PendingPage(args: Parameters<typeof DemoShell>[0]) {
  const [loading, setLoading] = useState(false);
  return (
    <DemoShell
      {...args}
      trackRoute
      routePending={loading}
      mainPending={
        loading ? (
          <div style={{ display: "grid", gap: "0.75rem" }} aria-hidden="true">
            <Skeleton style={{ blockSize: "2rem", inlineSize: "40%" }} />
            <Skeleton style={{ blockSize: "6rem" }} />
            <Skeleton style={{ blockSize: "6rem" }} />
          </div>
        ) : undefined
      }
      mainStart={
        <div style={{ ...barStyle, marginBlockEnd: "1rem" }}>
          <span>This banner stays while the page loads.</span>
          <Button size="sm" onClick={() => setLoading((now) => !now)}>
            {loading ? "Arrive" : "Start a slow navigation"}
          </Button>
        </div>
      }
    />
  );
}

/**
 * `routeKey`, `routePending` and `mainPending`: the progress bar at the top appears after 150 ms, the skeleton stands in
 * for the page (which stays mounted) and the arriving page fades in. Choose another item to play the route motion.
 */
export const RouteMotionAndPending: Story = {
  render: (args) => <PendingPage {...args} />,
  globals: { viewport: { value: "w1440", isRotated: false } },
};

function ProgressFromCode(args: Parameters<typeof DemoShell>[0]) {
  const [pending, setPending] = useState(false);
  return (
    <DemoShell
      {...args}
      trackRoute
      routePending={pending}
      routeTrackLinks
      mainStart={
        <div style={{ ...barStyle, marginBlockEnd: "1rem", flexWrap: "wrap" }}>
          <span>Start the bar from code, without a link.</span>
          <span style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Button size="sm" onClick={() => startRouteProgress()}>
              startRouteProgress()
            </Button>
            <Button size="sm" onClick={() => doneRouteProgress()}>
              doneRouteProgress()
            </Button>
            <Button size="sm" aria-pressed={pending} onClick={() => setPending((now) => !now)}>
              {pending ? "routePending: on" : "routePending: off"}
            </Button>
          </span>
        </div>
      }
    />
  );
}

/**
 * `startRouteProgress()` and `doneRouteProgress()` drive the bar from code (a save that navigates, a search-param change).
 * They combine with `routePending` and tracked link clicks: the bar stays while any of them is in progress.
 */
export const RouteProgressFromCode: Story = {
  render: (args) => <ProgressFromCode {...args} />,
  globals: { viewport: { value: "w1440", isRotated: false } },
};

function PaletteActions() {
  const [open, setOpen] = useState(false);
  const shell = useShellPrimaryActionState();
  const items: CommandItem[] = [
    ...(shell?.action
      ? [
          {
            key: "primary",
            label: shell.action.label,
            description: shell.action.description,
            group: "Actions",
            onSelect: () => shell.action?.onSelect?.(),
          },
        ]
      : []),
    { key: "inbox", label: "Inbox", group: "Go to", onSelect: () => {} },
  ];
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open the palette</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={items}
        shortcut={false}
        labels={{
          title: "Search or run a command",
          placeholder: "Type a command…",
          empty: (query) => `No results for “${query}”`,
          resultCount: (count) => `${count} results`,
        }}
      />
    </>
  );
}

function OrdersPage() {
  useShellPrimaryAction({
    label: "New order",
    description: "Start an order for a customer",
    icon: <PlusIcon size={16} />,
    onSelect: () => {},
  });
  return (
    <div style={{ display: "grid", gap: "1rem", justifyItems: "start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <h1 style={{ margin: 0 }}>Orders</h1>
        <ShellPrimaryActionSlot />
      </div>
      <PaletteActions />
    </div>
  );
}

/**
 * `useShellPrimaryActionState` reads the shell's current action without registering one: here a command palette lists it
 * under Actions, with the `description` the page registered.
 */
export const PrimaryActionInPalette: Story = {
  args: { primaryAction: undefined },
  render: (args) => (
    <DemoShell {...args}>
      <OrdersPage />
    </DemoShell>
  ),
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/**
 * `ShellPrimaryActionOwner`: a page that will register its own action marks itself in the server markup, so the shell's
 * default stays hidden (its place kept) on a hard load instead of flashing before the page's action arrives. This page
 * renders the mark and never registers, so the default stays hidden.
 */
export const PrimaryActionOwnerMark: Story = {
  render: (args) => (
    <DemoShell {...args}>
      <ShellPrimaryActionOwner />
      <h1 style={{ margin: 0 }}>Orders</h1>
      <ShellPrimaryActionSlot />
    </DemoShell>
  ),
  globals: { viewport: { value: "w390", isRotated: false } },
};

/** `desktopPrimaryFallback={false}` and `primaryAction.onIntent`: the default action stays on the phone bar only. */
export const PrimaryActionFallbackOnPhonesOnly: Story = {
  args: {
    desktopPrimaryFallback: false,
    primaryAction: { label: "New item", icon: <PlusIcon size={16} />, onIntent: () => {} },
  },
  globals: { viewport: { value: "w390", isRotated: false } },
};

const nestedGroups: ShellNavGroup[] = [
  {
    key: "workspace",
    label: "Workspace",
    items: [
      { key: "home", label: "Overview", href: "/", exact: true, icon: <HomeIcon size={18} /> },
      { key: "inbox", label: "Inbox", href: "/inbox", icon: <InboxIcon size={18} />, count: 4 },
      {
        key: "admin",
        label: "Administration",
        href: "/admin",
        icon: <SettingsIcon size={18} />,
        items: [
          { key: "admin-people", label: "People", href: "/admin?section=people", match: "query" },
          { key: "admin-roles", label: "Roles", href: "/admin?section=roles", match: "query" },
          {
            key: "admin-audit",
            label: "Audit log",
            href: "/admin?section=audit",
            match: "query",
            badge: "Clean",
            badgeTone: "success",
          },
        ],
      },
      {
        key: "teams",
        label: "Teams",
        href: "/teams",
        icon: <UsersIcon size={18} />,
        items: [
          { key: "teams-active", label: "Active", href: "/teams/active" },
          { key: "teams-archived", label: "Archived", href: "/teams/archived" },
        ],
      },
    ],
  },
];

/**
 * Sub-items under one item: sections chosen by a query string (`match: "query"`, with `currentPath` passed with its
 * query) and plain child paths. The sub-items of the current branch are listed; the other branches stay folded.
 */
export const NestedNavigation: Story = {
  render: (args) => <DemoShell {...args} groups={nestedGroups} initialPath="/admin?section=roles" />,
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/**
 * In the rail the sub-items are hidden: the item that holds the current one takes the active look and
 * `aria-current="true"`, and its icon links to the item's own page.
 */
export const NestedNavigationRail: Story = {
  render: (args) => (
    <DemoShell {...args} groups={nestedGroups} initialPath="/admin?section=roles" defaultCollapsed />
  ),
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** The same sub-items in the phone navigation sheet. */
export const NestedNavigationPhone: Story = {
  render: (args) => <DemoShell {...args} groups={nestedGroups} initialPath="/admin?section=roles" />,
  globals: { viewport: { value: "w390", isRotated: false } },
};

/**
 * `routeTransitionProps`: a class on the region that plays the route motion, so an app's own CSS can stagger the
 * sections of the arriving page (here 40 ms apart, transform and opacity only, nothing under reduced motion). Choose
 * another item to see it.
 */
export const StaggeredRouteEntrance: Story = {
  render: (args) => (
    <>
      <style>{`
        .demo-stagger > [data-route-enter] > * {
          animation: demo-stagger-in var(--lufia-motion-duration-enter) var(--lufia-motion-easing-out) backwards;
        }
        .demo-stagger > [data-route-enter] > :nth-child(2) { animation-delay: 40ms; }
        .demo-stagger > [data-route-enter] > :nth-child(3) { animation-delay: 80ms; }
        .demo-stagger > [data-route-enter] > :nth-child(n + 4) { animation-delay: 120ms; }
        @keyframes demo-stagger-in {
          from { opacity: 0; transform: translateY(var(--lufia-motion-distance-rise)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .demo-stagger > [data-route-enter] > * { animation: none; }
        }
      `}</style>
      <DemoShell
        {...args}
        trackRoute
        routeTransitionProps={{ className: "demo-stagger", "data-stagger": "" }}
      />
    </>
  ),
  globals: { viewport: { value: "w1440", isRotated: false } },
};
