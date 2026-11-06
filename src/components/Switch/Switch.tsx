"use client";

import { useId, useRef, type ButtonHTMLAttributes, type ReactNode, type Ref } from "react";
import { FieldError, FieldHint } from "../FormField/FieldMessages";
import { useControllableState } from "../FormField/useControllableState";
import { useFormReset } from "../FormField/useFormReset";
import styles from "./Switch.module.css";

export type SwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "role" | "onChange" | "value" | "defaultValue" | "children" | "className"
> & {
  /** The visible label. Clicking it toggles the switch. */
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Controlled state. */
  checked?: boolean;
  /** Initial state when `checked` is not given. */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Submitted as `name=value` while on, like a checkbox. Without `name` nothing is submitted. */
  name?: string;
  value?: string;
  /** Goes on the root element. */
  className?: string;
  ref?: Ref<HTMLButtonElement>;
};

/**
 * An on/off control that takes effect at once, such as a setting: a `role="switch"` button with a label, an optional hint
 * and error, and a thumb that slides. For a choice that is saved with a form, use a `Checkbox`.
 */
export function Switch({
  label,
  hint,
  error,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  name,
  value = "on",
  className,
  id,
  disabled,
  onClick,
  ref,
  ...rest
}: SwitchProps) {
  const generated = useId();
  const baseId = id ?? `switch-${generated.replace(/:/g, "")}`;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy = [rest["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;
  const [checked, setChecked] = useControllableState(checkedProp, defaultChecked, onCheckedChange);
  const root = useRef<HTMLDivElement>(null);
  useFormReset(root, () => setChecked(defaultChecked));

  return (
    <div
      ref={root}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-disabled={disabled ? "" : undefined}
      data-invalid={error ? "" : undefined}
    >
      <div className={styles.row}>
        <button
          {...rest}
          ref={ref}
          id={baseId}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          disabled={disabled}
          className={styles.switch}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) setChecked(!checked);
          }}
        >
          <span className={styles.thumb} aria-hidden="true" />
        </button>
        <label htmlFor={baseId} className={styles.label}>
          {label}
        </label>
      </div>
      {name && checked ? <input type="hidden" name={name} value={value} /> : null}
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
