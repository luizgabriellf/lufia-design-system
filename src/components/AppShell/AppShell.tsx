"use client";

import { useId, useState, type HTMLAttributes, type ReactNode } from "react";
import { useMediaQuery } from "../useMediaQuery";
import { MenuGlyph, SearchGlyph } from "./icons";
import {
  MobileFloatBar,
  MobileFloatBarButton,
  MobileFloatBarSeparator,
  type FloatBarDataAttributes,
} from "./MobileFloatBar";
import { NavSheet } from "./NavSheet";
import {
  ShellPrimaryActionContext,
  useShellPrimaryActionRegistry,
  type AppShellPrimaryAction,
} from "./primaryAction";
import { findActiveNavKey, type ShellNavGroup, type ShellNavItem } from "./navigation";
import { ShellNavigation, useGroupDisclosure } from "./ShellNavigation";
import { Sidebar } from "./Sidebar";
import styles from "./AppShell.module.css";

/** Wider than this the sidebar is shown; narrower, the top bar, floating bar and sheet take over (60rem = 960px). */
export const APP_SHELL_BREAKPOINT = "(min-width: 60rem)";

export type AppShellLabels = {
  /** Skip link, visible when focused. */
  skipToContent: string;
  /** Accessible name of the navigation, in the sidebar and in the sheet. */
  navigation: string;
  /** Name of the menu button on the floating bar and of the sheet. */
  menu: string;
  /** Name of the floating bar. */
  floatBar: string;
  /** Name of the sidebar's rail button while the sidebar is open. */
  collapseSidebar: string;
  /** Name of the sidebar's rail button while it is a rail. */
  expandSidebar: string;
};

export type AppShellSearch = {
  /** Text of the search entry: "Search…". */
  label: string;
  /** Opens the app's search or command palette. */
  onSelect: () => void;
  /** Keyboard hint shown in a `<kbd>` on the desktop entry, such as "Ctrl K". */
  shortcut?: string;
  /** The shortcut as `aria-keyshortcuts` ("Control+K"), so assistive technology can announce it. */
  keyShortcuts?: string;
  /** The entry opens a dialog (a palette): sets `aria-haspopup="dialog"`. */
  opensDialog?: boolean;
  /** `data-*` attributes for the floating-bar button (analytics hooks, guided-tour anchors). */
  data?: FloatBarDataAttributes;
};

export type { AppShellPrimaryAction };

type SlotState = { collapsed: boolean };
type Slot = ReactNode | ((state: SlotState) => ReactNode);
const resolve = (slot: Slot | undefined, state: SlotState) =>
  typeof slot === "function" ? slot(state) : slot;

export type AppShellProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The navigation, as data. It renders in the sidebar and again in the phone sheet. */
  groups: readonly ShellNavGroup[];
  /** The path being shown: the matching item is current (`aria-current="page"`). */
  currentPath?: string;
  /** Takes over from `currentPath`. Return true for the current item. */
  isActive?: (item: ShellNavItem) => boolean;
  labels: AppShellLabels;
  /** Brand or workspace switcher, at the top of the sidebar, the sheet and the phone top bar. A function gets the rail state. */
  brand?: Slot;
  /** Bottom of the sidebar, and of the sheet: account, help and sign-out links. */
  footer?: Slot;
  /** Right side of the phone top bar: a workspace chip, a status. */
  topBarEnd?: ReactNode;
  /** A search entry in the sidebar and on the floating bar. */
  search?: AppShellSearch;
  /**
   * Replaces the sidebar's search entry with your own (a function gets the rail state). The floating bar's entry still
   * comes from `search`.
   */
  searchTrigger?: Slot;
  /**
   * The main action when no page registers its own with `useShellPrimaryAction`: on the floating bar, and in any
   * `ShellPrimaryActionSlot`.
   */
  primaryAction?: AppShellPrimaryAction;
  /** `data-*` attributes for the floating bar's menu button. */
  menuData?: FloatBarDataAttributes;
  /**
   * Shown in place of the navigation, in the sidebar and in the sheet, while the next route loads: a skeleton. The
   * navigation landmarks are `aria-busy` meanwhile. Leave it out when the navigation is ready.
   */
  navigationPending?: ReactNode;
  /** A bar above the page, beside the sidebar, at every width: a unit or context picker. */
  topBar?: ReactNode;
  /** A row between `topBar` and the page: sync state, a notice. Give it the live-region semantics it needs. */
  statusRow?: ReactNode;
  /** `portal` (default) or a native `<dialog>` for the phone navigation sheet (`NavSheet` `renderAs`). */
  sheetAs?: "portal" | "dialog";
  /** Sidebar as a rail. Controlled. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Keys of the open collapsible groups. Controlled; the owner then also decides what arriving on a page opens. */
  openGroups?: readonly string[];
  defaultOpenGroups?: readonly string[];
  onOpenGroupsChange?: (keys: readonly string[]) => void;
  /** Hide the rail button. Default `false`. */
  fixedSidebar?: boolean;
  /** The page. The shell renders the one `<main>` landmark around it. */
  children: ReactNode;
};

/**
 * The frame of an application: a sidebar on wide screens (expanded or a rail, with groups that open and close), and on
 * phones a top bar, a floating bar within thumb reach and a navigation sheet. The navigation is data, so both layouts
 * stay in step; the parts they are made of (`Sidebar`, `SidebarGroup`, `SidebarItem`, `MobileFloatBar`, `NavSheet`) are
 * exported for apps that need another arrangement.
 *
 * A click on a link makes it look current at once and the sheet close; `aria-current` follows the real `currentPath`.
 * The shell renders the page's only `<main>` and a skip link to it.
 */
export function AppShell({
  groups,
  currentPath,
  isActive,
  labels,
  brand,
  footer,
  topBarEnd,
  search,
  searchTrigger,
  primaryAction: primaryActionProp,
  menuData,
  navigationPending,
  topBar,
  statusRow,
  sheetAs = "portal",
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  openGroups,
  defaultOpenGroups,
  onOpenGroupsChange,
  fixedSidebar = false,
  className,
  children,
  ...rest
}: AppShellProps) {
  const mainId = useId();
  const [innerCollapsed, setInnerCollapsed] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? innerCollapsed;
  const [sheetOpen, setSheetOpen] = useState(false);
  const wide = useMediaQuery(APP_SHELL_BREAKPOINT);
  // The sheet belongs to phones: growing past the breakpoint (rotation, window drag) closes it for good.
  if (wide && sheetOpen) setSheetOpen(false);

  const activeKey = findActiveNavKey(groups, currentPath, isActive);
  const activeGroupKey = groups.find(
    (group) => group.collapsible && group.items.some((i) => i.key === activeKey),
  )?.key;
  const disclosure = useGroupDisclosure(
    groups,
    activeGroupKey,
    openGroups,
    onOpenGroupsChange,
    defaultOpenGroups,
  );

  // The item a click is heading to looks current at once; it expires when the path changes.
  const [pending, setPending] = useState<{ key: string; from: string | undefined } | null>(null);
  const pendingKey = pending && pending.from === currentPath ? pending.key : undefined;
  const choose = (item: ShellNavItem) => {
    if (item.href && item.key !== activeKey) setPending({ key: item.key, from: currentPath });
    setSheetOpen(false);
  };

  const registry = useShellPrimaryActionRegistry(primaryActionProp);
  const primaryAction = registry.action;
  const pendingNavigation =
    navigationPending !== undefined && navigationPending !== null && navigationPending !== false;

  const navigation = pendingNavigation ? (
    navigationPending
  ) : (
    <ShellNavigation
      groups={groups}
      currentPath={currentPath}
      isActive={isActive}
      openGroups={disclosure.open}
      onToggleGroup={disclosure.toggle}
      pendingKey={pendingKey}
      onItemChoose={choose}
    />
  );

  const defaultSearchEntry = search ? (
    <button
      type="button"
      className={styles.search}
      onClick={search.onSelect}
      aria-keyshortcuts={search.keyShortcuts}
      aria-haspopup={search.opensDialog ? "dialog" : undefined}
      // A rail has room for the icon only: the label stays as the name and the tooltip.
      aria-label={collapsed ? search.label : undefined}
      title={collapsed ? search.label : undefined}
      data-rail={collapsed || undefined}
    >
      <SearchGlyph width={16} height={16} />
      {collapsed ? null : <span className={styles.searchLabel}>{search.label}</span>}
      {search.shortcut && !collapsed ? <kbd className={styles.shortcut}>{search.shortcut}</kbd> : null}
    </button>
  ) : null;

  const searchEntry =
    searchTrigger !== undefined ? resolve(searchTrigger, { collapsed }) : defaultSearchEntry;

  const openState: SlotState = { collapsed: false };
  return (
    <ShellPrimaryActionContext.Provider value={registry}>
      <div
        {...rest}
        className={[styles.shell, className].filter(Boolean).join(" ")}
        data-collapsed={collapsed || undefined}
      >
        <a className={styles.skip} href={`#${mainId}`}>
          {labels.skipToContent}
        </a>
        <header className={styles.topBar}>
          <div className={styles.topBrand}>{resolve(brand, openState)}</div>
          {topBarEnd ? <div className={styles.topEnd}>{topBarEnd}</div> : null}
        </header>
        <div className={styles.sidebarSlot}>
          <Sidebar
            label={labels.navigation}
            collapsed={collapsed}
            onCollapsedChange={
              fixedSidebar
                ? undefined
                : (next) => {
                    if (collapsedProp === undefined) setInnerCollapsed(next);
                    onCollapsedChange?.(next);
                  }
            }
            collapseLabel={labels.collapseSidebar}
            expandLabel={labels.expandSidebar}
            header={resolve(brand, { collapsed })}
            search={searchEntry}
            footer={resolve(footer, { collapsed })}
            busy={pendingNavigation}
          >
            {navigation}
          </Sidebar>
        </div>
        <div className={styles.content}>
          {topBar ? <div className={styles.contextBar}>{topBar}</div> : null}
          {statusRow ? <div className={styles.statusRow}>{statusRow}</div> : null}
          <main id={mainId} className={styles.main}>
            {children}
          </main>
        </div>
        <MobileFloatBar label={labels.floatBar} className={styles.float}>
          {search ? (
            <>
              <MobileFloatBarButton
                variant="search"
                label={search.label}
                icon={<SearchGlyph width={18} height={18} />}
                onClick={search.onSelect}
                {...search.data}
              />
              <MobileFloatBarSeparator />
            </>
          ) : null}
          {primaryAction ? (
            primaryAction.href !== undefined ? (
              <MobileFloatBarButton
                variant="primary"
                label={primaryAction.label}
                icon={primaryAction.icon}
                href={primaryAction.href}
                onClick={primaryAction.onSelect}
                {...primaryAction.data}
              />
            ) : (
              <MobileFloatBarButton
                variant="primary"
                label={primaryAction.label}
                icon={primaryAction.icon}
                onClick={primaryAction.onSelect}
                {...primaryAction.data}
              />
            )
          ) : null}
          <MobileFloatBarButton
            variant="icon"
            label={labels.menu}
            icon={<MenuGlyph width={19} height={19} />}
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
            onClick={() => setSheetOpen(true)}
            {...menuData}
          />
        </MobileFloatBar>
        <NavSheet
          open={sheetOpen && !wide}
          onOpenChange={setSheetOpen}
          label={labels.menu}
          renderAs={sheetAs}
          header={resolve(brand, openState)}
          footer={resolve(footer, openState)}
        >
          <nav
            aria-label={labels.navigation}
            className={styles.sheetNav}
            aria-busy={pendingNavigation || undefined}
          >
            {navigation}
          </nav>
        </NavSheet>
      </div>
    </ShellPrimaryActionContext.Provider>
  );
}
