"use client";

import * as ReactDOM from "react-dom";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode, Ref } from "react";
import { FieldSpinner } from "../FormField/FieldSpinner";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./PendingSubmit.module.css";

/** Later labels for a long action: `[[4000, "Still working…"]]` shows that text after four seconds of waiting. */
export type PendingProgress = readonly (readonly [afterMs: number, label: string])[];

export type PendingSubmitProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> & {
  /** The label while idle ("Save changes"). */
  children: ReactNode;
  /** The label while the form is submitting ("Saving…"). It is announced to assistive technology. */
  pendingLabel: string;
  /** Labels that replace `pendingLabel` after a delay, for actions that can take long. */
  progress?: PendingProgress;
  /**
   * Treat the button as pending although the form is not (yet). Use it to drive the button from `useActionState`, a
   * `useTransition` or your own request state. It is combined with the form's own pending state.
   */
  pending?: boolean;
  /** `"primary"` (default) is the filled accent button; `"secondary"` is outlined. */
  variant?: "primary" | "secondary";
  ref?: Ref<HTMLButtonElement>;
};

/**
 * `useFormStatus` exists from React 19, which is this package's peer dependency. The lookup is defensive so a build that
 * resolves an older `react-dom` degrades to the `pending` prop instead of failing at import.
 */
const useFormStatus: () => { pending: boolean } =
  (ReactDOM as { useFormStatus?: () => { pending: boolean } }).useFormStatus ?? (() => ({ pending: false }));

/** Past the longest step a label never changes again, so the last step hides never. */
const FOREVER_MS = 86_400_000;

/**
 * The submit button of a form that takes a moment. While the form is pending it cannot be submitted again, shows a ring and
 * the pending label, and moves through `progress` labels on a long wait. It reads the pending state of the enclosing
 * `<form>` through React 19's `useFormStatus`, and `pending` lets any other state drive it.
 *
 * The button stays focusable and keeps its place while pending (`aria-disabled`, not `disabled`), so keyboard focus is not
 * lost. A press, and Enter inside a field, are swallowed until the form settles. Progress labels are timed in CSS, not React
 * state: a state update during a form transition would re-render the button outside the transition and drop its pending state.
 */
export function PendingSubmit({
  children,
  pendingLabel,
  progress = [],
  pending = false,
  variant = "primary",
  disabled,
  className,
  onClick,
  ref,
  ...rest
}: PendingSubmitProps) {
  const status = useFormStatus();
  const busy = pending || status.pending;
  const steps: [number, string][] = [
    [0, pendingLabel],
    ...progress.map(([ms, label]) => [ms, label] as [number, string]),
  ];

  return (
    <>
      <button
        {...rest}
        ref={ref}
        type="submit"
        className={[styles.root, className].filter(Boolean).join(" ")}
        data-variant={variant}
        data-pending={busy ? "" : undefined}
        disabled={disabled}
        aria-busy={busy || undefined}
        aria-disabled={busy || undefined}
        onClick={(event) => {
          // Cancelling the click also cancels the implicit submission that Enter in a text field performs.
          if (busy) event.preventDefault();
          else onClick?.(event);
        }}
      >
        <span className={styles.label}>{children}</span>
        {/* Invisible copies of every label keep the button as wide as the longest one, so it does not jump. */}
        {steps.map(([, label], index) => (
          <span key={index} className={styles.sizer} aria-hidden="true">
            {label}
          </span>
        ))}
        {busy ? (
          <span className={styles.pending} aria-hidden="true">
            <FieldSpinner className={styles.spinner} />
            <span className={styles.steps}>
              {steps.map(([ms, label], index) => (
                <span
                  key={index}
                  className={index === 0 && steps.length === 1 ? styles.only : styles.step}
                  style={
                    {
                      "--on": `${ms}ms`,
                      "--off": `${steps[index + 1]?.[0] ?? FOREVER_MS}ms`,
                    } as CSSProperties
                  }
                >
                  {label}
                </span>
              ))}
            </span>
          </span>
        ) : null}
      </button>
      {/* A live region has to exist before its text changes to be announced reliably, so it sits outside the button. */}
      <VisuallyHidden role="status">{busy ? pendingLabel : ""}</VisuallyHidden>
    </>
  );
}
