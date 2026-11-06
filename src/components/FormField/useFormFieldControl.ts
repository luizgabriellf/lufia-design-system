"use client";

import { useContext } from "react";
import { FormFieldContext, type FormFieldControlProps } from "./FormFieldContext";

type OwnProps = Partial<Omit<FormFieldControlProps, "aria-invalid">> & {
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
};

/**
 * Merges the props a control got from its own caller with the ones of the surrounding `FormField`. Outside a field it
 * returns the caller's props untouched, so every control works on its own.
 *
 * Inside a field the field's `id` wins (the label points at it), `aria-describedby` is the union of both lists, and a
 * control is invalid, required or disabled when either side says so. Use this when building a control that should join a
 * field; the controls of this package already do.
 */
export function useFormFieldControl(own: OwnProps = {}) {
  const field = useContext(FormFieldContext);
  const describedBy =
    [field?.["aria-describedby"], own["aria-describedby"]].filter(Boolean).join(" ") || undefined;
  const ownInvalid =
    own["aria-invalid"] !== undefined && own["aria-invalid"] !== false && own["aria-invalid"] !== "false";
  return {
    id: field?.id ?? own.id,
    "aria-describedby": describedBy,
    "aria-invalid": field?.["aria-invalid"] || ownInvalid ? (true as const) : undefined,
    required: field?.required || own.required || undefined,
    disabled: field?.disabled || own.disabled || undefined,
  };
}
