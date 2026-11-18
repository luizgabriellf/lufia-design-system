"use client";

import {
  useLayoutEffect,
  useRef,
  type MouseEvent,
  type MouseEventHandler,
  type PointerEventHandler,
  type PointerEvent,
  type RefObject,
  type SyntheticEvent,
} from "react";
import { flushLeavingDialogs, registerLeavingDialog, resolveReturnFocus } from "../internal/leavingDialogs";
import { notifyTopModalDialogChanged } from "./topModalDialog";

export type UseNativeDialogOptions = {
  /** The person asked to close: a platform close request, or a press on the backdrop. The owner decides (busy, guards). */
  onCloseRequest: () => void;
  /** A native close request (a back gesture) counts as a dismissal. Default `true`. */
  closeOnCancel?: boolean;
  /** A press on the backdrop counts as a dismissal. Default `true`. */
  closeOnOutsideClick?: boolean;
  /**
   * The dialog is animating out: it is still open (`active`) but its close was already requested. Cancel and close events then
   * never ask the owner to close again, and the dialog registers to be finished at once if another modal layer opens.
   */
  leaving?: boolean;
  /** The leaving dialog finished early (another layer opened, or the browser closed it): the owner may unmount it now. */
  onFinish?: () => void;
  /** The caller's own handlers for the same events: they run first and are not replaced. */
  handlers?: {
    onClick?: MouseEventHandler<HTMLDialogElement & HTMLDivElement>;
    onPointerDown?: PointerEventHandler<HTMLDialogElement & HTMLDivElement>;
    onCancel?: (event: SyntheticEvent<HTMLDialogElement>) => void;
  };
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
  {
    onCloseRequest,
    closeOnCancel = true,
    closeOnOutsideClick = true,
    leaving = false,
    onFinish,
    handlers,
  }: UseNativeDialogOptions,
) {
  const pressedBackdrop = useRef(false);
  // `close()` calls the package made whose `close` event has not arrived yet. Those events are not requests from the
  // person, and a count (not a flag) keeps a close-then-reopen from turning a late one into a request.
  const pendingOwnCloses = useRef(0);
  // What the owner wants right now: open, and not on its way out.
  const activeRef = useRef(active && !leaving);
  const leavingRef = useRef(leaving);
  const onFinishRef = useRef(onFinish);
  // Where focus returns on close; `released` is set when another layer took over and now owns that return.
  const opener = useRef<HTMLElement | null>(null);
  const released = useRef(false);
  useLayoutEffect(() => {
    activeRef.current = active && !leaving;
    leavingRef.current = leaving;
    onFinishRef.current = onFinish;
  });

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!active || !dialog) return;
    // Another dialog still leaving would cover this one: finish it, and return focus to what it would have.
    const handedOver = flushLeavingDialogs(dialog);
    const previous = handedOver ?? (document.activeElement as HTMLElement | null);
    opener.current = previous;
    released.current = false;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) {
        pendingOwnCloses.current += 1;
        dialog.close();
      }
      notifyTopModalDialogChanged();
      // The browser restores focus on close too; this covers an opener that was re-rendered in the meantime.
      const focused = document.activeElement;
      if (released.current) return;
      // `previous` may have lived in a dialog that was flushed meanwhile: its opener is the target then.
      const back = resolveReturnFocus(previous);
      if (back && (!focused || focused === document.body || dialog.contains(focused)))
        back.focus({ preventScroll: true });
    };
  }, [ref, active]);

  // While it leaves, a layer that opens finishes it: close now, hand the focus return over, and let the owner unmount it.
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!leaving || !dialog) return;
    return registerLeavingDialog(dialog, () => {
      if (dialog.open) {
        pendingOwnCloses.current += 1;
        dialog.close();
      }
      notifyTopModalDialogChanged();
      released.current = true;
      onFinishRef.current?.();
      return opener.current;
    });
  }, [ref, leaving]);

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
      handlers?.onCancel?.(event);
      // Escape is handled by the layer stack and its keydown is prevented, so this only arrives for a close request that
      // has no key (a platform back gesture). The dialog is never closed by the browser; the owner closes it.
      event.preventDefault();
      // Already closing: a second request would call the owner's `onClose` twice.
      if (closeOnCancel && !leavingRef.current) onCloseRequest();
    },
    onPointerDown(event: PointerEvent<HTMLDialogElement>) {
      handlers?.onPointerDown?.(event as PointerEvent<HTMLDialogElement & HTMLDivElement>);
      pressedBackdrop.current = event.target === event.currentTarget && outside(event);
    },
    onClick(event: MouseEvent<HTMLDialogElement>) {
      handlers?.onClick?.(event as MouseEvent<HTMLDialogElement & HTMLDivElement>);
      // The native backdrop reports clicks on the dialog itself; only a press that began outside the panel counts.
      if (pressedBackdrop.current && closeOnOutsideClick && !leavingRef.current && outside(event))
        onCloseRequest();
      pressedBackdrop.current = false;
    },
    onClose(event: SyntheticEvent<HTMLDialogElement>) {
      // The browser closed it without going through us: a second Escape that cannot be cancelled, or a
      // `<form method="dialog">`. Tell the owner; if it keeps the dialog open (busy, a guard), open it again.
      // `close` bubbles through React, so ignore one from a dialog nested inside this one.
      if (event.target !== event.currentTarget) return;
      const dialog = event.currentTarget;
      if (pendingOwnCloses.current > 0) {
        pendingOwnCloses.current -= 1;
        return;
      }
      // The browser closed a dialog that was already leaving (a close watcher that skips `cancel`): it is simply done, with
      // no second request to the owner and no reopening.
      if (leavingRef.current) {
        if (!dialog.open) onFinishRef.current?.();
        return;
      }
      // A real native close leaves the dialog closed; one that finds it open again is stale.
      if (dialog.open) return;
      onCloseRequest();
      setTimeout(() => {
        if (activeRef.current && dialog.isConnected && !dialog.open) dialog.showModal();
      }, 0);
    },
  };
}
