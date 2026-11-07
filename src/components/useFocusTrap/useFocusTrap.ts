"use client";

import { useEffect, useRef, type RefObject } from "react";
import { inertBackground } from "./inertBackground";
import { isTopLayer, pushLayer, removeLayer } from "./layerStack";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function isVisible(element: HTMLElement): boolean {
  if (element.closest("[hidden], [inert]")) return false;
  // `checkVisibility` sees ancestors with `display: none` and `visibility: hidden`; older engines fall back to the element itself.
  if (typeof element.checkVisibility === "function")
    return element.checkVisibility({ visibilityProperty: true });
  const style = getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

/**
 * The tabbable descendants of `root`, in keyboard Tab order. Not `offsetParent`-based:
 * that is `null` for fixed-position children. Positive tabindex values precede
 * the natural DOM order; negative tabindex values are only programmatically focusable.
 */
export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  const tabbable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    if (!isVisible(element) || element.matches(":disabled")) return false;
    const explicitTabIndex = element.getAttribute("tabindex");
    return explicitTabIndex === null || element.tabIndex >= 0;
  });

  // Stable sort keeps DOM order for elements with the same tabindex.
  return tabbable.sort((a, b) => {
    const aPriority = a.tabIndex > 0 ? a.tabIndex : Number.MAX_SAFE_INTEGER;
    const bPriority = b.tabIndex > 0 ? b.tabIndex : Number.MAX_SAFE_INTEGER;
    return aPriority - bPriority;
  });
}

/** A caller (or another trap's own restore) deliberately moved focus out of the trap since it began closing: leave it be. */
function focusMovedOutside(container: HTMLElement | null, active: HTMLElement | null): boolean {
  if (!active || active === document.body) return false;
  if (container?.contains(active)) return false;
  return active.isConnected;
}

export type UseFocusTrapOptions = {
  /** Called when Escape is pressed in the topmost trap, unless another handler already used the key. Omit to ignore Escape. */
  onEscape?: () => void;
  /**
   * Where focus goes when the trap opens. `"container"` (default) focuses the container itself, which must have
   * `tabIndex={-1}` and a name: screen readers announce it, no keyboard pops up on touch devices and nothing is chosen for the
   * person. `"first"` focuses the first tabbable element. A ref focuses that element, e.g. the safe action of a destructive prompt.
   */
  initialFocus?: "container" | "first" | RefObject<HTMLElement | null>;
  /** Return focus to the element focused before the trap opened. Default `true`. */
  restoreFocus?: boolean;
  /** Mark the rest of the page `inert` while the trap is open. Default `false`. */
  inertBackground?: boolean;
};

/**
 * Contains Tab and Shift+Tab inside `ref`'s subtree while `open` is true, optionally closes on Escape, moves focus in when
 * it opens and puts it back where it was when it closes. Follows the WAI-ARIA APG "Dialog (Modal)" pattern.
 *
 * Only the topmost layer reacts (see `useDismiss`: a popup inside the overlay counts as a layer), so nested overlays and popups close one at a time.
 */
export function useFocusTrap(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  {
    onEscape,
    initialFocus = "container",
    restoreFocus = true,
    inertBackground: inert = false,
  }: UseFocusTrapOptions = {},
) {
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  });
  const initialFocusRef = useRef(initialFocus);
  useEffect(() => {
    initialFocusRef.current = initialFocus;
  });

  useEffect(() => {
    const container = ref.current;
    if (!open || !container) return;
    const layer = pushLayer();
    const previous = document.activeElement as HTMLElement | null;
    const releaseInert = inert ? inertBackground(container) : undefined;

    const target = initialFocusRef.current;
    if (target === "first") (getFocusableElements(container)[0] ?? container).focus({ preventScroll: true });
    else if (target === "container") container.focus({ preventScroll: true });
    else (target.current ?? container).focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTopLayer(layer)) return;
      if (event.key === "Escape") {
        if (event.defaultPrevented || !onEscapeRef.current) return;
        event.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusableElements(container);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }
      const active = document.activeElement;
      if (!container.contains(active) || (active === container && event.shiftKey)) {
        // Focus is on the container itself or escaped it (a click on the backdrop lands on the body): re-enter at the right end.
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      removeLayer(layer);
      document.removeEventListener("keydown", onKeyDown);
      releaseInert?.();
      // This cleanup is a passive effect: on a nested close it can run after a caller's own refocus already landed
      // elsewhere on purpose. Leave that alone. Otherwise blur what is left (iOS Safari resets its zoom on a real blur
      // event, not when the focused node is simply removed) and give focus back.
      const active = document.activeElement as HTMLElement | null;
      if (!focusMovedOutside(container, active)) {
        active?.blur();
        if (restoreFocus && previous?.isConnected) previous.focus({ preventScroll: true });
      }
    };
  }, [open, ref, inert, restoreFocus]);
}
