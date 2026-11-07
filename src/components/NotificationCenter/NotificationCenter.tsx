"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatedNumber } from "../../motion";
import { usePresence } from "../internal/usePresence";
import { IconButton } from "../IconButton";
import type { ButtonVariant } from "../Button";
import { useBodyScrollLock } from "../useBodyScrollLock";
import { useDismiss } from "../useDismiss";
import { useFocusTrap } from "../useFocusTrap";
import { useMediaQuery } from "../useMediaQuery";
import { VisuallyHidden } from "../VisuallyHidden";
import { NotificationPanel, type NotificationContentProps } from "./NotificationPanel";
import { useUnreadAnnouncement } from "./useUnreadAnnouncement";
import styles from "./NotificationCenter.module.css";

export type NotificationCenterProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> &
  NotificationContentProps & {
    /** Open state. Controlled: pair it with `onOpenChange`. */
    open?: boolean;
    /** Initial open state when `open` is not given. For documentation and tests; people open it themselves. */
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /**
     * How the open panel is shown. `"popover"` hangs it from the bell as a non-modal dialog. `"sheet"` shows it as a modal
     * bottom sheet over a backdrop that covers the page. `"auto"` (default) is a sheet below 60rem (the `medium`
     * breakpoint) and a popover from there up.
     */
    presentation?: "auto" | "popover" | "sheet";
    /** Which edge of the bell the popover lines up with. Defaults to the end. */
    align?: "start" | "end";
    size?: "sm" | "md" | "lg";
    variant?: ButtonVariant;
    /** Replaces the default bell icon. */
    icon?: ReactNode;
    /** Counts above this show as "99+". Default 99. */
    maxCount?: number;
  };

const SHEET_QUERY = "(width < 60rem)";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.25rem" height="1.25rem" fill="none" focusable="false">
      <path
        d="M6 9.5a6 6 0 1 1 12 0c0 4.2 1.3 5.6 2 6.5H4c.7-.9 2-2.3 2-6.5ZM10 19.5a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A bell button with an unread count that opens a `NotificationPanel`: a popover hung from the bell on wide pages, a modal
 * bottom sheet on narrow ones. The popover is a non-modal dialog: focus moves into it, Escape or a press outside closes it,
 * and Escape returns focus to the bell. The sheet moves to a portal, traps focus, makes the page behind inert and closes
 * on Escape or a tap on the backdrop. The sheet's stacking order is `--lufia-overlay-z`, which an app raises to clear a
 * fixed dock or bar of its own.
 *
 * The bell's accessible name carries the count ("Notifications, 4 unread") and a polite live region announces changes of it.
 */
export function NotificationCenter({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  presentation = "auto",
  align = "end",
  size = "md",
  variant = "ghost",
  icon,
  maxCount = 99,
  className,
  // Panel content
  label,
  unreadCount,
  unreadLabel,
  unreadCountLabel,
  tabs,
  activeTab,
  defaultActiveTab,
  onTabChange,
  items,
  groups,
  summary,
  onMarkAllRead,
  markAllLabel,
  footer,
  loading,
  loadingLabel,
  empty,
  error,
  ...rest
}: NotificationCenterProps) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const [flipped, setFlipped] = useState(false);
  const skipFocus = useRef(defaultOpen);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const titleId = useId();

  // False on the server and during hydration: a portal cannot be rendered there.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const narrow = useMediaQuery(SHEET_QUERY);
  const sheet = presentation === "sheet" || (presentation === "auto" && narrow);

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInner(next);
    onOpenChange?.(next);
  };
  const close = () => setOpen(false);

  // The sheet lives outside `rootRef`, so an outside-press listener would treat its own rows as outside: it has a backdrop
  // and a trap instead.
  useDismiss(open && !sheet, close, rootRef, triggerRef);
  useFocusTrap(open && sheet && mounted, sheetRef, {
    onEscape: close,
    initialFocus: "container",
    inertBackground: true,
  });
  useBodyScrollLock(open && sheet && mounted);

  useEffect(() => {
    if (!open || sheet || !mounted) return;
    // A popover left open for documentation does not take focus; one a person opened does.
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    popoverRef.current?.focus();
  }, [open, sheet, mounted]);

  // Checked once when the popover opens: if it runs past the viewport on the aligned side, line it up with the other edge.
  useLayoutEffect(() => {
    if (!open || sheet) return;
    const popover = popoverRef.current;
    const trigger = triggerRef.current;
    if (!popover || !trigger) return;
    const box = popover.getBoundingClientRect();
    const anchor = trigger.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    if (box.width === 0 || (box.left >= 0 && box.right <= viewport)) return;
    const other =
      box.left < 0
        ? { left: anchor.left, right: anchor.left + box.width }
        : { left: anchor.right - box.width, right: anchor.right };
    // Measuring the laid-out popover and correcting its side before paint is what a layout effect is for.
    if (other.left >= 0 && other.right <= viewport) setFlipped(true);
  }, [open, sheet]);

  // The popover stays mounted while it animates out. A closing popover is inert: it takes no focus and no clicks.
  const presence = usePresence(open && !sheet, popoverRef);
  const popoverShown = presence.phase !== "unmounted" && !sheet;

  // The count pops when it changes, never on first paint: two alternating names restart the animation.
  const [shownCount, setShownCount] = useState(unreadCount);
  const [pops, setPops] = useState(0);
  if (shownCount !== unreadCount) {
    setShownCount(unreadCount);
    setPops(pops + 1);
  }

  const name = unreadCount > 0 ? `${label}, ${unreadCountLabel(unreadCount)}` : label;
  const announcement = useUnreadAnnouncement(unreadCount, (count) => `${label}, ${unreadCountLabel(count)}`);
  const capped = unreadCount > maxCount;
  const resolved = flipped ? (align === "end" ? "start" : "end") : align;

  const panel = (
    <NotificationPanel
      landmark={false}
      announce={false}
      titleId={titleId}
      label={label}
      unreadCount={unreadCount}
      unreadLabel={unreadLabel}
      unreadCountLabel={unreadCountLabel}
      tabs={tabs}
      activeTab={activeTab}
      defaultActiveTab={defaultActiveTab}
      onTabChange={onTabChange}
      items={items}
      groups={groups}
      summary={summary}
      onMarkAllRead={onMarkAllRead}
      markAllLabel={markAllLabel}
      footer={footer}
      loading={loading}
      loadingLabel={loadingLabel}
      empty={empty}
      error={error}
      onClose={sheet ? close : undefined}
      onItemActivate={close}
    />
  );

  return (
    <div
      {...rest}
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-align={resolved}
      data-presentation={sheet ? "sheet" : "popover"}
      data-lufia-part="notification-center"
    >
      <IconButton
        ref={triggerRef}
        icon={icon ?? <BellIcon />}
        aria-label={name}
        title={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        variant={variant}
        size={size}
        onClick={() => {
          setFlipped(false);
          setOpen(!open);
        }}
      />
      {unreadCount > 0 ? (
        <span
          className={styles.badge}
          aria-hidden="true"
          data-lufia-part="notification-badge"
          data-pop={pops === 0 ? undefined : pops % 2 === 0 ? "b" : "a"}
        >
          {capped ? `${maxCount}+` : <AnimatedNumber value={unreadCount} />}
        </span>
      ) : null}
      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
      {popoverShown ? (
        <div
          ref={popoverRef}
          id={dialogId}
          role="dialog"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={styles.popover}
          data-state={presence.phase === "open" ? "open" : "closed"}
          inert={presence.phase !== "open" || undefined}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) presence.finish();
          }}
          data-lufia-part="notification-popover"
        >
          {panel}
        </div>
      ) : null}
      {open && sheet && mounted
        ? createPortal(
            <div className={styles.layer} data-lufia-part="notification-layer">
              <div className={styles.backdrop} aria-hidden="true" onClick={close} />
              <div
                ref={sheetRef}
                id={dialogId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={styles.sheet}
                data-lufia-part="notification-sheet"
              >
                <span className={styles.grabber} aria-hidden="true" />
                {panel}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
