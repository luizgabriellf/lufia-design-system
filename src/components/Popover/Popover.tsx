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
} from "react";
import { createPortal } from "react-dom";
import { useControllableState } from "../FormField/useControllableState";
import { inheritContext, portalHost } from "../internal/portalContext";
import type { Align, Side } from "../internal/placement";
import { useAnchoredPosition } from "../internal/useAnchoredPosition";
import { usePresence } from "../internal/usePresence";
import { useDismiss } from "../useDismiss";
import styles from "./Popover.module.css";

export type PopoverTriggerProps = {
  /** Must reach the DOM element: it is what the panel hangs from and where focus returns. */
  ref: (element: HTMLElement | null) => void;
  /** Toggles the panel. */
  onClick: () => void;
  "aria-expanded": boolean;
  /** The panel's id while it is rendered. */
  "aria-controls": string | undefined;
  "aria-haspopup": "dialog";
};

export type PopoverProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "role" | "aria-label" | "aria-labelledby"
> & {
  /**
   * Renders the element that opens the panel (usually a `Button`) and spreads the given props onto it. Called on every
   * render, so keep it cheap: `trigger={(props) => <Button {...props}>Filters</Button>}`.
   */
  trigger: (props: PopoverTriggerProps) => ReactNode;
  /** The panel's content. Rendered only while the panel is open (and while it animates out). */
  children: ReactNode;
  /** Accessible name of the panel (`role="dialog"`), such as "Filters". */
  label: string;
  /** Whether the panel is open. Controlled; pair it with `onOpenChange`. */
  open?: boolean;
  /** Whether the panel starts open when `open` is not given. For documentation and tests; focus is not moved on first paint. */
  defaultOpen?: boolean;
  /** Called with the next state when the trigger, Escape or a press outside asks to change it. */
  onOpenChange?: (open: boolean) => void;
  /** Which side of the trigger the panel opens on. `start` and `end` follow the writing direction. It flips to the opposite side when it does not fit. Default `bottom`. */
  placement?: Side;
  /** How the panel lines up with the trigger along the other axis. It shifts to stay in the viewport. Default `start`. */
  align?: Align;
  /** Where focus goes when the panel opens: the first focusable element inside (`"first"`, default; the panel itself when there is none) or the panel. */
  initialFocus?: "first" | "panel";
};

const TABBABLE = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';
const tabbables = (panel: HTMLElement) =>
  Array.from(panel.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (element) => !element.matches(":disabled") && element.getClientRects().length > 0,
  );

/**
 * A non-modal panel anchored to a trigger. The panel is a `role="dialog"` with an accessible name from `label`; it does not
 * trap focus, lock scroll or make the page inert, so the page behind stays operable. Escape and a press outside close it,
 * and focus returns to the trigger when it closes from inside the panel. For a list of actions use `MoreActions`; for a
 * question that must be answered use `Modal`.
 *
 * The panel is portalled to `document.body` (or into the open modal the trigger sits in) and placed with `position: fixed`
 * from the trigger's box, so an ancestor with `overflow: hidden` cannot clip it. It flips to the opposite side and shifts to
 * stay in the viewport, scrolls inside when the room is shorter than its content, and follows the trigger on scroll and
 * resize. Until the component has mounted (server render, hydration) the panel is not rendered.
 */
export function Popover({
  trigger,
  children,
  label,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom",
  align = "start",
  initialFocus = "first",
  className,
  onKeyDown,
  onFocus,
  onBlur,
  onAnimationEnd,
  ...rest
}: PopoverProps) {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  // The trigger is held in state (set by its callback ref) so `trigger()` is handed a function that touches no ref during
  // render; `triggerRef` mirrors it for the hooks that take a ref.
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    triggerRef.current = triggerElement;
  }, [triggerElement]);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusInside = useRef(false);
  const skipFocus = useRef(open);
  const id = useId();

  // False on the server and during hydration: a portal cannot be rendered there.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { phase, finish } = usePresence(open, panelRef);
  const present = phase !== "unmounted";
  // Where the panel is portalled: known once the trigger is in the DOM, never on the server or during hydration.
  const host = present && mounted && triggerElement ? portalHost(triggerElement) : null;

  const close = useCallback(() => setOpen(false), [setOpen]);
  // Not before the trigger is known: `useDismiss` reads the element when it subscribes, so a popover that starts open would
  // otherwise subscribe with an empty ref and never hear Escape.
  useDismiss(open && triggerElement !== null, close, triggerRef, triggerRef, panelRef);

  const getAnchor = useCallback(() => triggerElement, [triggerElement]);
  useAnchoredPosition(present && host !== null, getAnchor, panelRef, { side: placement, align });

  // Copies the trigger's theme, direction and inline custom properties onto the panel, which left its subtree.
  useLayoutEffect(() => {
    if (present && host && triggerElement && panelRef.current)
      inheritContext(triggerElement, panelRef.current, host);
  }, [present, host, triggerElement]);

  useEffect(() => {
    // Not before the panel exists: the first pass of a hydrating tree must not consume the skip below.
    if (!open || !host || !panelRef.current) return;
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    const panel = panelRef.current;
    const target = initialFocus === "first" ? tabbables(panel)[0] : undefined;
    (target ?? panel).focus();
  }, [open, host, initialFocus]);

  // Closed from the outside (a controlled `open`, a button inside the panel) while focus was in the panel: the panel is about
  // to leave the DOM, so focus goes back to the trigger. A press elsewhere moved focus already and is left alone.
  useLayoutEffect(() => {
    if (open) return;
    const inside = focusInside.current || panelRef.current?.contains(document.activeElement);
    focusInside.current = false;
    if (inside) triggerRef.current?.focus();
  }, [open]);

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== "Tab") return;
    // The panel sits at the end of the body, so the browser's Tab would skip past the rest of the page. Leaving at either end
    // goes through the trigger instead, and the panel stays open until the person closes it.
    const list = tabbables(event.currentTarget);
    const active = document.activeElement;
    const first = list[0];
    const last = list[list.length - 1];
    if (event.shiftKey && (active === event.currentTarget || active === first)) {
      event.preventDefault();
      triggerRef.current?.focus();
    } else if (!event.shiftKey && (list.length === 0 || active === last)) {
      // No preventDefault: the Tab that follows moves on from the trigger.
      triggerRef.current?.focus();
    }
  };

  return (
    <>
      {trigger({
        ref: setTriggerElement,
        onClick: () => setOpen(!open),
        "aria-expanded": open,
        "aria-controls": present && host ? id : undefined,
        "aria-haspopup": "dialog",
      })}
      {present && host
        ? createPortal(
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the dialog owns Tab handling and focus bookkeeping for what is inside it
            <div
              {...rest}
              ref={panelRef}
              id={id}
              role="dialog"
              aria-label={label}
              tabIndex={-1}
              className={[styles.panel, className].filter(Boolean).join(" ")}
              data-state={phase === "open" ? "open" : "closed"}
              data-side={placement}
              inert={phase !== "open" || undefined}
              onKeyDown={onPanelKeyDown}
              onFocus={(event) => {
                focusInside.current = true;
                onFocus?.(event);
              }}
              onBlur={(event) => {
                // Only focus that lands on another element counts as leaving: a null target is the panel going inert or leaving
                // the DOM, which is exactly when focus has to be handed back.
                if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget))
                  focusInside.current = false;
                onBlur?.(event);
              }}
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) finish();
                onAnimationEnd?.(event);
              }}
            >
              {children}
            </div>,
            host,
          )
        : null}
    </>
  );
}
