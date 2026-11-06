"use client";

import { useRef, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { useControllableState } from "../FormField/useControllableState";
import { useRadioKeys } from "../RadioGroup/useRadioKeys";
import { useSlidingIndicator } from "../useSlidingIndicator";
import styles from "./SegmentedToggle.module.css";

export type SegmentedToggleOption = {
  value: string;
  label: ReactNode;
  /** Decorative icon before the label; hidden from assistive technology. */
  icon?: ReactNode;
  disabled?: boolean;
};

export type SegmentedToggleProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "children"
> & {
  /** Accessible name of the group ("Display mode"). Required: the visible segments do not say what they choose. */
  label: string;
  options: readonly SegmentedToggleOption[];
  /** Controlled value. */
  value?: string;
  /** Initial value when `value` is not given. Defaults to the first enabled option. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  /** Submitted with the form as `name=value`. */
  name?: string;
  /** `"fit"` (default) shrinks to its content; `"fill"` shares the full width between the segments. */
  width?: "fit" | "fill";
  ref?: Ref<HTMLDivElement>;
};

/**
 * Two to four compact choices where exactly one is always chosen, such as a view or a mode, as a WAI-ARIA radio group with
 * roving arrow keys. An indicator slides behind the chosen segment. It is a choice that applies to what is shown, not a
 * navigation (use `PeerNav`) and not on/off (use `Switch`).
 */
export function SegmentedToggle({
  label,
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled,
  name,
  width = "fit",
  className,
  ref,
  ...rest
}: SegmentedToggleProps) {
  const container = useRef<HTMLDivElement | null>(null);
  const fallback = defaultValue ?? options.find((option) => !option.disabled)?.value ?? "";
  const [value, setValue] = useControllableState(valueProp, fallback, onValueChange);
  const items = options.map((option) => ({ value: option.value, disabled: disabled || option.disabled }));
  const keys = useRadioKeys(items, value, setValue);
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
          onClick={() => setValue(option.value)}
        >
          {option.icon ? (
            <span className={styles.icon} aria-hidden="true">
              {option.icon}
            </span>
          ) : null}
          <span className={styles.label}>{option.label}</span>
        </button>
      ))}
      <span ref={indicator} className={styles.indicator} hidden aria-hidden="true" />
      {name ? <input type="hidden" name={name} value={value} /> : null}
    </div>
  );
}
