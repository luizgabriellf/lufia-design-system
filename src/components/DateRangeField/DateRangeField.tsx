"use client";

import {
  useId,
  useInsertionEffect,
  useRef,
  type FieldsetHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { DateField, type DateFieldType } from "../DateField";
import { FormField } from "../FormField";
import { FieldError, FieldHint } from "../FormField/FieldMessages";
import { useControllableState } from "../FormField/useControllableState";
import styles from "./DateRangeField.module.css";

/** The two ends of a range, as the native controls emit them. `""` is an end that is not set. */
export type DateRange = { start: string; end: string };

export type DateRangeFieldProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "children" | "defaultValue" | "onChange" | "className"
> & {
  /** Names the group, as a `<legend>` ("Stay"). */
  legend: ReactNode;
  /** The label of the first field ("From"). */
  startLabel: ReactNode;
  /** The label of the second field ("To"). */
  endLabel: ReactNode;
  /** Which native control both ends use. `date` (default), `time`, `datetime-local` or `month`. */
  type?: DateFieldType;
  /** Controlled range. */
  value?: DateRange;
  defaultValue?: DateRange;
  /**
   * Called once with the whole range whenever either end changes. The order is enforced: when an edit would put the start
   * after the end, the end just edited is kept and the other end moves to the same value (both ends equal), and the range
   * reported here is already corrected.
   */
  onValueChange?: (value: DateRange) => void;
  /** The earliest value of the range. The end also cannot go below the start. */
  min?: string;
  /** The latest value of the range. The start also cannot go above the end. */
  max?: string;
  /** The step of both native controls. */
  step?: number | string;
  /** Names the form entries of the two ends, so they submit as `startName=…&endName=…`. */
  startName?: string;
  endName?: string;
  /** Help shown under the group, linked to it with `aria-describedby`. */
  hint?: ReactNode;
  /** Error text for the group. It marks both ends invalid and shows the message with an icon. */
  error?: ReactNode;
  /** Marks both ends required; each label shows the mark and the text for assistive technology. */
  required?: boolean;
  /** As on `FormField`: whether `required` also sets the native `required` attribute. Defaults to `true`. */
  nativeRequired?: boolean;
  /** Text read after a label when `required`. Defaults to the `required` label of `LufiaProvider`. */
  requiredLabel?: string;
  /** The accessible name of the clear buttons, in your language. See `DateField`. */
  clearLabel?: string;
  /** Goes on the fieldset. */
  className?: string;
  ref?: Ref<HTMLFieldSetElement>;
};

const EMPTY: DateRange = { start: "", end: "" };

/** The smaller of two ISO strings of one format, ignoring an empty one. */
const lower = (a: string, b: string) => (a && b ? (a < b ? a : b) : a || b);
/** The larger of two ISO strings of one format, ignoring an empty one. */
const upper = (a: string, b: string) => (a && b ? (a > b ? a : b) : a || b);

/**
 * Two `DateField`s that form one range, in a fieldset named by a legend. The start is never after the end: the native `max`
 * and `min` steer the picker, and a typed or picked value that would break the order is corrected, the end just edited is
 * kept and the other end moves to the same value, reported in one `onValueChange`. Any `min` and `max` of the whole range
 * apply on top. The ends sit side by side and stack when the room is narrow.
 */
export function DateRangeField({
  legend,
  startLabel,
  endLabel,
  type = "date",
  value: valueProp,
  defaultValue = EMPTY,
  onValueChange,
  min = "",
  max = "",
  step,
  startName,
  endName,
  hint,
  error,
  required,
  nativeRequired,
  requiredLabel,
  clearLabel,
  disabled,
  className,
  id,
  ref,
  "aria-describedby": describedByProp,
  ...rest
}: DateRangeFieldProps) {
  const generated = useId();
  const baseId = id ?? `daterange-${generated.replace(/:/g, "")}`;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy = [describedByProp, hintId, errorId].filter(Boolean).join(" ") || undefined;
  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
  // Both ends can change in one event (a form reset), so the second change must start from the first.
  const latest = useRef(value);
  useInsertionEffect(() => {
    latest.current = value;
  });
  // The end the person just edited wins: when it would put the start after the end, the other end moves to the same value.
  const update = (edited: keyof DateRange, next: string) => {
    const range = { ...latest.current, [edited]: next };
    if (range.start && range.end && range.start > range.end) {
      if (edited === "start") range.end = range.start;
      else range.start = range.end;
    }
    latest.current = range;
    setValue(range);
  };
  const changeStart = (next: string) => update("start", next);
  const changeEnd = (next: string) => update("end", next);

  return (
    <fieldset
      {...rest}
      ref={ref}
      id={baseId}
      disabled={disabled}
      aria-describedby={describedBy}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-invalid={error ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-lufia-part="field"
    >
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.ends}>
        <FormField
          label={startLabel}
          required={required}
          nativeRequired={nativeRequired}
          requiredLabel={requiredLabel}
          disabled={disabled}
          id={`${baseId}-start`}
        >
          <DateField
            type={type}
            name={startName}
            value={value.start}
            defaultValue={defaultValue.start}
            onValueChange={changeStart}
            min={min || undefined}
            max={lower(value.end, max) || undefined}
            step={step}
            invalid={Boolean(error)}
            aria-describedby={errorId}
            clearLabel={clearLabel}
          />
        </FormField>
        <FormField
          label={endLabel}
          required={required}
          nativeRequired={nativeRequired}
          requiredLabel={requiredLabel}
          disabled={disabled}
          id={`${baseId}-end`}
        >
          <DateField
            type={type}
            name={endName}
            value={value.end}
            defaultValue={defaultValue.end}
            onValueChange={changeEnd}
            min={upper(value.start, min) || undefined}
            max={max || undefined}
            step={step}
            invalid={Boolean(error)}
            aria-describedby={errorId}
            clearLabel={clearLabel}
          />
        </FormField>
      </div>
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </fieldset>
  );
}
