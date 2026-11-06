"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { IconButton } from "../IconButton";
import { LufiaLink } from "../LufiaProvider";
import { useDismiss } from "../useDismiss";
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
  /** Renders the menu open on first paint, without moving focus. For documentation and tests; people open it themselves. */
  defaultOpen?: boolean;
};

const TYPEAHEAD_RESET_MS = 500;

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
 */
export function MoreActions({
  label,
  items,
  align = "end",
  size = "md",
  variant = "ghost",
  icon,
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
  const menuId = useId();

  const close = () => setOpen(false);
  useDismiss(open, close, rootRef, triggerRef);

  // Items that are shown right now and can take focus. Layout decides, because some items are hidden by CSS on wide pages.
  // Disabled items stay in the list: they are focusable and readable (APG), they just cannot be activated.
  const focusable = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []).filter(
      (el) => el.getClientRects().length > 0,
    );

  useEffect(() => {
    if (!open) return;
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    const list = focusable();
    (initial === "last" ? list[list.length - 1] : list[0])?.focus();
  }, [open, initial]);

  // Checked once when the menu opens: if it runs past the viewport on the aligned side, line it up with the other edge.
  useLayoutEffect(() => {
    if (!open) return;
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
    // The menu unmounts on selection; hand focus back first so a dialog opened by the action returns here when it closes.
    triggerRef.current?.focus();
    item.onSelect?.();
  };

  if (items.length === 0) return null;
  const resolved = flipped ? (align === "end" ? "start" : "end") : align;
  return (
    <div
      {...rest}
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-align={resolved}
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
      {open ? (
        // The menu itself is not focusable; focus lives on its items and key events bubble up to here.
        <ul
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          className={styles.menu}
          onKeyDown={onMenuKeyDown}
        >
          {items.map((item) => {
            const props = {
              role: "menuitem",
              tabIndex: -1,
              className: styles.item,
              "data-tone": item.tone === "danger" ? "danger" : undefined,
              "aria-disabled": item.disabled || undefined,
            };
            const content = (
              <>
                {item.icon ? (
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
              >
                {item.href !== undefined ? (
                  <LufiaLink
                    {...props}
                    href={item.href}
                    onClick={(event) => {
                      if (item.disabled) return event.preventDefault();
                      close();
                      triggerRef.current?.focus();
                      item.onSelect?.();
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
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
