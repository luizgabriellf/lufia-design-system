import { useState, type ReactNode } from "react";
import { LufiaProvider, type LinkComponent } from "../../components/LufiaProvider";
import { AppShell, type AppShellLabels, type AppShellProps } from "../../components/AppShell/AppShell";
import type { ShellNavGroup } from "../../components/AppShell/navigation";
import { ShellFooter, ShellFooterItem } from "../../components/AppShell/ShellFooter";
import {
  ArrowRightIcon,
  ChartIcon,
  DocumentIcon,
  GridIcon,
  HelpIcon,
  HomeIcon,
  InboxIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
} from "./icons";

/** Docs-only fixtures shared by the AppShell stories. Not exported from the package. */

export const demoLabels: AppShellLabels = {
  skipToContent: "Skip to content",
  navigation: "Main navigation",
  menu: "Menu",
  floatBar: "Quick navigation",
  collapseSidebar: "Collapse sidebar",
  expandSidebar: "Expand sidebar",
};

export const demoGroups: ShellNavGroup[] = [
  {
    key: "workspace",
    label: "Workspace",
    items: [
      { key: "home", label: "Overview", href: "/", icon: <HomeIcon size={18} />, exact: true },
      { key: "inbox", label: "Inbox", href: "/inbox", icon: <InboxIcon size={18} />, badge: 3 },
      { key: "people", label: "People", href: "/people", icon: <UsersIcon size={18} /> },
      { key: "documents", label: "Documents", href: "/documents", icon: <DocumentIcon size={18} /> },
    ],
  },
  {
    key: "insights",
    label: "Insights",
    icon: <ChartIcon size={18} />,
    collapsible: true,
    items: [
      { key: "reports", label: "Reports", href: "/insights/reports", icon: <GridIcon size={18} /> },
      { key: "trends", label: "Trends", href: "/insights/trends", icon: <ChartIcon size={18} /> },
      { key: "exports", label: "Exports", href: "/insights/exports", icon: <DocumentIcon size={18} /> },
    ],
  },
  {
    key: "admin",
    label: "Admin",
    icon: <SettingsIcon size={18} />,
    collapsible: true,
    items: [
      { key: "settings", label: "Settings", href: "/settings", icon: <SettingsIcon size={18} /> },
      { key: "billing", label: "Billing", href: "/settings/billing", icon: <DocumentIcon size={18} /> },
    ],
  },
];

export function DemoBrand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", fontWeight: 700 }}>
      <span
        aria-hidden="true"
        style={{
          display: "grid",
          placeItems: "center",
          inlineSize: "2rem",
          blockSize: "2rem",
          borderRadius: "var(--lufia-radius-md)",
          background: "var(--lufia-color-accent-default)",
          color: "var(--lufia-color-text-on-accent)",
        }}
      >
        L
      </span>
      {collapsed ? null : <span>Acme Cloud</span>}
    </span>
  );
}

export function DemoFooter({ pending = false }: { collapsed?: boolean; pending?: boolean }) {
  return (
    <ShellFooter aria-label="Account and help">
      <ShellFooterItem label="Settings" href="/settings" icon={<SettingsIcon size={18} />} />
      <ShellFooterItem label="Help and support" href="#help" icon={<HelpIcon size={18} />} count={2} />
      <ShellFooterItem label="Sign out" icon={<ArrowRightIcon size={18} />} pending={pending} />
    </ShellFooter>
  );
}

/** A link component that keeps the story on one page and reports the destination, as a client router would. */
export function demoLink(onNavigate: (href: string) => void): LinkComponent {
  return function DemoLink({ href, onClick, children, ...rest }) {
    return (
      <a
        {...rest}
        href={href}
        onClick={(event) => {
          onClick?.(event);
          if (event.button === 0 && !event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            onNavigate(href);
          }
        }}
      >
        {children}
      </a>
    );
  };
}

export function DemoPage({ title }: { title: string }) {
  return (
    <div style={{ display: "grid", gap: "1rem", maxInlineSize: "56rem" }}>
      <h1 style={{ margin: 0, fontSize: "var(--lufia-font-size-2xl)" }}>{title}</h1>
      <p style={{ margin: 0, color: "var(--lufia-color-text-muted)" }}>
        This is the page area. The shell renders the one main landmark around it.
      </p>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: "1rem" }}
      >
        {["Active people", "Open items", "Documents"].map((name, index) => (
          <div
            key={name}
            style={{
              padding: "1rem",
              border: "1px solid var(--lufia-color-border-subtle)",
              borderRadius: "var(--lufia-radius-card)",
              background: "var(--lufia-color-bg-surface)",
            }}
          >
            <div style={{ color: "var(--lufia-color-text-muted)", fontSize: "var(--lufia-font-size-sm)" }}>
              {name}
            </div>
            <div style={{ fontSize: "var(--lufia-font-size-3xl)", fontWeight: 700 }}>
              {[128, 14, 342][index]}
            </div>
          </div>
        ))}
      </div>
      {Array.from({ length: 6 }, (_, i) => (
        <p key={i} style={{ margin: 0, color: "var(--lufia-color-text-muted)" }}>
          Content that scrolls under the top bar and the floating bar on a phone, so the translucent material
          has something to blur.
        </p>
      ))}
    </div>
  );
}

export type DemoShellProps = Partial<AppShellProps> & {
  initialPath?: string;
  /** Pass the current path as `routeKey`, so changing page plays the route motion. */
  trackRoute?: boolean;
  children?: ReactNode;
};

/** A complete shell wired to local state: navigation updates `currentPath`, like a router would. */
export function DemoShell({ initialPath = "/", trackRoute = false, children, ...props }: DemoShellProps) {
  const [path, setPath] = useState(initialPath);
  const title = demoGroups.flatMap((g) => g.items).find((item) => item.href === path)?.label ?? "Overview";
  return (
    <LufiaProvider linkComponent={demoLink(setPath)}>
      <AppShellWithDefaults path={path} routeKey={trackRoute ? path : undefined} {...props}>
        {children ?? <DemoPage title={title} />}
      </AppShellWithDefaults>
    </LufiaProvider>
  );
}

function AppShellWithDefaults({ path, children, ...props }: Partial<AppShellProps> & { path: string }) {
  return (
    <AppShell
      groups={demoGroups}
      labels={demoLabels}
      currentPath={path}
      brand={({ collapsed }) => <DemoBrand collapsed={collapsed} />}
      footer={({ collapsed }) => <DemoFooter collapsed={collapsed} />}
      search={{ label: "Search…", onSelect: () => {}, shortcut: "Ctrl K" }}
      primaryAction={{ label: "New item", icon: <PlusIcon size={16} />, onSelect: () => {} }}
      topBarEnd={
        <span style={{ color: "var(--lufia-color-text-muted)", fontSize: "var(--lufia-font-size-sm)" }}>
          Team plan
        </span>
      }
      {...props}
    >
      {children}
    </AppShell>
  );
}
