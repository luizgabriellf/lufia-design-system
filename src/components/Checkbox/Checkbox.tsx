"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { FieldError, FieldHint } from "../FormField/FieldMessages";
import styles from "./Checkbox.module.css";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "className"> & {
  /** The visible label, to the side of the box. Required: a checkbox without text is not understandable. */
  label: ReactNode;
  /** Help under the label, linked with `aria-describedby`. */
  hint?: ReactNode;
  /** Error under the label. Marks the checkbox `aria-invalid`. */
  error?: ReactNode;
  /**
   * The mixed state of a parent whose children are partly checked. It is a display state: the native `checked` stays what
   * it was, and the person's click sets it to a plain checked or unchecked value, so the next render should clear this prop.
   */
  indeterminate?: boolean;
  /**
   * `md` (default) is the 16px label in a 44px row. `sm` is for dense panels: a 14px label in a shorter row, so it sits
   * next to 13px helper text. The drawn box and its 24px target are the same in both.
   */
  size?: "md" | "sm";
  /** Goes on the root element. */
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

/**
 * A native checkbox with a drawn box, a clickable label, an optional hint and error, and the mixed state. The native input
 * stays in the form, so `name`, `value` and `required` work without script.
 */
export function Checkbox({
  label,
  hint,
  error,
  indeterminate = false,
  size = "md",
  className,
  id,
  required,
  disabled,
  ref,
  ...rest
}: CheckboxProps) {
  const generated = useId();
  const baseId = id ?? `checkbox-${generated.replace(/:/g, "")}`;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy = [rest["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;
  const input = useRef<HTMLInputElement | null>(null);

  // `indeterminate` exists only as a DOM property, so it is set after render.
  useEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      input.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-disabled={disabled ? "" : undefined}
      data-invalid={error ? "" : undefined}
      data-size={size === "sm" ? "sm" : undefined}
    >
      <label className={styles.row} htmlFor={baseId}>
        <input
          {...rest}
          ref={setRefs}
          id={baseId}
          type="checkbox"
          required={required}
          disabled={disabled}
          className={styles.input}
          aria-describedby={describedBy}
          aria-invalid={error ? true : rest["aria-invalid"]}
        />
        <span className={styles.label}>
          {label}
          {required ? (
            <span className={styles.mark} aria-hidden="true">
              *
            </span>
          ) : null}
        </span>
      </label>
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
