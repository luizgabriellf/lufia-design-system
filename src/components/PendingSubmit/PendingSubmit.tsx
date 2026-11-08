"use client";

import * as ReactDOM from "react-dom";
import type { ButtonHTMLAttributes, CSSProperties, MouseEvent, ReactNode, Ref } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "../Button";
import { FieldSpinner } from "../FormField/FieldSpinner";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./PendingSubmit.module.css";

/** Later labels for a long action: `[[4000, "Still working…"]]` shows that text after four seconds of waiting. */
export type PendingProgress = readonly (readonly [afterMs: number, label: string])[];

/** A `Button` variant, or `unstyled` for a plain button that takes its whole look from `className`. */
export type PendingSubmitVariant = ButtonVariant | "unstyled";

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
  /**
   * Look of the underlying `Button`. Default `"primary"`. `"unstyled"` drops the package look and renders a plain
   * `<button>` that carries only `className` (and the pending ring and labels): for an app that keeps its own button
   * classes while it moves to `Button`. `size` and `fullWidth` do nothing then.
   */
  variant?: PendingSubmitVariant;
  /** Size of the underlying `Button`. Ignored with `variant="unstyled"`. */
  size?: ButtonSize;
  /** Stretches to the full width of its container. Ignored with `variant="unstyled"`. */
  fullWidth?: boolean;
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
 * The submit button of a form that takes a moment, built on `Button`. While the form is pending it cannot be submitted again, shows a ring and
 * the pending label, and moves through `progress` labels on a long wait. It reads the pending state of the enclosing
 * `<form>` through React 19's `useFormStatus`, and `pending` lets any other state drive it.
 *
 * The button stays focusable and keeps its place while pending (`aria-busy`, `aria-disabled` and a cancelled click, not `disabled`), so keyboard focus is not
 * lost. A press, and Enter inside a field, are swallowed until the form settles. Progress labels are timed in CSS, not React
 * state: a state update during a form transition would re-render the button outside the transition and drop its pending state.
 */
export function PendingSubmit({
  children,
  pendingLabel,
  progress = [],
  pending = false,
  variant = "primary",
  size,
  fullWidth,
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

  const shared = {
    ...rest,
    ref,
    type: "submit" as const,
    // `className` is added to the package's own classes, never in place of them.
    className: [styles.root, className].filter(Boolean).join(" "),
    disabled,
    "aria-busy": busy || undefined,
    "aria-disabled": busy || undefined,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      // Cancelling the click also cancels the implicit submission that Enter in a text field performs.
      if (busy) event.preventDefault();
      else onClick?.(event);
    },
  };
  const content = (
    <span className={styles.cell} data-pending={busy ? "" : undefined}>
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
    </span>
  );

  return (
    <>
      {variant === "unstyled" ? (
        <button {...shared} data-variant="unstyled">
          {content}
        </button>
      ) : (
        <Button {...shared} variant={variant} size={size} fullWidth={fullWidth}>
          {content}
        </Button>
      )}
      {/* A live region has to exist before its text changes to be announced reliably, so it sits outside the button. */}
      <VisuallyHidden role="status">{busy ? pendingLabel : ""}</VisuallyHidden>
    </>
  );
}
