"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "../../motion";
import { Button } from "../Button";
import { CloseIcon } from "../Icon/icons";
import { IconButton } from "../IconButton";
import { clearPanelPlacement, placePanel } from "../internal/useAnchoredPosition";
import { inheritContext, portalHost } from "../internal/portalContext";
import type { Side } from "../internal/placement";
import { usePresence } from "../internal/usePresence";
import { isTopLayer, pushLayer, removeLayer } from "../useFocusTrap/layerStack";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./Tour.module.css";

export type TourStep = {
  /**
   * What the step points at: a CSS selector (the first visible match is used) or a ref. Without one, or when nothing
   * visible matches, the step is a card in the middle of the screen. The target is looked up again on every frame, so a
   * step whose target appears later moves to it.
   */
  target?: string | RefObject<Element | null>;
  title: ReactNode;
  body: ReactNode;
  /** Which side of the target the card opens on. It flips to the opposite side when it does not fit. Default `bottom`. */
  placement?: Side;
};

export type TourLabels = {
  next: string;
  back: string;
  /** Leaves the tour from any step but the last. */
  skip: string;
  /** Accessible name of the close button. */
  close: string;
  /** The action of the last step, in place of `next`. */
  finish: string;
  /** The step counter, such as "Step 2 of 5". Shown on the card and announced politely when the step changes. */
  stepOf: (current: number, total: number) => string;
};

/** Why `onClose` was called: the skip button, the close button, or the Escape key. */
export type TourCloseReason = "skip" | "close" | "escape";

export type TourProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "role" | "title"> & {
  steps: readonly TourStep[];
  /** Whether the tour is showing. The app decides when it starts and remembers that it was seen. */
  open: boolean;
  /** The current step, zero-based. Controlled; pair it with `onStepChange`. */
  stepIndex?: number;
  /** The step a tour that manages its own state starts on each time it opens. Default `0`. */
  defaultStepIndex?: number;
  /** Called with the next step when the buttons or the arrow keys move. */
  onStepChange?: (index: number) => void;
  /** Called when the person leaves early. The tour does not close itself: set `open` to `false`. */
  onClose?: (reason: TourCloseReason) => void;
  /** Called when the person finishes the last step. Set `open` to `false` here. */
  onFinish?: () => void;
  labels: TourLabels;
  /** Space between the target and the edge of the spotlight, in pixels. Default `6`. */
  spotlightPadding?: number;
};

/** Below this width (in rem) the card is a sheet docked to the bottom or top edge instead of floating by the target. */
const NARROW_REM = 40;
const SHEET_GAP = 12;

const isShown = (element: Element) => {
  if (element.getClientRects().length === 0) return false;
  const style = getComputedStyle(element);
  return style.visibility !== "hidden" && style.display !== "none";
};

/** The element a step points at, or `null` when there is none or it is not visible. */
function resolveTarget(target: TourStep["target"]): Element | null {
  if (!target) return null;
  if (typeof target !== "string") {
    const element = target.current;
    return element && element.isConnected && isShown(element) ? element : null;
  }
  try {
    return Array.from(document.querySelectorAll(target)).find(isShown) ?? null;
  } catch {
    // An invalid selector is a missing target, not a crash in the middle of a render.
    return null;
  }
}

/** The element that scrolls `element`: a scrollable ancestor, else the page. */
function scrollParent(element: Element): Element {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight)
      return node;
  }
  return document.scrollingElement ?? document.documentElement;
}

/** Brings the target into view, and clear of the card when the card is a sheet. Does nothing when it is already placed. */
function revealTarget(target: Element | null, card: HTMLElement | null, smooth: boolean) {
  if (!target || !target.isConnected) return;
  const behavior: ScrollBehavior = smooth ? "smooth" : "auto";
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  const rect = target.getBoundingClientRect();
  if (width <= NARROW_REM * rem) {
    const limit = height - (card?.offsetHeight ?? 0) - SHEET_GAP;
    const top = SHEET_GAP;
    const delta =
      rect.top < top
        ? rect.top - top
        : rect.bottom > limit
          ? Math.min(rect.bottom - limit, rect.top - top)
          : 0;
    if (delta) scrollParent(target).scrollBy({ top: delta, behavior });
  } else if (rect.top < 0 || rect.bottom > height || rect.left < 0 || rect.right > width) {
    if (typeof target.scrollIntoView === "function")
      target.scrollIntoView({ block: "center", inline: "nearest", behavior });
  }
}

type LayoutParts = { layer: HTMLElement; card: HTMLElement; spot: HTMLElement };

/**
 * Puts the spotlight on the target and the card next to it (or in the middle, or docked as a sheet on narrow screens),
 * writing straight to the DOM so a frame loop can run it without rendering. Returns a signature of what it measured: when
 * the next frame measures the same, nothing has moved and there is nothing to write.
 */
function layoutTour(
  { layer, card, spot }: LayoutParts,
  target: Element | null,
  placement: Side,
  padding: number,
  previous: string,
): string {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  const rect = target ? target.getBoundingClientRect() : null;
  const signature = [
    rect ? [rect.left, rect.top, rect.width, rect.height].join(" ") : "none",
    width,
    height,
    card.offsetWidth,
    card.offsetHeight,
    placement,
    padding,
  ].join(",");
  if (signature === previous) return previous;
  if (rect) {
    spot.style.transform = `translate(${rect.left - padding}px, ${rect.top - padding}px)`;
    spot.style.inlineSize = `${rect.width + 2 * padding}px`;
    spot.style.blockSize = `${rect.height + 2 * padding}px`;
  }
  layer.setAttribute("data-target", rect ? "true" : "false");
  if (width <= NARROW_REM * rem) {
    clearPanelPlacement(card);
    const covered = rect !== null && rect.bottom > height - card.offsetHeight - SHEET_GAP;
    card.setAttribute("data-kind", "sheet");
    card.setAttribute("data-edge", covered ? "top" : "bottom");
  } else if (target) {
    card.setAttribute("data-kind", "float");
    card.removeAttribute("data-edge");
    // The gap clears the spotlight's padding as well.
    placePanel(card, target, { side: placement, align: "center", gap: 0.5 + padding / rem });
  } else {
    clearPanelPlacement(card);
    card.setAttribute("data-kind", "center");
    card.removeAttribute("data-edge");
  }
  return signature;
}

/**
 * A guided tour: a card that walks through `steps`, with a spotlight on each step's target. It is non-modal: the spotlight
 * only dims the page, it does not block it, so the person can use the highlighted control (or any other) while the card
 * stays. Nothing is made inert and scroll is not locked.
 *
 * The card follows its target on scroll, resize and layout changes, scrolls it into view when it is off screen, and becomes a
 * centred card when the target is missing or hidden. Below 40rem it is a sheet docked to the bottom edge (the top edge when
 * the target would be under it) and the target is scrolled clear of it. When the target is inside an open modal, the tour is
 * portalled into that modal, so the modal's inert page does not lock it out.
 *
 * The component keeps no record of what was seen: the app decides when to open it and stores the outcome from `onFinish` and
 * `onClose`.
 */
export function Tour({
  steps,
  open,
  stepIndex,
  defaultStepIndex = 0,
  onStepChange,
  onClose,
  onFinish,
  labels,
  spotlightPadding = 6,
  className,
  onKeyDown,
  onFocus,
  onBlur,
  onAnimationEnd,
  ...rest
}: TourProps) {
  const [inner, setInner] = useState(defaultStepIndex);
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  const layerRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hostRef = useRef<HTMLElement | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const focusInside = useRef(false);
  const closeRef = useRef(onClose);
  const ids = useId();
  const reduced = usePrefersReducedMotion();

  // False on the server and during hydration: a portal cannot be rendered there.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const showing = open && steps.length > 0;
  const { phase, finish } = usePresence(showing, cardRef);
  const present = phase !== "unmounted";
  // A tour that manages its own step starts over the next time it opens, once the last one has left the screen.
  if (!present && stepIndex === undefined && inner !== defaultStepIndex) setInner(defaultStepIndex);

  const last = steps.length - 1;
  const current = Math.min(Math.max(stepIndex ?? inner, 0), Math.max(last, 0));
  const step = steps[current];
  const target = step?.target;
  const placement = step?.placement ?? "bottom";
  const atLast = current >= last;

  // Where the tour is portalled: the open modal that holds the target, else the body. Looked up again when it changes.
  const host = present && mounted ? portalHost(resolveTarget(target) ?? document.body) : null;

  useEffect(() => {
    closeRef.current = onClose;
  });

  // Registers on the shared overlay stack, so Escape reaches the topmost layer only: a menu opened from the page closes
  // first and the tour on the next press. Escape is the tour's only when focus is on the card or nowhere in particular; in a
  // field of the page it belongs to the field.
  useEffect(() => {
    if (!showing) return;
    const layer = pushLayer();
    const onEscape = (event: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || !isTopLayer(layer)) return;
      const active = document.activeElement;
      if (active && active !== document.body && !cardRef.current?.contains(active)) return;
      event.preventDefault();
      closeRef.current?.("escape");
    };
    document.addEventListener("keydown", onEscape);
    return () => {
      removeLayer(layer);
      document.removeEventListener("keydown", onEscape);
    };
  }, [showing]);

  useLayoutEffect(() => {
    hostRef.current = host;
  });

  // The element that had focus when the tour opened, so closing can hand it back.
  useEffect(() => {
    if (showing)
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }, [showing]);

  // Closed while focus was on the card (or nowhere, the card having just left the DOM): back to where it was.
  useLayoutEffect(() => {
    if (showing) return;
    const inside = focusInside.current || cardRef.current?.contains(document.activeElement);
    focusInside.current = false;
    const back = opener.current;
    opener.current = null;
    if (inside && back?.isConnected) back.focus({ preventScroll: true });
  }, [showing]);

  // Each step starts on its heading, so a screen reader reads the new card. The page is not scrolled for it.
  useEffect(() => {
    if (showing && host) headingRef.current?.focus({ preventScroll: true });
  }, [showing, host, current]);

  // The theme scope, direction and inline custom properties of the target's subtree, copied onto a card that left it.
  useLayoutEffect(() => {
    const element = host ? resolveTarget(target) : null;
    if (host && element instanceof HTMLElement && layerRef.current)
      inheritContext(element, layerRef.current, host);
  }, [host, target, current]);

  // Once per step, and again after the page has settled (a scroll that was still running, a dialog that was animating in).
  useEffect(() => {
    if (!showing || !host) return;
    const reveal = () => revealTarget(resolveTarget(target), cardRef.current, !reduced);
    reveal();
    const again = window.setTimeout(reveal, 400);
    return () => window.clearTimeout(again);
  }, [showing, host, target, current, reduced]);

  // Follows the target: before paint, then every frame while the tour is on screen, so scroll, resize and animation all keep
  // the spotlight and the card on it. A frame that measures what the last one did writes nothing.
  useLayoutEffect(() => {
    if (!present || !host) return;
    let signature = "";
    const run = () => {
      const { current: layer } = layerRef;
      const { current: card } = cardRef;
      const { current: spot } = spotRef;
      if (!layer || !card || !spot) return;
      const found = resolveTarget(target);
      if (found && portalHost(found) !== hostRef.current) return rerender();
      signature = layoutTour({ layer, card, spot }, found, placement, spotlightPadding, signature);
    };
    run();
    let frame = 0;
    const loop = () => {
      run();
      // lufia-motion-allow reduced-motion: the frame only reads layout and moves the spotlight; nothing animates here.
      frame = window.requestAnimationFrame(loop);
    };
    // lufia-motion-allow reduced-motion: same loop.
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [present, host, target, placement, spotlightPadding]);

  const go = (next: number) => {
    if (next === current || next < 0 || next > last) return;
    if (stepIndex === undefined) setInner(next);
    onStepChange?.(next);
  };
  const forward = () => (atLast ? onFinish?.() : go(current + 1));

  const onCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    // Arrow keys follow the reading direction.
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    if (event.key === (rtl ? "ArrowLeft" : "ArrowRight") && !atLast) {
      // The last step is finished with its button: an arrow key never ends the tour.
      event.preventDefault();
      go(current + 1);
    } else if (event.key === (rtl ? "ArrowRight" : "ArrowLeft") && current > 0) {
      event.preventDefault();
      go(current - 1);
    }
  };

  if (!present || !host || !step) return null;
  const titleId = `${ids}-title`;
  const bodyId = `${ids}-body`;
  // Inside a modal the page is already dimmed by the modal's own backdrop.
  const dim = host === document.body;
  return createPortal(
    <div
      ref={layerRef}
      className={styles.layer}
      data-lufia-part="layer"
      data-lufia-inert-exempt=""
      data-state={phase === "open" ? "open" : "closed"}
      data-dim={dim}
    >
      <div className={styles.scrim} aria-hidden="true" />
      <div ref={spotRef} className={styles.spot} aria-hidden="true" data-lufia-part="spotlight" />
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the card owns arrow-key stepping and focus bookkeeping for what is inside it */}
      <div
        {...rest}
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className={[styles.card, className].filter(Boolean).join(" ")}
        data-state={phase === "open" ? "open" : "closed"}
        inert={phase !== "open" || undefined}
        onKeyDown={onCardKeyDown}
        onFocus={(event) => {
          focusInside.current = true;
          onFocus?.(event);
        }}
        onBlur={(event) => {
          // Only focus that lands on another element counts as leaving: a null target is the card going inert or leaving
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
        <div className={styles.header}>
          <p className={styles.count}>{labels.stepOf(current + 1, steps.length)}</p>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label={labels.close}
            icon={<CloseIcon />}
            onClick={() => onClose?.("close")}
          />
        </div>
        <div key={current} className={styles.content}>
          <h2 ref={headingRef} id={titleId} tabIndex={-1} className={styles.title}>
            {step.title}
          </h2>
          <div id={bodyId} className={styles.body}>
            {step.body}
          </div>
        </div>
        <div className={styles.actions}>
          {atLast ? null : (
            <Button variant="ghost" size="sm" onClick={() => onClose?.("skip")}>
              {labels.skip}
            </Button>
          )}
          <span className={styles.spacer} />
          {current > 0 ? (
            <Button variant="secondary" size="sm" onClick={() => go(current - 1)}>
              {labels.back}
            </Button>
          ) : null}
          <Button variant="primary" size="sm" onClick={forward}>
            {atLast ? labels.finish : labels.next}
          </Button>
        </div>
      </div>
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {labels.stepOf(current + 1, steps.length)}
      </VisuallyHidden>
    </div>,
    host,
  );
}
