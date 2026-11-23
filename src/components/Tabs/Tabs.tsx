"use client";

import {
  useId,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { useControllableState } from "../FormField/useControllableState";
import { LufiaLink } from "../LufiaProvider";
import styles from "./Tabs.module.css";

export type TabsItem = {
  /** Stable key, unique in the list. It is the value reported to `onValueChange` and matched by `value`. */
  key: string;
  /** Visible name of the tab. */
  label: ReactNode;
  /** Decorative icon before the label; hidden from assistive technology. */
  icon?: ReactNode;
  /** The content this tab shows (tabs mode). An item without a panel is still a tab; it just controls nothing. */
  panel?: ReactNode;
  /**
   * Destination. When every item has one, the component is a `<nav>` of links rendered through the `LufiaProvider` link
   * adapter, the current one marked `aria-current="page"`, and `panel` is ignored. A single missing `href` makes all of
   * them tabs (and the `href`s are ignored), so the markup never promises keyboard behaviour half the items lack.
   */
  href?: string;
  /** Skipped by the arrow keys and cannot be chosen. In links mode the link stays in the page but is `aria-disabled` and inert. */
  disabled?: boolean;
};

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange"> & {
  /** The tabs, in order. */
  items: readonly TabsItem[];
  /** Accessible name of the tab list (or of the navigation in links mode). Give this or `labelledBy`. */
  label?: string;
  /** Id of the element that names the tab list. Give this or `label`. */
  labelledBy?: string;
  /** Key of the chosen tab. Controlled; pair it with `onValueChange`. In links mode it is the page being shown. */
  value?: string;
  /** Key chosen first when `value` is not given. Defaults to the first enabled tab (tabs mode). */
  defaultValue?: string;
  /** Called with the key the person chose (a click, or an arrow key with automatic activation). Tabs mode only. */
  onValueChange?: (key: string) => void;
  /** `"horizontal"` (default): a row with Left and Right arrows, scrolling sideways when it does not fit. `"vertical"`: a column with Up and Down arrows. */
  orientation?: "horizontal" | "vertical";
  /**
   * `"automatic"` (default): moving focus with an arrow key also chooses the tab, which suits panels that render at once.
   * `"manual"`: arrow keys only move focus; Enter or Space chooses, which suits panels that load data.
   */
  activation?: "automatic" | "manual";
  /** Keep the panels of tabs that are not chosen in the DOM (hidden) so their state survives. Default `false`: only the chosen panel is rendered. */
  keepMounted?: boolean;
  /** Ref to the root `<div>`. */
  ref?: Ref<HTMLDivElement>;
};

const KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];

/**
 * A set of views of one page where one is shown at a time, as a WAI-ARIA tablist: `tablist`, `tab` and `tabpanel`, one tab in
 * the tab order (roving tabindex), arrow keys, Home and End, wrapping and skipping disabled tabs. Left and Right swap in
 * right-to-left layouts. Horizontal by default, `orientation="vertical"` for a side list; a row that does not fit scrolls
 * sideways without widening the page. Controlled (`value`, `onValueChange`) or uncontrolled (`defaultValue`).
 *
 * Choose `activation="manual"` when showing a panel is slow, so arrow keys only browse. Panels are rendered only while
 * chosen unless `keepMounted`.
 *
 * When every item has an `href` it renders a `<nav>` of links instead (URL-driven tabs): the current one gets
 * `aria-current="page"`, every link is a normal tab stop and there is no tablist, because a tablist would promise arrow-key
 * behaviour that links do not have. The page owns the state there; `value` follows the route. For a visually richer
 * set of sibling views with descriptions and an indicator use `PeerNav`.
 */
export function Tabs({
  items,
  label,
  labelledBy,
  value: valueProp,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  activation = "automatic",
  keepMounted = false,
  className,
  id,
  ref,
  ...rest
}: TabsProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const asLinks = items.length > 0 && items.every((item) => item.href !== undefined);
  const enabled = items.filter((item) => !item.disabled);
  const [value, setValue] = useControllableState<string | undefined>(
    valueProp,
    defaultValue ?? enabled[0]?.key,
    onValueChange ? (next) => next !== undefined && onValueChange(next) : undefined,
  );
  // Set once the chosen tab differs from the one at mount, so the first paint of a page never animates. Derived while
  // rendering (no effect pass), and absent on the first render, so server and client markup match.
  const [seenValue, setSeenValue] = useState(value);
  const [switched, setSwitched] = useState(false);
  if (value !== seenValue) {
    setSeenValue(value);
    setSwitched(true);
  }
  // Where focus is inside the list (manual activation can focus a tab that is not the chosen one); null when it is outside.
  const [stop, setStop] = useState<string | null>(null);
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  const content = (item: TabsItem) => (
    <>
      {item.icon ? (
        <span className={styles.icon} aria-hidden="true">
          {item.icon}
        </span>
      ) : null}
      <span className={styles.label}>{item.label}</span>
    </>
  );

  if (asLinks) {
    return (
      <div {...rest} id={id} ref={ref} className={rootClass} data-orientation={orientation} data-mode="links">
        <nav
          className={styles.list}
          aria-label={label}
          aria-labelledby={labelledBy}
          data-orientation={orientation}
        >
          {items.map((item) => (
            <LufiaLink
              key={item.key}
              href={item.href!}
              className={styles.tab}
              aria-current={item.key === value ? "page" : undefined}
              aria-disabled={item.disabled || undefined}
              tabIndex={item.disabled ? -1 : undefined}
              data-selected={item.key === value ? "" : undefined}
              onClick={(event) => {
                if (item.disabled) event.preventDefault();
              }}
            >
              {content(item)}
            </LufiaLink>
          ))}
        </nav>
      </div>
    );
  }

  const selectedEnabled = enabled.some((item) => item.key === value);
  const focusKey = stop !== null && enabled.some((item) => item.key === stop) ? stop : null;
  const tabbable = focusKey ?? (selectedEnabled ? value : enabled[0]?.key);
  const tabId = (key: string) => `${baseId}-tab-${key}`;
  const panelId = (key: string) => `${baseId}-panel-${key}`;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!KEYS.includes(event.key) || enabled.length === 0) return;
    const vertical = orientation === "vertical";
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const nextKey = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const previousKey = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    // Keys of the other axis are left to the page (scrolling, a surrounding widget).
    if (!["Home", "End", nextKey, previousKey].includes(event.key)) return;
    const focused = (event.target as HTMLElement).closest<HTMLElement>("[data-tab-key]");
    const at = enabled.findIndex((item) => item.key === focused?.dataset.tabKey);
    let index: number;
    if (event.key === "Home") index = 0;
    else if (event.key === "End") index = enabled.length - 1;
    else if (event.key === nextKey) index = (at + 1) % enabled.length;
    else index = (at - 1 + enabled.length) % enabled.length;
    const target = enabled[index];
    if (!target) return;
    event.preventDefault();
    setStop(target.key);
    event.currentTarget.querySelector<HTMLElement>(`[data-tab-key="${CSS.escape(target.key)}"]`)?.focus();
    if (activation === "automatic" && target.key !== value) setValue(target.key);
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setStop(null);
  };

  return (
    <div {...rest} id={id} ref={ref} className={rootClass} data-orientation={orientation} data-mode="tabs">
      {/* The tablist itself is not focusable by design (APG): the chosen tab is, and key events bubble up from it. */}
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
      <div
        className={styles.list}
        role="tablist"
        aria-label={label}
        aria-labelledby={labelledBy}
        aria-orientation={orientation}
        data-orientation={orientation}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      >
        {items.map((item) => {
          const selected = item.key === value;
          const rendered = item.panel !== undefined && (selected || keepMounted);
          return (
            <button
              key={item.key}
              id={tabId(item.key)}
              type="button"
              role="tab"
              className={styles.tab}
              data-tab-key={item.key}
              data-selected={selected ? "" : undefined}
              aria-selected={selected}
              aria-controls={rendered ? panelId(item.key) : undefined}
              disabled={item.disabled}
              tabIndex={item.key === tabbable ? 0 : -1}
              onFocus={() => setStop(item.key)}
              onClick={() => {
                if (!selected) setValue(item.key);
              }}
            >
              {content(item)}
            </button>
          );
        })}
      </div>
      {items.map((item) => {
        const selected = item.key === value;
        if (item.panel === undefined || (!selected && !keepMounted)) return null;
        return (
          <div
            key={item.key}
            id={panelId(item.key)}
            role="tabpanel"
            aria-labelledby={tabId(item.key)}
            className={styles.panel}
            hidden={!selected}
            data-switched={switched ? "" : undefined}
            tabIndex={0}
          >
            {item.panel}
          </div>
        );
      })}
    </div>
  );
}
