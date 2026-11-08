"use client";

import {
  useRef,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

/** A quick flick (px per ms) dismisses from a shorter distance. */
export const FLICK_VELOCITY = 0.6;
export const FLICK_MIN_DISTANCE = 24;

/**
 * When a released drag dismisses a bottom sheet. A release dismisses once the sheet has moved `ratio` of its height, kept
 * between `min` and `max` pixels, or on a quick flick: at least `flickVelocity` pixels per millisecond over at least
 * `flickDistance` pixels. Every field is optional; a missing one keeps its default.
 */
export type SheetDragThreshold = {
  /** Share of the sheet's height to drag. Default `0.18`. */
  ratio?: number;
  /** Shortest distance in pixels, whatever the height. Default `64` (4rem). */
  min?: number;
  /** Longest distance in pixels, whatever the height. Default `112` (7rem). */
  max?: number;
  /** Release speed in pixels per millisecond that counts as a flick. Default `0.6`. */
  flickVelocity?: number;
  /** Shortest distance in pixels a flick has to travel. Default `24`. */
  flickDistance?: number;
};

/** The release thresholds `NavSheet` uses when it is given none. */
export const SHEET_DRAG_THRESHOLD: Required<SheetDragThreshold> = {
  ratio: 0.18,
  min: 64,
  max: 112,
  flickVelocity: FLICK_VELOCITY,
  flickDistance: FLICK_MIN_DISTANCE,
};
/** Movement before the gesture counts as a drag, so a tap on the handle stays a tap. */
const SLOP = 4;
/** A link under the finger needs more movement than the bare handle before the gesture is a drag, so a tap stays a tap. */
const LINK_SLOP = 8;
/** How long after a drag the click its release would send to a link is still swallowed, if nothing new has started. */
const CLICK_GUARD_MS = 400;

/** Whether a release at `offset` pixels (and `velocity` px per ms) dismisses a sheet `height` pixels tall. */
export function dragDismisses(
  offset: number,
  velocity: number,
  height: number,
  threshold?: SheetDragThreshold,
): boolean {
  const base = SHEET_DRAG_THRESHOLD;
  const ratio = threshold?.ratio ?? base.ratio;
  const min = threshold?.min ?? base.min;
  const max = threshold?.max ?? base.max;
  const distance = Math.min(max, Math.max(min, height * ratio));
  const flick = threshold?.flickVelocity ?? base.flickVelocity;
  return (
    offset >= distance || (velocity >= flick && offset >= (threshold?.flickDistance ?? base.flickDistance))
  );
}

/**
 * Ends a drag on `element`: clears the drag marker, then either springs back or asks the owner to close. The owner may
 * refuse (a guarded close), in which case the sheet is still open and must not stay at the dragged offset.
 */
export function finishSheetDrag(element: HTMLElement, dismiss: boolean, onDismiss: () => void) {
  delete element.dataset.dragging;
  const reset = () => element.style.setProperty("--lufia-sheet-drag", "0px");
  if (!dismiss) {
    reset();
    return;
  }
  onDismiss();
  queueMicrotask(() => {
    if (element.isConnected && element.closest('[data-state="open"]')) reset();
  });
}

type Gesture = {
  id: number;
  startY: number;
  lastY: number;
  lastTime: number;
  velocity: number;
  moved: boolean;
  /** The gesture began on a link: the pointer is captured only once it is a drag, so a plain tap still reaches the link. */
  onLink: boolean;
};

/**
 * Swipe-down-to-dismiss for a bottom sheet, on pointer events. Spread the returned handlers on the drag zone only (the
 * grabber and the header), never on the scrolling body: that keeps the list scrollable without any gesture arbitration.
 * The zone needs `touch-action: none` so the browser does not claim the gesture for scrolling or pull-to-refresh.
 *
 * While dragging, the offset is written to the `--lufia-sheet-drag` custom property on the enclosing `[role="dialog"]` (or native `dialog`) and
 * `data-dragging` is set on it;
 * the panel's CSS turns that into a `transform`. A release past the threshold, or a quick flick, calls `onDismiss` (the
 * sheet then slides the rest of the way out); anything shorter springs back. Escape and the close button remain the
 * keyboard route, so the gesture is never the only way out.
 *
 * A drag may start on a link in the header (a brand link): past a slightly larger slop the gesture becomes a drag, and the
 * click the release would send to the link is cancelled. A tap on the link, without movement, still follows it. Buttons
 * and form fields in the zone keep their own pointer.
 *
 * `threshold` changes when a release dismisses (see `SheetDragThreshold`); the defaults suit a navigation sheet.
 */
export function useSheetDrag(onDismiss: () => void, enabled = true, threshold?: SheetDragThreshold) {
  const gesture = useRef<Gesture | null>(null);
  /** Set when a drag that began on a link ends: the click that follows is not a tap and must not navigate. */
  const swallowClick = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopSwallowing = () => {
    if (swallowClick.current) clearTimeout(swallowClick.current);
    swallowClick.current = null;
  };

  const panelOf = (event: ReactPointerEvent<HTMLElement>) =>
    event.currentTarget.closest<HTMLElement>('[role="dialog"], dialog');

  const finish = (element: HTMLElement | null, dismiss: boolean) => {
    gesture.current = null;
    if (element) finishSheetDrag(element, dismiss, onDismiss);
  };

  return {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      stopSwallowing();
      if (!enabled || gesture.current) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const target = event.target as Element;
      // The close button and the fields keep their own pointer.
      if (target.closest("button, input, select, textarea, [contenteditable]")) return;
      const onLink = target.closest("a[href]") !== null;
      // Capturing at once would retarget the release, and so the click, away from a link: wait until it is a drag.
      if (!onLink) event.currentTarget.setPointerCapture?.(event.pointerId);
      gesture.current = {
        id: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY,
        lastTime: performance.now(),
        velocity: 0,
        moved: false,
        onLink,
      };
    },
    onPointerMove(event: ReactPointerEvent<HTMLElement>) {
      const current = gesture.current;
      const element = panelOf(event);
      if (!current || !element || event.pointerId !== current.id) return;
      const offset = Math.max(0, event.clientY - current.startY);
      if (!current.moved && offset < (current.onLink ? LINK_SLOP : SLOP)) return;
      if (!current.moved && current.onLink) event.currentTarget.setPointerCapture?.(event.pointerId);
      current.moved = true;
      const elapsed = performance.now() - current.lastTime;
      if (elapsed > 0) current.velocity = (event.clientY - current.lastY) / elapsed;
      current.lastY = event.clientY;
      current.lastTime = performance.now();
      element.dataset.dragging = "true";
      element.style.setProperty("--lufia-sheet-drag", `${offset}px`);
    },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) {
      const current = gesture.current;
      const element = panelOf(event);
      if (!current || !element || event.pointerId !== current.id) return;
      const offset = Math.max(0, event.clientY - current.startY);
      if (current.moved && current.onLink) {
        stopSwallowing();
        swallowClick.current = setTimeout(stopSwallowing, CLICK_GUARD_MS);
      }
      finish(
        element,
        current.moved &&
          dragDismisses(offset, current.velocity, element.getBoundingClientRect().height, threshold),
      );
    },
    onPointerCancel(event: ReactPointerEvent<HTMLElement>) {
      if (gesture.current && event.pointerId === gesture.current.id) finish(panelOf(event), false);
    },
    /** Cancels the click a drag's release sends to a link, before the link (or a router's handler) sees it. */
    onClickCapture(event: ReactMouseEvent<HTMLElement>) {
      if (!swallowClick.current) return;
      stopSwallowing();
      event.preventDefault();
      event.stopPropagation();
    },
    /** A link would start the browser's own drag (of its address) and cancel the pointer: the sheet's drag wins. */
    onDragStart(event: ReactDragEvent<HTMLElement>) {
      if (enabled) event.preventDefault();
    },
  };
}
