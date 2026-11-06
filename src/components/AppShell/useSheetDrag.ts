"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

/** Distance dragged down before a release dismisses the sheet: 18% of its height, kept between 4rem and 7rem. */
const MIN_THRESHOLD = 64;
const MAX_THRESHOLD = 112;
/** A quick flick (px per ms) dismisses from a shorter distance. */
const FLICK_VELOCITY = 0.6;
const FLICK_MIN_DISTANCE = 24;
/** Movement before the gesture counts as a drag, so a tap on the handle stays a tap. */
const SLOP = 4;

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
 * While dragging, the offset is written to the `--lufia-sheet-drag` custom property on the enclosing `[role="dialog"]` and
 * `data-dragging` is set on it;
 * the panel's CSS turns that into a `transform`. A release past the threshold, or a quick flick, calls `onDismiss` (the
 * sheet then slides the rest of the way out); anything shorter springs back. Escape and the close button remain the
 * keyboard route, so the gesture is never the only way out.
 */
export function useSheetDrag(onDismiss: () => void, enabled = true) {
  const gesture = useRef<Gesture | null>(null);

  const panelOf = (event: ReactPointerEvent<HTMLElement>) =>
    event.currentTarget.closest<HTMLElement>('[role="dialog"]');

  const finish = (element: HTMLElement | null, dismiss: boolean) => {
    gesture.current = null;
    if (!element) return;
    delete element.dataset.dragging;
    const reset = () => element.style.setProperty("--lufia-sheet-drag", "0px");
    if (!dismiss) {
      reset();
      return;
    }
    onDismiss();
    // The owner may refuse (a guarded close): the sheet is then still open, and must not stay stuck at the dragged offset.
    queueMicrotask(() => {
      if (element.isConnected && element.closest('[data-state="open"]')) reset();
    });
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
        lastTime: event.timeStamp,
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
      const elapsed = event.timeStamp - current.lastTime;
      if (elapsed > 0) current.velocity = (event.clientY - current.lastY) / elapsed;
      current.lastY = event.clientY;
      current.lastTime = event.timeStamp;
      element.dataset.dragging = "true";
      element.style.setProperty("--lufia-sheet-drag", `${offset}px`);
    },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) {
      const current = gesture.current;
      const element = panelOf(event);
      if (!current || !element || event.pointerId !== current.id) return;
      const offset = Math.max(0, event.clientY - current.startY);
      const threshold = Math.min(
        MAX_THRESHOLD,
        Math.max(MIN_THRESHOLD, element.getBoundingClientRect().height * 0.18),
      );
      const flicked = current.velocity >= FLICK_VELOCITY && offset >= FLICK_MIN_DISTANCE;
      finish(element, current.moved && (offset >= threshold || flicked));
    },
    onPointerCancel(event: ReactPointerEvent<HTMLElement>) {
      if (gesture.current && event.pointerId === gesture.current.id) finish(panelOf(event), false);
    },
  };
}
