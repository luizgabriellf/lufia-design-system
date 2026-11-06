"use client";

import { useId, type HTMLAttributes, type ReactNode } from "react";
import { VisuallyHidden } from "../VisuallyHidden";
import { FieldError, FieldHint } from "./FieldMessages";
import { FormFieldContext, type FormFieldControlProps } from "./FormFieldContext";
import styles from "./FormField.module.css";

export type FormFieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The visible label. Every control needs one. */
  label: ReactNode;
  /** Help shown under the control, linked to it with `aria-describedby`. */
  hint?: ReactNode;
  /** Error text. Its presence marks the control `aria-invalid` and shows the message with an icon. */
  error?: ReactNode;
  /** Marks the control required and shows an asterisk plus text for assistive technology. */
  required?: boolean;
  disabled?: boolean;
  /** Text read after the label when `required`. Aria-only: the visible mark is a glyph. */
  requiredLabel?: string;
  /** Base id of the control; the hint and error ids derive from it. Generated when omitted. */
  id?: string;
  /**
   * The control. A node reaches the controls of this package through context; a function receives the props to spread on
   * any other control (a third-party input, a native element).
   */
  children: ReactNode | ((control: FormFieldControlProps) => ReactNode);
};

/**
 * Wires a label, a hint and an error to one control: the label targets it, the hint and error describe it, an error sets
 * `aria-invalid`, and a required field says so in text and not only with a mark. Controls of the package pick the ids up
 * from context; anything else takes them from the render prop.
 */
export function FormField({
  label,
  hint,
  error,
  required,
  disabled,
  requiredLabel = "required",
  id,
  className,
  children,
  ...rest
}: FormFieldProps) {
  const generated = useId();
  const baseId = id ?? `field-${generated.replace(/:/g, "")}`;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const control: FormFieldControlProps = {
    id: baseId,
    "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
    "aria-invalid": error ? true : undefined,
    required: required || undefined,
    disabled: disabled || undefined,
  };

  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-invalid={error ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      <label id={`${baseId}-label`} htmlFor={baseId} className={styles.label}>
        {label}
        {required ? (
          <>
            <span className={styles.mark} aria-hidden="true">
              *
            </span>
            <VisuallyHidden> ({requiredLabel})</VisuallyHidden>
          </>
        ) : null}
      </label>
      <FormFieldContext.Provider value={control}>
        {typeof children === "function" ? children(control) : children}
      </FormFieldContext.Provider>
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
