"use client";

import type { ReactNode, Ref, SelectHTMLAttributes } from "react";
import { useFormFieldControl } from "../FormField";
import fieldStyles from "../FormField/fieldControl.module.css";
import styles from "./Select.module.css";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size" | "className" | "children"> & {
  /** The choices. Use `children` instead for `<optgroup>`s. */
  options?: readonly SelectOption[];
  /** `<option>` and `<optgroup>` elements, when `options` is not enough. */
  children?: ReactNode;
  /**
   * Text of the empty first choice ("Choose a country"). It is selectable only before a choice is made: once chosen, the
   * person cannot go back to nothing unless the field is optional, so set `allowEmpty` for that.
   */
  placeholder?: string;
  /** Keeps the placeholder choosable after a value is picked, for optional fields. */
  allowEmpty?: boolean;
  /** Marks the control invalid without a `FormField`. Inside a field the error does it. */
  invalid?: boolean;
  /** Goes on the box that draws the border; the native select gets the rest props. */
  className?: string;
  ref?: Ref<HTMLSelectElement>;
};

/**
 * A native `<select>` in the shared field box with a drawn chevron. The browser keeps its own list, keyboard handling,
 * typeahead and mobile picker, which is the right call for a plain choice list. For search, async data or rich options,
 * use `Combobox`. Inside a `FormField` the field's id, description and states apply.
 */
export function Select({
  options,
  children,
  placeholder,
  allowEmpty = false,
  invalid,
  className,
  ref,
  ...rest
}: SelectProps) {
  const control = useFormFieldControl({
    id: rest.id,
    "aria-describedby": rest["aria-describedby"],
    "aria-invalid": invalid ? true : rest["aria-invalid"],
    required: rest.required,
    disabled: rest.disabled,
  });
  return (
    <span
      className={[fieldStyles.box, className].filter(Boolean).join(" ")}
      data-invalid={control["aria-invalid"] ? "" : undefined}
      data-disabled={control.disabled ? "" : undefined}
    >
      <select {...rest} {...control} ref={ref} className={[fieldStyles.native, styles.native].join(" ")}>
        {placeholder !== undefined ? (
          <option value="" disabled={!allowEmpty} hidden={!allowEmpty}>
            {placeholder}
          </option>
        ) : null}
        {options?.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <span className={[fieldStyles.affix, styles.chevron].join(" ")} aria-hidden="true">
        <svg viewBox="0 0 16 16" width="16" height="16" focusable="false">
          <path
            d="M3.5 6l4.5 4.5L12.5 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}
