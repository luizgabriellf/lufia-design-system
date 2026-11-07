"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Modal, type ModalClassNames, type ModalProps } from "../Modal";
import styles from "./ConfirmDialog.module.css";

/** The parts of a `ConfirmDialog` that accept an extra class name: those of `Modal`, plus the two buttons. */
export type ConfirmDialogClassNames = ModalClassNames & {
  /** The cancelling button. */
  cancel?: string;
  /** The confirming button. */
  confirm?: string;
};

export type ConfirmDialogProps = Pick<
  ModalProps,
  "open" | "closeLabel" | "container" | "className" | "size" | "sheetPlacement"
> & {
  /**
   * Extra class names for the parts, for an app that attaches its own styles or test selectors. Every part also carries a
   * stable `data-lufia-part` attribute: those of `Modal`, plus `cancel` and `confirm` on the buttons.
   */
  classNames?: ConfirmDialogClassNames;
  /** What is being decided, as a question or an action: "Delete invoice 2041?". */
  title: ReactNode;
  /** The consequence, in a sentence or two. Read out when the dialog opens. */
  message: ReactNode;
  /** Text of the confirming button. Name the action ("Delete invoice"), not "OK". */
  confirmLabel: string;
  /** Text of the cancelling button. */
  cancelLabel: string;
  onConfirm: () => void;
  /** Cancel button, Escape and a click on the backdrop. Not called while `busy`. */
  onCancel: () => void;
  /** The action cannot be undone: the confirm button is styled as dangerous and focus starts on Cancel. */
  destructive?: boolean;
  /**
   * The confirmed action is running. The dialog refuses to close (no Escape, outside click or Cancel), keeps focus where
   * it is and marks the confirm button `aria-busy`. Clear it when the action settles.
   */
  busy?: boolean;
};

/**
 * A question that needs an answer before anything else can happen. A `Modal` with `role="alertdialog"`: the message is
 * announced when it opens, and focus starts on the safe choice (Cancel for a destructive action).
 *
 * Follows the WAI-ARIA APG Alert Dialog pattern.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
  busy = false,
  size = "sm",
  classNames,
  ...rest
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      {...rest}
      open={open}
      onClose={onCancel}
      role="alertdialog"
      size={size}
      classNames={classNames}
      title={title}
      description={message}
      busy={busy}
      hideCloseButton
      initialFocus={destructive ? cancelRef : confirmRef}
      footer={
        <>
          {/* aria-disabled, not disabled: a disabled button drops the focus the person is on. */}
          <button
            ref={cancelRef}
            type="button"
            className={[styles.button, classNames?.cancel].filter(Boolean).join(" ")}
            data-lufia-part="cancel"
            data-variant="secondary"
            aria-disabled={busy || undefined}
            onClick={() => {
              if (!busy) onCancel();
            }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={[styles.button, classNames?.confirm].filter(Boolean).join(" ")}
            data-lufia-part="confirm"
            data-variant={destructive ? "danger" : "primary"}
            aria-busy={busy || undefined}
            aria-disabled={busy || undefined}
            onClick={() => {
              if (!busy) onConfirm();
            }}
          >
            {busy ? <span className={styles.spinner} aria-hidden="true" /> : null}
            {confirmLabel}
          </button>
        </>
      }
    />
  );
}

export type ConfirmOptions = Pick<
  ConfirmDialogProps,
  "size" | "sheetPlacement" | "className" | "classNames"
> & {
  title: ReactNode;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
};

/**
 * A promise-based replacement for `window.confirm()`:
 *
 * ```tsx
 * const { confirm, confirmDialog } = useConfirmDialog();
 * if (!(await confirm({ title, message, confirmLabel, cancelLabel, destructive: true }))) return;
 * // render {confirmDialog} once in the component's JSX
 * ```
 *
 * One at a time: a new `confirm()` while one is open settles the first with `false`. Unmounting settles it with `false`.
 */
export function useConfirmDialog() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current?.(false);
      resolveRef.current = resolve;
      setOptions(next);
      setOpen(true);
    });
  }, []);

  const settle = useCallback((confirmed: boolean) => {
    resolveRef.current?.(confirmed);
    resolveRef.current = null;
    // `options` stays set so the content does not blank out during the exit animation.
    setOpen(false);
  }, []);

  useEffect(
    () => () => {
      resolveRef.current?.(false);
      resolveRef.current = null;
    },
    [],
  );

  const confirmDialog = options ? (
    <ConfirmDialog {...options} open={open} onConfirm={() => settle(true)} onCancel={() => settle(false)} />
  ) : null;

  return { confirm, confirmDialog };
}
