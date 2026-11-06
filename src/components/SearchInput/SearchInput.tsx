"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type Ref,
} from "react";
import { useFormFieldControl, useFormFieldLabelId } from "../FormField";
import { FieldSpinner } from "../FormField/FieldSpinner";
import fieldStyles from "../FormField/fieldControl.module.css";
import { useControllableState } from "../FormField/useControllableState";
import { useFormReset } from "../FormField/useFormReset";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./SearchInput.module.css";

export type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "value" | "defaultValue" | "onChange" | "className"
> & {
  /** Controlled text. */
  value?: string;
  defaultValue?: string;
  /** Called on every keystroke with the current text. */
  onValueChange?: (value: string) => void;
  /**
   * Called with the text once the person stops typing for `debounceMs`, at once on Enter, and at once when the text is
   * cleared. It does not fire for the initial value, or twice for the same text in a row.
   */
  onSearch?: (value: string) => void;
  /** Quiet time before `onSearch` fires while typing, in milliseconds. Default 300. */
  debounceMs?: number;
  /** Accessible name of the clear button. Aria-only. */
  clearLabel?: string;
  /** A hint for the key that focuses the field, such as "/" or "Ctrl K". Display only: the app binds the key. */
  shortcut?: string;
  /** A search is running. Shows a ring, sets `aria-busy` and announces `loadingLabel`. */
  loading?: boolean;
  /** Text announced while `loading`. Aria-only. */
  loadingLabel?: string;
  /** Marks the control invalid without a `FormField`. */
  invalid?: boolean;
  /** Goes on the box that draws the border; the native input gets the rest props. */
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

/**
 * A search box with a magnifier, a clear button, an optional shortcut hint and a debounced `onSearch`. Escape clears the
 * text first. Inside a `FormField` the field's id, description and states apply; on its own it is named by `aria-label`, or
 * by its placeholder.
 */
export function SearchInput({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSearch,
  debounceMs = 300,
  clearLabel = "Clear search",
  shortcut,
  loading = false,
  loadingLabel = "Searching",
  invalid,
  className,
  placeholder,
  readOnly,
  onKeyDown,
  ref,
  ...rest
}: SearchInputProps) {
  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
  const control = useFormFieldControl({
    id: rest.id,
    "aria-describedby": rest["aria-describedby"],
    "aria-invalid": invalid ? true : rest["aria-invalid"],
    required: rest.required,
    disabled: rest.disabled,
  });
  const labelId = useFormFieldLabelId();
  const input = useRef<HTMLInputElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const searchRef = useRef(onSearch);
  const lastSearched = useRef(value);
  useEffect(() => {
    searchRef.current = onSearch;
  });
  useEffect(() => () => clearTimeout(timer.current), []);
  useFormReset(input, () => {
    clearTimeout(timer.current);
    lastSearched.current = defaultValue;
    setValue(defaultValue);
  });

  const search = useCallback((text: string) => {
    clearTimeout(timer.current);
    if (text === lastSearched.current) return;
    lastSearched.current = text;
    searchRef.current?.(text);
  }, []);

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(next), debounceMs);
  };

  const clear = () => {
    setValue("");
    search("");
    input.current?.focus();
  };

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter") search(value);
    // Escape clears first; with nothing to clear it falls through to whatever dismisses the surrounding layer.
    if (event.key === "Escape" && value && !readOnly) {
      event.preventDefault();
      clear();
    }
  };

  // Only a field label or an explicit name counts: an `id` names nothing.
  const hasName = rest["aria-label"] || rest["aria-labelledby"] || labelId;
  const showClear = value !== "" && !control.disabled && !readOnly;

  return (
    <span
      className={[fieldStyles.box, styles.box, className].filter(Boolean).join(" ")}
      data-invalid={control["aria-invalid"] ? "" : undefined}
      data-disabled={control.disabled ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
    >
      <span className={[fieldStyles.affix, styles.icon].join(" ")} aria-hidden="true">
        <svg viewBox="0 0 20 20" width="18" height="18" fill="none" focusable="false">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
          <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <input
        autoComplete="off"
        {...rest}
        {...control}
        ref={(node) => {
          input.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="search"
        enterKeyHint="search"
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        aria-label={hasName ? rest["aria-label"] : placeholder}
        aria-busy={loading || undefined}
        className={[fieldStyles.native, styles.native].join(" ")}
        onChange={change}
        onKeyDown={keyDown}
      />
      {loading ? (
        <span className={[fieldStyles.affix, styles.state].join(" ")}>
          <FieldSpinner />
          <VisuallyHidden role="status">{loadingLabel}</VisuallyHidden>
        </span>
      ) : null}
      {showClear ? (
        <button type="button" className={styles.clear} aria-label={clearLabel} onClick={clear}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
      {shortcut && !showClear && !loading ? (
        <span className={[fieldStyles.affix, styles.state].join(" ")} aria-hidden="true">
          <kbd className={styles.kbd}>{shortcut}</kbd>
        </span>
      ) : null}
    </span>
  );
}
