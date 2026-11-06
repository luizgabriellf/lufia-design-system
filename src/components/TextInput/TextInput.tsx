"use client";

import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { useFormFieldControl } from "../FormField";
import fieldStyles from "../FormField/fieldControl.module.css";

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "prefix" | "size" | "className"> & {
  /** Content before the text: a unit, a currency sign, a decorative icon (give an icon `aria-hidden`). */
  prefix?: ReactNode;
  /** Content after the text: a unit, a button. */
  suffix?: ReactNode;
  /** Marks the control invalid without a `FormField`. Inside a field the error does it. */
  invalid?: boolean;
  /** Goes on the box that draws the border; the native input gets the rest props. */
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

/**
 * A single-line text control with optional prefix and suffix slots. Inside a `FormField` it takes its id, description,
 * invalid, required and disabled state from the field. Rest props, `ref` and `type` go to the native `<input>`.
 */
export function TextInput({
  prefix,
  suffix,
  invalid,
  className,
  type = "text",
  readOnly,
  ref,
  ...rest
}: TextInputProps) {
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
      data-readonly={readOnly ? "" : undefined}
    >
      {prefix ? <span className={fieldStyles.affix}>{prefix}</span> : null}
      <input
        {...rest}
        {...control}
        ref={ref}
        type={type}
        readOnly={readOnly}
        className={fieldStyles.native}
      />
      {suffix ? <span className={fieldStyles.affix}>{suffix}</span> : null}
    </span>
  );
}
