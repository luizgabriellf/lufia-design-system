"use client";

import type { ReactNode, Ref, SelectHTMLAttributes } from "react";
import { useFormFieldControl } from "../FormField";
import { ChevronDownIcon } from "../Icon/icons";
import fieldStyles from "../FormField/fieldControl.module.css";
import styles from "./Select.module.css";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectOptionGroup = {
  /** Heading of the group, drawn by the browser. */
  label: string;
  options: readonly SelectOption[];
  /** Disables every option of the group. */
  disabled?: boolean;
};

export type SelectSize = "md" | "sm";
export type SelectVariant = "default" | "pill";

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size" | "className" | "children"> & {
  /**
   * `sm` is the compact control for toolbars and filter rows: a shorter box that sizes to its content instead of filling
   * the row, so it sits beside buttons. On touch screens and phone widths it grows to the touch target, like `Button`.
   * Give it an `aria-label` or a visually hidden label. Default `md`.
   */
  size?: SelectSize;
  /** `pill` rounds the box fully, to match pill-shaped buttons and chips in the same row. Default `default`. */
  variant?: SelectVariant;
  /** The choices. Use `groups` for `<optgroup>`s. */
  options?: readonly SelectOption[];
  /** Labelled groups of choices, rendered as `<optgroup>`s after `options`. */
  groups?: readonly SelectOptionGroup[];
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

const renderOption = (option: SelectOption) => (
  <option key={option.value} value={option.value} disabled={option.disabled}>
    {option.label}
  </option>
);

/**
 * A native `<select>` in the shared field box with a drawn chevron. The browser keeps its own list, keyboard handling,
 * typeahead and mobile picker, which is the right call for a plain choice list. For search, async data or rich options,
 * use `Combobox`. Inside a `FormField` the field's id, description and states apply. `size="sm"` (with `variant="pill"` for
 * a rounded box) is the compact form for a toolbar or filter row.
 */
export function Select({
  options,
  groups,
  children,
  placeholder,
  allowEmpty = false,
  invalid,
  size = "md",
  variant = "default",
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
      className={[fieldStyles.box, styles.box, className].filter(Boolean).join(" ")}
      data-size={size === "md" ? undefined : size}
      data-variant={variant === "default" ? undefined : variant}
      data-invalid={control["aria-invalid"] ? "" : undefined}
      data-disabled={control.disabled ? "" : undefined}
    >
      <select {...rest} {...control} ref={ref} className={[fieldStyles.native, styles.native].join(" ")}>
        {placeholder !== undefined ? (
          <option value="" disabled={!allowEmpty} hidden={!allowEmpty}>
            {placeholder}
          </option>
        ) : null}
        {options?.map(renderOption)}
        {groups?.map((group, index) => (
          <optgroup key={`${index}:${group.label}`} label={group.label} disabled={group.disabled}>
            {group.options.map(renderOption)}
          </optgroup>
        ))}
        {children}
      </select>
      <span className={[fieldStyles.affix, styles.chevron].join(" ")} aria-hidden="true">
        <ChevronDownIcon size={size === "sm" ? "sm" : "md"} />
      </span>
    </span>
  );
}
