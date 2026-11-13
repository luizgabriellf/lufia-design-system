"use client";

import { useLayoutEffect, type RefObject } from "react";
import { computePlacement, type Align, type Side } from "./placement";

export type AnchoredPositionOptions = {
  side: Side;
  align: Align;
  /** Space between the anchor and the panel, in rem. Default 0.5. */
  gap?: number;
  /** Space kept to the viewport edge, in rem. Default 0.5. */
  margin?: number;
};

function placePanel(
  element: HTMLElement,
  anchorElement: Element,
  { side, align, gap = 0.5, margin = 0.5 }: AnchoredPositionOptions,
) {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const anchor = anchorElement.getBoundingClientRect();
  // Measured at the origin with no cap, so the natural size decides; the panel keeps its scroll position.
  const scrolled = element.scrollTop;
  element.style.maxBlockSize = "";
  element.style.maxInlineSize = "";
  element.style.left = "0px";
  element.style.top = "0px";
  const box = element.getBoundingClientRect();
  // Without a layout engine (a test DOM) nothing has a box: leave the panel where the stylesheet puts it.
  if (box.width === 0 && box.height === 0) return;
  const result = computePlacement({
    anchor,
    size: { width: box.width, height: box.height },
    viewport: { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight },
    side,
    align,
    gap: gap * rem,
    margin: margin * rem,
    rtl: getComputedStyle(element).direction === "rtl",
  });
  if (result.maxHeight !== undefined) element.style.maxBlockSize = `${result.maxHeight}px`;
  if (result.maxWidth !== undefined) element.style.maxInlineSize = `${result.maxWidth}px`;
  element.style.left = `${result.left}px`;
  element.style.top = `${result.top}px`;
  element.scrollTop = scrolled;
  element.setAttribute("data-side", result.side);
}

/**
 * Places a `position: fixed` panel next to an anchor element, before paint, and again on scroll (of any ancestor) and
 * resize, at most once a frame, and when the panel changes size. It writes `left`, `top` and the size caps inline and the
 * resolved side to `data-side` on the panel, so a CSS rule can pick a transform origin. Internal: `Popover` and `Tour`
 * share it. `getAnchor` must be stable (memoise it), or the panel is re-placed on every render.
 */
export function useAnchoredPosition(
  active: boolean,
  getAnchor: () => Element | null,
  panel: RefObject<HTMLElement | null>,
  { side, align, gap = 0.5, margin = 0.5 }: AnchoredPositionOptions,
) {
  useLayoutEffect(() => {
    if (!active) return;
    const place = () => {
      const anchor = getAnchor();
      if (panel.current && anchor) placePanel(panel.current, anchor, { side, align, gap, margin });
    };
    place();
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      // lufia-motion-allow reduced-motion: the frame only throttles layout reads; nothing animates.
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    };
    const onScroll = (event: Event) => {
      // Content that scrolls inside the panel does not move the anchor.
      if (event.target instanceof Node && panel.current?.contains(event.target)) return;
      schedule();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", schedule);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    if (panel.current) observer?.observe(panel.current);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
    };
  }, [active, getAnchor, panel, side, align, gap, margin]);
}
