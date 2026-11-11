"use client";

import { useEffect, useRef, useState, type InputHTMLAttributes, type Ref } from "react";
import { useFormFieldControl } from "../FormField";
import fieldStyles from "../FormField/fieldControl.module.css";
import { useControllableState } from "../FormField/useControllableState";
import { useFormReset } from "../FormField/useFormReset";
import { CalendarIcon, ClockIcon, CloseIcon } from "../Icon/icons";
import styles from "./DateField.module.css";

/** The native control a `DateField` wraps. */
export type DateFieldType = "date" | "time" | "datetime-local" | "month";

export type DateFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "value" | "defaultValue" | "className" | "min" | "max" | "step" | "prefix"
> & {
  /** Which native control to render. `date` (default), `time`, `datetime-local` or `month`. */
  type?: DateFieldType;
  /** Controlled value, as the native control emits it: `2030-01-31`, `14:30`, `2030-01-31T14:30` or `2030-01`. `""` is empty. */
  value?: string;
  defaultValue?: string;
  /** Called with the value the native control emits, or `""` when it is emptied or cleared. */
  onValueChange?: (value: string) => void;
  /** The earliest value, in the same format as `value`. */
  min?: string;
  /** The latest value, in the same format as `value`. */
  max?: string;
  /** The step of the native control: days for `date`, seconds for `time` and `datetime-local`, months for `month`. */
  step?: number | string;
  /**
   * The accessible name of a clear button, in your language. Giving it adds the button, which shows only while the field
   * has a value and is neither required, disabled nor read-only. Aria-only: the package has no copy.
   */
  clearLabel?: string;
  /** Marks the control invalid without a `FormField`. Inside a field the error does it. */
  invalid?: boolean;
  /** Goes on the box that draws the border; the native input gets the rest props. */
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

/**
 * Whether the package icon can stand in for the native picker indicator: the browser must open the picker from a script
 * (`showPicker`) and expose a pseudo-element that lets us hide its own indicator. Where either is missing the native
 * indicator stays and no package icon is drawn, so the person always has exactly one way in.
 */
function canReplacePickerIndicator(input: HTMLInputElement | null): boolean {
  if (!input || typeof input.showPicker !== "function") return false;
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
  return CSS.supports("selector(::-webkit-calendar-picker-indicator)");
}

/**
 * A native date, time, date-and-time or month control in the shared field box: same height, padding, focus ring and states
 * as `TextInput`, a calendar or clock icon, and an optional clear button. The browser keeps its own editing, keyboard and
 * mobile picker. Inside a `FormField` the field's id, description and states apply. Values are strings, as the native control
 * emits them; there is no `Date` conversion and no time zone.
 */
export function DateField({
  type = "date",
  value: valueProp,
  defaultValue = "",
  onValueChange,
  clearLabel,
  invalid,
  className,
  readOnly,
  onChange,
  ref,
  ...rest
}: DateFieldProps) {
  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
  const control = useFormFieldControl({
    id: rest.id,
    "aria-describedby": rest["aria-describedby"],
    "aria-invalid": invalid ? true : rest["aria-invalid"],
    required: rest.required,
    disabled: rest.disabled,
  });
  const input = useRef<HTMLInputElement | null>(null);
  const [pickerIcon, setPickerIcon] = useState(false);
  useEffect(() => setPickerIcon(canReplacePickerIndicator(input.current)), []);
  useFormReset(input, () => setValue(defaultValue));

  const required = Boolean(control.required || control["aria-required"]);
  const showClear = Boolean(clearLabel) && value !== "" && !required && !control.disabled && !readOnly;
  const Icon = type === "time" ? ClockIcon : CalendarIcon;

  const clear = () => {
    setValue("");
    input.current?.focus();
  };

  const openPicker = () => {
    if (control.disabled || readOnly) return;
    try {
      input.current?.focus();
      input.current?.showPicker();
    } catch {
      // The browser refused (no user activation, a hidden control): the field is still usable by typing.
    }
  };

  return (
    <span
      className={[fieldStyles.box, styles.box, className].filter(Boolean).join(" ")}
      data-invalid={control["aria-invalid"] ? "" : undefined}
      data-disabled={control.disabled ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      data-type={type}
    >
      <input
        {...rest}
        {...control}
        ref={(node) => {
          input.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type={type}
        value={value}
        readOnly={readOnly}
        data-empty={value === "" ? "" : undefined}
        data-picker-icon={pickerIcon ? "" : undefined}
        className={[fieldStyles.native, styles.native].join(" ")}
        onChange={(event) => {
          onChange?.(event);
          setValue(event.target.value);
        }}
      />
      {showClear ? (
        <button type="button" className={styles.clear} aria-label={clearLabel} onClick={clear}>
          <CloseIcon size="sm" />
        </button>
      ) : null}
      {pickerIcon ? (
        // Pointer convenience only: the native input stays the keyboard and assistive-technology path.
        <span className={[fieldStyles.affix, styles.icon].join(" ")} aria-hidden="true" onClick={openPicker}>
          <Icon size="sm" />
        </span>
      ) : null}
    </span>
  );
}
