"use client";

import { useContext } from "react";
import { FormFieldContext, type FormFieldControlProps } from "./FormFieldContext";

type OwnProps = Partial<Omit<FormFieldControlProps, "aria-invalid">> & {
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
};

/** Joins id lists, keeping the first occurrence of each id in reading order and dropping empty tokens. */
function uniqueTokens(...lists: (string | undefined)[]): string | undefined {
  const ids = lists.flatMap((list) => list?.split(/\s+/) ?? []).filter(Boolean);
  return [...new Set(ids)].join(" ") || undefined;
}

/**
 * Merges the props a control got from its own caller with the ones of the surrounding `FormField`. Outside a field it
 * returns the caller's props untouched, so every control works on its own.
 *
 * Inside a field the field's `id` wins (the label points at it), `aria-describedby` is the union of both lists without repeated ids, and a
 * control is invalid, required or disabled when either side says so. A field with `nativeRequired={false}` yields
 * `aria-required` and no `required`. Use this when building a control that should join a
 * field; the controls of this package already do.
 */
export function useFormFieldControl(own: OwnProps = {}) {
  const field = useContext(FormFieldContext);
  const describedBy = uniqueTokens(field?.["aria-describedby"], own["aria-describedby"]);
  const ownInvalid =
    own["aria-invalid"] !== undefined && own["aria-invalid"] !== false && own["aria-invalid"] !== "false";
  return {
    id: field?.id ?? own.id,
    "aria-describedby": describedBy,
    "aria-invalid": field?.["aria-invalid"] || ownInvalid ? (true as const) : undefined,
    required: field?.required || own.required || undefined,
    "aria-required": field?.["aria-required"] && !own.required ? (true as const) : undefined,
    disabled: field?.disabled || own.disabled || undefined,
  };
}

/**
 * The id of the surrounding `FormField`'s label element, for widgets that need to name a second element (a listbox, a
 * popup) after the field. `undefined` outside a field.
 */
export function useFormFieldLabelId(): string | undefined {
  const field = useContext(FormFieldContext);
  return field ? `${field.id}-label` : undefined;
}
