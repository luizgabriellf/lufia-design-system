"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { useControllableState } from "../FormField/useControllableState";
import { CheckIcon } from "../Icon/icons";
import { inheritContext, portalHost } from "../internal/portalContext";
import type { Align, Side } from "../internal/placement";
import { useAnchoredPosition } from "../internal/useAnchoredPosition";
import { usePresence } from "../internal/usePresence";
import { LufiaLink } from "../LufiaProvider";
import { useDismiss } from "../useDismiss";
import styles from "./Menu.module.css";

export type MenuItem = {
  /** Stable key, unique across the whole list (groups included). */
  key: string;
  label: string;
  /** Secondary line under the label. */
  description?: string;
  /** Trailing text, such as a shortcut, a count or a plan name. */
  meta?: string;
  /** Decorative icon before the label; hidden from assistive technology. */
  icon?: ReactNode;
  /** Makes the item a link (through the `LufiaProvider` link adapter, or a plain `<a>` with `native`) instead of a button. */
  href?: string;
  /**
   * With `href`: render a plain `<a>` instead of going through the `LufiaProvider` link adapter. The browser follows it, so
   * it is never prefetched and never a client-side transition: use it for a file download or a server route that must be
   * requested for real. Keyboard, type-ahead and closing on activation work as for every other item.
   */
  native?: boolean;
  /** With `native`: downloads the target instead of navigating; a string suggests the file name. Ignored otherwise. */
  download?: boolean | string;
  /** With `native`: where to open the target (`_blank` for a new tab), passed to the anchor as is. Ignored otherwise. */
  target?: string;
  /** With `native`: the anchor's `rel` (for example `noopener noreferrer` with `target="_blank"`), passed as is. Ignored otherwise. */
  rel?: string;
  /** Runs when the item is activated, after the menu has closed (`closeOnSelect`) and focus is back on the trigger. */
  onSelect?: () => void;
  /**
   * Marks the item the person is on. A link gets `aria-current="page"`; an option in a `listbox` gets
   * `aria-selected="true"` (every other option `"false"`). The open menu focuses it first with `initialFocus="current"`.
   */
  current?: boolean;
  /** Still focusable and readable (`aria-disabled`), but it cannot be activated. */
  disabled?: boolean;
  /**
   * `data-*` attributes rendered on the item element, so an app can anchor a tour or a test to one item. The attributes the
   * component owns (`role`, `aria-*`, `class`) cannot be set this way.
   */
  attributes?: Record<`data-${string}`, string>;
};

export type MenuGroup = {
  type: "group";
  key: string;
  /** Visible heading, which also names the group for assistive technology. Without one the items are listed flat. */
  label?: string;
  items: readonly MenuItem[];
};

export type MenuSeparator = {
  type: "separator";
  key: string;
};

export type MenuEntry = MenuItem | MenuGroup | MenuSeparator;

export type MenuTriggerProps = {
  /** Must reach the DOM element: it is what the list hangs from and where focus returns. */
  ref: (element: HTMLElement | null) => void;
  /** Toggles the list. */
  onClick: () => void;
  /** ArrowDown opens the list (ArrowUp opens it on the last item). */
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  "aria-expanded": boolean;
  /** The list's id while it is rendered. */
  "aria-controls": string | undefined;
  "aria-haspopup": "menu" | "listbox";
};

export type MenuProps = Omit<
  HTMLAttributes<HTMLUListElement>,
  "children" | "role" | "aria-label" | "aria-labelledby"
> & {
  /** Accessible name of the list, such as "Switch workspace" or "Export". */
  label: string;
  /** The choices, in order. Entries are items, groups (with an optional heading) or separators. */
  items: readonly MenuEntry[];
  /** `"menu"` (default): a list of actions or links, items are `menuitem`. `"listbox"`: a choice of one value, items are `option` and the `current` one is `aria-selected`. */
  role?: "menu" | "listbox";
  /**
   * `"popover"` (default): a list that hangs from `trigger`. `"inline"`: the same items as a plain, always-visible list, with
   * no trigger and no popover, for placing inside a sheet or a page. Keyboard navigation works the same; the props that
   * belong to the trigger and the popover (`trigger`, `open`, `defaultOpen`, `onOpenChange`, `placement`, `align`,
   * `matchTriggerWidth`, `closeOnSelect`) do not apply.
   */
  presentation?: "popover" | "inline";
  /**
   * Required unless `presentation="inline"`; without it nothing is rendered. Renders the element that opens the list
   * (usually a `Button`) and spreads the given props onto it. Called on every render, so keep it cheap:
   * `trigger={(props) => <Button {...props}>Export</Button>}`.
   */
  trigger?: (props: MenuTriggerProps) => ReactNode;
  /** Where focus goes when the list opens: the `current` item, or the first when none is (`"current"`, default), or always the first (`"first"`). */
  initialFocus?: "current" | "first";
  /** Close the list after an item is activated. Default `true`. */
  closeOnSelect?: boolean;
  /** Whether the list is open. Controlled; pair it with `onOpenChange`. */
  open?: boolean;
  /** Whether the list starts open when `open` is not given. For documentation and tests; focus is not moved on first paint. */
  defaultOpen?: boolean;
  /** Called with the next state when the trigger, Escape, Tab, a press outside or a selection asks to change it. */
  onOpenChange?: (open: boolean) => void;
  /** Which side of the trigger the list opens on. `start` and `end` follow the writing direction. It flips to the opposite side when it does not fit. Default `bottom`. */
  placement?: Side;
  /** How the list lines up with the trigger along the other axis. It shifts to stay in the viewport. Default `start`. */
  align?: Align;
  /** Makes the list at least as wide as the trigger (it grows for longer labels). Default `false`. */
  matchTriggerWidth?: boolean;
};

const TYPEAHEAD_RESET_MS = 500;
const ITEM_SELECTOR = '[role="menuitem"], [role="option"]';

const isGroup = (entry: MenuEntry): entry is MenuGroup => "type" in entry && entry.type === "group";
const isSeparator = (entry: MenuEntry): entry is MenuSeparator =>
  "type" in entry && entry.type === "separator";
const flatItems = (entries: readonly MenuEntry[]): MenuItem[] =>
  entries.flatMap((entry) => (isGroup(entry) ? entry.items : isSeparator(entry) ? [] : [entry]));

type ListProps = Omit<
  HTMLAttributes<HTMLUListElement>,
  "children" | "role" | "aria-label" | "aria-labelledby"
> & {
  ref?: Ref<HTMLUListElement>;
  label: string;
  role: "menu" | "listbox";
  items: readonly MenuEntry[];
  /** Called for an enabled item that was activated. */
  onActivate: (item: MenuItem) => void;
  /** Tab inside a popover: the caller moves focus and closes. Without it, Tab behaves as usual. */
  onTab?: () => void;
};

/**
 * The list itself: items, roving focus, type-ahead and activation. Shared by the popover and the inline presentation, so the
 * two cannot drift apart. Holds the roving stop, so it starts fresh whenever the panel is mounted.
 */
function MenuList({ ref, label, role, items, onActivate, onTab, onKeyDown, className, ...rest }: ListProps) {
  const id = useId();
  const [stop, setStop] = useState<string | undefined>(undefined);
  const typed = useRef({ text: "", timer: 0 });
  const itemRole = role === "listbox" ? "option" : "menuitem";

  useEffect(() => {
    const state = typed.current;
    return () => window.clearTimeout(state.timer);
  }, []);

  const all = flatItems(items);
  const hasIcons = all.some((item) => item.icon);
  // The one item that is a Tab stop (roving tabindex): where the person last was, else the current one, else the first.
  const defaultStop = (
    all.find((item) => item.current && !item.disabled) ?? all.find((item) => !item.disabled)
  )?.key;
  const tabStop = stop !== undefined && all.some((item) => item.key === stop) ? stop : defaultStop;

  const list = (element: HTMLElement) =>
    Array.from(element.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
      (el) => el.getClientRects().length > 0,
    );

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const entries = list(event.currentTarget);
    if (entries.length === 0) return;
    const at = entries.indexOf(document.activeElement as HTMLElement);
    const go = (index: number) => {
      event.preventDefault();
      entries[(index + entries.length) % entries.length]?.focus();
    };
    if (event.key === "ArrowDown") return go(at + 1);
    if (event.key === "ArrowUp") return go(at < 0 ? entries.length - 1 : at - 1);
    if (event.key === "Home") return go(0);
    if (event.key === "End") return go(entries.length - 1);
    if (event.key === "Tab" && onTab) return onTab();
    if (event.key === " " && at >= 0 && entries[at] instanceof HTMLAnchorElement) {
      // Space activates a link too, as it does a button; the browser would scroll the page instead.
      event.preventDefault();
      return entries[at].click();
    }
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.key === " ") return;
    // Type-ahead: a growing prefix, forgotten after a pause. The same letter repeated cycles through that letter's items.
    event.preventDefault();
    const state = typed.current;
    window.clearTimeout(state.timer);
    state.text += event.key.toLowerCase();
    state.timer = window.setTimeout(() => (state.text = ""), TYPEAHEAD_RESET_MS);
    const cycling = state.text.split("").every((char) => char === state.text[0]);
    const prefix = cycling ? state.text[0]! : state.text;
    const start = cycling ? at + 1 : Math.max(at, 0);
    const ordered = [...entries.slice(start), ...entries.slice(0, start)];
    ordered
      .find((el) =>
        el.querySelector("[data-menu-label]")?.textContent?.trim().toLowerCase().startsWith(prefix),
      )
      ?.focus();
  };

  const renderItem = (item: MenuItem) => {
    const props = {
      ...item.attributes,
      role: itemRole,
      tabIndex: item.key === tabStop ? 0 : -1,
      className: styles.item,
      "data-current": item.current || undefined,
      "aria-disabled": item.disabled || undefined,
      "aria-selected": role === "listbox" ? Boolean(item.current) : undefined,
      "aria-current": item.href !== undefined && item.current ? ("page" as const) : undefined,
      onFocus: () => setStop(item.key),
    };
    const content = (
      <>
        {hasIcons ? (
          <span className={styles.icon} aria-hidden="true">
            {item.icon}
          </span>
        ) : null}
        <span className={styles.text}>
          <span data-menu-label="">{item.label}</span>
          {item.description ? <span className={styles.description}>{item.description}</span> : null}
        </span>
        {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
        {role === "listbox" ? (
          <span className={styles.check} aria-hidden="true">
            {item.current ? <CheckIcon /> : null}
          </span>
        ) : null}
      </>
    );
    return (
      <li key={item.key} role="none" className={styles.entry}>
        {item.href !== undefined && item.native ? (
          <a
            {...props}
            href={item.href}
            download={item.download}
            target={item.target}
            rel={item.rel}
            onClick={(event) => {
              if (item.disabled) return event.preventDefault();
              onActivate(item);
            }}
          >
            {content}
          </a>
        ) : item.href !== undefined ? (
          <LufiaLink
            {...props}
            href={item.href}
            onClick={(event) => {
              if (item.disabled) return event.preventDefault();
              onActivate(item);
            }}
          >
            {content}
          </LufiaLink>
        ) : (
          <button
            {...props}
            type="button"
            onClick={() => {
              if (!item.disabled) onActivate(item);
            }}
          >
            {content}
          </button>
        )}
      </li>
    );
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the list owns the keyboard navigation of the items inside it
    <ul
      {...rest}
      ref={ref}
      role={role}
      aria-label={label}
      tabIndex={-1}
      className={[styles.list, className].filter(Boolean).join(" ")}
      onKeyDown={handleKeyDown}
    >
      {items.map((entry) => {
        if (isSeparator(entry))
          return (
            <li key={entry.key} role={role === "menu" ? "separator" : "none"} className={styles.separator} />
          );
        if (!isGroup(entry)) return renderItem(entry);
        if (!entry.label) return entry.items.map(renderItem);
        const headingId = `${id}-${entry.key}`;
        return (
          <li key={entry.key} role="none" className={styles.group}>
            <span id={headingId} className={styles.heading}>
              {entry.label}
            </span>
            <ul role="group" aria-labelledby={headingId} className={styles.groupList}>
              {entry.items.map(renderItem)}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * A list of choices, with its own trigger: a workspace or scope switcher, an export menu, a set of links. `role="menu"`
 * (default) follows the WAI-ARIA menu button pattern for actions and links; `role="listbox"` is a choice of one value
 * (`current` marks the selected option). Focus roves with the arrow keys, Home, End and type-ahead; Escape closes and returns
 * focus to the trigger, and Tab closes. For a non-list panel (a form, filters) use `Popover`; for overflow actions behind an
 * icon button, with a sheet on phones, use `MoreActions`.
 *
 * The open list is portalled to `document.body` (or into the open modal the trigger sits in) and placed with
 * `position: fixed` from the trigger's box, with the same flip, shift and follow-on-scroll behaviour as `Popover`, so an
 * ancestor with `overflow: hidden` cannot clip it. Until the component has mounted (server render, hydration) the list is not
 * rendered. `presentation="inline"` renders the same items as an always-visible list instead.
 */
export function Menu({ presentation = "popover", trigger, ...props }: MenuProps) {
  if (presentation === "inline") return <InlineMenu {...props} />;
  return trigger ? <PopoverMenu trigger={trigger} {...props} /> : null;
}

/* eslint-disable @typescript-eslint/no-unused-vars -- popover-only props are dropped so they never reach the DOM */
function InlineMenu({
  label,
  role = "menu",
  items,
  /* the props that only apply to a popover are dropped, so they never reach the DOM */
  initialFocus: _initialFocus,
  closeOnSelect: _closeOnSelect,
  open: _open,
  defaultOpen: _defaultOpen,
  onOpenChange: _onOpenChange,
  placement: _placement,
  align: _align,
  matchTriggerWidth: _matchTriggerWidth,
  ...rest
}: Omit<MenuProps, "presentation" | "trigger">) {
  return (
    <MenuList {...rest} label={label} role={role} items={items} onActivate={(item) => item.onSelect?.()} />
  );
}
/* eslint-enable @typescript-eslint/no-unused-vars */

function PopoverMenu({
  trigger,
  label,
  role = "menu",
  items,
  initialFocus = "current",
  closeOnSelect = true,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom",
  align = "start",
  matchTriggerWidth = false,
  className,
  onFocus,
  onBlur,
  onAnimationEnd,
  ...rest
}: Omit<MenuProps, "presentation"> & { trigger: NonNullable<MenuProps["trigger"]> }) {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  // The trigger is held in state (set by its callback ref) so `trigger()` is handed a function that touches no ref during
  // render; `triggerRef` mirrors it for the hooks that take a ref.
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    triggerRef.current = triggerElement;
  }, [triggerElement]);
  const panelRef = useRef<HTMLUListElement>(null);
  const focusInside = useRef(false);
  const skipFocus = useRef(open);
  const [openAt, setOpenAt] = useState<"initial" | "last">("initial");
  const id = useId();

  // False on the server and during hydration: a portal cannot be rendered there.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { phase, finish } = usePresence(open, panelRef);
  const present = phase !== "unmounted";
  const host = present && mounted && triggerElement ? portalHost(triggerElement) : null;

  const close = useCallback(() => setOpen(false), [setOpen]);
  // Not before the trigger is known: `useDismiss` reads the element when it subscribes.
  useDismiss(open && triggerElement !== null, close, triggerRef, triggerRef, panelRef);

  // Before the placement hook below, so the width it measures already includes the trigger's.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!present || !host || !panel || !triggerElement) return;
    if (!matchTriggerWidth) {
      panel.style.minInlineSize = "";
      return;
    }
    const apply = () => (panel.style.minInlineSize = `${triggerElement.getBoundingClientRect().width}px`);
    apply();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(apply);
    observer?.observe(triggerElement);
    return () => observer?.disconnect();
  }, [present, host, triggerElement, matchTriggerWidth]);

  const getAnchor = useCallback(() => triggerElement, [triggerElement]);
  useAnchoredPosition(present && host !== null, getAnchor, panelRef, { side: placement, align });

  // Copies the trigger's theme, direction and inline custom properties onto the list, which left its subtree.
  useLayoutEffect(() => {
    if (present && host && triggerElement && panelRef.current)
      inheritContext(triggerElement, panelRef.current, host);
  }, [present, host, triggerElement]);

  useEffect(() => {
    // Not before the list exists: the first pass of a hydrating tree must not consume the skip below.
    if (!open || !host || !panelRef.current) return;
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    const panel = panelRef.current;
    const entries = Array.from(panel.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
      (el) => el.getClientRects().length > 0,
    );
    const target =
      openAt === "last"
        ? entries[entries.length - 1]
        : ((initialFocus === "current" ? entries.find((el) => el.hasAttribute("data-current")) : undefined) ??
          entries[0]);
    (target ?? panel).focus();
  }, [open, host, initialFocus, openAt]);

  // Closed from the outside while focus was in the list: it is about to leave the DOM, so focus goes back to the trigger. A
  // press elsewhere moved focus already and is left alone.
  useLayoutEffect(() => {
    if (open) return;
    const inside = focusInside.current || panelRef.current?.contains(document.activeElement);
    focusInside.current = false;
    if (inside) triggerRef.current?.focus();
  }, [open]);

  const openWith = (where: "initial" | "last") => {
    setOpenAt(where);
    setOpen(true);
  };

  const activate = (item: MenuItem) => {
    if (!closeOnSelect) return item.onSelect?.();
    // Focus goes back first, so a dialog the action opens returns here when it closes.
    triggerRef.current?.focus();
    close();
    item.onSelect?.();
  };

  return (
    <>
      {trigger({
        ref: setTriggerElement,
        onClick: () => {
          if (open) close();
          else openWith("initial");
        },
        onKeyDown: (event) => {
          if (event.defaultPrevented) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openWith(event.key === "ArrowUp" ? "last" : "initial");
          }
        },
        "aria-expanded": open,
        "aria-controls": present && host ? id : undefined,
        "aria-haspopup": role,
      })}
      {present && host
        ? createPortal(
            <MenuList
              {...rest}
              ref={panelRef}
              id={id}
              label={label}
              role={role}
              items={items}
              className={[styles.panel, className].filter(Boolean).join(" ")}
              data-state={phase === "open" ? "open" : "closed"}
              data-side={placement}
              inert={phase !== "open" || undefined}
              onActivate={activate}
              onTab={() => {
                // Focus goes to the trigger first, so the Tab that follows moves on from it and the order stays predictable.
                triggerRef.current?.focus();
                close();
              }}
              onFocus={(event) => {
                focusInside.current = true;
                onFocus?.(event);
              }}
              onBlur={(event) => {
                if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget))
                  focusInside.current = false;
                onBlur?.(event);
              }}
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) finish();
                onAnimationEnd?.(event);
              }}
            />,
            host,
          )
        : null}
    </>
  );
}
