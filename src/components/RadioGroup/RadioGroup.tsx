"use client";

import { useId, useRef, useState, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { FieldError, FieldHint } from "../FormField/FieldMessages";
import { useControllableState } from "../FormField/useControllableState";
import { useFormReset } from "../FormField/useFormReset";
import { useSubmitIntent } from "../FormField/useSubmitIntent";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./RadioGroup.module.css";
import { useRadioKeys } from "./useRadioKeys";

export type RadioOption = {
  value: string;
  label: ReactNode;
  /** A line under the label that says more about this choice. */
  description?: ReactNode;
  disabled?: boolean;
};

export type RadioGroupProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "children"
> & {
  /** Names the group, like a `<legend>`. */
  label: ReactNode;
  options: readonly RadioOption[];
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Controlled value. `""` means nothing chosen. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Submitted with the form as `name=value`. */
  name?: string;
  /** `"vertical"` (default) stacks the options; `"horizontal"` wraps them in a row. */
  orientation?: "vertical" | "horizontal";
  /** Text read after the label when `required`. Aria-only: the visible mark is a glyph. */
  requiredLabel?: string;
  /** Shown when a required group is submitted with nothing chosen. Defaults to the browser's own message. */
  requiredMessage?: string;
  ref?: Ref<HTMLDivElement>;
};

/**
 * One choice from a short list, as a WAI-ARIA radio group with roving focus: Tab enters the group at the chosen option, the
 * arrow keys move and choose, wrapping and skipping disabled options. Each option may carry a description.
 */
export function RadioGroup({
  label,
  options,
  hint,
  error,
  required,
  disabled,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  name,
  orientation = "vertical",
  requiredLabel = "required",
  requiredMessage,
  className,
  id,
  ref,
  ...rest
}: RadioGroupProps) {
  const generated = useId();
  const baseId = id ?? `radiogroup-${generated.replace(/:/g, "")}`;
  const labelId = `${baseId}-label`;
  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
  const [missing, setMissing] = useState<{ message: string; count: number } | null>(null);
  const hintId = hint ? `${baseId}-hint` : undefined;
  // A refused submission shows its message as an error until something is chosen.
  const shownError = error ?? (missing && !value ? missing.message : null);
  const errorId = shownError ? `${baseId}-error` : undefined;
  const items = options.map((option) => ({ value: option.value, disabled: disabled || option.disabled }));
  // Choosing something settles a refused submission.
  const choose = (next: string) => {
    setMissing(null);
    setValue(next);
  };
  const keys = useRadioKeys(items, value, choose);
  const root = useRef<HTMLDivElement>(null);
  const submitting = useSubmitIntent(root);
  useFormReset(root, () => {
    setMissing(null);
    setValue(defaultValue);
  });

  return (
    <div
      ref={root}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-invalid={shownError ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      <span id={labelId} className={styles.legend}>
        {label}
        {required ? (
          <>
            <span className={styles.mark} aria-hidden="true">
              *
            </span>
            <VisuallyHidden> ({requiredLabel})</VisuallyHidden>
          </>
        ) : null}
      </span>
      {/* The group is not focusable by design (APG): the chosen radio is, and key events bubble up from it. */}
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
      <div
        {...rest}
        ref={ref}
        id={baseId}
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={[rest["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined}
        aria-required={required || undefined}
        aria-invalid={shownError ? true : undefined}
        aria-disabled={disabled || undefined}
        className={styles.group}
        data-orientation={orientation}
        onKeyDown={(event) => {
          rest.onKeyDown?.(event);
          if (!event.defaultPrevented) keys.onKeyDown(event);
        }}
      >
        {options.map((option, index) => {
          const checked = option.value === value;
          const isDisabled = disabled || option.disabled;
          const optionId = `${baseId}-option-${index}`;
          return (
            <button
              key={option.value}
              id={optionId}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-labelledby={`${optionId}-label`}
              aria-describedby={option.description ? `${optionId}-description` : undefined}
              data-radio-index={index}
              disabled={isDisabled}
              tabIndex={option.value === keys.tabbable ? 0 : -1}
              className={styles.option}
              onClick={() => choose(option.value)}
            >
              <span className={styles.circle} aria-hidden="true" />
              <span className={styles.text}>
                <span id={`${optionId}-label`} className={styles.optionLabel}>
                  {option.label}
                </span>
                {option.description ? (
                  <span id={`${optionId}-description`} className={styles.description}>
                    {option.description}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      {name && value ? <input type="hidden" name={name} value={value} /> : null}
      {/*
        Radios are buttons, which the browser never validates. A required group therefore carries an invisible text input
        that is empty until something is chosen: it makes the form refuse to submit and shows the browser's own message.
        It has no name, so it is not submitted, and it is hidden from assistive technology (the group has aria-required).
      */}
      {required && !disabled ? (
        <input
          className={styles.validity}
          tabIndex={-1}
          aria-hidden="true"
          required
          value={value}
          onChange={() => {}}
          onInvalid={(event) => {
            // The browser would point its bubble at an invisible field. Show the message on the group instead.
            event.preventDefault();
            const mirror = event.currentTarget;
            const message =
              requiredMessage ?? (mirror.validationMessage || "Please select one of these options.");
            setMissing((previous) => ({ message, count: (previous?.count ?? 0) + 1 }));
            // `checkValidity()` fires this too and must stay silent, so focus moves only for a real attempt (a submit
            // click or Enter) and only when this is the first invalid control. Fieldsets report invalid themselves, so
            // they are skipped when looking for the first one.
            const form = mirror.form;
            const first =
              form &&
              Array.from(form.elements).find(
                (el) => !(el instanceof HTMLFieldSetElement) && !(el as HTMLInputElement).validity.valid,
              );
            if (submitting.current && first === mirror) {
              root.current?.querySelector<HTMLElement>('[data-radio-index][tabindex="0"]')?.focus();
            }
          }}
        />
      ) : null}
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {shownError ? (
        <FieldError key={missing?.count ?? 0} id={errorId}>
          {shownError}
        </FieldError>
      ) : null}
    </div>
  );
}
