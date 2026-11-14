"use client";

import { useId, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { useLufia } from "../LufiaProvider";
import { VisuallyHidden } from "../VisuallyHidden";
import { FieldError, FieldHint } from "./FieldMessages";
import {
  FormFieldClaimContext,
  FormFieldContext,
  type FormFieldClaim,
  type FormFieldControlProps,
} from "./FormFieldContext";
import styles from "./FormField.module.css";

export type FormFieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The visible label. Every control needs one. */
  label: ReactNode;
  /** Help shown under the control, linked to it with `aria-describedby`. */
  hint?: ReactNode;
  /** Error text. Its presence marks the control `aria-invalid` and shows the message with an icon. */
  error?: ReactNode;
  /**
   * Marks the control required and shows an asterisk plus text for assistive technology. A read-only control inside the
   * field is not required from the person's point of view: the mark, the text and `aria-required` are dropped.
   */
  required?: boolean;
  /**
   * Whether `required` also puts the native `required` attribute on the control. Defaults to `true`. Set `false` when the
   * form validates on its own and shows its own messages: the control then gets `aria-required="true"` and no `required`,
   * so the browser shows no native bubble and the form needs no `noValidate`. The label still shows the mark and text.
   */
  nativeRequired?: boolean;
  disabled?: boolean;
  /**
   * Text read after the label when `required`. Aria-only: the visible mark is a glyph. Defaults to the `required` label of
   * `LufiaProvider` ("required"), so an app sets the word once; this prop wins when given.
   */
  requiredLabel?: string;
  /** Base id of the control; the hint and error ids derive from it. Generated when omitted. */
  id?: string;
  /**
   * The control. A node reaches the controls of this package through context; a function receives the props to spread on
   * any other control (a third-party input, a native element).
   */
  children: ReactNode | ((control: FormFieldControlProps) => ReactNode);
};

/**
 * Wires a label, a hint and an error to one control: the label targets it, the hint and error describe it, an error sets
 * `aria-invalid`, and a required field says so in text and not only with a mark. Controls of the package pick the ids up
 * from context; anything else takes them from the render prop.
 *
 * A field names one control. The first control of this package inside it takes the field's `id` and the label points at it;
 * a control with its own `id` keeps it, and the label follows. A second control in the same field never gets the same id:
 * it keeps its own `id` or a generated one, is not named by the label, and needs its own `aria-label` or `aria-labelledby`.
 *
 * The parts carry stable `data-lufia-part` hooks (`field`, `label`, `hint`, `error`, `control`) for app-level styling and
 * tests. `control` is a layout-neutral wrapper (`display: contents`) around the children.
 */
export function FormField({
  label,
  hint,
  error,
  required,
  nativeRequired = true,
  disabled,
  requiredLabel: requiredLabelProp,
  id,
  className,
  children,
  ...rest
}: FormFieldProps) {
  const generated = useId();
  const { labels } = useLufia();
  const requiredLabel = requiredLabelProp ?? labels.required;
  const baseId = id ?? `field-${generated.replace(/:/g, "")}`;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const owner = useRef<string | null>(null);
  const [labelTarget, setLabelTarget] = useState<string | undefined>(undefined);
  const [readOnly, setReadOnly] = useState(false);
  const claim = useMemo<FormFieldClaim>(
    () => ({
      take: (key) => {
        owner.current ??= key;
        return owner.current === key;
      },
      release: (key) => {
        if (owner.current === key) owner.current = null;
      },
      setLabelTarget,
      setReadOnly,
    }),
    [],
  );
  const control: FormFieldControlProps = {
    id: baseId,
    "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
    "aria-invalid": error ? true : undefined,
    required: (required && nativeRequired) || undefined,
    "aria-required": required && !nativeRequired ? true : undefined,
    disabled: disabled || undefined,
  };

  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-invalid={error ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-lufia-part="field"
    >
      <label
        id={`${baseId}-label`}
        htmlFor={labelTarget ?? baseId}
        className={styles.label}
        data-lufia-part="label"
      >
        <span className={styles.text}>
          {label}
          {required && !readOnly ? (
            <>
              <span className={styles.mark} aria-hidden="true">
                *
              </span>
              <VisuallyHidden> ({requiredLabel})</VisuallyHidden>
            </>
          ) : null}
        </span>
      </label>
      <div className={styles.control} data-lufia-part="control">
        <FormFieldContext.Provider value={control}>
          <FormFieldClaimContext.Provider value={claim}>
            {typeof children === "function" ? children(control) : children}
          </FormFieldClaimContext.Provider>
        </FormFieldContext.Provider>
      </div>
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
