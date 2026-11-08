import { createContext, useContext, type ReactNode } from "react";

/** `data-*` attributes passed through to an element (analytics hooks, guided-tour anchors, test ids). */
export type ShellDataAttributes = { [name: `data-${string}`]: string | number | boolean | undefined };

/** The colour of a badge or count. It never carries the meaning alone: the text is always there. */
export type ShellBadgeTone = "neutral" | "warning" | "danger";

/** A count above this shows as "99+". */
export const SHELL_COUNT_CAP = 99;

/**
 * The text of a count badge: `undefined` for nothing to show (not a number, zero or negative), the number itself up to
 * `cap`, and `"99+"` (with the cap) above it.
 */
export function formatShellCount(
  count: number | undefined,
  cap: number = SHELL_COUNT_CAP,
): string | undefined {
  if (count === undefined || !Number.isFinite(count) || count <= 0) return undefined;
  const whole = Math.floor(count);
  if (whole <= 0) return undefined;
  return whole > cap ? `${cap}+` : String(whole);
}

export type ShellNavItem = {
  /** Stable key. */
  key: string;
  label: string;
  /** Destination. Without one (or when disabled) the item renders as a button and calls `onSelect`. */
  href?: string;
  /** Decorative icon; hidden from assistive technology. The only thing shown when the sidebar is a rail. */
  icon?: ReactNode;
  /** Short mark after the label, such as "New". For a number use `count`. */
  badge?: ReactNode;
  /** Colour of `badge`. Default `warning`. */
  badgeTone?: ShellBadgeTone;
  /** A number after the label (unread, overdue). Hidden at 0, shown as "99+" above 99. In the rail it sits on the icon. */
  count?: number;
  /** Colour of `count`. Default `neutral`. */
  countTone?: ShellBadgeTone;
  /** Extra class on the link or button, for an app's own styling hooks. */
  className?: string;
  /** `data-*` attributes on the link or button (analytics, guided tours, test ids). */
  data?: ShellDataAttributes;
  disabled?: boolean;
  /**
   * Accessible name when it should differ from the visible label ("Inbox, 3 unread"). Keep the visible label in it so
   * speech-control users can say what they see (WCAG 2.5.3).
   */
  ariaLabel?: string;
  /** With `currentPath`, match this path only and not the pages under it. */
  exact?: boolean;
  /** Called when the item is chosen (before navigation for links). */
  onSelect?: () => void;
};

export type ShellNavGroup = {
  key: string;
  /** Heading of the group. Without one the group is a plain run of items. */
  label?: string;
  /** Icon of the disclosure button of a collapsible group. */
  icon?: ReactNode;
  items: readonly ShellNavItem[];
  /** Turns the heading into a button that shows and hides the items. Needs a `label`. */
  collapsible?: boolean;
  /** Open on first render when nothing else decides. */
  defaultOpen?: boolean;
};

// Trailing slashes are trimmed with a loop, not a regex, so a long run of "/" can't cause backtracking.
const pathOf = (href: string) => {
  const path = href.split(/[?#]/)[0] ?? "";
  let end = path.length;
  while (end > 1 && path[end - 1] === "/") end -= 1;
  return path.slice(0, end);
};

/**
 * The key of the item that `currentPath` belongs to, or `undefined`. A path belongs to an item when it is equal to the
 * item's `href` or below it (`/settings/billing` belongs to `/settings`); when several match, the most specific wins, so
 * two items are never current at once. `exact` items match only themselves. Query strings and hashes are ignored.
 */
export function findActiveNavKey(
  groups: readonly ShellNavGroup[],
  currentPath: string | undefined,
  isActive?: (item: ShellNavItem) => boolean,
): string | undefined {
  const items = groups.flatMap((group) => group.items);
  if (isActive) return items.find((item) => isActive(item))?.key;
  if (currentPath === undefined) return undefined;
  const path = pathOf(currentPath);
  let best: { key: string; length: number } | undefined;
  for (const item of items) {
    if (item.href === undefined || item.disabled) continue;
    const target = pathOf(item.href);
    const matches = path === target || (!item.exact && target !== "/" && path.startsWith(`${target}/`));
    if (matches && (!best || target.length > best.length)) best = { key: item.key, length: target.length };
  }
  return best?.key;
}

export type ShellState = {
  /** The sidebar is a rail. */
  collapsed: boolean;
  /** Keys of the open collapsible groups; `undefined` when the person never chose, so the defaults apply. */
  openGroups: readonly string[] | undefined;
};

/**
 * Turns the person's sidebar choices into a short cookie value (`c=1&g=insights&g=admin`), for the app to store. The
 * package never stores anything itself; see "Remembering the rail and the groups" in the docs. Pass `openGroups` as
 * `undefined` to leave the groups to their defaults.
 */
export function serializeShellState(state: ShellState): string {
  const params = new URLSearchParams();
  params.set("c", state.collapsed ? "1" : "0");
  for (const key of state.openGroups ?? []) params.append("g", key);
  if (state.openGroups) params.set("s", "1");
  return params.toString();
}

/**
 * Reads what `serializeShellState` wrote, on the server (from the request's cookie) or in the browser, and returns the
 * values to hand to `defaultCollapsed` and `defaultOpenGroups` so the first paint is already right. A missing or
 * malformed value gives the defaults: expanded, groups undecided.
 */
export function parseShellState(raw: string | null | undefined): ShellState {
  const params = new URLSearchParams(raw ?? "");
  return {
    collapsed: params.get("c") === "1",
    openGroups: params.get("s") === "1" ? params.getAll("g") : undefined,
  };
}

/** What the sidebar items need to know about the surface they sit in. */
export type NavSurface = {
  /** The sidebar is a rail: icons only, labels kept for assistive technology. */
  collapsed: boolean;
  /** Where the parts are drawn: the desktop sidebar or the phone sheet. */
  surface: "sidebar" | "sheet";
};

export const NavSurfaceContext = createContext<NavSurface>({ collapsed: false, surface: "sidebar" });

export function useNavSurface(): NavSurface {
  return useContext(NavSurfaceContext);
}
