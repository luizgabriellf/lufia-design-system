"use client";

import { useEffect, type RefObject } from "react";

/**
 * Two small courtesies for a navigation that scrolls on its own (a long list in a short window).
 *
 * - **Edge hints.** `data-more="start" | "end" | "both"` is set on the scroller while items are hidden beyond that edge,
 *   so CSS can fade it. It follows scrolling, the scroller's size, its children's size (a group opening or closing) and
 *   items being added or removed.
 * - **The current page is brought into view**, centred, once for each page: when the scroller first has a size (a sheet
 *   has none until it opens), whenever `aria-current="page"` moves to another item, and when the current item appears as
 *   a new node. Never on a group toggle, which
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

    // The node that was last brought into view: a new node for the same page (a group that remounted, the rail opening)
    // is revealed again, the same node is not, so a person who scrolled away is never pulled back.
    let revealed: Element | null = null;
    const reveal = () => {
      const current = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (!current || nav.clientHeight === 0 || revealed === current) return;
      revealed = current;
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

    // The scroller's own box does not change when a group opens or the content grows: its children do. Watch them (and the
    // scroller), and watch them again whenever children come and go.
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    const watch = () => {
      if (!resize) return;
      resize.disconnect();
      resize.observe(nav);
      for (const child of Array.from(nav.children)) resize.observe(child);
    };
    watch();
    // The current page moves when the route changes; items come and go when the list changes. A group opening or closing
    // resizes the list, which re-marks the edges but is not a reveal (the node is the same).
    const changed = new MutationObserver(() => {
      watch();
      update();
    });
    changed.observe(nav, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-current"],
    });
    return () => {
      nav.removeEventListener("scroll", mark);
      resize?.disconnect();
      changed.disconnect();
    };
  }, [ref]);
}
