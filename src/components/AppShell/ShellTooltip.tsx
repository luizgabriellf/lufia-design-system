"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./ShellTooltip.module.css";

/** Pointer hover waits this long before the tooltip shows, so sweeping across the rail does not flicker. */
const HOVER_DELAY_MS = 250;
/** Time to move the pointer from the trigger onto the tooltip without it going away (WCAG 1.4.13, hoverable). */
const LEAVE_GRACE_MS = 120;
const GAP_PX = 8;

type Placement = { top: number; inlineStart: number };

const subscribeNothing = () => () => {};

export type ShellTooltipTrigger = {
  onPointerEnter: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onBlur: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

/**
 * A tooltip for the sidebar rail, where the label is hidden and an icon alone is not enough. Spread `trigger` on the
 * control and render `tooltip` anywhere beside it (it portals to `document.body`, so a scrolling or clipping navigation
 * never cuts it off).
 *
 * It is a sighted-person aid and `aria-hidden`: the control keeps its own accessible name, so nothing is announced twice. It shows on
 * mouse and pen hover after a short delay and on keyboard focus, never on touch (a tap would leave it stuck), and it
 * goes away on Escape, on leaving, on blur and on scroll, and stays while the pointer is over it. Only opacity animates.
 */
export function useShellTooltip(label: string, enabled: boolean) {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const client = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const hide = useCallback(() => {
    clear();
    setPlacement(null);
  }, [clear]);
  const show = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const rtl = getComputedStyle(element).direction === "rtl";
    setPlacement({
      top: rect.top + rect.height / 2,
      inlineStart: rtl ? document.documentElement.clientWidth - rect.left + GAP_PX : rect.right + GAP_PX,
    });
  }, []);

  const visible = enabled && placement !== null;
  // Escape closes it without moving focus; a scroll moves the trigger away from where it was measured.
  useEffect(() => {
    if (!visible) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", hide, { capture: true, passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", hide, { capture: true });
    };
  }, [visible, hide]);
  useEffect(() => clear, [clear]);

  const trigger: ShellTooltipTrigger = {
    onPointerEnter(event) {
      if (!enabled || event.pointerType === "touch") return;
      clear();
      const element = event.currentTarget;
      timer.current = setTimeout(() => show(element), HOVER_DELAY_MS);
    },
    onPointerLeave() {
      clear();
      timer.current = setTimeout(hide, LEAVE_GRACE_MS);
    },
    onFocus(event) {
      if (!enabled) return;
      const element = event.currentTarget;
      let keyboard = true;
      try {
        keyboard = element.matches(":focus-visible");
      } catch {
        // A browser without :focus-visible: focus is shown.
      }
      if (keyboard) show(element);
    },
    onBlur: hide,
    onKeyDown(event) {
      if (event.key === "Escape") hide();
    },
  };

  const tooltip: ReactNode =
    visible && client
      ? createPortal(
          <span
            role="tooltip"
            // Sighted people only: the control already carries this text as its name, and a portaled node outside a
            // landmark would be announced twice and flagged as content outside the landmarks.
            aria-hidden="true"
            className={styles.tooltip}
            style={{ insetBlockStart: placement.top, insetInlineStart: placement.inlineStart }}
            onPointerEnter={clear}
            onPointerLeave={hide}
          >
            {label}
          </span>,
          document.body,
        )
      : null;

  return { trigger, tooltip };
}
