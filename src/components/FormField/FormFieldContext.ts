"use client";

import { createContext } from "react";

/** What a control needs from the field around it. */
export type FormFieldControlProps = {
  /** The id the label points at. Put it on the focusable control. */
  id: string;
  /** Hint and error ids, in reading order. Absent when the field has neither. */
  "aria-describedby"?: string;
  /** `true` while the field has an error, absent otherwise. */
  "aria-invalid"?: true;
  /** Native `required`, for controls that have one. Other widgets map it to `aria-required`. */
  required?: boolean;
  /** `true` for a required field that opted out of native `required` (`nativeRequired={false}`); absent otherwise. */
  "aria-required"?: true;
  disabled?: boolean;
};

export const FormFieldContext = createContext<FormFieldControlProps | null>(null);
