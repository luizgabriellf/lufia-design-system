"use client";

import { useEffect, useRef, type RefObject } from "react";
import { dragDismisses, finishSheetDrag } from "./useSheetDrag";

/** Movement before a touch is read as a scroll or a drag: a tap and a tiny wobble stay taps. */
const SLOP = 8;

type Gesture = {
  id: number;
  x: number;
  y: number;
  lastY: number;
  lastTime: number;
  velocity: number;
  scroller: HTMLElement;
  canDismiss: boolean;
  mode: "pending" | "scroll" | "horizontal" | "drag";
};

/**
 * Lets the sheet be dragged down from its scrolling body too, when the body is scrolled to the top, as on a native
 * bottom sheet. `useSheetDrag` covers the grabber and the header with pointer events; this covers the body with touch
 * events, because only a non-passive touch listener can cancel the browser's own gesture (pull to refresh, rubber banding).
 *
 * Only a touch that starts inside `[data-sheet-body]` counts. A downward move from the top becomes a drag; any other move
 * stays a scroll, and a sideways one is left alone. While dragging, the offset goes to `--lufia-sheet-drag` and
 * `data-dragging` is set on the panel, as `useSheetDrag` does, and the same threshold and flick decide the release. The
 * click a finger-up would otherwise send to the link under it is swallowed. Escape and the close button remain the
 * keyboard route.
 */
export function useSheetBodyDrag(
  panel: RefObject<HTMLElement | null>,
  enabled: boolean,
  onDismiss: () => void,
) {
  const dismiss = useRef(onDismiss);
  useEffect(() => {
    dismiss.current = onDismiss;
  });

  useEffect(() => {
    const element = panel.current;
    if (!enabled || !element) return;
    let gesture: Gesture | null = null;
    let suppressClick = false;

    const prevent = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault();
    };
    const clear = () => {
      gesture = null;
      delete element.dataset.dragging;
      element.style.setProperty("--lufia-sheet-drag", "0px");
    };

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        if (gesture?.mode === "drag") clear();
        gesture = null;
        return;
      }
      suppressClick = false;
      const target = event.target;
      if (!(target instanceof Element) || target.closest("input, textarea, select, [contenteditable]"))
        return;
      const scroller = target.closest<HTMLElement>("[data-sheet-body]");
      if (!scroller || !element.contains(scroller)) return;
      const touch = event.touches[0]!;
      gesture = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        lastY: touch.clientY,
        lastTime: performance.now(),
        velocity: 0,
        scroller,
        canDismiss: scroller.scrollTop <= 0,
        mode: "pending",
      };
    };

    const onMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        if (gesture?.mode === "drag") clear();
        gesture = null;
        return;
      }
      if (!gesture) return;
      const touch = Array.from(event.touches).find((point) => point.identifier === gesture!.id);
      if (!touch) return;
      const dx = touch.clientX - gesture.x;
      const dy = touch.clientY - gesture.y;
      if (gesture.mode === "pending" && Math.max(Math.abs(dx), Math.abs(dy)) >= SLOP) {
        gesture.mode =
          Math.abs(dx) > Math.abs(dy) ? "horizontal" : dy > 0 && gesture.canDismiss ? "drag" : "scroll";
      }
      if (gesture.mode === "horizontal") return;
      if (gesture.mode === "drag") {
        // A gesture the browser already claimed for scrolling cannot be taken over: let it go.
        if (!event.cancelable) {
          clear();
          return;
        }
        prevent(event);
        suppressClick = true;
        const now = performance.now();
        const elapsed = now - gesture.lastTime;
        if (elapsed > 0) gesture.velocity = (touch.clientY - gesture.lastY) / elapsed;
        gesture.lastY = touch.clientY;
        gesture.lastTime = now;
        element.dataset.dragging = "true";
        element.style.setProperty("--lufia-sheet-drag", `${Math.max(0, dy)}px`);
        return;
      }
      // Cancel a downward move at the very top even inside the slop: waiting for the threshold lets the browser start
      // pull to refresh. Same for an upward move at the bottom, which would rubber-band the page behind.
      const { scroller } = gesture;
      const canScroll =
        dy > 0
          ? scroller.scrollTop > 0
          : dy < 0 && scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1;
      if (!canScroll && Math.abs(dy) >= Math.abs(dx)) prevent(event);
    };

    const onEnd = (event: TouchEvent) => {
      if (!gesture) return;
      const touch = Array.from(event.changedTouches).find((point) => point.identifier === gesture!.id);
      if (!touch) return;
      const current = gesture;
      gesture = null;
      if (current.mode !== "drag") return;
      prevent(event);
      const offset = Math.max(0, touch.clientY - current.y);
      finishSheetDrag(
        element,
        dragDismisses(offset, current.velocity, element.getBoundingClientRect().height),
        () => dismiss.current(),
      );
    };

    const onCancel = () => {
      if (gesture?.mode === "drag") clear();
      gesture = null;
    };

    const onClick = (event: MouseEvent) => {
      if (!suppressClick || event.detail === 0) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
    };

    element.addEventListener("touchstart", onStart, { passive: true });
    element.addEventListener("touchmove", onMove, { passive: false });
    element.addEventListener("touchend", onEnd, { passive: false });
    element.addEventListener("touchcancel", onCancel);
    element.addEventListener("click", onClick, true);
    return () => {
      element.removeEventListener("touchstart", onStart);
      element.removeEventListener("touchmove", onMove);
      element.removeEventListener("touchend", onEnd);
      element.removeEventListener("touchcancel", onCancel);
      element.removeEventListener("click", onClick, true);
      if (gesture?.mode === "drag") clear();
    };
  }, [panel, enabled]);
}
