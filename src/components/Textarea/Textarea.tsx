"use client";

import { useId, useState, type ReactNode, type Ref, type TextareaHTMLAttributes } from "react";
import { useFormFieldControl } from "../FormField";
import fieldStyles from "../FormField/fieldControl.module.css";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./Textarea.module.css";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  /** Marks the control invalid without a `FormField`. Inside a field the error does it. */
  invalid?: boolean;
  /** Shows a character count under the box. With `maxLength` it reads "12 / 200". */
  showCount?: boolean;
  /** Text of the count. Defaults to `12 / 200` with a limit and `12` without. Pass it to localise or reword. */
  formatCount?: (length: number, max: number | undefined) => ReactNode;
  /** Text read out when the person is close to the limit (the last tenth) or over it. Aria-only. */
  formatCountAnnouncement?: (length: number, max: number) => string;
  /** Goes on the box that draws the border; the native textarea gets the rest props. */
  className?: string;
  ref?: Ref<HTMLTextAreaElement>;
};

const NEAR_LIMIT = 0.9;

const defaultCount = (length: number, max: number | undefined) =>
  max === undefined ? `${length}` : `${length} / ${max}`;
const defaultAnnouncement = (length: number, max: number) => `${length} of ${max} characters`;

/**
 * A multi-line text control with an optional character count. The count is part of the control's description. It is
 * announced only close to the limit, so it does not read out on every keystroke. Inside a `FormField` the field's ids and
 * states apply.
 */
export function Textarea({
  invalid,
  showCount,
  formatCount = defaultCount,
  formatCountAnnouncement = defaultAnnouncement,
  className,
  readOnly,
  rows = 4,
  ref,
  onChange,
  ...rest
}: TextareaProps) {
  const countId = useId();
  const [inner, setInner] = useState(() => String(rest.value ?? rest.defaultValue ?? "").length);
  const length = rest.value !== undefined ? String(rest.value).length : inner;
  const max = rest.maxLength;
  const counterId = showCount ? `counter-${countId.replace(/:/g, "")}` : undefined;
  const control = useFormFieldControl({
    id: rest.id,
    "aria-describedby": [rest["aria-describedby"], counterId].filter(Boolean).join(" ") || undefined,
    "aria-invalid": invalid ? true : rest["aria-invalid"],
    required: rest.required,
    disabled: rest.disabled,
  });
  const near = max !== undefined && length >= max * NEAR_LIMIT;

  return (
    <div className={styles.root}>
      <span
        className={[fieldStyles.box, styles.box, className].filter(Boolean).join(" ")}
        data-invalid={control["aria-invalid"] ? "" : undefined}
        data-disabled={control.disabled ? "" : undefined}
        data-readonly={readOnly ? "" : undefined}
      >
        <textarea
          {...rest}
          {...control}
          ref={ref}
          rows={rows}
          readOnly={readOnly}
          className={[fieldStyles.native, styles.native].join(" ")}
          onChange={(event) => {
            setInner(event.target.value.length);
            onChange?.(event);
          }}
        />
      </span>
      {showCount ? (
        <>
          <p id={counterId} className={styles.count} data-near={near ? "" : undefined}>
            {formatCount(length, max)}
          </p>
          <VisuallyHidden role="status">
            {near && max !== undefined ? formatCountAnnouncement(length, max) : ""}
          </VisuallyHidden>
        </>
      ) : null}
    </div>
  );
}
