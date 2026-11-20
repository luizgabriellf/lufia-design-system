"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { inheritContext, portalHost } from "../internal/portalContext";
import { placePanel } from "../internal/useAnchoredPosition";
import type { Side } from "../internal/placement";
import { usePresence } from "../internal/usePresence";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./Tooltip.module.css";

/** Pointer hover waits this long before the tooltip shows, so sweeping across a toolbar or rail does not flicker. */
export const TOOLTIP_DELAY_MS = 250;
/** Time to move the pointer from the trigger onto the tooltip without it going away (WCAG 1.4.13, hoverable). */
const LEAVE_GRACE_MS = 120;

const subscribeNothing = () => () => {};

/** How the control relates to the tooltip text: a description, its only name, or nothing (the tooltip is decorative). */
export type TooltipRelation = "describedby" | "labelledby" | "none";

export type TooltipHandlers = {
  onPointerEnter: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onBlur: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

export type TooltipTrigger = TooltipHandlers & {
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
};

export type UseTooltipOptions = {
  content: ReactNode;
  /** When false the tooltip never shows and nothing is rendered. */
  enabled?: boolean;
  /** The side of the trigger it opens on; it flips to the opposite side when it does not fit. */
  side?: Side;
  relation?: TooltipRelation;
  delay?: number;
};

/**
 * The behaviour behind `Tooltip` and the rail tooltip of `AppShell`. Spread `trigger` on the control and render `tooltip`
 * beside it (it portals to `document.body`, so a scrolling or clipping ancestor never cuts it off).
 *
 * It shows on mouse and pen hover after `delay` and on keyboard focus, never on a touch hover (a tap would leave it
 * stuck), and goes away on Escape, on leaving, on blur and on scroll; it stays while the pointer is over it. With
 * `relation` `none` the portaled node is `aria-hidden`, for a control that already carries the same text as its name.
 */
export function useTooltip({
  content,
  enabled = true,
  side = "top",
  relation = "describedby",
  delay = TOOLTIP_DELAY_MS,
}: UseTooltipOptions) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
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
    setAnchor(null);
  }, [clear]);

  const visible = enabled && anchor !== null;
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const presence = usePresence(visible, tooltipRef);
  // The control it hung from, so it can fade out in place after `anchor` is cleared.
  const [lastAnchor, setLastAnchor] = useState<HTMLElement | null>(null);
  if (anchor !== null && anchor !== lastAnchor) setLastAnchor(anchor);
  const shown = anchor ?? lastAnchor;
  const mounted = presence.phase !== "unmounted" && client && shown !== null && shown.isConnected;
  const host = mounted ? portalHost(shown) : null;

  // Placed before paint; it leaves on scroll, so one measurement is enough.
  useLayoutEffect(() => {
    if (!anchor || !host || !tooltipRef.current) return;
    inheritContext(anchor, tooltipRef.current, host);
    placePanel(tooltipRef.current, anchor, { side, align: "center", gap: 0.5, margin: 0.5 });
  }, [anchor, host, side, presence.phase]);

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

  const handlers: TooltipHandlers = {
    onPointerEnter(event) {
      if (!enabled || event.pointerType === "touch") return;
      clear();
      const element = event.currentTarget;
      timer.current = setTimeout(() => setAnchor(element), delay);
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
      if (keyboard) {
        clear();
        setAnchor(element);
      }
    },
    onBlur: hide,
    onKeyDown(event) {
      if (event.key === "Escape") hide();
    },
  };
  const trigger: TooltipTrigger = { ...handlers };
  if (enabled && relation === "describedby" && host) trigger["aria-describedby"] = id;
  if (enabled && relation === "labelledby") trigger["aria-labelledby"] = `${id}-label`;

  const tooltip: ReactNode = (
    <>
      {enabled && relation === "labelledby" ? (
        <VisuallyHidden id={`${id}-label`}>{content}</VisuallyHidden>
      ) : null}
      {host
        ? createPortal(
            <span
              ref={tooltipRef}
              id={id}
              role="tooltip"
              // Sighted people only when the control already carries this text as its name: a portaled node outside a
              // landmark would be announced twice and flagged as content outside the landmarks.
              aria-hidden={relation === "describedby" ? undefined : "true"}
              className={styles.tooltip}
              data-state={presence.phase === "open" ? "open" : "closed"}
              onPointerEnter={clear}
              onPointerLeave={hide}
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) presence.finish();
              }}
            >
              {content}
            </span>,
            host,
          )
        : null}
    </>
  );

  return { trigger, tooltip };
}
