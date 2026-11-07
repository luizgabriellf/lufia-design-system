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
  /** Renders the menu open on first paint. For documentation and tests; people open it themselves. A popover opens without moving focus; a sheet is modal, so it always moves focus to its first item. */
  defaultOpen?: boolean;
};

const TYPEAHEAD_RESET_MS = 500;
const SHEET_QUERY = "(width < 60rem)";

function DotsIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1.125rem" height="1.125rem" fill="currentColor" focusable="false">
      <circle cx="3" cy="8" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="13" cy="8" r="1.4" />
    </svg>
  );
}

/**
 * An overflow menu: a button that opens a list of actions. It follows the WAI-ARIA menu button pattern, with a roving
 * focus that arrow keys, Home, End and typeahead move through. Escape and a press outside close it through `useDismiss`,
 * which also keeps the layer order right when the menu sits inside a dialog.
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
  className,
  ...rest
}: MoreActionsProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [flipped, setFlipped] = useState(false);
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
  // A sheet lives outside `rootRef`, so an outside-press listener would treat its own items as outside: the sheet has its
  // own backdrop and trap instead.
  useDismiss(open && !sheet, close, rootRef, triggerRef);
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
    if (!open || !mounted) return;
    // A sheet is modal and always moves focus in, `defaultOpen` included; a popover left open for documentation does not.
    if (skipFocus.current) {
      skipFocus.current = false;
      if (!sheet) return;
    }
    const list = focusable();
    (initial === "last" ? list[list.length - 1] : list[0])?.focus();
    // `sheet` is a dependency so that crossing the breakpoint while open moves focus into the new presentation.
  }, [open, initial, sheet, mounted]);

  // Checked once when the menu opens: if it runs past the viewport on the aligned side, line it up with the other edge.
  useLayoutEffect(() => {
    if (!open || sheet) return;
    const menu = menuRef.current;
    const trigger = triggerRef.current;
    if (!menu || !trigger) return;
    const box = menu.getBoundingClientRect();
    const anchor = trigger.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    if (box.width === 0 || (box.left >= 0 && box.right <= viewport)) return;
    // The other alignment puts the menu's edge on the opposite edge of the trigger.
    const other =
      box.left < 0
        ? { left: anchor.left, right: anchor.left + box.width }
        : { left: anchor.right - box.width, right: anchor.right };
    // Measuring the laid-out menu and correcting its side before paint is what a layout effect is for.
    if (other.left >= 0 && other.right <= viewport) setFlipped(true);
  }, [open, sheet]);

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
  const entries = items.map((item) => {
    const hinted = item.hint !== undefined && item.hint !== "";
    const hintId = `${menuId}-hint-${item.key}`;
    const props = {
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
      <li key={item.key} role="none" className={styles.entry} data-narrow-only={item.narrowOnly || undefined}>
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
        {hinted ? <VisuallyHidden id={hintId}>{item.hint}</VisuallyHidden> : null}
      </li>
    );
  });
  // The menu itself is not focusable; focus lives on its items and key events bubble up to here.
  const list = (className: string | undefined) => (
    <ul
      ref={menuRef}
      id={menuId}
      role="menu"
      aria-label={label}
      className={className}
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
    >
      <IconButton
        ref={triggerRef}
        icon={icon ?? <DotsIcon />}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        variant={variant}
        size={size}
        onClick={() => (open ? close() : openAt("first"))}
        onKeyDown={onTriggerKeyDown}
      />
      {open && !sheet ? list(styles.menu) : null}
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
