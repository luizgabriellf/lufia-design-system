"use client";

import { useId, type ChangeEvent, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { FieldError, FieldHint } from "../FormField/FieldMessages";
import styles from "./Switch.module.css";

export type SwitchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "role" | "size" | "children" | "className" | "value" | "defaultValue"
> & {
  /** The visible label. Clicking it toggles the switch. */
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Submitted as `name=value` while on. Defaults to `"on"`, like a checkbox. */
  value?: string;
  /** Called with the new state. A plain `onChange` also works; both fire. */
  onCheckedChange?: (checked: boolean) => void;
  /** Goes on the root element. */
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

/**
 * The form-submitting `Switch`: a native `<input type="checkbox" role="switch">`, so the browser owns the state. Its value is
 * read from the form (`FormData`, `form.elements`), a `form` reset restores `defaultChecked`, and `required` and
 * `form="id"` work as on a checkbox. Leave it uncontrolled with `defaultChecked`, or control it with `checked`.
 *
 * Use it in a form that is saved with a submit button; for a setting that takes effect at once, use `Switch`.
 */
export function SwitchInput({
  label,
  hint,
  error,
  value = "on",
  onCheckedChange,
  onChange,
  className,
  id,
  disabled,
  ref,
  ...rest
}: SwitchInputProps) {
  const generated = useId();
  const baseId = id ?? `switch-${generated.replace(/:/g, "")}`;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy = [rest["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-disabled={disabled ? "" : undefined}
      data-invalid={error ? "" : undefined}
    >
      <div className={styles.row}>
        <input
          {...rest}
          ref={ref}
          id={baseId}
          type="checkbox"
          role="switch"
          value={value}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          disabled={disabled}
          className={styles.input}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onChange?.(event);
            onCheckedChange?.(event.currentTarget.checked);
          }}
        />
        <label htmlFor={baseId} className={styles.label}>
          {label}
        </label>
      </div>
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
