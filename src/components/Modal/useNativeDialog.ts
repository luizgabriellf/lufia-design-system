"use client";

import {
  useLayoutEffect,
  useRef,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  type SyntheticEvent,
} from "react";

export type UseNativeDialogOptions = {
  /** The person asked to close: a platform close request, or a press on the backdrop. The owner decides (busy, guards). */
  onCloseRequest: () => void;
  /** A native close request (a back gesture) counts as a dismissal. Default `true`. */
  closeOnCancel?: boolean;
  /** A press on the backdrop counts as a dismissal. Default `true`. */
  closeOnOutsideClick?: boolean;
};

/**
 * Opens a native `<dialog>` as a modal (`showModal()`, so it sits in the browser's top layer) while `active`, closes it
 * when `active` ends, and gives focus back to what had it. Internal: shared by `Modal` (`renderAs="dialog"`) and
 * `NavSheet` (`sheetAs="dialog"`).
 *
 * It only opens and closes the element. Escape, Tab containment and the layer stack stay with `useFocusTrap` (call it with
 * `restoreFocus: false` and no `inertBackground`: the browser makes the page behind inert), and the dialog's own `cancel`
 * event is turned into a close request here. Call it before `useFocusTrap`, so the dialog is open when focus moves in.
 *
 * Spread the returned handlers on the `<dialog>`. The dialog must be the visible panel (no padding around it), so a
 * click that lands on the dialog itself and outside its box is a click on the native backdrop.
 */
export function useNativeDialog(
  ref: RefObject<HTMLDialogElement | null>,
  active: boolean,
  { onCloseRequest, closeOnCancel = true, closeOnOutsideClick = true }: UseNativeDialogOptions,
) {
  const pressedBackdrop = useRef(false);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!active || !dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      // The browser restores focus on close too; this covers an opener that was re-rendered in the meantime.
      const focused = document.activeElement;
      if (previous?.isConnected && (!focused || focused === document.body || dialog.contains(focused)))
        previous.focus({ preventScroll: true });
    };
  }, [ref, active]);

  const outside = (event: { clientX: number; clientY: number }) => {
    const rect = ref.current?.getBoundingClientRect();
    return (
      !!rect &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    );
  };

  return {
    onCancel(event: SyntheticEvent<HTMLDialogElement>) {
      // Escape is handled by the layer stack and its keydown is prevented, so this only arrives for a close request that
      // has no key (a platform back gesture). The dialog is never closed by the browser; the owner closes it.
      event.preventDefault();
      if (closeOnCancel) onCloseRequest();
    },
    onPointerDown(event: PointerEvent<HTMLDialogElement>) {
      pressedBackdrop.current = event.target === event.currentTarget && outside(event);
    },
    onClick(event: MouseEvent<HTMLDialogElement>) {
      // The native backdrop reports clicks on the dialog itself; only a press that began outside the panel counts.
      if (pressedBackdrop.current && closeOnOutsideClick && outside(event)) onCloseRequest();
      pressedBackdrop.current = false;
    },
  };
}
