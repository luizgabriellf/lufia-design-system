"use client";

import { useEffect, type RefObject } from "react";

/**
 * Two small courtesies for a navigation that scrolls on its own (a long list in a short window).
 *
 * - **Edge hints.** `data-more="start" | "end" | "both"` is set on the scroller while items are hidden beyond that edge,
 *   so CSS can fade it. It follows scrolling and resizing.
 * - **The current page is brought into view**, centred, once for each page: when the scroller first has a size (a sheet
 *   has none until it opens) and whenever `aria-current="page"` moves to another item. Never on a group toggle, which
 *   would make the list jump under the pointer. It is a plain jump, not an animation, and happens only when the item is
 *   actually out of view.
 */
export function useNavScrollHints(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;

    const mark = () => {
      const start = nav.scrollTop > 2;
      const end = nav.scrollTop + nav.clientHeight < nav.scrollHeight - 2;
      if (start || end) nav.dataset.more = start && end ? "both" : start ? "start" : "end";
      else delete nav.dataset.more;
    };

    let revealed: string | null = null;
    const reveal = () => {
      const current = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (!current || nav.clientHeight === 0) return;
      const identity = current.getAttribute("href") ?? current.textContent ?? "";
      if (revealed === identity) return;
      revealed = identity;
      if (nav.scrollHeight <= nav.clientHeight) return;
      const box = current.getBoundingClientRect();
      const view = nav.getBoundingClientRect();
      if (box.bottom > view.bottom || box.top < view.top) {
        nav.scrollTop += box.top - view.top - (nav.clientHeight - box.height) / 2;
      }
    };

    const update = () => {
      reveal();
      mark();
    };
    update();
    nav.addEventListener("scroll", mark, { passive: true });
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    resize?.observe(nav);
    // The current page moves when the route changes; a group opening or closing resizes the list but is not a reveal.
    const moved = new MutationObserver(update);
    moved.observe(nav, { subtree: true, attributes: true, attributeFilter: ["aria-current"] });
    return () => {
      nav.removeEventListener("scroll", mark);
      resize?.disconnect();
      moved.disconnect();
    };
  }, [ref]);
}
