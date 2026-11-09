"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useLufia } from "../LufiaProvider";
import { useSlidingIndicator } from "../useSlidingIndicator";
import styles from "./PeerNav.module.css";

export type PeerNavItem<Href = string> = {
  /** Stable key, also the value reported to `onValueChange`. */
  key: string;
  label: string;
  /** Secondary line under the label. Hidden on narrow screens, where the label has to be enough. */
  description?: string;
  /** Decorative icon; hidden from assistive technology. */
  icon?: ReactNode;
  /**
   * Destination. When every item has one, the nav is a list of links; otherwise it is a tablist. A string by default; a
   * different type (a router's typed route, a URL object) is allowed only when the `linkComponent` set on `LufiaProvider`
   * accepts it: it is handed to that component unchanged. `Href` defaults to `string`.
   */
  href?: Href;
  /** Id of the panel this tab controls (tabs only). */
  controls?: string;
  disabled?: boolean;
};

export type PeerNavProps<Href = string> = Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onChange" | "defaultValue"
> & {
  /** Accessible name of the navigation or the tablist. Required: there is usually more than one on a page. */
  label: string;
  items: readonly PeerNavItem<Href>[];
  /** Key of the current item. Controlled. For links it is the page being shown. */
  value?: string;
  /** Initial key when `value` is not given (tabs only; links follow the page). */
  defaultValue?: string;
  /**
   * Called when the person chooses another item. For links it fires on an unmodified primary click, before the
   * browser navigates; call `event.preventDefault()` to take over (it is `undefined` for keyboard-selected tabs).
   */
  onValueChange?: (key: string, event?: MouseEvent<HTMLElement>) => void;
  /**
   * `"fit"` shares the width between the items; `"scroll"` sizes each one to its label and scrolls sideways with a fade on the
   * edge that hides more. Use `"scroll"` when labels are long, so they stay on one line. `"auto"` (default) scrolls from
   * five items.
   */
  layout?: "auto" | "fit" | "scroll";
  /**
   * Called for every click on an enabled item: the current one and modified clicks (Ctrl, Cmd, Shift, Alt, middle button)
   * included, before `onValueChange` and before the browser navigates. `onValueChange` only reports a real change.
   * Call `event.preventDefault()` to take over: `onValueChange` is not called, the indicator stays where it is, a link is not
   * followed and a tab is not selected. Links and tabs.
   */
  onItemClick?: (key: string, event: MouseEvent<HTMLElement>) => void;
  /**
   * What four items do on a phone (narrower than 35rem, `fit` layout). `"row"` (default) keeps them in one row with the icon
   * above the label; `"2x2"` wraps them into two rows of two so each label keeps its width.
   */
  phoneGrid?: "row" | "2x2";
};

const SCROLL_FROM = 5;

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/**
 * The `Href` type parameter defaults to `string`. A non-string `href` (a typed route, a URL object) needs a `linkComponent` on
 * `LufiaProvider` that accepts it; the default plain `<a>` cannot render one.
 *
 * A horizontal set of sibling views of one page (overview and work, register and deliveries), each with a label, an
 * optional description and icon, and an indicator that slides to the chosen one.
 *
 * The semantics follow what the items are. Items that navigate (every item has an `href`) render a `<nav>` of links, the
 * current one marked `aria-current="page"`. Items that switch content in place render a WAI-ARIA tablist with roving
 * focus, arrow keys, Home and End. Mixing the two in one component would promise keyboard behaviour that half the items
 * do not have, so a single missing `href` makes all of them tabs.
 */
export function PeerNav<Href = string>({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  layout = "auto",
  onItemClick,
  phoneGrid = "row",
  className,
  id,
  ...rest
}: PeerNavProps<Href>) {
  const { linkComponent: Link } = useLufia();
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const asLinks = items.length > 0 && items.every((item) => item.href !== undefined);
  const navRef = useRef<HTMLDivElement>(null);
  const [inner, setInner] = useState(
    defaultValue ?? (asLinks ? undefined : items.find((i) => !i.disabled)?.key),
  );
  const current = value ?? inner;
  // The view a click is taking the person to: the indicator and the chosen styling move to it at once, before the new page
  // arrives. `aria-current` stays on the page actually shown. The pending choice dies when the page changes.
  const [pending, setPending] = useState<{ key: string; from: string | undefined } | null>(null);
  const target = pending && pending.from === current ? pending.key : current;
  const indicator = useSlidingIndicator(navRef, `[data-peer-key="${target}"]`, target);
  const scrolls = layout === "scroll" || (layout === "auto" && items.length >= SCROLL_FROM);

  // A scrolling nav brings the current item into sight and fades the edge that has more items behind it.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !scrolls) return;
    const active = nav.querySelector<HTMLElement>('[data-active="true"]');
    if (active && nav.scrollWidth > nav.clientWidth) {
      const offset = active.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft;
      nav.scrollLeft = offset - (nav.clientWidth - active.offsetWidth) / 2;
    }
    const mark = () => {
      const start = Math.abs(nav.scrollLeft) > 2;
      const end = Math.abs(nav.scrollLeft) + nav.clientWidth < nav.scrollWidth - 2;
      if (start || end) nav.dataset.more = start && end ? "both" : start ? "start" : "end";
      else delete nav.dataset.more;
    };
    mark();
    nav.addEventListener("scroll", mark, { passive: true });
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(mark) : null;
    observer?.observe(nav);
    return () => {
      nav.removeEventListener("scroll", mark);
      observer?.disconnect();
    };
  }, [current, scrolls]);

  const content = (item: PeerNavItem<Href>) => (
    <>
      {item.icon ? (
        <span className={styles.icon} aria-hidden="true">
          {item.icon}
        </span>
      ) : null}
      <span className={styles.labelGroup}>
        <span className={styles.label}>{item.label}</span>
        {item.description ? <span className={styles.description}>{item.description}</span> : null}
      </span>
    </>
  );

  const rootProps = {
    ...rest,
    id,
    ref: navRef,
    className: [styles.root, className].filter(Boolean).join(" "),
    "data-layout": scrolls ? "scroll" : "fit",
    "data-phone-grid": phoneGrid === "2x2" && !scrolls && items.length === 4 ? "2x2" : undefined,
    "data-mode": asLinks ? "links" : "tabs",
  };
  const mark = <span ref={indicator} className={styles.indicator} hidden aria-hidden="true" />;

  if (asLinks) {
    return (
      <nav {...rootProps} aria-label={label}>
        {items.map((item) => {
          const isCurrent = item.key === current;
          return (
            <Link
              key={item.key}
              // The provider's link type says `string`; an app that passes another `Href` supplies a link component that takes it.
              href={item.href as string}
              data-peer-key={item.key}
              data-active={item.key === target || undefined}
              className={styles.item}
              aria-current={isCurrent ? "page" : undefined}
              aria-disabled={item.disabled || undefined}
              tabIndex={item.disabled ? -1 : undefined}
              onClick={(event) => {
                if (item.disabled) {
                  event.preventDefault();
                  return;
                }
                onItemClick?.(item.key, event);
                if (event.defaultPrevented) return;
                if (isCurrent || !isPlainClick(event)) return;
                onValueChange?.(item.key, event);
                if (!event.defaultPrevented) setPending({ key: item.key, from: current });
              }}
            >
              {content(item)}
            </Link>
          );
        })}
        {mark}
      </nav>
    );
  }

  const enabled = items.filter((item) => !item.disabled);
  // Exactly one tab is in the tab order: the selected one, or the first enabled when the value matches none.
  const tabbable = enabled.some((item) => item.key === current) ? current : enabled[0]?.key;
  const select = (key: string) => {
    if (value === undefined) setInner(key);
    onValueChange?.(key);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key) || enabled.length === 0) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const at = enabled.findIndex((item) => item.key === current);
    let next = at;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = enabled.length - 1;
    else if (event.key === forward) next = (at + 1) % enabled.length;
    else next = (at - 1 + enabled.length) % enabled.length;
    const item = enabled[next];
    if (!item) return;
    event.preventDefault();
    select(item.key);
    navRef.current?.querySelector<HTMLElement>(`[data-peer-key="${item.key}"]`)?.focus();
  };

  return (
    // The tablist itself is not focusable by design (APG): the selected tab is, and key events bubble up from it.
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div {...rootProps} role="tablist" aria-label={label} aria-orientation="horizontal" onKeyDown={onKeyDown}>
      {items.map((item) => {
        const selected = item.key === current;
        return (
          <button
            key={item.key}
            id={`${baseId}-tab-${item.key}`}
            type="button"
            role="tab"
            data-peer-key={item.key}
            data-active={item.key === target || undefined}
            className={styles.item}
            aria-selected={selected}
            aria-controls={item.controls}
            disabled={item.disabled}
            tabIndex={item.key === tabbable ? 0 : -1}
            onClick={(event) => {
              onItemClick?.(item.key, event);
              if (!event.defaultPrevented) select(item.key);
            }}
          >
            {content(item)}
          </button>
        );
      })}
      {mark}
    </div>
  );
}
