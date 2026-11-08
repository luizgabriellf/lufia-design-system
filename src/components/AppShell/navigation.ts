import type { ReactNode } from "react";

export { parseShellState, serializeShellState, type ShellState } from "./shellState";

/** `data-*` attributes passed through to an element (analytics hooks, guided-tour anchors, test ids). */
export type ShellDataAttributes = { [name: `data-${string}`]: string | number | boolean | undefined };

/** The colour of a badge or count. It never carries the meaning alone: the text is always there. */
export type ShellBadgeTone = "neutral" | "success" | "warning" | "danger";

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

/**
 * How an item decides that `currentPath` is its page.
 *
 * - `prefix` (the default): the path equals the item's or sits below it (`/settings/billing` belongs to `/settings`).
 * - `exact`: the path equals the item's, and not the pages below it.
 * - `query`: the path equals the item's and every query parameter in the item's `href` has the same value in
 *   `currentPath`, for sections chosen by a query string (`/admin?section=users`). Pass `currentPath` with its query.
 * - a function: return true when `currentPath` (as you passed it, query included) is this item's page.
 *
 * Query strings and hashes are ignored by `prefix` and `exact`. When several items match, a function beats `query`,
 * `query` beats a plain path, and between paths the longest wins, so two items are never current at once.
 */
export type ShellNavMatch =
  "prefix" | "exact" | "query" | ((currentPath: string, item: ShellNavItem) => boolean);

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
  /** With `currentPath`, match this path only and not the pages under it. Same as `match: "exact"`. */
  exact?: boolean;
  /** How `currentPath` is matched to this item. Default `prefix` (or `exact` when `exact` is set). See `ShellNavMatch`. */
  match?: ShellNavMatch;
  /**
   * Sub-items, one level deep (the sub-items' own `items` are ignored): sections under one page. They are listed under
   * the item, indented, while the item or one of them is current, or always with `expanded`. In the rail they are
   * hidden: the item's icon links to its own `href` and it is marked current (`aria-current="true"`) while one of them
   * is. So give an item with sub-items an `href` (its overview or first section).
   */
  items?: readonly ShellNavItem[];
  /** Always list the sub-items, not only while this branch is current. */
  expanded?: boolean;
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

const queryOf = (href: string) => {
  const withoutHash = href.split("#")[0] ?? "";
  const at = withoutHash.indexOf("?");
  return new URLSearchParams(at === -1 ? "" : withoutHash.slice(at + 1));
};

/**
 * Every item of the groups, sub-items included, each sub-item before the item that holds it, so the more specific entry
 * comes first.
 */
export function flattenNavItems(groups: readonly ShellNavGroup[]): ShellNavItem[] {
  return groups.flatMap((group) => group.items.flatMap((item) => [...(item.items ?? []), item]));
}

/** The item is `key`, or holds it as a sub-item. */
export function navItemHolds(item: ShellNavItem, key: string | undefined): boolean {
  if (key === undefined) return false;
  return item.key === key || (item.items ?? []).some((child) => child.key === key);
}

/** How strongly `item` claims `currentPath`: 0 for not at all; higher wins. */
function matchScore(item: ShellNavItem, currentPath: string, path: string): number {
  if (item.href === undefined || item.disabled) return 0;
  const match = item.match ?? (item.exact ? "exact" : "prefix");
  if (typeof match === "function") return match(currentPath, item) ? 3_000_000 : 0;
  const target = pathOf(item.href);
  if (match === "query") {
    if (path !== target) return 0;
    const wanted = queryOf(item.href);
    const actual = queryOf(currentPath);
    let count = 0;
    for (const [name, value] of wanted) {
      if (!actual.getAll(name).includes(value)) return 0;
      count += 1;
    }
    return 2_000_000 + count * 10_000 + target.length;
  }
  const matches = path === target || (match !== "exact" && target !== "/" && path.startsWith(`${target}/`));
  return matches ? 1_000_000 + target.length : 0;
}

/**
 * The key of the item that `currentPath` belongs to, or `undefined`, sub-items included. Each item matches as its
 * `match` says (see `ShellNavMatch`); when several match, the strongest claim wins, so two items are never current at
 * once. With `isActive` the first item it returns true for wins, a sub-item before the item that holds it.
 */
export function findActiveNavKey(
  groups: readonly ShellNavGroup[],
  currentPath: string | undefined,
  isActive?: (item: ShellNavItem) => boolean,
): string | undefined {
  const items = flattenNavItems(groups);
  if (isActive) return items.find((item) => isActive(item))?.key;
  if (currentPath === undefined) return undefined;
  const path = pathOf(currentPath);
  let best: { key: string; score: number } | undefined;
  for (const item of items) {
    const score = matchScore(item, currentPath, path);
    if (score > 0 && (!best || score > best.score)) best = { key: item.key, score };
  }
  return best?.key;
}
