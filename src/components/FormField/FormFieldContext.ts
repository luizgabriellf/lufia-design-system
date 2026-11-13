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

/**
 * Internal: lets the controls inside one field agree on which of them the label belongs to. The first control to claim the
 * field takes it  and reports the id it ended up with, so the label's `htmlFor` follows it.
 */
export type FormFieldClaim = {
  /** Claims the field for `key` unless another control has it; true when `key` owns it. Idempotent for the owner. */
  take: (key: string) => boolean;
  /** Gives the field up, when `key` owns it. */
  release: (key: string) => void;
  setLabelTarget: (id: string | undefined) => void;
};

export const FormFieldClaimContext = createContext<FormFieldClaim | null>(null);
