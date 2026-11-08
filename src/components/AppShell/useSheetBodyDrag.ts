"use client";

import { useEffect, useRef, type RefObject } from "react";
import { dragDismisses, finishSheetDrag, type SheetDragThreshold } from "./useSheetDrag";

/** Movement before a touch is read as a scroll or a drag: a tap and a tiny wobble stay taps. */
const SLOP = 8;
/** How long after a drag the click its finger-up would send is still swallowed, if no new touch has started. */
const CLICK_GUARD_MS = 400;

const SCROLLING = new Set(["auto", "scroll", "overlay"]);

/**
 * The elements that can scroll vertically between the touched element and the sheet's body, nearest first, and the body
 * itself last (always, even when it has nothing to scroll yet). An inner list with `overflow: auto` counts only while it
 * really overflows; one that does not is not a scroller, whatever its style says.
 */
function scrollChain(target: Element, body: HTMLElement): HTMLElement[] {
  const chain: HTMLElement[] = [];
  for (let node: Element | null = target; node && node !== body; node = node.parentElement) {
    if (!(node instanceof HTMLElement)) continue;
    if (SCROLLING.has(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight)
      chain.push(node);
  }
  chain.push(body);
  return chain;
}

/** Whether any of them can still move in the direction of the finger (`dy` > 0 reveals what is above). */
function canScrollToward(chain: readonly HTMLElement[], dy: number) {
  return chain.some((el) =>
    dy > 0 ? el.scrollTop > 0 : dy < 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1,
  );
}

type Gesture = {
  id: number;
  x: number;
  y: number;
  lastY: number;
  lastTime: number;
  velocity: number;
  /** Every scroller under the finger, nearest first, ending with the body. */
  chain: readonly HTMLElement[];
  /** All of them are at the top: a downward move can only mean the sheet. */
  canDismiss: boolean;
  mode: "pending" | "scroll" | "horizontal" | "drag";
};

/**
 * Lets the sheet be dragged down from its scrolling body too, when the body is scrolled to the top, as on a native
 * bottom sheet. `useSheetDrag` covers the grabber and the header with pointer events; this covers the body with touch
 * events, because only a non-passive touch listener can cancel the browser's own gesture (pull to refresh, rubber banding).
 *
 * Only a touch that starts inside `[data-sheet-body]` counts. A list inside the body that scrolls on its own is respected:
 * the drag starts only when every scroller under the finger, the inner ones and the body, is at the top, and the finger
 * moves down. Anything else stays a scroll, and the browser is never stopped from scrolling a list that can still move.
 * A move inside the slop decides nothing (so a horizontal row still scrolls sideways); once the axis is known, a sideways
 * move is left alone. While dragging, the offset goes to `--lufia-sheet-drag` and
 * `data-dragging` is set on the panel, as `useSheetDrag` does, and the same threshold and flick decide the release. The
 * click a finger-up would otherwise send to the link under it is swallowed. Escape and the close button remain the
 * keyboard route.
 */
export function useSheetBodyDrag(
  panel: RefObject<HTMLElement | null>,
  enabled: boolean,
  onDismiss: () => void,
  threshold?: SheetDragThreshold,
) {
  const dismiss = useRef(onDismiss);
  const limits = useRef(threshold);
  useEffect(() => {
    dismiss.current = onDismiss;
    limits.current = threshold;
  });

  useEffect(() => {
    const element = panel.current;
    if (!enabled || !element) return;
    let gesture: Gesture | null = null;
    let suppressClick = false;
    let guardTimer: ReturnType<typeof setTimeout> | undefined;
    const stopSuppressing = () => {
      suppressClick = false;
      if (guardTimer) clearTimeout(guardTimer);
      guardTimer = undefined;
    };

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
      stopSuppressing();
      const target = event.target;
      if (!(target instanceof Element) || target.closest("input, textarea, select, [contenteditable]"))
        return;
      const scroller = target.closest<HTMLElement>("[data-sheet-body]");
      if (!scroller || !element.contains(scroller)) return;
      const touch = event.touches[0]!;
      const chain = scrollChain(target, scroller);
      gesture = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        lastY: touch.clientY,
        lastTime: performance.now(),
        velocity: 0,
        chain,
        canDismiss: chain.every((el) => el.scrollTop <= 0),
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
        const now = performance.now();
        const elapsed = now - gesture.lastTime;
        if (elapsed > 0) gesture.velocity = (touch.clientY - gesture.lastY) / elapsed;
        gesture.lastY = touch.clientY;
        gesture.lastTime = now;
        element.dataset.dragging = "true";
        element.style.setProperty("--lufia-sheet-drag", `${Math.max(0, dy)}px`);
        return;
      }
      // A scroll that has nowhere left to go (the top, or the bottom, of every scroller under the finger) would pull the
      // page to refresh or rubber-band it: stop that. Only now that the axis is known, and never while something can scroll.
      if (gesture.mode === "scroll" && !canScrollToward(gesture.chain, dy)) prevent(event);
    };

    const onEnd = (event: TouchEvent) => {
      if (!gesture) return;
      const touch = Array.from(event.changedTouches).find((point) => point.identifier === gesture!.id);
      if (!touch) return;
      const current = gesture;
      gesture = null;
      if (current.mode !== "drag") return;
      prevent(event);
      // The click this finger-up would send to a link under it. The flag lapses by itself, and on the next touch, so it
      // can never eat a click that belongs to someone else.
      suppressClick = true;
      guardTimer = setTimeout(stopSuppressing, CLICK_GUARD_MS);
      const offset = Math.max(0, touch.clientY - current.y);
      finishSheetDrag(
        element,
        dragDismisses(offset, current.velocity, element.getBoundingClientRect().height, limits.current),
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
      stopSuppressing();
    };

    element.addEventListener("touchstart", onStart, { passive: true });
    element.addEventListener("touchmove", onMove, { passive: false });
    element.addEventListener("touchend", onEnd, { passive: false });
    element.addEventListener("touchcancel", onCancel);
    element.addEventListener("click", onClick, true);
    element.addEventListener("pointerdown", stopSuppressing, true);
    return () => {
      stopSuppressing();
      element.removeEventListener("pointerdown", stopSuppressing, true);
      element.removeEventListener("touchstart", onStart);
      element.removeEventListener("touchmove", onMove);
      element.removeEventListener("touchend", onEnd);
      element.removeEventListener("touchcancel", onCancel);
      element.removeEventListener("click", onClick, true);
      if (gesture?.mode === "drag") clear();
    };
  }, [panel, enabled]);
}
