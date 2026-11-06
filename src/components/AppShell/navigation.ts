import { createContext, useContext, type ReactNode } from "react";

export type ShellNavItem = {
  /** Stable key. */
  key: string;
  label: string;
  /** Destination. Without one (or when disabled) the item renders as a button and calls `onSelect`. */
  href?: string;
  /** Decorative icon; hidden from assistive technology. The only thing shown when the sidebar is a rail. */
  icon?: ReactNode;
  /** Short mark after the label, such as an unread count. */
  badge?: ReactNode;
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

/** What the sidebar items need to know about the surface they sit in. */
export type NavSurface = {
  /** The sidebar is a rail: icons only, labels kept for assistive technology. */
  collapsed: boolean;
};

export const NavSurfaceContext = createContext<NavSurface>({ collapsed: false });

export function useNavSurface(): NavSurface {
  return useContext(NavSurfaceContext);
}
