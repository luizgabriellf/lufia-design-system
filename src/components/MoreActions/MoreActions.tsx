"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { IconButton } from "../IconButton";
import { LufiaLink } from "../LufiaProvider";
import { useDismiss } from "../useDismiss";
import { useFocusTrap } from "../useFocusTrap";
import { useBodyScrollLock } from "../useBodyScrollLock";
import { useMediaQuery } from "../useMediaQuery";
import { VisuallyHidden } from "../VisuallyHidden";
import type { ButtonVariant } from "../Button";
import { MoreIcon } from "../Icon/icons";
import styles from "./MoreActions.module.css";

export type MoreActionItem = {
  /** Stable key. */
  key: string;
  label: string;
  /** Secondary line under the label. */
  description?: string;
  /** Decorative icon; hidden from assistive technology. */
  icon?: ReactNode;
  /** Makes the item a link (through `LufiaLink`) instead of a button. */
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
  /**
   * Short explanation, such as why the item is disabled. Shown as the native tooltip and read as the description of the
   * item. Disabled items are already focusable (`aria-disabled`), so the hint is reachable by keyboard.
   */
  hint?: string;
  /** `"danger"` styles a destructive item. The label must still say what it does. */
  tone?: "default" | "danger";
  /** Shown only when the page is narrow, where the actions that stay visible on wide screens move into the menu. */
  narrowOnly?: boolean;
  /**
   * `data-*` attributes rendered on the menu item element (the `menuitem` button or link), so an app can anchor a tour or
   * a test to one item without looking it up by label. The attributes the component owns (`role`, `aria-*`, `class`) cannot
   * be set this way.
   */
  attributes?: Record<`data-${string}`, string>;
};

export type MoreActionsProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Accessible name of the trigger and of the menu, such as "More actions". */
  label: string;
  items: readonly MoreActionItem[];
  /** Which edge of the trigger the menu lines up with. Defaults to the end. */
  align?: "start" | "end";
  size?: "sm" | "md" | "lg";
  variant?: ButtonVariant;
  /** Replaces the default three-dot icon. */
  icon?: ReactNode;
  /**
   * How the open menu is shown. `"popover"` (default) hangs it from the button. `"sheet"` shows it as a full-width sheet
   * anchored to the bottom of the viewport, over a backdrop that covers the whole page, with the page behind made inert.
   * `"auto"` is a sheet below 60rem (the `medium` breakpoint) and a popover from there up.
   */
  presentation?: "auto" | "popover" | "sheet";
  /**
   * What decides when a `narrowOnly` item shows. `"viewport"` (default) is the page width: below 48rem. `"container"` is the
   * width of the nearest ancestor that declares `container-type: inline-size`: below 50rem. A sheet is portalled to the body
   * and leaves that container, so in `"container"` scope a sheet always shows `narrowOnly` items. A popover is portalled too: it reads the container's width when it opens (and on resize) instead. `PageActions` sets this
   * from its `collapse` prop.
   */
  narrowOnlyScope?: "viewport" | "container";
  /** Renders the menu open on first paint. For documentation and tests; people open it themselves. A popover opens without moving focus; a sheet is modal, so it always moves focus to its first item. */
  defaultOpen?: boolean;
};

const TYPEAHEAD_RESET_MS = 500;
const SHEET_QUERY = "(width < 60rem)";
/** The `@container` threshold of `narrowOnlyScope="container"`, in rem (a container condition cannot read a variable). */
const CONTAINER_NARROW_REM = 50;
/**
 * Where a popover is portalled: inside the open modal it belongs to (a native `dialog` or a portal `Modal` panel, whose focus
 * trap and inert page would otherwise lock a menu on the body out), else `document.body`.
 */
const MODAL_HOST = 'dialog[open], [aria-modal="true"]';

/**
 * Whether the content box of the nearest `container-type: inline-size` ancestor is below the narrow threshold. `undefined`
 * when there is no such ancestor: a container condition then matches nothing, which the portalled menu must mirror.
 */
function containerIsNarrow(from: HTMLElement, rem: number): boolean | undefined {
  for (let node = from.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.containerType !== "inline-size" && style.containerType !== "size") continue;
    const number = (value: string) => parseFloat(value) || 0;
    const frame = number(style.borderLeftWidth) + number(style.borderRightWidth);
    // The content box, with fractional pixels (`clientWidth` rounds): a scrollbar is not part of it either.
    const scrollbar = Math.max(0, node.offsetWidth - node.clientWidth - frame);
    const width =
      node.getBoundingClientRect().width -
      frame -
      number(style.paddingLeft) -
      number(style.paddingRight) -
      scrollbar;
    return width < CONTAINER_NARROW_REM * rem;
  }
  return undefined;
}

/**
 * Whether `box` lies wholly outside the viewport or outside a scroll container that clips it. Only an ancestor in the
 * trigger's containing-block chain clips: an absolutely positioned element escapes the static ancestors between it and its
 * containing block, and a fixed one escapes every ancestor. A clip is the ancestor's padding box.
 */
function isScrolledAway(box: DOMRect, from: HTMLElement): boolean {
  const outside = (clip: { left: number; right: number; top: number; bottom: number }) =>
    box.bottom < clip.top || box.top > clip.bottom || box.right < clip.left || box.left > clip.right;
  const viewport = document.documentElement;
  if (outside({ left: 0, top: 0, right: viewport.clientWidth, bottom: viewport.clientHeight })) return true;
  const number = (value: string | undefined) => parseFloat(value ?? "") || 0;
  let below = getComputedStyle(from).position || "static";
  for (let node = from.parentElement; node && node !== document.body; node = node.parentElement) {
    if (below === "fixed") break;
    const style = getComputedStyle(node);
    const position = style.position || "static";
    const transformed = (style.transform || "none") !== "none";
    // An absolutely positioned element is not placed by a static, untransformed ancestor, so that one cannot clip it.
    if (below === "absolute" && position === "static" && !transformed) continue;
    below = position;
    if (/^(visible|)$/.test(style.overflowX ?? "") && /^(visible|)$/.test(style.overflowY ?? "")) continue;
    const rect = node.getBoundingClientRect();
    if (
      outside({
        left: rect.left + number(style.borderLeftWidth),
        right: rect.right - number(style.borderRightWidth),
        top: rect.top + number(style.borderTopWidth),
        bottom: rect.bottom - number(style.borderBottomWidth),
      })
    )
      return true;
  }
  return false;
}

/**
 * The portalled menu leaves the root's subtree, so what the subtree sets that the body does not is copied over: a theme and
 * mode scope (as the pair the scope declares, never a mix of an inner theme with an unrelated outer mode), the writing
 * direction and language, and the root's inline `--lufia-*` custom properties.
 */
function inheritContext(root: HTMLElement, menu: HTMLElement, host: HTMLElement) {
  // A holder that is also above the host (the document element, usually) already reaches the menu by inheritance.
  const copy = (name: string, holder: HTMLElement | null) => {
    if (holder && !holder.contains(host)) menu.setAttribute(name, holder.getAttribute(name) ?? "");
  };
  const theme = root.closest<HTMLElement>("[data-lufia-theme]");
  if (theme && !theme.contains(host)) {
    copy("data-lufia-theme", theme);
    // Theme CSS reads a mode only on the theme element itself (no mode there means it follows the OS scheme), so copy the
    // mode from that element alone, never from an ancestor.
    const mode = theme.getAttribute("data-lufia-mode");
    if (mode !== null) menu.setAttribute("data-lufia-mode", mode);
  } else copy("data-lufia-mode", root.closest<HTMLElement>("[data-lufia-mode]"));
  copy("dir", root.closest<HTMLElement>("[dir]"));
  copy("lang", root.closest<HTMLElement>("[lang]"));
  for (const name of Array.from(root.style)) {
    if (name.startsWith("--lufia-")) menu.style.setProperty(name, root.style.getPropertyValue(name));
  }
}

/**
 * An overflow menu: a button that opens a list of actions. It follows the WAI-ARIA menu button pattern, with a roving
 * focus that arrow keys, Home, End and typeahead move through. Escape and a press outside close it through `useDismiss`,
 * which also keeps the layer order right when the menu sits inside a dialog.
 *
 * As a popover the open menu is portalled out of the component (to `document.body`, or into the open modal it sits in) and
 * placed with `position: fixed` from the trigger's box, so an ancestor with `overflow: hidden` cannot clip it. It lines up with
 * `align` and flips to the other edge, or opens upward, when it would leave the viewport, and it follows the trigger on
 * scroll and resize. Until the component has mounted (server render, hydration) it renders in place.
 *
 * As a sheet (`presentation`) the menu moves to a portal on `document.body`: a backdrop covers the viewport, focus is trapped
 * in the sheet, the page behind is inert, and Escape or a tap on the backdrop closes it and returns focus to the button. The
 * sheet's stacking order is `--lufia-overlay-z`, which an app raises to clear a fixed dock or bar of its own.
 */
export function MoreActions({
  label,
  items,
  align = "end",
  size = "md",
  variant = "ghost",
  icon,
  presentation = "popover",
  defaultOpen = false,
  narrowOnlyScope = "viewport",
  className,
  ...rest
}: MoreActionsProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [flipped, setFlipped] = useState(false);
  const [side, setSide] = useState<"bottom" | "top">("bottom");
  const [host, setHost] = useState<HTMLElement | null>(null);
  const skipFocus = useRef(defaultOpen);
  const [initial, setInitial] = useState<"first" | "last">("first");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", timer: 0 });
  const sheetRef = useRef<HTMLDivElement>(null);
  const pendingSelect = useRef<(() => void) | undefined>(undefined);
  const menuId = useId();

  // False on the server and during hydration: a portal cannot be rendered there.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const narrow = useMediaQuery(SHEET_QUERY);
  const sheet = presentation === "sheet" || (presentation === "auto" && narrow);

  const close = () => setOpen(false);
  // A popover is portalled out of the root once mounted, so a press on the menu must count as inside.
  const floating = open && !sheet && mounted;
  // A sheet lives outside `rootRef`, so an outside-press listener would treat its own items as outside: the sheet has its
  // own backdrop and trap instead.
  useDismiss(open && !sheet, close, rootRef, triggerRef, menuRef);
  useFocusTrap(open && sheet && mounted, sheetRef, {
    onEscape: close,
    initialFocus: "container",
    inertBackground: true,
  });
  useBodyScrollLock(open && sheet && mounted);

  // Items that are shown right now and can take focus. Layout decides, because some items are hidden by CSS on wide pages.
  // Disabled items stay in the list: they are focusable and readable (APG), they just cannot be activated.
  const focusable = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []).filter(
      (el) => el.getClientRects().length > 0,
    );

  useEffect(() => {
    // Not before mount: the first pass of a hydrating tree must not consume the skip below.
    // A popover waits for its portal host: the menu is not rendered until the layout effect below has chosen one.
    if (!open || !mounted || !menuRef.current) return;
    // A sheet is modal and always moves focus in, `defaultOpen` included; a popover left open for documentation does not.
    if (skipFocus.current) {
      skipFocus.current = false;
      if (!sheet) return;
    }
    const list = focusable();
    (initial === "last" ? list[list.length - 1] : list[0])?.focus();
    // `sheet` is a dependency so that crossing the breakpoint while open moves focus into the new presentation.
  }, [open, initial, sheet, mounted, host]);

  // The popover leaves the root for `document.body` (or the open modal it sits in), so no ancestor's `overflow` can clip it.
  useLayoutEffect(() => {
    if (!floating) return;
    setHost(rootRef.current?.closest<HTMLElement>(MODAL_HOST) ?? document.body);
  }, [floating]);

  // Positions the menu from the trigger's box, before paint and again on scroll (of any ancestor) and resize, at most once a
  // frame. It lines up with the aligned edge unless that runs past the viewport and the other edge fits; it opens below
  // unless there is not room and there is more above; and it never grows taller than the room it has. It closes when the
  // trigger is hidden or scrolled out of sight. The container width is applied to the menu before measuring, and before the
  // focus effect runs, so the entries that width reveals are counted.
  useLayoutEffect(() => {
    if (!floating || !host) return;
    const root = rootRef.current;
    const menuAtStart = menuRef.current;
    if (root && menuAtStart) inheritContext(root, menuAtStart, host);
    // Without a layout engine (a test DOM) nothing has a box: the hidden and scrolled-away checks would close the menu at
    // once, so they apply only when the trigger had layout as the menu opened.
    const hadLayout = (triggerRef.current?.getClientRects().length ?? 0) > 0;
    const place = () => {
      const menu = menuRef.current;
      const trigger = triggerRef.current;
      if (!menu || !trigger || !root) return;
      const anchor = trigger.getBoundingClientRect();
      // Closed without moving focus: the trigger cannot take it, and a menu left on screen would float with nothing to hang from.
      if (hadLayout && (trigger.getClientRects().length === 0 || isScrolledAway(anchor, trigger)))
        return setOpen(false);
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const gap = rem * 0.5;
      menu.toggleAttribute("data-container-narrow", containerIsNarrow(root, rem) ?? false);
      // Measured at the origin with no height cap, so the natural size decides; the list keeps its scroll position.
      const scrolled = menu.scrollTop;
      menu.style.maxBlockSize = "";
      menu.style.left = "0px";
      menu.style.top = "0px";
      const box = menu.getBoundingClientRect();
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      if (box.width === 0) return;
      const rtl = getComputedStyle(trigger).direction === "rtl";
      const leftFor = (edge: "start" | "end") =>
        (edge === "end") !== rtl ? anchor.right - box.width : anchor.left;
      const fits = (left: number) => left >= 0 && left + box.width <= width;
      let edge = align;
      let left = leftFor(edge);
      if (!fits(left)) {
        const other = align === "end" ? "start" : "end";
        if (fits(leftFor(other))) {
          edge = other;
          left = leftFor(other);
        } else left = Math.min(Math.max(left, 0), Math.max(width - box.width, 0));
      }
      const below = height - anchor.bottom - gap - gap;
      const above = anchor.top - gap - gap;
      const up = box.height > below && above > below;
      const room = Math.max(up ? above : below, 0);
      if (box.height > room) menu.style.maxBlockSize = `${room}px`;
      const used = Math.min(box.height, room);
      menu.style.left = `${left}px`;
      menu.style.top = `${up ? anchor.top - gap - used : anchor.bottom + gap}px`;
      menu.scrollTop = scrolled;
      setFlipped(edge !== align);
      setSide(up ? "top" : "bottom");
    };
    place();
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      // lufia-motion-allow reduced-motion: the frame only throttles layout reads; nothing animates.
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    };
    const onScroll = (event: Event) => {
      // A list that scrolls inside the menu does not move the trigger.
      if (event.target instanceof Node && menuRef.current?.contains(event.target)) return;
      schedule();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", schedule);
    };
  }, [floating, host, align]);

  // A sheet's action runs once the sheet is gone and focus is back on the button, so a dialog it opens returns here.
  useEffect(() => {
    if (open || !pendingSelect.current) return;
    const run = pendingSelect.current;
    pendingSelect.current = undefined;
    run();
  }, [open]);

  useEffect(() => {
    const state = typed.current;
    return () => window.clearTimeout(state.timer);
  }, []);

  const openAt = (where: "first" | "last") => {
    setFlipped(false);
    setSide("bottom");
    setInitial(where);
    setOpen(true);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openAt("first");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openAt("last");
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const list = focusable();
    if (list.length === 0) return;
    const at = list.indexOf(document.activeElement as HTMLElement);
    const go = (index: number) => {
      event.preventDefault();
      list[(index + list.length) % list.length]?.focus();
    };
    if (event.key === "ArrowDown") return go(at + 1);
    if (event.key === "ArrowUp") return go(at - 1);
    if (event.key === "Home") return go(0);
    if (event.key === "End") return go(list.length - 1);
    if (event.key === "Tab" && sheet) {
      // The page behind is inert, so Tab stays among the items. The trap's own Tab handling (made for tabbable content, and the
      // items are not tabbable) would send focus to the sheet itself, so it must not see this key.
      event.stopPropagation();
      return go(at + (event.shiftKey ? -1 : 1));
    }
    if (event.key === "Tab") {
      // Focus goes back to the button first, so the Tab that follows moves on from it and the order stays predictable.
      triggerRef.current?.focus();
      return close();
    }
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.key === " ") return;
    // Typeahead: a growing prefix, forgotten after a pause. The same letter repeated cycles through that letter's items.
    event.preventDefault();
    const state = typed.current;
    window.clearTimeout(state.timer);
    state.text += event.key.toLowerCase();
    state.timer = window.setTimeout(() => (state.text = ""), TYPEAHEAD_RESET_MS);
    const cycling = state.text.split("").every((char) => char === state.text[0]);
    const prefix = cycling ? state.text[0]! : state.text;
    const start = cycling ? at + 1 : Math.max(at, 0);
    const ordered = [...list.slice(start), ...list.slice(0, start)];
    ordered.find((el) => el.textContent?.trim().toLowerCase().startsWith(prefix))?.focus();
  };

  const select = (item: MoreActionItem) => {
    close();
    if (sheet) {
      // The button is inert while the sheet is open and cannot take focus yet; the effect above runs the action later.
      pendingSelect.current = item.onSelect;
      return;
    }
    // The menu unmounts on selection; hand focus back first so a dialog opened by the action returns here when it closes.
    triggerRef.current?.focus();
    item.onSelect?.();
  };

  if (items.length === 0) return null;
  const resolved = flipped ? (align === "end" ? "start" : "end") : align;
  const hasIcons = items.some((item) => item.icon);
  const entries = items.map((item, index) => {
    const hinted = item.hint !== undefined && item.hint !== "";
    const hintId = `${menuId}-hint-${index}`;
    const props = {
      ...item.attributes,
      role: "menuitem",
      title: hinted ? item.hint : undefined,
      "aria-describedby": hinted ? hintId : undefined,
      tabIndex: -1,
      className: styles.item,
      "data-tone": item.tone === "danger" ? "danger" : undefined,
      "aria-disabled": item.disabled || undefined,
    };
    // Items without an icon keep an empty slot when others have one, so every label starts on the same line.
    const content = (
      <>
        {hasIcons ? (
          <span className={styles.icon} aria-hidden="true">
            {item.icon}
          </span>
        ) : null}
        <span className={styles.text}>
          <span>{item.label}</span>
          {item.description ? <span className={styles.description}>{item.description}</span> : null}
        </span>
      </>
    );
    return (
      <li
        key={item.key}
        role="none"
        className={styles.entry}
        data-narrow-only={item.narrowOnly || undefined}
        data-narrow-scope={narrowOnlyScope}
      >
        {item.href !== undefined ? (
          <LufiaLink
            {...props}
            href={item.href}
            onClick={(event) => {
              if (item.disabled) return event.preventDefault();
              select(item);
            }}
          >
            {content}
          </LufiaLink>
        ) : (
          <button
            {...props}
            type="button"
            onClick={() => {
              if (!item.disabled) select(item);
            }}
          >
            {content}
          </button>
        )}
        {hinted ? (
          <VisuallyHidden id={hintId} hidden>
            {item.hint}
          </VisuallyHidden>
        ) : null}
      </li>
    );
  });
  // The menu itself is not focusable; focus lives on its items and key events bubble up to here.
  const list = (className: string | undefined, placement?: Record<`data-${string}`, string | undefined>) => (
    <ul
      ref={menuRef}
      id={menuId}
      role="menu"
      aria-label={label}
      className={className}
      {...placement}
      onKeyDown={onMenuKeyDown}
    >
      {entries}
    </ul>
  );
  return (
    <div
      {...rest}
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-align={resolved}
      data-presentation={sheet ? "sheet" : "popover"}
      data-narrow-only={items.every((item) => item.narrowOnly) || undefined}
      data-narrow-scope={narrowOnlyScope}
    >
      <IconButton
        ref={triggerRef}
        icon={icon ?? <MoreIcon />}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        variant={variant}
        size={size}
        onClick={() => (open ? close() : openAt("first"))}
        onKeyDown={onTriggerKeyDown}
      />
      {open && !sheet && !mounted ? list(styles.menu) : null}
      {floating && host
        ? createPortal(
            list(`${styles.menu} ${styles.floating}`, {
              "data-align": resolved,
              "data-side": side,
            }),
            host,
          )
        : null}
      {open && sheet && mounted
        ? createPortal(
            <div className={styles.layer} data-lufia-part="layer">
              <div className={styles.backdrop} aria-hidden="true" onClick={close} />
              <div ref={sheetRef} className={styles.sheet} tabIndex={-1} data-lufia-part="sheet">
                <div className={styles.heading} aria-hidden="true">
                  {label}
                </div>
                {list(styles.sheetList)}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
