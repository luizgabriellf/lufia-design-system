"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { useFormFieldControl, useFormFieldLabelId } from "../FormField";
import { FieldSpinner } from "../FormField/FieldSpinner";
import fieldStyles from "../FormField/fieldControl.module.css";
import { useControllableState } from "../FormField/useControllableState";
import { useFormReset } from "../FormField/useFormReset";
import { useDismiss } from "../useDismiss";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./Combobox.module.css";
import { normalizeForSearch } from "./normalize";

export type ComboboxOption = {
  /** Stable identifier. It also seeds the option's DOM id, so keep it unique and unchanging. */
  value: string;
  /** What the option is called, in the list and in the box once chosen. */
  label: string;
  /** A second line in the list, such as an address or a code. Not searched. */
  description?: string;
  disabled?: boolean;
};

export type ComboboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "value" | "defaultValue" | "onChange" | "role" | "className" | "list"
> & {
  /** The options to offer. For async data, replace them as results arrive and set `filter={false}`. */
  options: readonly ComboboxOption[];
  /** Chosen option value, or `null` for none. Controlled. */
  value?: string | null;
  /** Initial value when `value` is not given. */
  defaultValue?: string | null;
  onValueChange?: (value: string | null, option: ComboboxOption | null) => void;
  /** Called on every keystroke with the typed text, and with `""` once the box is cleared. Use it to load options. */
  onQueryChange?: (query: string) => void;
  /**
   * How typed text narrows the list. Default: the label contains the text, ignoring case and diacritics. Pass a function
   * to match your own way, or `false` to show `options` as given (the server already filtered them).
   */
  filter?: false | ((option: ComboboxOption, query: string) => boolean);
  /** Options are being loaded. Shows a ring and `loadingLabel`, and sets `aria-busy`. */
  loading?: boolean;
  /** Shown, and announced, while `loading`. */
  loadingLabel: ReactNode;
  /** Shown, and announced, when nothing matches. */
  emptyLabel: ReactNode;
  /** Announced when the list changes ("3 results"). Optional; the empty and loading texts are always announced. */
  resultsLabel?: (count: number) => string;
  /** Label of the chosen option when it is not in `options` (a value set before the options loaded). */
  valueLabel?: string;
  /**
   * Lets the person submit text that is not an option. The value then is the typed text, trimmed (`null` when empty) and
   * `onValueChange` reports it with `null` as the option; it follows every keystroke, so a button that waits on the value
   * does not stay stuck. Enter, Tab, Escape and blur settle the text. Enter with nothing highlighted keeps the text, and the
   * first match is not highlighted on its own. Choosing an option still sets that option's `value`. Text equal to an
   * option's `value` resolves to that option.
   */
  freeText?: boolean;
  /** Shows a clear button while something is chosen. Escape clears too, when the list is closed. */
  clearable?: boolean;
  /** Accessible name of the clear button. Aria-only. */
  clearLabel?: string;
  /** Accessible name of the button that opens the list. Aria-only. */
  toggleLabel?: string;
  /** Submitted with the form as `name=value` (empty when nothing is chosen). The visible text is not submitted. */
  name?: string;
  /**
   * Message the browser shows when a `required` combobox is submitted with nothing chosen. Defaults to the browser's own
   * "please fill out this field" in the person's language.
   */
  requiredMessage?: string;
  /** Marks the control invalid without a `FormField`. */
  invalid?: boolean;
  /** Goes on the root element. */
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

/**
 * Option ids are built from the value so they survive re-renders and re-ordering. Any character outside `A-Za-z0-9-` is
 * written as `_<hex code point>_`; `_` itself is never written raw, so two different values can never share an id.
 */
const idPart = (value: string) =>
  Array.from(value)
    .map((char) => (/[A-Za-z0-9-]/.test(char) ? char : `_${char.codePointAt(0)!.toString(16)}_`))
    .join("");

const defaultFilter = (option: ComboboxOption, query: string) =>
  normalizeForSearch(option.label).includes(normalizeForSearch(query));

/** The room below the box under which the list opens upward instead, when there is more room above. */
const FLIP_BELOW = 260;
/** The list's own `max-block-size` (15rem), in px at the default font size. Rooms above this need no clamp. */
const LIST_MAX = 240;
/** Under this much room, flipping stops helping and the list is only clamped. */
const LIST_MIN = 96;
/** Room kept for the popup's border and the gap to the box. */
const POPUP_CHROME = 12;

type Placement = { side: "bottom" | "top"; maxHeight: number | undefined };

const clips = (style: CSSStyleDeclaration) =>
  /(auto|hidden|scroll|clip)/.test(`${style.overflowY} ${style.overflow}`);

/** The nearest ancestor that clips overflow. The absolutely placed list cannot paint outside it, whatever its height. */
function clippingAncestor(element: HTMLElement | null): HTMLElement | null {
  for (let node = element?.parentElement ?? null; node && node !== document.body; node = node.parentElement) {
    if (clips(getComputedStyle(node))) return node;
  }
  return null;
}

/** Which side the list opens on, and how tall it may be, measured against the clipping ancestor and the viewport. */
function measure(element: HTMLElement): Placement {
  const rect = element.getBoundingClientRect();
  const clipper = clippingAncestor(element)?.getBoundingClientRect();
  const top = Math.max(0, clipper?.top ?? 0);
  const bottom = Math.min(window.innerHeight, clipper?.bottom ?? window.innerHeight);
  const below = bottom - rect.bottom;
  const above = rect.top - top;
  const side = below < FLIP_BELOW && above > below ? "top" : "bottom";
  const room = (side === "top" ? above : below) - POPUP_CHROME;
  return { side, maxHeight: room < LIST_MAX ? Math.max(LIST_MIN, room) : undefined };
}

/**
 * A searchable single select: the WAI-ARIA APG editable combobox with list autocomplete. Typing narrows the list and
 * highlights the first match; the arrow keys move a virtual highlight (`aria-activedescendant`), so DOM focus never leaves
 * the input. Options can arrive asynchronously. Dismissal goes through the shared layer stack (`useDismiss`), so a
 * combobox inside a dialog closes on Escape before the dialog does.
 *
 * Inside a `FormField` the field's id, description, label and states apply.
 */
export function Combobox({
  options,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  onQueryChange,
  filter,
  loading = false,
  loadingLabel,
  emptyLabel,
  resultsLabel,
  valueLabel,
  freeText = false,
  clearable = false,
  clearLabel = "Clear",
  toggleLabel = "Show options",
  name,
  requiredMessage,
  invalid,
  className,
  placeholder,
  readOnly,
  onKeyDown,
  onBlur,
  ref,
  ...rest
}: ComboboxProps) {
  const control = useFormFieldControl({
    id: rest.id,
    "aria-describedby": rest["aria-describedby"],
    "aria-invalid": invalid ? true : rest["aria-invalid"],
    required: rest.required,
    disabled: rest.disabled,
  });
  const labelId = useFormFieldLabelId();
  const generated = useId();
  const baseId = control.id ?? `combobox-${generated.replace(/:/g, "")}`;
  const listId = `${baseId}-listbox`;
  const [value, setValue] = useControllableState<string | null>(valueProp, defaultValue, undefined);
  // The last option chosen is remembered, so its label survives options that are replaced by a later search.
  const [chosen, setChosen] = useState<ComboboxOption | null>(null);
  const selected =
    value === null
      ? null
      : (options.find((option) => option.value === value) ?? (chosen?.value === value ? chosen : null));
  const selectedLabel = selected?.label ?? (value === null ? "" : (valueLabel ?? (freeText ? value : "")));

  const [open, setOpen] = useState(false);
  // While the person edits the text, the box shows what they typed and the list is narrowed by it; otherwise the box shows
  // the chosen option and the list is whole.
  const [typed, setTyped] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Placement>({ side: "bottom", maxHeight: undefined });
  const root = useRef<HTMLSpanElement>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const list = useRef<HTMLUListElement>(null);

  const query = typed ?? "";
  const matches = (option: ComboboxOption) =>
    filter === false || typed === null || query === "" ? true : (filter ?? defaultFilter)(option, query);
  const visible = options.filter(matches);
  const firstEnabled = visible.find((option) => !option.disabled);
  const auto = !freeText && typed !== null && query !== "";
  const active =
    (highlighted !== null
      ? visible.find((option) => option.value === highlighted && !option.disabled)
      : undefined) ?? (auto ? firstEnabled : undefined);
  const optionId = (option: ComboboxOption) => `${baseId}-option-${idPart(option.value)}`;

  // A required combobox is invalid until an option is chosen, whatever text is typed. The constraint sits on the visible
  // input so the browser blocks submission, focuses it and shows its message there.
  useLayoutEffect(() => {
    const element = input.current;
    if (!element) return;
    if (!control.required || value !== null) return element.setCustomValidity("");
    const probe = document.createElement("input");
    probe.required = true;
    element.setCustomValidity(requiredMessage ?? (probe.validationMessage || "Please fill out this field."));
  }, [control.required, value, requiredMessage]);

  const close = () => {
    setOpen(false);
    setTyped(null);
    setHighlighted(null);
  };
  // With free text, whatever stands in the box when the list closes is what is kept.
  const settle = (text: string | null) => {
    if (!freeText || text === null) return;
    const trimmed = text.trim() === "" ? null : text.trim();
    if (trimmed === value) return;
    setValue(trimmed);
    onValueChange?.(trimmed, options.find((option) => option.value === trimmed) ?? null);
  };
  const closeAndSettle = () => {
    settle(typed);
    close();
  };
  useDismiss(open, closeAndSettle, root, input);
  useFormReset(root, () => {
    setValue(defaultValue);
    setChosen(null);
    close();
    onValueChange?.(defaultValue, options.find((option) => option.value === defaultValue) ?? null);
  });

  // Open upward when the room below is short and there is more above, measured against the nearest clipping ancestor as well
  // as the viewport. It follows scrolling and resizing while open (one measure per frame); it never closes the list.
  useLayoutEffect(() => {
    const element = root.current;
    if (!open || !element) return;
    const update = () => {
      const next = measure(element);
      setPlacement((previous) =>
        previous.side === next.side && previous.maxHeight === next.maxHeight ? previous : next,
      );
    };
    update();
    let frame = 0;
    const schedule = () => {
      if (frame === 0) {
        // lufia-motion-allow reduced-motion: the frame only throttles layout reads; nothing animates.
        frame = requestAnimationFrame(() => {
          frame = 0;
          update();
        });
      }
    };
    const scroller: EventTarget = clippingAncestor(element) ?? window;
    scroller.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [open]);

  // Keep the highlighted option in view while arrowing through a long list.
  useLayoutEffect(() => {
    list.current?.querySelector('[data-active="true"]')?.scrollIntoView?.({ block: "nearest" });
  }, [active?.value, open]);

  const choose = (option: ComboboxOption | null) => {
    if (option?.disabled) return;
    setChosen(option);
    setValue(option ? option.value : null);
    onValueChange?.(option ? option.value : null, option);
    if (typed !== null || option === null) onQueryChange?.("");
    close();
  };

  const openList = (highlight: string | null) => {
    if (control.disabled || readOnly) return;
    setOpen(true);
    setHighlighted(highlight);
  };

  const move = (step: 1 | -1) => {
    const enabled = visible.filter((option) => !option.disabled);
    if (enabled.length === 0) return;
    if (!open) return openList((step === 1 ? enabled[0] : enabled[enabled.length - 1])?.value ?? null);
    const at = enabled.findIndex((option) => option.value === active?.value);
    const next =
      enabled[
        (at === -1 ? (step === 1 ? 0 : enabled.length - 1) : at + step + enabled.length) % enabled.length
      ];
    setHighlighted(next?.value ?? null);
  };

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    setTyped(event.target.value);
    setHighlighted(null);
    setOpen(true);
    onQueryChange?.(event.target.value);
    if (freeText) {
      const text = event.target.value;
      const next = text === "" ? null : text;
      setValue(next);
      onValueChange?.(next, options.find((option) => option.value === next) ?? null);
    }
  };

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (!open && selected && !typed) openList(selected.value);
        else move(event.key === "ArrowDown" ? 1 : -1);
        break;
      }
      case "Enter": {
        if (event.nativeEvent.isComposing) break;
        // Choosing must not also submit the surrounding form.
        if (open && active) {
          event.preventDefault();
          choose(active);
        } else if (open && freeText) {
          event.preventDefault();
          closeAndSettle();
        }
        break;
      }
      case "Escape": {
        // An open list is closed by useDismiss; with the list shut, Escape clears a clearable box.
        if (!open && clearable && value !== null && !readOnly) {
          event.preventDefault();
          choose(null);
        }
        break;
      }
      case "Tab": {
        if (open) closeAndSettle();
        break;
      }
    }
  };

  const blur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    if (!root.current?.contains(event.relatedTarget as Node | null)) closeAndSettle();
  };

  const showClear = clearable && value !== null && !control.disabled && !readOnly;
  // Only a list that is on screen counts as expanded: an empty or loading popup holds a message, not options.
  const expanded = open && visible.length > 0;
  const status = loading
    ? loadingLabel
    : visible.length === 0
      ? emptyLabel
      : resultsLabel
        ? resultsLabel(visible.length)
        : "";

  return (
    <span
      ref={root}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-placement={placement.side}
      style={
        placement.maxHeight
          ? ({ "--combobox-list-max": `${placement.maxHeight}px` } as CSSProperties)
          : undefined
      }
    >
      <span
        className={[fieldStyles.box, styles.box].join(" ")}
        data-open={open ? "" : undefined}
        data-invalid={control["aria-invalid"] ? "" : undefined}
        data-disabled={control.disabled ? "" : undefined}
        data-readonly={readOnly ? "" : undefined}
      >
        <input
          autoComplete="off"
          {...rest}
          {...control}
          ref={(node) => {
            input.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          id={baseId}
          type="text"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={expanded ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={expanded && active ? optionId(active) : undefined}
          aria-required={control.required || undefined}
          aria-busy={loading || undefined}
          required={undefined}
          placeholder={placeholder}
          readOnly={readOnly}
          value={typed ?? selectedLabel}
          className={[fieldStyles.native, styles.native].join(" ")}
          onChange={change}
          onKeyDown={keyDown}
          onBlur={blur}
          onFocus={(event) => {
            rest.onFocus?.(event);
            // Typing replaces the chosen text instead of extending it.
            event.currentTarget.select();
          }}
          onClick={(event) => {
            rest.onClick?.(event);
            if (!open) {
              openList(selected?.value ?? null);
              if (typed === null) event.currentTarget.select();
            }
          }}
        />
        {loading ? <FieldSpinner className={styles.spinner} /> : null}
        {showClear ? (
          <button
            type="button"
            className={styles.button}
            aria-label={clearLabel}
            onClick={() => {
              choose(null);
              input.current?.focus();
            }}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
        <button
          type="button"
          tabIndex={-1}
          className={styles.button}
          aria-label={toggleLabel}
          aria-expanded={expanded}
          aria-controls={expanded ? listId : undefined}
          disabled={control.disabled || readOnly}
          onClick={() => {
            if (open) close();
            else openList(selected?.value ?? null);
            input.current?.focus();
          }}
        >
          <svg
            className={styles.chevron}
            viewBox="0 0 16 16"
            width="16"
            height="16"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M3.5 6l4.5 4.5L12.5 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </span>
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      <VisuallyHidden role="status">{open ? status : ""}</VisuallyHidden>
      {open ? (
        // Keep the text field focused: a press on the popup must not blur it.
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div className={styles.popup} onMouseDown={(event) => event.preventDefault()}>
          {visible.length > 0 ? (
            <ul
              ref={list}
              id={listId}
              role="listbox"
              aria-label={labelId ? undefined : rest["aria-label"]}
              aria-labelledby={labelId ?? rest["aria-labelledby"]}
              className={styles.list}
            >
              {visible.map((option) => {
                const isActive = option.value === active?.value;
                return (
                  // The input owns the keyboard (aria-activedescendant), so options are not focusable or key-handled.
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <li
                    key={option.value}
                    id={optionId(option)}
                    role="option"
                    aria-selected={option.value === value}
                    aria-disabled={option.disabled || undefined}
                    data-active={isActive}
                    className={styles.option}
                    onClick={() => choose(option)}
                    onPointerMove={() => {
                      if (!option.disabled && !isActive) setHighlighted(option.value);
                    }}
                  >
                    <span className={styles.optionText}>
                      <span className={styles.optionLabel}>{option.label}</span>
                      {option.description ? (
                        <span className={styles.optionDescription}>{option.description}</span>
                      ) : null}
                    </span>
                    {option.value === value ? (
                      <svg
                        className={styles.check}
                        viewBox="0 0 16 16"
                        width="16"
                        height="16"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path
                          d="M3 8.5l3.2 3.2L13 4.8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
          {loading || visible.length === 0 ? (
            <p className={styles.message} aria-hidden="true">
              {loading ? <FieldSpinner /> : null}
              <span>{loading ? loadingLabel : emptyLabel}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </span>
  );
}
