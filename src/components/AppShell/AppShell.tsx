"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type Key,
  type ReactNode,
} from "react";
import { RouteTransition } from "../../motion/RouteTransition";
import { useMediaQuery } from "../useMediaQuery";
import { MenuIcon, SearchIcon } from "../Icon/icons";
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
import {
  findActiveNavKey,
  navItemHolds,
  type ShellDataAttributes,
  type ShellNavGroup,
  type ShellNavItem,
} from "./navigation";
import { ShellNavigation, useGroupDisclosure } from "./ShellNavigation";
import { RouteProgress, type RouteProgressEvents } from "./RouteProgress";
import type { SheetDragThreshold } from "./useSheetDrag";
import { useSheetControl } from "./useSheetControl";
import { Sidebar } from "./Sidebar";
import { useShellTooltip } from "./ShellTooltip";
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

/** Attributes of the shell's `<main>`: an `id`, a class, `data-*` hooks, a `tabIndex`, ARIA. Not its children. */
export type AppShellMainProps = Omit<HTMLAttributes<HTMLElement>, "children"> & ShellDataAttributes;

/**
 * Attributes of the region that plays the route motion (`RouteTransition`) around the page: a class and `data-*`
 * hooks, for an app's own stagger or entrance CSS. The region exists only when `routeKey` is given.
 */
export type AppShellRouteTransitionProps = { className?: string } & ShellDataAttributes;

/** `AppShell` `sheetProps`: where the phone sheet mounts, and a class and `data-*` attributes for its outermost layer. */
export type AppShellSheetProps = { className?: string; container?: HTMLElement | null } & ShellDataAttributes;

/** The sidebar's search entry. A component of its own because the rail's tooltip is a hook. */
function SearchEntry({ search, collapsed }: { search: AppShellSearch; collapsed: boolean }) {
  const tip = useShellTooltip(search.label, collapsed);
  return (
    <>
      <button
        type="button"
        className={styles.search}
        onClick={search.onSelect}
        aria-keyshortcuts={search.keyShortcuts}
        aria-haspopup={search.opensDialog ? "dialog" : undefined}
        // A rail has room for the icon only: the label stays as the name and the tooltip.
        aria-label={collapsed ? search.label : undefined}
        data-rail={collapsed || undefined}
        {...tip.trigger}
      >
        <SearchIcon size="sm" />
        {collapsed ? null : <span className={styles.searchLabel}>{search.label}</span>}
        {search.shortcut && !collapsed ? <kbd className={styles.shortcut}>{search.shortcut}</kbd> : null}
      </button>
      {tip.tooltip}
    </>
  );
}

/** What a slot that is a function receives: where it is drawn, and how to close or open the phone sheet from inside it. */
export type AppShellSlotState = {
  /** The sidebar is a rail. Always `false` in the sheet and the phone top bar. */
  collapsed: boolean;
  /** Which of the shell's surfaces is drawing the slot. A slot is rendered once per surface. */
  surface: "sidebar" | "sheet" | "topBar";
  /** Closes the phone navigation sheet: call it from a slot's own link or button that navigates. */
  closeSheet: () => void;
  /** Opens the phone navigation sheet. */
  openSheet: () => void;
};
type Slot = ReactNode | ((state: AppShellSlotState) => ReactNode);
const resolve = (slot: Slot | undefined, state: AppShellSlotState) =>
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
  /**
   * Between the brand and the search, in the sidebar, and above the navigation in the sheet: the workspace, company or
   * account the person is in, and a switcher for it. A function gets the surface (see `AppShellSlotState`), so a switcher
   * can open as a dropdown in the sidebar and inline in the sheet. Rendered once per surface, so do not give its
   * parts a fixed `id`.
   */
  context?: Slot;
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
  /**
   * Whether wide screens show the shell's `primaryAction` in `ShellPrimaryActionSlot` while no page has registered its
   * own. Default `true`. Set `false` when the default makes sense only on phones (the floating bar still shows it), so a
   * hard load never flashes an action the page is about to replace or remove.
   */
  desktopPrimaryFallback?: boolean;
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
  /** When a released drag dismisses the phone navigation sheet (`NavSheet` `dragThreshold`). Defaults unchanged. */
  sheetDragThreshold?: SheetDragThreshold;
  /**
   * A class and `data-*` attributes for the phone sheet's outermost layer (`NavSheet` `layerProps`), and where it mounts
   * (`container`, default `document.body`). The sheet is portalled out of the shell, so a palette scoped to an app wrapper
   * does not reach it: repeat the class or attribute here. Without them the sheet copies `data-lufia-theme` and
   * `data-lufia-mode` from the closest ancestor of the shell that sets them.
   */
  sheetProps?: AppShellSheetProps;
  /**
   * The phone navigation sheet is open. Controlled: open it from your own control (a context chip in the top bar) and
   * hear it close through `onMenuOpenChange`. Leave it out and the menu button drives it.
   */
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
  /**
   * Hide the navigation inside the phone sheet and leave the `context` slot and footer: a switcher that takes over the
   * sheet while it is open. The sidebar is not affected.
   */
  hideSheetNavigation?: boolean;
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
  /**
   * Identifies the page being shown, usually the pathname. When it changes, the page inside `<main>` enters with a short
   * fade and rise (`RouteTransition`), the route progress bar finishes, and the navigation skeleton gives way. A
   * search-param change or a refresh keeps the key and plays nothing; neither does the first load. Nothing remounts for it.
   * Pass the pathname, not the query string. Wrapping the page adds one element around `children`.
   */
  routeKey?: string;
  /**
   * A navigation to another route has started and the page is not there yet: drives a thin progress bar at the top of
   * the window. Needs `routeKey`. The bar appears only when the wait outlasts 150 ms, so fast navigations do not flash,
   * and, unless you pass this prop, a plain click on a link to another path starts it by itself.
   */
  routePending?: boolean;
  /**
   * Let a plain click on a link to another path start the progress bar as well, alongside `routePending`: the bar then
   * shows while either is in progress. Default: `true` without `routePending`, `false` with it (the app drives the bar
   * alone). Set it `true` to drive query-string navigations through `routePending` and still track link clicks.
   * `RouteProgress` `trackLinks`.
   */
  routeTrackLinks?: boolean;
  /**
   * A class and `data-*` attributes for the region that wraps the page and plays the route motion, so an app can hook
   * its own entrance CSS (a stagger over the page's sections) onto the `data-route-enter` its children get. Needs
   * `routeKey`.
   */
  routeTransitionProps?: AppShellRouteTransitionProps;
  /** Draw the progress bar when `routeKey` is given. Default `true`. */
  routeProgress?: boolean;
  /**
   * The window events that start and end the progress bar from code (`RouteProgress` `events`). Default the ones
   * `startRouteProgress()` and `doneRouteProgress()` dispatch.
   */
  routeProgressEvents?: RouteProgressEvents;
  /**
   * A skeleton shown in `<main>` in place of the page while a slow navigation loads. The page stays mounted but hidden,
   * so its state and the providers around it survive, and `mainStart` stays visible. `<main>` is `aria-busy` meanwhile.
   * Decide when to show it (most apps wait a few hundred milliseconds so fast navigations never flash one) and give it the
   * shape of the page it stands in for.
   */
  mainPending?: ReactNode;
  /**
   * Fade the page out behind the floating bar on phones, so content scrolling under it does not end in a hard edge.
   * Default `false`: nothing is drawn unless asked for.
   */
  floatScrim?: boolean;
  /**
   * Attributes for the `<main>` the shell owns: `id` (the skip link follows it), `className`, `data-*`, `tabIndex`, ARIA.
   * `className` is added to the shell's own.
   */
  mainProps?: AppShellMainProps;
  /**
   * Remounts the `<main>` and everything in it when it changes, as React's `key` does: a workspace or scope switch that
   * must drop the page's state. Leave it out for a page change, which `children` handles.
   */
  mainKey?: Key;
  /**
   * The first thing inside `<main>`, before `children`: banners that belong to the page area and scroll with it (a trial
   * notice, a cookie or install hint). Unlike `topBar` and `statusRow`, which sit beside `<main>` and stay put, this
   * remounts with `mainKey` and takes the page's padding.
   */
  mainStart?: ReactNode;
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
  context,
  sheetAs = "portal",
  sheetProps,
  sheetDragThreshold,
  menuOpen: menuOpenProp,
  onMenuOpenChange,
  hideSheetNavigation = false,
  desktopPrimaryFallback = true,
  routeKey,
  routePending,
  routeTrackLinks,
  routeTransitionProps,
  routeProgress = true,
  routeProgressEvents,
  mainPending,
  floatScrim = false,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  openGroups,
  defaultOpenGroups,
  onOpenGroupsChange,
  fixedSidebar = false,
  mainProps,
  mainKey,
  mainStart,
  className,
  children,
  ...rest
}: AppShellProps) {
  const generatedMainId = useId();
  const mainId = mainProps?.id ?? generatedMainId;
  const [innerCollapsed, setInnerCollapsed] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? innerCollapsed;
  const {
    open: sheetOpen,
    setOpen: setSheetOpen,
    forceClosed,
  } = useSheetControl(menuOpenProp, onMenuOpenChange);
  const wide = useMediaQuery(APP_SHELL_BREAKPOINT);
  // The sheet belongs to phones: growing past the breakpoint (rotation, window drag) closes it for good.
  if (wide && forceClosed) forceClosed();
  const closeRequest = useRef(onMenuOpenChange);
  useEffect(() => {
    closeRequest.current = onMenuOpenChange;
  });
  useEffect(() => {
    if (wide && menuOpenProp) closeRequest.current?.(false);
  }, [wide, menuOpenProp]);

  const activeKey = findActiveNavKey(groups, currentPath, isActive);
  const activeGroupKey = groups.find(
    (group) => group.collapsible && group.items.some((i) => navItemHolds(i, activeKey)),
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

  const registry = useShellPrimaryActionRegistry(primaryActionProp, desktopPrimaryFallback);
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

  const defaultSearchEntry = search ? <SearchEntry search={search} collapsed={collapsed} /> : null;

  const slotState = (surface: AppShellSlotState["surface"]): AppShellSlotState => ({
    collapsed: surface === "sidebar" && collapsed,
    surface,
    closeSheet: () => setSheetOpen(false),
    openSheet: () => setSheetOpen(true),
  });
  const searchEntry =
    searchTrigger !== undefined ? resolve(searchTrigger, slotState("sidebar")) : defaultSearchEntry;

  // The page waits behind a skeleton: once it has been shown, the arriving page only fades (the skeleton held its layout).
  const pendingMain = mainPending !== undefined && mainPending !== null && mainPending !== false;
  const main = useRef<HTMLElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const { container: sheetContainer, ...sheetLayer } = sheetProps ?? {};
  const consumerBusy = mainProps?.["aria-busy"] === true || mainProps?.["aria-busy"] === "true";
  // The page is about to be hidden: focus inside it would be lost to the document, so it goes to <main>.
  useLayoutEffect(() => {
    if (pendingMain && page.current?.contains(document.activeElement)) {
      main.current?.focus({ preventScroll: true });
    }
  }, [pendingMain]);
  const [arrival, setArrival] = useState({ key: routeKey, afterSkeleton: false, skeletonShown: false });
  if (pendingMain && !arrival.skeletonShown) setArrival({ ...arrival, skeletonShown: true });
  if (arrival.key !== routeKey) {
    setArrival({ key: routeKey, afterSkeleton: arrival.skeletonShown, skeletonShown: pendingMain });
  }
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
          <div className={styles.topBrand}>{resolve(brand, slotState("topBar"))}</div>
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
            header={resolve(brand, slotState("sidebar"))}
            context={resolve(context, slotState("sidebar"))}
            search={searchEntry}
            footer={resolve(footer, slotState("sidebar"))}
            busy={pendingNavigation}
          >
            {navigation}
          </Sidebar>
        </div>
        {/* Siblings of <main>, not a wrapper: adding or removing a bar at runtime never remounts the page. */}
        {topBar ? <div className={styles.contextBar}>{topBar}</div> : null}
        {statusRow ? <div className={styles.statusRow}>{statusRow}</div> : null}
        <main
          {...mainProps}
          key={mainKey}
          id={mainId}
          className={[styles.main, mainProps?.className].filter(Boolean).join(" ")}
          ref={main}
          tabIndex={mainProps?.tabIndex ?? -1}
          // The consumer's own busy state and `data-pending` are kept; the shell adds its pending page to them.
          aria-busy={pendingMain || consumerBusy || undefined}
          data-pending={pendingMain ? "" : mainProps?.["data-pending"]}
        >
          {mainStart}
          {/* Always here, so showing the skeleton never remounts the page; `hidden` takes it out of sight and of the tab order. */}
          <div ref={page} className={styles.page} hidden={pendingMain || undefined}>
            {routeKey === undefined ? (
              children
            ) : (
              <RouteTransition
                {...routeTransitionProps}
                transitionKey={routeKey}
                variant={arrival.afterSkeleton ? "fade" : "rise"}
              >
                {children}
              </RouteTransition>
            )}
          </div>
          {pendingMain ? <div data-shell-pending="">{mainPending}</div> : null}
        </main>
        {routeKey !== undefined && routeProgress ? (
          <RouteProgress
            routeKey={routeKey}
            pending={routePending}
            trackLinks={routeTrackLinks}
            events={routeProgressEvents}
          />
        ) : null}
        {floatScrim ? <div className={styles.floatScrim} aria-hidden="true" /> : null}
        <MobileFloatBar label={labels.floatBar} className={styles.float}>
          {search ? (
            <>
              <MobileFloatBarButton
                variant="search"
                label={search.label}
                icon={<SearchIcon size={18} />}
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
                onPointerEnter={primaryAction.onIntent}
                onFocus={primaryAction.onIntent}
                data-fallback={registry.isFallback || undefined}
                {...primaryAction.data}
              />
            ) : (
              <MobileFloatBarButton
                variant="primary"
                label={primaryAction.label}
                icon={primaryAction.icon}
                onClick={primaryAction.onSelect}
                onPointerEnter={primaryAction.onIntent}
                onFocus={primaryAction.onIntent}
                data-fallback={registry.isFallback || undefined}
                {...primaryAction.data}
              />
            )
          ) : null}
          <MobileFloatBarButton
            variant="icon"
            label={labels.menu}
            icon={<MenuIcon />}
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
          container={sheetContainer}
          layerProps={sheetLayer}
          inheritThemeFrom={main}
          dragThreshold={sheetDragThreshold}
          closeOnNavigate
          header={resolve(brand, slotState("sheet"))}
          footer={resolve(footer, slotState("sheet"))}
        >
          {resolve(context, slotState("sheet"))}
          {hideSheetNavigation ? null : (
            <nav
              aria-label={labels.navigation}
              className={styles.sheetNav}
              aria-busy={pendingNavigation || undefined}
            >
              {navigation}
            </nav>
          )}
        </NavSheet>
      </div>
    </ShellPrimaryActionContext.Provider>
  );
}
