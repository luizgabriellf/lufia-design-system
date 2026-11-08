"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

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
 * `threshold` changes when a release dismisses (see `SheetDragThreshold`); the defaults suit a navigation sheet.
 */
export function useSheetDrag(onDismiss: () => void, enabled = true, threshold?: SheetDragThreshold) {
  const gesture = useRef<Gesture | null>(null);

  const panelOf = (event: ReactPointerEvent<HTMLElement>) =>
    event.currentTarget.closest<HTMLElement>('[role="dialog"], dialog');

  const finish = (element: HTMLElement | null, dismiss: boolean) => {
    gesture.current = null;
    if (element) finishSheetDrag(element, dismiss, onDismiss);
  };

  return {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      if (!enabled || gesture.current) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      // The close button and any link in the header keep their own click.
      if ((event.target as Element).closest("button, a, input, select, textarea")) return;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      gesture.current = {
        id: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY,
        lastTime: performance.now(),
        velocity: 0,
        moved: false,
      };
    },
    onPointerMove(event: ReactPointerEvent<HTMLElement>) {
      const current = gesture.current;
      const element = panelOf(event);
      if (!current || !element || event.pointerId !== current.id) return;
      const offset = Math.max(0, event.clientY - current.startY);
      if (!current.moved && offset < SLOP) return;
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
      finish(
        element,
        current.moved &&
          dragDismisses(offset, current.velocity, element.getBoundingClientRect().height, threshold),
      );
    },
    onPointerCancel(event: ReactPointerEvent<HTMLElement>) {
      if (gesture.current && event.pointerId === gesture.current.id) finish(panelOf(event), false);
    },
  };
}
