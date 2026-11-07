"use client";

import { useEffect, type RefObject } from "react";

/** The custom property the panel publishes. Read it as `var(--lufia-modal-header-block-size, 0px)`. */
export const HEADER_BLOCK_SIZE_PROPERTY = "--lufia-modal-header-block-size";

/**
 * Publishes the height the header covers at the top of the scroll area as `--lufia-modal-header-block-size` on the panel,
 * and keeps it current with a `ResizeObserver` (a title that wraps, a larger font, a header action that appears).
 *
 * Content that sticks inside the modal body uses it as its `top`. When the body is the scroller (`scrollShadow`) the header
 * does not overlap it, so the property is `0px` there and the same `top` still lands flush under the header. Without
 * `ResizeObserver` (old engines, jsdom) the height is measured once per `watch` change.
 */
export function useHeaderBlockSize(
  panelRef: RefObject<HTMLElement | null>,
  headerRef: RefObject<HTMLElement | null>,
  { watch, overlaps }: { watch: boolean; overlaps: boolean },
) {
  useEffect(() => {
    const panel = panelRef.current;
    const header = headerRef.current;
    if (!watch || !panel || !header) return;
    const publish = (size: number) =>
      panel.style.setProperty(HEADER_BLOCK_SIZE_PROPERTY, overlaps ? `${size}px` : "0px");
    publish(header.getBoundingClientRect().height);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      publish(entry?.borderBoxSize?.[0]?.blockSize ?? header.getBoundingClientRect().height);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, [panelRef, headerRef, watch, overlaps]);
}
