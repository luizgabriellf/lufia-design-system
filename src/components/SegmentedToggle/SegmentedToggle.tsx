"use client";

import { useRef, useState, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { useControllableState } from "../FormField/useControllableState";
import { useFormChangeEvents } from "../FormField/useFormChangeEvents";
import { useFormReset } from "../FormField/useFormReset";
import { useRadioKeys } from "../RadioGroup/useRadioKeys";
import { useSlidingIndicator } from "../useSlidingIndicator";
import styles from "./SegmentedToggle.module.css";

export type SegmentedToggleOption = {
  value: string;
  label: ReactNode;
  /** Decorative icon before the label; hidden from assistive technology. */
  icon?: ReactNode;
  disabled?: boolean;
  /**
   * Colours the segment while it is chosen with the matching status tokens (fill, border and text). The chosen segment also
   * keeps its non-colour cue (the selected border and the indicator), so the tone is never the only signal. Default: the accent.
   */
  tone?: SegmentedToggleTone;
};

export type SegmentedToggleTone = "neutral" | "success" | "warning" | "danger";

export type SegmentedToggleProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "children"
> & {
  /** Accessible name of the group ("Display mode"). Required: the visible segments do not say what they choose. */
  label: string;
  options: readonly SegmentedToggleOption[];
  /**
   * Controlled value. `null` is controlled with nothing chosen: no segment is checked and the indicator is hidden. The first
   * enabled segment is still the tab stop, and an arrow key chooses (selection follows focus) as it does with a value.
   */
  value?: string | null;
  /**
   * Initial value when `value` is not given; `null` starts with nothing chosen. Defaults to the first enabled option. A form
   * reset goes back to it (to `null` when a controlled `value` started as `null`).
   */
  defaultValue?: string | null;
  /** Called with the value the user chose. Never `null`: a deselect is reported by `onDeselect`. */
  onValueChange?: (value: string) => void;
  /**
   * When true, activating the chosen segment again clears the choice and calls `onDeselect`. With a controlled `value`,
   * set it to `null` there; an uncontrolled toggle clears itself.
   */
  allowDeselect?: boolean;
  /** Called when `allowDeselect` is on and the user clears the choice, or when a form reset returns to nothing chosen. */
  onDeselect?: () => void;
  disabled?: boolean;
  /** Submitted with the form as `name=value`. */
  name?: string;
  /** `"fit"` (default) shrinks to its content; `"fill"` shares the full width between the segments. */
  width?: "fit" | "fill";
  /** `"md"` (default) or the denser `"sm"` for rows in a list or a table. */
  size?: "sm" | "md";
  ref?: Ref<HTMLDivElement>;
};

/**
 * Two to four compact choices where one is chosen (always, unless `value` is `null`), such as a view or a mode, as a WAI-ARIA radio group with
 * roving arrow keys. An indicator slides behind the chosen segment. It is a choice that applies to what is shown, not a
 * navigation (use `PeerNav`) and not on/off (use `Switch`). With `value={null}` nothing is chosen yet (a status picker on a
 * fresh row), `allowDeselect` lets the user clear the choice, `tone` colours a chosen option and `size="sm"` fits dense rows.
 *
 * When the user chooses a segment (a click or an arrow key), a bubbling `input` and then `change` Event is dispatched from
 * the hidden input (from the group when there is no `name`), so a native `addEventListener("change")` on the form, or a React `onInput`, sees it as it would a native radio. A React `onChange` on the form does not: React ignores hidden inputs there.
 * A `value` set by the parent, a form reset and choosing the segment already chosen dispatch nothing.
 */
export function SegmentedToggle({
  label,
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  onDeselect,
  allowDeselect,
  disabled,
  name,
  width = "fit",
  size = "md",
  className,
  ref,
  ...rest
}: SegmentedToggleProps) {
  const container = useRef<HTMLDivElement | null>(null);
  // A controlled `value` that starts as `null` resets to nothing chosen, as `defaultValue={null}` does.
  const [startedUnset] = useState(valueProp === null);
  const fallback =
    defaultValue !== undefined
      ? defaultValue
      : startedUnset
        ? null
        : (options.find((option) => !option.disabled)?.value ?? "");
  const [value, setValue] = useControllableState<string | null>(valueProp, fallback, (next) =>
    next === null ? onDeselect?.() : onValueChange?.(next),
  );
  useFormReset(container, () => setValue(fallback));
  const items = options.map((option) => ({ value: option.value, disabled: disabled || option.disabled }));
  const field = useRef<HTMLInputElement>(null);
  const announce = useFormChangeEvents(value, () => field.current ?? container.current);
  const choose = (next: string | null) => {
    announce(next);
    setValue(next);
  };
  const keys = useRadioKeys(items, value ?? undefined, choose);
  const chosen = options.find((option) => option.value === value);
  const indicator = useSlidingIndicator(container, '[aria-checked="true"]', value, { stretch: true });

  return (
    // The group is not focusable by design (APG): the chosen radio is, and key events bubble up from it.
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      {...rest}
      ref={(node) => {
        container.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-width={width}
      data-size={size}
      data-unset={value === null ? "" : undefined}
      onKeyDown={(event) => {
        rest.onKeyDown?.(event);
        if (!event.defaultPrevented) keys.onKeyDown(event);
      }}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          data-radio-index={index}
          disabled={items[index]?.disabled}
          tabIndex={option.value === keys.tabbable ? 0 : -1}
          className={styles.segment}
          data-tone={option.tone}
          onClick={() => choose(allowDeselect && option.value === value ? null : option.value)}
        >
          {option.icon ? (
            <span className={styles.icon} aria-hidden="true">
              {option.icon}
            </span>
          ) : null}
          <span className={styles.label}>{option.label}</span>
        </button>
      ))}
      <span ref={indicator} className={styles.indicator} data-tone={chosen?.tone} hidden aria-hidden="true" />
      {/* Disabled while nothing is chosen: a disabled input is not submitted, so the form gets no entry. */}
      {name ? (
        <input ref={field} type="hidden" name={name} value={value ?? ""} disabled={value === null} />
      ) : null}
    </div>
  );
}
