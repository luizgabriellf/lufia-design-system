"use client";

import { useEffect } from "react";

/**
 * Locks scroll while an overlay (modal, drawer) is open.
 *
 * Two layouts need two strategies:
 *
 * - **Document scroll** (the page itself scrolls): the classic `position: fixed` body trick, which
 *   restores the previous scroll position on release.
 * - **Inner scroll** (an app shell pinned to the viewport height whose content area scrolls): the
 *   document never scrolls, so the shell's own scroller is locked instead. Pass the CSS selectors
 *   of those scrollers in `scrollContainerSelectors`; the first one that is genuinely overflowing
 *   and has a computed `overflow-y` of `auto` or `scroll` is locked.
 *
 * The mode is chosen by comparing `documentElement` (the element that scrolls in a normal
 * document), not `body`: `body` grows to fit its content, so its `scrollHeight` and `clientHeight`
 * are nearly always equal. Inner-scroll mode requires both a matching scroller and a document that
 * is not itself overflowing. A short explicit allow-list is used on purpose; a generic
 * scrollable-ancestor walker risks locking a nested table or panel instead of the shell.
 *
 * In document mode the scrollbar's width is compensated with padding on `body`, so the page behind a modal does not
 * jump sideways when the scrollbar disappears (overlay scrollbars on touch devices have no width and need nothing).
 *
 * Locks are reference-counted, so stacked overlays are safe.
 */

function findInnerScrollTarget(body: HTMLElement, selectors: readonly string[]): HTMLElement | null {
  for (const selector of selectors) {
    const el = body.querySelector<HTMLElement>(selector);
    if (!el) continue;
    const overflows = el.scrollHeight > el.clientHeight + 1;
    const overflowY = getComputedStyle(el).overflowY;
    if (overflows && (overflowY === "auto" || overflowY === "scroll")) return el;
  }
  return null;
}

let lockCount = 0;
let savedScrollY = 0;
let savedOverflow = "";
let savedPaddingRight = "";
let savedBoxSizing = "";
let savedHtmlOverscroll = "";
let innerScrollMode = false;
let lockedElement: HTMLElement | null = null;

function applyLock(selectors: readonly string[]) {
  if (lockCount === 0) {
    const { body, documentElement: html } = document;
    const documentOverflows = html.scrollHeight > html.clientHeight + 1;
    const target = documentOverflows ? null : findInnerScrollTarget(body, selectors);
    innerScrollMode = !!target;
    lockedElement = target;

    if (target) {
      savedScrollY = target.scrollTop;
      savedOverflow = target.style.overflowY;
      target.style.overflowY = "hidden";
    } else {
      savedScrollY = window.scrollY;
      savedOverflow = body.style.overflow;
      // clientWidth is 0 where there is no layout (jsdom), which must not read as a full-width scrollbar.
      const gutter = html.clientWidth > 0 ? Math.max(0, window.innerWidth - html.clientWidth) : 0;
      savedPaddingRight = body.style.paddingRight;
      // `width: 100%` below must include the compensating padding; with `content-box` the page would widen and still jump.
      savedBoxSizing = body.style.boxSizing;
      body.style.boxSizing = "border-box";
      if (gutter)
        body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight || "0") + gutter}px`;
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${savedScrollY}px`;
      body.style.width = "100%";
    }

    savedHtmlOverscroll = html.style.overscrollBehavior;
    html.style.overscrollBehavior = "none";
  }
  lockCount += 1;
}

function releaseLock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    const { body, documentElement: html } = document;

    if (innerScrollMode && lockedElement) {
      lockedElement.style.overflowY = savedOverflow;
      lockedElement.scrollTo(0, savedScrollY);
    } else {
      body.style.overflow = savedOverflow;
      body.style.paddingRight = savedPaddingRight;
      body.style.boxSizing = savedBoxSizing;
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      window.scrollTo(0, savedScrollY);
    }

    html.style.overscrollBehavior = savedHtmlOverscroll;
    innerScrollMode = false;
    lockedElement = null;
  }
}

/**
 * Whether any overlay currently holds the lock. For consumers outside the component tree that
 * rendered the overlay (for example a document-level gesture handler). It reads a counter rather
 * than sniffing styles, because the two lock strategies leave different style fingerprints.
 */
export function isBodyScrollLocked() {
  return lockCount > 0;
}

export type UseBodyScrollLockOptions = {
  /** Selectors of inner scroll containers to lock instead of the document, in priority order. */
  scrollContainerSelectors?: readonly string[];
};

const NO_SELECTORS: readonly string[] = [];

export function useBodyScrollLock(locked: boolean, options: UseBodyScrollLockOptions = {}) {
  const selectors = options.scrollContainerSelectors ?? NO_SELECTORS;
  const key = selectors.join("\n");
  useEffect(() => {
    if (!locked) return;
    applyLock(key ? key.split("\n") : NO_SELECTORS);
    return releaseLock;
  }, [locked, key]);
}
