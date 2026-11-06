"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

export type UseSlidingIndicatorOptions = {
  /**
   * Stretch a fixed-width indicator with `scaleX` instead of resizing it, so tabs of unequal width animate on the
   * compositor only. The indicator then needs a transform origin at its start edge. Default `false`.
   */
  stretch?: boolean;
};

const STRETCH_BASE = 100;

/**
 * Slides a decorative indicator behind the active item of `container`. Only `transform` animates; the items themselves
 * never move, so their markup, focus and state are untouched.
 *
 * - `container` must be `position: relative`; the indicator is `position: absolute` at its top-left corner. Positions are
 *   measured physical coordinates, so the indicator uses `left: 0` rather than a logical inset.
 * - `activeSelector` finds the active item inside the container. `key` re-measures when it changes (usually the active id).
 * - The indicator starts `hidden` (server render, no script): the active item keeps its own styling until the hook shows
 *   the indicator, and CSS can hand the chrome over with `:has(> .indicator:not([hidden]))`.
 * - The slide is enabled by `data-ready` after the first position, so the indicator never glides in from the corner. A
 *   resize jumps to the new spot instead of sliding, which would leave it at the old layout's offset for a moment.
 *
 * Returns the ref to put on the indicator element. Give the indicator a `transition` on `transform` under
 * `[data-ready]`, with `--lufia-motion-*` tokens.
 */
export function useSlidingIndicator(
  container: RefObject<HTMLElement | null>,
  activeSelector: string,
  key: unknown,
  { stretch = false }: UseSlidingIndicatorOptions = {},
): RefObject<HTMLSpanElement | null> {
  const indicator = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const nav = container.current;
    const mark = indicator.current;
    if (!nav || !mark) return;
    let frame = 0;

    const place = () => {
      const active = nav.querySelector<HTMLElement>(activeSelector);
      if (!active) {
        mark.hidden = true;
        return;
      }
      mark.style.width = `${stretch ? STRETCH_BASE : active.offsetWidth}px`;
      mark.style.height = `${active.offsetHeight}px`;
      mark.style.transform =
        `translate3d(${active.offsetLeft}px, ${active.offsetTop}px, 0)` +
        (stretch ? ` scaleX(${active.offsetWidth / STRETCH_BASE})` : "");
      mark.hidden = false;
      if (!mark.dataset.ready) {
        cancelAnimationFrame(frame);
        // Under prefers-reduced-motion the duration tokens are already ~0, so there is nothing to wait for.
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) mark.dataset.ready = "true";
        else frame = requestAnimationFrame(() => (mark.dataset.ready = "true"));
      }
    };

    place();
    const jump = () => {
      delete mark.dataset.ready;
      place();
    };
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(jump) : null;
    observer?.observe(nav);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [container, activeSelector, key, stretch]);

  return indicator;
}
