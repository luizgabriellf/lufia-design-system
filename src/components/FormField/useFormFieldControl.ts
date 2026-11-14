"use client";

import { useContext, useEffect, useId } from "react";
import { FormFieldClaimContext, FormFieldContext, type FormFieldControlProps } from "./FormFieldContext";

type OwnProps = Partial<Omit<FormFieldControlProps, "aria-invalid">> & {
  /** A read-only control cannot be required: it gets neither `required` nor `aria-required`, and its field drops the mark. */
  readOnly?: boolean;
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
 * Inside a field, the first control to render takes the field's `id` unless it has its own `id`, which wins; the label
 * follows that control. A second control in the same field keeps its own `id` or gets a generated one, never the field's, so
 * ids stay unique and the label names only one control. `aria-describedby` is the union of both lists without repeated ids, and a
 * control is invalid, required or disabled when either side says so. A field with `nativeRequired={false}` yields
 * `aria-required` and no `required`. A read-only control (`readOnly`) is never required from the person's point of view,
 * so it gets neither, and the field hides its required mark. Use this when building a control that should join a
 * field; the controls of this package already do.
 */
export function useFormFieldControl(own: OwnProps = {}) {
  const field = useContext(FormFieldContext);
  const claim = useContext(FormFieldClaimContext);
  const key = useId();
  const fallbackId = useId();
  // The first control to ask owns the field. The key is stable per control, so a re-render or a StrictMode double render
  // gets the same answer; the effect below also covers a claim released by a control that unmounted.
  const primary = !field || !claim || claim.take(key);
  const id = primary ? (own.id ?? field?.id) : (own.id ?? fallbackId);
  useEffect(() => {
    if (!claim || !claim.take(key)) return;
    claim.setLabelTarget(id);
    return () => {
      claim.release(key);
      claim.setLabelTarget(undefined);
    };
  }, [claim, key, id]);
  const readOnly = own.readOnly === true;
  useEffect(() => {
    if (!claim || !readOnly || !claim.take(key)) return;
    claim.setReadOnly?.(true);
    return () => claim.setReadOnly?.(false);
  }, [claim, key, readOnly]);
  const describedBy = uniqueTokens(field?.["aria-describedby"], own["aria-describedby"]);
  const ownInvalid =
    own["aria-invalid"] !== undefined && own["aria-invalid"] !== false && own["aria-invalid"] !== "false";
  return {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": field?.["aria-invalid"] || ownInvalid ? (true as const) : undefined,
    required: readOnly ? undefined : field?.required || own.required || undefined,
    "aria-required": !readOnly && field?.["aria-required"] && !own.required ? (true as const) : undefined,
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
