"use client";

import { useEffect, type RefObject } from "react";

/** The custom property the offset is written to, in pixels. */
export const VISUAL_VIEWPORT_OFFSET_PROPERTY = "--lufia-float-bar-viewport-offset";

/**
 * How far the bottom of the visual viewport sits above the bottom of the layout viewport: the on-screen keyboard, or a
 * browser toolbar that covers the page (iOS Safari). `0` when nothing covers it, or while the page is pinch-zoomed (then
 * the person is looking at a part of the page and the bar should stay where the layout puts it).
 */
export function visualViewportOffset(view: Pick<VisualViewport, "height" | "offsetTop" | "scale">): number {
  if (view.scale > 1.01) return 0;
  const covered = window.innerHeight - (view.height + view.offsetTop);
  // Sub-pixel rounding of the viewport would make the bar shiver.
  return covered > 1 ? Math.round(covered) : 0;
}

/**
 * Keeps an element fixed to the bottom of the screen above what covers the page: writes the covered height to
 * `--lufia-float-bar-viewport-offset` on the element (and `data-viewport-lifted` while it is above 0), once per frame,
 * from the `resize` and `scroll` events of `window.visualViewport`. Nothing happens without `visualViewport`. The
 * listeners and the pending frame go away with the element or when `enabled` turns false.
 */
export function useVisualViewportOffset(ref: RefObject<HTMLElement | null>, enabled = true): void {
  useEffect(() => {
    const element = ref.current;
    const view = typeof window === "undefined" ? undefined : window.visualViewport;
    if (!enabled || !element || !view) return;
    let frame: number | null = null;
    let last = -1;
    const apply = () => {
      frame = null;
      const offset = visualViewportOffset(view);
      if (offset === last) return;
      last = offset;
      element.style.setProperty(VISUAL_VIEWPORT_OFFSET_PROPERTY, `${offset}px`);
      if (offset > 0) element.setAttribute("data-viewport-lifted", "");
      else element.removeAttribute("data-viewport-lifted");
    };
    const schedule = () => {
      // lufia-motion-allow reduced-motion: the frame only throttles viewport reads; nothing animates.
      if (frame === null) frame = requestAnimationFrame(apply);
    };
    apply();
    view.addEventListener("resize", schedule);
    view.addEventListener("scroll", schedule);
    return () => {
      view.removeEventListener("resize", schedule);
      view.removeEventListener("scroll", schedule);
      if (frame !== null) cancelAnimationFrame(frame);
      element.style.removeProperty(VISUAL_VIEWPORT_OFFSET_PROPERTY);
      element.removeAttribute("data-viewport-lifted");
    };
  }, [ref, enabled]);
}
