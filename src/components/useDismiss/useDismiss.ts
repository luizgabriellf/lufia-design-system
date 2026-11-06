"use client";

import { useEffect, useRef, type RefObject } from "react";
import { isTopLayer, pushLayer, removeLayer } from "../useFocusTrap/layerStack";

/**
 * Closes a non-modal popup (dropdown, menu, popover) on Escape or a pointer press outside it. Escape returns focus to the
 * `toggle` that opened it. A copy with no layout boxes (a desktop and a phone instance of the same control, one hidden by
 * CSS) never listens, so the two do not close each other.
 */
export function useDismiss(
  open: boolean,
  close: () => void,
  root: RefObject<HTMLElement | null>,
  toggle?: RefObject<HTMLElement | null>,
) {
  // A ref keeps the layer registered across re-renders that pass a new inline `close`; re-pushing it would jump the stack.
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });
  useEffect(() => {
    if (!open || !root.current?.getClientRects().length) return;
    // Only the topmost layer reacts, so a popup inside an open dialog closes alone and the dialog stays.
    const layer = pushLayer();
    const onPointerDown = (event: PointerEvent) => {
      if (!isTopLayer(layer)) return;
      if (!root.current?.contains(event.target as Node)) closeRef.current();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || !isTopLayer(layer)) return;
      event.preventDefault();
      closeRef.current();
      toggle?.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      removeLayer(layer);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, root, toggle]);
}
